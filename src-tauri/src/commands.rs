use tauri::State;
use crate::{database::Database,scanner,models::{ApplicationRecord,OperationRequest,OpenRequest}};
use std::{collections::BTreeMap,process::Command};

#[tauri::command]
pub fn scan_applications(db:State<Database>) -> Result<(),String>{let apps=scanner::scan();db.replace_applications(&apps).map_err(|e|e.to_string())}

#[tauri::command]
pub fn get_applications(db:State<Database>)->Result<Vec<ApplicationRecord>,String>{db.applications().map_err(|e|e.to_string())}

#[tauri::command]
pub fn get_updates()->Vec<crate::models::UpdateRecord>{crate::updates::detect_updates()}

#[tauri::command]
pub fn get_permissions()->Vec<crate::models::PermissionRecord>{crate::permissions::inspect_permissions()}

#[tauri::command]
pub fn get_settings(db:State<Database>)->Result<BTreeMap<String,String>,String>{db.settings().map_err(|e|e.to_string())}

#[tauri::command]
pub fn save_setting(db:State<Database>,key:String,value:String)->Result<(),String>{db.save_setting(&key,&value).map_err(|e|e.to_string())}

#[tauri::command]
pub fn get_system_info()->BTreeMap<String,String>{
 let mut m=BTreeMap::new();
 m.insert("OS".into(),std::fs::read_to_string("/etc/os-release").ok().and_then(|s|s.lines().find(|l|l.starts_with("PRETTY_NAME=")).map(|l|l.trim_matches('"').trim_start_matches("PRETTY_NAME=").into())).unwrap_or_else(||"Linux".into()));
 m.insert("Architecture".into(),Command::new("uname").arg("-m").output().ok().map(|o|String::from_utf8_lossy(&o.stdout).trim().into()).unwrap_or_else(||"Unknown".into()));
 m.insert("Kernel".into(),Command::new("uname").arg("-r").output().ok().map(|o|String::from_utf8_lossy(&o.stdout).trim().into()).unwrap_or_else(||"Unknown".into()));
 m
}

#[tauri::command]
pub fn run_operation(request:OperationRequest)->Result<String,String>{crate::security::authorize(request)}

#[tauri::command]
pub fn open_application(request:OpenRequest)->Result<String,String>{
 match request.source.as_str(){
  "Flatpak"=>Command::new("flatpak").arg("run").arg(&request.application_id).spawn().map_err(|e|e.to_string()).map(|_|"Launched Flatpak application".into()),
  "Desktop Entry"=>Command::new("gtk-launch").arg(&request.application_id).spawn().map_err(|e|e.to_string()).map(|_|"Launched desktop application".into()),
  _=>Err("This application source does not provide a supported launch method".into())
 }
}
