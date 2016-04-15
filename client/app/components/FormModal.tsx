import * as React from 'react';
import * as B from '../bulma';

export abstract class FormModal extends React.Component<any, any> {
    static defaultProps = {
        submitLabel: 'Submit',
        cancelLabel: 'Cancel',
        showButtons: true
    };

    handleForm = (e) => {
        const name = e.target.name;
        const checked = e.target.checked;
        let value = e.target.type === 'checkbox' || e.target.type === 'radio' ? checked : e.target.value;

        this.setState({
            data: Object.assign({}, this.state.data, {
                [name]: value
            })
        });
    };

    doSubmit = () => {
        this.submitForm();
    };

    render() {
        const { show, onHide, submitLabel, cancelLabel, showButtons } = this.props;

        return (
            <B.Modal show={show} onHide={onHide}>
                <B.Box>
                    {this.renderForm() }

                    { showButtons &&
                        <B.ButtonGroup>
                            <B.Button type='primary' onClick={this.doSubmit}>{submitLabel}</B.Button>
                            <B.Button onClick={onHide}>{cancelLabel}</B.Button>
                        </B.ButtonGroup>
                    }
                </B.Box>
            </B.Modal>
        );
    }

    abstract submitForm();
    abstract renderForm(): JSX.Element;
}
