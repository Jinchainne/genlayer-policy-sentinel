# Judge Notes

## Category target

Builder -> Intelligent Contracts

## Why this should pass the gate

- real GenLayer contract code is included in-repo
- uses `gl.nondet.web.get(...)` on policy and subject sources
- uses `gl.nondet.exec_prompt(...)` for structured policy reasoning
- uses `gl.vm.run_nondet_unsafe(...)` so consensus materially changes stored state
- exposes a reusable primitive other builders can integrate into their own apps

## Review lifecycle integrity

- Authorization: `submit_counter_context` and `resolve_review` are restricted to
  the review submitter and the policy creator
- Append-only counter-context: entries stored as a list, never overwritten
- Challenge window: 100 blocks after last counter-context before resolution

## What makes it reusable

This is not tied to a single dapp. Builders can register their own policies and
review their own subjects while reusing the same consensus-backed review flow.

## Reviewer checklist

1. inspect `contracts/genlayer_policy_sentinel.py`
2. confirm write methods: `register_policy`, `submit_review`,
   `submit_counter_context`, `resolve_review`
3. confirm authorization: only submitter or policy creator can call
   `submit_counter_context` and `resolve_review`
4. confirm append-only: `counter_entries` list grows, never overwrites
5. confirm challenge window: 100 block delay after counter-context
6. confirm view methods: `get_policy_json`, `get_review_json`,
   `get_review_ids`, `latest_summary`
7. confirm the README explains purpose, state, and consensus flow
8. confirm tests document the contract signals and repo structure

## Live evidence

- GitHub repo: https://github.com/Jinchainne/genlayer-policy-sentinel
- Explorer contract: https://explorer-studio.genlayer.com/address/0x5A1aA94D9cc04eEA5AB7e1d69d8b437C423498cE
- Explorer tx: https://explorer-studio.genlayer.com/tx/0x330f9317fb080dffed4802be714d5945ddfbc3604f30c2b7c5d857393697ee38
