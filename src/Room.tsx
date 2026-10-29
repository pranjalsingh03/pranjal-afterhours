import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import { RoundedBox, Environment, Lightformer, useTexture, Sparkles } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, Noise, N8AO } from '@react-three/postprocessing';
import * as THREE from 'three';
import { TypingCharacter } from './Character';
import { RoomCamera, type ViewCommand } from './RoomCamera';

type V3 = [number, number, number];
type BoxProps = { p: V3; s: V3; c?: string; r?: V3; metal?: number; rough?: number; round?: boolean; map?: THREE.Texture; emissive?: string; intensity?: number };
function Box({p,s,c='#63706a',r=[0,0,0],metal=0,rough=.75,round=false,map,emissive,intensity=0}: BoxProps) {
  const material = <meshStandardMaterial color={c} metalness={metal} roughness={rough} map={map} emissive={emissive} emissiveIntensity={intensity}/>;
  return round ? <RoundedBox args={s} radius={Math.min(...s)*.14} smoothness={2} position={p} rotation={r} castShadow receiveShadow>{material}</RoundedBox> : <mesh position={p} rotation={r} castShadow receiveShadow><boxGeometry args={s}/>{material}</mesh>;
}
function Cylinder({p,radius,height,c='#353c39',r=[0,0,0],metal=.3}: {p:V3;radius:number;height:number;c?:string;r?:V3;metal?:number}) {
  return <mesh position={p} rotation={r} castShadow receiveShadow><cylinderGeometry args={[radius,radius,height,24]}/><meshStandardMaterial color={c} roughness={.6} metalness={metal}/></mesh>;
}
function Cable({points,c='#252c2a',radius=.014}:{points:V3[];c?:string;radius?:number}) {
  const curve = useMemo(()=>new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p))),[points]);
  return <mesh castShadow><tubeGeometry args={[curve,30,radius,6,false]}/><meshStandardMaterial color={c} roughness={.7}/></mesh>;
}
function Label({text,p,w=.5,h=.2,bg='#ddd9bb',fg='#31423a',size=44,r=[0,0,0]}:{text:string;p:V3;w?:number;h?:number;bg?:string;fg?:string;size?:number;r?:V3}) {
  const map = useMemo(()=>{
    const canvas=document.createElement('canvas'); canvas.width=768; canvas.height=Math.max(128,Math.round(768*h/w));
    const ctx=canvas.getContext('2d')!; ctx.fillStyle=bg;ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle=fg;ctx.font=`${size}px monospace`;ctx.textAlign='center';ctx.textBaseline='middle';
    const lines=text.split('\n');lines.forEach((l,i)=>ctx.fillText(l,384,canvas.height/2+(i-(lines.length-1)/2)*size*1.4));
    const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=4;return texture;
  },[text,w,h,bg,fg,size]);
  useEffect(()=>()=>map.dispose(),[map]);
  return <mesh position={p} rotation={r}><planeGeometry args={[w,h]}/><meshStandardMaterial map={map} roughness={.85}/></mesh>;
}
function useSurface(kind:'fabric'|'floor'|'plaster') {
  const map=useMemo(()=>{
    const canvas=document.createElement('canvas');canvas.width=canvas.height=256;const ctx=canvas.getContext('2d')!;
    const image=ctx.createImageData(256,256);let seed=371;
    for(let i=0;i<image.data.length;i+=4){seed=(seed*16807)%2147483647;const n=seed/2147483647;
      const x=(i/4)%256,y=Math.floor(i/1024);
      let v=kind==='fabric'?140+n*60+(x%3===0?-25:0)+(y%3===0?-20:0):kind==='floor'?95+n*80:175+n*45;
      image.data[i]=v;image.data[i+1]=v;image.data[i+2]=v;image.data[i+3]=255;
    }ctx.putImageData(image,0,0);
    const texture=new THREE.CanvasTexture(canvas);texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.repeat.set(kind==='floor'?5:3,kind==='floor'?5:3);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=8;return texture;
  },[kind]);useEffect(()=>()=>map.dispose(),[map]);return map;
}

