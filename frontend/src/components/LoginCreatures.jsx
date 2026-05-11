import { useEffect, useRef, useState } from 'react';

const CREATURES = [
  { id: 0, color: '#2d1e42', skin: '#3d2855', pupil: '#1a0830', w: 38, h: 54, speed: 0.00008 },
  { id: 1, color: '#1a2e1a', skin: '#243824', pupil: '#0a180a', w: 34, h: 60, speed: 0.00007 },
  { id: 2, color: '#0e2230', skin: '#142d3a', pupil: '#060e14', w: 42, h: 64, speed: 0.00009 },
  { id: 3, color: '#2e1018', skin: '#3a1420', pupil: '#14060a', w: 36, h: 56, speed: 0.000075 },
  { id: 4, color: '#2a2010', skin: '#362a14', pupil: '#100c04', w: 32, h: 52, speed: 0.000085 },
];

function CreatureSVG({ c }) {
  const W = c.w, H = c.h;
  const eyeR = Math.round(W * 0.17);
  const eyeY = Math.round(H * 0.36);
  const eyeGap = Math.round(W * 0.23);

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} overflow="visible" style={{ display: 'block', position: 'relative', zIndex: 2 }}>
      <ellipse cx={W/2} cy={H+3} rx={W*0.38} ry={4} fill="rgba(0,0,0,.35)"/>
      <g style={{ transformOrigin: `${W/2-5}px ${H-8}px`, animation: 'lcLegL .45s ease-in-out infinite' }}>
        <rect x={W/2-8} y={H-14} width={7} height={16} rx={3.5} fill={c.color}/>
        <ellipse cx={W/2-4.5} cy={H+2} rx={5} ry={3.5} fill={c.color}/>
      </g>
      <g style={{ transformOrigin: `${W/2+5}px ${H-8}px`, animation: 'lcLegR .45s ease-in-out infinite' }}>
        <rect x={W/2+1} y={H-14} width={7} height={16} rx={3.5} fill={c.color}/>
        <ellipse cx={W/2+4.5} cy={H+2} rx={5} ry={3.5} fill={c.color}/>
      </g>
      <g style={{ animation: 'lcBob .45s ease-in-out infinite' }}>
        {c.id % 2 === 0 ? (
          <>
            <ellipse cx={W/2-4} cy={6} rx={4} ry={6} fill={c.color}/>
            <ellipse cx={W/2+4} cy={6} rx={4} ry={6} fill={c.color}/>
          </>
        ) : (
          <>
            <path d={`M${W/2-5} 8 Q${W/2-8} 0 ${W/2-4} -2 Q${W/2-2} 4 ${W/2-2} 8`} fill={c.color}/>
            <path d={`M${W/2+5} 8 Q${W/2+8} 0 ${W/2+4} -2 Q${W/2+2} 4 ${W/2+2} 8`} fill={c.color}/>
          </>
        )}
        <rect x={3} y={8} width={W-6} height={H-22} rx={(W-6)/2} fill={c.color} stroke="rgba(255,255,255,.05)" strokeWidth={1}/>
        <rect x={7} y={H*0.28} width={W-14} height={H*0.38} rx={(W-14)/2} fill={c.skin} opacity={.55}/>
        <ellipse cx={W/2} cy={H*0.18} rx={W*0.22} ry={H*0.07} fill="rgba(255,255,255,.07)"/>
        <circle cx={W/2-eyeGap} cy={eyeY} r={eyeR+1.5} fill="rgba(0,0,0,.4)"/>
        <circle cx={W/2-eyeGap} cy={eyeY} r={eyeR} fill="#f5f0e8"/>
        <circle cx={W/2-eyeGap} cy={eyeY} r={eyeR*0.8} fill="#c9a84c"/>
        <circle cx={W/2+eyeGap} cy={eyeY} r={eyeR+1.5} fill="rgba(0,0,0,.4)"/>
        <circle cx={W/2+eyeGap} cy={eyeY} r={eyeR} fill="#f5f0e8"/>
        <circle cx={W/2+eyeGap} cy={eyeY} r={eyeR*0.8} fill="#c9a84c"/>
      </g>
    </svg>
  );
}

