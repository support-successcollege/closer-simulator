# DESIGN.md

> חושך עמוק, צבע אחד חד, ומספרים שזזים — מסך שמרגיש כמו קונסולה של סוגר עסקאות, לא כמו מאמר.

מסמך זה הוא המקור היחיד לאמת העיצובית של CLOSER Simulator. כל צבע, גופן,
מצב רכיב ואנימציה בקוד חייבים לנבוע ממנו.

---

## 1. Visual Theme & Atmosphere

**Style**: Premium Dark Console — חושך עמוק בשכבות, מואר בנקודות
**Keywords**: טכנולוגי · יוקרתי · ממוקד · חד · אנרגטי · נקי · תחרותי · מדיד
**Tone**: ביטחון שקט של כלי מקצועי — **לא** עיתונאי, **לא** פסטלי, **לא** "נייר"
**Feel**: כמו להיכנס לחדר בקרה אפלולי שבו רק המסכים דולקים. העין נחה על הרקע ונמשכת בדיוק למקום שבו מתרחשת ההחלטה.

**Interaction Tier**: **L2 — flow interactions**
**Dependencies**: framer-motion (כבר בפרויקט) + CSS. ללא GSAP, ללא Lenis, ללא WebGL.

### למה L2 ולא L3

זו אפליקציה, לא דף נחיתה. מתאמן עונה על 30 שאלות ברצף; כל אנימציה שחוזרת
30 פעם וגוזלת יותר מ-300ms הופכת למס. התנועה כאן משרתת שלוש מטרות בלבד:
לאשר פעולה, להוביל את העין לשינוי, ולתגמל הישג. אין scroll-jacking, אין
pin, אין cursor מותאם.

### התאמת הסקיל לסוג המוצר

הסקיל נכתב בעיקרו ל-Landing Page ודורש "3 נקודות וואו" ו-scroll-story.
העקרונות האלה לא מיושמים כאן: אין גלילת עמוד — זו מעטפת אפליקציה
במסך מלא. במקומם, רגעי החתימה של המוצר הם **מסך התוצאות** (טבעת ציון
שנמשכת + ספירת מספרים), **רגע חשיפת המשוב**, ו**מצב הטיימר האדום**.

---

## 2. Color Palette & Roles

```css
:root {
  /* ── Backgrounds: four layers of near-black ──
     The depth ladder is what replaces borders as the primary way of
     separating regions. Each step up is a surface closer to the eye. */
  --bg:             #09090C;   /* app canvas, deepest */
  --surface:        #121218;   /* panels, sidebar */
  --surface-alt:    #17171F;   /* cards, question plate */
  --surface-hover:  #1E1E28;   /* interactive surface, hover */
  --surface-active: #262633;   /* pressed / selected */

  /* ── Borders: hairlines that read on black ── */
  --border:         rgba(255, 255, 255, 0.08);
  --border-strong:  rgba(255, 255, 255, 0.14);
  --border-hover:   rgba(255, 255, 255, 0.22);

  /* ── Text: three steps, high contrast at the top ── */
  --text:           #F4F4F7;   /* headings, question text  — 17.2:1 on --bg */
  --text-secondary: #A8A8B8;   /* body, options            —  7.4:1 on --bg */
  --text-tertiary:  #6E6E80;   /* labels, metadata         —  3.6:1, large/UI only */

  /* ── Accent: electric violet.
     Deliberately NOT red and NOT green: those two are spoken for by
     wrong/right feedback, and a brand colour that collides with the
     scoring semantics makes the quiz harder to read at a glance. ── */
  --accent:         #7C5CFF;
  --accent-hover:   #8F74FF;
  --accent-active:  #6A49F2;
  --accent-weak:    rgba(124, 92, 255, 0.12);
  --accent-ring:    rgba(124, 92, 255, 0.40);

  /* Secondary accent — data, progress, charts. Never a CTA. */
  --accent-2:       #22D3EE;
  --accent-2-weak:  rgba(34, 211, 238, 0.12);

  /* ── Semantic: reserved exclusively for answer feedback ── */
  --success:        #30D158;
  --success-weak:   rgba(48, 209, 88, 0.12);
  --success-border: rgba(48, 209, 88, 0.35);
  --danger:         #FF453A;
  --danger-weak:    rgba(255, 69, 58, 0.12);
  --danger-border:  rgba(255, 69, 58, 0.35);
  --warning:        #FFD60A;
  --warning-weak:   rgba(255, 214, 10, 0.12);

  /* ── RGB helpers for rgba() composition ── */
  --bg-rgb:         9, 9, 12;
  --surface-rgb:    18, 18, 24;
  --text-rgb:       244, 244, 247;
  --accent-rgb:     124, 92, 255;
  --accent-2-rgb:   34, 211, 238;
  --success-rgb:    48, 209, 88;
  --danger-rgb:     255, 69, 58;
  --warning-rgb:    255, 214, 10;

  /* ── Signature gradient — the one decorative flourish.
     Allowed on exactly three things: the wordmark accent, the score
     ring stroke, and the primary CTA's hover glow. Nowhere else. ── */
  --grad-brand: linear-gradient(135deg, #7C5CFF 0%, #22D3EE 100%);
}
```

