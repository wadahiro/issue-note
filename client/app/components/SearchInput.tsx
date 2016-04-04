import * as React from 'react';
import { Container } from 'flux/utils';
import * as B from '../bulma';
import IssueAction from '../actions/IssueAction';
import IssueStore, { Issue, IssueQuery } from '../stores/IssueStore';

class SearchInput extends React.Component<any, any> {
    static defaultProps = {
        placeholder: 'Find issue'
    };

    static getStores() {
        return [IssueStore];
    }

    static calculateState(prevState) {
        const state = IssueStore.getState();
        return {
            keyword: state.query.keyword
        };
    }

    render() {
        const { placeholder } = this.props;
        const { keyword } = this.state;

        return (
            <p className='control is-grouped'>
                <input className='input' type='text' value={keyword} placeholder={placeholder} onKeyDown={this.search} onChange={this.handleChange} />
            </p>
        );
    }

    handleChange = (e) => {
        const value = e.target.value;
        this.setState({
            keyword: value
        });
    };

    search = (e) => {
        if (e.keyCode === 13) {
            IssueAction.changeFilterKeyword(this.state.keyword);
        }
    }
}

export default Container.create(SearchInput);