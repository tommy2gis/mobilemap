/*
 * @Author: 史涛 
 * @Date: 2019-01-05 19:29:27 
 * @Last Modified by: 史涛
 * @Last Modified time: 2020-05-07 15:19:24
 */
const ROUTING_RESULT = 'ROUTING_RESULT';
const RESET_ROUTING = 'RESET_ROUTING';
const ROUTING_LOADING = 'ROUTING_LOADING';
const ADD_BEGINLOC = 'ADD_BEGINLOC';
const ADD_BEGINADDRESS = 'ADD_BEGINADDRESS';
const ADD_MIDLOC = 'ADD_MIDLOC';
const ADD_ENDLOC = 'ADD_ENDLOC';
const ADD_ENDADDRESS = 'ADD_ENDADDRESS';
const CHANGE_STYLE = 'CHANGE_STYLE';
const CHNAGE_MODULE = 'CHNAGE_MODULE';
const CHNAGE_POSI_MODULE = 'CHNAGE_POSI_MODULE';
const CHANGE_BUSSTYLE = 'CHANGE_BUSSTYLE';
const CHNAGE_BUSLINE = 'CHNAGE_BUSLINE';
const DELETE_MIDLOC = 'DELETE_MIDLOC';
const ROUTING_POIRESULT = 'ROUTING_POIRESULT';
const ROUTING_BEGIONPOIRESULT='ROUTING_BEGIONPOIRESULT';
const ROUTING_ENDPOIRESULT='ROUTING_ENDPOIRESULT';
const ROUTING_GEOCODERESULT = 'ROUTING_GEOCODERESULT';
const CLEAR_MIDLOCS = 'CLEAR_MIDLOCS';
import { message } from 'antd';

message.config({
    maxCount: 1,
});
const axios = require('axios');
var CancelToken = axios.CancelToken;
var cancel;


function queryRoutingResponse(result,jsonfea) {
    
    return {
        type: ROUTING_RESULT,
        result,
        jsonfea
    };
}



function poiQueryResponse(poiresult) {
    return {
        type: ROUTING_POIRESULT,
        poiresult
    };
}

function begionPoiQueryResponse(poiresult) {
    return {
        type: ROUTING_BEGIONPOIRESULT,
        poiresult
    };
}

function endPoiQueryResponse(poiresult) {
    return {
        type: ROUTING_ENDPOIRESULT,
        poiresult
    };
}


function geoCodeQueryResponse(geocoderesult) {
    return {
        type: ROUTING_GEOCODERESULT,
        geocoderesult
    };
}

/**
 *
 *
 * @param {*} point
 * @param {*} model
 * @returns
 */
function geoCodeQuery(lat,lng,model) {

    return (dispatch, getState) => {
        const mapConfig = getState().mapConfig;
        return axios.get(mapConfig.tdtserverurl+"/geocoder", {
            params: {
                postStr:{'lon':lng,'lat':lat,'ver':1},
                type: "query",
                tk: mapConfig.tdttk
            }
        }).then((response) => {
            let result=response.data.result;
            dispatch(geoCodeQueryResponse(result));
            if (result) {
                switch (model) {
                    case 'begin':
                        dispatch(setBeginAddress(result.addressComponent.poi+'('+result.addressComponent.address+')附近','poi'))
                        break;
                    case 'end':
                        dispatch(setEndAddress(result.addressComponent.poi+'('+result.addressComponent.address +')附近','poi'))
                        break;
                    default:
                        break;
                }
                message.destroy()
            }

        }).catch((e) => {
            // dispatch(queryError(e));
        });
    };
}



/**
 *poi查询
 *
 * @param {*} key
 * @param {*} model
 * @returns
 */
