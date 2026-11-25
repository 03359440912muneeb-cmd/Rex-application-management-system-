#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
mod models;
mod database;
mod scanner;
mod commands;
mod security;

use tauri::Manager;

fn main(){
  let db=database::Database::open().unwrap_or_else(|e| panic!("database init failed: {e}"));
  tauri::Builder::default()
    .manage(db)
    .invoke_handler(tauri::generate_handler![
      commands::scan_applications,
      commands::get_applications,
      commands::get_system_info,
      commands::run_operation
    ])
    .setup(|app| { app.get_window("main").map(|w| w.set_title("Rex Application Manager")); Ok(()) })
    .run(tauri::generate_context!("tauri.conf.json"))
    .expect("error while running Rex Application Manager");
}
