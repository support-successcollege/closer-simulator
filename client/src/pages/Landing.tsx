/* ============================================================
   Landing — what CLOSER is, before anyone signs in.

   A short page, not a marketing site: one claim, a live-looking
   question so the product explains itself, three steps, four
   reasons, and the same call to action at the top and the bottom.
   Every colour comes from the DESIGN.md tokens; green appears only
   on the sample answer, where it is a verdict.
   ============================================================ */

import { useRef } from "react";
import { useLocation } from "wouter";
import { ChevronLeft, Check, Layers, Zap, RotateCcw, LineChart } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import Wordmark from "@/components/Wordmark";

const STEPS = [
  {
    title: "בוחרים זירה",
    body: "נדל\"ן, ביטוח, B2B, הייטק, קוסמטיקה ועוד. מתאמנים בתחום שבו אתם באמת מוכרים.",
  },
  {
    title: "עונים על תרחיש",
    body: "לקוח מתלבט, התנגדות מחיר, שאלה לא נוחה. בכל שאלה מחליטים מה אומרים עכשיו.",
  },
  {
    title: "מקבלים משוב מיידי",
    body: "רואים מיד אם צדקתם ומה הייתה התשובה הנכונה, וממשיכים לתרחיש הבא.",
  },
];

const FEATURES = [
  {
    icon: Layers,
    title: "21 זירות מכירה",
    body: "מאגר של אלפי תרחישים מהשטח, מסודרים לפי תחום ורמת קושי.",
  },
  {
    icon: Zap,
    title: "משוב אחרי כל תשובה",
    body: "לא מחכים לסוף המבחן כדי להבין איפה טעיתם.",
  },
  {
    icon: RotateCcw,
    title: "חזרה על טעויות",
    body: "מצב אימון שמחזיר בדיוק את השאלות שבהן נפלתם, עד שהן יושבות.",
  },
  {
    icon: LineChart,
    title: "מעקב התקדמות",
    body: "ציון לכל מפגש, יעד שבועי ותמונה ברורה של החוזקות והחולשות.",
  },
];

// A real question shape, frozen in its resolved state: the fastest
// way to show what an answer → feedback round looks like.
const SAMPLE = {
  arena: "נדל\"ן",
  question: "הלקוח אומר: \"הדירה מעולה, אבל אני צריך לחשוב על זה עם אשתי.\" מה עושים?",
  options: [
    "נותנים לו זמן ומתקשרים בעוד שבוע",
    "מציעים לקבוע פגישה משותפת עם בת הזוג כבר השבוע",
    "מורידים מחיר כדי לסגור עכשיו",
  ],
  correct: 1,
};

const LETTERS = ["א", "ב", "ג", "ד"];

