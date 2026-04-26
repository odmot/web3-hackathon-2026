import { ethers } from "ethers";

/**
 * MODULE 1: DApp - Owner Management Tools
 * Used by the human owner to interact with the contract.
 */
export class OwnerClient {
  // The contract instance should be connected to a Signer (User's Wallet)
  constructor(private contract: ethers.Contract) {}

  /** * Register a new agent on Avalanche (requires 0.01 AVAX deposit) 
   */
  async registerAgent(agentAddress: string) {
    const tx = await this.contract.registerAgent(agentAddress, { 
      value: ethers.parseEther("0.01") 
    });
    return await tx.wait();
  }

  /** * Grant specific domain/scope permissions to an agent 
   */
  async grantPermission(agentAddress: string, domain: string, scope: string) {
    const tx = await this.contract.grantPermission(agentAddress, domain, scope);
    return await tx.wait();
  }

  /** * Deregister an agent: Revokes all permissions and gets the 0.01 AVAX deposit back.
   * This is the "Retirement" phase of the AI Agent.
   */
  async deregisterAgent(agentAddress: string) {
    const tx = await this.contract.deregisterAgent(agentAddress);
    return await tx.wait();
  }
}