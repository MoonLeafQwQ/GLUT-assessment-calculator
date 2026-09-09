import React from "react";
import { connect } from "react-redux";
import { scoreSport } from "../../../domain/scoring";

function fmt(value) {
  return value == null ? "" : Number(value).toFixed(2);
}

class SportShow extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { sport, rules } = this.props;
    const part = scoreSport(sport || {}, rules || {});
    const base = fmt(part.base);
    const addsTotal = fmt(part.addsTotal);
    const minusTotal = fmt(part.minusTotal);
    const total = fmt(part.total);
    const net = part.addsTotal == null && part.minusTotal == null
      ? ""
      : fmt((part.addsTotal == null ? 0 : part.addsTotal) - (part.minusTotal == null ? 0 : part.minusTotal));
    const fitness = sport && sport.fitnessScore != null ? sport.fitnessScore : "";
    const classA = sport && sport.classScoreA != null ? sport.classScoreA : "";
    const classB = sport && sport.classScoreB != null ? sport.classScoreB : "";
    const exercise = sport && sport.exerciseScore != null ? sport.exerciseScore : "";
    const mode = part.mode === "withoutClass" ? "未开设体育课" : "开设体育课";
    return (
      <tbody>
        <tr height="19" style={{ height: " 14.25pt" }}>
          <td
            colSpan="6"
            height="19"
            className="xl90"
            style={{ height: " 14.25pt", color: part.error ? "red" : undefined }}
          >
            {part.error ? (
              <>公式错误：{part.error}</>
            ) : (
              <>
                加分合计=<strong>{addsTotal}</strong>　减分合计=<strong>
                  {minusTotal}
                </strong>　净加减分=<strong>{net}</strong>　体育总分=基础分（
                <strong>{base}</strong>）+净加减分（<strong>{net}</strong>）=（
                <strong>{total}</strong>）
              </>
            )}
          </td>
        </tr>
        <tr height="19" style={{ height: " 14.25pt" }}>
          <td
            colSpan="6"
            height="19"
            className="xl85"
            style={{ height: " 14.25pt" }}
          >
            当前模式：{mode}（{part.expression || ""}）
            {part.mode === "withoutClass" ? (
              <span>
                体测{fitness === "" ? "" : `=${fitness}`}　课外锻炼分
                {exercise === "" ? "" : `=${exercise}`}
              </span>
            ) : (
              <span>
                体测{fitness === "" ? "" : `=${fitness}`}　体育成绩1
                {classA === "" ? "" : `=${classA}`}　体育成绩2
                {classB === "" ? "" : `=${classB}`}
              </span>
            )}
            =基础分（<strong>{base}</strong>）
            {part.error ? (
              <font className="font13">　公式错误：{part.error}</font>
            ) : null}
          </td>
        </tr>
        <tr height="19" style={{ height: " 14.25pt" }}>
          <td
            colSpan="6"
            height="19"
            className="xl70"
            style={{
              borderRight: " 0.5pt solid black",
              height: " 14.25pt",
            }}
          >
            　
          </td>
        </tr>
      </tbody>
    );
  }
}

function mapStateToProps(state) {
  return {
    sport: state.sport,
    rules: state.setting.rules,
  };
}

export default connect(mapStateToProps, null)(SportShow);
