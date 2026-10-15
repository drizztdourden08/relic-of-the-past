<!-- @layer docs @kind doc -->
# Code notes: apps/kill-switch

Facts about `apps/kill-switch/` that the code cannot say on its own. Each heading names a file or folder by its path from the repository root.

## apps/kill-switch/src/index.ts

The billing account is unlinked from the project the function runs in, read at runtime, so one build serves every project it is deployed to.
