// File Download Block - Display downloadable files/documents
const FileDownloadBlock = ({
  title = 'Download Dokumen',
  subtitle = '',
  files = [
    { name: 'Brosur Pendaftaran', url: '#', type: 'pdf', size: '2.5 MB', description: '' },
    { name: 'Formulir Pendaftaran', url: '#', type: 'pdf', size: '500 KB', description: '' },
    { name: 'Jadwal Pelajaran', url: '#', type: 'xlsx', size: '1.2 MB', description: '' },
  ],
  variant = 'list', // list, grid, card
  columns = 2,
  showFileSize = true,
  showDescription = true,
  showIcon = true,
  backgroundColor = 'white',
}) => {

  const bgClasses = {
    white: 'bg-white',
    gray: 'bg-gray-50',
    dark: 'bg-gray-900 text-white',
  };

  const getFileIcon = (type) => {
    const icons = {
      pdf: (
        <svg className="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 24 24">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 2l5 5h-5V4zM8.5 18a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm7-6H14v4h-1v-3H8.5a2.5 2.5 0 1 0 2.5 2.5V13h4.5v-1z" />
        </svg>
      ),
      doc: (
        <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 2l5 5h-5V4zM9 13h6v1H9v-1zm0 2h6v1H9v-1zm0 2h4v1H9v-1z" />
        </svg>
      ),
      docx: (
        <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 2l5 5h-5V4zM9 13h6v1H9v-1zm0 2h6v1H9v-1zm0 2h4v1H9v-1z" />
        </svg>
      ),
      xls: (
        <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 24 24">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 2l5 5h-5V4zM8 13h2v2H8v-2zm0 3h2v2H8v-2zm3-3h2v2h-2v-2zm0 3h2v2h-2v-2zm3-3h2v2h-2v-2zm0 3h2v2h-2v-2z" />
        </svg>
      ),
      xlsx: (
        <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 24 24">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 2l5 5h-5V4zM8 13h2v2H8v-2zm0 3h2v2H8v-2zm3-3h2v2h-2v-2zm0 3h2v2h-2v-2zm3-3h2v2h-2v-2zm0 3h2v2h-2v-2z" />
        </svg>
      ),
      ppt: (
        <svg className="w-8 h-8 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 2l5 5h-5V4zM9 13a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" />
        </svg>
      ),
      pptx: (
        <svg className="w-8 h-8 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 2l5 5h-5V4zM9 13a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" />
        </svg>
      ),
      zip: (
        <svg className="w-8 h-8 text-yellow-600" fill="currentColor" viewBox="0 0 24 24">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-3 16h-1v-1h1v1zm0-2h-1v-1h1v1zm0-2h-1v-1h1v1zm0-2h-1v-1h1v1zm0-2h-1V9h1v1zm0-2h-1V7h1v1zm0-2h-1V5h1v1zM13 4l5 5h-5V4z" />
        </svg>
      ),
      img: (
        <svg className="w-8 h-8 text-purple-500" fill="currentColor" viewBox="0 0 24 24">
          <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
        </svg>
      ),
      default: (
        <svg className="w-8 h-8 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 2l5 5h-5V4z" />
        </svg>
      ),
    };
    return icons[type?.toLowerCase()] || icons.default;
  };

  const renderFile = (file, idx) => {
    const fileExtension = file.type || file.url?.split('.').pop() || 'file';

    if (variant === 'card') {
      return (
        <a
          key={idx}
          href={file.url}
          target="_blank"
          rel="noopener noreferrer"
          download
          className={`block p-6 rounded-xl transition-all hover:shadow-lg hover:-translate-y-1 ${
            backgroundColor === 'dark' ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white shadow-md'
          }`}
        >
          <div className="flex flex-col items-center text-center">
            {showIcon && <div className="mb-4">{getFileIcon(fileExtension)}</div>}
            <h4 className="font-semibold mb-1">{file.name}</h4>
            {showDescription && file.description && (
              <p className={`text-sm mb-2 ${backgroundColor === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                {file.description}
              </p>
            )}
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span className="uppercase font-medium">{fileExtension}</span>
              {showFileSize && file.size && (
                <>
                  <span>•</span>
                  <span>{file.size}</span>
                </>
              )}
            </div>
          </div>
        </a>
      );
    }

    // List and Grid variants
    return (
      <a
        key={idx}
        href={file.url}
        target="_blank"
        rel="noopener noreferrer"
        download
        className={`flex items-center gap-4 p-4 rounded-lg transition-all hover:shadow-md ${
          backgroundColor === 'dark'
            ? 'bg-gray-800 hover:bg-gray-700'
            : 'bg-white border border-gray-200 hover:border-primary-300'
        }`}
      >
        {showIcon && <div className="flex-shrink-0">{getFileIcon(fileExtension)}</div>}
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold truncate">{file.name}</h4>
          {showDescription && file.description && (
            <p className={`text-sm truncate ${backgroundColor === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              {file.description}
            </p>
          )}
          <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
            <span className="uppercase font-medium">{fileExtension}</span>
            {showFileSize && file.size && (
              <>
                <span>•</span>
                <span>{file.size}</span>
              </>
            )}
          </div>
        </div>
        <div className="flex-shrink-0">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
        </div>
      </a>
    );
  };

  const columnClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <section className={`py-8 px-4 ${bgClasses[backgroundColor] || bgClasses.white}`}>
      <div className="max-w-5xl mx-auto">
        {(title || subtitle) && (
          <div className="mb-6">
            {title && <h2 className="text-2xl font-bold mb-2">{title}</h2>}
            {subtitle && (
              <p className={`${backgroundColor === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{subtitle}</p>
            )}
          </div>
        )}

        <div
          className={`grid gap-4 ${
            variant === 'list' ? 'grid-cols-1' : columnClasses[columns] || columnClasses[2]
          }`}
        >
          {files.map((file, idx) => renderFile(file, idx))}
        </div>
      </div>
    </section>
  );
};

export default FileDownloadBlock;
