import { readFileSync } from "node:fs";

const source = readFileSync("contracts/genlayer_policy_sentinel.py", "utf8");

const checks = [
  "gl.nondet.web.get",
  "gl.nondet.exec_prompt",
  "gl.vm.run_nondet_unsafe",
  "register_policy",
  "submit_review",
  "resolve_review",
];

for (const check of checks) {
  if (!source.includes(check)) {
    console.error(`Missing required signal: ${check}`);
    process.exit(1);
  }
}

console.log("Contract verification signals are present.");
