(function () {
  "use strict";
  var P = window.PORTFOLIO;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var canHover = window.matchMedia("(hover: hover)").matches;

  var UI = {
    ar: {
      nav: [["#services", "خدماتي"], ["#starbucks", "ستاربكس"], ["#work", "أعمالي"], ["#about", "عنّي"], ["#contact", "تواصل"]],
      available: "متاح لمشاريع جديدة", ctaWorks: "شوف الشغل", ctaContact: "يلا نشتغل",
      servicesKicker: "بعمل إيه", servicesTitle: "كل اللي محتاجه في مكان واحد",
      aboutKicker: "عنّي", contactKicker: "تواصل", contactTitle: "عندك فكرة؟ يلا نعملها",
      contactLead: "ابعتلي على واتساب أو انستجرام، وهرد عليك بسرعة.",
      whatsapp: "كلمني واتساب", backTop: "لفوق ↑", lang: "EN", video: "فيديو", photo: "صورة", items: "عمل"
    },
    en: {
      nav: [["#services", "Services"], ["#starbucks", "Starbucks"], ["#work", "Work"], ["#about", "About"], ["#contact", "Contact"]],
      available: "Available for new projects", ctaWorks: "See the work", ctaContact: "Let's work",
      servicesKicker: "What I do", servicesTitle: "Everything you need, in one place",
      aboutKicker: "About me", contactKicker: "Contact", contactTitle: "Got an idea? Let's make it",
      contactLead: "Message me on WhatsApp or Instagram and I'll get back to you fast.",
      whatsapp: "Chat on WhatsApp", backTop: "Back to top ↑", lang: "عربي", video: "Video", photo: "Photo", items: "pieces"
    }
  };

  // Glyphs for the 3D clay icons (24×24, filled)
  var GLYPH = {
    camera: "M9 4 7.5 6H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-2.5L15 4H9Zm3 4.5a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9Zm0 2.2a2.3 2.3 0 1 0 0 4.6 2.3 2.3 0 0 0 0-4.6Z",
    play: "M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5Z",
    film: "M4 9h16v10a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9Zm-.4-4.6 15.3-2.6a1 1 0 0 1 1.2.8l.4 2.2L4.3 7.6l-.4-2a1 1 0 0 1 .7-1.2Z",
    wand: "M3 19.5 14.5 8l1.5 1.5L4.5 21 3 19.5ZM16 2l1 2.5 2.5 1-2.5 1L16 9l-1-2.5-2.5-1 2.5-1L16 2Zm4 8 .6 1.4 1.4.6-1.4.6L20 14l-.6-1.4-1.4-.6 1.4-.6L20 10Z",
    spark: "M12 2l2.2 6.3 6.3 2.2-6.3 2.2L12 19l-2.2-6.3-6.3-2.2 6.3-2.2L12 2Zm7 13 1 2.5 2.5 1-2.5 1L19 22l-1-2.5-2.5-1 2.5-1L19 15Z",
    brush: "M20.7 3.3a1 1 0 0 0-1.4 0L10 12.6l1.4 1.4 9.3-9.3a1 1 0 0 0 0-1.4ZM8.5 14A3.5 3.5 0 0 0 5 17.5c0 1.2-.8 2-2 2.5 1 .6 2.3 1 3.5 1a4 4 0 0 0 4-4 3 3 0 0 0-2-3Z",
    doc: "M6 2h8l5 5v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Zm2 9v2h8v-2H8Zm0 4v2h6v-2H8Z",
    cup: "M5 8h14l-1.6 12.2A2 2 0 0 1 15.4 22H8.6a2 2 0 0 1-2-1.8L5 8Zm-1-3h16v2H4V5Zm3-3h10l1 2H6l1-2Z",
    insta: "M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Zm5 5a5 5 0 1 0 0 10 5 5 0 0 0 0-10Zm0 2a3 3 0 1 1 0 6 3 3 0 0 1 0-6Zm5.5-3.6a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 0 0 0-2.4Z",
    chat: "M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm-3.4 5.5c.3 0 .6 0 .8.5l1 2.3c.1.3 0 .6-.2.8l-.7.8c.8 1.5 2 2.6 3.5 3.4l.8-.8c.2-.2.5-.3.8-.2l2.3 1c.4.2.5.5.5.8 0 1.4-1.3 2.4-2.6 2.3-4-.4-7.3-3.7-7.6-7.6-.1-1.3.9-2.6 2.2-2.6h.2Z",
    mail: "M3 5h18a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Zm1 2.4V17h16V7.4l-8 5.3-8-5.3Z",
    soundOn: "M4 9h4l5-4v14l-5-4H4V9Zm12.5-1.5a6 6 0 0 1 0 9l-1.4-1.4a4 4 0 0 0 0-6.2l1.4-1.4Z",
    soundOff: "M4 9h4l5-4v14l-5-4H4V9Zm11.3.7 1.4-1.4L19 10.6l2.3-2.3 1.4 1.4-2.3 2.3 2.3 2.3-1.4 1.4-2.3-2.3-2.3 2.3-1.4-1.4 2.3-2.3-2.3-2.3Z"
  };
  var SERVICE_COLOR = { film: "pink", camera: "violet", wand: "orange", play: "cyan", spark: "lime", brush: "blue", doc: "green" };
  var ARROW = '<svg viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>';

  var lang = (function () {
    try { return localStorage.getItem("zm-lang") || P.defaultLang || "ar"; } catch (e) { return P.defaultLang || "ar"; }
  })();

  function t(v) { return v && typeof v === "object" && !Array.isArray(v) ? (v[lang] != null ? v[lang] : v.en) : (v || ""); }
  function get(path) { return path.split(".").reduce(function (o, k) { return o && o[k]; }, P); }
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function svg(name) {
    var ns = "http://www.w3.org/2000/svg";
    var s = document.createElementNS(ns, "svg"); s.setAttribute("viewBox", "0 0 24 24"); s.setAttribute("aria-hidden", "true");
    var p = document.createElementNS(ns, "path"); p.setAttribute("d", GLYPH[name]); p.setAttribute("fill-rule", "evenodd");
    s.appendChild(p); return s;
  }
  function icon(name, color, extra) {
    var d = el("span", "ico c-" + (color || "violet") + (extra ? " " + extra : ""));
    d.appendChild(svg(name)); return d;
  }
  function src(item) { return "media/" + (item.v || item.i) + (item.v ? ".mp4" : ".webp"); }
  function poster(item) { return "media/" + (item.v || item.i) + ".webp"; }
  function pad(n) { return String(n).padStart(2, "0"); }

  /* ---------- Floating 3D objects ---------- */
  var FLOAT_SPOTS = [
    { k: "ico", g: "camera", c: "violet", s: 92, x: 7, y: 16, d: 1.4, r: -12 },
    { k: "ico", g: "play", c: "pink", s: 78, x: 86, y: 12, d: 2, r: 10 },
    { k: "ico", g: "spark", c: "lime", s: 64, x: 80, y: 44, d: 1.1, r: -6 },
    { k: "ico", g: "film", c: "cyan", s: 70, x: 12, y: 52, d: 1.8, r: 8 },
    { k: "ico", g: "cup", c: "green", s: 58, x: 92, y: 70, d: .8, r: -10 },
    { k: "ico", g: "wand", c: "orange", s: 54, x: 3, y: 80, d: 1.2, r: 12 },
    { k: "orb", c1: "#c6ff3d", c2: "#3f6212", s: 46, x: 24, y: 8, d: 2.4 },
    { k: "orb", c1: "#ffb3d6", c2: "#be185d", s: 34, x: 70, y: 26, d: 2.8 },
    { k: "torus", s: 120, x: 88, y: 88, d: .6, r: 20 },
    { k: "star4", c: "#c6ff3d", s: 30, x: 30, y: 62, d: 3 },
    { k: "star4", c: "#2ee6ff", s: 22, x: 66, y: 6, d: 3.2 }
  ];
  function buildFloaters(box, spots) {
    box.innerHTML = "";
    spots.forEach(function (f, i) {
      var w = el("div", "float");
      w.style.left = f.x + "%"; w.style.top = f.y + "%";
      w.style.setProperty("--d", f.d);
      var inner;
      if (f.k === "ico") { inner = icon(f.g, f.c); }
      else { inner = el("span", f.k); if (f.c1) { inner.style.setProperty("--c1", f.c1); inner.style.setProperty("--c2", f.c2); } if (f.c) inner.style.setProperty("--c", f.c); }
      inner.style.setProperty("--s", f.s + "px");
      inner.style.setProperty("--rot", (f.r || 0) + "deg");
      inner.style.setProperty("--delay", (-i * .7) + "s");
      w.appendChild(inner);
      box.appendChild(w);
    });
  }
  window.addEventListener("pointermove", function (e) {
    if (e.pointerType !== "mouse") return;
    var x = (e.clientX / window.innerWidth - .5) * -24, y = (e.clientY / window.innerHeight - .5) * -24;
    $$(".floaters, .cta-floaters, .coll-floaters").forEach(function (b) { b.style.setProperty("--px", x.toFixed(1)); b.style.setProperty("--py", y.toFixed(1)); });
  }, { passive: true });

  /* ---------- Static text ---------- */
  function renderStatic() {
    var U = UI[lang];
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.title = P.nickname + " · " + t(P.role);
    $$("[data-i18n]").forEach(function (n) { n.textContent = U[n.dataset.i18n]; });
    $$("[data-bind]").forEach(function (n) { var v = get(n.dataset.bind); n.textContent = typeof v === "string" ? v : t(v); });
    $("#langBtn").textContent = U.lang;

    var nav = $("#navLinks"); nav.innerHTML = "";
    U.nav.forEach(function (l) { var a = el("a", null, l[1]); a.href = l[0]; nav.appendChild(a); });

    var chips = $("#roleChips"); chips.innerHTML = "";
    t(P.role).split(" · ").forEach(function (r, i) {
      var li = el("li"); li.appendChild(icon(["film", "camera", "spark"][i % 3], ["pink", "violet", "lime"][i % 3])); li.appendChild(document.createTextNode(r)); chips.appendChild(li);
    });

    var words = P.services.map(function (s) { return s.en; });
    ["#tape1", "#tape2"].forEach(function (id, k) {
      var tr = $(id); tr.innerHTML = "";
      var list = k ? words.slice().reverse() : words;
      for (var i = 0; i < 4; i++) list.forEach(function (w) { tr.appendChild(el("span", null, w)); });
    });

    var bento = $("#bento"); bento.innerHTML = "";
    P.services.forEach(function (s) {
      var c = el("article", "svc reveal");
      c.appendChild(icon(s.icon, SERVICE_COLOR[s.icon]));
      c.appendChild(el("h3", null, s[lang]));
      c.appendChild(el("p", null, t(s.d)));
      bento.appendChild(c);
    });

    var skills = $("#skills"); skills.innerHTML = "";
    P.services.forEach(function (s) { var li = el("li"); li.appendChild(icon(s.icon, SERVICE_COLOR[s.icon])); li.appendChild(document.createTextNode(s[lang])); skills.appendChild(li); });

    var wa = $("#whatsapp"); wa.innerHTML = ""; wa.hidden = !P.contact.whatsapp;
    if (P.contact.whatsapp) { wa.href = "https://wa.me/" + P.contact.whatsapp; wa.appendChild(svg("chat")); wa.appendChild(document.createTextNode(U.whatsapp)); }
    var mail = $("#mail"); mail.innerHTML = ""; mail.hidden = !P.contact.email;
    if (P.contact.email) { mail.href = "mailto:" + P.contact.email; mail.appendChild(svg("mail")); mail.appendChild(document.createTextNode(P.contact.email)); }
    var soc = $("#socials"); soc.innerHTML = "";
    (P.contact.socials || []).forEach(function (s) {
      var li = el("li"); var a = el("a"); a.href = s.url; a.target = "_blank"; a.rel = "noopener";
      a.appendChild(icon("insta", "pink", "round")); a.appendChild(document.createTextNode(s.label)); li.appendChild(a); soc.appendChild(li);
    });
    $("#year").textContent = new Date().getFullYear();
  }

  /* ---------- Hero showreel ---------- */
  var reelBuilt = false;
  function renderReel() {
    if (reelBuilt) return; reelBuilt = true;
    var box = $("#reel");
    var v = document.createElement("video");
    v.src = src(P.showreel); v.poster = poster(P.showreel);
    v.muted = true; v.loop = true; v.autoplay = true; v.playsInline = true; v.setAttribute("playsinline", ""); v.preload = "metadata";
    box.appendChild(v);
    var b = el("button", "reel-sound"); b.type = "button"; b.setAttribute("aria-label", "Sound"); b.appendChild(svg("soundOff"));
    b.onclick = function () { v.muted = !v.muted; b.innerHTML = ""; b.appendChild(svg(v.muted ? "soundOff" : "soundOn")); if (v.paused) v.play(); };
    box.appendChild(b);
    var p = v.play(); if (p && p.catch) p.catch(function () {});
  }
  function onScrollReel() {
    var p = Math.min(1, Math.max(0, window.scrollY / (window.innerHeight * .6)));
    var r = $("#reel"); r.style.setProperty("--tilt", (24 * (1 - p)).toFixed(2) + "deg"); r.style.setProperty("--scale", (.92 + .08 * p).toFixed(3));
  }

  /* ---------- Collections ---------- */
  var groupsFlat = [];
  function renderCollections() {
    var root = $("#collections"); root.innerHTML = "";
    groupsFlat = [];
    P.collections.forEach(function (c) {
      var sec = el("section", "collection " + (c.theme || "default")); sec.id = c.id;
      var head = el("div", "coll-head reveal");
      var left = el("div");
      left.appendChild(el("span", "kicker", t(c.kicker)));
      left.appendChild(el("h2", "coll-title", t(c.title)));
      left.appendChild(el("p", "coll-intro", t(c.intro)));
      head.appendChild(left);
      var badge = el("div", "coll-badge");
      if (c.theme === "starbucks") badge.appendChild(icon("cup", "green"));
      else badge.appendChild(icon("spark", "violet"));
      head.appendChild(badge);
      sec.appendChild(head);

      var chapters = el("nav", "chapters");
      sec.appendChild(chapters);

      c.groups.forEach(function (g, gi) {
        var gid = c.id + "-" + (gi + 1);
        var a = el("a", null, (lang === "ar" ? t(g.title) : g.title.en)); a.href = "#" + gid; chapters.appendChild(a);
        groupsFlat.push(g);

        var block = el("article", "group"); block.id = gid;
        var gh = el("div", "group-head reveal");
        gh.appendChild(el("span", "g-num", pad(gi + 1)));
        var h = el("h3", "g-title"); h.appendChild(el("b", null, g.title.en)); h.appendChild(el("span", null, g.title.ar)); gh.appendChild(h);
        var tags = el("ul", "g-tags");
        t(g.tags).forEach(function (x) { tags.appendChild(el("li", null, x)); });
        tags.appendChild(el("li", null, g.items.length + " " + UI[lang].items));
        gh.appendChild(tags);
        gh.appendChild(el("p", "g-desc", t(g.desc)));
        block.appendChild(gh);

        var wrap = el("div", "rail-wrap");
        var rail = el("div", "rail");
        g.items.forEach(function (it, ii) { rail.appendChild(tile(g, it, ii)); });
        wrap.appendChild(rail);
        var prev = el("button", "rail-btn prev"); prev.type = "button"; prev.innerHTML = ARROW; prev.setAttribute("aria-label", "Previous");
        var next = el("button", "rail-btn next"); next.type = "button"; next.innerHTML = ARROW; next.setAttribute("aria-label", "Next");
        (lang === "ar" ? next : prev).firstChild.style.transform = "scaleX(-1)";
        var dir = lang === "ar" ? -1 : 1;
        prev.onclick = function () { rail.scrollBy({ left: -dir * rail.clientWidth * .8, behavior: "smooth" }); };
        next.onclick = function () { rail.scrollBy({ left: dir * rail.clientWidth * .8, behavior: "smooth" }); };
        function sync() {
          var max = rail.scrollWidth - rail.clientWidth, x = Math.abs(rail.scrollLeft);
          prev.disabled = x < 8; next.disabled = x > max - 8;
        }
        rail.addEventListener("scroll", sync, { passive: true });
        wrap.appendChild(prev); wrap.appendChild(next);
        block.appendChild(wrap);
        sec.appendChild(block);
        requestAnimationFrame(sync);
      });
      root.appendChild(sec);
    });
    watchChapters();
  }

  function tile(g, it, idx) {
    var d = el("div", "tile"); d.tabIndex = 0; d.setAttribute("role", "button");
    d.style.setProperty("--r", it.r || 1);
    d.setAttribute("aria-label", g.title.en + " " + (idx + 1));
    var img = new Image(); img.src = poster(it); img.alt = t(g.title); img.loading = "lazy"; img.decoding = "async";
    d.appendChild(img);
    var badge = el("span", "tile-badge"); badge.appendChild(svg(it.v ? "play" : "camera")); badge.appendChild(document.createTextNode(it.v ? UI[lang].video : UI[lang].photo));
    d.appendChild(badge);
    if (it.v) {
      var pl = el("span", "tile-play"); pl.appendChild(icon("play", "pink", "round")); d.appendChild(pl);
      d._item = it;
      if (canHover) {
        d.addEventListener("mouseenter", function () { playTile(d); });
        d.addEventListener("mouseleave", function () { stopTile(d); });
      } else if (touchIO) touchIO.observe(d);
    }
    if (canHover) {
      d.addEventListener("pointermove", function (e) {
        var r = d.getBoundingClientRect();
        d.style.setProperty("--ry", (((e.clientX - r.left) / r.width - .5) * 10).toFixed(2) + "deg");
        d.style.setProperty("--rx", (((e.clientY - r.top) / r.height - .5) * -10).toFixed(2) + "deg");
      });
      d.addEventListener("pointerleave", function () { d.style.setProperty("--rx", "0deg"); d.style.setProperty("--ry", "0deg"); });
    }
    d.onclick = function () { openLB(g, idx); };
    d.onkeydown = function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openLB(g, idx); } };
    return d;
  }
  function playTile(d) {
    var v = d.querySelector("video");
    if (!v) {
      v = document.createElement("video");
      v.muted = true; v.loop = true; v.playsInline = true; v.setAttribute("playsinline", ""); v.preload = "auto";
      v.src = src(d._item);
      v.addEventListener("playing", function () { if (d._want) d.classList.add("playing"); });
      d.insertBefore(v, d.children[1]);
    }
    d._want = true;
    var p = v.play(); if (p && p.catch) p.catch(function () {});
  }
  function stopTile(d) {
    d._want = false; d.classList.remove("playing");
    var v = d.querySelector("video"); if (v) v.pause();
  }
  // On touch screens, preview videos that are mostly on screen.
  var touchIO = !canHover && "IntersectionObserver" in window ? new IntersectionObserver(function (en) {
    en.forEach(function (e) { if (e.intersectionRatio > .7) playTile(e.target); else stopTile(e.target); });
  }, { threshold: [0, .7, 1] }) : null;

  var chapterIO = null;
  function watchChapters() {
    if (!("IntersectionObserver" in window)) return;
    if (chapterIO) chapterIO.disconnect();
    chapterIO = new IntersectionObserver(function (en) {
      en.forEach(function (e) {
        if (!e.isIntersecting) return;
        var link = document.querySelector('.chapters a[href="#' + e.target.id + '"]');
        if (!link) return;
        $$("a", link.parentNode).forEach(function (a) { a.classList.toggle("on", a === link); });
        var bar = link.parentNode, off = link.offsetLeft - bar.clientWidth / 2 + link.clientWidth / 2;
        bar.scrollTo({ left: off, behavior: "smooth" });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    $$(".group").forEach(function (g) { chapterIO.observe(g); });
  }

  /* ---------- Lightbox ---------- */
  var lb = $("#lightbox"), lbGroup = null, lbIdx = 0, lastFocus = null;
  function openLB(g, i) {
    lastFocus = document.activeElement; lbGroup = g; lbIdx = i;
    $$(".tile.playing").forEach(stopTile);
    lb.hidden = false; requestAnimationFrame(function () { lb.classList.add("open"); });
    document.body.style.overflow = "hidden";
    showLB(); $("#lbClose").focus();
  }
  function closeLB() {
    var v = $("#lbMedia video"); if (v) v.pause();
    lb.classList.remove("open"); document.body.style.overflow = "";
    setTimeout(function () { lb.hidden = true; $("#lbMedia").innerHTML = ""; }, 300);
    if (lastFocus) lastFocus.focus();
  }
  function stepLB(dir) { var n = lbGroup.items.length; lbIdx = (lbIdx + dir + n) % n; showLB(); }
  function showLB() {
    var it = lbGroup.items[lbIdx], m = $("#lbMedia"); m.innerHTML = "";
    if (it.v) {
      var v = document.createElement("video");
      v.src = src(it); v.poster = poster(it); v.controls = true; v.autoplay = true; v.playsInline = true; v.setAttribute("playsinline", "");
      m.appendChild(v);
    } else {
      var img = new Image(); img.src = src(it); img.alt = t(lbGroup.title); m.appendChild(img);
    }
    var multi = lbGroup.items.length > 1;
    $("#lbPrev").hidden = !multi; $("#lbNext").hidden = !multi;
    $("#lbCount").textContent = pad(lbIdx + 1) + " / " + pad(lbGroup.items.length);
    $("#lbTitle").textContent = lbGroup.title.en + " · " + lbGroup.title.ar;
    $("#lbDesc").textContent = t(lbGroup.desc);
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
    var box = $("#aboutImg"); box.innerHTML = "";
    var img = new Image(); img.src = src(P.about.image); img.alt = t(P.name); img.loading = "lazy"; box.appendChild(img);
  }

  /* ---------- Reveal ---------- */
  var io = "IntersectionObserver" in window ? new IntersectionObserver(function (en) {
    en.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
  }, { threshold: .12 }) : null;
  function observeReveals() {
    $$(".reveal:not(.in)").forEach(function (n, k) {
      if (!io) { n.classList.add("in"); return; }
      if (n.classList.contains("svc")) n.style.transitionDelay = (k % 4) * 70 + "ms";
      io.observe(n);
    });
  }

  function render() {
    renderStatic();
    renderCollections();
    renderAbout();
    $$(".hero .reveal").forEach(function (n, i) { n.style.transitionDelay = i * 80 + "ms"; });
    observeReveals();
  }

  $("#langBtn").onclick = function () {
    lang = lang === "ar" ? "en" : "ar";
    try { localStorage.setItem("zm-lang", lang); } catch (e) {}
    render();
    $$(".reveal").forEach(function (n) { n.classList.add("in"); });
  };

  buildFloaters($("#floaters"), FLOAT_SPOTS);
  buildFloaters($("#ctaFloaters"), [
    { k: "ico", g: "chat", c: "lime", s: 70, x: 6, y: 14, d: 1.6, r: -12 },
    { k: "ico", g: "insta", c: "pink", s: 64, x: 88, y: 18, d: 2, r: 12 },
    { k: "ico", g: "mail", c: "cyan", s: 54, x: 84, y: 72, d: 1.2, r: -8 },
    { k: "orb", c1: "#c4b5fd", c2: "#5b21b6", s: 48, x: 10, y: 74, d: 2.4 },
    { k: "star4", c: "#c6ff3d", s: 26, x: 22, y: 40, d: 3 }
  ]);
  render();
  renderReel();
  window.addEventListener("scroll", onScrollReel, { passive: true });
  onScrollReel();
})();
