import ReactDOM from "react-dom";
import React from "react";
import { Card, Col, Form, Row, Slider, Button, Input, Typography } from "antd";
import "antd/dist/antd.css";
import "./index.scss";
import { defaultSetting, FORMULA_DEFAULTS } from "../source/constant";
import { preview } from "../domain/formula";

const { Item } = Form;
const { Text } = Typography;

const DIMENSIONS = [
  { key: "moral", label: "德育" },
  { key: "sport", label: "体育" },
  { key: "study", label: "智育" },
  { key: "ability", label: "科创" },
  { key: "art", label: "美育" },
  { key: "work", label: "劳育" },
];

const FORMULA_DIMENSIONS = [
  { key: "moral", label: "德育", variables: ["base", "addsTotal", "minusTotal"] },
  { key: "ability", label: "科创", variables: ["base", "addsTotal", "minusTotal"] },
  { key: "art", label: "美育", variables: ["base", "addsTotal", "minusTotal"] },
  { key: "work", label: "劳育", variables: ["addsTotal", "minusTotal"] },
];

const SPORT_FORMULAS = [
  { key: "withClass", label: "开设体育课", variables: ["fitness", "classA", "classB"] },
  { key: "withoutClass", label: "未开设体育课", variables: ["fitness", "exercise"] },
];

function weightsFromRanges(ranges) {
  const weights = {};
  DIMENSIONS.forEach((dim) => {
    const [start, end] = ranges[dim.key] || [0, 0];
    weights[dim.key] = Math.round((end - start) * 100) / 10000;
  });
  return weights;
}

function spawnDefaultValue(setting) {
  const weights = setting && setting.rules && setting.rules.weights
    ? setting.rules.weights
    : defaultSetting.rules.weights;
  const ranges = {};
  let acc = 0;
  DIMENSIONS.forEach((dim) => {
    const w = Number.isFinite(weights[dim.key]) ? weights[dim.key] : 0;
    ranges[dim.key] = [acc, acc + w * 100];
    acc += w * 100;
  });
  if (acc <= 0) {
    DIMENSIONS.forEach((dim) => {
      ranges[dim.key] = [0, 100 / DIMENSIONS.length];
    });
  }
  return ranges;
}

function getFormulas(setting) {
  const f = (setting && setting.rules && setting.rules.formulas) || {};
  return {
    moral: (f.moral && f.moral.expression) || FORMULA_DEFAULTS.moral.expression,
    ability: (f.ability && f.ability.expression) || FORMULA_DEFAULTS.ability.expression,
    art: (f.art && f.art.expression) || FORMULA_DEFAULTS.art.expression,
    work: (f.work && f.work.expression) || FORMULA_DEFAULTS.work.expression,
    sportWithClass: (f.sport && f.sport.withClass && f.sport.withClass.expression) || FORMULA_DEFAULTS.sport.withClass.expression,
    sportWithoutClass: (f.sport && f.sport.withoutClass && f.sport.withoutClass.expression) || FORMULA_DEFAULTS.sport.withoutClass.expression,
  };
}

function validateFormula(expression, variables) {
  if (!expression || !expression.trim()) return { ok: false, error: "公式不能为空" };
  const dummyVars = {};
  (variables || []).forEach((v) => {
    dummyVars[v] = 0;
  });
  return preview(expression, dummyVars, variables);
}

