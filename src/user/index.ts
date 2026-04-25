import type { Agent, Permission, Owner } from "../core/types";
import {fakeBlockchain} from "../core/blockchain";

/**
 * Return the list of permissions available on this website.
 */
export function getWebsitePermissions(): Permission[] {
  console.log("getWebsitePermissions");
  return ["test perm1", "test perm2", "test perm3", "test perm4", "test perm5"];
}

/**
 * Set what permissions an AI agent has, on behalf of an owner.
 */
export function setAIPermissions( //adds somethin to the blockchain
  agent: Agent,
  perms: Permission[],
  owner: Owner
): void {
  fakeBlockchain.push({ owner: owner, agent: agent, permissions: perms })
}

/**
 * Authenticate a user (login).
 */
export function userAuthenticate(user: string): void {
  console.log("userAuthenticate", { user });
}
