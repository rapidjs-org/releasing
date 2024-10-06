const util = require("./util"); 


class AClient {
    constructor(registryName, cwd) {
        this.registryName = registryName;
        this.cwd = cwd;
    }

    #throwNotImplemented(...args) {
        throw new Error(`Missing method implementation _(__[{${args.length}])`);
    }

    exec(cmd) {
        util.exec(cmd, this.cwd);
    }

    bumpVersion(newVersion) {
        this.#throwNotImplemented(newVersion);
    }

    publish() {
        this.#throwNotImplemented();
    }
}


module.exports.NPMClient = class extends AClient {
    constructor(cwd) {
        super("NPM", cwd);
    }

    bumpVersion(newVersion) {
        this.exec(`npm version ${newVersion}`);
    }
    
    publish() {
        this.exec("npm publish --access public");
    }
}

module.exports.YarnClient = class extends AClient {
    constructor(cwd) {
        super("NPM", cwd);
    }

    bumpVersion(newVersion) {
        this.exec(`yarn version --new-version ${newVersion}`);
    }
    
    publish() {
        this.exec("yarn publish");
    }
}