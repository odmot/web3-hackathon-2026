import { ethers } from "ethers";
import * as dotenv from "dotenv";
import ABI from "../abi.json";
import { CONTRACT_ADDRESS, FUJI_RPC } from "../constants";

// Load environment variables from .env file
dotenv.config();

async function test() {
    // 1. Handle Private Key: Ensure 0x prefix and check if exists
    let rawKey = process.env.USER_PRIVATE_KEY || "";
    if (!rawKey) {
        console.error("❌ Error: USER_PRIVATE_KEY is not defined in .env");
        return;
    }
    const PRIVATE_KEY = rawKey.startsWith("0x") ? rawKey : `0x${rawKey}`;

    // 2. Initialize Environment (Using values from constants.ts)
    const provider = new ethers.JsonRpcProvider(FUJI_RPC);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, wallet);

    try {
        console.log(`🚀 Testing with address: ${wallet.address}`);
        
        // --- Step 1: Check Permission (Read Call) ---
        console.log("1. Checking Agent permission...");
        const agentAddr = "0x1234567890123456789012345678901234567890";
        const domain = "trademe.co.nz";
        const scope = "READ";

        const hasPerm = await contract.hasPermission(agentAddr, domain, scope);
        console.log(`✅ Query successful! Permission status:`, hasPerm);

        // --- Step 2: Register Agent (Write Transaction) ---
        // We check the owner first to avoid "AlreadyRegistered" error
        const currentOwner = await contract.agentOwner(agentAddr);
        
        if (currentOwner === ethers.ZeroAddress) {
            console.log("2. Attempting to register Agent (paying 0.01 AVAX)...");
            const regTx = await contract.registerAgent(agentAddr, { 
                value: ethers.parseEther("0.01") 
            });
            console.log("⏳ Registration transaction sent, waiting for confirmation...");
            await regTx.wait();
            console.log("✅ Agent registered successfully!");
        } else {
            console.log("ℹ️ Agent is already registered. Owner:", currentOwner);
        }

        // --- Step 3: Grant Permission (Write Transaction) ---
        console.log("3. Granting permission...");
        const grantTx = await contract.grantPermission(agentAddr, domain, scope);
        console.log("⏳ Grant transaction sent, waiting for confirmation...");
        await grantTx.wait();
        console.log("✅ Permission granted successfully!");

        // --- Final Verification ---
        const finalCheck = await contract.hasPermission(agentAddr, domain, scope);
        console.log("🔗 Final on-chain status check:", finalCheck);

    } catch (error: any) {
        // Specific error handling for UX
        if (error.message.includes("insufficient funds")) {
            console.error("❌ Failed: Your wallet does not have enough Fuji AVAX for gas/deposit.");
        } else if (error.message.includes("AlreadyRegistered")) {
            console.error("❌ Failed: This agent is already registered in the system.");
        } else if (error.message.includes("NotAgentOwner")) {
            console.error("❌ Failed: Only the agent owner can grant permissions.");
        } else {
            console.error("❌ Operation failed:", error.message);
        }
    }
}

test();