FROM ghcr.io/super-linter/super-linter:slim-v5

ENV RUN_LOCAL=true 
ENV USE_FIND_ALGORITHM=true
ENV LOG_LEVEL=WARN
ENV LOG_FILE="../logs"