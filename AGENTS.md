## Before coding

* Read AI_CONTEXT.md.
* Read relevant /docs files.
* Inspect existing implementation.
* Search for reusable components.
* Search for existing APIs.
* Search for existing database models.
* Search for existing utilities.
* Identify affected workflows.
* Identify affected permissions.
* Identify potential regressions.

## Documentation First Development

DO NOT CODE FIRST.

UNDERSTAND FIRST.
PLAN SECOND.
CODE THIRD.
TEST FOURTH.
DOCUMENT FIFTH.

Before changing code, the agent must identify which documentation files are affected.
After changing code, the agent must update those documentation files.

## Documentation Change Rule

If a code change alters any of the following:
- API
- database
- authentication
- authorization
- workflow
- business rule
- state
- UI behavior
- environment configuration
- external integration

then the corresponding documentation MUST also be updated in the same task.

## Never

* rewrite working functionality unnecessarily
* create duplicate functionality
* change database schema casually
* remove fields without impact analysis
* bypass authorization
* rely only on frontend authorization
* expose secrets
* hardcode credentials
* change business rules without documentation
* modify unrelated features unnecessarily

## Before implementation

Create an implementation plan containing:

1. Requirement
2. Existing functionality affected
3. Files likely to change
4. Database impact
5. API impact
6. UI impact
7. Permission impact
8. Workflow impact
9. Security impact
10. Testing plan
11. Documentation updates

## After implementation

The AI must:

* run relevant tests
* run type checking if available
* run lint if available
* run production build if appropriate
* verify affected workflows
* update relevant documentation
* update CHANGELOG.md

## Implementation Protocol
Before implementing a feature:

1. Read AI_CONTEXT.md.
2. Identify relevant documentation.
3. Read the relevant documentation.
4. Inspect the actual source code.
5. Search for existing implementations.
6. Perform impact analysis.
7. Create an implementation plan.
8. Implement.
9. Test.
10. Update affected documentation.
11. Update CHANGELOG.md.
