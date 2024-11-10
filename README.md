# rJS Releasing

Java- and TypeScript package release helper utility (NPM).

``` cli
npm install -D @rapidjs.org/releasing
```

## Prerequisites

- [NPM](https://www.npmjs.com) CLI (latest)

## Usage

``` console
(npx) rjs-releasing <package-path>?
```

> If no package directory path is specified, the current working directory is used.

| Flag | Description |
| :- | :- |
| `--github` | Open a GitHub release creation for a package tag. |
| `--stacktrace` | Always print the full stack trace of errors. |
| `--dry-run` | Perform a publish cycle without an actual push to the registry (NPM only). |

| Option | Description |
| :- | :- |
| `--client` | Specify registry client to use (default 'npm', or 'yarn'). |

> Run `npx rjs-releasing help` to display information about the CLI.

##

<sub>© Thassilo Martin Schiepanski</sub>
