/* ============================================================
   QuizScreen — quiz engine

   The bar and the footer are translucent material floating over
   the question, not opaque strips carved out of the viewport:
   content passes underneath and blurs, which is what tells you the
   list continues past the chrome.

   Answers highlight on press (CSS `:active`) but only commit on
   release — an answer is not undoable, so a mis-touch has to be
   escapable by dragging away.
   ============================================================ */

import { useState, useEffect, useCallback, useRef } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useApp } from "@/contexts/AppContext";
import { fadeOnly, springSettle, springSheet } from "@/lib/motion";
import { ChevronLeft, Clock, AlertTriangle, CheckCircle2, XCircle, FlaskConical, Lightbulb } from "lucide-react";

/** Fallback padding used until the chrome has been measured. */
const CHROME_TOP_FALLBACK = 92;
const CHROME_BOTTOM_FALLBACK = 92;

/** Option markers, in Hebrew alphabetical order. */
const OPTION_LETTERS = ["א", "ב", "ג", "ד", "ה", "ו"];

export default function QuizScreen() {
  const {
    currentSession,
    currentQuestion,
    currentQuestionIndex,
    isShowingFeedback,
    lastAnswer,
    submitAnswer,
    nextQuestion,
    trainingConfig,
    setScreen,
  } = useApp();

  const [timeLeft, setTimeLeft] = useState(trainingConfig.timePerQuestion || 60);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const reduceMotion = useReducedMotion();

  // The scroll area runs under the floating chrome, so it needs to
  // reserve exactly as much room as the chrome actually occupies.
  // Measured rather than hard-coded: the bar grows when the browser's
  // text-size setting is raised, and a fixed inset would clip the
  // first badge at large type.
  const topChromeRef = useRef<HTMLDivElement | null>(null);
  const [topInset, setTopInset] = useState(CHROME_TOP_FALLBACK);

  useEffect(() => {
    const el = topChromeRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(([entry]) => {
      setTopInset(Math.ceil(entry.contentRect.height));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const totalQuestions = currentSession?.questions.length ?? 0;
  const progress = totalQuestions > 0 ? ((currentQuestionIndex) / totalQuestions) * 100 : 0;

  // Reset timer on new question
  useEffect(() => {
    setSelectedIndex(null);
    setTimeLeft(trainingConfig.timePerQuestion || 60);
    startTimeRef.current = Date.now();
  }, [currentQuestionIndex, trainingConfig.timePerQuestion]);

  // Countdown tick. Kept free of side effects: a state updater can be
  // invoked more than once per tick, so submitting from inside it
  // could record the same timeout answer twice.
  useEffect(() => {
    if (isShowingFeedback || trainingConfig.timePerQuestion === 0) return;

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentQuestionIndex, isShowingFeedback, trainingConfig.timePerQuestion]);

  // Auto-submit once the clock actually reaches zero.
  useEffect(() => {
    if (timeLeft > 0) return;
    if (isShowingFeedback || selectedIndex !== null) return;
    if (trainingConfig.timePerQuestion === 0) return;

    const timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000);
    submitAnswer(-1, timeSpent);
  }, [timeLeft, isShowingFeedback, selectedIndex, trainingConfig.timePerQuestion, submitAnswer]);

  const handleSelect = useCallback((index: number) => {
    if (isShowingFeedback || selectedIndex !== null) return;
    setSelectedIndex(index);
    if (timerRef.current) clearInterval(timerRef.current);
    const timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000);
    submitAnswer(index, timeSpent);
  }, [isShowingFeedback, selectedIndex, submitAnswer]);

  if (!currentQuestion || !currentSession) {
    return (
      <div className="h-full flex items-center justify-center" style={{ direction: "rtl" }}>
        <div className="text-center">
          <p style={{ color: "var(--muted-foreground)" }}>טוען שאלה...</p>
        </div>
      </div>
    );
  }

  const timeLimit = trainingConfig.timePerQuestion;
  const timePct = timeLimit > 0 ? (timeLeft / timeLimit) * 100 : 100;
  const timerClass = timePct > 50 ? "timer-normal" : timePct > 25 ? "timer-warning" : "timer-danger";
  const timerColor = timePct > 50 ? "var(--accent)" : timePct > 25 ? "var(--warning)" : "var(--destructive)";

  return (
    <div className="h-full relative overflow-hidden" style={{ direction: "rtl", background: "var(--background)" }}>
      {/* Question area — scrolls beneath the chrome at both ends. */}
      <div
        className="absolute inset-0 overflow-y-auto px-4 sm:px-6 quiz-canvas"
        style={{
          paddingTop: topInset,
          paddingBottom: isShowingFeedback ? CHROME_BOTTOM_FALLBACK : 24,
        }}
      >
        <div className="screen-form flex flex-col gap-4">
        {/* Tags. Outlined in their own colour — the fill is reserved
            for an answered state, so an unanswered question carries
            no filled colour at all. */}
        <div className="flex items-center gap-2 flex-wrap pt-1">
          <span className="badge-pill" style={{ color: "var(--muted-foreground)" }}>
            {currentQuestion.arena}
          </span>
          {currentSession.isDemo && (
            <span className="badge-pill" style={{ color: "var(--accent)" }}>
              <FlaskConical size={10} aria-hidden="true" />
              הדגמה
            </span>
          )}
          {currentQuestion.difficulty && (
            /* Difficulty is graded on the neutral→accent ramp, never on
               green/amber/red: those three are the answer verdict, and a
               green "קל" badge reads as "you got it right". */
            <span
              className="badge-pill"
              style={{
                color: currentQuestion.difficulty === "hard" ? "var(--accent)" : "var(--text-tertiary)",
                borderColor: currentQuestion.difficulty === "hard" ? "var(--line-primary)" : undefined,
              }}
            >
              {currentQuestion.difficulty === "easy" ? "קל" : currentQuestion.difficulty === "medium" ? "בינוני" : "קשה"}
            </span>
          )}
        </div>

        {/* The question is set as a headline, not boxed in a card. */}
        <h2 className="t-title" style={{ color: "var(--foreground)" }}>
          {currentQuestion.text}
        </h2>

        {/* Answer options */}
        <div className="flex flex-col gap-2.5">
          {currentQuestion.options.map((option, index) => {
            let optClass = "answer-option";
            if (isShowingFeedback) {
              if (index === currentQuestion.correctIndex) {
                optClass += " correct-reveal";
              }
              if (lastAnswer && index === lastAnswer.selectedIndex) {
                optClass += lastAnswer.isCorrect ? " selected-correct" : " selected-wrong";
              }
            } else if (selectedIndex === index) {
              optClass += " selected-correct"; // temporary highlight
            }

            const isRevealedCorrect = isShowingFeedback && index === currentQuestion.correctIndex;
            const isRevealedWrong = isShowingFeedback && lastAnswer?.selectedIndex === index && !lastAnswer.isCorrect;

            return (
              <button
                key={index}
                className={optClass}
                onClick={() => handleSelect(index)}
                disabled={isShowingFeedback || selectedIndex !== null}
              >
                <div className="flex items-center gap-3.5">
                  <span
                    className={`answer-badge${isRevealedCorrect ? " is-correct" : ""}${isRevealedWrong ? " is-wrong" : ""}`}
                  >
                    {isRevealedCorrect ? (
                      <CheckCircle2 size={15} />
                    ) : isRevealedWrong ? (
                      <XCircle size={15} />
                    ) : (
                      // Hebrew letters, not A/B/C/D: a Latin marker in an
                      // RTL list makes the eye switch reading direction on
                      // every row.
                      OPTION_LETTERS[index] ?? index + 1
                    )}
                  </span>
                  <span className="flex-1 text-right">{option}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Feedback region — announced to screen readers on change. */}
        <div aria-live="polite" aria-atomic="true">
          {/* Timeout message */}
          {isShowingFeedback && lastAnswer?.selectedIndex === -1 && (
            <div
              className="feedback-box p-4 flex items-center gap-3"
              style={{ background: "var(--tint-primary-weak)", borderInlineStart: "3px solid var(--warning)" }}
            >
              <AlertTriangle size={18} style={{ color: "var(--warning)", flexShrink: 0 }} aria-hidden="true" />
              <p className="text-sm font-semibold" style={{ color: "var(--warning)" }}>
                הזמן נגמר. לא נבחרה תשובה.
              </p>
            </div>
          )}

          {/* Feedback box */}
          {isShowingFeedback && lastAnswer && lastAnswer.selectedIndex !== -1 && (
            <FeedbackBox
              isCorrect={lastAnswer.isCorrect}
              selectedAnswer={currentQuestion.options[lastAnswer.selectedIndex] || ""}
              correctAnswer={currentQuestion.options[currentQuestion.correctIndex]}
              explanation={currentQuestion.explanation}
              coach={currentQuestion.coach}
            />
          )}
        </div>
        </div>
      </div>

      {/* ── Floating top chrome ── */}
      <div ref={topChromeRef} className="absolute top-0 inset-x-0 z-20 tf-chrome tf-chrome-top">
        <div className="screen-form flex items-center justify-between px-4 sm:px-6 py-3">
          {/* Exit */}
          <button
            onClick={() => setScreen("hub")}
            className="flex items-center gap-1 text-sm font-bold py-1"
            style={{ color: "var(--muted-foreground)" }}
          >
            <ChevronLeft size={16} />
            יציאה
          </button>

          {/* Question counter */}
          <div className="flex items-center gap-1.5 t-numeric">
            <span className="text-sm font-bold" style={{ color: "var(--foreground)" }}>
              {currentQuestionIndex + 1}
            </span>
            <span className="text-sm" style={{ color: "var(--muted-foreground)" }}>/ {totalQuestions}</span>
          </div>

          {/* Timer — polite so it isn't announced every single second. */}
          {timeLimit > 0 && (
            <div
              className={`flex items-center gap-1.5 ${timerClass}`}
              style={{ color: timerColor }}
              role="timer"
              aria-live="off"
              aria-label={`נותרו ${timeLeft} שניות`}
            >
              <Clock size={16} aria-hidden="true" />
              {/* Tabular figures: a countdown that reflows every second
                  reads as jitter rather than as time passing. */}
              <span
                className="t-numeric font-bold"
                style={{ minWidth: "2.5ch", fontSize: "1.25rem", letterSpacing: "-0.02em" }}
              >
                {timeLeft}
              </span>
            </div>
          )}
        </div>

        {/* Progress */}
        <div className="screen-form px-4 sm:px-6 pb-3">
          <div className="flex items-center gap-3">
            <div
              className="flex-1 progress-bar-track"
              role="progressbar"
              aria-valuenow={currentQuestionIndex}
              aria-valuemin={0}
              aria-valuemax={totalQuestions}
              aria-label={`שאלה ${currentQuestionIndex + 1} מתוך ${totalQuestions}`}
            >
              {/* Scaled rather than resized: width is a layout
                  property and animating it costs a reflow every
                  frame, while a transform stays on the compositor.
                  Origin is the right edge because the layout is RTL. */}
              <motion.div
                className="progress-bar-fill"
                initial={false}
                animate={{ scaleX: progress / 100 }}
                transition={reduceMotion ? fadeOnly : springSettle}
                style={{
                  width: "100%",
                  transformOrigin: "right center",
                  transition: "none",
                  willChange: "transform",
                }}
              />
            </div>
            {/* Timer ring (if time-limited) */}
            {timeLimit > 0 && (
              <div className="relative w-7 h-7 flex-shrink-0">
                <svg viewBox="0 0 24 24" className="w-full h-full -rotate-90">
                  <circle cx="12" cy="12" r="9" fill="none" stroke="var(--surface-active)" strokeWidth="2.5" />
                  <circle
                    cx="12" cy="12" r="9" fill="none"
                    stroke={timerColor}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeDasharray="56.5"
                    strokeDashoffset={56.5 * (1 - timePct / 100)}
                    style={{ transition: "stroke-dashoffset 1s linear, stroke 0.3s ease" }}
                  />
                </svg>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Floating footer ──
          Rises from the bottom edge and leaves the same way, so the
          control is clearly anchored to the foot of the screen. */}
      <AnimatePresence>
        {isShowingFeedback && (
          <motion.div
            key="quiz-footer"
            className="absolute bottom-0 inset-x-0 z-20 p-4 sm:px-6 tf-chrome tf-chrome-bottom"
            initial={reduceMotion ? { opacity: 0 } : { y: "100%", opacity: 0 }}
            animate={reduceMotion ? { opacity: 1 } : { y: 0, opacity: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { y: "100%", opacity: 0 }}
            transition={reduceMotion ? fadeOnly : springSheet}
          >
            <button
              onClick={nextQuestion}
              className="btn-primary screen-form w-full text-base"
              autoFocus
            >
              {currentQuestionIndex + 1 >= (currentSession?.questions.length ?? 0)
                ? "סיים מבחן"
                : "שאלה הבאה"}
              <ChevronLeft size={18} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Feedback Box ──────────────────────────────────────────────

function FeedbackBox({ isCorrect, selectedAnswer, correctAnswer, explanation, coach }: {
  isCorrect: boolean;
  selectedAnswer: string;
  correctAnswer: string;
  /** Why that answer is right. Empty on banks that carry no teaching text. */
  explanation?: string;
  /** A practical tip from the trainer. Optional, same reason. */
  coach?: string;
}) {
  const verdictColor = isCorrect ? "var(--success)" : "var(--destructive)";

  return (
    <div
      className="feedback-box p-4"
      style={{
        background: isCorrect ? "var(--tint-success-weak)" : "var(--tint-danger-weak)",
        borderInlineStart: `3px solid ${verdictColor}`,
      }}
    >
      <div className="flex items-center gap-2 mb-3">
        {isCorrect
          ? <CheckCircle2 size={16} style={{ color: verdictColor, flexShrink: 0 }} aria-hidden="true" />
          : <XCircle size={16} style={{ color: verdictColor, flexShrink: 0 }} aria-hidden="true" />}
        <span className="eyebrow" style={{ color: verdictColor }}>
          {isCorrect ? "תשובה נכונה" : "תשובה שגויה"}
        </span>
      </div>

      {/* The two answers as a ruled comparison — no nested boxes. */}
      <div className="data-list" style={{ borderTopColor: "color-mix(in srgb, currentColor 15%, transparent)" }}>
        {!isCorrect && (
          <div className="data-row" style={{ borderBottomColor: "color-mix(in srgb, currentColor 15%, transparent)" }}>
            <span className="data-row-label flex-shrink-0">בחרת</span>
            <span className="text-sm font-semibold text-left" style={{ color: "var(--destructive)" }}>
              {selectedAnswer}
            </span>
          </div>
        )}
        <div className="data-row" style={{ borderBottomColor: "transparent" }}>
          <span className="data-row-label flex-shrink-0">התשובה הנכונה</span>
          <span className="text-sm font-semibold text-left" style={{ color: "var(--foreground)" }}>
            {correctAnswer}
          </span>
        </div>
      </div>

      {/* The teaching half of the feedback. A bank may carry neither,
          so each renders only when it has something to say. */}
      {explanation && (
        <div className="mt-4">
          <div className="eyebrow mb-1.5" style={{ color: "var(--muted-foreground)" }}>למה</div>
          <p className="text-sm leading-relaxed" style={{ color: "var(--foreground)" }}>
            {explanation}
          </p>
        </div>
      )}

      {coach && (
        <div
          className="mt-4 flex items-start gap-2 p-3"
          style={{
            background: "var(--tint-accent-weak, color-mix(in srgb, var(--accent) 8%, transparent))",
            borderInlineStart: "2px solid var(--accent)",
          }}
        >
          <Lightbulb size={15} style={{ color: "var(--accent)", flexShrink: 0, marginTop: 2 }} aria-hidden="true" />
          <div>
            <div className="eyebrow mb-1" style={{ color: "var(--accent)" }}>הערת מאמן</div>
            <p className="text-sm leading-relaxed" style={{ color: "var(--foreground)" }}>{coach}</p>
          </div>
        </div>
      )}
    </div>
  );
}
