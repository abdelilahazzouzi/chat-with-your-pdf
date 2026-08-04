"use client";

interface SuggestedQuestionsProps {
  onSelectQuestion: (question: string) => void;
  disabled?: boolean;
}

const DEFAULT_QUESTIONS = [
  "Summarize the main points of this document",
  "What are the key conclusions or findings?",
  "List any important dates, data, or figures mentioned",
  "Explain the core topics discussed in simple terms",
];

export default function SuggestedQuestions({ onSelectQuestion, disabled }: SuggestedQuestionsProps) {
  return (
    <div style={{ marginTop: 16 }}>
      <div style={{
        fontSize: 11,
        fontFamily: "var(--font-mono)",
        color: "#71717a",
        textTransform: "uppercase",
        letterSpacing: "0.1em",
        marginBottom: 10,
        display: "flex",
        alignItems: "center",
        gap: 6
      }}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2">
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
        </svg>
        Suggested Starters
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {DEFAULT_QUESTIONS.map((q, idx) => (
          <button
            key={idx}
            onClick={() => onSelectQuestion(q)}
            disabled={disabled}
            style={{
              padding: "8px 14px",
              background: "rgba(255, 255, 255, 0.03)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: 9999,
              color: "#a1a1aa",
              fontSize: 13,
              fontFamily: "var(--font-body)",
              cursor: disabled ? "not-allowed" : "pointer",
              transition: "all 0.25s cubic-bezier(0.32, 0.72, 0, 1)",
              textAlign: "left",
              opacity: disabled ? 0.5 : 1,
            }}
            onMouseEnter={(e) => {
              if (!disabled) {
                e.currentTarget.style.background = "rgba(52, 211, 153, 0.08)";
                e.currentTarget.style.borderColor = "rgba(52, 211, 153, 0.25)";
                e.currentTarget.style.color = "#fafafa";
              }
            }}
            onMouseLeave={(e) => {
              if (!disabled) {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.03)";
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.08)";
                e.currentTarget.style.color = "#a1a1aa";
              }
            }}
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}
