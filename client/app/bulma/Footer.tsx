import * as React from 'react';

export class Footer extends React.Component<any, any> {
    render() {
        return (
            <footer className="footer">
                <div className="container">
                    <div className="content is-text-centered">
                        <p>
                            <strong>issue-memo</strong> by <a href="https://github.com/wadahiro"> @wadahiro</a>.The source code is licensed <a href="http://opensource.org/licenses/mit-license.php">MIT</a>
                        </p>
                        <p>
                            <a className="icon" href="https://github.com/wadahiro/issue-memo">
                                <i className="fa fa-github"></i>
                            </a>
                        </p>
                    </div>
                </div>
            </footer>
        );
    }
}