### Color Rules

1. **כל צבע דרך משתנה CSS.** אפס hex קשיח בקוד הרכיבים — כולל rgba: השתמש ב-`rgb(var(--accent-rgb) / 0.4)`.
2. **ירוק ואדום אומרים "טוב" או "רע" — ותמיד רק את זה.** ראה את מבחן פסק הדין למטה; זה הכלל שהכי קל להפר בלי לשים לב.
3. **צבע מותג אחד לפעולה.** `--accent` הוא היחיד שמסמן "לחץ כאן". `--accent-2` הוא לנתונים בלבד.
4. **צהוב רק לטיימר.** `--warning` מופיע כשנותרו פחות מ-50% מהזמן, ולא בשום מקום אחר.
5. **עומק לפני קווים.** להפריד אזורים דרך סולם ה-surface, לא דרך הוספת גבולות.
6. **ניגודיות מינימלית 4.5:1** לכל טקסט מתחת ל-18px. `--text-tertiary` מותר רק ל-UI labels גדולים או bold.

### מבחן פסק הדין — ירוק ואדום

> הניסוח המקורי כאן היה "ירוק ואדום שמורים למשוב תשובה בלבד". הוא היה
> מחמיר מדי וסבב הביקורת הוכיח זאת: כפתור מחיקה אדום ואזהרת שגיאה אדומה
> הם נכונים, לא הפרה. הכלל האמיתי עדין יותר.

לפני שאתה צובע משהו בירוק או באדום, שאל: **האם זה פסק דין?**

| שאלה | ירוק/אדום |
|---|---|
| האם המצב הזה "טוב" או "רע" עבור המשתמש? | ✅ מותר |
| האם זו רק דרך להבדיל בין פריטים? | ❌ אסור |

**מותר** — תשובה נכונה/שגויה · ציון (80%+ ירוק, מתחת ל-60% אדום) · פעולה
הרסנית · שגיאה או כשל · טיימר שעומד להיגמר.

**אסור** — אריחי סטטיסטיקה · אייקונים של קטגוריות · תגיות קושי · סטטוסים
ניטרליים · כל שימוש שכל מטרתו "שיהיה צבעוני".

**שתי הפרות אמיתיות שנתפסו בסבב הביקורת:**

1. תג קושי "קל" בירוק — נקרא כ"צדקת". רמת קושי אינה פסק דין; היא עברה
   לסקאלה ניטרלית, ורק "קשה" מקבל את צבע המותג.
2. שלושה אריחים במרכז הפיקוד בירוק/כתום/אדום — מספר מפגשים אינו "רע".
   עברו ל-`--accent` / `--accent-2` / `--text-tertiary`.

הנזק בהפרה אינו אסתטי: ככל שירוק ואדום מופיעים במקומות שאין בהם פסק דין,
כך הם מפסיקים להיקרא כפסק דין במקום שבו זה באמת חשוב.

