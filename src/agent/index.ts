import type { Agent, Permission } from "../core/types.js";
import {fakeBlockchain} from "../core/blockchain.js";

/**
 * Authenticate an AI agent against the blockchain.
 */
export function agentAuthenticate(agent: Agent): boolean {
  if (agent == fakeBlockchain.agent) {
    return true;
  } return false;
  //console.log("agentAuthenticate", { agent });
}

/**
 * Check if the authenticated AI agent has a given permission.
 */
export function checkAgentPermission(agent: Agent, perm: Permission): boolean {
  if (perm in fakeBlockchain.permissions && agent == fakeBlockchain.agent) {
    return true;
  } return false;

  //console.log("checkAgentPermission", { agent, perm });
}
