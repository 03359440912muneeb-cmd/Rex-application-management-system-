use serde::{Serialize,Deserialize};

#[derive(Debug,Clone,Serialize,Deserialize)]
pub struct ApplicationRecord {
 pub id:i64, pub name:String, pub package_id:String, pub version:Option<String>,
 pub description:Option<String>, pub source:String, pub path:Option<String>,
 pub icon:Option<String>, pub update_available:bool,
}

#[derive(Debug,Clone,Serialize,Deserialize)]
pub struct UpdateRecord {
 pub package_id:String, pub name:String, pub installed_version:Option<String>,
 pub candidate_version:String, pub source:String,
}

#[derive(Debug,Clone,Serialize,Deserialize)]
pub struct PermissionRecord {
 pub id:i64, pub application:String, pub category:String, pub observation:String,
 pub severity:String,
}

#[derive(Debug,Clone,Serialize,Deserialize)]
pub struct OperationRequest { pub action:String,pub package_ids:Vec<String>,pub package_source:String }

#[derive(Debug,Clone,Serialize,Deserialize)]
pub struct OpenRequest { pub application_id:String,pub source:String,pub path:Option<String> }
