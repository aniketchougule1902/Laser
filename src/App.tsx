import { useState, useEffect } from 'react';
import { Navbar } from './components/ui/Navbar';
import { ControlPanel } from './components/controls/ControlPanel';
import { LabViewport } from './components/simulation/LabViewport';
import { IntensityGraph } from './components/charts/IntensityGraph';
import { ObservationTable } from './components/simulation/ObservationTable';
import type { Observation } from './components/simulation/ObservationTable';
import { AiTutor } from './components/overlays/AiTutor';
import { TheoryView } from './components/theory/TheoryView';
import { QuizView } from './components/quiz/QuizView';
import type { SimulationParams } from './physics/diffraction';
import { wavelengthToRGB } from './physics/diffraction';
import { audioSynth } from './utils/audio';

function App() {
  const [activeTab, setActiveTab] = useState<'simulation' | 'theory' | 'quiz'>('simulation');
  const [laserOn, setLaserOn] = useState<boolean>(true);
  
  // Base physical parameters
  const [params, setParams] = useState<SimulationParams>({
    wavelength: 632.8,      // nm (He-Ne Laser)
    linesPerInch: 15000,    // Lines/inch
    screenDistance: 1.0,    // meters (D)
    laserIntensity: 1.0,    // I0 scaling
    slitWidthRatio: 0.4,    // a/d ratio
    numSlits: 80,           // illuminated slits N
    roomBrightness: 0.15    // Ambient lighting scale
  });

  const [observations, setObservations] = useState<Observation[]>([]);

  // Dynamically set CSS variables matching laser color on the root node
  useEffect(() => {
    const colorInfo = wavelengthToRGB(params.wavelength);
    const root = document.documentElement;
    root.style.setProperty('--laser-color', colorInfo.hex);
    root.style.setProperty('--laser-color-rgb', `${colorInfo.r}, ${colorInfo.g}, ${colorInfo.b}`);
    root.style.setProperty('--laser-glow', `rgba(${colorInfo.r}, ${colorInfo.g}, ${colorInfo.b}, 0.45)`);
  }, [params.wavelength]);

  // Audio helper
  const playSound = (type: 'laser' | 'click' | 'success') => {
    if (type === 'laser') {
      // Toggle sound
      audioSynth.playLaser(!laserOn);
    } else if (type === 'click') {
      audioSynth.playClick();
    } else if (type === 'success') {
      audioSynth.playSuccess();
    }
  };

  return (
    <div id="app-shell">
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={(tab) => {
          playSound('click');
          setActiveTab(tab);
        }} 
        laserOn={laserOn} 
      />

      {activeTab === 'simulation' && (
        <main style={{
          flex: 1,
          display: 'flex',
          overflow: 'hidden',
          width: '100vw'
        }}>
          {/* Left panel: observations + tutor */}
          <section style={{
            flex: 1.1,
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            padding: '16px',
            overflowY: 'auto',
            height: '100%'
          }}>
            <ObservationTable 
              observations={observations}
              setObservations={setObservations}
              params={params}
              laserOn={laserOn}
              playSound={playSound}
            />
            
            <AiTutor 
              params={params}
              playSound={playSound}
            />
          </section>

          {/* Center panel: 3D apparatus viewport + real-time graph */}
          <section style={{
            flex: 1.6,
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            padding: '16px 0 16px 0',
            height: '100%'
          }}>
            <LabViewport params={params} laserOn={laserOn} />
            <IntensityGraph params={params} laserOn={laserOn} />
          </section>

          {/* Right panel: physical experiment control sidebar */}
          <ControlPanel 
            params={params}
            setParams={setParams}
            laserOn={laserOn}
            setLaserOn={setLaserOn}
            playSound={playSound}
          />
        </main>
      )}

      {activeTab === 'theory' && <TheoryView />}

      {activeTab === 'quiz' && <QuizView />}
    </div>
  );
}

export default App;
