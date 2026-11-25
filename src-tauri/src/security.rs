use crate::models::OperationRequest;
use std::process::Command;

pub fn authorize(request:OperationRequest)->Result<String,String>{
 if request.package_ids.is_empty(){return Err("No package selected".into())}
 if request.package_ids.iter().any(|p|p.chars().any(|c|c.is_whitespace()||matches!(c,';'|'|'|'&'|'`'|'$'|'<'|'>'|'\n'|'\r'))){return Err("Invalid package identifier".into())}
 let args=match (request.package_source.as_str(),request.action.as_str()){
  ("APT/DPKG","install")=>vec!["apt","install","-y"],
  ("APT/DPKG","remove")=>vec!["apt","remove","-y"],
  ("Flatpak","install")=>vec!["flatpak","install","-y"],
  ("Flatpak","remove")=>vec!["flatpak","uninstall","-y"],
  _=>return Err("Unsupported operation".into())
 };
 let mut cmd=Command::new("pkexec"); cmd.arg(args[0]); for a in &args[1..]{cmd.arg(a)} for p in request.package_ids{cmd.arg(p)}
 let out=cmd.output().map_err(|e|format!("Could not start Polkit authorization: {e}"))?;
 if out.status.success(){Ok("Operation completed".into())}else{Err(String::from_utf8_lossy(&out.stderr).trim().to_string())}
}
