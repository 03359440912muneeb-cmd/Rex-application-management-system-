# Rex Application Manager

Rex is a desktop application manager for MX Linux and other Debian-based Linux distributions. It provides a dark, desktop-style interface for discovering and viewing installed applications, checking updates, reviewing system details and permissions, and initiating application install/remove operations.

The project combines a React/TypeScript interface with a Rust/Tauri backend and an optional C++ native engine. It uses SQLite for local application metadata and settings, and uses fixed system commands such as `dpkg-query`, `apt`, `flatpak`, `pkexec`, and `uname` instead of executing arbitrary shell input.

> **Project status:** initial implementation (v0.1.0). The project foundation and core discovery paths are implemented, but real-machine MX Linux build verification and privileged-operation integration testing remain outstanding.

## Features

- Discover applications from:
  - APT/DPKG packages
  - Flatpak applications
  - AppImages in `~/Applications`, `~/AppImages`, and `~/bin`
  - Desktop entries in `/usr/share/applications` and `~/.local/share/applications`
- Browse applications in grid or list mode and filter by source.
- Search by application name or package ID.
- Open a selected application's details page.
- Launch supported Flatpak applications with `flatpak run`.
- Launch desktop applications with `gtk-launch`.
- Detect APT and Flatpak updates.
- Inspect system OS, kernel, architecture, and basic hardware information.
- Store normalized application records and settings in a local SQLite database.
- Initiate APT and Flatpak install/remove operations through PolicyKit (`pkexec`).
- Inspect startup entries and Flatpak override files for basic permission information.
- Include an optional C++ module with a plugin API and Rex theme metadata.

The React UI includes sample application records as a fallback so it remains presentable before the Tauri backend or real application scan is available.

## Architecture

```text
React / TypeScript UI
        |
        | typed @tauri-apps/api invoke() calls
        v
Rust/Tauri command layer
        |
        +--> scanner.rs       -> APT, Flatpak, AppImage, desktop entries
        +--> database.rs      -> SQLite application/settings persistence
        +--> updates.rs       -> APT/Flatpak update detection
        +--> permissions.rs   -> basic startup/Flatpak permission inspection
        +--> security.rs      -> package validation and pkexec authorization
        +--> commands.rs      -> system info and frontend-facing commands

Optional C++ engine
        --> static library and loadable rex_cpp_plugin module
```

The data flow is:

1. The React frontend calls `scan_applications` through Tauri.
2. The Rust scanner reads fixed Linux sources and AppImage directories.
3. Duplicate application/source pairs are removed and the results are sorted.
4. `database.rs` replaces the application table contents with the scanned records.
5. The frontend calls `get_applications` and renders the normalized records.
6. Privileged operations pass a structured `OperationRequest` through `security.rs`, where package IDs are validated and the fixed `apt` or `flatpak` command is executed through `pkexec`.

## Technology stack

- **Desktop runtime:** Tauri 1.6 era
- **Frontend:** React 18, TypeScript, Vite 6
- **Icons:** Lucide React
- **Backend:** Rust 2021 edition
- **Database:** SQLite through bundled `rusqlite`
- **Native extension:** C++20 plus CMake 3.20
- **Authorization:** Linux PolicyKit via `pkexec`
- **Platform target:** MX Linux / Debian-style package environment

### Main Rust dependencies

- `tauri` — desktop runtime and typed command bridge
- `serde` / `serde_json` — serialization between React and Rust
- `rusqlite` — SQLite persistence
- `chrono` — timestamp support
- `tauri-build` — Tauri build integration

### Main frontend dependencies

- `@tauri-apps/api` — Tauri command invocation
- `react` / `react-dom` — UI runtime
- `lucide-react` — interface icons
- Vite and `@vitejs/plugin-react` — development server and build tooling

## Project structure

```text
src/                    React frontend
  App.tsx               Main pages, navigation, application state, UI components
  main.tsx              React entry point
  styles.css            Desktop UI styles
  assets/               Dragon, circuit, and other visual assets

src-tauri/              Rust/Tauri desktop backend
  src/main.rs           Tauri application entry point and command registration
  src/commands.rs       Frontend-facing Tauri commands
  src/scanner.rs        APT, Flatpak, desktop-entry, and AppImage discovery
  src/database.rs       SQLite connection and persistence helpers
  src/models.rs         Shared serialized application/update/operation types
  src/security.rs       Package validation and privileged operation boundary
  src/updates.rs        APT and Flatpak update detection
  src/tauri.conf.json   Tauri package and bundle configuration
  Cargo.toml            Rust package and dependencies

cpp-engine/             Optional C++20 native module
  include/              Public native-engine declarations
  src/native_engine.cpp Native engine implementation
  src/rex_cpp_plugin.cpp Loadable plugin and theme JSON API
  tests/                C++ test target

migrations/             SQL database schema
  001_init.sql          Applications, history, and settings tables

docs/                   Architecture, security, installation, and testing notes
packaging/             Desktop packaging assets
scripts/                Release and GitHub helper shell scripts
README.md               Project overview
CHANGELOG.md            Release history
TASKS.md                Completed work and outstanding tasks
CONTRIBUTING.md         Development constraints
```

The C++ module is currently an independent optional native component. The Rust application does not yet expose C++ plugin calls as Tauri commands, so the React UI does not currently depend on the C++ layer.

