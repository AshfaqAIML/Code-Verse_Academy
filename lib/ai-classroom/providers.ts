import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createDeepSeek } from "@ai-sdk/deepseek";
import type { LanguageModel } from "ai";

export type ProviderId = "openai" | "anthropic" | "google" | "deepseek";

export interface ModelConfig {
  provider: ProviderId;
  modelId: string;
  apiKey: string;
  baseURL?: string;
}

export function getProviderConfig(provider?: ProviderId): ModelConfig {
  const resolved: ProviderId = provider ?? (process.env.AI_PROVIDER as ProviderId) ?? "openai";
  switch (resolved) {
    case "anthropic":
      return {
        provider: "anthropic",
        modelId: process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-20250514",
        apiKey: process.env.ANTHROPIC_API_KEY ?? "",
      };
    case "google":
      return {
        provider: "google",
        modelId: process.env.GOOGLE_MODEL ?? "gemini-2.0-flash-001",
        apiKey: process.env.GOOGLE_API_KEY ?? "",
      };
    case "deepseek":
      return {
        provider: "deepseek",
        modelId: process.env.DEEPSEEK_MODEL ?? "deepseek-chat",
        apiKey: process.env.DEEPSEEK_API_KEY ?? "",
        baseURL: process.env.DEEPSEEK_BASE_URL ?? "https://api.deepseek.com",
      };
    default:
      return {
        provider: "openai",
        modelId: process.env.AI_MODEL ?? "gpt-4o-mini",
        apiKey: process.env.OPENAI_API_KEY ?? "",
        baseURL: process.env.OPENAI_BASE_URL ?? undefined,
      };
  }
}

export function createLanguageModel(config: ModelConfig): LanguageModel {
  switch (config.provider) {
    case "anthropic":
      return createAnthropic({ apiKey: config.apiKey }).chat(config.modelId);
    case "google":
      return createGoogleGenerativeAI({ apiKey: config.apiKey }).chat(config.modelId);
    case "deepseek":
      return createDeepSeek({
        apiKey: config.apiKey,
        baseURL: config.baseURL,
      }).chat(config.modelId);
    default:
      return createOpenAI({
        apiKey: config.apiKey,
        baseURL: config.baseURL,
      }).chat(config.modelId);
  }
}
