import * as React from 'react';
import { Container } from './Container';

export class HeaderItem extends React.Component<any, any> {
    static defaultProps = {
        type: 'item',
        isActive: false
    };
    render() {
        const { type, isActive } = this.props;

        return (
            <div className={`header-${type} ${isActive ? 'is-active' : ''}`}>
                { this.props.children }
            </div>
        );
    }
}

export interface HeaderRightProps extends React.Props<any> {
    isActive?: boolean;
}

export class HeaderLeft extends React.Component<any, any> {
    render() {
        return (
            <div className='header-left'>
                { this.props.children }
            </div>
        );
    }
}

export class HeaderRight extends React.Component<HeaderRightProps, any> {
    render() {
        return (
            <div className={`header-right header-menu ${this.props.isActive}`}>
                { this.props.children }
            </div>
        );
    }
}

export class Header extends React.Component<any, any> {
    state = {
        isActive: false
    };

    handleToggle = () => {
        this.setState({
            isActive: !this.state.isActive
        });
    };

    render() {
        const isActive = this.state.isActive ? 'is-active' : '';

        // console.log(this.props.children)

        if (this.props.children && this.props.children.length > 0) {
            const left = this.props.children.filter(x => x.type === HeaderLeft);
            const right = this.props.children.filter(x => x.type === HeaderRight).map(x => React.cloneElement(x, { isActive, key: x.key }));

            return (
                <header className='header'>
                    <Container isFluid>
                        {left}
                        <span className={`header-toggle ${isActive}`} onClick={this.handleToggle}>
                            <span></span>
                            <span></span>
                            <span></span>
                        </span>
                        {right}
                    </Container>
                </header>
            );
        } else {
            return (
                <header className='header'>
                </header>
            );
        }
    }
}