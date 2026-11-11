FROM alpine:3@sha256:f59abe656b692d901e184be3445e084786602108599d2a51d229c0f5a48c71bf AS dependencies

ARG CACHE_TEST_ID
COPY dependencies.lock /dependencies.lock
RUN --mount=type=cache,target=/downloads \
    test -n "$CACHE_TEST_ID" && \
    read -r revision previous </dependencies.lock && \
    if [ "$previous" = "absent" ]; then test ! -f /downloads/v1; \
    elif [ "$previous" != "none" ]; then test -f "/downloads/$previous"; fi && \
    touch "/downloads/$revision" && \
    cat /proc/sys/kernel/random/uuid >/install-id

FROM dependencies AS ci
RUN cp /install-id /ci-install-id
USER 1000
HEALTHCHECK CMD ["test", "-s", "/install-id"]

FROM alpine:3@sha256:f59abe656b692d901e184be3445e084786602108599d2a51d229c0f5a48c71bf AS prod
COPY --from=dependencies /install-id /install-id
USER 1000
HEALTHCHECK CMD ["test", "-s", "/install-id"]
