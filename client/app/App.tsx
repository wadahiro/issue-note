import * as React from 'react';
import { Router, Route, Link, browserHistory } from 'react-router'

import {
    Container,
    Nav,
    Tab,
    Feed
} from './bulma';

import Layout from './views/Layout';
import IssuesView from './views/IssuesView';
import NotFoundView from './views/NotFoundView';

export default class App extends React.Component<any, any> {

    componentDidMount() {
    }

    render() {
        return ROUTES;
    }
}

export const ROUTES =
    <Router history={browserHistory}>
        <Route component={Layout}>
            <Route path="/" component={IssuesView}/>
            <Route path="/issues" component={IssuesView}/>
            <Route path="/issues/:_id" component={IssuesView}/>
        </Route>
        <Route path="*" component={NotFoundView}/>
    </Router>;
