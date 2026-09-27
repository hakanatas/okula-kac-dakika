/* SAHNE 1 — SORU (0–10 s)  Okula kaç dakikada geliyoruz?
   The whole film's drawing lives in LI.world(t); each scene only sets the camera. */
(function (LI) {
  'use strict';
  const { seg, lerp, inOut } = LI.E;
  const KD = LI.KD, F = () => LI.Film, A = LI.Ang, Ink = LI.Ink;
  const END = (t) => 1 - seg(t, 90.4, 91.4);

  function win(t, a, b, fi = 0.4, fo = 0.4) { return seg(t, a, a + fi) * (1 - seg(t, b - fo, b)); }
  function exprs(ctx, t, P, list, sz) {
    const f = F();
    list.forEach(([a, b, items, hot]) => {
      const al = win(t, a, b); if (al <= 0) return;
      f.expr(ctx, typeof items === 'string' ? [items] : items, P.x, P.y, sz ?? P.s, { alpha: al, w: P.w, halo: true, color: hot ? A.amber : undefined });
    });
  }
  const at = (P, k, y) => ({ x: P.x, y: y ?? P.y[k], s: P.s, w: P.w });
  const amber = (a) => `rgba(${LI.AMBER_RGB},${a})`;
  const fr = (n, d, h) => F().fr(n, d, h);
  const neg = (s) => s.replace('-', '−');
  const label = (v) => (v < 0 ? neg(String(v)) : String(v));

  /* ---- boxes and equal objects: cabinet projection, x right, y back, z up ---- */
  const Pj = (O, c, x, y, z) => [O[0] + x * c + y * c * 0.5, O[1] - z * c - y * c * 0.5];
  function poly(ctx, P, a, fill, seed, w = 3) {
    ctx.beginPath(); P.forEach((q, i) => (i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]))); ctx.closePath();
    ctx.fillStyle = `rgba(${LI.PAPER_RGB},${a})`; ctx.fill();
    fill.forEach((f) => { if (f) { ctx.fillStyle = f; ctx.fill(); } });
    Ink.path(ctx, P.concat([P[0]]), { w, alpha: a * 0.9, seed, taper: [0, 0] });
  }
  /** a solid block x..x+dx, y..y+dy, z..z+dz */
  function block(ctx, O, c, x, y, z, dx, dy, dz, a, h, seed) {
    if (a <= 0) return;
    const P = (i, j, k) => Pj(O, c, x + i * dx, y + j * dy, z + k * dz), H = h > 0 ? amber(a * 0.6 * h) : null;
    poly(ctx, [P(0, 0, 1), P(1, 0, 1), P(1, 1, 1), P(0, 1, 1)], a, [amber(a * 0.2), H], seed, 2.5);
    poly(ctx, [P(1, 0, 0), P(1, 1, 0), P(1, 1, 1), P(1, 0, 1)], a, [`rgba(${LI.INK_RGB},${a * 0.14})`, H], seed + 1, 2.5);
    poly(ctx, [P(0, 0, 0), P(1, 0, 0), P(1, 0, 1), P(0, 0, 1)], a, [`rgba(${LI.INK_RGB},${a * 0.04})`, H], seed + 2, 2.5);
  }
  function ball(ctx, O, c, x, y, z, a, seed) {
    if (a <= 0) return; const C = Pj(O, c, x + 0.5, y + 0.5, z + 0.5), r = c * 0.47;
    ctx.beginPath(); ctx.arc(C[0], C[1], r, 0, 7);
    ctx.fillStyle = `rgba(${LI.PAPER_RGB},${a})`; ctx.fill();
    const g = ctx.createRadialGradient(C[0] - r * 0.35, C[1] - r * 0.35, r * 0.1, C[0], C[1], r);
    g.addColorStop(0, amber(a * 0.12)); g.addColorStop(1, amber(a * 0.45)); ctx.fillStyle = g; ctx.fill();
    const P = []; for (let i = 0; i <= 28; i++) P.push([C[0] + r * Math.cos(i / 28 * 6.2832), C[1] + r * Math.sin(i / 28 * 6.2832)]);
    Ink.path(ctx, P, { w: 2.5, alpha: a * 0.9, seed, taper: [0, 0] });
  }
  /** items [{x,y,z,dx,dy,dz}] in painter's order, each with a fill index i */
  function fillList(L, W, H, dx = 1) {
    const out = [];
    for (let z = 0; z < H; z++) for (let y = W - 1; y >= 0; y--) for (let x = 0; x < L; x += dx) out.push({ x, y, z, dx, dy: 1, dz: 1 });
    out.forEach((q, i) => (q.i = i));
    return out.slice().sort((p, q) => q.y - p.y || p.x - q.x || p.z - q.z);
  }
  const shown = (t, t0, dt, n) => Math.max(0, Math.min(n, Math.floor((t - t0) / dt + 0.4)));
  /** an open glass box: back walls first, then the contents, then the front edges */
  function container(ctx, O, c, L, W, H, a, seed, draw) {
    if (a <= 0) return;
    const P = (x, y, z) => Pj(O, c, x, y, z), ink = `rgba(${LI.INK_RGB},${a * 0.05})`;
    poly(ctx, [P(0, W, 0), P(L, W, 0), P(L, W, H), P(0, W, H)], a * 0.8, [ink], seed, 2);
    poly(ctx, [P(0, 0, 0), P(0, W, 0), P(0, W, H), P(0, 0, H)], a * 0.8, [ink], seed + 1, 2);
    poly(ctx, [P(0, 0, 0), P(L, 0, 0), P(L, W, 0), P(0, W, 0)], a * 0.8, [ink], seed + 2, 2);
    if (draw) draw();
    [[[0, 0, 0], [L, 0, 0]], [[L, 0, 0], [L, 0, H]], [[L, 0, H], [0, 0, H]], [[0, 0, H], [0, 0, 0]], [[L, 0, 0], [L, W, 0]], [[L, W, 0], [L, W, H]], [[L, W, H], [L, 0, H]], [[0, W, H], [L, W, H]], [[0, 0, H], [0, W, H]]]
      .forEach(([p, q], i) => Ink.path(ctx, [P(...p), P(...q)], { w: 3, alpha: a * 0.85, seed: seed + 10 + i, taper: [0, 0] }));
  }
  function fillBox(ctx, O, c, L, W, H, t, t0, dt, a, seed, kind = 'cube', hot = 0) {
    const dx = kind === 'brick' ? 2 : 1, items = fillList(L, W, H, dx);
    container(ctx, O, c, L, W, H, a, seed, () => items.forEach((q) => {
      const k = seg(t, t0 + q.i * dt, t0 + q.i * dt + 0.35); if (k <= 0) return;
      const dz = (1 - inOut(k)) * (H + 1 - q.z);
      if (kind === 'ball') ball(ctx, O, c, q.x, q.y, q.z + dz, a * k, seed + 100 + q.i * 3);
      else block(ctx, O, c, q.x, q.y, q.z + dz, q.dx, 1, 1, a * k, hot, seed + 100 + q.i * 3);
    }));
    return items.length;
  }
  function tag(ctx, env, O, c, L, text, a, hot) {
    if (a <= 0) return; const s = KD.L(env).G.s;
    F().T(ctx, text, O[0] + L * c / 2, O[1] + s * 0.95, { size: s * 0.66, alpha: a, halo: true, color: hot ? A.amber : undefined });
  }
  /** cubes of an L × W × H prism; when(q) gives each cube's arrival time (Infinity = never) */
  function cubes(L, W, H) {
    const out = [];
    for (let z = 0; z < H; z++) for (let y = W - 1; y >= 0; y--) for (let x = 0; x < L; x++) out.push({ x, y, z });
    return out.sort((p, q) => q.y - p.y || p.x - q.x || p.z - q.z);
  }
  function fillT(ctx, O, c, B, t, a, when, hot, seed) {
    let n = 0;
    container(ctx, O, c, B[0], B[1], B[2], a, seed, () => cubes(...B).forEach((q, i) => {
      const t0 = when(q); if (!(t >= t0)) return; n++;
      const k = seg(t, t0, t0 + 0.3);
      block(ctx, O, c, q.x, q.y, q.z + (1 - inOut(k)) * 1.2, 1, 1, 1, a * k, hot ? hot(q) : 0, seed + 100 + i * 3);
    }));
    return n;
  }
  function edges(ctx, env, O, c, B, a, labels) {
    if (a <= 0) return; const s = KD.L(env).G.s, o = { size: s * 0.7, alpha: a, halo: true, color: A.amber };
    const m = (p, q) => { const P = Pj(O, c, ...p), Q = Pj(O, c, ...q); return [(P[0] + Q[0]) / 2, (P[1] + Q[1]) / 2]; };
    const [L, W, H] = B;
    let q = m([0, 0, 0], [L, 0, 0]); F().T(ctx, labels[0], q[0], q[1] + 36, o);
    q = m([L, 0, 0], [L, W, 0]); F().T(ctx, labels[1], q[0] + 50, q[1] + 12, o);
    q = m([L, W, 0], [L, W, H]); F().T(ctx, labels[2], q[0] + 48, q[1], o);
  }
  function tally(ctx, env, t, rows) {
    const T = KD.L(env).TL;
    rows.forEach(([t0, t1, txt, hot], i) => { const al = win(t, t0, t1) * END(t); if (al > 0) F().T(ctx, txt, T.x, T.y[i], { size: T.s, alpha: al, halo: true, color: hot ? A.amber : undefined }); });
  }

  const WALK = [4, 6, 7, 8, 9, 11, 12, 13, 14, 16, 18, 22], BUS = [15, 19, 21, 23, 24, 26, 27, 28, 31, 33, 35, 38];
  const DATA = [];
  WALK.forEach((v, i) => DATA.push({ v, bus: false, i: i * 2 })); BUS.forEach((v, i) => DATA.push({ v, bus: true, i: i * 2 + 1 }));
  const X = (env, v) => { const A_ = KD.L(env).AX; return lerp(A_.x0, A_.x1, v / 40); };
  const BIN = [[0, 10], [10, 20], [20, 30], [30, 40]];
  const cnt = (list, [lo, hi]) => list.filter((v) => v >= lo && v < hi).length;
  function rect(ctx, x0, y0, x1, y1, a, fill, seed) {
    if (a <= 0 || Math.abs(y1 - y0) < 0.5) return; const P = [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
    ctx.beginPath(); P.forEach((q, i) => (i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]))); ctx.closePath(); ctx.fillStyle = fill; ctx.fill();
    Ink.path(ctx, P.concat([P[0]]), { w: 2.5, alpha: a * 0.9, seed, taper: [0, 0] });
  }
  function axis(ctx, env, a) {
    if (a <= 0) return; const A_ = KD.L(env).AX, s = KD.L(env).G.s;
    Ink.path(ctx, [[A_.x0 - 10, A_.y], [A_.x1 + 30, A_.y]], { w: 3, alpha: a, seed: 96000, taper: [0, 0] });
    for (let v = 0; v <= 40; v += 5) { const x = X(env, v); Ink.path(ctx, [[x, A_.y], [x, A_.y + (v % 10 ? 7 : 12)]], { w: 2, alpha: a, seed: 96010 + v, taper: [0, 0] }); if (v % 10 === 0) F().T(ctx, String(v), x, A_.y + s * 0.75, { size: s * 0.56, alpha: a, halo: true }); }
    F().T(ctx, 'dakika', A_.x1 + 70, A_.y + s * 0.75, { size: s * 0.5, alpha: a, halo: true });
  }

  function context(ctx, env, t) {
    exprs(ctx, t, KD.L(env).CX, [
      [4.4, 10.2, 'Okula kaç dakikada geliyoruz?'],
      [10.6, 27.8, 'Araştırma sorusu ve plan'],
      [28.4, 45.8, 'Veriyi gruplayalım ve görselleştirelim'],
      [46.4, 63.8, 'Karşılaştıralım ve karar verelim'],
      [64.4, 79.8, 'Araştırmamızı değerlendirelim'],
    ]);
  }

  function figure(ctx, env, t) {
    const L = KD.L(env), a = END(t), s = L.G.s, A_ = L.AX;
    // S1: two kinds of data
    const c1 = a * win(t, 5.2, 10.2), c2 = a * win(t, 6.8, 10.2);
    if (c1 > 0) { const [x, y] = L.CARD[0]; F().T(ctx, 'Nasıl geliyorsun?', x, y, { size: s * 1.0, alpha: c1, halo: true }); F().T(ctx, 'yürüyerek, servisle: kategorik', x, y + s * 1.1, { size: s * 0.74, alpha: c1, halo: true }); }
    if (c2 > 0) { const [x, y] = L.CARD[1]; F().T(ctx, 'Kaç dakikada geliyorsun?', x, y, { size: s * 1.0, alpha: c2, halo: true, color: A.amber }); F().T(ctx, '12,5 dk gibi ölçülür: nicel, sürekli', x, y + s * 1.1, { size: s * 0.74, alpha: c2, halo: true, color: A.amber }); }
    const aA = a * win(t, 20.2, 79.8);
    axis(ctx, env, aA * seg(t, 20.4, 21.0));
    // dots
    const dA = aA * (1 - seg(t, 35.0, 36.0));
    if (dA > 0) DATA.forEach((d) => {
      const t0 = 21.4 + d.i * 0.2, k = seg(t, t0, t0 + 0.3); if (k <= 0) return;
      const x = X(env, d.v), y = A_.y - 16 - (1 - k) * 60;
      ctx.beginPath(); ctx.arc(x, y, 9, 0, 7); ctx.fillStyle = `rgba(${LI.INK_RGB},${dA * k * 0.85})`; ctx.fill();
    });
    // intervals
    const iv = aA * win(t, 29.6, 45.8);
    if (iv > 0) [10, 20, 30].forEach((v) => { const x = X(env, v); for (let j = 0; j < 8; j++) Ink.path(ctx, [[x, A_.y - j * 24], [x, A_.y - j * 24 - 12]], { w: 2, alpha: iv * 0.6, seed: 96100 + v + j, taper: [0, 0], color: LI.AMBER_RGB }); });
    // histogram: one colour, then split walkers / bus
    const hA = aA * seg(t, 35.0, 35.4), sp = seg(t, 47.4, 48.4);
    if (hA > 0) BIN.forEach((b, i) => {
      const g = inOut(seg(t, 35.0 + i * 0.3, 36.4 + i * 0.3)), w = cnt(WALK, b), bu = cnt(BUS, b), x0 = X(env, b[0]), x1 = X(env, b[1]);
      const yW = A_.y - w * A_.h * g, yT = A_.y - (w + bu) * A_.h * g;
      if (sp <= 0) rect(ctx, x0, A_.y, x1, yT, hA, amber(hA * 0.3), 96200 + i * 3);
      else { rect(ctx, x0, A_.y, x1, yW, hA, `rgba(${LI.INK_RGB},${hA * 0.18 * sp + 0.0})`, 96300 + i * 3); rect(ctx, x0, yW, x1, yT, hA, amber(hA * (0.3 + 0.3 * sp)), 96400 + i * 3); }
      const n = w + bu; if (seg(t, 36.6, 37.0) > 0 && sp < 1) F().T(ctx, String(n), (x0 + x1) / 2, yT - s * 0.55, { size: s * 0.62, alpha: hA * seg(t, 36.6, 37.0) * (1 - sp), halo: true });
      if (sp > 0) { if (w) F().T(ctx, String(w), (x0 + x1) / 2, (A_.y + yW) / 2, { size: s * 0.56, alpha: hA * sp, halo: true }); if (bu) F().T(ctx, String(bu), (x0 + x1) / 2, (yW + yT) / 2, { size: s * 0.56, alpha: hA * sp, halo: true, color: A.amber }); }
    });
    if (sp > 0 && t < 80) { const k = aA * sp; F().T(ctx, '■ yürüyen', A_.x0 + 90, A_.y - 8 * A_.h - 16, { size: s * 0.7, alpha: k * 0.8, halo: true }); F().T(ctx, '■ servis', A_.x0 + 290, A_.y - 8 * A_.h - 16, { size: s * 0.7, alpha: k, halo: true, color: A.amber }); }
    tally(ctx, env, t, [[32.0, 45.8, '0–10 dk: 5'], [32.6, 45.8, '10–20 dk: 8', true], [33.2, 45.8, '20–30 dk: 7'], [33.8, 45.8, '30–40 dk: 4']]);
    tally(ctx, env, t, [[49.0, 63.8, 'Yürüyen: 5 · 6 · 1 · 0'], [50.0, 63.8, 'Servis: 0 · 2 · 6 · 4', true], [52.4, 63.8, '20 dk’dan az: 11 yürüyen'], [53.4, 63.8, '20 dk’dan çok: 10 servis', true]]);
    tally(ctx, env, t, [[66.0, 79.8, 'Soru 1: Kaç dakikada geliyorsun?'], [66.8, 79.8, 'Soru 2: Nasıl geliyorsun?'], [70.0, 79.8, '+ Evin okula kaç km uzakta?', true]]);
  }

  function words(ctx, env, t) {
    const W = KD.L(env).W;
    exprs(ctx, t, at(W, 0), [[5.4, 10.2, 'Süre ölçülerek bulunur: sürekli bir veri'],
      [11.4, 19.8, 'Araştırma sorusu: Sınıfımız okula kaç dakikada geliyor?'], [20.0, 27.8, 'Plan: 24 öğrenciye aynı anket sorusu'],
      [29.4, 45.8, 'Sürekli veri: değerleri eşit aralıklara gruplayalım'],
      [47.4, 63.8, 'Yürüyenler ve servisle gelenler ayrı renkte'],
      [65.4, 79.8, 'Soruya cevap verdik mi? Neden uzun sürdüğünü bilmiyoruz']]);
    exprs(ctx, t, at(W, 1), [[14.0, 19.8, 'Karşılaştırma: yürüyenler ile servisle gelenler farklı mı?'], [23.0, 27.8, 'Her nokta bir öğrencinin süresi'],
      [37.4, 45.8, 'Histogram: aralıklar kesintisiz, sütunlar bitişik'],
      [54.4, 63.8, 'Gerekçe: servisle gelenlerin çoğu 20 dakikadan fazla'],
      [71.4, 79.8, 'Uzaklık verisi olmadan “neden” sorusu cevapsız kalır']]);
    exprs(ctx, t, at(W, 2), [[8.4, 10.2, 'Nicel ve sürekli veriyle bir araştırma', true], [25.4, 27.8, 'Veriler toplandı', true],
      [41.4, 45.8, 'En çok öğrenci 10–20 dakikada geliyor', true],
      [58.0, 63.8, 'Karar: servisle gelmek daha uzun sürüyor', true],
      [75.0, 79.8, 'Planı yenile: uzaklığı da sor', true]]);
  }

  function summary(ctx, env, t) {
    if (t < 80.4) return;
    const S = KD.L(env).SUM, f = F(), a = END(t);
    [['Soru sor, plan yap, veri topla', 80.6], ['Sürekli veri: aralıklara grupla, histogram çiz', 81.6], ['Kararını veriyle gerekçelendir', 82.6], ['Gerekirse planı yenile!', 83.6, true]].forEach(([s, t0, hot], i) => {
      const al = seg(t, t0, t0 + 0.4) * a; if (al <= 0) return;
      f.expr(ctx, [s], S.x, S.y[i], S.s * (i === 3 ? 1.1 : 1), { alpha: al, w: S.w, halo: true, color: hot ? A.amber : undefined });
    });
  }

  LI.fireworks = function (ctx, env, t) {
    const k = seg(t, 84.4, 86.4);
    if (k <= 0 || t >= 91) return;
    const n = F().nokta(t, env), C = [n.x, n.y - 170];
    [30, 60, 90, 120, 150].forEach((d, i) => {
      const r = 150 + 30 * Math.sin(t * 2 + i);
      A.arc(ctx, C, r, d - 12, d + 12, { p: seg(k, i * 0.12, i * 0.12 + 0.4), alpha: 0.8 * (1 - seg(t, 90.2, 91)), w: 6, seed: 80 + i });
    });
  };

  LI.world = function (ctx, env, t) { context(ctx, env, t); figure(ctx, env, t); words(ctx, env, t); summary(ctx, env, t); };

  function camera(t, env) {
    const L = KD.L(env);
    return LI.Camera.breathe(LI.Camera.track([
      [0, KD.cam(env, { x: L.nx, y: env.V ? 380 : 140, zoom: 1.6 })],
      [3.0, KD.cam(env, { x: L.nx, y: env.V ? 380 : 140, zoom: 1.6 })],
      [4.8, KD.cam(env, { zoom: 1 })],
    ], t), t, 0.5);
  }
  function render(ctx, lt, env, t) { F().base(ctx, env, t, camera(t, env), () => LI.world(ctx, env, t)); }
  LI.registerScene({ id: 1, start: 0, end: 10, name: 'A question', nameTr: 'Soru', concept: 'Continuous data', conceptTr: 'Sürekli veri', render });
})(window.LI = window.LI || {});
