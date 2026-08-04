interface EventContext {
  request: Request;
  env: Record<string, string>;
}

const GEMINI_FALLBACK_MODELS = [
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-1.5-flash-latest",
  "gemini-1.5-flash",
  "gemini-1.5-pro",
];

export async function onRequestPost(context: EventContext): Promise<Response> {
  try {
    const { request, env } = context;
    const body: any = await request.json();
    const {
      pdfBase64,
      history = [],
      message,
      provider = "gemini",
      model: targetModel = "gemini-2.5-flash",
      customApiKey,
      customBaseUrl,
    } = body;

    if (!message) {
      return new Response(JSON.stringify({ error: "Message content is required." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const systemPrompt = `You are an expert AI document analyst. The user has uploaded a PDF document. 
Your job is to answer questions, summarize content, explain complex terms, and extract specific information strictly based on the provided PDF document. 
Be concise, clear, accurate, and format responses using clean Markdown (bolding, bullet points, code blocks, tables where appropriate). 
If the user asks something outside the scope of the document, politely inform them while offering whatever relevant context is in the PDF.`;

    // ---------------------------------------------------------
    // 1. GOOGLE GEMINI PROVIDER (via Google REST API on Cloudflare Edge)
    // ---------------------------------------------------------
    if (provider === "gemini") {
      const apiKey = customApiKey || env.GEMINI_API_KEY;

      // Helper: stream via OpenRouter free model (no API key required)
      const streamViaOpenRouter = async (pdfTextContent?: string): Promise<Response> => {
        const orModel = "google/gemini-2.0-flash-lite-preview:free";
        const orUrl = "https://openrouter.ai/api/v1/chat/completions";

        let enhancedSystemPrompt = systemPrompt;
        if (pdfTextContent && pdfTextContent.length > 0) {
          enhancedSystemPrompt += `\n\n--- EXTRACTED PDF DOCUMENT CONTENT ---\n${pdfTextContent.slice(0, 40000)}\n--- END DOCUMENT ---`;
        }

        const msgs: Array<{ role: string; content: string }> = [
          { role: "system", content: enhancedSystemPrompt },
        ];
        for (const item of history) {
          msgs.push({ role: item.role === "user" ? "user" : "assistant", content: item.content });
        }
        msgs.push({ role: "user", content: message });

        const orRes = await fetch(orUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "HTTP-Referer": "https://chat-with-your-pdf.pages.dev",
            "X-Title": "Chat With Your PDF",
          },
          body: JSON.stringify({ model: orModel, messages: msgs, stream: true }),
        });

        if (!orRes.ok || !orRes.body) {
          const errText = await orRes.text().catch(() => "Unknown error");
          return new Response(
            JSON.stringify({ error: `Error (${orRes.status}): ${errText}` }),
            { status: orRes.status, headers: { "Content-Type": "application/json" } }
          );
        }

        const enc = new TextEncoder();
        const dec = new TextDecoder();
        const rdr = orRes.body.getReader();
        const stream = new ReadableStream({
          async start(ctrl) {
            let buf = "";
            try {
              while (true) {
                const { done, value } = await rdr.read();
                if (done) break;
                buf += dec.decode(value, { stream: true });
                const lines = buf.split("\n");
                buf = lines.pop() || "";
                for (const line of lines) {
                  const t = line.trim();
                  if (t === "data: [DONE]") continue;
                  if (t.startsWith("data: ")) {
                    try {
                      const json = JSON.parse(t.slice(6));
                      const chunk = json.choices?.[0]?.delta?.content;
                      if (chunk) ctrl.enqueue(enc.encode(chunk));
                    } catch {}
                  }
                }
              }
              ctrl.close();
            } catch (err) { ctrl.error(err); }
          },
        });
        return new Response(stream, {
          headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-cache" },
        });
      };

      // If no valid Gemini key, go straight to free OpenRouter fallback
      if (!apiKey) {
        return streamViaOpenRouter(body.pdfText);
      }

      const modelCandidates = Array.from(new Set([targetModel, ...GEMINI_FALLBACK_MODELS]));
      let lastErrorText = "";

      for (const modelName of modelCandidates) {
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:streamGenerateContent?alt=sse&key=${apiKey}`;

        const contents: any[] = [];
        if (pdfBase64 && history.length === 0) {
          contents.push({
            role: "user",
            parts: [
              { inline_data: { mime_type: "application/pdf", data: pdfBase64 } },
              { text: "Here is the PDF document for our discussion. Please analyze it and prepare to answer my questions." },
            ],
          });
          contents.push({ role: "model", parts: [{ text: "I have read and indexed the PDF document. What questions do you have about it?" }] });
        } else {
          for (const item of history) {
            contents.push({ role: item.role === "user" ? "user" : "model", parts: [{ text: item.content }] });
          }
        }
        contents.push({ role: "user", parts: [{ text: message }] });

        const geminiRes = await fetch(geminiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ system_instruction: { parts: [{ text: systemPrompt }] }, contents }),
        });

        if (geminiRes.ok && geminiRes.body) {
          const reader = geminiRes.body.getReader();
          const decoder = new TextDecoder();
          const encoder = new TextEncoder();
          const stream = new ReadableStream({
            async start(controller) {
              let buffer = "";
              try {
                while (true) {
                  const { done, value } = await reader.read();
                  if (done) break;
                  buffer += decoder.decode(value, { stream: true });
                  const lines = buffer.split("\n");
                  buffer = lines.pop() || "";
                  for (const line of lines) {
                    const trimmed = line.trim();
                    if (trimmed.startsWith("data: ")) {
                      try {
                        const json = JSON.parse(trimmed.slice(6));
                        const textChunk = json.candidates?.[0]?.content?.parts?.[0]?.text;
                        if (textChunk) controller.enqueue(encoder.encode(textChunk));
                      } catch {}
                    }
                  }
                }
                controller.close();
              } catch (err) { controller.error(err); }
            },
          });
          return new Response(stream, {
            headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-cache" },
          });
        } else {
          lastErrorText = await geminiRes.text();
          if (geminiRes.status === 404) { continue; }
          break;
        }
      }

      // On 429/quota exhaustion, silently fall through to free OpenRouter model
      const isExhausted =
        lastErrorText.includes("429") ||
        lastErrorText.includes("RESOURCE_EXHAUSTED") ||
        lastErrorText.includes("prepayment") ||
        lastErrorText.includes("quota");

      if (isExhausted) {
        return streamViaOpenRouter(body.pdfText);
      }

      return new Response(
        JSON.stringify({ error: `Gemini API Error: ${lastErrorText || "Model not available"}` }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    let effectiveModel = targetModel;
    if (provider === "kimi" && (targetModel === "kimi-k1.5" || !targetModel.startsWith("moonshot-v1-"))) {
      effectiveModel = "moonshot-v1-8k";
    }

    let apiKey = customApiKey;
    let endpointUrl = customBaseUrl;

    if (provider === "kimi") {
      apiKey = apiKey || env.KIMI_API_KEY || env.MOONSHOT_API_KEY;
      endpointUrl = endpointUrl || "https://api.moonshot.cn/v1/chat/completions";
    } else if (provider === "qwen") {
      apiKey = apiKey || env.QWEN_API_KEY || env.DASHSCOPE_API_KEY;
      endpointUrl = endpointUrl || "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions";
    } else {
      apiKey = apiKey || env.OPENAI_API_KEY || env.OPENROUTER_API_KEY;
      if (!endpointUrl) {
        endpointUrl = targetModel.includes("/") || targetModel.includes(":free")
          ? "https://openrouter.ai/api/v1/chat/completions"
          : "https://api.openai.com/v1/chat/completions";
      }
    }

    if (!apiKey) {
      return new Response(
        JSON.stringify({
          error: `API Key for ${provider.toUpperCase()} is missing. Click the model indicator in the Navbar to open Settings and paste your ${provider.toUpperCase()} API key.`,
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    let enhancedSystemPrompt = systemPrompt;
    const pdfText = body.pdfText;
    if (pdfText && pdfText.length > 0) {
      enhancedSystemPrompt += `\n\n--- EXTRACTED PDF DOCUMENT CONTENT ---\n${pdfText.slice(0, 40000)}\n--- END DOCUMENT ---`;
    }

    const messagesPayload: Array<{ role: string; content: string }> = [
      { role: "system", content: enhancedSystemPrompt },
    ];

    for (const item of history) {
      messagesPayload.push({
        role: item.role === "user" ? "user" : "assistant",
        content: item.content,
      });
    }

    messagesPayload.push({ role: "user", content: message });

    const openAiResponse = await fetch(endpointUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: effectiveModel,
        messages: messagesPayload,
        stream: true,
      }),
    });

    if (!openAiResponse.ok) {
      const errText = await openAiResponse.text();
      let formattedMsg = errText;
      try {
        const errJson = JSON.parse(errText);
        formattedMsg = errJson.error?.message || errJson.message || errText;
      } catch {}

      return new Response(
        JSON.stringify({ error: `${provider.toUpperCase()} API Error (${openAiResponse.status}): ${formattedMsg}` }),
        { status: openAiResponse.status, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!openAiResponse.body) {
      return new Response(JSON.stringify({ error: "No response body received." }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const reader = openAiResponse.body.getReader();
    const decoder = new TextDecoder();
    const encoder = new TextEncoder();

    const readable = new ReadableStream({
      async start(controller) {
        let buffer = "";
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed || trimmed.startsWith(":")) continue;
              if (trimmed === "data: [DONE]") {
                controller.close();
                return;
              }
              if (trimmed.startsWith("data: ")) {
                try {
                  const json = JSON.parse(trimmed.slice(6));
                  const delta = json.choices?.[0]?.delta?.content;
                  if (delta) controller.enqueue(encoder.encode(delta));
                } catch {}
              }
            }
          }
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error?.message || "Internal error." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
