"use client";

import { useEffect } from "react";

export function useSpatialMotion() {
  useEffect(() => {
    const root = document.documentElement;
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add("is-revealed"); observer.unobserve(entry.target); } });
    }, { threshold: 0.08 });
    document.querySelectorAll(".section-top, .experience-item, .project, .about-copy, .toolkit-group, .contact").forEach(el => { el.classList.add("reveal-pending"); observer.observe(el); });
    // React inserts new cards when search or category filters change.
    const mutations = new MutationObserver(() => {
      document.querySelectorAll(".project:not(.reveal-pending)").forEach(el => { el.classList.add("reveal-pending"); observer.observe(el); });
    });
    mutations.observe(document.querySelector(".project-grid")!, { childList: true });
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let targetX=0,targetY=0,x=0,y=0,frame=0;
    const draw=()=>{
      frame=0;
      x+=(targetX-x)*.14;y+=(targetY-y)*.14;
      root.style.setProperty("--scene-x",`${x.toFixed(3)}deg`);
      root.style.setProperty("--scene-y",`${y.toFixed(3)}deg`);
      if(Math.abs(targetX-x)+Math.abs(targetY-y)>.01)frame=requestAnimationFrame(draw);
    };
    const start=()=>{if(!frame)frame=requestAnimationFrame(draw);};
    const move=(event:PointerEvent)=>{
      if(reduced.matches || event.pointerType !== "mouse")return;
      const amount=event.pointerType==="mouse"?5:2;
      targetY=(event.clientX/innerWidth-.5)*amount;
      targetX=(.5-event.clientY/innerHeight)*amount;
      start();
    };
    const reset=()=>{targetX=0;targetY=0;start();};
    const release=(event:PointerEvent)=>{if(event.pointerType!=="mouse")reset();};
    const preference=()=>{if(reduced.matches)reset();};
    const leave=(event:PointerEvent)=>{if(!event.relatedTarget)reset();};
    window.addEventListener("pointermove",move,{passive:true});
    window.addEventListener("pointerdown",move,{passive:true});
    window.addEventListener("pointerup",release,{passive:true});
    window.addEventListener("pointercancel",reset,{passive:true});
    window.addEventListener("pointerout",leave,{passive:true});
    window.addEventListener("blur",reset);reduced.addEventListener("change",preference);
    return ()=>{
      observer.disconnect(); mutations.disconnect();
      document.querySelectorAll(".reveal-pending").forEach(el => el.classList.remove("reveal-pending", "is-revealed"));
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove",move);window.removeEventListener("pointerdown",move);
      window.removeEventListener("pointerup",release);window.removeEventListener("pointercancel",reset);
      window.removeEventListener("pointerout",leave);window.removeEventListener("blur",reset);
      reduced.removeEventListener("change",preference);root.style.removeProperty("--scene-x");root.style.removeProperty("--scene-y");
    };
  },[]);
}
