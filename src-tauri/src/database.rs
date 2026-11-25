use rusqlite::{Connection,params};
use std::sync::Mutex;
use std::collections::BTreeMap;
use crate::models::ApplicationRecord;

pub struct Database{conn:Mutex<Connection>}
impl Database{
 pub fn open()->rusqlite::Result<Self>{let mut dir=dirs::config_dir().unwrap_or_else(std::env::temp_dir);dir.push("rex-application-manager");std::fs::create_dir_all(&dir).ok();dir.push("rex.sqlite");let conn=Connection::open(dir)?;conn.execute_batch(include_str!("../../migrations/001_init.sql"))?;Ok(Self{conn:Mutex::new(conn)})}
 pub fn replace_applications(&self,apps:&[ApplicationRecord])->rusqlite::Result<()>{let mut c=self.conn.lock().unwrap();let tx=c.transaction()?;tx.execute("DELETE FROM applications",[])?;for a in apps{tx.execute("INSERT INTO applications(name,package_id,version,description,source,path,icon,update_available) VALUES(?,?,?,?,?,?,?,?)",params![a.name,a.package_id,a.version,a.description,a.source,a.path,a.icon,a.update_available])?;}tx.execute("INSERT INTO scan_history(status,application_count) VALUES('completed',?)",[apps.len() as i64])?;tx.commit()}
 pub fn applications(&self)->rusqlite::Result<Vec<ApplicationRecord>>{let c=self.conn.lock().unwrap();let mut q=c.prepare("SELECT id,name,package_id,version,description,source,path,icon,update_available FROM applications ORDER BY name")?;let rows=q.query_map([],|r|Ok(ApplicationRecord{id:r.get(0)?,name:r.get(1)?,package_id:r.get(2)?,version:r.get(3)?,description:r.get(4)?,source:r.get(5)?,path:r.get(6)?,icon:r.get(7)?,update_available:r.get::<_,i64>(8)!=0}))?;rows.collect()}
 pub fn settings(&self)->rusqlite::Result<BTreeMap<String,String>>{let c=self.conn.lock().unwrap();let mut q=c.prepare("SELECT key,value FROM settings")?;let rows=q.query_map([],|r|Ok((r.get::<_,String>(0)?,r.get::<_,String>(1)?)))?;let mut m=BTreeMap::new();for row in rows{let (k,v)=row?;m.insert(k,v);}Ok(m)}
 pub fn save_setting(&self,key:&str,value:&str)->rusqlite::Result<()>{self.conn.lock().unwrap().execute("INSERT INTO settings(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value",params![key,value]).map(|_|())}
}
