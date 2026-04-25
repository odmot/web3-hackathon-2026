// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title  AgentGateway
 * @notice Decentralized identity & permission registry for AI agents.
 *         Implements the Agent-Gateway Protocol v1 — deployed on Avalanche C-Chain.
 *
 * Permission model: Owner → Agent → Domain → Scope[]
 *
 * Workflow:
 *   1. Human owner registers their AI agent (pays anti-spam deposit).
 *   2. Owner grants scopes per domain (e.g. "trademe.co.nz" → ["READ","PURCHASE"]).
 *   3. NPM middleware calls hasPermission() on every incoming AI request.
 *   4. Owner can revoke scopes or fully deregister the agent to reclaim deposit.
 */
contract AgentGateway {
    // ── Constants ─────────────────────────────────────────────────────────────

    /// @notice Minimum deposit required to register an agent (anti-spam / economic friction).
    uint256 public constant REGISTRATION_DEPOSIT = 0.01 ether; // 0.01 AVAX

    /// @notice Max number of distinct domains an agent can hold permissions for.
    uint256 public constant MAX_DOMAINS = 50;

    /// @notice Max number of scopes per (agent, domain) pair.
    uint256 public constant MAX_SCOPES_PER_DOMAIN = 20;

    // ── Core State ────────────────────────────────────────────────────────────

    /// @notice Maps agent address → owner address.
    mapping(address => address) public agentOwner;

    /// @notice Maps agent address → deposited amount (refunded on deregister).
    mapping(address => uint256) public agentDeposit;

    /// @notice Maps agent address → registration timestamp.
    mapping(address => uint256) public registeredAt;

    // ── Permission State ──────────────────────────────────────────────────────

    /// @dev Flat boolean map used for O(1) permission checks.
    ///      agent → domain → scope → bool
    mapping(address => mapping(string => mapping(string => bool))) public allowedScopes;

    /// @dev Enumerable scope list per (agent, domain) — used by getScopesForDomain().
    mapping(address => mapping(string => string[])) private _scopeList;

    /// @dev Tracks whether a scope already exists in _scopeList to avoid duplicates.
    mapping(address => mapping(string => mapping(string => bool))) private _scopeIndexed;

    /// @dev Enumerable domain list per agent — used by getDomainsForAgent().
    mapping(address => string[]) private _agentDomains;

    /// @dev Tracks whether a domain already exists in _agentDomains to avoid duplicates.
    mapping(address => mapping(string => bool)) private _domainExists;

    // ── Events ────────────────────────────────────────────────────────────────

    event AgentRegistered(address indexed agent, address indexed owner, uint256 deposit);
    event AgentDeregistered(address indexed agent, address indexed owner, uint256 refund);
    event PermissionGranted(address indexed agent, string domain, string scope);
    event PermissionRevoked(address indexed agent, string domain, string scope);

    // ── Errors ────────────────────────────────────────────────────────────────

    error ZeroAddress();
    error AlreadyRegistered();
    error NotRegistered();
    error NotAgentOwner();
    error InsufficientDeposit();
    error EmptyScopeArray();
    error RefundFailed();
    error LimitExceeded();

    // ── Modifiers ─────────────────────────────────────────────────────────────

    modifier onlyAgentOwner(address agent) {
        if (agentOwner[agent] == address(0)) revert NotRegistered();
        if (agentOwner[agent] != msg.sender) revert NotAgentOwner();
        _;
    }

    // ── Registration ──────────────────────────────────────────────────────────

    /**
     * @notice Register an AI agent on-chain with a small anti-spam deposit.
     * @param agent The public address of the AI agent (must not be zero).
     */
    function registerAgent(address agent) external payable {
        if (agent == address(0)) revert ZeroAddress();
        if (agentOwner[agent] != address(0)) revert AlreadyRegistered();
        if (msg.value < REGISTRATION_DEPOSIT) revert InsufficientDeposit();

        agentOwner[agent] = msg.sender;
        agentDeposit[agent] = msg.value;
        registeredAt[agent] = block.timestamp;

        emit AgentRegistered(agent, msg.sender, msg.value);
    }

    /**
     * @notice Deregister an agent and refund the deposit to the original owner.
     *         Clears all permissions and domain enumerations for this agent.
     * @param agent The agent address to deregister.
     */
    function deregisterAgent(address agent) external onlyAgentOwner(agent) {
        uint256 refund = agentDeposit[agent];
        address owner = agentOwner[agent];

        // Clear all scope/domain state for this agent.
        // We only clear the boolean maps here; the arrays stay in memory but
        // the agent slot is invalidated so they become unreachable.
        string[] storage domains = _agentDomains[agent];
        for (uint256 i = 0; i < domains.length; i++) {
            string[] storage scopes = _scopeList[agent][domains[i]];
            for (uint256 j = 0; j < scopes.length; j++) {
                allowedScopes[agent][domains[i]][scopes[j]] = false;
                _scopeIndexed[agent][domains[i]][scopes[j]] = false;
            }
            delete _scopeList[agent][domains[i]];
            _domainExists[agent][domains[i]] = false;
        }
        delete _agentDomains[agent];

        // Clear registration state
        delete agentOwner[agent];
        delete agentDeposit[agent];
        delete registeredAt[agent];

        emit AgentDeregistered(agent, owner, refund);

        // Refund last (checks-effects-interactions)
        if (refund > 0) {
            (bool ok, ) = owner.call{value: refund}("");
            if (!ok) revert RefundFailed();
        }
    }

    // ── Permission Management ─────────────────────────────────────────────────

    /**
     * @notice Grant a single permission scope to an agent for a specific domain.
     * @param agent  The agent's public address.
     * @param domain Website domain (e.g. "trademe.co.nz").
     * @param scope  Permission scope (e.g. "READ", "PURCHASE").
     */
    function grantPermission(
        address agent,
        string calldata domain,
        string calldata scope
    ) external onlyAgentOwner(agent) {
        _grantSingle(agent, domain, scope);
    }

    /**
     * @notice Grant multiple scopes to an agent for a domain in one transaction.
     * @param agent  The agent's public address.
     * @param domain Website domain.
     * @param scopes Array of permission scopes to grant.
     */
    function batchGrantPermissions(
        address agent,
        string calldata domain,
        string[] calldata scopes
    ) external onlyAgentOwner(agent) {
        if (scopes.length == 0) revert EmptyScopeArray();
        for (uint256 i = 0; i < scopes.length; i++) {
            _grantSingle(agent, domain, scopes[i]);
        }
    }

    /**
     * @notice Revoke a single permission scope from an agent for a domain.
     */
    function revokePermission(
        address agent,
        string calldata domain,
        string calldata scope
    ) external onlyAgentOwner(agent) {
        _revokeSingle(agent, domain, scope);
    }

    /**
     * @notice Revoke multiple scopes from an agent for a domain in one transaction.
     */
    function batchRevokePermissions(
        address agent,
        string calldata domain,
        string[] calldata scopes
    ) external onlyAgentOwner(agent) {
        if (scopes.length == 0) revert EmptyScopeArray();
        for (uint256 i = 0; i < scopes.length; i++) {
            _revokeSingle(agent, domain, scopes[i]);
        }
    }

    // ── View Functions ────────────────────────────────────────────────────────

    /**
     * @notice Check whether an agent has a given scope on a domain.
     * @return True if permitted.
     */
    function hasPermission(
        address agent,
        string calldata domain,
        string calldata scope
    ) external view returns (bool) {
        return allowedScopes[agent][domain][scope];
    }

    /**
     * @notice Return all active scopes an agent has for a given domain.
     *         Used by the NPM middleware to get the full permission set at once.
     */
    function getScopesForDomain(
        address agent,
        string calldata domain
    ) external view returns (string[] memory) {
        return _scopeList[agent][domain];
    }

    /**
     * @notice Return all domains an agent has at least one scope for.
     *         Useful for UI dashboards.
     */
    function getDomainsForAgent(address agent) external view returns (string[] memory) {
        return _agentDomains[agent];
    }

    // ── Internal Helpers ──────────────────────────────────────────────────────

    function _grantSingle(
        address agent,
        string calldata domain,
        string calldata scope
    ) internal {
        if (!allowedScopes[agent][domain][scope]) {
            allowedScopes[agent][domain][scope] = true;

            // Track scope in enumerable list (no duplicates)
            if (!_scopeIndexed[agent][domain][scope]) {
                if (_scopeList[agent][domain].length >= MAX_SCOPES_PER_DOMAIN) revert LimitExceeded();
                _scopeList[agent][domain].push(scope);
                _scopeIndexed[agent][domain][scope] = true;
            }

            // Track domain in enumerable list (no duplicates)
            if (!_domainExists[agent][domain]) {
                if (_agentDomains[agent].length >= MAX_DOMAINS) revert LimitExceeded();
                _agentDomains[agent].push(domain);
                _domainExists[agent][domain] = true;
            }

            emit PermissionGranted(agent, domain, scope);
        }
    }

    function _revokeSingle(
        address agent,
        string calldata domain,
        string calldata scope
    ) internal {
        if (allowedScopes[agent][domain][scope]) {
            allowedScopes[agent][domain][scope] = false;

            // Swap-and-pop from _scopeList
            string[] storage scopes = _scopeList[agent][domain];
            uint256 len = scopes.length;
            for (uint256 i = 0; i < len; i++) {
                if (keccak256(bytes(scopes[i])) == keccak256(bytes(scope))) {
                    scopes[i] = scopes[len - 1];
                    scopes.pop();
                    break;
                }
            }
            _scopeIndexed[agent][domain][scope] = false;

            emit PermissionRevoked(agent, domain, scope);
        }
    }
}
