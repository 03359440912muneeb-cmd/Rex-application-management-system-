import { useEffect, useState, type ReactNode } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import {
  LayoutDashboard, Grid2X2, RefreshCw, ShieldCheck, Info, Download,
  Settings, Search, List, Grid3X3, Package, HardDrive, Cpu, Clock3,
  Trash2, ExternalLink, ChevronLeft, ChevronRight, CheckCircle2, Zap,
  MonitorCog, X, Minus, Square
} from 'lucide-react';
import dragonUrl from './assets/rex-dragon.svg';
import circuitUrl from './assets/circuit-grid.svg';

type AppRecord = { id:number; name:string; package_id:string; version:string|null; description:string|null; source:string; path:string|null; icon:string|null; update_available:boolean };

const sampleApps: AppRecord[] = [
  {id:1,name:'Firefox',package_id:'firefox',version:'145.0.2',description:'Fast, secure and private web browser.',source:'APT (Debian)',path:'/usr/bin/firefox',icon:'firefox',update_available:false},
  {id:2,name:'LibreOffice',package_id:'libreoffice',version:'25.8.2',description:'Office productivity suite.',source:'APT (Debian)',path:'/usr/bin/libreoffice',icon:'libreoffice',update_available:false},
  {id:3,name:'VLC Media',package_id:'vlc',version:'3.0.21',description:'Cross-platform multimedia player.',source:'APT (Debian)',path:'/usr/bin/vlc',icon:'vlc',update_available:false},
  {id:4,name:'GIMP',package_id:'gimp',version:'3.0.4',description:'GNU image manipulation program.',source:'APT (Debian)',path:'/usr/bin/gimp',icon:'gimp',update_available:false},
  {id:5,name:'Visual Studio',package_id:'code',version:'1.107.1',description:'Source code editor.',source:'APT (Debian)',path:'/usr/bin/code',icon:'visualstudiocode',update_available:false},
  {id:6,name:'Discord',package_id:'discord',version:'0.0.345',description:'Voice, video and text communication.',source:'Flatpak',path:'/var/lib/flatpak/app/com.discordapp.Discord',icon:'discord',update_available:false}
];

const nav = [
  ['Dashboard',LayoutDashboard],['Applications',Grid2X2],['Updates',RefreshCw],['Permissions',ShieldCheck],['Details',Info],['Install / Remove',Download],['Settings',Settings],['About',Info]
] as const;

const iconUrl: Record<string,string> = {
  firefox:'https://cdn.simpleicons.org/firefox/FF7139', libreoffice:'https://cdn.simpleicons.org/libreoffice/18A303', vlc:'https://cdn.simpleicons.org/vlc/FF8800', gimp:'https://cdn.simpleicons.org/gimp/5C5543', visualstudiocode:'https://cdn.simpleicons.org/visualstudiocode/007ACC', discord:'https://cdn.simpleicons.org/discord/5865F2'
};

