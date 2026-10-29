import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight, ArrowCounterClockwise, ArrowDown, Check, Code, Copy, Envelope, FileText, FloppyDisk, Folder, GithubLogo, House, LinkedinLogo, Monitor, Minus, Notepad, PaperPlaneTilt, SquaresFour, Terminal, User, X, type Icon } from '@phosphor-icons/react';
import { experience, profile, projectFilters, projects } from './content';
import { AboutApp, Tags } from './ProfilePanels';
import { buildResumeText } from './resume';

type AppId='welcome'|'about'|'projects'|'notes'|'resume'|'contact';
const apps: {id:AppId;label:string;title:string;icon:Icon;color:string}[]=[
  {id:'about',label:'About me',title:'About me.txt',icon:User,color:'#286c80'},
  {id:'projects',label:'My projects',title:'My projects',icon:Folder,color:'#d7a23c'},
  {id:'resume',label:'Résumé',title:'Résumé.txt',icon:FileText,color:'#66909b'},
  {id:'notes',label:'Guest notes',title:'Guest notes',icon:Notepad,color:'#b59138'},
  {id:'contact',label:'Say hello',title:'Say hello',icon:Envelope,color:'#57816b'},
];
function useClock(){const [now,setNow]=useState(new Date());useEffect(()=>{const id=setInterval(()=>setNow(new Date()),10000);return()=>clearInterval(id);},[]);return now.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});}
function Window({title,icon:IconComponent,children,active,index,minimized,onClose,onMinimize,onFocus,desktopRef}:{title:string;icon:Icon;children:ReactNode;active:boolean;index:number;minimized:boolean;onClose:()=>void;onMinimize:()=>void;onFocus:()=>void;desktopRef:React.RefObject<HTMLDivElement|null>}) {
  const [pos,setPos]=useState<{x:number;y:number}|null>(null),[max,setMax]=useState(false);
  const drag=useRef<{x:number;y:number;left:number;top:number}|null>(null);const ref=useRef<HTMLElement>(null);
  useEffect(()=>{if(active)ref.current?.focus({preventScroll:true});},[active]);
  useEffect(()=>{const parent=desktopRef.current;if(!parent)return;const observer=new ResizeObserver(()=>setPos(prev=>{
    if(!prev||!ref.current)return prev;return {x:Math.max(0,Math.min(prev.x,parent.clientWidth-ref.current.clientWidth)),y:Math.max(0,Math.min(prev.y,parent.clientHeight-ref.current.clientHeight-42))};
  }));observer.observe(parent);return()=>observer.disconnect();},[desktopRef]);
  return <section hidden={minimized} tabIndex={-1} ref={ref} role="dialog" aria-label={title} className={`os-window ${active?'is-active':''} ${max?'maximized':''}`} style={{zIndex:20+index,...(pos&&!max?{left:pos.x,top:pos.y}: {})} as CSSProperties} onPointerDown={onFocus}>
    <div className="window-titlebar" onPointerDown={e=>{
      if((e.target as HTMLElement).closest('button')||max||window.innerWidth<640)return;
      const bounds=ref.current!.getBoundingClientRect(),parent=desktopRef.current!.getBoundingClientRect();
      drag.current={x:e.clientX,y:e.clientY,left:bounds.left-parent.left,top:bounds.top-parent.top};e.currentTarget.setPointerCapture(e.pointerId);onFocus();
    }} onPointerMove={e=>{if(!drag.current)return;const parent=desktopRef.current!,el=ref.current!;
      setPos({x:Math.max(0,Math.min(parent.clientWidth-el.clientWidth,drag.current.left+e.clientX-drag.current.x)),y:Math.max(0,Math.min(parent.clientHeight-el.clientHeight-42,drag.current.top+e.clientY-drag.current.y))});
    }} onPointerUp={()=>{drag.current=null;}} onPointerCancel={()=>{drag.current=null;}}>
      <span className="window-title"><IconComponent size={16} weight="duotone"/>{title}</span>
      <div className="window-actions"><button aria-label={`Minimize ${title}`} onClick={onMinimize}><Minus size={13}/></button><button aria-label={`${max?'Restore':'Maximize'} ${title}`} onClick={()=>setMax(!max)}><SquaresFour size={12}/></button><button aria-label={`Close ${title}`} onClick={onClose}><X size={13} weight="bold"/></button></div>
    </div>
    <div className="window-menubar"><span>File</span><span>View</span><span>Help</span><span className="window-filetype">PRANJAL.OS</span></div>
    <div className="window-content">{children}</div>
    <div className="window-status"><span><span className="tiny-dot"/> Ready when you are.</span><span>Made with curiosity</span></div>
  </section>;
}

