// domain/scoring.js: pure scoring helpers for non-sport dimensions and rules defaults.
const { roundTo, roundSum } = require("./rounding");
const { DIMENSIONS, clamp, defaultWeights } = require("./dimensions");
const { compile, preview } = require("./formula");

function makeDefaultRules() {
  return {
    weights: defaultWeights(),
    bases: {
      moral: DIMENSIONS.moral.baseScore,
      ability: DIMENSIONS.ability.baseScore,
      art: DIMENSIONS.art.baseScore,
      work: 0,
    },
  };
}

function collectPoints(list) {
  if (!Array.isArray(list)) return [];
  return list.map((it) => (it && Number.isFinite(it.points) ? it.points : null));
}

function resolveFormula(dimKey, rules) {
  const custom = rules && rules.formulas && rules.formulas[dimKey];
  if (custom && custom.expression) {
    return { expression: custom.expression, variables: custom.variables || [] };
  }
  return null;
}

function applyFormulaResult(expression, variables, vars) {
  const result = preview(expression, vars, variables);
  if (!result.ok) return { value: null, error: result.error };
  return { value: result.value, error: null };
}

function getWeight(dimKey, dim, rules) {
  return (rules && rules.weights && Number.isFinite(rules.weights[dimKey]))
    ? rules.weights[dimKey]
    : dim.weight;
}

function scoreBaseWithAddsMinus(base, adds, minus, dim) {
  const addsTotal = roundSum(collectPoints(adds));
  const minusTotal = roundSum(collectPoints(minus));
  const baseNum = Number.isFinite(base) ? base : 0;
  const raw = baseNum +
    (addsTotal == null ? 0 : addsTotal) -
    (minusTotal == null ? 0 : minusTotal);
  const total = roundTo(clamp(raw, dim.minTotal, dim.maxTotal));
  return { base: roundTo(baseNum), addsTotal, minusTotal, total };
}

function scoreMoral(state, rules) {
  const dim = DIMENSIONS.moral;
  const r = (rules && rules.bases && Number.isFinite(rules.bases.moral)) ? rules.bases.moral : dim.baseScore;
  const base = (state && Number.isFinite(state.base)) ? state.base : r;
  const addsTotal = roundSum(collectPoints(state && state.adds));
  const minusTotal = roundSum(collectPoints(state && state.minus));
  const weight = getWeight("moral", dim, rules);
  const formula = resolveFormula("moral", rules);
  if (formula) {
    const vars = {
      base: Number.isFinite(base) ? base : 0,
      addsTotal: addsTotal == null ? 0 : addsTotal,
      minusTotal: minusTotal == null ? 0 : minusTotal,
    };
    const { value, error } = applyFormulaResult(formula.expression, formula.variables, vars);
    if (error) {
      return { dimension: "moral", base: roundTo(Number.isFinite(base) ? base : 0), addsTotal, minusTotal, total: null, weight, contribution: null, expression: formula.expression, error };
    }
    const total = roundTo(clamp(value, dim.minTotal, dim.maxTotal));
    return { dimension: "moral", base: roundTo(Number.isFinite(base) ? base : 0), addsTotal, minusTotal, total, weight, contribution: roundTo(total * weight), expression: formula.expression, error: null };
  }
  const part = scoreBaseWithAddsMinus(base, state && state.adds, state && state.minus, dim);
  const contribution = part.total == null ? null : roundTo(part.total * weight);
  return Object.assign({ dimension: "moral", weight, contribution }, part);
}

function scoreAbility(state, rules) {
  const dim = DIMENSIONS.ability;
  const r = (rules && rules.bases && Number.isFinite(rules.bases.ability)) ? rules.bases.ability : dim.baseScore;
  const base = (state && Number.isFinite(state.base)) ? state.base : r;
  const addsTotal = roundSum(collectPoints(state && state.adds));
  const minusTotal = roundSum(collectPoints(state && state.minus));
  const weight = getWeight("ability", dim, rules);
  const formula = resolveFormula("ability", rules);
  if (formula) {
    const vars = {
      base: Number.isFinite(base) ? base : 0,
      addsTotal: addsTotal == null ? 0 : addsTotal,
      minusTotal: minusTotal == null ? 0 : minusTotal,
    };
    const { value, error } = applyFormulaResult(formula.expression, formula.variables, vars);
    if (error) {
      return { dimension: "ability", base: roundTo(Number.isFinite(base) ? base : 0), addsTotal, minusTotal, total: null, weight, contribution: null, expression: formula.expression, error };
    }
    const total = roundTo(clamp(value, dim.minTotal, dim.maxTotal));
    return { dimension: "ability", base: roundTo(Number.isFinite(base) ? base : 0), addsTotal, minusTotal, total, weight, contribution: roundTo(total * weight), expression: formula.expression, error: null };
  }
  const baseNum = Number.isFinite(base) ? base : 0;
  const raw = baseNum + (addsTotal == null ? 0 : addsTotal) - (minusTotal == null ? 0 : minusTotal);
  const total = roundTo(clamp(raw, dim.minTotal, dim.maxTotal));
  return { dimension: "ability", base: roundTo(baseNum), addsTotal, minusTotal, total, weight, contribution: total == null ? null : roundTo(total * weight) };
}

