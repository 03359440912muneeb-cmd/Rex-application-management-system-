use std::{fs,process::Command,path::PathBuf};
use crate::models::ApplicationRecord;

pub fn scan()->Vec<ApplicationRecord>{
 let mut apps=scan_desktop_entries(); apps.extend(scan_apt()); apps.extend(scan_flatpak()); apps.extend(scan_appimages());
 let mut seen=std::collections::HashSet::new(); apps.retain(|a|seen.insert((a.name.to_lowercase(),a.source.clone())));
 apps.sort_by(|a,b|a.name.to_lowercase().cmp(&b.name.to_lowercase())); apps
}

fn scan_apt()->Vec<ApplicationRecord>{
 let Ok(out)=Command::new("dpkg-query").args(["-W","-f=${binary:Package}\t${Version}\t${binary:Summary}\n"]).output() else{return vec![]};
 if !out.status.success(){return vec![]}
 String::from_utf8_lossy(&out.stdout).lines().filter_map(|line|{let p:Vec<&str>=line.splitn(3,'\t').collect();if p.len()<2{return None}let package=p[0];let status=std::fs::read_to_string(format!("/var/lib/dpkg/status")).unwrap_or_default();if !status.contains(&format!("Package: {package}")){return None}Some(ApplicationRecord{id:0,name:package.replace('-',' '),package_id:package.into(),version:Some(p[1].into()),description:p.get(2).map(|v|v.to_string()),source:"APT/DPKG".into(),path:Some("/var/lib/dpkg/status".into()),icon:None,update_available:false})}).collect()
}

fn scan_flatpak()->Vec<ApplicationRecord>{
 let Ok(out)=Command::new("flatpak").args(["list","--app","--columns=application,name,version,branch,arch,origin"]).output() else{return vec![]};
 if !out.status.success(){return vec![]}
 String::from_utf8_lossy(&out.stdout).lines().filter_map(|l|{let p:Vec<&str>=l.split('\t').collect();let id=*p.first()?;Some(ApplicationRecord{id:0,name:p.get(1).copied().unwrap_or(id).into(),package_id:id.into(),version:p.get(2).map(|v|v.to_string()),description:p.get(5).map(|v|format!("Remote: {v}")),source:"Flatpak".into(),path:Some(format!("/var/lib/flatpak/app/{id}")),icon:None,update_available:false})}).collect()
}

fn scan_appimages()->Vec<ApplicationRecord>{
 let home=std::env::var("HOME").unwrap_or_else(|_|"/root".into());let dirs=[format!("{home}/Applications"),format!("{home}/AppImages"),format!("{home}/bin")];
 let mut result=vec![];for dir in dirs{let Ok(entries)=fs::read_dir(&dir)else{continue};for e in entries.flatten(){let p=e.path();if p.is_file()&&p.extension().and_then(|x|x.to_str()).is_some_and(|x|x.eq_ignore_ascii_case("appimage")||x.eq_ignore_ascii_case("AppImage")){let n=p.file_stem().and_then(|x|x.to_str()).unwrap_or("AppImage").to_string();result.push(ApplicationRecord{id:0,name:n.clone(),package_id:p.to_string_lossy().into_owned(),version:None,description:Some("AppImage executable (not executed during scan)".into()),source:"AppImage".into(),path:Some(p.to_string_lossy().into_owned()),icon:None,update_available:false})}}}result
}

fn scan_desktop_entries()->Vec<ApplicationRecord>{
 let mut dirs=vec![PathBuf::from("/usr/share/applications")];if let Ok(home)=std::env::var("HOME")dirs.push(PathBuf::from(home).join(".local/share/applications"));
 let mut result=vec![];for dir in dirs{let Ok(entries)=fs::read_dir(dir)else{continue};for e in entries.flatten(){let p=e.path();if p.extension().and_then(|x|x.to_str())!=Some("desktop"){continue}let text=match fs::read_to_string(&p){Ok(v)=>v,Err(_)=>continue};if text.contains("NoDisplay=true")||text.contains("Hidden=true")||text.contains("OnlyShowIn="){continue}let mut name=None;let mut exec=None;let mut icon=None;for l in text.lines(){if let Some(v)=l.strip_prefix("Name="){name=Some(v.to_string())}if let Some(v)=l.strip_prefix("Exec="){exec=Some(v.to_string())}if let Some(v)=l.strip_prefix("Icon="){icon=Some(v.to_string())}}if let Some(name)=name{let id=p.file_stem().and_then(|x|x.to_str()).unwrap_or(&name).to_string();result.push(ApplicationRecord{id:0,name:name.clone(),package_id:id,version:None,description:exec.map(|v|format!("Desktop entry: {v}")),source:"Desktop Entry".into(),path:Some(p.to_string_lossy().into_owned()),icon,update_available:false})}}}result
}
