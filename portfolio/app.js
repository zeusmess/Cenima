(function () {
  "use strict";
  var P = window.PORTFOLIO;
  var $ = function (s) { return document.querySelector(s); };
  var $$ = function (s) { return Array.prototype.slice.call(document.querySelectorAll(s)); };

  var UI = {
    ar: {
      navWorks: "الأعمال", navAbout: "عنّي", navContact: "تواصل",
      ctaWorks: "شوف الأعمال", ctaContact: "اشتغل معايا",
      worksTitle: "أعمال مختارة", aboutTitle: "عنّي", contactTitle: "يلا نشتغل سوا",
      contactLead: "عندك فكرة أو مشروع؟ ابعتلي وهرد عليك في أسرع وقت.",
      whatsapp: "كلمني واتساب", backTop: "لفوق ↑", all: "الكل", lang: "EN"
    },
    en: {
      navWorks: "Work", navAbout: "About", navContact: "Contact",
      ctaWorks: "View work", ctaContact: "Work with me",
      worksTitle: "Selected Work", aboutTitle: "About", contactTitle: "Let's create together",
      contactLead: "Have an idea or a project? Send me a message and I'll get back to you soon.",
      whatsapp: "Chat on WhatsApp", backTop: "Back to top ↑", all: "All", lang: "عربي"
    }
  };

  var lang = (function () {
    try { return localStorage.getItem("pf-lang") || P.defaultLang || "ar"; } catch (e) { return P.defaultLang || "ar"; }
  })();
  var filter = "all";
  var visible = [];
  var current = 0;

  function t(v) { return v && typeof v === "object" && !Array.isArray(v) ? (v[lang] || v.en || v.ar || "") : (v || ""); }
  function get(path) { return path.split(".").reduce(function (o, k) { return o && o[k]; }, P); }
  function catName(id) {
    var c = P.categories.filter(function (x) { return x.id === id; })[0];
    return c ? c[lang] : "";
  }
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  // An <img> that turns into a styled placeholder if the file is missing.
  function picture(src, label, eager) {
    var wrap = document.createDocumentFragment();
    var ph = el("div", "ph");
    var b = el("b", null, label || "");
    ph.appendChild(b);
    ph.appendChild(document.createTextNode(src || ""));
    if (!src) { wrap.appendChild(ph); return wrap; }
    var img = new Image();
    img.alt = label || "";
    img.decoding = "async";
    if (!eager) img.loading = "lazy";
    img.onerror = function () { if (img.parentNode) img.parentNode.replaceChild(ph, img); };
    img.src = src;
    wrap.appendChild(img);
    return wrap;
  }

  function renderStatic() {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.title = t(P.name) + " — " + t(P.role);
    $$("[data-i18n]").forEach(function (n) { n.textContent = UI[lang][n.dataset.i18n]; });
    $$("[data-bind]").forEach(function (n) { n.textContent = t(get(n.dataset.bind)); });
    $("#langBtn").textContent = UI[lang].lang;

    var stats = $("#stats"); stats.innerHTML = "";
    (P.stats || []).forEach(function (s) {
      var li = el("li"); li.appendChild(el("strong", null, s.value)); li.appendChild(el("span", null, t(s.label)));
      stats.appendChild(li);
    });

    var mq = $("#marquee"); mq.innerHTML = "";
    var words = P.categories.map(function (c) { return c[lang]; });
    for (var i = 0; i < 4; i++) words.forEach(function (w) { mq.appendChild(el("span", null, w)); });

    var skills = $("#skills"); skills.innerHTML = "";
    t(P.about.skills).forEach(function (s) { skills.appendChild(el("li", null, s)); });

    var mail = $("#mail"); mail.textContent = P.contact.email; mail.href = "mailto:" + P.contact.email;
    var wa = $("#whatsapp");
    if (P.contact.whatsapp) wa.href = "https://wa.me/" + P.contact.whatsapp; else wa.remove();
    var soc = $("#socials"); soc.innerHTML = "";
    (P.contact.socials || []).forEach(function (s) {
      var li = el("li"); var a = el("a", null, s.label);
      a.href = s.url; a.target = "_blank"; a.rel = "noopener"; li.appendChild(a); soc.appendChild(li);
    });
    $("#year").textContent = new Date().getFullYear();
  }

  function renderFilters() {
    var box = $("#filters"); box.innerHTML = "";
    var cats = [{ id: "all", label: UI[lang].all, n: P.works.length }].concat(P.categories.map(function (c) {
      return { id: c.id, label: c[lang], n: P.works.filter(function (w) { return w.category === c.id; }).length };
    })).filter(function (c) { return c.n > 0; });
    cats.forEach(function (c) {
      var b = el("button", "chip", c.label);
      b.type = "button"; b.setAttribute("role", "tab");
      b.setAttribute("aria-selected", String(c.id === filter));
      b.appendChild(el("sup", null, String(c.n)));
      b.onclick = function () { filter = c.id; renderFilters(); applyFilter(); };
      box.appendChild(b);
    });
  }

  function renderGrid() {
    var grid = $("#grid"); grid.innerHTML = "";
    P.works.forEach(function (w, i) {
      var card = el("article", "card reveal" + (w.ratio ? " " + w.ratio : ""));
      card.tabIndex = 0;
      card.dataset.cat = w.category;
      card.dataset.i = i;
      var frame = el("div", "frame");
      frame.appendChild(picture(w.image, t(w.title)));
      card.appendChild(frame);
      card.appendChild(el("span", "idx", String(i + 1).padStart(2, "0")));
      var ov = el("div", "overlay");
      ov.appendChild(el("small", null, catName(w.category) + (w.year ? " · " + w.year : "")));
      ov.appendChild(el("h3", null, t(w.title)));
      card.appendChild(ov);
      card.onclick = function () { open(i); };
      card.onkeydown = function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(i); } };
      grid.appendChild(card);
    });
    applyFilter();
    observeReveals();
  }

  function applyFilter() {
    visible = [];
    $$(".card").forEach(function (c) {
      var show = filter === "all" || c.dataset.cat === filter;
      c.classList.toggle("hide", !show);
      if (show) visible.push(+c.dataset.i);
    });
  }

  function renderHero() {
    var h = $("#heroMedia"); h.innerHTML = "";
    h.appendChild(picture(P.heroImage, "", true));
    var a = $("#aboutImg"); a.innerHTML = "";
    a.appendChild(picture(P.about.image, t(P.name)));
  }

  // Lightbox
  var lb = $("#lightbox");
  var lastFocus = null;
  function open(i) {
    lastFocus = document.activeElement;
    current = Math.max(0, visible.indexOf(i));
    lb.hidden = false;
    requestAnimationFrame(function () { lb.classList.add("open"); });
    document.body.style.overflow = "hidden";
    show();
    $("#lbClose").focus();
  }
  function close() {
    lb.classList.remove("open");
    document.body.style.overflow = "";
    setTimeout(function () { lb.hidden = true; }, 300);
    if (lastFocus) lastFocus.focus();
  }
  function step(d) { current = (current + d + visible.length) % visible.length; show(); }
  function show() {
    var w = P.works[visible[current]];
    var m = $("#lbMedia"); m.innerHTML = "";
    m.appendChild(picture(w.image, t(w.title), true));
    $("#lbCount").textContent = String(current + 1).padStart(2, "0") + " / " + String(visible.length).padStart(2, "0");
    $("#lbTitle").textContent = t(w.title);
    $("#lbDesc").textContent = t(w.description);
    $("#lbMeta").textContent = [catName(w.category), w.client, w.year].filter(Boolean).join(" · ");
  }
  $("#lbClose").onclick = close;
  $("#lbPrev").onclick = function () { step(-1); };
  $("#lbNext").onclick = function () { step(1); };
  lb.addEventListener("click", function (e) { if (e.target === lb || e.target.classList.contains("lb-media")) close(); });
  document.addEventListener("keydown", function (e) {
    if (lb.hidden) return;
    var rtl = lang === "ar";
    if (e.key === "Escape") close();
    else if (e.key === "ArrowRight") step(rtl ? -1 : 1);
    else if (e.key === "ArrowLeft") step(rtl ? 1 : -1);
  });
  var tx = null;
  lb.addEventListener("touchstart", function (e) { tx = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener("touchend", function (e) {
    if (tx == null) return;
    var dx = e.changedTouches[0].clientX - tx; tx = null;
    if (Math.abs(dx) > 50) step((dx < 0) === (lang !== "ar") ? 1 : -1);
  });

  // Scroll reveal
  var io = "IntersectionObserver" in window ? new IntersectionObserver(function (entries) {
    entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
  }, { threshold: 0.12 }) : null;
  function observeReveals() {
    $$(".reveal:not(.in)").forEach(function (n, k) {
      if (io) { n.style.transitionDelay = (n.classList.contains("card") ? (k % 3) * 90 : 0) + "ms"; io.observe(n); }
      else n.classList.add("in");
    });
  }

  // Nav background on scroll
  var nav = $("#nav");
  function onScroll() { nav.classList.toggle("scrolled", window.scrollY > 40); }
  window.addEventListener("scroll", onScroll, { passive: true });

  $("#langBtn").onclick = function () {
    lang = lang === "ar" ? "en" : "ar";
    try { localStorage.setItem("pf-lang", lang); } catch (e) {}
    render();
  };

  function render() {
    renderStatic();
    renderFilters();
    renderGrid();
    renderHero();
    $$(".hero .reveal").forEach(function (n) { n.classList.add("in"); });
  }

  render();
  onScroll();
})();
