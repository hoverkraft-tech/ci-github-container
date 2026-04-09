const { spawnSync } = require("child_process");

function info(message) {
  process.stdout.write(`${message}\n`);
}

function warning(message) {
  process.stdout.write(`::warning::${message}\n`);
}

function commandExists(command) {
  const result = spawnSync(command, ["--version"], { stdio: "ignore" });
  return result.status === 0;
}

function builderExists(builder) {
  const result = spawnSync("docker", ["buildx", "inspect", builder], {
    stdio: "ignore",
  });
  return result.status === 0;
}

const enabled =
  (process.env.STATE_enabled || "true").trim().toLowerCase() !== "false";
const builder = (process.env.STATE_builder || "").trim();

if (!enabled) {
  info("Buildx cleanup disabled. Skipping builder cleanup.");
  process.exit(0);
}

if (!builder) {
  info("No Buildx builder configured for cleanup.");
  process.exit(0);
}

if (!commandExists("docker")) {
  warning(
    "Docker CLI is unavailable during builder cleanup. Skipping cleanup.",
  );
  process.exit(0);
}

if (!builderExists(builder)) {
  info(`Buildx builder "${builder}" is already absent. Skipping cleanup.`);
  process.exit(0);
}

info(`Removing Buildx builder "${builder}".`);
const removeResult = spawnSync("docker", ["buildx", "rm", builder], {
  stdio: "inherit",
});

if (removeResult.status !== 0) {
  warning(`Failed to remove Buildx builder "${builder}".`);
}
