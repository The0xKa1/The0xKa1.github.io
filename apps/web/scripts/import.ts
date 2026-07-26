import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

async function main() {
  await import("./import-content");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