class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      mode: "weights",
      ranges: spawnDefaultValue(defaultSetting),
      bases: (defaultSetting.rules && defaultSetting.rules.bases) || {},
      formulas: getFormulas(defaultSetting),
      formulaErrors: {},
      save: true,
    };
  }

  componentDidMount() {
    window.Setting.onGetSetting((e, setting) => {
      this.setState({
        mode: "weights",
        ranges: spawnDefaultValue(setting),
        bases: (setting && setting.rules && setting.rules.bases) || {},
        formulas: getFormulas(setting),
      });
    });
    window.Setting.onGetFormulas((e, setting) => {
      this.setState({
        mode: "formulas",
        ranges: spawnDefaultValue(setting),
        bases: (setting && setting.rules && setting.rules.bases) || {},
        formulas: getFormulas(setting),
        formulaErrors: {},
      });
    });
  }

  clampRange(dim, value) {
    const ranges = Object.assign({}, this.state.ranges);
    const order = DIMENSIONS.map((d) => d.key);
    const index = order.indexOf(dim.key);
    const prevEnd = index > 0 ? (ranges[order[index - 1]] || [0, 0])[1] : 0;
    const nextStart = index < order.length - 1 ? (ranges[order[index + 1]] || [100, 100])[0] : 100;
    let [start, end] = value;
    if (start < prevEnd) start = prevEnd;
    if (end > nextStart) end = nextStart;
    if (end < start) end = start;
    ranges[dim.key] = [start, end];
    return ranges;
  }

  validateAllFormulas() {
    const { formulas } = this.state;
    const errors = {};
    let hasError = false;
    FORMULA_DIMENSIONS.forEach((dim) => {
      const result = validateFormula(formulas[dim.key], dim.variables);
      if (!result.ok) {
        errors[dim.key] = result.error;
        hasError = true;
      }
    });
    const sportWcResult = validateFormula(formulas.sportWithClass, SPORT_FORMULAS[0].variables);
    if (!sportWcResult.ok) {
      errors.sportWithClass = sportWcResult.error;
      hasError = true;
    }
    const sportWoResult = validateFormula(formulas.sportWithoutClass, SPORT_FORMULAS[1].variables);
    if (!sportWoResult.ok) {
      errors.sportWithoutClass = sportWoResult.error;
      hasError = true;
    }
    this.setState({ formulaErrors: errors });
    return hasError;
  }

  onFormulaChange(key, value) {
    const formulas = Object.assign({}, this.state.formulas, { [key]: value });
    this.setState({ formulas, save: false }, () => this.validateAllFormulas());
  }

  onRestoreDefault(key) {
    const defaults = {
      moral: FORMULA_DEFAULTS.moral.expression,
      ability: FORMULA_DEFAULTS.ability.expression,
      art: FORMULA_DEFAULTS.art.expression,
      work: FORMULA_DEFAULTS.work.expression,
      sportWithClass: FORMULA_DEFAULTS.sport.withClass.expression,
      sportWithoutClass: FORMULA_DEFAULTS.sport.withoutClass.expression,
    };
    this.onFormulaChange(key, defaults[key]);
  }

  buildFormulas() {
    const { formulas } = this.state;
    return {
      moral: { expression: formulas.moral, variables: FORMULA_DEFAULTS.moral.variables },
      ability: { expression: formulas.ability, variables: FORMULA_DEFAULTS.ability.variables },
      art: { expression: formulas.art, variables: FORMULA_DEFAULTS.art.variables },
      work: { expression: formulas.work, variables: FORMULA_DEFAULTS.work.variables },
      sport: {
        withClass: { expression: formulas.sportWithClass, variables: FORMULA_DEFAULTS.sport.withClass.variables },
        withoutClass: { expression: formulas.sportWithoutClass, variables: FORMULA_DEFAULTS.sport.withoutClass.variables },
      },
    };
  }

  renderWeights() {
    const { ranges, save } = this.state;
    const sliderMarks = { 0: "0", 100: { style: { color: "#f50" }, label: <strong>100</strong> } };
    return (
      <>
        {DIMENSIONS.map((dim) => {
          const [start, end] = ranges[dim.key] || [0, 0];
          return (
            <Item label={dim.label} key={dim.key} required>
              <Row gutter={[16, 16]}>
                <Col span={18}>
                  <Slider
                    marks={sliderMarks}
                    tipFormatter={(value) => value + "%"}
                    range={{ draggableTrack: true }}
                    value={[start, end]}
                    onChange={(value) => {
                      const next = this.clampRange(dim, value);
                      this.setState({ ranges: next, save: false });
                    }}
                  ></Slider>
                </Col>
                <Col span={6}>
                  <h2>{Math.round((end - start) * 100) / 100}%</h2>
                </Col>
              </Row>
            </Item>
          );
        })}
        <Item wrapperCol={{ offset: 16 }}>
          <Row gutter={16}>
            <Col>
              <Button
                onClick={() => {
                  this.setState({ ranges: spawnDefaultValue(defaultSetting), save: false });
                }}
              >
                恢复默认
              </Button>
            </Col>
            <Col>
              {!save && (
                <Button
                  type="primary"
                  size="large"
                  onClick={() => {
                    window.Setting.newSetting({
                      rules: {
                        weights: weightsFromRanges(ranges),
                        bases: this.state.bases,
                        formulas: this.buildFormulas(),
                      },
                    });
                    this.setState({ save: true });
                  }}
                >
                  保存
                </Button>
              )}
            </Col>
          </Row>
        </Item>
      </>
    );
  }

  renderFormulas() {
    const { formulas, formulaErrors, save } = this.state;
    const hasAnyError = Object.keys(formulaErrors).length > 0;
    return (
      <>
        <Text type="secondary" style={{ display: "block", marginBottom: 16 }}>
          可用变量以各维度说明为准。公式语法支持 + - * / % 和括号。
        </Text>
        {FORMULA_DIMENSIONS.map((dim) => (
          <Item
            label={dim.label}
            key={"formula-" + dim.key}
            validateStatus={formulaErrors[dim.key] ? "error" : ""}
            help={formulaErrors[dim.key] || "可用变量：" + dim.variables.join("、")}
          >
            <Row gutter={[8, 8]}>
              <Col span={18}>
                <Input
                  value={formulas[dim.key]}
                  onChange={(e) => this.onFormulaChange(dim.key, e.target.value)}
                />
              </Col>
              <Col span={6}>
                <Button size="small" onClick={() => this.onRestoreDefault(dim.key)}>
                  恢复默认
                </Button>
              </Col>
            </Row>
          </Item>
        ))}
        <Item
          label="体育（开设体育课）"
          key="formula-sportWithClass"
          validateStatus={formulaErrors.sportWithClass ? "error" : ""}
          help={formulaErrors.sportWithClass || "可用变量：" + SPORT_FORMULAS[0].variables.join("、")}
        >
          <Row gutter={[8, 8]}>
            <Col span={18}>
              <Input
                value={formulas.sportWithClass}
                onChange={(e) => this.onFormulaChange("sportWithClass", e.target.value)}
              />
            </Col>
            <Col span={6}>
              <Button size="small" onClick={() => this.onRestoreDefault("sportWithClass")}>
                恢复默认
              </Button>
            </Col>
          </Row>
        </Item>
        <Item
          label="体育（未开设体育课）"
          key="formula-sportWithoutClass"
          validateStatus={formulaErrors.sportWithoutClass ? "error" : ""}
          help={formulaErrors.sportWithoutClass || "可用变量：" + SPORT_FORMULAS[1].variables.join("、")}
        >
          <Row gutter={[8, 8]}>
            <Col span={18}>
              <Input
                value={formulas.sportWithoutClass}
                onChange={(e) => this.onFormulaChange("sportWithoutClass", e.target.value)}
              />
            </Col>
            <Col span={6}>
              <Button size="small" onClick={() => this.onRestoreDefault("sportWithoutClass")}>
                恢复默认
              </Button>
            </Col>
          </Row>
        </Item>
        <Item wrapperCol={{ offset: 16 }}>
          <Button
            type="primary"
            size="large"
            disabled={hasAnyError}
            onClick={() => {
              window.Setting.newSetting({
                rules: {
                  weights: weightsFromRanges(this.state.ranges),
                  bases: this.state.bases,
                  formulas: this.buildFormulas(),
                },
              });
              this.setState({ save: true });
            }}
          >
            {hasAnyError ? "公式有误，请修正" : "保存"}
          </Button>
        </Item>
      </>
    );
  }

  render() {
    const { mode } = this.state;
    return (
      <div className="warp">
        <Card bordered={false} style={{ background: "transparent" }}>
          <Form title={mode === "weights" ? "权重设置" : "自定义公式"} labelCol={{ style: { width: 120 } }} wrapperCol={{ flex: 1 }}>
            <h1>{mode === "weights" ? "权重设置" : "自定义公式"}</h1>
            {mode === "weights" ? this.renderWeights() : this.renderFormulas()}
          </Form>
        </Card>
      </div>
    );
  }
}

ReactDOM.render(<Home></Home>, document.querySelector("#app"));
