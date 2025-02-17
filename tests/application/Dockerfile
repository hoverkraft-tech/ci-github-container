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

RUN cat >test.sh <<EOF

assertSecretExists() {
  local secretName="\$1"
  test -f "/run/secrets/\$secretName" || {
    echo "Error: \$secretName is not set"
    exit 1
  }
}

assertSecretEquals() {
  local secretName="\$1"
  local expectedValue="\$2"

  assertSecretExists "\$secretName"

  test "\$(cat /run/secrets/"\$secretName")" = "\$expectedValue" || {
    echo "Error: \$secretName is not \"\$expectedValue\""
    exit 1
  }
}
EOF

# Test that secrets are passed
RUN --mount=type=secret,id=SECRET_REPOSITORY_OWNER . test.sh && assertSecretEquals SECRET_REPOSITORY_OWNER "$EXPECTED_REPOSITORY_OWNER";
RUN --mount=type=secret,id=SECRET_REPOSITORY . test.sh && assertSecretEquals SECRET_REPOSITORY "$EXPECTED_REPOSITORY";

# Test that secret envs are passed
RUN --mount=type=secret,id=SECRET_ENV_REPOSITORY_OWNER . test.sh && assertSecretEquals SECRET_ENV_REPOSITORY_OWNER "$EXPECTED_REPOSITORY_OWNER";
RUN --mount=type=secret,id=SECRET_ENV_REPOSITORY . test.sh && assertSecretEquals SECRET_ENV_REPOSITORY "$EXPECTED_REPOSITORY";

# Test that the github app token secrets are passed
RUN --mount=type=secret,id=SECRET_ENV_GITHUB_APP_TOKEN_1 . test.sh && assertSecretExists SECRET_ENV_GITHUB_APP_TOKEN_1;
RUN --mount=type=secret,id=SECRET_ENV_GITHUB_APP_TOKEN_2 . test.sh && assertSecretExists SECRET_ENV_GITHUB_APP_TOKEN_2;

USER test