---

## 3. Typography Rules

```css
@import url('https://fonts.googleapis.com/css2?family=Rubik:wght@500;600;700;800&family=Heebo:wght@300;400;500;600;700&family=JetBrains+Mono:wght@500;700&display=swap');
```

```css
--font-display: 'Rubik', 'Heebo', system-ui, -apple-system, 'Segoe UI', sans-serif;
--font-body:    'Heebo', 'Rubik', system-ui, -apple-system, 'Segoe UI', sans-serif;
--font-mono:    'JetBrains Mono', 'SF Mono', ui-monospace, monospace;
```

| Role | Font | Size | Weight | Line Height | Letter Spacing |
|------|------|------|--------|-------------|----------------|
| Screen title | Rubik | 2rem / 32px | 800 | 1.15 | -0.02em |
| Question text | Heebo | 1.5rem / 24px | 600 | 1.45 | -0.01em |
| Section H2 | Rubik | 1.25rem / 20px | 700 | 1.3 | -0.01em |
| H3 | Rubik | 1rem / 16px | 700 | 1.4 | normal |
| Answer option | Heebo | 1rem / 16px | 500 | 1.55 | normal |
| Body | Heebo | 0.9375rem / 15px | 400 | 1.65 | normal |
| Label / eyebrow | Heebo | 0.6875rem / 11px | 600 | 1.2 | 0.08em, uppercase |
| Button | Heebo | 0.9375rem / 15px | 700 | 1 | 0.01em |
| Figure — large | JetBrains Mono | 3.5rem / 56px | 700 | 1 | -0.03em |
| Figure — inline | JetBrains Mono | 1rem / 16px | 500 | 1 | -0.01em |

### Typography Rules

1. **אפס serif.** זו הייתה הבעיה המרכזית בעיצוב הקודם — גופן תצוגה שימש לקריאת גוף טקסט. Serif עברי במסך, במשקל 400, בגודל 24px, מעייף אחרי שלוש שאלות.
2. **היררכיה דרך משקל, לא דרך גודל.** כמו ספוטיפיי: 700 מול 400 עושה יותר מ-20px מול 16px, ושומר על צפיפות.
3. **כל מספר ב-mono.** טיימר, ציון, מונה שאלות, אחוזים. Tabular figures מונעים קפיצה של הפריסה כשהמספר משתנה.
4. **שורת שאלה מקסימום 68 תווים.** מעבר לזה העין מאבדת את תחילת השורה — חמור במיוחד ב-RTL.
5. **גובה שורה ≥ 1.45 לעברית.** לעברית אין אותיות עולות/יורדות שמסייעות להפרדה חזותית; היא צריכה יותר אוויר מלטינית.
6. **ללא `text-transform: uppercase` על עברית.** לעברית אין רישיות. מותר רק על labels לטיניים.

---

## 4. Component Stylings

### Primary Button

```css
.btn-primary {
  font: 700 0.9375rem/1 var(--font-body);
  color: #fff;
  background: var(--accent);
  border: 1px solid transparent;
  border-radius: 10px;
  padding: 0.75rem 1.5rem;
  min-height: 44px;
  transition: background .15s ease, transform .12s ease, box-shadow .2s ease;
}
.btn-primary:hover  { background: var(--accent-hover); box-shadow: 0 0 24px rgb(var(--accent-rgb) / .35); }
.btn-primary:active { background: var(--accent-active); transform: translateY(1px); }
.btn-primary:focus-visible { outline: 2px solid var(--accent-ring); outline-offset: 3px; }
.btn-primary:disabled {
  background: var(--surface-active); color: var(--text-tertiary);
  cursor: not-allowed; box-shadow: none; transform: none;
}
```

### Secondary Button

