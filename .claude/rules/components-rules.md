---
globs: src/components/**/*.tsx
---

# Component Rules

- Use **named exports** for all components. Default exports are only for Next.js page files.
- `"use client"` must be the very first line of any client component — before imports. Omit it entirely for server components.
- Never fetch data or access the database inside a client component. Data fetching belongs in server components (`page.tsx`) or server actions (`src/actions/`).
- Use the `@/` path alias for all internal imports.
- UI primitives in `src/components/ui/` are shadcn/ui generated files — do not hand-edit them. Add new primitives using the shadcn CLI pattern.
- Props interfaces should be defined inline above the component, not in a separate types file, unless shared across multiple components.
- Use Tailwind utility classes for all styling. Avoid inline `style` props.
- Co-locate tests in a `__tests__/` subdirectory next to the component file.
