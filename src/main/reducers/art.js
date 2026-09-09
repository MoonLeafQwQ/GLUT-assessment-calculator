// main/reducers/art.js: art (aesthetic education) dimension state for new template (base 60 + adds/minus).
import { DIMENSIONS } from "../../domain/dimensions";

const artDim = DIMENSIONS.art;

export const totalState = {
  base: artDim.baseScore,
  adds: [{ name: "", desc: "", points: null }],
  minus: [{ name: "", desc: "", points: null }],
};

const initialState = totalState;

export const actionsType = {
  CHANGE_ART_BASE: "CHANGE_ART_BASE",
  CHANGE_ART_ADD: "CHANGE_ART_ADD",
  CHANGE_ART_MINUS: "CHANGE_ART_MINUS",
  ADD_ART_ROW: "ADD_ART_ROW",
  REMOVE_ART_ROW: "REMOVE_ART_ROW",
  REBUILD_ART_OBJ: "REBUILD_ART_OBJ",
};

export const actions = {
  change_base(value) {
    return { type: actionsType.CHANGE_ART_BASE, value };
  },
  change_add(index, field, value) {
    return { type: actionsType.CHANGE_ART_ADD, index, field, value };
  },
  change_minus(index, field, value) {
    return { type: actionsType.CHANGE_ART_MINUS, index, field, value };
  },
  add_row(sign) {
    return { type: actionsType.ADD_ART_ROW, sign };
  },
  remove_row(sign, index) {
    return { type: actionsType.REMOVE_ART_ROW, sign, index };
  },
  rebuild_art_obj(obj) {
    return { type: actionsType.REBUILD_ART_OBJ, obj };
  },
};

function updateRow(list, index, field, value) {
  return list.map((row, i) => (i === index ? Object.assign({}, row, { [field]: value }) : row));
}

export function reducer(state = initialState, action) {
  switch (action.type) {
    case actionsType.CHANGE_ART_BASE: {
      return Object.assign({}, state, { base: action.value });
    }
    case actionsType.CHANGE_ART_ADD: {
      return Object.assign({}, state, { adds: updateRow(state.adds, action.index, action.field, action.value) });
    }
    case actionsType.CHANGE_ART_MINUS: {
      return Object.assign({}, state, { minus: updateRow(state.minus, action.index, action.field, action.value) });
    }
    case actionsType.ADD_ART_ROW: {
      const row = { name: "", desc: "", points: null };
      if (action.sign === "adds") return Object.assign({}, state, { adds: state.adds.concat(row) });
      if (action.sign === "minus") return Object.assign({}, state, { minus: state.minus.concat(row) });
      return state;
    }
    case actionsType.REMOVE_ART_ROW: {
      if (action.sign === "adds") {
        return Object.assign({}, state, { adds: state.adds.filter((_, i) => i !== action.index) });
      }
      if (action.sign === "minus") {
        return Object.assign({}, state, { minus: state.minus.filter((_, i) => i !== action.index) });
      }
      return state;
    }
    case actionsType.REBUILD_ART_OBJ: {
      return Object.assign({}, state, action.obj || {});
    }
    default:
      return state;
  }
}