function Welcome({open}:{open:(id:AppId)=>void}) {
  return <div className="welcome-content">
    <div className="welcome-kicker"><span className="small-rule"/> A PERSONAL SPACE ON THE INTERNET</div>
    <h1>Good things happen<br/>after hours<span>.</span></h1>
    <p>Hi, I’m {profile.firstName}. Developer, curious maker,<br className="desktop-break"/> and the person behind this little room.</p>
    <div className="welcome-divider"/>
    <p className="welcome-sub">Take a look around. Open a folder.<br/>There’s a little bit of me in every window.</p>
    <div className="welcome-actions"><button className="os-primary" onClick={()=>open('projects')}><Folder size={18} weight="duotone"/>Explore my work<ArrowRight size={16}/></button><button className="text-action" onClick={()=>open('about')}>Meet the person<ArrowUpRight size={15}/></button></div>
    <div className="welcome-stamp"><Code size={18}/> BUILT FOR THE CURIOUS. © 2026</div>
  </div>;
}
function About({onContact}:{onContact:()=>void}) {return <AboutApp onContact={onContact}/>;}
function Projects(){
  const [selected,setSelected]=useState<string|null>(null),[filter,setFilter]=useState('All');
  const contentRef=useRef<HTMLDivElement>(null);
  useEffect(()=>{contentRef.current?.closest('.window-content')?.scrollTo({top:0});},[selected,filter]);
  const project=projects.find(item=>item.id===selected);
  const visible=projects.filter(item=>filter==='All'||item.filters.includes(filter));
  return <div className="projects-content" ref={contentRef}>{project?<>
    <button className="text-action project-back" onClick={()=>setSelected(null)}><ArrowLeft size={14}/>All projects</button>
    <div className="project-hero" style={{'--project-color':project.color} as CSSProperties}><span>{project.id} / {project.category}</span><strong>{project.title}</strong><span>{project.type}</span></div>
    <div className="project-detail"><span className="project-detail-label">{project.fullTitle}</span><h2>{project.summary}</h2><p>{project.description}</p>
      {project.url&&<a className="os-primary project-visit" href={project.url} target="_blank" rel="noopener noreferrer">{project.linkLabel}<ArrowUpRight size={16}/></a>}
      {project.highlights.length>0&&<><h3 className="project-highlights-title">Inside the build</h3><ul className="detail-bullets">{project.highlights.map(point=><li key={point}>{point}</li>)}</ul></>}
      <Tags items={project.stack}/>
      {project.current&&<div className="paper-callout"><Monitor size={18}/>You’re inside the working project. Close this window to keep exploring.</div>}
      {project.concept&&<p className="sample-note">An illustrative concept study from this portfolio’s creative collection.</p>}
    </div>
  </>:<><div className="folder-path"><Folder weight="duotone" size={19}/>C:\Pranjal\Selected work<span>{visible.length} items</span></div><div className="project-list-header"><h2>A few things<br/>I’ve been making.</h2><span>SELECTED WORK<br/>& CREATIVE EXPLORATIONS</span></div>
    <div className="project-filters" role="group" aria-label="Filter projects">{projectFilters.map(category=><button key={category} aria-pressed={filter===category} onClick={()=>setFilter(category)}>{category}</button>)}</div>
    <div className="project-list">{visible.map(item=><button className="project-row" key={item.id} onClick={()=>setSelected(item.id)} aria-label={`Open ${item.title}`}><div className="project-number" style={{background:item.color}}><Folder size={31} weight="duotone"/></div><div><span className="project-category">{item.category}</span><h3>{item.title}</h3><p>{item.summary}</p><span className="project-type">{item.type}</span></div><ArrowUpRight size={21}/></button>)}</div>
    <p className="sample-note">Published work, this interactive studio, and two concept studies. <a href={profile.github} target="_blank" rel="noopener noreferrer">More in the lab <ArrowUpRight size={11}/></a></p>
  </>}</div>;
}
function Notes(){const [note,setNote]=useState(()=>{try{return localStorage.getItem('afterhours-notes')??'A little note to my future self…\n\n';}catch{return '';}}),[status,setStatus]=useState('Saved on this device');
  const save=(value:string)=>{setNote(value);try{localStorage.setItem('afterhours-notes',value);setStatus('Saved on this device');}catch{setStatus('Storage unavailable — keep this window open');}};
  return <div className="notes-content"><div className="note-heading"><Notepad size={28} weight="duotone"/><div><h2>A thought before you go?</h2><p>A little scratchpad, just for you.</p></div></div><textarea aria-label="Your private guest notes" spellCheck placeholder="Leave yourself a thought…" value={note} onChange={e=>save(e.target.value)}/><div className="note-footer"><span><FloppyDisk size={14}/>{status}</span><span>{note.length} characters</span></div><p className="sample-note">Private to this browser. Notes aren’t sent to anyone.</p></div>;
}
function Resume(){
  const download=()=>{const url=URL.createObjectURL(new Blob([buildResumeText()],{type:'text/plain;charset=utf-8'}));const anchor=document.createElement('a');anchor.href=url;anchor.download='Pranjal-Singh-resume.txt';anchor.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
  return <article className="document-content resume-content"><div className="resume-head"><div><span className="document-label">THE SHORT VERSION</span><h2>{profile.name}</h2><p>{profile.role}</p></div><img className="personal-logo" src="/assets/pranjal-logo.png" alt="Pranjal Singh personal logo" width="64" height="64"/></div>
    <p className="resume-location">{profile.location} · {profile.availability}</p><a className="resume-email" href={`mailto:${profile.email}`}>{profile.email}<ArrowUpRight size={13}/></a>
    <div className="resume-download"><button className="os-primary" onClick={download}><ArrowDown size={17}/>Download résumé<span>.TXT</span></button><span>Full experience, skills, projects & links.</span></div>
    <h3>Profile</h3><p>{profile.professionalSummary}</p>
    <h3>Experience</h3><div className="resume-jobs">{experience.map(job=><section key={job.company}><div><strong>{job.company}</strong><span>{job.period}</span></div><p>{job.role}</p><p>{job.summary}</p><ul className="detail-bullets">{job.highlights.map(point=><li key={point}>{point}</li>)}</ul></section>)}</div>
    <h3>Education</h3><p><strong>{profile.education.degree}</strong><br/>{profile.education.university} · {profile.education.period}</p>
    <h3>Toolkit</h3><Tags items={profile.skills}/>
    <h3>A little bit of afterhours</h3><p><strong>Afterhours — Interactive 3D portfolio</strong><br/>A live workspace with a custom room, animated character, bounded camera controls, and a familiar desktop full of ideas.</p>
  </article>;
}
function Contact(){
  const [copied,setCopied]=useState(false),[error,setError]=useState('');
  const copy=async()=>{try{await navigator.clipboard.writeText(profile.email);setCopied(true);setError('');setTimeout(()=>setCopied(false),2000);}catch{setError('Copy isn’t available here. Select the address above to copy it.');}};
  return <article className="document-content contact-content"><Envelope size={42} weight="duotone"/><span className="document-label">GOOD CONVERSATIONS START SOMEWHERE</span><h2>Have something<br/>in mind?</h2><p>Something to build, an idea to explore,<br/>or just a friendly hello.</p><p>{profile.contactIntro}</p>
    <div className="contact-availability"><i className="tiny-dot"/>{profile.availability}<span>{profile.location}</span></div>
    <a className="email-address" href={`mailto:${profile.email}`}>{profile.email}<ArrowUpRight size={20}/></a><button className="os-primary" onClick={copy}>{copied?<Check size={17}/>:<Copy size={17}/>} {copied?'Copied!':'Copy email address'}</button><p className="copy-status" role="status">{error}</p>
    <div className="social-links"><a href={profile.linkedin} target="_blank" rel="noopener noreferrer"><LinkedinLogo size={19} weight="duotone"/>LinkedIn<ArrowUpRight size={13}/></a><a href={profile.github} target="_blank" rel="noopener noreferrer"><GithubLogo size={19} weight="duotone"/>GitHub<ArrowUpRight size={13}/></a><a href={profile.website} target="_blank" rel="noopener noreferrer"><House size={19} weight="duotone"/>Earlier portfolio<ArrowUpRight size={13}/></a></div>
    <p className="sample-note">Email opens your mail app. Guest notes stay on your device.</p>
  </article>;
}

export function Desktop({onExit,blocked=false}:{onExit:()=>void;blocked?:boolean}) {
  const [opened,setOpened]=useState<AppId[]>(['welcome']),[minimized,setMinimized]=useState<AppId[]>([]),[start,setStart]=useState(false);
  const desktop=useRef<HTMLDivElement>(null),clock=useClock();const active=opened.filter(id=>!minimized.includes(id)).at(-1);
  const focus=(id:AppId)=>{setOpened(prev=>[...prev.filter(i=>i!==id),id]);};
  const open=(id:AppId)=>{focus(id);setMinimized(prev=>prev.filter(i=>i!==id));setStart(false);};
  const close=(id:AppId)=>{setOpened(prev=>prev.filter(i=>i!==id));setMinimized(prev=>prev.filter(i=>i!==id));};
  useEffect(()=>{const handler=(e:KeyboardEvent)=>{if(e.key==='Escape'&&!blocked){if(start)setStart(false);else if(active)close(active);else onExit();}};window.addEventListener('keydown',handler);return()=>window.removeEventListener('keydown',handler);},[start,active,onExit,blocked]);
  useEffect(()=>{const handler=(e:PointerEvent)=>{if(!(e.target as HTMLElement).closest('.start-area'))setStart(false);};window.addEventListener('pointerdown',handler);return()=>window.removeEventListener('pointerdown',handler);},[]);
  return <div className="desktop-stage"><div className="crt-case"><div className="crt-inset"><div className="os-desktop" ref={desktop}>
    <div className="desktop-watermark"><span>YOUR IDEAS. YOUR SPACE.</span><strong>Make yourself<br/>at home.</strong></div>
    <nav className="desktop-icons" aria-label="Desktop applications">{apps.map(({id,label,icon:AppIcon,color})=><button key={id} onClick={()=>open(id)} className="desktop-icon"><AppIcon size={36} weight="duotone" style={{color}}/><span>{label}</span></button>)}</nav>
    {opened.map((id,index)=>{const meta=apps.find(a=>a.id===id);return <Window key={id} title={meta?.title??'Welcome to my corner of the internet'} icon={meta?.icon??House} active={active===id} minimized={minimized.includes(id)} index={index} desktopRef={desktop} onFocus={()=>{if(active!==id)focus(id);}} onClose={()=>close(id)} onMinimize={()=>setMinimized(prev=>[...prev,id])}>
      {id==='welcome'?<Welcome open={open}/>:id==='about'?<About onContact={()=>open('contact')}/>:id==='projects'?<Projects/>:id==='notes'?<Notes/>:id==='resume'?<Resume/>:<Contact/>}
    </Window>;})}
    <div className="os-taskbar"><div className="start-area"><button className={`start-button ${start?'pressed':''}`} onClick={()=>setStart(!start)} aria-expanded={start} aria-label="Open Start menu"><SquaresFour size={20} weight="fill"/>Start</button>{start&&<div className="start-menu"><div className="start-brand">PRANJAL<span>.OS</span></div><div className="start-items"><span className="start-heading">A LITTLE BIT OF EVERYTHING</span><button onClick={()=>open('welcome')}><House size={21} weight="duotone"/>Welcome</button>{apps.map(({id,label,icon:AppIcon})=><button key={id} onClick={()=>open(id)}><AppIcon size={21} weight="duotone"/>{label}</button>)}<hr/><button onClick={onExit}><ArrowCounterClockwise size={21}/>Back to the room</button></div></div>}</div><div className="taskbar-divider"/><div className="taskbar-windows">{opened.map(id=>{const meta=apps.find(a=>a.id===id),AppIcon=meta?.icon??House;return <button key={id} aria-label={`Show ${meta?.title??'Welcome'}`} className={`taskbar-app ${active===id?'selected':''}`} onClick={()=>{if(active===id)setMinimized(prev=>[...prev,id]);else open(id);}}><AppIcon size={15}/><span>{meta?.label??'Welcome'}</span></button>;})}</div><div className="system-tray"><Monitor size={14}/><span>{clock}</span></div></div>
    <div className="screen-scanlines"/>
  </div></div><div className="crt-bottom"><span>AFTERHOURS™</span><div><span>PERSONAL COMPUTER</span><i/></div></div></div><span className="desktop-caption">A FAMILIAR PLACE FOR NEW POSSIBILITIES.</span></div>;
}
