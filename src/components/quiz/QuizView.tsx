import { useState } from 'react';
import { Award, CheckCircle2, XCircle, RotateCcw, HelpCircle } from 'lucide-react';

interface Question {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export const QuizView = () => {
  const [answers, setAnswers] = useState<{ [key: number]: number }>({});
  const [showResults, setShowResults] = useState<boolean>(false);

  const questions: Question[] = [
    {
      id: 1,
      question: "For a given diffraction grating, how does the angle of diffraction θ change if you switch from a green laser (532 nm) to a red laser (633 nm)?",
      options: [
        "The angle θ decreases, causing the spots to contract closer to the center.",
        "The angle θ remains exactly the same.",
        "The angle θ increases, causing the spots to disperse wider.",
        "Diffraction ceases to occur because red light has higher frequency."
      ],
      correctIndex: 2,
      explanation: "According to the grating formula d * sin(θ) = n * λ, the diffraction angle θ is directly proportional to the wavelength λ. Since red light (633 nm) has a longer wavelength than green light (532 nm), switching to red will increase the angle θ, dispersing the spots further apart."
    },
    {
      id: 2,
      question: "If a diffraction grating is ruled with 15,000 lines per inch, what is its grating spacing element (d = a+b) in meters?",
      options: [
        "1.69 x 10⁻⁶ m (1.69 μm)",
        "3.38 x 10⁻⁶ m (3.38 μm)",
        "6.67 x 10⁻⁷ m (0.67 μm)",
        "1.50 x 10⁻⁵ m (15 μm)"
      ],
      correctIndex: 0,
      explanation: "Since 1 inch = 0.0254 meters, the grating element 'd' is calculated as d = 0.0254 / 15,000 lines/inch ≈ 1.693 x 10⁻⁶ meters (or 1.69 μm)."
    },
    {
      id: 3,
      question: "What physical event causes the 'missing order' effect to occur in a diffraction grating pattern?",
      options: [
        "Constructive interference peaks clash and cancel each other out.",
        "A principal maximum of the interference pattern coincides with a minimum of the single-slit diffraction envelope.",
        "The laser beam undergoes total internal reflection inside the glass grating.",
        "The screen is positioned too close to the grating."
      ],
      correctIndex: 1,
      explanation: "The overall intensity pattern is a combination of single-slit diffraction and multi-slit interference. If a principal interference peak is formed at an angle where the single-slit diffraction envelope evaluates to zero (a diffraction minimum), that order will completely vanish from the screen."
    },
    {
      id: 4,
      question: "In a gas discharge tube, what is the role of Helium in a Helium-Neon (He-Ne) gas laser?",
      options: [
        "Helium atoms directly undergo the laser transitions to emit the 632.8 nm red photons.",
        "Helium gas acts as a cooling fluid to prevent neon gas from overheating.",
        "Helium atoms are excited by electron collisions, then transfer energy to excite Neon atoms to their metastable state via resonance.",
        "Helium acts as a mirror coating on the cavity tube."
      ],
      correctIndex: 2,
      explanation: "Helium atoms serve to populate the excited energy levels of Neon atoms. In the gas mixture, electrons collide and excite Helium atoms. These excited Helium atoms transfer their kinetic energy via resonant collisions to Neon atoms, achieving the population inversion necessary for laser action in Neon."
    },
    {
      id: 5,
      question: "What happens to the principal maxima of a grating pattern when the number of illuminated slits (N) is increased from 2 to 100?",
      options: [
        "The spots become much broader and dimmer.",
        "The principal maxima become extremely sharp, intense, narrow dots.",
        "The pattern completely disappears into a blank screen.",
        "Additional fractional orders (n = 1.5, 2.5...) begin to form."
      ],
      correctIndex: 1,
      explanation: "As N increases, the light waves interfere with greater sensitivity. Waves cancel each other out completely at even the smallest angular deviation from principal maxima. This focuses all light energy into extremely sharp, intense, highly localized dots, improving the resolution of the grating."
    }
  ];

  const handleSelect = (qId: number, oIdx: number) => {
    if (showResults) return;
    setAnswers(prev => ({ ...prev, [qId]: oIdx }));
  };

  const handleSubmit = () => {
    setShowResults(true);
  };

  const handleReset = () => {
    setAnswers({});
    setShowResults(false);
  };

  const getScore = () => {
    return questions.filter(q => answers[q.id] === q.correctIndex).length;
  };

