import React from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { Input, Space, Divider, PageHeader, Button } from "antd";
import { PlusOutlined, DeleteOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { actions as moralActions } from "../../reducers/moral.js";
import {
  actions as rootActions,
  allEditingValue,
} from "../../reducers/rootReducer";
import { scoreMoral } from "../../../domain/scoring";

function toNumOrNull(v) {
  if (v === "" || v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function str(v) {
  return v === null || v === undefined ? "" : String(v);
}

class MoralMinusControl extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const minus = Array.isArray(this.props.minus) ? this.props.minus : [];
    const part = scoreMoral(this.props.moral || {}, this.props.rules || {});
    return (
      <div className="controlInner">
        <PageHeader
          title="德育减分项"
          subTitle={
            <span>
              减分合计：{part.minusTotal == null ? 0 : part.minusTotal}　总分：
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
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          {minus.map((row, index) => (
            <div key={index}>
              <Space style={{ display: "flex", flexWrap: "wrap" }}>
                <Input
                  addonBefore="减分项目"
                  value={str(row.name)}
                  onChange={(e) =>
                    this.props.change_minus(index, "name", e.target.value)
                  }
                />
                <Input
                  addonBefore="减分"
                  type="number"
                  value={str(row.points)}
                  onChange={(e) =>
                    this.props.change_minus(
                      index,
                      "points",
                      toNumOrNull(e.target.value)
                    )
                  }
                />
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => this.props.remove_row("minus", index)}
                >
                  删除
                </Button>
              </Space>
              <Divider />
            </div>
          ))}
          <Button
            type="dashed"
            icon={<PlusOutlined />}
            block
            onClick={() => this.props.add_row("minus")}
          >
            添加减分项
          </Button>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    minus: state.moral.minus,
    moral: state.moral,
    rules: state.setting.rules,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    change_minus: bindActionCreators(moralActions.change_minus, dispatch),
    add_row: bindActionCreators(moralActions.add_row, dispatch),
    remove_row: bindActionCreators(moralActions.remove_row, dispatch),
    change_editing: bindActionCreators(rootActions.change_editing, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(MoralMinusControl);
