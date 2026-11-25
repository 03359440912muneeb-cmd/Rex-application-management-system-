# Testing

Run frontend checks:

```bash
npm install
npm run build
```

Run Rust checks:

```bash
cd src-tauri
cargo fmt --check
cargo test
cargo build
```

No destructive package operation should be executed during automated tests. Use command fixtures and local temporary directories.
