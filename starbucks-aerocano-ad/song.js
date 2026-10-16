// THE SONG — EDM bed + hype voiceover + SFX, every sound placed from score.js.
//   PATH=$PWD/tools/bin:$PATH PIPER_MODEL=tools/voices/ar_JO-kareem-medium.onnx node song.js
//   (STEMS=1 also writes out/stem-*.wav, LUFS=-14 masters to a loudness target)
const path = require('path');
const { SR, Bus, reverb, pingpong } = require('./engine/audio/dsp');
const I = require('./engine/audio/instruments');
const MIX = require('./engine/audio/mix');
const Genre = require('./engine/audio/genres');
const Voice = require('./engine/audio/voice');
const sc = require('./score');
const { T, BEAT, DURATION, m, ev, clock } = sc;

const N = Math.ceil(DURATION * SR);
const bus = () => new Bus(N);
const drums = bus(), bass = bus(), pad = bus(), keys = bus(), lead = bus(), fx = bus();
const verb = bus(), dly = bus();

// ---------- a bright ice clink: a few inharmonic glass partials ----------
function clink(seed, pitch = 1) {
  const len = 0.6, out = new Float32Array(Math.round(len * SR));
  const parts = [[3150, 1], [4870, 0.6], [7020, 0.4], [9300, 0.25]];
  for (let i = 0; i < out.length; i++) {
    const t = i / SR;
    let s = 0;
    for (const [f, g] of parts) s += g * Math.sin(2 * Math.PI * f * pitch * (1 + seed * 0.013) * t) * Math.exp(-t * (9 + f / 900));
    out[i] = s * 0.5 + (i < SR * 0.004 ? (((i * 7919 + seed * 104729) % 200) / 100 - 1) * 0.6 : 0);
  }
  return out;
}

// ---------- backing: Genre packs, section by section ----------
const buses = { drums, bass, pad, keys };
// hook: no drums, filtered stabs only (keeps the voice clear); froth/ice: full groove; drop: everything
Genre.play('edm', { clock, from: 0, to: 2, chordAt: sc.chordAt, buses, drums: false, bassline: false, gain: 0.6 });
const g1 = Genre.play('edm', { clock, from: 2, to: 6, chordAt: sc.chordAt, buses, gain: 0.8, fill: [5] });
const g2 = Genre.play('edm', { clock, from: 7, to: 10, chordAt: sc.chordAt, buses, gain: 1 });
Genre.play('edm', { clock, from: 10, to: 12, chordAt: sc.chordAt, buses, drums: false, gain: 0.7 });
const kicks = [...g1.kicks, ...g2.kicks];

// build (bar 6): accelerating snare roll up to the breath, no kick
const SN = I.snare({ tone: 0.4, snap: 0.8, decay: 0.1 });
for (let i = 0; i < 12; i++) drums.addMono(SN, T(6) + (i * (ev.breath - T(6) - BEAT / 4)) / 12, 0.15 + i * 0.03, i % 2 ? 0.15 : -0.15);

// pads under everything (soft), brighter on the drop
for (const c of sc.chords) {
  const t1 = c.t0 < ev.breath && c.t1 > ev.breath ? ev.breath : c.t1;
  const big = c.t0 >= ev.drop && c.t0 < ev.end;
  for (const n of c.notes) { const { L, R } = I.padNote(n, t1 - c.t0, big ? { cutoff: 3200, attack: 0.03 } : { cutoff: 1300, attack: 0.25, release: 1 }); pad.addStereo(L, R, c.t0, 0.07); }
}

// drop lead: supersaw hook, doubled an octave down
for (const n of sc.lead) {
  const a = I.supersaw(n.midi, n.dur * 0.9, { detune: 16 }), b = I.supersaw(n.midi - 12, n.dur * 0.9, { detune: 24, cutoff: 3000, seed: 7 });
  lead.addStereo(a.L, a.R, n.t, 0.22); lead.addStereo(b.L, b.R, n.t, 0.12);
  dly.addStereo(a.L, a.R, n.t, 0.06); verb.addStereo(a.L, a.R, n.t, 0.06);
}

