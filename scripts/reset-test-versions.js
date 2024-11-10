const { writeFileSync } = require("fs");


function resetVersion(testPackagePath, version) {
    const packageJsonPath = require("path").join(__dirname, "../test", testPackagePath, "package.json");
    const packageJson = require(packageJsonPath);

    packageJson.version = version;

    writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
}


resetVersion("monorepo/packages/a", "0.1.0");
resetVersion("monorepo/packages/b", "0.1.0");
resetVersion("repo", "0.5.0");


console.log("\x1b[34mReset all test package versions.\x1b[0m");