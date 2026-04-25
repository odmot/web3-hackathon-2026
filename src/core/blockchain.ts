import type { Agent, Permission, Owner } from "../core/types.js";

export const fakeBlockchain: { owner: Owner, agent: Agent, permissions: Permission[] } = {
  owner: "test owner",
  agent: "test agent",
  permissions: ["test perm1", "test perm2"]
}
