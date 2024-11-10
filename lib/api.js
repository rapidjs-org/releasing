const { join } = require("path");
const { existsSync } = require("fs");
const { NPMClient } = require("./RegistryClient");

const util = require("./util"); 


function parsePackageJson(packagePath) {
    const packageJsonPath = join(packagePath, "package.json");
    if(!existsSync(packageJsonPath)) {
        throw new ReferenceError("Package directory does not contain a package.json");
    }
    return require(packageJsonPath);
}


module.exports.getIncrement = function(packagePath, incrementType) {
    if(!existsSync(packagePath)) {
        throw new ReferenceError(`Package directory does not exist '${packagePath}'`);
    }

    const packageJson = parsePackageJson(packagePath);
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
        packagePath: packagePath
    };
}

module.exports.release = function(increment, registryClient, options = {}) {
    const optionsWithDefaults = Object.assign({
        dry: false
    }, options);

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
        client.publish(optionsWithDefaults.dry);

        util.exec("git push");
    } catch(err) {
        try {
            util.exec("git reset --soft HEAD~1");
            util.exec("git tag")
                .split(/\n/g)
                .map(v => v.trim())
                .includes(increment.nextTag)
                && util.exec(`git tag -d ${increment.nextTag}`);
            util.exec("git push --force");
        } catch {}

        throw err;
    }
}

module.exports.referToGithub = function(packagePath, nextTag) {
    let packageJson;
    try {
        packageJson = parsePackageJson(packagePath);
    } catch {
        return;
    }
    
    const repositoryUrl = (
        ((packageJson.repository ?? {}).url ?? "")
        .match(/https:\/\/github\.com(\/[\w\d_-]+)+\/?/)
        ?? []
    )[0];
    if(!repositoryUrl) return;

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
        `'${repositoryUrl}/releases/new?tag=${nextTag}&title=${nextTag}'`
    ].join(" "));
}