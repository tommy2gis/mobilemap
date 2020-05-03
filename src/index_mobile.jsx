/*
 * @Author: 史涛 
 * @Date: 2020-05-03 13:32:48 
 * @Last Modified by:   史涛 
 * @Last Modified time: 2020-05-03 13:32:48 
 */
import React from 'react';
import ReactDOM from 'react-dom';
import {HashRouter, Route, Switch } from 'react-router-dom'
import { Provider } from 'react-redux';
import App from './components/mobiles/App';
import login from './components/mobiles/login';
import store from './store/configureStore';
import './index_mobile.less';

var loadMapConfig = require('./actions/config').loadMapConfig;
store.dispatch(loadMapConfig('config.json', false));



ReactDOM.render(
    <Provider store={store}>
        <HashRouter>
                <div>
                    <Switch>
                        <Route exact path="/" component={App} />
                        <Route path="/login" component={login} />
                        
                    </Switch>
                </div>
        </HashRouter>
</Provider>
, document.getElementById('app'));