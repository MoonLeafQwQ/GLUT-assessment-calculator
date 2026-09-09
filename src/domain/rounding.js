 // domain/rounding.js: two-decimal rounding helpers for assessment recalc.
const DEFAULT_DIGITS = 2;

function isNumeric(v) {
  if (v === null || v === undefined) return false;
  if (typeof v === "string") {
    const s = v.trim();
    if (s === "") return false;
    const n = Number(s);
    return Number.isFinite(n);
  }
  return typeof v === "number" && Number.isFinite(v);
}

function toNumber(v) {
  if (typeof v === "number") return v;
  if (typeof v === "string") return Number(v.trim());
  return NaN;
}

function roundTo(value, digits = DEFAULT_DIGITS) {
  if (!isNumeric(value)) return null;
  const n = toNumber(value);
  const factor = Math.pow(10, digits);
  return Math.round(n * factor) / factor;
}

function roundSum(values, digits = DEFAULT_DIGITS) {
  if (!Array.isArray(values)) return null;
  let total = 0;
  let any = false;
  for (const v of values) {
    if (isNumeric(v)) {
      total += toNumber(v);
      any = true;
    }
  }
  if (!any) return null;
  return roundTo(total, digits);
}

module.exports = {
  DEFAULT_DIGITS,
  isNumeric,
  roundTo,
  roundSum,
};
