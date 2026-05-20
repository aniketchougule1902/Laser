import { useState } from 'react';
import { BookOpen, Variable, Cpu } from 'lucide-react';
import { calculateGratingSpacing } from '../../physics/diffraction';

export const TheoryView = () => {
  const [calcWavelength, setCalcWavelength] = useState<number>(632.8);
  const [calcLPI, setCalcLPI] = useState<number>(15000);
  const [calcOrder, setCalcOrder] = useState<number>(1);
  const [calcScreenDist, setCalcScreenDist] = useState<number>(1.0);

  const d = calculateGratingSpacing(calcLPI);
  const lambda = calcWavelength * 1e-9;
  const sinTheta = (calcOrder * lambda) / d;
  const angleRad = Math.abs(sinTheta) <= 1 ? Math.asin(sinTheta) : NaN;
  const angleDeg = !isNaN(angleRad) ? (angleRad * 180) / Math.PI : NaN;
  const x = !isNaN(angleRad) ? calcScreenDist * Math.tan(angleRad) : NaN;

  return (
    <div style={{
      flex: 1,
      overflowY: 'auto',
      padding: '30px',
      display: 'flex',
      flexDirection: 'column',
      gap: '30px',
      maxWidth: '1200px',
      margin: '0 auto',
      width: '100%'
    }}>
      {/* Introduction Banner */}
      <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-primary)', margin: 0 }}>
          <BookOpen size={24} style={{ color: 'var(--accent-purple)' }} /> Physics of Laser Diffraction Gratings
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '15px', lineHeight: '1.6' }}>
          Diffraction is the bending of wave wavefronts around obstacles or through narrow apertures. A transmission diffraction grating is an optical component consisting of thousands of closely spaced parallel slits. When a coherent laser beam strikes the grating, each slit acts as a secondary source of spherical wavelets (according to Huygens' Principle), which interfere constructively and destructively to form a pattern of bright dots on a distant screen.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '30px' }}>
        {/* Mathematical Foundations */}
        <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
            <Variable size={18} style={{ color: 'var(--accent-blue)' }} /> Core Mathematical Formulas
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '14.5px', lineHeight: '1.6' }}>
            <div style={{ background: 'rgba(0,0,0,0.15)', borderLeft: '3px solid var(--accent-purple)', padding: '12px', borderRadius: '4px' }}>
              <strong style={{ color: 'var(--text-primary)' }}>1. Grating Equation (Principal Maxima):</strong>
              <div style={{ fontSize: '20px', fontFamily: 'var(--font-mono)', margin: '10px 0', textAlign: 'center', color: '#ffffff' }}>
                (a + b) sin(θ) = n λ
              </div>
              Where:
              <ul style={{ paddingLeft: '20px', fontSize: '13px', marginTop: '6px', color: 'var(--text-secondary)' }}>
                <li><strong>a</strong> = Width of each transparent slit</li>
                <li><strong>b</strong> = Width of each opaque ruling spacing</li>
                <li><strong>d = (a + b)</strong> = Grating spacing element (distance between slits)</li>
                <li><strong>θ</strong> = Angle of diffraction relative to the normal incidence</li>
                <li><strong>n</strong> = Order of principal maximum (n = 0, ±1, ±2...)</li>
                <li><strong>λ</strong> = Wavelength of the light source</li>
              </ul>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.15)', borderLeft: '3px solid var(--accent-blue)', padding: '12px', borderRadius: '4px' }}>
              <strong style={{ color: 'var(--text-primary)' }}>2. Grating Density N (lines per cm):</strong>
              <div style={{ fontSize: '18px', fontFamily: 'var(--font-mono)', margin: '10px 0', textAlign: 'center', color: '#ffffff' }}>
                N = 1 / d = 1 / (a + b)
              </div>
              Grating element d is calculated by taking the inverse of the line density. For example, a grating with 15,000 lines/inch has a line spacing d = 2.54 cm / 15000 = 1.693 x 10^-4 cm.
            </div>

            <div style={{ background: 'rgba(0,0,0,0.15)', borderLeft: '3px solid var(--success)', padding: '12px', borderRadius: '4px' }}>
              <strong style={{ color: 'var(--text-primary)' }}>3. Spot Position on Screen x:</strong>
              <div style={{ fontSize: '18px', fontFamily: 'var(--font-mono)', margin: '10px 0', textAlign: 'center', color: '#ffffff' }}>
                tan(θ) = x / D &rArr; x = D tan(θ)
              </div>
              Where <strong>D</strong> is the perpendicular distance between the grating and the screen, and <strong>x</strong> is the distance of the n-th diffraction spot from the center (n=0).
            </div>
          </div>
        </div>

        {/* Step-by-Step Interactive Calculator */}
        <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
            <Cpu size={18} style={{ color: 'var(--success)' }} /> Step-by-Step Formula Evaluator
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '4px' }}>Wavelength (λ):</label>
                <input
                  type="number"
                  value={calcWavelength}
                  onChange={(e) => setCalcWavelength(parseFloat(e.target.value) || 0)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '6px',
                    background: 'rgba(0,0,0,0.2)',
                    border: '1px solid var(--border-light)',
                    color: 'white'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '4px' }}>Line Density (LPI):</label>
                <input
                  type="number"
                  value={calcLPI}
                  onChange={(e) => setCalcLPI(parseInt(e.target.value) || 0)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '6px',
                    background: 'rgba(0,0,0,0.2)',
                    border: '1px solid var(--border-light)',
                    color: 'white'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '4px' }}>Diffraction Order (n):</label>
                <input
                  type="number"
                  value={calcOrder}
                  onChange={(e) => setCalcOrder(parseInt(e.target.value) || 0)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '6px',
                    background: 'rgba(0,0,0,0.2)',
                    border: '1px solid var(--border-light)',
                    color: 'white'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '4px' }}>Screen Distance D (m):</label>
                <input
                  type="number"
                  value={calcScreenDist}
                  onChange={(e) => setCalcScreenDist(parseFloat(e.target.value) || 0)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '6px',
                    background: 'rgba(0,0,0,0.2)',
                    border: '1px solid var(--border-light)',
                    color: 'white'
                  }}
                />
              </div>
            </div>

            {/* Calculations Feed */}
            <div style={{
              background: 'rgba(0,0,0,0.3)',
              borderRadius: '8px',
              border: '1px solid var(--border-light)',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              fontFamily: 'var(--font-mono)'
            }}>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>// Step 1: Calculate grating element 'd'</span>
                <div style={{ color: 'var(--text-primary)', marginTop: '4px' }}>
                  d = 0.0254 / {calcLPI} = <strong style={{ color: 'var(--accent-purple)' }}>{(d * 1e6).toFixed(4)} &mu;m</strong>
                </div>
              </div>

              <div>
                <span style={{ color: 'var(--text-muted)' }}>// Step 2: Evaluate sin(&theta;) = n &lambda; / d</span>
                <div style={{ color: 'var(--text-primary)', marginTop: '4px' }}>
                  sin(&theta;) = ({calcOrder} &times; {calcWavelength} &times; 10⁻⁹) / {(d).toExponential(5)} = <strong style={{ color: 'var(--accent-blue)' }}>{isNaN(sinTheta) || Math.abs(sinTheta) > 1 ? 'INVALID (> 1.0)' : sinTheta.toFixed(5)}</strong>
                </div>
              </div>

              <div>
                <span style={{ color: 'var(--text-muted)' }}>// Step 3: Solve for angle &theta;</span>
                <div style={{ color: 'var(--text-primary)', marginTop: '4px' }}>
                  &theta; = arcsin({isNaN(sinTheta) || Math.abs(sinTheta) > 1 ? 'ERR' : sinTheta.toFixed(5)}) = <strong style={{ color: 'var(--success)' }}>{isNaN(angleDeg) ? 'No diffraction order exists' : `${angleDeg.toFixed(2)}°`}</strong>
                </div>
              </div>

              <div>
                <span style={{ color: 'var(--text-muted)' }}>// Step 4: Find spot position on screen x = D tan(&theta;)</span>
                <div style={{ color: 'var(--text-primary)', marginTop: '4px' }}>
                  x = {calcScreenDist} &times; tan({isNaN(angleDeg) ? 'ERR' : `${angleDeg.toFixed(2)}°`}) = <strong style={{ color: 'var(--laser-color)' }}>{isNaN(x) ? 'N/A' : `${(x * 100).toFixed(3)} cm`}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Helium Neon Laser Section */}
      <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <h3 style={{ fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
          <Variable size={18} style={{ color: 'var(--laser-color)' }} /> Helium-Neon (He-Ne) Gas Laser physics
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.6' }}>
          In engineering physics laboratories, a Helium-Neon (He-Ne) laser is a highly popular light source. A He-Ne laser is a gaseous laser whose active medium is a mixture of approximately 10 parts helium gas to 1 part neon gas inside a high-voltage capillary tube. The primary emission wavelength is <strong>632.8 nm (bright red)</strong>, which is produced when neon atoms undergo a radiative transition from the 3s to 2p excited energy states. Helium atoms serve the crucial role of collisionally transferring energy to excite neon atoms to their metastable state, facilitating population inversion. It produces a highly coherent, highly collimated beam ideal for optical interference and diffraction studies.
        </p>
      </div>
    </div>
  );
};
