import { useMemo, useState } from 'react'
import './App.css'

const defaultSentence = 'אני לומד בינה מלאכותית'

const flowSteps = ['טקסט', 'טוקנים', 'מספרים', 'ניבוי']

const predictions = [
  { token: 'לעבוד', probability: 62 },
  { token: 'להתקדם', probability: 24 },
  { token: 'ללמוד', probability: 10 },
  { token: 'לאכול', probability: 4 },
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

const businessItems = [
  {
    title: 'עלות שימוש',
    text: 'יותר טוקנים יכולים להגדיל את עלות הקריאה למודל.',
  },
  {
    title: 'אורך קלט',
    text: 'לכל מודל יש מגבלה על כמות הטוקנים שניתן לשלוח.',
  },
  {
    title: 'אורך תשובה',
    text: 'גם התשובה שהמודל מחזיר נספרת כחלק מתקציב הטוקנים.',
  },
  {
    title: 'מסמכים ופניות לקוחות',
    text: 'מיילים, חוזים ופניות ארוכות דורשים תכנון חכם של הקלט.',
  },
]

function tokenize(text) {
  return text.trim().match(/[\u0590-\u05FF]+|[A-Za-z]+|\d+|[^\s]/g) ?? []
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
  const [tokenizedAt, setTokenizedAt] = useState(1)
  const [answers, setAnswers] = useState({})
  const [quizSubmitted, setQuizSubmitted] = useState(false)

  const tokenData = useMemo(
    () => tokens.map((token, index) => ({ token, id: tokenId(token), index })),
    [tokens],
  )

  const answeredCount = Object.keys(answers).length
  const score = quizQuestions.reduce(
    (total, item, index) => total + (answers[index] === item.correct ? 1 : 0),
    0,
  )
  const canSubmitQuiz = answeredCount === quizQuestions.length

  function handleTokenize() {
    setTokens(tokenize(sentence))
    setTokenizedAt((value) => value + 1)
  }

  function selectAnswer(questionIndex, option) {
    setAnswers((current) => ({ ...current, [questionIndex]: option }))
    setQuizSubmitted(false)
  }

  function submitQuiz() {
    if (canSubmitQuiz) {
      setQuizSubmitted(true)
    }
  }

  return (
    <div className="page-shell">
      <a className="skip-link" href="#main">
        דלגו לתוכן הראשי
      </a>
      <header className="top-header">
        <a className="brand-mark" href="#top" aria-label="TokenLab ראש הדף">
          TokenLab
        </a>
        <p>פרויקט אישי — יישומי AI בעולם העסקי</p>
      </header>

      <main id="main">
      <section id="top" className="hero-section" aria-labelledby="page-title">
        <div className="hero-content">
          <p className="eyebrow">שיעור 9 · Language Models · Tokens</p>
          <h1 id="page-title">TokenLab — איך מודל שפה קורא משפט?</h1>
          <p className="hero-subtitle">
            המחשה אינטראקטיבית למושג "טוקנים במודלי שפה גדולים" מתוך הקורס
            יישומי AI בעולם העסקי.
          </p>
          <p className="hero-note">
            תראו איך משפט בעברית מתפרק לטוקנים, איך כל טוקן מקבל מזהה מספרי,
            ואיך מודל שפה בוחר את הטוקן הבא לפי הסתברויות.
          </p>

          <div className="hero-actions">
            <a className="primary-cta" href="#lab">
              התחילו הדגמה
            </a>
            <div className="hero-badges" aria-label="נושאי השיעור">
              <span>שיעור 9</span>
              <span>LLMs</span>
              <span>Tokens</span>
              <span>Next Token Prediction</span>
            </div>
          </div>
        </div>

        <aside className="hero-lab-card" aria-hidden="true">
          <div className="mock-toolbar">
            <span></span>
            <span></span>
            <span></span>
          </div>
          <div className="mock-stage">
            <p className="mock-label">משפט</p>
            <p className="mock-sentence">אני לומד בינה מלאכותית כדי...</p>
          </div>
          <div className="mock-token-row">
            <span>אני</span>
            <span>לומד</span>
            <span>בינה</span>
            <span>מלאכותית</span>
          </div>
          <div className="mock-id-grid">
            <span>אני <strong>65214</strong></span>
            <span>לומד <strong>31877</strong></span>
            <span>בינה <strong>74201</strong></span>
            <span>מלאכותית <strong>58934</strong></span>
          </div>
          <div className="mock-prediction">
            <div>
              <strong>לעבוד</strong>
              <span>62%</span>
            </div>
            <div className="mock-track">
              <span></span>
            </div>
          </div>
        </aside>
      </section>

      <nav className="flow-timeline" aria-label="זרימת הלמידה">
        {flowSteps.map((step, index) => (
          <div className="timeline-step" key={step}>
            <span>{index + 1}</span>
            <strong>{step}</strong>
          </div>
        ))}
      </nav>

      <section className="info-panel" aria-labelledby="token-title">
        <div>
          <p className="eyebrow">הרעיון המרכזי</p>
          <h2 id="token-title">מהו טוקן?</h2>
        </div>
        <ul className="concept-list">
          <li>מודלי שפה לא קוראים משפטים כמו בני אדם, אלא מפרקים אותם ליחידות קטנות.</li>
          <li>טוקן יכול להיות מילה, חלק ממילה, מספר, סימן פיסוק או תו מיוחד.</li>
          <li>אחרי הפירוק, כל טוקן מיוצג בצורה מספרית כדי שהמודל יוכל לחשב ולחזות המשך.</li>
        </ul>
      </section>

      <section id="lab" className="lab-section" aria-labelledby="lab-title">
        <div className="section-intro">
          <p className="eyebrow">המעבדה האינטראקטיבית</p>
          <h2 id="lab-title">טקסט → טוקנים → מספרים → ניבוי</h2>
          <p>
            זו סימולציה פדגוגית פשוטה: היא לא משתמשת בטוקנייזר אמיתי, אבל היא
            ממחישה את צורת החשיבה מאחורי מודלי שפה גדולים.
          </p>
        </div>

        <div className="lab-panel">
          <div className="lab-step-list" aria-label="שלבי המעבדה">
            {flowSteps.map((step, index) => (
              <div className="lab-step" key={step}>
                <span>0{index + 1}</span>
                <strong>{step}</strong>
              </div>
            ))}
          </div>

          <div className="input-zone">
            <div>
              <label htmlFor="sentence-input">כתבו משפט בעברית</label>
              <p>אפשר להתחיל מהמשפט המוכן או לנסות משפט משלכם.</p>
            </div>
            <div className="input-row">
              <input
                id="sentence-input"
                type="text"
                value={sentence}
                onChange={(event) => setSentence(event.target.value)}
                placeholder="לדוגמה: אני לומד בינה מלאכותית"
              />
              <button type="button" onClick={handleTokenize}>
                פרק לטוקנים
              </button>
            </div>
          </div>

          <div className="lab-output-grid">
            <section className="output-zone" aria-labelledby="tokens-title">
              <div className="zone-heading">
                <span>שלב 2</span>
                <h3 id="tokens-title">הטוקנים שנוצרו</h3>
              </div>
              <div className="token-area" key={tokenizedAt}>
                {tokenData.length > 0 ? (
                  tokenData.map((item) => (
                    <div className="token-chip" key={`${item.token}-${item.index}`}>
                      <span>#{item.index + 1}</span>
                      <strong>{item.token}</strong>
                    </div>
                  ))
                ) : (
                  <p className="empty-state">הזינו משפט כדי לראות טוקנים.</p>
                )}
              </div>
            </section>

            <section className="output-zone id-zone" aria-labelledby="ids-title">
              <div className="zone-heading">
                <span>שלב 3</span>
                <h3 id="ids-title">Token IDs</h3>
              </div>
              <div className="id-list">
                {tokenData.map((item) => (
                  <div className="id-row" key={`${item.token}-id-${item.index}`}>
                    <span>{item.token}</span>
                    <code>{item.id}</code>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="lab-explanation">
            <strong>למה מספרים?</strong>
            <p>
              מחשבים אינם מבינים מילים כמו בני אדם. לכן כל טוקן מיוצג במודל על
              ידי מספר או ייצוג מתמטי. הייצוג המספרי מאפשר למודל לבצע חישובים,
              לזהות קשרים בין מילים, ולחזות מה יכול להגיע בהמשך.
            </p>
          </div>
        </div>
      </section>

      <section className="prediction-section" aria-labelledby="prediction-title">
        <div className="section-intro compact">
          <p className="eyebrow">שלב 4</p>
          <h2 id="prediction-title">ניבוי הטוקן הבא</h2>
          <p className="sentence-preview">אני לומד בינה מלאכותית כדי...</p>
        </div>

        <div className="prediction-grid">
          {predictions.map((prediction) => (
            <article className="prediction-option" key={prediction.token}>
              <div className="prediction-label">
                <strong>{prediction.token}</strong>
                <span>{prediction.probability}%</span>
              </div>
              <div
                className="probability-track"
                aria-label={`${prediction.token}: ${prediction.probability} אחוז`}
              >
                <span style={{ width: `${prediction.probability}%` }}></span>
              </div>
            </article>
          ))}
        </div>

        <p className="prediction-copy">
          מודל שפה גדול מאומן על כמויות עצומות של טקסטים. המטרה המרכזית שלו היא
          לחזות מה הטוקן הבא שהכי סביר שיופיע ברצף. המודל לא באמת "חושב" כמו בן
          אדם, אלא מחשב הסתברויות על בסיס דפוסים שלמד מהמידע שעליו אומן.
        </p>
      </section>

      <section className="business-panel" aria-labelledby="business-title">
        <div className="section-intro">
          <p className="eyebrow">תובנה עסקית</p>
          <h2 id="business-title">למה זה חשוב בעולם העסקי?</h2>
          <p>
            חברה שמפעילה צ'אטבוט שירות לקוחות ושולחת אלפי פניות למודל AI צריכה
            להבין שככל שהטקסטים ארוכים יותר, כך יש יותר טוקנים, ולכן השימוש
            עשוי להיות יקר ואיטי יותר.
          </p>
        </div>
        <div className="business-grid">
          {businessItems.map((item, index) => (
            <article className="business-item" key={item.title}>
              <span>0{index + 1}</span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="quiz-section" aria-labelledby="quiz-title">
        <div className="section-intro compact">
          <p className="eyebrow">Learning checkpoint</p>
          <h2 id="quiz-title">חידון קצר</h2>
          <p>בחרו תשובה אחת לכל שאלה ואז שלחו כדי לראות את הציון.</p>
        </div>

        <div className="quiz-list">
          {quizQuestions.map((item, questionIndex) => (
            <article className="quiz-question" key={item.question}>
              <div className="quiz-question-header">
                <span>שאלה {questionIndex + 1}</span>
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
                  const showCorrect = quizSubmitted && isCorrect
                  const showWrong = quizSubmitted && isSelected && !isCorrect
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
                        <span className="answer-mark" aria-hidden="true">✓</span>
                      )}
                      {showWrong && (
                        <span className="answer-mark" aria-hidden="true">✗</span>
                      )}
                    </button>
                  )
                })}
              </div>
            </article>
          ))}
        </div>

        <div className="quiz-footer">
          <button type="button" onClick={submitQuiz} disabled={!canSubmitQuiz}>
            בדקו ציון
          </button>
          <div className={quizSubmitted ? 'score-card visible' : 'score-card'} aria-live="polite">
            {quizSubmitted
              ? `הציון שלך: ${score}/${quizQuestions.length}`
              : `${answeredCount}/${quizQuestions.length} שאלות נענו`}
          </div>
        </div>
      </section>

      <section className="about-panel" aria-labelledby="about-title">
        <div>
          <p className="eyebrow">על הפרויקט</p>
          <h2 id="about-title">המחשה אישית לקורס יישומי AI בעולם העסקי</h2>
        </div>
        <div className="about-grid">
          <p>
            זהו פרויקט אישי במסגרת הקורס. המושג שנבחר הוא טוקנים במודלי שפה
            גדולים, מתוך שיעור 9 בנושא Language Models ו-Next Token Prediction.
          </p>
          <p>
            מטרת האתר היא לעזור לסטודנטים עתידיים להבין את המושג דרך הדגמה
            אינטראקטיבית. האתר נבנה בעזרת React ו-Vite, בסיוע כלי AI, והוא
            סימולציה פדגוגית בלבד ולא טוקנייזר אמיתי.
          </p>
        </div>
      </section>

      <section className="summary-panel" aria-labelledby="summary-title">
        <div>
          <p className="eyebrow">סיכום</p>
          <h2 id="summary-title">מה למדתם?</h2>
        </div>
        <div className="summary-grid">
          <p>
            טוקנים הם אחת מאבני הבסיס של מודלי שפה גדולים. הם מאפשרים למודל
            לפרק טקסט, לייצג אותו בצורה מספרית, ולחזות את ההמשך האפשרי של
            המשפט.
          </p>
          <p>
            ההמחשה באתר היא סימולציה פדגוגית ואינה טוקנייזר אמיתי של OpenAI.
            המטרה היא להבין את העיקרון בדרך חזותית ופשוטה להסבר.
          </p>
        </div>
      </section>
      </main>

      <footer className="site-footer">
        <p>פרויקט אישי במסגרת הקורס "יישומי AI בעולם העסקי".</p>
        <p>המושג שנבחר: טוקנים במודלי שפה גדולים — שיעור 9.</p>
      </footer>
    </div>
  )
}

export default App
