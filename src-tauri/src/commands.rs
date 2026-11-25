use tauri::State;
use crate::{database::Database,scanner,models::{ApplicationRecord,OperationRequest}};

#[tauri::command]
pub fn scan_applications(db:State<Database>) -> Result<(),String>{let apps=scanner::scan();db.replace_applications(&apps).map_err(|e|e.to_string())}

#[tauri::command]
pub fn get_applications(db:State<Database>)->Result<Vec<ApplicationRecord>,String>{db.applications().map_err(|e|e.to_string())}

#[tauri::command]
pub fn get_system_info()->std::collections::BTreeMap<String,String>{
 let mut m=std::collections::BTreeMap::new();
 m.insert("OS".into, std::fs::read_to_string("/etc/os-release").ok().and_then(|s|s.lines().find(|l|l.starts_with("PRETTY_NAME=")).map(|l|l.trim_matches('"').trim_start_matches("PRETTY_NAME=").into())).unwrap_or_else(||"Linux".into()));
 m.insert("Architecture".into,std::process::Command::new("uname").arg("-m").output().ok().map(|o|String::from_utf8_lossy(&o.stdout).trim().into()).unwrap_or_else(||"Unknown".into()));
 m.insert("Kernel".into,std::process::Command::new("uname").arg("-r").output().ok().map(|o|String::from_utf8_lossy(&o.stdout).trim().into()).unwrap_or_else(||"Unknown".into()));
 m
}

#[tauri::command]
pub fn run_operation(request:OperationRequest)->Result<String,String>{crate::security::authorize(request)}
