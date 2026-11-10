"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Compass, Minus, Pause, Play, Plus, RotateCcw } from "lucide-react";
import type * as Three from "three";

export type SceneKind = "experience" | "projects" | "about" | "toolkit" | "contact";
export type SceneOption = { label: string; description?: string };
type Props = {
  kind: SceneKind;
  title: string;
  subtitle: string;
  options: SceneOption[];
  selected: number;
  onSelect: (index: number) => void;
};
const colors: Record<SceneKind, string> = {
  experience: "#c5f58b", projects: "#e7bd83", about: "#b9b1ff", toolkit: "#80d8dc", contact: "#f2b2a5",
};

/** Shared renderer lifecycle; each section builds its own geometry and visual language. */
export default function SectionScene({ kind, title, subtitle, options, selected, onSelect }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const active = useRef(selected);
  const select = useRef(onSelect);
  const playing = useRef(true);
  const api = useRef<{ reset: () => void; zoom: (factor: number) => void } | null>(null);
  const [paused, setPaused] = useState(false);
  const [status, setStatus] = useState<"loading" | "ready" | "fallback">("loading");
  const [reduced, setReduced] = useState(true);
  const count = options.length;
  useEffect(() => { active.current = selected; }, [selected]);
  useEffect(() => { select.current = onSelect; }, [onSelect]);
  useEffect(() => {
    const query = matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(query.matches);
    sync(); query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const container = host.current;
    if (!container) return;
    let disposed = false, started = false, visible = false;
    let cleanup = () => {};
    const initialize = async () => {
      try {
        const T = await import("three");
        const { OrbitControls } = await import("three/addons/controls/OrbitControls.js");
        if (disposed) return;
        const renderer = new T.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "low-power" });
        renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.3));
        renderer.setClearColor(0, 0);
        renderer.toneMapping = T.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.25;
        const canvas = renderer.domElement;
        canvas.tabIndex = 0;
        canvas.setAttribute("role", "img");
        canvas.setAttribute("aria-label", `${title}. Drag to orbit, use left and right arrows to rotate, or choose an item below.`);
        container.appendChild(canvas);
        const scene = new T.Scene();
        const camera = new T.PerspectiveCamera(36, 1, .1, 60);
        const home = kind === "about" ? new T.Vector3(0, 3, 9) : kind === "projects" ? new T.Vector3(0, 3.6, 10.5) : new T.Vector3(6, 4.5, 7);
        camera.position.copy(home);
        const controls = new OrbitControls(camera, canvas);
        controls.target.set(0, .35, 0);
        controls.enablePan = false;
        controls.enableZoom = false;
        controls.enableDamping = true;
        controls.minPolarAngle = .4; controls.maxPolarAngle = Math.PI / 2;
        controls.autoRotateSpeed = .3;
        controls.update();
        const group = new T.Group(); scene.add(group);
        scene.add(new T.HemisphereLight(0xf0f8ff, 0x202820, 3));
        const key = new T.DirectionalLight(0xffffff, 4); key.position.set(3, 6, 5); scene.add(key);
        const rim = new T.DirectionalLight(colors[kind], 3); rim.position.set(-4, 2, -3); scene.add(rim);
        const materials: Three.Material[] = [];
        const material = (color: string, metallic = false) => {
          const m = new T.MeshStandardMaterial({ color, metalness: metallic ? .65 : .3, roughness: metallic ? .28 : .5 });
          materials.push(m); return m;
        };
        const dark = material("#17211d", true), silver = material("#8c9c99", true), accent = material(colors[kind]);
        const glow = new T.MeshStandardMaterial({ color: colors[kind], emissive: colors[kind], emissiveIntensity: .5, roughness: .35 });
        materials.push(glow);
        const geometries = new Set<Three.BufferGeometry>();
        const make = (geo: Three.BufferGeometry, mat: Three.Material, parent: Three.Object3D = group) => {
          geometries.add(geo); const obj = new T.Mesh(geo, mat); obj.userData.baseMaterial = mat; parent.add(obj); return obj;
        };
        const box = (w: number, h: number, d: number, x: number, y: number, z: number, mat: Three.Material = dark, parent: Three.Object3D = group) => {
          const m = make(new T.BoxGeometry(w, h, d), mat, parent); m.position.set(x, y, z); return m;
        };
        const ring = (radius: number, tube: number, parent: Three.Object3D = group, mat: Three.Material = glow) => make(new T.TorusGeometry(radius, tube, 8, 64), mat, parent);
        const cylinder = (radius: number, height: number, parent: Three.Object3D = group, mat: Three.Material = dark) => make(new T.CylinderGeometry(radius, radius, height, 32), mat, parent);
        const nodes: Three.Group[] = [];
        const pickable: Three.Object3D[] = [];
        const decorations: { object: Three.Object3D; axis: "x" | "y" | "z"; speed: number }[] = [];
        const node = (index: number, x: number, y: number, z: number) => {
          const n = new T.Group(); n.position.set(x, y, z); n.userData.index = index; group.add(n); nodes.push(n);
          const hitMat = new T.MeshBasicMaterial({ visible: false }); materials.push(hitMat);
          const hit = make(new T.SphereGeometry(.65, 8, 8), hitMat, n); hit.position.y = .5; hit.userData.index = index; pickable.push(hit);
          return n;
        };

        if (kind === "experience") {
          // A working production line, with five distinct engineering stations.
          box(6.5, .18, 2.4, 0, -.15, 0);
          for (const z of [-.8, .8]) box(6.3, .035, .035, 0, -.04, z, glow);
          for (let i = 0; i < 14; i++) { const roller = cylinder(.08, 1.45, group, silver); roller.rotation.x = Math.PI / 2; roller.position.set(-3 + i * .46, .05, 0); }
          for (let i = 0; i < count; i++) {
            const n = node(i, (i - 2) * 1.25, .1, 0);
            if (i === 0) {
              box(.55, 1.15, .12, 0, .7, 0, silver, n); box(.44, .88, .03, 0, .73, .08, accent, n);
              box(.18, .035, .04, 0, .23, .1, dark, n);
            } else if (i === 1) {
              box(.95, .65, .12, 0, .8, 0, silver, n); box(.83, .52, .03, 0, .81, .08, accent, n);
              box(.1, .35, .1, 0, .3, 0, silver, n); box(.65, .04, .4, 0, .12, .12, silver, n);
            } else if (i === 2) {
              for (let j = 0; j < 3; j++) { box(.9, .06, .65, 0, .25 + j * .35, 0, silver, n); for (const x of [-.25, .25]) box(.3, .24, .4, x, .41 + j * .35, 0, accent, n); }
              for (const x of [-.5, .5]) box(.05, 1.15, .05, x, .6, .3, silver, n);
            } else if (i === 3) {
              cylinder(.35, .2, n, silver).position.y = .2;
              box(.045, .9, .045, 0, .65, 0, accent, n);
              for (const x of [-1, 1]) { const leaf = make(new T.SphereGeometry(.23, 12, 8), accent, n); leaf.scale.set(1, .3, .6); leaf.rotation.z = x * .5; leaf.position.set(x * .18, .75, 0); }
            } else {
              for (let j = 0; j < 3; j++) { cylinder(.4, .25, n, silver).position.y = .3 + j * .3; const r = ring(.4, .014, n); r.rotation.x = Math.PI / 2; r.position.y = .43 + j * .3; }
            }
          }
          for (let i = 0; i < 4; i++) { const packet = box(.15, .15, .15, -2.8 + i * 1.7, .16, .8, glow); decorations.push({ object: packet, axis: "y", speed: .8 }); }
        } else if (kind === "projects") {
          // A gallery of devices on individual plinths, rather than an island.
          for (let i = 0; i < count; i++) {
            const n = node(i, (i - 1.5) * 1.6, 0, i % 2 ? -.3 : .3);
            cylinder(.68, .18, n, silver);
            const trim = ring(.66, .02, n); trim.rotation.x = Math.PI / 2; trim.position.y = .1;
            if (i === 2) {
              box(.62, 1.4, .15, 0, .9, 0, silver, n); box(.49, 1.15, .03, 0, .92, .1, accent, n);
              for (let j = 0; j < 3; j++) box(.3, .1, .02, 0, 1.2 - j * .27, .13, dark, n);
            } else if (i === 3) {
              const pad = box(1.1, .32, .58, 0, .65, 0, accent, n); pad.rotation.x = -.2;
              box(.3, .04, .1, -.27, .84, .04, dark, n); box(.1, .04, .3, -.27, .84, .04, dark, n);
              for (let j = 0; j < 2; j++) { const b = cylinder(.07, .06, n, silver); b.position.set(.25 + j * .15, .85, .05 - j * .13); }
            } else {
              box(1.15, .8, .1, 0, 1, 0, silver, n); box(1.01, .65, .03, 0, 1, .07, accent, n);
              box(.12, .4, .1, 0, .42, 0, silver, n); box(.65, .05, .4, 0, .2, .1, silver, n);
              for (let j = 0; j < 3; j++) box(.5 - j * .1, .04, .02, -.1, 1.18 - j * .15, .1, dark, n);
            }
          }
          const track = ring(3.2, .018, group, silver); track.rotation.x = Math.PI / 2; track.scale.y = .45; track.position.y = -.2;
        } else if (kind === "about") {
          // An armillary sphere: three chapters orbit a shared foundation.
          const core = make(new T.IcosahedronGeometry(.63, 1), accent); core.position.y = .45;
          decorations.push({ object: core, axis: "y", speed: .15 });
          for (let i = 0; i < count; i++) {
            const orbit = ring(1.35 + i * .4, .025, group, i === 1 ? silver : glow);
            orbit.position.y = .4; orbit.rotation.set(.5 + i * .45, i * .7, i * .5);
            decorations.push({ object: orbit, axis: "z", speed: .08 * (i % 2 ? -1 : 1) });
            const a = i * Math.PI * 2 / count;
            const n = node(i, Math.cos(a) * 2, .5 + Math.sin(a) * .45, Math.sin(a) * .8);
            const gem = make(i === 0 ? new T.BoxGeometry(.55, .55, .55) : i === 1 ? new T.OctahedronGeometry(.43) : new T.TorusKnotGeometry(.28, .08, 48, 8), i === 1 ? silver : accent, n);
            gem.rotation.z = .3; decorations.push({ object: gem, axis: "y", speed: .2 });
          }
        } else if (kind === "toolkit") {
          // A modular circuit board with six individually selectable processors.
          box(4.3, .14, 3, 0, -.15, 0);
          for (let i = 0; i < count; i++) {
            const x = (i % 3 - 1) * 1.3, z = (Math.floor(i / 3) - .5) * 1.35;
            const n = node(i, x, .05, z);
            box(.85, .2 + i * .07, .8, 0, .17, 0, silver, n);
            box(.66, .035, .62, 0, .3 + i * .035, 0, accent, n);
            for (let j = 0; j < 4; j++) for (const side of [-1, 1]) box(.13, .045, .07, side * .48, .08, -.3 + j * .2, glow, n);
            const chip = box(.24, .03, .24, 0, .35 + i * .035, 0, dark, n); chip.rotation.y = .3;
            box(.03, .01, 1.3, x, -.065, z / 2, glow);
          }
          for (const x of [-1.95, 1.95]) for (const z of [-1.3, 1.3]) cylinder(.07, .2, group, silver).position.set(x, -.1, z);
        } else {
          // A communication array: three dishes with illuminated signal arcs.
          for (let i = 0; i < count; i++) {
            const n = node(i, (i - 1) * 1.9, 0, i === 1 ? -.35 : .2);
            const base = cylinder(.52, .2, n, silver); base.position.y = -.1;
            box(.12, .85, .12, 0, .4, 0, silver, n);
            const dish = make(new T.SphereGeometry(.57, 24, 12, 0, Math.PI * 2, 0, Math.PI * .5), accent, n);
            dish.rotation.x = .65; dish.position.y = .85;
            const transmitter = box(.045, .7, .045, 0, 1.1, .2, silver, n); transmitter.rotation.x = .4;
            for (let j = 0; j < 2; j++) { const signal = ring(.45 + j * .25, .014, n); signal.position.set(0, 1.65 + j * .2, .2); signal.rotation.x = 1.1; decorations.push({ object: signal, axis: "z", speed: .2 }); }
          }
          const orbit = ring(3, .018, group, silver); orbit.rotation.x = Math.PI / 2; orbit.position.y = -.25;
        }
        const raycaster = new T.Raycaster(), pointer = new T.Vector2();
        let down = { x: 0, y: 0 }, pointerId: number | null = null;
        const pointerDown = (e: PointerEvent) => { down = { x: e.clientX, y: e.clientY }; pointerId = e.pointerId; };
        const pointerUp = (e: PointerEvent) => {
          if (e.pointerId !== pointerId || Math.hypot(e.clientX - down.x, e.clientY - down.y) > 8) return;
          pointerId = null;
          const rect = canvas.getBoundingClientRect();
          pointer.set((e.clientX - rect.left) / rect.width * 2 - 1, -(e.clientY - rect.top) / rect.height * 2 + 1);
          raycaster.setFromCamera(pointer, camera);
          const hit = raycaster.intersectObjects(pickable)[0];
          if (hit) select.current(hit.object.userData.index);
        };
        const zoom = (factor: number) => {
          const offset = camera.position.clone().sub(controls.target).multiplyScalar(factor).clampLength(5.5, 16);
          camera.position.copy(controls.target).add(offset); controls.update();
        };
        api.current = { reset: () => { camera.position.copy(home); controls.target.set(0, .35, 0); controls.update(); }, zoom };
        const keys = (e: KeyboardEvent) => {
          if (["ArrowLeft", "ArrowRight", "+", "-", "Home"].includes(e.key)) {
            e.preventDefault();
            if (e.key === "+" || e.key === "-") zoom(e.key === "+" ? .88 : 1.12);
            else if (e.key === "Home") api.current?.reset();
            else { camera.position.sub(controls.target).applyAxisAngle(new T.Vector3(0, 1, 0), e.key === "ArrowLeft" ? .15 : -.15).add(controls.target); controls.update(); }
          }
        };
        const stopRotation = () => { playing.current = false; setPaused(true); };
        controls.addEventListener("start", stopRotation);
        canvas.addEventListener("pointerdown", pointerDown); canvas.addEventListener("pointerup", pointerUp); canvas.addEventListener("keydown", keys);
        const resize = () => {
          const r = container.getBoundingClientRect();
          renderer.setSize(r.width, r.height, false); camera.aspect = r.width / Math.max(r.height, 1);
          camera.fov = 36; camera.zoom = 1; camera.updateProjectionMatrix();
          group.updateMatrixWorld(true); camera.updateMatrixWorld(true);
          let extentX = 0, extentY = 0;
          const point = new T.Vector3();
          // Fit the rendered silhouette, not an oversized box around rotated rings.
          group.traverse(object => {
            if (!(object instanceof T.Mesh) || object.material.visible === false) return;
            const vertices = object.geometry.getAttribute("position");
            for (let i = 0; i < vertices.count; i++) {
              point.fromBufferAttribute(vertices, i).applyMatrix4(object.matrixWorld).project(camera);
              extentX = Math.max(extentX, Math.abs(point.x)); extentY = Math.max(extentY, Math.abs(point.y));
            }
          });
          camera.zoom = Math.min(.85 / Math.max(extentX, .01), .78 / Math.max(extentY, .01));
          camera.updateProjectionMatrix();
          // Draw immediately: resizing a WebGL canvas clears it, even when its animation is paused.
          renderer.render(scene, camera);
        };
        const resizing = new ResizeObserver(resize); resizing.observe(container); resize();
        const query = matchMedia("(prefers-reduced-motion: reduce)");
        let frame = 0, last = 0;
        const animate = (now: number) => {
          frame = requestAnimationFrame(animate);
          if (!visible || document.hidden || now - last < 40) return;
          const dt = Math.min((now - last) / 1000, .05); last = now;
          controls.autoRotate = playing.current && !query.matches; controls.update(dt);
          nodes.forEach((n, index) => {
            const scale = index === active.current ? 1.13 : 1;
            if (query.matches) n.scale.setScalar(scale); else n.scale.lerp(new T.Vector3(scale, scale, scale), .15);
            n.traverse(o => { if (o instanceof T.Mesh && o.userData.baseMaterial === accent) o.material = index === active.current ? glow : accent; });
          });
          if (!query.matches && playing.current) decorations.forEach(({ object, axis, speed }) => { object.rotation[axis] += dt * speed; });
          renderer.render(scene, camera);
        };
        const lost = (e: Event) => { e.preventDefault(); setStatus("fallback"); cancelAnimationFrame(frame); };
        canvas.addEventListener("webglcontextlost", lost);
        frame = requestAnimationFrame(animate); setStatus("ready");
        cleanup = () => {
          cancelAnimationFrame(frame); resizing.disconnect(); controls.removeEventListener("start", stopRotation); controls.dispose();
          canvas.removeEventListener("pointerdown", pointerDown); canvas.removeEventListener("pointerup", pointerUp); canvas.removeEventListener("keydown", keys); canvas.removeEventListener("webglcontextlost", lost);
          geometries.forEach(g => g.dispose()); materials.forEach(m => m.dispose()); renderer.dispose(); canvas.remove(); api.current = null;
        };
        if (disposed) cleanup();
      } catch { if (!disposed) setStatus("fallback"); }
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !started) { started = true; void initialize(); }
    }, { rootMargin: "180px" });
    observer.observe(container);
    return () => { disposed = true; observer.disconnect(); cleanup(); };
  }, [kind, title, count]);

  return <div className={`section-scene scene-${kind}`} style={{ "--scene-accent": colors[kind] } as CSSProperties} role="region" data-state={status} aria-label={`${title} interactive scene`}>
    <div className="scene-toolbar"><div><span className="scene-kicker">{subtitle}</span><h3>{title}</h3></div><div className="scene-tools">
      <button type="button" title={reduced ? "Rotation follows your reduced-motion preference" : paused ? "Play rotation" : "Pause rotation"} aria-label={`${paused ? "Play" : "Pause"} ${title} rotation`} disabled={reduced || status !== "ready"} onClick={() => { playing.current = paused; setPaused(!paused); }}>{paused || reduced ? <Play size={14}/> : <Pause size={14}/>}</button>
      <button type="button" title="Reset camera" aria-label={`Reset ${title} view`} disabled={status !== "ready"} onClick={() => api.current?.reset()}><RotateCcw size={14}/></button>
    </div></div>
    <div className="section-scene-stage"><div ref={host} className="section-scene-renderer"/>
      {status !== "ready" && <div className="section-scene-fallback" aria-hidden="true"><div className="fallback-sculpture"><i/><i/><i/><span/></div><p>{status === "loading" ? "Preparing your scene…" : "Explore using the controls below"}</p></div>}
      <span className="scene-interaction-hint"><Compass size={12}/>{status === "fallback" ? "Choose a chapter below" : "Drag to rotate · Select a model"}</span>
      <div className="scene-zoom"><button type="button" title="Zoom in" aria-label={`Zoom in ${title}`} disabled={status !== "ready"} onClick={() => api.current?.zoom(.88)}><Plus size={14}/></button><button type="button" title="Zoom out" aria-label={`Zoom out ${title}`} disabled={status !== "ready"} onClick={() => api.current?.zoom(1.12)}><Minus size={14}/></button></div>
    </div>
    <div className="scene-options" role="group" aria-label={`${title} chapters`}>{options.map((option, index) => <button type="button" key={option.label} aria-pressed={selected === index} onClick={() => onSelect(index)}><span>{String(index + 1).padStart(2, "0")}</span><strong>{option.label}</strong></button>)}</div>
    {options[selected]?.description && <p className="scene-description" aria-live="polite">{options[selected].description}</p>}
  </div>;
}
