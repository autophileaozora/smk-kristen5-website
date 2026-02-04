import { BLOCK_REGISTRY } from './blocks';

const PageRenderer = ({ blocks = [] }) => {
  const renderBlock = (block) => {
    const BlockComponent = BLOCK_REGISTRY[block.type];

    if (!BlockComponent) {
      console.warn(`Unknown block type: ${block.type}`);
      return null;
    }

    return (
      <div key={block.id} className="block-wrapper">
        <BlockComponent {...block.props}>
          {block.children && block.children.length > 0 && (
            <div className="block-children">
              {block.children.map((child) => renderBlock(child))}
            </div>
          )}
        </BlockComponent>
      </div>
    );
  };

  return (
    <div className="page-content">
      {blocks.map((block) => renderBlock(block))}
    </div>
  );
};

export default PageRenderer;
