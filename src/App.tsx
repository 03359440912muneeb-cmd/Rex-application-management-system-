import { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import { Boxes, LayoutDashboard, RefreshCw, ShieldCheck, Settings, Info, Search, Grid3X3, List, Download, Trash2, PackageCheck } from 'lucide-react';

type AppRecord = { id:number; name:string; package_id:string; version:string|null; description:string|null; source:string; path:string|null; icon:string|null; update_available:boolean };
const nav = [
  ['Dashboard',LayoutDashboard],['Applications',Boxes],['Updates',RefreshCw],['Permissions',ShieldCheck],['Install / Remove',PackageCheck],['Settings',Settings],['About',Info]
] as const;

export default function App(){
  const [page,setPage]=useState('Dashboard'); const [apps,setApps]=useState<AppRecord[]>([]); const [query,setQuery]=useState('');
  const [source,setSource]=useState('All'); const [view,setView]=useState<'grid'|'list'>('grid'); const [scanning,setScanning]=useState(false);
  const [system,setSystem]=useState<Record<string,string>>({});

  async function scan(){ setScanning(true); try { await invoke('scan_applications'); await load(); } finally { setScanning(false); } }
  async function load(){ const data=await invoke<AppRecord[]>('get_applications'); setApps(data); setSystem(await invoke<Record<string,string>>('get_system_info')); }
  useEffect(()=>{load().catch(()=>{});},[]);
  const filtered=apps.filter(a=>(source==='All'||a.source===source)&&`${a.name} ${a.description||''}`.toLowerMatch(query));
  const updates=apps.filter(a=>a.update_available).length;

  return <div className="shell">
    <aside><div className="brand"><div className="brand-mark">R</div><div><b>REX</b><span>Application Manager</span></div></div>
      <nav>{nav.map(([label,Icon])=><button key={label} className={page===label?'active':''} onClick={()=>setPage(label)}><Icon size={18}/><span>{label}</span></button>)}</nav>
      <div className="dragon" aria-hidden="true"><i/><i/><i/><i/></div>
    </aside>
    <main>
      <header><div><p>{page==='Dashboard'?'SYSTEM OVERVIEW':'APPLICATION MANAGEMENT'}</p><h1>{page}</h1></div><button className="scan" onClick={scan} disabled={scanning}><RefreshCw className={scanning?'spin':''} size={16}/>{scanning?'Scanning…':'Scan System'}</button></header>
      {(page==='Dashboard'||page==='Applications'||page==='Updates')&&<>
        {page==='Dashboard'&&<section className="stats">
          <Stat label="Installed applications" value={apps.length} accent="red"/><Stat label="Available updates" value={updates} accent="blue"/><Stat label="Permission warnings" value={0} accent="copper"/><Stat label="Sources scanned" value={new Set(apps.map(a=>a.source)).size} accent="red"/>
        </section>}
        {page==='Dashboard'&&<section className="dashboard-grid"><div className="panel"><div className="panel-title"><span>System Information</span></div><dl>{Object.entries(system).map(([k,v])=>[k,v] as [string,string]).map(([k,v])=><div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl></div><div className="panel"><div className="panel-title"><span>Quick Actions</span></div><div className="quick"><button onClick={scan}>Scan applications</button><button onClick={()=>setPage('Updates')}>Check updates</button><button onClick={()=>setPage('Permissions')}>Inspect permissions</button></div></div></section>}
        <section className="panel apps-panel"><div className="toolbar"><div className="search"><Search size={16}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search applications"/></div><select value={source} onChange={e=>setSource(e.target.value)}><option>All</option>{[...new Set(apps.map(a=>a.source))].map(s=><option key={s}>{s}</option>)}</select><button className={view==='grid'?'selected':''} onClick={()=>setView('grid')}><Grid3X3 size={16}/></button><button className={view==='list'?'selected':''} onClick={()=>setView('list')}><List size={16}/></button></div>
          {filtered.length===0?<div className="empty">No applications loaded. Run a system scan.</div>:<div className={view==='grid'?'app-grid':'app-list'}>{filtered.map(a=><article className="app-card" key={a.id}><div className="app-icon">{a.name.slice(0,1).toUpper()}</div><div><h3>{a.name}</h3><p>{a.version||'Unknown version'} · {a.source}</p></div>{a.update_available&&<span className="update-badge">Update</span>}</article>)}</div>}
        </section>
      </>}
      {page==='Updates'&&<section className="panel"><div className="panel-title"><span>Available Updates</span><b>{updates}</b></div>{updates?filtered.filter(a=>a.update_available).map(a=><div className="operation-row" key={a.id}><b>{a.name}</b><span>{a.version}</span><button><Download size={15}/>Update</button></div>):<div className="empty">No updates detected.</div>}</section>}
      {page==='Permissions'&&<section className="panel"><div className="panel-title"><span>Security Observations</span></div><div className="empty">Flatpak and startup-entry inspections appear here after the first scan.</div></section>}
      {page==='Install / Remove'&&<section className="panel"><div className="panel-title"><span>Application Operations</span></div><div className="operation-list"><button><Download/>Install application</button><button><Trash2/>Remove application</button></div><p className="notice">Privileged operations require PolicyKit authentication and explicit confirmation.</p></section>}
      {page==='Settings'&&<section className="panel settings"><label>Scan locations<textarea defaultValue={`${'~'}/Applications\n${'~'}/AppImages\n${'~'}/bin`}/></label><label>Package sources<label className="check"><input type="checkbox" defaultChecked/> APT/DPKG</label><label className="check"><input type="checkbox" defaultChecked/> Flatpak</label></label></section>}
      {page==='About'&&<section className="panel about"><h2>Rex Application Manager</h2><p>A professional Linux application management desktop built for MX Linux.</p><code>React + TypeScript · Rust · Tauri · SQLite · C++</code></section>}
    </main>
  </div>
}
function Stat({label,value,accent}:{label:string,value:number,accent:string}){return <div className={'stat '+accent}><div><p>{label}</p><strong>{value}</strong></div><PackageCheck/></div>}
declare global { interface String { toLowerMatch(query:string): boolean } }
String.prototype.toLowerMatch=function(query:string){return this.toLowerCase().includes(query.toLowerCase())};
