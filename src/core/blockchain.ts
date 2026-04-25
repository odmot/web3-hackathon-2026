import type { Agent, Permission, Owner } from "../core/types";

interface FakeBlockchain {
  owner: Owner,
  agent: Agent,
  permissions: Permission[]
}

export const fakeBlockchain: FakeBlockchain[] = [
  { owner: "test owner1", agent: "test agent1", permissions: ["test perm1", "test perm2"] },
  { owner: "test owner2", agent: "test agent2", permissions: ["test perm2", "test perm3"] },
  { owner: "test owner3", agent: "test agent3", permissions: ["test perm3", "test perm4"] },
  { owner: "test owner4", agent: "test agent4", permissions: ["test perm4", "test perm5"] }
]
