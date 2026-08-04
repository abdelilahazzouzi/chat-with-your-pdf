"use client";

import { useState, useRef, KeyboardEvent } from "react";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

export default function ChatInput({ onSendMessage, disabled }: ChatInputProps) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = () => {
    if (!input.trim() || disabled) return;
    onSendMessage(input.trim());
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    // Auto-grow
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  };

  return (
    <div style={{ position: "relative", width: "100%" }}>
      {/* Outer Shell */}
      <div
        style={{
          background: "rgba(14, 14, 17, 0.75)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.12)",
          borderRadius: 24,
          padding: "8px 8px 8px 18px",
          boxShadow: "0 20px 40px -10px rgba(0,0,0,0.8)",
          display: "flex",
          alignItems: "flex-end",
          gap: 12,
          transition: "all 0.3s cubic-bezier(0.32, 0.72, 0, 1)",
        }}
      >
        {/* Input Field */}
        <textarea
          ref={textareaRef}
          value={input}
          onChange={handleTextareaChange}
          onKeyDown={handleKeyDown}
          placeholder={disabled ? "AI is typing..." : "Ask any question about your PDF..."}
          disabled={disabled}
          rows={1}
          style={{
            flex: 1,
            background: "transparent",
            border: "none",
            outline: "none",
            color: "#fafafa",
            fontFamily: "var(--font-body)",
            fontSize: 14,
            lineHeight: 1.5,
            resize: "none",
            maxHeight: 160,
            padding: "8px 0",
          }}
        />

        {/* Keyboard shortcut hint */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            paddingBottom: 10,
            fontSize: 11,
            color: "#52525b",
            fontFamily: "var(--font-mono)",
          }}
        >
          <kbd
            style={{
              padding: "2px 5px",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 4,
              fontSize: 10,
            }}
          >
            Enter
          </kbd>
          <span>to send</span>
        </div>

        {/* Send Button */}
        <button
          onClick={handleSubmit}
          disabled={!input.trim() || disabled}
          className="btn-primary"
          style={{
            padding: "8px 8px 8px 16px",
            fontSize: 14,
            opacity: !input.trim() || disabled ? 0.4 : 1,
            cursor: !input.trim() || disabled ? "not-allowed" : "pointer",
          }}
        >
          Ask
          <div className="btn-icon-circle" style={{ width: 30, height: 30 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2.5">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </div>
        </button>
      </div>
    </div>
  );
}
