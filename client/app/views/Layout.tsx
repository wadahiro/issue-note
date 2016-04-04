import * as React from 'react';
import { Link } from 'react-router'
import * as B from '../bulma';
import SyncSettingsModal from '../components/SyncSettingsModal';
import NavigationHeader from '../components/NavigationHeader';

export default class Layout extends React.Component<any, any> {

    openNewTicketModal = (e: React.SyntheticEvent) => {

    };

    render() {
        const active = 'home';
        return (
            <div>
                <section className='hero is-info is-left is-bold'>
                    <NavigationHeader active={active} left={LEFT_NAV} right={RIGHT_NAV} settings={SETTINGS} />
                </section>
                <B.Section>
                    { this.props.children }
                </B.Section>
                <B.Footer />
            </div>
        );
    }
}

const LEFT_NAV = [
    {
        name: 'home',
        label: 'ISSUE-MEMO',
        link: '/',
        roles: ['user']
    }
];

const RIGHT_NAV = [
];

const SETTINGS = [
    {
        name: 'syncSettings',
        label: 'Sync Settings',
        type: 'link',
        modal: <SyncSettingsModal />,
        roles: ['user']
    }
]