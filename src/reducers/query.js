/*
 * @Author: 史涛 
 * @Date: 2019-01-05 19:31:12 
 * @Last Modified by: 史涛
 * @Last Modified time: 2020-05-14 14:58:30
 */

const {
    CHANGE_QUERYPAGEINDEX,
    QUERY_RESULT,
    QUERYALL_RESULT,
    COLLAPSE_RESULT,
    HOVER_RESULTINDEX,
    CLICK_RESULTINDEX,
    QUERY_ERROR,
    QUERY_ONFOCUS,
    CHANGE_QUERYKEY,
    CURRENT_RESPONSE_TIME,
    CHANGE_QUERYAREAKEY,
    NEARBY_LOCINFO,
    QUERY_SIMPLERESULT,
    QUERY_PROMPTRESULT,
    GET_USERLOCATION,
    RESET_QUERY,
    LOGIN
} = require('../actions/query');

const assign = require('object-assign');



const initialState = {
    featureTypes: {},
    data: {},
    pageindex: 1,
    page: 10,
    type: '',
    key: '',
    userinfo:null,
    areakey:null,
    responsetime:'',
    areatype:'',
    inputfocus: false,
    result: '',
    resultcollapsed: false,
    simpleresult: [],
    nearbyextend:'',
    curloc: null,
    hoverid: null,
    clickid:null,
    selectedid: null,
    resultError: null
};

function query(state = initialState, action) {
    switch (action.type) {
        case QUERY_RESULT: {
            return assign({}, state, {
                result: action.result,
                resultcount:action.count,
                resultError: null
            });
        }

        case GET_USERLOCATION: {
            return assign({}, state, {
                curloc: action.loc,
                resultError: null
            });
        }

        case QUERY_PROMPTRESULT:{
            return assign({}, state, {
                prompt: action.result
            });
        }

        case LOGIN: {
            return assign({}, state, {
                userinfo: action.userinfo,
                resultError: null
            });
        }

        case CURRENT_RESPONSE_TIME:{
            return assign({}, state, {
                responsetime: action.time
            });
        }

        case NEARBY_LOCINFO:{
            return assign({}, state, {
                nearbyextend: action.nearbyextend,
                nearbytitle:action.nearbytitle,
                nearbypoint:action.nearbypoint
            });
        }


        case QUERYALL_RESULT: {
            return assign({}, state, {
                resultall: action.result,
                resultError: null
            });
        }

        case COLLAPSE_RESULT: {
            return assign({}, state, {
                resultcollapsed: action.collapse
            });
        }


        case QUERY_ERROR: {
            return assign({}, state, {
                result: '',
                resultError: action.error
            });
        }
        case RESET_QUERY: {
            return assign({}, state, {
                result: '',
                resultall:'',
                key: '',
                nearbyextend: '',
                nearbytitle:'',
                nearbypoint:'',
                resultError: null
            });
        }
        case QUERY_SIMPLERESULT: {
            return assign({}, state, {
                simpleresult: action.simpleresult
            });
        }


        case QUERY_ONFOCUS: {
            return assign({}, state, {
                inputfocus: action.inputfocus,
            });
        }

        case CHANGE_QUERYPAGEINDEX: {
            return assign({}, state, {
                pageindex: action.pageindex,
            });
        }
        case HOVER_RESULTINDEX: {
            return assign({}, state, {
                hoverid: action.hoverid,
            });
        }
        case CLICK_RESULTINDEX: {
            return assign({}, state, {
                clickid: action.clickid,
            });
        }
        
        case CHANGE_QUERYKEY: {
            return assign({}, state, {
                key: action.key,
                type: action.querytype
            });
        }
        case CHANGE_QUERYAREAKEY: {
            return assign({}, state, {
                areakey: action.key,
                areatype: action.querytype
            });
        }
        


        default:
            return state;
    }
}

module.exports = query;
