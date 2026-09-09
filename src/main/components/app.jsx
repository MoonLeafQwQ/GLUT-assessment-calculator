import React from "react";
import AbilityOne from "./ability/abilityOne.jsx";
import AbilityThree from "./ability/abilityThree.jsx";
import AbilityTwo from "./ability/abilityTwo.jsx";
import Control from "./control.jsx";
import Message from "./message/message.jsx";
import MoralADD from "./moral/moralAdd.jsx";
import MoralMinus from "./moral/moralMinus.jsx";
import AbilityShow from "./show/abilityShow.jsx";
import MoralShow from "./show/moralShow.jsx";
import SportShow from "./show/sportShow.jsx";
import TopShow from "./show/topShow.jsx";
import TotalShow from "./show/totalShow.jsx";
import Sport from "./sport/sport.jsx";
import Study from "./study/study.jsx";
import ArtSection from "./art/artSection.jsx";
import WorkSection from "./work/workSection.jsx";
import { connect } from "react-redux";
import { Modal } from "antd";

import { actions as settingActions } from "../reducers/setting";
import { actions as abilityActions } from "../reducers/ability";
import { actions as moralActions } from "../reducers/moral";
import { actions as messageActions } from "../reducers/userMessage";
import { actions as studyActions } from "../reducers/study";
import { actions as sportActions } from "../reducers/sport";
import { actions as artActions } from "../reducers/art";
import { actions as workActions } from "../reducers/work";

import { QqOutlined } from "@ant-design/icons";

const { change_item } = settingActions;
const { rebuild_ability_obj } = abilityActions;
const { rebuild_moral_obj } = moralActions;
const { rebuild_message_obj } = messageActions;
const { rebuild_study_obj } = studyActions;
const { rebuild_sport_obj } = sportActions;
const { rebuild_art_obj } = artActions;
const { rebuild_work_obj } = workActions;

import { actions, allEditingValue } from "../reducers/rootReducer.js";
import { bindActionCreators } from "redux";

