import React from "react";
import { connect } from "react-redux";
import { scoreMoral } from "../../../domain/scoring";

function fmt(value) {
  return value == null ? "" : Number(value).toFixed(2);
}

class MoralShow extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { moral, rules } = this.props;
    const part = scoreMoral(moral || {}, rules || {});
    const base = fmt(part.base);
    const addsTotal = fmt(part.addsTotal);
    const minusTotal = fmt(part.minusTotal);
    const net =
      part.addsTotal == null && part.minusTotal == null
        ? ""
        : fmt(
            (part.addsTotal == null ? 0 : part.addsTotal) -
              (part.minusTotal == null ? 0 : part.minusTotal)
          );
    const total = fmt(part.total);
    const hasCustomFormula = rules && rules.formulas && rules.formulas.moral && rules.formulas.moral.expression;
    return (
      <tbody>
        {part.error ? (
          <tr height="19" style={{ height: " 14.25pt" }}>
            <td colSpan="6" height="19" className="xl90" style={{ height: " 14.25pt", color: "red" }}>
              公式错误：{part.error}
            </td>
          </tr>
        ) : hasCustomFormula ? (
          <tr height="19" style={{ height: " 14.25pt" }}>
            <td colSpan="6" height="19" className="xl90" style={{ height: " 14.25pt" }}>
              德育总分={total}（{part.expression}）
            </td>
          </tr>
        ) : (
          <>
            <tr height="19" style={{ height: " 14.25pt" }}>
              <td
                colSpan="6"
                height="19"
                className="xl90"
                style={{ height: " 14.25pt" }}
              >
                加分合计=<strong>{addsTotal}</strong>　减分合计=<strong>
                  {minusTotal}
                </strong>　净加减分=（<span>&nbsp; </span>
                <strong>{net}</strong> ）
                <span>
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{" "}
                </span>
                德育总分=基础分（{base}）+净加减分（ {net} ） =（
                <span>&nbsp; </span>
                <strong>{total}</strong>
                <span>&nbsp; </span>）
              </td>
            </tr>
            <tr height="19" style={{ height: " 14.25pt" }}>
              <td
                colSpan="6"
                height="19"
                className="xl91"
                style={{ height: " 14.25pt" }}
              >
                　
              </td>
            </tr>
          </>
        )}
      </tbody>
    );
  }
}

function mapStateToProps(state) {
  return {
    moral: state.moral,
    rules: state.setting.rules,
  };
}

export default connect(mapStateToProps, null)(MoralShow);
