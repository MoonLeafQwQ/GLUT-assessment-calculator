import React from "react";
import { CSSTransition, SwitchTransition } from "react-transition-group";
import { connect } from "react-redux";
import { allEditingValue } from "../reducers/rootReducer.js";
import MessageControl from "./message/messageControl.jsx";
import MoralAddControl from "./moral/moralAddControl.jsx";
import MoralMinusControl from "./moral/moralMinusControl.jsx";
import SportControl from "./sport/sportControl.jsx";
import StudyControl from "./study/studyControl.jsx";
import AbilityOneControl from "./ability/abilityOneControl.jsx";
import AbilityTwoControl from "./ability/abilityTwoControl.jsx";
import AbilityThreeControl from "./ability/abilityThreeControl.jsx";
import ArtControl from "./art/artControl.jsx";
import WorkControl from "./work/workControl.jsx";

function switchRender(editing) {
  switch (editing) {
    case allEditingValue.MESSAGE:
      return <MessageControl></MessageControl>;
    case allEditingValue.MORAL_ADD:
      return <MoralAddControl></MoralAddControl>;
    case allEditingValue.MORAL_MINUS:
      return <MoralMinusControl></MoralMinusControl>;
    case allEditingValue.SPORT:
      return <SportControl></SportControl>;
    case allEditingValue.STUDY:
      return <StudyControl></StudyControl>;
    case allEditingValue.ABILITY_ONE:
      return <AbilityOneControl></AbilityOneControl>;
    case allEditingValue.ABILITY_TWO:
      return <AbilityTwoControl></AbilityTwoControl>;
    case allEditingValue.ABILITY_THREE:
      return <AbilityThreeControl></AbilityThreeControl>;
    case allEditingValue.ART:
      return <ArtControl></ArtControl>;
    case allEditingValue.WORK:
      return <WorkControl></WorkControl>;
    default:
      return <div></div>;
  }
}

class Control extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { editing } = this.props;
    return (
      <div
        className={
          "control" + (editing === allEditingValue.NONE ? " active" : "")
        }
        style={{ position: "relative" }}
      >
        <SwitchTransition>
          <CSSTransition
            key={editing}
            classNames="component-fade"
            addEndListener={(node, done) =>
              node.addEventListener("transitionend", done, false)
            }
          >
            {switchRender(editing)}
          </CSSTransition>
        </SwitchTransition>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    ...state.global,
  };
}

export default connect(mapStateToProps, null)(Control);
