import { Dispatcher } from 'flux';
import { browserHistory } from 'react-router'
import WebApi from '../api/WebApi';
import { Issue, IssueQuery } from '../stores/IssueStore';

export const dispatcher: Dispatcher<Actions> = new Dispatcher();

interface GetIssues {
    type: 'issue/getIssues';
    issues: Issue[];
}

interface Get {
    type: 'issue/get';
    issue: Issue;
}

interface Update {
    type: 'issue/update';
    issue: Issue;
}

interface Delete {
    type: 'issue/delete';
    issue: Issue;
}

interface Query {
    type: 'issue/query';
    query: IssueQuery;
}


export type Actions = GetIssues | Get | Update | Delete | Query;

export const Actions = {
    isGetIssues(action: Actions): action is GetIssues {
        return action.type === 'issue/getIssues';
    },

    isGet(action: Actions): action is Get {
        return action.type === 'issue/get';
    },

    isUpdate(action: Actions): action is Update {
        return action.type === 'issue/update';
    },

    isDelete(action: Actions): action is Delete {
        return action.type === 'issue/delete';
    },

    isQuery(action: Actions): action is Query {
        return action.type === 'issue/query';
    }
}

export default class IssueAction {
    static getAll() {
        return WebApi.query<Issue>('issues', {})
            .then(result => {
                dispatcher.dispatch(
                    {
                        type: 'issue/getIssues',
                        issues: result.result
                    }
                );
                return result.result;
            })
    }

    static get(_id: string) {
        return WebApi.get<Issue>(`issues/${_id}`)
            .then(issue => {
                dispatcher.dispatch(
                    {
                        type: 'issue/get',
                        issue
                    }
                );
                return issue
            });
    }

    static update(newIssue: Issue) {
        return WebApi.update<Issue>(`issues/${newIssue._id}`, newIssue._rev, newIssue)
            .then(updated => {
                dispatcher.dispatch(
                    {
                        type: 'issue/update',
                        issue: updated
                    }
                );
                return updated;
            });
    }

    static del(issue: Issue) {
        return WebApi.del<Issue>(`issues/${issue._id}`, issue._rev)
            .then(deleted => {
                dispatcher.dispatch(
                    {
                        type: 'issue/delete',
                        issue: deleted
                    }
                );
                return deleted;
            });
    }

    static updateMemo(patchIssue: Issue) {
        return WebApi.put<Issue>(`memo/${patchIssue._id}`, patchIssue._rev, patchIssue)
            .then(updated => {
                dispatcher.dispatch(
                    {
                        type: 'issue/update',
                        issue: updated
                    }
                );
                return updated;
            })
            .catch(err => {
                // TODO notify error
            })
    }

    static updateChecked(patchIssue: Issue) {
        return WebApi.put<Issue>(`checked/${patchIssue._id}`, patchIssue._rev, patchIssue)
            .then(updated => {
                dispatcher.dispatch(
                    {
                        type: 'issue/update',
                        issue: updated
                    }
                );
                return updated;
            })
            .catch(err => {
                // TODO notify error
            })
    }

    static search(query: IssueQuery) {
        const keyword = query.keyword;
        const checked = !query.filterByChecked;

        dispatcher.dispatch(
            {
                type: 'issue/query',
                query
            }
        );

        return WebApi.query<Issue>('issues', {
            keyword,
            checked
        })
            .then(result => {
                dispatcher.dispatch(
                    {
                        type: 'issue/getIssues',
                        issues: result.result
                    }
                );
                return result.result;
            })
    }

    static changeFilterKeyword(keyword: string) {
        dispatcher.dispatch(
            {
                type: 'issue/query',
                query: {
                    keyword
                }
            }
        );
    }

    static switchFilterByChecked(filterByChecked: boolean) {
        dispatcher.dispatch(
            {
                type: 'issue/query',
                query: {
                    filterByChecked
                }
            }
        );
    }
}