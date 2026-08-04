"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import ModelSettingsModal from "./ModelSettingsModal";
import { SUPPORTED_MODELS, AIProvider } from "@/lib/gemini";

interface NavbarProps {
  currentPdfName?: string;
  onResetPdf?: () => void;
  selectedModel?: string;
  onSelectModel?: (modelId: string, provider: AIProvider) => void;
}

export default function Navbar({
  currentPdfName,
  onResetPdf,
  selectedModel: externalModel,
  onSelectModel: externalOnSelectModel,
}: NavbarProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeModel, setActiveModel] = useState(externalModel || "gemini-2.5-flash");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("docai_selected_model");
      if (saved) setActiveModel(saved);
    }
  }, []);

  useEffect(() => {
    if (externalModel) {
      setActiveModel(externalModel);
    }
  }, [externalModel]);

  const currentModelInfo =
    SUPPORTED_MODELS.find((m) => m.id === activeModel) || SUPPORTED_MODELS[0];

  const handleSelectModel = (modelId: string, provider: AIProvider) => {
    setActiveModel(modelId);
    if (typeof window !== "undefined") {
      localStorage.setItem("docai_selected_model", modelId);
      localStorage.setItem("docai_selected_provider", provider);
    }
    if (externalOnSelectModel) {
      externalOnSelectModel(modelId, provider);
    }
  };

  return (
    <>
      <nav className="glass-nav">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 text-decoration-none group" style={{ textDecoration: 'none' }}>
          <div style={{
            width: 34,
            height: 34,
            borderRadius: '50%',
            background: 'rgba(52, 211, 153, 0.12)',
            border: '1px solid rgba(52, 211, 153, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 15px rgba(52, 211, 153, 0.2)'
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
              <polyline points="14 2 14 8 20 8" />
              <path d="M10 13l-2 2 2 2" />
              <path d="M14 13l2 2-2 2" />
            </svg>
          </div>
          <div>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: '#fafafa', letterSpacing: '-0.02em' }}>
              DOC<span style={{ color: '#34d399' }}>AI</span>
            </span>
            <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: '#71717a', marginLeft: 8, padding: '2px 6px', background: 'rgba(255,255,255,0.05)', borderRadius: 4, border: '1px solid rgba(255,255,255,0.08)' }}>
              v1.0
            </span>
          </div>
        </Link>

        {/* Active PDF Badge (If in chat mode) */}
        {currentPdfName && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '4px 12px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 9999,
            fontSize: 12,
            color: '#a1a1aa',
            fontFamily: 'var(--font-mono)'
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#34d399', boxShadow: '0 0 8px #34d399' }} />
            <span style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {currentPdfName}
            </span>
            {onResetPdf && (
              <button
                onClick={onResetPdf}
                title="Upload new PDF"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#71717a',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  padding: 2,
                  borderRadius: 4
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* Nav Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Model Selector Badge Button */}
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="btn-ghost"
            style={{
              padding: "5px 12px",
              fontSize: 12,
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "rgba(52, 211, 153, 0.06)",
              border: "1px solid rgba(52, 211, 153, 0.2)",
              color: "#34d399",
            }}
            title="Configure AI Model & Provider (Gemini, Qwen, Kimi)"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
            <span style={{ fontWeight: 600 }}>{currentModelInfo.name}</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          <Link href="/" className="btn-primary" style={{ padding: '6px 6px 6px 16px', fontSize: 13 }}>
            New Document
            <div className="btn-icon-circle" style={{ width: 28, height: 28 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </div>
          </Link>
        </div>
      </nav>

      {/* Model Settings Modal */}
      <ModelSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        selectedModel={activeModel}
        onSelectModel={handleSelectModel}
      />
    </>
  );
}

