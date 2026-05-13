Your goal is to find and fix vulnerable npm packages without breaking the project.

## Steps

1. Run `npm audit` and report a summary of vulnerabilities found (severity, package name, and fix availability).

2. If there are fixable vulnerabilities, run `npm audit fix` to apply safe, non-breaking updates. Do NOT run `npm audit fix --force` — that may introduce breaking semver changes.

3. Run `npm run test` to verify the fixes did not break anything.

4. If tests pass, summarize what was fixed. If tests fail, run `git diff package.json package-lock.json` to identify what changed, explain what likely broke, and revert the problematic change with `git checkout -- package.json package-lock.json` followed by `npm install` to restore the lockfile.

5. If vulnerabilities remain that require `--force` or manual intervention, list them clearly with the affected package, severity, and recommended action for the user to take manually.
