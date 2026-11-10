"use client";

import { useEffect, useRef, useState, type PointerEvent } from "react";
import FoundryWorld from "@/components/portfolio/foundry-world";
import SpatialObject from "@/components/portfolio/spatial-object";
import { useSpatialMotion } from "@/components/portfolio/spatial-motion";
import { ArrowUpRight, ArrowDown, Code2, Menu, X, MapPin, Route, ScanFace, Gamepad2, NotebookPen, Smartphone, Film, FileText, Layers, Warehouse, Sprout, Database, Search, ArrowUp } from "lucide-react";

function Github({size = 20}: {size?: number}) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M9 19c-4.3 1.3-4.3-2.2-6-2.7M15 22v-3.4c0-1 .1-1.5-.5-2 3.1-.4 6.5-1.5 6.5-7A5.4 5.4 0 0 0 19.5 6c.2-.8.2-2.1-.2-3.2 0 0-1.2-.4-3.8 1.4a13 13 0 0 0-7 0C5.9 2.4 4.7 2.8 4.7 2.8c-.4 1.1-.4 2.4-.2 3.2A5.4 5.4 0 0 0 3 9.6c0 5.5 3.4 6.6 6.5 7-.6.5-.6 1.2-.5 2V22"/></svg>; }
function Linkedin({size = 20}: {size?: number}) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7 10v7m0-10v.1M11 17v-7m0 3a3 3 0 0 1 6 0v4"/></svg>; }

const github = "https://github.com/JohnLuis07";
const linkedin = "https://ph.linkedin.com/in/john-luis-magtoto-872a74192";
const resume = "https://www.canva.com/design/DAHUhJiJHX8/hMYW1SOQ9iVpcg0Ue8SptQ/edit";

const experience = [
  { title: "Core mobile engineering", icon: Smartphone, tags: ["Android", "Java", "XML"], description: "Led full-stack Android development, implementing complex business logic in Java and designing responsive, high-performance interfaces in XML." },
  { title: "Full-stack web delivery", icon: Layers, tags: ["C# MVC", "HTML", "jQuery", "JavaScript"], description: "Moved between mobile and web teams during critical project phases. Delivered front-end views with HTML, jQuery, and JavaScript, alongside scalable server-side features in C# MVC." },
  { title: "Enterprise warehouse systems", icon: Warehouse, tags: ["WMS", "RBAC", "Oracle", "PostgreSQL"], description: "Architected and maintained mobile modules for receiving and inbound tracking, directed put-away, pallet and case handling, and outbound dispatch. Implemented role-based access for operators, supervisors, and administrators, backed by Oracle and PostgreSQL data operations." },
  { title: "Agriculture technology", icon: Sprout, tags: ["Crop lifecycle", "Mapping", "Analytics"], description: "Developed mobile features for agricultural platforms, giving farmers digital tools for crop lifecycle tracking, farm location mapping, activity logs, and expense and revenue analytics." },
  { title: "Data & cross-functional delivery", icon: Database, tags: ["Oracle", "PostgreSQL", "pgAdmin"], description: "Managed database schemas and integrations to support reliable workflows. Bridged mobile and web development teams to meet urgent delivery milestones." },
];

const toolkit = [
  { title: "Enterprise Android", note: "Professional experience", items: ["Java", "XML", "Android"] },
  { title: "Full-stack web", note: "Professional experience", items: ["C# MVC", "HTML", "jQuery", "JavaScript"] },
  { title: "Data & operations", note: "Professional experience", items: ["Oracle", "PostgreSQL", "pgAdmin", "RBAC"] },
  { title: "Academic foundation", note: "University of the Philippines", items: ["Python", "C", "C++", "Assembly", "React", "Node.js", "Express.js", "MongoDB"] },
  { title: "Selected projects", note: "Featured GitHub work", items: ["TypeScript", "JavaScript", "Java", "C#"] },
  { title: "Currently exploring", note: "Continuing development", items: ["Flutter", "Firebase"] },
];

