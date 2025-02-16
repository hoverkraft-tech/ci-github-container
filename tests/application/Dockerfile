FROM scratch AS base

HEALTHCHECK --interval=5s --timeout=3s --retries=3 CMD ["/healthcheck"]

USER test

FROM base AS prod

FROM alpine:3 AS test

# Create user and group
RUN addgroup -S test && adduser -S test -G test

ENV EXPECTED_REPOSITORY_OWNER=hoverkraft-tech
ENV EXPECTED_REPOSITORY=hoverkraft-tech/ci-github-container

ARG BUILD_RUN_ID
RUN test -n "$BUILD_RUN_ID" || (echo "Error: BUILD_RUN_ID is not set" && exit 1);

# Test that the build args are set
ARG BUILD_REPOSITORY_OWNER
RUN test -n "$BUILD_REPOSITORY_OWNER" || (echo "Error: BUILD_REPOSITORY_OWNER is not set" && exit 1);
RUN test "$BUILD_REPOSITORY_OWNER" = "$EXPECTED_REPOSITORY_OWNER" || (echo "Error: BUILD_REPOSITORY_OWNER is not \"$EXPECTED_REPOSITORY_OWNER\"" && exit 1);

ARG BUILD_REPOSITORY
RUN test -n "$BUILD_REPOSITORY" || (echo "Error: BUILD_REPOSITORY is not set" && exit 1);
RUN test "$BUILD_REPOSITORY" = "$EXPECTED_REPOSITORY" || (echo "Error: BUILD_REPOSITORY is not \"$EXPECTED_REPOSITORY\"" && exit 1);

# Test that secrets are passed
RUN --mount=type=secret,id=SECRET_REPOSITORY_OWNER test -f /run/secrets/SECRET_REPOSITORY_OWNER || (echo "Error: SECRET_REPOSITORY_OWNER is not set" && exit 1);
RUN --mount=type=secret,id=SECRET_REPOSITORY_OWNER test "$(cat /run/secrets/SECRET_REPOSITORY_OWNER)" = "$EXPECTED_REPOSITORY_OWNER" || (echo "Error: SECRET_REPOSITORY_OWNER is not \"$EXPECTED_REPOSITORY_OWNER\"" && exit 1);

RUN --mount=type=secret,id=SECRET_REPOSITORY test -f /run/secrets/SECRET_REPOSITORY || (echo "Error: SECRET_REPOSITORY is not set" && exit 1);
RUN --mount=type=secret,id=SECRET_REPOSITORY test "$(cat /run/secrets/SECRET_REPOSITORY)" = "$EXPECTED_REPOSITORY" || (echo "Error: SECRET_REPOSITORY is not \"$EXPECTED_REPOSITORY\"" && exit 1);

# Test that secret envs are passed
RUN --mount=type=secret,id=SECRET_ENV_REPOSITORY_OWNER test -f /run/secrets/SECRET_ENV_REPOSITORY_OWNER || (echo "Error: SECRET_ENV_REPOSITORY_OWNER is not set" && exit 1);
RUN --mount=type=secret,id=SECRET_ENV_REPOSITORY_OWNER test "$(cat /run/secrets/SECRET_ENV_REPOSITORY_OWNER)" = "$EXPECTED_REPOSITORY_OWNER" || (echo "Error: SECRET_ENV_REPOSITORY_OWNER is not \"$EXPECTED_REPOSITORY_OWNER\"" && exit 1);

RUN --mount=type=secret,id=SECRET_ENV_REPOSITORY test -f /run/secrets/SECRET_ENV_REPOSITORY || (echo "Error: SECRET_ENV_REPOSITORY is not set" && exit 1);
RUN --mount=type=secret,id=SECRET_ENV_REPOSITORY test "$(cat /run/secrets/SECRET_ENV_REPOSITORY)" = "$EXPECTED_REPOSITORY" || (echo "Error: SECRET_ENV_REPOSITORY is not \"$EXPECTED_REPOSITORY\"" && exit 1);

USER test