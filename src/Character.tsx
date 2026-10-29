import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

type V3 = [number, number, number];
const SKIN = '#ad7550';
const SHIRT = '#65818a';
const PANTS = '#484e48';
const HAIR = '#202523';

function Ellipsoid({p,s,c,rough=.85}:{p:V3;s:V3;c:string;rough?:number}) {
  return <mesh position={p} scale={s} castShadow receiveShadow><sphereGeometry args={[1,24,20]}/><meshStandardMaterial color={c} roughness={rough}/></mesh>;
}

/** A rounded anatomical segment, oriented between its two joints. */
function Segment({from,to,radius,color,endRadius=radius}:{from:V3;to:V3;radius:number;color:string;endRadius?:number}) {
  const {position,quaternion,length} = useMemo(()=>{
    const a=new THREE.Vector3(...from),b=new THREE.Vector3(...to),direction=b.clone().sub(a);
    return {position:a.add(b).multiplyScalar(.5),quaternion:new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),direction.clone().normalize()),length:direction.length()};
  },[...from,...to]);
  return <group>
    <mesh position={position} quaternion={quaternion} castShadow receiveShadow><cylinderGeometry args={[endRadius,radius,length,20]}/><meshStandardMaterial color={color} roughness={.87}/></mesh>
    <Ellipsoid p={from} s={[radius,radius,radius]} c={color}/>
    <Ellipsoid p={to} s={[endRadius,endRadius,endRadius]} c={color}/>
  </group>;
}

function Stitch({points,color='#526a70',radius=.0035}:{points:V3[];color?:string;radius?:number}) {
  const curve=useMemo(()=>new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p))),[points]);
  return <mesh><tubeGeometry args={[curve,18,radius,5,false]}/><meshStandardMaterial color={color} roughness={1}/></mesh>;
}

function Sneaker({p,turn=0}:{p:V3;turn?:number}) {
  return <group position={p} rotation={[0,turn,0]}>
    <Ellipsoid p={[0,.015,-.025]} s={[.133,.041,.245]} c='#c0bca5'/>
    <Ellipsoid p={[0,.067,-.03]} s={[.121,.085,.226]} c='#39423e'/>
    <Ellipsoid p={[0,.105,.055]} s={[.104,.08,.13]} c='#48534b'/>
    <Ellipsoid p={[0,.122,.05]} s={[.065,.027,.095]} c='#29352f'/>
    {[0,1,2,3].map(i=><Stitch key={i} points={[[ -.055,.137-i*.006,.045-i*.039],[0,.148-i*.006,.027-i*.039],[.055,.137-i*.006,.045-i*.039]]} color='#b5b4a0' radius={.006}/>)}
    <Stitch points={[[-.105,.06,-.16],[0,.077,-.246],[.105,.06,-.16]]} color='#687067' radius={.004}/>
  </group>;
}

function Head({headRef}:{headRef:React.RefObject<THREE.Group|null>}) {
  return <group ref={headRef} position={[-.11,2.135,.43]} rotation={[-.08,.06,0]}>
    <Ellipsoid p={[0,0,0]} s={[.172,.215,.18]} c={SKIN}/>
    <Ellipsoid p={[0,-.09,-.012]} s={[.143,.12,.148]} c={SKIN}/>
    {/* The face looks toward -Z, toward the monitor. */}
    <Ellipsoid p={[0,-.006,-.178]} s={[.031,.047,.042]} c='#b98158'/>
    <Ellipsoid p={[0,-.037,-.187]} s={[.038,.021,.025]} c='#b17a51'/>
    {[-1,1].map(side=><group key={side}>
      <Ellipsoid p={[side*.171,-.015,.014]} s={[.033,.058,.029]} c={SKIN}/>
      <Ellipsoid p={[side*.185,-.016,-.003]} s={[.012,.036,.014]} c='#925d40'/>
      <Ellipsoid p={[side*.067,.028,-.163]} s={[.031,.014,.012]} c='#c8bfa6'/>
      <Ellipsoid p={[side*.067,.027,-.175]} s={[.011,.011,.006]} c='#302a24'/>
      <Stitch points={[[side*.037,.064,-.168],[side*.067,.072,-.165],[side*.096,.064,-.147]]} color={HAIR} radius={.009}/>
      <Ellipsoid p={[side*.155,.005,-.032]} s={[.023,.064,.057]} c={HAIR}/>
    </group>)}
    <Stitch points={[[-.04,-.084,-.157],[0,-.09,-.166],[.04,-.084,-.157]]} color='#734831' radius={.0045}/>
    <Ellipsoid p={[0,.035,.075]} s={[.181,.193,.135]} c={HAIR}/>
    <mesh scale={[.181,.224,.19]} castShadow><sphereGeometry args={[1,32,20,0,Math.PI*2,0,1.19]}/><meshStandardMaterial color={HAIR} roughness={.94}/></mesh>
    {/* Soft swept tufts avoid a perfectly spherical hair silhouette. */}
    {Array.from({length:7},(_,i)=><mesh key={i} position={[-.13+i*.039,.177+Math.sin(i*.5)*.018,-.045]} rotation={[0,0,-.18]} scale={[.049,.05,.105]} castShadow><sphereGeometry args={[1,16,12]}/><meshStandardMaterial color={i%2?'#252b27':HAIR} roughness={.95}/></mesh>)}
  </group>;
}

