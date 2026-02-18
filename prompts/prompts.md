# Project Guidelines

This file is meant to be read-only by the agent.

If starting out, read the design in design.md for what to setup initially.

At the end of starting out, create several human- and agent-readable files that documents key information about the application: REFERENCE.md, README.md, SETUP.md.


# REFERENCE.md
REFERENCE.md should be created to easily find styles, architecture, utilities, and other commonly referenced patterns. The file should never contain actual code snippets, only structured descriptions and pointers to the relevant files. The file will be updated periodically as changes are made to the repository.

Constraints:

General enough to work for any monorepo application.

Supports multi-level hierarchy: module → feature → component → file.

Final level should point to files rather than embedding code.

Include categories for styles, architecture, and commonly used utilities.

Easy for agents to parse and humans to scan.

Suggested Structure Skeleton:

## 1. Project Overview
- **Purpose:** Short description of the project.
- **Stack:** Frameworks, languages, major libraries.
- **Repo Layout:** High-level modules or packages in the monorepo.

## 2. Architecture
- **Modules / Packages**
  - [module_name](path/to/module) – short description
  - Structure:
    - `src/` – main source files
    - `tests/` – test files
    - `docs/` – module documentation
- **Data Flow / State Management**
  - Description of architecture patterns (MVC, Redux, event-driven, microservices, etc.)
  - [Relevant files](path/to/files)
- **Core Utilities**
  - List of utilities commonly imported
  - [File references](path/to/utilities)

## 3. Commonly Used Styles
- **UI / CSS**
  - Main style files, e.g., `styles/global.css` or `themes/`
  - Component-specific style patterns
- **Code Style**
  - ESLint / Prettier configs
  - [File references](path/to/configs)

- If the project does not have a frontend, detail the coding style instead.

## 4. Features / Components
- Feature 1
  - Description
  - [Main files](path/to/files)
- Feature 2
  - Description
  - [Main files](path/to/files)

## 5. Scripts / Dev Tools
- Build / Deploy / Test scripts
- [File references](path/to/scripts)

## 6. APIs / Integrations
- External services and SDKs
- Endpoints / API clients
- [File references](path/to/integration)

## 7. Notes for Agents
- Patterns or conventions agents should follow
- Files that contain metadata for agent consumption
- **Refactoring reminder:** After major changes, perform a minimal-effort refactoring pass:
  - Move all imports to top of file (no mid-file requires or imports)
  - Extract magic numbers to named constants in organized constant files (e.g., GAME_MECHANICS in constants.ts)
  - Improve code organization (group related functions, add section comments)
  - Check for duplicate code that could be extracted to utilities
  - Update this note in REFERENCE.md if not already present

## 8. References & Docs
- Links to README files in submodules
- Architectural diagrams (if any)
- External resources (docs, wikis)

max. 100 lines per major section, max. 1000 lines for whole reference (for readability). 

# README.md

A short brief description about the repo. max. 50 lines.

# SETUP.md

Concise setup instructions with `bash` code snippets. Assume commonly used development tools (e.g. pnpm, cmake, git) are already installed.

max. 100 lines. If the setup reaches beyond 100 lines, then create `setup.sh`-like files to concise SETUP.md back to the recommended line limit.


# Common setups

## Discord bot (typescript)
see discord_bot.md
## Other
WIP...

---

## Branch / commit / PR workflow (recommended)
When implementing changes please follow this lightweight workflow so history and review stay consistent:

- Create a new branch for the work using one of these patterns:
  - `feature/<short-desc>` — Big new feature (e.g. `feature/bread-upgrade-hints`)
  - `fix/<short-desc>` — Bug fix (e.g. `fix/channel-default`)
  - `refactor/<short-desc>` — Internal cleanup
  - `test/<short-desc>` — New or updated tests
  - `experiment/<idea>` — Prototyping or exploratory work

- Make small, focused commits with concise messages.
- Push the branch and open a PR targeting `main` with a short title and summary.
- Keep PRs reviewable (small diffs, one responsibility per PR).

---

## Merging PRs to `main` (recommended git commands)
- Fetch latest main and rebase your branch:
  - git checkout main
  - git pull origin main
  - git checkout <your-branch>
  - git rebase main

- Resolve conflicts, run tests/lint, then fast-forward merge locally (when approved):
  - git checkout main
  - git merge --ff-only <your-branch>
  - git push origin main

- If a fast-forward merge isn't possible and a merge commit is acceptable:
  - git checkout main
  - git merge --no-ff <your-branch>
  - git push origin main

- Alternatively, use the remote PR UI or GitHub CLI to merge after approval:
  - gh pr merge <pr-number|branch> --merge (or --squash / --rebase as your project prefers)

> Tip: Always run the full test suite (npm test) and a build (npm run build) before merging.

---

## Repository-level checks & conventions (please follow)
- Do NOT commit the runtime SQLite DB in `data/` — it is ignored via `.gitignore`.
  - Use `.env` / `.env.example` for configuration and `process.env.DATABASE_PATH=':memory:'` for tests.
- Always run tests and linters on your branch before opening a PR:
  - npm test
  - npm run build
- Keep secrets out of the repo (`.env` is ignored). Add missing env vars to `.env.example` instead.
- Add/update tests for any behavior changes; tests are required for feature and fix PRs.
- Add a short changelog entry or update `CHANGELOG.md` (if present) for user-facing changes.
- Use semantic commit messages and the branch naming patterns already listed in this file.
- Consider adding/maintaining CI (GitHub Actions) that runs: install → build → test → lint → typecheck.

---

## Quick checklist for PR reviewers
- [ ] Does the branch have a descriptive title and small, focused changes?
- [ ] Are tests added/updated and passing locally?
- [ ] Does `npm run build` succeed without errors?
- [ ] No secrets or DB files included in the diff?
- [ ] Documentation and prompts updated when behavior or API changes were made?
- [ ] Recommended: squash/rebase commits to keep history clean (project preference applies).

This workflow is a recommended convention for contributors and automated agents to follow.