function CoverHands({ c, visible }) {
  const W = c.w, H = c.h;
  const eyeY = Math.round(H * 0.36);
  const eyeGap = Math.round(W * 0.23);
  const eyeR = Math.round(W * 0.17);

  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, width: W, height: H,
      pointerEvents: 'none', zIndex: 5, overflow: 'hidden',
    }}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: 'absolute', top: 0, left: 0 }}>
        <g style={{
          transform: visible ? 'translateY(0)' : 'translateY(110%)',
          transition: 'transform 0.4s cubic-bezier(.34,1.26,.64,1)',
        }}>
          <ellipse cx={W/2-eyeGap} cy={eyeY+2} rx={eyeR+3} ry={eyeR+2} fill={c.color}/>
          <rect x={W/2-eyeGap-eyeR-1} y={eyeY-eyeR-8} width={4} height={10} rx={2} fill={c.color}/>
          <rect x={W/2-eyeGap-eyeR+3} y={eyeY-eyeR-10} width={4} height={12} rx={2} fill={c.color}/>
          <rect x={W/2-eyeGap+1} y={eyeY-eyeR-10} width={4} height={12} rx={2} fill={c.color}/>
          <rect x={W/2-eyeGap+5} y={eyeY-eyeR-8} width={3} height={10} rx={1.5} fill={c.color}/>
        </g>
        <g style={{
          transform: visible ? 'translateY(0)' : 'translateY(110%)',
          transition: 'transform 0.42s cubic-bezier(.34,1.26,.64,1) 0.04s',
        }}>
          <ellipse cx={W/2+eyeGap} cy={eyeY+2} rx={eyeR+3} ry={eyeR+2} fill={c.color}/>
          <rect x={W/2+eyeGap-eyeR-3} y={eyeY-eyeR-8} width={3} height={10} rx={1.5} fill={c.color}/>
          <rect x={W/2+eyeGap-eyeR} y={eyeY-eyeR-10} width={4} height={12} rx={2} fill={c.color}/>
          <rect x={W/2+eyeGap-eyeR+5} y={eyeY-eyeR-10} width={4} height={12} rx={2} fill={c.color}/>
          <rect x={W/2+eyeGap+3} y={eyeY-eyeR-8} width={4} height={10} rx={2} fill={c.color}/>
        </g>
      </svg>
    </div>
  );
}

