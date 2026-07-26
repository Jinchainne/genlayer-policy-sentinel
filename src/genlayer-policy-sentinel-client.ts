import { createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";

const ACCEPTED_STATUS = "ACCEPTED";

function requireTrimmedValue(value: string, label: string, minLength = 1): string {
  const normalized = value.trim();
  if (normalized.length < minLength) {
    throw new Error(`${label} is required${minLength > 1 ? ` and must be at least ${minLength} characters.` : "."}`);
  }
  return normalized;
}

function requireAddress(value: string, label: string): `0x${string}` {
  const normalized = requireTrimmedValue(value, label);
  if (!/^0x[a-fA-F0-9]{40}$/.test(normalized)) {
    throw new Error(`${label} must be a valid 0x address.`);
  }
  return normalized as `0x${string}`;
}

function requireHttpsUrl(value: string, label: string): string {
  const normalized = requireTrimmedValue(value, label, 12);
  const url = new URL(normalized);
  if (url.protocol !== "https:") {
    throw new Error(`${label} must use https.`);
  }
  if (/(^localhost$)|(^127\.)|(^10\.)|(^192\.168\.)|(^172\.(1[6-9]|2\d|3[01])\.)/i.test(url.hostname)) {
    throw new Error(`${label} cannot point to localhost or a private network.`);
  }
  return normalized;
}

function getExecutionFailure(receipt: any): string | null {
  const leaderReceipt = receipt?.consensus_data?.leader_receipt;
  if (!leaderReceipt) {
    return null;
  }

  const executionResult = String(leaderReceipt.execution_result || "").toUpperCase();
  if (executionResult && executionResult !== "SUCCESS") {
    return leaderReceipt.error || `Execution result was ${executionResult}.`;
  }

  const eqOutputs = leaderReceipt.eq_outputs?.leader || {};
  for (const raw of Object.values(eqOutputs)) {
    if (typeof raw !== "string") {
      continue;
    }
    try {
      const parsed = JSON.parse(raw);
      if (parsed?.transaction_success === false) {
        return parsed.transaction_error || "Transaction execution returned transaction_success=false.";
      }
    } catch {
      // Ignore malformed diagnostics and keep scanning.
    }
  }

  return null;
}

async function waitForConfirmedExecution(client: any, txHash: `0x${string}`) {
  const receipt = await client.waitForTransactionReceipt({
    hash: txHash,
    status: ACCEPTED_STATUS,
    fullTransaction: true,
    retries: 120,
    interval: 3000,
  });

  const statusName = String(receipt?.statusName || receipt?.status || "").toUpperCase();
  if (statusName && statusName !== "ACCEPTED" && statusName !== "FINALIZED") {
    throw new Error(`Transaction reached unexpected status ${statusName}.`);
  }

  const executionFailure = getExecutionFailure(receipt);
  if (executionFailure) {
    throw new Error(`GenLayer execution failed: ${executionFailure}`);
  }

  return receipt;
}

export async function connectStudionetWallet(account: `0x${string}`) {
  return createClient({
    chain: studionet,
    account,
  });
}

export async function deployPolicySentinel(client: any, contractCode: string) {
  await client.connect("studionet");
  await client.initializeConsensusSmartContract();

  const txHash = await client.deployContract({
    code: new TextEncoder().encode(contractCode),
    args: [],
  });

  return waitForConfirmedExecution(client, txHash);
}

export async function registerPolicy(params: {
  client: any;
  contractAddress: string;
  policyId: string;
  title: string;
  subjectType: string;
  policyGuidance: string;
  policySourceUrl: string;
}) {
  const txHash = await params.client.writeContract({
    address: requireAddress(params.contractAddress, "Contract address"),
    functionName: "register_policy",
    args: [
      requireTrimmedValue(params.policyId, "Policy ID", 4).toLowerCase(),
      requireTrimmedValue(params.title, "Title", 8),
      requireTrimmedValue(params.subjectType, "Subject type", 4),
      requireTrimmedValue(params.policyGuidance, "Policy guidance", 48),
      requireHttpsUrl(params.policySourceUrl, "Policy source URL"),
    ],
  });

  return waitForConfirmedExecution(params.client, txHash);
}

export async function submitPolicyReview(params: {
  client: any;
  contractAddress: string;
  reviewId: string;
  policyId: string;
  subjectLabel: string;
  subjectExcerpt: string;
  subjectSourceUrl: string;
  contextNote: string;
}) {
  const txHash = await params.client.writeContract({
    address: requireAddress(params.contractAddress, "Contract address"),
    functionName: "submit_review",
    args: [
      requireTrimmedValue(params.reviewId, "Review ID", 4).toLowerCase(),
      requireTrimmedValue(params.policyId, "Policy ID", 4).toLowerCase(),
      requireTrimmedValue(params.subjectLabel, "Subject label", 6),
      requireTrimmedValue(params.subjectExcerpt, "Subject excerpt", 24),
      requireHttpsUrl(params.subjectSourceUrl, "Subject source URL"),
      requireTrimmedValue(params.contextNote, "Context note", 16),
    ],
  });

  return waitForConfirmedExecution(params.client, txHash);
}

export async function submitCounterContext(params: {
  client: any;
  contractAddress: string;
  reviewId: string;
  counterNote: string;
  counterSourceUrl: string;
}) {
  const txHash = await params.client.writeContract({
    address: requireAddress(params.contractAddress, "Contract address"),
    functionName: "submit_counter_context",
    args: [
      requireTrimmedValue(params.reviewId, "Review ID", 4).toLowerCase(),
      requireTrimmedValue(params.counterNote, "Counter note", 16),
      requireHttpsUrl(params.counterSourceUrl, "Counter source URL"),
    ],
  });

  return waitForConfirmedExecution(params.client, txHash);
}

export async function resolvePolicyReview(client: any, contractAddress: string, reviewId: string) {
  const txHash = await client.writeContract({
    address: requireAddress(contractAddress, "Contract address"),
    functionName: "resolve_review",
    args: [requireTrimmedValue(reviewId, "Review ID", 4).toLowerCase()],
  });

  return waitForConfirmedExecution(client, txHash);
}

export async function readPolicy(client: any, contractAddress: string, policyId: string) {
  return client.readContract({
    address: requireAddress(contractAddress, "Contract address"),
    functionName: "get_policy_json",
    args: [requireTrimmedValue(policyId, "Policy ID", 4).toLowerCase()],
  });
}

export async function readPolicyReview(client: any, contractAddress: string, reviewId: string) {
  const raw = await client.readContract({
    address: requireAddress(contractAddress, "Contract address"),
    functionName: "get_review_json",
    args: [requireTrimmedValue(reviewId, "Review ID", 4).toLowerCase()],
  });

  return typeof raw === "string" ? JSON.parse(raw.replace(/'/g, "\"")) : raw;
}

export async function runBoundPolicyReviewFlow(params: {
  client: any;
  contractAddress: string;
  policyId: string;
  reviewId: string;
  title: string;
  subjectType: string;
  policyGuidance: string;
  policySourceUrl: string;
  subjectLabel: string;
  subjectExcerpt: string;
  subjectSourceUrl: string;
  contextNote: string;
}) {
  await registerPolicy({
    client: params.client,
    contractAddress: params.contractAddress,
    policyId: params.policyId,
    title: params.title,
    subjectType: params.subjectType,
    policyGuidance: params.policyGuidance,
    policySourceUrl: params.policySourceUrl,
  });

  await submitPolicyReview({
    client: params.client,
    contractAddress: params.contractAddress,
    reviewId: params.reviewId,
    policyId: params.policyId,
    subjectLabel: params.subjectLabel,
    subjectExcerpt: params.subjectExcerpt,
    subjectSourceUrl: params.subjectSourceUrl,
    contextNote: params.contextNote,
  });

  await resolvePolicyReview(params.client, params.contractAddress, params.reviewId);
  const latestPolicy = await readPolicy(params.client, params.contractAddress, params.policyId);
  const latestState = await readPolicyReview(params.client, params.contractAddress, params.reviewId);

  const blockedByPolicy = latestState?.verdict === "non_compliant";
  const policyBoundToExecution = {
    blockedByPolicy,
    latestPolicy,
    latestState,
  };

  return policyBoundToExecution;
}