function scoreArt(state, rules) {
  const dim = DIMENSIONS.art;
  const r = (rules && rules.bases && Number.isFinite(rules.bases.art)) ? rules.bases.art : dim.baseScore;
  const base = (state && Number.isFinite(state.base)) ? state.base : r;
  const addsTotal = roundSum(collectPoints(state && state.adds));
  const minusTotal = roundSum(collectPoints(state && state.minus));
  const weight = getWeight("art", dim, rules);
  const formula = resolveFormula("art", rules);
  if (formula) {
    const vars = {
      base: Number.isFinite(base) ? base : 0,
      addsTotal: addsTotal == null ? 0 : addsTotal,
      minusTotal: minusTotal == null ? 0 : minusTotal,
    };
    const { value, error } = applyFormulaResult(formula.expression, formula.variables, vars);
    if (error) {
      return { dimension: "art", base: roundTo(Number.isFinite(base) ? base : 0), addsTotal, minusTotal, total: null, weight, contribution: null, expression: formula.expression, error };
    }
    const total = roundTo(clamp(value, dim.minTotal, dim.maxTotal));
    return { dimension: "art", base: roundTo(Number.isFinite(base) ? base : 0), addsTotal, minusTotal, total, weight, contribution: roundTo(total * weight), expression: formula.expression, error: null };
  }
  const baseNum = Number.isFinite(base) ? base : 0;
  const raw = baseNum * 0.7 + (addsTotal == null ? 0 : addsTotal) - (minusTotal == null ? 0 : minusTotal);
  const total = roundTo(clamp(raw, dim.minTotal, dim.maxTotal));
  return { dimension: "art", base: roundTo(baseNum), addsTotal, minusTotal, total, weight, contribution: total == null ? null : roundTo(total * weight) };
}

function scoreWork(state, rules) {
  const dim = DIMENSIONS.work;
  const addsTotal = roundSum(collectPoints(state && state.adds));
  const minusTotal = roundSum(collectPoints(state && state.minus));
  const weight = getWeight("work", dim, rules);
  const formula = resolveFormula("work", rules);
  if (formula) {
    const vars = {
      addsTotal: addsTotal == null ? 0 : addsTotal,
      minusTotal: minusTotal == null ? 0 : minusTotal,
    };
    const { value, error } = applyFormulaResult(formula.expression, formula.variables, vars);
    if (error) {
      return { dimension: "work", base: 0, addsTotal, minusTotal, total: null, weight, contribution: null, expression: formula.expression, error };
    }
    const total = roundTo(clamp(value, dim.minTotal, dim.maxTotal));
    return { dimension: "work", base: 0, addsTotal, minusTotal, total, weight, contribution: roundTo(total * weight), expression: formula.expression, error: null };
  }
  const raw = (addsTotal == null ? 0 : addsTotal) - (minusTotal == null ? 0 : minusTotal);
  const total = roundTo(clamp(raw, dim.minTotal, dim.maxTotal));
  return { dimension: "work", base: 0, addsTotal, minusTotal, total, weight, contribution: total == null ? null : roundTo(total * weight) };
}

function scoreStudy(state, rules) {
  const dim = DIMENSIONS.study;
  const items = (state && Array.isArray(state.items)) ? state.items : [];
  const weight = getWeight("study", dim, rules);
  let weighted = 0;
  let credits = 0;
  for (const it of items) {
    if (!it) continue;
    const score = Number.isFinite(it.score) ? it.score : null;
    const credit = Number.isFinite(it.credit) ? it.credit : null;
    if (score == null || credit == null) continue;
    if (credit <= 0) continue;
    weighted += score * credit;
    credits += credit;
  }
  if (credits <= 0) {
    return { dimension: "study", base: 0, addsTotal: null, minusTotal: null, total: null, weight, contribution: null };
  }
  const raw = weighted / credits;
  const total = roundTo(clamp(raw, dim.minTotal, dim.maxTotal));
  return { dimension: "study", base: 0, addsTotal: null, minusTotal: null, total, weight, contribution: roundTo(total * weight) };
}

