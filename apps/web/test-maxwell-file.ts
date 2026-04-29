import { readFileSync } from "fs";
import { preprocessMathDelimiters } from "./lib/markdown/preprocess.ts";

const raw = readFileSync("/Users/zhangjinkai/workspace/The0xKa1.github.io/content/NOTE/Physics/maxwell.md", "utf-8");
const lines = raw.split("\n");

// Find the align* block and show surrounding lines
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("begin{align*}")) {
    console.log("=== ORIGINAL (lines " + (i-1) + " to " + (i+10) + ") ===");
    console.log(lines.slice(i-1, i+10).join("\n"));

    const processed = preprocessMathDelimiters(lines.slice(i-1, i+10).join("\n"));
    console.log("\n=== PROCESSED ===");
    console.log(processed);
    break;
  }
}
