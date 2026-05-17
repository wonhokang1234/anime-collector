# Frontend Revamp Workflow

This workflow is for a project with an existing working frontend.

The goal is a complete frontend visual and structural revamp while preserving all existing functionality.

## Phase 1: Audit

Use:
- current-frontend-auditor

Output:
- `.claude/reports/current-frontend-audit.md`

No code edits.

## Phase 2: Product Design Research

Use:
- product-design-researcher

Output:
- `.claude/reports/product-design-research.md`

No code edits.

## Phase 3: Visual Direction

Use:
- visual-direction-designer

Output:
- `.claude/design-system/new-visual-direction.md`

No code edits.

## Phase 4: Motion Direction

Use:
- interaction-motion-designer

Output:
- `.claude/design-system/motion-direction.md`

No code edits.

## Phase 5: Component Refactor Plan

Use:
- component-refactor-agent

Output:
- `.claude/reports/refactor-plan.md`

No code edits unless explicitly approved.

## Phase 6: Revamp Implementation Plan

Use:
- revamp-orchestrator

Output:
- `.claude/reports/revamp-implementation-plan.md`

The plan should be split into:
1. design tokens/theme foundation
2. app shell/layout refactor
3. shared component refactor
4. page-by-page visual revamp
5. interaction and animation polish
6. loading/empty/error states
7. responsive/mobile polish
8. final cleanup
9. review and QA

No code edits until the plan is approved.

## Phase 7: Implementation

Use:
- frontend-implementation-agent

Rules:
- one phase at a time
- preserve functionality
- run checks
- summarize changed files
- stop after each phase for review

## Phase 8: Regression Review

Use:
- regression-code-reviewer

Output:
- `.claude/reports/regression-review.md`

## Phase 9: QA

Use:
- frontend-qa-agent

Output:
- `.claude/reports/frontend-qa-report.md`

## Completion Criteria

The revamp is not done until:
- build status is known
- lint/typecheck status is known
- main user flows are preserved
- responsive risks are reviewed
- accessibility risks are reviewed
- UI states are polished
- code is maintainable