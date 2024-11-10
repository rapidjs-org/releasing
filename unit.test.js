const assert = require("assert");

const api = require("./lib/api");


const REPO_PACKAGE_PATH = require("path").join(__dirname, "./test/repo");


assert.deepEqual(
    api.getIncrement(REPO_PACKAGE_PATH, "major").nextTag,
    "v1.0.0"
);

assert.deepEqual(
    api.getIncrement(REPO_PACKAGE_PATH, "major").nextVersion,
    "1.0.0"
);

assert.deepEqual(
    api.getIncrement(REPO_PACKAGE_PATH, "minor").nextVersion,
    "0.6.0"
);

assert.deepEqual(
    api.getIncrement(REPO_PACKAGE_PATH, "patch").nextVersion,
    "0.5.1"
);


console.log("\x1b[32mUnit tests succeeded.\x1b[0m");