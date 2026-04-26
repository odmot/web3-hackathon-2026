import { ethers } from "ethers";

/**
 * MODULE 2: The Gatekeeper (NPM Package logic)
 * Used by websites to verify if an incoming request is valid and authorized.
 */
export async function verifyIncomingRequest(
  contract: ethers.Contract,
  params: {
    message: string;      // The raw request payload
    signature: string;    // The signature from AI
    agentAddress: string; // The AI's public address
    domain: string;       // The website's domain
    requiredScope: string // The permission needed for this action
  }
): Promise<{ authorized: boolean; reason: string }> {
  try {
    // 1. Cryptographic Verification (Is it really this AI?)
    const recovered = ethers.verifyMessage(params.message, params.signature);
    if (recovered.toLowerCase() !== params.agentAddress.toLowerCase()) {
      return { authorized: false, reason: "Identity forged: Signature mismatch." };
    }

    // 2. Blockchain Verification (Does it have permission?)
    const hasPermission = await contract.hasPermission(
      params.agentAddress,
      params.domain,
      params.requiredScope
    );

    return {
      authorized: hasPermission,
      reason: hasPermission ? "Verified" : "Forbidden: No on-chain permission."
    };
  } catch (error: any) {
    return { authorized: false, reason: `Error: ${error.message}` };
  }
}