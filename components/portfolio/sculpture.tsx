"use client";

import { useEffect, useRef } from "react";

const vertex = `attribute vec2 position; void main(){gl_Position=vec4(position,0.,1.);}`;
const fragment = `
precision highp float;
uniform vec2 resolution;
uniform vec2 pointer;
uniform float time;
mat2 rot(float a){float c=cos(a),s=sin(a);return mat2(c,-s,s,c);}
vec2 scene(vec3 p){
  p.xz=rot(time*.075+pointer.x*.42)*p.xz;
  p.yz=rot(-.3+pointer.y*.28)*p.yz;
  vec3 q=p;q.xy=rot(.66)*q.xy;q.yz=rot(.65)*q.yz;
  float a=length(vec2(length(q.xz)-.87,q.y))-.255;
  q=p;q.xy=rot(-.68)*q.xy;q.yz=rot(-.5)*q.yz;
  float b=length(vec2(length(q.xz)-.78,q.y))-.13;
  float c=length(p)-.33;
  if(c<a&&c<b)return vec2(c,2.);
  return a<b?vec2(a,0.):vec2(b,1.);
}
vec3 normal(vec3 p){vec2 e=vec2(.001,0.);return normalize(vec3(scene(p+e.xyy).x-scene(p-e.xyy).x,scene(p+e.yxy).x-scene(p-e.yxy).x,scene(p+e.yyx).x-scene(p-e.yyx).x));}
vec3 environment(vec3 r){
  vec3 color=vec3(.09,.12,.11);
  float strip=pow(max(0.,sin(r.y*3.5+r.x*.8)),18.);
  color+=vec3(.92,1.,.95)*strip*1.2;
  color+=vec3(.5,.78,.25)*pow(max(0.,r.x*.7+r.y*.2+.25),3.);
  color+=vec3(.65,.72,.8)*pow(max(0.,-r.x*.6+r.z*.3),7.);
  return color;
}
void main(){
  vec2 uv=(gl_FragCoord.xy*2.-resolution)/min(resolution.x,resolution.y);
  vec3 ro=vec3(0.,.15,3.8);vec3 rd=normalize(vec3(uv,-3.0));
  float t=0.;vec2 hit=vec2(0.);bool found=false;
  for(int i=0;i<72;i++){hit=scene(ro+rd*t);if(hit.x<.0015){found=true;break;}t+=hit.x*.85;if(t>6.)break;}
  if(!found){gl_FragColor=vec4(0.);return;}
  vec3 p=ro+rd*t;vec3 n=normal(p);vec3 ref=reflect(rd,n);
  float light=max(dot(n,normalize(vec3(-.6,1.,2.))),0.);
  float fres=pow(1.-max(dot(n,-rd),0.),3.);
  float ao=clamp(scene(p+n*.13).x/.13,.3,1.);
  vec3 base=hit.y>.5?vec3(.47,.79,.13):vec3(.47,.53,.5);
  if(hit.y>1.5)base=vec3(.57,.96,.19);
  vec3 color=base*(.15+light*.25)+environment(ref)*(.7+fres*.5);
  if(hit.y>.5)color=mix(color,color*base*1.6,.72);
  color*=ao;float spec=pow(max(dot(ref,normalize(vec3(-.5,1.,2.))),0.),55.);
  color+=spec*.9; color=pow(color,vec3(.85));
  gl_FragColor=vec4(color,1.);
}`;

