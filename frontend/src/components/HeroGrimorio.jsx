import { useEffect, useRef } from 'react';

function ArcaneBackground() {
  const ref = useRef();

  useEffect(() => {
    const cv = ref.current;
    const ctx = cv.getContext('2d');
    let W, H;
    const resize = () => { W = cv.width = window.innerWidth; H = cv.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);

    const SYMS = ['ᚠ','ᚢ','ᚦ','ᚨ','ᚱ','ᚲ','ᚷ','ᚹ','ᚺ','ᚾ','ᛁ','ᛃ','ᛇ','ᛈ','ᛉ','ᛊ','ᛏ','ᛒ','ᛖ','ᛗ','ᛚ','ᛜ','ᛞ','ᛟ','☩','⊕','⊗','✦','◈','⬟'];

    const attrs = [
      {px:.09,py:.14,t:'18',op:.48,sz:16,phase:Math.random()*Math.PI*2},
      {px:.07,py:.26,t:'STR',op:.52,sz:15,phase:Math.random()*Math.PI*2},
      {px:.06,py:.44,t:'CON',op:.48,sz:15,phase:Math.random()*Math.PI*2},
      {px:.05,py:.58,t:'×',op:.28,sz:13,phase:Math.random()*Math.PI*2},
      {px:.04,py:.72,t:'+5',op:.42,sz:14,phase:Math.random()*Math.PI*2},
      {px:.91,py:.14,t:'INT',op:.52,sz:15,phase:Math.random()*Math.PI*2},
      {px:.93,py:.26,t:'d8',op:.42,sz:14,phase:Math.random()*Math.PI*2},
      {px:.92,py:.42,t:'WIS',op:.48,sz:15,phase:Math.random()*Math.PI*2},
      {px:.90,py:.54,t:'23',op:.42,sz:15,phase:Math.random()*Math.PI*2},
      {px:.92,py:.66,t:'CHA',op:.48,sz:15,phase:Math.random()*Math.PI*2},
      {px:.94,py:.78,t:'+3',op:.38,sz:13,phase:Math.random()*Math.PI*2},
      {px:.91,py:.89,t:'20',op:.42,sz:15,phase:Math.random()*Math.PI*2},
    ];

    const sparks = Array.from({length:180}, () => ({
      x: Math.random()*window.innerWidth, y: Math.random()*window.innerHeight,
      r: .2 + Math.random()*1.4,
      vx: (Math.random()-.5)*.14, vy: -.1 - Math.random()*.32,
      a: Math.random()*Math.PI*2,
    }));

    function drawD20(x,y,sz,op,angle=0) {
      ctx.save();ctx.translate(x,y);ctx.rotate(angle);ctx.globalAlpha=op;ctx.strokeStyle='rgba(201,168,76,1)';ctx.lineWidth=.75;
      const r=sz/2,inn=r*.52,outer=[],inP=[];
      for(let i=0;i<5;i++){const a=(i*72-90)*Math.PI/180;outer.push([r*Math.cos(a),r*Math.sin(a)]);}
      for(let i=0;i<5;i++){const a=(i*72-54)*Math.PI/180;inP.push([inn*Math.cos(a),inn*Math.sin(a)]);}
      ctx.beginPath();outer.forEach(([px,py],i)=>i===0?ctx.moveTo(px,py):ctx.lineTo(px,py));ctx.closePath();ctx.stroke();
      for(let i=0;i<5;i++){
        ctx.beginPath();ctx.moveTo(outer[i][0],outer[i][1]);ctx.lineTo(inP[i][0],inP[i][1]);ctx.lineTo(outer[(i+1)%5][0],outer[(i+1)%5][1]);ctx.closePath();ctx.stroke();
        ctx.beginPath();ctx.moveTo(inP[i][0],inP[i][1]);ctx.lineTo(outer[(i+1)%5][0],outer[(i+1)%5][1]);ctx.lineTo(inP[(i+1)%5][0],inP[(i+1)%5][1]);ctx.closePath();ctx.stroke();
      }
      ctx.beginPath();inP.forEach(([px,py],i)=>i===0?ctx.moveTo(px,py):ctx.lineTo(px,py));ctx.closePath();ctx.stroke();
      ctx.fillStyle='rgba(201,168,76,.52)';ctx.font=`bold ${sz*.19}px Georgia`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('20',0,0);
      ctx.restore();
    }

    function drawD8(x,y,sz,op,angle=0) {
      ctx.save();ctx.translate(x,y);ctx.rotate(angle);ctx.globalAlpha=op;ctx.strokeStyle='rgba(201,168,76,1)';ctx.lineWidth=.75;
      const r=sz/2,pts=[[0,-r],[r*.72,0],[0,r],[-r*.72,0]];
      ctx.beginPath();pts.forEach(([px,py],i)=>i===0?ctx.moveTo(px,py):ctx.lineTo(px,py));ctx.closePath();ctx.stroke();
      pts.forEach(([px,py])=>{ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(px,py);ctx.stroke();});
      ctx.fillStyle='rgba(201,168,76,.52)';ctx.font=`${sz*.19}px Georgia`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('8',0,0);
      ctx.restore();
    }

    function drawD12(x,y,sz,op,angle=0) {
      ctx.save();ctx.translate(x,y);ctx.rotate(angle);ctx.globalAlpha=op;ctx.strokeStyle='rgba(201,168,76,1)';ctx.lineWidth=.75;
      const r=sz/2,ri=r*.48;
      ctx.beginPath();for(let i=0;i<5;i++){const a=(i*72-90)*Math.PI/180;i===0?ctx.moveTo(r*Math.cos(a),r*Math.sin(a)):ctx.lineTo(r*Math.cos(a),r*Math.sin(a));}ctx.closePath();ctx.stroke();
      ctx.beginPath();for(let i=0;i<5;i++){const a=(i*72-90)*Math.PI/180;i===0?ctx.moveTo(ri*Math.cos(a),ri*Math.sin(a)):ctx.lineTo(ri*Math.cos(a),ri*Math.sin(a));}ctx.closePath();ctx.stroke();
      ctx.fillStyle='rgba(201,168,76,.52)';ctx.font=`${sz*.16}px Georgia`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('12',0,0);
      ctx.restore();
    }

    function drawD4(x,y,sz,op,angle=0) {
      ctx.save();ctx.translate(x,y);ctx.rotate(angle);ctx.globalAlpha=op;ctx.strokeStyle='rgba(201,168,76,1)';ctx.lineWidth=.75;
      const pts=[[0,-sz/2],[-sz*.43,sz*.25],[sz*.43,sz*.25]];
      ctx.beginPath();pts.forEach(([px,py],i)=>i===0?ctx.moveTo(px,py):ctx.lineTo(px,py));ctx.closePath();ctx.stroke();
      ctx.restore();
    }

    const RUNES = ['ᚠ','ᚢ','ᚦ','ᚨ','ᚱ','ᚲ','ᚷ','ᚹ','ᚺ','ᚾ','ᛁ','ᛃ','ᛇ','ᛈ','ᛉ','ᛊ','ᛏ','ᛒ','ᛖ','ᛗ','ᛚ','ᛜ','ᛞ','ᛟ'];
    const movingRunes = Array.from({length:50}, () => ({
      x: Math.random()*window.innerWidth, y: Math.random()*window.innerHeight,
      rune: RUNES[Math.floor(Math.random()*RUNES.length)],
      sz: 10+Math.random()*22,
      vx: (Math.random()-0.5)*0.28, vy: (Math.random()-0.5)*0.28,
      angle: Math.random()*Math.PI*2, rotSpeed: (Math.random()-0.5)*0.007,
      op: 0.1+Math.random()*0.22,
    }));

    const miniCircles = Array.from({length:14}, () => ({
      x: Math.random()*window.innerWidth, y: Math.random()*window.innerHeight,
      r: 20+Math.random()*65,
      rot: Math.random()*Math.PI*2, rotSpeed: (Math.random()-0.5)*0.007,
      vx: (Math.random()-0.5)*0.18, vy: (Math.random()-0.5)*0.18,
      op: 0.1+Math.random()*0.18,
      sides: [4,5,6][Math.floor(Math.random()*3)],
    }));

    const _diceFns = [drawD20,drawD8,drawD12,drawD4,drawD20,drawD8,drawD12,drawD4,drawD20,drawD12,drawD8,drawD4];
    const movingDice = Array.from({length:35}, (_,i) => ({
      x: Math.random()*window.innerWidth, y: Math.random()*window.innerHeight,
      sz: 18+Math.random()*38,
      fn: _diceFns[i%_diceFns.length],
      vx: (Math.random()-0.5)*0.55, vy: (Math.random()-0.5)*0.55,
      angle: Math.random()*Math.PI*2,
      rotSpeed: (Math.random()-0.5)*0.022,
      op: 0.3+Math.random()*0.35,
    }));

    const DND_SYMBOLS = ['+5','+3','+8','+2','18','14','20','d20','d8','d12','d6','d4','CA','BC','PG','VC','XP','TS'];
    const floatingSymbols = Array.from({length:40}, () => ({
      x: Math.random()*window.innerWidth, y: Math.random()*window.innerHeight,
      text: DND_SYMBOLS[Math.floor(Math.random()*DND_SYMBOLS.length)],
      sz: 9+Math.random()*13,
      vx: (Math.random()-0.5)*0.2, vy: (Math.random()-0.5)*0.2,
      angle: 0, rotSpeed: (Math.random()-0.5)*0.004,
      op: 0.08+Math.random()*0.18,
    }));

    function drawArcaneDiagram(pulse, frame) {
      const cx=W/2, cy=H*.45, maxR=Math.min(W,H)*.32;
      ctx.save();
      ctx.translate(cx,cy);ctx.rotate(frame*0.0004);ctx.translate(-cx,-cy);
      const grd=ctx.createRadialGradient(cx,cy,0,cx,cy,maxR*1.15);
      grd.addColorStop(0,`rgba(122,28,28,${0.28*pulse})`);grd.addColorStop(.4,'rgba(90,20,20,0.14)');
      grd.addColorStop(.75,'rgba(26,26,46,0.08)');grd.addColorStop(1,'transparent');
      ctx.fillStyle=grd;ctx.fillRect(0,0,W,H);
      ctx.strokeStyle='rgba(201,168,76,1)';
      ctx.globalAlpha=.16*pulse;ctx.lineWidth=.55;
      ctx.beginPath();ctx.arc(cx,cy,maxR,0,Math.PI*2);ctx.stroke();
      ctx.beginPath();ctx.arc(cx,cy,maxR*.76,0,Math.PI*2);ctx.stroke();
      ctx.globalAlpha=.2*pulse;ctx.lineWidth=.5;
      ctx.beginPath();ctx.moveTo(cx-maxR,cy);ctx.lineTo(cx+maxR,cy);ctx.stroke();
      ctx.beginPath();ctx.moveTo(cx,cy-maxR);ctx.lineTo(cx,cy+maxR);ctx.stroke();
      ctx.globalAlpha=.18*pulse;ctx.lineWidth=.5;
      const th=maxR*.88;
      ctx.beginPath();ctx.moveTo(cx,cy-th);ctx.lineTo(cx-maxR*.63,cy+th*.28);ctx.lineTo(cx+maxR*.63,cy+th*.28);ctx.closePath();ctx.stroke();
      ctx.globalAlpha=.18*pulse;
      ctx.beginPath();ctx.ellipse(cx,cy,maxR*.68,maxR*.26,0,0,Math.PI*2);ctx.stroke();
      ctx.beginPath();ctx.ellipse(cx,cy,maxR*.42,maxR*.17,0,0,Math.PI*2);ctx.stroke();
      const gW=maxR*.88,gH=maxR*.52,cols=12,rows=7;
      ctx.globalAlpha=.11;ctx.lineWidth=.38;
      for(let i=0;i<=cols;i++){const x=cx-gW/2+i*(gW/cols);ctx.beginPath();ctx.moveTo(x,cy-gH/2);ctx.lineTo(x,cy+gH/2);ctx.stroke();}
      for(let i=0;i<=rows;i++){const y=cy-gH/2+i*(gH/rows);ctx.beginPath();ctx.moveTo(cx-gW/2,y);ctx.lineTo(cx+gW/2,y);ctx.stroke();}
      ctx.globalAlpha=.09;ctx.lineWidth=.32;
      for(let i=0;i<26;i++){const a1=i*Math.PI*2/26,a2=((i+9)%26)*Math.PI*2/26;ctx.beginPath();ctx.moveTo(cx+maxR*.28*Math.cos(a1),cy+maxR*.28*Math.sin(a1));ctx.lineTo(cx+maxR*.72*Math.cos(a2),cy+maxR*.72*Math.sin(a2));ctx.stroke();}
      ctx.fillStyle='rgba(201,168,76,1)';ctx.font='6.5px serif';ctx.textAlign='center';ctx.textBaseline='middle';
      for(let i=0;i<cols;i++)for(let j=0;j<rows;j++){ctx.globalAlpha=.15+Math.sin(i*j)*.05;ctx.fillText(SYMS[(i*rows+j)%SYMS.length],cx-gW/2+(i+.5)*(gW/cols),cy-gH/2+(j+.5)*(gH/rows));}
      const bW=maxR*.42,bH=maxR*.09;
      ctx.globalAlpha=.3;ctx.strokeStyle='rgba(201,168,76,1)';ctx.lineWidth=.55;
      ctx.strokeRect(cx-bW/2,cy-bH/2,bW,bH);
      ctx.globalAlpha=.1;ctx.fillStyle='rgba(130,70,5,1)';ctx.fillRect(cx-bW/2,cy-bH/2,bW,bH);
      ctx.globalAlpha=.22;ctx.lineWidth=.45;ctx.strokeStyle='rgba(201,168,76,1)';
      for(let i=0;i<36;i++){const a=i*Math.PI*2/36,inner=i%3===0?maxR*.93:maxR*.96;ctx.beginPath();ctx.moveTo(cx+inner*Math.cos(a),cy+inner*Math.sin(a));ctx.lineTo(cx+maxR*Math.cos(a),cy+maxR*Math.sin(a));ctx.stroke();}
      ctx.globalAlpha=.07;ctx.lineWidth=.35;
      for(let i=0;i<16;i++){const a=i*Math.PI/8;ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(cx+maxR*Math.cos(a),cy+maxR*Math.sin(a));ctx.stroke();}
      ctx.globalAlpha=.38;ctx.fillStyle='rgba(201,168,76,1)';ctx.font='12px Georgia';ctx.textAlign='center';ctx.fillText('d20',cx,cy-maxR-10);
      ctx.restore();
    }

    let raf, frame = 0;
    function animate() {
      frame++;
      const pulse = 0.85 + 0.15 * Math.sin(frame * 0.012);
      ctx.clearRect(0,0,W,H);
      ctx.fillStyle='#1a1a2e';ctx.fillRect(0,0,W,H);
      const vig=ctx.createRadialGradient(W/2,H*.42,H*.08,W/2,H*.42,H*.78);
      vig.addColorStop(0,'transparent');vig.addColorStop(1,'rgba(14,14,32,0.88)');
      ctx.fillStyle=vig;ctx.fillRect(0,0,W,H);
      drawArcaneDiagram(pulse, frame);
      attrs.forEach(a=>{
        const ox=Math.sin(frame*.007+a.phase)*.003*W;
        const oy=Math.cos(frame*.005+a.phase)*.003*H;
        ctx.globalAlpha=a.op;ctx.fillStyle='rgba(201,168,76,1)';ctx.font=`${a.sz}px Georgia`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(a.t,a.px*W+ox,a.py*H+oy);
      });
      movingDice.forEach(d=>{
        d.angle+=d.rotSpeed; d.x+=d.vx; d.y+=d.vy;
        if(d.x<-60)d.x=W+60; if(d.x>W+60)d.x=-60;
        if(d.y<-60)d.y=H+60; if(d.y>H+60)d.y=-60;
        d.fn(d.x,d.y,d.sz,d.op,d.angle);
      });
      movingRunes.forEach(r=>{
        r.angle+=r.rotSpeed; r.x+=r.vx; r.y+=r.vy;
        if(r.x<-30)r.x=W+30; if(r.x>W+30)r.x=-30;
        if(r.y<-30)r.y=H+30; if(r.y>H+30)r.y=-30;
        ctx.save();ctx.translate(r.x,r.y);ctx.rotate(r.angle);
        ctx.globalAlpha=r.op;ctx.fillStyle='rgba(201,168,76,1)';
        ctx.font=`${r.sz}px serif`;ctx.textAlign='center';ctx.textBaseline='middle';
        ctx.fillText(r.rune,0,0);ctx.restore();
      });
      miniCircles.forEach(c=>{
        c.rot+=c.rotSpeed; c.x+=c.vx; c.y+=c.vy;
        if(c.x<-80)c.x=W+80; if(c.x>W+80)c.x=-80;
        if(c.y<-80)c.y=H+80; if(c.y>H+80)c.y=-80;
        ctx.save();ctx.translate(c.x,c.y);ctx.rotate(c.rot);
        ctx.globalAlpha=c.op;ctx.strokeStyle='rgba(201,168,76,1)';ctx.lineWidth=0.5;
        ctx.beginPath();ctx.arc(0,0,c.r,0,Math.PI*2);ctx.stroke();
        ctx.beginPath();ctx.arc(0,0,c.r*0.6,0,Math.PI*2);ctx.stroke();
        const pts=[];
        for(let i=0;i<c.sides;i++){const a=i*Math.PI*2/c.sides-Math.PI/2;pts.push([c.r*Math.cos(a),c.r*Math.sin(a)]);}
        ctx.beginPath();pts.forEach(([px,py],i)=>i===0?ctx.moveTo(px,py):ctx.lineTo(px,py));ctx.closePath();ctx.stroke();
        ctx.restore();
      });
      sparks.forEach(p=>{p.x+=p.vx;p.y+=p.vy;p.a+=.018;if(p.y<-4){p.y=H+4;p.x=Math.random()*W;}const al=Math.max(0,.1+.22*Math.sin(p.a));ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fillStyle=`rgba(201,168,76,${al})`;ctx.fill();});
      floatingSymbols.forEach(s=>{
        s.angle+=s.rotSpeed; s.x+=s.vx; s.y+=s.vy;
        if(s.x<-30)s.x=W+30; if(s.x>W+30)s.x=-30;
        if(s.y<-20)s.y=H+20; if(s.y>H+20)s.y=-20;
        ctx.save();ctx.translate(s.x,s.y);ctx.rotate(s.angle);
        ctx.globalAlpha=s.op;ctx.fillStyle='rgba(201,168,76,1)';
        ctx.font=`${s.sz}px Georgia`;ctx.textAlign='center';ctx.textBaseline='middle';
        ctx.fillText(s.text,0,0);ctx.restore();
      });
      ctx.globalAlpha=1;
      raf=requestAnimationFrame(animate);
    }
    animate();
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);

  return <canvas ref={ref} style={{position:'fixed',top:0,left:0,width:'100vw',height:'100vh',pointerEvents:'none',zIndex:0}} />;
}

function GrimoireBook() {
  return (
    <div style={{position:'relative',zIndex:2,marginTop:'0px'}}>
      <style>{`
        @keyframes bookBreathe {
          0%,100% { filter: drop-shadow(0 0 25px rgba(201,168,76,0.18)) drop-shadow(0 40px 70px rgba(0,0,0,0.85)); }
          50%      { filter: drop-shadow(0 0 45px rgba(201,168,76,0.32)) drop-shadow(0 0 80px rgba(122,28,28,0.15)) drop-shadow(0 40px 70px rgba(0,0,0,0.85)); }
        }
        @keyframes shadowBreath {
          0%,100% { opacity:0.7; transform:scaleX(0.96); }
          50%      { opacity:0.95; transform:scaleX(1.02); }
        }
      `}</style>

      {/* Sombra proyectada al suelo */}
      <div style={{position:'absolute',bottom:'-35px',left:'10%',width:'80%',height:'40px',background:'radial-gradient(ellipse,rgba(0,0,0,0.92) 0%,transparent 70%)',filter:'blur(14px)',animation:'shadowBreath 6s ease-in-out infinite',pointerEvents:'none',zIndex:0}} />

      {/* Glow detrás del libro */}
      <div style={{position:'absolute',inset:'-20px',background:'radial-gradient(ellipse at 50% 55%,rgba(122,28,28,0.2) 0%,rgba(201,168,76,0.06) 45%,transparent 68%)',filter:'blur(20px)',pointerEvents:'none',zIndex:0}} />

      {/* IMAGEN DEL LIBRO */}
      <div style={{position:'relative',zIndex:1}}>
        <img
          src="/libro.png"
          alt="El Grimorio"
          style={{width:'min(780px,85vw)',height:'auto',display:'block',userSelect:'none',pointerEvents:'none',animation:'bookBreathe 6s ease-in-out infinite'}}
        />
        {/* Área contenido página izquierda */}
        <div style={{position:'absolute',top:'10%',left:'4%',width:'44%',height:'75%',zIndex:3,display:'flex',alignItems:'center',justifyContent:'center'}}>
          <span style={{color:'rgba(70,40,5,0.2)',fontFamily:'Georgia,serif',fontSize:'10px',fontStyle:'italic'}}>[ Paso 3 ]</span>
        </div>
        {/* Área contenido página derecha */}
        <div style={{position:'absolute',top:'10%',right:'4%',width:'44%',height:'75%',zIndex:3,display:'flex',alignItems:'center',justifyContent:'center'}}>
          <span style={{color:'rgba(70,40,5,0.2)',fontFamily:'Georgia,serif',fontSize:'10px',fontStyle:'italic'}}>[ Paso 3 ]</span>
        </div>
      </div>
    </div>
  );
}

export default function HeroGrimorio({ onEnter }) {
  return (
    <div style={{width:'100%',height:'100vh',maxHeight:'100vh',overflow:'hidden',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',position:'relative',background:'#1a1a2e',padding:'0 20px'}}>
      <style>{`
        @keyframes titleGlow{0%,100%{text-shadow:0 0 22px rgba(201,168,76,.35),0 2px 8px rgba(0,0,0,.9)}50%{text-shadow:0 0 55px rgba(201,168,76,.65),0 0 90px rgba(122,28,28,.25),0 2px 8px rgba(0,0,0,.9)}}
        @keyframes btnPulse{0%,100%{box-shadow:0 0 0 1px rgba(201,168,76,.32)}50%{box-shadow:0 0 18px rgba(201,168,76,.22),0 0 0 1px rgba(201,168,76,.6)}}
      `}</style>
      <ArcaneBackground />
      <GrimoireBook />
      <div style={{position:'relative',zIndex:2,textAlign:'center',marginTop:'10px'}}>
        <div style={{fontFamily:"'Cinzel',Georgia,serif",fontSize:'clamp(32px,5.5vw,62px)',color:'#c9a84c',letterSpacing:'10px',fontWeight:400,animation:'titleGlow 4s ease-in-out infinite'}}>
          EL GRIMORIO
        </div>
        <div style={{fontFamily:"'Cinzel',Georgia,serif",fontSize:'clamp(9px,1.1vw,11px)',color:'#8B6914',letterSpacing:'5px',textTransform:'uppercase',margin:'5px 0 13px'}}>
          Compendio de Criaturas · D&D 5ª Edición
        </div>
        <div style={{display:'inline-flex',alignItems:'center',gap:8,border:'1px solid rgba(201,168,76,.55)',padding:'10px 28px',color:'#C9A84C',fontFamily:"'Cinzel',Georgia,serif",fontSize:'clamp(9px,1.1vw,12px)',letterSpacing:'4px',textTransform:'uppercase',cursor:'pointer',background:'rgba(26,26,46,0.85)',animation:'btnPulse 3.5s ease-in-out infinite',transition:'all .3s'}}
          onClick={onEnter}
          onMouseEnter={e=>{e.currentTarget.style.background='rgba(22,33,62,0.95)';e.currentTarget.style.borderColor='#e8c97a';}}
          onMouseLeave={e=>{e.currentTarget.style.background='rgba(26,26,46,0.85)';e.currentTarget.style.borderColor='rgba(201,168,76,.55)';}}
        >
          <span style={{color:'rgba(201,168,76,.7)',fontSize:13}}>►</span>
          ABRIR EL GRIMORIO
          <span style={{color:'rgba(201,168,76,.7)',fontSize:13}}>◄</span>
        </div>
      </div>
    </div>
  );
}
