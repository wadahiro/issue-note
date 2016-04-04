import * as React from 'react';
import * as B from '../bulma';
import IssueAction from '../actions/IssueAction';

interface Props extends React.Props<SearchFilter> {
    label?: string;
    filterByChecked: boolean;
}

export default class SearchFilter extends React.Component<Props, any> {
    static defaultProps = {
        label: 'Filter by Checked',
        filterByChecked: true
    };

    render() {
        const { label, filterByChecked } = this.props;
        const labelStyle = {
            marginRight: 10
        };

        return (
            <div className='control is-horizontal'>
                <label style={labelStyle} className='label'>{label}</label>
                <div className='control'>
                    <label className='radio'>
                        <input type='radio' name='yes' checked={filterByChecked} onChange={this.handleFilter} />
                        Yes
                    </label>
                    <label className='radio'>
                        <input type='radio' name='no' checked={!filterByChecked} onChange={this.handleFilter}  />
                        No
                    </label>
                </div>
            </div>
        );
    }

    handleFilter = (e) => {
        const name = e.target.name;
        const filterByChecked = name === 'yes' ? true : false;
        IssueAction.switchFilterByChecked(filterByChecked);
    };
}
