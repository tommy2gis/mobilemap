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

  /**
   *渲染服务列表面板
   *
   * @memberof List
   */
  renderList = list => {
    const rootlist=list.filter(e=>e.pid===1)
    let rootrenderlist = [];
    rootlist.forEach(item => {
      let sublist = list.filter(e => e.pid == item.id);
      let num = sublist.length;
      rootrenderlist.push(
          <Collapse.Panel
            header={
              <div>
                <Icon className="foldericon" type="folder" />
                {item.name + " (" + num + ")"}
              </div>
            }
            key={item.id}
          >
            {num > 0
              ? this.renderServiceList(sublist)
              : null}
          </Collapse.Panel>
      )
    })

    return <Collapse expandIconPosition="right" bordered={false}>
    {rootrenderlist}
    </Collapse>

  };

  onOpacityChange = (record, value) => {
    this.props.changeThematicOpacity(record.id, value);
    this.props.updateLayer("thematic_" + record.name, null, {
      "raster-opacity": value
    });
  };


  /**
   *渲染服务列表
   *
   * @memberof List
   */
  renderServiceList = list => {
    const rowSelection = {
      onChange: (selectedRowKeys, selectedRows) => {},
      selectedRowKeys: this.props.thematics.selectedids,
      onSelect: (record, selected, selectedRows, nativeEvent) => {
        if (selected) {
          this.addThematicToStyle(record);
        } else {
          this.removeThematicfromStyle(record);
        }
        this.setState({selectedRows:selectedRows.map(e=>e.id)})
        // this.addThematicsListToStyle(record)
      }
    };

    const columns = [
      {
        title: "Name",
        dataIndex: "name",
        render: text => <a>{text}</a>
      }
    ];
    return (
      <Table
        selectedRowKeys={this.props.thematics.selectedids}
        bordered={false}
        pagination={false}
        rowKey="id"
        showHeader={false}
        rowSelection={rowSelection}
        columns={columns}
        dataSource={list}
      />
    );
  };



  addThematicToStyle = (item) => {
    this.props.showThematicLayer(item.id, true);
  };

  removeThematicfromStyle = (item) => {
    this.props.showThematicLayer(item.id, false);
    // this.props.removeSourceAndLayers('thematic_'+item.name)
  };


  componentDidMount() {
    this.getServiceList();
  }

  getServiceList = () => {
    var data={"code":1,"msg":"查询成功","result":[{"id":2,"pid":1,"name":"行政区划","type":1,"sort":1,"code":"","servicetype":"","url":"","layers":"","opacity":null,"userid":1,"status":1,"create_date":null,"modify_date":null},{"id":4,"pid":2,"name":"街道界线","type":2,"sort":1,"code":"","servicetype":"map","url":"http://61.177.139.228:9000/gateway/wuxi_chenguan/grid_road_all/MapServer","layers":"3","opacity":0.5,"userid":1,"status":1,"create_date":null,"modify_date":null},{"id":3,"pid":2,"name":"区界线","type":2,"sort":2,"code":"","servicetype":"map","url":"http://61.177.139.228:9000/gateway/wuxi_chenguan/grid_road_all/MapServer","layers":"5","opacity":0.5,"userid":1,"status":1,"create_date":null,"modify_date":null},{"id":6,"pid":1,"name":"管理单元","type":1,"sort":2,"code":"","servicetype":"","url":"","layers":"","opacity":null,"userid":1,"status":1,"create_date":null,"modify_date":null},{"id":5,"pid":2,"name":"社区界线","type":2,"sort":3,"code":"","servicetype":"map","url":"http://61.177.139.228:9000/gateway/wuxi_chenguan/grid_road_all/MapServer","layers":"4","opacity":0.5,"userid":1,"status":1,"create_date":null,"modify_date":null},{"id":11,"pid":1,"name":"管理要素","type":1,"sort":3,"code":"","servicetype":"","url":"","layers":"","opacity":null,"userid":1,"status":1,"create_date":null,"modify_date":null},{"id":24,"pid":1,"name":"市管三要素","type":1,"sort":4,"code":"","servicetype":"","url":"","layers":"","opacity":null,"userid":1,"status":1,"create_date":null,"modify_date":null},{"id":28,"pid":1,"name":"区管三要素","type":1,"sort":5,"code":"","servicetype":"","url":"","layers":"","opacity":null,"userid":1,"status":1,"create_date":null,"modify_date":null},{"id":7,"pid":6,"name":"市管理单元A类","type":2,"sort":6,"code":"","servicetype":"map","url":"http://61.177.139.228:9000/gateway/wuxi_chenguan/grid_road_all/MapServer","layers":"1","opacity":0.5,"userid":1,"status":1,"create_date":null,"modify_date":null},{"id":8,"pid":6,"name":"市管理单元A类_边框","type":2,"sort":7,"code":"","servicetype":"map","url":"http://61.177.139.228:9000/gateway/wuxi_chenguan/grid_road_all/MapServer","layers":"2","opacity":0.5,"userid":1,"status":1,"create_date":null,"modify_date":null},{"id":9,"pid":6,"name":"市管理单元B类","type":2,"sort":8,"code":"","servicetype":"map","url":"http://61.177.139.228:9000/gateway/wuxi_chenguan/grid_road_all/MapServer","layers":"6","opacity":0.5,"userid":1,"status":1,"create_date":null,"modify_date":null},{"id":10,"pid":6,"name":"惠山区管理单元B类","type":2,"sort":9,"code":"","servicetype":"map","url":"http://61.177.139.228:9000/gateway/wuxi_chenguan/grid_road_all/MapServer","layers":"16","opacity":0.5,"userid":1,"status":1,"create_date":null,"modify_date":null},{"id":12,"pid":11,"name":"道路中心线_双侧","type":2,"sort":11,"code":"","servicetype":"map","url":"http://61.177.139.228:9000/gateway/wuxi_chenguan/grid_road_all/MapServer","layers":"0","opacity":0.5,"userid":1,"status":1,"create_date":null,"modify_date":null},{"id":13,"pid":11,"name":"违停严管路段","type":2,"sort":12,"code":"","servicetype":"map","url":"http://61.177.139.228:9000/gateway/wuxi_chenguan/grid_road_all/MapServer","layers":"26","opacity":0.5,"userid":1,"status":1,"create_date":null,"modify_date":null},{"id":14,"pid":11,"name":"道路中心线_原始","type":2,"sort":13,"code":"","servicetype":"map","url":"http://61.177.139.228:9000/gateway/wuxi_chenguan/grid_road_all/MapServer","layers":"25","opacity":0.5,"userid":1,"status":1,"create_date":null,"modify_date":null},{"id":15,"pid":11,"name":"临时疏导区","type":2,"sort":14,"code":"","servicetype":"map","url":"http://61.177.139.228:9000/gateway/wuxi_chenguan/grid_road_all/MapServer","layers":"8","opacity":0.5,"userid":1,"status":1,"create_date":null,"modify_date":null},{"id":16,"pid":11,"name":"小区院落","type":2,"sort":15,"code":"","servicetype":"map","url":"http://61.177.139.228:9000/gateway/wuxi_chenguan/grid_road_all/MapServer","layers":"24","opacity":0.5,"userid":1,"status":1,"create_date":null,"modify_date":null},{"id":17,"pid":11,"name":"商业广场","type":2,"sort":16,"code":"","servicetype":"map","url":"http://61.177.139.228:9000/gateway/wuxi_chenguan/grid_road_all/MapServer","layers":"19","opacity":0.5,"userid":1,"status":1,"create_date":null,"modify_date":null},{"id":18,"pid":11,"name":"农贸市场","type":2,"sort":17,"code":"","servicetype":"map","url":"http://61.177.139.228:9000/gateway/wuxi_chenguan/grid_road_all/MapServer","layers":"20","opacity":0.5,"userid":1,"status":1,"create_date":null,"modify_date":null},{"id":19,"pid":11,"name":"学校","type":2,"sort":18,"code":"","servicetype":"map","url":"http://61.177.139.228:9000/gateway/wuxi_chenguan/grid_road_all/MapServer","layers":"17","opacity":0.5,"userid":1,"status":1,"create_date":null,"modify_date":null},{"id":20,"pid":11,"name":"小区","type":2,"sort":19,"code":"","servicetype":"map","url":"http://61.177.139.228:9000/gateway/wuxi_chenguan/grid_road_all/MapServer","layers":"18","opacity":0.5,"userid":1,"status":1,"create_date":null,"modify_date":null},{"id":21,"pid":11,"name":"公厕","type":2,"sort":20,"code":"","servicetype":"map","url":"http://61.177.139.228:9000/gateway/wuxi_chenguan/grid_road_all/MapServer","layers":"22","opacity":0.5,"userid":1,"status":1,"create_date":null,"modify_date":null},{"id":22,"pid":11,"name":"景区","type":2,"sort":21,"code":"","servicetype":"map","url":"http://61.177.139.228:9000/gateway/wuxi_chenguan/grid_road_all/MapServer","layers":"21","opacity":0.5,"userid":1,"status":1,"create_date":null,"modify_date":null},{"id":23,"pid":11,"name":"工地","type":2,"sort":22,"code":"","servicetype":"map","url":"http://61.177.139.228:9000/gateway/wuxi_chenguan/grid_road_all/MapServer","layers":"23","opacity":0.5,"userid":1,"status":1,"create_date":null,"modify_date":null},{"id":25,"pid":24,"name":"市政管养_市管","type":2,"sort":24,"code":"","servicetype":"map","url":"http://61.177.139.228:9000/gateway/wuxi_chenguan/grid_road_all/MapServer","layers":"11","opacity":0.5,"userid":1,"status":1,"create_date":null,"modify_date":null},{"id":26,"pid":24,"name":"绿化_市管","type":2,"sort":25,"code":"","servicetype":"map","url":"http://61.177.139.228:9000/gateway/wuxi_chenguan/grid_road_all/MapServer","layers":"9","opacity":0.5,"userid":1,"status":1,"create_date":null,"modify_date":null},{"id":27,"pid":24,"name":"环卫_市管","type":2,"sort":26,"code":"","servicetype":"map","url":"http://61.177.139.228:9000/gateway/wuxi_chenguan/grid_road_all/MapServer","layers":"10","opacity":0.5,"userid":1,"status":1,"create_date":null,"modify_date":null},{"id":29,"pid":28,"name":"市政管养_区管","type":2,"sort":28,"code":"","servicetype":"map","url":"http://61.177.139.228:9000/gateway/wuxi_chenguan/grid_road_all/MapServer","layers":"14","opacity":0.5,"userid":1,"status":1,"create_date":null,"modify_date":null},{"id":30,"pid":28,"name":"绿化_区管","type":2,"sort":29,"code":"","servicetype":"map","url":"http://61.177.139.228:9000/gateway/wuxi_chenguan/grid_road_all/MapServer","layers":"12","opacity":0.5,"userid":1,"status":1,"create_date":null,"modify_date":null},{"id":31,"pid":28,"name":"市容管理执法_区管","type":2,"sort":30,"code":"","servicetype":"map","url":"http://61.177.139.228:9000/gateway/wuxi_chenguan/grid_road_all/MapServer","layers":"13","opacity":0.5,"userid":1,"status":1,"create_date":null,"modify_date":null}]}
    this.props.loadThematicsList(data.result);
    // return axios
    //   .get("http://geowork.wicp.vip:25081/report-server/datacatalog/tree")
    //   .then(response => {
    //     this.props.loadThematicsList(response.data.result);
    //   })
    //   .catch(e => {});
  };

  render() {
    return (
      this.props.thematics.themlist.length>0?<div className="thematiclist">{this.renderList(this.props.thematics.themlist)}</div>:null
    );
  }
}

export default connect((state) => {
  return { thematics: state.thematics,query:state.query }
}, {
  loadThematicsList,showThematicLayer 
  })(List);