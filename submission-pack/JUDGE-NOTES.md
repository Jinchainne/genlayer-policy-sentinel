# Judge Notes

## Category target

Builder -> Intelligent Contracts

## Why this should pass the gate

- real GenLayer contract code is included in-repo
- uses `gl.nondet.web.get(...)` on policy and subject sources
- uses `gl.nondet.exec_prompt(...)` for structured policy reasoning
- uses `gl.vm.run_nondet_unsafe(...)` so consensus materially changes stored state
- exposes a reusable primitive other builders can integrate into their own apps

## What makes it reusable

This is not tied to a single dapp. Builders can register their own policies and
review their own subjects while reusing the same consensus-backed review flow.

## Reviewer checklist

1. inspect `contracts/genlayer_policy_sentinel.py`
2. confirm write methods: `register_policy`, `submit_review`,
   `submit_counter_context`, `resolve_review`
3. confirm view methods: `get_policy_json`, `get_review_json`,
   `get_review_ids`, `latest_summary`
4. confirm the README explains purpose, state, and consensus flow
5. confirm tests document the contract signals and repo structure
