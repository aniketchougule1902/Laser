import { useRef, useEffect } from 'react';
import type { SimulationParams } from '../../physics/diffraction';
import { generateIntensityData, wavelengthToRGB } from '../../physics/diffraction';

interface IntensityGraphProps {
  params: SimulationParams;
  laserOn: boolean;
}

export const IntensityGraph = ({ params, laserOn }: IntensityGraphProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high DPI displays
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;

    // Clear background
    ctx.fillStyle = '#0f1118';
    ctx.fillRect(0, 0, width, height);

    // If laser is off, just draw empty grid
    drawGrid(ctx, width, height);

    if (!laserOn) {
      drawTextCentered(ctx, "LASER SOURCE OFF - STANDBY MODE", width, height);
      return;
    }

    // Set up plotting dimensions
    const paddingLeft = 50;
    const paddingRight = 30;
    const paddingTop = 30;
    const paddingBottom = 40;
    const graphWidth = width - paddingLeft - paddingRight;
    const graphHeight = height - paddingTop - paddingBottom;

    // Generate physical data across a visible screen span of e.g. 10 cm (-0.05m to +0.05m)
    // We adjust the span dynamically based on linesPerInch to keep the peaks in view!
    // Spacing d = 2.54cm / LPI. Span ~ 4 * lambda / d * D
    const d = 0.0254 / params.linesPerInch;
    const typicalAngle = (2.5 * params.wavelength * 1e-9) / d; // 2.5 orders
    const halfSpan = Math.max(0.005, Math.min(0.2, params.screenDistance * Math.tan(typicalAngle)));
    const spanWidth = halfSpan * 2; // total screen width plotted in meters

    const points = generateIntensityData(params, spanWidth, 600);

    // Color based on active wavelength
    const colorInfo = wavelengthToRGB(params.wavelength);
    const laserColor = colorInfo.hex;

    // Draw axes
    ctx.strokeStyle = '#2d3142';
    ctx.lineWidth = 1;
    ctx.beginPath();
    // X-axis (zero line)
    ctx.moveTo(paddingLeft, paddingTop + graphHeight);
    ctx.lineTo(paddingLeft + graphWidth, paddingTop + graphHeight);
    // Y-axis
    ctx.moveTo(paddingLeft, paddingTop);
    ctx.lineTo(paddingLeft, paddingTop + graphHeight);
    ctx.stroke();

    // Scale conversion functions
    const getX = (pos: number) => {
      // maps positionX (-halfSpan to +halfSpan) to graph X pixels
      const pct = (pos + halfSpan) / spanWidth;
      return paddingLeft + pct * graphWidth;
    };

    const getY = (val: number) => {
      // maps intensity (0.0 to 2.0 max intensity) to graph Y pixels
      // normalize max peak to 90% of graphHeight
      const normalizedVal = val / params.laserIntensity; // 0.0 to 1.0
      return paddingTop + graphHeight - normalizedVal * graphHeight * 0.9;
    };

    // 1. Draw Single Slit Envelope (diffraction envelope)
    // Envelope: I_env = I0 * (sin(beta)/beta)^2
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    
    const a = d * params.slitWidthRatio;
    const lambda = params.wavelength * 1e-9;
    
    for (let i = 0; i < points.length; i += 2) {
      const pt = points[i];
      const theta = Math.atan(pt.positionX / params.screenDistance);
      const beta = (Math.PI * a * Math.sin(theta)) / lambda;
      let envelopeVal = 1.0;
      if (Math.abs(beta) > 1e-7) {
        envelopeVal = Math.pow(Math.sin(beta) / beta, 2);
      }
      const x = getX(pt.positionX);
      const y = getY(envelopeVal * params.laserIntensity);
      
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.setLineDash([]); // Reset line dash

    // 2. Draw Multi-slit sharp interference peaks
    ctx.strokeStyle = laserColor;
    ctx.lineWidth = 2;
    
    // Create gradient fill for peaks
    const grad = ctx.createLinearGradient(0, paddingTop, 0, paddingTop + graphHeight);
    grad.addColorStop(0, `${laserColor}88`); // semi-transparent glow
    grad.addColorStop(1, `${laserColor}05`);
    
    ctx.beginPath();
    ctx.moveTo(getX(points[0].positionX), getY(0));
    
    for (let i = 0; i < points.length; i++) {
      const pt = points[i];
      ctx.lineTo(getX(pt.positionX), getY(pt.intensity));
    }
    ctx.lineTo(getX(points[points.length - 1].positionX), getY(0));
    ctx.closePath();
    
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.stroke();

    // 3. Labels and Annotations
    ctx.fillStyle = 'var(--text-secondary)';
    ctx.font = '11px var(--font-sans)';
    ctx.textAlign = 'center';

    // X-axis ticks (Screen Position in cm)
    const tickSteps = 5;
    for (let i = 0; i <= tickSteps; i++) {
      const pct = i / tickSteps;
      const posMeters = -halfSpan + pct * spanWidth;
      const posCm = posMeters * 100;
      const x = paddingLeft + pct * graphWidth;
      const y = paddingTop + graphHeight + 16;
      
      // Draw grid ticks
      ctx.strokeStyle = '#1f2937';
      ctx.beginPath();
      ctx.moveTo(x, paddingTop);
      ctx.lineTo(x, paddingTop + graphHeight);
      ctx.stroke();

      ctx.fillStyle = 'var(--text-secondary)';
      ctx.fillText(`${posCm.toFixed(1)} cm`, x, y);
    }

    // Y-axis ticks (Intensity)
    ctx.textAlign = 'right';
    ctx.fillStyle = 'var(--text-secondary)';
    ctx.fillText("Max", paddingLeft - 8, paddingTop + 10);
    ctx.fillText("0.5", paddingLeft - 8, paddingTop + graphHeight/2 + 4);
    ctx.fillText("0.0", paddingLeft - 8, paddingTop + graphHeight);

    // Draw graph titles / labels
    ctx.fillStyle = 'var(--text-primary)';
    ctx.font = '500 13px var(--font-sans)';
    ctx.textAlign = 'center';
    ctx.fillText("Diffraction Spot Intensity Distribution Profile", width / 2, paddingTop - 10);

    ctx.fillStyle = 'var(--text-muted)';
    ctx.font = '11px var(--font-sans)';
    ctx.fillText("Screen Position x (cm)", width / 2, height - 8);

    // Annotations on peaks
    ctx.fillStyle = '#ffffff';
    ctx.font = '10px var(--font-mono)';
    ctx.textAlign = 'center';
    // Label central peak
    ctx.fillText("n=0", getX(0), getY(params.laserIntensity) - 6);

    // Label first order peaks if they fit within plot range
    const firstOrderX = params.screenDistance * Math.tan(Math.asin(lambda / d));
    if (firstOrderX < halfSpan) {
      const firstIntensity = params.laserIntensity * Math.pow(Math.sin((Math.PI * a * lambda / d) / lambda) / ((Math.PI * a * lambda / d) / lambda), 2);
      ctx.fillText("n=+1", getX(firstOrderX), getY(firstIntensity) - 6);
      ctx.fillText("n=-1", getX(-firstOrderX), getY(firstIntensity) - 6);
    }
  }, [params, laserOn]);

  const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.strokeStyle = '#1a1d26';
    ctx.lineWidth = 1;
    
    // Draw vertical lines
    for (let x = 40; x < width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    
    // Draw horizontal lines
    for (let y = 30; y < height; y += 30) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  };

  const drawTextCentered = (ctx: CanvasRenderingContext2D, text: string, width: number, height: number) => {
    ctx.fillStyle = 'rgba(239, 68, 68, 0.4)';
    ctx.font = '600 13px var(--font-mono)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, width / 2, height / 2);
  };

  return (
    <div className="glass-card" style={{
      flex: 1,
      height: '240px',
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      padding: '10px',
      overflow: 'hidden'
    }}>
      <canvas ref={canvasRef} style={{
        width: '100%',
        height: '100%',
        display: 'block'
      }} />
    </div>
  );
};
