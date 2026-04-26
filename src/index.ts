// 1. Management Tools (for Ian's DApp)
export { OwnerClient } from "./user/index";

// 2. AI Tools (for Your Agent Script)
export { AgentClient } from "./agent/index";

// 3. Verification Tools (for Joshua's Mock Website)
export { verifyIncomingRequest } from "./verifier/index";

// 4. Configuration & Constants
export { SUPPORTED_SCOPES, getAvailableScopes } from "./website/index";

// 5. Shared Types (from your existing types file)
export type { Agent, Permission, Owner } from "./core/types";