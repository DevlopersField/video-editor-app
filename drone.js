/*
  Reel Studio drone tools (load after video.html's main script).
  1. Drone 3D: turns any photo into an aerial-style shot. The photo is treated as the ground;
     the camera tilts, rises and orbits over it, with an optional drone screen overlay.
     Settings live on the clip as clip.d3 = { on, pitch0, pitch1, alt0, alt1, orbit, zoom, hud, label }.
  2. AI bird's-eye view: sends one photo to Google Gemini or OpenAI with your own API key and adds
     the generated image as a new clip, tagged "AI visualisation" by default.
     Keys stay in this browser only (localStorage) and go straight to the provider you pick.
*/
(function(){
  "use strict";
  if (typeof drawClip !== "function" || typeof renderInspector !== "function") return;

  /* ---------------- drone 3D renderer ---------------- */
  const D3_DEF = { on:true, pitch0:42, pitch1:70, alt0:50, alt1:110, orbit:18, zoom:1.15, hud:true, label:"" };
  const d3 = clip => ({ ...D3_DEF, ...(clip.d3 || {}) });
  const GROUND = document.createElement("canvas");
  const lerp = (a, b, t) => a + (b - a) * t;
  const easeIO = p => p < .5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;

  /* square ground texture: the photo, rotated (orbit) and scaled, then laid flat */
  function plotCentre(clip){
    const pl = (clip.plots || []).find(q => q.pts && q.pts.length >= 3); if (!pl) return null;
    const us = pl.pts.map(q => q[0]), vs = pl.pts.map(q => q[1]);
    return { pl, u:us.reduce((a, b) => a + b, 0) / us.length, v:vs.reduce((a, b) => a + b, 0) / vs.length, w:Math.max(...us) - Math.min(...us), h:Math.max(...vs) - Math.min(...vs) };
  }
  function groundTexture(img, rot, zoom, S, clip, local){
    if (GROUND.width !== S){ GROUND.width = S; GROUND.height = S; }
    const g = GROUND.getContext("2d"), iw = img.naturalWidth || img.width, ih = img.naturalHeight || img.height;
    g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = "#1b1d21"; g.fillRect(0, 0, S, S);
    const k = Math.max(S / iw, S / ih) * zoom * 1.45; /* oversize so rotation never shows corners */
    const pc = clip && plotCentre(clip), ox = pc ? (.5 - pc.u) * iw * k : 0, oy = pc ? (.5 - pc.v) * ih * k : 0; /* the plot is the centre of the flight */
    g.translate(S / 2, S / 2); g.rotate(rot); g.translate(ox, oy); g.drawImage(img, -iw * k / 2, -ih * k / 2, iw * k, ih * k);
    if (pc){ /* plot outline painted on the ground so it stays glued to the land in 3D */
      const col = (typeof PLOT_COLORS === "object" && PLOT_COLORS[pc.pl.color] ? PLOT_COLORS[pc.pl.color][0] : "#E63B2E");
      const tt = local == null ? 99 : local, at = pc.pl.at || 0, draw = clamp((tt - at) / 1.2), pts = pc.pl.pts.map(([a, b]) => [(a - .5) * iw * k, (b - .5) * ih * k]);
      if (draw > 0){
        /* fill fades in after the line, then breathes */
        const fillA = clamp((tt - at - 1) / .6) * (.22 + .1 * Math.sin((tt - at) * 3));
        if (fillA > 0){ g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath(); g.globalAlpha = fillA; g.fillStyle = col; g.fill(); g.globalAlpha = 1; }
        /* outline draws itself around the plot */
        const segs = pts.map((p, i) => [p, pts[(i + 1) % pts.length]]), lens = segs.map(([a, b]) => Math.hypot(b[0] - a[0], b[1] - a[1])), total = lens.reduce((a, b) => a + b, 0);
        let left = total * easeIO(draw); g.beginPath(); g.moveTo(pts[0][0], pts[0][1]);
        for (let i = 0; i < segs.length && left > 0; i++){ const [a, b] = segs[i], f = Math.min(1, left / lens[i]); g.lineTo(a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f); left -= lens[i]; }
        g.lineJoin = "round"; g.lineCap = "round"; g.shadowColor = col; g.shadowBlur = S / 60; g.lineWidth = Math.max(6, S / 150); g.strokeStyle = col; g.stroke(); g.shadowBlur = 0;
        g.lineWidth = Math.max(2, S / 520); g.strokeStyle = "rgba(255,255,255,.85)"; g.stroke();
        if (draw >= 1) pts.forEach(([x, y]) => { g.beginPath(); g.arc(x, y, S / 160, 0, Math.PI * 2); g.fillStyle = "#fff"; g.fill(); });
      }
    }
    g.setTransform(1, 0, 0, 1, 0, 0);
    return GROUND;
  }
  /* real camera geometry: camera at height h looking down at `pitch` degrees below the horizon.
     Each screen row is a ray; where it hits the ground gives that row's distance and width.
     The ground texture covers G x G units around the point the centre ray looks at. */
  const VFOV = 58 * Math.PI / 180, G_REF = 60;
  const SOFT = document.createElement("canvas"); SOFT.width = SOFT.height = 24;
  function drawGround(c, src, W, H, pitchDeg, alt, altMax){
    const S = src.width, th = clamp(pitchDeg, 20, 90) * Math.PI / 180, h = Math.max(8, alt);
    const tanH = Math.tan(VFOV / 2) * (W / H), G = 2 * Math.max(G_REF * .5, altMax || alt) * tanH / .82; /* at the highest point the photo nearly fills the view */
    const d0 = th >= Math.PI / 2 - 1e-3 ? 0 : h / Math.tan(th);
    const step = Math.max(2, Math.round(H / 420));
    const sky = c.createLinearGradient(0, 0, 0, H * .5); sky.addColorStop(0, "#C9D6E2"); sky.addColorStop(1, "#E4E9EE");
    /* soft, blurred ground colour behind everything, so no hard gaps show near the frame edges */
    const sc2 = SOFT.getContext("2d"); sc2.drawImage(src, 0, 0, 24, 24); c.save(); c.imageSmoothingQuality = "high"; c.drawImage(SOFT, 1, 1, 22, 22, 0, 0, W, H); c.restore();
    const top0 = th - VFOV / 2; if (top0 < .05){ c.fillStyle = sky; c.fillRect(0, 0, W, H * clamp((.05 - top0) / VFOV + .02, 0, .5)); }
    for (let y = 0; y < H; y += step){
      const phi = th + ((y + step / 2) / H - .5) * VFOV;           /* angle of this row's ray below the horizon */
      if (phi <= .02) continue;                                     /* above the horizon: sky */
      const dist = h / Math.tan(phi), slant = h / Math.sin(phi), halfW = slant * tanH;
      const phi2 = th + ((y + step) / H - .5) * VFOV, dist2 = phi2 > .02 ? h / Math.tan(phi2) : dist;
      const ty0 = .5 - (dist - d0) / G, ty1 = .5 - (dist2 - d0) / G, tx0 = .5 - halfW / G, tx1 = .5 + halfW / G;
      if (ty0 < -.02 && ty1 < -.02 || ty0 > 1.02 && ty1 > 1.02) continue;
      const sx0 = Math.max(0, tx0), sx1 = Math.min(1, tx1); if (sx1 <= sx0) continue;
      const dx0 = (sx0 - tx0) / (tx1 - tx0) * W, dx1 = (sx1 - tx0) / (tx1 - tx0) * W;
      const sy = clamp(Math.min(ty0, ty1), 0, 1) * S, sh = Math.max(1, Math.abs(ty1 - ty0) * S);
      c.drawImage(src, sx0 * S, Math.min(sy, S - 1), (sx1 - sx0) * S, Math.min(sh, S - sy), dx0, y, dx1 - dx0, step + .6);
    }
    /* atmospheric haze toward the horizon sells the height */
    const top = th - VFOV / 2;
    if (top < .6){ const k = clamp((.6 - top) / .6), g2 = c.createLinearGradient(0, 0, 0, H * .55); g2.addColorStop(0, `rgba(214,224,234,${(.85 * k).toFixed(3)})`); g2.addColorStop(1, "rgba(214,224,234,0)"); c.fillStyle = g2; c.fillRect(0, 0, W, H * .55); }
  }
  function drawHud(c, W, H, u, alt, heading, t, label){
    c.save(); c.strokeStyle = "rgba(255,255,255,.9)"; c.fillStyle = "rgba(255,255,255,.95)"; c.lineWidth = 3 * u;
    const m = 60 * u, L = 70 * u;
    [[m, m, 1, 1], [W - m, m, -1, 1], [m, H - m, 1, -1], [W - m, H - m, -1, -1]].forEach(([x, y, sx, sy]) => { c.beginPath(); c.moveTo(x, y + sy * L); c.lineTo(x, y); c.lineTo(x + sx * L, y); c.stroke(); });
    c.beginPath(); c.moveTo(W / 2 - 24 * u, H / 2); c.lineTo(W / 2 + 24 * u, H / 2); c.moveTo(W / 2, H / 2 - 24 * u); c.lineTo(W / 2, H / 2 + 24 * u); c.stroke();
    c.font = `700 ${30 * u}px ${typeof SANS === "string" ? SANS : "sans-serif"}`; c.textBaseline = "middle";
    if (Math.floor(t * 2) % 2 === 0){ c.fillStyle = "#E63B2E"; c.beginPath(); c.arc(m + 20 * u, m + 110 * u, 10 * u, 0, Math.PI * 2); c.fill(); }
    c.fillStyle = "rgba(255,255,255,.95)"; c.textAlign = "left"; c.fillText("REC", m + 40 * u, m + 110 * u);
    c.textAlign = "right"; c.fillText(`ALT ${Math.round(alt)} FT`, W - m, m + 110 * u);
    const hd = ((Math.round(heading) % 360) + 360) % 360, dir = ["N","NE","E","SE","S","SW","W","NW"][Math.round(hd / 45) % 8];
    c.fillText(`${dir} ${String(hd).padStart(3, "0")}°`, W - m, m + 155 * u);
    if (label){ c.textAlign = "left"; c.fillText(label.toUpperCase(), m, H - m - 110 * u); }
    c.restore(); c.textAlign = "left";
  }
  function drawDrone3D(c, clip, local){
    const { W, H, u } = geo(), s = d3(clip), img = clip.el; if (!img || !img.naturalWidth) return false;
    const p = clip.dur ? clamp(local / clip.dur) : 0, e = easeIO(p);
    const pitch = lerp(s.pitch0, s.pitch1, e), alt = lerp(s.alt0, s.alt1, e), rot = (s.orbit * (e - .5)) * Math.PI / 180;
    const S = exporting ? 1600 : 1100;
    c.fillStyle = "#1b1d21"; c.fillRect(0, 0, W, H);
    drawGround(c, groundTexture(img, rot, s.zoom, S, clip, local), W, H, pitch, alt, Math.max(s.alt0, s.alt1));
    /* cinematic vignette */
    const vg = c.createRadialGradient(W / 2, H / 2, Math.min(W, H) * .35, W / 2, H / 2, Math.max(W, H) * .75); vg.addColorStop(0, "rgba(0,0,0,0)"); vg.addColorStop(1, "rgba(0,0,0,.38)"); c.fillStyle = vg; c.fillRect(0, 0, W, H);
    /* plot centre is the centre of the flight, so its badge sits at the screen centre */
    const pc2 = plotCentre(clip);
    if (pc2){
      const tt = local - (pc2.pl.at || 0) - 1.1, a = clamp(tt / .5);
      if (a > 0){
        const area = typeof plotArea === "function" ? plotArea(pc2.pl) : "";
        /* location pin dropping onto the plot */
        const py = H / 2 - (1 - easeIO(a)) * 80 * u; c.save(); c.globalAlpha = a; c.fillStyle = (typeof PLOT_COLORS === "object" && PLOT_COLORS[pc2.pl.color] ? PLOT_COLORS[pc2.pl.color][0] : "#E63B2E");
        c.shadowColor = "rgba(0,0,0,.45)"; c.shadowBlur = 16 * u; c.beginPath(); c.arc(W / 2, py - 70 * u, 30 * u, Math.PI, 0); c.lineTo(W / 2, py - 18 * u); c.closePath(); c.fill();
        c.shadowBlur = 0; c.fillStyle = "#fff"; c.beginPath(); c.arc(W / 2, py - 72 * u, 11 * u, 0, Math.PI * 2); c.fill(); c.restore();
        if (area && typeof bigLabel === "function") bigLabel(c, area, W / 2, H / 2 + 70 * u, u, 60 * u * (pc2.pl.labelSize || 1), a, .8 + .2 * a, pc2.pl.labelColor === "custom" && pc2.pl.labelHex ? pc2.pl.labelHex : "#E63B2E", pc2.pl.labelStyle || "pill", pc2.pl.labelFont || "bold", pc2.pl.labelText);
        if (pc2.pl.name && typeof labelPill === "function") labelPill(c, pc2.pl.name.toUpperCase(), W / 2, H / 2 + 150 * u, u, a, 1, "rgba(28,33,40,.88)", "#fff");
      }
    }
    if (typeof lookAfter === "function") try { lookAfter(c, clip.look); } catch(err) {}
    if (s.hud) drawHud(c, W, H, u, alt, 90 + s.orbit * (e - .5), local, s.label);
    return true;
  }
  const _drawClip = drawClip;
  drawClip = function(c, clip, local){
    if (clip && clip.kind === "image" && clip.d3 && clip.d3.on && (!clip.frame || clip.frame === "full")){
      try { if (drawDrone3D(c, clip, local)){ if (clip.aiTag) aiTag(c); return; } } catch(err){ console.warn("drone 3D", err); }
    }
    _drawClip(c, clip, local);
    if (clip && clip.aiTag) aiTag(c);
  };
  function aiTag(c){
    const { W, u } = geo(); c.save(); c.font = `700 ${22 * u}px ${typeof SANS === "string" ? SANS : "sans-serif"}`;
    const t = "AI visualisation", w = c.measureText(t).width + 28 * u, h = 40 * u, x = W - w - 28 * u, y = 28 * u;
    c.fillStyle = "rgba(0,0,0,.55)"; c.beginPath(); c.roundRect(x, y, w, h, h / 2); c.fill();
    c.fillStyle = "#fff"; c.textBaseline = "middle"; c.fillText(t, x + 14 * u, y + h / 2 + u); c.restore();
  }

  /* ---------------- realistic camera moves ----------------
     Gimbal-style S-curve easing plus a tiny, slow drift (layered sines) so moves feel shot, not computed.
     "plot-focus" starts wide and glides in until the highlighted plot is the centre of the frame. */
  const drift = (t, seed) => Math.sin(t * 1.3 + seed) * .55 + Math.sin(t * 2.7 + seed * 2.1) * .3 + Math.sin(t * 4.9 + seed * 3.7) * .15;
  const smooth = p => { p = clamp(p); return p * p * p * (p * (p * 6 - 15) + 10); };
  let camClip = null;
  const _motionOf = motionOf;
  motionOf = function(clip){ camClip = clip; return _motionOf(clip); };
  const REAL = {
    "real-push":   (p, t) => [1.04 + .16 * smooth(p), .5, .5, 0],
    "real-pull":   (p, t) => [1.2 - .16 * smooth(p), .5, .5, 0],
    "real-left":   (p, t) => [1.16 + .03 * smooth(p), .78 - .56 * smooth(p), .5, -.004 + .008 * smooth(p)],
    "real-right":  (p, t) => [1.16 + .03 * smooth(p), .22 + .56 * smooth(p), .5, .004 - .008 * smooth(p)],
    "real-crane":  (p, t) => [1.22 - .08 * smooth(p), .5, .78 - .5 * smooth(p), 0],
    "real-orbit":  (p, t) => [1.3, .32 + .36 * smooth(p), .5, (-.03 + .06 * smooth(p))],
    "real-hand":   (p, t) => [1.1, .5, .5, 0],
    "plot-focus":  null
  };
  const _motionParams = motionParams;
  motionParams = function(m, p){
    const clip = camClip, t = (clip && clip.dur ? p * clip.dur : p * 4);
    let out;
    if (m === "plot-focus"){
      const pc = clip && plotCentre(clip);
      if (!pc) out = REAL["real-push"](p, t);
      else {
        const { W, H } = geo(), iw = clip.el.naturalWidth || 1, ih = clip.el.naturalHeight || 1, base = Math.max(W / iw, H / ih);
        const target = clamp(.55 / Math.max(pc.w * iw * base / W, pc.h * ih * base / H, .05), 1.05, 2.6); /* plot fills about half the frame */
        const e = smooth(clamp(p / .7)), sc = 1.02 + (target - 1.02) * e, dw = iw * base * sc, dh = ih * base * sc;
        const fxT = Math.abs(W - dw) > 1 ? clamp((W / 2 - pc.u * dw) / (W - dw)) : .5, fyT = Math.abs(H - dh) > 1 ? clamp((H / 2 - pc.v * dh) / (H - dh)) : .5;
        out = [sc, .5 + (fxT - .5) * e, .5 + (fyT - .5) * e, .012 * Math.sin(p * Math.PI) ];
      }
    } else if (REAL[m]) out = REAL[m](p, t);
    else return _motionParams(m, p);
    /* gimbal micro drift: small enough to stay inside the oversized frame */
    const k = m === "real-hand" ? 1 : .35;
    out[1] = clamp(out[1] + drift(t, 1.7) * .012 * k); out[2] = clamp(out[2] + drift(t, 4.2) * .012 * k); out[3] += drift(t, 7.1) * .0035 * k;
    if (out[0] < 1.06) out[0] = 1.06;
    return out;
  };
  if (Array.isArray(MOTIONS) && !MOTIONS.some(x => x[0] === "real-push")){
    MOTIONS.splice(1, 0, ["plot-focus","Focus on plot"], ["real-push","Smooth push in"], ["real-pull","Smooth pull out"], ["real-left","Slide left"], ["real-right","Slide right"], ["real-crane","Crane up"], ["real-orbit","Orbit"], ["real-hand","Handheld"]);
  }

  /* ---------------- straighten to top view (local, no AI) ----------------
     Uses 4 corners of flat ground (the plot highlight) and a homography to look straight down on it.
     Every output pixel is sampled from the original with bilinear filtering, so the ground stays sharp. */
  function solve8(A, b){ /* Gaussian elimination with partial pivoting */
    const n = 8, M = A.map((r, i) => [...r, b[i]]);
    for (let c2 = 0; c2 < n; c2++){ let m = c2; for (let r = c2 + 1; r < n; r++) if (Math.abs(M[r][c2]) > Math.abs(M[m][c2])) m = r; [M[c2], M[m]] = [M[m], M[c2]];
      const pv = M[c2][c2]; if (Math.abs(pv) < 1e-12) throw new Error("Those corners are in a line. Mark 4 corners that form a shape.");
      for (let r = 0; r < n; r++){ if (r === c2) continue; const f = M[r][c2] / pv; for (let k = c2; k <= n; k++) M[r][k] -= f * M[c2][k]; } }
    return M.map((r, i) => r[n] / r[i]);
  }
  function homography(from, to){ /* maps from[i] -> to[i] */
    const A = [], b = [];
    for (let i = 0; i < 4; i++){ const [x, y] = from[i], [u, v] = to[i];
      A.push([x, y, 1, 0, 0, 0, -u * x, -u * y]); b.push(u); A.push([0, 0, 0, x, y, 1, -v * x, -v * y]); b.push(v); }
    const h = solve8(A, b); return [...h, 1];
  }
  const dist2 = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
  function orderCorners(pts){ /* clockwise from the top-left corner */
    const c = pts.reduce((s2, p) => [s2[0] + p[0] / 4, s2[1] + p[1] / 4], [0, 0]);
    const cw = [...pts].sort((a, b) => Math.atan2(a[1] - c[1], a[0] - c[0]) - Math.atan2(b[1] - c[1], b[0] - c[0]));
    const k = cw.reduce((bi, p, i) => (p[0] + p[1] < cw[bi][0] + cw[bi][1] ? i : bi), 0);
    return [0, 1, 2, 3].map(i => cw[(k + i) % 4]);
  }
  async function makeTopView(clip, ratio, margin){
    const pl = (clip.plots || []).find(q => q.pts && q.pts.length === 4);
    if (!pl) throw new Error("Mark the 4 corners of flat ground first (Add plot highlight with exactly 4 corners).");
    const img = clip.el, iw = img.naturalWidth, ih = img.naturalHeight;
    const srcPts = orderCorners(pl.pts.map(([u, v]) => [u * iw, v * ih]));
    const topLen = (dist2(srcPts[0], srcPts[1]) + dist2(srcPts[3], srcPts[2])) / 2, sideLen = (dist2(srcPts[0], srcPts[3]) + dist2(srcPts[1], srcPts[2])) / 2;
    const r = ratio > 0 ? ratio : topLen / Math.max(1, sideLen);                 /* width / length of the real plot */
    let rw = Math.max(topLen, sideLen * r), rh = rw / r;                           /* keep the sharpest edge's detail */
    const m = margin ?? .9, MAX = 2600, MIN = 2000, big = Math.max(rw * (1 + 2 * m), rh * (1 + 2 * m)), k = big > MAX ? MAX / big : big < MIN ? MIN / big : 1; rw *= k; rh *= k; /* at least full-HD sharp */
    const ow = Math.round(rw * (1 + 2 * m)), oh = Math.round(rh * (1 + 2 * m)), ox = rw * m, oy = rh * m;
    const Hm = homography([[ox, oy], [ox + rw, oy], [ox + rw, oy + rh], [ox, oy + rh]], srcPts); /* output -> source */
    const sc = document.createElement("canvas"); sc.width = iw; sc.height = ih; const sx = sc.getContext("2d", { willReadFrequently:true }); sx.drawImage(img, 0, 0);
    const sd = sx.getImageData(0, 0, iw, ih).data, oc = document.createElement("canvas"); oc.width = ow; oc.height = oh;
    const ox2 = oc.getContext("2d"), od = ox2.createImageData(ow, oh), o = od.data;
    for (let y = 0; y < oh; y++){
      if (y % 64 === 0) await new Promise(r2 => setTimeout(r2, 0));             /* keep the page responsive */
      for (let x = 0; x < ow; x++){
        const w = Hm[6] * x + Hm[7] * y + 1; if (w <= 1e-6) continue;
        const u = (Hm[0] * x + Hm[1] * y + Hm[2]) / w, v = (Hm[3] * x + Hm[4] * y + Hm[5]) / w;
        if (u < 0 || v < 0 || u >= iw - 1 || v >= ih - 1) continue;
        const x0 = u | 0, y0 = v | 0, fx = u - x0, fy = v - y0, i00 = (y0 * iw + x0) * 4, i10 = i00 + 4, i01 = i00 + iw * 4, i11 = i01 + 4, j = (y * ow + x) * 4;
        for (let ch = 0; ch < 3; ch++) o[j + ch] = (sd[i00 + ch] * (1 - fx) + sd[i10 + ch] * fx) * (1 - fy) + (sd[i01 + ch] * (1 - fx) + sd[i11 + ch] * fx) * fy;
        o[j + 3] = 255;
      }
    }
    ox2.putImageData(od, 0, 0);
    /* fill the empty corners with a soft, blurred version so the frame never shows black wedges */
    const fin = document.createElement("canvas"); fin.width = ow; fin.height = oh; const fx2 = fin.getContext("2d");
    fx2.filter = "blur(40px) saturate(.9)"; fx2.drawImage(oc, -60, -60, ow + 120, oh + 120); fx2.filter = "none"; fx2.drawImage(oc, 0, 0);
    const blob = await new Promise(r2 => fin.toBlob(r2, "image/jpeg", .94));
    const el2 = await loadImage(new File([blob], "top-view.jpg", { type:"image/jpeg" }));
    const rect = [[ox / ow, oy / oh], [(ox + rw) / ow, oy / oh], [(ox + rw) / ow, (oy + rh) / oh], [ox / ow, (oy + rh) / oh]];
    const n = { id:uid++, kind:"image", el:el2, name:"Top view", dur:clip.dur || 4, motion:"plot-focus", transition:"fade", thumb:thumbOf(el2, el2.naturalWidth, el2.naturalHeight),
      plots:[{ ...JSON.parse(JSON.stringify(pl)), id:uid++, pts:rect, side:undefined, lu:undefined, lv:undefined }] };
    P.clips.splice(P.clips.indexOf(clip) + 1, 0, n); refresh(); select("clip", n); seek(n._start + Math.min(2, n.dur * .5));
    return n;
  }

  /* ---------------- AI bird's-eye view ---------------- */
  const KEY = "reelstudio-ai";
  const AI_PROMPT = "Use this photo as a reference. Recreate the same scene from a realistic drone perspective, a bird's-eye view from 50 feet above. Keep the appearance, buildings, land, trees and location consistent. Photorealistic, natural daylight, no text, no watermark.";
  const aiCfg = () => { try { return { provider:"gemini", model:"", prompt:AI_PROMPT, ...JSON.parse(localStorage.getItem(KEY) || "{}") }; } catch(e){ return { provider:"gemini", model:"", prompt:AI_PROMPT }; } };
  const aiSave = c => { try { localStorage.setItem(KEY, JSON.stringify(c)); } catch(e) {} };
  async function imgBlob(img, max){
    const iw = img.naturalWidth, ih = img.naturalHeight, k = Math.min(1, max / Math.max(iw, ih)), cv2 = document.createElement("canvas");
    cv2.width = Math.round(iw * k); cv2.height = Math.round(ih * k); cv2.getContext("2d").drawImage(img, 0, 0, cv2.width, cv2.height);
    return new Promise(r => cv2.toBlob(r, "image/jpeg", .9));
  }
  const b64 = blob => new Promise((res, rej) => { const fr = new FileReader(); fr.onload = () => res(String(fr.result).split(",")[1]); fr.onerror = rej; fr.readAsDataURL(blob); });
  async function aiGenerate(img, cfg){
    const blob = await imgBlob(img, 1536);
    if (cfg.provider === "openai"){
      const fd = new FormData(); fd.append("model", cfg.model || "gpt-image-1"); fd.append("prompt", cfg.prompt); fd.append("image", blob, "photo.jpg"); fd.append("size", "1024x1536");
      const r = await fetch("https://api.openai.com/v1/images/edits", { method:"POST", headers:{ Authorization:"Bearer " + cfg.key }, body:fd });
      const j = await r.json().catch(() => ({})); if (!r.ok) throw new Error((j.error && j.error.message) || "OpenAI error " + r.status);
      const d = j.data && j.data[0]; if (!d || !d.b64_json) throw new Error("OpenAI returned no image.");
      return "data:image/png;base64," + d.b64_json;
    }
    const model = cfg.model || "gemini-2.5-flash-image";
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, { method:"POST", headers:{ "Content-Type":"application/json", "x-goog-api-key":cfg.key },
      body:JSON.stringify({ contents:[{ parts:[{ text:cfg.prompt }, { inline_data:{ mime_type:"image/jpeg", data:await b64(blob) } }] }] }) });
    const j = await r.json().catch(() => ({})); if (!r.ok) throw new Error((j.error && j.error.message) || "Gemini error " + r.status);
    const parts = (j.candidates && j.candidates[0] && j.candidates[0].content && j.candidates[0].content.parts) || [];
    const part = parts.find(x => x.inlineData || x.inline_data); if (!part) throw new Error("Gemini returned no image. Try again or change the prompt.");
    const d = part.inlineData || part.inline_data; return `data:${d.mimeType || d.mime_type || "image/png"};base64,${d.data}`;
  }
  async function aiMake(clip, btnEl, note){
    const cfg = aiCfg(); if (!cfg.key){ note.textContent = "Add your API key first."; return; }
    btnEl.disabled = true; const t0 = btnEl.textContent; btnEl.textContent = "Making the view... (up to a minute)"; note.textContent = "";
    try {
      const url = await aiGenerate(clip.el, cfg), blob = await (await fetch(url)).blob();
      const file = new File([blob], "ai-birds-eye.png", { type:blob.type || "image/png" }), el2 = await loadImage(file);
      const n = { id:uid++, kind:"image", el:el2, name:"AI bird's-eye", dur:clip.dur || 4, motion:"drone-in", transition:"fade", aiTag:true, thumb:thumbOf(el2, el2.naturalWidth, el2.naturalHeight) };
      P.clips.splice(P.clips.indexOf(clip) + 1, 0, n); refresh(); select("clip", n); seek(n._start + .5);
      toast("AI bird's-eye view added after the photo. It is tagged as an AI visualisation.");
    } catch(e){ note.textContent = e.message || "Could not make the view."; }
    finally { btnEl.disabled = false; btnEl.textContent = t0; }
  }

  /* ---------------- inspector section ---------------- */
  function droneUI(it){
    const s = d3(it), on = !!(it.d3 && it.d3.on);
    const set = (k, v) => { it.d3 = { ...d3(it), ...(it.d3 || {}), [k]:v }; changed(false); };
    const box = el("details", { class:"cs-panel", style:"margin:10px 0", open:"" }, [el("summary", { text:"Drone view" })]);
    const body = el("div", { style:"padding:0 12px 12px" });
    const tg = el("label", { class:"toggle" }, [Object.assign(el("input", { type:"checkbox" }), { checked:on, onchange:e => { it.d3 = { ...d3(it), on:e.target.checked }; changed(false); renderInspector(); } }), document.createTextNode("Drone 3D: fly over this photo")]);
    body.appendChild(tg);
    if (on){
      const runFlight = (p0, p1, a0, a1, orb, zm) => {
        set("pitch0", p0); set("pitch1", p1); set("alt0", a0); set("alt1", a1); set("orbit", orb); if (zm) set("zoom", zm);
        renderInspector(); seek(it._start + 0.1); play(it._start + 0.1);
        setTimeout(() => { if (playing) pause(); }, 2500);
      };
      body.append(
        el("div", { class:"row field", style:"gap:5px;flex-wrap:wrap;margin:8px 0" }, [
          el("span", { class:"lbl", text:"1-Click 3D Flights (Pure JS, No AI):", style:"width:100%;margin-bottom:2px" }),
          btn("🦅 High Flyover", () => runFlight(42, 68, 50, 190, 15, 1.15), "chip"),
          btn("🔄 360° Orbit", () => runFlight(65, 78, 90, 90, 45, 1.25), "chip"),
          btn("🚀 FPV Dive", () => runFlight(35, 82, 220, 45, -20, 1.1), "chip"),
          btn("🏗️ Crane Rise", () => runFlight(85, 45, 30, 250, 0, 1.05), "chip")
        ]),
        fChips("Look", `${s.pitch0}-${s.pitch1}`, [["42-70","Tilt down"],["70-90","Top down"],["85-35","Reveal horizon"],["55-55","Steady"]], v => { const [a, b] = v.split("-").map(Number); set("pitch0", a); set("pitch1", b); renderInspector(); }),
        fSlider("Start height (ft)", s.alt0, 20, 300, 5, v => set("alt0", v), v => Math.round(v) + " ft"),
        fSlider("End height (ft)", s.alt1, 20, 400, 5, v => set("alt1", v), v => Math.round(v) + " ft"),
        fSlider("Orbit", s.orbit, -90, 90, 1, v => set("orbit", v), v => Math.round(v) + "°"),
        fSlider("Zoom", s.zoom, .8, 2, .01, v => set("zoom", v), v => (+v).toFixed(2) + "x"),
        el("label", { class:"toggle" }, [Object.assign(el("input", { type:"checkbox" }), { checked:s.hud, onchange:e => set("hud", e.target.checked) }), document.createTextNode("Drone screen overlay (REC, height, compass)")]),
        fText("Location label (optional)", s.label, v => set("label", v)),
        el("p", { class:"hint", text:"This tilts and moves over your photo. It is not a real aerial view. For a true top-down view, use the AI option below." }));
    }
    /* straighten to top view */
    const pl4 = (it.plots || []).find(q => q.pts && q.pts.length === 4), tvNote = el("p", { class:"hint", style:"color:var(--text)" });
    const nW = parseFloat(pl4 && pl4.w), nL = parseFloat(pl4 && pl4.l);
    const ratioIn = el("input", { type:"text", "aria-label":"Width to length", placeholder:"auto", style:"max-width:110px" }); ratioIn.value = nW > 0 && nL > 0 ? `${nW}:${nL}` : "";
    const tvBtn = btn("Make top view", async () => {
      const m2 = String(ratioIn.value).match(/^\s*([\d.]+)\s*[:x\/]\s*([\d.]+)\s*$/), ratio = m2 ? (+m2[1] / +m2[2]) : 0;
      tvBtn.disabled = true; const t0 = tvBtn.textContent; tvBtn.textContent = "Straightening..."; tvNote.textContent = "";
      try { await makeTopView(it, ratio, .9); toast("Top view added after the photo."); } catch(e){ tvNote.textContent = e.message || "Could not make the top view."; } finally { tvBtn.disabled = false; tvBtn.textContent = t0; }
    }, "btn sm dark");
    const dpNote = el("p", { class:"hint", style:"color:var(--text)" });
    const dpBtn = btn("Make drone plot shot", async () => {
      dpBtn.disabled = true; const t0 = dpBtn.textContent; dpBtn.textContent = "Building the shot..."; dpNote.textContent = "";
      try {
        const m2 = String(ratioIn.value).match(/^\s*([\d.]+)\s*[:x\/]\s*([\d.]+)\s*$/), ratio = m2 ? (+m2[1] / +m2[2]) : 0;
        const n = await makeTopView(it, ratio, 1.4); const K = (window.GIRIKA && GIRIKA.KIT) || {};
        n.dur = Math.max(6, it.dur || 6); n.motion = "none";
        n.d3 = { ...D3_DEF, on:true, pitch0:50, pitch1:85, alt0:60, alt1:140, orbit:40, zoom:1, hud:true, label:[K.area, K.city].filter(Boolean).join(", ") };
        if (n.plots && n.plots[0]) n.plots[0].at = .4;
        refresh(); select("clip", n); seek(n._start + .1); toast("Drone plot shot added after the photo. Press play.");
      } catch(e){ dpNote.textContent = e.message || "Could not build the shot."; } finally { dpBtn.disabled = false; dpBtn.textContent = t0; }
    }, "btn sm dark");
    body.append(el("h2", { text:"Drone plot shot (on this computer)", style:"margin-top:14px" }),
      el("p", { class:"hint", text:pl4 ? "One click: turns the photo into a straight-down view, then flies a drone over the plot with the outline drawing in, the size badge and a location pin." : "Mark the plot's 4 corners first (Add plot highlight), then come back here." }),
      el("div", { class:"row field" }, [pl4 ? dpBtn : btn("Mark 4 corners", () => startPlotDraw(it), "btn sm")]), dpNote);
    body.append(el("h2", { text:"Top view from this photo (on this computer)", style:"margin-top:14px" }),
      el("p", { class:"hint", text:pl4 ? "Uses the 4 plot corners as flat ground and turns the photo so you look straight down on it. Land and plot shape come out true; tall things like buildings and trees lean." : "First mark 4 corners of flat ground with Add plot highlight (exactly 4 corners). Then this turns the photo into a straight-down view." }),
      el("div", { class:"row field", style:"align-items:center" }, [el("label", { class:"lbl", text:"Width : length", style:"margin:0" }), ratioIn, pl4 ? tvBtn : btn("Mark 4 corners", () => startPlotDraw(it), "btn sm")]), tvNote);
    /* AI */
    const cfg = aiCfg(), note = el("p", { class:"hint", style:"color:var(--text)" });
    const prov = fChips("AI service", cfg.provider, [["gemini","Google Gemini"],["openai","OpenAI"]], v => { aiSave({ ...aiCfg(), provider:v, model:"" }); renderInspector(); });
    const keyIn = el("input", { type:"password", autocomplete:"off", placeholder:cfg.provider === "openai" ? "sk-..." : "AIza...", "aria-label":"API key" }); keyIn.value = cfg.key || "";
    keyIn.addEventListener("change", () => aiSave({ ...aiCfg(), key:keyIn.value.trim() }));
    const pr = el("textarea", { rows:"4", "aria-label":"Prompt" }); pr.value = cfg.prompt; pr.addEventListener("change", () => aiSave({ ...aiCfg(), prompt:pr.value.trim() || AI_PROMPT }));
    const go = btn("Make AI bird's-eye view", () => aiMake(it, go, note), "btn sm dark");
    const tag = el("label", { class:"toggle" }, [Object.assign(el("input", { type:"checkbox" }), { checked:!!it.aiTag, onchange:e => { it.aiTag = e.target.checked; changed(false); } }), document.createTextNode("Show \"AI visualisation\" tag on this clip")]);
    body.append(el("h2", { text:"AI bird's-eye view", style:"margin-top:14px" }), prov,
      el("div", { class:"field" }, [el("label", { class:"lbl", text:"Your API key (saved in this browser only)" }), keyIn]),
      el("div", { class:"field" }, [el("label", { class:"lbl", text:"What to make" }), pr]),
      el("div", { class:"row field" }, [go, btn("Reset prompt", () => { aiSave({ ...aiCfg(), prompt:AI_PROMPT }); renderInspector(); })]), note, tag,
      el("p", { class:"hint", text:"The AI invents what the photo does not show. Keep the tag on when you share it with buyers, and use real photos for size, boundaries and access. Each image costs a small fee on your account with the provider." }));
    box.appendChild(body); return box;
  }
  const _ri = renderInspector;
  renderInspector = function(){
    _ri.apply(this, arguments);
    try {
      if (selected && selected.type === "clip" && selected.item && selected.item.kind === "image"){
        const ins = $("inspector"); if (ins && !ins.querySelector(".drone-ui")){ const d = droneUI(selected.item); d.classList.add("drone-ui"); const t = ins.querySelector(".insp-title"); if (t && t.nextSibling) ins.insertBefore(d, t.nextSibling); else ins.appendChild(d); }
      }
    } catch(e){ console.warn("drone panel", e); }
  };
  window.RS_DRONE = { drawDrone3D, aiGenerate, defaults:D3_DEF };
})();
