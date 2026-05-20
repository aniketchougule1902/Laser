const EPSILON = 1e-9

export const calculateTheta = (x: number, f: number): number => {
  if (Math.abs(f) < EPSILON) return 0
  return x / f
}

export const calculateGratingElement = (
  f: number,
  n: number,
  wavelengthNm: number,
  x: number,
): number => {
  if (Math.abs(x) < EPSILON) return 0
  const wavelengthM = wavelengthNm * 1e-9
  return (f * n * wavelengthM) / x
}

export const calculateLinesPerCm = (gratingElementM: number): number => {
  if (Math.abs(gratingElementM) < EPSILON) return 0
  return 0.01 / gratingElementM
}
