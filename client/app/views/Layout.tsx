import * as React from 'react';
import { Link } from 'react-router'
import * as B from '../bulma';
import SyncSettingsModal from '../components/SyncSettingsModal';
import NavigationHeader from '../components/NavigationHeader';
import WebApi from '../api/WebApi';

interface State {
    versionInfo: VersionInfo;
}

interface VersionInfo {
    version: string;
    commitHash: string;
}

export default class Layout extends React.Component<any, State> {
    state = {
        versionInfo: null,
    };

    componentDidMount() {
        WebApi.get<VersionInfo>('version')
            .then(versionInfo => {
                this.setState({
                    versionInfo
                });
            });
    }

    render() {
        const { versionInfo } = this.state;
        const active = 'home';

        return (
            <div>
                <section className='hero is-info is-left is-bold'>
                    <NavigationHeader active={active} left={LEFT_NAV} right={RIGHT_NAV} settings={SETTINGS} />
                </section>
                <B.Section>
                    { this.props.children }
                </B.Section>
                <B.Footer>
                    <p>
                        <strong>issue-memo</strong> by <a href="https://github.com/wadahiro"> @wadahiro</a>.The source code is licensed <a href="http://opensource.org/licenses/mit-license.php">MIT</a>.
                    </p>
                    { versionInfo &&
                        <p>
                            Version {versionInfo.version} ({versionInfo.commitHash}).
                        </p>
                    }
                    <p>
                        <a className="icon" href="https://github.com/wadahiro/issue-memo">
                            <i className="fa fa-github"></i>
                        </a>
                    </p>
                </B.Footer>
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