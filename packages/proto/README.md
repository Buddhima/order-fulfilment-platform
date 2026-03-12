# Protobuf Workspace

This package owns protobuf contracts, buf configuration, generated stubs, and local tarball packaging.

Supported Node version for host-side tooling in this workspace: `>=24.0.0`.

Common commands:

```bash
npm run lint
npm run stubs
npm run pack:local
```

Contract sources are in `proto/`.
Generated stubs are output to `build/`.
Packed local artefacts are output to `dist/`.

Notes:

- Run these commands from `packages/proto`.
- This workspace is the host-side tooling exception; its `node_modules/` directory is installed locally rather than through Docker.
- `npm run lint` and `npm run stubs` expect `packages/proto/node_modules` to already exist.
- `npm run pack:local` is bootstrap-friendly and installs `packages/proto` dependencies on demand before generating stubs.