## Frontend pages

The main UI is implemented in `src/App.tsx` and includes:

- **Dashboard** — system overview, application statistics, quick actions, recent activity, and application library.
- **Applications** — searchable application list/grid with APT, Flatpak, AppImage, and desktop-entry filtering.
- **Updates** — update availability UI backed by APT and Flatpak update detection commands.
- **Permissions** — startup-entry and application permission observations.
- **Details** — package name, version, source, path, description, and launch/remove actions.
- **Install / Remove** — package operation interface.
- **Settings** — scan locations and application behavior settings.
- **About** — product and version information.

## Backend commands

The Tauri command handlers registered in `src-tauri/src/main.rs` are:

| Command | Purpose |
| --- | --- |
| `scan_applications` | Scan supported sources and replace SQLite application records. |
| `get_applications` | Return persisted application records. |
| `get_updates` | Detect APT and Flatpak updates. |
| `get_permissions` | Inspect startup entries and Flatpak override data. |
| `get_system_info` | Read OS, kernel, architecture, and host information. |
| `get_settings` | Read saved settings. |
| `save_setting` | Persist or update a setting. |
| `run_operation` | Validate and run an install/remove operation through `pkexec`. |
| `open_application` | Launch a supported Flatpak or desktop-entry application. |

## Database

SQLite is stored under the platform configuration directory as:

```text
rex-application-manager/rex.sqlite
```

The schema in `migrations/001_init.sql` defines:

- `applications` — normalized discovered applications
- `scan_history` — scan status and application counts
- `operation_history` — package operation audit records
- `settings` — key/value application settings

The schema migration is currently documented as SQL. `database.rs` opens SQLite directly and creates the required tables with its own SQL setup.

## Security boundary

Rex is designed around an explicit security boundary:

- The GUI does not run as root.
- React never executes shell commands.
- The backend uses fixed executable names and separately supplied arguments.
- Package IDs are rejected if they contain whitespace or shell metacharacters.
- Privileged operations are run through PolicyKit (`pkexec`) and require a system authorization dialog.
- Passwords are not requested or stored.
- AppImages are discovered from filesystem metadata and are never executed during scanning.
- Destructive operations require explicit UI confirmation before invoking the backend.

A preview, development build, or automated test must not perform real privileged package operations.

## Development setup

### Requirements

For MX Linux/Debian development, install:

- Node.js and npm
- Rust and Cargo
- Tauri 1.x system prerequisites, including WebKitGTK and development tools
- CMake 3.20+ only for the optional C++ engine
- Linux tools used by the project:
  - `dpkg-query`
  - `apt`
  - `flatpak` (for Flatpak support)
  - `pkexec`
  - `uname`
  - `gtk-launch`

Because this initial implementation has not been runtime-tested on the target host, verify the installed WebKitGTK and Rust versions before installing system packages or packaging a release.

### Install frontend dependencies

```bash
npm install
```

### Run the frontend in a browser

```bash
npm run dev
```

The Vite development server listens on `http://localhost:1420`.

Browser-only mode can render the UI, but Tauri command calls are unavailable unless the application is running inside Tauri.

### Run the Tauri desktop application

```bash
cd src-tauri
cargo tauri dev
```

The Tauri configuration runs `npm run dev` automatically before the desktop development process starts.

### Build the frontend

```bash
npm run build
npm run preview
```

### Build the Rust/Tauri application

```bash
cd src-tauri
cargo fmt --check
cargo test
cargo build
cargo tauri build
```

### Build and test the C++ engine

```bash
cmake -S cpp-engine -B build/cpp-engine
cmake --build build/cpp-engine
ctest --test-dir build/cpp-engine/cpp-engine/tests
```

Never run destructive package operations during automated tests. Tests should use fixtures and temporary directories.

## Packaging

A desktop entry template is available at:

```text
packaging/desktop/rex-application-manager.desktop
```

The Tauri bundle is configured with the product name **Rex Application Manager**, version `0.1.0`, and bundle identifier `io.rex.applicationmanager`.

Desktop packaging and icons are not yet complete.

## Known limitations

- The project is in foundation/initial-implementation stage.
- MX Linux compatibility has not been verified on a real target host.
- Privileged package operations have not completed integration testing.
- Update metadata for AppImages is not implemented.
- Flatpak permission parsing is still basic.
- Desktop packaging and icons require finalization.
- The C++ native plugin is not yet integrated into the Rust/Tauri command flow.
- Some UI sections still contain mocked counts or sample records until the corresponding backend logic is fully connected.

See `TASKS.md` for the current implementation checklist and `CHANGELOG.md` for release history.

## Documentation

- `docs/ARCHITECTURE.md` — system data flow and component responsibilities
- `docs/SECURITY.md` — security invariants and safe operating rules
- `docs/INSTALL_MX_LINUX.md` — MX Linux installation considerations
- `docs/TESTING.md` — frontend, Rust, and test expectations
- `CONTRIBUTING.md` — contribution and safety constraints

## Contributing

Use small milestone commits and run the frontend and Rust builds before submitting changes. Do not add arbitrary shell execution or password handling. Privileged and destructive operations must remain validated, audited where appropriate, and protected by explicit user and PolicyKit confirmation.
