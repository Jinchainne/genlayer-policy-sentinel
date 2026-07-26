import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

const contractPath = "contracts/genlayer_policy_sentinel.py";
const readmePath = "README.md";
const clientPath = "src/genlayer-policy-sentinel-client.ts";
const deployPath = "deploy/001_deploy_policy_sentinel.mjs";
const judgeNotesPath = "submission-pack/JUDGE-NOTES.md";

test("contract uses GenLayer non-deterministic primitives", () => {
  const source = readFileSync(contractPath, "utf8");
  assert.match(source, /gl\.nondet\.web\.get/);
  assert.match(source, /gl\.nondet\.exec_prompt/);
  assert.match(source, /gl\.vm\.run_nondet_unsafe/);
});

test("contract exposes reusable policy and review methods", () => {
  const source = readFileSync(contractPath, "utf8");
  for (const name of [
    "register_policy",
    "submit_review",
    "submit_counter_context",
    "resolve_review",
    "get_policy_json",
    "get_review_json",
    "latest_summary",
  ]) {
    assert.match(source, new RegExp(`def ${name}\\(`));
  }
});

test("consensus output materially changes stored review state", () => {
  const source = readFileSync(contractPath, "utf8");
  for (const signal of [
    'review["verdict"] = resolution["verdict"]',
    'review["risk_level"] = resolution["risk_level"]',
    'review["violation_count"] = resolution["violation_count"]',
    'review["consensus_finalized"] = True',
  ]) {
    assert.ok(source.includes(signal), `missing signal: ${signal}`);
  }
});

test("repo includes deploy helper and reusable client helper", () => {
  assert.equal(existsSync(deployPath), true);
  assert.equal(existsSync(clientPath), true);
  const client = readFileSync(clientPath, "utf8");
  assert.match(client, /register_policy/);
  assert.match(client, /submit_review/);
  assert.match(client, /resolve_review/);
});

test("README documents intelligent-contract fit and repository tree", () => {
  const readme = readFileSync(readmePath, "utf8");
  assert.match(readme, /Intelligent Contracts/);
  assert.match(readme, /Repository Structure/);
  assert.match(readme, /genlayer-policy-sentinel\//);
  assert.match(readme, /gl\.vm\.run_nondet_unsafe/);
});

test("submission materials exist for reviewer handoff", () => {
  assert.equal(existsSync(judgeNotesPath), true);
  const judgeNotes = readFileSync(judgeNotesPath, "utf8");
  assert.match(judgeNotes, /Builder -> Intelligent Contracts/);
  assert.match(judgeNotes, /real GenLayer contract code is included/);
});
