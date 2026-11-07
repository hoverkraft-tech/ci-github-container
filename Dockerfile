FROM ghcr.io/hoverkraft-tech/docker-base-images/super-linter:pr-282-646c02c@sha256:94f6554fff4c6d73ee2c95ab3cfce7fac8fa03bc66dddfd1b85baf11ab4ce335

HEALTHCHECK --interval=5m --timeout=10s --start-period=30s --retries=3 CMD ["/bin/sh","-c","test -d /github/home"]
ARG UID=1000
ARG GID=1000
USER ${UID}:${GID}