function poiQuery(key, model) {

    return (dispatch, getState) => {
        const mapConfig = getState().mapConfig;
        const routing=getState().routing;
        const map = getState().map;
        if (cancel != undefined) {
            //取消上一次请求
            cancel();
        }
        return axios.get(mapConfig.tdtserverurl+"/search", {
            cancelToken: new CancelToken(function executor(c) {
                cancel = c;
            }),
            params: {
                postStr:{keyWord: key,
                mapBound:[map.bbox.bounds.maxx,map.bbox.bounds.maxy,map.bbox.bounds.minx,map.bbox.bounds.miny].join(","),
                level: 11,
                queryType: 1,
                count: 6,
                start: 1},
                type: "query",
                tk: mapConfig.tdttk
              }
        }).then((response) => {
            switch (model) {
                case 'car-begin':
                case 'bus-begin':
                if(routing.begintype==='custom'){
                    dispatch(begionPoiQueryResponse(response.data.pois));
                }
                
                    break;
                case 'car-end':
                case 'bus-end':
                if(routing.endtype==='custom'){
                    dispatch(endPoiQueryResponse(response.data.pois));
                }
                
                    break;
                default:
                    break;
            }

            dispatch(poiQueryResponse(response.data.result));
            if (response.data.result.count === 0) {

                message.warning('未查询到相应地点,请右击地图设定位置');
                switch (model) {
                    case 'car-begin':
                    case 'bus-begin':
                        dispatch(setBeginLoc(null, null))
                        break;
                    case 'car-end':
                    case 'bus-end':
                        dispatch(setEndLoc(null, null))
                        break;
                    default:
                        break;
                }
            } else {

                message.destroy()
            }

        }).catch((e) => {
            // dispatch(queryError(e));
        });
    };
}



/**
 *
 *
 * @returns
 */
function loadRouting() {
    return (dispatch, getState) => {

        const state = getState().routing;
        const mapConfig = getState().mapConfig;
        if (state.beginloc && state.endloc && mapConfig.tdtserverurl) {
            let orig = state.beginloc.lng + ',' + state.beginloc.lat;
            let dest = state.endloc.lng + ',' + state.endloc.lat;
            let style = state.style;
            let busstyle = state.busstyle;
            let moduletype = state.moduletype;
            let midlocs = state.midlocs.map(loc => {
                return loc.latlng.lng + ',' + loc.latlng.lat
            });
            let url = '';
            if (moduletype === 'routing-car') {
                url = mapConfig.tdtserverurl + '/drive?postStr={"orig":"' + orig + '","dest":"' + dest + '","style":' + style + ',"mid":"' + midlocs.join(';') + '"}&type=search&tk=56e2ef8967b3a0dbb746b7a40b7faa94';
            } else {
                url = mapConfig.tdtserverurl + '/transit?postStr={"startposition":"' + orig + '","endposition":"' + dest + '","linetype":' + busstyle + ',"' + midlocs.join(';') + '":""}&type=busline&tk=56e2ef8967b3a0dbb746b7a40b7faa94';
            }

            dispatch(routingLoading(true));
            if (cancel != undefined) {
                //取消上一次请求
                cancel();
            }

            return axios.get(url,
                {
                    cancelToken: new CancelToken(function executor(c) {
                        cancel = c;
                    })
                }).then((response) => {
                    dispatch(routingLoading(false));
                    let jsonfea;
                    let result;
                    if(moduletype === 'routing-car'){
                        result=parseXmlToObj(response.data);
                        let points = result.routelatlon.split(";");
                        let lnglats = [];
                        points.forEach(point => {
                            if (point.indexOf(",") != -1) {
                            var lnglat = point.split(",");
                            lnglats.push([Number(lnglat[0]), Number(lnglat[1])]);
                            }
                        });
    
                        jsonfea = {
                            type: "Feature",
                            properties: {},
                            geometry: {
                            type: "LineString",
                            coordinates: lnglats
                            },
                            style: {
                            radius: 5,
                            color: "#2196f3",
                            weight: 8,
                            opacity: 0.8
                            }
                        };
                    }else{
                        jsonfea={
                            "type": "FeatureCollection",
                            "features": []
                          }
                        result=response.data;
                        let lines = response.data.results[0].lines[state.busline].segments;
                        let i = 0;
                         lines.forEach(ele => {
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
                          jsonfea.features.push({
                            type: "Feature",
                            properties: {},
                            geometry: {
                              type: "LineString",
                              coordinates: lnglats
                            },
                            style: style
                          });
                    })
                    }

                    dispatch(queryRoutingResponse(result,jsonfea));

                    

                }).catch((e) => {
                   // message.warning('数据查询失败,请稍后再试');
                    dispatch(routingLoading(false));
                });
        }



    };
}