function Hand({side,fingers,handRef}:{side:number;fingers:React.RefObject<(THREE.Group|null)[]>;handRef:React.RefObject<THREE.Group|null>}) {
  const offset=side===-1?0:4;
  return <group ref={handRef} position={side===-1?[.045,1.445,.045]:[.525,1.445,.055]} rotation={[.02,side*.13,side*-.025]}>
    <Ellipsoid p={[0,0,0]} s={[.069,.029,.079]} c={SKIN}/>
    {[0,1,2,3].map(i=><group key={i} ref={node=>{fingers.current[offset+i]=node;}} position={[-.047+i*.031,-.005,-.053]}>
      <Segment from={[0,0,0]} to={[0,-.003,-.039-(i===0||i===3?-.008:0)]} radius={.012} endRadius={.0105} color={SKIN}/>
      <Segment from={[0,-.003,-.039-(i===0||i===3?-.008:0)]} to={[0,-.022,-.070+(i===0||i===3?.012:0)]} radius={.0105} endRadius={.0085} color={SKIN}/>
    </group>)}
    <Segment from={[-side*.055,-.001,.015]} to={[-side*.091,-.008,-.018]} radius={.018} endRadius={.014} color={SKIN}/>
    <Segment from={[-side*.091,-.008,-.018]} to={[-side*.082,-.02,-.054]} radius={.014} endRadius={.011} color={SKIN}/>
  </group>;
}

