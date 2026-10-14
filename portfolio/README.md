# ⚡ ZEUSMESS — Portfolio

بورتفوليو يوسف أيمن (ZEUSMESS): فيديو إديتور، مصوّر، وصانع محتوى AI.
ستايل عصري: أيقونات 3D عايمة، خلفيات جريدينت، فيديو شوريل، وعربي/English.

## الملفات

| الملف | فيه إيه |
|---|---|
| `content.js` | **كل الكلام والأعمال.** ده الملف اللي بتعدّله. |
| `media/` | الصور (`.webp`) والفيديوهات (`.mp4` + غلاف `.webp` بنفس الاسم) |
| `index.html` · `style.css` · `app.js` | شكل الموقع وحركته |

## إضافة عمل جديد

1. حط الملف في `media/` (يفضّل فيديو MP4 أقل من 10MB).
2. في `content.js` جوّه الحملة المناسبة ضيف سطر:
   - فيديو: `{ v: "اسم-الملف", r: 0.56 }` (لازم يكون فيه `اسم-الملف.webp` كصورة غلاف)
   - صورة: `{ i: "اسم-الملف", r: 0.75 }`
   - `r` = العرض ÷ الطول: طولي 9:16 = `0.56`، مربع = `1`، عرضي 16:9 = `1.78`.
3. حملة جديدة = انسخ بلوك من `groups` وغيّر الاسم والوصف.

لعمل غلاف وضغط فيديو بـ FFmpeg:

```bash
ffmpeg -i in.mp4 -vf "scale=-2:720" -c:v libx264 -crf 27 -movflags +faststart -c:a aac media/my-video.mp4
ffmpeg -ss 1 -i in.mp4 -frames:v 1 -vf "scale=-2:720" media/my-video.webp
```

## النشر مجاناً

- **GitHub Pages:** Settings ← Pages ← اختار الفرع وفولدر `/ (root)` ← الموقع هيبقى على `https://<username>.github.io/<repo>/portfolio/`
- **Netlify Drop:** اسحب فولدر `portfolio` كله على https://app.netlify.com/drop
