import type { Agent, Permission } from "../core/types.js";

/**
 * Authenticate an AI agent against the blockchain.
 */
export function agentAuthenticate(agent: Agent): void {
  console.log("agentAuthenticate", { agent });
}

/**
 * Check if the authenticated AI agent has a given permission.
 */
export function checkAgentPermission(perm: Permission): void {
  console.log("checkAgentPermission", { perm });
}
