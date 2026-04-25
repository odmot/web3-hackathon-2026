import type { Agent, Permission, Owner } from "../core/types";

/**
 * Return the list of permissions available on this website.
 */
export function getWebsitePermissions(): Permission[] {
  console.log("getWebsitePermissions");
  return [];
}

/**
 * Set what permissions an AI agent has, on behalf of an owner.
 */
export function setAIPermissions(
  agent: Agent,
  perm: Permission,
  owner: Owner
): void {
  console.log("setAIPermissions", { agent, perm, owner });
}

/**
 * Authenticate a user (login).
 */
export function userAuthenticate(user: string): void {
  console.log("userAuthenticate", { user });
}