```css
.btn-secondary {
  font: 600 0.9375rem/1 var(--font-body);
  color: var(--text); background: transparent;
  border: 1px solid var(--border-strong);
  border-radius: 10px; padding: 0.75rem 1.5rem; min-height: 44px;
  transition: background .15s ease, border-color .15s ease;
}
.btn-secondary:hover  { background: var(--surface-hover); border-color: var(--border-hover); }
.btn-secondary:active { background: var(--surface-active); }
.btn-secondary:focus-visible { outline: 2px solid var(--accent-ring); outline-offset: 3px; }
.btn-secondary:disabled { color: var(--text-tertiary); border-color: var(--border); cursor: not-allowed; }
```

### Answer Option — the single most important component

```css
.answer-option {
  display: flex; align-items: center; gap: .875rem;
  width: 100%; text-align: start;
  font: 500 1rem/1.55 var(--font-body);
  color: var(--text-secondary);
  background: var(--surface-alt);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 1rem 1.125rem;
  min-height: 56px;
  transition: background .15s ease, border-color .15s ease, transform .12s ease;
}
.answer-option:hover:not(:disabled) {
  background: var(--surface-hover);
  border-color: var(--border-hover);
  color: var(--text);
  transform: translateX(-2px);          /* RTL: drifts toward the reader */
}
.answer-option:active:not(:disabled) { transform: scale(.995); }
.answer-option:focus-visible { outline: 2px solid var(--accent-ring); outline-offset: 2px; }
.answer-option:disabled { opacity: .55; cursor: default; }

/* Resolved states — only after an answer is submitted */
.answer-option.is-correct {
  background: var(--success-weak); border-color: var(--success-border); color: var(--text);
}
.answer-option.is-wrong {
  background: var(--danger-weak);  border-color: var(--danger-border);  color: var(--text);
}

/* The index badge carries the state colour */
.answer-option .badge {
  display: grid; place-items: center;
  width: 28px; height: 28px; flex-shrink: 0;
  font: 700 .8125rem/1 var(--font-mono);
  color: var(--text-tertiary);
  background: var(--surface-active);
  border-radius: 8px;
  transition: background .15s ease, color .15s ease;
}
.answer-option:hover .badge      { background: var(--accent-weak); color: var(--accent); }
.answer-option.is-correct .badge { background: var(--success); color: #06130A; }
.answer-option.is-wrong   .badge { background: var(--danger);  color: #1A0504; }
```

**האותיות בתג הן א/ב/ג/ד — לא A/B/C/D.** ממשק עברי שמסמן תשובות באותיות
לטיניות מכריח את העין להחליף כיוון קריאה בכל שורה.

### Card

```css
.card {
  background: var(--surface-alt);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 1.25rem;
  transition: border-color .15s ease, background .15s ease, transform .15s ease;
}
.card:hover          { border-color: var(--border-hover); background: var(--surface-hover); }
.card.is-interactive:hover  { transform: translateY(-2px); box-shadow: var(--shadow-md); }
.card.is-interactive:active { transform: translateY(0); }
.card.is-selected    { border-color: var(--accent); background: var(--accent-weak); }
.card:focus-within   { outline: 2px solid var(--accent-ring); outline-offset: 2px; }
```

### Nav Item (sidebar)

```css
.nav-item {
  display: flex; align-items: center; gap: .75rem;
  color: var(--text-tertiary); background: transparent;
  border-radius: 10px; padding: .625rem .75rem; min-height: 44px;
  transition: color .15s ease, background .15s ease;
}
.nav-item:hover         { color: var(--text); background: var(--surface-hover); }
.nav-item:active        { background: var(--surface-active); }
.nav-item:focus-visible { outline: 2px solid var(--accent-ring); outline-offset: 2px; }
.nav-item.is-active     { color: var(--text); background: var(--accent-weak); }
.nav-item.is-active::before {           /* RTL: the rail sits on the right */
  content: ""; position: absolute; inset-inline-end: 0; top: 20%; bottom: 20%;
  width: 3px; border-radius: 3px; background: var(--accent);
}
.nav-item:disabled { color: var(--text-tertiary); opacity: .4; cursor: not-allowed; }
```

### Input

