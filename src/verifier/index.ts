import { ethers } from "ethers";

/**
 * MODULE 2: The Gatekeeper (NPM Package logic)
 * Optimized to handle the Agent Gateway Standard Protocol Format.
 */
export async function verifyIncomingRequest(
  contract: ethers.Contract,
  requestBody: {
    protocol: string;
    domain: string;
    auth: {
      agentAddress: string;
      signature: string;
      message: string;
    };
    payload: any;
  },
  requiredScope: string
): Promise<{ authorized: boolean; reason: string }> {
  try {
    const { auth, domain, protocol } = requestBody;

    // 0. Protocol Version Check (Optional but good for future-proofing)
    if (protocol !== "Agent-Gateway-v1") {
      return { authorized: false, reason: "Unsupported protocol version." };
    }

    // 1. Cryptographic Verification
    // Recover the address from the signature and the raw message
    const recovered = ethers.verifyMessage(auth.message, auth.signature);
    
    if (recovered.toLowerCase() !== auth.agentAddress.toLowerCase()) {
      return { authorized: false, reason: "Identity forged: Signature mismatch." };
    }

    // 2. Domain Consistency Check
    // Ensure the AI isn't using a signature meant for another site
    if (domain !== requestBody.domain) {
        return { authorized: false, reason: "Domain mismatch." };
    }

    // 3. Blockchain Verification (Smart Contract Call)
    // Checking: Does this agent have 'requiredScope' on 'domain'?
    const hasPermission = await contract.hasPermission(
      auth.agentAddress,
      domain,
      requiredScope
    );

    return {
      authorized: hasPermission,
      reason: hasPermission ? "Verified" : `Forbidden: Agent lacks ${requiredScope} permission on ${domain}.`
    };
  } catch (error: any) {
    return { authorized: false, reason: `Verification Error: ${error.message}` };
  }
}