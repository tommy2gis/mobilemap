
const {
    THEMATIC_RESULT,
    SHOW_THEMATICLAYER,
    QUERY_THEMATICRESULT,
    SET_SELECTEDFEATURE,
} = require('./actions');

const assign = require('object-assign');

const initialState = {
    themlist: [],
    themresult:null
}
function themtics(state = initialState, action) {
    switch (action.type) {

        case THEMATIC_RESULT: {
            return assign({}, state, {
                themlist: action.result,
                resultError: null
            });
        }

        case SET_SELECTEDFEATURE: {
            return assign({}, state, {
                selectedfeature: action.fea,
                resultError: null
            });
        }

        case QUERY_THEMATICRESULT:{
            return assign({}, state, {
                themresult: action.response,
                querygeometry:action.geometry,
                resultError: null
            });
        }

        case SHOW_THEMATICLAYER:
            return assign({}, state, {
                themlist: state.themlist.map(
                    them =>
                    them.id === action.id ? { ...them, visibility: !them.visibility } : them
                ),
                resultError: null
            });

       
    default:
        return state;
    }
}

module.exports = themtics;