```css
.input {
  width: 100%; min-height: 44px;
  font: 400 0.9375rem/1.5 var(--font-body);
  color: var(--text);
  background: var(--surface);
  border: 1px solid var(--border-strong);
  border-radius: 10px; padding: .75rem 1rem;
  transition: border-color .15s ease, box-shadow .15s ease;
}
.input::placeholder     { color: var(--text-tertiary); }
.input:hover            { border-color: var(--border-hover); }
.input:focus-visible    { outline: none; border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-ring); }
.input:disabled         { background: var(--surface-alt); color: var(--text-tertiary); cursor: not-allowed; }
.input[aria-invalid="true"] { border-color: var(--danger); box-shadow: 0 0 0 3px var(--danger-weak); }
```

### Badge / Pill

```css
.badge-pill {
  display: inline-flex; align-items: center; gap: .375rem;
  font: 600 .6875rem/1.2 var(--font-body); letter-spacing: .04em;
  border-radius: 9999px; padding: .3125rem .625rem;
  background: var(--surface-active); color: var(--text-secondary);
  border: 1px solid var(--border);
}
.badge-pill.is-accent  { background: var(--accent-weak);  color: var(--accent);  border-color: var(--accent-ring); }
.badge-pill.is-success { background: var(--success-weak); color: var(--success); border-color: var(--success-border); }
.badge-pill.is-danger  { background: var(--danger-weak);  color: var(--danger);  border-color: var(--danger-border); }
.badge-pill.is-warning { background: var(--warning-weak); color: var(--warning); }
```

### Progress Bar

```css
.progress-track { height: 4px; border-radius: 4px; background: var(--surface-active); overflow: hidden; }
.progress-fill  { height: 100%; border-radius: 4px; background: var(--grad-brand); transition: width .4s cubic-bezier(.4,0,.2,1); }
```

### Score Ring

