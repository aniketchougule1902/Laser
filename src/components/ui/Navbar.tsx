import { Cpu, Award, Zap } from 'lucide-react';

interface NavbarProps {
  activeTab: 'simulation' | 'theory' | 'quiz';
  setActiveTab: (tab: 'simulation' | 'theory' | 'quiz') => void;
  laserOn: boolean;
}

export const Navbar = ({ activeTab, setActiveTab, laserOn }: NavbarProps) => {
  return (
    <header className="glass" style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '12px 24px',
      borderBottom: '1px solid var(--border-light)',
      zIndex: 100,
      minHeight: '64px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div 
          className={laserOn ? 'pulse' : ''}
          style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            backgroundColor: laserOn ? 'var(--laser-color)' : '#374151',
            boxShadow: laserOn ? '0 0 10px var(--laser-color), 0 0 20px var(--laser-color)' : 'none',
            transition: 'all 0.3s ease'
          }}
        />
        <h1 style={{
          fontSize: '20px',
          fontWeight: 700,
          background: 'linear-gradient(135deg, #f3f4f6, #9ca3af)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          letterSpacing: '-0.5px'
        }}>
          QUANTUM<span className={laserOn ? 'laser-text-glow' : ''} style={{ transition: 'all 0.3s' }}>OPTICS</span>
        </h1>
        <span style={{
          fontSize: '11px',
          background: 'rgba(255, 255, 255, 0.05)',
          padding: '2px 8px',
          borderRadius: '4px',
          color: 'var(--text-secondary)',
          border: '1px solid var(--border-light)',
          fontFamily: 'var(--font-mono)'
        }}>
          v1.4.0
        </span>
      </div>

      <nav style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={() => setActiveTab('simulation')}
          style={{
            background: activeTab === 'simulation' ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
            border: '1px solid',
            borderColor: activeTab === 'simulation' ? 'var(--laser-color)' : 'transparent',
            color: activeTab === 'simulation' ? 'var(--text-primary)' : 'var(--text-secondary)',
            boxShadow: activeTab === 'simulation' ? '0 0 10px rgba(var(--laser-color-rgb), 0.15)' : 'none',
            padding: '8px 16px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.2s ease'
          }}
        >
          <Cpu size={16} className={activeTab === 'simulation' && laserOn ? 'laser-text-glow' : ''} />
          Simulation Lab
        </button>

        <button
          onClick={() => setActiveTab('theory')}
          style={{
            background: activeTab === 'theory' ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
            border: '1px solid',
            borderColor: activeTab === 'theory' ? 'var(--accent-purple)' : 'transparent',
            color: activeTab === 'theory' ? 'var(--text-primary)' : 'var(--text-secondary)',
            padding: '8px 16px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.2s ease'
          }}
        >
          <Zap size={16} />
          Theory & Math
        </button>

        <button
          onClick={() => setActiveTab('quiz')}
          style={{
            background: activeTab === 'quiz' ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
            border: '1px solid',
            borderColor: activeTab === 'quiz' ? 'var(--accent-blue)' : 'transparent',
            color: activeTab === 'quiz' ? 'var(--text-primary)' : 'var(--text-secondary)',
            padding: '8px 16px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.2s ease'
          }}
        >
          <Award size={16} />
          Assessment
        </button>
      </nav>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          lineHeight: '1.2'
        }}>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Status:</span>
          <span style={{ 
            fontSize: '12px', 
            fontWeight: 600, 
            color: laserOn ? 'var(--success)' : 'var(--danger)',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            {laserOn ? 'EMITTING BEAM' : 'STANDBY'}
          </span>
        </div>
      </div>
    </header>
  );
};
