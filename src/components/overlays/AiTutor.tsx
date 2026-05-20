import { useState } from 'react';
import { Sparkles, MessageSquare, ChevronRight } from 'lucide-react';
import type { SimulationParams } from '../../physics/diffraction';
import { calculateGratingSpacing } from '../../physics/diffraction';

interface AiTutorProps {
  params: SimulationParams;
  playSound: (type: 'laser' | 'click' | 'success') => void;
}

export const AiTutor = ({ params, playSound }: AiTutorProps) => {
  const [response, setResponse] = useState<string>(
    "Hello! I am your AI Physics Lab Assistant. Turn on the laser source and select any of the topics below to explore the wave physics of diffraction gratings in real-time."
  );
  const [activeTopic, setActiveTopic] = useState<string | null>(null);

  const tutorTopics = [
    {
      id: 'wavelength',
      title: 'Wavelength & Pattern Width',
      question: 'How does wavelength (λ) affect the spot spacing?',
      answer: () => {
        const lambda = params.wavelength;
        const d = calculateGratingSpacing(params.linesPerInch);
        const theta1 = Math.asin(lambda * 1e-9 / d) * 180 / Math.PI;
        
        return `Under the diffraction equation, (a+b)sin(θ) = nλ, the angle of diffraction is directly proportional to the wavelength.

Right now, at λ = ${lambda.toFixed(1)} nm, the first-order (n=1) spot refracts at θ = ${theta1.toFixed(2)}°.

If you increase the wavelength (shift towards Red), sin(θ) must increase, pushing the spots further apart on the screen. If you decrease the wavelength (shift towards Violet), the diffraction spots will contract closer to the center!`;
      }
    },
    {
      id: 'grating',
      title: 'Grating Line Density',
      question: 'Why does higher lines/inch expand the pattern?',
      answer: () => {
        const d = calculateGratingSpacing(params.linesPerInch);
        const lpi = params.linesPerInch;
        return `The grating element 'd' is the spacing between adjacent slits. When you select a higher lines/inch like ${lpi.toLocaleString()}, the spacing 'd' decreases down to ${(d * 1e6).toFixed(3)} μm.

Since sin(θ) = nλ/d, dividing by a smaller 'd' results in a much larger angle θ! This causes the light wavefronts to bend at wider angles, dispersing the diffraction spots further apart on the screen.`;
      }
    },
    {
      id: 'slits',
      title: 'Peak Sharpness (N)',
      question: 'Why do peaks get sharper with more slits?',
      answer: () => {
        return `When light passes through multiple slits (N), they act as coherent sources producing wavelets.

With only 2 slits (double slit), the interference pattern is a broad sinusoidal wave. As you increase N (currently at ${params.numSlits} slits), constructive interference only occurs at precise, narrow angles where all wavefronts are perfectly in-phase. At even a tiny deviation from this angle, the massive number of waves cancel each other out (destructive interference), making the background dark and leaving extremely sharp, laser-like dots!`;
      }
    },
    {
      id: 'missing',
      title: 'Missing Order Effect',
      question: 'What is the "missing order" effect?',
      answer: () => {
        const ratio = params.slitWidthRatio;
        return `The missing order effect occurs when a principal interference maximum coincides with a diffraction minimum!

Specifically, when the grating element 'd' is an exact integer multiple of the slit width 'a' (i.e. d = m * a), the order n = m * (order of interference) disappears because the single-slit envelope value becomes exactly zero at that angle.

Right now, your slit width ratio (a/d) is ${(ratio * 100).toFixed(0)}%. Try setting it to exactly 50% (0.50). You will observe that all EVEN orders (n = ±2, ±4...) completely vanish from the screen!`;
      }
    }
  ];

  const handleSelectTopic = (id: string, getAnswer: () => string) => {
    playSound('click');
    setActiveTopic(id);
    setResponse(getAnswer());
  };

  return (
    <div className="glass-card" style={{
      display: 'flex',
      flexDirection: 'column',
      padding: '16px',
      gap: '12px',
      height: '340px'
    }}>
      <h3 style={{ fontSize: '15px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
        <Sparkles size={16} className="laser-text-glow" /> AI Physics Tutor Panel
      </h3>

      {/* Tutor Response Box */}
      <div style={{
        flex: 1,
        background: 'rgba(0, 0, 0, 0.25)',
        border: '1px solid var(--border-light)',
        borderRadius: '8px',
        padding: '12px',
        fontSize: '12.5px',
        lineHeight: '1.5',
        overflowY: 'auto',
        color: 'var(--text-primary)',
        fontFamily: 'var(--font-sans)',
        position: 'relative'
      }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
          <MessageSquare size={14} style={{ color: 'var(--accent-purple)', flexShrink: 0, marginTop: '2px' }} />
          <div style={{ whiteSpace: 'pre-wrap' }}>{response}</div>
        </div>
      </div>

      {/* Topic List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.5px' }}>
          CLICK A TOPIC FOR REAL-TIME DEEP-DIVE:
        </span>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '6px'
        }}>
          {tutorTopics.map(topic => {
            const active = activeTopic === topic.id;
            return (
              <button
                key={topic.id}
                onClick={() => handleSelectTopic(topic.id, topic.answer)}
                style={{
                  padding: '8px 10px',
                  fontSize: '11.5px',
                  textAlign: 'left',
                  borderRadius: '6px',
                  background: active ? 'rgba(139, 92, 246, 0.12)' : 'rgba(255,255,255,0.03)',
                  border: '1px solid',
                  borderColor: active ? 'var(--accent-purple)' : 'var(--border-light)',
                  color: active ? '#ffffff' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'all 0.2s'
                }}
              >
                <span>{topic.title}</span>
                <ChevronRight size={12} style={{ opacity: 0.6 }} />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