רגע החתימה של מסך התוצאות (§7 #4). הטבעת נמשכת אל הציון, והמספר סופר
אל אותו ערך בתוכה.

```css
.score-ring        { position: relative; width: clamp(132px, 26vw, 168px); aspect-ratio: 1; }
/* Counter-clockwise from twelve: the direction an RTL reader expects
   progress to grow. */
.score-ring svg    { width: 100%; height: 100%; transform: rotate(-90deg) scaleX(-1); }
.score-ring-track  { fill: none; stroke: var(--surface-active); stroke-width: 8; }
.score-ring-value  { fill: none; stroke-width: 8; stroke-linecap: round;
                     transition: stroke-dashoffset 900ms var(--ease-out) 150ms; }
.score-ring-figure { position: absolute; inset: 0;
                     display: flex; align-items: center; justify-content: center; }
.score-ring-unit   { font-size: .45em; transform: translateY(-.55em); opacity: .75; }
```

**הטבעת לעולם אינה הנושא היחיד של המידע.** המספר נמצא במרכזה וסופר לאותו
ערך, כך שמי שמבקש הפחתת אנימציות מאבד את המשיכה בלבד.

שלוש מלכודות שנתפסו בבנייה, ולכן מתועדות כאן:
- `display: grid` + `place-items` הופך את ה-`%` לשורה נפרדת מתחת למספר
- `align-items: baseline` נפתר קרוב לראש תיבה שפרושה על כל הטבעת
- `align-self: flex-start` על ה-`%` נצמד לקצה הטבעת, לא לראש הספרות

### Answer Index Badge

```css
.answer-badge { width: 30px; height: 30px; display: grid; place-items: center;
                font: 700 .8125rem/1 var(--font-ui);
                color: var(--text-tertiary); background: var(--surface-active);
                border-radius: var(--radius-sm); }
.answer-option:hover .answer-badge  { background: var(--tint-primary-strong); color: var(--accent); }
.answer-badge.is-correct            { background: var(--success); color: var(--success-foreground); }
.answer-badge.is-wrong              { background: var(--destructive); color: var(--destructive-foreground); }
```

**האותיות הן א/ב/ג/ד — לא A/B/C/D.** סימון לטיני ברשימה עברית מכריח את העין
להחליף כיוון קריאה בכל שורה. בפתרון המצב, התג מחליף את האות באייקון — כך
שפסק הדין אינו מועבר בצבע בלבד.

---

## 5. Layout Principles

**Spacing scale** (4px base): `4 · 8 · 12 · 16 · 20 · 24 · 32 · 40 · 56 · 80`

```css
--space-1:.25rem; --space-2:.5rem;  --space-3:.75rem; --space-4:1rem;
--space-5:1.25rem; --space-6:1.5rem; --space-8:2rem;  --space-10:2.5rem;
--space-14:3.5rem; --space-20:5rem;
```

**Containers**
| Context | Max width | Why |
|---|---|---|
| Quiz question + options | 720px | שומר על שורה ≤ 68 תווים |
| Dashboard / results | 1100px | מאפשר שלוש עמודות סטטיסטיקה |
| Settings / forms | 640px | טפסים לא מרוויחים מרוחב |
| Sidebar | 72px מכווץ / 240px פתוח | — |

**Radii**: `--radius-sm:8px` · `--radius:10px` · `--radius-lg:14px` · `--radius-xl:20px` · `--radius-full:9999px`

### Vertical rhythm — the fix for the empty bottom half

העיצוב הקודם דחס את התוכן לחלק העליון והשאיר חצי מסך ריק. מסך החידון
עובר ל-grid בן שלוש שורות שתופס את כל הגובה:

```css
.quiz-shell {
  display: grid;
  grid-template-rows: auto 1fr auto;   /* chrome · content · action */
  height: 100dvh;
}
.quiz-content { align-self: center; }   /* the question sits optically centred */
```

---

## 6. Depth & Elevation

על רקע כמעט-שחור, צל שחור כמעט בלתי נראה. העומק נבנה קודם כול מסולם
ה-surface, והצללים מוסיפים רק הפרדה לאלמנטים צפים.

```css
--shadow-sm: 0 1px 2px rgb(0 0 0 / .4);
--shadow-md: 0 4px 16px rgb(0 0 0 / .5);
--shadow-lg: 0 12px 40px rgb(0 0 0 / .6);
--shadow-glow-accent:  0 0 24px rgb(var(--accent-rgb) / .35);
--shadow-glow-success: 0 0 28px rgb(var(--success-rgb) / .28);
```

| Level | Surface | Shadow | Used on |
|---|---|---|---|
| 0 | `--bg` | — | רקע האפליקציה |
| 1 | `--surface` | — | סרגל צד, סרגל עליון |
| 2 | `--surface-alt` | `--shadow-sm` | כרטיסים, לוח השאלה |
| 3 | `--surface-hover` | `--shadow-md` | כרטיס ב-hover, dropdown |
| 4 | `--surface-active` | `--shadow-lg` | דיאלוג, חלונית צפה |

**Glow משמש רק כסימון מצב** — hover על CTA, ורגע התשובה הנכונה. לעולם לא כקישוט קבוע.

---

## 7. Animation & Interaction

**Tier L2.** `framer-motion` לרכיבים, CSS transitions למצבים.

```css
--ease-out:   cubic-bezier(.4, 0, .2, 1);
--ease-spring: cubic-bezier(.34, 1.56, .64, 1);
--dur-fast:   120ms;   /* state flips: hover, active */
--dur-base:   200ms;   /* entrances, surface changes */
--dur-slow:   400ms;   /* screen transitions, progress */
--dur-reveal: 600ms;   /* score ring draw */
```

### Signature moments (six, as the tier requires)

| # | Moment | Effect | Where |
|---|---|---|---|
| 1 | כניסת מסך | fade + translateY(8px), 200ms | כל מעבר מסך |
| 2 | אפשרויות נכנסות | stagger 40ms בין פריטים, 180ms כל אחד | מסך החידון |
| 3 | חשיפת משוב | slide-up + fade, spring, 260ms | אחרי תשובה |
| 4 | טבעת ציון | `stroke-dashoffset` נמשכת, 600ms | מסך תוצאות |
| 5 | ספירת מספרים | count-up ל-60fps, 600ms | ציון, סטטיסטיקות |
| 6 | פעימת טיימר | scale 1→1.06→1 כל שנייה מתחת ל-10 שניות | מסך החידון |

### Hard limits

- אין אנימציה חוזרת שעוברת **300ms** במסלול הראשי (תשובה → משוב → הבאה)
- אין `filter: blur()` על אלמנט שזז
- `backdrop-filter` מקסימום 12px, ורק על דיאלוג
- אין WebGL, אין GSAP, אין Lenis, אין cursor מותאם

### prefers-reduced-motion

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: .01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: .01ms !important;
  }
}
```
ב-framer-motion: `useReducedMotion()` → מחליף spring ב-fade מיידי, מבטל stagger, וטבעת הציון מצוירת סופית בלי משיכה. **המידע לעולם לא מועבר דרך תנועה בלבד** — ציון מוצג כמספר גם אם הטבעת לא נמשכת.

---

## 8. Do's and Don'ts

### Do's

1. **לבנות עומק מסולם ה-surface** לפני שמוסיפים גבול או צל.
2. **לשמור על `--accent` לפעולות בלבד** — כפתור ראשי, מצב פעיל, פוקוס.
3. **להציג כל מספר ב-mono** עם tabular figures, כדי שהפריסה לא תקפוץ.
4. **לתת לכל רכיב אינטראקטיבי חמישה מצבים** — default, hover, active, focus-visible, disabled.
5. **להשתמש בתכונות לוגיות** — `inset-inline-start`, `margin-inline`, `text-align: start`. RTL חייב לעבוד בלי מראה ידנית.
6. **44×44px מינימום** לכל יעד מגע.
7. **לתת לשאלה את מרכז המסך האופטי** — היא הסיבה שהמשתמש כאן.
8. **לבדוק ניגודיות מול `--bg` ו-`--surface-alt`** — טקסט שעובר על אחד עלול ליפול על השני.

### Don'ts

1. **לעולם לא serif לגוף טקסט.** זו הייתה התקלה המרכזית בגרסה הקודמת.
2. **לעולם לא ירוק או אדום מחוץ למשוב תשובה.** הם שפה סמנטית, לא פלטה.
3. **לעולם לא hex קשיח ברכיב.** הכול דרך משתנה.
4. **לעולם לא גרדיאנט על טקסט גוף** — רק על הלוגו, טבעת הציון ו-glow של CTA.
5. **לעולם לא `#000` טהור כרקע.** `--bg` הוא `#09090C`; שחור מוחלט יוצר הילה מסנוורת סביב טקסט לבן.
6. **לא אנימציה מעל 300ms במסלול החוזר.** המתאמן יעבור כאן 30 פעם.
7. **לא אימוג'י כאייקון ממשק.** אייקוני `lucide-react` בלבד. אימוג'י בקטגוריות מהמאגר הוא תוכן, לא ממשק — מותר.
8. **לא להעביר מידע בצבע בלבד.** נכון/שגוי מסומן גם באייקון ובטקסט, לא רק בירוק/אדום.
9. **לא יותר מצבע הדגשה אחד באזור אחד.** `--accent` ו-`--accent-2` לא מופיעים זה לצד זה באותו רכיב.
10. **לא `:hover` בלי `@media (hover: hover)`.** במגע המצב נתקע אחרי לחיצה ומשאיר את התשובה הקודמת נראית חיה בזמן שהשאלה הבאה נטענת.

