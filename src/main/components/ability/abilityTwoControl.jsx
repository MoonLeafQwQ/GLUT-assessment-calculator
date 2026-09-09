import React from "react";
import { connect } from "react-redux";

// Placeholder: the new research sheet keeps a single adds list (AbilityOneControl).
class AbilityTwoControl extends React.Component {
  render() {
    return <div className="controlInner">新版科研创新仅保留加分项列表（见上方科研创新加分项）。</div>;
  }
}

export default connect(null, null)(AbilityTwoControl);
