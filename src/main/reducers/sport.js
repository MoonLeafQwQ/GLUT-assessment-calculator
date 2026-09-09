// main/reducers/sport.js: sport dimension state for new template (withClass / withoutClass).

export const totalState = {
  mode: "withClass",
  base: null,
  fitnessScore: null,
  classScoreA: null,
  classScoreB: null,
  exerciseScore: null,
  adds: [{ name: "体测成绩优秀", desc: "", points: null }],
  minus: [{ name: "体测成绩不及格", desc: "", points: null }],
};

const initialState = totalState;

export const actionsType = {
  CHANGE_SPORT_MODE: "CHANGE_SPORT_MODE",
  CHANGE_SPORT_BASE: "CHANGE_SPORT_BASE",
  CHANGE_SPORT_ADD: "CHANGE_SPORT_ADD",
  CHANGE_SPORT_MINUS: "CHANGE_SPORT_MINUS",
  ADD_SPORT_ROW: "ADD_SPORT_ROW",
  REMOVE_SPORT_ROW: "REMOVE_SPORT_ROW",
  REBUILD_SPORT_OBJ: "REBUILD_SPORT_OBJ",
};

export const actions = {
  change_mode(mode) {
    return { type: actionsType.CHANGE_SPORT_MODE, mode };
  },
  change_base(field, value) {
    return { type: actionsType.CHANGE_SPORT_BASE, field, value };
  },
  change_add(index, field, value) {
    return { type: actionsType.CHANGE_SPORT_ADD, index, field, value };
  },
  change_minus(index, field, value) {
    return { type: actionsType.CHANGE_SPORT_MINUS, index, field, value };
  },
  add_row(sign) {
    return { type: actionsType.ADD_SPORT_ROW, sign };
  },
  remove_row(sign, index) {
    return { type: actionsType.REMOVE_SPORT_ROW, sign, index };
  },
  rebuild_sport_obj(obj) {
    return { type: actionsType.REBUILD_SPORT_OBJ, obj };
  },
};

function updateRow(list, index, field, value) {
  return list.map((row, i) => (i === index ? Object.assign({}, row, { [field]: value }) : row));
}

export function reducer(state = initialState, action) {
  switch (action.type) {
    case actionsType.CHANGE_SPORT_MODE: {
      if (action.mode !== "withClass" && action.mode !== "withoutClass") return state;
      return Object.assign({}, state, { mode: action.mode });
    }
    case actionsType.CHANGE_SPORT_BASE: {
      return Object.assign({}, state, { [action.field]: action.value });
    }
    case actionsType.CHANGE_SPORT_ADD: {
      return Object.assign({}, state, { adds: updateRow(state.adds, action.index, action.field, action.value) });
    }
    case actionsType.CHANGE_SPORT_MINUS: {
      return Object.assign({}, state, { minus: updateRow(state.minus, action.index, action.field, action.value) });
    }
    case actionsType.ADD_SPORT_ROW: {
      const row = { name: "", desc: "", points: null };
      if (action.sign === "adds") return Object.assign({}, state, { adds: state.adds.concat(row) });
      if (action.sign === "minus") return Object.assign({}, state, { minus: state.minus.concat(row) });
      return state;
    }
    case actionsType.REMOVE_SPORT_ROW: {
      if (action.sign === "adds") {
        return Object.assign({}, state, { adds: state.adds.filter((_, i) => i !== action.index) });
      }
      if (action.sign === "minus") {
        return Object.assign({}, state, { minus: state.minus.filter((_, i) => i !== action.index) });
      }
      return state;
    }
    case actionsType.REBUILD_SPORT_OBJ: {
      return Object.assign({}, state, action.obj || {});
    }
    default:
      return state;
  }
}
