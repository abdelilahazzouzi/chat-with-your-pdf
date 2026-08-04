"use client";

import { useState, useRef, ChangeEvent, DragEvent } from "react";
import { formatFileSize, fileToBase64, extractPdfText } from "@/lib/utils";

interface FileUploadProps {
  onFileSelect: (fileData: { name: string; size: number; base64: string; text?: string; rawFile: File }) => void;
}

export default function FileUpload({ onFileSelect }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = async (file: File) => {
    setError(null);

    // Validate type
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setError("Please select a valid PDF document.");
      return;
    }

    // Validate size (< 15MB)
    const MAX_SIZE = 15 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setError("File size exceeds 15MB limit. Please upload a smaller PDF.");
      return;
    }

    setIsProcessing(true);
    setProgress(30);

    try {
      setProgress(50);
      const base64 = await fileToBase64(file);
      setProgress(80);
      const text = await extractPdfText(file);
      setProgress(100);

      setTimeout(() => {
        setIsProcessing(false);
        onFileSelect({
          name: file.name,
          size: file.size,
          base64,
          text,
          rawFile: file,
        });
      }, 400);
    } catch (err: any) {
      setIsProcessing(false);
      setError("Failed to read PDF file. Please try again.");
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div className="double-bezel" style={{ width: '100%', maxWidth: 540 }}>
      <div
        className="double-bezel-inner"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        style={{
          border: isDragging
            ? "1.5px dashed #34d399"
            : "1.5px dashed rgba(255, 255, 255, 0.12)",
          background: isDragging
            ? "rgba(52, 211, 153, 0.04)"
            : "var(--bg-onyx)",
          padding: "48px 32px",
          textAlign: "center",
          cursor: "pointer",
          transition: "all 0.3s ease",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 320,
        }}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleInputChange}
          accept="application/pdf"
          style={{ display: "none" }}
        />

        {/* Upload Icon Circle */}
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            background: isDragging ? "rgba(52, 211, 153, 0.2)" : "rgba(255, 255, 255, 0.04)",
            border: `1px solid ${isDragging ? "#34d399" : "rgba(255, 255, 255, 0.1)"}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 20,
            transition: "all 0.3s ease",
            boxShadow: isDragging ? "0 0 25px rgba(52, 211, 153, 0.3)" : "none",
          }}
        >
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke={isDragging ? "#34d399" : "#a1a1aa"}
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
        </div>

        {/* Title */}
        <h3
          style={{
            fontSize: 20,
            fontWeight: 700,
            marginBottom: 8,
            color: "#fafafa",
          }}
        >
          {isDragging ? "Drop your PDF here" : "Upload your PDF Document"}
        </h3>

        {/* Subtitle */}
        <p
          style={{
            fontSize: 14,
            color: "#a1a1aa",
            marginBottom: 24,
            maxWidth: 340,
            lineHeight: 1.5,
          }}
        >
          Drag and drop your file here, or <span style={{ color: "#34d399", fontWeight: 600 }}>browse files</span> from your device.
        </p>

        {/* File Specs Pill */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 12,
            padding: "6px 14px",
            background: "rgba(255, 255, 255, 0.03)",
            border: "1px solid rgba(255, 255, 255, 0.07)",
            borderRadius: 9999,
            fontSize: 12,
            color: "#71717a",
            fontFamily: "var(--font-mono)",
          }}
        >
          <span>PDF ONLY</span>
          <span style={{ color: "rgba(255, 255, 255, 0.15)" }}>•</span>
          <span>UP TO 15MB</span>
          <span style={{ color: "rgba(255, 255, 255, 0.15)" }}>•</span>
          <span>SECURE & PRIVATE</span>
        </div>

        {/* Processing Progress Bar */}
        {isProcessing && (
          <div style={{ width: "100%", maxWidth: 300, marginTop: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#34d399", marginBottom: 6, fontFamily: "var(--font-mono)" }}>
              <span>INDEXING PDF...</span>
              <span>{progress}%</span>
            </div>
            <div style={{ height: 4, width: "100%", background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden" }}>
              <div
                style={{
                  height: "100%",
                  width: `${progress}%`,
                  background: "#34d399",
                  borderRadius: 2,
                  transition: "width 0.3s ease",
                  boxShadow: "0 0 10px #34d399",
                }}
              />
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div
            style={{
              marginTop: 20,
              padding: "10px 16px",
              background: "rgba(239, 68, 68, 0.1)",
              border: "1px solid rgba(239, 68, 68, 0.25)",
              borderRadius: 12,
              color: "#fca5a5",
              fontSize: 13,
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
      </div>
    </div>
  );
}
