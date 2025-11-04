FROM scratch AS base

USER test

FROM nginx:1 AS prod

HEALTHCHECK --interval=5s --timeout=3s --retries=3 CMD ["curl", "-f", "http://localhost:8080/health/check"]

# Install curl for healthcheck
ENV DEBIAN_FRONTEND=noninteractive
# hadolint ignore=DL3008
RUN \
  --mount=type=cache,target=/var/cache/apt,sharing=locked \
  --mount=type=cache,target=/var/lib/apt,sharing=locked \
  rm -f /etc/apt/apt.conf.d/docker-clean && \
  echo 'Binary::apt::APT::Keep-Downloaded-Packages "true";' >/etc/apt/apt.conf.d/keep-cache && \
  apt-get update && \
  apt-get install -y curl

# Configure nginx to listen on port 8080
RUN sed -i 's/listen       80;/listen       8080;/' /etc/nginx/conf.d/default.conf

# Create a hmtl page for healthcheck
RUN mkdir -p /usr/share/nginx/html/health/check && echo "<html><body><h1>OK</h1></body></html>" > /usr/share/nginx/html/health/check/index.html

EXPOSE 8080

FROM alpine:3 AS test

# Create user and group
RUN addgroup -S test && adduser -S test -G test


ARG BUILD_RUN_ID
RUN test -n "$BUILD_RUN_ID" || (echo "Error: BUILD_RUN_ID is not set" && exit 1);

# Test that the build args are set
ARG BUILD_ARG_TEST
ENV EXPECTED_BUILD_ARG_TEST=test-arg
RUN test -n "$BUILD_ARG_TEST" || (echo "Error: BUILD_ARG_TEST is not set" && exit 1);
RUN test "$BUILD_ARG_TEST" = "$EXPECTED_BUILD_ARG_TEST" || (echo "Error: BUILD_ARG_TEST is not \"$EXPECTED_BUILD_ARG_TEST\"" && exit 1);

ENV EXPECTED_BUILD_ARG_ANOTHER_TEST=another-test-arg
ARG BUILD_ARG_ANOTHER_TEST
RUN test -n "$BUILD_ARG_ANOTHER_TEST" || (echo "Error: BUILD_ARG_ANOTHER_TEST is not set" && exit 1);
RUN test "$BUILD_ARG_ANOTHER_TEST" = "$EXPECTED_BUILD_ARG_ANOTHER_TEST" || (echo "Error: BUILD_ARG_ANOTHER_TEST is not \"$EXPECTED_BUILD_ARG_ANOTHER_TEST\"" && exit 1);

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

  secretValue="\$(cat /run/secrets/"\$secretName")"

  test "\$secretValue" = "\$expectedValue" || {
    echo "Error: \$secretName \"\$secretValue\" is not \"\$expectedValue\""
    exit 1
  }
}
EOF

# Test that secrets are passed
ENV EXPECTED_VALUE=test-secret
RUN --mount=type=secret,id=SECRET_TEST . test.sh && assertSecretEquals SECRET_TEST "$EXPECTED_VALUE";
ENV EXPECTED_VALUE=another-test-secret
RUN --mount=type=secret,id=SECRET_ANOTHER_TEST . test.sh && assertSecretEquals SECRET_ANOTHER_TEST "$EXPECTED_VALUE";

# Test that secret envs are passed
ENV EXPECTED_VALUE=build
RUN --mount=type=secret,id=SECRET_ENV_TEST . test.sh && assertSecretEquals SECRET_ENV_TEST "$EXPECTED_VALUE";
ENV EXPECTED_VALUE=build-images
RUN --mount=type=secret,id=SECRET_ENV_ANOTHER_TEST . test.sh && assertSecretEquals SECRET_ENV_ANOTHER_TEST "$EXPECTED_VALUE";

# Test that the github app token secrets are passed
RUN --mount=type=secret,id=SECRET_ENV_GITHUB_APP_TOKEN_1 . test.sh && assertSecretExists SECRET_ENV_GITHUB_APP_TOKEN_1;
RUN --mount=type=secret,id=SECRET_ENV_GITHUB_APP_TOKEN_2 . test.sh && assertSecretExists SECRET_ENV_GITHUB_APP_TOKEN_2;

USER test