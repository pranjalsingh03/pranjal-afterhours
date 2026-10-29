import { Component, lazy, Suspense, useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { ArrowCounterClockwise, ArrowDownRight, ArrowLeft, ArrowRight, ArrowUpRight, Check, CircleNotch, GearSix, Keyboard, Lamp, Monitor, Moon, SpeakerHigh, SpeakerSlash, X } from '@phosphor-icons/react';
import { Desktop } from './Desktop';
import { setAmbient } from './audio';
import { profile } from './content';
import type { ViewCommand } from './RoomCamera';
const Room = lazy(()=>import('./Room').then(module=>({default:module.Room})));

class SceneBoundary extends Component<{children:ReactNode;onFallback:()=>void},{failed:boolean}>{
  state={failed:false};static getDerivedStateFromError(){return {failed:true};}
  componentDidCatch(error:Error){console.error('3D scene unavailable:',error.message);}
  render(){return this.state.failed?<div className="scene-fallback"><Monitor size={40}/><h2>The room couldn’t load.</h2><p>You can still explore the portfolio desktop.</p><button className="enter-button" onClick={this.props.onFallback}>Open the desktop<ArrowRight size={18}/></button></div>:this.props.children;}
}
type Phase='room'|'entering'|'desktop'|'leaving';
export function App(){
  const [phase,setPhase]=useState<Phase>('room'),[ready,setReady]=useState(false),[hover,setHover]=useState(false),[sound,setSound]=useState(false),[lamp,setLamp]=useState(true),[settings,setSettings]=useState(false),[help,setHelp]=useState(false),[quality,setQuality]=useState(()=>!window.matchMedia('(pointer: coarse)').matches);
  const [viewCommand,setViewCommand]=useState<ViewCommand>({id:0,action:'reset'});
  const [viewAngle,setViewAngle]=useState(32);
  const moveView=(action:ViewCommand['action'])=>setViewCommand(previous=>({id:previous.id+1,action}));
  const [reduced,setReduced]=useState(()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const timer=useRef<ReturnType<typeof setTimeout>|null>(null),enterRef=useRef<HTMLButtonElement>(null),exitRef=useRef<HTMLButtonElement>(null);
  const previousPhase=useRef<Phase>('room');
  const enter=useCallback(()=>{setPhase(prev=>prev==='room'?'entering':prev);setHover(false);setSettings(false);setHelp(false);},[]);
  const exit=useCallback(()=>{setPhase(prev=>prev==='desktop'?'leaving':prev);setSettings(false);setHelp(false);},[]);
  useEffect(()=>{if(phase==='entering'||phase==='leaving'){timer.current=setTimeout(()=>setPhase(phase==='entering'?'desktop':'room'),reduced?100:1500);}return()=>{if(timer.current)clearTimeout(timer.current);};},[phase,reduced]);
  useEffect(()=>{if(phase==='desktop')exitRef.current?.focus();else if(phase==='room'&&previousPhase.current==='leaving')enterRef.current?.focus({preventScroll:true});previousPhase.current=phase;},[phase]);
  useEffect(()=>{document.body.style.cursor='';},[phase]);
  useEffect(()=>{const onKey=(e:KeyboardEvent)=>{if(e.key==='Escape'&&(settings||help)){setSettings(false);setHelp(false);}};window.addEventListener('keydown',onKey);return()=>window.removeEventListener('keydown',onKey);},[settings,help]);
  const toggleSound=async()=>{try{await setAmbient(!sound);setSound(!sound);}catch{setSound(false);}};
  const toggleReduced=()=>setReduced(v=>!v);
  return <main className={`experience phase-${phase} ${reduced?'reduce-motion':''}`}>
    <header className="site-header"><a className="wordmark" href="/" aria-label="Afterhours home">afterhours<span className="wordmark-asterisk">✳</span><span className="wordmark-sub">A SPACE BY {profile.firstName.toUpperCase()}</span></a><div className="header-center"><span className="status-dot"/>{phase==='desktop'?'WELCOME TO MY DESKTOP':'SOMEWHERE BETWEEN WORK & PLAY'}</div><div className="header-actions"><button className="sound-button" onClick={toggleSound} aria-label={sound?'Mute room sound':'Enable room sound'} aria-pressed={sound}>{sound?<SpeakerHigh size={17}/>:<SpeakerSlash size={17}/>}<span>SOUND {sound?'ON':'OFF'}</span></button><button className="settings-button" aria-label="Open experience settings" aria-expanded={settings} onClick={()=>{setSettings(!settings);setHelp(false);}}><GearSix size={19}/></button></div></header>
    <div className="world-frame">
      <div className="scene-canvas" aria-label="Interactive 3D office. Drag to look around, scroll to zoom, or use the camera buttons. Enter computer opens the portfolio.">
        <SceneBoundary onFallback={()=>{setReady(true);setPhase('desktop');}}><Suspense fallback={null}><Room phase={phase} onEnter={enter} onHover={setHover} onReady={()=>setReady(true)} lit={lamp} onToggle={()=>setLamp(v=>!v)} reduced={reduced} quality={quality} viewCommand={viewCommand} onViewChange={setViewAngle} blocked={settings||help}/></Suspense></SceneBoundary>
      </div>
      <div className="scene-grain"/>
      {phase!=='desktop'&&<div className="room-overlay">
        <div className="scene-location"><span className="location-coordinate">01 / THE STUDIO</span><span className="location-line"/><span>EST. 2026</span></div>
        <div className="room-title"><span className="eyebrow">YOU FOUND MY LITTLE CORNER.</span><h1>Pull up<br/>a chair<span>.</span></h1><p>A few ideas. A little code.<br/>A world of things to make.</p></div>
        <div className={`computer-hint ${hover?'is-hovered':''}`}><span className="hint-dot"/><span>THERE’S MORE ON THE INSIDE</span><ArrowDownRight size={20}/></div>
        <div className="room-bottom"><div className="room-view-controls" role="group" aria-label="Room camera controls"><span className="view-controls-label">DRAG TO LOOK<output aria-label="Room viewing angle">{viewAngle}°</output></span><button aria-label="Rotate room view left" disabled={viewAngle<=9||phase!=='room'||settings||help} onClick={()=>moveView('left')}><ArrowLeft size={15}/></button><button aria-label="Reset room view" disabled={phase!=='room'||settings||help} onClick={()=>moveView('reset')}><ArrowCounterClockwise size={16}/></button><button aria-label="Rotate room view right" disabled={viewAngle>=54||phase!=='room'||settings||help} onClick={()=>moveView('right')}><ArrowRight size={15}/></button></div><button ref={enterRef} className="enter-button" disabled={phase!=='room'||!ready} onClick={enter}><span className="enter-icon"><Monitor size={21} weight="duotone"/></span><span>{phase==='entering'?'Taking you inside…':phase==='leaving'?'Back to the studio…':ready?'Enter computer':'Preparing the room…'}<small>{ready?'CLICK TO EXPLORE MY WORLD':'JUST A LITTLE MOMENT'}</small></span>{!ready||phase==='entering'?<CircleNotch size={20} className="spin"/>:<ArrowUpRight size={22}/>}</button><button className="help-button" onClick={()=>{setHelp(!help);setSettings(false);}} aria-label="How to explore the room" aria-expanded={help}><Keyboard size={18}/><span>HOW TO EXPLORE</span></button></div>
      </div>}
      {phase==='desktop'&&<><div className="desktop-topbar"><button ref={exitRef} onClick={exit} className="back-button"><ArrowLeft size={15}/>Back to room</button><span>02 / THE DESKTOP</span><span className="desktop-top-status"><span className="status-dot"/>PRANJAL.OS IS RUNNING</span></div><Desktop onExit={exit} blocked={settings||help}/></>}
      {!ready&&phase==='room'&&<div className="loading-indicator" role="status"><span className="loading-line"/>WARMING UP THE PIXELS</div>}
      {(settings||help)&&<aside className="experience-panel" role="dialog" aria-label={settings?'Experience settings':'How to explore'}><div className="panel-heading"><span>{settings?'MAKE YOURSELF COMFORTABLE':'A LITTLE FIELD GUIDE'}</span><button aria-label="Close panel" onClick={()=>{setSettings(false);setHelp(false);}}><X size={17}/></button></div>{settings?<><h2>Your room, your rules.</h2><button className="setting-row" onClick={()=>setLamp(v=>!v)}><span><Lamp size={18}/>Desk lamp</span><span className={`toggle ${lamp?'on':''}`} aria-label={lamp?'On':'Off'}><i/></span></button><button className="setting-row" onClick={toggleReduced}><span><Moon size={18}/>Reduced motion</span><span className={`toggle ${reduced?'on':''}`} aria-label={reduced?'On':'Off'}><i/></span></button><button className="setting-row" onClick={()=>setQuality(v=>!v)}><span><GearSix size={18}/>High quality shadows</span><span className={`toggle ${quality?'on':''}`} aria-label={quality?'On':'Off'}><i/></span></button><p>Switch off high quality shadows for a lighter experience on smaller devices.</p></>:<><h2>A room worth exploring.</h2><p><ArrowCounterClockwise size={19}/>Drag or swipe to look around within the room’s viewing limits. Scroll or pinch to zoom.</p><p><Monitor size={19}/>Click the computer, or use the Enter computer button.</p><p><Lamp size={19}/>Click the desk lamp to change the mood.</p><p><Keyboard size={19}/>Arrow keys look around. Home resets the view. Tab moves between controls; Escape closes desktop windows.</p><button className="panel-enter" onClick={()=>{setHelp(false);enter();}}>Let’s go inside<ArrowRight size={16}/></button></>}</aside>}
    </div>
    <footer className="site-footer"><span>INDEPENDENT MIND. OPEN POSSIBILITIES.</span><span className="footer-middle">DESIGNED TO BE EXPLORED, NOT SCROLLED.</span><span>{profile.name.toUpperCase()}<span className="footer-year">© 2026</span></span></footer>
  </main>;
}
