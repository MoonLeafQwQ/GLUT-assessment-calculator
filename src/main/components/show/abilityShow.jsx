import React from "react";
import { connect } from "react-redux";
import { scoreAbility } from "../../../domain/scoring";

function fmt(value) {
  return value == null ? "" : Number(value).toFixed(2);
}

class AbilityShow extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { ability, rules } = this.props;
    const part = scoreAbility(ability || {}, rules || {});
    const base = fmt(part.base);
    const addsTotal = fmt(part.addsTotal);
    const total = fmt(part.total);
    const hasCustomFormula = rules && rules.formulas && rules.formulas.ability && rules.formulas.ability.expression;
    return (
      <tbody>
        {part.error ? (
          <tr height="19" style={{ height: " 14.25pt" }}>
            <td colSpan="6" height="19" className="xl85" style={{ height: " 14.25pt", color: "red" }}>
              公式错误：{part.error}
            </td>
          </tr>
        ) : hasCustomFormula ? (
          <tr height="19" style={{ height: " 14.25pt" }}>
            <td colSpan="6" height="19" className="xl85" style={{ height: " 14.25pt" }}>
              能力总分={total}（{part.expression}）
            </td>
          </tr>
        ) : (
          <tr height="19" style={{ height: " 14.25pt" }}>
            <td
              colSpan="6"
              height="19"
              className="xl85"
              style={{ height: " 14.25pt" }}
            >
              加分合计=<span>&nbsp; </span>（<span>&nbsp; </span>
              <strong>{addsTotal}</strong>
              <span>&nbsp; </span>）
              <span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </span>
              能力总分=基础分（<span>&nbsp; </span>
              {base}
              <span>&nbsp; </span>）+加分合计（<span>&nbsp; </span>
              {addsTotal}
              <span>&nbsp;&nbsp; </span>） =（<span>&nbsp; </span>
              <strong>{total}</strong> ）
            </td>
          </tr>
        )}
      </tbody>
    );
  }
}

function mapStateToProps(state) {
  return {
    ability: state.ability,
    rules: state.setting.rules,
  };
}

export default connect(mapStateToProps, null)(AbilityShow);
