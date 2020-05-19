/*
 * @Author: 史涛
 * @Date: 2019-01-05 19:33:32
 * @Last Modified by: 史涛
 * @Last Modified time: 2020-05-14 14:33:14
 */

const FEATURE_TYPE_LOADED = "FEATURE_TYPE_LOADED";
const FEATURE_LOADED = "FEATURE_LOADED";
const FEATURE_TYPE_ERROR = "FEATURE_TYPE_ERROR";
const FEATURE_ERROR = "FEATURE_ERROR";
const QUERY_RESULT = "QUERY_RESULT";
const QUERYALL_RESULT = "QUERYALL_RESULT";
const QUERY_ERROR = "QUERY_ERROR";
const QUERY_ONFOCUS = "QUERY_ONFOCUS";
const RESET_QUERY = "RESET_QUERY";
const CHANGE_QUERYPAGEINDEX = "CHANGE_QUERYPAGEINDEX";
const HOVER_RESULTINDEX = "HOVER_RESULTINDEX";
const CLICK_RESULTINDEX = "CLICK_RESULTINDEX";
const CHANGE_QUERYKEY = "CHANGE_QUERYKEY";
const CHANGE_QUERYAREAKEY = "CHANGE_QUERYAREAKEY";
const QUERY_SIMPLERESULT = "QUERY_SIMPLERESULT";
const COLLAPSE_RESULT = "COLLAPSE_RESULT";
const CURRENT_RESPONSE_TIME = "CURRENT_RESPONSE_TIME";
const QUERY_PROMPTRESULT = "QUERY_PROMPTRESULT";
const NEARBY_LOCINFO = "NEARBY_LOCINFO";
const LOGIN = "LOGIN";
const GET_USERLOCATION='GET_USERLOCATION';
const axios = require("axios");
import md5 from "js-md5";
import qs from 'qs';
import { message } from "antd";
let CancelToken = axios.CancelToken;
let cancel;

var assign = require("object-assign");

function loginResponse(userinfo) {
  return {
    type: LOGIN,
    userinfo,
  };
}

function login(userName, passWord) {
  return (dispatch, getState) => {
    return axios.post("https://www.geospark.cn/gateway/core/system/login",
        qs.stringify({ userName: userName,
            password: md5(passWord),
          })
        ,
        { headers: { "content-type": "application/x-www-form-urlencoded" } }
      )
      .then((response) => {
        if (response.data.code != 0) {
          dispatch(loginResponse(response.data.result.userinfo));
          return response.data.result;
        } else {
          //message.warning('提交数据失败,请稍后再试');
        }
      })
      .catch((e) => {
        //message.warning('提交数据失败,请稍后再试');
      });
  };
}

function loginout() {
    return (dispatch, getState) => {
      const userinfo = getState().query.userinfo;
      return axios.post(
          ServerUrl + "/core/system/logout",
          qs.stringify({ token: userinfo&&userinfo.geokey
            })
          ,
          { headers: { "content-type": "application/x-www-form-urlencoded" } }
        )
        .then((response) => {
          if (response.data.code != 0) {
            dispatch(loginResponse(null));
          }
        })
        .catch((e) => {
          //message.warning('提交数据失败,请稍后再试');
        });
    };
  }



function featureTypeLoaded(typeName, featureType) {
  return {
    type: FEATURE_TYPE_LOADED,
    typeName,
    featureType,
  };
}



function getUserLocation(loc) {
  return {
      type: GET_USERLOCATION,
      loc
  };
}

function setNearBy(point, extend, title) {
  return {
    type: NEARBY_LOCINFO,
    nearbyextend: extend,
    nearbypoint: point,
    nearbytitle: title,
  };
}

function currentResponseTime(time) {
  return {
    type: CURRENT_RESPONSE_TIME,
    time,
  };
}

function featureTypeError(typeName, error) {
  return {
    type: FEATURE_TYPE_ERROR,
    typeName,
    error,
  };
}

function featureLoaded(typeName, feature) {
  return {
    type: FEATURE_LOADED,
    typeName,
    feature,
  };
}

function featureError(typeName, error) {
  return {
    type: FEATURE_ERROR,
    typeName,
    error,
  };
}

function querySearchResponse(result, count) {
  return {
    type: QUERY_RESULT,
    result,
    count,
  };
}

function queryPrompt(result) {
  return {
    type: QUERY_PROMPTRESULT,
    result,
  };
}

function querySearchAllResponse(result) {
  return {
    type: QUERYALL_RESULT,
    result,
  };
}

