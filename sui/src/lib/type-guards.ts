/**
 * 不明な値をErrorオブジェクトに安全に変換する
 */
export function asError(error: unknown): Error {
  if (error instanceof Error) {
    return error;
  }

  if (typeof error === "string") {
    return new Error(error);
  }

  if (typeof error === "object" && error !== null && "message" in error) {
    const message = typeof error.message === "string" ? error.message : "Unknown error";
    return new Error(message);
  }

  return new Error("Unknown error occurred");
}
