import { ethers } from "ethers";
import * as dotenv from "dotenv";
import * as fs from "fs";
import ABI from "../abi.json";
import { CONTRACT_ADDRESS, FUJI_RPC } from "../constants";

dotenv.config();

async function test() {
    // 1. Setup Human Owner Wallet
    let rawKey = process.env.USER_PRIVATE_KEY || "";
    if (!rawKey) {
        console.error("❌ Error: USER_PRIVATE_KEY missing in .env");
        return;
    }
    const PRIVATE_KEY = rawKey.startsWith("0x") ? rawKey : `0x${rawKey}`;

    const provider = new ethers.JsonRpcProvider(FUJI_RPC);
    const ownerWallet = new ethers.Wallet(PRIVATE_KEY, provider);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, ownerWallet);

    try {
        console.log(`🚀 Human Owner: ${ownerWallet.address}`);

        // 2. Generate a new random AI Agent identity
        // This simulates a user clicking "Create New Agent" in your UI
        const newAgent = ethers.Wallet.createRandom(); 
        const agentData = {
            agentAddress: newAgent.address,
            agentPrivateKey: newAgent.privateKey, // AI needs this to sign requests later
            ownerAddress: ownerWallet.address,
            domain: "trademe.co.nz",
            scope: "PURCHASE",
            authorizedAt: new Date().toISOString()
        };

        console.log(`🤖 New Agent Identity: ${agentData.agentAddress}`);

        // // 3. Register Agent on Avalanche Fuji (Phase 1)
        // console.log("--- Step 1: Registering Agent ---");
        // const regTx = await contract.registerAgent(agentData.agentAddress, { 
        //     value: ethers.parseEther("0.01") 
        // });
        // await regTx.wait();
        // console.log("✅ Registration confirmed on-chain");

        // // 4. Grant Scopes to Agent (Phase 1)
        // console.log(`--- Step 2: Granting [${agentData.scope}] permission ---`);
        // const grantTx = await contract.grantPermission(
        //     agentData.agentAddress, 
        //     agentData.domain, 
        //     agentData.scope
        // );
        // await grantTx.wait();
        // console.log("✅ Permission granted on-chain");

        // // 5. Persistence: Save credentials to a local JSON file
        // // This replaces the "console log" and allows the Agent Skill to read its own identity
        // const storagePath = "./authorized_agents.json";
        // let agentsList = [];
        
        // if (fs.existsSync(storagePath)) {
        //     agentsList = JSON.parse(fs.readFileSync(storagePath, "utf8"));
        // }
        // agentsList.push(agentData);
        
        // fs.writeFileSync(storagePath, JSON.stringify(agentsList, null, 2));
        // console.log(`📂 Agent credentials saved to: ${storagePath}`);

        // // 6. Final Verification (Post-check)
        // // Ensure the blockchain actually reflects the changes we made
        // console.log("--- Step 3: Verifying Final Permission State ---");
        // const isAuthorized = await contract.hasPermission(
        //     agentData.agentAddress, 
        //     agentData.domain, 
        //     agentData.scope
        // );

        // if (isAuthorized) {
        //     console.log("🎊 SUCCESS: Blockchain verification passed!");
        //     console.log("The AI Agent is now ready to perform signed requests.");
        // } else {
        //     console.error("⚠️ WARNING: Verification failed. The state might still be syncing.");
        // }

    } catch (error: any) {
        console.error("❌ Transaction failed:", error.message);
    }
}

test();