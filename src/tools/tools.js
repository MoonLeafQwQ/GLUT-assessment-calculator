const ExcelJS = require("exceljs");
const {
  makeDefaultRules,
  scoreMoral,
  scoreStudy,
  scoreAbility,
  scoreSport,
  scoreArt,
  scoreWork,
  scoreTotal,
} = require("../domain/scoring");

const SHEETS = {
  summary: "综测汇总",
  moral: "思想品德综合分",
  study: "专业学习分",
  ability: "科研创新综合分",
  sport: "体育综合分",
  art: "美育综合分",
  work: "劳动素质与实践能力综合分",
};

const REQUIRED_SHEETS = Object.values(SHEETS);

const SHEET_ALIASES = {
  "专业学习分": ["专业学习综合分"],
};

function sheetOrThrow(workbook, name) {
  const found = workbook.getWorksheet(name);
  if (found) return found;
  for (const alias of SHEET_ALIASES[name] || []) {
    const aliased = workbook.getWorksheet(alias);
    if (aliased) return aliased;
  }
  throw new Error("缺少工作表: " + name);
}

function asText(value) {
  if (value === null || value === undefined) return "";
  if (typeof value === "string" || typeof value === "number") return String(value);
  if (Array.isArray(value.richText)) return value.richText.map((item) => item.text || "").join("");
  if (value.result !== undefined && value.result !== null) return asText(value.result);
  if (value.text !== undefined) return String(value.text);
  return String(value);
}

function asNumber(value) {
  const text = asText(value).trim();
  if (text === "") return null;
  const number = Number(text);
  return Number.isFinite(number) ? number : null;
}

function normalizeText(value) {
  return asText(value).replace(/\r\n/g, "\n").replace(/\r/g, "\n");
}

function item(name = "", desc = "", points = null) {
  return { name, desc, points };
}

function parseItemsCell(value) {
  return normalizeText(value)
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && line !== "无")
    .map((line) => {
      const match = line.match(/([+-])\s*([0-9]+(?:\.[0-9]+)?)\s*[；;。]?$/);
      let name = line
        .slice(0, match ? match.index : line.length)
        .replace(/^\s*\d+\s*[.、．]\s*/, "")
        .replace(/[；;。]+$/, "")
        .trim();
      if (name === "加分项目" || name === "减分项目" || name === "科研创新能力加分项") {
        if (!match || Number(match[2]) === 1) return null;
      }
      let desc = "";
      const descMatch = name.match(/（([^（）]+)）\s*$/);
      if (descMatch) {
        desc = descMatch[1].trim();
        name = name.slice(0, descMatch.index).trim();
      }
      if (!name && !match) return null;
      return item(name, desc, match ? Number(match[2]) : null);
    })
    .filter(Boolean);
}

function serializeItemsCell(rows, sign) {
  const list = Array.isArray(rows)
    ? rows.filter((row) => row && (String(row.name || "").trim() || Number.isFinite(row.points)))
    : [];
  if (!list.length) return "无";
  return list
    .map((row, index) => {
      const name = String(row.name || "").trim();
      const desc = String(row.desc || "").trim();
      const label = desc && desc !== name ? `${name}（${desc}）` : name;
      const points = Number.isFinite(row.points) ? `${sign === "minus" ? "-" : "+"}${row.points}` : "";
      return `${index + 1}.${label}${points}；`;
    })
    .join("\n");
}

function validateSheets(workbook) {
  REQUIRED_SHEETS.forEach((name) => sheetOrThrow(workbook, name));
}

function findDataStartRow(sheet, fromRow) {
  const start = Number(fromRow) || 1;
  for (let row = start; row <= sheet.rowCount; row += 1) {
    const first = asText(sheet.getCell(row, 1).value).trim();
    const second = asText(sheet.getCell(row, 2).value).trim();
    if (first === "序号" || (first === "序号" && second === "学号")) {
      return row + 1;
    }
  }
  return start + 1;
}

function findHeaderRow(sheet, fromRow) {
  const start = Number(fromRow) || 1;
  for (let row = start; row <= sheet.rowCount; row += 1) {
    if (asText(sheet.getCell(row, 1).value).trim() === "序号") return row;
  }
  return start;
}

function findColByText(sheet, headerRow, keywords) {
  const maxCol = sheet.columnCount || 30;
  for (let col = 1; col <= maxCol; col += 1) {
    const text = asText(sheet.getCell(headerRow, col).value).trim();
    if (!text) continue;
    for (const kw of keywords) {
      if (text.indexOf(kw) >= 0) return col;
    }
  }
  return 0;
}

