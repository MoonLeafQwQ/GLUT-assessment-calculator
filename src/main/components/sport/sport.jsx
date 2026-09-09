import React from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import { actions, allEditingValue } from "../../reducers/rootReducer.js";
const { change_editing } = actions;

// Layout: 9 cells per row = add group x2 + minus group x1.
// Adds are laid out two per row (group1, group2), minus one per row (group3).
const GROUP_HEADS = [
  ["加分项目", "加分"],
  ["加分项目", "加分"],
  ["减分项目", "减分"],
];

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

// Sport entries carry { name, desc, points }.
function entryValue(entry, colIndex) {
  if (!entry) return "";
  if (colIndex === 0) return entry.name || "";
  return entry.points == null ? "" : entry.points;
}

class Sport extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const adds = (Array.isArray(this.props.adds) ? this.props.adds : []).filter(
      (row) => row && (String(row.name || "").trim() || String(row.desc || "").trim() || Number.isFinite(row.points))
    );
    const minus = (Array.isArray(this.props.minus) ? this.props.minus : []).filter(
      (row) => row && (String(row.name || "").trim() || String(row.desc || "").trim() || Number.isFinite(row.points))
    );
    const rowCount = Math.max(
      Math.ceil(adds.length / 2),
      minus.length
    );
    const rows = [];
    for (let r = 0; r < rowCount; r += 1) {
      const cells = [];
      // group 0 and 1 hold adds entries r*2 and r*2+1; group 2 holds minus[r].
      const slotEntries = [
        r * 2 < adds.length ? adds[r * 2] : null,
        r * 2 + 1 < adds.length ? adds[r * 2 + 1] : null,
        r < minus.length ? minus[r] : null,
      ];
      for (let g = 0; g < 3; g += 1) {
        for (let c = 0; c < 2; c += 1) {
          cells.push(
            <td
              key={`${g}-${c}`}
              className={tdClass(g, c)}
              align={c === 1 ? "right" : undefined}
              style={tdStyle(r, g, c)}
            >
              {entryValue(slotEntries[g], c)}
            </td>
          );
        }
      }
      rows.push(<tr key={r}>{cells}</tr>);
    }
    return (
      <tbody
        className={
          "component clickable-section " +
          (this.props.editing === allEditingValue.SPORT && "active")
        }
        onClick={() => {
          this.props.change_editing(
            this.props.editing === allEditingValue.SPORT
              ? allEditingValue.NONE
              : allEditingValue.SPORT
          );
        }}
      >
        <tr height="19" style={{ height: " 14.25pt" }}>
          {GROUP_HEADS.map((labels, g) =>
            labels.map((label, c) => (
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
        {rows}
      </tbody>
    );
  }
}

function mapStateToProps(state) {
  return {
    editing: state.global.editing,
    adds: state.sport.adds,
    minus: state.sport.minus,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    change_editing: bindActionCreators(change_editing, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Sport);