const { change_editing } = actions;

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      modal: false,
    };
    this.unload = this.unload.bind(this);
  }
  componentDidMount() {
    window.onbeforeunload = this.unload;
    window.Setting.onOpenSetting(() => {
      window.Setting.openSetting(this.props.setting);
    });
    window.Setting.onOpenFormulas(() => {
      window.Setting.openFormulas(this.props.setting);
    });
    window.Setting.onApplySetting((e, newSetting) =>
      this.props.change_item(newSetting)
    );
    window.ImportFile.onImportDataObj((e, dataObj) => {
      const { ability, art, message, moral, sport, study, work } = dataObj;
      this.props.rebuild_ability_obj(ability);
      this.props.rebuild_art_obj(art);
      this.props.rebuild_moral_obj(moral);
      this.props.rebuild_message_obj(message);
      this.props.rebuild_study_obj(study);
      this.props.rebuild_sport_obj(sport);
      this.props.rebuild_work_obj(work);
    });
    window.ExportFile.onSpawnXLSX(async (e) => {
      await window.ExportFile.spawnXLSX(this.props.dataObj);
    });
  }

  unload(e) {
    const { message, moral, sport, study, ability, art, work, setting } =
      this.props;
    localStorage.setItem("message", JSON.stringify(message));
    localStorage.setItem("moral", JSON.stringify(moral));
    localStorage.setItem("sport", JSON.stringify(sport));
    localStorage.setItem("study", JSON.stringify(study));
    localStorage.setItem("ability", JSON.stringify(ability));
    localStorage.setItem("art", JSON.stringify(art));
    localStorage.setItem("work", JSON.stringify(work));
    localStorage.setItem("setting", JSON.stringify(setting));
    localStorage.setItem("__schema", "v2");
  }

  render() {
    return (
      <div className="table">
        <Modal
          visible={this.state.modal}
          onCancel={() => this.setState({ modal: false })}
          footer={null}
        >
          <img className="qq-code"></img>
        </Modal>
        <Control></Control>
        <div className="tips">
          <a
            className="repo-link"
            onClick={() =>
              window.Global.openShell(
                "https://github.com/millnasis/GLUT-assessment-calculator"
              )
            }
          >
            原项目：millnasis/GLUT-assessment-calculator
          </a>
          <div className="msg">如果它对你有帮助，请给原作者一颗星星→</div>
          <a onClick={() => window.Global.openShell("https://github.com/millnasis/GLUT-assessment-calculator")}>
            <img className="img"></img>
          </a>
          <div className="msg">个人QQ→</div>
          <div className="qq" onClick={() => this.setState({ modal: true })}>
            <QqOutlined></QqOutlined>
          </div>
        </div>
        <div
          className={
            "warp" +
            (this.props.editing !== allEditingValue.NONE ? " active" : "")
          }
        >
          <TopShow></TopShow>
          <div className="table-warp">
            <table
              border="0"
              cellPadding="0"
              cellSpacing="0"
              width="100%"
              style={{
                borderCollapse: "collapse",
                tableLayout: "fixed",
                width: "100%",
              }}
            >
              <Message></Message>
              <tbody
                className="clickable-section"
                onClick={() => {
                  this.props.change_editing(
                    this.props.editing === allEditingValue.MORAL_ADD
                      ? allEditingValue.NONE
                      : allEditingValue.MORAL_ADD
                  );
                }}
              >
                <tr height="24" style={{ height: " 18pt" }}>
                  <td
                    colSpan="6"
                    height="24"
                    className="xl89"
                    style={{ height: " 18pt" }}
                  >
                    德育素质测评分
                  </td>
                </tr>
              </tbody>
              <MoralADD></MoralADD>
              <MoralMinus></MoralMinus>
              <MoralShow></MoralShow>
              <tbody
                className="clickable-section"
                onClick={() => {
                  this.props.change_editing(
                    this.props.editing === allEditingValue.SPORT
                      ? allEditingValue.NONE
                      : allEditingValue.SPORT
                  );
                }}
              >
                <tr height="19" style={{ height: " 14.25pt" }}>
                  <td
                    colSpan="6"
                    height="19"
                    className="xl89"
                    style={{ height: " 14.25pt" }}
                  >
                    体育素质测评分
                  </td>
                </tr>
              </tbody>
              <Sport></Sport>
              <SportShow></SportShow>
              <Study></Study>
              <tbody
                className="clickable-section"
                onClick={() => {
                  this.props.change_editing(
                    this.props.editing === allEditingValue.ABILITY_ONE
                      ? allEditingValue.NONE
                      : allEditingValue.ABILITY_ONE
                  );
                }}
              >
                <tr height="19" style={{ height: " 14.25pt" }}>
                  <td
                    colSpan="6"
                    height="19"
                    className="xl89"
                    style={{ height: " 14.25pt" }}
                  >
                    科研创新综合分
                  </td>
                </tr>
              </tbody>
              <AbilityOne></AbilityOne>
              <AbilityTwo></AbilityTwo>
              <AbilityThree></AbilityThree>
              <AbilityShow></AbilityShow>
              <ArtSection></ArtSection>
              <WorkSection></WorkSection>
              <TotalShow></TotalShow>
              <tbody>
                <tr height="0" style={{ display: " none" }}>
                  <td width="107" style={{ width: " 80pt" }}></td>
                  <td width="112" style={{ width: " 84pt" }}></td>
                  <td width="36" style={{ width: " 27pt" }}></td>
                  <td width="99" style={{ width: " 74pt" }}></td>
                  <td width="113" style={{ width: " 85pt" }}></td>
                  <td width="36" style={{ width: " 27pt" }}></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    editing: state.global.editing,
    ...state,
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

function mapDispatchToProps(dispatch) {
  return {
    rebuild_ability_obj: bindActionCreators(rebuild_ability_obj, dispatch),
    rebuild_art_obj: bindActionCreators(rebuild_art_obj, dispatch),
    rebuild_moral_obj: bindActionCreators(rebuild_moral_obj, dispatch),
    rebuild_message_obj: bindActionCreators(rebuild_message_obj, dispatch),
    rebuild_study_obj: bindActionCreators(rebuild_study_obj, dispatch),
    rebuild_sport_obj: bindActionCreators(rebuild_sport_obj, dispatch),
    rebuild_work_obj: bindActionCreators(rebuild_work_obj, dispatch),
    change_item: bindActionCreators(change_item, dispatch),
    change_editing: bindActionCreators(change_editing, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(App);
