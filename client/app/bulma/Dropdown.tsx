import * as React from 'react';
import * as B from '../bulma';

export class Dropdown extends React.Component<any, any> {
    state = {
        show: false
    };

    toggle = () => {
        this.setState({
            show: !this.state.show
        })
    };

    render() {
        let { label, icon } = this.props;

        if (icon) {
            icon = <i className={icon}></i>
        }

        const open = this.state.show ? 'open' : '';

        return (
            <div className={`dropdown ${open}`}>
                <B.Button onClick={this.toggle}>
                    {icon}{label}
                </B.Button>
                <ul className='dropdown-menu'>
                    {this.props.children}
                </ul>
            </div>
        );
    }
}

export class DropdownItem extends React.Component<any, any> {
    render() {
        return (
            <li>{this.props.children}</li>
        );
    }
}