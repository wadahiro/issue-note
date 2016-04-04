import * as React from 'react';

import {
    Container,
    Nav,
    Tab,
    Feed
} from '../bulma';
import Title from '../components/Title';


export default function NotFoundView(props) {
    return (
        <div>
            <section style={{height: '100px'}}>
            </section>
            
            <Title title='404 Page Not Found.' />
        </div>
    );
}
