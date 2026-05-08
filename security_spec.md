# UniVideo AI Security Specification

## Data Invariants
1. A Task must belong to a valid User.
2. A Task must have a status from the predefined enum.
3. Users can only read/write their own profiles, projects, and tasks.
4. Admins can view and manage all task metrics but cannot modify user private PII unless specified.
5. `finalCost` and `status` terminal transitions (success/failed) can only be set by the system (simulated as admin logic here or restricted update fields).

## The Dirty Dozen Payloads

1. **Identity Spoofing**: Attempt to create a task with another user's `userId`.
2. **State Shortcut**: Attempt to create a task with status `success` directly.
3. **Ghost Field**: Attempt to add `isAdmin: true` to a user profile update.
4. **ID Poisoning**: Use a 2KB string as a `projectId`.
5. **PII Leak**: Authenticated user attempts to read another user's private profile.
6. **Negative Cost**: Attempt to set `estimatedCost: -100`.
7. **Orphaned Task**: Create a task with a `projectId` that doesn't exist.
8. **Malicious Progress**: Set `progress: 9999`.
9. **Terminal Edit**: Change the `prompt` of a task that is already in `success` status.
10. **Resource Exhaustion**: Send a 1MB string as a `prompt`.
11. **Admin Privilege Escalation**: Update own user role to `admin`.
12. **Timestamp Fraud**: Provide a manual `createdAt` date from 2000-01-01.

## Test Runner (Conceptual)
The following rules will block these payloads using:
- `isValidId()` for path and field IDs.
- `isValidTask()`, `isValidUser()`, etc. for schema validation.
- `affectedKeys().hasOnly()` for state-specific updates.
- `get()` checks for relational existence.
