#!/usr/bin/env node

const { createInterface } = require("readline");
const { readFileSync } = require("fs");
const { resolve, join } = require("path");

const api = require("./api");
const util = require("./util");


const args = process.argv.slice(2);
const registryClient = "NPM";   // TODO: Extend?
const readline = createInterface(process.stdin, process.stdout);


if(args[0] === "help") {
    console.log(readFileSync(join(__dirname, "../help.txt")).toString());

    process.exit(0);
}


(async () => {
    const isDryRun = args.includes("--dry-run");
    const incrementType = (await prompt("Type of increment (major|\x1b[4mminor\x1b[24m|patch)")) || "minor";
    const rootPackagePath = resolve(args.find(arg => !/^-[^/]+$/.test(arg)) ?? ".");
    if(!isDryRun
    && util.exec("git status --porcelain", rootPackagePath, true)) {
        terminateWithError("Git working directory not clean");

        process.exit(1);
    }
    
    const packages = [];
    try {
        const infoRegex = /((?:@[\w\d._-]+\/)?[\w\d._-]+)@(\d\.\d\.\d)(?:-[^ ]+)? *-> *([^\s]+)/;
        packages.push(
            ...util.exec("npm ls -ws", rootPackagePath, true)
            .match(new RegExp(infoRegex.source, "g"))
            .map(rawInfo => rawInfo.match(infoRegex))
            .map(rawInfo => {
                const packagePath = join(rootPackagePath, rawInfo[3]);
                try {
                    return api.getIncrement(packagePath, incrementType);;
                } catch(err) {
                    terminateWithError(err);
                }
            })
        );
    } catch(err) {
        try {
            packages.push(api.getIncrement(rootPackagePath, incrementType));
        } catch(err) {
            terminateWithError(err);
        }
    }

    packages
    .sort((a, b) => {
        const numVersion = p => p.nextVersion.split(/\./g);
        let delta;
        for(let i = 0; i < Math.min(numVersion(a).length, numVersion(b).length); i++) {
            delta = numVersion(b)[i] - numVersion(a)[i];
            if(delta) break;
        }
        return delta;
    });

    const nextTag = packages[0].nextTag;
    const confirmation = await prompt(`Are you sure to release ${nextTag}? (y/\x1b[4mn\x1b[24m)`);
    (confirmation !== "y")
    && terminateWithError("Release aborted.");

    packages
    .map((package, i) => {
        if(!i) return package;
        package.nextVersion = packages[0].nextVersion;
        package.nextTag = packages[0].nextTag;
        return package;
    })
    .forEach(package => {
        const clientArgIndex = args.indexOf("--client");
        try {
            api.release(package, ~clientArgIndex ? args[clientArgIndex + 1] : "npm", {
                dry: isDryRun
            });
        } catch(err) {
            terminateWithError(err);
        }
    });

    try {
        args.includes("--github")
        && api.referToGithub(rootPackagePath, nextTag);
    } catch(err) {
        terminateWithError(err);
    }
    
    console.log(`\x1b[33mReleased ${nextTag} to ${registryClient}.\x1b[0m`);

    process.exit(0);
})();


function terminateWithError(err) {
    const printStacktrace = args.includes("--stacktrace");

    console.error(`\x1b[31m${
        (err.message && (!printStacktrace || !err.stack))
        ? (err.message.replace(/^(\w+)?Error: */, ""))
        : `${err.message}${err.stack ? `\n${err.stack}` : ""}`
    }\x1b[0m`);

    process.exit(1);    
}

function prompt(question) {
    return new Promise((resolve) => {
        readline.question(`\x1b[34m${question.trim()}\x1b[0m `, (answer) => {
            resolve(answer.trim());
        });
    });
}