import { ReduceStore } from 'flux/utils';
import { browserHistory } from 'react-router'
import { dispatcher, Actions } from '../actions/IssueAction';

export interface Issue {
    _id?: string;
    _rev?: string;
    _created?: string;
    _updated?: string;
    name?: string;
    issueId?: string;
    summary?: string;
    description?: string;
    created?: string;
    updated?: string;
    memo?: string;
}

export interface IssueQuery {
    keyword?: string;
    filterByChecked?: boolean;
}

export interface State {
    issues: Issue[];
    current: Issue;
    query: IssueQuery;
}

class IssueStore extends ReduceStore<State> {
    getInitialState(): State {
        let keyword = '';
        let filterByChecked = true;
        
        if (typeof window !== 'undefined') {
            const search = window.location.search.split('?')[1]
            if (search) {
                const queries = search.split('&');
                queries.forEach(x => {
                    const [k , v] = x.split('=');
                    if (k.toLowerCase() === 'keyword') {
                        keyword = v;
                    }
                    if (k.toLowerCase() === 'filterbychecked' && v.toLowerCase() === 'false') {
                        filterByChecked = false;
                    }
                });
            }
        }
        
        return {
            issues: [],
            current: null,
            query: {
                keyword,
                filterByChecked
            }
        };
    }

    reduce(state: State, action: Actions): State {
        if (Actions.isGetIssues(action)) {
            return Object.assign({}, state, {
                issues: action.issues
            } as State);
        }

        if (Actions.isGet(action)) {
            return Object.assign({}, state, {
                current: action.issue
            } as State);
        }

        if (Actions.isUpdate(action)) {
            return Object.assign({}, state, {
                issues: state.issues.map(x => {
                    if (x._id === action.issue._id) {
                        return action.issue;
                    }
                    return x;
                })
            } as State);
        }

        if (Actions.isQuery(action)) {
            return Object.assign({}, state, {
                query: Object.assign({}, state.query, action.query)
            } as State);
        }

        return state;
    }
}

export default new IssueStore(dispatcher);