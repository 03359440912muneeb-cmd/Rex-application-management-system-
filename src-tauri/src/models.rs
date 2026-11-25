use serde::{Serialize,Deserialize};

#[derive(Debug,Clone,Serialize,Deserialize)]
pub struct ApplicationRecord {
 pub id:i64, pub name:String, pub package_id:String, pub version:Option<String>,
 pub description:Option<String>, pub source:String, pub path:Option<String>,
 pub icon:Option<String>, pub update_available:bool,
}

#[derive(Debug,Clone,Serialize,Deserialize)]
pub struct OperationRequest { pub action:String,pub package_ids:Vec<String>,pub package_source:String }
