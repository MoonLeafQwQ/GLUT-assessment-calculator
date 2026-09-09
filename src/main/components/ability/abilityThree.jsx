import React from "react";
import { connect } from "react-redux";

// Placeholder removed in the app.jsx rework phase: the new research sheet
// keeps a single adds list (AbilityOne) and no minus/category sections.
class AbilityThree extends React.Component {
  render() {
    return <tbody></tbody>;
  }
}

export default connect(null, null)(AbilityThree);
