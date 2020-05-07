/*
 * @Author: 史涛
 * @Date: 2019-01-05 19:29:34
 * @Last Modified by: 史涛
 * @Last Modified time: 2020-05-07 15:01:05
 */
const {
  ROUTING_RESULT,
  ROUTING_POIRESULT,
  ROUTING_BEGIONPOIRESULT,
  ROUTING_ENDPOIRESULT,
  ADD_BEGINLOC,
  ADD_BEGINADDRESS,
  CHANGE_STYLE,
  CHANGE_BUSSTYLE,
  ADD_MIDLOC,
  ADD_ENDLOC,
  ADD_ENDADDRESS,
  CHNAGE_BUSLINE,
  DELETE_MIDLOC,
  RESET_ROUTING,
  ROUTING_LOADING,
  CLEAR_MIDLOCS,
  CHNAGE_POSI_MODULE,
  CHNAGE_MODULE
} = require("./actions");

const assign = require("object-assign");

const initialState = {
  result: "",
  poiresult: "",
  beginloc: null,
  posimodel:null,
  beginaddress: "",
  midlocs: [],
  endloc: null,
  endaddress: "",
  resultError: null,
  moduletype: "routing-car",
  style: "0",
  busstyle: "1",
  busline: "0",
  loading: false
};

function routing(state = initialState, action) {
  switch (action.type) {
    case ROUTING_RESULT: {
      
      return assign({}, state, {
        result: action.result,
        jsonresult: action.jsonfea,
        posimodel:null,
        resultError: null
      });
    }
    case ROUTING_POIRESULT: {
      return assign({}, state, {
        poiresult: action.poiresult
      });
    }

    case ROUTING_BEGIONPOIRESULT: {
      return assign({}, state, {
        begionpoiresult: action.poiresult
      });
    }
    case ROUTING_ENDPOIRESULT: {
      return assign({}, state, {
        endpoiresult: action.poiresult
      });
    }
    case RESET_ROUTING: {
      return assign({}, state, {
        result: "",
        beginloc: null,
        midlocs: [],
        endloc: null,
        resultError: null,
        jsonresult:null,
        posimodel:null,
        beginaddress: "",
        endaddress: "",
        style: "0",
        loading: false
      });
    }
    case ADD_BEGINLOC: {
      return assign({}, state, {
        beginloc: action.latlng
    
      });
    }

    case ADD_BEGINADDRESS: {
      return assign({}, state, {
        beginaddress: action.address,
        begintype: action.settype,
      });
    }

    case ADD_ENDADDRESS: {
      return assign({}, state, {
        endaddress: action.address,
        endtype: action.settype
      });
    }

    case ADD_MIDLOC: {
      return assign({}, state, {
        midlocs: [
          ...state.midlocs,
          {
            id:
              state.midlocs.reduce(
                (maxId, item) => Math.max(item.id, maxId),
                -1
              ) + 1,
            latlng: action.latlng
          }
        ]
      });
    }

    case DELETE_MIDLOC: {
      return assign({}, state, {
        midlocs: state.midlocs.filter(item => item.id !== action.id)
      });
    }
    case CLEAR_MIDLOCS: {
      return assign({}, state, {
        midlocs: []
      });
    }

    case ROUTING_LOADING: {
      return assign({}, state, {
        loading: action.isLoading
      });
    }

    case ADD_ENDLOC: {
      return assign({}, state, {
        endloc: action.latlng
      });
    }

    case CHANGE_STYLE: {
      return assign({}, state, {
        style: action.style
      });
    }

    case CHANGE_BUSSTYLE: {
      return assign({}, state, {
        busstyle: action.busstyle
      });
    }

    case CHNAGE_BUSLINE: {
      return assign({}, state, {
        busline: action.busline
      });
    }

    case CHNAGE_MODULE: {
      return assign({}, state, {
        moduletype: action.moduletype
      });
    }

    case CHNAGE_POSI_MODULE:{
      return assign({}, state, {
        posimodel: action.posimodel
      });
    }

    default:
      return state;
  }
}

module.exports = routing;
