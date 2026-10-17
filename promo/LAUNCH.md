# إطلاق TWINSIGHT على CrazyGames

كل الملفات جاهزة في المستودع. اللي باقي خطوات لازم تتعمل من حسابك أنت، لأنها محتاجة تسجيل دخول وبياناتك الشخصية وبيانات البنك.

## ليه CrazyGames؟

- بيقبل ألعاب من أي مطوّر من غير دعوة. Poki مثلًا لسه في مرحلة مغلقة ومحدودة.
- الدفع بيتم عن طريق شركة اسمها Tipalti، وطرقها: تحويل بنكي، أو ACH، أو eCheck، أو PayPal. المتاح منهم بيختلف حسب البلد.
- قوائم Tipalti فيها مصر بالتحويل البنكي بالدولار، وبعض الشركات اللي بتستخدمها بتحوّل للبنوك المصرية بالجنيه. هتعرف المتاح لك بالظبط لما تضيف حسابك البنكي.
- أقل مبلغ للصرف 100 يورو، والدفع شهري.

**مهم تعرفه:** CrazyGames بتنزّل اللعبة على مرحلتين:

1. **Basic Launch:** اللعبة بتنزل على الموقع **من غير إعلانات ومن غير أرباح**. CrazyGames بتقيس اللاعبين بيلعبوا قد إيه وبيرجعوا ولا لأ.
2. **Full Launch:** لو اللعبة نجحت في الأرقام، CrazyGames بتختارها للمرحلة دي. ساعتها الإعلانات بتشتغل وبتاخد نسبة من أرباحها.

النسبة الدقيقة مش مكتوبة في صفحاتهم الرسمية، وهتظهر لك في الاتفاقية جوه حسابك.

## الملفات

| الملف | استخدامه |
|---|---|
| `dist/twinsight-crazygames-basic.zip` | أول رفع (Basic Launch) |
| `dist/twinsight-crazygames-full.zip` | ترفعه بس لما CrazyGames تختار لعبتك لـ Full Launch |
| `promo/cover-landscape-1920x1080.png` | الغلاف العرضي |
| `promo/cover-portrait-800x1200.png` | الغلاف الطولي |
| `promo/cover-square-800x800.png` | الغلاف المربع |
| `promo/crazygames-preview-landscape-1920x1080.mp4` | فيديو المعاينة العرضي (16 ثانية، من غير صوت، أول كادر هو الغلاف) |
| `promo/crazygames-preview-portrait-1080x1620.mp4` | فيديو المعاينة الطولي |
| `promo/twinsight-trailer-vertical-1080x1920.mp4` | فيديو تيك توك وريلز وشورتس |

## خطوات الرفع

1. ادخل على developer.crazygames.com واعمل حساب.
2. اضغط **Submit a game** واختار HTML5، وارفع `twinsight-crazygames-basic.zip`.
3. جرّب اللعبة في أداة المعاينة بتاعتهم قبل ما تبعت.
4. املا البيانات من الجزء الإنجليزي تحت (الاسم، والوصف، وطريقة التحكم). الاتجاه **Landscape**، ودعم الموبايل **نعم**، لأن فيه تحكم باللمس.
5. ارفع الأغلفة التلاتة وفيديوهين المعاينة.
6. ابعت اللعبة للمراجعة.
7. من إعدادات الدفع في الحساب، كمّل بيانات Tipalti: الحساب البنكي، ونموذج الضرايب اللي المعالج بتاعهم هيحدده لك.
8. لو اتختارت لـ Full Launch: ارفع `twinsight-crazygames-full.zip` بدل الأولاني، وفعّل خيار **Progress Save** في صفحة الإرسال.

## اللي اتعمل في اللعبة عشان تطابق شروطهم

- إنجليزي كامل مع العربي، واللغة بتتحدد من لغة اللاعب.
- وضع لاعب واحد مع شريك آلي، بنفس أهمية وضع اللاعبين.
- مفيش استخدام لزرار Escape، لأنه بيقفل ملء الشاشة عندهم. الإيقاف المؤقت بزرار P أو بالزرار اللي على الشاشة.
- النص مقروء في مقاسات الإطار بتاعهم، زي 821×462 و800×450 و1216×684.
- مفيش روابط خارجية. الخطوط جوه الحزمة نفسها، والمسارات نسبية.
- إشارات بداية ووقف اللعب للـ SDK.
- وضع ضربات الترجيح فيه نفس إشارات بداية ووقف اللعب، ومفيهوش زرار مشاركة في نسخ CrazyGames، لأنهم بيمنعوا الروابط الخارجية.
- نسخة Full Launch فيها:
  - إعلان بين المراحل، وبين مباريات ضربات الترجيح، بس.
  - زرار «Continue» بإعلان مكافأة، مرة واحدة في الجولة.
  - احترام كتم الصوت اللي بيفرضه الموقع.
  - حفظ التقدّم عن طريق نظامهم.

## الترويج

**القاعدة:** انشر لينك صفحة اللعبة على CrazyGames بعد ما تنزل، مش لينك GitHub، لأن اللعب على موقعهم بس هو اللي بيتحسب.

