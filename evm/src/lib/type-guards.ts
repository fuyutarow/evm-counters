/**
 * 型安全なtype guardユーティリティ関数集
 * asキャストを排除し、ランタイム型チェックを提供
 */

// Error型ガード
export function asError(error: unknown): Error {
  if (error instanceof Error) {
    return error;
  }

  if (typeof error === "string") {
    return new Error(error);
  }

  if (error && typeof error === "object" && "message" in error) {
    return new Error(String(error.message));
  }

  return new Error(String(error));
}

// Theme型バリデーション
export type Theme = "dark" | "light" | "system";

export function validateTheme(value: string | null): Theme | null {
  if (!value) return null;

  const validThemes: Theme[] = ["dark", "light", "system"];
  return validThemes.find((theme) => theme === value) ?? null;
}

// Deprecated SealedValue type guards - removed in favor of ABI-first approach
// All type validation now handled by ABI-generated type guards
