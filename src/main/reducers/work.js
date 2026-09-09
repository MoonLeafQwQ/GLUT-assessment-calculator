//labor/practice dimension state for new template.
import { DIMENSIONS } from "../../domain/dimensions";

const workDim = DIMENSIONS.work;

export const totalState = {
  base: 0,
  adds: [{ name: "", desc: "", points: null }],
  minus: [{ name: "", desc: "", points: null }],
};

const initialState = totalState;

export const actionsType = {
  CHANGE_WORK_BASE: "CHANGE_WORK_BASE",
  CHANGE_WORK_ADD: "CHANGE_WORK_ADD",
  CHANGE_WORK_MINUS: "CHANGE_WORK_MINUS",
  ADD_WORK_ROW: "ADD_WORK_ROW",
  REMOVE_WORK_ROW: "REMOVE_WORK_ROW",
  REBUILD_WORK_OBJ: "REBUILD_WORK_OBJ",
};

export const actions = {
  change_base(value) {
    return { type: actionsType.CHANGE_WORK_BASE, value };
  },
  change_add(index, field, value) {
    return { type: actionsType.CHANGE_WORK_ADD, index, field, value };
  },
  change_minus(index, field, value) {
    return { type: actionsType.CHANGE_WORK_MINUS, index, field, value };
  },
  add_row(sign) {
    return { type: actionsType.ADD_WORK_ROW, sign };
  },
  remove_row(sign, index) {
    return { type: actionsType.REMOVE_WORK_ROW, sign, index };
  },
  rebuild_work_obj(obj) {
    return { type: actionsType.REBUILD_WORK_OBJ, obj };
  },
};

function updateRow(list, index, field, value) {
  return list.map((row, i) => (i === index ? Object.assign({}, row, { [field]: value }) : row));
}

export function reducer(state = initialState, action) {
  switch (action.type) {
    case actionsType.CHANGE_WORK_BASE: {
      return Object.assign({}, state, { base: action.value });
    }
    case actionsType.CHANGE_WORK_ADD: {
      return Object.assign({}, state, { adds: updateRow(state.adds, action.index, action.field, action.value) });
    }
    case actionsType.CHANGE_WORK_MINUS: {
      return Object.assign({}, state, { minus: updateRow(state.minus, action.index, action.field, action.value) });
    }
    case actionsType.ADD_WORK_ROW: {
      const row = { name: "", desc: "", points: null };
      if (action.sign === "adds") return Object.assign({}, state, { adds: state.adds.concat(row) });
      if (action.sign === "minus") return Object.assign({}, state, { minus: state.minus.concat(row) });
      return state;
    }
    case actionsType.REMOVE_WORK_ROW: {
      if (action.sign === "adds") {
        return Object.assign({}, state, { adds: state.adds.filter((_, i) => i !== action.index) });
      }
      if (action.sign === "minus") {
        return Object.assign({}, state, { minus: state.minus.filter((_, i) => i !== action.index) });
      }
      return state;
    }
    case actionsType.REBUILD_WORK_OBJ: {
      return Object.assign({}, state, action.obj || {});
    }
    default:
      return state;
  }
}