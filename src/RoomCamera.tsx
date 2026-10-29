import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';

export type ViewCommand={id:number;action:'left'|'right'|'reset'};
const LOOK_AT=new THREE.Vector3(-.15,1.7,-.6);
const FOCUS_POSITION=new THREE.Vector3(.45,2.09,1);
const FOCUS_TARGET=new THREE.Vector3(.45,2.09,-1.1);
const MIN_AZIMUTH=.15,MAX_AZIMUTH=.95,MIN_POLAR=1.12,MAX_POLAR=1.49;

export function RoomCamera({phase,reduced,blocked,command,onViewChange}:{phase:string;reduced:boolean;blocked:boolean;command:ViewCommand;onViewChange:(angle:number)=>void}) {
  const {camera,size,gl}=useThree();
  const controls=useRef<OrbitControlsImpl>(null);
  const narrow=size.width/size.height<1;
  const preset=useMemo(()=>narrow?new THREE.Vector3(6.9,4.7,11.8):new THREE.Vector3(4.4,3.1,6.8),[narrow]);
  const roomView=useRef({position:preset.clone(),target:LOOK_AT.clone()});
  const lookTarget=useRef(LOOK_AT.clone());
  const previousPhase=useRef(phase);
  const angle=useRef(-1);

  const reset=()=>{
    const orbit=controls.current;if(!orbit)return;
    // Flush any drag momentum before setting an exact preset.
    orbit.enableDamping=false;orbit.update();
    camera.position.copy(preset);orbit.target.copy(LOOK_AT);orbit.update();
    orbit.enableDamping=!reduced;
  };
  const rotate=(horizontal:number,vertical=0)=>{
    const orbit=controls.current;if(!orbit)return;
    // Button/key steps should be exact even when the previous drag is coasting.
    orbit.enableDamping=false;orbit.update();
    orbit.setAzimuthalAngle(THREE.MathUtils.clamp(orbit.getAzimuthalAngle()+horizontal,MIN_AZIMUTH,MAX_AZIMUTH));
    orbit.setPolarAngle(THREE.MathUtils.clamp(orbit.getPolarAngle()+vertical,MIN_POLAR,MAX_POLAR));
    orbit.enableDamping=!reduced;
  };

  useLayoutEffect(()=>{
    roomView.current.position.copy(preset);roomView.current.target.copy(LOOK_AT);
    if(phase==='room')reset();
    gl.domElement.style.cursor='grab';
    // Resize only when crossing the landscape/portrait camera breakpoint.
    // Preserving the current orbit during ordinary resizes avoids camera jumps.
  },[preset]);

  useEffect(()=>{
    const orbit=controls.current;if(!orbit)return;
    if(previousPhase.current==='room'&&phase==='entering'){
      orbit.enableDamping=false;orbit.update();orbit.enableDamping=!reduced;
      roomView.current.position.copy(camera.position);roomView.current.target.copy(orbit.target);
      lookTarget.current.copy(orbit.target);
    }
    if(phase==='room'&&previousPhase.current==='leaving'){
      camera.position.copy(roomView.current.position);orbit.target.copy(roomView.current.target);orbit.update();
    }
    previousPhase.current=phase;
  },[phase]);

  useEffect(()=>{
    if(phase!=='room'||blocked||command.id===0)return;
    if(command.action==='reset')reset();else rotate(command.action==='left'?-.14:.14);
  },[command]);

  useEffect(()=>{
    const keydown=(event:KeyboardEvent)=>{
      if(phase!=='room'||blocked||event.altKey||event.ctrlKey||event.metaKey)return;
      const target=event.target as HTMLElement;
      if(target?.closest('input,textarea,select,[contenteditable="true"]'))return;
      if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home'].includes(event.key))return;
      event.preventDefault();
      if(event.key==='Home')reset();
      else rotate(event.key==='ArrowLeft'?-.075:event.key==='ArrowRight'?.075:0,event.key==='ArrowUp'?-.045:event.key==='ArrowDown'?.045:0);
    };
    window.addEventListener('keydown',keydown);return()=>window.removeEventListener('keydown',keydown);
  },[phase,blocked,reduced,preset]);

  useFrame((_,dt)=>{
    if(phase==='room')return;
    const leaving=phase==='leaving';
    camera.position.lerp(leaving?roomView.current.position:FOCUS_POSITION,1-Math.exp(-dt*(reduced?45:3.5)));
    lookTarget.current.lerp(leaving?roomView.current.target:FOCUS_TARGET,1-Math.exp(-dt*(reduced?45:3.5)));
    camera.lookAt(lookTarget.current);
  });

  return <OrbitControls ref={controls} makeDefault target={[-.15,1.7,-.6]}
    enabled={phase==='room'&&!blocked} enablePan={false} enableDamping={!reduced} dampingFactor={.09}
    rotateSpeed={.45} zoomSpeed={.6} minDistance={narrow?12.5:7.5} maxDistance={narrow?16.8:11.2}
    minAzimuthAngle={MIN_AZIMUTH} maxAzimuthAngle={MAX_AZIMUTH} minPolarAngle={MIN_POLAR} maxPolarAngle={MAX_POLAR}
    onStart={()=>{gl.domElement.style.cursor='grabbing';}}
    onEnd={()=>{gl.domElement.style.cursor='grab';}}
    onChange={()=>{
      if(phase!=='room'||!controls.current)return;
      const next=Math.round(THREE.MathUtils.radToDeg(controls.current.getAzimuthalAngle()));
      if(next!==angle.current){angle.current=next;onViewChange(next);}
    }}/>
  ;
}
