#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
mod models;mod database;mod scanner;mod commands;mod security;mod updates;mod permissions;
fn main(){
 let db=database::Database::open().unwrap_or_else(|e|panic!("database init failed: {e}"));
 tauri::Builder::default().manage(db).invoke_handler(tauri::generate_handler![commands::scan_applications,commands::get_applications,commands::get_updates,commands::get_permissions,commands::get_settings,commands::save_setting,commands::get_system_info,commands::run_operation,commands::open_application]).run(tauri::generate_context!("tauri.conf.json")).expect("error while running Rex Application Manager");
}