function Monitor({onEnter,onHover}:{onEnter:()=>void;onHover:(v:boolean)=>void}) {
  const {gl}=useThree();
  const wallpaper=useTexture('/assets/meadow-wallpaper.jpg');
  wallpaper.colorSpace=THREE.SRGBColorSpace;
  const [hover,setHover]=useState(false);
  const handleHover=(v:boolean)=>{setHover(v);onHover(v);gl.domElement.style.cursor=v?'pointer':'grab';};
  useEffect(()=>()=>{document.body.style.cursor='';},[]);
  return <group position={[.45,0,-1.14]}>
    <group onClick={(e:ThreeEvent<MouseEvent>)=>{e.stopPropagation();if(e.delta<=5)onEnter();}} onPointerOver={e=>{e.stopPropagation();handleHover(true);}} onPointerOut={()=>handleHover(false)}>
      <Box p={[0,1.41,0]} s={[.62,.11,.45]} c='#b6b29b' round/>
      <Cylinder p={[0,1.53,-.05]} radius={.17} height={.18} c='#9c9c89'/>
      <Box p={[0,2.04,-.08]} s={[1.22,1.02,.85]} c={hover?'#d2cfb7':'#b7baa5'} round/>
      <Box p={[0,2.09,.357]} s={[1.08,.83,.028]} c='#646f60' round/>
      <Box p={[0,2.09,.38]} s={[.98,.71,.034]} c='#1d332e' round/>
      <mesh position={[0,2.09,.402]}><planeGeometry args={[.93,.66]}/><meshBasicMaterial map={wallpaper} color={hover?'#ffffff':'#bed1bc'} toneMapped={false}/></mesh>
      <Label text={'WELCOME BACK\n\nPRANJAL.OS\n\nCLICK TO EXPLORE'} p={[0,2.1,.406]} w={.56} h={.34} bg='#e8e4d1' fg='#253e38' size={56}/>
      <Box p={[0,2.26,.409]} s={[.56,.038,.003]} c='#204e50'/>
      <Cylinder p={[.45,1.64,.372]} radius={.025} height={.025} c='#69705f' r={[Math.PI/2,0,0]}/>
      <Box p={[.34,1.64,.376]} s={[.02,.012,.02]} c='#b6f9ab' emissive='#9cff72' intensity={3}/>
      <Label text='STUDIO  /  01' p={[-.22,1.64,.373]} w={.32} h={.05} bg='#b6baa4' fg='#4f594e' size={65}/>
      {Array.from({length:7},(_,i)=><Box key={i} p={[-.60,1.92+i*.055,-.04]} s={[.008,.018,.37]} c='#4d5b4d'/>)}
    </group>
    <pointLight position={[0,2,.7]} color='#9ccac0' intensity={1.4} distance={2.4} decay={2}/>
  </group>;
}
function Keyboard() {
  return <group position={[.36,1.34,.0]} rotation={[0,-.06,0]}>
    <Box p={[0,0,0]} s={[1.16,.075,.42]} c='#b8b8a0' round/>
    {Array.from({length:5},(_,row)=>Array.from({length:15},(_,col)=><Box key={`${row}-${col}`} p={[-.5+col*.071,.055,-.15+row*.065]} s={[.057,.027,.048]} c={col>11?'#8c9687':'#c7c8b2'}/>))}
    <Box p={[-.05,.073,.11]} s={[.37,.018,.046]} c='#d5d3bb'/>
    <Cable points={[[.48,0,-.2],[.6,0,-.34],[.8,0,-.52],[.75,.03,-.86]]} radius={.009}/>
  </group>;
}
function Chair() {
  const fabric=useSurface('fabric');
  return <group position={[-.18,0,.92]} rotation={[0,.025,0]}>
    <Cylinder p={[0,.36,0]} radius={.06} height={.57} c='#65716c' metal={.8}/>
    <Cylinder p={[0,.25,0]} radius={.1} height={.32} c='#263b37'/>
    {Array.from({length:5},(_,i)=>{const a=i*Math.PI*2/5;return <group key={i} rotation={[0,a,0]}><Box p={[0,.14,.29]} s={[.075,.065,.58]} c='#354743' round/><Cylinder p={[0,.085,.52]} radius={.065} height={.08} r={[0,0,Math.PI/2]} c='#162d28'/></group>;})}
    <Box p={[0,.75,0]} s={[.94,.21,.85]} c='#334c50' map={fabric} round/>
    <Box p={[0,1.32,.32]} s={[.89,1.02,.19]} r={[-.12,0,0]} c='#365157' map={fabric} round/>
    <Box p={[0,1.33,.435]} s={[.73,.84,.035]} r={[-.12,0,0]} c='#425c61' map={fabric} round/>
    {[-1,1].map(i=><group key={i}><Box p={[i*.54,.97,.08]} s={[.055,.46,.07]} c='#45564f'/><Box p={[i*.54,1.19,-.02]} s={[.12,.07,.55]} c='#303f3c' round/></group>)}
    <Box p={[0,.73,.4]} s={[.11,.57,.06]} c='#3c4e48'/>
  </group>;
}
function Lamp({lit,onToggle}:{lit:boolean;onToggle:()=>void}) {
  const {gl}=useThree();
  const target=useMemo(()=>new THREE.Object3D(),[]);target.position.set(-1.35,1.26,-.15);
  return <group onClick={e=>{e.stopPropagation();if(e.delta<=5)onToggle();}} onPointerOver={()=>{gl.domElement.style.cursor='pointer';}} onPointerOut={()=>{gl.domElement.style.cursor='grab';}}>
    <Cylinder p={[-1.48,1.36,-1.52]} radius={.22} height={.07} c='#34483b'/>
    <Cable points={[[-1.48,1.37,-1.52],[-1.5,2.2,-1.5],[-1.13,2.53,-1.4],[-.88,2.36,-1.25]]} c='#435648' radius={.035}/>
    <mesh position={[-.89,2.32,-1.24]} rotation={[.3,0,-.35]} castShadow><coneGeometry args={[.27,.26,32,1,true]}/><meshStandardMaterial color='#3c5342' side={THREE.DoubleSide} metalness={.5} roughness={.45}/></mesh>
    <mesh position={[-.87,2.22,-1.2]}><sphereGeometry args={[.065,16,16]}/><meshStandardMaterial color='#f6e6b5' emissive='#ffe6a0' emissiveIntensity={lit?4:0}/></mesh>
    <primitive object={target}/>
    <spotLight position={[-.85,2.22,-1.18]} target={target} color='#ffdf9c' intensity={lit?13:0} angle={.8} penumbra={.7} castShadow shadow-mapSize={[1024,1024]} shadow-bias={-.0004}/>
    <pointLight position={[-.85,2.14,-1.15]} intensity={lit?1.4:0} color='#ffd997' distance={2.5}/>
  </group>;
}
// Foliage is kept low-poly, with a small reusable leaf geometry.
function LeavesPlant({p,scale=1}:{p:V3;scale?:number}) {
  return <group position={p} scale={scale}>
    <mesh castShadow><cylinderGeometry args={[.19,.13,.32,24]}/><meshStandardMaterial color='#a27352'/></mesh>
    <Cylinder p={[0,.162,0]} radius={.17} height={.015} c='#303728'/>
    {Array.from({length:12},(_,i)=>{const a=i*2.399;const h=.3+(i%4)*.12;return <group key={i} rotation={[0,a,0]}><Cable points={[[0,.16,0],[.04,h,.06],[.15,h+.12,.19]]} c='#53683d' radius={.007}/><mesh position={[.14,h+.1,.17]} scale={[.075,.19,.026]} rotation={[.55,0,-.65]} castShadow><sphereGeometry args={[1,10,8]}/><meshStandardMaterial color={i%2?'#6e8051':'#435e3a'} roughness={.9}/></mesh></group>;})}
  </group>;
}
function Clock() {
  const minute=useRef<THREE.Group>(null); const hour=useRef<THREE.Group>(null);
  useFrame(()=>{const d=new Date();if(minute.current)minute.current.rotation.z=-(d.getMinutes()+d.getSeconds()/60)*Math.PI/30;if(hour.current)hour.current.rotation.z=-(d.getHours()%12+d.getMinutes()/60)*Math.PI/6;});
  return <group position={[-2.9,3.19,-2.66]}>
    <Cylinder p={[0,0,0]} radius={.32} height={.05} c='#627c70' r={[Math.PI/2,0,0]}/>
    <Cylinder p={[0,0,.031]} radius={.285} height={.01} c='#b7c5ac' r={[Math.PI/2,0,0]}/>
    {Array.from({length:12},(_,i)=><group key={i} rotation={[0,0,-i*Math.PI/6]}><Box p={[0,.249,.042]} s={[.014,.034,.006]} c='#51675c'/></group>)}
    <group ref={hour}><Box p={[0,.075,.052]} s={[.017,.15,.007]} c='#34493f'/></group><group ref={minute}><Box p={[0,.105,.061]} s={[.01,.21,.007]} c='#34493f'/></group>
    <Cylinder p={[0,0,.07]} radius={.024} height={.02} c='#8c5f39' r={[Math.PI/2,0,0]}/>
  </group>;
}
function Fan({reduced}:{reduced:boolean}) {
  const blades=useRef<THREE.Group>(null);useFrame((_,dt)=>{if(blades.current&&!reduced)blades.current.rotation.y+=dt*.7;});
  return <group position={[0,3.92,.1]}>
    <Cylinder p={[0,0,0]} radius={.055} height={.4} c='#425a50'/><Cylinder p={[0,-.24,0]} radius={.15} height={.12} c='#64766a'/>
    <group ref={blades} position={[0,-.21,0]}>{[0,1,2].map(i=><group key={i} rotation={[0,i*Math.PI*2/3,0]}><Box p={[.56,0,0]} s={[.98,.025,.18]} c='#7a8370' r={[.1,0,.02]} round/></group>)}</group>
  </group>;
}
function Details() {
  return <>
    {/* Computer tower, floppy drive and vent slots. */}
    <Box p={[1.68,1.79,-1.28]} s={[.53,.96,.84]} c='#a4ae98' round/>
    <Box p={[1.68,2.03,-.849]} s={[.4,.085,.018]} c='#657667'/>
    <Box p={[1.68,1.9,-.849]} s={[.4,.085,.018]} c='#85907b'/>
    <Box p={[1.68,2.032,-.832]} s={[.25,.013,.009]} c='#293d33'/>
    {Array.from({length:7},(_,i)=><Box key={i} p={[1.68,1.5+i*.025,-.851]} s={[.36,.009,.01]} c='#64745f'/>)}
    <Box p={[1.83,1.8,-.853]} s={[.03,.025,.015]} c='#b0d393' emissive='#9ad876' intensity={1}/>
    <Box p={[1.78,1.85,-.85]} s={[.065,.02,.02]} c='#89947e'/>
    <Label text='P—01' p={[1.63,1.73,-.854]} w={.18} h={.07} bg='#c5c8ac' size={72}/>
    {/* Mouse and pad. */}
    <Box p={[1.35,1.307,.1]} s={[.65,.009,.53]} c='#3b594e' round/>
    <mesh position={[1.35,1.36,.1]} scale={[.095,.063,.14]} castShadow><sphereGeometry args={[1,24,16]}/><meshStandardMaterial color='#c1c2a8'/></mesh>
    <Cable points={[[1.35,1.36,-.02],[1.4,1.34,-.24],[1.15,1.34,-.5],[1.3,1.35,-.85]]} radius={.007}/>
    {/* Ceramic cup with coffee. */}
    <Cylinder p={[-.73,1.45,-.04]} radius={.095} height={.22} c='#bdbb9c' metal={0}/>
    <Cylinder p={[-.73,1.565,-.04]} radius={.078} height={.007} c='#362b20' metal={0}/>
    <mesh position={[-.85,1.46,-.04]} rotation={[Math.PI/2,0,0]} castShadow><torusGeometry args={[.066,.018,8,20]}/><meshStandardMaterial color='#c6c3a4'/></mesh>
    {/* Notebook and pencil. */}
    <Box p={[-1.38,1.34,-.09]} s={[.56,.045,.36]} c='#9a764b' r={[0,.16,0]}/>
    <Box p={[-1.38,1.367,-.09]} s={[.52,.006,.33]} c='#b9b38d' r={[0,.16,0]}/>
    <Cylinder p={[-1.34,1.39,-.08]} radius={.009} height={.4} c='#d1a84b' r={[Math.PI/2,0,.55]}/>
    {/* Floppy disks on return desk. */}
    {[-.2,.08,.34].map((z,i)=><group key={i} position={[2.58,1.32,z+.5]} rotation={[0,i*.28,0]}><Box p={[0,0,0]} s={[.24,.018,.24]} c={['#465a68','#7d4b44','#375c4b'][i]}/><Box p={[0,.012,-.06]} s={[.16,.006,.07]} c='#a1aaa0'/><Box p={[0,.012,.05]} s={[.15,.006,.09]} c='#c7c5a7'/></group>)}
    <LeavesPlant p={[2.61,1.46,-1.4]} scale={.75}/>
    {/* Pinboard behind the monitor. */}
    <Box p={[.2,2.36,-2.57]} s={[2.25,1.3,.055]} c='#806f49'/>
    <Box p={[.2,2.36,-2.53]} s={[2.15,1.2,.025]} c='#777d54'/>
    <Label text='MAKE\nSOMETHING\nTHAT MATTERS.' p={[-.3,2.45,-2.505]} w={.62} h={.78} bg='#cec6a0' fg='#355747' size={68} r={[0,0,.04]}/>
    <Label text='THINGS TO TRY\n\n1. Stay curious\n2. Make a little\n3. Repeat\n\nGood things take time.' p={[.48,2.38,-2.502]} w={.57} h={.7} bg='#d2cfad' size={36} r={[0,0,-.07]}/>
    <Box p={[.9,2.66,-2.496]} s={[.22,.2,.006]} c='#d6b578' r={[0,0,-.13]}/>
    <Box p={[.94,2.24,-2.495]} s={[.19,.19,.006]} c='#a9b484' r={[0,0,.08]}/>
    {[-.34,.47,.9].map((x,i)=><Cylinder key={x} p={[x,2.78-i*.03,-2.48]} radius={.016} height={.014} c='#b88b52' r={[Math.PI/2,0,0]}/>)}
    {/* File cabinet. */}
    <Box p={[-3.48,.72,-1.55]} s={[.93,1.43,.88]} c='#4b6356' round/>
    {[0,1,2].map(i=><group key={i}><Box p={[-3.48,.29+i*.44,-1.095]} s={[.83,.39,.035]} c='#536b5c'/><Box p={[-3.48,.35+i*.44,-1.066]} s={[.25,.055,.035]} c='#a8b29c' metal={.7}/><Label text={['ARCHIVE','IDEAS','MISC.'][i]} p={[-3.48,.24+i*.44,-1.073]} w={.23} h={.053} bg='#b0b79b' size={64}/></group>)}
    <LeavesPlant p={[-3.48,1.62,-1.62]} scale={1.2}/>
    {/* Shelves and binders. */}
    <Box p={[-1.42,3.07,-2.34]} s={[2.25,.075,.48]} c='#b3b69e'/>
    <Box p={[-1.42,2.69,-2.52]} s={[2.25,.07,.12]} c='#788774'/>
    {[-2.32,-.52].map(x=><Box key={x} p={[x,2.89,-2.45]} s={[.045,.38,.22]} c='#81917b' metal={.5}/>)}
    {Array.from({length:7},(_,i)=><group key={i} position={[-2.22+i*.17,3.29,-2.33]} rotation={[0,0,i===5?-.12:0]}><Box p={[0,0,0]} s={[.125,.37+(i%3)*.04,.29]} c={['#3d584a','#707d5d','#8e8055','#49605a'][i%4]}/><Label text={`0${i+1}`} p={[0,-.01,.152]} w={.07} h={.14} bg='#b6b596' fg='#475948' size={90}/></group>)}
    <Box p={[-.73,3.21,-2.33]} s={[.46,.2,.32]} c='#506b62'/><Box p={[-.73,3.21,-2.16]} s={[.17,.055,.01]} c='#b3bba3'/>
    {/* Right-side window and individual blinds. */}
    <Box p={[2.44,2.78,-2.68]} s={[1.45,1.65,.06]} c='#b0baa3'/>
    <Box p={[2.44,2.78,-2.637]} s={[1.31,1.51,.018]} c='#a6bfa4' emissive='#8caa89' intensity={.3}/>
    {Array.from({length:14},(_,i)=><Box key={i} p={[2.44,2.08+i*.102,-2.57]} s={[1.33,.065,.10]} c='#92a28c' r={[-.45,0,0]}/>)}
    <Cable points={[[3.1,3.52,-2.49],[3.11,2.7,-2.49],[3.11,2,-2.49]]} c='#c5ccb5' radius={.007}/>
    <Box p={[2.44,1.96,-2.5]} s={[1.53,.06,.25]} c='#c1c5a9'/>
    {/* Calendar on the wall. */}
    <Label text={'OCTOBER\n\nM  T  W  T  F  S  S\n       1  2  3  4\n5  6  7  8  9 10 11\n12 13 14 15 16 17 18\n19 20 21 22 23 24 25\n26 27 28 29 30 31\n\nMAKE TIME TO MAKE.'} p={[1.48,2.76,-2.69]} w={.57} h={.8} bg='#c9c8a9' fg='#455c4d' size={31}/>
    {/* Trash bin. */}
    <mesh position={[2.93,.28,1.51]} castShadow><cylinderGeometry args={[.25,.20,.5,12,1,true]}/><meshStandardMaterial color='#2e493c' side={THREE.DoubleSide}/></mesh>
    <mesh position={[2.91,.27,1.5]} castShadow><dodecahedronGeometry args={[.13,0]}/><meshStandardMaterial color='#b2b9a0'/></mesh>
    {/* Wall socket and floor cables. */}
    <Box p={[1.1,.3,-2.66]} s={[.14,.2,.028]} c='#a0ac93'/>
    <Cable points={[[1.11,.3,-2.6],[1.12,.06,-2.4],[1.6,.04,-2.1],[1.7,.04,-1.6],[1.7,.5,-1.65],[1.7,1.4,-1.7]]} radius={.018}/>
    <Label text='NO RUSH.\nGOOD WORK TAKES TIME.' p={[-3.63,2.36,-2.68]} w={.67} h={.47} bg='#c4b88b' size={49} r={[0,0,-.05]}/>
  </>;
}