const projects = [
  { name: "Magsasakay", language: "JavaScript", category: "Web", number: "01", description: "Explore the Magsasakay project, its code, and implementation in the shared GitHub repository.", visual: "transport", repo: "KristianLyle/Magsasakay", label: "MAGSASAKAY", tagline: "The journey starts here.", icon: Route },
  { name: "UP-Tap", language: "JavaScript", category: "Web", number: "02", description: "An attendance management system built for the UP System, using facial recognition and RFID scanning for efficient attendance recording.", visual: "attendance", repo: "HelloCigar/UP-Tap", label: "UP / TAP", tagline: "Scan. Tap. Recorded.", icon: ScanFace },
  { name: "Italian Brainrot 2D", language: "C#", category: "Games", number: "03", description: "A 2D game project written in C#. Explore the game’s source code in the shared repository.", visual: "game", repo: "kanon0930/Italian-Brainrot-2D", label: "ITALIAN BRAINROT", tagline: "Enter the pixelverse.", icon: Gamepad2 },
  { name: "Stride", language: "TypeScript", category: "Web", number: "04", description: "A productivity web app connecting academic study and professional workflows through structured notes, Pomodoro timers, and task batching.", visual: "productivity", repo: "JohnLuis07/Stride", label: "stride.", tagline: "Make room for deep work.", icon: NotebookPen },
  { name: "Stride Android", language: "Java", category: "Mobile", number: "05", description: "The Android version of Stride, written in Java. Explore the mobile application and its implementation on GitHub.", visual: "mobile", repo: "JohnLuis07/Stride-Android", label: "stride / android", tagline: "Your next step. Anywhere.", icon: Smartphone },
  { name: "CINESTREAM", language: "TypeScript", category: "Web", number: "06", description: "A TypeScript movie-streaming project. Browse the repository to explore its interface and implementation.", visual: "cinema", repo: "JohnLuis07/CINESTREAM", label: "CINESTREAM", tagline: "A cinematic interface.", icon: Film },
];

function ProjectArtwork({ project }: { project: (typeof projects)[number] }) {
  const Icon = project.icon;
  return <div className={`project-visual showcase-art ${project.visual}`} aria-hidden="true">
    <span className="visual-caption">{project.category.toUpperCase()} / {project.number}</span>
    <div className="project-art-grid" /><div className="art-orbit"/><div className="art-block block-one"/><div className="art-block block-two"/>
    <div className="project-art-content"><Icon size={34} strokeWidth={1.2}/><strong>{project.label}</strong><span>{project.tagline}</span></div>
    <span className="visual-arrow"><ArrowUpRight size={20}/></span>
  </div>;
}

