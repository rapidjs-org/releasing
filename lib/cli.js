#!/usr/bin/env node

const { createInterface } = require("readline");
const { readFileSync } = require("fs");
const { join } = require("path");

const api = require("./api");


const args = process.argv.slice(2);
const registryClient = "NPM";   // TODO: Extend?
const readline = createInterface(process.stdin, process.stdout);


if(args[0] === "help") {
    console.log(readFileSync(join(__dirname, "../help.txt")).toString());

    process.exit(0);
}


const handleBubblingError = (err) => {
    console.error(`\x1b[31m${
        (!err.message || (err.stack && args.includes("--print-stacktrace")))
        ? err.toString()
        : err.message
    }\x1b[0m`);

    process.exit(1);
};
process.on("uncaughtException", handleBubblingError);
process.on("unhandledRejection", handleBubblingError);


const packagePath = args.find(arg => !/^-[^/]+$/.test(arg)) ?? ".";

(async () => {
    const incrementType = (await prompt("Type of increment (major|\x1b[4mminor\x1b[24m|patch)")) || "minor";
    const increment = api.getIncrement(packagePath, incrementType);
    const confirmation = await prompt(`Are you sure to release ${increment.nextTag}? (y/\x1b[4mn\x1b[24m)`);

    if(confirmation !== "y") {
        console.error("\x1b[31mRelease aborted.\x1b[0m");

        process.exit(1);
    }
    
    const clientArgIndex = args.indexOf("--client");
    api.release(increment, ~clientArgIndex ? args[clientArgIndex + 1] : "npm", args.includes("--github"));

    console.log(`\x1b[33mReleased ${increment.nextTag} to ${registryClient}.\x1b[0m`);

    process.exit(0);
})();


function prompt(question) {
    return new Promise((resolve) => {
        readline.question(`\x1b[34m${question.trim()}\x1b[0m `, (answer) => {
            resolve(answer.trim());
        });
    });
}