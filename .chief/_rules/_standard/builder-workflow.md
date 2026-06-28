# Builder Workflow Rules

## After Each Task Implementation

1. Run `pnpm format && pnpm lint && pnpm test` — ALL must pass before committing.
2. If any step fails, fix the issues before proceeding.

## Commit Style

Follow Conventional Commits: `feat(scope): description`, `fix(scope): description`, etc.
