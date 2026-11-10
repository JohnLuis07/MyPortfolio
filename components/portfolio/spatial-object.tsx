import type { CSSProperties } from "react";

type Shape = "layers" | "cube" | "orbit" | "steps";
export default function SpatialObject({shape="cube"}: {shape?: Shape}) {
  return <div className={`spatial-object spatial-${shape}`} aria-hidden="true"><div className="spatial-object-shadow"/><div className="spatial-object-body">{shape==="cube"?<div className="spatial-cube">{["front","back","right","left","top","bottom"].map(face=><i className={`cube-face face-${face}`} key={face}/>)}</div>:shape==="orbit"?<div className="spatial-gyroscope"><i/><i/><i/><span/></div>:<div className="spatial-plates">{[0,1,2,3].map(i=><i key={i} style={{"--plate":i} as CSSProperties}/>)}</div>}</div></div>;
}
