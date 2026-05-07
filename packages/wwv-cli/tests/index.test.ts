import { describe, it, expect } from "vitest";
import { execSync } from "child_process";
import path from "path";

describe("wwv cli", () => {
    it("should print help information", () => {
        const binPath = path.resolve(__dirname, "../bin/wwv.js");
        const output = execSync(`node ${binPath} --help`).toString();
        expect(output).toContain("Usage: wwv [options]");
    });
});
