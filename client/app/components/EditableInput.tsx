import * as React from 'react';
import * as B from '../bulma';
import IssueAction from '../actions/IssueAction';

interface Props extends React.Props<EditableInput> {
    name?: string;
    label?: string;
    size?: string;
    type?: string;
    value?: string;
    placeholder?: string;
    rows?: number;
    onSave?: (value: string) => Promise<any>
}

export default class EditableInput extends React.Component<Props, any> {
    static defaultProps = {
        placeholder: 'Add',
        rows: 3
    };
    state = {
        value: this.props.value || '',
        editing: false
    };
    textArea = null;

    render() {
        const { name, label, placeholder, rows, size, type } = this.props;
        const isSize = size ? `is-${size}` : '';
        const isType = type ? `is-${type}` : '';

        if (this.state.editing) {
            return (
                <p className='control is-grouped'>
                    <textarea
                        ref={(ref) => this.textArea = ref}
                        className={`textarea ${isSize} ${isType}`}
                        name={name}
                        value={this.state.value}
                        rows={rows}
                        onBlur={this.save}
                        onChange={this.handleChange} />
                </p>
            );
        } else {
            if (this.state.value === '') {
                return (
                    <B.Button className='is-fullwidth' onClick={this.goEdit}>{placeholder}</B.Button>
                );

            } else {
                const preStyle = {
                    background: 'none',
                    color: '#222324',
                    fontFamily: '"Helvetica Neue", "Helvetica", "Arial", sans-serif'
                };

                return (
                    <pre style={preStyle} className='control is-grouped' onClick={this.goEdit}>
                        {this.state.value !== '' ? this.state.value : placeholder}
                    </pre>
                );
            }
        }
    }

    goEdit = (e) => {
        this.setState({ editing: true }, () => {
            if (this.textArea !== null) {
                this.textArea.focus();
            }
        });
    };

    save = (e) => {
        this.props.onSave(this.state.value)
            .then(x => {
                this.setState({ editing: false });
            });
    };

    handleChange = (e) => {
        this.setState({ value: e.target.value });
    };
}
