// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract AgentGateway {
    // ── Storage ──────────────────────────────────────────────────────────────

    // Minimum deposit required to register an agent (anti-spam)
    uint256 public constant REGISTRATION_DEPOSIT = 0.01 ether; // 0.01 AVAX

    // Tracks which address registered each agent (agent → owner)
    mapping(address => address) public agentOwner;

    // Flat permission mapping: agent → domain → scope → bool
    mapping(address => mapping(string => mapping(string => bool))) public allowedScopes;

    // ── Events ────────────────────────────────────────────────────────────────

    event AgentRegistered(address indexed agent, address indexed owner);
    event PermissionGranted(address indexed agent, string domain, string scope);
    event PermissionRevoked(address indexed agent, string domain, string scope);

    // ── Errors ────────────────────────────────────────────────────────────────

    error AlreadyRegistered();
    error NotRegistered();
    error NotAgentOwner();
    error InsufficientDeposit();

    // ── Functions ─────────────────────────────────────────────────────────────

    /**
     * @notice Register an AI agent on-chain with a small anti-spam deposit.
     * @param agent The public address of the AI agent to register.
     */
    function registerAgent(address agent) external payable {
        if (agentOwner[agent] != address(0)) revert AlreadyRegistered();
        if (msg.value < REGISTRATION_DEPOSIT) revert InsufficientDeposit();

        agentOwner[agent] = msg.sender;
        emit AgentRegistered(agent, msg.sender);
    }

    /**
     * @notice Grant a permission scope to an agent for a specific domain.
     *         Only the agent's registered owner can call this.
     * @param agent  The agent's public address.
     * @param domain The website domain (e.g. "trademe.co.nz").
     * @param scope  The permission scope (e.g. "READ", "PURCHASE").
     */
    function grantPermission(
        address agent,
        string calldata domain,
        string calldata scope
    ) external {
        if (agentOwner[agent] == address(0)) revert NotRegistered();
        if (agentOwner[agent] != msg.sender) revert NotAgentOwner();

        allowedScopes[agent][domain][scope] = true;
        emit PermissionGranted(agent, domain, scope);
    }

    /**
     * @notice Revoke a permission scope from an agent for a specific domain.
     *         Only the agent's registered owner can call this.
     */
    function revokePermission(
        address agent,
        string calldata domain,
        string calldata scope
    ) external {
        if (agentOwner[agent] != msg.sender) revert NotAgentOwner();

        allowedScopes[agent][domain][scope] = false;
        emit PermissionRevoked(agent, domain, scope);
    }

    /**
     * @notice Check whether an agent has a given scope on a domain.
     * @return bool True if permitted.
     */
    function hasPermission(
        address agent,
        string calldata domain,
        string calldata scope
    ) external view returns (bool) {
        return allowedScopes[agent][domain][scope];
    }
}
