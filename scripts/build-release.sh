#!/bin/bash
set -e
cd "$(dirname "$0")/../.."
cd src-tauri
cargo build --release