function findRow(sheet, idColumn, idNumber, nameColumn, preferredRow) {
  const id = String(idNumber || "").trim();
  const start = Number(preferredRow) || 1;
  if (start > 0 && start <= sheet.rowCount) {
    const prefId = asText(sheet.getCell(start, idColumn).value).trim();
    const prefName = asText(sheet.getCell(start, nameColumn).value).trim();
    if ((id && prefId === id) || (!id && prefName)) return start;
  }
  if (id) {
    for (let row = start; row <= sheet.rowCount; row += 1) {
      if (asText(sheet.getCell(row, idColumn).value).trim() === id) return row;
    }
  }
  for (let row = start; row <= sheet.rowCount; row += 1) {
    if (asText(sheet.getCell(row, nameColumn).value).trim()) return row;
  }
  return start;
}

function columnName(number) {
  let result = "";
  let value = number;
  while (value > 0) {
    const remainder = (value - 1) % 26;
    result = String.fromCharCode(65 + remainder) + result;
    value = Math.floor((value - 1) / 26);
  }
  return result;
}

function setFormula(cell, formula, result) {
  const body = String(formula || "").replace(/^=+/, "");
  if (Number.isFinite(result)) {
    cell.value = { formula: body, result };
  } else {
    cell.value = null;
  }
}

function setNumber(cell, value) {
  cell.value = Number.isFinite(value) ? value : null;
}

function applySummaryStyle(cell) {
  cell.alignment = { vertical: "middle", horizontal: "center" };
  const oldFont = cell.font || {};
  cell.font = {
    name: oldFont.name || "宋体",
    size: oldFont.size || 12,
    bold: oldFont.bold,
    italic: oldFont.italic,
    underline: oldFont.underline,
    strike: oldFont.strike,
    color: oldFont.color,
    family: oldFont.family,
    scheme: oldFont.scheme,
  };
}

function writeIdentity(sheet, row, message) {
  sheet.getCell(row, 1).value = 1;
  sheet.getCell(row, 2).value = message.IdNum || "";
  sheet.getCell(row, 3).value = message.name || "";
}

function writeDimensionRows(sheet, row, state, message, part, addColumn, minusColumn, totalColumn, contributionColumn, baseColumn) {
  writeIdentity(sheet, row, message);
  if (baseColumn) setNumber(sheet.getCell(row, baseColumn), part.base);
  sheet.getCell(row, addColumn).value = serializeItemsCell(state.adds, "adds");
  setNumber(sheet.getCell(row, addColumn + 1), part.addsTotal == null ? 0 : part.addsTotal);
  if (minusColumn) {
    sheet.getCell(row, minusColumn).value = serializeItemsCell(state.minus, "minus");
    setNumber(sheet.getCell(row, minusColumn + 1), part.minusTotal == null ? 0 : part.minusTotal);
  }
  setNumber(sheet.getCell(row, totalColumn), part.total);
  setFormula(sheet.getCell(row, contributionColumn), `ROUND(${columnName(totalColumn)}${row}*${part.weight},2)`, part.contribution);
}

function findStudyTotalColumn(sheet) {
  for (let column = 4; column <= sheet.columnCount; column += 1) {
    const header = normalizeText(sheet.getCell(3, column).value).trim();
    if (/总分|总平均分|总均分|总成绩/.test(header)) return column;
  }
  return sheet.columnCount - 1;
}

function parseCourseHeader(value) {
  const header = normalizeText(value).replace(/\n/g, " ").trim();
  let name = "";
  let credit = null;
  const colonMatch = header.match(/学分\s*[:：]\s*([0-9]+(?:\.[0-9]+)?)/);
  if (colonMatch) {
    name = header.slice(0, colonMatch.index).trim();
    credit = Number(colonMatch[1]);
    return { name, credit };
  }
  const parenMatch = header.match(/学分\s*[（(]\s*([0-9]+(?:\.[0-9]+)?)\s*[）)]/);
  if (parenMatch) {
    name = header.slice(0, parenMatch.index).trim();
    credit = Number(parenMatch[1]);
    return { name, credit };
  }
  const generic = header.match(/^课程\d+/);
  if (generic) {
    name = generic[0];
    return { name, credit };
  }
  if (header) {
    name = header;
    return { name, credit };
  }
  return null;
}

