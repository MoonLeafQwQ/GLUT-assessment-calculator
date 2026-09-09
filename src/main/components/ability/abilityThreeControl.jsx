import React from "react";
import { connect } from "react-redux";

// Placeholder: the new research sheet keeps a single adds list (AbilityOneControl).
class AbilityThreeControl extends React.Component {
  render() {
    return <div className="controlInner">新版科研创新无减分与分类，无需填写。</div>;
  }
}

export default connect(null, null)(AbilityThreeControl);
