import * as React from 'react';
import * as B from '../bulma';
import IssueAction from '../actions/IssueAction';
import { Issue } from '../stores/IssueStore';

interface Props extends React.Props<CheckAllNotedIssuesModal> {
    show?: boolean;
    onHide?: (e: React.SyntheticEvent) => void;
    submitLabel?: string;
    cancelLabel?: string;
}

export default class CheckAllNotedIssuesModal extends React.Component<Props, any> {
    static defaultProps = {
        submitLabel: 'Check all noted issues',
        cancelLabel: 'Cancel',
        showButtons: true
    };

    doSubmit = (e) => {
        IssueAction.checkAllNotedIssues()
            .then(results => {
                this.props.onHide(e);
            });
    };

    render() {
        const { show, onHide, submitLabel, cancelLabel } = this.props;

        return (
            <B.Modal show={show} onHide={onHide}>
                <B.Box>
                    <p style={{textAlign: 'left'}}>Are you sure you want to check all noted issues?</p>
                    <br/>

                    <B.ButtonGroup>
                        <B.Button type='danger' onClick={this.doSubmit}>{submitLabel}</B.Button>

                        <B.Button onClick={onHide}>{cancelLabel}</B.Button>
                    </B.ButtonGroup>
                </B.Box>
            </B.Modal>
        );
    }
}
