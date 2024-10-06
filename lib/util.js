const { execSync } = require("child_process");


module.exports.exec = function(cmd, cwd = process.cwd()) {
    const format = (data) => {
        const separator = `\x1b[2m${"–".repeat(5)}\x1b[0m`;
        return [
            separator,
            `\x1b[2m${cmd}\x1b[0m`,
            data,
            separator
        ].join("\n");
    };

    try {
        console.log(format(execSync(cmd, { cwd }).toString().trim()));
    } catch(err) {
        throw format(err.stderr ?? err);
    }
}