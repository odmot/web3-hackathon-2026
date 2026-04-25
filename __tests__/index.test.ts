import {
  agentAuthenticate,
  checkAgentPermission,
  getWebsitePermissions,
  setAIPermissions,
  userAuthenticate,
} from "../src/index.js";

describe("agent", () => {
  it("agentAuthenticate runs without throwing", () => {
    expect(() => agentAuthenticate("agent-001")).not.toThrow();
  });

  it("checkAgentPermission runs without throwing", () => {
    expect(() => checkAgentPermission("agent-001", "read:data")).not.toThrow();
  });

  it("checkAgentPermission test owner 1 has test perm2", () => {
    expect(checkAgentPermission("test agent1", "test perm2")).toBeTruthy();
  });

  it("checkAgentPermission test owner 1 doesn't have test perm3", () => {
    expect(checkAgentPermission("test agent1", "test perm3")).toBeFalsy();
  });
});

describe("user", () => {
  it("getWebsitePermissions returns an array", () => {
    expect(Array.isArray(getWebsitePermissions())).toBe(true);
  });

  it("setAIPermissions runs without throwing", () => {
    expect(() =>
      setAIPermissions("agent-001", "read:data", "owner-001")
    ).not.toThrow();
  });

  it("userAuthenticate runs without throwing", () => {
    expect(() => userAuthenticate("alice")).not.toThrow();
  });
});
