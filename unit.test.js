const assert = require("assert");

const api = require("./lib/api");


assert.deepEqual(
    api.getIncrement(require("path").join(__dirname, "./test-package"), "major").repositoryUrl,
    "https://github.com/rapidjs-org/releasing"
);

assert.deepEqual(
    api.getIncrement(require("path").join(__dirname, "./test-package"), "major").nextTag,
    "v1.0.0"
);

assert.deepEqual(
    api.getIncrement(require("path").join(__dirname, "./test-package"), "major").nextVersion,
    "1.0.0"
);

assert.deepEqual(
    api.getIncrement(require("path").join(__dirname, "./test-package"), "minor").nextVersion,
    "0.6.0"
);

assert.deepEqual(
    api.getIncrement(require("path").join(__dirname, "./test-package"), "patch").nextVersion,
    "0.5.1"
);


console.log("\x1b[32mAPI tests succeeded.\x1b[0m");