import { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'

// --- Tweakable options (change defaults here) ---
const ACCENT = 'cyan+violet' // 'cyan+violet' | 'cyan only' | 'violet only' | 'ice blue'
const LINE_NUMBERS = true
const SCANLINES = true

const accentMap = {
  'cyan+violet': ['#57d0e6', '#9d8cf0'],
  'cyan only': ['#57d0e6', '#57d0e6'],
  'violet only': ['#9d8cf0', '#b39dff'],
  'ice blue': ['#7fb6e6', '#6fa0d8'],
}

const defaultSentence = 'אני לומד בינה מלאכותית'

const pipelineSteps = [
  { num: '01', label: 'טקסט', code: 'raw_text', tone: 'accent' },
  { num: '02', label: 'טוקנים', code: 'tokens[]', tone: 'accent2' },
  { num: '03', label: 'מספרים', code: 'token_ids', tone: 'amber' },
  { num: '04', label: 'ניבוי', code: 'predict()', tone: 'accent' },
]

const concepts = [
  {
    tone: 'accent',
    text: 'מודלי שפה לא קוראים משפטים כמו בני אדם — הם מפרקים אותם ליחידות קטנות שנקראות טוקנים.',
  },
  {
    tone: 'accent2',
    text: 'טוקן יכול להיות מילה, חלק ממילה, מספר, סימן פיסוק או תו מיוחד.',
  },
  {
    tone: 'amber',
    text: 'אחרי הפירוק, כל טוקן מיוצג בצורה מספרית כדי שהמודל יוכל לחשב קשרים ולחזות המשך.',
  },
]

const predictions = [
  { token: 'לעבוד', probability: 62 },
  { token: 'להתקדם', probability: 24 },
  { token: 'ללמוד', probability: 10 },
  { token: 'לאכול', probability: 4 },
]

const businessItems = [
  {
    num: '[01]',
    tone: 'accent',
    title: 'עלות שימוש',
    text: 'יותר טוקנים יכולים להגדיל את עלות הקריאה למודל.',
  },
  {
    num: '[02]',
    tone: 'accent2',
    title: 'אורך קלט',
    text: 'לכל מודל יש מגבלה על כמות הטוקנים שניתן לשלוח.',
  },
  {
    num: '[03]',
    tone: 'amber',
    title: 'אורך תשובה',
    text: 'גם התשובה שהמודל מחזיר נספרת כחלק מתקציב הטוקנים.',
  },
  {
    num: '[04]',
    tone: 'accent',
    title: 'מסמכים ופניות',
    text: 'מיילים, חוזים ופניות ארוכות דורשים תכנון חכם של הקלט.',
  },
]

const quizQuestions = [
  {
    question: 'מהו טוקן?',
    options: [
      'יחידת טקסט שהמודל מעבד',
      'שם של שרת ענן',
      'סוג של קובץ תמונה',
    ],
    correct: 'יחידת טקסט שהמודל מעבד',
  },
  {
    question: 'למה המודל ממיר טוקנים לייצוג מספרי?',
    options: [
      'כי מחשבים עובדים עם ייצוגים מספריים',
      'כדי למחוק סימני פיסוק',
      'כדי להפוך את הטקסט לאנגלית',
    ],
    correct: 'כי מחשבים עובדים עם ייצוגים מספריים',
  },
  {
    question: 'למה כמות הטוקנים חשובה בשימוש עסקי ב-AI?',
    options: [
      'כי היא יכולה להשפיע על עלות, מהירות ואורך הקלט/פלט',
      'כי היא קובעת את צבע הממשק',
      'כי היא מחליפה את הצורך במידע עסקי',
    ],
    correct: 'כי היא יכולה להשפיע על עלות, מהירות ואורך הקלט/פלט',
  },
]

function tokenize(text) {
  return String(text || '').trim().match(/[֐-׿]+|[A-Za-z]+|\d+|[^\s]/g) ?? []
}

function tokenId(token) {
  let hash = 17

  for (const character of token) {
    hash = (hash * 37 + character.charCodeAt(0)) % 90000
  }

  return hash + 10000
}

function App() {
  const [sentence, setSentence] = useState(defaultSentence)
  const [tokens, setTokens] = useState(() => tokenize(defaultSentence))
  const [run, setRun] = useState(1)
  const [scanning, setScanning] = useState(false)
  const [answers, setAnswers] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const timeoutRef = useRef(null)

  const [accentPrimary, accentSecondary] = accentMap[ACCENT] ?? accentMap['cyan+violet']
  const themeVars = { '--accent': accentPrimary, '--accent-2': accentSecondary }

  const tokenData = useMemo(
    () => tokens.map((token, index) => ({ token, id: tokenId(token), index })),
    [tokens],
  )

  const tokenCount = tokenData.length
  const charCount = tokenData.reduce((total, item) => total + item.token.length, 0)
  const charsPerToken = tokenCount > 0 ? (charCount / tokenCount).toFixed(1) : '0'
  const hasTokens = tokenCount > 0
  const showTokens = !scanning && hasTokens
  const showEmpty = !scanning && !hasTokens
  const showStats = !scanning && hasTokens

  const topProbability = Math.max(...predictions.map((item) => item.probability))

  const answeredCount = Object.keys(answers).length
  const total = quizQuestions.length
  const score = quizQuestions.reduce(
    (sum, item, index) => sum + (answers[index] === item.correct ? 1 : 0),
    0,
  )
  const canSubmit = answeredCount >= total
  const perfect = score === total
  const scoreLine = submitted ? `${score}/${total}` : `${answeredCount}/${total}`
  const resultLabel = submitted
    ? perfect
      ? 'עברת — כל התשובות נכונות'
      : 'חלקי — המשיכו ללמוד'
    : 'שאלות שנענו'

  useEffect(() => () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
  }, [])

  function handleTokenize() {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setScanning(true)
    timeoutRef.current = setTimeout(() => {
      setTokens(tokenize(sentence))
      setRun((value) => value + 1)
      setScanning(false)
    }, 440)
  }

  function handleKeyDown(event) {
    if (event.key === 'Enter') handleTokenize()
  }

  function selectAnswer(questionIndex, option) {
    setAnswers((current) => ({ ...current, [questionIndex]: option }))
    setSubmitted(false)
  }

  function submitQuiz() {
    if (canSubmit) setSubmitted(true)
  }

  return (
    <div className="app" style={themeVars}>
      <div className="bg-glow" aria-hidden="true"></div>
      {SCANLINES && <div className="bg-scanlines" aria-hidden="true"></div>}

      <a className="skip-link" href="#lab">
        דלגו למעבדה האינטראקטיבית
      </a>

      <header className="topbar">
        <div className="topbar-inner">
          <div className="topbar-left">
            <span className="win-dots win-dots--mute" aria-hidden="true">
              <span></span>
              <span></span>
              <span></span>
            </span>
            <span className="breadcrumb">
              ~/tokenlab/lesson_09/<span className="breadcrumb-file">tokens.demo</span>
            </span>
          </div>
          <span className="topbar-status">
            <span className="dot-green" aria-hidden="true"></span>he-IL · RTL
          </span>
        </div>
      </header>

      <main id="main">
        {/* HERO */}
        <section id="top" className="hero" aria-labelledby="page-title">
          <div className="hero-card">
            <div className="hero-source">
              {LINE_NUMBERS && (
                <div className="gutter" aria-hidden="true">
                  {Array.from({ length: 12 }, (_, index) => (
                    <span key={index}>{String(index + 1).padStart(2, '0')}</span>
                  ))}
                </div>
              )}
              <div className="hero-content">
                <div className="code-comment">// שיעור 9 · מודלי שפה · טוקנים</div>
                <div className="wordmark">
                  <span className="wordmark-text">TokenLab</span>
                  <span className="wordmark-cursor" aria-hidden="true">_</span>
                </div>
                <h1 className="hero-title" id="page-title">
                  איך מודל שפה קורא משפט?
                </h1>
                <p className="hero-lead">
                  המחשה אינטראקטיבית למושג "טוקנים במודלי שפה גדולים" מתוך הקורס
                  יישומי AI בעולם העסקי. תראו איך משפט מתפרק לטוקנים, איך כל טוקן
                  מקבל מזהה מספרי, ואיך מודל שפה בוחר את הטוקן הבא לפי הסתברויות.
                </p>
                <div className="hero-actions">
                  <a className="btn-run" href="#lab">
                    התחילו הדגמה <span className="btn-run-suffix">run()</span>
                  </a>
                </div>
                <div className="hero-tags" aria-label="נושאי השיעור">
                  <span className="tag tag--accent">lesson_09</span>
                  <span className="tag tag--accent2">LLMs</span>
                  <span className="tag tag--amber">טוקנים</span>
                  <span className="tag tag--muted">ניבוי הטוקן הבא</span>
                </div>
              </div>
            </div>

            <aside className="hero-output" aria-hidden="true">
              <div className="pane-head">
                <span className="win-dots win-dots--accent">
                  <span></span>
                  <span></span>
                  <span></span>
                </span>
                <span className="pane-title">מפענח · פלט</span>
              </div>
              <div className="pane-body">
                <div className="sweep">
                  <div className="sweep-bar"></div>
                </div>
                <div className="out-block">
                  <div className="out-label">קלט</div>
                  <div className="out-input">
                    אני לומד בינה מלאכותית<span className="caret">▌</span>
                  </div>
                </div>
                <div className="out-block">
                  <div className="out-label">טוקנים</div>
                  <div className="out-tokens">
                    <span>אני</span>
                    <span>לומד</span>
                    <span>בינה</span>
                    <span>מלאכותית</span>
                  </div>
                </div>
                <div className="out-block">
                  <div className="out-label">הבא ›</div>
                  <div className="out-next-row">
                    <strong>לעבוד</strong>
                    <span className="mono-accent">0.62</span>
                  </div>
                  <div className="track">
                    <div className="track-fill track-fill--loop" style={{ width: '62%' }}></div>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </section>

        {/* PIPELINE */}
        <section className="pipeline" aria-label="זרימת הלמידה">
          <div className="pipeline-grid">
            {pipelineSteps.map((step, index) => (
              <div
                className="pipe-chip"
                key={step.num}
                style={{ animationDelay: `${index * 0.45}s` }}
              >
                <span className={`pipe-num pipe-num--${step.tone}`}>{step.num}</span>
                <div>
                  <strong className="pipe-label">{step.label}</strong>
                  <span className="pipe-code">{step.code}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CONCEPT */}
        <section className="concept" aria-labelledby="concept-title">
          <div className="concept-panel">
            <div>
              <div className="mono-label mono-label--he mono-label--accent">/* מושג */</div>
              <h2 className="section-title" id="concept-title">
                מהו טוקן?
              </h2>
            </div>
            <ul className="concept-list">
              {concepts.map((item) => (
                <li className="concept-row" key={item.text}>
                  <span className={`concept-bullet concept-bullet--${item.tone}`} aria-hidden="true">
                    ▹
                  </span>
                  <p>{item.text}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* LAB */}
        <section id="lab" className="lab" aria-labelledby="lab-title">
          <div className="section-intro">
            <div className="mono-label mono-label--accent">tokenizer.run()</div>
            <h2 className="section-title" id="lab-title">
              המעבדה האינטראקטיבית
            </h2>
            <p className="section-lead">
              סימולציה פדגוגית: לא טוקנייזר אמיתי, אבל היא ממחישה את צורת החשיבה
              שמאחורי מודלי שפה גדולים — טקסט הופך לטוקנים, ואז למספרים.
            </p>
          </div>

          <div className="panel">
            <div className="panel-head">
              <span className="win-dots win-dots--mute" aria-hidden="true">
                <span></span>
                <span></span>
                <span></span>
              </span>
              <span className="pane-title">אינטראקטיבי · ארגז חול</span>
            </div>
            <div className="panel-body">
              <div className="input-block">
                <label htmlFor="sentence-input" className="input-label">
                  כתבו משפט בעברית
                </label>
                <p className="input-help">
                  אפשר להתחיל מהמשפט המוכן או לנסות משפט משלכם, וללחוץ על "פרק לטוקנים".
                </p>
                <div className="input-row">
                  <span className="input-prompt" aria-hidden="true">&gt;</span>
                  <input
                    id="sentence-input"
                    type="text"
                    value={sentence}
                    onChange={(event) => setSentence(event.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="לדוגמה: אני לומד בינה מלאכותית"
                  />
                  <button type="button" className="btn-tokenize" onClick={handleTokenize}>
                    פרק לטוקנים
                  </button>
                </div>
              </div>

              {showStats && (
                <div className="stats" key={`stats-${run}`} aria-live="polite">
                  <div className="stat-pill">
                    <strong className="stat-num stat-num--accent">{tokenCount}</strong>
                    <span>טוקנים</span>
                  </div>
                  <div className="stat-pill">
                    <strong className="stat-num stat-num--accent2">{charCount}</strong>
                    <span>תווים</span>
                  </div>
                  <div className="stat-pill">
                    <strong className="stat-num stat-num--amber">{charsPerToken}</strong>
                    <span>תווים לטוקן</span>
                  </div>
                </div>
              )}

              {scanning && (
                <div className="scan-line" aria-live="polite">
                  <span className="spinner" aria-hidden="true"></span>
                  מפרק לטוקנים…
                </div>
              )}

              <div className="lab-grid">
                <section className="output-zone" aria-labelledby="tokens-title">
                  <div className="zone-heading">
                    <span className="step-badge step-badge--accent">שלב 02</span>
                    <h3 id="tokens-title">הטוקנים שנוצרו</h3>
                  </div>
                  {showTokens && (
                    <div className="token-area" key={`tokens-${run}`}>
                      {tokenData.map((item) => (
                        <div
                          className="token-chip"
                          key={`${item.token}-${item.index}`}
                          style={{ animationDelay: `${item.index * 55}ms` }}
                        >
                          <span
                            className={`token-idx ${item.index % 2 ? 'token-idx--accent2' : 'token-idx--accent'}`}
                          >
                            #{item.index + 1}
                          </span>
                          <strong>{item.token}</strong>
                        </div>
                      ))}
                    </div>
                  )}
                  {showEmpty && (
                    <p className="empty-state">הזינו משפט כדי לראות טוקנים.</p>
                  )}
                </section>

                <section className="output-zone" aria-labelledby="ids-title">
                  <div className="zone-heading">
                    <span className="step-badge step-badge--amber">שלב 03</span>
                    <h3 id="ids-title">מזהי טוקנים</h3>
                  </div>
                  {showTokens && (
                    <div className="id-list" key={`ids-${run}`}>
                      {tokenData.map((item) => (
                        <div
                          className="id-row"
                          key={`${item.token}-id-${item.index}`}
                          style={{ animationDelay: `${item.index * 55}ms` }}
                        >
                          <span>{item.token}</span>
                          <code>{item.id}</code>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              </div>

              <div className="callout">
                <span className="callout-mark" aria-hidden="true">//</span>
                <div>
                  <strong>למה מספרים?</strong>
                  <p>
                    מחשבים אינם מבינים מילים כמו בני אדם, ולכן כל טוקן מיוצג כמספר.
                    הייצוג המספרי מאפשר למודל לחשב, לזהות קשרים בין מילים, ולחזות
                    מה יכול להגיע בהמשך.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PREDICTION */}
        <section className="prediction" aria-labelledby="prediction-title">
          <div className="prediction-head">
            <div>
              <div className="mono-label mono-label--accent">llm.predict(next_token)</div>
              <h2 className="section-title" id="prediction-title">
                ניבוי הטוקן הבא
              </h2>
            </div>
            <div className="sentence-preview">
              אני לומד בינה מלאכותית כדי<span className="caret">▌</span>
            </div>
          </div>

          <div className="prediction-grid">
            {predictions.map((prediction, index) => {
              const isTop = prediction.probability === topProbability

              return (
                <article
                  className={`prediction-option${isTop ? ' winner' : ''}`}
                  key={prediction.token}
                >
                  {isTop && <span className="winner-badge">★ הכי סביר</span>}
                  <div className="prediction-label">
                    <strong>{prediction.token}</strong>
                    <span className={isTop ? 'mono-accent' : 'mono-dim'}>
                      {prediction.probability}%
                    </span>
                  </div>
                  <div
                    className="track"
                    aria-label={`${prediction.token}: ${prediction.probability} אחוז`}
                  >
                    <div
                      className="track-fill track-fill--fill"
                      style={{
                        width: `${prediction.probability}%`,
                        opacity: [1, 0.7, 0.55, 0.4][index] ?? 1,
                        animationDelay: `${index * 120}ms`,
                      }}
                    ></div>
                  </div>
                </article>
              )
            })}
          </div>

          <p className="prediction-copy">
            מודל שפה גדול מאומן על כמויות עצומות של טקסטים. המטרה המרכזית שלו היא
            לחזות מה הטוקן הבא שהכי סביר שיופיע ברצף. המודל לא באמת "חושב" כמו בן
            אדם — הוא מחשב הסתברויות על בסיס הדפוסים שלמד מהמידע שעליו אומן.
          </p>
        </section>

        {/* BUSINESS */}
        <section className="business" aria-labelledby="business-title">
          <div className="section-intro">
            <div className="mono-label mono-label--he mono-label--accent2">// השפעה עסקית</div>
            <h2 className="section-title" id="business-title">
              למה זה חשוב בעולם העסקי?
            </h2>
            <p className="section-lead">
              חברה שמפעילה צ'אטבוט שירות לקוחות ושולחת אלפי פניות למודל AI צריכה
              להבין: ככל שהטקסטים ארוכים יותר, יש יותר טוקנים — ולכן השימוש עשוי
              להיות יקר ואיטי יותר.
            </p>
          </div>
          <div className="business-grid">
            {businessItems.map((item) => (
              <article className="business-card" key={item.title}>
                <span className={`card-num card-num--${item.tone}`}>{item.num}</span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </section>

        {/* QUIZ */}
        <section className="quiz" aria-labelledby="quiz-title">
          <div className="section-intro">
            <div className="mono-label mono-label--accent">assert.understanding()</div>
            <h2 className="section-title" id="quiz-title">
              חידון קצר
            </h2>
            <p className="section-lead">
              בחרו תשובה אחת לכל שאלה, ואז הריצו את הבדיקה כדי לראות את הציון.
            </p>
          </div>

          <div className="quiz-list">
            {quizQuestions.map((item, questionIndex) => (
              <article className="quiz-card" key={item.question}>
                <div className="quiz-card-head">
                  <span className="test-badge">בדיקה {String(questionIndex + 1).padStart(2, '0')}</span>
                  <h3 id={`quiz-q-${questionIndex}`}>{item.question}</h3>
                </div>
                <div
                  className="answer-grid"
                  role="radiogroup"
                  aria-labelledby={`quiz-q-${questionIndex}`}
                >
                  {item.options.map((option) => {
                    const isSelected = answers[questionIndex] === option
                    const isCorrect = option === item.correct
                    const showCorrect = submitted && isCorrect
                    const showWrong = submitted && isSelected && !isCorrect
                    const ariaLabel = showCorrect
                      ? `${option} — תשובה נכונה`
                      : showWrong
                        ? `${option} — תשובה שגויה`
                        : undefined

                    return (
                      <button
                        className={[
                          'answer-button',
                          isSelected ? 'selected' : '',
                          showCorrect ? 'correct' : '',
                          showWrong ? 'wrong' : '',
                        ]
                          .filter(Boolean)
                          .join(' ')}
                        type="button"
                        key={option}
                        role="radio"
                        aria-checked={isSelected}
                        aria-label={ariaLabel}
                        onClick={() => selectAnswer(questionIndex, option)}
                      >
                        <span className="answer-text">{option}</span>
                        {showCorrect && (
                          <span className="answer-mark answer-mark--ok" aria-hidden="true">✓</span>
                        )}
                        {showWrong && (
                          <span className="answer-mark answer-mark--bad" aria-hidden="true">✗</span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </article>
            ))}
          </div>

          <div className="quiz-footer">
            <button
              type="button"
              className="btn-run"
              onClick={submitQuiz}
              disabled={!canSubmit}
            >
              הריצו בדיקה <span className="btn-run-suffix">run_tests</span>
            </button>
            <div className="quiz-result" aria-live="polite">
              <span className={`result-score${perfect && submitted ? ' result-score--pass' : ''}`}>
                {scoreLine}
              </span>
              <span className="result-label">{resultLabel}</span>
            </div>
          </div>
        </section>

        {/* SUMMARY */}
        <section className="summary" aria-labelledby="summary-title">
          <div className="summary-panel">
            <div className="mono-label mono-label--he mono-label--accent2">/* סיכום */</div>
            <h2 className="section-title" id="summary-title">
              מה למדתם?
            </h2>
            <div className="summary-grid">
              <p>
                טוקנים הם אבן בסיס של מודלי שפה גדולים. הם מאפשרים למודל לפרק טקסט,
                לייצג אותו בצורה מספרית, ולחזות את ההמשך האפשרי של המשפט. הכמות שלהם
                משפיעה גם על עלות וביצועים בשימוש עסקי.
              </p>
              <p>
                ההמחשה כאן היא סימולציה פדגוגית ואינה טוקנייזר אמיתי של OpenAI —
                ה-Token IDs מדומים. המטרה היא להבין את העיקרון בצורה חזותית ופשוטה.
                פרויקט אישי בקורס יישומי AI בעולם העסקי, שיעור 9.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="footer-inner">
          <span className="footer-status">
            <span className="dot-green" aria-hidden="true"></span>he-IL · RTL · client-side
          </span>
          <span className="footer-meta">lesson_09 · tokens · next_token_prediction</span>
          <span>סימולציה פדגוגית — לא טוקנייזר אמיתי</span>
        </div>
      </footer>
    </div>
  )
}

export default App
