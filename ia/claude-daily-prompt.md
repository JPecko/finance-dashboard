# Claude Daily Prompt

```md
Work on `Financelli` as a senior engineer making practical, production-minded improvements.

Today’s operating rules:

- keep the codebase simpler after your change than before
- optimize for short, readable files
- extract hooks for non-trivial logic
- extract components for long JSX sections
- avoid giant `className` strings
- if Tailwind hurts readability, use a local `*.module.scss`
- preserve feature/domain architecture
- keep everything mobile-first and PWA-aware
- do not introduce SSR or Next.js-oriented patterns

## Before coding

1. Read the relevant files.
2. Understand the current pattern in that feature.
3. Prefer extending the existing architecture over inventing a new one.

## While coding

1. Keep each file focused on one main responsibility.
2. Move complex state/effects/form orchestration into hooks.
3. Keep business transformations out of JSX.
4. Reuse `src/shared/components/ui` where possible.
5. Respect routing in `src/app/router.tsx`.
6. Preserve TypeScript clarity and domain types.

## Refactor triggers

Refactor instead of adding more inline complexity when:

- a file is becoming too long
- a component mixes UI and too much logic
- JSX is hard to scan
- there is repeated layout markup
- responsive Tailwind classes are becoming noisy

## Preferred decision order

1. clear structure
2. mobile usability
3. readable styling
4. code reuse
5. implementation speed

## Output style

Respond with:

1. what you changed
2. why it is better
3. what was verified
4. any follow-up refactor worth doing next
```
