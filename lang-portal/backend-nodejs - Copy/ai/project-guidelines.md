## General

- Follow best practices, ensure clean, modular code.
- Prioritize modularity, DRY, performance, and security
- Don't repeat yourself

## Code
- use typescript only code
- Where appropriate suggest refactorings and code improvements
- Favor using the latest nodejs features and libraries
- Don’t apologize for errors: fix them
  * If you can’t finish code, add TODO: comments
- Enforce ESLint and Prettier for consistent styling.


## Comments
- Write JSDoc comments to document all functions, classes, and modules.
- Comments should be created where the operation isn't clear from the code, or where uncommon libraries are used
- Code must start with path/filename as a one-line comment
- Comments should describe purpose, not effect

## Logging
Implement logging using Winston for structured logs.

## Other project guidelines
The tool is open-source under MIT license.
Ensure the code is readable, well-structured, and scalable.
No security features or authentication for now.
No containerization yet (Docker/Kubernetes not needed).
Use modern ES syntax (import/export, async/await).