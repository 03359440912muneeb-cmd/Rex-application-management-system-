# Rex Application Manager

A Tauri desktop application manager for MX Linux, built with React, TypeScript, Rust, SQLite, and an optional modular C++ native engine.

## Development

```bash
npm install
npm run build
cd src-tauri
cargo build
cargo tauri dev
```

## Safety

The application never runs as root, never stores credentials, and uses `pkexec`/Polkit only for explicitly requested privileged operations. The system scanner uses fixed commands and never executes discovered AppImages.

## Architecture

See `docs/ARCHITECTURE.md` and `docs/SECURITY.md`.
