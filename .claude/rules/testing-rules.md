---
globs: src/**/__tests__/**/*.{ts,tsx}, src/**/*.test.{ts,tsx}
---

# Testing Rules

- Tests must not hit the real database or Anthropic API. Mock Prisma and the AI provider in all unit tests.
- `VirtualFileSystem` has no side effects — test it directly without mocking.
- Place test files in a `__tests__/` subdirectory co-located with the code they test.
- Use React Testing Library for component tests. Do not use Enzyme or direct DOM manipulation.
- Test observable behavior, not implementation details — query by role/label/text, not by class names or internal state.
- Each test file should `vi.mock` at the module level, not inside individual test cases.
- Do not snapshot-test components that change frequently — prefer explicit assertions.
- Keep test descriptions in plain English: `it("shows an error when the form is submitted empty")`, not `it("test 1")`.
