// Physics calculation module for the Laser Diffraction Grating Simulator

export interface DiffractionSpot {
  order: number;
  angleRad: number;
  angleDeg: number;
  positionX: number; // in meters, distance from center
  intensity: number; // 0.0 to 1.0 relative intensity
  exists: boolean;
}

export interface SimulationParams {
  wavelength: number;     // in nm, e.g. 632.8
  linesPerInch: number;   // e.g. 15000
  screenDistance: number; // in meters, e.g. 1.0 (D)
  laserIntensity: number; // e.g. 1.0 (I0)
  slitWidthRatio: number; // a/d ratio, e.g. 0.4 (slit width 'a' relative to spacing 'd')
  numSlits: number;       // number of illuminated slits, e.g. 100 for interference resolution
  roomBrightness: number; // 0.0 to 1.0, affects screen display contrast
}

/**
 * Calculates the grating element spacing 'd' in meters
 * linesPerInch: standard lines per inch, e.g. 15000
 */
export function calculateGratingSpacing(linesPerInch: number): number {
  const inchesToMeters = 0.0254;
  return inchesToMeters / linesPerInch;
}

/**
 * Converts lines/inch to lines/cm
 */
export function calculateLinesPerCm(linesPerInch: number): number {
  return linesPerInch / 2.54;
}

/**
 * Calculates all possible diffraction spots for the given parameters
 */
export function calculateDiffractionSpots(params: SimulationParams): DiffractionSpot[] {
  const { wavelength, linesPerInch, screenDistance, laserIntensity, slitWidthRatio } = params;
  const lambda = wavelength * 1e-9; // convert nm to meters
  const d = calculateGratingSpacing(linesPerInch); // spacing in meters
  const slitWidth = d * slitWidthRatio; // slit width 'a' in meters
  
  const spots: DiffractionSpot[] = [];
  
  // Calculate max theoretical order (where sin(theta) = 1)
  const maxOrder = Math.floor(d / lambda);
  
  // We calculate from -maxOrder to +maxOrder
  for (let n = -maxOrder; n <= maxOrder; n++) {
    const sinTheta = (n * lambda) / d;
    
    // Safety check for arcsin
    if (Math.abs(sinTheta) <= 1.0) {
      const angleRad = Math.asin(sinTheta);
      const angleDeg = (angleRad * 180) / Math.PI;
      const positionX = screenDistance * Math.tan(angleRad);
      
      // Calculate individual spot intensity based on single-slit envelope
      // I(theta) = I0 * [sin(beta)/beta]^2
      // beta = pi * a * sin(theta) / lambda
      let envelope = 1.0;
      if (n !== 0) {
        const beta = (Math.PI * slitWidth * sinTheta) / lambda;
        envelope = Math.pow(Math.sin(beta) / beta, 2);
      }
      
      const intensity = laserIntensity * envelope;
      
      spots.push({
        order: n,
        angleRad,
        angleDeg,
        positionX,
        intensity,
        exists: true
      });
    }
  }
  
  return spots;
}

/**
 * Generates an array of data points representing the intensity envelope across the screen
 * Useful for plotting the intensity graph on a canvas
 */
export function generateIntensityData(
  params: SimulationParams,
  widthMeters: number,
  resolution: number = 400
): { positionX: number; intensity: number }[] {
  const { wavelength, linesPerInch, screenDistance, laserIntensity, slitWidthRatio, numSlits } = params;
  const lambda = wavelength * 1e-9;
  const d = calculateGratingSpacing(linesPerInch);
  const a = d * slitWidthRatio;
  
  const data: { positionX: number; intensity: number }[] = [];
  
  for (let i = 0; i < resolution; i++) {
    // positionX ranges from -widthMeters/2 to +widthMeters/2
    const positionX = -widthMeters / 2 + (widthMeters * i) / (resolution - 1);
    
    // Find the corresponding angle theta
    // tan(theta) = x / D
    const angleRad = Math.atan(positionX / screenDistance);
    const sinTheta = Math.sin(angleRad);
    
    // Physics variables for single slit diffraction and N-slit interference
    // beta = pi * a * sin(theta) / lambda
    // gamma = pi * d * sin(theta) / lambda
    const beta = (Math.PI * a * sinTheta) / lambda;
    const gamma = (Math.PI * d * sinTheta) / lambda;
    
    // 1. Single slit envelope (diffraction)
    let diffractionEnvelope = 1.0;
    if (Math.abs(beta) > 1e-7) {
      diffractionEnvelope = Math.pow(Math.sin(beta) / beta, 2);
    }
    
    // 2. Multi-slit interference term
    // I = I0 * (sin(N*gamma)/sin(gamma))^2 / N^2
    // We divide by N^2 to normalize the multi-slit peak intensity to 1.0
    let interferenceTerm = 1.0;
    if (Math.abs(Math.sin(gamma)) > 1e-7) {
      interferenceTerm = Math.pow(Math.sin(numSlits * gamma) / Math.sin(gamma), 2) / (numSlits * numSlits);
    } else {
      interferenceTerm = 1.0; // peak limit as gamma -> 0 (or m*pi)
    }
    
    const intensity = laserIntensity * diffractionEnvelope * interferenceTerm;
    
    data.push({
      positionX,
      intensity
    });
  }
  
  return data;
}

/**
 * Approximate color matching based on wavelength (nm) for RGB styling
 */
export function wavelengthToRGB(wavelength: number): { r: number; g: number; b: number; hex: string } {
  let r = 0;
  let g = 0;
  let b = 0;
  let factor = 0;

  if (wavelength >= 380 && wavelength < 440) {
    r = -(wavelength - 440) / (440 - 380);
    g = 0.0;
    b = 1.0;
  } else if (wavelength >= 440 && wavelength < 490) {
    r = 0.0;
    g = (wavelength - 440) / (490 - 440);
    b = 1.0;
  } else if (wavelength >= 490 && wavelength < 510) {
    r = 0.0;
    g = 1.0;
    b = -(wavelength - 510) / (510 - 490);
  } else if (wavelength >= 510 && wavelength < 580) {
    r = (wavelength - 510) / (580 - 510);
    g = 1.0;
    b = 0.0;
  } else if (wavelength >= 580 && wavelength < 645) {
    r = 1.0;
    g = -(wavelength - 645) / (645 - 580);
    b = 0.0;
  } else if (wavelength >= 645 && wavelength <= 780) {
    r = 1.0;
    g = 0.0;
    b = 0.0;
  }

  // Let the intensity fall off near the vision limits
  if (wavelength >= 380 && wavelength < 420) {
    factor = 0.3 + (0.7 * (wavelength - 380)) / (420 - 380);
  } else if (wavelength >= 420 && wavelength < 701) {
    factor = 1.0;
  } else if (wavelength >= 701 && wavelength <= 780) {
    factor = 0.3 + (0.7 * (780 - wavelength)) / (780 - 701);
  } else {
    factor = 0.0;
  }

  const clamp = (val: number) => Math.round(Math.max(0, Math.min(255, val * factor * 255)));
  
  const red = clamp(r);
  const green = clamp(g);
  const blue = clamp(b);

  const hex = `#${red.toString(16).padStart(2, '0')}${green.toString(16).padStart(2, '0')}${blue.toString(16).padStart(2, '0')}`;

  return { r: red, g: green, b: blue, hex };
}
