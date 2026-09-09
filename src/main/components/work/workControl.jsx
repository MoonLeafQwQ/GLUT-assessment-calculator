import React from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { Input, Space, Divider, PageHeader, Button } from "antd";
import { PlusOutlined, DeleteOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { actions as workActions } from "../../reducers/work.js";
import {
  actions as rootActions,
  allEditingValue,
} from "../../reducers/rootReducer";
import { scoreWork } from "../../../domain/scoring";

function toNumOrNull(v) {
  if (v === "" || v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function str(v) {
  return v === null || v === undefined ? "" : String(v);
}

function ListEditor(props) {
  const { rows, sign, changeItem, addRow, removeRow, projectLabel } = props;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
      {rows.map((row, index) => (
        <div key={`${sign}-${index}`}>
            <Space style={{ display: "flex", flexWrap: "wrap" }}>
              <Input
                addonBefore={projectLabel}
                value={str(row.name)}
                onChange={(e) => changeItem(sign, index, "name", e.target.value)}
              />
              <Input
                addonBefore="分值"
                type="number"
                value={str(row.points)}
                onChange={(e) =>
                  changeItem(sign, index, "points", toNumOrNull(e.target.value))
                }
              />
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => removeRow(sign, index)}
            >
              删除
            </Button>
          </Space>
          <Divider />
        </div>
      ))}
      <Button type="dashed" icon={<PlusOutlined />} block onClick={() => addRow(sign)}>
        添加{projectLabel}
      </Button>
    </div>
  );
}

class WorkControl extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const work = this.props.work || {};
    const part = scoreWork(work, this.props.rules || {});
    return (
      <div className="controlInner">
        <PageHeader
          title="劳动素质与实践能力综合分"
          subTitle={
            <span>
              加分合计：{part.addsTotal == null ? 0 : part.addsTotal}　减分合计：
              {part.minusTotal == null ? 0 : part.minusTotal}　总分：
              {part.total == null ? "-" : part.total}
            </span>
          }
          onBack={() => this.props.change_editing(allEditingValue.NONE)}
          backIcon={
            <>
              <ArrowLeftOutlined></ArrowLeftOutlined>返回
            </>
          }
        ></PageHeader>
        <Divider orientation="left">加分项</Divider>
        <ListEditor
          rows={work.adds || []}
          sign="adds"
          projectLabel="加分项目"
          changeItem={(s, i, f, v) => this.props.change_item(s, i, f, v)}
          addRow={(s) => this.props.add_row(s)}
          removeRow={(s, i) => this.props.remove_row(s, i)}
        />
        <Divider orientation="left">减分项</Divider>
        <ListEditor
          rows={work.minus || []}
          sign="minus"
          projectLabel="减分项目"
          changeItem={(s, i, f, v) => this.props.change_item(s, i, f, v)}
          addRow={(s) => this.props.add_row(s)}
          removeRow={(s, i) => this.props.remove_row(s, i)}
        />
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    work: state.work,
    rules: state.setting.rules,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    change_item: bindActionCreators((sign, index, field, value) =>
      sign === "adds"
        ? workActions.change_add(index, field, value)
        : workActions.change_minus(index, field, value), dispatch),
    add_row: bindActionCreators(workActions.add_row, dispatch),
    remove_row: bindActionCreators(workActions.remove_row, dispatch),
    change_editing: bindActionCreators(rootActions.change_editing, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(WorkControl);
