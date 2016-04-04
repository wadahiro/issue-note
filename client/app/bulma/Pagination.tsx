import * as React from 'react';

interface Props extends React.Props<Pagination> {
    pageSize: number;
    currentPage: number;
    onChange: (nextPage: number) => void
    paddingTop?: number;
    paddingBottom?: number;
}

export class Pagination extends React.Component<Props, any> {
    static defaultProps = {
        paddingTop: 5,
        paddingBottom: 5
    };

    render() {
        const { pageSize, currentPage, paddingTop, paddingBottom } = this.props;

        const pages = [];
        for (let i = 0; i < pageSize; i++) {
            pages[i] = {
                label: i + 1
            };
            if (currentPage === i) {
                pages[i].active = true;
            }
        }

        const style = {
            paddingTop,
            paddingBottom
        };

        const isFirst = currentPage === 0;
        const isLast = currentPage === pageSize - 1;

        return (
            <nav style={style} className='pagination'>
                <ul>
                    <li >
                        <a className='icon' onClick={this.handleFirst} disabled={isFirst}><i className='fa fa-angle-double-left'></i></a>
                    </li>
                    <li >
                        <a className='icon' onClick={this.handlePrev} disabled={isFirst}><i className='fa fa-angle-left'></i></a>
                    </li>
                    { pages.map((x, index) => {
                        const isActive = x.active === true ? 'is-active' : '';
                        return (
                            <li key={x.label}>
                                <a name={String(index) } className={isActive} onClick={this.handlePageChange}>{x.label}</a>
                            </li>
                        )
                    }) }
                    <li >
                        <a className='icon' onClick={this.handleNext} disabled={isLast}><i className='fa fa-angle-right'></i></a>
                    </li>
                    <li >
                        <a className='icon' onClick={this.handleLast} disabled={isLast}><i className='fa fa-angle-double-right'></i></a>
                    </li>
                </ul>
            </nav>
        );
    }

    handleFirst = () => {
        this.props.onChange(0);
    };

    handleLast = () => {
        this.props.onChange(this.props.pageSize - 1);
    };

    handlePrev = () => {
        this.props.onChange(this.props.currentPage - 1);
    };

    handleNext = () => {
        this.props.onChange(this.props.currentPage + 1);
    };

    handlePageChange = (e) => {
        const page = e.target.name;
        this.props.onChange(Number(page));
    };
}