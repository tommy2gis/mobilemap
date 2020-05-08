import React, { Component } from "react";
import { connect } from "react-redux";
import { Card, Icon, Collapse } from "antd";
const { Panel } = Collapse;
import {
  queryThematicResponces,
  setSelectedFeature
} from "./actions.js";
import {changeDrawingStatus} from '../../actions/draw';
import {
  arcgisToGeoJSON
} from "@esri/arcgis-to-geojson-utils";


class ResultList extends Component {
  onSelectItem = item => {
    this.props.setSelectedFeature(arcgisToGeoJSON(item));
  };
  renderList = (list, titlefield) => {
    return list.map((el, index) => {
      return (
        <Panel
          extra={
            <a title="定位">
              <Icon type="environment" onClick={() => this.onSelectItem(el)} />
            </a>
          }
          header={el.attributes[titlefield]||el.attributes["Name"]||el.attributes["name"]}
          key={index}
        >
          {this.renderThematicContent(el.attributes)}
        </Panel>
      );
    });
  };
  renderThematicContent(feas) {
    let list = [];
    for (const key in feas) {
      list.push(
        <p>
          {key}: {feas[key] ? feas[key] : "空"}
        </p>
      );
    }
    return list;
  }
  render() {
    const { themresult,querygeometry} = this.props.thematics;
    if (themresult&&querygeometry) {
      return (
        <Card
          size="small"
          title={"查询列表("+themresult.features.length+"条)"}
          extra={
            <a>
              <Icon
                type="close"
                onClick={() => {
                  this.props.changeDrawingStatus("clean", "", "spatial", [], {});
                  this.props.queryThematicResponces(null, null);
                  this.props.setSelectedFeature(null);
                }}
              />
            </a>
          }
          className="spatial_result_card"
          bordered={false}
        >
          <Collapse bordered={false} defaultActiveKey={[0]}>
            {themresult.features.length>0?this.renderList(themresult.features, themresult.displayFieldName):<div className="no-data-text">
            <p>未找到相关结果。</p>
            <p>您还可以：</p>
            <ul>
              <li>检查输入是否正确或者输入其它词</li>
              <li>重新标绘</li>
            </ul>
          </div>}
          </Collapse>
        </Card>
      );
    }
    return null;
  }
}

export default connect(
  state => {
    return { thematics: state.thematics };
  },
  { queryThematicResponces, setSelectedFeature,changeDrawingStatus }
)(ResultList);
