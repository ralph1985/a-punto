import { describe, expect, it } from "vitest";
import { isSafeHttpUrl, safeHttpUrlSchema } from "./safe-url";

describe("URLs externas", () => {
  it("acepta únicamente http y https", () => {
    expect(isSafeHttpUrl("https://example.com/documento")).toBe(true);
    expect(isSafeHttpUrl("http://example.com/documento")).toBe(true);
    expect(isSafeHttpUrl("javascript:alert(1)")).toBe(false);
    expect(isSafeHttpUrl("data:text/html,<p>no</p>")).toBe(false);
    expect(safeHttpUrlSchema.safeParse("file:///tmp/documento").success).toBe(false);
  });
});