// ---------- fx, each tied to a score event ----------
fx.addMono(I.noiseSweep(0.35, 9000, 600, { q: 0.8, pink: true }), ev.hook - 0.33, 0.35); // whoosh into the slam
fx.addMono(I.thud(70, 0.14), ev.hook, 0.9);
fx.addMono(I.kick({ punch: 1.4, tail: 0.4 }), ev.hook, 0.7);
fx.addMono(I.crash(18), ev.hook, 0.25);
fx.addMono(I.noiseSweep(0.4, 400, 6000, { q: 0.9, pink: true }), ev.froth - 0.4, 0.22); // swish into the whirl
fx.addMono(I.pop(1800, 3), ev.froth, 0.5);
ev.ice.forEach((t, i) => { const c = clink(i + 1, 1 + i * 0.06); fx.addMono(c, t, 0.55, (i - 1.5) * 0.25); verb.addMono(c, t, 0.15); fx.addMono(I.thud(140, 0.05), t, 0.35); });
fx.addMono(I.noiseSweep(1.2, 900, 2400, { q: 0.6, pink: true, shape: (x) => Math.sin(Math.PI * x) ** 0.5 }), ev.pour, 0.16); // the pour
for (let k = 0; k < 14; k++) fx.addMono(I.pop(1400 + (k * 431) % 1800, 40 + k), ev.pour + 0.15 + k * 0.07, 0.12, ((k % 5) - 2) * 0.2); // fizz bubbles
ev.count.forEach((t) => fx.addMono(I.woodTick(1.6), t, 0.5));
fx.addMono(I.noiseSweep(ev.breath - T(5, 2), 200, 9000, { q: 0.9, shape: (x) => x * x, pink: true }), T(5, 2), 0.4); // riser
fx.addMono(I.subBoom(2.4), ev.drop, 0.85);
fx.addMono(I.crash(21), ev.drop, 0.45);
fx.addMono(I.thud(60, 0.2), ev.drop, 0.8);
ev.chips.forEach((t, i) => fx.addMono(I.pop(2400 + i * 300, 60 + i), t, 0.55, (i % 2 ? 0.3 : -0.3)));
fx.addMono(I.noiseSweep(0.45, 6000, 500, { q: 0.8, pink: true }), ev.end - 0.42, 0.3); // wipe whoosh
fx.addMono(I.thud(80, 0.12), ev.end, 0.6);
fx.addMono(I.crash(25), ev.end, 0.2);

// ---------- voiceover ----------
const out = path.join(__dirname, 'out');
const VO = Voice.speak(sc.vo.map((l) => ({ at: l.at, text: l.text, gain: l.big ? 1.15 : 1 })), { out, length: DURATION });
if (VO.engine === 'none') console.warn('!! no TTS — run with PATH=$PWD/tools/bin:$PATH PIPER_MODEL=tools/voices/ar_JO-kareem-medium.onnx');
for (const l of VO.lines) console.log(`vo ${l.t.toFixed(2)}–${l.end.toFixed(2)}  ${l.text}`);
const voice = new Bus(N);
for (let i = 0; i < N && i < VO.bus.n; i++) { voice.L[i] = VO.bus.L[i]; voice.R[i] = VO.bus.R[i]; }
const vverb = new Bus(N); for (let i = 0; i < N; i++) { vverb.L[i] = voice.L[i] * 0.12; vverb.R[i] = voice.R[i] * 0.12; }

// ---------- mix ----------
MIX.sidechain([pad, bass, keys, lead], kicks.filter((t) => t >= ev.drop), { depth: 0.55 });
MIX.duck([drums, bass, pad, keys, lead], voice, { depth: 0.55 });
const stems = {
  drums, bass, pad, keys, lead, fx, voice,
  verb: reverb(verb, { room: 0.8, damp: 0.35 }),
  vverb: reverb(vverb, { room: 0.5, damp: 0.5 }),
  dly: pingpong(dly, BEAT * 0.75, 0.35, 4000),
};
const GAIN = { drums: 0.55, bass: 0.75, pad: 2.0, keys: 1.1, lead: 1.5, fx: 0.9, voice: 2.2, verb: 1, vverb: 1, dly: 1 };
const mix = MIX.mixdown(stems, GAIN, { stemDir: process.env.STEMS ? out : null });
MIX.highpass(mix, 25);
MIX.gate(mix, ev.breath, ev.drop - 0.001); // the held breath is truly silent
MIX.fadeOut(mix, DURATION - 1.0, DURATION);
const M = MIX.master(mix, parseFloat(process.env.DRIVE || '0.8'), undefined, { lufs: process.env.LUFS ? parseFloat(process.env.LUFS) : -13 });
MIX.writeWav(path.join(out, 'music.wav'), mix);
console.log(`wrote out/music.wav (${DURATION.toFixed(2)}s${M.lufs !== undefined ? `, ${M.lufs.toFixed(1)} LUFS at drive ${M.drive.toFixed(2)}` : ''})`);
