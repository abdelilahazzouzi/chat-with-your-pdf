"use client";

import { useState, useEffect } from "react";
import { SUPPORTED_MODELS, AIModelOption, AIProvider } from "@/lib/gemini";

interface ModelSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedModel: string;
  onSelectModel: (modelId: string, provider: AIProvider) => void;
}

export default function ModelSettingsModal({
  isOpen,
  onClose,
  selectedModel,
  onSelectModel,
}: ModelSettingsModalProps) {
  const [activeTab, setActiveTab] = useState<AIProvider>("gemini");
  const [apiKey, setApiKey] = useState("");
  const [baseUrl, setBaseUrl] = useState("");
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Sync state with localStorage on mount/tab change
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedKey = localStorage.getItem(`docai_key_${activeTab}`) || "";
      const storedUrl = localStorage.getItem(`docai_url_${activeTab}`) || "";
      setApiKey(storedKey);
      setBaseUrl(storedUrl);
    }
  }, [activeTab]);

  if (!isOpen) return null;

  const filteredModels = SUPPORTED_MODELS.filter((m) => m.provider === activeTab);

  const handleSaveKey = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem(`docai_key_${activeTab}`, apiKey.trim());
      if (baseUrl) {
        localStorage.setItem(`docai_url_${activeTab}`, baseUrl.trim());
      } else {
        localStorage.removeItem(`docai_url_${activeTab}`);
      }
    }
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 999,
        background: "rgba(0, 0, 0, 0.75)",
        backdropFilter: "blur(12px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      <div
        className="double-bezel"
        style={{
          width: "100%",
          maxWidth: 580,
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        <div className="double-bezel-inner" style={{ padding: 28 }}>
          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 24,
            }}
          >
            <div>
              <h3 style={{ fontSize: 20, fontWeight: 700, color: "#fafafa" }}>
                AI Model & Provider Settings
              </h3>
              <p style={{ fontSize: 13, color: "#a1a1aa", marginTop: 4 }}>
                Choose your AI engine: Google Gemini, Alibaba Qwen, Kimi AI, or Custom endpoints.
              </p>
            </div>
            <button
              onClick={onClose}
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "#a1a1aa",
                width: 32,
                height: 32,
                borderRadius: "50%",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              ✕
            </button>
          </div>

          {/* Provider Tabs */}
          <div
            style={{
              display: "flex",
              gap: 8,
              padding: 4,
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 12,
              marginBottom: 24,
            }}
          >
            {[
              { id: "gemini", label: "Google Gemini" },
              { id: "qwen", label: "Alibaba Qwen" },
              { id: "kimi", label: "Kimi (Moonshot)" },
              { id: "openai_compatible", label: "OpenAI / Custom" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as AIProvider)}
                style={{
                  flex: 1,
                  padding: "8px 12px",
                  fontSize: 12,
                  fontWeight: 600,
                  borderRadius: 8,
                  border: "none",
                  cursor: "pointer",
                  background: activeTab === tab.id ? "#34d399" : "transparent",
                  color: activeTab === tab.id ? "#09090b" : "#a1a1aa",
                  transition: "all 0.15s ease",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Available Models List */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 12, color: "#71717a", fontFamily: "var(--font-mono)", marginBottom: 10, textTransform: "uppercase" }}>
              Select Model
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {filteredModels.map((m) => {
                const isSelected = selectedModel === m.id;
                return (
                  <div
                    key={m.id}
                    onClick={() => onSelectModel(m.id, m.provider)}
                    style={{
                      padding: 14,
                      borderRadius: 12,
                      background: isSelected ? "rgba(52, 211, 153, 0.08)" : "rgba(255,255,255,0.02)",
                      border: isSelected ? "1px solid rgba(52, 211, 153, 0.3)" : "1px solid rgba(255,255,255,0.06)",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "#fafafa", display: "flex", alignItems: "center", gap: 8 }}>
                        {m.name}
                        {m.recommended && (
                          <span style={{ fontSize: 10, background: "rgba(52, 211, 153, 0.2)", color: "#34d399", padding: "2px 6px", borderRadius: 4 }}>
                            RECOMMENDED
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 12, color: "#a1a1aa", marginTop: 4 }}>
                        {m.description}
                      </div>
                    </div>

                    <div
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: "50%",
                        border: isSelected ? "5px solid #34d399" : "2px solid rgba(255,255,255,0.2)",
                        flexShrink: 0,
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Custom API Key Input */}
          <div style={{ padding: 16, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, marginBottom: 24 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#fafafa", marginBottom: 6 }}>
              API Key ({activeTab.toUpperCase()})
            </div>
            <div style={{ fontSize: 12, color: "#71717a", marginBottom: 12 }}>
              {activeTab === "gemini"
                ? "Enter your Google Gemini API key. Overrides .env.local if provided."
                : activeTab === "kimi"
                ? "Enter your Moonshot/Kimi API key."
                : activeTab === "qwen"
                ? "Enter your Alibaba Cloud DashScope API key."
                : "Enter your OpenAI or Custom API key."}
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={`Paste ${activeTab} API key...`}
                style={{
                  flex: 1,
                  padding: "10px 14px",
                  background: "rgba(0,0,0,0.5)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 8,
                  color: "#fafafa",
                  fontSize: 13,
                  fontFamily: "var(--font-mono)",
                }}
              />
              <button
                onClick={handleSaveKey}
                className="btn-primary"
                style={{ padding: "10px 16px", fontSize: 13, borderRadius: 8 }}
              >
                {savedSuccess ? "Saved ✓" : "Save Key"}
              </button>
            </div>

            {activeTab === "openai_compatible" && (
              <div style={{ marginTop: 12 }}>
                <div style={{ fontSize: 12, color: "#71717a", marginBottom: 4 }}>
                  Custom Base URL (Optional)
                </div>
                <input
                  type="text"
                  value={baseUrl}
                  onChange={(e) => setBaseUrl(e.target.value)}
                  placeholder="https://api.openai.com/v1/chat/completions"
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    background: "rgba(0,0,0,0.5)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 8,
                    color: "#fafafa",
                    fontSize: 12,
                    fontFamily: "var(--font-mono)",
                  }}
                />
              </div>
            )}
          </div>

          {/* Footer */}
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button
              onClick={onClose}
              className="btn-primary"
              style={{ padding: "10px 24px", fontSize: 13 }}
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