function simpleQuerySearchResponse(simpleresult) {
  return {
    type: QUERY_SIMPLERESULT,
    simpleresult,
  };
}

function changeQueryPageIndex(pageindex) {
  return (dispatch, getState) => {
    const querypramas = getState().query;
    dispatch({
      type: CHANGE_QUERYPAGEINDEX,
      pageindex,
    });
    if (querypramas.type === "name") {
      dispatch(query());
    } else {
      dispatch(onHotQuery());
    }
  };
}

function onHoverResult(hoverid) {
  return (dispatch) => {
    dispatch({
      type: HOVER_RESULTINDEX,
      hoverid,
    });
  };
}

function onClickResult(clickid) {
  return (dispatch) => {
    dispatch({
      type: CLICK_RESULTINDEX,
      clickid,
    });
    // axios.get(ServerUrl + '/gateway/map/hotCount/heat?id='+clickid).then((response) => {
    //     console.info(response);
    // }).catch((e) => {
    //  console.info(e);
    // });
  };
}

function queryError(error) {
  return {
    type: QUERY_ERROR,
    error,
  };
}

function describeFeatureType(baseUrl, typeName) {
  return (dispatch) => {
    return axios
      .get(
        baseUrl +
          "?service=WFS&version=1.1.0&request=DescribeFeatureType&typeName=" +
          typeName +
          "&outputFormat=application/json"
      )
      .then((response) => {
        if (typeof response.data === "object") {
          dispatch(featureTypeLoaded(typeName, response.data));
        } else {
          try {
            JSON.parse(response.data);
          } catch (e) {
            dispatch(
              featureTypeError(typeName, "Error from WFS: " + e.message)
            );
          }
        }
      })
      .catch((e) => {
        dispatch(featureTypeError(typeName, e));
      });
  };
}

function loadFeature(baseUrl, typeName) {
  return (dispatch) => {
    return axios
      .get(
        baseUrl +
          "?service=WFS&version=1.1.0&request=GetFeature&typeName=" +
          typeName +
          "&outputFormat=application/json"
      )
      .then((response) => {
        if (typeof response.data === "object") {
          dispatch(featureLoaded(typeName, response.data));
        } else {
          try {
            JSON.parse(response.data);
          } catch (e) {
            dispatch(featureError(typeName, "Error from WFS: " + e.message));
          }
        }
      })
      .catch((e) => {
        dispatch(featureError(typeName, e));
      });
  };
}

function find_duplicate_in_array(data, attr) {
  var object = {};
  var result = [];

  data.forEach(function(item) {
    if (!object[item[attr]]) object[item[attr]] = 0;
    object[item[attr]] += 1;
  });

  for (var prop in object) {
    if (object[prop] >= 2) {
      result.push(prop);
    }
  }

  return result;
}

function addSmallClassAttr(data) {
  let dupattrs = find_duplicate_in_array(data, "name");
  if (dupattrs.length > 0) {
    dupattrs.forEach((attr) => {
      data.map((element) => {
        if (element.name === attr) {
          element.duplicate = true;
        }
        return element;
      });
    });
  }
  return data;
}

function query(key) {
  return (dispatch, getState) => {
    const query = getState().query;
    if (!key && !query.key) {
      return;
    }
    const map = getState().map;
    const mapConfig = getState().mapConfig;
    if (cancel != undefined) {
      cancel();
    }

    return axios
      .get(mapConfig.tdtserverurl + "/search", {
        cancelToken: new CancelToken(function executor(c) {
          cancel = c;
        }),
        params: {
          postStr: assign(
            {},
            {
              keyWord: key || query.key,
              mapBound: [
                map.bbox.bounds.maxx,
                map.bbox.bounds.maxy,
                map.bbox.bounds.minx,
                map.bbox.bounds.miny,
              ].join(","),
              level: 11,
              queryType: query.nearbytitle ? 3 : 1,
              count: query.page,
              start: (query.pageindex - 1) * query.page,
            },
            query.nearbytitle && {
              pointLonlat: query.nearbypoint,
              queryRadius: 2000,
            }
          ),
          type: "query",
          tk: mapConfig.tdttk,
        },
      })
      .then((response) => {
        dispatch(clearSimpleResult());
        if (response.data.pois) {
          dispatch(
            querySearchResponse(
              addSmallClassAttr(response.data.pois),
              Number(response.data.count)
            )
          );
        } else if (response.data.prompt) {
          dispatch(querySearchResponse([]));
          dispatch(queryPrompt(response.data.prompt));
        }
      })
      .catch((e) => {
        message.warning("数据查询失败,请稍后再试");
        dispatch(queryError(e));
      });
  };
}

