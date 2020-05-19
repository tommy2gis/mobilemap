
const THEMATIC_RESULT = 'THEMATIC_RESULT';
const SHOW_THEMATICLAYER='SHOW_THEMATICLAYER';
const QUERY_THEMATICRESULT='QUERY_THEMATICRESULT';
const SET_SELECTEDFEATURE='SET_SELECTEDFEATURE';
import axios from 'axios';
import qs from 'qs';

function loadThematicsList(result) {
    return {
        type: THEMATIC_RESULT,
        result
    };
}

function showThematicLayer(id,visibility) {
    return {
        type: SHOW_THEMATICLAYER,
        id,
        visibility
    };
}

function setSelectedFeature(fea) {
    return {
        type: SET_SELECTEDFEATURE,
        fea
    };
}

function queryThematicResponces(response,geometry) {
    return {
        type: QUERY_THEMATICRESULT,
        response,
        geometry
    };
}

function queryThematic(serviceId,geometry,geometryType,where) {
    return (dispatch, getState) => {
        const query = getState().query;
        return axios.post('http://61.177.139.228:9000/gateway/wuxi_chenguan/grid_road_all/MapServer/'+serviceId+'/query',qs.stringify({
            "returnGeometry": true,
            "where": where||"1=1",
            "outSr": 4326,
            "outFields": "*",
            "inSr": 4326,
            "geometry": geometry||"",
            "geometryType": geometryType||"",
            "spatialRel": "esriSpatialRelIntersects",
            "f": "pjson"

        })).then((response) => {
            dispatch(queryThematicResponces(response.data,geometry))
        }).catch((e) => {
           // message.warning('数据查询失败,请稍后再试');
           // dispatch(queryError(e));
        });
        
    };
}



module.exports = {
    loadThematicsList,
    setSelectedFeature,
    SET_SELECTEDFEATURE,
    THEMATIC_RESULT,
    SHOW_THEMATICLAYER,
    showThematicLayer,
    queryThematic,
    QUERY_THEMATICRESULT,
    queryThematicResponces
};