export function TypingCharacter({reduced}:{reduced:boolean}) {
  const head=useRef<THREE.Group>(null),torso=useRef<THREE.Group>(null),leftHand=useRef<THREE.Group>(null),rightHand=useRef<THREE.Group>(null);
  const fingers=useRef<(THREE.Group|null)[]>([]);
  const elapsed=useRef(0);
  const shirtProfile=useMemo(()=>[
    [.225,0],[.26,.06],[.272,.22],[.305,.51],[.302,.64],[.26,.72],[.17,.79],[.115,.815],
  ].map(([radius,height])=>new THREE.Vector2(radius,height)),[]);
  useFrame((_,dt)=>{
    if(reduced)return;
    elapsed.current+=Math.min(dt,.05);const t=elapsed.current;
    // Short natural pauses break up the typing without playing a rigid loop.
    const typing=Math.sin(t*.87)>-.63?1:.12;
    fingers.current.forEach((finger,i)=>{if(finger)finger.rotation.x=.035+typing*(.12+.12*Math.sin(t*(10.5+i%3)+i*1.78));});
    if(leftHand.current){leftHand.current.position.y=1.445+Math.sin(t*8.1)*.003*typing;leftHand.current.rotation.z=.025+Math.sin(t*2.7)*.018*typing;}
    if(rightHand.current){rightHand.current.position.y=1.445+Math.sin(t*9.3+1.7)*.003*typing;rightHand.current.rotation.z=-.025+Math.sin(t*2.2+1.2)*.016*typing;}
    if(head.current){head.current.rotation.x=-.08+Math.sin(t*.9)*.022;head.current.rotation.y=.06+Math.sin(t*.38)*.035;}
    if(torso.current)torso.current.scale.y=1+Math.sin(t*1.45)*.004;
  });

  return <group name="Pranjal — seated typing character">
    {/* Relaxed trousers, seated pelvis, and two individually shaped bent legs. */}
    <Ellipsoid p={[-.18,.969,.78]} s={[.31,.16,.28]} c={PANTS}/>
    <Segment from={[-.365,.96,.68]} to={[-.40,.78,.10]} radius={.151} endRadius={.156} color={PANTS}/>
    <Segment from={[-.40,.78,.10]} to={[-.42,.205,-.10]} radius={.145} endRadius={.119} color={PANTS}/>
    <Segment from={[-.005,.96,.69]} to={[.085,.78,.12]} radius={.153} endRadius={.157} color={PANTS}/>
    <Segment from={[.085,.78,.12]} to={[.10,.205,-.065]} radius={.145} endRadius={.121} color={PANTS}/>
    <Stitch points={[[-.52,.70,.13],[-.51,.52,.065],[-.52,.29,-.04]]} color='#5b6055' radius={.004}/>
    <Stitch points={[[.22,.71,.16],[.23,.53,.1],[.21,.29,-.03]]} color='#5b6055' radius={.004}/>
    {[-.42,.1].map((x,i)=><group key={x}>
      <mesh position={[x,.235,i===0?-.089:-.056]} rotation={[-.20,0,0]}><cylinderGeometry args={[.123,.125,.054,22]}/><meshStandardMaterial color='#596052' roughness={1}/></mesh>
      <Sneaker p={[x,.048,i===0?-.22:-.18]} turn={i===0?.08:-.08}/>
    </group>)}

    {/* A softly tailored button-up shirt, leaning toward the keyboard. */}
    <group ref={torso} position={[-.18,1.055,.79]} rotation={[-.23,0,0]}>
      <mesh scale={[1,1,.64]} castShadow receiveShadow><latheGeometry args={[shirtProfile,36]}/><meshStandardMaterial color={SHIRT} roughness={.93}/></mesh>
      <Stitch points={[[-.245,.60,.115],[0,.595,.194],[.245,.60,.115]]} color='#7d969c' radius={.005}/>
      <Stitch points={[[0,.08,-.173],[0,.37,-.194],[0,.68,-.156],[0,.79,-.086]]} color='#8da1a3' radius={.009}/>
      {[.18,.31,.44,.57,.69].map(y=><Ellipsoid key={y} p={[0,y,-.195+(y>.57?.025:0)]} s={[.009,.009,.004]} c='#c4c6b1'/>)}
      <Ellipsoid p={[0,.83,0]} s={[.088,.10,.087]} c={SKIN}/>
      <mesh position={[0,.786,0]} scale={[1,1,.8]}><cylinderGeometry args={[.124,.148,.07,24,1,true]}/><meshStandardMaterial color='#9bafb0' side={THREE.DoubleSide} roughness={1}/></mesh>
      <mesh position={[-.065,.77,-.098]} rotation={[.3,-.25,.44]} scale={[.07,.105,.018]}><sphereGeometry args={[1,14,10]}/><meshStandardMaterial color='#80999e' roughness={1}/></mesh>
      <mesh position={[.065,.77,-.098]} rotation={[.3,.25,-.44]} scale={[.07,.105,.018]}><sphereGeometry args={[1,14,10]}/><meshStandardMaterial color='#80999e' roughness={1}/></mesh>
    </group>
    <Segment from={[-.445,1.72,.65]} to={[-.295,1.425,.45]} radius={.125} endRadius={.115} color={SHIRT}/>
    <Segment from={[.12,1.72,.65]} to={[.405,1.415,.43]} radius={.125} endRadius={.115} color={SHIRT}/>
    {/* Rolled sleeve cuffs, exposed forearms, and working hands. */}
    <Segment from={[-.305,1.445,.462]} to={[-.278,1.404,.427]} radius={.122} endRadius={.119} color='#8ca3a6'/>
    <Segment from={[.385,1.437,.447]} to={[.424,1.396,.411]} radius={.122} endRadius={.119} color='#8ca3a6'/>
    <Segment from={[-.277,1.393,.423]} to={[.045,1.443,.10]} radius={.078} endRadius={.053} color={SKIN}/>
    <Segment from={[.426,1.387,.407]} to={[.525,1.443,.11]} radius={.078} endRadius={.053} color={SKIN}/>
    <Hand side={-1} fingers={fingers} handRef={leftHand}/><Hand side={1} fingers={fingers} handRef={rightHand}/>
    <Segment from={[-.18,1.865,.59]} to={[-.11,2.015,.465]} radius={.078} endRadius={.076} color={SKIN}/>
    <Head headRef={head}/>
  </group>;
}
