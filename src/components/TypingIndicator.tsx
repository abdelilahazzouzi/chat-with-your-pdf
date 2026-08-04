"use client";

export default function TypingIndicator() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 0" }}>
      <div
        style={{
          width: 7,
          height: 7,
          borderRadius: "50%",
          background: "#34d399",
          animation: "bounceDot 1.4s infinite ease-in-out 0s",
        }}
      />
      <div
        style={{
          width: 7,
          height: 7,
          borderRadius: "50%",
          background: "#34d399",
          animation: "bounceDot 1.4s infinite ease-in-out 0.2s",
        }}
      />
      <div
        style={{
          width: 7,
          height: 7,
          borderRadius: "50%",
          background: "#34d399",
          animation: "bounceDot 1.4s infinite ease-in-out 0.4s",
        }}
      />
      <style>{`
        @keyframes bounceDot {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40% { transform: scale(1.2); opacity: 1; boxShadow: 0 0 10px #34d399; }
        }
      `}</style>
    </div>
  );
}
