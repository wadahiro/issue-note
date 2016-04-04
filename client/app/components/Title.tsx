import * as React from 'react';

import {
    Container,
    Nav,
    Tab,
    Feed,
    Columns,
    Column
} from '../bulma';


export default class Title extends React.Component<any, any> {
    render() {
        const { title, description } = this.props;
         
        return (
            <div>
                <section className="hero is-primary is-bold is-left">
                    <div className="hero-content">
                        <Container>
                            <Columns>
                                <Column size={8}>
                                    <h3 className="title is-2">
                                        <span className="icon is-large">
                                            <i className="fa fa-arrows-v"></i>
                                        </span>
                                        <strong>{ title }</strong>
                                    </h3>
                                    <h4 className="subtitle is-4">{ description }</h4>
                                </Column>
                            </Columns>
                        </Container>
                    </div>
                </section>
            </div>
        );
    }
}
