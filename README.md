# Saber Token Functions

Saber token math utilities, built to minimize bundle size.

## Releases

To release a new version of this repo, run:

```
gh workflow run release.yml -f version=<version>
```

where `<version>` is one of `patch`, `major`, `minor`, or a specific version. This internally uses the [Yarn version](https://github.com/yarnpkg/berry/tree/master/packages/plugin-version) plugin.

## License

Apache-2.0