function writeStudy(sheet, row, state, message, part) {
  writeIdentity(sheet, row, message);
  const startColumn = 4;
  const baseTotalColumn = findStudyTotalColumn(sheet);
  const courses = Array.isArray(state.items)
    ? state.items.filter((course) => course && (course.name || Number.isFinite(course.credit) || Number.isFinite(course.score)))
    : [];
  let totalColumn = baseTotalColumn;
  const capacity = Math.max(0, baseTotalColumn - startColumn);
  if (courses.length > capacity) {
    const extra = courses.length - capacity;
    sheet.spliceColumns(baseTotalColumn, 0, ...Array.from({ length: extra }, () => []));
    const srcCol = Math.max(startColumn, baseTotalColumn - 1);
    for (let i = 0; i < extra; i += 1) {
      const dstCol = baseTotalColumn + i;
      if (sheet.getColumn(srcCol).width !== undefined) {
        sheet.getColumn(dstCol).width = sheet.getColumn(srcCol).width;
      }
      for (let r = 3; r <= sheet.rowCount; r += 1) {
        sheet.getCell(r, dstCol).style = JSON.parse(JSON.stringify(sheet.getCell(r, srcCol).style || {}));
      }
    }
    totalColumn = baseTotalColumn + extra;
  } else if (courses.length < capacity) {
    const removeCount = capacity - courses.length;
    const mergeVals = [];
    if (sheet._merges) {
      Object.keys(sheet._merges).forEach((k) => {
        const m = sheet._merges[k];
        mergeVals.push({ key: k, value: sheet.getCell(m.top, m.left).value });
      });
    }
    sheet.spliceColumns(startColumn + courses.length, removeCount);
    mergeVals.forEach((mv) => {
      const m = sheet._merges[mv.key];
      if (m) sheet.getCell(m.top, m.left).value = mv.value;
    });
    totalColumn = startColumn + courses.length;
    const targetCols = totalColumn + 1;
    sheet.eachRow((row) => {
      if (row._cells && row._cells.length > targetCols) {
        row._cells.length = targetCols;
      }
    });
  }
  courses.forEach((course, index) => {
    const column = startColumn + index;
    sheet.getCell(3, column).value = `${course.name || "课程"} 学分：${course.credit == null ? "" : course.credit}`;
    setNumber(sheet.getCell(row, column), Number.isFinite(course.score) ? course.score : null);
  });
  for (let column = startColumn + courses.length; column < totalColumn; column += 1) {
    sheet.getCell(row, column).value = null;
  }
  setNumber(sheet.getCell(row, totalColumn), part.total);
  setFormula(sheet.getCell(row, totalColumn + 1), `ROUND(${columnName(totalColumn)}${row}*${part.weight},2)`, part.contribution);
  return {
    totalCell: `${columnName(totalColumn)}${row}`,
    contributionCell: `${columnName(totalColumn + 1)}${row}`,
  };
}

function parseStudy(sheet, row) {
  const totalColumn = findStudyTotalColumn(sheet);
  const items = [];
  for (let column = 4; column < totalColumn; column += 1) {
    const course = parseCourseHeader(sheet.getCell(3, column).value);
    if (!course) continue;
    items.push({
      name: course.name,
      credit: course.credit,
      score: asNumber(sheet.getCell(row, column).value),
    });
  }
  return items.length ? items : [{ name: "", credit: null, score: null }];
}

function parseMessage(summary, row) {
  const title = normalizeText(summary.getCell(1, 1).value).trim();
  const yearMatch = title.match(/(\d{4}-\d{4})学年/);
  const placeholderMatch = title.match(/lastyear-thisyear/);
  const schoolYear = yearMatch ? yearMatch[1] : (placeholderMatch ? "" : "");
  const collegeName = title
    .replace(/\d{4}-\d{4}学年.*$/, "")
    .replace(/lastyear-thisyear学年.*$/, "")
    .replace(/^college/, "")
    .trim();
  return {
    collegeName,
    major: asText(summary.getCell(row, 2).value),
    gradeAndClass: asText(summary.getCell(row, 3).value),
    IdNum: asText(summary.getCell(row, 4).value),
    name: asText(summary.getCell(row, 5).value),
    schoolYear,
    politicStatus: "",
  };
}