export default function App(){
  const [page,setPage]=useState('Dashboard');
  const [apps,setApps]=useState<AppRecord[]>(sampleApps);
  const [query,setQuery]=useState('');
  const [source,setSource]=useState('All');
  const [view,setView]=useState<'grid'|'list'>('grid');
  const [selected,setSelected]=useState<AppRecord>(sampleApps[0]);
  const [scanning,setScanning]=useState(false);
  const [liveTime,setLiveTime]=useState(new Date());
  const [system,setSystem]=useState<Record<string,string>>({Kernel:'6.16.0-2-amd64',Memory:'7.6 GB / 15.6 GB',CPU:'Intel Core i5-2520M'});

  useEffect(()=>{const timer=setInterval(()=>setLiveTime(new Date()),1000);load().catch(()=>{});return()=>clearInterval(timer)},[]);
  async function load(){const data=await invoke<AppRecord[]>('get_applications');if(data.length)setApps(data);const info=await invoke<Record<string,string>>('get_system_info');setSystem(prev=>({...prev,...info}))}
  async function scan(){setScanning(true);try{await invoke('scan_applications');await load()}catch{/* Backend is optional until Tauri is running */}finally{setScanning(false)}}

  const filtered=apps.filter(a=>(source==='All'||(source==='APT'&&a.source.includes('APT'))||(source==='Flatpak'&&a.source==='Flatpak')||(source==='AppImage'&&a.source==='AppImage')||(source==='Manual'&&a.source.includes('Manual'))||(source==='MX Linux'&&a.source.includes('MX')))&&`${a.name} ${a.description||''}`.toLowerCase().includes(query.toLowerCase()));
  const visible=filtered.length?filtered:sampleApps;
  const openDetails=(app:AppRecord)=>{setSelected(app);setPage('Details')};

  return <div className="rex-app" style={{'--circuit':`url(${circuitUrl})`} as React.CSSProperties}>
    <aside className="sidebar">
      <div className="side-logo"><div className="mini-rex">R</div><span>Rex</span></div>
      <nav>{nav.map(([label,Icon])=>{const count=label==='Updates'?12:null;return <button key={label} className={page===label?'active':''} onClick={()=>setPage(label)}><Icon size={18}/><span>{label}</span>{count&&<b className="nav-count">{count}</b>}</button>})}</nav>
      <div className="sidebar-footer"><img src={dragonUrl} alt=""/><strong>Rex <small>v5.0</small></strong><span>Powering Your Linux</span></div>
    </aside>
    <div className="workspace">
      <header className="topbar">
        <div className="brand"><img className="top-dragon" src={dragonUrl} alt=""/><div><h1><b>Rex</b> Application Manager</h1><p>Scan · Manage · Update · Secure</p></div></div>
        <div className="top-status"><div className="dist"><div className="penguin">◆</div><div><b>MX Linux</b><span>v23.5</span></div></div><div className="clock"><Clock3 size={21}/><div><span>{liveTime.toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric',year:'numeric'})}</span><b>{liveTime.toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit',hour12:false})}</b></div></div><div className="window-buttons"><Minus/><Square/><X/></div></div>
      </header>
      <main>
        {(page==='Dashboard'||page==='Applications')&&<>
          {page==='Dashboard'&&<><section className="panel system-panel"><PanelTitle icon={<Zap/>} title="System Overview"/><div className="stats"><Stat icon={<Package/>} label="Applications" value={apps.length||142} tone="blue" foot="▲ +2"/><Stat icon={<RefreshCw/>} label="Updates Available" value="12" tone="red"/><Stat icon={<ShieldCheck/>} label="Permission Issues" value="3" tone="blue"/><Stat icon={<HardDrive/>} label="Disk Usage" value="68%" tone="blue" progress/></div></section><QuickPanel setPage={setPage} onScan={scan} scanning={scanning}/></>}
          <section className={`panel library-section ${page==='Applications'?'library-full':''}`}><div className="library-head"><PanelTitle icon={<Grid2X2/>} title="Applications Library"/><div className="library-tools"><div className="search"><Search size={15}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search applications..."/></div><button className={view==='grid'?'view-active':''} onClick={()=>setView('grid')}><Grid3X3/></button><button className={view==='list'?'view-active':''} onClick={()=>setView('list')}><List/></button></div></div><div className="filters">{['All','APT','Flatpak','AppImage','Manual','MX Linux'].map(f=><button key={f} className={source===f?'active':''} onClick={()=>setSource(f)}>{f==='All'?`All (${apps.length||142})`:f}</button>)}</div><div className={view==='grid'?'app-grid':'app-list'}>{visible.slice(0,12).map(app=><button className="app-card" key={app.id} onClick={()=>openDetails(app)}><AppIcon app={app}/><b>{app.name}</b><span>v{app.version||'Unknown'}</span></button>)}</div><div className="pagination"><button><ChevronLeft/></button><button className="current">1</button><button>2</button><button>3</button><span>…</span><button>12</button><button><ChevronRight/></button></div></section>
          {page==='Dashboard'&&<section className="bottom-grid"><div className="panel activity"><PanelTitle icon={<Clock3/>} title="Recent Activity"/><button className="view-all">View All →</button><Activity/></div><div className="panel security"><PanelTitle icon={<ShieldCheck/>} title="Security & Permissions"/><Security/></div><div class="panel sysinfo"><PanelTitle icon={<MonitorCog/>} title="System Information"/><SystemInfo system={system}/></div></section>}
        </>}
        {page==='Updates'&&<FullPage title="Available Updates" icon={<RefreshCw/>}><div className="empty-state"><RefreshCw/><h2>12 updates available</h2><p>Refresh package metadata to check supported software sources.</p><button className="primary-action" onClick={scan}>Check for Updates</button></div></FullPage>}
        {page==='Permissions'&&<FullPage title="Security & Permissions" icon={<ShieldCheck/>}><div className="permission-grid"><SecurityCard/><SecurityCard title="Startup Entries" text="No unexpected startup services detected."/><SecurityCard title="Flatpak Sandboxes" text="Review sandbox filesystem and device access."/></div></FullPage>}
        {page==='Details'&&<FullPage title="Application Details" icon={<Info/>}><ApplicationDetails app={selected}/></FullPage>}
        {page==='Install / Remove'&&<FullPage title="Install / Remove" icon={<Download/>}><div className="operations"><div><Download/><h3>Install software</h3><p>Search APT or Flatpak repositories.</p><button className="primary-action">Browse Software</button></div><div><Trash2/><h3>Remove software</h3><p>Review dependencies before removal.</p><button className="danger-action">Choose Application</button></div></div></FullPage>}
        {page==='Settings'&&<FullPage title="Settings" icon={<Settings/>}><div className="settings-grid"><label>Scan locations<textarea defaultValue={'~/Applications\n~/AppImages\n~/bin'}/></label><label>Theme<select><option>Rex Red</option><option>Matte Black</option></select></label><label className="check"><input type="checkbox" defaultChecked/> Enable APT/DPKG</label><label className="check"><input type="checkbox" defaultChecked/> Enable Flatpak</label></div></FullPage>}
        {page==='About'&&<FullPage title="About Rex" icon={<Info/>}><div className="about"><img src={dragonUrl} alt=""/><h2>Rex Application Manager <span>v5.0</span></h2><p>A Linux application manager for MX Linux.</p><code>React · TypeScript · Rust · Tauri · SQLite</code></div></FullPage>}
      </main>
    </div>
  </div>
}