function Scene({phase,onEnter,onHover,onReady,lit,onToggle,reduced,quality,viewCommand,onViewChange,blocked}:{phase:string;onEnter:()=>void;onHover:(v:boolean)=>void;onReady:()=>void;lit:boolean;onToggle:()=>void;reduced:boolean;quality:boolean;viewCommand:ViewCommand;onViewChange:(angle:number)=>void;blocked:boolean}) {
  const fabric=useSurface('fabric'),floor=useSurface('floor'),plaster=useSurface('plaster');
  const loaded=useRef(false);
  useFrame(()=>{
    if(!loaded.current){loaded.current=true;onReady();}
  });
  return <>
    <RoomCamera phase={phase} reduced={reduced} blocked={blocked} command={viewCommand} onViewChange={onViewChange}/>
    <color attach="background" args={['#1d332d']}/><fog attach="fog" args={['#1d332d',13,30]}/>
    <ambientLight intensity={.4} color='#b0c5ab'/><hemisphereLight args={['#b7d2c2','#23362c',1.5]}/>
    <directionalLight position={[2.5,6,3]} intensity={2.1} color='#c8dbc2' castShadow shadow-mapSize={[2048,2048]} shadow-camera-left={-7} shadow-camera-right={7} shadow-camera-top={6} shadow-camera-bottom={-6} shadow-bias={-.0005} shadow-normalBias={.03}/>
    <directionalLight position={[-3,3,3]} intensity={.9} color='#a9c6bd'/>
    <pointLight position={[2.4,3.1,-1.9]} color='#d0dbb7' intensity={4} distance={7}/>
    <Environment resolution={128} frames={1}>
      <Lightformer form="rect" intensity={3} position={[0,4,0]} rotation={[Math.PI/2,0,0]} scale={[5,5,1]} color='#b3c6b7'/>
      <Lightformer form="rect" intensity={2} position={[2,2,4]} scale={[3,3,1]} color='#d3dfce'/>
    </Environment>
    {/* A cutaway office, assembled from actual shaded 3D geometry. */}
    <Box p={[0,-.12,0]} s={[24,.24,22]} c='#41564b' map={floor}/>
    {Array.from({length:21},(_,i)=><Box key={i} p={[-10.5+i*1.05,.007,0]} s={[.012,.005,21.9]} c='#36483e'/>)}
    {Array.from({length:20},(_,i)=><Box key={i} p={[0,.008,-9.8+i*1.05]} s={[23.9,.005,.012]} c='#36483e'/>)}
    <Box p={[0,3.5,-2.79]} s={[24,7,.13]} c='#7b8e78' map={plaster}/>
    <Box p={[0,.87,-2.69]} s={[24,1.74,.06]} c='#3b5a4c' map={fabric}/>
    <Box p={[0,1.77,-2.64]} s={[24,.075,.12]} c='#8b9b83'/>
    <Box p={[0,.09,-2.65]} s={[24,.15,.11]} c='#2e493c'/>
    <Box p={[-4.7,1.55,2.5]} s={[.13,3.1,10.6]} c='#4d6b59' map={fabric}/>
    <Box p={[-4.61,3.1,2.5]} s={[.16,.07,10.65]} c='#8c9f87'/>
    {/* Desk and return. */}
    <Box p={[.1,1.25,-.9]} s={[5.4,.11,1.75]} c='#a3ad98' round/>
    <Box p={[2.55,1.25,.22]} s={[1.5,.11,2.5]} c='#a3ad98' round/>
    <Box p={[-2.53,.62,-.9]} s={[.10,1.25,1.55]} c='#7b8d77'/>
    <Box p={[.1,.8,-1.65]} s={[5.2,.65,.06]} c='#566e5a'/>
    <Box p={[2.52,.64,.44]} s={[1.22,1.2,1.48]} c='#758873' round/>
    {[0,1,2].map(i=><group key={i}><Box p={[2.52,.28+i*.33,1.2]} s={[1.12,.295,.035]} c='#82917b'/><Box p={[2.52,.34+i*.33,1.235]} s={[.32,.028,.032]} c='#b0b79e' metal={.65}/></group>)}
    <Monitor onEnter={onEnter} onHover={onHover}/><Keyboard/><Chair/><TypingCharacter reduced={reduced}/><Lamp lit={lit} onToggle={onToggle}/><Details/><Clock/><Fan reduced={reduced}/>
    {/* The pool of fluorescent light remains subtle rather than bleaching the room. */}
    <Box p={[-2,3.83,-1.4]} s={[1.65,.045,.27]} c='#a7b9a3'/>
    <Box p={[-2,3.8,-1.4]} s={[1.45,.018,.17]} c='#dae8c6' emissive='#b6d2ac' intensity={2.3}/>
    {!reduced&&<Sparkles count={35} scale={[7,3.5,5]} position={[0,1.8,0]} size={1.2} speed={.12} opacity={.2} color='#e6d6a8'/>}
    <EffectComposer multisampling={quality?4:0}>
      {quality?<N8AO aoRadius={.5} intensity={1.4} distanceFalloff={1} quality="medium"/>:<></>}
      <Bloom luminanceThreshold={1.4} mipmapBlur intensity={.25}/>
      <Noise opacity={.025}/><Vignette eskil={false} offset={.18} darkness={.55}/>
    </EffectComposer>
  </>;
}
export function Room(props: Omit<Parameters<typeof Scene>[0],'quality'> & {quality:boolean}) {
  return <Canvas frameloop={props.phase==='desktop'?'demand':'always'} shadows dpr={[1,props.quality?1.75:1]} camera={{position:[5.5,3.6,8.2],fov:39,near:.05,far:60}} gl={{antialias:false,powerPreference:'high-performance'}} onCreated={({gl})=>{gl.toneMapping=THREE.ACESFilmicToneMapping;gl.toneMappingExposure=1.13;}}><Scene {...props}/></Canvas>;
}
