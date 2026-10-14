/*
 * ✏️ ده الملف الوحيد اللي محتاج تعدّله.
 *    This is the only file you need to edit.
 *
 * - حط صورك في فولدر images/ واكتب اسم كل صورة هنا.
 * - كل نص له نسخة عربي (ar) وإنجليزي (en).
 * - لو صورة لسه مش موجودة، الموقع هيعرض مكانها إطار مؤقت شيك.
 */
window.PORTFOLIO = {
  nickname: "ZEUSMESS",
  name: { ar: "يوسف أيمن", en: "Youssef Ayman" },
  role: { ar: "صانع محتوى بالذكاء الاصطناعي", en: "AI Creative" },
  tagline: {
    ar: "فيديوهات وصور بالذكاء الاصطناعي، ديزاينز، وتلخيص واستخراج محتوى — من الفكرة لحد النتيجة النهائية.",
    en: "AI videos and images, designs, and content summarising & extraction — from idea to final piece."
  },

  // صورة الخلفية الكبيرة في أول الصفحة
  heroImage: "images/hero.jpg",

  // أرقام تظهر تحت العنوان — مثال: { value: "50+", label: { ar: "مشروع", en: "Projects" } }
  stats: [],

  // التصنيفات اللي بتظهر كأزرار فلترة فوق الأعمال
  categories: [
    { id: "ai-video", ar: "فيديوهات AI", en: "AI Videos" },
    { id: "ai-image", ar: "صور AI", en: "AI Images" },
    { id: "design", ar: "ديزاينز", en: "Designs" },
    { id: "content", ar: "تلخيص واستخراج", en: "Summaries & Extraction" }
  ],

  // أعمالك — كرّر البلوك ده لكل صورة
  // ratio اختياري: "tall" (طولية) أو "wide" (عرضية) أو سيبه فاضي
  works: [
    {
      image: "images/work-01.jpg",
      category: "ai-video",
      year: "2026",
      client: "Starbucks",
      ratio: "tall",
      title: { ar: "حملة ترويجية", en: "Promo Campaign" },
      description: {
        ar: "فيديو ترويجي معمول بالذكاء الاصطناعي لستاربكس.",
        en: "An AI-generated promotional video for Starbucks."
      }
    },
    {
      image: "images/work-02.jpg",
      category: "ai-image",
      year: "2026",
      client: "Starbucks",
      ratio: "wide",
      title: { ar: "صور منتجات", en: "Product Visuals" },
      description: {
        ar: "صور منتجات بالذكاء الاصطناعي لحملة ترويجية.",
        en: "AI product visuals for a promotional campaign."
      }
    },
    {
      image: "images/work-03.jpg",
      category: "design",
      year: "2026",
      client: "Starbucks",
      ratio: "tall",
      title: { ar: "ديزاين سوشيال ميديا", en: "Social Media Design" },
      description: {
        ar: "تصميمات بوستات للسوشيال ميديا.",
        en: "Social media post designs."
      }
    },
    {
      image: "images/work-04.jpg",
      category: "content",
      year: "2026",
      client: "",
      ratio: "wide",
      title: { ar: "تلخيص محتوى", en: "Content Summary" },
      description: {
        ar: "تلخيص واستخراج أهم النقاط من محتوى طويل وعرضها بشكل بصري.",
        en: "Summarising long content and extracting the key points into a visual layout."
      }
    }
  ],

  about: {
    image: "images/about.jpg",
    text: {
      ar: "أنا يوسف أيمن، معروف بـ ZEUSMESS. بعمل فيديوهات وصور بالذكاء الاصطناعي، ديزاينز، وتلخيص واستخراج محتوى. اشتغلت مع ستاربكس في كذا مشروع ترويجي، وبحب أحوّل أي فكرة لمحتوى يلفت النظر.",
      en: "I'm Youssef Ayman, known as ZEUSMESS. I create AI videos and images, designs, and content summaries & extraction. I've worked with Starbucks on several promotional projects, and I love turning any idea into eye-catching content."
    },
    skills: {
      ar: ["فيديوهات AI", "صور AI", "ديزاين", "تلخيص المحتوى", "استخراج البيانات", "محتوى ترويجي"],
      en: ["AI Video", "AI Imagery", "Design", "Summarisation", "Data Extraction", "Promo Content"]
    }
  },

  contact: {
    email: "you@example.com", // ✏️ الإيميل اللي عاوز العملاء يكلموك عليه
    whatsapp: "", // رقمك بالكود الدولي من غير + (مثلاً 2010xxxxxxxx) — فاضي = الزرار مش هيظهر
    socials: []   // مثال: { label: "Instagram", url: "https://instagram.com/zeusmess" }
  },

  // اللغة اللي الموقع يفتح بيها: "ar" أو "en"
  defaultLang: "ar"
};
