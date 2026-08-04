"use client";

import { useState } from "react";
import TypingIndicator from "./TypingIndicator";

export interface MessageItem {
  id: string;
  role: "user" | "model";
  content: string;
  timestamp: string;
  isStreaming?: boolean;
}

interface ChatMessageProps {
  message: MessageItem;
}

/**
 * Basic markdown parser for clean rendering without external heavy libraries
 */
function renderMarkdown(text: string) {
  if (!text) return null;

  // Split text by lines
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];

  lines.forEach((line, index) => {
    // Headers
    if (line.startsWith("### ")) {
      elements.push(
        <h4 key={index} style={{ fontSize: 16, fontWeight: 700, margin: "14px 0 6px 0", color: "#fafafa" }}>
          {line.replace("### ", "")}
        </h4>
      );
      return;
    }
    if (line.startsWith("## ")) {
      elements.push(
        <h3 key={index} style={{ fontSize: 18, fontWeight: 700, margin: "16px 0 8px 0", color: "#fafafa" }}>
          {line.replace("## ", "")}
        </h3>
      );
      return;
    }
    if (line.startsWith("# ")) {
      elements.push(
        <h2 key={index} style={{ fontSize: 20, fontWeight: 700, margin: "18px 0 10px 0", color: "#fafafa" }}>
          {line.replace("# ", "")}
        </h2>
      );
      return;
    }

    // Bullet points
    if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
      const content = line.trim().substring(2);
      elements.push(
        <li key={index} style={{ marginLeft: 20, marginBottom: 4, color: "#f0f0f3" }}>
          {parseInlineFormatting(content)}
        </li>
      );
      return;
    }

    // Numbered lists
    const numMatch = line.trim().match(/^(\d+)\.\s+(.*)/);
    if (numMatch) {
      elements.push(
        <div key={index} style={{ display: "flex", gap: 8, marginBottom: 4, color: "#f0f0f3" }}>
          <span style={{ color: "#34d399", fontWeight: 600, fontFamily: "var(--font-mono)", fontSize: 13 }}>{numMatch[1]}.</span>
          <span>{parseInlineFormatting(numMatch[2])}</span>
        </div>
      );
      return;
    }

    // Blockquote
    if (line.startsWith("> ")) {
      elements.push(
        <blockquote
          key={index}
          style={{
            borderLeft: "3px solid #34d399",
            paddingLeft: 14,
            margin: "8px 0",
            color: "#a1a1aa",
            fontStyle: "italic",
          }}
        >
          {parseInlineFormatting(line.replace("> ", ""))}
        </blockquote>
      );
      return;
    }

    // Empty line
    if (line.trim() === "") {
      elements.push(<div key={index} style={{ height: 8 }} />);
      return;
    }

    // Standard paragraph
    elements.push(
      <p key={index} style={{ marginBottom: 6, lineHeight: 1.6, color: "#f0f0f3" }}>
        {parseInlineFormatting(line)}
      </p>
    );
  });

  return elements;
}

/**
 * Parses bold (**text**), inline code (`code`), and italic (*text*)
 */
function parseInlineFormatting(text: string): React.ReactNode {
  const parts = text.split(/(\*\*.*?\*\*|`.*?`|\*.*?\*)/g);
  return parts.map((part, idx) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={idx} style={{ color: "#fafafa", fontWeight: 700 }}>
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={idx}
          style={{
            background: "rgba(255, 255, 255, 0.08)",
            padding: "2px 6px",
            borderRadius: 4,
            fontFamily: "var(--font-mono)",
            fontSize: 13,
            color: "#34d399",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return <em key={idx}>{part.slice(1, -1)}</em>;
    }
    return part;
  });
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === "user";

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="animate-fade-in"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: isUser ? "flex-end" : "flex-start",
        marginBottom: 20,
        width: "100%",
      }}
    >
      {/* Sender Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 6,
          fontSize: 11,
          fontFamily: "var(--font-mono)",
          color: "#71717a",
        }}
      >
        {!isUser && (
          <div
            style={{
              width: 18,
              height: 18,
              borderRadius: "50%",
              background: "rgba(52, 211, 153, 0.15)",
              border: "1px solid rgba(52, 211, 153, 0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2.5">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
        )}
        <span>{isUser ? "YOU" : "GEMINI AI"}</span>
        <span>•</span>
        <span>{message.timestamp}</span>
      </div>

      {/* Message Bubble Card */}
      <div
        style={{
          maxWidth: "85%",
          padding: "16px 20px",
          borderRadius: isUser ? "20px 20px 4px 20px" : "20px 20px 20px 4px",
          background: isUser
            ? "linear-gradient(135deg, rgba(52, 211, 153, 0.12), rgba(16, 185, 129, 0.08))"
            : "rgba(14, 14, 17, 0.8)",
          border: isUser
            ? "1px solid rgba(52, 211, 153, 0.25)"
            : "1px solid rgba(255, 255, 255, 0.08)",
          boxShadow: isUser
            ? "0 10px 25px -5px rgba(52, 211, 153, 0.1)"
            : "0 10px 25px -5px rgba(0, 0, 0, 0.5)",
          color: "#f0f0f3",
          position: "relative",
          backdropFilter: "blur(10px)",
        }}
      >
        {/* Message Content */}
        {message.content ? (
          <div>{renderMarkdown(message.content)}</div>
        ) : message.isStreaming ? (
          <TypingIndicator />
        ) : null}

        {/* Copy Button for Model responses */}
        {!isUser && message.content && (
          <button
            onClick={handleCopy}
            title="Copy response"
            style={{
              marginTop: 10,
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              fontSize: 11,
              fontFamily: "var(--font-mono)",
              color: copied ? "#34d399" : "#71717a",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
            {copied ? "COPIED!" : "COPY"}
          </button>
        )}
      </div>
    </div>
  );
}
