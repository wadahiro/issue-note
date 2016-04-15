import * as React from 'react';
import * as B from '../bulma';
import IssueAction from '../actions/IssueAction';
import { Issue } from '../stores/IssueStore';

interface Props extends React.Props<DeleteIssueModal> {
    issue: Issue;
    show?: boolean;
    onHide?: (e: React.SyntheticEvent) => void;
    submitLabel?: string;
    cancelLabel?: string;
}

export default class DeleteIssueModal extends React.Component<Props, any> {
    static defaultProps = {
        submitLabel: 'Delete',
        cancelLabel: 'Cancel',
        showButtons: true
    };

    state = {
        showButtons: false,
        issueId: ''
    };

    handleChange = (e) => {
        const issueId = e.target.value;

        if (issueId === this.props.issue.issueId) {
            this.setState({
                issueId,
                showButtons: true
            });
        } else {
            this.setState({
                issueId,
                showButtons: false
            });
        }
    };

    doSubmit = () => {
        IssueAction.del(this.props.issue);
    };

    render() {
        const { show, onHide, submitLabel, cancelLabel, issue } = this.props;
        const { showButtons, issueId } = this.state;

        return (
            <B.Modal show={show} onHide={onHide}>
                <B.Box>
                    <p>Are you sure you want to permanently delete <b>{issue.issueId}</b>?</p>
                    <p>Please enter the issue ID.</p>

                    <B.InputText label='Issue ID' value={issueId} onChange={this.handleChange} />

                    <B.ButtonGroup>
                        {showButtons &&
                            <B.Button type='danger' onClick={this.doSubmit}>{submitLabel}</B.Button>
                        }
                        <B.Button onClick={onHide}>{cancelLabel}</B.Button>
                    </B.ButtonGroup>
                </B.Box>
            </B.Modal>
        );
    }
}
