import { z } from "zod";

export function isSafeHttpUrl(value: string) {
  try {
    const protocol = new URL(value).protocol;
    return protocol === "http:" || protocol === "https:";
  } catch {
    return false;
  }
}

export const safeHttpUrlSchema = z.string().url().refine(isSafeHttpUrl, "La URL debe usar http o https.");
