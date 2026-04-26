import { ethers } from "ethers";
import * as fs from "fs";
import axios from "axios";

export class AgentClient {
  /**
   * NEW: Skill Discovery
   * AI 调用此方法去“查阅”目标网站目前需要哪些权限。
   * 这模拟了 AI 发现网站最新“权限清单”的过程。
   */
  static async getSiteRequirements(domain: string) {
    console.log(`🔍 AI is fetching permission manifest for: ${domain}`);
    try {
      // 在实际黑客松中，这里可以请求 Joshua 的一个公开端点，或者直接查询智能合约
      // 演示时，我们假设网站有一个 /.well-known/ai-permissions.json
      const response = await axios.get(`http://localhost:3001/manifest?domain=${domain}`);
      return response.data; // 返回格式示例: { requiredScopes: ["READ", "PURCHASE"], contractAddress: "0x..." }
    } catch (error) {
      // 如果网站还没对接，返回默认值
      return {
        domain,
        requiredScopes: ["BASIC_ACCESS"],
        message: "Standard protocol access required."
      };
    }
  }

  /** Generate identity and save to local JSON */
  static createIdentity(customPath?: string) {
    const wallet = ethers.Wallet.createRandom();
    const data = { 
      address: wallet.address, 
      privateKey: wallet.privateKey,
      metadata: {
        created_at: new Date().toISOString(),
        network: "Avalanche Fuji"
      }
    };
    const fileName = customPath || `./agent_key.json`;
    fs.writeFileSync(fileName, JSON.stringify(data, null, 2));
    return { ...data, fileName };
  }

  /** Sign a message proving intent and the targeted domain */
  static async signRequest(privateKey: string, intent: string, domain: string) {
    const wallet = new ethers.Wallet(privateKey);
    // 标准化消息格式，包含域名防止“重放攻击”
    const message = `Intent: ${intent} | Domain: ${domain} | Timestamp: ${Date.now()}`;
    const signature = await wallet.signMessage(message);
    return { message, signature };
  }
}