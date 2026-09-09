import React from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { Input, Space, Divider, PageHeader, Button, Radio } from "antd";
import { PlusOutlined, DeleteOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { actions as sportActions } from "../../reducers/sport.js";
import {
  actions as rootActions,
  allEditingValue,
} from "../../reducers/rootReducer";
import { scoreSport } from "../../../domain/scoring";

function toNumOrNull(v) {
  if (v === "" || v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function str(v) {
  return v === null || v === undefined ? "" : String(v);
}

function RowEditor(props) {
  const { rows, onChange, onDelete, addLabel, addonName, onAdd } = props;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
      {rows.map((row, index) => (
        <div key={index}>
          <Space style={{ display: "flex", flexWrap: "wrap" }}>
            <Input
              addonBefore={addonName}
              value={str(row.name)}
              onChange={(e) => onChange(index, "name", e.target.value)}
            />
            <Input
              addonBefore="分值"
              type="number"
              value={str(row.points)}
              onChange={(e) =>
                onChange(index, "points", toNumOrNull(e.target.value))
              }
            />
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => onDelete(index)}
            >
              删除
            </Button>
          </Space>
          <Divider />
        </div>
      ))}
      <Button type="dashed" icon={<PlusOutlined />} block onClick={onAdd}>
        {addLabel}
      </Button>
    </div>
  );
}

class SportControl extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const s = this.props.sport || {};
    const part = scoreSport(s, this.props.rules || {});
    const withClass = s.mode !== "withoutClass";
    return (
      <div className="controlInner">
        <PageHeader
          title="体育综合分"
          subTitle={
            <span>
              基础分：{part.base == null ? "-" : part.base}　总分：
              {part.total == null ? "-" : part.total}
              {part.error ? `　(${part.error})` : ""}
            </span>
          }
          onBack={() => this.props.change_editing(allEditingValue.NONE)}
          backIcon={
            <>
              <ArrowLeftOutlined></ArrowLeftOutlined>返回
            </>
          }
        ></PageHeader>
        <Radio.Group
          value={s.mode}
          onChange={(e) => this.props.change_mode(e.target.value)}
          style={{ marginBottom: 12 }}
        >
          <Radio.Button value="withClass">开设体育课</Radio.Button>
          <Radio.Button value="withoutClass">未开设体育课</Radio.Button>
        </Radio.Group>
        <Space style={{ display: "flex", flexWrap: "wrap", marginBottom: 8 }}>
          <Input
            addonBefore="体测成绩"
            type="number"
            value={str(s.fitnessScore)}
            onChange={(e) =>
              this.props.change_base(
                "fitnessScore",
                toNumOrNull(e.target.value)
              )
            }
          />
          {withClass ? (
            <>
              <Input
                addonBefore="学年上学期体育成绩"
                type="number"
                value={str(s.classScoreA)}
                onChange={(e) =>
                  this.props.change_base(
                    "classScoreA",
                    toNumOrNull(e.target.value)
                  )
                }
              />
              <Input
                addonBefore="学年下学期体育成绩"
                type="number"
                value={str(s.classScoreB)}
                onChange={(e) =>
                  this.props.change_base(
                    "classScoreB",
                    toNumOrNull(e.target.value)
                  )
                }
              />
            </>
          ) : (
            <Input
              addonBefore="课外锻炼分"
              type="number"
              value={str(s.exerciseScore)}
              onChange={(e) =>
                this.props.change_base(
                  "exerciseScore",
                  toNumOrNull(e.target.value)
                )
              }
            />
          )}
        </Space>
        <Divider orientation="left">加分项</Divider>
        <RowEditor
          rows={s.adds || []}
          addonName="加分项目"
          addLabel="添加加分项"
          onChange={(i, f, v) => this.props.change_add(i, f, v)}
          onDelete={(i) => this.props.remove_row("adds", i)}
          onAdd={() => this.props.add_row("adds")}
        />
        <Divider orientation="left">减分项</Divider>
        <RowEditor
          rows={s.minus || []}
          addonName="减分项目"
          addLabel="添加减分项"
          onChange={(i, f, v) => this.props.change_minus(i, f, v)}
          onDelete={(i) => this.props.remove_row("minus", i)}
          onAdd={() => this.props.add_row("minus")}
        />
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    sport: state.sport,
    rules: state.setting.rules,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    change_mode: bindActionCreators(sportActions.change_mode, dispatch),
    change_base: bindActionCreators(sportActions.change_base, dispatch),
    change_add: bindActionCreators(sportActions.change_add, dispatch),
    change_minus: bindActionCreators(sportActions.change_minus, dispatch),
    add_row: bindActionCreators(sportActions.add_row, dispatch),
    remove_row: bindActionCreators(sportActions.remove_row, dispatch),
    change_editing: bindActionCreators(rootActions.change_editing, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(SportControl);