/**
         * [ 解析xml ]
         * @param  {[type]} result [description]
         * @param  {[type]} style  [description]
         * @return {[type]}        [description]
         */
        function parseXmlToObj(result, style) {
            //转化为dom对象解析此xml，转为为json对象。 
            var xmlDoc = loadXML(result);
            var distance = xmlDoc.getElementsByTagName("distance")[0].firstChild.nodeValue;
            var duration = xmlDoc.getElementsByTagName("duration")[0].firstChild.nodeValue;
            var routelatlon;
            if (document.all) {
                routelatlon = xmlDoc.getElementsByTagName("routelatlon")[0].firstChild.nodeValue;
            } else {
                routelatlon = xmlDoc.getElementsByTagName("routelatlon")[0].textContent;
            }
            var parameters = xmlDoc.getElementsByTagName("parameters")[0];
            var start = parameters.getElementsByTagName("orig")[0].firstChild.nodeValue;
            var dest = parameters.getElementsByTagName("dest")[0].firstChild.nodeValue;
            var mid = "";
            if (parameters.getElementsByTagName("mid")[0] && parameters.getElementsByTagName("mid")[0].firstChild) {
                mid = parameters.getElementsByTagName("mid")[0].firstChild.nodeValue;
            }
            var sty = parameters.getElementsByTagName("style")[0].firstChild.nodeValue;

            var routes = xmlDoc.getElementsByTagName("routes")[0];
            var items = routes.getElementsByTagName("item");
            var itemsLength = items.length;
            var strguide, signage = "",
                streetName = "",
                nextStreetName = "",
                turnlatlon = "";
            var routesArr = [];
            for (var i = 0; i < itemsLength; i++) {
                strguide = items[i].getElementsByTagName("strguide")[0].firstChild.nodeValue;
                if (items[i].getElementsByTagName("signage")[0].firstChild) {
                    signage = items[i].getElementsByTagName("signage")[0].firstChild.nodeValue;
                }
                if (items[i].getElementsByTagName("streetName")[0].firstChild) {
                    streetName = items[i].getElementsByTagName("streetName")[0].firstChild.nodeValue;
                }
                if (items[i].getElementsByTagName("nextStreetName")[0].firstChild) {
                    nextStreetName = items[i].getElementsByTagName("nextStreetName")[0].firstChild.nodeValue;
                }
                if (items[i].getElementsByTagName("turnlatlon")[0].firstChild) {
                    turnlatlon = items[i].getElementsByTagName("turnlatlon")[0].firstChild.nodeValue;
                }
                var routesObj = {
                    strguide: strguide,
                    signage: signage,
                    streetName: streetName,
                    nextStreetName: nextStreetName,
                    turnlatlon: turnlatlon
                }
                routesArr.push(routesObj);
            }

            var simple = xmlDoc.getElementsByTagName("simple")[0];
            var sim_items = simple.getElementsByTagName("item");
            var sim_itemsLength = sim_items.length;
            var sim_strguide, streetNames = "",
                lastStreetName = "",
                linkStreetName = "",
                sim_turnlatlon = "",
                streetLatLon = "",
                streetDistance = "",
                segmentNumber = "";
            var simpleArr = [];
            for (var i = 0; i < sim_itemsLength; i++) {
                sim_strguide = sim_items[i].getElementsByTagName("strguide")[0].firstChild.nodeValue;
                if (sim_items[i].getElementsByTagName("streetNames")[0].firstChild) {
                    streetNames = sim_items[i].getElementsByTagName("streetNames")[0].firstChild.nodeValue;
                }
                if (sim_items[i].getElementsByTagName("lastStreetName")[0].firstChild) {
                    lastStreetName = sim_items[i].getElementsByTagName("lastStreetName")[0].firstChild.nodeValue;
                }
                if (sim_items[i].getElementsByTagName("linkStreetName")[0].firstChild) {
                    linkStreetName = sim_items[i].getElementsByTagName("linkStreetName")[0].firstChild.nodeValue;
                }
                if (sim_items[i].getElementsByTagName("turnlatlon")[0].firstChild) {
                    sim_turnlatlon = sim_items[i].getElementsByTagName("turnlatlon")[0].firstChild.nodeValue;
                }
                if (sim_items[i].getElementsByTagName("streetLatLon")[0].firstChild) {
                    streetLatLon = sim_items[i].getElementsByTagName("streetLatLon")[0].firstChild.nodeValue;
                }
                if (sim_items[i].getElementsByTagName("streetDistance")[0].firstChild) {
                    streetDistance = sim_items[i].getElementsByTagName("streetDistance")[0].firstChild.nodeValue;
                }
                if (sim_items[i].getElementsByTagName("segmentNumber")[0].firstChild) {
                    segmentNumber = sim_items[i].getElementsByTagName("segmentNumber")[0].firstChild.nodeValue;
                }
                var simpleObj = {
                    strguide: sim_strguide,
                    streetNames: streetNames,
                    lastStreetName: lastStreetName,
                    linkStreetName: linkStreetName,
                    turnlatlon: sim_turnlatlon,
                    streetLatLon: streetLatLon,
                    streetDistance: streetDistance,
                    streetDistance: streetDistance,
                    segmentNumber: segmentNumber
                }
                simpleArr.push(simpleObj);
            }
            var obj = {
                distance: distance,
                duration: duration,
                routelatlon: routelatlon,
                parameters: {
                    start: start,
                    dest: dest,
                    mid: mid,
                    style: style
                },
                routes: routesArr,
                simple: simpleArr
            }
            return obj;
        }

        function loadXML(xmlString) {
            var xmlDoc = null;
            //判断浏览器的类型
            //支持IE浏览器 
            if (!window.DOMParser && window.ActiveXObject) { //window.DOMParser 判断是否是非ie浏览器
                var xmlDomVersions = ['MSXML.2.DOMDocument.6.0', 'MSXML.2.DOMDocument.3.0', 'Microsoft.XMLDOM'];
                for (var i = 0; i < xmlDomVersions.length; i++) {
                    try {
                        xmlDoc = new ActiveXObject(xmlDomVersions[i]);
                        xmlDoc.async = false;
                        xmlDoc.loadXML(xmlString); //loadXML方法载入xml字符串
                        break;
                    } catch (e) {}
                }
            }
            //支持Mozilla浏览器
            else if (window.DOMParser && document.implementation && document.implementation.createDocument) {
                try {
                    /* DOMParser 对象解析 XML 文本并返回一个 XML Document 对象。
                     * 要使用 DOMParser，使用不带参数的构造函数来实例化它，然后调用其 parseFromString() 方法
                     * parseFromString(text, contentType) 参数text:要解析的 XML 标记 参数contentType文本的内容类型
                     * 可能是 "text/xml" 、"application/xml" 或 "application/xhtml+xml" 中的一个。注意，不支持 "text/html"。
                     */
                    var domParser = new DOMParser();
                    xmlDoc = domParser.parseFromString(xmlString, "text/xml");
                } catch (e) {}
            } else {
                return null;
            }

            return xmlDoc;
        }

