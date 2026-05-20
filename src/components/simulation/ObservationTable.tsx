import type React from 'react';
import { ClipboardList, Trash2, Download, Plus } from 'lucide-react';
import type { SimulationParams } from '../../physics/diffraction';
import { calculateLinesPerCm, calculateGratingSpacing } from '../../physics/diffraction';

export interface Observation {
  id: string;
  wavelength: number;     // nm
  screenDistance: number; // m
  linesPerInch: number;
  order: number;
  positionX: number;     // m (measured)
}

interface ObservationTableProps {
  observations: Observation[];
  setObservations: React.Dispatch<React.SetStateAction<Observation[]>>;
  params: SimulationParams;
  laserOn: boolean;
  playSound: (type: 'laser' | 'click' | 'success') => void;
}

export const ObservationTable = ({
  observations,
  setObservations,
  params,
  laserOn,
  playSound
}: ObservationTableProps) => {
  
  const handleRecordObservation = (order: number) => {
    if (!laserOn) return;
    playSound('success');

    // Calculate theoretical position of this order
    const lambda = params.wavelength * 1e-9;
    const d = calculateGratingSpacing(params.linesPerInch);
    
    // Safety check if order is valid
    if (Math.abs(order * lambda / d) > 1.0) return;

    const angleRad = Math.asin(order * lambda / d);
    const positionX = params.screenDistance * Math.tan(angleRad);

    const newObs: Observation = {
      id: Math.random().toString(36).substr(2, 9),
      wavelength: params.wavelength,
      screenDistance: params.screenDistance,
      linesPerInch: params.linesPerInch,
      order,
      positionX
    };

    setObservations(prev => [newObs, ...prev]);
  };

  const handleDelete = (id: string) => {
    playSound('click');
    setObservations(prev => prev.filter(obs => obs.id !== id));
  };

  const handleClearAll = () => {
    playSound('click');
    setObservations([]);
  };

  const handleExportCSV = () => {
    playSound('success');
    if (observations.length === 0) return;

    const headers = ["Wavelength (nm)", "Screen Distance D (m)", "Lines/Inch", "Order (n)", "Spot Distance x (cm)", "Diffraction Angle (deg)", "Calc Spacing d (um)", "Calc Lines/cm", "Theo Lines/cm", "Error (%)"];
    
    const rows = observations.map(obs => {
      const { angleDeg, calcD, calcN, theoN, percentError } = getCalculatedValues(obs);
      return [
        obs.wavelength,
        obs.screenDistance,
        obs.linesPerInch,
        obs.order,
        (obs.positionX * 100).toFixed(3),
        angleDeg.toFixed(2),
        (calcD * 1e6).toFixed(4),
        calcN.toFixed(1),
        theoN.toFixed(1),
        percentError.toFixed(2)
      ];
    });

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `laser_diffraction_observations.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getCalculatedValues = (obs: Observation) => {
    const lambda = obs.wavelength * 1e-9;
    const D = obs.screenDistance;
    const x = obs.positionX;
    
    // Angle theta = atan(x/D)
    const angleRad = Math.atan(x / D);
    const angleDeg = (angleRad * 180) / Math.PI;
    
    // Calculated d = n * lambda / sin(theta)
    let calcD = 0;
    if (obs.order !== 0 && Math.sin(angleRad) !== 0) {
      calcD = (obs.order * lambda) / Math.sin(angleRad);
    } else {
      calcD = calculateGratingSpacing(obs.linesPerInch);
    }
    
    // Calculated N (lines per cm)
    const calcN = 1 / (calcD * 100); // 1 / cm
    
    // Theoretical N (lines per cm)
    const theoN = calculateLinesPerCm(obs.linesPerInch);
    
    // Percent error
    let percentError = 0;
    if (theoN > 0) {
      percentError = (Math.abs(calcN - theoN) / theoN) * 100;
    }

    return {
      angleDeg,
      calcD,
      calcN,
      theoN,
      percentError
    };
  };

  return (
    <div className="glass-card" style={{
      display: 'flex',
      flexDirection: 'column',
      padding: '16px',
      gap: '14px',
      height: '340px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
          <ClipboardList size={16} /> Virtual Lab Data Recorder
        </h3>
        
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={handleExportCSV}
            disabled={observations.length === 0}
            style={{
              padding: '6px 12px',
              fontSize: '12px',
              borderRadius: '6px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid var(--border-light)',
              color: observations.length === 0 ? 'var(--text-muted)' : 'var(--text-primary)',
              cursor: observations.length === 0 ? 'default' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              transition: 'all 0.2s'
            }}
          >
            <Download size={14} /> Export CSV
          </button>
          
          <button
            onClick={handleClearAll}
            disabled={observations.length === 0}
            style={{
              padding: '6px 12px',
              fontSize: '12px',
              borderRadius: '6px',
              background: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              color: observations.length === 0 ? 'var(--text-muted)' : 'var(--danger)',
              cursor: observations.length === 0 ? 'default' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              transition: 'all 0.2s'
            }}
          >
            <Trash2 size={14} /> Clear
          </button>
        </div>
      </div>

      {/* Record Controls */}
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Add Observation:</span>
        <div style={{ display: 'flex', gap: '6px', flex: 1 }}>
          {[1, 2, 3].map(n => (
            <button
              key={n}
              onClick={() => handleRecordObservation(n)}
              disabled={!laserOn}
              style={{
                flex: 1,
                padding: '6px',
                fontSize: '12px',
                borderRadius: '6px',
                background: laserOn ? 'rgba(139, 92, 246, 0.1)' : 'rgba(255,255,255,0.02)',
                border: '1px solid',
                borderColor: laserOn ? 'var(--accent-purple)' : 'transparent',
                color: laserOn ? 'var(--text-primary)' : 'var(--text-muted)',
                cursor: laserOn ? 'pointer' : 'default',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                transition: 'all 0.2s'
              }}
            >
              <Plus size={12} /> Order n = {n}
            </button>
          ))}
        </div>
      </div>

      {/* Table Content */}
      <div style={{ flex: 1, overflowY: 'auto', border: '1px solid var(--border-light)', borderRadius: '8px' }}>
        {observations.length === 0 ? (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            color: 'var(--text-muted)',
            fontSize: '13px',
            fontFamily: 'var(--font-mono)'
          }}>
            NO RECORDED OBSERVATIONS
          </div>
        ) : (
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '12px',
            textAlign: 'left'
          }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border-light)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '8px 12px' }}>λ (nm)</th>
                <th style={{ padding: '8px 12px' }}>D (m)</th>
                <th style={{ padding: '8px 12px' }}>n</th>
                <th style={{ padding: '8px 12px' }}>x (cm)</th>
                <th style={{ padding: '8px 12px' }}>θ (deg)</th>
                <th style={{ padding: '8px 12px' }}>Calc Lines/cm</th>
                <th style={{ padding: '8px 12px' }}>Theo Lines/cm</th>
                <th style={{ padding: '8px 12px' }}>Error</th>
                <th style={{ padding: '8px 12px', width: '40px' }}></th>
              </tr>
            </thead>
            <tbody>
              {observations.map(obs => {
                const { angleDeg, calcN, theoN, percentError } = getCalculatedValues(obs);
                return (
                  <tr key={obs.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                    <td style={{ padding: '8px 12px', fontWeight: 600 }}>{obs.wavelength}</td>
                    <td style={{ padding: '8px 12px' }}>{obs.screenDistance.toFixed(2)}</td>
                    <td style={{ padding: '8px 12px', color: 'var(--accent-blue)', fontWeight: 600 }}>{obs.order}</td>
                    <td style={{ padding: '8px 12px', fontWeight: 500 }}>{(obs.positionX * 100).toFixed(3)}</td>
                    <td style={{ padding: '8px 12px' }}>{angleDeg.toFixed(2)}°</td>
                    <td style={{ padding: '8px 12px', color: 'var(--accent-purple)', fontWeight: 600 }}>{calcN.toFixed(1)}</td>
                    <td style={{ padding: '8px 12px' }}>{theoN.toFixed(1)}</td>
                    <td style={{ 
                      padding: '8px 12px', 
                      color: percentError < 1 ? 'var(--success)' : percentError < 5 ? '#f59e0b' : 'var(--danger)',
                      fontWeight: 600
                    }}>
                      {percentError.toFixed(2)}%
                    </td>
                    <td style={{ padding: '8px 12px', textAlign: 'right' }}>
                      <button
                        onClick={() => handleDelete(obs.id)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--text-muted)',
                          cursor: 'pointer',
                          padding: '2px'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.color = 'var(--danger)'}
                        onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
