import React from "react";
import { connect } from "react-redux";
import {
  scoreMoral,
  scoreStudy,
  scoreAbility,
  scoreSport,
  scoreArt,
  scoreWork,
  scoreTotal,
} from "../../../domain/scoring";

function fmt(value) {
  return value == null ? "" : Number(value).toFixed(2);
}

function pct(weight) {
  return Math.round((Number.isFinite(weight) ? weight : 0) * 100);
}

class TotalShow extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { state, rules } = this.props;
    const parts = {
      moral: scoreMoral(state.moral, rules),
      study: scoreStudy(state.study, rules),
      ability: scoreAbility(state.ability, rules),
      sport: scoreSport(state.sport, rules),
      art: scoreArt(state.art, rules),
      work: scoreWork(state.work, rules),
    };
    const summary = scoreTotal(parts, rules);
    const total = fmt(summary.total);
    const dims = [
      ["德育", "moral"],
      ["专业学习", "study"],
      ["科研创新", "ability"],
      ["体育", "sport"],
      ["美育", "art"],
      ["劳动", "work"],
    ];
    const termNodes = [];
    dims.forEach(([label, key], index) => {
      const p = parts[key];
      termNodes.push(
        <span key={`${key}-term`}>
          {label}总分（{fmt(p ? p.total : null)}）×{pct(p ? p.weight : 0)}%
        </span>
      );
      if (index < dims.length - 1) {
        termNodes.push(<span key={`${key}-plus`}>+</span>);
      }
    });
    return (
      <tbody>
        <tr height="19" style={{ height: " 14.25pt" }}>
          <td
            colSpan="6"
            height="19"
            className="xl92"
            style={{ height: " 14.25pt" }}
          >
            综测总分={termNodes}=<strong>{total}</strong>
          </td>
        </tr>
      </tbody>
    );
  }
}

function mapStateToProps(state) {
  return {
    state,
    rules: state.setting.rules,
  };
}

export default connect(mapStateToProps, null)(TotalShow);
