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