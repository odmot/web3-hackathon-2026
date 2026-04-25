# Project Specification: Agent-Gateway Protocol

**Project Goal:** To create a decentralized Machine-to-Machine (M2M) identity and authorization protocol. It enables websites to safely accept AI-driven traffic by replacing traditional CAPTCHAs and API keys with blockchain-backed cryptographic signatures and programmable on-chain permissions.

**Meta-Theme Alignment ("The Great Handover"):** Transforming the internet from a "Human-Only Zone" to an environment where AI Agents can seamlessly navigate, interact, and transact without visual interfaces, while remaining strictly under human control.

---

### 1. Core Components

The architecture is highly decoupled, ensuring security, scalability, and ease of integration.

#### A. Smart Contract (The Policy & Trust Engine)
* **Location:** Deployed on the Avalanche C-Chain (e.g., Fuji Testnet).
* **Role:** Acts as the decentralized registry and permission database.
* **Data Stored:** 1. A list of "Verified AI Public Addresses" backed by a tiny financial deposit (Economic Friction).
    2. **Permission Scopes:** A mapping of `(Human User) -> (Agent Address) -> (Website Domain) -> (Authorized Scopes)` ensuring that an AI can only perform actions explicitly granted by its owner.

#### B. NPM Package (The Gatekeeper Middleware)
* **Location:** Installed on the backend servers of participating websites (e.g., Next.js, Express).
* **Role:** Intercepts incoming HTTP requests to verify the identity and specific permissions of the sender.
* **Functions:** - Validates the cryptographic signature in the header.
    - Queries the Avalanche C-Chain to check if the AI has the specific "Scope" (e.g., `PURCHASE`) for the current domain.

#### C. End-User (The Human Delegator)
* **Role:** The human owner who controls the AI. 
* **Responsibilities:** Registers the AI on-chain and signs "Delegation" transactions to grant the AI specific permissions for chosen websites (e.g., "I allow my AI to buy things on TradeMe but only read items on Amazon").

#### D. AI Agent (The Client Executor)
* **Role:** The automated program performing digital chores.
* **Responsibilities:** Holds its own Private Key locally. It signs every HTTP request with its digital signature to prove its identity without revealing its key.

#### E. The Website (The Service Provider)
* **Role:** Platforms (e.g., TradeMe, Amazon) that want to serve AI customers.
* **Responsibilities:** Defines available scopes (READ, CART, PURCHASE) and uses the NPM Package to route verified agents to machine-friendly JSON endpoints.

---

### 2. Business Logic & Workflow

#### Phase 1: Setup and Delegation
1. **Registration:** The Human User registers their AI on the Avalanche Smart Contract by paying a small anti-spam deposit.
2. **Permission Grant:** The Human User selects permissions from a website's "menu" and signs an on-chain transaction to delegate those specific scopes to their AI.

#### Phase 2: Signed Request
1. **Signature:** When the AI needs to act (e.g., `PURCHASE`), it signs the request payload using its Private Key.
2. **Transmission:** The AI sends the HTTP request with the signature and its public address in the headers.

#### Phase 3: Verification & Execution
1. **Intercept:** The NPM Package catches the request.
2. **Math Check:** It verifies the signature proves the AI owns its address.
3. **On-Chain Policy Check:** It queries the Avalanche Smart Contract: *"Did the owner of this AI grant it 'PURCHASE' permission for this website domain?"*
4. **Result:** If authorized, the website serves JSON. If unauthorized (AI hallucination or malice), the request is blocked.

---

### 3. Evaluation Defense (Why this Architecture Wins)

* **Zero Trust & Security:** Neither the website nor the blockchain ever sees the AI's Private Key. Permissions are strictly limited by the human owner via the "Principle of Least Privilege."
* **Economic Defense:** Using Avalanche C-Chain ensures that spamming or creating fake bots is financially expensive, solving the bot problem that CAPTCHAs struggle with.
* **Global Interoperability:** By using a single smart contract on the C-Chain, an AI can use one "passport" to interact with any website that has installed the NPM Package.