function parseWorkbook(workbook) {
  validateSheets(workbook);
  const summary = sheetOrThrow(workbook, SHEETS.summary);
  const summaryRow = findRow(summary, 4, "", 5, 5);
  const message = parseMessage(summary, summaryRow);
  const moralSheet = sheetOrThrow(workbook, SHEETS.moral);
  const moralRow = findRow(moralSheet, 2, message.IdNum, 3, findDataStartRow(moralSheet, 3));
  const abilitySheet = sheetOrThrow(workbook, SHEETS.ability);
  const abilityRow = findRow(abilitySheet, 2, message.IdNum, 3, findDataStartRow(abilitySheet, 3));
  const sportSheet = sheetOrThrow(workbook, SHEETS.sport);
  const sportRow = findRow(sportSheet, 2, message.IdNum, 3, findDataStartRow(sportSheet, 3));
  const artSheet = sheetOrThrow(workbook, SHEETS.art);
  const artRow = findRow(artSheet, 2, message.IdNum, 3, findDataStartRow(artSheet, 3));
  const workSheet = sheetOrThrow(workbook, SHEETS.work);
  const workRow = findRow(workSheet, 2, message.IdNum, 3, findDataStartRow(workSheet, 3));
  const studySheet = sheetOrThrow(workbook, SHEETS.study);
  const studyRow = findRow(studySheet, 2, message.IdNum, 3, findDataStartRow(studySheet, 3));
  return {
    message,
    moral: {
      base: asNumber(moralSheet.getCell(moralRow, 4).value),
      adds: parseItemsCell(moralSheet.getCell(moralRow, 5).value),
      minus: parseItemsCell(moralSheet.getCell(moralRow, 7).value),
    },
    study: { items: parseStudy(studySheet, studyRow) },
    ability: (() => {
      const headerRow = findHeaderRow(abilitySheet, 3);
      const colBase = findColByText(abilitySheet, headerRow, ["基础分"]);
      const colAdds = findColByText(abilitySheet, headerRow, ["加分项", "加分项目"]);
      return {
        base: colBase ? asNumber(abilitySheet.getCell(abilityRow, colBase).value) : null,
        adds: colAdds ? parseItemsCell(abilitySheet.getCell(abilityRow, colAdds).value) : [],
        minus: [],
      };
    })(),
    sport: {
      mode: "withClass",
      base: asNumber(sportSheet.getCell(sportRow, 4).value),
      fitnessScore: null,
      classScoreA: null,
      classScoreB: null,
      exerciseScore: null,
      adds: parseItemsCell(sportSheet.getCell(sportRow, 5).value),
      minus: parseItemsCell(sportSheet.getCell(sportRow, 7).value),
    },
    art: {
      base: asNumber(artSheet.getCell(artRow, 4).value),
      adds: parseItemsCell(artSheet.getCell(artRow, 5).value),
      minus: parseItemsCell(artSheet.getCell(artRow, 7).value),
    },
    work: {
      base: 0,
      adds: parseItemsCell(workSheet.getCell(workRow, 4).value),
      minus: parseItemsCell(workSheet.getCell(workRow, 6).value),
    },
  };
}

function scoreData(dataObj) {
  const rules = dataObj.setting && dataObj.setting.rules ? dataObj.setting.rules : makeDefaultRules();
  const parts = {
    moral: scoreMoral(dataObj.moral || {}, rules),
    study: scoreStudy(dataObj.study || {}, rules),
    ability: scoreAbility(dataObj.ability || {}, rules),
    sport: scoreSport(dataObj.sport || {}, rules),
    art: scoreArt(dataObj.art || {}, rules),
    work: scoreWork(dataObj.work || {}, rules),
  };
  return { rules, parts, total: scoreTotal(parts, rules) };
}

