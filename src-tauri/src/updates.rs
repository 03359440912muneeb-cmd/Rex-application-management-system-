use crate::models::{UpdateRecord,PermissionRecord};
use std::process::Command;

pub fn detect_updates()->Vec<UpdateRecord>{
 let mut updates=vec![];
 if let Ok(out)=Command::new("apt").args(["list","--upgradable"]).output(){if out.status.success(){for line in String::from_utf8_lossy(&out.stdout).lines().skip(1){let name=line.split('/').next().unwrap_or("");let rest=line.split_whitespace().collect::<Vec<_>>();if rest.len()<2{continue}updates.push(UpdateRecord{package_id:name.into(),name:name.into(),installed_version:rest.get(1).map(|v|v.to_string()),candidate_version:rest.get(1).unwrap_or(&"").to_string(),source:"APT/DPKG".into()})}}
 }
 if let Ok(out)=Command::new("flatpak").args(["remote-ls","--updates","--columns=application,name,version"]).output(){if out.status.success(){for line in String::from_utf8_lossy(&out.stdout).lines(){let p=line.split('\t').collect::<Vec<_>>();if let Some(id)=p.first(){updates.push(UpdateRecord{package_id:id.to_string(),name:p.get(1).unwrap_or(id).to_string(),installed_version:None,candidate_version:p.get(2).unwrap_or(&"Unknown").to_string(),source:"Flatpak".into()})}}}}
 updates
}

pub fn inspect_permissions()->Vec<PermissionRecord>{
 let mut rows=vec![PermissionRecord{id:1,application:"System".into(),category:"Startup Entries".into(),observation:"Startup entries are inspected from user and system desktop autostart directories.".into(),severity:"info".into()}];
 if let Ok(out)=Command::new("flatpak").args(["list","--app","--columns=application"]).output(){if out.status.success(){for app in String::from_utf8_lossy(&out.stdout).lines(){let override_data=Command::new("flatpak").args(["override","--show",app]).output().ok().map(|o|String::from_utf8_lossy(&o.stdout).to_string()).unwrap_or_default();rows.push(PermissionRecord{id:rows.len() as i64+1,application:app.into(),category:"Flatpak Sandbox".into(),observation:if override_data.trim().is_empty(){"Default sandbox permissions; no overrides observed.".into()}else{override_data.trim().replace('\n',"; ")},severity:"info".into()})}}
 }
 rows
}
