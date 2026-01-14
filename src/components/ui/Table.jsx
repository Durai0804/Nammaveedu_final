import React from 'react';

const Table = ({
    headers,
    data,
    renderRow,
    className = '',
    emptyMessage = 'No data available',
}) => {
    return (
        <div className={`w-full overflow-x-auto custom-scrollbar ${className}`}>
            <table className="w-full border-collapse">
                <thead>
                    <tr className="bg-neutral-100 border-b border-neutral-200">
                        {headers.map((header, index) => (
                            <th
                                key={index}
                                className="px-4 py-3 text-left text-sm font-semibold text-neutral-700"
                            >
                                {header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data && data.length > 0 ? (
                        data.map((row, index) => (
                            <tr
                                key={index}
                                className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors"
                            >
                                {renderRow(row, index)}
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td
                                colSpan={headers.length}
                                className="px-4 py-8 text-center text-neutral-500"
                            >
                                {emptyMessage}
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default Table;
