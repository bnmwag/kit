export const mapRange = (
    min: number,
    max: number,
    nmin: number,
    nmax: number,
    value: number,
) => ((value - min) / (max - min)) * (nmax - nmin) + nmin;

export const clamp = (min: number, max: number, value: number) =>
    Math.max(min, Math.min(value, max));

export const normalize = (min: number, max: number, value: number) =>
    clamp(0, 1, (value - min) / (max - min));

export const roundToDecimals = (value: number, decimals: number): number => {
    const factor = 10 ** decimals;
    return Math.round((value + Number.EPSILON) * factor) / factor;
};