function queryall(key) {
  return (dispatch, getState) => {
    const query = getState().query;
    const map = getState().map;
    const mapConfig = getState().mapConfig;
    if (cancel != undefined) {
      cancel();
    }
    return axios
      .get(mapConfig.tdtserverurl + "/search", {
        cancelToken: new CancelToken(function executor(c) {
          cancel = c;
        }),
        params: {
          postStr: {
            keyWord: key || query.key,
            mapBound: [
              map.bbox.bounds.maxx,
              map.bbox.bounds.maxy,
              map.bbox.bounds.minx,
              map.bbox.bounds.miny,
            ].join(","),
            level: 11,
            queryType: 1,
            count: 200,
            start: (query.pageindex - 1) * query.page,
          },
          type: "query",
          tk: mapConfig.tdttk,
        },
      })
      .then((response) => {
        dispatch(querySearchAllResponse(response.data.pois));
      })
      .catch((e) => {
        message.warning("数据查询失败,请稍后再试");
        dispatch(queryError(e));
      });
  };
}

function onHotQuery(leve, type, model) {
  return query(type);
}

function onHotQueryAll(leve, type, model) {
  return queryall(type);
}

function simpleQuery(key) {
  return (dispatch, getState) => {
    if (key.trim() === "") {
      dispatch(simpleQuerySearchResponse([]));
      return;
    }
    const mapConfig = getState().mapConfig;
    const map = getState().map;
    if (cancel != undefined) {
      //取消上一次请求
      cancel();
    }
    return axios
      .get(mapConfig.tdtserverurl + "/search", {
        cancelToken: new CancelToken(function executor(c) {
          cancel = c;
        }),
        params: {
          postStr: {
            queryType: 1,
            sourceType: 0,
            keyWord: key,
            level: 11,
            mapBound: [
              map.bbox.bounds.maxx,
              map.bbox.bounds.maxy,
              map.bbox.bounds.minx,
              map.bbox.bounds.miny,
            ].join(","),
            queryType: 4,
            count: 6,
            start: 0,
          },
          type: "query",
          tk: mapConfig.tdttk,
        },
      })
      .then((response) => {
        dispatch(simpleQuerySearchResponse(response.data.suggests));
      })
      .catch((e) => {
        dispatch(queryError(e));
      });
  };
}

function resetQuery() {
  return (dispatch) => {
    dispatch({
      type: RESET_QUERY,
    });

    dispatch(collapseResult(false));
  };
}

function collapseResult(collapse) {
  return {
    type: COLLAPSE_RESULT,
    collapse,
  };
}

function changeQueryKey(key, querytype) {
  return {
    type: CHANGE_QUERYKEY,
    key,
    querytype,
  };
}

function clearSimpleResult() {
  return {
    type: QUERY_SIMPLERESULT,
    simpleresult: [],
  };
}

function changeQueryAreaKey(key, querytype) {
  return {
    type: CHANGE_QUERYAREAKEY,
    key,
    querytype,
  };
}

function queryOnFocus(inputfocus) {
  return (dispatch, getState) => {
    const query = getState().query;
    dispatch({
      type: QUERY_ONFOCUS,
      inputfocus,
    });
    if (!query.result) {
      // dispatch(showSidebar(true, '1'))
    }
  };
}

module.exports = {
  FEATURE_TYPE_LOADED,
  FEATURE_LOADED,
  FEATURE_TYPE_ERROR,
  FEATURE_ERROR,
  changeQueryPageIndex,
  CHANGE_QUERYPAGEINDEX,
  querySearchAllResponse,
  QUERYALL_RESULT,
  QUERY_RESULT,
  QUERY_ERROR,
  changeQueryKey,
  CHANGE_QUERYKEY,
  CHANGE_QUERYAREAKEY,
  changeQueryAreaKey,
  QUERY_ONFOCUS,
  RESET_QUERY,
  collapseResult,
  COLLAPSE_RESULT,
  onHoverResult,
  onHotQuery,
  simpleQuery,
  QUERY_SIMPLERESULT,
  CURRENT_RESPONSE_TIME,
  clearSimpleResult,
  HOVER_RESULTINDEX,
  NEARBY_LOCINFO,
  setNearBy,
  CLICK_RESULTINDEX,
  onClickResult,
  describeFeatureType,
  loadFeature,
  queryPrompt,
  QUERY_PROMPTRESULT,
  queryOnFocus,
  query,
  login,
  loginout,
  getUserLocation,
  GET_USERLOCATION,
  LOGIN,
  resetQuery,
};
