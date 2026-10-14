/*
 * ✏️ ده الملف الوحيد اللي محتاج تعدّله.
 *    This is the only file you need to edit.
 *
 * - حط صورك في فولدر images/ واكتب اسم كل صورة هنا.
 * - كل نص له نسخة عربي (ar) وإنجليزي (en).
 * - لو صورة لسه مش موجودة، الموقع هيعرض مكانها إطار مؤقت شيك.
 */
window.PORTFOLIO = {
  name: { ar: "اسمك هنا", en: "Your Name" },
  role: { ar: "مصوّر ومخرج سينمائي", en: "Cinematographer & Director" },
  tagline: {
    ar: "بحكي القصص بالضوء والحركة — كل كادر له إحساس.",
    en: "Telling stories with light and motion — every frame has a feeling."
  },

  // صورة الخلفية الكبيرة في أول الصفحة
  heroImage: "images/hero.jpg",

  // أرقام تظهر تحت العنوان (امسح أي سطر مش عاوزه)
  stats: [
    { value: "120+", label: { ar: "مشروع", en: "Projects" } },
    { value: "6", label: { ar: "سنين خبرة", en: "Years" } },
    { value: "40+", label: { ar: "عميل", en: "Clients" } }
  ],

  // التصنيفات اللي بتظهر كأزرار فلترة فوق الأعمال
  categories: [
    { id: "portrait", ar: "بورتريه", en: "Portrait" },
    { id: "wedding", ar: "أفراح", en: "Weddings" },
    { id: "commercial", ar: "إعلانات", en: "Commercial" },
    { id: "film", ar: "أفلام قصيرة", en: "Short Films" }
  ],

  // أعمالك — كرّر البلوك ده لكل صورة
  // ratio اختياري: "tall" (طولية) أو "wide" (عرضية) أو سيبه فاضي
  works: [
    {
      image: "images/work-01.jpg",
      category: "portrait",
      year: "2026",
      client: "Studio Session",
      ratio: "tall",
      title: { ar: "ضوء الغروب", en: "Golden Hour" },
      description: {
        ar: "جلسة تصوير بورتريه في آخر ضوء النهار، بألوان دافية وإحساس هادي.",
        en: "A portrait session in the last light of day — warm tones, quiet mood."
      }
    },
    {
      image: "images/work-02.jpg",
      category: "commercial",
      year: "2026",
      client: "Brand X",
      ratio: "wide",
      title: { ar: "حملة إطلاق", en: "Launch Campaign" },
      description: {
        ar: "حملة إعلانية لإطلاق منتج جديد، تصوير وإخراج وتلوين.",
        en: "Product launch campaign — shot, directed and colour-graded."
      }
    },
    {
      image: "images/work-03.jpg",
      category: "wedding",
      year: "2025",
      client: "Sara & Omar",
      ratio: "tall",
      title: { ar: "ليلة العمر", en: "The Night" },
      description: {
        ar: "تغطية فرح كاملة بأسلوب سينمائي.",
        en: "Full wedding coverage in a cinematic style."
      }
    },
    {
      image: "images/work-04.jpg",
      category: "film",
      year: "2025",
      client: "Independent",
      ratio: "wide",
      title: { ar: "ظلال", en: "Shadows" },
      description: {
        ar: "فيلم قصير عن الوحدة في المدينة.",
        en: "A short film about loneliness in the city."
      }
    },
    {
      image: "images/work-05.jpg",
      category: "portrait",
      year: "2025",
      client: "Editorial",
      title: { ar: "وجوه", en: "Faces" },
      description: {
        ar: "سلسلة بورتريهات أبيض وأسود.",
        en: "A black-and-white portrait series."
      }
    },
    {
      image: "images/work-06.jpg",
      category: "commercial",
      year: "2024",
      client: "Café Nour",
      ratio: "tall",
      title: { ar: "قهوة الصبح", en: "Morning Brew" },
      description: {
        ar: "تصوير منتجات ومكان لكافيه.",
        en: "Product and space photography for a café."
      }
    }
  ],

  about: {
    image: "images/about.jpg",
    text: {
      ar: "أنا مصوّر ومخرج بحب أحوّل اللحظات العادية لمشاهد سينمائية. بشتغل على البورتريه، الأفراح، والإعلانات — وبهتم بكل تفصيلة من الإضاءة لحد التلوين.",
      en: "I'm a photographer and director who turns ordinary moments into cinematic scenes. I work across portraits, weddings and commercials — caring about every detail from lighting to colour grading."
    },
    skills: {
      ar: ["تصوير سينمائي", "إخراج", "تلوين", "مونتاج", "إضاءة"],
      en: ["Cinematography", "Directing", "Colour Grading", "Editing", "Lighting"]
    }
  },

  contact: {
    email: "you@example.com",
    whatsapp: "201000000000", // رقمك بالكود الدولي من غير + أو أصفار في الأول
    socials: [
      { label: "Instagram", url: "https://instagram.com/" },
      { label: "Behance", url: "https://behance.net/" },
      { label: "YouTube", url: "https://youtube.com/" }
    ]
  },

  // اللغة اللي الموقع يفتح بيها: "ar" أو "en"
  defaultLang: "ar"
};
