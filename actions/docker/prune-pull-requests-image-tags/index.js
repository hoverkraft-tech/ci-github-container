module.exports = async ({
  github,
  context,
  core,
  imageName,
  pullRequestTagFilter,
  isOrganization
}) => {
  const repositoryOwner = `${context.repo.owner}`.toLowerCase()
  const packageName = imageName.replace(`${repositoryOwner}/`, '')

  let currentPage = 1
  const allDeletedTags = []
  while (true) {
    const data = await getAllPackageVersions({
      github,
      context,
      isOrganization,
      packageName,
      page: currentPage
    })

    currentPage++

    if (!data.length) {
      break
    }

    const deletedTags = await Promise.all(
      data.map((packageVersion) =>
        processPackageVersion({
          github,
          context,
          core,
          isOrganization,
          packageName,
          pullRequestTagFilter,
          packageVersion
        })
      )
    )
    allDeletedTags.push(...deletedTags.flat())
  }

  return [...new Set(allDeletedTags)]
}

async function getAllPackageVersions ({
  context,
  github,
  packageName,
  isOrganization,
  page
}) {
  if (isOrganization) {
    const { data } =
      await github.rest.packages.getAllPackageVersionsForPackageOwnedByOrg({
        package_type: 'container',
        package_name: packageName,
        org: context.repo.owner,
        per_page: 100,
        page
      })

    return data
  }

  const { data } =
    await github.rest.packages.getAllPackageVersionsForPackageOwnedByUser({
      package_type: 'container',
      package_name: packageName,
      username: context.repo.owner,
      per_page: 100,
      page
    })

  return data
}

async function processPackageVersion ({
  github,
  context,
  core,
  packageName,
  isOrganization,
  pullRequestTagFilter,
  packageVersion
}) {
  const tags = packageVersion.metadata.container.tags

  const pullRequestRelatedTags = getPullRequestRelatedTags({
    tags,
    pullRequestTagFilter
  })

  if (!pullRequestRelatedTags.length) {
    return []
  }

  if (pullRequestRelatedTags.length > 1) {
    core.debug(
      `Package version ${
        packageVersion.name
      } cannot be deleted as it is not related to a single pull request: ${tags.join(
        ', '
      )}`
    )
    return []
  }

  const pullRequestNumber = pullRequestRelatedTags[0]

  const currentPullRequestIsClosed = await isPullRequestClosed({
    github,
    context,
    pullRequestNumber
  })

  if (!currentPullRequestIsClosed) {
    core.debug(
      `Package version ${packageVersion.name} cannot be deleted as pull request ${pullRequestNumber} is not closed}`
    )
    return []
  }

  await deletePackageVersion({
    github,
    core,
    context,
    packageName,
    isOrganization,
    packageVersion
  })

  return tags
}

function getPullRequestRelatedTags ({ tags, pullRequestTagFilter }) {
  if (!tags.length) {
    return []
  }

  const pullRequestRelatedTags = tags
    .map((tag) => {
      const matches = tag.match(pullRequestTagFilter)
      if (!matches) {
        return null
      }
      return matches[1]
    })
    .filter((pullRequestNumber) => pullRequestNumber)

  return [...new Set(pullRequestRelatedTags)]
}

const closedPullRequests = new Map()
async function isPullRequestClosed ({ github, context, pullRequestNumber }) {
  if (!closedPullRequests.has(pullRequestNumber)) {
    const {
      data: { state }
    } = await github.rest.pulls.get({
      ...context.repo,
      pull_number: pullRequestNumber
    })
    closedPullRequests.set(pullRequestNumber, state === 'closed')
  }
  return closedPullRequests.get(pullRequestNumber)
}

async function deletePackageVersion ({
  github,
  core,
  context,
  packageName,
  isOrganization,
  packageVersion
}) {
  try {
    if (isOrganization) {
      return await github.rest.packages.deletePackageVersionForOrg({
        package_type: 'container',
        package_name: packageName,
        org: context.repo.owner,
        package_version_id: packageVersion.id
      })
    }

    return await github.rest.packages.deletePackageVersionForUser({
      package_type: 'container',
      package_name: packageName,
      username: context.repo.owner,
      package_version_id: packageVersion.id
    })
  } catch (error) {
    if (error.status === 404) {
      core.warning(
        `Package version ${packageVersion.name} (${packageVersion.id}) cannot be deleted as it is not found`
      )
    } else {
      throw error
    }
  }
}
