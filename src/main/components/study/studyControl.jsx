import React from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { Input, Space, Divider, PageHeader, Button } from "antd";
import { PlusOutlined, DeleteOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { actions as studyActions } from "../../reducers/study.js";
import {
  actions as rootActions,
  allEditingValue,
} from "../../reducers/rootReducer";
import { scoreStudy } from "../../../domain/scoring";

function toNumOrNull(v) {
  if (v === "" || v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function str(v) {
  return v === null || v === undefined ? "" : String(v);
}

class StudyControl extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const items = Array.isArray(this.props.items) ? this.props.items : [];
    const part = scoreStudy(this.props.study || {}, this.props.rules || {});
    return (
      <div className="controlInner">
        <PageHeader
          title="专业学习分（智育）"
          subTitle={
            <span>
              加权平均：{part.total == null ? "-" : part.total}
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
          {items.map((row, index) => (
            <div key={index}>
              <Space style={{ display: "flex", flexWrap: "wrap" }}>
                <Input
                  addonBefore="课程"
                  value={str(row.name)}
                  onChange={(e) =>
                    this.props.change_item(index, "name", e.target.value)
                  }
                />
                <Input
                  addonBefore="学分"
                  type="number"
                  value={str(row.credit)}
                  onChange={(e) =>
                    this.props.change_item(
                      index,
                      "credit",
                      toNumOrNull(e.target.value)
                    )
                  }
                />
                <Input
                  addonBefore="成绩"
                  type="number"
                  value={str(row.score)}
                  onChange={(e) =>
                    this.props.change_item(
                      index,
                      "score",
                      toNumOrNull(e.target.value)
                    )
                  }
                />
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => this.props.delete_item(index)}
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
            onClick={() => this.props.add_item()}
          >
            添加课程
          </Button>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    items: state.study.items,
    study: state.study,
    rules: state.setting.rules,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    change_item: bindActionCreators(studyActions.change_item, dispatch),
    add_item: bindActionCreators(studyActions.add_item, dispatch),
    delete_item: bindActionCreators(studyActions.delete_item, dispatch),
    change_editing: bindActionCreators(rootActions.change_editing, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(StudyControl);
