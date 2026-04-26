// Define standard scopes for the POC
export const SUPPORTED_SCOPES = ["READ", "PURCHASE", "BID"] as const;

export function getAvailableScopes() {
  return SUPPORTED_SCOPES;
}