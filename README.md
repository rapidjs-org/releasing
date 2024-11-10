# rJS Releasing

Java- and TypeScript package release helper utility (NPM). Works with single package repos, as well as with multi-package monorepos.

``` cli
npm install -D @rapidjs.org/releasing
```

## Prerequisites

- [NPM](https://www.npmjs.com)
- Registry CLI (if not NPM)

## Usage

Execute the release command int the repository root (also in monorepos).

``` console
(npx) rjs-releasing <package-path>?
```

> If no package directory path is specified, the current working directory is used.

> The version bump is balanced, i.e. all packages in a monorepo are updated to the maximum next version according to the release type. E.g., a minor of `0.5.13` and `1.0.1` would result in all `1.1.0`.

| Flag | Description |
| :- | :- |
| `--github` | Open a GitHub release creation for a package tag. |
| `--stacktrace` | Always print the full stack trace of errors. |
| `--dry-run` | Perform a publish cycle without an actual push to the registry (NPM only). |

| Option | Description |
| :- | :- |
| `--client` | Specify registry client to use (default 'npm', or 'yarn'). |

> Run `npx rjs-releasing help` to display information about the CLI.

### Monorepo package filter

In order to whitelist paclages to consider for a balanced release, provide a `release.deps.json`. All packages (paths) stated in an array are filtered for the release. Any other package in the monorepo setup is then ignored.

``` json
[
  "./packages/b",
  "./packages/a"
]
```

##

<sub>© Thassilo Martin Schiepanski</sub>
