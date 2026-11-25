import { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import {
  LayoutDashboard, Grid2X2, RefreshCw, ShieldCheck, Info, Download,
  Settings, Search, SlidersHorizontal, List, Grid3X3, Package,
  HardDrive, Cpu, Clock3, Eye, Trash2, ExternalLink, ChevronLeft,
  ChevronRight, CheckCircle2, Zap, MonitorCog, X, Minus, Square
} from 'lucide-react';

type AppRecord = {
  id:number; name:string; package_id:string; version:string|null;
  description:string|null; source:string; path:string|null; icon:string|null;
  update_available:boolean;
};

const sampleApps: AppRecord[] = [
  {id:1,name:'Firefox',package_id:'firefox',version:'145.0.2',description:'Fast, secure and private web browser.',source:'APT (Debian)',path:'/usr/bin/firefox',icon:'firefox',update_available:false},
  {id:2,name:'LibreOffice',package_id:'libreoffice',version:'25.8.2',description:'Office productivity suite.',source:'APT (Debian)',path:'/usr/bin/libreoffice',icon:'libreoffice',update_available:false},
  {id:3,name:'VLC Media',package_id:'vlc',version:'3.0.21',description:'Cross-platform multimedia player.',source:'APT (Debian)',path:'/usr/bin/vlc',icon:'vlc',update_available:false},
  {id:4,name:'GIMP',package_id:'gimp',version:'3.0.4',description:'GNU image manipulation program.',source:'APT (Debian)',path:'/usr/bin/gimp',icon:'gimp',update_available:false},
  {id:5,name:'Visual Studio',package_id:'code',version:'1.107.1',description:'Source code editor.',source:'APT (Debian)',path:'/usr/bin/code',icon:'visualstudiocode',update_available:false},
  {id:6,name:'Discord',package_id:'discord',version:'0.0.345',description:'Voice, video and text communication.',source:'Flatpak',path:'/var/lib/flatpak/app/com.discordapp.Discord',icon:'discord',update_available:false},
  {id:7,name:'OnlyOffice',package_id:'onlyoffice',version:'9.2.1',description:'Office suite.',source:'Flatpak',path:'/var/lib/flatpak/app/org.onlyoffice.desktopeditors',icon:'onlyoffice',update_available:false},
  {id:8,name:'Inkscape',package_id:'inkscape',version:'1.4.1',description:'Vector graphics editor.',source:'APT (Debian)',path:'/usr/bin/inkscape',icon:'inkscape',update_available:false},
];

const nav = [
  ['Dashboard',LayoutDashboard], ['Applications',Grid2X2], ['Updates',RefreshCw],
  ['Permissions',ShieldCheck], ['Details',Info], ['Install / Remove',Download],
  ['Settings',Settings], ['About',Info]
] as const;

const iconUrl: Record<string,string> = {
  firefox:'https://cdn.simpleicons.org/firefox/FF7139', libreoffice:'https://cdn.simpleicons.org/libreoffice/18A303',
  vlc:'https://cdn.simpleicons.org/vlc/FF8800', gimp:'https://cdn.simpleicons.org/gimp/5C5543',
  visualstudiocode:'https://cdn.simpleicons.org/visualstudiocode/007ACC', discord:'https://cdn.simpleicons.org/discord/5865F2',
  onlyoffice:'https://cdn.simpleicons.org/onlyoffice/FF6F00', inkscape:'https://cdn.simpleicons.org/inkscape/1A1A1A'
};

function Dragon({className=''}:{className?:string}) {
  return <svg className={className} viewBox="0 0 220 110" aria-hidden="true">
    <path d="M25 82 C18 62 32 44 52 39 C43 24 55 12 70 18 C86 24 91 43 78 55 C101 43 122 49 128 65 C119 82 98 86 79 78 C66 74 55 78 47 92 C39 104 28 98 25 82Z" fill="none" stroke="currentColor" strokeWidth="3"/>
    <path d="M52 39 L43 23 L31 20 M62 37 L74 22 L91 18 M78 55 L98 38 L116 36 M128 65 L151 51 L169 55 M104 72 L122 91 L145 92" fill="none" stroke="currentColor" strokeWidth="2"/>
    <path d="M31 20 L14 12 M43 23 L31 10 M74 22 L78 8 M98 38 L111 24 M116 36 L132 21 M151 51 L166 38 M169 55 L189 48" fill="none" stroke="currentColor" strokeWidth="1.5"/>
  </svg>;
}

export default function App() {
  const [page,setPage]=useState('Dashboard');
  const [apps,setApps]=useState<AppRecord[]>(sampleApps);
  const [query,setQuery]=useState('');
  const [source,setSource]=useState('All');
  const [view,setView]=useState<'grid'|'list'>('grid');
  const [selected,setSelected]=useState<AppRecord>(sampleApps[0]);
  const [scanning,setScanning]=useState(false);
  const [system,setSystem]=useState<Record<string,string>>({Kernel:'6.16.0-2-amd64',Memory:'7.6 GB / 15.6 GB',CPU:'Intel Core i5-2520M'});
  const [liveTime,setLiveTime]=useState(new Date());

  useEffect(()=>{
    const timer=setInterval(()=>setLiveTime(new Date()),1000);
    load().catch(()=>{});
    return ()=>clearInterval(timer);
  },[]);

  async function load() {
    const data=await invoke<AppRecord[]>('get_applications');
    if (data.length) setApps(data);
    const info=await invoke<Record<string,string>>('get_system_info');
    setSystem(prev=>({...prev,...info}));
  }
  async function scan() {
    setScanning(true);
    try { await invoke('scan_applications'); await load(); }
    catch { /* Demo data remains available outside a Tauri runtime. */ }
    finally { setScanning(false); }
  }

  const filtered=apps.filter(a =>
    (source==='All'||a.source.includes(source==='APT (Debian)'?'APT':source)) &&
    `${a.name} ${a.description||''}`.toLowerCase().includes(query.toLowerCase())
  );
  const updates=apps.filter(a=>a.update_available).length;

  const openDetails=(app:AppRecord)=>{setSelected(app);setPage('Details')};

  return <div className="rex-app">
    <div className="circuit circuit-a"/><div className="circuit circuit-b"/>
    <aside className="sidebar">
      <div className="side-logo"><div className="mini-rex">R</div><span>Rex</span></div>
      <nav>
        {nav.map(([label,Icon])=>{
          const count=label==='Updates'&&updates>0?updates:null;
          return <button key={label} className={page===label?'active':''} onClick={()=>setPage(label)}>
            <Icon size={18}/><span>{label}</span>{count!==null&&<b className="nav-count">{count}</b>}
          </button>
        })}
      </nav>
      <div className="sidebar-footer"><Dragon className="side-dragon"/><strong>Rex <small>v5.0</small></strong><span>Powering Your Linux</span></div>
    </aside>

    <div className="workspace">
      <header className="topbar">
        <div className="brand"><Dragon className="top-dragon"/><div><h1><b>Rex</b> Application Manager</h1><p>Scan · Manage · Update · Secure</p></div></div>
        <div className="top-status">
          <div className="dist"><div className="penguin">◆</div><div><b>MX Linux</b><span>v23.5</span></div></div>
          <div className="clock"><Clock3 size={19}/><div><span>{liveTime.toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric',year:'numeric'})}</span><b>{liveTime.toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false})}</b></div></div>
          <div className="window-buttons"><Minus/><Square/><X/></div>
        </div>
      </header>

      <main>
        {(page==='Dashboard'||page==='Applications')&&<>
          {page==='Dashboard'&&<section className="panel system-panel">
            <PanelTitle icon={<Zap size={17}/>} title="System Overview"/>
            <div className="stats">
              <Stat icon={<Package/>} label="Applications" value={apps.length||142} tone="blue" foot="▲ +2"/>
              <Stat icon={<RefreshCw/>} label="Updates Available" value={updates||12} tone="red"/>
              <Stat icon={<ShieldCheck/>} label="Permission Issues" value="3" tone="blue"/>
              <Stat icon={<HardDrive/>} label="Disk Usage" value="68%" tone="blue" progress/> 
            </div>
          </section>}

          {page==='Dashboard'&&<section className="dashboard-middle">
            <div className="panel library-panel"><PanelTitle icon={<Grid2X2 size={17}/>} title="Applications Library"/></div>
            <div className="panel quick-panel"><PanelTitle icon={<Zap size={17}/>} title="Quick Actions"/></div>
            <QuickActions onScan={scan} scanning={scanning} setPage={setPage}/>
          </section>}

          <section className="library-section panel">
            <div className="library-toolbar"><div className="search"><Search size={15}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search applications..."/></div><button className={view==='grid'?'view-active':''} onClick={()=>setView('grid')}><Grid3X3 size={15}/></button><button className={view==='list'?'view-active':''} onClick={()=>setView('list')}><List size={15}/></button></div>
            <div className="filters">{['All','APT','Flatpak','AppImage','Manual','MX Linux'].map(f=><button key={f} className={source===f?'active':''} onClick={()=>setSource(f)}>{f==='All'?`All (${apps.length||142})`:f}</button>)}</div>
            <div className={view==='grid'?'app-grid':'app-list'}>
              {(filtered.length?filtered:sampleApps).slice(0,12).map(app=><button className="app-card" key={app.id} onClick={()=>openDetails(app)}>
                <AppIcon app={app}/><b>{app.name}</b><span>v{app.version||'Unknown'}</span>
              </button>)}
            </div>
            <div className="pagination"><button><ChevronLeft size={15}/></button><button className="current">1</button><button>2</button><button>3</button><span>…</span><button>12</button><button><ChevronRight size={15}/></button></div>
          </section>

          {page==='Dashboard'&&<section className="bottom-grid">
            <div className="panel activity"><PanelTitle icon={<Clock3 size={16}/>} title="Recent Activity"/><button className="view-all">View All →</button><Activity/></div>
            <div className="panel security"><PanelTitle icon={<ShieldCheck size={16}/>} title="Security & Permissions"/><Security/></div>
            <div className="panel sysinfo"><PanelTitle icon={<MonitorCog size={16}/>} title="System Information"/><SystemInfo system={system}/></div>
          </section>}
        </>}

        {page==='Updates'&&<PagePanel title="Available Updates" icon={<RefreshCw/>}><div className="update-list"><div className="empty-state"><RefreshCw/><h2>{updates?`${updates} updates available`:'System is up to date'}</h2><p>Refresh package metadata to check all supported software sources.</p><button onClick={scan} className="primary-action">Check for Updates</button></div></div></PagePanel>}
        {page==='Permissions'&&<PagePanel title="Security & Permissions" icon={<ShieldCheck/>}><div className="permission-grid"><SecurityCard/><SecurityCard title="Startup Entries" text="No unexpected startup services detected."/><SecurityCard title="Flatpak Sandboxes" text="Review sandbox filesystem and device access."/></div></PagePanel>}
        {page==='Details'&&<PagePanel title="Application Details" icon={<Info/>}><ApplicationDetails app={selected}/></PagePanel>}
        {page==='Install / Remove'&&<PagePanel title="Install / Remove" icon={<Download/>}><div className="operations"><div><Download/><h3>Install software</h3><p>Search APT or Flatpak repositories.</p><button className="primary-action">Browse Software</button></div><div><Trash2/><h3>Remove software</h3><p>Review dependencies before removal.</p><button className="danger-action">Choose Application</button></div></div></PagePanel>}
        {page==='Settings'&&<PagePanel title="Settings" icon={<Settings/>}><div className="settings-grid"><label>Scan locations<textarea defaultValue={'~/Applications\n~/AppImages\n~/bin'}/></label><label>Theme<select defaultValue="Rex Red"><option>Rex Red</option><option>Matte Black</option></select></label><label className="check"><input type="checkbox" defaultChecked/> Enable APT/DPKG</label><label className="check"><input type="checkbox" defaultChecked/> Enable Flatpak</label></div></PagePanel>}
        {page==='About'&&<PagePanel title="About Rex" icon={<Info/>}><div className="about"><Dragon/><h2>Rex Application Manager <span>v5.0</span></h2><p>A real Linux application manager for MX Linux.</p><code>React · TypeScript · Rust · Tauri · SQLite</code></div></PagePanel>}
      </main>
    </div>
  </div>
}

function PanelTitle({icon,title}:{icon:React.ReactNode,title:string}){return <div className="panel-title">{icon}<span>{title}</span></div>}
function Stat({icon,label,value,tone,foot,progress}:{icon:React.ReactNode,label:string,value:string|number,tone:string,foot?:string,progress?:boolean}){return <div className={`stat ${tone}`}><div className="stat-icon">{icon}</div><b>{value}</b><span>{label}</span>{foot&&<em>{foot}</em>}<i className="corner"/><i className="corner two"/>{progress&&<div className="disk-progress"><i/></div>}</div>}

function QuickActions({onScan,scanning,setPage}:{onScan:()=>void,scanning:boolean,setPage:(page:string)=>void}){const actions=[['Scan System',Search,onScan],['Install Software',Download,()=>setPage('Install / Remove')],['Check Updates',RefreshCw,()=>setPage('Updates')],['Manage Permissions',ShieldCheck,()=>setPage('Permissions')]] as const;return <div className="quick-actions">{actions.map(([label,Icon,run])=>{const ac=run as ()=>void;return <button key={label} onClick={ac} disabled={label==='Scan System'&&scanning}><Icon size={17}/><span>{scanning&&label==='Scan System'?'Scanning…':label}</span></button>})}</div>}

function AppIcon({app}:{app:AppRecord}){const url=app.icon?iconUrl[app.icon]:undefined;return <div className="app-icon">{url?<img src={url} alt=""/>:<Package size={25}/>}</div>}
function Activity(){return <div className="activity-list"><p><CheckCircle2/><span>System scan completed <b>142 applications found</b></span><time>14:32</time></p><p><CheckCircle2/><span>12 updates are available</span><time>14:30</time></p><p><CheckCircle2/><span>GIMP updated to 3.0.4</span><time>13:50</time></p></div>}
function Security(){return <div className="secure"><ShieldCheck/><div><b>System Secure</b><span>No critical issues detected.</span></div><button onClick={()=>{}}>View Details →</button></div>}
function SystemInfo({system}:{system:Record<string,string>}){return <dl className="syslist"><div><dt>Kernel:</dt><dd>{system.Kernel||'Unknown'}</dd></div><div><dt>Memory:</dt><dd>{system.Memory||'Unknown'}</dd></div><div><dt>CPU:</dt><dd>{system.CPU||'Unknown'}</dd></div></dl>}
function PagePanel({title,icon,children}:{title:string,icon:React.ReactNode,children:React.ReactNode}){return <section className="panel full-page"><PanelTitle icon={icon} title={title}/>{children}</section>}
function SecurityCard({title='System Secure',text='No critical permission issues detected.'}:{title?:string,text?:string}){return <div className="security-card"><ShieldCheck/><div><h3>{title}</h3><p>{text}</p></div></div>}
function ApplicationDetails({app}:{app:AppRecord}){return <div className="details"><div className="details-hero"><AppIcon app={app}/><div><h2>{app.name}</h2><p>{app.description||'Linux desktop application'}</p></div></div><dl><div><dt>Version</dt><dd>{app.version||'Unknown'}</dd></div><div><dt>Source</dt><dd>{app.source}</dd></div><div><dt>Size</dt><dd>{app.name==='Firefox'?'312 MB':'—'}</dd></div><div><dt>Install location</dt><dd>{app.path||'Unknown'}</dd></div></dl><div className="details-actions"><button><ExternalLink/>Open</button><button><RefreshCw/>Update</button><button className="danger"><Trash2/>Uninstall</button></div></div>}