async function spawnResultTableFromDataObj(dataObj, filePath, modalPath) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(modalPath);
  validateSheets(workbook);
  const message = dataObj.message || {};
  const { parts, total } = scoreData(dataObj);
  const summary = sheetOrThrow(workbook, SHEETS.summary);
  const summaryTitle = normalizeText(summary.getCell(1, 1).value).trim();
  const yearPart = message.schoolYear
    ? `${message.schoolYear}学年`
    : ((summaryTitle.match(/(\d{4}-\d{4})学年/) || [""])[0] || "lastyear-thisyear学年");
  if (message.collegeName) {
    summary.getCell(1, 1).value = `${message.collegeName}${yearPart}学生个人综合测评成绩汇总表`;
  }
  const moral = sheetOrThrow(workbook, SHEETS.moral);
  const study = sheetOrThrow(workbook, SHEETS.study);
  const ability = sheetOrThrow(workbook, SHEETS.ability);
  const sport = sheetOrThrow(workbook, SHEETS.sport);
  const art = sheetOrThrow(workbook, SHEETS.art);
  const work = sheetOrThrow(workbook, SHEETS.work);
  const summaryRow = findRow(summary, 4, message.IdNum, 5, 5);
  const moralRow = findRow(moral, 2, message.IdNum, 3, findDataStartRow(moral, 3));
  const studyRow = findRow(study, 2, message.IdNum, 3, findDataStartRow(study, 3));
  const abilityRow = findRow(ability, 2, message.IdNum, 3, findDataStartRow(ability, 3));
  const sportRow = findRow(sport, 2, message.IdNum, 3, findDataStartRow(sport, 3));
  const artRow = findRow(art, 2, message.IdNum, 3, findDataStartRow(art, 3));
  const workRow = findRow(work, 2, message.IdNum, 3, findDataStartRow(work, 3));
  summary.getCell(summaryRow, 1).value = 1;
  summary.getCell(summaryRow, 2).value = message.major || "未填写";
  summary.getCell(summaryRow, 3).value = message.gradeAndClass || "";
  summary.getCell(summaryRow, 4).value = message.IdNum || "";
  summary.getCell(summaryRow, 5).value = message.name || "";
  setFormula(summary.getCell(summaryRow, 6), `ROUND('${SHEETS.moral}'!J${moralRow},2)`, parts.moral.contribution);
  const studyInfo = writeStudy(study, studyRow, dataObj.study || {}, message, parts.study);
  setFormula(summary.getCell(summaryRow, 7), `ROUND('${SHEETS.study}'!${studyInfo.contributionCell}+'${SHEETS.ability}'!H${abilityRow},2)`, (parts.study.contribution || 0) + (parts.ability.contribution || 0));
  setFormula(summary.getCell(summaryRow, 8), `ROUND('${SHEETS.sport}'!J${sportRow},2)`, parts.sport.contribution);
  setFormula(summary.getCell(summaryRow, 9), `ROUND('${SHEETS.art}'!J${artRow},2)`, parts.art.contribution);
  setFormula(summary.getCell(summaryRow, 10), `ROUND('${SHEETS.work}'!I${workRow},2)`, parts.work.contribution);
  setFormula(summary.getCell(summaryRow, 11), `ROUND(SUM(F${summaryRow}:J${summaryRow}),2)`, total.total);
  for (let col = 6; col <= 11; col += 1) {
    applySummaryStyle(summary.getCell(summaryRow, col));
  }
  writeDimensionRows(moral, moralRow, dataObj.moral || {}, message, parts.moral, 5, 7, 9, 10, 4);
  writeDimensionRows(sport, sportRow, dataObj.sport || {}, message, parts.sport, 5, 7, 9, 10, 4);
  writeDimensionRows(art, artRow, dataObj.art || {}, message, parts.art, 5, 7, 9, 10, 4);
  writeDimensionRows(work, workRow, dataObj.work || {}, message, parts.work, 4, 6, 8, 9, null);
  writeIdentity(ability, abilityRow, message);
  setNumber(ability.getCell(abilityRow, 4), parts.ability.base);
  ability.getCell(abilityRow, 5).value = serializeItemsCell((dataObj.ability || {}).adds, "adds");
  setNumber(ability.getCell(abilityRow, 6), parts.ability.addsTotal == null ? 0 : parts.ability.addsTotal);
  setFormula(ability.getCell(abilityRow, 7), `ROUND(D${abilityRow}+F${abilityRow},2)`, parts.ability.total);
  setFormula(ability.getCell(abilityRow, 8), `ROUND(G${abilityRow}*${parts.ability.weight},2)`, parts.ability.contribution);
  workbook.calcProperties.fullCalcOnLoad = true;
  workbook.calcProperties.forceFullCalc = true;
  await workbook.xlsx.writeFile(filePath);
  return filePath;
}

async function parseTableToDataObj(filePath) {
  try {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);
    return parseWorkbook(workbook);
  } catch (error) {
    return false;
  }
}

module.exports = {
  parseItemsCell,
  serializeItemsCell,
  spawnResultTableFromDataObj,
  parseTableToDataObj,
};