function switchOrigDest() {
    return (dispatch, getState) => {

        const state = getState().routing;
        let latlng = state.endloc;

        dispatch({
            type: ADD_BEGINLOC,
            latlng
        });
        latlng = state.beginloc;
        dispatch({
            type: ADD_ENDLOC,
            latlng
        });
        dispatch(loadRouting());
    };
}

function changeModule(moduletype) {

    return (dispatch) => {
        if (moduletype === 'routing-bus') {
            dispatch(clearMidLocs());
        }
        dispatch({
            type: CHNAGE_MODULE,
            moduletype
        });
        dispatch(loadRouting());
    }


}

function changeGetPosiModel(posimodel) {
    
    return {
        type: CHNAGE_POSI_MODULE,
        posimodel
    }
}

function selectBusLine(busline) {
    return {
        type: CHNAGE_BUSLINE,
        busline
    }
}

function setBeginAddress(address,settype) {

    return {
        type: ADD_BEGINADDRESS,
        address,
        settype
    }
}

function setEndAddress(address,settype) {

    return {
        type: ADD_ENDADDRESS,
        address,
        settype
    }
}

function setBeginLoc(model, latlng) {

    return (dispatch) => {
        dispatch({
            type: ADD_BEGINLOC,
            latlng
        });
        if (model === 'map') {
            dispatch(geoCodeQuery(latlng.lat,latlng.lng, 'begin'))
        }
        // dispatch(loadRouting());
    }
}

