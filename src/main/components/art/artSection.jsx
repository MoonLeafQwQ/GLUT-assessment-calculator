import React from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { actions, allEditingValue } from "../../reducers/rootReducer.js";
import { scoreArt } from "../../../domain/scoring";

const { change_editing } = actions;

// Section for the art (aesthetic education) dimension on the new template:
// adds table + minus table + summary row. Clicking any table opens ArtControl.

function entryValue(entry, colIndex) {
  if (!entry) return "";
  if (colIndex === 0) return entry.name || "";
  return entry.points == null ? "" : entry.points;
}

function dynamicTable(rows, headText, editingKey, isActive, onToggle, keyPrefix) {
  const list = (Array.isArray(rows) ? rows : []).filter(
    (row) => row && (String(row.name || "").trim() || String(row.desc || "").trim() || Number.isFinite(row.points))
  );
  const head = [headText, headText === "加分项目" ? "加分" : "减分"];
  const body = [];
  const rowCount = Math.ceil(list.length / 3);
  for (let r = 0; r < rowCount; r += 1) {
    const cells = [];
    for (let g = 0; g < 3; g += 1) {
      const idx = r * 3 + g;
      const entry = idx < list.length ? list[idx] : null;
      for (let c = 0; c < 2; c += 1) {
        const style = {
          height: r === 0 ? " 14.25pt" : undefined,
          borderTop: " none",
          borderLeft: g === 0 && c === 0 ? undefined : " none",
        };
        cells.push(
          <td
            key={`${keyPrefix}-${r}-${g}-${c}`}
            className="xl67"
            align={c === 1 ? "right" : undefined}
            style={style}
          >
            {entry ? entryValue(entry, c) : ""}
          </td>
        );
      }
    }
    body.push(<tr key={`${keyPrefix}-row-${r}`}>{cells}</tr>);
  }
  return (
    <tbody
      key={keyPrefix}
      className={"component clickable-section " + (isActive ? "active" : "")}
      onClick={onToggle}
    >
      <tr height="19" style={{ height: " 14.25pt" }}>
        {[0, 1, 2].map((g) =>
          head.map((label, c) => (
            <td
              key={`${keyPrefix}-h-${g}-${c}`}
              className="xl66"
              style={{ borderTop: " none", borderLeft: c === 0 && g === 0 ? undefined : " none" }}
            >
              {label}
            </td>
          ))
        )}
      </tr>
      {body}
    </tbody>
  );
}

class ArtSection extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { art, rules, editing } = this.props;
    const part = scoreArt(art || {}, rules || {});
    const fmt = (v) => (v == null ? "" : Number(v).toFixed(2));
    const active = editing === allEditingValue.ART;
    const toggle = () =>
      change_editing && this.props.change_editing(active ? allEditingValue.NONE : allEditingValue.ART);
    const hasCustomFormula = rules && rules.formulas && rules.formulas.art && rules.formulas.art.expression;
    let sumText;
    if (part.error) {
      sumText = "公式错误：" + part.error;
    } else if (hasCustomFormula) {
      sumText = "美育总分=" + fmt(part.total) + "（" + part.expression + "）";
    } else {
      sumText =
        part.total == null
          ? "美育总分=-"
          : "美育总分=" + fmt(part.base) + "×70%+" + "加分合计" + fmt(part.addsTotal) + "-" + "减分合计" + fmt(part.minusTotal) + "=" + fmt(part.total);
    }
    return (
      <>
        <tbody
          className="clickable-section"
          onClick={toggle}
        >
          <tr height="19" style={{ height: " 14.25pt" }}>
            <td colSpan="6" height="19" className="xl89" style={{ height: " 14.25pt" }}>
              美育素质测评分
            </td>
          </tr>
        </tbody>
        {dynamicTable(art && art.adds, "加分项目", allEditingValue.ART, active, toggle, "art-adds")}
        {dynamicTable(art && art.minus, "减分项目", allEditingValue.ART, active, toggle, "art-minus")}
        <tbody key="art-sum">
          <tr height="19" style={{ height: " 14.25pt" }}>
            <td colSpan="6" height="19" className="xl91" style={{ height: " 14.25pt", color: part.error ? "red" : undefined }}>
              {sumText}
            </td>
          </tr>
        </tbody>
      </>
    );
  }
}

function mapStateToProps(state) {
  return {
    art: state.art,
    rules: state.setting.rules,
    editing: state.global.editing,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    change_editing: bindActionCreators(change_editing, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ArtSection);