export default function LoginCreatures({ activeField }) {
  const mouseRef = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const stateRef = useRef([]);
  const rafRef = useRef();
  const activeFieldRef = useRef(activeField);
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    stateRef.current = CREATURES.map((c, i) => ({
      ...c,
      t: i / CREATURES.length,
      x: 0, y: 0,
    }));
    forceUpdate(n => n + 1);
  }, []);

  useEffect(() => {
    activeFieldRef.current = activeField;
  }, [activeField]);

  useEffect(() => {
    const onMove = e => { mouseRef.current = { x: e.clientX, y: e.clientY }; };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  useEffect(() => {
    let last = null;

    function perimeterPos(t, W, H) {
      const perim = 2 * (W + H);
      const d = ((t % 1) + 1) % 1 * perim;
      if (d < W)       return { x: d,         y: 0,       side: 'top'    };
      if (d < W + H)   return { x: W,          y: d-W,     side: 'right'  };
      if (d < 2*W + H) return { x: W-(d-W-H),  y: H,       side: 'bottom' };
      return                   { x: 0,          y: H-(d-2*W-H), side: 'left' };
    }

    function loop(ts) {
      if (!last) last = ts;
      const dt = Math.min(ts - last, 50);
      last = ts;

      const card = document.getElementById('lc-card-anchor');
      if (!card) { rafRef.current = requestAnimationFrame(loop); return; }

      const cr = card.getBoundingClientRect();
      const W = cr.width, H = cr.height;

      stateRef.current.forEach((s, i) => {
        let spd = s.speed;
        if (activeFieldRef.current === 'email')    spd = 0;
        if (activeFieldRef.current === 'password') spd = 0;

        s.t += spd * dt;

        const pos = perimeterPos(s.t, W, H);
        const cW = s.w, cH = s.h;

        let left, top;
        if (pos.side === 'top')    { left = pos.x - cW/2;   top = -cH + 8; }
        if (pos.side === 'right')  { left = W - cW*0.35;    top = pos.y - cH/2; }
        if (pos.side === 'bottom') { left = pos.x - cW/2;   top = H - 8; }
        if (pos.side === 'left')   { left = -cW*0.65;       top = pos.y - cH/2; }

        s.x = cr.left + left;
        s.y = cr.top  + top;
        s.side = pos.side;

        const eyeR   = Math.round(cW * 0.17);
        const eyeY   = Math.round(cH * 0.36);
        const eyeGap = Math.round(cW * 0.23);
        const maxMv  = eyeR * 0.45;

        const elL = document.getElementById(`lc-pL-${i}`);
        const elR = document.getElementById(`lc-pR-${i}`);

        let targetX = mouseRef.current.x;
        let targetY = mouseRef.current.y;

        if (activeFieldRef.current === 'email') {
          const emailInput = document.getElementById('lc-email-input');
          if (emailInput) {
            const er = emailInput.getBoundingClientRect();
            targetX = er.left + er.width / 2;
            targetY = er.top + er.height / 2;
          }
        }

        [elL, elR].forEach((el, side) => {
          if (!el) return;
          const eyeAbsX = s.x + cW/2 + (side === 0 ? -eyeGap : eyeGap);
          const eyeAbsY = s.y + eyeY;
          const dx = targetX - eyeAbsX;
          const dy = targetY - eyeAbsY;
          const dist = Math.sqrt(dx*dx + dy*dy) || 1;
          const mv = Math.min(maxMv, dist * 0.3) / dist;
          el.style.transform = `translate(calc(-50% + ${(dx*mv).toFixed(1)}px), calc(-50% + ${(dy*mv).toFixed(1)}px))`;
        });

        const wrapper = document.getElementById(`lc-w-${i}`);
        if (wrapper) {
          wrapper.style.left = s.x + 'px';
          wrapper.style.top  = s.y + 'px';
        }
      });

      rafRef.current = requestAnimationFrame(loop);
    }

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [activeField]);

  const isPassword = activeField === 'password';

  return (
    <>
      <style>{`
        @keyframes lcLegL  { 0%,100%{transform:rotate(18deg)}  50%{transform:rotate(-18deg)} }
        @keyframes lcLegR  { 0%,100%{transform:rotate(-18deg)} 50%{transform:rotate(18deg)}  }
        @keyframes lcBob   { 0%,100%{transform:translateY(0)}  50%{transform:translateY(-2px)} }
      `}</style>

      {CREATURES.map((c, i) => {
        const eyeR   = Math.round(c.w * 0.17);
        const eyeY   = Math.round(c.h * 0.36);
        const eyeGap = Math.round(c.w * 0.23);
        const pupilR = Math.round(eyeR * 0.48);

        return (
          <div
            key={c.id}
            id={`lc-w-${i}`}
            style={{
              position: 'fixed',
              width: c.w,
              height: c.h,
              pointerEvents: 'none',
              zIndex: 100,
              filter: 'drop-shadow(0 4px 10px rgba(0,0,0,.65))',
              left: 0, top: 0,
            }}
          >
            <CreatureSVG c={c} />
            <CoverHands c={c} visible={isPassword} />

            <div
              id={`lc-pL-${i}`}
              style={{
                position: 'absolute',
                borderRadius: '50%',
                width: pupilR * 2,
                height: pupilR * 2,
                background: c.pupil,
                boxShadow: '1.5px 1.5px 0 rgba(255,255,255,.72)',
                top: eyeY,
                left: c.w/2 - eyeGap,
                transform: 'translate(-50%,-50%)',
                pointerEvents: 'none',
                zIndex: 3,
                transition: 'transform .06s linear',
                opacity: isPassword ? 0 : 1,
              }}
            />
            <div
              id={`lc-pR-${i}`}
              style={{
                position: 'absolute',
                borderRadius: '50%',
                width: pupilR * 2,
                height: pupilR * 2,
                background: c.pupil,
                boxShadow: '1.5px 1.5px 0 rgba(255,255,255,.72)',
                top: eyeY,
                left: c.w/2 + eyeGap,
                transform: 'translate(-50%,-50%)',
                pointerEvents: 'none',
                zIndex: 3,
                transition: 'transform .06s linear',
                opacity: isPassword ? 0 : 1,
              }}
            />
          </div>
        );
      })}
    </>
  );
}
