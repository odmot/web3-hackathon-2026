import type { Agent, Permission } from "../core/types";
import {fakeBlockchain} from "../core/blockchain";

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
    if (entry.permissions.includes(perm) && entry.agent == agent) {
      return true;
    }
  } return false;
} 
