---
description: Write comprehensive tests for a file or component
argument-hint: <path/to/file or component>
---

{% if $ARGUMENTS == "" %}
The developer did not provide a file path. 
List all testable source files using: !`find src -name "*.ts" -o -name "*.tsx" | grep -v test | grep -v __tests__ | sort`
Then ask: "Which file would you like me to write tests for?"
Wait for their response before proceeding.
{% else %}
Write comprehensive tests for: $ARGUMENTS

Testing conventions:
* Use Vitest with React Testing Library
* Place test files in a __tests__ directory in the same folder as the source file
* Name test files as [filename].test.ts(x)
* Use @/ prefix for imports
{% endif %}