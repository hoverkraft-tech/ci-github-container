module.exports = async ({
  github,
  context,
  core,
  imageName,
  pullRequestTagFilter,
  isOrganization,
}) => {
  const repositoryOwner = `${context.repo.owner}`.toLowerCase();
  const packageName = imageName.replace(`${repositoryOwner}/`, "");

  let currentPage = 1;
  const allTagsToDelete = [];
  for (;;) {
    const data = await getAllPackageVersions({
      github,
      context,
      isOrganization,
      packageName,
      page: currentPage,
    });

    currentPage++;

    if (!data.length) {
      break;
    }

    const tagsToDelete = await Promise.all(
      data.map((packageVersion) =>
        getTagsToDeleteFromPackageVersion({
          github,
          context,
          core,
          pullRequestTagFilter,
          packageVersion,
        }),
      ),
    );
    allTagsToDelete.push(...tagsToDelete.flat());
  }

  return [...new Set(allTagsToDelete)];
};

async function getAllPackageVersions({
  context,
  github,
  packageName,
  isOrganization,
  page,
}) {
  if (isOrganization) {
    const { data } = await rateLimitRetryCall(
      github.rest.packages.getAllPackageVersionsForPackageOwnedByOrg,
      {
        package_type: "container",
        package_name: packageName,
        org: context.repo.owner,
        per_page: 100,
        page,
      },
    );

    return data;
  }

  const { data } = await rateLimitRetryCall(
    github.rest.packages.getAllPackageVersionsForPackageOwnedByUser,
    {
      package_type: "container",
      package_name: packageName,
      username: context.repo.owner,
      per_page: 100,
      page,
    },
  );

  return data;
}

async function getTagsToDeleteFromPackageVersion({
  github,
  context,
  core,
  pullRequestTagFilter,
  packageVersion,
}) {
  const tags = packageVersion.metadata.container.tags;

  const pullRequestRelatedTags = getPullRequestRelatedTags({
    tags,
    pullRequestTagFilter,
  });

  if (!pullRequestRelatedTags.length) {
    return [];
  }

  if (pullRequestRelatedTags.length > 1) {
    core.debug(
      `Package version ${
        packageVersion.name
      } cannot be deleted as it is not related to a single pull request: ${tags.join(
        ", ",
      )}`,
    );
    return [];
  }

  const pullRequestNumber = pullRequestRelatedTags[0];

  const currentPullRequestIsClosed = await isPullRequestClosed({
    github,
    context,
    pullRequestNumber,
  });

  if (!currentPullRequestIsClosed) {
    core.debug(
      `Package version ${packageVersion.name} cannot be deleted as pull request ${pullRequestNumber} is not closed}`,
    );
    return [];
  }

  return tags;
}

function getPullRequestRelatedTags({ tags, pullRequestTagFilter }) {
  if (!tags.length) {
    return [];
  }

  const pullRequestRelatedTags = tags
    .map((tag) => {
      const matches = tag.match(pullRequestTagFilter);
      if (!matches) {
        return null;
      }
      return matches[1];
    })
    .filter((pullRequestNumber) => pullRequestNumber);

  return [...new Set(pullRequestRelatedTags)];
}

const closedPullRequests = new Map();
async function isPullRequestClosed({ github, context, pullRequestNumber }) {
  if (!closedPullRequests.has(pullRequestNumber)) {
    const {
      data: { state },
    } = await rateLimitRetryCall(github.rest.pulls.get, {
      ...context.repo,
      pull_number: pullRequestNumber,
    });
    closedPullRequests.set(pullRequestNumber, state === "closed");
  }
  return closedPullRequests.get(pullRequestNumber);
}

async function rateLimitRetryCall(fn, ...args) {
  try {
    return await fn(...args);
  } catch (error) {
    if (error.status === 403 && error.headers["retry-after"]) {
      const retryAfter = parseInt(error.headers["retry-after"], 10);
      await new Promise((resolve) =>
        setTimeout(resolve, (retryAfter + 1) * 1000),
      );
      return rateLimitRetryCall(fn, ...args);
    }
    throw error;
  }
}
