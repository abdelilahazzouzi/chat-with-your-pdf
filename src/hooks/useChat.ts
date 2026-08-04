"use client";

import { useState, useCallback } from "react";
import { MessageItem } from "@/components/ChatMessage";

export function useChat() {
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(
    async (userMessageText: string, pdfBase64?: string) => {
      if (!userMessageText.trim() || isLoading) return;

      setError(null);
      const timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

      // Add user message
      const userMessage: MessageItem = {
        id: `user-${Date.now()}`,
        role: "user",
        content: userMessageText,
        timestamp,
      };

      // Add temporary model message (streaming)
      const assistantMessageId = `model-${Date.now()}`;
      const placeholderAssistantMessage: MessageItem = {
        id: assistantMessageId,
        role: "model",
        content: "",
        timestamp,
        isStreaming: true,
      };

      setMessages((prev) => [...prev, userMessage, placeholderAssistantMessage]);
      setIsLoading(true);

      try {
        // Read model configuration from localStorage
        let selectedModel = "gemini-2.5-flash";
        let provider = "gemini";
        let customApiKey = "";
        let customBaseUrl = "";

        if (typeof window !== "undefined") {
          selectedModel = localStorage.getItem("docai_selected_model") || "gemini-2.5-flash";
          provider = localStorage.getItem("docai_selected_provider") || "gemini";
          customApiKey = localStorage.getItem(`docai_key_${provider}`) || "";
          customBaseUrl = localStorage.getItem(`docai_url_${provider}`) || "";
        }

        // Construct payload
        const historyPayload = messages.map((m) => ({
          role: m.role,
          content: m.content,
        }));

        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pdfBase64: pdfBase64 || null,
            history: historyPayload,
            message: userMessageText,
            provider,
            model: selectedModel,
            customApiKey: customApiKey || undefined,
            customBaseUrl: customBaseUrl || undefined,
          }),
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error || `HTTP error ${response.status}`);
        }

        if (!response.body) {
          throw new Error("No response body received.");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let accumulatedText = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          accumulatedText += chunk;

          // Update streaming message in state
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMessageId
                ? { ...msg, content: accumulatedText, isStreaming: false }
                : msg
            )
          );
        }
      } catch (err: any) {
        console.error("Chat error:", err);
        setError(err.message || "Failed to get AI response.");
        // Remove empty placeholder if failed
        setMessages((prev) => prev.filter((msg) => msg.id !== assistantMessageId));
      } finally {
        setIsLoading(false);
      }
    },
    [messages, isLoading]
  );

  const clearChat = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearChat,
  };
}

