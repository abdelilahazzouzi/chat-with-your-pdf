import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GEMINI_FALLBACK_MODELS, DEFAULT_MODEL_NAME, AIProvider } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      pdfBase64,
      history = [],
      message,
      provider = "gemini" as AIProvider,
      model: targetModel = DEFAULT_MODEL_NAME,
      customApiKey,
      customBaseUrl,
    } = body;

    if (!message) {
      return NextResponse.json(
        { error: "Message content is required." },
        { status: 400 }
      );
    }

    const systemPrompt = `You are an expert AI document analyst. The user has uploaded a PDF document. 
Your job is to answer questions, summarize content, explain complex terms, and extract specific information strictly based on the provided PDF document. 
Be concise, clear, accurate, and format responses using clean Markdown (bolding, bullet points, code blocks, tables where appropriate). 
If the user asks something outside the scope of the document, politely inform them while offering whatever relevant context is in the PDF.`;

    // ---------------------------------------------------------
    // 1. GOOGLE GEMINI PROVIDER (with Auto-Fallback on 404)
    // ---------------------------------------------------------
    if (provider === "gemini") {
      const apiKey = customApiKey || process.env.GEMINI_API_KEY;

      if (!apiKey) {
        return NextResponse.json(
          {
            error:
              "GEMINI_API_KEY is missing. Please add a valid Google AI Studio API key starting with 'AIzaSy...' in .env.local or in the Model Settings modal.",
          },
          { status: 400 }
        );
      }

      // Check if key looks suspicious (e.g. access token starting with AQ...)
      if (apiKey.startsWith("AQ.")) {
        return NextResponse.json(
          {
            error:
              "The provided GEMINI_API_KEY appears to be an OAuth token or invalid credential format (starts with 'AQ.'). Google AI Studio API keys typically start with 'AIzaSy...'. Please update your key in .env.local or in the Model Settings modal.",
          },
          { status: 400 }
        );
      }

      const googleAI = new GoogleGenerativeAI(apiKey);

      // Model candidate order: requested model first, then fallback models
      const modelCandidates = Array.from(
        new Set([targetModel, ...GEMINI_FALLBACK_MODELS])
      );

      let lastError: any = null;

      for (const modelName of modelCandidates) {
        try {
          const generativeModel = googleAI.getGenerativeModel({
            model: modelName,
            systemInstruction: systemPrompt,
          });

          // Format chat history into Gemini parts structure
          const formattedHistory: Array<{ role: string; parts: any[] }> = [];

          if (pdfBase64 && history.length === 0) {
            formattedHistory.push({
              role: "user",
              parts: [
                {
                  inlineData: {
                    mimeType: "application/pdf",
                    data: pdfBase64,
                  },
                },
                {
                  text: "Here is the PDF document for our discussion. Please analyze it and prepare to answer my questions.",
                },
              ],
            });
            formattedHistory.push({
              role: "model",
              parts: [
                {
                  text: "I have read and indexed the PDF document. What questions do you have about it?",
                },
              ],
            });
          } else {
            for (const item of history) {
              formattedHistory.push({
                role: item.role === "user" ? "user" : "model",
                parts: [{ text: item.content }],
              });
            }
          }

          const chat = generativeModel.startChat({ history: formattedHistory });
          const resultStream = await chat.sendMessageStream(message);

          const encoder = new TextEncoder();
          const readable = new ReadableStream({
            async start(controller) {
              try {
                for await (const chunk of resultStream.stream) {
                  const chunkText = chunk.text();
                  controller.enqueue(encoder.encode(chunkText));
                }
                controller.close();
              } catch (err: any) {
                console.error("Streaming error:", err);
                controller.error(err);
              }
            },
          });

          return new Response(readable, {
            headers: {
              "Content-Type": "text/plain; charset=utf-8",
              "Cache-Control": "no-cache",
              "Transfer-Encoding": "chunked",
            },
          });
        } catch (err: any) {
          lastError = err;
          const errString = String(err?.message || err);
          // If 404 model not found, loop to next candidate model
          if (errString.includes("404") || errString.includes("not found")) {
            console.warn(`Gemini model ${modelName} returned 404, trying next fallback candidate...`);
            continue;
          }
          // For auth or other critical errors, break and report
          break;
        }
      }

      // If all models failed
      const rawMsg = lastError?.message || "Failed to generate response with Gemini.";
      if (rawMsg.includes("404") || rawMsg.includes("not found")) {
        return NextResponse.json(
          {
            error: `Google Gemini API returned 404 for model ${targetModel}. Please verify that your GEMINI_API_KEY is valid and has Generative Language API access enabled. Key format: starting with 'AIzaSy...'`,
          },
          { status: 404 }
        );
      }

      return NextResponse.json(
        { error: `Gemini API Error: ${rawMsg}` },
        { status: 500 }
      );
    }

    let effectiveModel = targetModel;
    if (provider === "kimi" && (targetModel === "kimi-k1.5" || !targetModel.startsWith("moonshot-v1-"))) {
      effectiveModel = "moonshot-v1-8k";
    }

    let apiKey = customApiKey;
    let endpointUrl = customBaseUrl;

    if (provider === "kimi") {
      apiKey = apiKey || process.env.KIMI_API_KEY || process.env.MOONSHOT_API_KEY;
      endpointUrl = endpointUrl || "https://api.moonshot.cn/v1/chat/completions";
    } else if (provider === "qwen") {
      apiKey = apiKey || process.env.QWEN_API_KEY || process.env.DASHSCOPE_API_KEY;
      endpointUrl = endpointUrl || "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions";
    } else {
      apiKey = apiKey || process.env.OPENAI_API_KEY;
      endpointUrl = endpointUrl || "https://api.openai.com/v1/chat/completions";
    }

    if (!apiKey) {
      const providerName = provider.toUpperCase();
      return NextResponse.json(
        {
          error: `API Key for ${providerName} is missing. Click the model indicator in the Navbar to open Settings and paste your ${providerName} API key.`,
        },
        { status: 400 }
      );
    }

    // Build system prompt with PDF text context for non-Gemini providers
    let enhancedSystemPrompt = systemPrompt;
    const pdfText = body.pdfText;
    if (pdfText && pdfText.length > 0) {
      enhancedSystemPrompt += `\n\n--- EXTRACTED PDF DOCUMENT CONTENT ---\n${pdfText.slice(0, 40000)}\n--- END DOCUMENT ---`;
    }

    // Prepare OpenAI format messages
    const messagesPayload: Array<{ role: string; content: string }> = [
      { role: "system", content: enhancedSystemPrompt },
    ];

    // Reconstruct conversation history
    for (const item of history) {
      messagesPayload.push({
        role: item.role === "user" ? "user" : "assistant",
        content: item.content,
      });
    }

    // Append current user message
    messagesPayload.push({
      role: "user",
      content: message,
    });

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
      const errorText = await openAiResponse.text();
      let formattedMsg = errorText;
      try {
        const errJson = JSON.parse(errorText);
        formattedMsg = errJson.error?.message || errJson.message || errorText;
      } catch {}

      return NextResponse.json(
        { error: `${provider.toUpperCase()} API Error (${openAiResponse.status}): ${formattedMsg}` },
        { status: openAiResponse.status }
      );
    }

    if (!openAiResponse.body) {
      return NextResponse.json(
        { error: "No response body received from API provider." },
        { status: 500 }
      );
    }

    // Stream SSE response from OpenAI format to plain text chunks
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
                  if (delta) {
                    controller.enqueue(encoder.encode(delta));
                  }
                } catch {
                  // Ignore JSON parse errors on incomplete chunks
                }
              }
            }
          }
          controller.close();
        } catch (err: any) {
          console.error("OpenAI stream parsing error:", err);
          controller.error(err);
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (error: any) {
    console.error("API /chat error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to generate AI response." },
      { status: 500 }
    );
  }
}

