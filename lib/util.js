const { execSync } = require("child_process");


module.exports.exec = function(cmd, cwd = process.cwd(), silent = false) {
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
        const res = execSync(cmd, {
            cwd,
            ...silent ? {
                stdio: "pipe"
            } : {}
        }).toString().trim();

        if(silent) return res;
        
        console.log(format(res));
    } catch(err) {
        throw format(err.stderr ?? err);
    }
}