// THE FILM — Iced Aerocano spot. Every frame is a pure function of t, read from score.js.
(function () {
  const U = globalThis.U, G = globalThis.G, S = globalThis.SCORE, Studio = globalThis.Studio;
  const { BEAT, ev, clock, T } = S;
  const { clamp, lerp, ease, hash } = U;
  const W = G.W, H = G.H, SAFE = S.SAFE;
  const CX = SAFE.x + SAFE.w / 2 + 30; // optical centre, clear of the platform buttons on the right

  // palette: Starbucks greens + coffee
  const C = {
    deep: '#062A20', green: '#00704A', house: '#1E3932', light: '#D4E9E2', cream: '#F2F0EB',
    gold: '#CBA258', espresso: '#2A160C', coffee: '#5A3420', crema: '#C8955F', foam: '#E9D2B0', ice: 'rgba(225,244,255,0.5)',
  };

  let VO = null;
  const stripMarks = (s) => s.replace(/[ً-ْٰـ]/g, '');
  const beatPulse = (t) => Math.exp(-clock.phase(t) * 6); // 1 on every beat, decays
  const pop = (t, t0, d = 0.28) => (t < t0 ? 0 : ease.outBack(clamp((t - t0) / d), 2.4));
  const since = (t, t0) => t - t0;

  // ---------- text ----------
  const AR = 'Cairo', EN = '"Inter", system-ui, sans-serif';
  function ar(ctx, str, x, y, size, color, { weight = 900, stroke, strokeW = 14, align = 'center', alpha = 1, shadow } = {}) {
    ctx.save();
    ctx.globalAlpha *= alpha;
    ctx.font = `${weight} ${size}px ${AR}`;
    ctx.direction = 'rtl'; ctx.textAlign = align; ctx.textBaseline = 'middle';
    if (shadow) { ctx.fillStyle = shadow; for (let k = 1; k <= 8; k++) ctx.fillText(str, x + k * 1.2, y + k * 1.6); }
    if (stroke) { ctx.lineJoin = 'round'; ctx.strokeStyle = stroke; ctx.lineWidth = strokeW; ctx.strokeText(str, x, y); }
    ctx.fillStyle = color; ctx.fillText(str, x, y);
    ctx.restore();
  }
  function en(ctx, str, x, y, size, color, { weight = 800, spacing = 0, align = 'center', alpha = 1, stroke, strokeW = 3, fillOff } = {}) {
    ctx.save();
    ctx.globalAlpha *= alpha;
    ctx.font = `${weight} ${size}px ${EN}`;
    ctx.letterSpacing = `${spacing}px`;
    ctx.textAlign = align; ctx.textBaseline = 'middle';
    if (stroke) { ctx.lineJoin = 'round'; ctx.strokeStyle = stroke; ctx.lineWidth = strokeW; ctx.strokeText(str, x, y); }
    if (!fillOff) { ctx.fillStyle = color; ctx.fillText(str, x, y); }
    ctx.restore();
  }
  function pill(ctx, x, y, w, h, fill, alpha = 1) {
    ctx.save(); ctx.globalAlpha *= alpha; ctx.fillStyle = fill;
    ctx.beginPath(); ctx.roundRect(x - w / 2, y - h / 2, w, h, h / 2); ctx.fill(); ctx.restore();
  }
  const arWidth = (ctx, str, size, weight = 900) => { ctx.save(); ctx.font = `${weight} ${size}px ${AR}`; const w = ctx.measureText(str).width; ctx.restore(); return w; };

  // ---------- background ----------
  function bgGreen(ctx, t, k = 1) {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#0C3F31'); g.addColorStop(0.55, C.house); g.addColorStop(1, C.deep);
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    // soft moving light
    const lx = W * (0.5 + 0.3 * Math.sin(t * 0.6)), ly = H * (0.35 + 0.1 * Math.cos(t * 0.45));
    const rg = ctx.createRadialGradient(lx, ly, 0, lx, ly, W * 0.9);
    rg.addColorStop(0, `rgba(0,140,90,${0.35 * k})`); rg.addColorStop(1, 'rgba(0,140,90,0)');
    ctx.fillStyle = rg; ctx.fillRect(0, 0, W, H);
  }
  // giant outlined wordmark rows drifting sideways
  function bgType(ctx, t, alpha = 0.07) {
    G.decor(() => {
      ctx.save();
      ctx.font = `800 230px ${EN}`; ctx.textBaseline = 'middle'; ctx.lineWidth = 2.5;
      ctx.strokeStyle = `rgba(212,233,226,${alpha})`;
      const word = 'AEROCANO  ';
      const ww = ctx.measureText(word).width;
      for (let r = -1; r < 9; r++) {
        const dir = r % 2 ? 1 : -1;
        const off = ((t * 60 * dir) % ww + ww) % ww;
        const y = r * 240 + 60;
        for (let x = -ww * 2 + off; x < W + ww; x += ww) ctx.strokeText(word, x, y);
      }
      ctx.restore();
    });
  }
  // rising air bubbles (the "aero" in Aerocano)
  function bubbles(ctx, t, { n = 34, seed = 1, alpha = 0.45, speed = 1, region = [0, W] } = {}) {
    const pb = 1 + 0.25 * beatPulse(t);
    for (let i = 0; i < n; i++) {
      const r = (6 + hash(i, seed) * 22) * pb;
      const sp = (90 + hash(i, seed + 1) * 220) * speed;
      const x = lerp(region[0], region[1], hash(i, seed + 2)) + Math.sin(t * 1.3 + i) * 18;
      const y = H + 60 - (((t * sp + hash(i, seed + 3) * (H + 120)) % (H + 120)));
      ctx.save();
      ctx.globalAlpha = alpha * (0.5 + 0.5 * hash(i, seed + 4));
      ctx.strokeStyle = C.light; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.beginPath(); ctx.arc(x - r * 0.35, y - r * 0.35, r * 0.22, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }
  }
  function burst(ctx, t, t0, x, y, { n = 26, seed = 5, dist = 520, color = C.light } = {}) {
    const a = t - t0;
    if (a < 0 || a > 0.9) return;
    const k = ease.outCubic(clamp(a / 0.9));
    for (let i = 0; i < n; i++) {
      const ang = (i / n) * Math.PI * 2 + hash(i, seed) * 0.3;
      const d = dist * (0.5 + 0.5 * hash(i, seed + 1)) * k;
      const r = (8 + 16 * hash(i, seed + 2)) * (1 - k);
      ctx.save(); ctx.globalAlpha = 1 - k; ctx.strokeStyle = color; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(x + Math.cos(ang) * d, y + Math.sin(ang) * d, Math.max(0.5, r), 0, Math.PI * 2); ctx.stroke(); ctx.restore();
    }
  }
  function rays(ctx, t, x, y, { n = 20, c1 = C.green, c2 = '#0B5A40', alpha = 1, spin = 0.25 } = {}) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(t * spin); ctx.globalAlpha = alpha;
    const R = H * 1.4;
    for (let i = 0; i < n; i++) {
      const a0 = (i / n) * Math.PI * 2, a1 = ((i + 1) / n) * Math.PI * 2;
      ctx.fillStyle = i % 2 ? c1 : c2;
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a0) * R, Math.sin(a0) * R); ctx.lineTo(Math.cos(a1) * R, Math.sin(a1) * R); ctx.fill();
    }
    ctx.restore();
  }
  function starBadge(ctx, x, y, r, rot, fill) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.fillStyle = fill; ctx.beginPath();
    const n = 14;
    for (let i = 0; i < n * 2; i++) { const rr = i % 2 ? r * 0.84 : r; const a = (i / (n * 2)) * Math.PI * 2; ctx[i ? 'lineTo' : 'moveTo'](Math.cos(a) * rr, Math.sin(a) * rr); }
    ctx.closePath(); ctx.fill(); ctx.restore();
  }

  // ---------- the cup (side view) ----------
  // st: fill 0..1 (liquid level), foam 0..1, cubes [{x, y, rot, s}], cascade (seconds since pour), lid, straw, sticker
  function cup(ctx, cx, base, s, t, st = {}) {
    const h = 600 * s, tw = 215 * s, bw = 150 * s, top = base - h;
    const path = () => { ctx.beginPath(); ctx.moveTo(cx - tw, top); ctx.lineTo(cx + tw, top); ctx.lineTo(cx + bw, base); ctx.quadraticCurveTo(cx, base + 14 * s, cx - bw, base); ctx.closePath(); };
    // shadow
    ctx.save(); ctx.fillStyle = 'rgba(0,0,0,0.28)'; ctx.beginPath(); ctx.ellipse(cx, base + 22 * s, bw * 1.25, 22 * s, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    // body (glassy)
    ctx.save(); path(); ctx.fillStyle = 'rgba(255,255,255,0.10)'; ctx.fill(); ctx.clip();
    const fill = st.fill || 0;
    if (fill > 0) {
      const lt = base - fill * (h - 40 * s);
      const wob = (x) => Math.sin(x * 0.03 + t * 5) * 6 * s * (st.slosh ?? 1);
      const lg = ctx.createLinearGradient(0, lt, 0, base);
      lg.addColorStop(0, C.coffee); lg.addColorStop(1, C.espresso);
      ctx.fillStyle = lg; ctx.beginPath(); ctx.moveTo(cx - tw - 5, base + 20);
      for (let x = cx - tw - 5; x <= cx + tw + 5; x += 10) ctx.lineTo(x, lt + wob(x));
      ctx.lineTo(cx + tw + 5, base + 20); ctx.closePath(); ctx.fill();
      // cascade: creamy wisps tumbling down through the coffee
      if (st.cascade !== undefined && st.cascade >= 0) {
        for (let i = 0; i < 16; i++) {
          const x0 = cx + (hash(i, 31) - 0.5) * 2 * tw * 0.85;
          const life = 1.6 + hash(i, 32) * 1.2;
          const ph = ((st.cascade + hash(i, 33) * life) % life) / life;
          const y0 = lt + 40 * s + ph * (base - lt);
          ctx.save(); ctx.globalAlpha = 0.45 * Math.sin(Math.PI * ph) * clamp(st.cascade / 0.4);
          ctx.strokeStyle = C.foam; ctx.lineWidth = (6 + 10 * hash(i, 34)) * s; ctx.lineCap = 'round';
          ctx.beginPath(); ctx.moveTo(x0, y0 - 70 * s);
          ctx.bezierCurveTo(x0 + 20 * s, y0 - 40 * s, x0 - 20 * s, y0 - 20 * s, x0 + Math.sin(i + t * 2) * 12 * s, y0);
          ctx.stroke(); ctx.restore();
        }
      }
      // the aerated foam head
      const fh = (st.foam || 0) * 120 * s;
      if (fh > 1) {
        const fg = ctx.createLinearGradient(0, lt - 6, 0, lt + fh);
        fg.addColorStop(0, '#F4E4C8'); fg.addColorStop(0.6, C.foam); fg.addColorStop(1, C.crema);
        ctx.fillStyle = fg; ctx.beginPath(); ctx.moveTo(cx - tw - 5, lt + fh);
        for (let x = cx - tw - 5; x <= cx + tw + 5; x += 10) ctx.lineTo(x, lt + wob(x) - 4);
        ctx.lineTo(cx + tw + 5, lt + fh); ctx.closePath(); ctx.fill();
        for (let i = 0; i < 40; i++) { // micro-bubbles in the foam
          const bx = cx + (hash(i, 41) - 0.5) * 2 * tw, by = lt + hash(i, 42) * fh * 0.9 + 6;
          ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.beginPath(); ctx.arc(bx, by, (2 + hash(i, 43) * 5) * s, 0, Math.PI * 2); ctx.fill();
        }
      }
    }
    // ice cubes
    for (const c of st.cubes || []) {
      ctx.save(); ctx.translate(c.x, c.y); ctx.rotate(c.rot); const z = 62 * s * (c.s || 1);
      ctx.fillStyle = 'rgba(230,246,255,0.42)'; ctx.strokeStyle = 'rgba(255,255,255,0.85)'; ctx.lineWidth = 4 * s;
      ctx.beginPath(); ctx.roundRect(-z, -z, z * 2, z * 2, 18 * s); ctx.fill(); ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.beginPath(); ctx.roundRect(-z * 0.65, -z * 0.7, z * 0.5, z * 0.22, 6 * s); ctx.fill();
      ctx.restore();
    }
    // gloss
    ctx.fillStyle = 'rgba(255,255,255,0.16)';
    ctx.beginPath(); ctx.moveTo(cx - tw * 0.78, top + 20); ctx.lineTo(cx - tw * 0.58, top + 20); ctx.lineTo(cx - bw * 0.5, base - 30); ctx.lineTo(cx - bw * 0.72, base - 30); ctx.fill();
    ctx.restore();
    // outline + rim
    ctx.save(); path(); ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.lineWidth = 5 * s; ctx.stroke();
    ctx.beginPath(); ctx.ellipse(cx, top, tw, 16 * s, 0, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
    // sticker (a plain green roundel with the drink's initial — no trademark artwork)
    if (st.sticker) {
      const sy = top + h * 0.5, r = 66 * s;
      ctx.save(); ctx.fillStyle = C.green; ctx.beginPath(); ctx.arc(cx, sy, r, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = C.cream; ctx.lineWidth = 5 * s; ctx.beginPath(); ctx.arc(cx, sy, r - 10 * s, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
      en(ctx, 'A', cx, sy + 4 * s, 72 * s, C.cream, { weight: 800 });
    }
    // straw + lid
    if (st.straw) {
      ctx.save(); ctx.translate(cx + 95 * s, top - 30 * s); ctx.rotate(0.2); ctx.fillStyle = C.green;
      ctx.fillRect(-13 * s, -150 * s, 26 * s, 420 * s); ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.fillRect(-8 * s, -150 * s, 6 * s, 420 * s); ctx.restore();
    }
    if (st.lid) {
      ctx.save(); ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.strokeStyle = 'rgba(255,255,255,0.9)'; ctx.lineWidth = 4 * s;
      ctx.beginPath(); ctx.roundRect(cx - tw - 12 * s, top - 22 * s, (tw + 12 * s) * 2, 34 * s, 14 * s); ctx.fill(); ctx.stroke(); ctx.restore();
    }
  }

  // ---------- kinetic captions (the voiceover, word by word) ----------
  function captions(ctx, t, y = 1300) {
    if (!VO) return;
    const li = VO.lines.findIndex((l, i) => S.vo[i] && S.vo[i].caption !== false && !S.vo[i].big && t >= l.t - 0.05 && t < l.end + 0.35);
    if (li < 0) return;
    const l = VO.lines[li];
    const words = l.words.map((w) => ({ ...w, s: stripMarks(w.w) }));
    const size = 76, gap = 34, maxW = SAFE.w - 20;
    // lines in reading order
    const lines = [[]]; let lw = 0;
    for (const w of words) {
      w.width = arWidth(ctx, w.s, size);
      if (lw + w.width > maxW && lines[lines.length - 1].length) { lines.push([]); lw = 0; }
      lines[lines.length - 1].push(w); lw += w.width + gap;
    }
    const out = clamp((l.end + 0.35 - t) / 0.2);
    lines.forEach((ln, r) => {
      const total = ln.reduce((a, w) => a + w.width, 0) + gap * (ln.length - 1);
      let x = SAFE.x + SAFE.w / 2 + total / 2; // RTL: start at the right
      const yy = y + r * (size * 1.3);
      for (const w of ln) {
        const p = t < w.t - 0.04 ? 0 : ease.outCubic(clamp((t - w.t + 0.04) / 0.16));
        const cxw = x - w.width / 2;
        if (p > 0) {
          const active = t >= w.t - 0.04 && t < w.end + 0.05;
          ctx.save(); ctx.translate(cxw, yy); ctx.scale(p, p);
          if (active) pill(ctx, 0, 4, w.width + 30, size * 1.12, C.green, out);
          ar(ctx, w.s, 0, 0, size, active ? C.cream : '#FFFFFF', { stroke: active ? null : 'rgba(6,42,32,0.85)', strokeW: 12, alpha: out });
          ctx.restore();
        }
        x -= w.width + gap;
      }
    });
  }

  // ---------- scenes ----------
  function sceneHook(ctx, t) {
    bgGreen(ctx, t); bgType(ctx, t);
    bubbles(ctx, t, { n: 26, seed: 3 });
    if (t < ev.hook) return;
    const a = since(t, ev.hook);
    const y = 700;
    starBadge(ctx, CX, y, 300 * pop(t, ev.hook, 0.35), t * 0.4, C.gold);
    burst(ctx, t, ev.hook, CX, y, { n: 30 });
    const sc = a < 0.16 ? lerp(2.6, 1, ease.outCubic(a / 0.16)) : 1 + 0.04 * beatPulse(t);
    ctx.save(); ctx.translate(CX, y); ctx.rotate(-0.07); ctx.scale(sc, sc);
    en(ctx, 'NEW', 0, -165, 58, C.house, { spacing: 18, weight: 800 });
    ar(ctx, 'جديد!', 0, 10, 230, C.cream, { shadow: C.house, stroke: C.house, strokeW: 10 });
    ctx.restore();
    const p = pop(t, T(1), 0.35);
    if (p > 0) {
      ctx.save(); ctx.translate(CX, 1040 + (1 - p) * 60); ctx.scale(p, p);
      pill(ctx, 0, 0, 520, 116, C.green); ar(ctx, 'من ستاربكس', 0, 4, 66, C.cream);
      ctx.restore();
    }
  }

  function sceneFroth(ctx, t) {
    bgGreen(ctx, t); bgType(ctx, t, 0.05);
    const a = since(t, ev.froth), dur = T(4) - ev.froth;
    const prog = clamp(a / dur);
    const x = CX, y = 760, R = 330 * (1 + 0.03 * beatPulse(t)) * ease.outBack(clamp(a / 0.3), 1.6);
    // air streams spiralling in
    for (let i = 0; i < 10; i++) {
      const ph = ((a * 0.9 + i / 10) % 1);
      const ang = (i / 10) * Math.PI * 2 + a * 1.2;
      const r0 = R * (2.1 - 1.1 * ph);
      ctx.save(); ctx.globalAlpha = 0.6 * Math.sin(Math.PI * ph); ctx.strokeStyle = C.light; ctx.lineWidth = 6; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.arc(x, y, r0, ang, ang + 0.6); ctx.stroke(); ctx.restore();
    }
    // the cup from above
    ctx.save(); ctx.fillStyle = C.cream; ctx.beginPath(); ctx.arc(x, y, R + 26, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(x, y, R, 0, Math.PI * 2); ctx.clip();
    const base = ctx.createRadialGradient(x, y, 0, x, y, R);
    const mixc = (k) => `rgb(${Math.round(lerp(42, 200, k))},${Math.round(lerp(22, 149, k))},${Math.round(lerp(12, 95, k))})`;
    base.addColorStop(0, mixc(prog * 0.9)); base.addColorStop(1, mixc(prog * 0.55));
    ctx.fillStyle = base; ctx.fillRect(x - R, y - R, R * 2, R * 2);
    // swirling crema spiral
    ctx.translate(x, y); ctx.rotate(a * 3.2);
    for (let arm = 0; arm < 3; arm++) {
      ctx.strokeStyle = `rgba(244,228,200,${0.35 + 0.4 * prog})`; ctx.lineWidth = 18 - arm * 4; ctx.lineCap = 'round';
      ctx.beginPath();
      for (let k = 0; k <= 60; k++) { const th = k * 0.16 + arm * 2.09; const rr = 10 + k * 5.2; ctx[k ? 'lineTo' : 'moveTo'](Math.cos(th) * rr, Math.sin(th) * rr); }
      ctx.stroke();
    }
    ctx.restore();
    // micro-bubbles appear as air goes in
    const nb = Math.floor(80 * prog);
    for (let i = 0; i < nb; i++) {
      const ang = hash(i, 51) * Math.PI * 2 + a * (0.8 + hash(i, 52)), rr = Math.sqrt(hash(i, 53)) * (R - 20);
      ctx.save(); ctx.fillStyle = 'rgba(255,248,235,0.75)'; ctx.beginPath(); ctx.arc(x + Math.cos(ang) * rr, y + Math.sin(ang) * rr, 3 + 6 * hash(i, 54), 0, Math.PI * 2); ctx.fill(); ctx.restore();
    }
    // label + air meter
    en(ctx, 'AERATED ESPRESSO', CX, 300, 46, C.light, { spacing: 8 });
    const mw = 520; pill(ctx, CX, 1130, mw, 26, 'rgba(212,233,226,0.2)');
    ctx.save(); ctx.fillStyle = C.gold; ctx.beginPath(); ctx.roundRect(CX - mw / 2, 1117, mw * prog, 26, 13); ctx.fill(); ctx.restore();
    en(ctx, `AIR ${Math.round(prog * 100)}%`, CX, 1180, 34, C.light, { spacing: 4, weight: 700 });
  }

  const cubeLand = (i) => ({ x: CX + [-60, 70, -20, 40][i], y: 1150 - 90 - [0, 10, 120, 150][i], rot: [0.3, -0.2, 0.6, -0.5][i] });
  function cubesAt(t, s = 1) {
    const out = [];
    ev.ice.forEach((tl, i) => {
      const fall = 0.36, t0 = tl - fall;
      if (t < t0) return;
      const L = cubeLand(i);
      if (t < tl) { const u = (t - t0) / fall; out.push({ x: L.x, y: lerp(-120, L.y, ease.inQuad(u)), rot: L.rot + (1 - u) * 2, s }); return; }
      const b = Math.exp(-(t - tl) * 9) * Math.sin((t - tl) * 30) * 10;
      out.push({ x: L.x, y: L.y - Math.abs(b), rot: L.rot, s });
    });
    return out;
  }
  function sceneIce(ctx, t) {
    bgGreen(ctx, t); bgType(ctx, t, 0.05);
    bubbles(ctx, t, { n: 18, seed: 9, alpha: 0.3 });
    en(ctx, 'ON ICE', CX, 300, 54, C.light, { spacing: 14 });
    const base = 1150;
    const pourA = since(t, ev.pour);
    const fill = pourA < 0 ? 0 : ease.outCubic(clamp(pourA / 0.9)) * 0.86;
    const foam = pourA < 0 ? 0 : clamp((pourA - 0.3) / 1.0);
    // the pour stream
    if (pourA > -0.15 && pourA < 1.2) {
      const topY = 350, lt = base - fill * 560;
      const wv = 64 * clamp((pourA + 0.15) / 0.15) * clamp((1.2 - pourA) / 0.3);
      const sg = ctx.createLinearGradient(0, topY, 0, lt);
      sg.addColorStop(0, C.coffee); sg.addColorStop(0.5, C.crema); sg.addColorStop(1, C.foam);
      ctx.save(); ctx.fillStyle = sg; ctx.beginPath();
      const sx = CX + 20;
      for (let y = topY; y <= lt; y += 12) ctx.lineTo(sx - wv / 2 + Math.sin(y * 0.05 - t * 18) * 6, y);
      for (let y = lt; y >= topY; y -= 12) ctx.lineTo(sx + wv / 2 + Math.sin(y * 0.05 - t * 18 + 1) * 6, y);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = 'rgba(255,245,225,0.7)';
      for (let k = 0; k < 10; k++) { const yy = topY + ((t * 900 + k * 97) % Math.max(1, lt - topY)); ctx.beginPath(); ctx.arc(sx + (hash(k, 71) - 0.5) * wv * 0.6, yy, 3 + 3 * hash(k, 72), 0, Math.PI * 2); ctx.fill(); }
      // splash crown where the stream hits
      for (let k = 0; k < 7; k++) { const ang = -Math.PI + (k + 0.5) * Math.PI / 7; const d = 30 + 20 * Math.sin(t * 25 + k); ctx.beginPath(); ctx.arc(sx + Math.cos(ang) * d * 1.4, lt + Math.sin(ang) * d, 7, 0, Math.PI * 2); ctx.fillStyle = C.foam; ctx.fill(); }
      ctx.restore();
    }
    // a small bounce on every cube landing
    let kick = 0; for (const tl of ev.ice) if (t >= tl) kick = Math.max(kick, Math.exp(-(t - tl) * 10));
    ctx.save(); ctx.translate(CX, base); ctx.scale(1 + 0.03 * kick, 1 - 0.03 * kick); ctx.translate(-CX, -base);
    cup(ctx, CX, base, 1, t, { fill, foam, cubes: cubesAt(t), cascade: pourA >= 0 ? pourA : undefined, slosh: 1 + 2 * kick });
    ctx.restore();
    // splash droplets on each landing
    ev.ice.forEach((tl, i) => {
      const a = t - tl; if (a < 0 || a > 0.5) return;
      const L = cubeLand(i);
      for (let k = 0; k < 8; k++) {
        const ang = -Math.PI / 2 + (k - 3.5) * 0.28, d = 140 * ease.outCubic(a / 0.5);
        ctx.save(); ctx.globalAlpha = 1 - a / 0.5; ctx.fillStyle = C.light;
        ctx.beginPath(); ctx.arc(L.x + Math.cos(ang) * d, L.y - 40 + Math.sin(ang) * d + 300 * a * a, 7, 0, Math.PI * 2); ctx.fill(); ctx.restore();
      }
    });
  }
  const fullCup = (t) => ({ fill: 0.86, foam: 1, cubes: cubesAt(1e9), cascade: since(t, ev.pour) });

  function sceneBuild(ctx, t) {
    const tf = Math.min(t, ev.breath); // freeze on the breath
    bgGreen(ctx, tf, 0.6);
    rays(ctx, tf, CX, 820, { c1: '#0B4A38', c2: '#08392B', spin: 0.6 });
    const a = since(tf, T(6)), zoom = 1 + 0.18 * ease.inQuad(clamp(a / (ev.breath - T(6))));
    const shake = 6 * clamp(a / 1.2);
    ctx.save();
    ctx.translate(CX + U.noise1(tf * 40, 1) * shake, 860 + U.noise1(tf * 40, 2) * shake); ctx.scale(zoom, zoom); ctx.translate(-CX, -860);
    cup(ctx, CX, 1150, 1, tf, fullCup(tf));
    ctx.restore();
    ev.count.forEach((tc, i) => {
      if (tf < tc || (i < 2 && tf >= ev.count[i + 1])) return;
      const p = since(tf, tc);
      const sc = lerp(1.8, 1, ease.outCubic(clamp(p / 0.14)));
      ctx.save(); ctx.translate(CX, 420); ctx.scale(sc, sc);
      en(ctx, String(3 - i), 0, 0, 420, C.cream, { weight: 800, stroke: C.house, strokeW: 16 });
      ctx.restore();
      ctx.save(); ctx.globalAlpha = 1 - clamp(p / 0.45); ctx.strokeStyle = C.gold; ctx.lineWidth = 10;
      ctx.beginPath(); ctx.arc(CX, 420, 200 + 300 * clamp(p / 0.45), 0, Math.PI * 2); ctx.stroke(); ctx.restore();
    });
    if (t >= ev.breath) { ctx.fillStyle = 'rgba(2,14,10,0.6)'; ctx.fillRect(0, 0, W, H); }
  }

  function marquee(ctx, t, y, rot, fill, color) {
    ctx.save(); ctx.translate(W / 2, y); ctx.rotate(rot);
    ctx.fillStyle = fill; ctx.fillRect(-W, -54, W * 2, 108);
    G.decor(() => {
      const unit = 'ICED AEROCANO  ✦  ';
      ctx.font = `800 56px ${EN}`; ctx.textBaseline = 'middle'; ctx.fillStyle = color;
      const uw = ctx.measureText(unit).width;
      const off = -((t * 220) % uw);
      for (let x = -W + off; x < W; x += uw) ctx.fillText(unit, x, 3);
    });
    ctx.restore();
  }
  function sceneDrop(ctx, t) {
    const a = since(t, ev.drop);
    ctx.fillStyle = C.house; ctx.fillRect(0, 0, W, H);
    rays(ctx, t, CX, 1000, { alpha: 0.85 + 0.15 * beatPulse(t) });
    bubbles(ctx, t, { n: 40, seed: 12, alpha: 0.5, speed: 1.6 });
    burst(ctx, t, ev.drop, CX, 900, { n: 40, dist: 800, color: C.cream });
    marquee(ctx, t, 1060, -0.12, C.gold, C.house);
    marquee(ctx, -t, 1160, 0.1, C.cream, C.green);
    // hero cup, bouncing on the beat
    const sq = beatPulse(t);
    const rise = ease.outBack(clamp(a / 0.45), 1.8);
    ctx.save(); ctx.translate(CX, 1230); ctx.scale(1 + 0.04 * sq, 1 - 0.05 * sq); ctx.rotate(Math.sin(t * 2) * 0.03); ctx.translate(-CX, -1230);
    ctx.translate(0, (1 - rise) * 500);
    cup(ctx, CX, 1230, 0.95, t, { ...fullCup(t), cubes: cubesAt(1e9, 0.95).map((c) => ({ ...c, x: CX + (c.x - CX) * 0.95, y: 1230 - (1150 - c.y) * 0.95 })), lid: true, straw: true, sticker: true });
    ctx.restore();
    // the wordmark slam
    const sc = a < 0.14 ? lerp(3, 1, ease.outCubic(a / 0.14)) : 1 + 0.03 * sq;
    ctx.save(); ctx.translate(CX, 420); ctx.rotate(-0.05); ctx.scale(sc, sc);
    pill(ctx, 0, -130, 200, 70, C.gold); en(ctx, 'ICED', 0, -128, 44, C.house, { spacing: 10 });
    for (let k = 8; k >= 1; k--) en(ctx, 'AEROCANO', k * 1.5, k * 2, 150, C.deep, { weight: 800, spacing: -2 });
    en(ctx, 'AEROCANO', 0, 0, 150, C.cream, { weight: 800, spacing: -2 });
    ar(ctx, 'إيروكانو', 0, 120, 90, C.gold, { stroke: C.deep, strokeW: 10 });
    ctx.restore();
    // feature chips, one per beat
    const spots = [[CX - 270, 760], [CX + 250, 860], [CX - 280, 1310], [CX + 260, 1400]];
    ev.chips.forEach((tc, i) => {
      const p = pop(t, tc, 0.3); if (p <= 0) return;
      const [x, y] = spots[i];
      ctx.save(); ctx.translate(x, y); ctx.rotate((i % 2 ? 0.08 : -0.08) + 0.05 * Math.sin(t * 3 + i)); ctx.scale(p, p);
      pill(ctx, 0, 0, arWidth(ctx, S.chipText[i], 64) + 70, 104, i % 2 ? C.cream : C.green);
      ar(ctx, S.chipText[i], 0, 4, 64, i % 2 ? C.green : C.cream);
      ctx.restore();
    });
  }

  function sceneEnd(ctx, t) {
    const a = since(t, ev.end);
    ctx.fillStyle = C.cream; ctx.fillRect(0, 0, W, H);
    // a soft green disc behind the cup
    const d = ease.outBack(clamp(a / 0.5), 1.4);
    ctx.save(); ctx.fillStyle = C.light; ctx.beginPath(); ctx.arc(CX, 900, 400 * d, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    bubbles(ctx, t, { n: 16, seed: 21, alpha: 0.5 });
    const pc = ease.outBack(clamp(a / 0.45), 1.6);
    ctx.save(); ctx.translate(0, (1 - pc) * 300);
    cup(ctx, CX, 1150, 0.8, t, { ...fullCup(t), cubes: cubesAt(1e9, 0.8).map((c) => ({ ...c, x: CX + (c.x - CX) * 0.8, y: 1150 - (1150 - c.y) * 0.8 })), lid: true, straw: true, sticker: true });
    ctx.restore();
    const p1 = pop(t, ev.end, 0.35);
    ctx.save(); ctx.translate(CX, 330); ctx.scale(p1, p1); en(ctx, 'STARBUCKS', 0, 0, 78, C.green, { spacing: 12 }); ctx.restore();
    const p2 = pop(t, T(10, 1), 0.35);
    ctx.save(); ctx.translate(CX, 1250); ctx.scale(p2, p2); en(ctx, 'Iced Aerocano', 0, 0, 96, C.house, { spacing: -1 }); ctx.restore();
    const p3 = pop(t, T(10, 3), 0.4);
    ctx.save(); ctx.translate(CX, 1385); ctx.scale(p3, p3); ctx.rotate(-0.03);
    pill(ctx, 0, 0, 560, 120, C.green); ar(ctx, 'جرّبه النهارده!', 0, 4, 68, C.cream); ctx.restore();
  }

  Studio.film({
    async init() {
      await Studio.loadFont('Cairo', 'assets/fonts/Cairo.ttf', '200 1000');
      G.SCRIPT_FONTS.arabic = 'Cairo';
      VO = await Studio.loadJSON('out/voice.json');
    },
    draw(ctx, t) {
      if (t < 0.12) { ctx.fillStyle = C.deep; ctx.fillRect(0, 0, W, H); return; }
      const hits = [[ev.hook, 22], [ev.froth, 8], ...ev.ice.map((x) => [x, 7]), [ev.drop, 30], [ev.end, 10]];
      let shake = 0; for (const [t0, amp] of hits) if (t >= t0) shake = Math.max(shake, amp * Math.exp(-(t - t0) * 7));
      ctx.save();
      ctx.translate(U.noise1(t * 30, 1) * shake, U.noise1(t * 30, 2) * shake);
      if (t < ev.froth) sceneHook(ctx, t);
      else if (t < ev.ice[0] - 0.42) sceneFroth(ctx, t);
      else if (t < T(6)) sceneIce(ctx, t);
      else if (t < ev.drop) sceneBuild(ctx, t);
      else if (t < ev.end) sceneDrop(ctx, t);
      else sceneEnd(ctx, t);
      ctx.restore();
      if (t < ev.end) captions(ctx, t);
      // flashes on the big hits
      const fl = [[ev.hook, 0.7], [ev.froth, 0.35], [ev.drop, 0.9], [ev.end, 0.5]];
      for (const [t0, k] of fl) { const f = t >= t0 ? k * Math.exp(-(t - t0) * 14) : 0; if (f > 0.01) { ctx.fillStyle = `rgba(255,252,240,${f})`; ctx.fillRect(0, 0, W, H); } }
    },
    post: { paper: 0, vignette: 0.25, grain: 0.03 },
    fadeOut: 0.6,
  });
})();
