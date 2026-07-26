# Contract Design

`GenLayerPolicySentinel` is a reusable GenLayer primitive for policy-backed
reviews where the correctness of a decision depends on non-deterministic web
content and a validator-checked interpretation.

## Why this primitive exists

Many builders need the same reusable flow:

1. define a policy that matters for an application
2. submit a target document, page, profile, or statement for review
3. optionally add counter-context
4. resolve the outcome under GenLayer consensus
5. persist a stable on-chain verdict that downstream contracts or apps can read

This pattern is useful for:

- treasury proposal rule checks
- marketplace listing policy review
- content moderation pipelines
- vendor onboarding or disclosure review
- grant application policy screening

## Consensus flow

`resolve_review(...)` does three non-deterministic things:

1. fetches the policy page with `gl.nondet.web.get(...)`
2. fetches the subject page, and optional counter-source
3. produces a structured judgment with `gl.nondet.exec_prompt(...)`

The contract then calls `gl.vm.run_nondet_unsafe(...)` to compare leader and
validator outcomes before writing the final verdict.

## Stored outcome

A resolved review stores:

- verdict
- risk level
- confidence
- violation count
- applicable policy rules
- rationale

That makes the contract useful as a reusable policy oracle primitive, rather
than a one-off demo contract.
