"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { ArrowUpRight, ChevronLeft, ChevronRight, Code2, Compass, Cpu, Maximize2, Minus, Pause, Play, Plus, RotateCcw, Smartphone, Radio } from "lucide-react";
import type { Group } from "three";

const motionQuery = "(prefers-reduced-motion: reduce)";
const reducedSnapshot = () => window.matchMedia(motionQuery).matches;
const subscribeMotion = (notify: () => void) => {
  const query = window.matchMedia(motionQuery);
  query.addEventListener("change", notify);
  return () => query.removeEventListener("change", notify);
};

type Station = "overview" | "experience" | "projects" | "stack" | "contact";
const stations = [
  { id: "experience" as const, name: "Experience", code: "01", icon: Smartphone, title: "Engineering in the real world.", text: "Enterprise Android, warehouse systems, agriculture technology, and full-stack web delivery.", action: "Explore experience", position: [-2.25, 1.5, .65] },
  { id: "projects" as const, name: "Projects", code: "02", icon: Code2, title: "A collection of possibilities.", text: "Six selected projects across web, mobile, and games. Open the source and explore how they work.", action: "Discover projects", position: [0, 2.05, -1.5] },
  { id: "stack" as const, name: "Toolkit", code: "03", icon: Cpu, title: "The right tools. Real impact.", text: "Java, C# MVC, Oracle, PostgreSQL, and a foundation spanning modern web and mobile development.", action: "See the toolkit", position: [2.2, 1.45, .45] },
  { id: "contact" as const, name: "Connect", code: "04", icon: Radio, title: "Every great idea starts somewhere.", text: "Have a project in mind? Let’s connect and build something meaningful together.", action: "Start a conversation", position: [0, 1.25, 2.35] },
];
const overview = { title: "Welcome to my digital workspace.", text: "A small world of ideas, engineering, and the things I build. Pick a station to explore.", action: "Explore my experience", id: "experience" };