---

## 10. Changelog

מסמך חי. כל שינוי עיצובי שסוטה ממנו מעדכן אותו, ולא להפך.

| תאריך | שינוי |
|---|---|
| 2026-11-04 | גרסה ראשונה — Premium Dark Console מחליף את העיצוב העיתונאי |
| 2026-11-04 | **מבחן פסק הדין** החליף את "ירוק ואדום למשוב בלבד". הניסוח המקורי היה מחמיר מדי: הוא פסל כפתורי מחיקה אדומים ואזהרות שגיאה, שהם שימוש נכון. |
| 2026-11-04 | **טבעת הציון** תועדה אחרי שסבב ביקורת גילה שהיא מופיעה ברשימת רגעי החתימה (§7 #4) אך לא נבנתה מעולם. |
| 2026-11-04 | **תג האפשרות** תועד — א/ב/ג/ד, והחלפה לאייקון בפתרון המצב. |
| 2026-11-04 | קווי הכותרות ירדו מ-2px בצבע המותג לקו שיער ניטרלי: שלושה כאלה במסך התחרו בפקד היחיד שנועד להילחץ. |
| 2026-11-04 | **דף נחיתה** (`/`) לפני ההתחברות, שעברה ל-`/login`. בנוי מאותם טוקנים ורכיבים: שאלת דוגמה ב-`.answer-option` אמיתי, וירוק רק על התשובה הנכונה — פסק דין. הוא גולל בתוך עצמו, כי `html`/`body` נעולים לגובה המסך עבור מעטפת האפליקציה. הסרגל העליון אטום ולא מטושטש: `backdrop-filter` נשאר לדיאלוג בלבד (§7). |
| 2026-11-04 | **כפתור "שאלה הבאה"** היה צמוד לקצה הימני: `.btn-primary` הוא `inline-flex`, ותיבה inline מתעלמת מ-`margin-inline: auto` של `.screen-form`. עבר ל-`flex` ומיושר עכשיו לעמודת התשובות. נתפס בצילום מסך, לא בקוד. |
| 2026-11-04 | **מסך הכניסה:** לוח הפתיחה ממורכז אנכית במקום להיצמד לתחתית, ועבר מ-hex קשיח (`#16171a` וכו') לטוקנים — `--surface`, `--border`, `--text-secondary`. |
| 2026-11-04 | **"מבית מכללת Closera"** — תג עם לוגו המכללה בדף הנחיתה (פתיח ותחתית) ובמסך הכניסה. הלוגו הוא נכס רסטר של המכללה בשתי גרסאות; ה-CSS מציג את המתאימה לערכת הנושא. צבעי הלוגו הם של המותג המכללתי ואינם חלק מהפלטה. |

---

## 9. Responsive Behavior

| Breakpoint | Range | Layout |
|---|---|---|
| Mobile | ≤ 640px | סרגל צד הופך לסרגל תחתון; שאלה 1.25rem; אפשרויות ברוחב מלא |
| Tablet | 641–1024px | סרגל צד מכווץ (72px); תוכן עד 720px |
| Desktop | ≥ 1025px | סרגל צד ניתן להרחבה; דשבורד שלוש עמודות |

**Rules**

- `100dvh` ולא `100vh` — שורת הכתובת בנייד אוכלת את ההפרש.
- `env(safe-area-inset-*)` לסרגל התחתון במכשירים עם notch.
- כל יעד מגע ≥ 44×44px בכל רוחב.
- אפס גלישה אופקית מתחת ל-600px.
- hover מופעל רק תחת `@media (hover: hover)` — במגע hover נתקע אחרי לחיצה.
- גדלי גופן ב-`rem`; המשתמש חייב להיות מסוגל להגדיל (ת"י 5568 / WCAG 1.4.4).

---

## נספח: מיפוי למשתנים הקיימים

הקוד משתמש כבר בשמות `--background`, `--foreground`, `--tf-surface`,
`--muted-foreground` וכו'. אין צורך לשנות את כל הרכיבים — הטוקנים
החדשים מוגדרים ב-`:root` והשמות הישנים ממופים אליהם, כך שהשינוי מרוכז
בקובץ אחד.

| ישן | חדש |
|---|---|
| `--background` | `--bg` |
| `--foreground` | `--text` |
| `--muted-foreground` | `--text-secondary` |
| `--tf-surface` | `--surface-alt` |
| `--tf-border` | `--border` |
| `--primary` | `--accent` |
| `--accent` (זהב ישן) | `--accent-2` |
| `--destructive` | `--danger` |
