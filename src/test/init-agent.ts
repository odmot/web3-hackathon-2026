import { AgentClient } from "../agent";
import * as fs from "fs";

// src/test/init-agent.ts
async function init() {
    console.log("🚀 Initializing Multi-Agent System...");
  
    // Create Agent 1: Shopping Bot
    const bot1 = AgentClient.createIdentity("./agent_shopping.json");
    console.log(`✅ Shopping Bot: ${bot1.address}`);
  
    // Create Agent 2: Trading Bot
    const bot2 = AgentClient.createIdentity("./agent_trading.json");
    console.log(`✅ Trading Bot: ${bot2.address}`);
  
    console.log("\n---------------------------------------------------");
    console.log("Success! You now have two distinct agent identities.");
    console.log("Ian can now register them separately in the DApp.");
    console.log("---------------------------------------------------");
  }
  
  init();