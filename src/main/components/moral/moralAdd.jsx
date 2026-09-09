import React from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import { actions, allEditingValue } from "../../reducers/rootReducer.js";
const { change_editing } = actions;

// Column groups: each visual row holds 3 entries across 9 cells.
const HEAD_LABELS = ["加分项目", "加分"];

function tdStyle(rowIndex, groupIndex, colIndex) {
  const borderTop = rowIndex === 0 ? { borderTop: " none" } : {};
  if (groupIndex === 0 && colIndex === 0) {
    return { height: " 14.25pt", ...borderTop };
  }
  return colIndex === 0
    ? { ...borderTop, borderLeft: " none" }
    : { ...borderTop, borderLeft: " none" };
}

function tdClass(groupIndex, colIndex) {
  if (colIndex === 0) {
    return groupIndex === 0 ? "xl67" : groupIndex === 1 ? "xl69" : "xl73";
  }
  return colIndex === 1 ? "xl78" : "xl67";
}

function entryValue(entry, colIndex) {
  if (!entry) return "";
  if (colIndex === 0) return entry.name || "";
  return entry.points == null ? "" : entry.points;
}

class MoralADD extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const adds = (Array.isArray(this.props.adds) ? this.props.adds : []).filter(
      (row) => row && (String(row.name || "").trim() || String(row.desc || "").trim() || Number.isFinite(row.points))
    );
    const bodyRows = [];
    const rowCount = Math.ceil(adds.length / 3);
    for (let r = 0; r < rowCount; r += 1) {
      const cells = [];
      for (let g = 0; g < 3; g += 1) {
        const idx = r * 3 + g;
        const entry = idx < adds.length ? adds[idx] : null;
        for (let c = 0; c < 2; c += 1) {
          cells.push(
            <td
              key={`${r}-${g}-${c}`}
              className={tdClass(g, c)}
              align={c === 1 ? "right" : undefined}
              style={tdStyle(r, g, c)}
            >
              {entry ? entryValue(entry, c) : ""}
            </td>
          );
        }
      }
      bodyRows.push(<tr key={r}>{cells}</tr>);
    }
    return (
      <tbody
        className={
          "component clickable-section " +
          (this.props.editing === allEditingValue.MORAL_ADD && "active")
        }
        onClick={() => {
          this.props.change_editing(
            this.props.editing === allEditingValue.MORAL_ADD
              ? allEditingValue.NONE
              : allEditingValue.MORAL_ADD
          );
        }}
      >
        <tr height="19" style={{ height: " 14.25pt" }}>
          {[0, 1, 2].map((g) =>
            HEAD_LABELS.map((label, c) => (
              <td
                key={`${g}-${c}`}
                className="xl66"
                style={
                  g === 0 && c === 0
                    ? { borderTop: " none" }
                    : { borderTop: " none", borderLeft: " none" }
                }
              >
                {label}
              </td>
            ))
          )}
        </tr>
        {bodyRows}
      </tbody>
    );
  }
}

function mapStateToProps(state) {
  return {
    editing: state.global.editing,
    adds: state.moral.adds,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    change_editing: bindActionCreators(change_editing, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(MoralADD);
