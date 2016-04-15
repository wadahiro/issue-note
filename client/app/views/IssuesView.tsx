import * as React from 'react';
import { browserHistory } from 'react-router'
import { Container } from 'flux/utils';
import * as B from '../bulma';
import IssueAction from '../actions/IssueAction';
import IssueStore, { Issue, IssueQuery } from '../stores/IssueStore';
import IssueTable from '../components/IssueTable';
import SearchFilter from '../components/SearchFilter';

interface State {
    issues?: Issue[];
    query?: IssueQuery;
}

interface QueryString {
    keyword: string;
    filterByChecked: string;
}

class IssuesView extends React.Component<any, State> {
    static getStores() {
        return [IssueStore];
    }

    static calculateState(prevState: State) {
        const storeState = IssueStore.getState();
        const nextState = {
            issues: storeState.issues,
            query: storeState.query
        };

        // do search
        if (!prevState || prevState.query !== nextState.query) {
            // change browser url for bookmarkable search page
            const keyword = nextState.query.keyword || '';
            const filterByChecked = nextState.query.filterByChecked;
            // TODO resolve warning as below
            // warning.js:45 Warning: setState(...): Cannot update during an existing state transition (such as within `render`). Render methods should be a pure function of props and state.
            if (typeof window !== 'undefined') {
                browserHistory.push(`/?keyword=${keyword}&filterByChecked=${filterByChecked}`);
            }
        }

        return nextState;
    }

    componentDidMount() {
        const query = this.props.location.query as QueryString;
        this.fetchIssues(query.keyword, query.filterByChecked);
    }

    componentWillReceiveProps(nextProps) {
        const prevQuery = this.props.location.query;
        const query = nextProps.location.query;

        if (prevQuery.keyword !== query.keyword ||
            prevQuery.filterByChecked !== query.filterByChecked) {

            this.fetchIssues(query.keyword, query.filterByChecked);
        }
    }

    fetchIssues(keyword: string, filterByChecked: string = 'true') {
        const nextQuery = {
            keyword,
            filterByChecked: filterByChecked.toLowerCase() === 'true' ? true : false
        };
        IssueAction.search(nextQuery);
    }

    render() {
        const { issues, query: { filterByChecked } } = this.state;

        return (
            <B.Container isFluid>
                <div className='is-pulled-right'>
                    <SearchFilter filterByChecked={filterByChecked} />
                </div>
                <IssueTable issues={issues} />
            </B.Container>
        );
    }
}


export default Container.create(IssuesView, { withProps: true });
