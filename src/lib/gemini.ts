import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn("Warning: GEMINI_API_KEY environment variable is not set.");
}

export const genAI = new GoogleGenerativeAI(apiKey || "");

// Preferred Gemini models with automatic fallback order
export const GEMINI_FALLBACK_MODELS = [
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-1.5-flash-latest",
  "gemini-1.5-flash",
  "gemini-1.5-pro",
];

export const DEFAULT_MODEL_NAME = "gemini-2.5-flash";

export type AIProvider = "gemini" | "qwen" | "kimi" | "openai_compatible";

export interface AIModelOption {
  id: string;
  name: string;
  provider: AIProvider;
  description: string;
  recommended?: boolean;
}

export const SUPPORTED_MODELS: AIModelOption[] = [
  // Google Gemini
  {
    id: "gemini-2.5-flash",
    name: "Gemini 2.5 Flash",
    provider: "gemini",
    description: "Next-gen high speed & high intelligence model by Google",
    recommended: true,
  },
  {
    id: "gemini-2.0-flash",
    name: "Gemini 2.0 Flash",
    provider: "gemini",
    description: "Fast multimodal model for general document analysis",
  },
  {
    id: "gemini-1.5-pro",
    name: "Gemini 1.5 Pro",
    provider: "gemini",
    description: "Deep reasoning & 2M context window for ultra-long PDFs",
  },

  // Alibaba Qwen
  {
    id: "qwen-max",
    name: "Qwen Max (Alibaba)",
    provider: "qwen",
    description: "Alibaba's flagship foundation model for complex reasoning",
  },
  {
    id: "qwen-plus",
    name: "Qwen Plus (Alibaba)",
    provider: "qwen",
    description: "Balanced speed and performance by Alibaba Cloud",
  },
  {
    id: "qwen2.5-72b-instruct",
    name: "Qwen 2.5 72B",
    provider: "qwen",
    description: "Open-weights powerhouse model by Alibaba",
  },

  // Kimi (Moonshot AI)
  {
    id: "moonshot-v1-128k",
    name: "Kimi 128K (Moonshot)",
    provider: "kimi",
    description: "Kimi AI with 128k context for long document reading",
  },
  {
    id: "moonshot-v1-32k",
    name: "Kimi 32K (Moonshot)",
    provider: "kimi",
    description: "Kimi AI fast document analysis model",
  },
  {
    id: "kimi-k1.5",
    name: "Kimi k1.5",
    provider: "kimi",
    description: "Next-generation multimodal Kimi model",
  },

  // Free OpenRouter Models (No setup required)
  {
    id: "google/gemini-2.0-flash-lite-preview:free",
    name: "Gemini 2.0 Flash (Free)",
    provider: "openai_compatible",
    description: "100% Free Gemini 2.0 via OpenRouter ($0 balance)",
  },
  {
    id: "qwen/qwen-2.5-72b-instruct:free",
    name: "Qwen 2.5 72B (Free)",
    provider: "openai_compatible",
    description: "100% Free Alibaba Qwen model via OpenRouter",
  },
  {
    id: "deepseek/deepseek-r1:free",
    name: "DeepSeek R1 (Free)",
    provider: "openai_compatible",
    description: "100% Free DeepSeek R1 reasoning model via OpenRouter",
  },
];

export interface ChatMessagePart {
  text?: string;
  inlineData?: {
    mimeType: string;
    data: string;
  };
}

export interface ChatMessage {
  role: "user" | "model";
  parts: ChatMessagePart[];
}


