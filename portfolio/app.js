(function () {
  "use strict";
  var P = window.PORTFOLIO, LOGO = window.ZM_LOGO;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var canHover = window.matchMedia("(hover: hover)").matches;
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var UI = {
    ar: {
      nav: [["#services", "خدماتي"], ["#starbucks", "ستاربكس"], ["#work", "أعمالي"], ["#about", "عنّي"], ["#contact", "تواصل"]],
      available: "متاح لمشاريع جديدة", ctaWorks: "ابدأ اللعب", ctaContact: "يلا نشتغل",
      servicesKicker: "INVENTORY", servicesTitle: "بعمل إيه",
      aboutKicker: "عنّي", contactTitle: "عندك فكرة؟ يلا نعملها",
      contactLead: "ابعتلي على واتساب أو انستجرام، وهرد عليك بسرعة.",
      whatsapp: "كلمني واتساب", lang: "EN", video: "VIDEO", photo: "PHOTO", items: "عمل", level: "LEVEL", world: "WORLD",
      sound: "الصوت", hover: "عدّي عليه يتلوّن"
    },
    en: {
      nav: [["#services", "Skills"], ["#starbucks", "Starbucks"], ["#work", "Work"], ["#about", "About"], ["#contact", "Contact"]],
      available: "Available for new projects", ctaWorks: "Start game", ctaContact: "Let's work",
      servicesKicker: "INVENTORY", servicesTitle: "What I do",
      aboutKicker: "About me", contactTitle: "Got an idea? Let's make it",
      contactLead: "Message me on WhatsApp or Instagram and I'll get back to you fast.",
      whatsapp: "Chat on WhatsApp", lang: "عربي", video: "VIDEO", photo: "PHOTO", items: "pieces", level: "LEVEL", world: "WORLD",
      sound: "Sound", hover: "Hover for colour"
    }
  };

  /* ---------- 12×12 pixel sprites ---------- */
  var SPRITES = {
    camera: ["............", "....####....", "..########..", ".##########.", ".###....###.", ".##..##..##.", ".##.####.##.", ".##..##..##.", ".###....###.", ".##########.", "............", "............"],
    play: ["............", "...#........", "...###......", "...#####....", "...#######..", "...########.", "...#######..", "...#####....", "...###......", "...#........", "............", "............"],
    film: ["............", ".##..##..##.", ".##########.", "............", ".##########.", ".#........#.", ".#..####..#.", ".#..####..#.", ".#........#.", ".##########.", "............", "............"],
    wand: ["........#...", ".......###..", "........#..#", "......##....", ".....##.....", "....##......", "...##.......", "..##........", ".##.........", "##..........", "............", "............"],
    spark: ["......#.....", "......#.....", ".....###....", ".....###....", "...#######..", ".###########", "...#######..", ".....###....", ".....###....", "......#.....", "......#.....", "............"],
    brush: ["..........##", ".........###", "........###.", ".......###..", "......###...", ".....###....", "...##.#.....", "..####......", "..####......", ".####.......", "###.........", "............"],
    doc: ["..######....", "..#....##...", "..#.....##..", "..#......#..", "..#.####.#..", "..#......#..", "..#.####.#..", "..#......#..", "..#.###..#..", "..#......#..", "..########..", "............"],
    cup: ["............", "..########..", ".##########.", "..#......#..", "..#.####.#..", "..#.#..#.#..", "..#.####.#..", "...#....#...", "...#....#...", "...######...", "............", "............"],
    chat: ["...######...", "..#......#..", ".#........#.", ".#.##.....#.", ".#.##.....#.", ".#..##....#.", ".#...####.#.", ".#........#.", "..#......#..", ".#.######...", "##..........", "............"],
    insta: [".##########.", "#..........#", "#.......##.#", "#...####...#", "#..#....#..#", "#..#....#..#", "#..#....#..#", "#..#....#..#", "#...####...#", "#..........#", ".##########.", "............"],
    mail: ["............", "############", "##........##", "#.#......#.#", "#..#....#..#", "#...####...#", "#..........#", "#..........#", "############", "............", "............", "............"],
    soundOn: ["............", "....#.......", "...##...#...", "..###....#..", "####..#..#..", "####...#.#..", "####...#.#..", "####..#..#..", "..###....#..", "...##...#...", "....#.......", "............"],
    soundOff: ["............", "....#.......", "...##.......", "..###.#...#.", "####...#.#..", "####....#...", "####...#.#..", "..###.#...#.", "...##.......", "....#.......", "............", "............"],
    next: ["............", "...#........", "...##.......", "....##......", ".....##.....", "......##....", ".....##.....", "....##......", "...##.......", "...#........", "............", "............"],
    prev: ["............", "........#...", ".......##...", "......##....", ".....##.....", "....##......", ".....##.....", "......##....", ".......##...", "........#...", "............", "............"],
    close: ["##........##", ".##......##.", "..##....##..", "...##..##...", "....####....", ".....##.....", "....####....", "...##..##...", "..##....##..", ".##......##.", "##........##", "............"]
  };
  var CURSOR = ["#.........", "##........", "#.#.......", "#..#......", "#...#.....", "#....#....", "#.....#...", "#......#..", "#.......#.", "#....#####", "#..#.#....", "#.#..#....", "##....#...", ".......#..", "......##.."];
  var HAND = ["....##......", "...#..#.....", "...#..#.....", "...#..###...", "...#..#..##.", ".###..#..#.#", "#..#.....#.#", "#..#.......#", ".#.........#", "..#........#", "...#......#.", "....######.."];

  function runs(rows, dx, dy) {
    var d = "";
    rows.forEach(function (row, y) {
      var x = 0;
      while (x < row.length) {
        if (row[x] === "#") { var s = x; while (x < row.length && row[x] === "#") x++; d += "M" + (s + dx) + " " + (y + dy) + "h" + (x - s) + "v1h-" + (x - s) + "z"; }
        else x++;
      }
    });
    return d;
  }
  var NS = "http://www.w3.org/2000/svg";
  function svgEl(rows, extraRows) {
    var w = rows[0].length, h = rows.length;
    var s = document.createElementNS(NS, "svg");
    s.setAttribute("viewBox", "0 0 " + w + " " + h); s.setAttribute("class", "pix"); s.setAttribute("aria-hidden", "true");
    var p = document.createElementNS(NS, "path"); p.setAttribute("d", runs(rows, 0, 0)); s.appendChild(p);
    if (extraRows) { var q = document.createElementNS(NS, "path"); q.setAttribute("d", runs(extraRows, 0, 0)); q.setAttribute("class", "iris"); s.appendChild(q); }
    return s;
  }
  function eye(size) { var L = LOGO[String(size)]; return svgEl(L.eye, L.iris); }
  function ico(name, size) {
    var w = document.createElement("span"); w.className = "ico";
    if (size) w.style.setProperty("--s", size + "px");
    w.appendChild(svgEl(SPRITES[name])); return w;
  }
  function svgURI(rows, fillRows, scale) {
    var w = rows[0].length * scale, h = rows.length * scale;
    var body = (fillRows ? '<path fill="#000" d="' + runs(fillRows, 0, 0) + '"/>' : "") + '<path fill="#fff" d="' + runs(rows, 0, 0) + '"/>';
    return "url(\"data:image/svg+xml," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="' + w + '" height="' + h + '" viewBox="0 0 ' + rows[0].length + ' ' + rows.length + '" shape-rendering="crispEdges">' + body + "</svg>") + "\")";
  }
  // Fill the inside of an outline sprite so the cursor reads on any background.
  function solid(rows) {
    return rows.map(function (r) { var a = r.indexOf("#"), b = r.lastIndexOf("#"); return a < 0 ? r : r.slice(0, a) + "#".repeat(b - a + 1) + r.slice(b + 1); });
  }

  /* ---------- Arabic shaping for the pixel font ----------
     The pixel font only has presentation forms, so letters are joined here
     to render the same in every browser. */
  var AR = { "ء": [0xFE80], "آ": [0xFE81, 0xFE82], "أ": [0xFE83, 0xFE84], "ؤ": [0xFE85, 0xFE86], "إ": [0xFE87, 0xFE88],
    "ئ": [0xFE89, 0xFE8A, 0xFE8B, 0xFE8C], "ا": [0xFE8D, 0xFE8E], "ب": [0xFE8F, 0xFE90, 0xFE91, 0xFE92], "ة": [0xFE93, 0xFE94],
    "ت": [0xFE95, 0xFE96, 0xFE97, 0xFE98], "ث": [0xFE99, 0xFE9A, 0xFE9B, 0xFE9C], "ج": [0xFE9D, 0xFE9E, 0xFE9F, 0xFEA0],
    "ح": [0xFEA1, 0xFEA2, 0xFEA3, 0xFEA4], "خ": [0xFEA5, 0xFEA6, 0xFEA7, 0xFEA8], "د": [0xFEA9, 0xFEAA], "ذ": [0xFEAB, 0xFEAC],
    "ر": [0xFEAD, 0xFEAE], "ز": [0xFEAF, 0xFEB0], "س": [0xFEB1, 0xFEB2, 0xFEB3, 0xFEB4], "ش": [0xFEB5, 0xFEB6, 0xFEB7, 0xFEB8],
    "ص": [0xFEB9, 0xFEBA, 0xFEBB, 0xFEBC], "ض": [0xFEBD, 0xFEBE, 0xFEBF, 0xFEC0], "ط": [0xFEC1, 0xFEC2, 0xFEC3, 0xFEC4],
    "ظ": [0xFEC5, 0xFEC6, 0xFEC7, 0xFEC8], "ع": [0xFEC9, 0xFECA, 0xFECB, 0xFECC], "غ": [0xFECD, 0xFECE, 0xFECF, 0xFED0],
    "ف": [0xFED1, 0xFED2, 0xFED3, 0xFED4], "ق": [0xFED5, 0xFED6, 0xFED7, 0xFED8], "ك": [0xFED9, 0xFEDA, 0xFEDB, 0xFEDC],
    "ل": [0xFEDD, 0xFEDE, 0xFEDF, 0xFEE0], "م": [0xFEE1, 0xFEE2, 0xFEE3, 0xFEE4], "ن": [0xFEE5, 0xFEE6, 0xFEE7, 0xFEE8],
    "ه": [0xFEE9, 0xFEEA, 0xFEEB, 0xFEEC], "و": [0xFEED, 0xFEEE], "ى": [0xFEEF, 0xFEF0], "ي": [0xFEF1, 0xFEF2, 0xFEF3, 0xFEF4] };
  var LAM_ALEF = { "آ": [0xFEF5, 0xFEF6], "أ": [0xFEF7, 0xFEF8], "إ": [0xFEF9, 0xFEFA], "ا": [0xFEFB, 0xFEFC] };
  var isMark = function (c) { var n = c.charCodeAt(0); return (n >= 0x064B && n <= 0x065F) || n === 0x0670; };
  var dual = function (c) { return c === "ـ" || (AR[c] && AR[c].length === 4); };
  var joins = function (c) { return c === "ـ" || (AR[c] && c !== "ء"); };
  function shapeAr(str) {
    if (!/[ء-ي]/.test(str)) return str;
    var ch = Array.from(str), out = "";
    function near(i, dir) { for (var j = i + dir; j >= 0 && j < ch.length; j += dir) { if (!isMark(ch[j])) return ch[j]; } return ""; }
    for (var i = 0; i < ch.length; i++) {
      var c = ch[i];
      if (!AR[c]) { out += c; continue; }
      var prev = near(i, -1), next = near(i, 1);
      var jp = dual(prev) && c !== "ء";
      if (c === "ل" && LAM_ALEF[next]) {
        out += String.fromCharCode(LAM_ALEF[next][jp ? 1 : 0]);
        while (++i < ch.length && isMark(ch[i])) out += ch[i];
        continue;
      }
      var jn = dual(c) && joins(next);
      var f = AR[c], k = jp && jn ? 3 : jp ? 1 : jn ? 2 : 0;
      out += String.fromCharCode(f[k] || f[0]);
    }
    return out;
  }
  function shapeTree(root) {
    var w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null), n;
    while ((n = w.nextNode())) { var s = shapeAr(n.nodeValue); if (s !== n.nodeValue) n.nodeValue = s; }
  }

  /* ---------- 8-bit sound effects (Web Audio, no files) ---------- */
  var sfxOn = (function () { try { return localStorage.getItem("zm-sfx") !== "0"; } catch (e) { return true; } })();
  var actx = null;
  function audio() {
    if (!actx) { var A = window.AudioContext || window.webkitAudioContext; if (!A) return null; actx = new A(); }
    if (actx.state === "suspended") actx.resume();
    return actx;
  }
  function tone(freq, start, dur, type, vol) {
    var a = actx, o = a.createOscillator(), g = a.createGain(), t = a.currentTime + start;
    o.type = type || "square"; o.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(vol || .05, t); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    o.connect(g); g.connect(a.destination); o.start(t); o.stop(t + dur + .02);
  }
  var SFX = {
    hover: function () { tone(1320, 0, .035, "square", .025); },
    click: function () { tone(660, 0, .05); tone(990, .05, .08); },
    open: function () { [523, 659, 784, 1047].forEach(function (f, i) { tone(f, i * .045, .09); }); },
    close: function () { [1047, 784, 523].forEach(function (f, i) { tone(f, i * .045, .08); }); },
    step: function () { tone(880, 0, .04, "triangle", .06); tone(1175, .04, .06, "triangle", .05); },
    level: function () { [392, 523, 659].forEach(function (f, i) { tone(f, i * .06, .08, "square", .03); }); },
    start: function () { [262, 330, 392, 523, 392, 523, 659, 784].forEach(function (f, i) { tone(f, i * .085, .11, "square", .045); }); tone(131, 0, .7, "triangle", .06); }
  };
  function sfx(name) { if (!sfxOn || !actx) return; try { SFX[name](); } catch (e) {} }
  var lastHover = 0;
  function hoverSfx() { var n = Date.now(); if (n - lastHover > 70) { lastHover = n; sfx("hover"); } }
  function unlockAudio() { if (sfxOn) audio(); }
  window.addEventListener("pointerdown", unlockAudio, { capture: true });
  window.addEventListener("keydown", unlockAudio, { capture: true });

  /* ---------- Helpers ---------- */
  var lang = (function () { try { return localStorage.getItem("zm-lang") || P.defaultLang || "ar"; } catch (e) { return P.defaultLang || "ar"; } })();
  function t(v) { return v && typeof v === "object" && !Array.isArray(v) ? (v[lang] != null ? v[lang] : v.en) : (v || ""); }
  function get(path) { return path.split(".").reduce(function (o, k) { return o && o[k]; }, P); }
  function el(tag, cls, text) { var n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; }
  function src(it) { return "media/" + (it.v || it.i) + (it.v ? ".mp4" : ".webp"); }
  function poster(it) { return "media/" + (it.v || it.i) + ".webp"; }
  function pad(n) { return String(n).padStart(2, "0"); }
  function fillEyes(root) { $$("[data-eye]", root).forEach(function (n) { n.innerHTML = ""; n.appendChild(eye(n.dataset.eye)); }); }

  /* ---------- Static text ---------- */
  function renderStatic() {
    var U = UI[lang];
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.title = P.nickname + " · " + t(P.role);
    $$("[data-i18n]").forEach(function (n) { n.textContent = U[n.dataset.i18n]; });
    $$("[data-bind]").forEach(function (n) { var v = get(n.dataset.bind); n.textContent = typeof v === "string" ? v : t(v); });
    var lb = $("#langBtn"); lb.textContent = U.lang;

    var nav = $("#navLinks"); nav.innerHTML = "";
    U.nav.forEach(function (l) { var a = el("a", "glow", l[1]); a.href = l[0]; nav.appendChild(a); });

    var roles = $("#roles"); roles.innerHTML = "";
    t(P.role).split(" · ").forEach(function (r, i) { var li = el("li", "glow"); li.appendChild(ico(["film", "camera", "spark"][i % 3])); li.appendChild(document.createTextNode(r)); roles.appendChild(li); });

    var words = P.services.map(function (s) { return s.en.toUpperCase(); });
    ["#tape1", "#tape2"].forEach(function (id, k) {
      var tr = $(id); tr.innerHTML = "";
      var list = k ? words.slice().reverse() : words;
      for (var i = 0; i < 4; i++) list.forEach(function (w) { tr.appendChild(el("span", null, w)); var s = el("span", "sep"); s.appendChild(eye(15)); tr.appendChild(s); });
    });

    var inv = $("#inventory"); inv.innerHTML = "";
    P.services.forEach(function (s, i) {
      var c = el("article", "slot");
      c.appendChild(ico(s.icon));
      c.appendChild(el("h3", "glow", s[lang]));
      c.appendChild(el("p", "glow", t(s.d)));
      c.appendChild(el("span", "key", "x" + pad(i + 1)));
      c.addEventListener("mouseenter", hoverSfx);
      inv.appendChild(c);
    });

    var skills = $("#skills"); skills.innerHTML = "";
    P.services.forEach(function (s) { var li = el("li", "glow"); li.appendChild(ico(s.icon)); li.appendChild(document.createTextNode(s[lang])); skills.appendChild(li); });

    var acts = $("#contactActions"); acts.innerHTML = "";
    if (P.contact.whatsapp) {
      var wa = el("a", "pbtn solid big"); wa.href = "https://wa.me/" + P.contact.whatsapp; wa.target = "_blank"; wa.rel = "noopener"; wa.dataset.sfx = "click";
      wa.appendChild(ico("chat")); wa.appendChild(document.createTextNode(U.whatsapp)); acts.appendChild(wa);
    }
    (P.contact.socials || []).forEach(function (s) {
      var a = el("a", "pbtn big"); a.href = s.url; a.target = "_blank"; a.rel = "noopener"; a.dataset.sfx = "click";
      a.appendChild(ico("insta")); a.appendChild(document.createTextNode(s.label)); acts.appendChild(a);
    });
    if (P.contact.email) { var m = el("a", "pbtn big"); m.href = "mailto:" + P.contact.email; m.appendChild(ico("mail")); m.appendChild(document.createTextNode(P.contact.email)); acts.appendChild(m); }
    var ph = $("#phone"); ph.textContent = P.contact.whatsapp ? "+" + P.contact.whatsapp : ""; ph.hidden = !P.contact.whatsapp;
    $("#year").textContent = new Date().getFullYear();

    ["h2", ".tagline", ".hero-name", ".tag", ".kicker", ".player-text", ".continue-lead", ".footer span", ".world-intro"].forEach(function (s) { $$(s).forEach(function (n) { n.classList.add("glow"); }); });
  }

  /* ---------- Hero ---------- */
  function renderHero() {
    var he = $("#heroEye"); he.innerHTML = ""; he.appendChild(eye(63));
    var ne = $("#navEye"); ne.innerHTML = ""; ne.appendChild(eye(31));
    var be = $("#bootEye"); be.innerHTML = ""; be.appendChild(eye(31));
    fillEyes(document);
    var spots = [
      ["camera", 54, 6, 12, 1.4, 0], ["play", 46, 88, 8, 2, -.6], ["spark", 34, 82, 40, 1.1, -1.2], ["film", 42, 10, 46, 1.8, -.3],
      ["cup", 38, 92, 62, .8, -1.6], ["wand", 34, 4, 78, 1.2, -.9], ["brush", 28, 22, 26, 2.4, -2, 1], ["doc", 26, 72, 22, 2.6, -1.4, 1]
    ];
    buildFloaters($("#floaters"), spots);
    buildFloaters($("#ctaFloaters"), [["chat", 46, 6, 14, 1.6, 0], ["insta", 42, 88, 18, 2, -.8], ["mail", 34, 86, 74, 1.2, -1.4], ["spark", 26, 12, 76, 2.4, -.4, 1]]);
  }
  function buildFloaters(box, spots) {
    box.innerHTML = "";
    spots.forEach(function (f) {
      var w = el("div", "float" + (f[6] ? " dim" : ""));
      w.style.left = f[2] + "%"; w.style.top = f[3] + "%"; w.style.setProperty("--d", f[4]);
      var i = ico(f[0]); i.style.setProperty("--size", f[1] + "px"); i.style.setProperty("--delay", f[5] + "s");
      w.appendChild(i); box.appendChild(w);
    });
  }
  var reelBuilt = false;
  function renderReel() {
    if (reelBuilt) return; reelBuilt = true;
    var box = $("#reel");
    var v = document.createElement("video");
    v.src = src(P.showreel); v.poster = poster(P.showreel);
    v.muted = true; v.loop = true; v.autoplay = true; v.playsInline = true; v.setAttribute("playsinline", ""); v.preload = "metadata";
    box.appendChild(v);
    var hint = el("span", "reel-hint"); box.appendChild(hint);
    var b = el("button", "pbtn icon-btn"); b.type = "button"; b.setAttribute("aria-label", "Showreel sound");
    function paint() { b.innerHTML = ""; b.appendChild(ico(v.muted ? "soundOff" : "soundOn")); hint.textContent = v.muted ? "SOUND OFF" : "SOUND ON"; }
    b.onclick = function () { v.muted = !v.muted; box.classList.toggle("color", !v.muted); paint(); sfx("click"); if (v.paused) v.play(); };
    paint(); box.appendChild(b);
    var p = v.play(); if (p && p.catch) p.catch(function () {});
  }

  /* ---------- Pointer: eye tracking, parallax, text glow ---------- */
  var px = -9999, py = -9999, glowEls = [], ticking = false;
  function collectGlow() { glowEls = $$(".glow"); }
  function frame() {
    ticking = false;
    var vw = window.innerWidth, vh = window.innerHeight;
    // Pupils follow the pointer
    $$(".pix .iris").forEach(function (iris) {
      var r = iris.ownerSVGElement.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) return;
      var cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      var dx = px - cx, dy = py - cy, d = Math.max(1, Math.hypot(dx, dy));
      var w = iris.ownerSVGElement.viewBox.baseVal.width, k = Math.max(1, Math.round(w / 16));
      var m = Math.min(1, d / 300);
      iris.style.transform = px < -9000 ? "" : "translate(" + Math.round(dx / d * k * m) + "px," + Math.round(dy / d * k * m * .7) + "px)";
    });
    // Floaters drift away from the pointer
    var mx = (px / vw - .5) * -18, my = (py / vh - .5) * -18;
    $$(".floaters").forEach(function (b) { b.style.setProperty("--mx", mx.toFixed(1)); b.style.setProperty("--my", my.toFixed(1)); });
    // Text near the pointer lights up white
    glowEls.forEach(function (n) {
      var r = n.getBoundingClientRect();
      if (r.bottom < -50 || r.top > vh + 50) { n.classList.remove("lit"); return; }
      var dx = Math.max(r.left - px, 0, px - r.right), dy = Math.max(r.top - py, 0, py - r.bottom);
      n.classList.toggle("lit", dx * dx + dy * dy < 60 * 60);
    });
  }
  function queue() { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }
  window.addEventListener("pointermove", function (e) { if (e.pointerType === "touch") return; px = e.clientX; py = e.clientY; queue(); }, { passive: true });
  window.addEventListener("scroll", function () { if (canHover) queue(); }, { passive: true });
  // On touch screens, text in the middle of the screen lights up as you scroll.
  var midIO = !canHover && "IntersectionObserver" in window ? new IntersectionObserver(function (en) {
    en.forEach(function (e) { e.target.classList.toggle("lit", e.isIntersecting); });
  }, { rootMargin: "-38% 0px -38% 0px" }) : null;

  /* ---------- Collections ---------- */
  function renderCollections() {
    var root = $("#collections"); root.innerHTML = "";
    P.collections.forEach(function (c, ci) {
      var sec = el("section", "world" + (c.theme === "starbucks" ? " featured" : "")); sec.id = c.id;
      var head = el("div", "world-head");
      var left = el("div");
      var lab = el("span", "world-label"); lab.appendChild(document.createTextNode(UI[lang].world + " " + (ci + 1))); left.appendChild(lab);
      left.appendChild(el("h2", "glow", t(c.title)));
      left.appendChild(el("p", "world-intro glow", t(c.intro)));
      head.appendChild(left);
      var badge = el("div", "world-badge"); badge.appendChild(c.theme === "starbucks" ? ico("cup") : eye(31)); head.appendChild(badge);
      sec.appendChild(head);

      var levels = el("nav", "levels"); levels.setAttribute("aria-label", t(c.title)); sec.appendChild(levels);

      c.groups.forEach(function (g, gi) {
        var gid = c.id + "-" + (gi + 1);
        var a = el("a"); a.href = "#" + gid;
        a.appendChild(el("b", null, pad(gi + 1))); a.appendChild(document.createTextNode(lang === "ar" ? g.title.ar : g.title.en));
        a.addEventListener("mouseenter", hoverSfx); a.addEventListener("click", function () { sfx("step"); });
        levels.appendChild(a);

        var block = el("article", "level"); block.id = gid;
        var gh = el("div", "level-head");
        var l = el("div");
        var no = el("span", "lvl-no"); no.appendChild(document.createTextNode(UI[lang].level + " " + pad(gi + 1) + "/" + pad(c.groups.length)));
        var bar = el("span", "bar"); for (var b = 0; b < c.groups.length; b++) bar.appendChild(el("i", b <= gi ? "on" : null)); no.appendChild(bar);
        l.appendChild(no);
        var h = el("h3", "lvl-title"); h.appendChild(el("b", "glow", g.title.en)); h.appendChild(el("span", "glow", g.title.ar)); l.appendChild(h);
        l.appendChild(el("p", "lvl-desc glow", t(g.desc)));
        gh.appendChild(l);
        var tags = el("ul", "lvl-tags");
        t(g.tags).forEach(function (x) { tags.appendChild(el("li", null, x)); });
        tags.appendChild(el("li", null, g.items.length + " " + UI[lang].items));
        gh.appendChild(tags);
        block.appendChild(gh);

        var wrap = el("div", "rail-wrap");
        var rail = el("div", "rail");
        g.items.forEach(function (it, ii) { rail.appendChild(tile(g, it, ii)); });
        wrap.appendChild(rail);
        var prev = el("button", "pbtn icon-btn rail-btn prev"); prev.type = "button"; prev.setAttribute("aria-label", "Previous"); prev.appendChild(ico(lang === "ar" ? "next" : "prev"));
        var next = el("button", "pbtn icon-btn rail-btn next"); next.type = "button"; next.setAttribute("aria-label", "Next"); next.appendChild(ico(lang === "ar" ? "prev" : "next"));
        var dir = lang === "ar" ? -1 : 1;
        prev.onclick = function () { sfx("step"); rail.scrollBy({ left: -dir * rail.clientWidth * .8, behavior: "smooth" }); };
        next.onclick = function () { sfx("step"); rail.scrollBy({ left: dir * rail.clientWidth * .8, behavior: "smooth" }); };
        function sync() { var max = rail.scrollWidth - rail.clientWidth, x = Math.abs(rail.scrollLeft); prev.disabled = x < 8; next.disabled = x > max - 8; }
        rail.addEventListener("scroll", sync, { passive: true });
        wrap.appendChild(prev); wrap.appendChild(next);
        block.appendChild(wrap);
        sec.appendChild(block);
        requestAnimationFrame(sync);
      });
      root.appendChild(sec);
    });
    watchLevels();
  }

  function tile(g, it, idx) {
    var d = el("div", "tile"); d.tabIndex = 0; d.setAttribute("role", "button");
    d.style.setProperty("--r", it.r || 1);
    d.setAttribute("aria-label", g.title.en + " " + (idx + 1));
    var img = new Image(); img.src = poster(it); img.alt = g.title.en + " · " + g.title.ar; img.loading = "lazy"; img.decoding = "async";
    d.appendChild(img);
    d.appendChild(el("span", "tile-badge", it.v ? "▶ VIDEO" : "◼ PHOTO"));
    if (it.v) { var e = el("span", "tile-eye"); var s = el("span"); s.appendChild(eye(15)); e.appendChild(s); d.appendChild(e); d._item = it; }
    if (canHover) {
      d.addEventListener("mouseenter", function () { hoverSfx(); if (it.v) playTile(d); });
      d.addEventListener("mouseleave", function () { if (it.v) stopTile(d); });
    } else if (tileIO) tileIO.observe(d);
    d.onclick = function () { openLB(g, idx); };
    d.onkeydown = function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openLB(g, idx); } };
    return d;
  }
  function playTile(d) {
    var v = d.querySelector("video");
    if (!v) {
      v = document.createElement("video"); v.muted = true; v.loop = true; v.playsInline = true; v.setAttribute("playsinline", ""); v.preload = "auto";
      v.src = src(d._item);
      v.addEventListener("playing", function () { if (d._want) d.classList.add("playing"); });
      d.insertBefore(v, d.children[1]);
    }
    d._want = true; var p = v.play(); if (p && p.catch) p.catch(function () {});
  }
  function stopTile(d) { d._want = false; d.classList.remove("playing"); var v = d.querySelector("video"); if (v) v.pause(); }
  // Touch screens: the tile that is mostly on screen gets its colour back and previews.
  var tileIO = !canHover && "IntersectionObserver" in window ? new IntersectionObserver(function (en) {
    en.forEach(function (e) {
      var on = e.intersectionRatio > .7; e.target.classList.toggle("on", on);
      if (e.target._item) { if (on) playTile(e.target); else stopTile(e.target); }
    });
  }, { threshold: [0, .7, 1] }) : null;

  var levelIO = null, currentLevel = null;
  function watchLevels() {
    if (!("IntersectionObserver" in window)) return;
    if (levelIO) levelIO.disconnect();
    levelIO = new IntersectionObserver(function (en) {
      en.forEach(function (e) {
        if (!e.isIntersecting) return;
        var link = document.querySelector('.levels a[href="#' + e.target.id + '"]'); if (!link) return;
        $$("a", link.parentNode).forEach(function (a) { a.classList.toggle("on", a === link); });
        var bar = link.parentNode; bar.scrollTo({ left: link.offsetLeft - bar.clientWidth / 2 + link.clientWidth / 2, behavior: "smooth" });
        if (currentLevel && currentLevel !== e.target.id) sfx("level");
        currentLevel = e.target.id;
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    $$(".level").forEach(function (g) { levelIO.observe(g); });
  }

  /* ---------- Lightbox ---------- */
  var lb = $("#lightbox"), lbGroup = null, lbIdx = 0, lastFocus = null;
  function openLB(g, i) {
    lastFocus = document.activeElement; lbGroup = g; lbIdx = i;
    $$(".tile.playing").forEach(stopTile);
    lb.hidden = false; document.body.style.overflow = "hidden";
    sfx("open"); showLB(); $("#lbClose").focus();
  }
  function closeLB() {
    var v = $("#lbMedia video"); if (v) v.pause();
    lb.hidden = true; $("#lbMedia").innerHTML = ""; document.body.style.overflow = "";
    sfx("close"); if (lastFocus) lastFocus.focus();
  }
  function stepLB(d) { var n = lbGroup.items.length; lbIdx = (lbIdx + d + n) % n; sfx("step"); showLB(); }
  function showLB() {
    var it = lbGroup.items[lbIdx], m = $("#lbMedia"); m.innerHTML = "";
    if (it.v) {
      var v = document.createElement("video"); v.src = src(it); v.poster = poster(it); v.controls = true; v.autoplay = true; v.playsInline = true; v.setAttribute("playsinline", "");
      m.appendChild(v);
    } else { var img = new Image(); img.src = src(it); img.alt = lbGroup.title.en; m.appendChild(img); }
    var multi = lbGroup.items.length > 1;
    $("#lbPrev").style.visibility = multi ? "" : "hidden"; $("#lbNext").style.visibility = multi ? "" : "hidden";
    $("#lbCount").textContent = pad(lbIdx + 1) + " / " + pad(lbGroup.items.length);
    $("#lbTitle").textContent = lbGroup.title.en.toUpperCase();
    $("#lbDesc").textContent = shapeAr(t(lbGroup.desc));
  }
  function paintLBButtons() {
    $("#lbClose").innerHTML = ""; $("#lbClose").appendChild(ico("close"));
    $("#lbPrev").innerHTML = ""; $("#lbPrev").appendChild(ico(lang === "ar" ? "next" : "prev"));
    $("#lbNext").innerHTML = ""; $("#lbNext").appendChild(ico(lang === "ar" ? "prev" : "next"));
  }
  $("#lbClose").onclick = closeLB;
  $("#lbPrev").onclick = function () { stepLB(-1); };
  $("#lbNext").onclick = function () { stepLB(1); };
  lb.addEventListener("click", function (e) { if (e.target === lb || e.target.id === "lbMedia") closeLB(); });
  document.addEventListener("keydown", function (e) {
    if (lb.hidden) return;
    var rtl = lang === "ar";
    if (e.key === "Escape") closeLB();
    else if (e.key === "ArrowRight") stepLB(rtl ? -1 : 1);
    else if (e.key === "ArrowLeft") stepLB(rtl ? 1 : -1);
  });
  var tx = null;
  lb.addEventListener("touchstart", function (e) { tx = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener("touchend", function (e) {
    if (tx == null || !lbGroup || lbGroup.items.length < 2) return;
    var dx = e.changedTouches[0].clientX - tx; tx = null;
    if (Math.abs(dx) > 60) stepLB((dx < 0) === (lang !== "ar") ? 1 : -1);
  });

  /* ---------- About ---------- */
  function renderAbout() {
    var box = $("#aboutImg"); $$("img", box).forEach(function (i) { i.remove(); });
    var img = new Image(); img.src = src(P.about.image); img.alt = t(P.name); img.loading = "lazy"; box.insertBefore(img, box.firstChild);
  }

  /* ---------- Sound + language buttons ---------- */
  function paintSound() { var b = $("#soundBtn"); b.innerHTML = ""; b.appendChild(ico(sfxOn ? "soundOn" : "soundOff")); b.setAttribute("aria-pressed", String(sfxOn)); b.title = UI[lang].sound; }
  $("#soundBtn").onclick = function () {
    sfxOn = !sfxOn; try { localStorage.setItem("zm-sfx", sfxOn ? "1" : "0"); } catch (e) {}
    if (sfxOn) { audio(); sfx("click"); } paintSound();
  };
  $("#langBtn").onclick = function () {
    lang = lang === "ar" ? "en" : "ar"; try { localStorage.setItem("zm-lang", lang); } catch (e) {}
    sfx("click"); render();
  };
  document.addEventListener("click", function (e) { var a = e.target.closest && e.target.closest("[data-sfx]"); if (a) sfx(a.dataset.sfx); });
  document.addEventListener("mouseover", function (e) { var a = e.target.closest && e.target.closest(".pbtn, .nav-links a, .brand"); if (a && !a.contains(e.relatedTarget)) hoverSfx(); });

  /* ---------- Boot ---------- */
  var boot = $("#boot");
  function endBoot(withSound) { if (boot.classList.contains("done")) return; if (withSound) { audio(); sfx("start"); } boot.classList.add("done"); }
  boot.addEventListener("pointerdown", function () { endBoot(true); });
  window.addEventListener("keydown", function () { endBoot(true); }, { once: true });
  setTimeout(function () { endBoot(false); }, reduced ? 0 : 2600);

  /* ---------- Cursor ---------- */
  var root = document.documentElement.style;
  root.setProperty("--cur", svgURI(CURSOR, solid(CURSOR), 2) + " 0 0, auto");
  root.setProperty("--cur-hand", svgURI(HAND, solid(HAND), 2) + " 8 0, pointer");
  var fav = document.createElement("link"); fav.rel = "icon";
  fav.href = svgURI(LOGO["31"].eye.map(function (r, y) { return r.split("").map(function (c, x) { return c === "#" || LOGO["31"].iris[y][x] === "#" ? "#" : "."; }).join(""); }), null, 2).slice(5, -2);
  document.head.appendChild(fav);

  function render() {
    renderStatic();
    renderCollections();
    renderAbout();
    renderHero();
    paintSound();
    paintLBButtons();
    shapeTree(document.body);
    collectGlow();
    if (midIO) { midIO.disconnect(); glowEls.forEach(function (n) { midIO.observe(n); }); }
  }
  render();
  renderReel();
})();
