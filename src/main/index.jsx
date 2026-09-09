import "antd/dist/antd.css";
import "./style.scss";
import "./stylesheet.css";
import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { Modal } from "antd";
import store, { consumeStateResetFlag } from "./reducers/store.js";
import "../source/模板.xlsx";

import App from "./components/app.jsx";

function Home() {
  return (
    <Provider store={store}>
      <App></App>
    </Provider>
  );
}

ReactDOM.render(<Home></Home>, document.querySelector("#app"));

if (consumeStateResetFlag()) {
  Modal.warning({
    title: "检测到旧版数据",
    content:
      "检测到旧版或未知版本的本机数据，已自动清除并重置为新版空白状态。",
  });
}
