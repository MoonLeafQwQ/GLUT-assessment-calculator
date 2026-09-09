import React from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { Input, Space, Divider, PageHeader, Button } from "antd";
import { PlusOutlined, DeleteOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { actions as abilityActions } from "../../reducers/ability.js";
import {
  actions as rootActions,
  allEditingValue,
} from "../../reducers/rootReducer";
import { scoreAbility } from "../../../domain/scoring";

function toNumOrNull(v) {
  if (v === "" || v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function str(v) {
  return v === null || v === undefined ? "" : String(v);
}

class AbilityOneControl extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const adds = Array.isArray(this.props.adds) ? this.props.adds : [];
    const part = scoreAbility(this.props.ability || {}, this.props.rules || {});
    return (
      <div className="controlInner">
        <PageHeader
          title="科研创新加分项"
          subTitle={
            <span>
              加分合计：{part.addsTotal == null ? 0 : part.addsTotal}　总分：
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
          {adds.map((row, index) => (
            <div key={index}>
              <Space style={{ display: "flex", flexWrap: "wrap" }}>
                <Input
                  addonBefore="加分项目"
                  value={str(row.name)}
                  onChange={(e) =>
                    this.props.change_item(
                      "adds",
                      index,
                      "name",
                      e.target.value
                    )
                  }
                />
                <Input
                  addonBefore="加分"
                  type="number"
                  value={str(row.points)}
                  onChange={(e) =>
                    this.props.change_item(
                      "adds",
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
                  onClick={() => this.props.delete_item("adds", index)}
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
            onClick={() => this.props.add_item("adds")}
          >
            添加加分项
          </Button>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    adds: state.ability.adds,
    ability: state.ability,
    rules: state.setting.rules,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    add_item: bindActionCreators(abilityActions.add_item, dispatch),
    delete_item: bindActionCreators(abilityActions.delete_item, dispatch),
    change_item: bindActionCreators(abilityActions.change_item, dispatch),
    change_editing: bindActionCreators(rootActions.change_editing, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(AbilityOneControl);
