import { useMemo, useRef, useCallback, useEffect, useState } from 'react';
import ReactQuill, { Quill } from 'react-quill';
import 'react-quill/dist/quill.snow.css';

// Register custom Image blot that preserves width, style, class attributes
const BlockEmbed = Quill.import('blots/block/embed');

class ResizableImage extends BlockEmbed {
  static create(value) {
    const node = super.create();
    if (typeof value === 'string') {
      node.setAttribute('src', value);
    } else {
      node.setAttribute('src', value.src || '');
      if (value.alt) node.setAttribute('alt', value.alt);
      if (value.width) node.setAttribute('width', value.width);
      if (value.style) node.setAttribute('style', value.style);
      if (value['data-size']) node.setAttribute('data-size', value['data-size']);
      if (value['data-float']) node.setAttribute('data-float', value['data-float']);
    }
    return node;
  }

  static value(node) {
    return {
      src: node.getAttribute('src'),
      alt: node.getAttribute('alt'),
      width: node.getAttribute('width'),
      style: node.getAttribute('style'),
      'data-size': node.getAttribute('data-size'),
      'data-float': node.getAttribute('data-float'),
    };
  }

  static formats(node) {
    const formats = {};
    if (node.hasAttribute('width')) formats.width = node.getAttribute('width');
    if (node.hasAttribute('style')) formats.style = node.getAttribute('style');
    if (node.hasAttribute('data-size')) formats['data-size'] = node.getAttribute('data-size');
    if (node.hasAttribute('data-float')) formats['data-float'] = node.getAttribute('data-float');
    return formats;
  }

  format(name, value) {
    if (['width', 'style', 'data-size', 'data-float'].includes(name)) {
      if (value) {
        this.domNode.setAttribute(name, value);
      } else {
        this.domNode.removeAttribute(name);
      }
    } else {
      super.format(name, value);
    }
  }
}

ResizableImage.blotName = 'image';
ResizableImage.tagName = 'IMG';
Quill.register(ResizableImage, true);

// Image toolbar component
const ImageToolbar = ({ position, onAction, onClose }) => {
  if (!position) return null;

  const sizes = [
    { label: '25%', value: '25%' },
    { label: '50%', value: '50%' },
    { label: '75%', value: '75%' },
    { label: '100%', value: '100%' },
  ];

  const floats = [
    { label: 'Kiri', value: 'left', icon: '◧' },
    { label: 'Tengah', value: 'none', icon: '▣' },
    { label: 'Kanan', value: 'right', icon: '◨' },
  ];

  return (
    <div
      className="absolute z-50 bg-white rounded-xl shadow-xl border border-gray-200 p-3 flex flex-col gap-2"
      style={{ top: position.top, left: position.left }}
      onMouseDown={(e) => e.preventDefault()}
    >
      {/* Size options */}
      <div className="flex items-center gap-1">
        <span className="text-[10px] text-gray-400 font-medium w-10">Size</span>
        {sizes.map((s) => (
          <button
            type="button"
            key={s.value}
            onClick={() => onAction('size', s.value)}
            className="px-2.5 py-1 text-xs rounded-lg hover:bg-blue-50 hover:text-[#0d76be] transition-colors border border-gray-200 font-medium"
          >
            {s.label}
          </button>
        ))}
      </div>
      {/* Float options */}
      <div className="flex items-center gap-1">
        <span className="text-[10px] text-gray-400 font-medium w-10">Wrap</span>
        {floats.map((f) => (
          <button
            type="button"
            key={f.value}
            onClick={() => onAction('float', f.value)}
            className="px-2.5 py-1 text-xs rounded-lg hover:bg-blue-50 hover:text-[#0d76be] transition-colors border border-gray-200 font-medium"
          >
            {f.icon} {f.label}
          </button>
        ))}
      </div>
      <button type="button" onClick={onClose} className="text-[10px] text-gray-400 hover:text-gray-600 text-right">
        Tutup
      </button>
    </div>
  );
};

