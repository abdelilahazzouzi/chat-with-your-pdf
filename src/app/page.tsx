"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import FileUpload from "@/components/FileUpload";

export default function Home() {
  const router = useRouter();

  const handleFileSelect = (fileData: { name: string; size: number; base64: string; rawFile: File }) => {
    // Store PDF file data in session storage for the chat view
    if (typeof window !== "undefined") {
      sessionStorage.setItem("pdf_name", fileData.name);
      sessionStorage.setItem("pdf_size", fileData.size.toString());
      sessionStorage.setItem("pdf_base64", fileData.base64);
    }
    // Navigate to chat interface
    router.push("/chat");
  };

  return (
    <main style={{ minHeight: "100dvh", paddingTop: 100, paddingBottom: 80, paddingLeft: 24, paddingRight: 24 }}>
      {/* Floating Navbar */}
      <Navbar />

      {/* Hero Section */}
      <section
        style={{
          maxWidth: 1180,
          margin: "40px auto 80px auto",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
          gap: 60,
          alignItems: "center",
        }}
      >
        {/* Left Column: Copy & Value Prop */}
        <div>
          <div className="eyebrow-badge" style={{ marginBottom: 20 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#34d399", boxShadow: "0 0 8px #34d399" }} />
            POWERED BY GEMINI 2.5 • QWEN • KIMI AI
          </div>

          <h1
            style={{
              fontSize: "clamp(2.5rem, 5vw, 4.2rem)",
              fontWeight: 800,
              letterSpacing: "-0.04em",
              lineHeight: 1.05,
              marginBottom: 24,
              color: "#fafafa",
            }}
          >
            Chat with any PDF. <br />
            <span style={{
              background: "linear-gradient(135deg, #34d399 0%, #059669 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent"
            }}>
              Instant intelligence.
            </span>
          </h1>

          <p
            style={{
              fontSize: 17,
              lineHeight: 1.6,
              color: "#a1a1aa",
              marginBottom: 36,
              maxWidth: 480,
            }}
          >
            Upload research papers, financial reports, contracts, or books. Get immediate answers, bulleted summaries, and deep document insights in real time.
          </p>

          {/* Quick Metrics */}
          <div style={{ display: "flex", gap: 32, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <div>
              <div style={{ fontSize: 24, fontWeight: 700, color: "#fafafa", fontFamily: "var(--font-display)" }}>
                &lt; 1 sec
              </div>
              <div style={{ fontSize: 12, color: "#71717a", fontFamily: "var(--font-mono)", textTransform: "uppercase" }}>
                Indexing Speed
              </div>
            </div>
            <div>
              <div style={{ fontSize: 24, fontWeight: 700, color: "#fafafa", fontFamily: "var(--font-display)" }}>
                1M Tokens
              </div>
              <div style={{ fontSize: 12, color: "#71717a", fontFamily: "var(--font-mono)", textTransform: "uppercase" }}>
                Context Window
              </div>
            </div>
            <div>
              <div style={{ fontSize: 24, fontWeight: 700, color: "#34d399", fontFamily: "var(--font-display)" }}>
                100%
              </div>
              <div style={{ fontSize: 12, color: "#71717a", fontFamily: "var(--font-mono)", textTransform: "uppercase" }}>
                Private & Local
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: File Upload Component */}
        <div style={{ display: "flex", justifyContent: "center" }}>
          <FileUpload onFileSelect={handleFileSelect} />
        </div>
      </section>

      {/* Asymmetrical Bento Grid Section */}
      <section style={{ maxWidth: 1180, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div className="eyebrow-badge" style={{ marginBottom: 12 }}>
            CAPABILITIES
          </div>
          <h2 style={{ fontSize: 32, fontWeight: 700, color: "#fafafa" }}>
            Designed for complex documents
          </h2>
        </div>

        {/* Grid Container */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(12, 1fr)",
            gap: 20,
          }}
        >
          {/* Card 1 (Large 8 cols) */}
          <div
            className="double-bezel"
            style={{ gridColumn: "span 8" }}
          >
            <div className="double-bezel-inner" style={{ minHeight: 220, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  background: "rgba(52, 211, 153, 0.1)",
                  border: "1px solid rgba(52, 211, 153, 0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 16
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <line x1="3" y1="9" x2="21" y2="9" />
                    <line x1="9" y1="21" x2="9" y2="9" />
                  </svg>
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8, color: "#fafafa" }}>
                  Multimodal Layout & Table Intelligence
                </h3>
                <p style={{ fontSize: 14, color: "#a1a1aa", lineHeight: 1.6 }}>
                  Gemini natively interprets complex tables, mathematical formulas, diagrams, and multi-column magazine layouts without relying on fragile OCR text extractors.
                </p>
              </div>
              <div style={{ marginTop: 20, display: "flex", gap: 8 }}>
                <span className="mono-text" style={{ fontSize: 11, padding: "4px 10px", background: "rgba(255,255,255,0.04)", borderRadius: 6, color: "#34d399" }}>
                  Native PDF Vision
                </span>
                <span className="mono-text" style={{ fontSize: 11, padding: "4px 10px", background: "rgba(255,255,255,0.04)", borderRadius: 6, color: "#71717a" }}>
                  Table Extraction
                </span>
              </div>
            </div>
          </div>

          {/* Card 2 (4 cols) */}
          <div
            className="double-bezel"
            style={{ gridColumn: "span 4" }}
          >
            <div className="double-bezel-inner" style={{ minHeight: 220, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  background: "rgba(52, 211, 153, 0.1)",
                  border: "1px solid rgba(52, 211, 153, 0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 16
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                  </svg>
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8, color: "#fafafa" }}>
                  Streaming Answers
                </h3>
                <p style={{ fontSize: 14, color: "#a1a1aa", lineHeight: 1.6 }}>
                  Response stream renders word-by-word with zero loading spin delays.
                </p>
              </div>
              <div className="mono-text" style={{ fontSize: 11, color: "#34d399" }}>
                ⚡ Low-latency chunking
              </div>
            </div>
          </div>

          {/* Card 3 (4 cols) */}
          <div
            className="double-bezel"
            style={{ gridColumn: "span 4" }}
          >
            <div className="double-bezel-inner" style={{ minHeight: 200, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  background: "rgba(52, 211, 153, 0.1)",
                  border: "1px solid rgba(52, 211, 153, 0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 16
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8, color: "#fafafa" }}>
                  Multi-Turn Memory
                </h3>
                <p style={{ fontSize: 14, color: "#a1a1aa", lineHeight: 1.6 }}>
                  Ask follow-up questions seamlessly. The entire document remains in active attention memory.
                </p>
              </div>
            </div>
          </div>

          {/* Card 4 (8 cols) */}
          <div
            className="double-bezel"
            style={{ gridColumn: "span 8" }}
          >
            <div className="double-bezel-inner" style={{ minHeight: 200, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  background: "rgba(52, 211, 153, 0.1)",
                  border: "1px solid rgba(52, 211, 153, 0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 16
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8, color: "#fafafa" }}>
                  Zero Server Persistence Privacy
                </h3>
                <p style={{ fontSize: 14, color: "#a1a1aa", lineHeight: 1.6 }}>
                  Your uploaded PDF stays strictly in your browser session. No databases, no external storage, and no long-term logging of your private files.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ maxWidth: 1180, margin: "80px auto 0 auto", paddingTop: 24, borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13, color: "#71717a", fontFamily: "var(--font-mono)" }}>
        <div>
          DOC<span style={{ color: "#34d399" }}>AI</span> — Built with Next.js & Gemini 1.5 Flash
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#34d399", boxShadow: "0 0 10px #34d399" }} />
          Gemini API Operational
        </div>
      </footer>
    </main>
  );
}
