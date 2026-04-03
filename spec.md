# SiteForge

## Current State
Save and publish operations fail because `createSite`, `updateSite`, and `publishSite` all check `AccessControl.hasPermission`, which internally calls `getUserRole`, which calls `Runtime.trap("User is not registered")` if the user has never called `recordLogin`. This can happen if the actor isn't fully ready when `recordLogin` fires, if there's a race condition, or if a user navigates directly to the builder without going through the normal login flow.

## Requested Changes (Diff)

### Add
- Auto-registration logic (assign `#user` role) at the start of `createSite`, `updateSite`, and `publishSite` -- identical to what `recordLogin` already does.

### Modify
- `createSite`: auto-register caller before permission check
- `updateSite`: auto-register caller before permission check
- `publishSite`: auto-register caller before permission check
- `listSite`: auto-register caller before permission check (for consistency)
- `unlistSite`: auto-register caller before permission check (for consistency)

### Remove
- Nothing removed

## Implementation Plan
1. Extract the auto-register pattern into a reusable private function `ensureUserRegistered(caller)` that adds `#user` role if not present.
2. Call `ensureUserRegistered(caller)` at the top of `createSite`, `updateSite`, `publishSite`, `listSite`, `unlistSite` before the `hasPermission` check.
