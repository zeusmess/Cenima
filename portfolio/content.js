/*
 * ✏️ ده الملف الوحيد اللي محتاج تعدّله.
 *    This is the only file you need to edit.
 *
 * الصور والفيديوهات في فولدر media/
 *   { v: "اسم-الفيديو", r: 0.56 }  ← فيديو (media/اسم-الفيديو.mp4 + صورة غلاف .webp بنفس الاسم)
 *   { i: "اسم-الصورة",  r: 0.75 }  ← صورة (media/اسم-الصورة.webp)
 *   r = العرض ÷ الطول (طولي 9:16 = 0.56، مربع = 1، عرضي 16:9 = 1.78)
 */
window.PORTFOLIO = {
  nickname: "ZEUSMESS",
  name: { ar: "يوسف أيمن", en: "Youssef Ayman" },
  role: { ar: "فيديو إديتور · مصوّر · صانع محتوى AI", en: "Video Editor · Photographer · AI Creative" },
  // الأيقونات المتاحة: film camera wand play spark brush doc cup chat insta mail eye
  tagline: {
    ar: "بصوّر، بعمل مونتاج، بعدّل صور، وبطلّع أفكار مجنونة بالذكاء الاصطناعي. من الفكرة لحد آخر فريم.",
    en: "I shoot, edit, retouch and build wild ideas with AI. From the first idea to the last frame."
  },

  // فيديو العرض اللي في أول الصفحة
  showreel: { v: "showreel", r: 1.778 },

  // الخدمات (بتظهر ككروت بأيقونات 3D)
  services: [
    { icon: "film", ar: "مونتاج فيديو", en: "Video Editing", d: { ar: "ريلز، إعلانات، وموشن بإيقاع يشد.", en: "Reels, ads and motion with rhythm that hooks." } },
    { icon: "camera", ar: "تصوير", en: "Photography", d: { ar: "بورتريه ومنتجات بإضاءة سينمائية.", en: "Portraits and products in cinematic light." } },
    { icon: "wand", ar: "تعديل صور", en: "Photo Editing", d: { ar: "ريتاتش، تلوين، وكومبوزيت.", en: "Retouching, grading and compositing." } },
    { icon: "play", ar: "فيديوهات AI", en: "AI Video", d: { ar: "عوالم كاملة من غير ما تتحرك من مكانك.", en: "Whole worlds, without leaving the room." } },
    { icon: "spark", ar: "صور AI", en: "AI Imagery", d: { ar: "بوسترات وكي فيجوالز للحملات.", en: "Posters and key visuals for campaigns." } },
    { icon: "brush", ar: "ديزاين", en: "Design", d: { ar: "سوشيال ميديا وهوية بصرية.", en: "Social media and visual identity." } },
    { icon: "doc", ar: "تلخيص واستخراج", en: "Summaries & Extraction", d: { ar: "بحوّل المحتوى الطويل لنقط واضحة.", en: "Long content turned into clear points." } }
  ],

  collections: [
    {
      id: "starbucks",
      theme: "starbucks",
      kicker: { ar: "تعاون مميز", en: "Featured collaboration" },
      title: { ar: "مجموعة ستاربكس", en: "Starbucks Collection" },
      intro: {
        ar: "حملات ترويجية عملتها لستاربكس: تصوير، مونتاج، وفيديوهات AI. كل حملة ليها عالمها.",
        en: "Promotional campaigns I made for Starbucks: shoots, edits and AI films. Every campaign has its own world."
      },
      groups: [
        {
          title: { en: "Barista Bear", ar: "دبدوب الباريستا" },
          tags: { ar: ["فيديو AI", "منتج"], en: ["AI Video", "Product"] },
          desc: { ar: "عالم وردي كله فراولة لإطلاق كوباية دبدوب الباريستا.", en: "A pink strawberry world for the Barista Bear tumbler launch." },
          items: [{ v: "barista-bear-3", r: 0.562 }, { v: "barista-bear-1", r: 0.562 }, { v: "barista-bear-2", r: 0.562 }]
        },
        {
          title: { en: "Break Shot", ar: "الضربة الأولى" },
          tags: { ar: ["تصوير", "مونتاج"], en: ["Photography", "Editing"] },
          desc: { ar: "ماتشا ستروبري كلاود فرابتشينو على ترابيزة بلياردو. Play. Sip. Refresh.", en: "Matcha Strawberry Cloud Frappuccino on the pool table. Play. Sip. Refresh." },
          items: [{ i: "break-shot-hero", r: 1.333 }, { v: "break-shot-film", r: 0.562 }, { i: "break-shot-cue", r: 0.666 }, { i: "break-shot-fridge", r: 0.75 }, { i: "break-shot-rack", r: 0.8 }, { i: "break-shot-rack-top", r: 0.799 }]
        },
        {
          title: { en: "Above the Clouds", ar: "تذوّق بين السحاب" },
          tags: { ar: ["صور AI", "موشن"], en: ["AI Imagery", "Motion"] },
          desc: { ar: "نكهتين أسطوريتين متحضّرين فوق السحاب.", en: "A legendary flavour duo, crafted in the clouds." },
          items: [{ v: "clouds-film", r: 0.563 }, { i: "clouds-poster", r: 0.558 }]
        },
        {
          title: { en: "Pumpkin Spice Season", ar: "موسم البمبكن سبايس" },
          tags: { ar: ["تصوير", "فيديو AI"], en: ["Photography", "AI Video"] },
          desc: { ar: "رجوع موسم البمبكن سبايس: سيشن تصوير وإعلان AI.", en: "Pumpkin Spice is back: a studio shoot and an AI ad." },
          items: [{ v: "pumpkin-shoot", r: 0.562 }, { v: "pumpkin-ai", r: 1.783 }]
        },
        {
          title: { en: "Kick-Off", ar: "أول الصفارة" },
          tags: { ar: ["فيديو AI", "تصوير"], en: ["AI Video", "Photography"] },
          desc: { ar: "قهوتك مع ماتش المنتخب، من الأوضة لحد الاستاد.", en: "Your coffee with the national team, from the living room to the stadium." },
          items: [{ v: "kickoff-film", r: 1.778 }, { i: "kickoff-sip", r: 1.788 }, { i: "kickoff-room", r: 1.792 }]
        },
        {
          title: { en: "Legends of Egypt", ar: "أساطير مصرية" },
          tags: { ar: ["فيلم AI", "ستوري تيلينج"], en: ["AI Film", "Storytelling"] },
          desc: { ar: "حكاية فرعون وقهوته، ومشوار بالليل جنب الأهرامات.", en: "A pharaoh and his coffee, and a night drive by the pyramids." },
          items: [{ v: "pharaoh", r: 1.519 }, { v: "night-drive", r: 1.784 }]
        },
        {
          title: { en: "Ramadan Kareem", ar: "رمضان كريم" },
          tags: { ar: ["موشن", "موسمي"], en: ["Motion", "Seasonal"] },
          desc: { ar: "مدفع الإفطار وكوباية رمضان تحت الهلال.", en: "The iftar cannon and the Ramadan cup under the crescent." },
          items: [{ v: "ramadan", r: 0.562 }]
        },
        {
          title: { en: "Head in the Clouds", ar: "سرحان" },
          tags: { ar: ["تصوير", "مونتاج"], en: ["Photography", "Editing"] },
          desc: { ar: "باريستا سرحان في السما، كونسبت سيريالي.", en: "A barista daydreaming in the sky, a surreal concept." },
          items: [{ v: "head-in-clouds", r: 0.667 }]
        },
        {
          title: { en: "Wake-Up Call", ar: "فوقان" },
          tags: { ar: ["تصوير", "موشن"], en: ["Photography", "Motion"] },
          desc: { ar: "من التعب لأول شفطة قهوة.", en: "From burnout to the first sip." },
          items: [{ v: "wakeup-film", r: 0.562 }, { i: "wakeup-still", r: 0.806 }]
        }
      ]
    },
    {
      id: "work",
      theme: "default",
      kicker: { ar: "شغل شخصي وكلاينتس", en: "Personal & client work" },
      title: { ar: "باقي الأعمال", en: "More Work" },
      intro: {
        ar: "تجارب، سلاسل تصوير، ومشاريع AI بعملها بستايلي.",
        en: "Experiments, photo series and AI projects in my own style."
      },
      groups: [
        {
          title: { en: "Red Room", ar: "الأوضة الحمرا" },
          tags: { ar: ["تصوير", "تعديل صور"], en: ["Photography", "Retouching"] },
          desc: { ar: "سلسلة بورتريه بالأحمر: سينما، تليفزيونات، وأقنعة.", en: "A portrait series in red: cinema seats, CRT screens and masks." },
          items: [{ i: "red-cinema", r: 0.671 }, { v: "red-masks", r: 0.564 }, { i: "red-tv", r: 0.671 }, { i: "red-hood", r: 0.747 }, { i: "red-rope", r: 0.747 }, { v: "red-hood-motion", r: 1.333 }]
        },
        {
          title: { en: "Neon Nights", ar: "ليالي النيون" },
          tags: { ar: ["فيديو AI", "ستايل جيمز"], en: ["AI Video", "Game Style"] },
          desc: { ar: "شوارع نيون، موتوسيكلات، ومترو بالليل بروح الجيمز.", en: "Neon streets, motorbikes and late-night subways with a video-game soul." },
          items: [{ v: "vice-taxi", r: 0.562 }, { v: "neon-tunnel", r: 0.562 }, { v: "vice-street", r: 0.743 }, { v: "subway-kitty", r: 0.748 }, { i: "subway-kitty-still", r: 0.747 }]
        },
        {
          title: { en: "Zeus: The Game", ar: "زيوس: اللعبة" },
          tags: { ar: ["بيكسل آرت", "موشن"], en: ["Pixel Art", "Motion"] },
          desc: { ar: "لعبة بيكسل عن ZEUSMESS: من الأهرامات لحد زيوس.", en: "A pixel-art game about ZEUSMESS: from the pyramids to Zeus himself." },
          items: [{ v: "zeus-game-screens", r: 0.562 }, { v: "zeus-game-run", r: 1 }, { v: "zeus-sprites", r: 1 }]
        },
        {
          title: { en: "Portrait Lab", ar: "معمل البورتريه" },
          tags: { ar: ["تعديل صور", "كومبوزيت"], en: ["Photo Editing", "Compositing"] },
          desc: { ar: "دابل إكسبوجر، أبيض وأسود، وحمام بيطير.", en: "Double exposures, black & white, and flying doves." },
          items: [{ i: "blue-double", r: 0.75 }, { v: "doves", r: 0.638 }, { i: "sphinx", r: 0.563 }]
        },
        {
          title: { en: "Motion & Edits", ar: "مونتاج وموشن" },
          tags: { ar: ["مونتاج", "تايبوجرافي"], en: ["Editing", "Typography"] },
          desc: { ar: "كاينتيك تايبوجرافي، جليتشات، ومشاهد سينمائية.", en: "Kinetic typography, glitches and cinematic scenes." },
          items: [{ v: "showreel", r: 1.778 }, { v: "couch-lyrics", r: 0.563 }, { v: "silhouette", r: 1.775 }]
        }
      ]
    }
  ],

  about: {
    image: { i: "blue-double", r: 0.75 },
    text: {
      ar: "أنا يوسف أيمن، معروف بـ ZEUSMESS. فيديو إديتور ومصوّر وبعدّل صور، وكمان بعمل فيديوهات وصور بالذكاء الاصطناعي وديزاينز. اشتغلت مع ستاربكس في كذا حملة ترويجية، وبحب أحوّل أي فكرة لحاجة الناس توقف عندها.",
      en: "I'm Youssef Ayman, aka ZEUSMESS. A video editor, photographer and photo editor who also creates AI videos, AI images and designs. I've made several promotional campaigns for Starbucks, and I love turning any idea into something people stop scrolling for."
    }
  },

  contact: {
    email: "", // ✏️ الإيميل اللي عاوز العملاء يكلموك عليه (فاضي = مش هيظهر)
    whatsapp: "201116416183",
    socials: [
      { label: "zeusmess", url: "https://instagram.com/zeusmess" },
      { label: "zeusshit", url: "https://instagram.com/zeusshit" }
    ]
  },

  defaultLang: "ar"
};