function setMidLoc(model, latlng) {
    return (dispatch, getState) => {
        const state = getState().routing;

        if (state.moduletype === 'routing-car') {
            dispatch({
                type: ADD_MIDLOC,
                latlng
            });
            if (model === 'map') {
                dispatch(geoCodeQuery(latlng.lat,latlng.lng, 'mid'))
            }
            // dispatch(loadRouting());
        } else {

            message.warning('公交规划暂不支持添加途径点');
        }

    }
}

function deleteMidLoc(id) {
    return (dispatch) => {
        dispatch({
            type: DELETE_MIDLOC,
            id
        });
        dispatch(loadRouting());
    }
}

function clearMidLocs() {
    return (dispatch) => {
        dispatch({
            type: CLEAR_MIDLOCS,
        });
    }
}



function setEndLoc(model, latlng) {
    return (dispatch) => {
        dispatch({
            type: ADD_ENDLOC,
            latlng
        });
        if (model === 'map') {
            dispatch(geoCodeQuery(latlng.lat,latlng.lng, 'end'))
        }
        // dispatch(geoCodeQuery(latlng.lat+','+latlng.lng,'end'))
       // dispatch(showSidebar(true, '2'));
       // dispatch(loadRouting());
    }
}

function changeRoutingStyle(style) {

    return (dispatch) => {
        dispatch({
            type: CHANGE_STYLE,
            style
        });
        dispatch(loadRouting());
    }
}

function changeBusRoutingStyle(busstyle) {
    return (dispatch) => {
        dispatch({
            type: CHANGE_BUSSTYLE,
            busstyle
        });
        dispatch(loadRouting());
        dispatch(selectBusLine('0'));
    }
}




function routingLoading(isLoading) {
    return {
        type: ROUTING_LOADING,
        isLoading
    };
}



function resetRouting() {
    return {
        type: RESET_ROUTING
    };
}

module.exports = {
    ROUTING_RESULT,
    ROUTING_POIRESULT,
    ROUTING_BEGIONPOIRESULT,
    geoCodeQuery,
    ROUTING_ENDPOIRESULT,
    ADD_BEGINLOC,
    ADD_BEGINADDRESS,
    ADD_ENDADDRESS,
    ADD_MIDLOC,
    ADD_ENDLOC,
    DELETE_MIDLOC,
    CLEAR_MIDLOCS,
    changeGetPosiModel,
    CHNAGE_POSI_MODULE,
    ROUTING_LOADING,
    RESET_ROUTING,
    deleteMidLoc,
    CHNAGE_BUSLINE,
    selectBusLine,
    CHNAGE_MODULE,
    CHANGE_STYLE,
    CHANGE_BUSSTYLE,
    changeModule,
    changeRoutingStyle,
    changeBusRoutingStyle,
    switchOrigDest,
    loadRouting,
    setBeginLoc,
    setBeginAddress,
    setEndAddress,
    routingLoading,
    resetRouting,
    clearMidLocs,
    setMidLoc,
    poiQuery,
    setEndLoc
};