function PanelTitle({icon,title}:{icon:ReactNode,title:string}){return <div className="panel-title">{icon}<span>{title}</span></div>}
function Stat({icon,label,value,tone,foot,progress}:{icon:ReactNode,label:string,value:string|number,tone:string,foot?:string,progress?:boolean}){return <div className={`stat ${tone}`}><div className="stat-icon">{icon}</div><b>{value}</b><span>{label}</span>{foot&&<em>{foot}</em>}{progress&&<div className="disk-progress"><i/></div>}</div>}
function QuickPanel({setPage,onScan,scanning}:{setPage:(p:string)=>void,onScan:()=>void,scanning:boolean}){const actions=[['Scan System',Search,onScan],['Install Software',Download,()=>setPage('Install / Remove')],['Check Updates',RefreshCw,()=>setPage('Updates')],['Manage Permissions',ShieldCheck,()=>setPage('Permissions')]] as const;return <section className="quick-panel panel"><PanelTitle icon={<Zap/>} title="Quick Actions"/><div className="quick-actions">{actions.map(([label,Icon,run])=>{const fn=run as ()=>void;return <button key={label} onClick={fn} disabled={label==='Scan System'&&scanning}><Icon/><span>{label==='Scan System'&&scanning?'Scanning…':label}</span></button>})}</div></section>}
function AppIcon({app}:{app:AppRecord}){const url=app.icon?iconUrl[app.icon]:undefined;return <div className="app-icon">{url?<img src={url} alt=""/>:<Package/>}</div>}
function Activity(){return <div className="activity-list"><p><CheckCircle2/><span>System scan completed <b>142 applications found</b></span><time>14:32</time></p><p><CheckCircle2/><span>12 updates are available</span><time>14:30</time></p><p><CheckCircle2/><span>GIMP updated to 3.0.4</span><time>13:50</time></p></div>}
function Security(){return <div className="secure"><ShieldCheck/><div><b>System Secure</b><span>No critical issues detected.</span></div><button>View Details →</button></div>}
function SystemInfo({system}:{system:Record<string,string>}){return <dl className="syslist"><div><dt>Kernel:</dt><dd>{system.Kernel||'Unknown'}</dd></div><div><dt>Memory:</dt><dd>{system.Memory||'Unknown'}</dd></div><div><dt>CPU:</dt><dd>{system.CPU||'Unknown'}</dd></div></dl>}
function FullPage({title,icon,children}:{title:string,icon:ReactNode,children:ReactNode}){return <section className="panel full-page"><PanelTitle icon={icon} title={title}/>{children}</section>}
function SecurityCard({title='System Secure',text='No critical permission issues detected.'}:{title?:string,text?:string}){return <div className="security-card"><ShieldCheck/><div><h3>{title}</h3><p>{text}</p></div></div>}
function ApplicationDetails({app}:{app:AppRecord}){return <div className="details"><div className="details-hero"><AppIcon app={app}/><div><h2>{app.name}</h2><p>{app.description}</p></div></div><dl><div><dt>Version</dt><dd>{app.version||'Unknown'}</dd></div><div><dt>Source</dt><dd>{app.source}</dd></div><div><dt>Size</dt><dd>312 MB</dd></div><div><dt>Install location</dt><dd>{app.path||'Unknown'}</dd></div></dl><div className="details-actions"><button><ExternalLink/>Open</button><button><RefreshCw/>Update</button><button className="danger"><Trash2/>Uninstall</button></div></div>}