const RichTextEditor = ({ value, onChange, placeholder = 'Masukkan teks...' }) => {
  const quillRef = useRef(null);
  const [imageToolbar, setImageToolbar] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  const modules = useMemo(
    () => ({
      toolbar: [
        [{ header: [1, 2, 3, 4, 5, 6, false] }],
        [{ font: [] }],
        [{ size: [] }],
        ['bold', 'italic', 'underline', 'strike', 'blockquote'],
        [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
        [{ color: [] }, { background: [] }],
        [{ align: [] }],
        ['link', 'image', 'video'],
        ['clean'],
      ],
      clipboard: {
        matchVisual: false,
      },
    }),
    []
  );

  const formats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent',
    'link', 'image', 'video',
    'color', 'background', 'align',
    'width', 'style', 'data-size', 'data-float',
  ];

  // Handle image click to show toolbar
  useEffect(() => {
    const editor = quillRef.current?.getEditor();
    if (!editor) return;

    const handleClick = (e) => {
      if (e.target.tagName === 'IMG') {
        const rect = e.target.getBoundingClientRect();
        const editorRect = editor.root.parentElement.getBoundingClientRect();
        setSelectedImage(e.target);
        setImageToolbar({
          top: rect.bottom - editorRect.top + 8,
          left: Math.min(rect.left - editorRect.left, editorRect.width - 320),
        });
        e.target.style.outline = '2px solid #0d76be';
        e.target.style.outlineOffset = '2px';
      } else {
        setImageToolbar(null);
        if (selectedImage) {
          selectedImage.style.outline = '';
          selectedImage.style.outlineOffset = '';
        }
        setSelectedImage(null);
      }
    };

    editor.root.addEventListener('click', handleClick);
    return () => editor.root.removeEventListener('click', handleClick);
  }, [selectedImage]);

  const handleImageAction = useCallback((action, value) => {
    if (!selectedImage) return;

    if (action === 'size') {
      selectedImage.setAttribute('width', value);
      selectedImage.setAttribute('data-size', value);
      // Reset float style to include width
      const currentFloat = selectedImage.getAttribute('data-float') || 'none';
      applyImageStyle(selectedImage, value, currentFloat);
    } else if (action === 'float') {
      const currentSize = selectedImage.getAttribute('data-size') || selectedImage.getAttribute('width') || '100%';
      selectedImage.setAttribute('data-float', value);
      applyImageStyle(selectedImage, currentSize, value);
    }

    // Trigger onChange
    const editor = quillRef.current?.getEditor();
    if (editor && onChange) {
      onChange(editor.root.innerHTML);
    }
  }, [selectedImage, onChange]);

  const applyImageStyle = (img, size, float) => {
    let style = `max-width: 100%; width: ${size}; height: auto;`;
    if (float === 'left') {
      style += ' float: left; margin-right: 1.5rem; margin-bottom: 1rem;';
    } else if (float === 'right') {
      style += ' float: right; margin-left: 1.5rem; margin-bottom: 1rem;';
    } else {
      style += ' display: block; margin-left: auto; margin-right: auto;';
    }
    img.setAttribute('style', style);
  };

  return (
    <div className="rich-text-editor relative">
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        className="bg-white rounded-lg"
      />

      {/* Image resize/float toolbar */}
      <ImageToolbar
        position={imageToolbar}
        onAction={handleImageAction}
        onClose={() => {
          setImageToolbar(null);
          if (selectedImage) {
            selectedImage.style.outline = '';
            selectedImage.style.outlineOffset = '';
          }
          setSelectedImage(null);
        }}
      />

      <style>{`
        .rich-text-editor .ql-container {
          min-height: 200px;
          font-size: 16px;
        }
        .rich-text-editor .ql-editor {
          min-height: 200px;
        }
        .rich-text-editor .ql-toolbar {
          border-top-left-radius: 0.5rem;
          border-top-right-radius: 0.5rem;
          background-color: #f9fafb;
        }
        .rich-text-editor .ql-container {
          border-bottom-left-radius: 0.5rem;
          border-bottom-right-radius: 0.5rem;
        }
        .rich-text-editor .ql-editor img {
          cursor: pointer;
          border-radius: 0.5rem;
          transition: outline 0.15s;
        }
        .rich-text-editor .ql-editor img:hover {
          outline: 2px dashed #0d76be40;
          outline-offset: 2px;
        }
        .rich-text-editor .ql-editor img[style*="float: left"],
        .rich-text-editor .ql-editor img[style*="float: right"] {
          margin-bottom: 1rem;
        }
        .rich-text-editor .ql-editor::after {
          content: "";
          display: table;
          clear: both;
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor;