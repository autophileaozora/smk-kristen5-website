// Table Block - Display tabular data (schedules, fees, etc.)
const TableBlock = ({
  title = '',
  subtitle = '',
  headers = ['Kolom 1', 'Kolom 2', 'Kolom 3'],
  rows = [
    ['Data 1', 'Data 2', 'Data 3'],
    ['Data 4', 'Data 5', 'Data 6'],
    ['Data 7', 'Data 8', 'Data 9'],
  ],
  caption = '',
  striped = true,
  bordered = true,
  hoverable = true,
  compact = false,
  variant = 'default', // default, primary, dark
  responsive = true,
  headerAlign = 'left', // left, center, right
  cellAlign = 'left',
}) => {

  const variantClasses = {
    default: {
      header: 'bg-gray-100 text-gray-800',
      row: 'bg-white',
      stripe: 'bg-gray-50',
      border: 'border-gray-200',
      hover: 'hover:bg-gray-100',
    },
    primary: {
      header: 'bg-primary-600 text-white',
      row: 'bg-white',
      stripe: 'bg-primary-50',
      border: 'border-primary-100',
      hover: 'hover:bg-primary-100',
    },
    dark: {
      header: 'bg-gray-800 text-white',
      row: 'bg-gray-900 text-gray-100',
      stripe: 'bg-gray-800',
      border: 'border-gray-700',
      hover: 'hover:bg-gray-700',
    },
  };

  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };

  const paddingClasses = compact ? 'px-3 py-2 text-sm' : 'px-4 py-3';
  const styles = variantClasses[variant] || variantClasses.default;

  const TableWrapper = ({ children }) => {
    if (responsive) {
      return <div className="overflow-x-auto rounded-lg shadow">{children}</div>;
    }
    return <div className="rounded-lg shadow">{children}</div>;
  };

  return (
    <div className="py-6">
      {(title || subtitle) && (
        <div className="mb-4">
          {title && <h3 className="text-xl font-bold text-gray-800">{title}</h3>}
          {subtitle && <p className="text-gray-600 mt-1">{subtitle}</p>}
        </div>
      )}

      <TableWrapper>
        <table className={`w-full ${bordered ? `border ${styles.border}` : ''}`}>
          {caption && (
            <caption className="text-sm text-gray-500 py-2 text-left">{caption}</caption>
          )}

          <thead>
            <tr className={styles.header}>
              {headers.map((header, idx) => (
                <th
                  key={idx}
                  className={`${paddingClasses} font-semibold ${alignClasses[headerAlign]} ${
                    bordered ? `border ${styles.border}` : ''
                  }`}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {rows.map((row, rowIdx) => (
              <tr
                key={rowIdx}
                className={`
                  ${striped && rowIdx % 2 !== 0 ? styles.stripe : styles.row}
                  ${hoverable ? styles.hover : ''}
                  transition-colors
                `}
              >
                {row.map((cell, cellIdx) => (
                  <td
                    key={cellIdx}
                    className={`${paddingClasses} ${alignClasses[cellAlign]} ${
                      bordered ? `border ${styles.border}` : ''
                    }`}
                  >
                    {/* Support for rich cell content */}
                    {typeof cell === 'object' ? (
                      <div className="flex items-center gap-2">
                        {cell.icon && <span>{cell.icon}</span>}
                        <span className={cell.bold ? 'font-semibold' : ''}>{cell.text || cell.value}</span>
                        {cell.badge && (
                          <span
                            className={`px-2 py-0.5 text-xs rounded-full ${
                              cell.badgeColor === 'green'
                                ? 'bg-green-100 text-green-700'
                                : cell.badgeColor === 'red'
                                ? 'bg-red-100 text-red-700'
                                : cell.badgeColor === 'yellow'
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-blue-100 text-blue-700'
                            }`}
                          >
                            {cell.badge}
                          </span>
                        )}
                      </div>
                    ) : (
                      cell
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </TableWrapper>
    </div>
  );
};

export default TableBlock;
