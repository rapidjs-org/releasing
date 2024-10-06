const { resolve, join } = require("path");
const { existsSync } = require("fs");
const { NPMClient } = require("./RegistryClient");

const util = require("./util"); 


module.exports.getIncrement = function(packagePath, incrementType) {
    if(!packagePath) {
        throw new SyntaxError("Missing package path argument");
    }
    if(!packagePath) {
        throw new SyntaxError("Missing increment type argument");
    }
    const packageDirPath = resolve(packagePath);
    if(!existsSync(packageDirPath)) {
        throw new ReferenceError(`Package directory does not exist '${packageDirPath}'`);
    }
    const packageJsonPath = join(packageDirPath, "package.json");
    if(!existsSync(packageJsonPath)) {
        throw new ReferenceError("Package directory does not contain a package.json");
    }   

    const packageJson = require(packageJsonPath);

    const version = (
        (packageJson.version ?? "0.0.9")
        .match(/\d+/g)
        ?? []
    ).map((digit) => parseInt(digit));
    if(version.length !== 3 || version.filter((digit) => isNaN(digit)).length) {
        throw new SyntaxError(`package.json states invalid (semver) version '${packageJson.version}'`);
    }

    let incrementIndex;
    switch(incrementType) {
        case "major":
            incrementIndex = 0;
            break;
        case "minor":
            incrementIndex = 1;
            break;
        case "patch":
            incrementIndex = 2;
            break;
        default:
            throw new SyntaxError("Invalid increment type argument");
    }

    for(let i = incrementIndex + 1; i <= 2; i++) {
        version[i] = 0;
    }
    version[incrementIndex] += 1;

    const nextVersion = version.join(".");

    return {
        nextTag: `v${nextVersion}`,
        nextVersion: nextVersion,
        packagePath: packageDirPath,
        repositoryUrl: (
            (packageJson.repository ?? {})
            .url
            .match(/https:\/\/github\.com(\/[\w\d_-]+)+\/?/)
            ?? []
        )[0],
    };
}

module.exports.release = function(increment, registryClient, referToGH = false) {
    let client;
    switch((registryClient ?? "npm").toLowerCase()) {
        case "npm":
            client = new NPMClient(increment.packagePath);
            break;
        case "yarn":
            client = new YarnClient(increment.packagePath);
            break;
        default:
            throw new SyntaxError("Invalid increment type argument");
    }

    client.bumpVersion(increment.nextVersion);
    try {
        client.publish();

        util.exec("git push");
    } catch(err) {
        try {
            util.exec("git reset --soft HEAD~1");
            util.exec(`git tag -d ${increment.nextTag}`);
            util.exec("git push --force");
        } catch {}

        throw err;
    }

    if(!referToGH
    || !increment.repositoryUrl) return;

    let cmd;
    switch(process.platform) {
        case "darwin":
            cmd = "open";
            break;
        case "win32":
            cmd = "start";
            break;
        default:
            cmd = "xdg-open";
    }
    util.exec([
        cmd,
        `'${increment.repositoryUrl}/releases/new?tag=${increment.nextTag}&title=${increment.nextTag}'`
    ].join(" "));
}