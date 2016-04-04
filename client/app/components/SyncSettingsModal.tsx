import * as React from 'react';
import * as B from '../bulma';
import { FormModal } from './FormModal';
import WebApi from '../api/WebApi';

interface SyncSetting {
    _id: string;
    _rev: string;
    name: string;
    type: string;
    fetchUrl: string;
    schedule: string;
    issueUrl: string;
    description: string;
}

type FormType = 'create' | 'update'

export default class SyncSettingsModal extends FormModal {
    static defaultProps = {
        submitLabel: 'Submit',
        cancelLabel: 'Cancel',
        showButtons: false
    };

    state = {
        data: initData() as SyncSetting,
        settings: [] as SyncSetting[],
        formType: null as FormType,
        currentIndex: null as number,
        syncing: false
    };

    componentDidMount() {
        WebApi.query('syncsettings', {})
            .then(result => {
                this.setState({
                    settings: result.result
                });
            });
    }

    submitForm() {
    }

    renderForm() {
        const { name, type, fetchUrl, schedule, issueUrl, description } = this.state.data;
        const { formType, currentIndex, settings, syncing } = this.state;

        const liStyle = {
            height: 29,
            padding: '5px 10px'
        };

        return (
            <B.Columns>
                <B.Column size={3}>
                    { settings.length === 0 &&
                        <h2>No Settings</h2>
                    }
                    <aside className='menu'>
                        {
                            settings.length > 0 &&
                            <p className='menu-label'>
                                Sync Settings
                            </p>
                        }
                        <ul className='menu-list'>
                            { settings.map((x, index) => {
                                if (index === this.state.currentIndex) {
                                    return <li key={x._id}><a style={liStyle} className='is-active'>{name.length === 0 ? '(Empty)' : name}</a></li>;
                                } else {
                                    return <li key={x._id}><a style={liStyle} onClick={this.showDetail(index) }>{x.name}</a></li>;
                                }
                            })
                            }
                        </ul>
                    </aside>
                </B.Column>
                <B.Column>
                    { formType !== 'create' &&
                        <div className='is-text-right'>
                            <B.Button onClick={this.showCreateForm }>Add Sync Setting</B.Button>
                        </div>
                    }
                    { formType !== null &&
                        <B.Content>
                            <B.InputText name='name' label='Sync Name' value={name} onChange={this.handleForm} />
                            <B.Select name='type' label='Type' value={type} options={SyncTypes} onChange={this.handleForm} />
                            <B.InputText name='fetchUrl' label='Fetch URL' value={fetchUrl} onChange={this.handleForm} />
                            <B.Select name='schedule' label='Sync Schedule' value={schedule} options={SchedleTypes} onChange={this.handleForm} />
                            <B.InputText name='issueUrl' label='Issue Base URL' value={issueUrl} onChange={this.handleForm} />
                            <B.TextArea name='description' label='Description' value={description} onChange={this.handleForm} />
                            <B.ButtonGroup>
                                {formType === 'create' ?
                                    <B.Button type='primary' onClick={this.create}>Create</B.Button>
                                    :
                                    <B.Button type='primary' onClick={this.update}>Update</B.Button>
                                }
                                <B.Button onClick={this.cancel}>Cancel</B.Button>
                                {formType === 'update' &&
                                    <B.Button type='danger' loading={syncing} onClick={this.sync}>Sync Now</B.Button>
                                }
                            </B.ButtonGroup>
                        </B.Content>
                    }
                </B.Column>
            </B.Columns>
        );
    }

    showDetail = (index) => (e) => {
        this.setState({
            data: this.state.settings[index],
            formType: 'update',
            currentIndex: index
        });
    };

    showCreateForm = () => {
        const newData = initData();
        this.setState({
            data: newData,
            formType: 'create',
            currentIndex: this.state.settings.length,
            settings: this.state.settings.concat([newData])
        });
    };

    create = () => {
        WebApi.create<SyncSetting>('syncsettings', null, this.state.data)
            .then(newSyncSetting => {
                const settings = this.state.settings.slice(0, this.state.settings.length - 1)
                this.setState({
                    settings: settings.concat([newSyncSetting]),
                    formType: null,
                    currentIndex: null
                });
            });
    };

    update = () => {
        WebApi.update<SyncSetting>(`syncsettings/${this.state.data._id}`, this.state.data._rev, this.state.data)
            .then(syncSetting => {
                this.setState({
                    settings: this.state.settings.map(x => {
                        if (x._id === syncSetting._id) {
                            return syncSetting;
                        }
                        return x;
                    })
                });
            });
    };

    cancel = () => {
        this.setState({
            data: initData(),
            settings: this.state.settings.filter(x => x._id !== null),
            formType: null,
            currentIndex: null
        });
    };

    sync = () => {
        this.setState({
            syncing: true
        })
        WebApi.post(`sync/${this.state.data._id}`, {})
            .then(result => {
                this.setState({
                    syncing: false
                })
            })
            .catch(err => {
                this.setState({
                    syncing: false
                })
            })
    };
}

function initData(): SyncSetting {
    const newData = {
        _id: null,
        _rev: null,
        name: '',
        type: 'jira',
        fetchUrl: '',
        issueUrl: '',
        schedule: '0',
        description: ''
    };
    return newData;
}

const SyncTypes = [
    {
        label: 'JIRA',
        value: 'jira'
    }
];


const hours = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];
const SchedleTypes = hours.map(x => {
    return {
        label: `${x}:00`,
        value: `${x}`
    };
});