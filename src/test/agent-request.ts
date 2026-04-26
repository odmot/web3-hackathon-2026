import { AgentClient } from "../src/agent";
import * as fs from "fs";
import axios from "axios";

async function sendRequest() {
  try {
    // 1. Read the AI's identity from the local JSON file
    if (!fs.existsSync("./agent_key.json")) {
      console.error("❌ Error: agent_key.json not found. Please run 'npm run gen' first.");
      return;
    }
    
    const rawData = fs.readFileSync("./agent_key.json", "utf8");
    const { address, privateKey } = JSON.parse(rawData);

    console.log(`🚀 Agent Initiated: ${address}`);

    // 2. Prepare the action payload (The "Skill" intent)
    const message = `Action: PURCHASE | Item: #123 | Timestamp: ${Date.now()}`;
    
    // 3. Generate a cryptographic signature using the private key
    console.log("✍️  AI is signing the request to prove authenticity...");
    const signature = await AgentClient.signRequest(privatteKey, message);

    // 4. Send the signed request to the Mock Website (Joshua's server)
    console.log("📡 Sending authorized request to Mock Website...");
    
    const response = await axios.post("http://localhost:3001/buy", {
      message,
      signature,
      agentAddress: address,
      domain: "hackathon-shop.ai" // Ensure this matches Ian's Grant in the DApp
    });

    console.log("---------------------------------------------------");
    console.log("🎉 Website Response Success!");
    console.log("Status:", response.data.status);
    console.log("Server Message:", response.data.detail);
    console.log("---------------------------------------------------");

  } catch (error: any) {
    console.log("---------------------------------------------------");
    console.error("❌ Request Failed!");
    
    if (error.response) {
      // The server responded with a status code outside the 2xx range
      console.error("Reason:", error.response.data.reason || "Unauthorized");
    } else {
      console.error("Error:", error.message);
    }
    console.log("---------------------------------------------------");
  }
}

sendRequest();