export default function Sculpture() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", { alpha: true, antialias: false, powerPreference: "low-power", premultipliedAlpha: false });
    if (!gl) return;
    const shaders: WebGLShader[] = [];
    const compile = (type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source); gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) { gl.deleteShader(shader); return null; }
      shaders.push(shader); return shader;
    };
    const vs = compile(gl.VERTEX_SHADER, vertex), fs = compile(gl.FRAGMENT_SHADER, fragment);
    const program = gl.createProgram();
    if (!vs || !fs || !program) { shaders.forEach(s => gl.deleteShader(s)); return; }
    gl.attachShader(program, vs); gl.attachShader(program, fs); gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) { gl.deleteProgram(program); shaders.forEach(s => gl.deleteShader(s)); return; }
    gl.useProgram(program);
    const buffer = gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
    const attr=gl.getAttribLocation(program,"position");gl.enableVertexAttribArray(attr);gl.vertexAttribPointer(attr,2,gl.FLOAT,false,0,0);
    const res=gl.getUniformLocation(program,"resolution"),clock=gl.getUniformLocation(program,"time"),mouse=gl.getUniformLocation(program,"pointer");
    const reduced=window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame=0,visible=true,last=0,elapsed=0,paused=document.hidden;
    let targetX=0,targetY=0,x=0,y=0;
    const draw=(now:number)=>{
      frame=0;
      if(!visible||paused)return;
      if(now-last>32 || reduced.matches){
        const rect=canvas.getBoundingClientRect();
        const scale=Math.min(window.devicePixelRatio||1,1.5,800/Math.max(rect.width,1),800/Math.max(rect.height,1));
        const w=Math.max(1,Math.round(rect.width*scale)),h=Math.max(1,Math.round(rect.height*scale));
        if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;gl.viewport(0,0,w,h);}
        elapsed+=Math.min((now-last)/1000,.04);last=now;x+=(targetX-x)*.1;y+=(targetY-y)*.1;
        gl.uniform2f(res,w,h);gl.uniform1f(clock,reduced.matches?0:elapsed);gl.uniform2f(mouse,reduced.matches?0:x,reduced.matches?0:y);gl.drawArrays(gl.TRIANGLES,0,6);
        canvas.dataset.ready="true";
      }
      if(!reduced.matches)frame=requestAnimationFrame(draw);
    };
    const start=()=>{if(!frame&&visible&&!paused)frame=requestAnimationFrame(draw);};
    const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)start();else if(frame){cancelAnimationFrame(frame);frame=0;}},{threshold:0});observer.observe(canvas);
    const move=(e:PointerEvent)=>{if(reduced.matches)return;const r=canvas.getBoundingClientRect();const strength=e.pointerType==="mouse"?1:.65;targetX=(Math.max(0,Math.min(1,(e.clientX-r.left)/r.width))-.5)*strength;targetY=(Math.max(0,Math.min(1,(e.clientY-r.top)/r.height))-.5)*strength;};
    const reset=()=>{targetX=0;targetY=0;};const release=(e:PointerEvent)=>{if(e.pointerType!=="mouse")reset();};const visibility=()=>{paused=document.hidden;if(paused&&frame){cancelAnimationFrame(frame);frame=0;}else start();};
    const resize=()=>start();const preference=()=>{if(frame)cancelAnimationFrame(frame);frame=0;start();};
    canvas.addEventListener("pointerdown",move,{passive:true});canvas.addEventListener("pointermove",move,{passive:true});canvas.addEventListener("pointerup",release);canvas.addEventListener("pointercancel",reset);canvas.addEventListener("pointerleave",reset);document.addEventListener("visibilitychange",visibility);window.addEventListener("resize",resize);reduced.addEventListener("change",preference);start();
    return ()=>{cancelAnimationFrame(frame);observer.disconnect();canvas.removeEventListener("pointerdown",move);canvas.removeEventListener("pointermove",move);canvas.removeEventListener("pointerup",release);canvas.removeEventListener("pointercancel",reset);canvas.removeEventListener("pointerleave",reset);document.removeEventListener("visibilitychange",visibility);window.removeEventListener("resize",resize);reduced.removeEventListener("change",preference);gl.deleteBuffer(buffer);gl.deleteProgram(program);shaders.forEach(s=>gl.deleteShader(s));};
  }, []);
  return <canvas ref={ref} className="sculpture-canvas" aria-hidden="true"/>;
}
