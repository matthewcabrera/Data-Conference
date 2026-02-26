export const clamp = (v: number, min = 0, max = 1) => Math.max(min, Math.min(max, v));

export const lerp = (a: number, b: number, t: number) => a + (b - a) * clamp(t);

export const easeInOut = (t: number) => {
  const p = clamp(t);
  return p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
};

export const yearFromProgress = (startYear: number, endYear: number, progress: number) => {
  const span = endYear - startYear;
  const offset = Math.round(clamp(progress) * span);
  return startYear + offset;
};
