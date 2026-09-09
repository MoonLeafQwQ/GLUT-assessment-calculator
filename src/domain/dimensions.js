// domain/dimensions.js: six-dimension assessment model and new-template defaults.
const { roundTo } = require("./rounding");

const DIMENSIONS = {
  moral: {
    key: "moral",
    sheetName: "思想品德综合分",
    summaryColumn: "思想品德",
    label: "思想品德",
    baseScore: 60,
    weight: 0.1,
    minTotal: 0,
    maxTotal: 100,
    hasMinus: true,
  },
  study: {
    key: "study",
    sheetName: "专业学习分",
    summaryColumn: "专业学习与科研创新",
    label: "专业学习",
    baseScore: 0,
    weight: 0.6,
    minTotal: 0,
    maxTotal: 100,
    hasMinus: false,
  },
  ability: {
    key: "ability",
    sheetName: "科研创新综合分",
    summaryColumn: "专业学习与科研创新",
    label: "科研创新",
    baseScore: 0,
    weight: 0.1,
    minTotal: 0,
    maxTotal: 100,
    hasMinus: false,
  },
  sport: {
    key: "sport",
    sheetName: "体育综合分",
    summaryColumn: "体育",
    label: "体育",
    baseScore: 0,
    weight: 0.05,
    minTotal: 0,
    maxTotal: 100,
    hasMinus: true,
  },
  art: {
    key: "art",
    sheetName: "美育综合分",
    summaryColumn: "美育",
    label: "美育",
    baseScore: 60,
    weight: 0.05,
    minTotal: 0,
    maxTotal: 100,
    hasMinus: true,
  },
  work: {
    key: "work",
    sheetName: "劳动素质与实践能力综合分",
    summaryColumn: "劳动素质与实践能力",
    label: "劳动素质与实践能力",
    baseScore: 0,
    weight: 0.1,
    minTotal: 0,
    maxTotal: 100,
    hasMinus: true,
  },
};

const SUMMARY_SHEET = "综测汇总";
const SUMMARY_DIMENSION_ORDER = [
  DIMENSIONS.moral,
  DIMENSIONS.study,
  DIMENSIONS.ability,
  DIMENSIONS.sport,
  DIMENSIONS.art,
  DIMENSIONS.work,
];

function clamp(value, min, max) {
  const n = typeof value === "number" && Number.isFinite(value) ? value : 0;
  if (max < min) return n;
  if (n < min) return min;
  if (n > max) return max;
  return n;
}

function defaultWeights() {
  return {
    moral: DIMENSIONS.moral.weight,
    study: DIMENSIONS.study.weight,
    ability: DIMENSIONS.ability.weight,
    sport: DIMENSIONS.sport.weight,
    art: DIMENSIONS.art.weight,
    work: DIMENSIONS.work.weight,
  };
}

function weightSum(weights) {
  const list = [
    weights?.moral,
    weights?.study,
    weights?.ability,
    weights?.sport,
    weights?.art,
    weights?.work,
  ];
  return roundTo(list.reduce((acc, w) => acc + (Number.isFinite(w) ? w : 0), 0), 4);
}

module.exports = {
  DIMENSIONS,
  SUMMARY_SHEET,
  SUMMARY_DIMENSION_ORDER,
  clamp,
  defaultWeights,
  weightSum,
};
