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
