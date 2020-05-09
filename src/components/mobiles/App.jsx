import React from "react";
const axios = require("axios");
import { connect } from "react-redux";
import { Toast, NavBar, Card } from "antd-mobile";
import {Drawer, Button} from 'antd';
import { changeMapView, mouseDownOnMap, changeModel,zoomToPoint } from "../../actions/map";
import { endDrawing } from "../../actions/draw";
import { switchLayers } from "../../actions/layers";
import { getUserLocation,setNearBy,loginout} from "../../actions/query";
import {setBeginLoc,setEndLoc} from '../../modules/Routing/actions'
import SearchBar from "../../modules/SearchBar/searchbar";
import Routing from "../../modules/Routing/routing";
import {queryThematic} from '../../modules/ThematicList/actions';
import {changeDrawingStatus} from '../../actions/draw';
import ResultList from '../../modules/ThematicList/result';
import LMap from "../map/Map";
import LLayer from "../map/Layer";
import Feature from "../map/Feature";
import DrawSupport from "../map/DrawSupport";
import ZoomControl from "../map/ZoomControl";
import { NavLink } from "react-router-dom";
import LayerSwitch from "../mobiles/LayerSwitch";
import HotSearch from '../../modules/HotSearch/hotsearch'
import MapCenterCoord from "../map/MapCenterCoord";
import { defaultGetZoomForExtent } from "../../utils/MapUtils";
import "leaflet/dist/leaflet.css";
import "./style.less";
import "../../themes/iconfont/iconfont.css";
import "antd/dist/antd.css";
import wx from "weixin-js-sdk";
import {
  geojsonToArcGIS
} from "@esri/arcgis-to-geojson-utils";
import turfbuffer from "@turf/buffer";

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      title: "app",
      open: false,
      userinfoopen:false,
      model: "layerswitch",
      hotshow:false
    };
  }

  componentDidMount() {
    const ele = document.getElementById("loading");
    ele.style.display = "none";
    this.weixin();
  }

  componentWillReceiveProps(newProps) {
    if (
      newProps.query.result &&
      newProps.query.result !== this.props.query.result
    ) {
      if (newProps.query.result) {
        let latlngs = [];
        newProps.query.result.forEach(ele => {
          latlngs.push(
            L.latLng([
              Number(ele.lonlat.split(" ")[1]),
              Number(ele.lonlat.split(" ")[0])
            ])
          );
        });
        if (latlngs.length > 0) {
          let bounds = L.latLngBounds(latlngs);
          let center = bounds.getCenter();
          let zoom = defaultGetZoomForExtent(
            bounds.toBBoxString().split(","),
            this.props.map.size,
            20
          );
          this.props.zoomToPoint({ x: center.lng, y: center.lat }, zoom - 1);
        }
      }
    }

    return false;
  }

  centerChanged=(center)=>{
    if(this.props.routing.posimodel === "起"){
      this.props.setBeginLoc("map", {
        lat: center.y,
        lng: center.x,
      })
    }else if(this.props.routing.posimodel === "终"){
      this.props.setEndLoc("map", {
        lat: center.y,
        lng: center.x,
      });
    }
  }

  weixin = () => {

    wx.getLocation({
      success: (res) => {
        this.props.getUserLocation(res);
      },
      cancel: function(res) {
        Toast.info("用户拒绝授权获取地理位置", 1);
      },
    });

    // axios
    //   .get(ServerUrl + "/wx/config", {
    //     params: {
    //       url: window.location.href.split("#")[0],
    //     },
    //   })
    //   .then((res) => {
    //     let config = res.data.data;
    //     // alert(JSON.stringify(config));
    //     // alert(JSON.stringify(window.location.href.split('#')[0]))
    //     wx.config({
    //       debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
    //       appId: config.appId, // 必填，公众号的唯一标识
    //       timestamp: config.timestamp, // 必填，生成签名的时间戳
    //       nonceStr: config.nonceStr, // 必填，生成签名的随机串
    //       signature: config.signature, // 必填，签名，见附录1
    //       jsApiList: [
    //         "chooseImage",
    //         "previewImage",
    //         "uploadImage",
    //         "downloadImage",
    //         "translateVoice",
    //         "getNetworkType",
    //         "openLocation",
    //         "getLocation",
    //         "hideOptionMenu",
    //         "showOptionMenu",
    //         "hideMenuItems",
    //         "showMenuItems",
    //         "hideAllNonBaseMenuItem",
    //         "showAllNonBaseMenuItem",
    //       ], // 必填，需要使用的JS接口列表，所有JS接口列表见附录2});
    //     });
    //     wx.ready((res) => {
    //       // alert("wx.ready")
    //       wx.getLocation({
    //         success: (res) => {
    //           this.props.getUserLocation(res);
    //         },
    //         cancel: function(res) {
    //           Toast.info("用户拒绝授权获取地理位置", 1);
    //         },
    //       });
    //     });
    //     wx.error((err) => {
    //       // alert(JSON.stringify(err))
    //       Toast.info(JSON.stringify(err), 1);
    //     });
    //   })
    //   .catch((e) => {});
  };

  /**
   *渲染图层
   *
   * @param {*} layer
   * @param {*} projection
   * @returns
   */
  renderLayerContent = (layer, projection) => {
    if (layer.features && layer.type === "vector") {
      return layer.features.map((feature) => {
        return (
          <Feature
            key={feature.properties.id}
            msId={feature.properties.id}
            type={feature.type}
            crs={projection}
            geometry={feature.geometry}
            msId={feature.properties.id}
            featuresCrs={layer.featuresCrs || "EPSG:4326"}
            // FEATURE STYLE OVERWRITE LAYER STYLE
            layerStyle={layer.style}
            style={feature.style || layer.style || null}
            properties={feature.properties}
          />
        );
      });
    }
    return null;
  };

  showLayerChangeControl = () => {
    const model =
      !this.props.map.model || this.props.map.model == "main"
        ? "layerswitch"
        : "main";
    this.props.changeModel(model);
  };

  /**
   *渲染图层
   *
   * @param {*} layers
   * @returns
   */
  renderLayers = (layers) => {
    const projection = this.props.map.projection || "EPSG:3857";
    const {themlist,selectedids}=this.props.thematics||{themlist:[],selectedids:[]};
    const selthemlist=themlist.filter(f => selectedids.includes(f.id)).map(them => {
      if(them.serviceType==='map'){
        return {"id":them.id,
        "title": them.alias,
        "url": "http://geowork.wicp.vip:25081"+them.proxy_url,
        "type": "ersidylayer",
        "name": them.alias,
        "layers":[0],
        "visibility": true,
        "opacity":0.8,
        "layerindex":"0",
        "f":"image"}
      }
    
    });
    if (layers) {
      if (layers.refreshing) {
        layers = layers.refreshing;
      }
      return layers.concat(selthemlist).map((layer) => {
          return (
            <LLayer type={layer.type} key={layer.name} options={layer}>
              {this.renderLayerContent(layer, projection)}
            </LLayer>
          );
        })
        .concat([
          <LLayer
            type="vector"
            key="location_marker"
            options={{
              name: "location_marker",
              type: "vector",
              visibility: true,
            }}
          >
            {this.renderLocationContent()}
          </LLayer>,
        ]).concat([
          <LLayer
            type="vector"
            key="query"
            options={{
              name: "query",
              type: "vector",
              visibility: true
            }}
          >
            {this.renderQueryContent()}
          </LLayer>
        ])
        .concat([
          <LLayer
            type="vector"
            key="routing"
            options={{
              name: "routing",
              type: "vector",
              visibility: true
            }}
          >
            {this.renderRoutingContent()}
          </LLayer>
        ]) .concat([
          <LLayer
            type="vector"
            key="routingposition"
            options={{
              name: "routing",
              type: "vector",
              visibility: true
            }}
          >
            {this.renderGetPosition()}
          </LLayer>
        ])
        
        ;
    }
    return null;
  };

  renderLocationContent = () => {
    const loc = this.props.query.curloc;
    if (loc) {
      let style = {
        color: "#eee",
        weight: 4,
        opacity: 0.8,
        fill: true,
        fillColor: "#fd8e2c",
        fillOpacity: 1,
      };
      let fea = {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [loc.longitude, loc.latitude],
        },
        properties: {},
      };
      return (
        <Feature
          key="userloc"
          type={fea.type}
          crs={this.props.map.projection}
          geometry={fea.geometry}
          featuresCrs={"EPSG:4326"}
          style={style}
          zoomTo={true}
          properties={fea.properties}
        />
      );
    }
    return null;
  };

  /**
   *渲染查询结果
   *
   * @returns
   */
  renderQueryContent = () => {
    if (this.props.query.result) {
      return this.props.query.result.map((item, index) => {
        return this.createMarker(
          [
            Number(item.lonlat.split(" ")[0]),
            Number(item.lonlat.split(" ")[1])
          ],
          {
            style: {
              iconGlyph: "number",
              iconColor:
                this.props.query.hoverid == item.hotPointID
                  ? "cyan"
                  : "orange-dark",
              number: index + 1
            },
            key: item.hotPointID,
            rtitle: item.name,
            highlight:
              this.props.query.clickid == item.hotPointID ? true : false,
            onRoute: geometry => {
              this.props.resetQuery();
              this.props.setEndLoc("map", {
                lat: geometry.coordinates[1],
                lng: geometry.coordinates[0]
              });
            },
            onNearBy: (point,bounds, title) => {
              this.props.resetQuery();
              this.props.setNearBy(point,bounds, title);
            },
            zIndexOffset: this.props.query.hoverid == item.hotPointID ? 100 : 0
          }
        );
      });
    }
    return null;
  };

  renderGetPosition=()=>{
    const {map,routing} = this.props;
    if(!routing.posimodel){
      return null
    }
    
    return this.createMarker(
      [map.center.x, map.center.y],
      {
        style: {
          iconGlyph: "number",
          iconColor: "green-light",
          number: routing.posimodel
        },
        key: "getbegin"
      }
    )
  }

  /**
   *渲染路径起点 终点 途经点
   *
   * @returns
   */
  renderRoutingContent = () => {
    let routlayers = [];

    ["beginloc", "midloc", "endloc", "result", "jsonresult"].forEach(key => {
      if (key == "beginloc" && this.props.routing.beginloc) {
        routlayers.push(
          this.createMarker(
            [this.props.routing.beginloc.lng, this.props.routing.beginloc.lat],
            {
              style: {
                iconGlyph: "number",
                iconColor: "green-light",
                number: "起"
              },
              key: "begin"
            }
          )
        );
      } else if (key == "midloc" && this.props.routing.midlocs) {
        this.props.routing.midlocs.forEach((ele, index) => {
          routlayers.push(
            this.createMarker([ele.latlng.lng, ele.latlng.lat], {
              key: "mid" + index,
              style: { iconGlyph: "number", iconColor: "yellow", number: "途" }
            })
          );
        });
      } else if (key == "endloc" && this.props.routing.endloc) {
        routlayers.push(
          this.createMarker(
            [this.props.routing.endloc.lng, this.props.routing.endloc.lat],
            {
              key: "end",
              style: {
                iconGlyph: "number",
                iconColor: "orange-dark",
                number: "终"
              }
            }
          )
        );
      } else if (key == "jsonresult" && this.props.routing.jsonresult) {
        routlayers.push(this.createRoutingLine(this.props.routing.jsonresult));
      } else if (
        key == "result" &&
        this.props.routing.busline &&
        this.props.routing.result.results
      ) {
        routlayers.push(this.createBusLine(this.props.routing.result.results));
        routlayers.push(
          this.createBusStation(this.props.routing.result.results)
        );
      }
    });

    return routlayers;
  };

  /**
   *创建公交路径线
   *
   * @param {*} datas
   * @returns
   */
  createBusLine = datas => {
    let lines = datas[0].lines[this.props.routing.busline].segments;
    let i = 0;
    return lines.map(ele => {
      i++;
      let line = ele.segmentLine[0];
      let points = line.linePoint.split(";");
      let lnglats = [];
      let style = null;
      points.forEach(point => {
        if (point.indexOf(",") != -1) {
          var lnglat = point.split(",");
          lnglats.push([Number(lnglat[0]), Number(lnglat[1])]);
        }
      });

      switch (ele.segmentType) {
        case 1:
          style = {
            radius: 5,
            color: "#BA92F1",
            dashArray: "4",
            weight: 4,
            opacity: 0.8
          };
          break;
        case 2:
          style = {
            radius: 5,
            color: "#2196f3",
            weight: 8,
            opacity: 0.8
          };
          break;
        case 3:
          style = {
            radius: 5,
            color: "#2196f3",
            weight: 8,
            opacity: 0.8
          };
          break;
        default:
          style = {
            radius: 5,
            color: "#2196f3",
            weight: 8,
            opacity: 0.8
          };
          break;
      }
      let fea = {
        type: "Feature",
        properties: {},
        geometry: {
          type: "LineString",
          coordinates: lnglats
        },
        style: style
      };
      return (
        <Feature
          key={"busrouting" + i}
          type={fea.type}
          crs={this.props.map.projection}
          geometry={fea.geometry}
          featuresCrs={"EPSG:4326"}
          style={fea.style || this.props.style || null}
          properties={fea.properties}
        />
      );
    });
  };

  /**
   *创建公交点要素
   *
   * @param {*} datas
   * @returns
   */
  createBusStation = datas => {
    let lines = datas[0].lines[this.props.routing.busline].segments;
    let i = 0;
    return lines.map(ele => {
      i++;
      let latlon = ele.stationEnd.lonlat.split(",");
      let latlon2 = ele.stationStart.lonlat.split(",");
      if (ele.segmentType != 1) {
        return [
          this.createMarker([Number(latlon[0]), Number(latlon[1])], {
            style: {
              iconGlyph: " icon-luxian1",
              iconColor: "cyan",
              iconPrefix: "iconfont"
            }
          }),
          this.createMarker([Number(latlon2[0]), Number(latlon2[1])], {
            style: {
              iconGlyph: " icon-luxian1",
              iconColor: "cyan",
              iconPrefix: "iconfont"
            }
          })
        ];
      }
    });
  };

  /**
   *创建路径线
   *
   * @param {*} data
   * @returns
   */
  createRoutingLine = fea => {
    return (
      <Feature
        key="routingall"
        type={fea.type}
        crs={this.props.map.projection}
        geometry={fea.geometry}
        featuresCrs={"EPSG:4326"}
        style={fea.style || this.props.style || null}
        properties={fea.properties}
      />
    );
  };


  /**
   *创建要素
   *
   * @param {*} location
   * @param {*} option
   * @returns
   */
  createMarker = (location, option) => {
    let fea = {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: location
      },
      properties: { styleName: option.styleName || "marker" }
    };
    return (
      <Feature
        key={option.key}
        type={fea.type}
        crs={this.props.map.projection}
        geometry={fea.geometry}
        featuresCrs={"EPSG:4326"}
        styleName={fea.properties.styleName}
        style={option.style}
        rtitle={option.rtitle}
        highlight={option.highlight}
        title={option.title}
        onRoute={option.onRoute}
        onNearBy={option.onNearBy}
        zIndexOffset={option.zIndexOffset || 0}
        properties={fea.properties}
      />
    );
  };

  renderHeadLeft = (model) => {
    const userinfo = this.props.query.userinfo;
    switch (model) {
      case "main":
      case "layerswitch":
        return (
          <div>
            <NavLink to="/login" className="login-btn" replace />
            <span style={{ marginLeft: 40 }}>
              {/* {userinfo ? userinfo.realName : "点击登录"} */}
            </span>
          </div>
        );
        break;
      case "routing":
        return (
          <div>
            <a className="back-main" />
          </div>
        );
        break;
      case "taskdetail":
        return (
          <div>
            <a className="back-main" />
          </div>
        );
        break;
      case "dataedit":
        return (
          <div>
            <a className="back-main" />
          </div>
        );
        break;

      default:
        break;
    }
  };
  getLocation = (e) => {
    wx.getLocation({
      success: (res) => {
        this.props.getUserLocation(res);
      },
      cancel: function(res) {
        Toast.info("用户拒绝授权获取地理位置", 1);
      },
    });
  };
  showRoutingPanel = () => {
    this.props.changeModel("routing");
  };

  drawSpatial=(type)=>{
    switch (type) {
      case "point":
        this.props.changeDrawingStatus(
          "start",
          "CircleMarker",
          "spatial",
          [],
          {},
          {
           iconGlyph: 'jiucuoguanli',
           iconColor: 'cyan',
           iconPrefix: 'icon'
       }
        );
        break;
      case "polyline":
        this.props.changeDrawingStatus(
          "start",
          "Line",
          "spatial",
          [],
          {}
        );
        break;
      case "polygon":
        this.props.changeDrawingStatus(
          "start",
          "Polygon",
          "spatial",
          [],
          {}
        );
        break;
        
      default:
        break;
    }
  }

  onEndDrawing=(geometry, drawOwner)=>{
    this.props.endDrawing(geometry, drawOwner);
    const {drawMethod}=this.props.draw;
    if (drawOwner === "spatial") {
      
      geometry=drawMethod === "Polygon"
      ?geometry:turfbuffer(geometry, 0.005, { units: "kilometers" });
      const arcgisgeo = geojsonToArcGIS(geometry);
      const {selectedids} = this.props.thematics;

      if (selectedids.length > 0) {
        switch (drawMethod) {
          case "Polygon":
            this.props.queryThematic(
              selectedids[0],
              JSON.stringify(arcgisgeo),
              "esriGeometryPolygon"
            );
            break;
          case "Line":
          case "CircleMarker":
            this.props.queryThematic(
              selectedids[0],
              JSON.stringify(arcgisgeo.geometry),
              "esriGeometryPolygon"
            );
            break;
          default:
            break;
        }
      }
    } 
  }

  bufferQuery=()=>{
    this.setState({hotshow:true})
    const {tdtserverurl,tdttk}=this.props.mapConfig;
    return axios.get(tdtserverurl+"/geocoder", {
      params: {
          postStr:{'lon':120.570224137,'lat':32.3858,'ver':1},
          type: "query",
          tk: tdttk
      }
    }).then((response) => {
        let result=response.data.result;
        this.props.setNearBy("120.570224137,32.3858",null, result.formatted_address);
    }).catch((e) => {
    });
  }



  showUserinfoDrawer = () => {
    this.setState({
      userinfoopen: true,
    });
  };

  onUserinfoDrawerClose = () => {
    this.setState({
      userinfoopen: false,
    });
  };

  renderHeadRight = (model) => {
    switch (model) {
      case "main":
        return <b onClick={() => this.setState({ open: true })}>...</b>;
        break;
      case "dataedit":
        return (
          <NavLink to="/datacollect" style={{ color: "#fff" }} replace>
            完成
          </NavLink>
        );
        break;

      default:
        break;
    }
  };

  render() {
    const { mapConfig, map, draw, query } = this.props;
    const {selectedids,themresult}=this.props.thematics;
    const {result,nearbytitle,userinfo}=this.props.query;
    const model = (map && map.model) || "main";
    const taskcount = (query.tasksresult && query.tasksresult.count) || 0;
    // console.log(this.props.route, this.props.params, this.props.routeParams);
    if (mapConfig && mapConfig.map) {
      return <div className="container">
          {model === "main" || model === "layerswitch" ? <SearchBar /> : model === "routing" ? [<NavBar mode="light" onLeftClick={() => {
                  this.props.changeModel("main");
                }} leftContent={this.renderHeadLeft(model)} rightContent={this.renderHeadRight(model)}>
                线路规划
              </NavBar>, <Routing />] : null}

          <ul className="right_toolbar">
            <li className="circlebtn " onClick={this.showLayerChangeControl}>
              <i className="iconfont icon-tuceng" style={{ color: "#EFA659" }} />
            </li>
            <li className="circlebtn ">
              <NavLink to="/thematics" className="iconfont icon-zhuanti1" replace />
            </li>
            <li className="circlebtn " onClick={this.getLocation}>
              <i className="iconfont icon-dingwei" style={{ color: "#B059EF" }} />
            </li>
            <li className="circlebtn ">
              {userinfo ? (
                <i
                  className="iconfont icon-yonghu"
                  onClick={this.showUserinfoDrawer}
                  style={{ color: "#B059EF" }}
                />
              ) : (
                <NavLink
                  to="/login"
                  className="iconfont icon-yonghu"
                  replace
                />
              )}
            </li>
          </ul>

          <ul className="left_toolbar">
            <li className="circlebtn " onClick={this.bufferQuery}>
              <i className="iconfont icon-zhoubian" style={{ color: "#1890FF" }} />
            </li>
            <li className="circlebtn  " onClick={this.showRoutingPanel}>
              <i className="iconfont icon-xianlu" style={{ color: "#EFA659" }} />
            </li>
          </ul>
          {selectedids.length ? <ul className="left_spatial_toolbar">
              <li className="circlebtn  " onClick={() => this.drawSpatial("point")}>
                <i className="iconfont icon-dian" />
              </li>
              <li className="circlebtn  " onClick={() => this.drawSpatial("polyline")}>
                <i className="iconfont icon-polyline" />
              </li>
              <li className="circlebtn  " onClick={() => this.drawSpatial("polygon")}>
                <i className="iconfont icon-polygon" />
              </li>
            </ul> : null}

          <div className={"clientmap " + (model === "layerswitch" ? " bottommodel" : result ? "searchmodel" : model === "routing" ? "headmodel" : "")}>
            <LMap id="map" ref="map" contextmenu={false} zoom={map.zoom} center={map.center} centerChanged={this.centerChanged} onMapViewChanges={this.props.onMapViewChanges} onMouseDown={this.handleMouseDown} projection={map.projection}>
              {this.renderLayers(mapConfig.layers)}
              {model == "dataedit" && <MapCenterCoord />}
              <ZoomControl />
              <DrawSupport drawStatus={draw.drawStatus} drawOwner={draw.drawOwner} drawMethod={draw.drawMethod} style={draw.style} onEndDrawing={this.onEndDrawing} features={draw.features} />
            </LMap>
          </div>

          {!result && nearbytitle && <HotSearch />}

          {userinfo && <Drawer title={userinfo.displayname} placement="left" className="userinfoDraw" onClose={this.onUserinfoDrawerClose} visible={this.state.userinfoopen}>
              <Button onClick={this.props.loginout}>登出</Button>
            </Drawer>}

          <div className="bottom-container">
            {model == "layerswitch" && <LayerSwitch />}
          </div>
          {themresult && <ResultList />}
        </div>;
    }
    return null;
  }
}

require("../map/WMTSLayer");
require("../map/ARCGISLayer");
require("../map/VectorLayer");

export default connect(
  (state) => {
    return {
      mapConfig: state.mapConfig,
      map: state.map || (state.mapConfig && state.mapConfig.map),
      mapStateSource: state.map && state.map.mapStateSource,
      layers: state.layers,
      query: state.query,
      arealocation: state.arealocation,
      routing: state.routing,
      draw: state.draw,
      thematics:state.thematics,
      sidebar: state.sidebar,
      toolbar: state.toolbar,
    };
  },
  {
    onMapViewChanges: changeMapView,
    onSwitchLayer: switchLayers,
    endDrawing,
    mouseDownOnMap,
    changeModel,
    zoomToPoint,
    setBeginLoc,
    setEndLoc,
    loginout,
    getUserLocation,
    queryThematic,
    setNearBy,
    changeDrawingStatus
  }
)(App);
