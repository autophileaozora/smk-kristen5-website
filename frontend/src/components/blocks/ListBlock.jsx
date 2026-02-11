const ListBlock = ({
  items = ['Item 1', 'Item 2', 'Item 3'],
  type = 'bullet',
  icon = '•',
  spacing = 'normal',
}) => {
  const spacingClasses = {
    tight: 'space-y-1',
    normal: 'space-y-2',
    loose: 'space-y-4',
  };

  const ListTag = type === 'numbered' ? 'ol' : 'ul';

  const listClasses = type === 'numbered'
    ? 'list-decimal list-inside'
    : type === 'bullet'
    ? 'list-disc list-inside'
    : '';

  return (
    <div className="my-6">
      {type === 'icon' ? (
        <ul className={`${spacingClasses[spacing] || spacingClasses.normal}`}>
          {items.map((item, index) => (
            <li key={index} className="flex items-start gap-3">
              <span className="text-primary-500 font-bold text-xl mt-0.5 flex-shrink-0">
                {icon}
              </span>
              <span className="text-gray-700">{item}</span>
            </li>
          ))}
        </ul>
      ) : (
        <ListTag className={`${listClasses} ${spacingClasses[spacing] || spacingClasses.normal} text-gray-700`}>
          {items.map((item, index) => (
            <li key={index} className="ml-4">
              {item}
            </li>
          ))}
        </ListTag>
      )}
    </div>
  );
};

export default ListBlock;
