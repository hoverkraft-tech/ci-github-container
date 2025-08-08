### Feature Request

With the recent announcement of [ARM64 hosted runners being generally available for public repositories](https://github.blog/changelog/2025-08-07-arm64-hosted-runners-for-public-repositories-are-now-generally-available/), we have the opportunity to enhance our `build-images` workflow by incorporating the ARM64 runner when it is specifically needed.

### Proposed Solution
- Modify the `build-images` workflow to include a conditional step for using the ARM64 runner.
- Ensure compatibility and test the workflow with ARM64 architecture.
- Update documentation to reflect the changes in the workflow.

### Benefits
- Improved compatibility for ARM-based environments.
- Leverage the performance and cost benefits of ARM64 architecture.

### Additional Context
This change aligns with the latest GitHub enhancements and ensures our workflows remain modern and efficient.