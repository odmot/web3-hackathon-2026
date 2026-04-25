# uoaweb3-2026-team5

Blockchain-based AI agent authentication and permission management library.

## Install

```bash
npm install uoaweb3-2026-team5
```

## Run Contrast Test

```bash
npm run test-contract  
```

## API

### Agent Library

```ts
import { agentAuthenticate, checkAgentPermission } from "uoaweb3-2026-team5";

agentAuthenticate("agent-id");
checkAgentPermission("read:data");
```

### User Library

```ts
import {
  getWebsitePermissions,
  setAIPermissions,
  userAuthenticate,
} from "uoaweb3-2026-team5";

userAuthenticate("alice");
const perms = getWebsitePermissions();
setAIPermissions("agent-id", "read:data", "owner-id");
```

## Development

```bash
npm install
npm run build
npm test
```
