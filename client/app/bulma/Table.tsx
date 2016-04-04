import * as React from 'react';
import { Link } from 'react-router'
import { Pagination } from './Pagination'

export interface TableProps extends React.Props<Table> {
    fixed?: boolean;
    columnMetadata: ColumnMetadata[];
    showPagination?: boolean;
    resultsPerPage?: number;
    rowKey: string;
    results: {
        [index: string]: string | number | boolean;
    }[];
}

export interface ColumnMetadata {
    name: string;
    label?: string;
    visible?: boolean;
    width?: number | string;
    renderer?: (value: any, values: any) => React.ReactElement<any>;
}

export class Table extends React.Component<TableProps, any> {
    static defaultProps = {
        fixed: false,
        showPagination: false,
        resultsPerPage: 5,
        results: []
    };

    state = {
        currentPage: 0
    };

    render() {
        const { fixed, results, columnMetadata, resultsPerPage } = this.props;

        const visibleColumns = columnMetadata.filter(x => x.visible !== false);
        const pageSize = Math.ceil(results.length / resultsPerPage);

        const tableLayout = {} as any;
        if (fixed) {
            tableLayout.tableLayout = 'fixed';
        }

        return (
            <div>
                <table style={tableLayout} className={`table`}>
                    <thead>
                        <tr>
                            {this.renderThead(visibleColumns) }
                        </tr>
                    </thead>
                    <tbody>
                        {this.renderBody(visibleColumns, pageSize) }
                    </tbody>
                </table>
                {this.renderPagination(pageSize) }
            </div>
        );
    }

    renderThead(visibleColumns) {
        const thead = visibleColumns.map(x => {
            const thStyle = {} as any;
            if (x.width) {
                thStyle.width = x.width;
            }
            return <th key={x.name} style={thStyle}>{x.label || x.name}</th>;
        });
        return thead;
    }

    renderBody(visibleColumns, pageSize) {
        const { results, rowKey, showPagination, resultsPerPage } = this.props;

        let pageResults = results;
        if (showPagination) {
            const currentPage = fixCurrentPage(this.state.currentPage, pageSize);
            const start = currentPage * resultsPerPage;
            const end = start + resultsPerPage;
            pageResults = results.slice(start, end);
        }

        const body = pageResults.map(x => {
            const tds = visibleColumns.map(col => {
                const tdStyle = {} as any;
                tdStyle.wordBreak = 'break-all';

                const value = getValue(x, col.name);
                if (typeof value === 'undefined') {
                    return <td key={col.name} style={tdStyle}></td>;
                }
                if (col.renderer) {
                    return <td key={col.name} style={tdStyle}>{col.renderer(value, x) }</td>;
                } else {
                    return <td key={col.name} style={tdStyle}>{value}</td>;
                }
            });
            const key = x[rowKey] as string;
            return <tr key={key}>{tds}</tr>
        });
        return body;
    }

    renderPagination(pageSize) {
        const { results, showPagination, resultsPerPage } = this.props;
        let { currentPage } = this.state;

        if (!showPagination) {
            return <div />;
        }

        currentPage = fixCurrentPage(currentPage, pageSize);

        return <Pagination pageSize={pageSize} currentPage={currentPage} onChange={this.handlePageChange} />
    }

    handlePageChange = (newPage: number) => {
        this.setState({
            currentPage: newPage
        });
    };
}

function fixCurrentPage(currentPage: number, pageSize: number) {
    if (currentPage >= pageSize) {
        return pageSize - 1;
    }
    return currentPage;
}

function getValue(val: Object, path: string = '') {
    const paths = path.split('.');
    return paths.reduce((s, x) => {
        if (s === null || typeof s === 'undefined') {
            return null;
        }
        // TODO map check
        return s[x];
    }, val);
}

function LinkCell(props) {
    return <Link to={props.to} />
}