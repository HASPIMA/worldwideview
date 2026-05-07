import { describe, it, expect, vi } from "vitest";
import { publishToNpm } from "../src/commands/publish";

vi.mock("child_process", () => ({
    execSync: vi.fn()
}));
vi.mock("vite", () => ({
    build: vi.fn().mockResolvedValue({})
}));

describe("publish command", () => {
    it("should export publishToNpm function", () => {
        expect(typeof publishToNpm).toBe("function");
    });
});
