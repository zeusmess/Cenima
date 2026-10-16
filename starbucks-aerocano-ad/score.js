// THE SCORE — Starbucks Iced Aerocano · 9:16 hype spot (Egyptian Arabic voiceover).
// Single source of truth: song.js and film.js both read every event below.
(function () {
  const node = typeof require !== 'undefined';
  const U = node ? require('./engine/util') : globalThis.U;
  const MU = node ? require('./engine/music') : globalThis.MUSIC;
  const { m, makeClock, placeBar, makeChords } = MU;

  const FPS = 30;
  const STYLE = 'flat';
  const FORMAT = U.pickFormat('9:16');
  const [W, H] = U.formatSize(FORMAT);
  const SAFE = U.safeArea(W, H);
  const WIDE = W / H > 1.2;
  const clock = makeClock({ bpm: 124, offset: 0.3 }); // EDM tempo: 1 bar ≈ 1.94s
  const { T, BEAT } = clock;
  const DURATION = T(12) + 0.4; // ≈ 23.9s

  // ---------- sections ----------
  const S = {
    hook: [0, T(2)], // "استنى!" — NEW slams in
    froth: [T(2), T(4)], // the espresso gets whipped with air
    ice: [T(4), T(6)], // ice drops on the beat, the foam cascades in
    build: [T(6), T(6, 3)], // 3·2·1
    breath: [T(6, 3), T(7)], // silence, freeze
    drop: [T(7), T(10)], // AEROCANO
    end: [T(10), DURATION], // end card
  };

  // ---------- harmony: Am F C G (vi IV I V in C), the pop-EDM loop ----------
  const { chords, chordAt } = makeChords(clock, {
    Am: { notes: ['A3', 'C4', 'E4'], bass: 'A1' },
    F: { notes: ['A3', 'C4', 'F4'], bass: 'F1' },
    C: { notes: ['G3', 'C4', 'E4'], bass: 'C2' },
    G: { notes: ['G3', 'B3', 'D4'], bass: 'G1' },
  }, [
    [0, 0, 4, 'Am'], [1, 0, 4, 'F'],
    [2, 0, 4, 'Am'], [3, 0, 4, 'F'], [4, 0, 4, 'C'], [5, 0, 4, 'G'],
    [6, 0, 4, 'G'],
    [7, 0, 4, 'Am'], [8, 0, 4, 'F'], [9, 0, 2, 'C'], [9, 2, 2, 'G'],
    [10, 0, 4, 'F'], [11, 0, 4, 'C'],
  ]);

  // ---------- the drop hook (8th grid: [note, start8th, dur8ths]) ----------
  const HOOK = {
    a: [['E5', 0, 2], ['E5', 2, 1], ['D5', 3, 1], ['C5', 4, 2], ['D5', 6, 2]],
    b: [['C5', 0, 2], ['A4', 2, 2], ['C5', 4, 1], ['D5', 5, 1], ['E5', 6, 2]],
    c: [['G5', 0, 3], ['E5', 3, 1], ['D5', 4, 2], ['B4', 6, 2]],
  };
  const lead = [...placeBar(clock, HOOK.a, 7), ...placeBar(clock, HOOK.b, 8), ...placeBar(clock, HOOK.c, 9), { t: T(10), dur: 1.6, midi: m('C5') }];

  // ---------- events ----------
  const ev = {
    hook: T(0), // NEW slam
    froth: T(2), // cut: the whirl
    ice: [0, 1, 2, 3].map((b) => T(4, b)), // four cubes, one per beat
    pour: T(5), // the aerated espresso cascades into the cup
    count: [0, 1, 2].map((b) => T(6, b)), // 3 · 2 · 1
    breath: T(6, 3),
    drop: T(7),
    chips: [0, 1, 2, 3].map((b) => T(9, b)), // feature chips, one per beat
    end: T(10), // circle wipe to the end card
  };

  // ---------- voiceover (Egyptian Arabic, diacritised for the TTS; film strips the marks) ----------
  const vo = [
    { at: 0.42, text: 'اِسْتَنَّى! فِيه حَاجَة جْدِيدَة نِزْلِت!' },
    { at: T(1, 3.2), text: 'إسْبْرِيسُّو مِتْخَفَّق بِالْهَوَا... نَاعِم زَيِّ الْقَطِيفَة!' },
    { at: T(4, 0.5), text: 'عَلَى تَلْج... سَاقِع... وْطَعْمُه جَامِد!' },
    { at: T(6, 0), text: 'جَهِّز نَفْسَك!' },
    { at: T(7) + 0.03, text: 'إيرُوكَانُو!', big: true },
    { at: T(7, 2.6), text: 'الْقَهْوَة اللِّي هَتْقَلِب يُومَك!' },
    { at: T(10, 0.3), text: 'إيرُوكَانُو مِن سْتَارْبَكْس! جَرَّبُه النَّهَارْدَه!', caption: false },
  ];

  const chipText = ['ناعم', 'كريمي', 'ساقع', 'منعش'];

  // ---------- named moments (render.js stills @drop · verify measures the 'av' ones) ----------
  const markers = {
    hook: { t: ev.hook, sync: 'av' },
    froth: { t: ev.froth, sync: 'av' },
    ice1: { t: ev.ice[0], sync: 'av' },
    ice2: { t: ev.ice[1], sync: 'av' },
    ice3: { t: ev.ice[2], sync: 'av' },
    ice4: { t: ev.ice[3], sync: 'av' },
    pour: ev.pour,
    count3: { t: ev.count[0], sync: 'v' },
    breath: ev.breath,
    drop: { t: ev.drop, sync: 'av' },
    chip1: { t: ev.chips[0], sync: 'av' },
    chip4: { t: ev.chips[3], sync: 'av' },
    end: { t: ev.end, sync: 'av' },
  };

  const SCORE = { FPS, STYLE, FORMAT, W, H, SAFE, WIDE, DURATION, clock, T, BEAT, S, m, chords, chordAt, HOOK, lead, ev, vo, chipText, markers };
  if (node) module.exports = SCORE; else globalThis.SCORE = SCORE;
})();
