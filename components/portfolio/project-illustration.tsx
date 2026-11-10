/** Decorative, original illustrations of each project's domain. */
export default function ProjectIllustration({ kind }: { kind: string }) {
  return <div className={`project-illustration illustration-${kind}`} aria-hidden="true">
    {kind === "transport" && <div className="route-study"><div className="map-streets"/><svg viewBox="0 0 220 110" fill="none"><path d="M22 83H75V32H142V70H198" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/><circle cx="22" cy="83" r="7"/><circle cx="142" cy="32" r="6"/><circle cx="198" cy="70" r="9"/></svg><span className="route-pin">↗</span></div>}
    {kind === "attendance" && <div className="attendance-study"><div className="scan-avatar"><span/><i/><i/><i/><i/></div><div className="attendance-rows">{[0,1,2].map(i=><div key={i}><span/><i/><b>✓</b></div>)}</div><span className="study-status"><i/> Recorded</span></div>}
    {kind === "game" && <div className="game-study"><div className="pixel-moon"/><div className="pixel-player"><i/><i/></div><div className="pixel-platform platform-a"/><div className="pixel-platform platform-b"/><div className="pixel-platform platform-c"/><span className="pixel-spark spark-a">+</span><span className="pixel-spark spark-b">+</span></div>}
    {kind === "productivity" && <div className="focus-study"><div className="focus-timer"><span>25<small>:00</small></span><i>FOCUS</i></div><div className="focus-tasks">{[0,1,2].map(i=><div key={i}><span>{i===0?"✓":""}</span><i/></div>)}<div className="focus-progress"><i/></div></div></div>}
    {kind === "mobile" && <div className="phone-study"><div className="phone-speaker"/><div className="phone-screen"><span className="phone-greeting">One step at a time.</span><div className="phone-ring">25:00</div><div className="phone-task"><i/><span/></div><div className="phone-task"><i/><span/></div><div className="phone-dock"><i/><i/><i/></div></div></div>}
    {kind === "cinema" && <div className="cinema-study"><div className="cinema-poster poster-a"/><div className="cinema-poster poster-b"><span>▶</span></div><div className="cinema-poster poster-c"/><div className="cinema-scrubber"><i/><span/></div></div>}
  </div>;
}
