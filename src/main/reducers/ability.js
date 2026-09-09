// main/reducers/ability.js: ability (scientific innovation) dimension state for new template.
export const totalState = {
  base: 0,
  adds: [{ name: "", desc: "", points: null }],
};

const initialState = totalState;

export const actionsType = {
  ADD_ABILITY_ITEM: "ADD_ABILITY_ITEM",
  DELETE_ABILITY_ITEM: "DELETE_ABILITY_ITEM",
  CHANGE_ABILITY_ITEM: "CHANGE_ABILITY_ITEM",
  REBUILD_ABILITY_OBJ: "REBUILD_ABILITY_OBJ",
};

export const actions = {
  add_item(sign) {
    return { type: actionsType.ADD_ABILITY_ITEM, sign };
  },
  delete_item(sign, index) {
    return { type: actionsType.DELETE_ABILITY_ITEM, sign, index };
  },
  change_item(sign, index, field, value) {
    return { type: actionsType.CHANGE_ABILITY_ITEM, sign, index, field, value };
  },
  rebuild_ability_obj(obj) {
    return { type: actionsType.REBUILD_ABILITY_OBJ, obj };
  },
};

function updateRow(list, index, field, value) {
  return list.map((row, i) => (i === index ? Object.assign({}, row, { [field]: value }) : row));
}

export function reducer(state = initialState, action) {
  switch (action.type) {
    case actionsType.ADD_ABILITY_ITEM: {
      const row = { name: "", desc: "", points: null };
      if (action.sign === "adds") return Object.assign({}, state, { adds: state.adds.concat(row) });
      return state;
    }
    case actionsType.DELETE_ABILITY_ITEM: {
      if (action.sign === "adds") {
        return Object.assign({}, state, { adds: state.adds.filter((_, i) => i !== action.index) });
      }
      return state;
    }
    case actionsType.CHANGE_ABILITY_ITEM: {
      if (action.sign === "adds") {
        return Object.assign({}, state, { adds: updateRow(state.adds, action.index, action.field, action.value) });
      }
      return state;
    }
    case actionsType.REBUILD_ABILITY_OBJ: {
      return Object.assign({}, state, action.obj || {});
    }
    default:
      return state;
  }
}