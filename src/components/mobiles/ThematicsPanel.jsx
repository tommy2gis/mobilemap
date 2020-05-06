import React, { Component } from 'react'
import { connect } from "react-redux";
import ThematicList from '../../modules/ThematicList/List'
import {
    NavBar,
  } from "antd-mobile";

class ThematicsPanel extends Component {
    render() {
        return (
            <div className=" container ">
            <NavBar
              mode="light"
              onLeftClick={() => this.props.history.push("/")}
              leftContent={
                <div>
                  <a className="back-main"></a>
                </div>
              }
            >
              专题列表
            </NavBar>
          <ThematicList></ThematicList>
          </div>
        )
    }
}

export default connect(state => {
    return {
      query: state.query
    };
  }, {})(ThematicsPanel);
