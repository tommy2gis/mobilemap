import React, { Component } from "react";
import { Collapse,Icon,Table ,Tabs,Spin } from 'antd';
import { connect } from 'react-redux';
import {loadThematicsList,showThematicLayer} from './actions';
import {getCookie,login} from '../../utils/UserInfoUtils';

const axios = require('axios');
import qs from 'qs';
import './style.less';

const { TabPane } = Tabs;


const { Panel } = Collapse;

class List extends Component {
  state = { list: [], loading: true };

  renderList = (list) => {
    let rootlist = [];
    if (list) {
      list.forEach((item) => {
        if (item.pid == 0) {
          let sublist = list.filter((e) => e.pid == item.id);
          rootlist.push(
            <TabPane
              tab={item.name}
              key={item.id}
              style={{ height: "calc(100vh - 160px)", overflowY: "auto" }}
            >
              <Collapse expandIconPosition="right" bordered={false}>
                {sublist.map((subitem) => {
                  let servicelist = this.props.thematics.themlist.filter(
                    (e) =>
                      e.dic_code &&
                      e.dic_code
                        .split(",")
                        .filter((o) => o.includes(subitem.code)).length > 0
                  );
                  let num = servicelist.length;
                  return (
                    <Panel
                      header={
                        <div>
                          <Icon className="foldericon" type="folder" />
                          {subitem.name + " (" + num + ")"}
                        </div>
                      }
                      key={subitem.id}
                    >
                      {servicelist.length > 0
                        ? this.renderServiceList(servicelist)
                        : null}
                    </Panel>
                  );
                })}
              </Collapse>
            </TabPane>
          );
        }
      });
    }

    return rootlist;
  };

  renderServiceList = (list) => {
    const rowSelection = {
      onChange: (selectedRowKeys, selectedRows) => {},
      selectedRowKeys: this.props.thematics.selectedids,
      onSelect: (record, selected, selectedRows, nativeEvent) => {
        if (selected) {
          this.addThematicToStyle(record);
        } else {
          this.removeThematicfromStyle(record);
        }
        // this.addThematicsListToStyle(record)
      },
    };

    const columns = [
      { title: "Name", dataIndex: "alias", render: (text) => <a>{text}</a> },
    ];
    return (
      <Table
        selectedRowKeys={this.props.thematics.selectedids}
        rowKey="id"
        bordered={false}
        pagination={false}
        showHeader={false}
        rowSelection={rowSelection}
        columns={columns}
        dataSource={list}
      />
    );
  };

  getServiceList = () => {
    const  {userinfo} = this.props.query;
    return axios
      .get(
        ServerUrl + "/portal/user/service",
        userinfo && { headers: { token: userinfo.geokey } }
      )
      .then((response) => {
        const list = response.data.result.filter(
          (e) =>
            e.serviceType == "map" ||
            e.serviceType == "wms" ||
            e.serviceType == "wmts"
        );
        this.getList();
        this.props.loadThematicsList(list);
        //this.setState({servicelist:response.data.result});
      })
      .catch((e) => {});
  };

  addThematicToStyle = (item) => {
    this.props.showThematicLayer(item.id, true);
  };

  removeThematicfromStyle = (item) => {
    this.props.showThematicLayer(item.id, false);
    // this.props.removeSourceAndLayers('thematic_'+item.name)
  };

  getList = () => {
    const  {userinfo} = this.props.query
    return axios
      .get(
        ServerUrl + "/portal/service/catalog",
        userinfo && { headers: { token: userinfo.geokey } }
      )
      .then((response) => {
        this.setState({ list: response.data.result, loading: false });
      })
      .catch((e) => {});
  };
  componentDidMount() {
    this.getServiceList();
  }

  render() {
    return (
      <div className="thematiclist">
        <Spin
          style={{ left: 0, right: 0, position: "absolute" }}
          spinning={this.state.loading}
        />
        <Tabs defaultActiveKey="1">{this.renderList(this.state.list)}</Tabs>
      </div>
    );
  }
}

export default connect((state) => {
  return { thematics: state.thematics,query:state.query }
}, {
  loadThematicsList,showThematicLayer 
  })(List);