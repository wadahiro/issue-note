import * as React from 'react';
import { Link } from 'react-router';
import * as moment from 'moment';
import * as B from '../bulma';
import IssueAction from '../actions/IssueAction';
import EditableInput from '../components/EditableInput';
import DeleteIssueModal from '../components/DeleteIssueModal';

export default class IssueTable extends React.Component<any, any> {
    render() {
        const { issues } = this.props;

        return (
            <div>
                <B.Table
                    fixed={true}
                    columnMetadata={columnMetadata}
                    enableSort={true}
                    initialSort='updated'
                    showPagination={true}
                    resultsPerPage={20}
                    results={issues}
                    rowKey='_id'
                    />
            </div>
        );
    }
}

const columnMetadata = [
    {
        name: '_id',
        visible: false
    },
    {
        name: 'name',
        label: 'Sync Name',
        width: '7em'
    },
    {
        name: 'checked',
        label: 'Checked',
        width: '12em',
        renderer: checkbox
    },
    {
        name: 'memo',
        label: 'Memo',
        width: '30em',
        editable: true,
        renderer: editableTextArea
    },
    {
        name: 'issueId',
        label: 'Issue ID',
        renderer: external_link("https://bugster.forgerock.org/jira/browse"),
        width: '10em'
    },
    {
        name: 'created',
        label: 'Created',
        width: '8em',
        renderer: date
    },
    {
        name: 'updated',
        label: 'Updated',
        width: '8em',
        renderer: date
    },
    {
        name: 'summary',
        label: 'Summary',
        width: '25em'
    },
    {
        name: '_action',
        label: 'Action',
        width: '5em',
        renderer: action
    }
];

function checkbox(value, values) {
    const onChange = (e) => {
        const issueChecked = {
            _id: values['_id'],
            _rev: values['_rev'],
            checked: e.target.checked
        }
        return IssueAction.updateChecked(issueChecked);
    };
    let checkedDate = values['checkedDate'];
    checkedDate = moment(checkedDate).format('YYYY/MM/DD');
    const label = checkedDate === '0001/01/01' ? '' : `(${checkedDate})`;
    return (
        <B.Checkbox checked={value} onChange={onChange} label={label} />
    );
}

function editableTextArea(value, values) {
    const onSave = (newValue: string): Promise<any> => {
        const issueMemo = {
            _id: values['_id'],
            _rev: values['_rev'],
            memo: newValue
        }
        return IssueAction.updateMemo(issueMemo)
            .then(result => {
                return result.memo;
            });
    };
    return (
        <EditableInput value={value} rows={20} onSave={onSave} />
    );
}

function external_link(base_url) {
    return (value, values) => {
        return (
            <a href={`${base_url}/${values.issueId}`} target='_blank'>
                {value}
            </a>
        );
    }
}

function link(value, values) {
    return <Link to={`/issues/${values._id}`}>{value}</Link>;
}

function date(value, values) {
    const date = moment(value).format('YYYY/MM/DD');
    return <span>{date}</span>;
}

function pre(value, values) {
    return <pre>{value}</pre>;
}

function action(value, values) {
    const style = {
        width: 34
    };

    return (
        <div style={style}>
            <B.Dropdown icon='fa fa-bars' position='left'>
                <B.DropdownItem>
                    <B.ModalTriggerLink
                        modal={<DeleteIssueModal issue={values} />}>
                        Delete
                    </B.ModalTriggerLink>
                </B.DropdownItem>
            </B.Dropdown>
        </div>
    );
}

function tagStatus(value, values) {
    switch (value) {
        case 'loading':
            return <i className='fa fa-spinner fa-spin'></i>;
        case 'ok':
            return <B.Tag type='success'>Up</B.Tag>;
        default:
            return <B.Tag type='danger'>Down</B.Tag>;
    }
}