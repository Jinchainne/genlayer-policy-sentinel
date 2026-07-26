GenLayer Policy Sentinel is a standalone intelligent contract primitive for
policy-backed reviews on GenLayer.

Builders can register a reusable policy, submit a web document or subject for
review, attach counter-context, and resolve the final outcome under
GenLayer-native non-deterministic consensus. The contract fetches live policy
and subject content with `gl.nondet.web.get(...)`, asks for a structured
judgment with `gl.nondet.exec_prompt(...)`, and finalizes state only after
`gl.vm.run_nondet_unsafe(...)` validates the result.

This primitive is intended for builders who need reusable compliance,
moderation, onboarding, or governance-policy review flows without hardcoding a
single app-specific use case.

Live deployment on July 26, 2026:

- Repo: `https://github.com/Jinchainne/genlayer-policy-sentinel`
- Contract:
  `https://explorer-studio.genlayer.com/contracts/0x50C461d12aB74e2f0f9f3fe44a7823b13CCcF2A4`
- Transaction:
  `https://explorer-studio.genlayer.com/tx/0x6babe19d6cf8dfe0e72d632e35cd15efc38413bd4d31f2b16989e45b0c3d25a3`