export default function FoundryWorld() {
  const mount = useRef<HTMLDivElement>(null);
  const worldRoot = useRef<HTMLDivElement>(null);
  const labels = useRef<Record<string, HTMLButtonElement | null>>({});
  const api = useRef<{ focus: (id: Station) => void; zoom: (scale: number) => void; reset: () => void } | null>(null);
  const activeRef = useRef<Station>("overview");
  const playingRef = useRef(true);
  const [active, setActive] = useState<Station>("overview");
  const [playing, setPlaying] = useState(true);
  const [ready, setReady] = useState(false);
  const [fallback, setFallback] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const reduce = useSyncExternalStore(subscribeMotion, reducedSnapshot, () => true);
  const select = (id: Station) => { activeRef.current=id;setActive(id);api.current?.focus(id); };
  const reset = () => { activeRef.current="overview";setActive("overview");api.current?.reset(); };
  const cycle = (direction: number) => {
    const index=stations.findIndex(s=>s.id===activeRef.current);
    const next=index<0?(direction>0?0:stations.length-1):(index+direction+stations.length)%stations.length;
    select(stations[next].id);
  };
  useEffect(()=>{playingRef.current=playing;},[playing]);
  useEffect(()=>{
    if(!expanded)return;
    const previousOverflow=document.body.style.overflow;
    const previousFocus=document.activeElement as HTMLElement | null;
    document.body.style.overflow="hidden";
    worldRoot.current?.querySelector<HTMLButtonElement>('[aria-label="Close expanded scene"]')?.focus();
    const keys=(e:KeyboardEvent)=>{
      if(e.key==="Escape"){setExpanded(false);return;}
      if(e.key!=="Tab")return;
      const focusable=Array.from(worldRoot.current?.querySelectorAll<HTMLElement>('button:not(:disabled), a[href], canvas[tabindex="0"]')||[]).filter(el=>getComputedStyle(el).visibility!=="hidden");
      const first=focusable[0],last=focusable[focusable.length-1];
      if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}
      else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}
    };
    document.addEventListener("keydown",keys);
    return()=>{document.removeEventListener("keydown",keys);document.body.style.overflow=previousOverflow;previousFocus?.focus({preventScroll:true});};
  },[expanded]);
  useEffect(()=>{
    let disposed=false,cleanup=()=>{};
    const host=mount.current;if(!host)return;
    const reduced=matchMedia(motionQuery);
    (async()=>{
      const THREE=await import("three");
      const {OrbitControls}=await import("three/addons/controls/OrbitControls.js");
      const {RoomEnvironment}=await import("three/addons/environments/RoomEnvironment.js");
      if(disposed)return;
      let renderer: InstanceType<typeof THREE.WebGLRenderer>;
      try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:"low-power"});}catch{setFallback(true);return;}
      renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5));renderer.setClearColor(0x000000,0);renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;
      renderer.domElement.className="foundry-canvas";renderer.domElement.tabIndex=0;
      renderer.domElement.setAttribute("aria-label","Interactive 3D workspace. Drag horizontally or use arrow keys to orbit. Use the station buttons to explore.");
      renderer.domElement.setAttribute("role","img");host.appendChild(renderer.domElement);
      const scene=new THREE.Scene();
      const pmrem=new THREE.PMREMGenerator(renderer);const environment=new RoomEnvironment();const env=pmrem.fromScene(environment,.04);scene.environment=env.texture;environment.dispose();pmrem.dispose();
      const camera=new THREE.PerspectiveCamera(38,1,.1,80);camera.position.set(6,5.4,7.5);
      const controls=new OrbitControls(camera,renderer.domElement);controls.target.set(0,.35,0);controls.enableDamping=true;controls.dampingFactor=.09;controls.rotateSpeed=.85;controls.enablePan=false;controls.enableZoom=false;controls.minPolarAngle=.5;controls.maxPolarAngle=1.3;
      controls.update();controls.saveState();
      const world=new THREE.Group();scene.add(world);
      const light=new THREE.HemisphereLight(0xd5f8ff,0x213512,2);scene.add(light);
      const key=new THREE.DirectionalLight(0xf0ffdf,4);key.position.set(-4,8,5);scene.add(key);
      const rim=new THREE.DirectionalLight(0xb6ff65,4);rim.position.set(4,3,-5);scene.add(rim);
      const fill=new THREE.PointLight(0xa7e6ff,20,15);fill.position.set(-3,2,-3);scene.add(fill);
      const graphite=new THREE.MeshStandardMaterial({color:0x202b24,metalness:.7,roughness:.35});
      const dark=new THREE.MeshStandardMaterial({color:0x0e1712,metalness:.45,roughness:.5});
      const chrome=new THREE.MeshStandardMaterial({color:0xc8d4ca,metalness:.95,roughness:.2});
      const lime=new THREE.MeshStandardMaterial({color:0xb7f477,metalness:.35,roughness:.3,emissive:0x477619,emissiveIntensity:.3});
      const glow=new THREE.MeshBasicMaterial({color:0xc3ff83,toneMapped:false});
      const cyan=new THREE.MeshBasicMaterial({color:0x9ce5db,toneMapped:false});
      const screen=new THREE.MeshStandardMaterial({color:0x0b241c,metalness:.3,roughness:.3,emissive:0x153b26,emissiveIntensity:.45});
      const glass=new THREE.MeshPhysicalMaterial({color:0xc7ff9c,metalness:.15,roughness:.13,transparent:true,opacity:.2,side:THREE.DoubleSide,depthWrite:false});
      const allGeometries=new Set<InstanceType<typeof THREE.BufferGeometry>>();
      const mesh=(geometry: import("three").BufferGeometry<import("three").NormalBufferAttributes>,material: InstanceType<typeof THREE.Material>,parent: InstanceType<typeof THREE.Object3D>=world)=>{allGeometries.add(geometry);const object=new THREE.Mesh(geometry,material);parent.add(object);return object;};
      const box=(w:number,h:number,d:number,x:number,y:number,z:number,material: import("three").Material=graphite,parent: InstanceType<typeof THREE.Object3D>=world)=>{const m=mesh(new THREE.BoxGeometry(w,h,d),material,parent);m.position.set(x,y,z);return m;};
      const cylinder=(r:number,h:number,y:number,material: import("three").Material=graphite,segments=64,parent: InstanceType<typeof THREE.Object3D>=world)=>{const m=mesh(new THREE.CylinderGeometry(r,r,h,segments),material,parent);m.position.y=y;return m;};
      const ring=(r:number,tube:number,y:number,material: import("three").Material=glow,parent: InstanceType<typeof THREE.Object3D>=world)=>{const m=mesh(new THREE.TorusGeometry(r,tube,8,80),material,parent);m.rotation.x=Math.PI/2;m.position.y=y;return m;};
      // A floating, machined island: every object is original procedural geometry.
      const base=cylinder(3.55,.36,-.2,graphite,8);base.rotation.y=Math.PI/8;
      const bevel=cylinder(3.4,.14,.05,dark,8);bevel.rotation.y=Math.PI/8;
      const underside=mesh(new THREE.ConeGeometry(3.5,1.25,8),dark);underside.rotation.z=Math.PI;underside.rotation.y=Math.PI/8;underside.position.y=-.95;
      ring(3.22,.025,-.36,glow);ring(3.42,.018,-.13,chrome);ring(3.1,.012,.14,glow);
      const lowerRing=ring(2.7,.028,-1.25,lime);ring(1.8,.014,-1.55,chrome);
      for(let i=0;i<8;i++){const a=i*Math.PI/4;const foot=box(.35,.15,.35,Math.cos(a)*2.9,.14,Math.sin(a)*2.9,chrome);foot.rotation.y=-a;box(.09,.035,.15,Math.cos(a)*2.9,.23,Math.sin(a)*2.9,lime);}
      // Inlaid floor markings and radial routes between stations.
      for(let i=-3;i<=3;i++){if(i===0)continue;const length=Math.sqrt(3.0**2-(i*.7)**2)*2;box(length,.008,.012,0,.132,i*.7,graphite);box(.012,.008,length,i*.7,.132,0,graphite);}
      const core=cylinder(.78,.14,.18,chrome);cylinder(.69,.16,.28,dark);ring(.65,.018,.38,glow);
      const coreOrb=mesh(new THREE.IcosahedronGeometry(.38,1),lime);coreOrb.position.y=1.25;
      const halo=mesh(new THREE.TorusGeometry(.7,.055,12,64),chrome);halo.position.y=1.25;halo.rotation.x=.9;halo.rotation.y=.4;
      const haloTwo=mesh(new THREE.TorusGeometry(.58,.022,8,64),glow);haloTwo.position.y=1.25;haloTwo.rotation.y=1.1;
      const beam=cylinder(.19,.7,.74,glass);beam.renderOrder=2;
      const stationGroups=new Map<Station,Group>();const selectable: InstanceType<typeof THREE.Object3D>[]=[];const pads: InstanceType<typeof THREE.Mesh>[]=[];
      stations.forEach(st=>{
        const group=new THREE.Group();group.position.set(st.position[0],.14,st.position[2]);group.userData.station=st.id;world.add(group);stationGroups.set(st.id,group);
        const pad=cylinder(.67,.1,.04,graphite,48,group);pad.userData.station=st.id;
        const border=ring(.64,.018,.11,lime,group);pads.push(border);
        cylinder(.54,.08,.12,dark,48,group);
        const routeLength=Math.hypot(st.position[0],st.position[2]);const route=box(.022,.012,routeLength-.7,st.position[0]/2,.145,st.position[2]/2,lime);route.rotation.y=Math.atan2(st.position[0],st.position[2]);
        // An invisible picking volume keeps model selection forgiving on touch screens.
        const hit=mesh(new THREE.CylinderGeometry(.68,.68,1.7,12),new THREE.MeshBasicMaterial({visible:false}),group);hit.position.y=.75;hit.userData.station=st.id;selectable.push(hit);
      });
      // Android station: a chrome-framed mobile device and its dock.
      const phone=stationGroups.get("experience")!;phone.rotation.y=.35;
      box(.42,.16,.48,0,.23,0,chrome,phone);box(.18,.6,.15,0,.56,-.08,graphite,phone);
      box(.68,1.2,.12,0,1,0,chrome,phone);box(.6,1.09,.13,0,1,.015,dark,phone);box(.53,.91,.015,0,1.02,.092,screen,phone);
      for(let i=0;i<3;i++){box(.34,.055,.018,-.035,1.29-i*.18,.105,i===0?glow:lime,phone);box(.09,.055,.018,.19,1.29-i*.18,.105,chrome,phone);}box(.12,.02,.02,0,.54,.103,glow,phone);
      // Projects station: a real 3D workstation, keyboard, and luminous code screen.
      const work=stationGroups.get("projects")!;work.rotation.y=.18;
      box(1.45,.11,.7,0,.47,.15,graphite,work);for(const x of [-.54,.54])box(.07,.35,.5,x,.25,.15,chrome,work);
      box(.13,.35,.12,0,.68,-.07,chrome,work);box(1.38,.83,.1,0,1.13,-.11,chrome,work);box(1.29,.74,.11,0,1.13,-.09,dark,work);box(1.17,.63,.025,0,1.13,-.019,screen,work);
      for(let i=0;i<6;i++){box(.23+(i%3)*.17,.025,.017,-.22+(i%2)*.08,1.36-i*.085,.001,i%2===0?glow:cyan,work);}
      box(.76,.035,.25,-.08,.55,.35,dark,work);for(let i=0;i<5;i++)box(.055,.012,.16,-.34+i*.13,.573,.35,chrome,work);box(.16,.04,.22,.53,.56,.34,lime,work);
      // Toolkit station: data modules with emissive status indicators.
      const data=stationGroups.get("stack")!;data.rotation.y=-.3;
      for(let i=0;i<3;i++){box(.81,.28,.65,0,.33+i*.31,0,graphite,data);box(.67,.2,.025,0,.33+i*.31,.34,dark,data);box(.34,.025,.02,-.1,.33+i*.31,.36,chrome,data);for(let j=0;j<2;j++)box(.035,.035,.02,.19+j*.09,.33+i*.31,.36,j===0?glow:cyan,data);}
      const dataGem=mesh(new THREE.OctahedronGeometry(.24),lime,data);dataGem.position.set(0,1.48,0);ring(.36,.012,1.18,glow,data);
      // Connect station: a small communications dish and orbiting signal rings.
      const comm=stationGroups.get("contact")!;comm.rotation.y=-.35;
      box(.44,.15,.42,0,.24,0,chrome,comm);box(.11,.55,.11,0,.56,0,chrome,comm);
      const dish=mesh(new THREE.SphereGeometry(.43,24,12,0,Math.PI*2,0,Math.PI*.48),chrome,comm);dish.rotation.x=1;dish.position.y=.95;
      const dishInner=mesh(new THREE.SphereGeometry(.39,24,12,0,Math.PI*2,0,Math.PI*.48),lime,comm);dishInner.rotation.x=1;dishInner.position.y=.96;
      const aerial=box(.035,.58,.035,0,1.1,.16,graphite,comm);aerial.rotation.x=.5;
      const signalA=mesh(new THREE.TorusGeometry(.42,.013,6,48,Math.PI*1.4),glow,comm);signalA.position.set(0,1.32,.1);signalA.rotation.set(.3,.6,.8);
      // Orbiting courier drone.
      const drone=new THREE.Group();world.add(drone);mesh(new THREE.SphereGeometry(.14,12,8),chrome,drone);
      for(const x of [-.28,.28]){box(.5,.025,.04,x,.03,0,graphite,drone);const prop=ring(.18,.014,.04,glow,drone);prop.position.x=x;}
      const particlesGeometry=new THREE.BufferGeometry();allGeometries.add(particlesGeometry);const particlePositions=[];
      for(let i=0;i<70;i++){const a=i*2.39996,r=4+(i%7)*.7;particlePositions.push(Math.cos(a)*r,Math.sin(i*1.7)*3+1,Math.sin(a)*r);}
      particlesGeometry.setAttribute("position",new THREE.Float32BufferAttribute(particlePositions,3));const particleMaterial=new THREE.PointsMaterial({color:0xc3f4a0,size:.022,transparent:true,opacity:.6});scene.add(new THREE.Points(particlesGeometry,particleMaterial));
      const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2();let pressed={x:0,y:0};
      const down=(e:PointerEvent)=>{pressed={x:e.clientX,y:e.clientY};};
      const up=(e:PointerEvent)=>{if(Math.hypot(e.clientX-pressed.x,e.clientY-pressed.y)>7)return;const r=renderer.domElement.getBoundingClientRect();pointer.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);raycaster.setFromCamera(pointer,camera);const object=raycaster.intersectObjects(selectable,false)[0]?.object;const id=object?.userData.station;if(id){activeRef.current=id;setActive(id);api.current?.focus(id);}};
      renderer.domElement.addEventListener("pointerdown",down);renderer.domElement.addEventListener("pointerup",up);
      let destination: InstanceType<typeof THREE.Vector3> | null=null;
      const focus=(id:Station)=>{const group=stationGroups.get(id);if(!group){destination=new THREE.Vector3(6,5.4,7.5);return;}const views:Record<string,[number,number,number]>={experience:[-7,5.4,7.2],projects:[3.7,5.4,8.5],stack:[7.4,5.3,6.4],contact:[.4,5.7,9.6]};destination=new THREE.Vector3(...views[id]);};
      const zoom=(scale:number)=>{const offset=camera.position.clone().sub(controls.target);offset.multiplyScalar(scale);offset.clampLength(8,17);camera.position.copy(controls.target).add(offset);destination=null;controls.update();};
      api.current={focus,zoom,reset:()=>{destination=new THREE.Vector3(6,5.4,7.5);}};
      const keydown=(e:KeyboardEvent)=>{if(!["ArrowLeft","ArrowRight","+","-","Escape"].includes(e.key))return;e.preventDefault();destination=null;if(e.key==="ArrowLeft"||e.key==="ArrowRight"){camera.position.sub(controls.target).applyAxisAngle(new THREE.Vector3(0,1,0),e.key==="ArrowLeft"?.17:-.17).add(controls.target);controls.update();}else if(e.key==="+")zoom(.9);else if(e.key==="-")zoom(1.1);else reset();};
      renderer.domElement.addEventListener("keydown",keydown);
      const interaction=()=>{destination=null;playingRef.current=false;setPlaying(false);};controls.addEventListener("start",interaction);
      const resize=()=>{const r=host.getBoundingClientRect();renderer.setSize(r.width,r.height,false);camera.aspect=r.width/Math.max(r.height,1);camera.fov=r.width<450?46:38;camera.updateProjectionMatrix();};
      const resizeObserver=new ResizeObserver(resize);resizeObserver.observe(host);resize();
      let visible=true,raf=0,last=0,elapsed=0;
      const animate=(now:number)=>{raf=requestAnimationFrame(animate);if(!visible||document.hidden)return;const dt=Math.min((now-last)/1000,.05);if(now-last<32)return;last=now;elapsed+=dt;
        if(destination){if(reduced.matches){camera.position.copy(destination);destination=null;}else{camera.position.lerp(destination,.075);if(camera.position.distanceTo(destination)<.02)destination=null;}}
        controls.autoRotate=playingRef.current&&!reduced.matches&&!destination;controls.autoRotateSpeed=.4;controls.update(dt);
        if(!reduced.matches){world.position.y=Math.sin(elapsed*.7)*.045;halo.rotation.z=elapsed*.18;haloTwo.rotation.x=elapsed*.22;coreOrb.rotation.y=elapsed*.3;dataGem.rotation.y=-elapsed*.5;drone.position.set(Math.cos(elapsed*.32)*3.8,1.5+Math.sin(elapsed*.7)*.2,Math.sin(elapsed*.32)*3.8);drone.rotation.y=-elapsed*.32;lowerRing.rotation.z=Math.sin(elapsed*.5)*.03;}
        else{world.position.y=0;drone.position.set(3.6,1.5,-1);}
        stationGroups.forEach((g,id)=>{const chosen=id===activeRef.current;g.scale.lerp(new THREE.Vector3(chosen?1.12:1,chosen?1.12:1,chosen?1.12:1),.1);});
        world.updateMatrixWorld(true);const r=host.getBoundingClientRect();stations.forEach(st=>{const button=labels.current[st.id];if(!button)return;const position=new THREE.Vector3(...st.position as [number,number,number]);world.localToWorld(position);position.project(camera);button.style.left=`${(position.x*.5+.5)*r.width}px`;button.style.top=`${(-position.y*.5+.5)*r.height}px`;button.style.visibility=position.z>1||Math.abs(position.x)>1.1||Math.abs(position.y)>1.1?"hidden":"visible";});
        renderer.render(scene,camera);
      };
      const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;},{threshold:0});observer.observe(host);raf=requestAnimationFrame(animate);setReady(true);
      const contextLost=(e:Event)=>{e.preventDefault();setFallback(true);setReady(false);cancelAnimationFrame(raf);};renderer.domElement.addEventListener("webglcontextlost",contextLost);
      cleanup=()=>{cancelAnimationFrame(raf);observer.disconnect();resizeObserver.disconnect();controls.removeEventListener("start",interaction);controls.dispose();renderer.domElement.removeEventListener("pointerdown",down);renderer.domElement.removeEventListener("pointerup",up);renderer.domElement.removeEventListener("keydown",keydown);renderer.domElement.removeEventListener("webglcontextlost",contextLost);allGeometries.forEach(g=>g.dispose());scene.traverse(o=>{if(o instanceof THREE.Mesh){const mats=Array.isArray(o.material)?o.material:[o.material];mats.forEach(m=>m.dispose());}});particleMaterial.dispose();env.dispose();renderer.dispose();renderer.domElement.remove();api.current=null;};
      if(disposed)cleanup();
    })().catch(()=>{if(!disposed)setFallback(true);});
    return()=>{disposed=true;cleanup();};
  },[]);
  const info=stations.find(s=>s.id===active)||overview;
  return <div ref={worldRoot} role={expanded?"dialog":"region"} aria-modal={expanded||undefined} aria-label="Orbit Foundry interactive workspace" className={`foundry-world${expanded?" is-expanded":""}${fallback?" is-fallback":""}`}>
    <div className="world-topline"><span><span className="live-dot"/> ORBIT FOUNDRY <span className="world-version">/ 01</span></span><span className="world-controls"><button onClick={()=>{setPlaying(!playing);playingRef.current=!playing;}} aria-label={playing?"Pause scene rotation":"Play scene rotation"} aria-pressed={playing} disabled={reduce||fallback}>{playing&&!reduce?<Pause size={14}/>:<Play size={14}/>}</button><button onClick={reset} aria-label="Reset 3D view" disabled={fallback}><RotateCcw size={14}/></button><button onClick={()=>setExpanded(!expanded)} aria-label={expanded?"Close expanded scene":"Expand 3D scene"} aria-pressed={expanded}><Maximize2 size={14}/></button></span></div>
    <div className="world-stage" data-ready={ready} data-fallback={fallback}>
      <div className="world-stars"/><div className="world-floor"/>
      <div ref={mount} className="world-renderer"/>
      {!ready&&!fallback&&<div className="world-loading"><Compass size={26}/><span>Preparing your orbit…</span></div>}
      {fallback&&<div className="world-fallback"><div className="fallback-island"><div className="fallback-monitor"><Code2 size={45}/></div><div className="fallback-core"/></div><p>Explore the workspace using the stations below.</p></div>}
      {ready&&!fallback&&<div className="world-hotspots">{stations.map(st=><button key={st.id} ref={el=>{labels.current[st.id]=el;}} className={`world-hotspot${active===st.id?" selected":""}`} aria-label={`Focus ${st.name} station`} onClick={()=>select(st.id)}><span className="hotspot-dot"/><span>{st.name}</span></button>)}</div>}
      <div className="world-drag-hint"><Compass size={12}/><span>{fallback?"YOUR PORTFOLIO, YOUR WAY":"DRAG TO ORBIT · SELECT A STATION"}</span></div>
      <div className="world-zoom"><button aria-label="Zoom in 3D scene" onClick={()=>api.current?.zoom(.87)} disabled={fallback}><Plus size={15}/></button><button aria-label="Zoom out 3D scene" onClick={()=>api.current?.zoom(1.13)} disabled={fallback}><Minus size={15}/></button></div>
    </div>
    <div className="world-stations" aria-label="Workspace stations">{stations.map(st=>{const Icon=st.icon;return <button key={st.id} className={active===st.id?"active":""} onClick={()=>select(st.id)} aria-pressed={active===st.id}><Icon size={15}/><span>{st.name}</span><small>{st.code}</small></button>})}</div>
    <div className="world-info" aria-live="polite"><div className="world-info-copy"><p>{active==="overview"?"A WORLD OF POSSIBILITIES":`STATION ${stations.find(s=>s.id===active)?.code} / ${stations.find(s=>s.id===active)?.name.toUpperCase()}`}</p><h3>{info.title}</h3><span>{info.text}</span><a href={`#${info.id}`} onClick={()=>setExpanded(false)}>{info.action}<ArrowUpRight size={14}/></a></div><div className="world-cycle"><button aria-label="Previous station" onClick={()=>cycle(-1)}><ChevronLeft size={16}/></button><button aria-label="Next station" onClick={()=>cycle(1)}><ChevronRight size={16}/></button></div></div>
  </div>;
}