  return (
    <div style={{
      flex: 1,
      overflowY: 'auto',
      padding: '30px',
      display: 'flex',
      flexDirection: 'column',
      gap: '30px',
      maxWidth: '850px',
      margin: '0 auto',
      width: '100%'
    }}>
      {/* Quiz Title */}
      <div className="glass-card" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-primary)', margin: 0 }}>
            <Award size={24} style={{ color: 'var(--accent-blue)' }} /> Lab Assessment: Grating Physics
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '6px' }}>
            Test your understanding of interference, diffraction envelopes, Helium-Neon lasers, and lab math!
          </p>
        </div>

        {showResults && (
          <div style={{
            background: 'rgba(59, 130, 246, 0.15)',
            border: '1px solid var(--accent-blue)',
            borderRadius: '12px',
            padding: '10px 20px',
            textAlign: 'center'
          }}>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block' }}>SCORE</span>
            <span style={{ fontSize: '24px', fontWeight: 800, color: 'white' }}>{getScore()} / {questions.length}</span>
          </div>
        )}
      </div>

      {/* Questions Loop */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {questions.map((q, idx) => {
          const selectedIdx = answers[q.id];
          const isCorrect = selectedIdx === q.correctIndex;
          
          return (
            <div key={q.id} className="glass-card" style={{
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              borderColor: showResults ? (isCorrect ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)') : 'var(--border-light)'
            }}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <span style={{
                  background: 'rgba(255,255,255,0.05)',
                  color: 'var(--text-secondary)',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontFamily: 'var(--font-mono)'
                }}>
                  Q{idx + 1}
                </span>
                <h4 style={{ fontSize: '15px', color: 'var(--text-primary)', margin: 0, fontWeight: 500 }}>
                  {q.question}
                </h4>
              </div>

              {/* Options */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingLeft: '32px' }}>
                {q.options.map((opt, oIdx) => {
                  const isSelected = selectedIdx === oIdx;
                  let optBg = 'rgba(255,255,255,0.02)';
                  let optBorder = 'var(--border-light)';
                  let optColor = 'var(--text-secondary)';

                  if (isSelected) {
                    optBg = 'rgba(59, 130, 246, 0.08)';
                    optBorder = 'var(--accent-blue)';
                    optColor = 'white';
                  }

                  if (showResults) {
                    if (oIdx === q.correctIndex) {
                      optBg = 'rgba(16, 185, 129, 0.12)';
                      optBorder = 'var(--success)';
                      optColor = 'white';
                    } else if (isSelected) {
                      optBg = 'rgba(239, 68, 68, 0.12)';
                      optBorder = 'var(--danger)';
                      optColor = 'white';
                    }
                  }

                  return (
                    <button
                      key={oIdx}
                      disabled={showResults}
                      onClick={() => handleSelect(q.id, oIdx)}
                      style={{
                        padding: '10px 14px',
                        fontSize: '13px',
                        textAlign: 'left',
                        borderRadius: '6px',
                        background: optBg,
                        border: '1px solid',
                        borderColor: optBorder,
                        color: optColor,
                        cursor: showResults ? 'default' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        transition: 'all 0.2s'
                      }}
                    >
                      <div style={{
                        width: '14px',
                        height: '14px',
                        borderRadius: '50%',
                        border: '1.5px solid',
                        borderColor: isSelected ? 'transparent' : 'var(--text-secondary)',
                        background: isSelected ? 'var(--accent-blue)' : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }} />
                      {opt}
                    </button>
                  );
                })}
              </div>

              {/* Reveal explanation if submitted */}
              {showResults && (
                <div style={{
                  padding: '12px 16px',
                  borderRadius: '6px',
                  background: 'rgba(0,0,0,0.2)',
                  border: '1px solid var(--border-light)',
                  fontSize: '12.5px',
                  color: 'var(--text-secondary)',
                  display: 'flex',
                  gap: '8px',
                  alignItems: 'flex-start',
                  marginLeft: '32px'
                }}>
                  {isCorrect ? (
                    <CheckCircle2 size={16} style={{ color: 'var(--success)', flexShrink: 0, marginTop: '2px' }} />
                  ) : (
                    <XCircle size={16} style={{ color: 'var(--danger)', flexShrink: 0, marginTop: '2px' }} />
                  )}
                  <div>
                    <strong style={{ color: isCorrect ? 'var(--success)' : 'var(--danger)', display: 'block', marginBottom: '4px' }}>
                      {isCorrect ? 'Correct!' : 'Incorrect'}
                    </strong>
                    {q.explanation}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Buttons */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', paddingBottom: '40px' }}>
        {!showResults ? (
          <button
            onClick={handleSubmit}
            disabled={Object.keys(answers).length < questions.length}
            className="glow-btn"
            style={{
              opacity: Object.keys(answers).length < questions.length ? 0.5 : 1,
              cursor: Object.keys(answers).length < questions.length ? 'default' : 'pointer'
            }}
          >
            Submit Assessment
          </button>
        ) : (
          <button
            onClick={handleReset}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              border: '1px solid var(--border-light)',
              background: 'rgba(255,255,255,0.05)',
              color: 'white',
              fontWeight: 600,
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s'
            }}
          >
            <RotateCcw size={16} /> Reset Assessment
          </button>
        )}
      </div>
    </div>
  );
};
