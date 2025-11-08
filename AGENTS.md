# AGENTS.md — agent instructions and operational contract

This file is written for automated coding agents (for example: Copilot coding agents). It exists to provide a concise operational contract and guardrails for agents working in this repository. It is not the canonical source for design or style rules. Those live in the developer documentation linked below.

## Organization-wide guidelines (required)

- Follow the prioritized shared instructions in [hoverkraft-tech/.github/AGENTS.md](https://github.com/hoverkraft-tech/.github/blob/main/AGENTS.md) before working in this repository.

## Quick Start

This project contains **opinionated GitHub Actions and reusable workflows** to standardize OCI image build, publication, and Helm chart promotion pipelines. For comprehensive documentation, see the main [README.md](README.md).

### Key Sections to Reference

- **[Overview](README.md#overview)** – Project purpose and scope
- **[Actions](README.md#actions)** – Catalog of container-focused actions grouped by category
- **[Reusable Workflows](README.md#reusable-workflows)** – Orchestration playbooks for common CI tasks
- **[Contributing](README.md#contributing)** – Contribution guidelines, action structure patterns, and development standards
- **[Development Workflow](README.md#development-workflow)** – Commands for linting, testing, and local development
- **[CI Testing Strategy](README.md#ci-testing-strategy)** – How we test local actions with arrange-act-assert patterns across different trigger contexts

## Agent-Specific Development Patterns

### Critical Workflow Knowledge

```bash
# Essential commands for development
make lint                 # Run the dockerized Super Linter
make lint-fix             # Attempt auto-fixes for lint findings
make test-build-application  # Build and push the sample test application image
make test-ct-install         # Validate Helm charts via chart-testing
```

For detailed documentation on each action and workflow, refer to the individual readme files linked in the main [README.md](README.md).
