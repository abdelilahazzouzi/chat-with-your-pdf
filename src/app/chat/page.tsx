"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import ChatMessage from "@/components/ChatMessage";
import ChatInput from "@/components/ChatInput";
import SuggestedQuestions from "@/components/SuggestedQuestions";
import { useChat } from "@/hooks/useChat";
import { formatFileSize, truncateFileName } from "@/lib/utils";

export default function ChatPage() {
  const router = useRouter();
  const { messages, isLoading, error, sendMessage, clearChat } = useChat();

  const [pdfInfo, setPdfInfo] = useState<{ name: string; size: number; base64: string } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load PDF data from sessionStorage on client load
  useEffect(() => {
    if (typeof window !== "undefined") {
      const name = sessionStorage.getItem("pdf_name");
      const sizeStr = sessionStorage.getItem("pdf_size");
      const base64 = sessionStorage.getItem("pdf_base64");

      if (!name || !base64) {
        // If user navigated directly to /chat without uploading a PDF, redirect to home
        router.push("/");
        return;
      }

      setPdfInfo({
        name,
        size: sizeStr ? parseInt(sizeStr, 10) : 0,
        base64,
      });
    }
  }, [router]);

  // Auto-scroll to bottom as new messages or streaming chunks arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSendMessage = (userText: string) => {
    if (!pdfInfo) return;
    sendMessage(userText, pdfInfo.base64);
  };

  const handleResetPdf = () => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("pdf_name");
      sessionStorage.removeItem("pdf_size");
      sessionStorage.removeItem("pdf_base64");
    }
    router.push("/");
  };

  if (!pdfInfo) {
    return (
      <div style={{ minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="skeleton-shimmer" style={{ width: 200, height: 20, borderRadius: 10 }} />
      </div>
    );
  }

  return (
    <div style={{ height: "100dvh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Floating Navbar */}
      <Navbar currentPdfName={truncateFileName(pdfInfo.name, 20)} onResetPdf={handleResetPdf} />

      {/* Main Workspace Layout */}
      <div
        style={{
          flex: 1,
          marginTop: 84,
          padding: "16px 24px 24px 24px",
          maxWidth: 1280,
          width: "100%",
          margin: "84px auto 0 auto",
          display: "grid",
          gridTemplateColumns: "340px 1fr",
          gap: 20,
          height: "calc(100dvh - 90px)",
        }}
      >
        {/* Left Sidebar: PDF Metadata & Quick Starters */}
        <aside
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 16,
            height: "100%",
            overflowY: "auto",
          }}
        >
          {/* Document Summary Card */}
          <div className="double-bezel" style={{ width: "100%" }}>
            <div className="double-bezel-inner" style={{ padding: 20 }}>
              {/* Document Icon & Name */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 12,
                    background: "rgba(52, 211, 153, 0.12)",
                    border: "1px solid rgba(52, 211, 153, 0.25)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2">
                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                </div>
                <div style={{ overflow: "hidden" }}>
                  <h4 style={{ fontSize: 15, fontWeight: 700, color: "#fafafa", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {pdfInfo.name}
                  </h4>
                  <div style={{ fontSize: 12, color: "#71717a", fontFamily: "var(--font-mono)" }}>
                    {formatFileSize(pdfInfo.size)}
                  </div>
                </div>
              </div>

              {/* Status Badge */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "8px 12px",
                  background: "rgba(255, 255, 255, 0.03)",
                  border: "1px solid rgba(255, 255, 255, 0.06)",
                  borderRadius: 10,
                  fontSize: 12,
                  fontFamily: "var(--font-mono)",
                  marginBottom: 16,
                }}
              >
                <span style={{ color: "#a1a1aa" }}>INDEX STATUS</span>
                <span style={{ color: "#34d399", fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#34d399", boxShadow: "0 0 8px #34d399" }} />
                  READY
                </span>
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={clearChat}
                  className="btn-ghost"
                  style={{ flex: 1, padding: "8px 12px", fontSize: 12, justifyContent: "center" }}
                >
                  Clear History
                </button>
                <button
                  onClick={handleResetPdf}
                  className="btn-ghost"
                  style={{ padding: "8px 12px", fontSize: 12, justifyContent: "center" }}
                  title="Upload another file"
                >
                  Change PDF
                </button>
              </div>
            </div>
          </div>

          {/* Suggested Starter Questions */}
          <div className="double-bezel" style={{ flex: 1, overflowY: "auto" }}>
            <div className="double-bezel-inner" style={{ padding: 20, height: "100%" }}>
              <SuggestedQuestions onSelectQuestion={handleSendMessage} disabled={isLoading} />
            </div>
          </div>
        </aside>

        {/* Right Main Chat Container */}
        <main
          style={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
            background: "rgba(10, 10, 12, 0.6)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: 28,
            overflow: "hidden",
            position: "relative",
            backdropFilter: "blur(16px)",
          }}
        >
          {/* Messages Stream Area */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "24px 28px",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Welcome State if no messages */}
            {messages.length === 0 && (
              <div
                style={{
                  margin: "auto",
                  textAlign: "center",
                  maxWidth: 420,
                  padding: 32,
                }}
              >
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: "50%",
                    background: "rgba(52, 211, 153, 0.1)",
                    border: "1px solid rgba(52, 211, 153, 0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 20px auto",
                  }}
                >
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 700, color: "#fafafa", marginBottom: 8 }}>
                  PDF Indexed & Ready
                </h3>
                <p style={{ fontSize: 14, color: "#a1a1aa", lineHeight: 1.6, marginBottom: 24 }}>
                  Ask any question about <strong style={{ color: "#fafafa" }}>{pdfInfo.name}</strong> or select a suggested prompt from the left panel to get started.
                </p>
              </div>
            )}

            {/* Render Message List */}
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}

            {/* Error Banner */}
            {error && (
              <div
                style={{
                  padding: "12px 18px",
                  background: "rgba(239, 68, 68, 0.1)",
                  border: "1px solid rgba(239, 68, 68, 0.25)",
                  borderRadius: 12,
                  color: "#fca5a5",
                  fontSize: 13,
                  marginBottom: 16,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {error}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Bottom Fixed Chat Input Bar */}
          <div style={{ padding: "16px 24px", borderTop: "1px solid rgba(255, 255, 255, 0.06)", background: "rgba(8, 8, 10, 0.8)" }}>
            <ChatInput onSendMessage={handleSendMessage} disabled={isLoading} />
          </div>
        </main>
      </div>
    </div>
  );
}
