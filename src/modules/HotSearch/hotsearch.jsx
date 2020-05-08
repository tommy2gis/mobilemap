/*
 * @Author: 史涛
 * @Date: 2019-01-05 19:28:18
 * @Last Modified by: 史涛
 * @Last Modified time: 2020-05-08 16:52:22
 */
import React, { Component } from "react";
import { connect } from "react-redux";
import { Row, Col, Avatar, Divider, Icon, List } from "antd";
import { query, onHotQuery, changeQueryKey } from "../../actions/query";
import "./hotsearch.css";

export class HotSearch extends Component {
  state = {
    historykeys: [],
    hotkeys:[],
  };

  /**
   *提交查询
   *
   * @param {*} leve
   * @param {*} type
   */
  handleSubmit = (leve, type) => {
    this.props.onHotQuery(leve, type, "q");
    this.props.changeQueryKey(type, leve);
  };

  clearHistoryKeys = () => {
    store.remove("search_save_new");
    this.setState({ historykeys: [] });
  };

  componentWillMount() {
  }

  render() {
    return (
      <div className="hotsearch_panel">
        <Row type="flex" justify="center">
          <Col span={8}>
            <Avatar
              className="iconfont icon-canyin"
              onClick={() => this.handleSubmit("bigclass", "美食")}
            />
            <span
              onClick={() => this.handleSubmit("bigclass", "美食")}
              className="hotsearch_label"
            >
              找美食
            </span>
          </Col>
          <Col span={8}>
            <Avatar
              className="iconfont icon-jiudian"
              onClick={() => this.handleSubmit("bigclass", "酒店")}
            />
            <span
              onClick={() => this.handleSubmit("bigclass", "酒店")}
              className="hotsearch_label"
            >
              订酒店
            </span>
            `
          </Col>
          <Col span={8}>
            <Avatar
              className="iconfont icon-jingdian"
              onClick={() => this.handleSubmit("bigclass", "景点")}
            />
            <span
              onClick={() => this.handleSubmit("bigclass", "景点")}
              className="hotsearch_label"
            >
              去景点
            </span>
          </Col>
        </Row>
        <Divider />
        <Row type="flex" justify="center">
          <a  onClick={() => this.handleSubmit("smallclass", "加油站")}><i className="iconfont icon-jiayouzhan"></i>加油站</a>
          <Divider type="vertical" />
          <a onClick={() => this.handleSubmit("smallclass", "学校")}><i className="iconfont icon-xuexiao"></i>学校</a>
          <Divider type="vertical" />
          <a onClick={() => this.handleSubmit("bigclass", "购物")}><i className="iconfont icon-gouwu"></i>购物</a>
          <Divider type="vertical" />

          <a onClick={() => this.handleSubmit("smallclass", "医院")}><i className="iconfont icon-yiyuan"></i>医院</a>
        </Row>
        <Divider />
        <Row type="flex" justify="center">
          <a  onClick={() => this.handleSubmit("smallclass", "停车场")}><i className="iconfont icon-tingchechang"></i>停车场</a>
          <Divider type="vertical" />
          <a  onClick={() => this.handleSubmit("smallclass", "银行")}><i className="iconfont icon-yinhang"></i>银行</a>
          <Divider type="vertical" />
          <a  onClick={() => this.handleSubmit("bigclass", "ATM")}><i className="iconfont icon-ATM"></i>ATM</a>
          <Divider type="vertical" />
          <a onClick={() => this.handleSubmit("smallclass", "超市")}><i className="iconfont icon-chaoshi"></i>超市</a>
        </Row>
      </div>
    );
  }
}
export default connect(
  state => {
    return { query: state.query };
  },
  { query, onHotQuery, changeQueryKey }
)(HotSearch);
