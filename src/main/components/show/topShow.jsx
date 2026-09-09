import React from "react";
import { connect } from "react-redux";
import { Button } from "antd";
import * as echarts from "echarts";
import { scoreMoral, scoreStudy, scoreAbility, scoreSport, scoreArt, scoreWork, scoreTotal } from "../../../domain/scoring";

const dimensions = [
  ["德育", "moral", scoreMoral],
  ["专业学习", "study", scoreStudy],
  ["科研创新", "ability", scoreAbility],
  ["体育", "sport", scoreSport],
  ["美育", "art", scoreArt],
  ["劳动", "work", scoreWork],
];

function format(value) {
  return value == null ? "-" : Number(value).toFixed(2);
}

function numberOrZero(value) {
  return Number.isFinite(value) ? value : 0;
}

function position(index, count) {
  return `${(index + 0.5) * (100 / count)}%`;
}

const ALL_RINGS_MIN_WIDTH = 600;
const SUMMARY_RING_MIN_WIDTH = 160;

class TopShow extends React.Component {
  constructor(props) {
    super(props);
    this.showPie = null;
  }

componentDidMount() {
    const element = document.querySelector("#pie");
    if (!element) return;
    this.showPie = echarts.init(element);
    this.resizeDebounced = this.debounce(() => {
      if (this.showPie) {
        this.updateChart();
        this.showPie.resize();
      }
    }, 200);
    window.addEventListener("resize", this.resizeDebounced);
    this.handleThemeChange = () => {
      if (this.showPie) {
        this.updateChart();
        this.showPie.resize();
      }
    };
    if (window.matchMedia) {
      this.darkQuery = window.matchMedia("(prefers-color-scheme: dark)");
      this.darkQuery.addEventListener("change", this.handleThemeChange);
    }
    this.updateChart();
    const warp = element.closest(".warp");
    if (warp) {
      this.handleTransitionEnd = () => {
        if (this.showPie) {
          this.updateChart();
          this.showPie.resize();
        }
      };
      warp.addEventListener("transitionend", this.handleTransitionEnd);
    }
  }

  componentDidUpdate() {
    this.updateChart();
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.resizeDebounced);
    if (this.darkQuery && this.handleThemeChange) {
      this.darkQuery.removeEventListener("change", this.handleThemeChange);
    }
    if (this.handleTransitionEnd) {
      const element = document.querySelector("#pie");
      if (element) {
        const warp = element.closest(".warp");
        if (warp) warp.removeEventListener("transitionend", this.handleTransitionEnd);
      }
    }
    if (this.showPie) {
      this.showPie.dispose();
      this.showPie = null;
    }
  }

  debounce(fn, delay) {
    let timer = null;
    return function (...args) {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        fn.apply(this, args);
        timer = null;
      }, delay);
    };
  }

  getParts() {
    const { state, rules } = this.props;
    return dimensions.reduce((result, [label, key, scorer]) => {
      result[key] = scorer(state[key], rules);
      result[key].label = label;
      return result;
    }, {});
  }

  getRingMode() {
    const container = document.querySelector("#pie");
    const width = container ? container.clientWidth : 0;
    if (width >= ALL_RINGS_MIN_WIDTH) return "all";
    if (width >= SUMMARY_RING_MIN_WIDTH) return "summary";
    return "none";
  }

  updateChart() {
    if (!this.showPie) return;
    const parts = this.getParts();
    const summary = scoreTotal(parts, this.props.rules);
    const mode = this.getRingMode();
    const isDark = !!(window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches);
    const chartTextColor = isDark ? "#e6e6e6" : "#000000";
    const labels =
      mode === "all"
        ? [["总分", "summary"]].concat(dimensions.map(([label, key]) => [label, key]))
        : mode === "summary"
          ? [["总分", "summary"]]
          : [];
    const count = mode === "all" ? 7 : 1;
    const titles = labels.map(([label, key]) => {
      if (key === "summary") return `${format(summary.total)}\n总分`;
      const part = parts[key];
      return `${format(part.total)}\n×${Math.round(part.weight * 100)}%`;
    });
    const series = labels.map(([label, key], index) => {
      if (key === "summary") {
        return {
          type: "pie",
          radius: ["45%", "72%"],
          center: [position(index, count), "50%"],
          label: { show: false },
          data: dimensions.map(([name, dimensionKey]) => ({
            name,
            value: numberOrZero(parts[dimensionKey].contribution),
          })),
        };
      }
      const value = numberOrZero(parts[key].total);
      return {
        type: "pie",
        radius: ["45%", "62%"],
        center: [position(index, count), "50%"],
        label: { show: false },
        stillShowZeroSum: false,
        data: [
          { name: label, value },
          { name: "未获得", value: Math.max(0, 100 - value), itemStyle: { opacity: 0 } },
        ],
      };
    });
    this.showPie.setOption({
      tooltip: { trigger: "item" },
      title: titles.map((text, index) => ({
        text,
        top: "center",
        left: position(index, count),
        textAlign: "center",
        textStyle: { fontSize: 11, color: chartTextColor },
      })),
      series,
    }, true);
  }

  render() {
    return (
      <div className="show-board">
        <div className="inner-show-board">
          <div className="point-show" id="pie"></div>
          <Button
            type="primary"
            style={{ marginLeft: "auto", marginRight: "40px" }}
            onClick={async () => {
              await window.ExportFile.spawnXLSX(this.props.dataObj);
            }}
          >
            生成综测文件 →
          </Button>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    state,
    rules: state.setting.rules,
    editing: state.global.editing,
    dataObj: {
      message: state.message,
      moral: state.moral,
      sport: state.sport,
      study: state.study,
      ability: state.ability,
      art: state.art,
      work: state.work,
      setting: state.setting,
    },
  };
}

export default connect(mapStateToProps, null)(TopShow);
