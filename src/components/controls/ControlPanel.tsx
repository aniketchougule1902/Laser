import type React from 'react';
import { Power, Zap, Sliders, Eye, Sun } from 'lucide-react';
import type { SimulationParams } from '../../physics/diffraction';
import { wavelengthToRGB } from '../../physics/diffraction';

interface ControlPanelProps {
  params: SimulationParams;
  setParams: React.Dispatch<React.SetStateAction<SimulationParams>>;
  laserOn: boolean;
  setLaserOn: (on: boolean) => void;
  playSound: (type: 'laser' | 'click' | 'success') => void;
}

export const ControlPanel = ({
  params,
  setParams,
  laserOn,
  setLaserOn,
  playSound
}: ControlPanelProps) => {
  const updateParam = <K extends keyof SimulationParams>(key: K, value: SimulationParams[K]) => {
    setParams(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handlePowerToggle = () => {
    playSound('laser');
    setLaserOn(!laserOn);
  };

  const setWavelengthPreset = (wave: number) => {
    playSound('click');
    updateParam('wavelength', wave);
  };

  const setGratingPreset = (lpi: number) => {
    playSound('click');
    updateParam('linesPerInch', lpi);
  };

  return (
    <aside className="glass" style={{
      width: '360px',
      height: '100%',
      borderLeft: '1px solid var(--border-light)',
      display: 'flex',
      flexDirection: 'column',
      overflowY: 'auto',
      padding: '20px',
      gap: '20px',
      zIndex: 10
    }}>
      {/* Laser Power Section */}
      <div className="glass-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
          <Power size={16} /> Laser Source Power
        </h3>
        
        <button
          onClick={handlePowerToggle}
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: '8px',
            border: '1px solid',
            borderColor: laserOn ? 'var(--laser-color)' : 'rgba(255, 255, 255, 0.1)',
            background: laserOn ? 'rgba(var(--laser-color-rgb), 0.12)' : 'rgba(255, 255, 255, 0.02)',
            color: laserOn ? 'var(--laser-color)' : 'var(--text-secondary)',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            boxShadow: laserOn ? '0 0 15px var(--laser-glow)' : 'none',
            textShadow: laserOn ? '0 0 8px var(--laser-glow)' : 'none',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            letterSpacing: '1px'
          }}
        >
          <Power size={18} className={laserOn ? 'pulse' : ''} />
          {laserOn ? 'LASER EMISSION ACTIVE' : 'LASER STANDBY'}
        </button>
      </div>

      {/* Laser Settings */}
      <div className="glass-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
          <Zap size={16} /> Laser Configuration
        </h3>

        {/* Wavelength Slider */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Wavelength (λ)</span>
            <span style={{ fontWeight: 600, color: 'var(--laser-color)' }} className="laser-text-glow">
              {params.wavelength.toFixed(1)} nm
            </span>
          </div>
          <input
            type="range"
            min="380"
            max="750"
            step="0.5"
            value={params.wavelength}
            onChange={(e) => updateParam('wavelength', parseFloat(e.target.value))}
            style={{ margin: '8px 0' }}
          />
          {/* Quick presets */}
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '4px' }}>
            {[405, 450, 532, 589, 632.8].map((wave) => {
              const active = Math.abs(params.wavelength - wave) < 1.0;
              const colorHex = wavelengthToRGB(wave).hex;
              return (
                <button
                  key={wave}
                  onClick={() => setWavelengthPreset(wave)}
                  title={`${wave} nm`}
                  style={{
                    flex: 1,
                    padding: '4px 0',
                    fontSize: '10px',
                    borderRadius: '4px',
                    border: '1px solid',
                    borderColor: active ? colorHex : 'transparent',
                    background: active ? `${colorHex}22` : 'rgba(255, 255, 255, 0.03)',
                    color: active ? '#ffffff' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    fontWeight: active ? 'bold' : 'normal',
                    transition: 'all 0.2s'
                  }}
                >
                  {wave === 632.8 ? 'HeNe' : `${Math.round(wave)}n`}
                </button>
              );
            })}
          </div>
        </div>

        {/* Laser Intensity */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Laser Intensity</span>
            <span style={{ fontWeight: 600 }}>{Math.round(params.laserIntensity * 100)}%</span>
          </div>
          <input
            type="range"
            min="0.1"
            max="2.0"
            step="0.05"
            value={params.laserIntensity}
            onChange={(e) => updateParam('laserIntensity', parseFloat(e.target.value))}
          />
        </div>
      </div>

      {/* Grating Settings */}
      <div className="glass-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
          <Sliders size={16} /> Diffraction Grating
        </h3>

        {/* Lines/Inch Selector */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Line Density</span>
            <span style={{ fontWeight: 600 }}>{params.linesPerInch.toLocaleString()} lines/inch</span>
          </div>
          <input
            type="range"
            min="2000"
            max="30000"
            step="100"
            value={params.linesPerInch}
            onChange={(e) => updateParam('linesPerInch', parseInt(e.target.value))}
            style={{ margin: '8px 0' }}
          />
          {/* Quick presets */}
          <div style={{ display: 'flex', gap: '6px' }}>
            {[7500, 15000, 30000].map((lpi) => {
              const active = params.linesPerInch === lpi;
              return (
                <button
                  key={lpi}
                  onClick={() => setGratingPreset(lpi)}
                  style={{
                    flex: 1,
                    padding: '5px',
                    fontSize: '11px',
                    borderRadius: '4px',
                    border: '1px solid',
                    borderColor: active ? 'var(--accent-purple)' : 'transparent',
                    background: active ? 'rgba(139, 92, 246, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                    color: active ? '#ffffff' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    fontWeight: active ? 'bold' : 'normal',
                    transition: 'all 0.2s'
                  }}
                >
                  {lpi === 15000 ? '15K LPI (Std)' : `${lpi / 1000}K LPI`}
                </button>
              );
            })}
          </div>
        </div>

        {/* Slit Width a/d Ratio */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Slit Width Ratio (a/d)</span>
            <span style={{ fontWeight: 600 }}>{(params.slitWidthRatio * 100).toFixed(0)}%</span>
          </div>
          <input
            type="range"
            min="0.05"
            max="0.8"
            step="0.01"
            value={params.slitWidthRatio}
            onChange={(e) => updateParam('slitWidthRatio', parseFloat(e.target.value))}
          />
          <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
            Governs single-slit envelop. At 50%, alternate even orders disappear (missing order effect).
          </span>
        </div>
      </div>

      {/* Screen & Room Settings */}
      <div className="glass-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
          <Eye size={16} /> Apparatus Setup
        </h3>

        {/* Screen Distance */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Screen Distance (D)</span>
            <span style={{ fontWeight: 600 }}>{params.screenDistance.toFixed(2)} m</span>
          </div>
          <input
            type="range"
            min="0.2"
            max="2.5"
            step="0.02"
            value={params.screenDistance}
            onChange={(e) => updateParam('screenDistance', parseFloat(e.target.value))}
          />
        </div>

        {/* Number of Slits (Illuminated Slits N) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Illuminated Slits (N)</span>
            <span style={{ fontWeight: 600 }}>{params.numSlits}</span>
          </div>
          <input
            type="range"
            min="5"
            max="250"
            step="5"
            value={params.numSlits}
            onChange={(e) => updateParam('numSlits', parseInt(e.target.value))}
          />
          <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
            Increasing N sharpens interference maxima, making them distinct dots!
          </span>
        </div>

        {/* Room Brightness */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Room Ambient Light</span>
            <span style={{ fontWeight: 600 }}>{Math.round(params.roomBrightness * 100)}%</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Sun size={14} style={{ color: 'var(--text-secondary)' }} />
            <input
              type="range"
              min="0.02"
              max="0.8"
              step="0.02"
              value={params.roomBrightness}
              onChange={(e) => updateParam('roomBrightness', parseFloat(e.target.value))}
            />
          </div>
        </div>
      </div>
    </aside>
  );
};
