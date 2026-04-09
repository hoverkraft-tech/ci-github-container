const fs = require("fs");

function appendState(name, value) {
  const stateFile = process.env.GITHUB_STATE;
  if (!stateFile) {
    return;
  }

  fs.appendFileSync(stateFile, `${name}=${value}\n`, { encoding: "utf8" });
}

const enabled =
  (process.env.INPUT_ENABLED || "true").trim().toLowerCase() !== "false";
const builder = (process.env.INPUT_BUILDER || "").trim();

appendState("enabled", String(enabled));
appendState("builder", builder);
