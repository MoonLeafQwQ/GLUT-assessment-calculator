//study dimension state for new template (weighted course average).
export const totalState = {
  items: [{ name: "", credit: null, score: null }],
};

const initialState = totalState;

export const actionsType = {
  CHANGE_STUDY_ITEM: "CHANGE_STUDY_ITEM",
  ADD_STUDY_ITEM: "ADD_STUDY_ITEM",
  DELETE_STUDY_ITEM: "DELETE_STUDY_ITEM",
  REBUILD_STUDY_OBJ: "REBUILD_STUDY_OBJ",
};

export const actions = {
  change_item(index, field, value) {
    return { type: actionsType.CHANGE_STUDY_ITEM, index, field, value };
  },
  add_item() {
    return { type: actionsType.ADD_STUDY_ITEM };
  },
  delete_item(index) {
    return { type: actionsType.DELETE_STUDY_ITEM, index };
  },
  rebuild_study_obj(obj) {
    return { type: actionsType.REBUILD_STUDY_OBJ, obj };
  },
};

export function reducer(state = initialState, action) {
  switch (action.type) {
    case actionsType.CHANGE_STUDY_ITEM: {
      const items = state.items.map((row, i) =>
        i === action.index ? Object.assign({}, row, { [action.field]: action.value }) : row
      );
      return Object.assign({}, state, { items });
    }
    case actionsType.ADD_STUDY_ITEM: {
      return Object.assign({}, state, {
        items: state.items.concat([{ name: "", credit: null, score: null }]),
      });
    }
    case actionsType.DELETE_STUDY_ITEM: {
      return Object.assign({}, state, {
        items: state.items.filter((_, i) => i !== action.index),
      });
    }
    case actionsType.REBUILD_STUDY_OBJ: {
      return Object.assign({}, state, action.obj || {});
    }
    default:
      return state;
  }
}