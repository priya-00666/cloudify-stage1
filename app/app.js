/**
 * Created by kinneretzin on 29/08/2016.
 */

import 'babel-polyfill';

//import '../styles/bootstrap.min.css';
import './styles/style.scss';

// Import semantic
import '../semantic/dist/semantic.css';
import '../semantic/dist/semantic';

// Import gridstack
//import 'jquery-ui';
//import '../node_modules/gridstack/dist/gridstack.css';
//import '../node_modules/gridstack/dist/gridstack.js';



import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { Router, browserHistory ,useRouterHistory} from 'react-router';
import { syncHistoryWithStore } from 'react-router-redux'

import configureStore  from './configureStore';
import routes from './routes';

const store = configureStore(browserHistory);

const history = syncHistoryWithStore(browserHistory, store);

//history.listen(location => analyticsService.track(location.pathname))

ReactDOM.render(
    <Provider store={store}>
        <Router history={history} routes={routes} />
    </Provider>,
    document.getElementById('app')
);