function resolveSportExpression(mode, rules) {
  const custom = rules && rules.formulas && rules.formulas.sport;
  if (mode === "withoutClass") {
    if (custom && custom.withoutClass && custom.withoutClass.expression) {
      return { expression: custom.withoutClass.expression, variables: custom.withoutClass.variables || ["fitness", "exercise"] };
    }
    return { expression: "fitness*0.7+exercise*0.3", variables: ["fitness", "exercise"] };
  }
  if (custom && custom.withClass && custom.withClass.expression) {
    return { expression: custom.withClass.expression, variables: custom.withClass.variables || ["fitness", "classA", "classB"] };
  }
  return { expression: "(fitness*0.6+(classA+classB)/2*0.4)*0.7", variables: ["fitness", "classA", "classB"] };
}

function classAverage(scoreA, scoreB) {
  const a = Number.isFinite(scoreA) ? scoreA : null;
  const b = Number.isFinite(scoreB) ? scoreB : null;
  if (a == null && b == null) return null;
  if (a == null) return b;
  if (b == null) return a;
  return (a + b) / 2;
}

function computeSportBase(state, rules) {
  const mode = (state && (state.mode === "withoutClass" || state.mode === "withClass")) ? state.mode : "withClass";
  if (state && Number.isFinite(state.base)) {
    return { base: roundTo(state.base), error: null, expression: "base", mode };
  }
  const { expression, variables } = resolveSportExpression(mode, rules);
  const wl = variables;
  const classAvg = classAverage(state && state.classScoreA, state && state.classScoreB);
  const hasInput = [
    state && state.fitnessScore,
    state && state.classScoreA,
    state && state.classScoreB,
    state && state.exerciseScore,
  ].some((value) => Number.isFinite(value));
  if (!hasInput) {
    return { base: null, error: null, expression, mode, classAverage: classAvg };
  }
  const vars = {};
  for (const name of wl) {
    if (name === "fitness") vars.fitness = Number.isFinite(state && state.fitnessScore) ? state.fitnessScore : 0;
    else if (name === "classA") vars.classA = Number.isFinite(state && state.classScoreA) ? state.classScoreA : 0;
    else if (name === "classB") vars.classB = Number.isFinite(state && state.classScoreB) ? state.classScoreB : 0;
    else if (name === "exercise") vars.exercise = Number.isFinite(state && state.exerciseScore) ? state.exerciseScore : 0;
    else vars[name] = 0;
  }
  const result = preview(expression, vars, wl);
  if (!result.ok) {
    return { base: null, error: result.error, expression, mode };
  }
  return { base: roundTo(result.value), error: null, expression, mode, classAverage: classAvg };
}

function scoreSport(state, rules) {
  const dim = DIMENSIONS.sport;
  const baseInfo = computeSportBase(state, rules);
  const addsTotal = roundSum(collectPoints(state && state.adds));
  const minusTotal = roundSum(collectPoints(state && state.minus));
  const baseNum = baseInfo.base == null ? 0 : baseInfo.base;
  const raw = baseNum + (addsTotal == null ? 0 : addsTotal) - (minusTotal == null ? 0 : minusTotal);
  const total = roundTo(clamp(raw, dim.minTotal, dim.maxTotal));
  const weight = getWeight("sport", dim, rules);
  const contribution = total == null || baseInfo.base == null ? null : roundTo(total * weight);
  return {
    dimension: dim.key,
    base: baseInfo.base,
    addsTotal,
    minusTotal,
    total,
    weight,
    contribution,
    expression: baseInfo.expression,
    mode: baseInfo.mode,
    error: baseInfo.error,
    classAverage: baseInfo.classAverage,
  };
}

function scoreTotal(parts, rules) {
  const order = ["moral", "study", "ability", "sport", "art", "work"];
  const list = order.map((k) => parts && parts[k]);
  const contributions = list.map((p) => (p && Number.isFinite(p.contribution) ? p.contribution : null));
  const totals = list.map((p) => (p && Number.isFinite(p.total) ? p.total : null));
  const present = contributions.filter((v) => v != null);
  const allTotalsPresent = totals.every((v) => v != null);
  const total = allTotalsPresent && present.length === order.length
    ? roundTo(present.reduce((a, b) => a + b, 0))
    : null;
  return {
    dimensions: order.reduce((acc, k, i) => {
      const p = list[i];
      if (!p) return acc;
      acc[k] = { total: p.total, weight: p.weight, contribution: contributions[i] };
      return acc;
    }, {}),
    total,
  };
}

module.exports = {
  makeDefaultRules,
  resolveFormula,
  applyFormulaResult,
  classAverage,
  resolveSportExpression,
  scoreSport,
  scoreTotal,
  scoreMoral,
  scoreStudy,
  scoreAbility,
  scoreArt,
  scoreWork,
};
