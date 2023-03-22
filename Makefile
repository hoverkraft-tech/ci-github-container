.PHONY: help

help: ## Display help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

lint: ## Execute linting (https://github.com/github/super-linter)
	DEFAULT_WORKSPACE="$(CURDIR)"; \
	VOLUME="$$DEFAULT_WORKSPACE:$$DEFAULT_WORKSPACE"; \
	LINTER_IMAGE="github/super-linter:slim-v4"; \
	docker pull $$LINTER_IMAGE; \
	docker run \
		-e RUN_LOCAL=true -e USE_FIND_ALGORITHM=true \
		-e LOG_LEVEL=WARN -e LOG_FILE="../logs" \
		-e DEFAULT_WORKSPACE="$$DEFAULT_WORKSPACE" \
		-e FILTER_REGEX_INCLUDE="$(filter-out $@,$(MAKECMDGOALS))" \
		-v $$VOLUME \
		--rm \
		$$LINTER_IMAGE

#############################
# Argument fix workaround
#############################
%:
	@: