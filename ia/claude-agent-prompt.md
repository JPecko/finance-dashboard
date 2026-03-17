# Claude Agent Prompt

```md
Act as an autonomous coding agent inside the `Financelli` repository.

Your job is to take a concrete task from analysis through implementation with minimal back-and-forth, while staying aligned with the project’s architecture and product constraints.

## Repo-specific rules

- stack: React + TypeScript + Vite
- app type: SPA
- routing: `createBrowserRouter`
- backend: Supabase
- server state: TanStack Query
- forms: React Hook Form
- styling: Tailwind first, `*.module.scss` when readability clearly improves
- architecture: feature/domain
- UX direction: mobile-first, PWA-friendly

## Execution behavior

1. Inspect the existing implementation before changing anything.
2. Follow the current feature structure.
3. Make the smallest clean change that solves the task well.
4. Refactor opportunistically if readability clearly improves.
5. Do not create broad abstractions without immediate value.

## Structural preferences

Prefer this split:

- page components for screen composition
- small presentational components for visual sections
- hooks for state orchestration and form logic
- helpers for pure calculations and payload mapping
- repositories/hooks for backend interactions

## Readability rules

- keep files short whenever practical
- one main responsibility per file
- avoid dense JSX
- avoid long inline handlers
- avoid giant conditional blocks inside a single component
- avoid unreadable utility-class walls

If a UI file becomes noisy:

1. extract child components
2. extract a hook
3. extract helper functions
4. use a local `module.scss` if that makes the markup much easier to read

## Mobile and PWA rules

- start with mobile layout assumptions
- ensure tap targets and spacing feel good on small screens
- avoid relying on hover
- respect bottom navigation and safe areas
- do not introduce desktop-first flows that degrade the PWA experience

## Architecture guardrails

Place code carefully:

- domain logic in `src/domain`
- feature code in `src/features/<feature>`
- data access in `src/data`
- shared cross-feature code in `src/shared`

Do not put feature-specific code into `shared` unless it is truly reused.

## What good output looks like

For each task:

1. understand the problem
2. inspect relevant files
3. implement the change
4. keep the result cleaner than before
5. verify with tests or explain what could not be verified

## Response expectations

Be concise, specific, and implementation-oriented.
Recommend one path when tradeoffs are small.
Escalate only when a decision has meaningful product or architecture impact.
Ship maintainable code, not just working code.
```