export default function Landing() {
  const { isAuthenticated } = useApp();
  const [, setLocation] = useLocation();
  const stepsRef = useRef<HTMLElement>(null);

  const enter = () => setLocation(isAuthenticated ? "/app" : "/login");
  const ctaLabel = isAuthenticated ? "המשך לסימולטור" : "כניסה לסימולטור";

  return (
    <div className="landing" style={{ direction: "rtl" }}>
      {/* ── Top bar ── */}
      <header className="landing-bar">
        <div className="landing-measure flex items-center justify-between gap-4">
          <Wordmark size="lg" />
          <button onClick={enter} className="btn-secondary landing-btn">
            {isAuthenticated ? "לסימולטור" : "כניסה"}
          </button>
        </div>
      </header>

      <main>
        {/* ── Hero ── */}
        <section className="landing-measure landing-hero screen-enter">
          <div className="min-w-0">
            <p className="eyebrow mb-4">סימולטור אימון מכירות</p>
            <h1 className="t-display mb-5">
              מתאמנים על שיחת המכירה
              <br />
              לפני שהיא אמיתית
            </h1>
            <p className="landing-lead mb-8">
              CLOSER מעמיד אתכם מול אלפי תרחישי מכירה מהשטח, מהתנגדות מחיר ועד לקוח
              שלא מחליט, ונותן משוב מיידי על כל החלטה. בלי לקוח אמיתי על הקו, ובלי
              עסקה שהולכת לאיבוד.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <button onClick={enter} className="btn-primary landing-btn">
                {ctaLabel}
                <ChevronLeft size={18} aria-hidden="true" />
              </button>
              <button
                onClick={() => stepsRef.current?.scrollIntoView({ behavior: "smooth" })}
                className="landing-link"
              >
                איך זה עובד
              </button>
            </div>

            <dl className="landing-figures">
              <div>
                <dt>תרחישי מכירה</dt>
                <dd className="t-numeric" dir="ltr">4,800+</dd>
              </div>
              <div>
                <dt>זירות התמחות</dt>
                <dd className="t-numeric">21</dd>
              </div>
              <div>
                <dt>מצבי אימון</dt>
                <dd className="t-numeric">3</dd>
              </div>
            </dl>
          </div>

          {/* Sample question, in the app's own components. */}
          <figure className="landing-sample" aria-label="דוגמה לשאלה מתוך הסימולטור">
            <div className="flex items-center justify-between mb-4">
              <span className="eyebrow">זירה · {SAMPLE.arena}</span>
              <span className="t-numeric text-xs" style={{ color: "var(--text-tertiary)" }}>
                03 / 10
              </span>
            </div>
            <p className="landing-sample-q mb-5">{SAMPLE.question}</p>
            <div className="flex flex-col gap-2.5">
              {SAMPLE.options.map((text, i) => {
                const isCorrect = i === SAMPLE.correct;
                return (
                  <div
                    key={text}
                    className={`answer-option landing-sample-option ${isCorrect ? "correct-reveal" : ""}`}
                  >
                    <span className={`answer-badge ${isCorrect ? "is-correct" : ""}`}>
                      {isCorrect ? <Check size={15} aria-hidden="true" /> : LETTERS[i]}
                    </span>
                    <span>{text}</span>
                  </div>
                );
              })}
            </div>
            <figcaption className="landing-sample-note">
              <span style={{ color: "var(--success)", fontWeight: 700 }}>תשובה נכונה.</span>{" "}
              "לחשוב על זה" הוא בדרך כלל מקבל החלטות שלא נמצא בחדר. מביאים אותו לשיחה
              במקום לחכות.
            </figcaption>
          </figure>
        </section>

        {/* ── How it works ── */}
        <section ref={stepsRef} className="landing-measure landing-section">
          <div className="section-head">
            <span className="eyebrow">01</span>
            <h2 className="section-head-title">איך זה עובד</h2>
          </div>
          <ol className="landing-steps">
            {STEPS.map((step, i) => (
              <li key={step.title}>
                <span className="t-numeric landing-step-n">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="t-heading mb-2">{step.title}</h3>
                <p className="landing-body">{step.body}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* ── Why ── */}
        <section className="landing-measure landing-section">
          <div className="section-head">
            <span className="eyebrow">02</span>
            <h2 className="section-head-title">למה CLOSER</h2>
          </div>
          <div className="landing-features">
            {FEATURES.map(({ icon: Icon, title, body }) => (
              <div key={title} className="landing-feature">
                <span className="landing-feature-icon">
                  <Icon size={18} aria-hidden="true" />
                </span>
                <h3 className="t-heading mb-1.5">{title}</h3>
                <p className="landing-body">{body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Closing call to action ── */}
        <section className="landing-measure landing-section">
          <div className="landing-cta">
            <div className="min-w-0">
              <h2 className="t-title mb-2">העסקה הבאה מתחילה באימון</h2>
              <p className="landing-body">עשר שאלות, עשר דקות. תראו בעצמכם איפה אתם עומדים.</p>
            </div>
            <button onClick={enter} className="btn-primary landing-btn flex-shrink-0">
              {ctaLabel}
              <ChevronLeft size={18} aria-hidden="true" />
            </button>
          </div>
        </section>
      </main>

      <footer className="landing-measure landing-footer">
        <Wordmark size="sm" />
        <span>סימולטור אימון מכירות</span>
      </footer>
    </div>
  );
}
