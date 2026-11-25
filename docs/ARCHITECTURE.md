# Architecture

React communicates only through typed Tauri commands. Rust coordinates scanning, persistence, and authorized system operations. SQLite stores normalized application metadata and history. The C++ engine is isolated behind an explicit C ABI and is not needed for the default Python-free file scanners.

## Data flow

1. React invokes `scan_applications`.
2. Rust executes fixed discovery commands or reads known locations.
3. Results are normalized and stored in SQLite.
4. React loads applications with `get_applications`.
5. Destructive operations are validated and sent through `pkexec`.
