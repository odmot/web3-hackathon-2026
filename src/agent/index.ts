import type { Agent, Permission } from "../core/types.js";
import {fakeBlockchain} from "../core/blockchain.js";

/**
 * Authenticate an AI agent against the blockchain.
 */
export function agentAuthenticate(agent: Agent): boolean {
  for (var entry of fakeBlockchain) {
    if (entry.agent == agent) {
      return true;
    }
  } return false;
}

/**
 * Check if the authenticated AI agent has a given permission.
 */
export function checkAgentPermission(agent: Agent, perm: Permission): boolean {
  for (var entry of fakeBlockchain) {
    if (perm in entry.permissions && entry.agent == agent) {
      return true;
    }
  } return false;
} 