function tiltCard(event: PointerEvent<HTMLElement>) {
  if (event.pointerType !== "mouse" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const card = event.currentTarget; const box = card.getBoundingClientRect();
  const x = Math.max(0,Math.min(1,(event.clientX-box.left)/box.width)), y = Math.max(0,Math.min(1,(event.clientY-box.top)/box.height));
  const sensitivity = event.pointerType === "mouse" ? 8 : 3;
  card.style.setProperty("--tilt-x", `${(0.5-y)*sensitivity}deg`);card.style.setProperty("--tilt-y", `${(x-0.5)*sensitivity}deg`);
  card.style.setProperty("--light-x", `${x*100}%`);card.style.setProperty("--light-y", `${y*100}%`);
}
function resetCard(event: PointerEvent<HTMLElement>) {
  event.currentTarget.style.setProperty("--tilt-x", "0deg");event.currentTarget.style.setProperty("--tilt-y", "0deg");
}
function releaseCard(event: PointerEvent<HTMLElement>) {
  if(event.pointerType !== "mouse") resetCard(event);
}

export default function Home() {
  useSpatialMotion();
  const [filter, setFilter] = useState("All");
  const [menu, setMenu] = useState(false);
  const [query, setQuery] = useState("");
  const [activeSection, setActiveSection] = useState("home");
  const [selected, setSelected] = useState<(typeof projects)[number] | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  const nav = useRef<HTMLElement>(null);
  const visibleProjects = projects.filter(p => (filter === "All" || p.category === filter) && `${p.name} ${p.description} ${p.language}`.toLowerCase().includes(query.toLowerCase().trim()));
  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>("main[id], main section[id]"));
    let frame = 0;
    const update = () => {
      frame = 0;
      const height = document.documentElement.scrollHeight - innerHeight;
      document.documentElement.style.setProperty("--reading-progress", `${height > 0 ? scrollY / height * 100 : 0}%`);
      const current = sections.filter(el => el.getBoundingClientRect().top <= 160).at(-1);
      setActiveSection(current?.id || "home");
    };
    const scroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    window.addEventListener("scroll", scroll, { passive: true });
    window.addEventListener("resize", scroll); update();
    return () => { cancelAnimationFrame(frame); window.removeEventListener("scroll", scroll); window.removeEventListener("resize", scroll); };
  }, []);
  useEffect(() => {
    if (!menu) return;
    const close = (event: KeyboardEvent) => { if (event.key === "Escape") { setMenu(false); menuButton.current?.focus(); } };
    const outside = (event: globalThis.PointerEvent) => { if (!nav.current?.contains(event.target as Node) && !menuButton.current?.contains(event.target as Node)) setMenu(false); };
    const desktop = matchMedia("(min-width: 861px)");
    const resize = () => { if (desktop.matches) setMenu(false); };
    document.addEventListener("keydown", close); document.addEventListener("pointerdown", outside); desktop.addEventListener("change", resize);
    return () => { document.removeEventListener("keydown", close); document.removeEventListener("pointerdown", outside); desktop.removeEventListener("change", resize); };
  }, [menu]);
  useEffect(() => {
    if (!selected) return;
    const modal = dialog.current;
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    modal?.showModal(); document.body.style.overflow = "hidden";
    return () => { modal?.close(); document.body.style.overflow = overflow; previous?.focus({ preventScroll: true }); };
  }, [selected]);
  return <><a className="skip-link" href="#main-content">Skip to content</a><div className="reading-progress" aria-hidden="true"/><div className="ambient-light" aria-hidden="true"/>
    <header className="header spatial-header"><a className="logo" href="#home" aria-label="John Luis home">jl<span>.</span><span className="logo-slash">/</span></a><nav ref={nav} id="main-navigation" className={menu ? "nav open" : "nav"} aria-label="Main navigation">{["Experience", "Projects", "About", "Stack", "Contact"].map(x=><a key={x} aria-current={activeSection===x.toLowerCase()?"location":undefined} href={`#${x.toLowerCase()}`} onClick={()=>setMenu(false)}>{x}</a>)}<a className="nav-contact" href={resume} target="_blank" rel="noreferrer" onClick={()=>setMenu(false)}>View Résumé <ArrowUpRight size={15}/></a></nav><button ref={menuButton} className="menu-toggle" aria-controls="main-navigation" aria-label={menu ? "Close navigation" : "Open navigation"} aria-expanded={menu} onClick={()=>setMenu(!menu)}>{menu?<X/>:<Menu/>}</button></header>
    <main id="home"><span id="main-content" tabIndex={-1}/><section className="hero container foundry-hero"><div className="hero-copy spatial-copy"><div className="eyebrow"><span className="live-dot"/> SOFTWARE DEVELOPER / A WORLD OF POSSIBILITIES</div><p className="intro">Hey, I’m John Luis <span className="wave">↗</span></p><h1>Ideas take<br/> shape.<br/><span className="serif">Let’s explore.</span></h1><p className="hero-description">I’m a software developer building purposeful Android and full-stack experiences. Step into my world of enterprise engineering, creative projects, and possibilities.</p><div className="hero-actions"><a className="button primary" href="#projects">Discover my work <ArrowDown size={18}/></a><a className="button secondary" href={resume} target="_blank" rel="noreferrer"><FileText size={16}/> View Résumé</a><div className="hero-socials"><a className="social-icon" href={github} target="_blank" rel="noreferrer" aria-label="GitHub"><Github size={20}/></a><a className="social-icon" href={linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn"><Linkedin size={20}/></a></div></div></div><FoundryWorld/><div className="hero-bottom"><span><MapPin size={13}/> Nabas, Aklan · Philippines</span><a href="#experience">SCROLL TO EXPLORE <ArrowDown size={14}/></a><span className="mono">&lt; built with intention /&gt;</span></div></section>
    <div className="ticker" aria-label="Development interests"><div>CREATIVE THINKING <span>✳</span> PROBLEM SOLVING <span>✳</span> CONSTANT LEARNING <span>✳</span> BUILDING WHAT’S NEXT <span>✳</span> CREATIVE THINKING <span>✳</span></div></div>
    <section id="experience" className="section experience-section container spatial-section" aria-labelledby="experience-heading"><SpatialObject shape="layers"/>
      <div className="section-top"><div><p className="eyebrow muted">01 / PROFESSIONAL EXPERIENCE</p><h2 id="experience-heading">Built for the<br/><span className="serif">real world.</span></h2></div><a className="text-link" href={linkedin} target="_blank" rel="noreferrer">Experience on LinkedIn <ArrowUpRight size={16}/></a></div>
      <div className="experience-intro"><div><span className="role-label">SOFTWARE DEVELOPER</span><p>Android & Full-Stack Web Development</p></div><p>Hands-on enterprise engineering across warehouse operations, agriculture technology, and the systems that connect them.</p></div>
      <div className="experience-list">{experience.map((item,index)=>{const Icon=item.icon;return <article className="experience-item depth-card" onPointerDown={tiltCard} onPointerMove={tiltCard} onPointerLeave={resetCard} onPointerUp={releaseCard} onPointerCancel={resetCard} key={item.title}><div className="experience-marker"><span>{String(index+1).padStart(2,"0")}</span><Icon size={22} strokeWidth={1.5}/></div><div><h3>{item.title}</h3><p>{item.description}</p><div className="skill-tags">{item.tags.map(tag=><span key={tag}>{tag}</span>)}</div></div></article>})}</div>
      <div className="experience-end"><span>Enterprise & WMS solutions · Mobile & web delivery</span><a className="text-link" href={resume} target="_blank" rel="noreferrer"><FileText size={15}/> View full résumé <ArrowUpRight size={16}/></a></div>
    </section>
    <section id="projects" className="section container spatial-section"><SpatialObject shape="cube"/><div className="section-top"><div><p className="eyebrow muted">02 / SELECTED PROJECTS</p><h2>Ideas in <span className="serif">action.</span></h2></div><a className="text-link" href={github+"?tab=repositories"} target="_blank" rel="noreferrer">All repositories <ArrowUpRight size={16}/></a></div><div className="project-toolbar"><p>A few things I’ve been working on.</p><div className="filters" aria-label="Filter projects">{["All","Web","Mobile","Games"].map(x=><button key={x} className={filter===x?"active":""} aria-pressed={filter===x} onClick={()=>setFilter(x)}>{x}</button>)}</div></div><div className="project-search-row"><label className="project-search"><Search size={17}/><span className="sr-only">Search projects by name or technology</span><input type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search projects or technologies…"/></label><p role="status" aria-live="polite">{visibleProjects.length} {visibleProjects.length===1?"project":"projects"}</p></div><div className="project-grid">{visibleProjects.map(p=><button type="button" className="project depth-card" onPointerDown={tiltCard} onPointerMove={tiltCard} onPointerLeave={resetCard} onPointerUp={releaseCard} onPointerCancel={resetCard} onClick={()=>setSelected(p)} aria-label={`View ${p.name} project details`} key={p.repo}><ProjectArtwork project={p}/><div className="project-heading"><h3>{p.name}</h3><span>{p.language}</span></div><p>{p.description}</p><span className="project-source"><Github size={13}/> View project <ArrowUpRight size={13}/></span></button>)}</div>{visibleProjects.length===0&&<div className="project-empty"><h3>No projects found</h3><p>Try a different technology or browse the full collection.</p><button className="button primary" onClick={()=>{setQuery("");setFilter("All");}}>Reset filters</button></div>}</section>
    <section id="about" className="about section container spatial-section"><SpatialObject shape="orbit"/><div><p className="eyebrow muted">03 / BEHIND THE CODE</p><h2>A curious mind.<br/>A builder’s <span className="serif">mindset.</span></h2></div><div className="about-copy depth-card" onPointerDown={tiltCard} onPointerMove={tiltCard} onPointerLeave={resetCard} onPointerUp={releaseCard} onPointerCancel={resetCard}><p>I’m John Luis Magtoto, a Computer Science graduate from the University of the Philippines and a professional software developer based in Nabas, Aklan.</p><p>My work combines enterprise Android engineering, full-stack web development, and database operations. I adapt my tools to the project, moving between Java and XML, C# MVC, and Oracle and PostgreSQL to deliver practical solutions.</p><p>Alongside a broad collegiate foundation in programming and web development, I’m expanding into cross-platform mobile and cloud technologies with Flutter and Firebase.</p><a className="text-link" href={linkedin} target="_blank" rel="noreferrer">Connect on LinkedIn <ArrowUpRight size={16}/></a><div className="about-note"><span className="live-dot"/> ALWAYS CURIOUS. ALWAYS BUILDING.</div></div></section>
    <section id="stack" className="section stack-section container spatial-section"><SpatialObject shape="steps"/><div className="section-top"><div><p className="eyebrow muted">04 / THE TOOLKIT</p><h2>Adaptable by design.<br/><span className="serif">Grounded in experience.</span></h2></div><p className="stack-note">Enterprise tools, academic foundations,<br/>and the technologies I’m exploring next.</p></div><div className="toolkit-grid">{toolkit.map(group=><article className="toolkit-group depth-card" onPointerDown={tiltCard} onPointerMove={tiltCard} onPointerLeave={resetCard} onPointerUp={releaseCard} onPointerCancel={resetCard} key={group.title}><p className="toolkit-note">{group.note}</p><h3>{group.title}</h3><div className="skill-tags">{group.items.map(item=><span key={item}>{item}</span>)}</div></article>)}</div></section>
    <section id="contact" className="contact container depth-card" onPointerDown={tiltCard} onPointerMove={tiltCard} onPointerLeave={resetCard} onPointerUp={releaseCard} onPointerCancel={resetCard}><div className="eyebrow"><span className="live-dot"/> 05 / WHAT’S NEXT?</div><h2>Good things start<br/>with a <span className="serif">conversation.</span><span className="green-period">↗</span></h2><div className="contact-bottom"><p>Have an idea, a question, or something interesting?<br/>Let’s connect and see where it goes.</p><a className="button primary" href={linkedin} target="_blank" rel="noreferrer">Say hello on LinkedIn <ArrowUpRight size={18}/></a></div></section>
    </main>{selected&&<dialog ref={dialog} className="project-dialog" aria-labelledby="project-dialog-title" onCancel={()=>setSelected(null)} onClick={e=>{if(e.target===e.currentTarget)setSelected(null);}}><div className="dialog-body"><button className="dialog-close" aria-label="Close project details" onClick={()=>setSelected(null)} autoFocus><X size={20}/></button><ProjectArtwork project={selected}/><p className="eyebrow muted">{selected.category} / {selected.language}</p><h2 id="project-dialog-title">{selected.name}</h2><p className="dialog-description">{selected.description}</p><div className="dialog-meta"><span>Source repository</span><span>{selected.repo}</span></div><a className="button primary" href={`https://github.com/${selected.repo}`} target="_blank" rel="noreferrer"><Github size={17}/> Explore on GitHub <ArrowUpRight size={17}/></a></div></dialog>}<a className={`back-to-top ${activeSection!=="home"?"visible":""}`} href="#home" aria-label="Back to top"><ArrowUp size={19}/></a><footer className="container spatial-footer"><SpatialObject shape="cube"/><a className="logo" href="#home">jl<span>.</span></a><p>© {new Date().getFullYear()} John Luis Magtoto</p><div><a href={resume} target="_blank" rel="noreferrer">Résumé <ArrowUpRight size={13}/></a><a href={github} target="_blank" rel="noreferrer">GitHub <ArrowUpRight size={13}/></a><a href={linkedin} target="_blank" rel="noreferrer">LinkedIn <ArrowUpRight size={13}/></a><a href="#home" aria-label="Back to top">↑</a></div></footer>
  </>;
}
