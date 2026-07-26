import { existsSync } from "node:fs";
import { resolve } from "node:path";

const contractPath = resolve("contracts/genlayer_policy_sentinel.py");

if (!existsSync(contractPath)) {
  console.error("Missing contract file:", contractPath);
  process.exit(1);
}

console.log("Deploy command:");
console.log(
  "genlayer deploy --contract contracts/genlayer_policy_sentinel.py --rpc https://studio.genlayer.com/api",
);