### تيك توك / ريلز / شورتس (فيديو `twinsight-trailer-vertical-1080x1920.mp4`)

حط مزيكا من مكتبة التطبيق نفسه، والفيديو من غير صوت عشان كده.

- **كابشن 1:** لعبة لاتنين على كيبورد واحد 👀 واحد بيلف القزحية والتاني البؤبؤ، والنور مش هيدخل غير لو اتفقتوا. جرّبها مع صاحبك وقولي وصلتوا لمرحلة كام 🔥
- **كابشن 2:** تحدي: إنت وصاحبك تعدّوا المرحلة 5 من غير ما تخسروا ولا روح؟ 😅 اللينك في البايو
- **كابشن 3:** عملت لعبة كلها أبيض وأسود… وكل حاجة بتعدّي الخط اللي في النص لونها بيتقلب ⚫⚪ تلعبها لوحدك ولا مع صاحبك؟
- **كابشن 4 (ضربات الترجيح):** ضربات ترجيح بيني وبين صاحبي على كيبورد واحد ⚽ واحد يشوط والتاني حارس، والكورة بتطلع بعد العدّ… مين فيكم هيكسب؟ 🔥
- **كابشن 5 (الكأس):** حد قدر ياخد الكأس ويكسب الكمبيوتر على مستوى «أسطورة»؟ 🏆 أنا لسه بحاول 😅

**هاشتاجات:** #ألعاب #جيمز #تحدي #لعبة_جديدة #مصر #كورة #ضربات_ترجيح #gaming #indiegame #webgame #2player #penalty

### خطة أسبوعين

| اليوم | المكان | المحتوى |
|---|---|---|
| 1 | تيك توك وريلز وشورتس | الفيديو الطولي مع كابشن 1 |
| 2 | جروبات فيسبوك للجيمرز والطلبة في مصر | الفيديو مع لينك اللعبة |
| 3 | تيك توك | فيديو قصير ليك إنت وصاحبك وإنتو بتلعبوا من الموبايل (كابشن 2) |
| 5 | Reddit (r/WebGames و r/IndieGaming) | البوست الإنجليزي اللي تحت |
| 7 | ستوري وواتساب | لقطة شاشة لأعلى سكور مع اللينك |
| 10 | تيك توك | فيديو لمرحلة صعبة، زي SHIFT أو ECLIPSE (كابشن 3) |
| 12 | تيك توك وريلز | تسجيل شاشة لمباراة ضربات ترجيح حماسية (كابشن 4)، وبعدها تحدي الكأس (كابشن 5) |
| 14 | كل الأماكن | اسأل الناس عن أعلى مرحلة وصلوا لها، ورد على التعليقات |

### بوست Reddit (إنجليزي)

**Title:** I made TWINSIGHT, a black-and-white co-op game where two players turn the rings of one eye

**Body:** Each player turns one ring of the eye. Light only gets in when both gaps line up, and one closed ring is enough to stop a shadow. You can share one keyboard (A/D and the arrow keys) or one touch screen, or play solo with an AI partner. Eight stages, then it's endless. There's also a penalty shootout on the same eye: one player slides the ball, the other slides the keeper's gloves, and the ball flies when the countdown ends. Play a friend, the AI, or a three-round cup. I'd love feedback on the difficulty curve. [link]

---

## CrazyGames listing (copy and paste)

**Title:** TWINSIGHT

**Short description:** A black-and-white game for one or two players: turn the rings of one eye so light gets in and shadows stay out, or take a penalty shootout on it.

**Description:**
TWINSIGHT is a minimalist co-op game played on a screen split into black and white. In the middle sits an eye with two rings, and each ring has a gap. One player turns the outer ring (the iris), the other turns the inner ring (the pupil).

Light only reaches the centre when it passes through both gaps, so you have to line them up together. Shadows are the opposite: one closed ring in their way is enough to stop them. When the gaps meet, a beam shows where light can get in.

Play with a friend on one keyboard or one touch screen, or play solo with an AI partner. Clear 8 stages, from DAWN to ECLIPSE, with new twists along the way: shadows, rare prisms, light that turns into shadow halfway in, drifting rings and narrower gaps. After that the game is endless. Build combos up to a ×5 multiplier.

SHOOTOUT turns the eye into a goal for a penalty shootout. The shooter slides the ball along the top, the keeper slides the gloves along the goal line, and the ball flies in when the countdown ends: wait, fake one way, go the other at the last moment. Five kicks each, then sudden death. Play a friend on one device, the AI at three levels (Amateur, Pro, Legend), or win a three-round cup.

19 achievements across both modes. Available in English and Arabic.

**Controls:**
- 2 players: Iris (left player) A / D · Pupil (right player) ← / →
- 1 player: A / D or ← / → turns the iris; the AI turns the pupil
- Shootout: White (left) A / D · Black (right) ← / →; against the AI you are White and can use either
- Touch: hold the left or right part of your half of the screen, or drag sideways
- P: pause

**Tags:** 2 player, co-op, local multiplayer, one keyboard, football, soccer, penalty, minimalist, black and white, reflex, casual, arcade
