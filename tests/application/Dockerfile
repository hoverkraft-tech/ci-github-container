FROM scratch AS base

HEALTHCHECK --interval=5s --timeout=3s --retries=3 CMD ["/healthcheck"]

USER test

FROM base AS prod