import { BLOCK_REGISTRY } from './index';

const ColumnsBlock = ({
  layout = '2-1', // Options: '1-1', '1-2', '2-1', '1-1-1', '1-2-1', '2-1-1', '1-1-2', 'equal-3', 'equal-4'
  gap = 'lg',
  verticalAlign = 'start', // start, center, end, stretch
  columns = [
    { blocks: [] },
    { blocks: [] },
  ],
  reverseOnMobile = false,
}) => {
  const gapClasses = {
    none: 'gap-0',
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8',
  };

  const alignClasses = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch',
  };

  // Layout configurations with Tailwind grid classes
  const layoutConfigs = {
    // 2 columns
    '1-1': { cols: 2, template: 'grid-cols-1 md:grid-cols-2' },
    '1-2': { cols: 2, template: 'grid-cols-1 md:grid-cols-3', colSpans: ['md:col-span-1', 'md:col-span-2'] },
    '2-1': { cols: 2, template: 'grid-cols-1 md:grid-cols-3', colSpans: ['md:col-span-2', 'md:col-span-1'] },
    '1-3': { cols: 2, template: 'grid-cols-1 md:grid-cols-4', colSpans: ['md:col-span-1', 'md:col-span-3'] },
    '3-1': { cols: 2, template: 'grid-cols-1 md:grid-cols-4', colSpans: ['md:col-span-3', 'md:col-span-1'] },
    // 3 columns
    '1-1-1': { cols: 3, template: 'grid-cols-1 md:grid-cols-3' },
    'equal-3': { cols: 3, template: 'grid-cols-1 md:grid-cols-3' },
    '1-2-1': { cols: 3, template: 'grid-cols-1 md:grid-cols-4', colSpans: ['md:col-span-1', 'md:col-span-2', 'md:col-span-1'] },
    '2-1-1': { cols: 3, template: 'grid-cols-1 md:grid-cols-4', colSpans: ['md:col-span-2', 'md:col-span-1', 'md:col-span-1'] },
    '1-1-2': { cols: 3, template: 'grid-cols-1 md:grid-cols-4', colSpans: ['md:col-span-1', 'md:col-span-1', 'md:col-span-2'] },
    // 4 columns
    'equal-4': { cols: 4, template: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-4' },
  };

  const config = layoutConfigs[layout] || layoutConfigs['1-1'];

  // Render nested blocks for a column
  const renderColumnBlocks = (blocks) => {
    if (!blocks || blocks.length === 0) return null;

    return blocks.map((block, index) => {
      const BlockComponent = BLOCK_REGISTRY[block.type];
      if (!BlockComponent) {
        console.warn(`Unknown block type in column: ${block.type}`);
        return null;
      }

      return (
        <div key={block.id || index} className="column-block">
          <BlockComponent {...block.props}>
            {block.children && block.children.length > 0 && (
              <div className="block-children">
                {renderColumnBlocks(block.children)}
              </div>
            )}
          </BlockComponent>
        </div>
      );
    });
  };

  return (
    <div className="columns-block my-8">
      <div
        className={`
          grid ${config.template}
          ${gapClasses[gap] || gapClasses.lg}
          ${alignClasses[verticalAlign] || alignClasses.start}
          ${reverseOnMobile ? 'flex-col-reverse md:flex-row' : ''}
        `}
      >
        {columns.slice(0, config.cols).map((column, index) => {
          const colSpan = config.colSpans ? config.colSpans[index] : '';
          const hasBlocks = column.blocks && column.blocks.length > 0;

          return (
            <div
              key={index}
              className={`column-item ${colSpan} min-h-[50px]`}
            >
              {hasBlocks ? (
                <div className="space-y-4">
                  {renderColumnBlocks(column.blocks)}
                </div>
              ) : (
                <div className="h-full min-h-[100px] border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center text-gray-400 text-sm">
                  Kolom {index + 1} (kosong)
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ColumnsBlock;
