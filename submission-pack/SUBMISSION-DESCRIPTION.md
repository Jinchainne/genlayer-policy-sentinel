GenLayer Policy Sentinel is a standalone intelligent contract primitive for
policy-backed reviews on GenLayer.

Builders can register a reusable policy, submit a web document or subject for
review, attach counter-context, and resolve the final outcome under
GenLayer-native non-deterministic consensus. The contract fetches live policy
and subject content with `gl.nondet.web.get(...)`, asks for a structured
judgment with `gl.nondet.exec_prompt(...)`, and finalizes state only after
`gl.vm.run_nondet_unsafe(...)` validates the result.

Review lifecycle integrity:

- Authorization: `submit_counter_context` and `resolve_review` are restricted to
  the review submitter and the policy creator. Unrelated callers are rejected.
- Append-only counter-context: Counter entries are stored as a list with author,
  note, source URL, and block number. New entries are appended, never overwritten.
- Challenge window: After counter-context is submitted, `resolve_review` cannot
  be called until 100 blocks have passed since the last counter entry.

This primitive is intended for builders who need reusable compliance,
moderation, onboarding, or governance-policy review flows without hardcoding a
single app-specific use case.

Updated deployment on July 31, 2026:

- Repo: https://github.com/Jinchainne/genlayer-policy-sentinel
- Contract: https://explorer-studio.genlayer.com/address/0x5A1aA94D9cc04eEA5AB7e1d69d8b437C423498cE
- Transaction: https://explorer-studio.genlayer.com/tx/0x330f9317fb080dffed4802be714d5945ddfbc3604f30c2b7c5d857393697ee38
