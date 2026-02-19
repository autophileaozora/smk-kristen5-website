import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import api from '../services/api';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';
import PageRenderer from '../components/PageRenderer';
import { BLOCK_DEFINITIONS } from '../components/blocks';

const CustomPageEditor = ({ sourceType }) => {
  const { id, jurusanId } = useParams();
  const navigate = useNavigate();
  const isJurusanMode = sourceType === 'jurusan';
  const entityId = isJurusanMode ? jurusanId : id;
  const isEditMode = isJurusanMode ? true : Boolean(id);

  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    category: 'general', // Page category
    status: 'draft',
    blocks: [],
    seo: {
      metaTitle: '',
      metaDescription: '',
      metaKeywords: [],
    },
  });

  // Page categories
  const PAGE_CATEGORIES = [
    { value: 'general', label: 'Umum' },
    { value: 'akademik', label: 'Akademik' },
    { value: 'berita', label: 'Berita & Pengumuman' },
    { value: 'fasilitas', label: 'Fasilitas' },
    { value: 'kegiatan', label: 'Kegiatan & Ekstrakurikuler' },
    { value: 'profil', label: 'Profil Sekolah' },
    { value: 'galeri', label: 'Galeri' },
    { value: 'kontak', label: 'Kontak & Informasi' },
    { value: 'pendaftaran', label: 'Pendaftaran' },
    { value: 'lainnya', label: 'Lainnya' },
  ];

  const [selectedBlock, setSelectedBlock] = useState(null);
  const [showBlockPicker, setShowBlockPicker] = useState(false);
  const [showLeftSidebar, setShowLeftSidebar] = useState(true);
  const [showRightSidebar, setShowRightSidebar] = useState(true);
  const [parentBlockId, setParentBlockId] = useState(null); // For adding nested blocks
  const [showImportModal, setShowImportModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [importContent, setImportContent] = useState('');
  const [blockSearchQuery, setBlockSearchQuery] = useState(''); // Search blocks
  const [uploadingFile, setUploadingFile] = useState(false);
  const [tabBlockContext, setTabBlockContext] = useState(null); // For adding blocks to tabs { blockId, tabIndex }
  const [columnBlockContext, setColumnBlockContext] = useState(null); // For adding blocks to columns { blockId, columnIndex }

  // Extra state for jurusan mode
  const [jurusanInfo, setJurusanInfo] = useState(null);

  useEffect(() => {
    if (isEditMode) {
      fetchPage();
    }
  }, [entityId]);

  // Auto-generate slug from title
  useEffect(() => {
    if (!isEditMode && formData.title) {
      const slug = formData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setFormData((prev) => ({ ...prev, slug }));
    }
  }, [formData.title, isEditMode]);

  // Handle ESC key to close preview modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && showPreviewModal) {
        setShowPreviewModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showPreviewModal]);

  const fetchPage = async () => {
    try {
      setLoading(true);
      if (isJurusanMode) {
        const response = await api.get(`/api/jurusan/${jurusanId}`);
        const jurusan = response.data.data.jurusan;
        setJurusanInfo({ _id: jurusan._id, name: jurusan.name, code: jurusan.code });
        setFormData((prev) => ({
          ...prev,
          title: jurusan.name,
          blocks: jurusan.blocks || [],
        }));
      } else {
        const response = await api.get(`/api/custom-pages/${id}`);
        setFormData(response.data.data);
      }
    } catch (err) {
      setError('Gagal memuat halaman');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSEOChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      seo: {
        ...prev.seo,
        [field]: value,
      },
    }));
  };

  const addBlock = (blockType, parentBlockId = null) => {
    const definition = BLOCK_DEFINITIONS.find((b) => b.type === blockType);
    if (!definition) return;

    const newBlock = {
      id: uuidv4(),
      type: blockType,
      props: { ...definition.defaultProps },
      children: [],
      order: 0,
    };

    // Check if we're adding to a tab's blocks
    if (tabBlockContext) {
      const { blockId, tabIndex } = tabBlockContext;
      // Add block to specific tab's blocks array
      const addBlockToTabRecursive = (blocks) => {
        return blocks.map((block) => {
          if (block.id === blockId) {
            const newTabs = [...(block.props.tabs || [])];
            if (newTabs[tabIndex]) {
              newTabs[tabIndex] = {
                ...newTabs[tabIndex],
                blocks: [...(newTabs[tabIndex].blocks || []), newBlock],
              };
            }
            return { ...block, props: { ...block.props, tabs: newTabs } };
          }

          let updatedBlock = { ...block };

          // Search in children
          if (block.children && block.children.length > 0) {
            updatedBlock.children = addBlockToTabRecursive(block.children);
          }

          // Search in nested tabs
          if (block.type === 'tabs' && block.props?.tabs) {
            updatedBlock.props = {
              ...updatedBlock.props,
              tabs: block.props.tabs.map((tab) => ({
                ...tab,
                blocks: tab.blocks ? addBlockToTabRecursive(tab.blocks) : [],
              })),
            };
          }

          // Search in nested columns
          if (block.type === 'columns' && block.props?.columns) {
            updatedBlock.props = {
              ...updatedBlock.props,
              columns: block.props.columns.map((col) => ({
                ...col,
                blocks: col.blocks ? addBlockToTabRecursive(col.blocks) : [],
              })),
            };
          }

          return updatedBlock;
        });
      };

      setFormData((prev) => ({
        ...prev,
        blocks: addBlockToTabRecursive(prev.blocks),
      }));
      setTabBlockContext(null);
    } else if (columnBlockContext) {
      // Add block to specific column's blocks array
      const { blockId, columnIndex } = columnBlockContext;
      const addBlockToColumnRecursive = (blocks) => {
        return blocks.map((block) => {
          if (block.id === blockId) {
            const newColumns = [...(block.props.columns || [])];
            if (newColumns[columnIndex]) {
              newColumns[columnIndex] = {
                ...newColumns[columnIndex],
                blocks: [...(newColumns[columnIndex].blocks || []), newBlock],
              };
            }
            return { ...block, props: { ...block.props, columns: newColumns } };
          }

          let updatedBlock = { ...block };

          // Search in children
          if (block.children && block.children.length > 0) {
            updatedBlock.children = addBlockToColumnRecursive(block.children);
          }

          // Search in nested tabs
          if (block.type === 'tabs' && block.props?.tabs) {
            updatedBlock.props = {
              ...updatedBlock.props,
              tabs: block.props.tabs.map((tab) => ({
                ...tab,
                blocks: tab.blocks ? addBlockToColumnRecursive(tab.blocks) : [],
              })),
            };
          }

          // Search in nested columns
          if (block.type === 'columns' && block.props?.columns) {
            updatedBlock.props = {
              ...updatedBlock.props,
              columns: block.props.columns.map((col) => ({
                ...col,
                blocks: col.blocks ? addBlockToColumnRecursive(col.blocks) : [],
              })),
            };
          }

          return updatedBlock;
        });
      };

      setFormData((prev) => ({
        ...prev,
        blocks: addBlockToColumnRecursive(prev.blocks),
      }));
      setColumnBlockContext(null);
    } else if (parentBlockId) {
      // Recursive function to add child block at any nesting level
      const addChildBlockRecursive = (blocks) => {
        return blocks.map((block) => {
          if (block.id === parentBlockId) {
            return {
              ...block,
              children: [...(block.children || []), newBlock],
            };
          }

          let updatedBlock = { ...block };

          // Search in children
          if (block.children && block.children.length > 0) {
            updatedBlock.children = addChildBlockRecursive(block.children);
          }

          // Search in nested tabs
          if (block.type === 'tabs' && block.props?.tabs) {
            updatedBlock.props = {
              ...updatedBlock.props,
              tabs: block.props.tabs.map((tab) => ({
                ...tab,
                blocks: tab.blocks ? addChildBlockRecursive(tab.blocks) : [],
              })),
            };
          }

          // Search in nested columns
          if (block.type === 'columns' && block.props?.columns) {
            updatedBlock.props = {
              ...updatedBlock.props,
              columns: block.props.columns.map((col) => ({
                ...col,
                blocks: col.blocks ? addChildBlockRecursive(col.blocks) : [],
              })),
            };
          }

          return updatedBlock;
        });
      };

      setFormData((prev) => ({
        ...prev,
        blocks: addChildBlockRecursive(prev.blocks),
      }));
    } else {
      // Add as root block
      setFormData((prev) => ({
        ...prev,
        blocks: [...prev.blocks, newBlock],
      }));
    }

    setShowBlockPicker(false);
    setSelectedBlock(newBlock);
  };

  // Function to delete a block from tab
  const deleteBlockFromTab = (tabsBlockId, tabIndex, blockId) => {
    const deleteFromTabRecursive = (blocks) => {
      return blocks.map((block) => {
        if (block.id === tabsBlockId) {
          const newTabs = [...(block.props.tabs || [])];
          if (newTabs[tabIndex]) {
            newTabs[tabIndex] = {
              ...newTabs[tabIndex],
              blocks: (newTabs[tabIndex].blocks || []).filter((b) => b.id !== blockId),
            };
          }
          return { ...block, props: { ...block.props, tabs: newTabs } };
        }

        let updatedBlock = { ...block };

        // Search in children
        if (block.children && block.children.length > 0) {
          updatedBlock.children = deleteFromTabRecursive(block.children);
        }

        // Search in nested tabs
        if (block.type === 'tabs' && block.props?.tabs) {
          updatedBlock.props = {
            ...updatedBlock.props,
            tabs: block.props.tabs.map((tab) => ({
              ...tab,
              blocks: tab.blocks ? deleteFromTabRecursive(tab.blocks) : [],
            })),
          };
        }

        // Search in nested columns
        if (block.type === 'columns' && block.props?.columns) {
          updatedBlock.props = {
            ...updatedBlock.props,
            columns: block.props.columns.map((col) => ({
              ...col,
              blocks: col.blocks ? deleteFromTabRecursive(col.blocks) : [],
            })),
          };
        }

        return updatedBlock;
      });
    };

    setFormData((prev) => ({
      ...prev,
      blocks: deleteFromTabRecursive(prev.blocks),
    }));
  };

  // Function to delete a block from column
  const deleteBlockFromColumn = (columnsBlockId, columnIndex, blockId) => {
    const deleteFromColumnRecursive = (blocks) => {
      return blocks.map((block) => {
        if (block.id === columnsBlockId) {
          const newColumns = [...(block.props.columns || [])];
          if (newColumns[columnIndex]) {
            newColumns[columnIndex] = {
              ...newColumns[columnIndex],
              blocks: (newColumns[columnIndex].blocks || []).filter((b) => b.id !== blockId),
            };
          }
          return { ...block, props: { ...block.props, columns: newColumns } };
        }

        let updatedBlock = { ...block };

        // Search in children
        if (block.children && block.children.length > 0) {
          updatedBlock.children = deleteFromColumnRecursive(block.children);
        }

        // Search in nested tabs
        if (block.type === 'tabs' && block.props?.tabs) {
          updatedBlock.props = {
            ...updatedBlock.props,
            tabs: block.props.tabs.map((tab) => ({
              ...tab,
              blocks: tab.blocks ? deleteFromColumnRecursive(tab.blocks) : [],
            })),
          };
        }

        // Search in nested columns
        if (block.type === 'columns' && block.props?.columns) {
          updatedBlock.props = {
            ...updatedBlock.props,
            columns: block.props.columns.map((col) => ({
              ...col,
              blocks: col.blocks ? deleteFromColumnRecursive(col.blocks) : [],
            })),
          };
        }

        return updatedBlock;
      });
    };

    setFormData((prev) => ({
      ...prev,
      blocks: deleteFromColumnRecursive(prev.blocks),
    }));
  };

  const updateBlock = (blockId, updates) => {
    // Recursive function to update block at any nesting level (including tab blocks)
    const updateBlockRecursive = (blocks) => {
      return blocks.map((block) => {
        if (block.id === blockId) {
          return { ...block, props: { ...block.props, ...updates } };
        }

        // Search in children
        if (block.children && block.children.length > 0) {
          const updatedChildren = updateBlockRecursive(block.children);
          if (updatedChildren !== block.children) {
            return { ...block, children: updatedChildren };
          }
        }

        // Search in tab blocks (for Tabs component)
        if (block.type === 'tabs' && block.props?.tabs) {
          let tabsUpdated = false;
          const newTabs = block.props.tabs.map((tab) => {
            if (tab.blocks && tab.blocks.length > 0) {
              const updatedBlocks = updateBlockRecursive(tab.blocks);
              if (updatedBlocks !== tab.blocks) {
                tabsUpdated = true;
                return { ...tab, blocks: updatedBlocks };
              }
            }
            return tab;
          });
          if (tabsUpdated) {
            return { ...block, props: { ...block.props, tabs: newTabs } };
          }
        }

        // Search in column blocks (for Columns component)
        if (block.type === 'columns' && block.props?.columns) {
          let columnsUpdated = false;
          const newColumns = block.props.columns.map((column) => {
            if (column.blocks && column.blocks.length > 0) {
              const updatedBlocks = updateBlockRecursive(column.blocks);
              if (updatedBlocks !== column.blocks) {
                columnsUpdated = true;
                return { ...column, blocks: updatedBlocks };
              }
            }
            return column;
          });
          if (columnsUpdated) {
            return { ...block, props: { ...block.props, columns: newColumns } };
          }
        }

        return block;
      });
    };

    setFormData((prev) => ({
      ...prev,
      blocks: updateBlockRecursive(prev.blocks),
    }));
  };

  const deleteBlock = (blockId) => {
    setFormData((prev) => ({
      ...prev,
      blocks: prev.blocks.filter((block) => block.id !== blockId),
    }));
    setSelectedBlock(null);
  };

  const moveBlock = (blockId, direction) => {
    const blocks = [...formData.blocks];
    const index = blocks.findIndex((b) => b.id === blockId);
    if (index === -1) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= blocks.length) return;

    [blocks[index], blocks[newIndex]] = [blocks[newIndex], blocks[index]];
    setFormData((prev) => ({ ...prev, blocks }));
  };

  const handleImportContent = () => {
    if (!importContent.trim()) {
      alert('Silakan masukkan konten terlebih dahulu');
      return;
    }

    const newBlocks = [];
    let html = importContent.trim();

    // Helper to create a block
    const createBlock = (type, props) => ({
      id: uuidv4(),
      type,
      props,
      children: [],
      order: newBlocks.length,
    });

    // Parse HTML using DOMParser for better accuracy
    const parser = new DOMParser();
    const doc = parser.parseFromString(`<div>${html}</div>`, 'text/html');
    const container = doc.body.firstChild;

    // Collect consecutive paragraphs to group them
    let paragraphBuffer = [];

    const flushParagraphs = () => {
      if (paragraphBuffer.length > 0) {
        const content = paragraphBuffer.join('');
        if (content.trim()) {
          newBlocks.push(createBlock('text', { content }));
        }
        paragraphBuffer = [];
      }
    };

    // Process each child element
    const processNode = (node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent.trim();
        if (text) {
          paragraphBuffer.push(`<p>${text}</p>`);
        }
        return;
      }

      if (node.nodeType !== Node.ELEMENT_NODE) return;

      const tagName = node.tagName.toLowerCase();

      // Handle headings
      if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tagName)) {
        flushParagraphs();
        const level = tagName; // 'h1', 'h2', etc.
        const text = node.textContent.trim();
        if (text) {
          newBlocks.push(createBlock('heading', {
            text,
            level,
            align: 'left',
          }));
        }
        return;
      }

      // Handle lists
      if (tagName === 'ul' || tagName === 'ol') {
        flushParagraphs();
        const items = Array.from(node.querySelectorAll('li')).map(li => li.textContent.trim());
        if (items.length > 0) {
          newBlocks.push(createBlock('list', {
            items,
            type: tagName === 'ol' ? 'numbered' : 'bullet',
            spacing: 'normal',
          }));
        }
        return;
      }

      // Handle images
      if (tagName === 'img') {
        flushParagraphs();
        const src = node.getAttribute('src') || '';
        const alt = node.getAttribute('alt') || '';
        if (src) {
          newBlocks.push(createBlock('image', {
            src,
            alt,
            caption: alt,
          }));
        }
        return;
      }

      // Handle tables - convert to text for now
      if (tagName === 'table') {
        flushParagraphs();
        newBlocks.push(createBlock('text', {
          content: node.outerHTML,
        }));
        return;
      }

      // Handle paragraphs and divs
      if (tagName === 'p' || tagName === 'div') {
        const innerHtml = node.innerHTML.trim();
        if (innerHtml) {
          // Check if it contains only an image
          if (node.querySelector('img') && node.textContent.trim() === '') {
            const img = node.querySelector('img');
            flushParagraphs();
            newBlocks.push(createBlock('image', {
              src: img.getAttribute('src') || '',
              alt: img.getAttribute('alt') || '',
              caption: img.getAttribute('alt') || '',
            }));
          } else {
            paragraphBuffer.push(`<p>${innerHtml}</p>`);
          }
        }
        return;
      }

      // Handle blockquote
      if (tagName === 'blockquote') {
        flushParagraphs();
        const text = node.textContent.trim();
        if (text) {
          newBlocks.push(createBlock('quote', {
            quote: text,
            author: '',
            variant: 'default',
          }));
        }
        return;
      }

      // Handle br - add to paragraph buffer
      if (tagName === 'br') {
        return;
      }

      // For other elements, process children
      if (node.childNodes.length > 0) {
        Array.from(node.childNodes).forEach(processNode);
      } else {
        const text = node.textContent.trim();
        if (text) {
          paragraphBuffer.push(`<p>${node.outerHTML}</p>`);
        }
      }
    };

    // Process all children
    Array.from(container.childNodes).forEach(processNode);
    flushParagraphs(); // Flush any remaining paragraphs

    if (newBlocks.length > 0) {
      setFormData((prev) => ({
        ...prev,
        blocks: [...prev.blocks, ...newBlocks],
      }));
      setShowImportModal(false);
      setImportContent('');
      alert(`Berhasil mengimport ${newBlocks.length} block konten!`);
    } else {
      alert('Tidak ada konten yang dapat diimport. Pastikan HTML valid.');
    }
  };

  // File upload handler
  const handleFileUpload = async (file, propName, blockId) => {
    if (!file) return;

    setUploadingFile(true);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append('image', file);

      const response = await api.post('/api/upload/image', formDataUpload, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 60000, // 60 second timeout
      });

      const fileUrl = response.data.url || response.data.data?.url;
      if (fileUrl) {
        updateBlock(blockId, { [propName]: fileUrl });
      } else {
        alert('Upload berhasil tapi tidak ada URL gambar.');
      }
    } catch (err) {
      console.error('Upload error:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Unknown error';
      alert(`Gagal mengupload: ${errorMsg}`);
    } finally {
      setUploadingFile(false);
    }
  };

  const handleSave = async (publishNow = false) => {
    try {
      setSaving(true);
      setError(null);

      if (isJurusanMode) {
        const saveId = jurusanInfo?._id || jurusanId;
        await api.put(`/api/jurusan/${saveId}/blocks`, {
          blocks: formData.blocks,
        });
        navigate('/admin/jurusan');
      } else {
        const dataToSave = {
          ...formData,
          status: publishNow ? 'published' : formData.status,
        };

        if (isEditMode) {
          await api.put(`/api/custom-pages/${id}`, dataToSave);
        } else {
          await api.post('/api/custom-pages', dataToSave);
        }

        navigate('/admin/custom-pages');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menyimpan halaman');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  // Group blocks by category
  const blocksByCategory = BLOCK_DEFINITIONS.reduce((acc, block) => {
    if (!acc[block.category]) {
      acc[block.category] = [];
    }
    acc[block.category].push(block);
    return acc;
  }, {});

  return (
    <div className="h-screen bg-gray-100 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b z-50 shadow-sm flex-shrink-0">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(isJurusanMode ? '/admin/jurusan' : '/admin/custom-pages')}
              >
                ← Kembali
              </Button>
              <div>
                {isJurusanMode ? (
                  <div>
                    <span className="text-xl font-bold">{jurusanInfo?.name || 'Jurusan'}</span>
                    {jurusanInfo?.code && (
                      <span className="ml-2 text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">{jurusanInfo.code}</span>
                    )}
                  </div>
                ) : (
                  <input
                    type="text"
                    placeholder="Judul Halaman..."
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className="text-xl font-bold border-none focus:outline-none focus:ring-0 p-0 bg-transparent"
                  />
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPreviewModal(true)}
                disabled={formData.blocks.length === 0}
              >
                👁️ Preview
              </Button>
              {!isJurusanMode && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowImportModal(true)}
                >
                  📥 Import Konten
                </Button>
              )}
              {isJurusanMode ? (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleSave()}
                  loading={saving}
                >
                  💾 Simpan
                </Button>
              ) : (
              <>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleSave(false)}
                  loading={saving}
                  disabled={!formData.title}
                >
                  💾 Simpan Draft
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleSave(true)}
                  loading={saving}
                  disabled={!formData.title}
                >
                  🚀 Publish
                </Button>
              </>
              )}
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="px-4 py-2 flex-shrink-0">
          <Alert type="error" message={error} onClose={() => setError(null)} />
        </div>
      )}

      {/* Main Editor Layout */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Sidebar Toggle Button */}
        <button
          onClick={() => setShowLeftSidebar(!showLeftSidebar)}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white border border-gray-300 rounded-r-lg p-2 shadow-lg hover:bg-gray-50"
          style={{ left: showLeftSidebar ? '320px' : '0' }}
          title={showLeftSidebar ? 'Sembunyikan sidebar' : 'Tampilkan sidebar'}
        >
          {showLeftSidebar ? '◀' : '▶'}
        </button>

        {/* Left Sidebar - Page Settings (Collapsible) */}
        {showLeftSidebar && (
          <div className="w-80 bg-white border-r overflow-y-auto p-4 space-y-4 flex-shrink-0">
          {isJurusanMode ? (
            <div>
              <h3 className="text-sm font-bold text-gray-700 mb-3 uppercase">Info Jurusan</h3>
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="font-bold text-gray-800">{jurusanInfo?.name}</p>
                <p className="text-sm text-gray-500 mt-1">Kode: {jurusanInfo?.code}</p>
              </div>
              <p className="text-xs text-gray-500 mt-3">
                Gunakan block editor untuk mengatur layout halaman jurusan ini. Blocks akan ditampilkan di tab Informasi pada halaman detail jurusan.
              </p>
            </div>
          ) : (
          <>
          <div>
            <h3 className="text-sm font-bold text-gray-700 mb-3 uppercase">Pengaturan</h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Slug</label>
                <input
                  type="text"
                  placeholder="url-halaman"
                  value={formData.slug}
                  onChange={(e) => handleInputChange('slug', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">/page/{formData.slug || '[slug]'}</p>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Deskripsi</label>
                <textarea
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows="3"
                  placeholder="Deskripsi singkat..."
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                <select
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Kategori</label>
                <select
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.category || 'general'}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                >
                  {PAGE_CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="text-sm font-bold text-gray-700 mb-3 uppercase">SEO</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Meta Title</label>
                <input
                  type="text"
                  value={formData.seo.metaTitle}
                  onChange={(e) => handleSEOChange('metaTitle', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Meta Description</label>
                <textarea
                  value={formData.seo.metaDescription}
                  onChange={(e) => handleSEOChange('metaDescription', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                  rows="3"
                />
              </div>
            </div>
          </div>
          </>
          )}
        </div>
        )}

        {/* Center - Live Preview */}
        <div className="flex-1 overflow-y-auto bg-gray-100 p-8 min-h-0">
          <div className="max-w-5xl mx-auto">
            {/* Preview Canvas */}
            <div className="bg-white shadow-lg rounded-lg overflow-hidden">
              {/* Page Header in Preview */}
              {formData.title && !isJurusanMode && (
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-8">
                  <h1 className="text-4xl font-bold mb-2">{formData.title}</h1>
                  {formData.description && (
                    <p className="text-blue-100 text-lg">{formData.description}</p>
                  )}
                </div>
              )}

              {/* Blocks Preview */}
              <div className="p-8">
                {formData.blocks.length === 0 ? (
                  <div className="text-center py-20 text-gray-400">
                    <div className="text-6xl mb-4">📄</div>
                    <p className="text-xl mb-2">Halaman Kosong</p>
                    <p className="text-sm mb-6">Tambahkan block untuk mulai membuat konten</p>
                    <Button
                      variant="primary"
                      size="md"
                      onClick={() => {
                        setParentBlockId(null);
                        setShowBlockPicker(true);
                      }}
                    >
                      + Tambah Block Pertama
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-0">
                    {formData.blocks.map((block, index) => {
                      const definition = BLOCK_DEFINITIONS.find((d) => d.type === block.type);
                      return (
                        <div
                          key={block.id}
                          className={`relative group transition-all ${
                            selectedBlock?.id === block.id
                              ? 'ring-2 ring-blue-500 ring-offset-2 rounded-lg'
                              : 'hover:ring-2 hover:ring-gray-300 hover:ring-offset-2 rounded-lg'
                          }`}
                          onClick={() => setSelectedBlock(block)}
                        >
                          {/* Block Toolbar */}
                          <div className={`absolute -top-10 left-0 right-0 flex items-center justify-between px-3 py-1 bg-gray-800 text-white text-xs rounded-t-lg opacity-0 group-hover:opacity-100 transition-opacity ${selectedBlock?.id === block.id ? 'opacity-100' : ''}`}>
                            <span className="flex items-center gap-2">
                              <span>{definition?.icon}</span>
                              <span>{definition?.name}</span>
                            </span>
                            <div className="flex items-center gap-1">
                              {index > 0 && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    moveBlock(block.id, 'up');
                                  }}
                                  className="px-2 py-1 hover:bg-gray-700 rounded"
                                  title="Pindah ke atas"
                                >
                                  ↑
                                </button>
                              )}
                              {index < formData.blocks.length - 1 && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    moveBlock(block.id, 'down');
                                  }}
                                  className="px-2 py-1 hover:bg-gray-700 rounded"
                                  title="Pindah ke bawah"
                                >
                                  ↓
                                </button>
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (confirm('Hapus block ini?')) {
                                    deleteBlock(block.id);
                                  }
                                }}
                                className="px-2 py-1 hover:bg-red-600 rounded"
                                title="Hapus"
                              >
                                🗑️
                              </button>
                            </div>
                          </div>

                          {/* Render Block */}
                          <div onClick={(e) => e.stopPropagation()}>
                            <PageRenderer blocks={[block]} />
                          </div>

                          {/* Child Blocks - Available for ALL blocks */}
                          <NestedBlocksRenderer
                            parentBlock={block}
                            selectedBlock={selectedBlock}
                            setSelectedBlock={setSelectedBlock}
                            setParentBlockId={setParentBlockId}
                            setShowBlockPicker={setShowBlockPicker}
                            onDeleteNestedBlock={(parentId, childId) => {
                              // Recursive delete function
                              const deleteNestedRecursive = (blocks, targetParentId, targetChildId) => {
                                return blocks.map((b) => {
                                  if (b.id === targetParentId) {
                                    return {
                                      ...b,
                                      children: (b.children || []).filter((c) => c.id !== targetChildId),
                                    };
                                  }

                                  let updatedBlock = { ...b };

                                  // Search in children
                                  if (b.children && b.children.length > 0) {
                                    updatedBlock.children = deleteNestedRecursive(b.children, targetParentId, targetChildId);
                                  }

                                  // Search in nested tabs
                                  if (b.type === 'tabs' && b.props?.tabs) {
                                    updatedBlock.props = {
                                      ...updatedBlock.props,
                                      tabs: b.props.tabs.map((tab) => ({
                                        ...tab,
                                        blocks: tab.blocks ? deleteNestedRecursive(tab.blocks, targetParentId, targetChildId) : [],
                                      })),
                                    };
                                  }

                                  // Search in nested columns
                                  if (b.type === 'columns' && b.props?.columns) {
                                    updatedBlock.props = {
                                      ...updatedBlock.props,
                                      columns: b.props.columns.map((col) => ({
                                        ...col,
                                        blocks: col.blocks ? deleteNestedRecursive(col.blocks, targetParentId, targetChildId) : [],
                                      })),
                                    };
                                  }

                                  return updatedBlock;
                                });
                              };
                              setFormData((prev) => ({
                                ...prev,
                                blocks: deleteNestedRecursive(prev.blocks, parentId, childId),
                              }));
                              if (selectedBlock?.id === childId) {
                                setSelectedBlock(null);
                              }
                            }}
                            level={0}
                          />
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Add Block Button (Floating) */}
                {formData.blocks.length > 0 && (
                  <div className="text-center mt-8">
                    <Button
                      variant="outline"
                      size="md"
                      onClick={() => {
                        setParentBlockId(null);
                        setShowBlockPicker(true);
                      }}
                    >
                      + Tambah Block
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar Toggle Button */}
        {selectedBlock && (
          <button
            onClick={() => setShowRightSidebar(!showRightSidebar)}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white border border-gray-300 rounded-l-lg p-2 shadow-lg hover:bg-gray-50"
            style={{ right: showRightSidebar ? '384px' : '0' }}
            title={showRightSidebar ? 'Sembunyikan panel' : 'Tampilkan panel'}
          >
            {showRightSidebar ? '▶' : '◀'}
          </button>
        )}

        {/* Right Sidebar - Block Editor */}
        {selectedBlock && showRightSidebar && (() => {
          // Recursive function to find block at any nesting level (including tab and column blocks)
          const findBlockRecursive = (blocks, targetId) => {
            for (const block of blocks) {
              if (block.id === targetId) return block;

              // Search in children
              if (block.children && block.children.length > 0) {
                const found = findBlockRecursive(block.children, targetId);
                if (found) return found;
              }

              // Search in tab blocks (for Tabs component)
              if (block.type === 'tabs' && block.props?.tabs) {
                for (const tab of block.props.tabs) {
                  if (tab.blocks && tab.blocks.length > 0) {
                    const found = findBlockRecursive(tab.blocks, targetId);
                    if (found) return found;
                  }
                }
              }

              // Search in column blocks (for Columns component)
              if (block.type === 'columns' && block.props?.columns) {
                for (const column of block.props.columns) {
                  if (column.blocks && column.blocks.length > 0) {
                    const found = findBlockRecursive(column.blocks, targetId);
                    if (found) return found;
                  }
                }
              }
            }
            return null;
          };

          // Find parent block for breadcrumb navigation
          const findParentBlock = (blocks, targetId, parent = null) => {
            for (const block of blocks) {
              if (block.id === targetId) return parent;

              // Search in children
              if (block.children && block.children.length > 0) {
                const found = findParentBlock(block.children, targetId, block);
                if (found !== undefined) return found;
              }

              // Search in tab blocks
              if (block.type === 'tabs' && block.props?.tabs) {
                for (const tab of block.props.tabs) {
                  if (tab.blocks && tab.blocks.length > 0) {
                    for (const tabBlock of tab.blocks) {
                      if (tabBlock.id === targetId) return block; // Parent is the Tabs block
                    }
                    const found = findParentBlock(tab.blocks, targetId, block);
                    if (found !== undefined) return found;
                  }
                }
              }

              // Search in column blocks
              if (block.type === 'columns' && block.props?.columns) {
                for (const column of block.props.columns) {
                  if (column.blocks && column.blocks.length > 0) {
                    for (const colBlock of column.blocks) {
                      if (colBlock.id === targetId) return block; // Parent is the Columns block
                    }
                    const found = findParentBlock(column.blocks, targetId, block);
                    if (found !== undefined) return found;
                  }
                }
              }
            }
            return undefined;
          };

          // Find the current block from formData to get the latest state
          const currentBlock = findBlockRecursive(formData.blocks, selectedBlock.id);
          const parentBlock = findParentBlock(formData.blocks, selectedBlock.id);

          if (!currentBlock) return null;

          const parentDef = parentBlock ? BLOCK_DEFINITIONS.find((d) => d.type === parentBlock.type) : null;
          const currentDef = BLOCK_DEFINITIONS.find((d) => d.type === currentBlock.type);

          return (
            <div className="w-96 bg-white border-l overflow-y-auto p-4 flex-shrink-0">
              <div className="mb-4">
                {/* Back to parent button when editing nested block */}
                {parentBlock && (
                  <button
                    onClick={() => setSelectedBlock(parentBlock)}
                    className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 mb-3 w-full p-2 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <span>←</span>
                    <span>Kembali ke {parentDef?.name || 'Parent Block'}</span>
                  </button>
                )}

                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-gray-700 uppercase">Block Settings</h3>
                  <button
                    onClick={() => setSelectedBlock(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>

                {/* Breadcrumb when editing nested block */}
                {parentBlock && (
                  <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
                    <span>{parentDef?.icon}</span>
                    <span>{parentDef?.name}</span>
                    <span>→</span>
                    <span className="text-blue-600 font-medium">{currentDef?.name}</span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                  <span className="text-2xl">
                    {currentDef?.icon}
                  </span>
                  <div>
                    <p className="font-medium">
                      {currentDef?.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {currentDef?.description}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <BlockEditor
                  block={currentBlock}
                  onChange={(updates) => updateBlock(currentBlock.id, updates)}
                  onFileUpload={(file, propName) => handleFileUpload(file, propName, currentBlock.id)}
                  uploadingFile={uploadingFile}
                  onAddBlockToTab={(tabIndex) => {
                    setTabBlockContext({ blockId: currentBlock.id, tabIndex });
                    setShowBlockPicker(true);
                  }}
                  onDeleteBlockFromTab={(tabIndex, blockId) => deleteBlockFromTab(currentBlock.id, tabIndex, blockId)}
                  onAddBlockToColumn={(columnIndex) => {
                    setColumnBlockContext({ blockId: currentBlock.id, columnIndex });
                    setShowBlockPicker(true);
                  }}
                  onDeleteBlockFromColumn={(columnIndex, blockId) => deleteBlockFromColumn(currentBlock.id, columnIndex, blockId)}
                  onSelectBlock={(block) => setSelectedBlock(block)}
                />
              </div>
            </div>
          );
        })()}
      </div>

      {/* Block Picker Modal */}
      {showBlockPicker && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => {
            setShowBlockPicker(false);
            setParentBlockId(null);
            setTabBlockContext(null);
            setColumnBlockContext(null);
            setBlockSearchQuery('');
          }}
        >
          <div
            className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sticky Header with Search */}
            <div className="sticky top-0 z-10 bg-white border-b p-6 pb-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">
                  {tabBlockContext
                    ? `Tambah Block ke Tab ${tabBlockContext.tabIndex + 1}`
                    : columnBlockContext
                    ? `Tambah Block ke Kolom ${columnBlockContext.columnIndex + 1}`
                    : parentBlockId
                    ? 'Pilih Nested Block'
                    : 'Pilih Block'}
                </h2>
                <div className="flex items-center gap-2">
                  {tabBlockContext && (
                    <span className="text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">
                      📑 Tab Block
                    </span>
                  )}
                  {columnBlockContext && (
                    <span className="text-sm text-purple-600 bg-purple-50 px-3 py-1 rounded-full">
                      📊 Column Block
                    </span>
                  )}
                  {parentBlockId && !tabBlockContext && !columnBlockContext && (
                    <span className="text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                      🔗 Nested Block
                    </span>
                  )}
                  <button
                    onClick={() => {
                      setShowBlockPicker(false);
                      setParentBlockId(null);
                      setTabBlockContext(null);
                      setColumnBlockContext(null);
                      setBlockSearchQuery('');
                    }}
                    className="text-gray-400 hover:text-gray-600 text-xl"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Search Input - Sticky */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="🔍 Cari block... (cth: image, text, carousel)"
                  value={blockSearchQuery}
                  onChange={(e) => setBlockSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  autoFocus
                />
                {blockSearchQuery && (
                  <button
                    onClick={() => setBlockSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Scrollable Block List */}
            <div className="flex-1 overflow-y-auto p-6 pt-4">

              {/* Filtered Blocks */}
              {(() => {
                const filteredBlocksByCategory = Object.entries(blocksByCategory).reduce((acc, [category, blocks]) => {
                  const filtered = blocks.filter(block =>
                    blockSearchQuery === '' ||
                    block.name.toLowerCase().includes(blockSearchQuery.toLowerCase()) ||
                    block.type.toLowerCase().includes(blockSearchQuery.toLowerCase()) ||
                    block.description?.toLowerCase().includes(blockSearchQuery.toLowerCase())
                  );
                  if (filtered.length > 0) {
                    acc[category] = filtered;
                  }
                  return acc;
                }, {});

                if (Object.keys(filteredBlocksByCategory).length === 0) {
                  return (
                    <div className="text-center py-8 text-gray-500">
                      <p className="text-4xl mb-2">🔍</p>
                      <p>Tidak ada block yang cocok dengan "{blockSearchQuery}"</p>
                    </div>
                  );
                }

                return Object.entries(filteredBlocksByCategory).map(([category, blocks]) => (
                  <div key={category} className="mb-6">
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      {category}
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                        {blocks.length}
                      </span>
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {blocks.map((block) => (
                        <button
                          key={block.type}
                          onClick={() => {
                            addBlock(block.type, parentBlockId);
                            setParentBlockId(null);
                            setBlockSearchQuery('');
                          }}
                          className="p-4 border border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left group"
                        >
                          <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">{block.icon}</div>
                          <p className="font-medium text-sm">{block.name}</p>
                          <p className="text-xs text-gray-500 line-clamp-2">
                            {block.description}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                ));
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Import Content Modal */}
      {showImportModal && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowImportModal(false)}
        >
          <div
            className="bg-white rounded-lg max-w-3xl w-full max-h-[80vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">📥 Import Konten</h2>
                <button
                  onClick={() => setShowImportModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                {/* Upload Document File */}
                <div className="bg-green-50 border-2 border-dashed border-green-300 rounded-lg p-6">
                  <div className="text-center">
                    <p className="text-lg font-medium text-green-800 mb-2">📄 Upload File Word</p>
                    <p className="text-sm text-green-600 mb-4">Support: Word (.docx, .doc)</p>
                    <label className="cursor-pointer">
                      <div className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                        <span>📁</span>
                        <span>Pilih File Word</span>
                      </div>
                      <input
                        type="file"
                        accept=".docx,.doc,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;

                          try {
                            const formData = new FormData();
                            formData.append('document', file);

                            const response = await api.post('/api/upload/parse-document', formData, {
                              headers: { 'Content-Type': 'multipart/form-data' },
                            });

                            if (response.data.success) {
                              setImportContent(response.data.data.html);
                              alert('File Word berhasil diparse! Silakan review dan klik Import.');
                            }
                          } catch (err) {
                            console.error('Parse error:', err);
                            alert('Gagal memproses file. Pastikan file adalah .docx atau .doc yang valid.');
                          }
                        }}
                      />
                    </label>
                    <p className="text-xs text-green-600 mt-3">💡 Format teks akan dipertahankan (bold, italic, heading, list)</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <hr className="flex-1 border-gray-300" />
                  <span className="text-gray-500 text-sm">atau</span>
                  <hr className="flex-1 border-gray-300" />
                </div>

                {/* Manual Paste */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800 mb-2">
                    <strong>💡 Cara Import Manual:</strong>
                  </p>
                  <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
                    <li>Paste HTML dari Word, Google Docs, atau editor lain</li>
                    <li>Format akan dipertahankan (bold, italic, link, gambar)</li>
                  </ul>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Paste atau edit konten HTML:
                  </label>
                  <textarea
                    value={importContent}
                    onChange={(e) => setImportContent(e.target.value)}
                    placeholder="Paste konten HTML di sini atau upload file .docx di atas..."
                    className="w-full h-48 px-4 py-3 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <button
                    onClick={() => {
                      setImportContent('');
                      setShowImportModal(false);
                    }}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Batal
                  </button>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setImportContent('')}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                    >
                      Clear
                    </button>
                    <Button
                      variant="primary"
                      size="md"
                      onClick={handleImportContent}
                      disabled={!importContent.trim()}
                    >
                      📥 Import ke Halaman
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Full Preview Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 bg-black/90 z-50 flex flex-col">
          {/* Preview Header */}
          <div className="bg-white border-b px-4 py-3 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-4">
              <h2 className="text-lg font-bold text-gray-800">👁️ Preview Halaman</h2>
              <span className="text-sm text-gray-500">
                {formData.title || 'Untitled Page'}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-400">
                Tekan ESC atau klik tombol untuk keluar
              </span>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <span>✕</span>
                <span>Tutup Preview</span>
              </button>
            </div>
          </div>

          {/* Preview Content */}
          <div className="flex-1 overflow-auto bg-white">
            <div className="min-h-full">
              {/* Page Title Section */}
              {formData.title && (
                <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-12 px-4">
                  <div className="max-w-5xl mx-auto">
                    <h1 className="text-3xl md:text-4xl font-bold">{formData.title}</h1>
                    {formData.description && (
                      <p className="mt-3 text-lg text-white/80">{formData.description}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Page Content */}
              <div className="py-8">
                {formData.blocks.length > 0 ? (
                  <PageRenderer blocks={formData.blocks} />
                ) : (
                  <div className="text-center py-20 text-gray-400">
                    <p className="text-6xl mb-4">📄</p>
                    <p className="text-xl">Halaman masih kosong</p>
                    <p className="text-sm mt-2">Tambahkan block untuk melihat preview</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Nested Blocks Renderer Component (Recursive)
const NestedBlocksRenderer = ({
  parentBlock,
  selectedBlock,
  setSelectedBlock,
  setParentBlockId,
  setShowBlockPicker,
  onDeleteNestedBlock,
  level = 0,
}) => {
  const maxLevel = 5; // Maximum nesting depth for visual clarity
  const bgColors = ['bg-gray-50', 'bg-blue-50', 'bg-green-50', 'bg-yellow-50', 'bg-purple-50'];
  const bgColor = bgColors[level % bgColors.length];

  return (
    <div className={`mt-2 p-3 ${bgColor} border-2 border-dashed border-gray-300 rounded-lg`}>
      <p className="text-xs text-gray-500 text-center mb-2 flex items-center justify-center gap-1">
        <span>📦</span>
        <span>Nested Blocks ({parentBlock.children?.length || 0})</span>
        {level > 0 && <span className="text-xs bg-gray-200 px-1 rounded">Level {level + 1}</span>}
      </p>

      {parentBlock.children && parentBlock.children.length > 0 ? (
        <div className="space-y-2">
          {parentBlock.children.map((childBlock) => {
            const childDefinition = BLOCK_DEFINITIONS.find((d) => d.type === childBlock.type);
            return (
              <div
                key={childBlock.id}
                className={`bg-white p-2 rounded border-2 cursor-pointer transition-all ${
                  selectedBlock?.id === childBlock.id
                    ? 'border-blue-500 ring-2 ring-blue-200'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedBlock(childBlock);
                }}
              >
                {/* Nested Block Toolbar */}
                <div className="flex items-center justify-between mb-2 text-xs text-gray-600">
                  <span className="flex items-center gap-1">
                    <span>{childDefinition?.icon}</span>
                    <span className="font-medium">{childDefinition?.name}</span>
                  </span>
                  <div className="flex items-center gap-1">
                    {level < maxLevel && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setParentBlockId(childBlock.id);
                          setShowBlockPicker(true);
                        }}
                        className="px-2 py-0.5 bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
                        title="Add nested block inside"
                      >
                        +
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteNestedBlock(parentBlock.id, childBlock.id);
                      }}
                      className="px-2 py-0.5 bg-red-100 text-red-600 rounded hover:bg-red-200"
                      title="Hapus nested block"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                {/* Render Block Content */}
                <div onClick={(e) => e.stopPropagation()}>
                  <PageRenderer blocks={[childBlock]} />
                </div>

                {/* Recursive: Render children of this child block */}
                {childBlock.children && childBlock.children.length > 0 && level < maxLevel && (
                  <NestedBlocksRenderer
                    parentBlock={childBlock}
                    selectedBlock={selectedBlock}
                    setSelectedBlock={setSelectedBlock}
                    setParentBlockId={setParentBlockId}
                    setShowBlockPicker={setShowBlockPicker}
                    onDeleteNestedBlock={onDeleteNestedBlock}
                    level={level + 1}
                  />
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-xs text-gray-400 text-center py-2">
          Klik tombol di bawah untuk menambahkan nested block
        </p>
      )}

      <button
        onClick={(e) => {
          e.stopPropagation();
          setParentBlockId(parentBlock.id);
          setShowBlockPicker(true);
        }}
        className="mt-2 w-full px-3 py-2 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 flex items-center justify-center gap-1"
      >
        <span>+</span>
        <span>Add Nested Block</span>
      </button>
    </div>
  );
};

// ── Mini image upload component for use inside prop editors ─────────────────
const StepImageUpload = ({ value, onChange }) => {
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const res = await api.post('/api/upload/image', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      const url = res.data.url || res.data.data?.url;
      if (url) onChange(url);
    } catch (err) {
      alert('Gagal upload: ' + (err.response?.data?.message || err.message));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-1.5">
      {value && (
        <div className="relative">
          <img src={value} alt="preview" className="w-full h-24 object-cover rounded-lg border border-gray-200" />
          <button type="button" onClick={() => onChange('')}
            className="absolute top-1 right-1 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full text-xs flex items-center justify-center">✕</button>
        </div>
      )}
      <label className={`flex items-center justify-center gap-1.5 py-1.5 border-2 border-dashed rounded-lg cursor-pointer transition-colors text-xs font-medium ${uploading ? 'border-gray-200 text-gray-300' : 'border-gray-200 text-gray-400 hover:border-blue-400 hover:text-blue-500'}`}>
        {uploading ? '⏳ Uploading...' : '📁 Upload Gambar'}
        <input type="file" accept="image/*" className="hidden" disabled={uploading}
          onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }} />
      </label>
      <input type="text" value={value || ''} onChange={(e) => onChange(e.target.value)}
        placeholder="atau paste URL gambar..."
        className="w-full px-2 py-1 border border-gray-200 rounded text-xs text-gray-600" />
    </div>
  );
};

// Block Editor Component
const BlockEditor = ({ block, onChange, onFileUpload, uploadingFile, onAddBlockToTab, onDeleteBlockFromTab, onSelectBlock, onAddBlockToColumn, onDeleteBlockFromColumn }) => {
  const definition = BLOCK_DEFINITIONS.find((d) => d.type === block.type);
  if (!definition) return null;

  // Check if this is a tabs or columns block
  const isTabsBlock = block.type === 'tabs';
  const isColumnsBlock = block.type === 'columns';

  // Layout options for columns
  const layoutOptions = [
    { value: '1-1', label: '1:1 (Equal 2 columns)' },
    { value: '2-1', label: '2:1 (Wide left)' },
    { value: '1-2', label: '1:2 (Wide right)' },
    { value: '3-1', label: '3:1 (Very wide left)' },
    { value: '1-3', label: '1:3 (Very wide right)' },
    { value: '1-1-1', label: '1:1:1 (Equal 3 columns)' },
    { value: '2-1-1', label: '2:1:1 (Wide first)' },
    { value: '1-2-1', label: '1:2:1 (Wide middle)' },
    { value: '1-1-2', label: '1:1:2 (Wide last)' },
    { value: 'equal-4', label: '1:1:1:1 (Equal 4 columns)' },
  ];

  const renderPropEditor = (propName, propValue) => {
    // Special handling for columns array with nested blocks support
    if (propName === 'columns' && isColumnsBlock && Array.isArray(propValue)) {
      return (
        <div className="border border-gray-200 rounded-lg p-3">
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-bold text-gray-700">Kolom</label>
          </div>

          <div className="space-y-4">
            {propValue.map((column, columnIndex) => (
              <div key={columnIndex} className="border border-gray-300 rounded-lg overflow-hidden bg-white">
                {/* Column Header */}
                <div className="bg-purple-100 px-3 py-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-purple-700">📊 Kolom {columnIndex + 1}</span>
                    {column.blocks && column.blocks.length > 0 && (
                      <span className="text-xs bg-purple-200 text-purple-800 px-2 py-0.5 rounded-full">
                        {column.blocks.length} block{column.blocks.length > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-3 space-y-3">
                  {/* Column Blocks */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-medium text-gray-600">Konten Block</label>
                      <button
                        onClick={() => onAddBlockToColumn && onAddBlockToColumn(columnIndex)}
                        className="text-xs px-2 py-1 bg-purple-500 text-white rounded hover:bg-purple-600 flex items-center gap-1"
                      >
                        <span>+</span>
                        <span>Tambah Block</span>
                      </button>
                    </div>

                    {column.blocks && column.blocks.length > 0 ? (
                      <div className="space-y-2">
                        {column.blocks.map((colBlock, blockIndex) => {
                          const blockDef = BLOCK_DEFINITIONS.find((d) => d.type === colBlock.type);
                          return (
                            <div
                              key={colBlock.id || blockIndex}
                              className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded border hover:border-purple-400 hover:bg-purple-50 cursor-pointer transition-colors"
                              onClick={() => onSelectBlock && onSelectBlock(colBlock)}
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-lg">{blockDef?.icon || '📦'}</span>
                                <span className="text-sm font-medium">{blockDef?.name || colBlock.type}</span>
                                <span className="text-xs text-purple-600">✏️ Edit</span>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDeleteBlockFromColumn && onDeleteBlockFromColumn(columnIndex, colBlock.id);
                                }}
                                className="text-xs px-2 py-1 text-red-600 hover:bg-red-100 rounded"
                              >
                                ✕
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400 text-center py-4 bg-gray-50 rounded border-2 border-dashed">
                        Belum ada block. Klik "Tambah Block" untuk menambahkan konten.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    // Special handling for layout prop in columns block
    if (propName === 'layout' && isColumnsBlock) {
      return (
        <div>
          <label className="block text-sm font-medium mb-2">Layout Kolom</label>
          <select
            value={propValue}
            onChange={(e) => {
              const newLayout = e.target.value;
              // Determine how many columns this layout needs
              const colCounts = {
                '1-1': 2, '2-1': 2, '1-2': 2, '3-1': 2, '1-3': 2,
                '1-1-1': 3, '2-1-1': 3, '1-2-1': 3, '1-1-2': 3,
                'equal-4': 4,
              };
              const neededCols = colCounts[newLayout] || 2;
              const currentCols = block.props.columns || [];

              // Adjust columns array if needed
              let newColumns = [...currentCols];
              while (newColumns.length < neededCols) {
                newColumns.push({ blocks: [] });
              }
              newColumns = newColumns.slice(0, neededCols);

              onChange({ layout: newLayout, columns: newColumns });
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            {layoutOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      );
    }

    // Special handling for tabs array with nested blocks support
    if (propName === 'tabs' && isTabsBlock && Array.isArray(propValue)) {
      return (
        <div className="border border-gray-200 rounded-lg p-3">
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-bold text-gray-700">Tabs</label>
            <button
              onClick={() => {
                const newTab = { label: `Tab ${propValue.length + 1}`, content: '', blocks: [] };
                onChange({ tabs: [...propValue, newTab] });
              }}
              className="text-xs px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              + Tambah Tab
            </button>
          </div>

          <div className="space-y-4">
            {propValue.map((tab, tabIndex) => (
              <div key={tabIndex} className="border border-gray-300 rounded-lg overflow-hidden bg-white">
                {/* Tab Header */}
                <div className="bg-gray-100 px-3 py-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">📑 Tab {tabIndex + 1}</span>
                    {tab.blocks && tab.blocks.length > 0 && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                        {tab.blocks.length} block{tab.blocks.length > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      const newTabs = propValue.filter((_, i) => i !== tabIndex);
                      onChange({ tabs: newTabs });
                    }}
                    className="text-xs px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Hapus
                  </button>
                </div>

                <div className="p-3 space-y-3">
                  {/* Tab Label */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Label Tab</label>
                    <input
                      type="text"
                      value={tab.label || ''}
                      onChange={(e) => {
                        const newTabs = [...propValue];
                        newTabs[tabIndex] = { ...tab, label: e.target.value };
                        onChange({ tabs: newTabs });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                      placeholder="Nama tab"
                    />
                  </div>

                  {/* Tab Blocks */}
                  <div className="border-t pt-3">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-medium text-gray-600">Konten Block</label>
                      <button
                        onClick={() => onAddBlockToTab && onAddBlockToTab(tabIndex)}
                        className="text-xs px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600 flex items-center gap-1"
                      >
                        <span>+</span>
                        <span>Tambah Block</span>
                      </button>
                    </div>

                    {tab.blocks && tab.blocks.length > 0 ? (
                      <div className="space-y-2">
                        {tab.blocks.map((tabBlock, blockIndex) => {
                          const blockDef = BLOCK_DEFINITIONS.find((d) => d.type === tabBlock.type);
                          return (
                            <div
                              key={tabBlock.id || blockIndex}
                              className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded border hover:border-blue-400 hover:bg-blue-50 cursor-pointer transition-colors"
                              onClick={() => onSelectBlock && onSelectBlock(tabBlock)}
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-lg">{blockDef?.icon || '📦'}</span>
                                <span className="text-sm font-medium">{blockDef?.name || tabBlock.type}</span>
                                <span className="text-xs text-blue-600">✏️ Edit</span>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDeleteBlockFromTab && onDeleteBlockFromTab(tabIndex, tabBlock.id);
                                }}
                                className="text-xs px-2 py-1 text-red-600 hover:bg-red-100 rounded"
                              >
                                ✕
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400 text-center py-4 bg-gray-50 rounded border-2 border-dashed">
                        Belum ada block. Klik "Tambah Block" untuk menambahkan konten.
                      </p>
                    )}
                  </div>

                  {/* Fallback HTML Content (optional) */}
                  <div className="border-t pt-3">
                    <details className="text-xs">
                      <summary className="cursor-pointer text-gray-500 hover:text-gray-700 mb-2">
                        💡 HTML Content (opsional, digunakan jika tidak ada blocks)
                      </summary>
                      <textarea
                        value={tab.content || ''}
                        onChange={(e) => {
                          const newTabs = [...propValue];
                          newTabs[tabIndex] = { ...tab, content: e.target.value };
                          onChange({ tabs: newTabs });
                        }}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-xs font-mono"
                        rows="3"
                        placeholder="HTML content (fallback jika tidak ada blocks)"
                      />
                    </details>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    // Special handling for height in hero block
    if (propName === 'height' && block.type === 'hero') {
      const heightOptions = [
        { value: 'sm', label: 'Small (256px)' },
        { value: 'md', label: 'Medium (384px)' },
        { value: 'lg', label: 'Large (500px)' },
        { value: 'xl', label: 'Extra Large (600px)' },
        { value: 'full', label: 'Full Screen' },
      ];

      return (
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Height
          </label>
          <select
            value={propValue}
            onChange={(e) => onChange({ [propName]: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            {heightOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      );
    }

    // Special handling for overlayStyle in hero block
    if (propName === 'overlayStyle' && block.type === 'hero') {
      const overlayOptions = [
        { value: 'gradient', label: 'Gradient (Beranda)', description: 'Gradient ungu-biru seperti beranda' },
        { value: 'blue', label: 'Blue Gradient', description: 'Gradient biru' },
        { value: 'purple', label: 'Purple Gradient', description: 'Gradient ungu' },
        { value: 'dark', label: 'Dark', description: 'Overlay gelap sederhana' },
        { value: 'light', label: 'Light', description: 'Overlay terang' },
        { value: 'none', label: 'None', description: 'Tanpa overlay' },
      ];

      return (
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Overlay Style
          </label>
          <div className="grid grid-cols-2 gap-2">
            {overlayOptions.map((opt) => (
              <label
                key={opt.value}
                className={`flex flex-col p-2 rounded border cursor-pointer transition-colors ${
                  propValue === opt.value
                    ? 'bg-primary-50 border-primary-500 text-primary-700'
                    : 'bg-white border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="overlayStyle"
                    value={opt.value}
                    checked={propValue === opt.value}
                    onChange={() => onChange({ [propName]: opt.value })}
                    className="text-primary-600"
                  />
                  <span className="text-xs font-medium">{opt.label}</span>
                </div>
                <span className="text-[10px] text-gray-500 ml-5">{opt.description}</span>
              </label>
            ))}
          </div>
        </div>
      );
    }

    // Special handling for textAlign in hero block
    if (propName === 'textAlign' && block.type === 'hero') {
      const alignOptions = [
        { value: 'center', label: 'Tengah', icon: '⬜' },
        { value: 'left', label: 'Kiri', icon: '◀️' },
        { value: 'right', label: 'Kanan', icon: '▶️' },
      ];

      return (
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Text Alignment
          </label>
          <div className="flex gap-2">
            {alignOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => onChange({ [propName]: opt.value })}
                className={`flex-1 px-3 py-2 rounded border text-sm font-medium transition-colors ${
                  propValue === opt.value
                    ? 'bg-primary-50 border-primary-500 text-primary-700'
                    : 'bg-white border-gray-200 hover:border-gray-300 text-gray-600'
                }`}
              >
                {opt.icon} {opt.label}
              </button>
            ))}
          </div>
        </div>
      );
    }

    // Special handling for categories in postsCard block (multiselect)
    if (propName === 'categories' && block.type === 'postsCard' && Array.isArray(propValue)) {
      // Available category options
      const categoryOptions = [
        { slug: 'berita', name: 'Berita' },
        { slug: 'pengumuman', name: 'Pengumuman' },
        { slug: 'prestasi', name: 'Prestasi' },
        { slug: 'kegiatan', name: 'Kegiatan' },
        { slug: 'akademik', name: 'Akademik' },
        { slug: 'ekskul', name: 'Ekstrakurikuler' },
        { slug: 'bkk', name: 'BKK (Bursa Kerja Khusus)' },
        { slug: 'tkj', name: 'TKJ' },
        { slug: 'tkro', name: 'TKRO' },
        { slug: 'akl', name: 'AKL' },
        { slug: 'bdp', name: 'BDP' },
        { slug: 'alumni', name: 'Alumni' },
        { slug: 'tips', name: 'Tips & Tutorial' },
      ];

      const isSelected = (slug) => propValue.some(cat => cat.slug === slug);

      const toggleCategory = (categoryOption) => {
        if (isSelected(categoryOption.slug)) {
          // Remove category
          const newCategories = propValue.filter(cat => cat.slug !== categoryOption.slug);
          onChange({ [propName]: newCategories });
        } else {
          // Add category
          const newCategory = {
            slug: categoryOption.slug,
            name: categoryOption.name,
          };
          onChange({ [propName]: [...propValue, newCategory] });
        }
      };

      return (
        <div className="border border-gray-200 rounded-lg p-3">
          <label className="block text-sm font-bold text-gray-700 mb-3">
            Filter Kategori Artikel
          </label>

          {/* Category Selection Grid */}
          <div className="grid grid-cols-2 gap-2">
            {categoryOptions.map((cat) => (
              <label
                key={cat.slug}
                className={`flex items-center gap-2 p-2 rounded border cursor-pointer transition-colors ${
                  isSelected(cat.slug)
                    ? 'bg-primary-50 border-primary-500 text-primary-700'
                    : 'bg-white border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isSelected(cat.slug)}
                  onChange={() => toggleCategory(cat)}
                  className="rounded text-primary-600"
                />
                <span className="text-xs font-medium">{cat.name}</span>
              </label>
            ))}
          </div>

          {propValue.length > 0 && (
            <p className="text-xs text-primary-600 mt-3">
              {propValue.length} kategori dipilih: {propValue.map(c => c.name).join(', ')}
            </p>
          )}

          {propValue.length === 0 && (
            <p className="text-xs text-gray-400 mt-3">
              Pilih kategori untuk memfilter postingan (kosong = tampilkan semua)
            </p>
          )}

          {/* Jurusan Multiselect - rendered inside categories block */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <label className="block text-sm font-bold text-gray-700 mb-3">
              Filter Jurusan (Opsional)
            </label>
            {(() => {
              const jurusanOptions = [
                { slug: 'tkj', name: 'TKJ (Teknik Komputer & Jaringan)' },
                { slug: 'tkro', name: 'TKRO (Teknik Kendaraan Ringan)' },
                { slug: 'akl', name: 'AKL (Akuntansi & Keuangan Lembaga)' },
                { slug: 'bdp', name: 'BDP (Bisnis Daring & Pemasaran)' },
              ];
              const currentJurusan = block.props.jurusan || '';
              const selectedJurusans = currentJurusan ? currentJurusan.split(',').filter(Boolean) : [];

              const isJurusanSelected = (slug) => selectedJurusans.includes(slug);

              const toggleJurusan = (slug) => {
                let newSelected;
                if (isJurusanSelected(slug)) {
                  newSelected = selectedJurusans.filter(j => j !== slug);
                } else {
                  newSelected = [...selectedJurusans, slug];
                }
                onChange({ jurusan: newSelected.join(',') });
              };

              return (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    {jurusanOptions.map((jur) => (
                      <label
                        key={jur.slug}
                        className={`flex items-center gap-2 p-2 rounded border cursor-pointer transition-colors ${
                          isJurusanSelected(jur.slug)
                            ? 'bg-green-50 border-green-500 text-green-700'
                            : 'bg-white border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isJurusanSelected(jur.slug)}
                          onChange={() => toggleJurusan(jur.slug)}
                          className="rounded text-green-600"
                        />
                        <span className="text-xs font-medium">{jur.name}</span>
                      </label>
                    ))}
                  </div>
                  {selectedJurusans.length > 0 && (
                    <p className="text-xs text-green-600 mt-2">
                      {selectedJurusans.length} jurusan dipilih
                    </p>
                  )}
                  {selectedJurusans.length === 0 && (
                    <p className="text-xs text-gray-400 mt-2">
                      Kosongkan untuk tampilkan semua jurusan
                    </p>
                  )}
                </>
              );
            })()}
          </div>
        </div>
      );
    }

    // Handle arrays (tabs, items, stats, features, etc.)
    if (Array.isArray(propValue)) {
      return (
        <div className="border border-gray-200 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium">{propName}</label>
            <button
              onClick={() => {
                const newItem = Array.isArray(propValue) && propValue.length > 0
                  ? { ...propValue[0] }
                  : {};
                onChange({ [propName]: [...propValue, newItem] });
              }}
              className="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              + Tambah
            </button>
          </div>

          <div className="space-y-2">
            {propValue.map((item, index) => (
              <div key={index} className="border border-gray-300 rounded p-2 bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-600">Item {index + 1}</span>
                  <button
                    onClick={() => {
                      const newArray = propValue.filter((_, i) => i !== index);
                      onChange({ [propName]: newArray });
                    }}
                    className="text-xs px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Hapus
                  </button>
                </div>

                {/* Render fields for each property in the item */}
                {typeof item === 'object' && item !== null ? (
                  <div className="space-y-2">
                    {Object.entries(item).map(([itemKey, itemValue]) => {
                      const imageKeys = ['image', 'src', 'thumbnail', 'avatar', 'icon', 'logo'];
                      const isImageField = imageKeys.includes(itemKey);

                      return (
                        <div key={itemKey}>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            {itemKey}
                            {isImageField && <span className="ml-1 text-blue-500">(Image)</span>}
                          </label>

                          {/* Boolean checkbox */}
                          {typeof itemValue === 'boolean' ? (
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={itemValue}
                                onChange={(e) => {
                                  const newArray = [...propValue];
                                  newArray[index] = { ...item, [itemKey]: e.target.checked };
                                  onChange({ [propName]: newArray });
                                }}
                                className="rounded w-4 h-4"
                              />
                              <span className="text-xs text-gray-600">{itemValue ? 'Ya' : 'Tidak'}</span>
                            </label>

                          /* Number input */
                          ) : typeof itemValue === 'number' ? (
                            <input
                              type="number"
                              value={itemValue}
                              onChange={(e) => {
                                const newArray = [...propValue];
                                newArray[index] = { ...item, [itemKey]: parseFloat(e.target.value) || 0 };
                                onChange({ [propName]: newArray });
                              }}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                            />

                          /* Image field with upload */
                          ) : isImageField ? (
                            <div>
                              {itemValue && (
                                <div className="mb-1 relative">
                                  <img
                                    src={itemValue}
                                    alt="Preview"
                                    className="w-full h-20 object-cover rounded border"
                                    onError={(e) => { e.target.style.display = 'none'; }}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newArray = [...propValue];
                                      newArray[index] = { ...item, [itemKey]: '' };
                                      onChange({ [propName]: newArray });
                                    }}
                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                                  >
                                    ✕
                                  </button>
                                </div>
                              )}
                              <div className="flex gap-1">
                                <label className="flex-1 cursor-pointer">
                                  <div className="px-2 py-1 border border-dashed border-gray-300 rounded text-center hover:border-blue-500 text-xs">
                                    📁 Upload
                                  </div>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={async (e) => {
                                      const file = e.target.files?.[0];
                                      if (file) {
                                        // Upload and update the specific array item
                                        try {
                                          const formDataUpload = new FormData();
                                          formDataUpload.append('image', file);
                                          const response = await api.post('/api/upload/image', formDataUpload, {
                                            headers: { 'Content-Type': 'multipart/form-data' },
                                          });
                                          const fileUrl = response.data.url || response.data.data?.url;
                                          if (fileUrl) {
                                            const newArray = [...propValue];
                                            newArray[index] = { ...item, [itemKey]: fileUrl };
                                            onChange({ [propName]: newArray });
                                          }
                                        } catch (err) {
                                          console.error('Upload error:', err);
                                          alert('Gagal upload gambar');
                                        }
                                      }
                                    }}
                                  />
                                </label>
                              </div>
                              <input
                                type="text"
                                value={itemValue || ''}
                                onChange={(e) => {
                                  const newArray = [...propValue];
                                  newArray[index] = { ...item, [itemKey]: e.target.value };
                                  onChange({ [propName]: newArray });
                                }}
                                placeholder="URL gambar"
                                className="w-full px-2 py-1 border border-gray-300 rounded text-xs mt-1"
                              />
                            </div>

                          /* Rich content textarea for content fields (tabs, etc.) */
                          ) : itemKey === 'content' ? (
                            <div>
                              <div className="relative">
                                <textarea
                                  value={itemValue || ''}
                                  onChange={(e) => {
                                    const newArray = [...propValue];
                                    newArray[index] = { ...item, [itemKey]: e.target.value };
                                    onChange({ [propName]: newArray });
                                  }}
                                  className="w-full px-2 py-1 pr-6 border border-gray-300 rounded text-xs font-mono"
                                  rows="6"
                                  placeholder="Support HTML: <p>, <strong>, <em>, <img src='...'>, <a href='...'>, etc."
                                />
                                {itemValue && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      const newArray = [...propValue];
                                      newArray[index] = { ...item, [itemKey]: '' };
                                      onChange({ [propName]: newArray });
                                    }}
                                    className="absolute right-1 top-1 text-gray-400 hover:text-gray-600 text-xs bg-white px-1 rounded"
                                    title="Clear"
                                  >
                                    ✕
                                  </button>
                                )}
                              </div>
                              <p className="text-xs text-blue-600 mt-1">💡 Supports HTML for rich content (images, links, formatting)</p>
                            </div>

                          /* Default textarea for strings */
                          ) : (
                            <div className="relative">
                              <textarea
                                value={itemValue || ''}
                                onChange={(e) => {
                                  const newArray = [...propValue];
                                  newArray[index] = { ...item, [itemKey]: e.target.value };
                                  onChange({ [propName]: newArray });
                                }}
                                className="w-full px-2 py-1 pr-6 border border-gray-300 rounded text-xs"
                                rows="2"
                              />
                              {itemValue && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    const newArray = [...propValue];
                                    newArray[index] = { ...item, [itemKey]: '' };
                                    onChange({ [propName]: newArray });
                                  }}
                                  className="absolute right-1 top-1 text-gray-400 hover:text-gray-600 text-xs"
                                  title="Clear"
                                >
                                  ✕
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => {
                      const newArray = [...propValue];
                      newArray[index] = e.target.value;
                      onChange({ [propName]: newArray });
                    }}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      );
    }

    // Handle booleans
    if (typeof propValue === 'boolean') {
      return (
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={propValue}
            onChange={(e) => onChange({ [propName]: e.target.checked })}
            className="rounded"
          />
          <span className="text-sm">{propName}</span>
        </label>
      );
    }

    // Handle numbers
    if (typeof propValue === 'number') {
      return (
        <div>
          <label className="block text-sm font-medium mb-1">{propName}</label>
          <input
            type="number"
            value={propValue}
            onChange={(e) => onChange({ [propName]: parseFloat(e.target.value) || 0 })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
        </div>
      );
    }

    // Handle select dropdowns
    if (propName === 'variant' || propName === 'size' || propName === 'align' ||
        propName === 'type' || propName === 'layout' || propName === 'style' ||
        propName === 'backgroundColor' || propName === 'textColor' || propName === 'bgColor' ||
        propName === 'color' || propName === 'spacing' || propName === 'gap' ||
        propName === 'speed' || propName === 'direction' || propName === 'aspectRatio' ||
        propName === 'iconSize') {

      const optionsMap = {
        variant: ['default', 'primary', 'secondary', 'success', 'danger', 'warning', 'outline', 'ghost', 'white', 'minimal', 'card', 'elevated', 'glass', 'gradient', 'dark', 'pills', 'underline'],
        size: ['sm', 'md', 'lg', 'xl'],
        align: ['left', 'center', 'right'],
        type: ['text', 'youtube', 'vimeo', 'direct', 'bullet', 'numbered', 'icon', 'info', 'success', 'warning', 'error'],
        layout: ['centered', 'left', 'split', 'grid', 'list'],
        style: ['solid', 'dashed', 'dotted'],
        backgroundColor: ['primary', 'blue', 'dark', 'success', 'green', 'red', 'gray', 'white'],
        textColor: ['white', 'black', 'primary', 'gray'],
        bgColor: ['primary', 'blue', 'green', 'red', 'gray', 'white'],
        color: ['gray', 'blue', 'primary', 'black'],
        spacing: ['none', 'sm', 'tight', 'normal', 'md', 'loose', 'lg', 'xl'],
        gap: ['none', 'sm', 'md', 'lg', 'xl'],
        speed: ['slow', 'normal', 'fast'],
        direction: ['left', 'right'],
        aspectRatio: ['16/9', '4/3', '1/1', '21/9'],
        iconSize: ['sm', 'md', 'lg'],
      };

      const options = optionsMap[propName] || ['default', 'primary', 'secondary'];

      return (
        <div>
          <label className="block text-sm font-medium mb-1">{propName}</label>
          <select
            value={propValue}
            onChange={(e) => onChange({ [propName]: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            {options.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      );
    }

    // Special handling for image block customWidth
    if (propName === 'customWidth' && block.type === 'image') {
      const sizePresets = [
        { value: '', label: 'Auto' },
        { value: '25%', label: '25%' },
        { value: '33%', label: '33%' },
        { value: '50%', label: '50%' },
        { value: '75%', label: '75%' },
        { value: '100%', label: '100%' },
      ];
      return (
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Ukuran Gambar</label>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {sizePresets.map((preset) => (
              <button
                key={preset.value}
                type="button"
                onClick={() => onChange({ [propName]: preset.value })}
                className={`px-3 py-1.5 text-xs rounded-lg border font-medium transition-all ${
                  propValue === preset.value
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:border-blue-300 text-gray-600'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
          <input
            type="text"
            value={propValue || ''}
            onChange={(e) => onChange({ [propName]: e.target.value })}
            placeholder="Custom (contoh: 60%, 300px)"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
          <p className="text-xs text-gray-400 mt-1">Aspek rasio gambar tetap terjaga otomatis</p>
        </div>
      );
    }

    // Special handling for image block alignment
    if (propName === 'alignment' && block.type === 'image') {
      const alignOptions = [
        { value: 'left', label: 'Kiri', icon: '◀️' },
        { value: 'center', label: 'Tengah', icon: '⬜' },
        { value: 'right', label: 'Kanan', icon: '▶️' },
      ];
      return (
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Posisi Gambar</label>
          <div className="flex gap-2">
            {alignOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => onChange({ [propName]: opt.value })}
                className={`flex-1 px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                  propValue === opt.value
                    ? 'bg-blue-50 border-blue-500 text-blue-700'
                    : 'bg-white border-gray-200 hover:border-gray-300 text-gray-600'
                }`}
              >
                {opt.icon} {opt.label}
              </button>
            ))}
          </div>
        </div>
      );
    }

    // Special handling for image block rounded corners
    if (propName === 'rounded' && block.type === 'image') {
      const roundedOptions = [
        { value: 'none', label: 'Tanpa' },
        { value: 'sm', label: 'Kecil' },
        { value: 'md', label: 'Sedang' },
        { value: 'lg', label: 'Besar' },
        { value: 'xl', label: 'Ekstra' },
        { value: 'full', label: 'Bulat' },
      ];
      return (
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Sudut Gambar</label>
          <div className="flex flex-wrap gap-1.5">
            {roundedOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => onChange({ [propName]: opt.value })}
                className={`px-3 py-1.5 text-xs rounded-lg border font-medium transition-all ${
                  propValue === opt.value
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:border-blue-300 text-gray-600'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      );
    }

    // Special handling for image block object fit
    if (propName === 'objectFit' && block.type === 'image') {
      const fitOptions = [
        { value: 'cover', label: 'Cover', desc: 'Isi area (crop)' },
        { value: 'contain', label: 'Contain', desc: 'Tampil penuh' },
        { value: 'fill', label: 'Fill', desc: 'Regangkan' },
        { value: 'none', label: 'None', desc: 'Ukuran asli' },
      ];
      return (
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Mode Tampilan</label>
          <div className="grid grid-cols-2 gap-1.5">
            {fitOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => onChange({ [propName]: opt.value })}
                className={`px-3 py-2 rounded-lg border text-left transition-all ${
                  propValue === opt.value
                    ? 'bg-blue-50 border-blue-500'
                    : 'bg-white border-gray-200 hover:border-gray-300'
                }`}
              >
                <span className={`text-xs font-medium block ${propValue === opt.value ? 'text-blue-700' : 'text-gray-700'}`}>{opt.label}</span>
                <span className="text-[10px] text-gray-400">{opt.desc}</span>
              </button>
            ))}
          </div>
        </div>
      );
    }

    // Special handling for image block max height
    if (propName === 'maxHeight' && block.type === 'image') {
      const heightPresets = [
        { value: '', label: 'Auto' },
        { value: '200px', label: '200px' },
        { value: '300px', label: '300px' },
        { value: '400px', label: '400px' },
        { value: '500px', label: '500px' },
      ];
      return (
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Tinggi Maksimal</label>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {heightPresets.map((preset) => (
              <button
                key={preset.value}
                type="button"
                onClick={() => onChange({ [propName]: preset.value })}
                className={`px-3 py-1.5 text-xs rounded-lg border font-medium transition-all ${
                  propValue === preset.value
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:border-blue-300 text-gray-600'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
          <input
            type="text"
            value={propValue || ''}
            onChange={(e) => onChange({ [propName]: e.target.value })}
            placeholder="Custom (contoh: 350px, 50vh)"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
        </div>
      );
    }

    // ── Image block: text wrap style ────────────────────────────────────────
    if (propName === 'wrapStyle' && block.type === 'image') {
      const wrapOpts = [
        { value: 'none',     label: 'Blok Penuh',   desc: 'Gambar mengambil lebar penuh (default)' },
        { value: 'square',   label: 'Square',        desc: 'Teks mengelilingi gambar secara persegi' },
        { value: 'tight',    label: 'Tight',         desc: 'Teks mengikuti konten gambar lebih rapat' },
        { value: 'through',  label: 'Through',       desc: 'Teks menembus area transparan gambar' },
        { value: 'topbottom',label: 'Atas & Bawah', desc: 'Teks hanya di atas dan bawah gambar' },
      ];
      return (
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Text Wrapping (Word-style)</label>
          <div className="space-y-1.5">
            {wrapOpts.map((opt) => (
              <button key={opt.value} type="button"
                onClick={() => onChange({ [propName]: opt.value })}
                className={`w-full px-3 py-2 rounded-lg border text-left transition-all ${propValue === opt.value ? 'bg-blue-50 border-blue-500' : 'bg-white border-gray-200 hover:border-gray-300'}`}
              >
                <span className={`text-xs font-medium block ${propValue === opt.value ? 'text-blue-700' : 'text-gray-700'}`}>{opt.label}</span>
                <span className="text-[10px] text-gray-400">{opt.desc}</span>
              </button>
            ))}
          </div>
        </div>
      );
    }

    // ── Image block: float side ───────────────────────────────────────────
    if (propName === 'floatSide' && block.type === 'image') {
      return (
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Sisi Float</label>
          <div className="flex gap-2">
            {[{ value: 'left', label: '◀ Kiri' }, { value: 'right', label: 'Kanan ▶' }].map((opt) => (
              <button key={opt.value} type="button"
                onClick={() => onChange({ [propName]: opt.value })}
                className={`flex-1 px-3 py-2 rounded-lg border text-sm font-medium transition-all ${propValue === opt.value ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-white border-gray-200 hover:border-gray-300 text-gray-600'}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-1">Aktif saat Text Wrapping ≠ Blok Penuh / Atas&Bawah</p>
        </div>
      );
    }

    // ── Image block: wrap width ────────────────────────────────────────────
    if (propName === 'wrapWidth' && block.type === 'image') {
      const presets = ['25%', '33%', '40%', '50%', '200px', '300px'];
      return (
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Lebar Gambar (saat floating)</label>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {presets.map((p) => (
              <button key={p} type="button" onClick={() => onChange({ [propName]: p })}
                className={`px-3 py-1.5 text-xs rounded-lg border font-medium transition-all ${propValue === p ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-300 hover:border-blue-300 text-gray-600'}`}
              >{p}</button>
            ))}
          </div>
          <input type="text" value={propValue || ''} onChange={(e) => onChange({ [propName]: e.target.value })}
            placeholder="Contoh: 40%, 300px" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
        </div>
      );
    }

    // ── Image block: wrap margin ───────────────────────────────────────────
    if (propName === 'wrapMargin' && block.type === 'image') {
      const presets = ['8px', '12px', '16px', '24px', '32px'];
      return (
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Jarak ke Teks</label>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {presets.map((p) => (
              <button key={p} type="button" onClick={() => onChange({ [propName]: p })}
                className={`px-3 py-1.5 text-xs rounded-lg border font-medium transition-all ${propValue === p ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-300 hover:border-blue-300 text-gray-600'}`}
              >{p}</button>
            ))}
          </div>
          <input type="text" value={propValue || ''} onChange={(e) => onChange({ [propName]: e.target.value })}
            placeholder="Contoh: 16px" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
        </div>
      );
    }

    // ── Hex color picker (for props that hold #xxxxxx colors) ─────────────
    const hexColorProps = [
      'overlayTagBg','overlayTagTextColor','titleColor','descriptionColor',
      'meta1Color','meta2Color','buttonBg','buttonTextColor','cardBg',
      'completedColor','activeColor','pendingColor','lineColor','completedLineFill',
      'activeTitleColor','completedTitleColor','pendingTitleColor','pendingDescColor',
    ];
    if (hexColorProps.includes(propName)) {
      return (
        <div>
          <label className="block text-sm font-medium mb-1">{propName}</label>
          <div className="flex items-center gap-2">
            <input type="color" value={propValue || '#000000'}
              onChange={(e) => onChange({ [propName]: e.target.value })}
              className="w-10 h-10 rounded border border-gray-300 cursor-pointer p-0.5 bg-white"
            />
            <input type="text" value={propValue || ''}
              onChange={(e) => onChange({ [propName]: e.target.value })}
              placeholder="#000000" className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
            />
          </div>
        </div>
      );
    }

    // ── Icon picker for meta icons (richCard/stepper blocks) ──────────────
    if ((propName === 'meta1Icon' || propName === 'meta2Icon') && block.type === 'richCard') {
      const iconOpts = [
        { value: 'calendar', label: '📅 Kalender' },
        { value: 'clock',    label: '🕐 Jam' },
        { value: 'map',      label: '📍 Lokasi' },
        { value: 'user',     label: '👤 Orang' },
        { value: 'users',    label: '👥 Grup' },
        { value: 'tag',      label: '🏷️ Tag' },
        { value: 'star',     label: '⭐ Bintang' },
        { value: 'phone',    label: '📞 Telepon' },
        { value: 'mail',     label: '✉️ Email' },
        { value: 'info',     label: 'ℹ️ Info' },
        { value: 'link',     label: '🔗 Link' },
      ];
      return (
        <div>
          <label className="block text-sm font-medium mb-2">{propName === 'meta1Icon' ? 'Ikon Meta 1' : 'Ikon Meta 2'}</label>
          <div className="grid grid-cols-2 gap-1">
            {iconOpts.map((opt) => (
              <button key={opt.value} type="button" onClick={() => onChange({ [propName]: opt.value })}
                className={`px-2 py-1.5 rounded border text-xs text-left transition-all ${propValue === opt.value ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-white border-gray-200 hover:border-gray-300 text-gray-700'}`}
              >{opt.label}</button>
            ))}
          </div>
        </div>
      );
    }

    // ── imageHeight select for richCard ───────────────────────────────────
    if (propName === 'imageHeight' && block.type === 'richCard') {
      return (
        <div>
          <label className="block text-sm font-medium mb-2">Tinggi Gambar</label>
          <div className="grid grid-cols-2 gap-1.5">
            {[{ v:'sm',l:'Kecil (128px)'},{v:'md',l:'Sedang (192px)'},{v:'lg',l:'Besar (256px)'},{v:'xl',l:'XL (320px)'}].map((o) => (
              <button key={o.v} type="button" onClick={() => onChange({ [propName]: o.v })}
                className={`px-3 py-2 rounded-lg border text-xs font-medium transition-all ${propValue===o.v ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-white border-gray-200 hover:border-gray-300 text-gray-700'}`}
              >{o.l}</button>
            ))}
          </div>
        </div>
      );
    }

    // ── buttonRadius / cardRadius select for richCard ─────────────────────
    if ((propName === 'buttonRadius' || propName === 'cardRadius') && block.type === 'richCard') {
      const opts = ['none','sm','md','lg','xl','2xl','full'];
      return (
        <div>
          <label className="block text-sm font-medium mb-2">{propName === 'buttonRadius' ? 'Radius Button' : 'Radius Card'}</label>
          <div className="flex flex-wrap gap-1.5">
            {opts.map((o) => (
              <button key={o} type="button" onClick={() => onChange({ [propName]: o })}
                className={`px-3 py-1.5 text-xs rounded border font-medium transition-all ${propValue===o ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-300 hover:border-blue-300 text-gray-600'}`}
              >{o}</button>
            ))}
          </div>
        </div>
      );
    }

    // ── cardShadow select for richCard ────────────────────────────────────
    if (propName === 'cardShadow' && block.type === 'richCard') {
      return (
        <div>
          <label className="block text-sm font-medium mb-2">Bayangan Card</label>
          <div className="flex flex-wrap gap-1.5">
            {['none','sm','md','lg','xl'].map((o) => (
              <button key={o} type="button" onClick={() => onChange({ [propName]: o })}
                className={`px-3 py-1.5 text-xs rounded border font-medium transition-all ${propValue===o ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-300 hover:border-blue-300 text-gray-600'}`}
              >{o || 'none'}</button>
            ))}
          </div>
        </div>
      );
    }

    // ── maxWidth select for richCard ──────────────────────────────────────
    if (propName === 'maxWidth' && block.type === 'richCard') {
      return (
        <div>
          <label className="block text-sm font-medium mb-2">Lebar Maksimal Card</label>
          <div className="flex flex-wrap gap-1.5">
            {['xs','sm','md','lg','xl','full'].map((o) => (
              <button key={o} type="button" onClick={() => onChange({ [propName]: o })}
                className={`px-3 py-1.5 text-xs rounded border font-medium transition-all ${propValue===o ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-300 hover:border-blue-300 text-gray-600'}`}
              >{o}</button>
            ))}
          </div>
        </div>
      );
    }

    // ── titleSize select for richCard ─────────────────────────────────────
    if (propName === 'titleSize' && block.type === 'richCard') {
      return (
        <div>
          <label className="block text-sm font-medium mb-2">Ukuran Judul</label>
          <div className="flex flex-wrap gap-1.5">
            {['base','lg','xl','2xl','3xl'].map((o) => (
              <button key={o} type="button" onClick={() => onChange({ [propName]: o })}
                className={`px-3 py-1.5 text-xs rounded border font-medium transition-all ${propValue===o ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-300 hover:border-blue-300 text-gray-600'}`}
              >{o}</button>
            ))}
          </div>
        </div>
      );
    }

    // ── descriptionClamp for richCard ─────────────────────────────────────
    if (propName === 'descriptionClamp' && block.type === 'richCard') {
      return (
        <div>
          <label className="block text-sm font-medium mb-2">Baris Deskripsi (0 = tampil semua)</label>
          <div className="flex flex-wrap gap-1.5">
            {['0','1','2','3','4','5','6'].map((o) => (
              <button key={o} type="button" onClick={() => onChange({ [propName]: o })}
                className={`px-3 py-1.5 text-xs rounded border font-medium transition-all ${propValue===o ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-300 hover:border-blue-300 text-gray-600'}`}
              >{o === '0' ? 'Semua' : `${o} baris`}</button>
            ))}
          </div>
        </div>
      );
    }

    // ── Stepper: iconSize selector ────────────────────────────────────────
    if (propName === 'iconSize' && block.type === 'stepper') {
      const opts = [{ v: 'sm', l: 'S — Kecil' }, { v: 'md', l: 'M — Sedang' }, { v: 'lg', l: 'L — Besar' }];
      return (
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Ukuran Icon</label>
          <div className="flex gap-2">
            {opts.map(({ v, l }) => (
              <button key={v} type="button" onClick={() => onChange({ [propName]: v })}
                className={`flex-1 py-1.5 text-xs rounded border font-medium transition-all ${propValue === v ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'}`}
              >{l}</button>
            ))}
          </div>
        </div>
      );
    }

    // ── Stepper: connectorStyle selector ─────────────────────────────────
    if (propName === 'connectorStyle' && block.type === 'stepper') {
      const opts = [{ v: 'solid', l: '— Solid' }, { v: 'dashed', l: '- - Dashed' }, { v: 'dotted', l: '··· Dotted' }];
      return (
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Gaya Konektor</label>
          <div className="flex gap-2">
            {opts.map(({ v, l }) => (
              <button key={v} type="button" onClick={() => onChange({ [propName]: v })}
                className={`flex-1 py-1.5 text-xs rounded border font-medium transition-all ${propValue === v ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'}`}
              >{l}</button>
            ))}
          </div>
        </div>
      );
    }

    // ── Visual step editor for stepper block ────────────────────────────────
    if (propName === 'stepsJson' && block.type === 'stepper') {
      let steps = [];
      try { steps = typeof propValue === 'string' ? JSON.parse(propValue) : (Array.isArray(propValue) ? propValue : []); } catch { steps = []; }

      const updateSteps = (newSteps) => onChange({ [propName]: JSON.stringify(newSteps) });
      const addStep = () => updateSteps([...steps, { title: 'Langkah Baru', description: '', icon: String(steps.length + 1), status: 'pending' }]);
      const removeStep = (i) => updateSteps(steps.filter((_, idx) => idx !== i));
      const updateStep = (i, field, val) => updateSteps(steps.map((s, idx) => idx === i ? { ...s, [field]: val } : s));
      const moveStep = (i, dir) => {
        const j = i + dir;
        if (j < 0 || j >= steps.length) return;
        const ns = [...steps];
        [ns[i], ns[j]] = [ns[j], ns[i]];
        updateSteps(ns);
      };

      const statusConf = {
        completed: { label: 'Selesai', bg: 'bg-green-100 border-green-500 text-green-700' },
        active:    { label: 'Aktif',   bg: 'bg-blue-100 border-blue-500 text-blue-700' },
        pending:   { label: 'Pending', bg: 'bg-gray-100 border-gray-400 text-gray-600' },
      };

      return (
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-3">Langkah-langkah ({steps.length})</label>
          <div className="space-y-2">
            {steps.map((step, i) => (
              <div key={i} className="border border-gray-200 rounded-lg bg-white overflow-hidden">
                {/* Step header */}
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border-b border-gray-100">
                  <span className="text-xs font-bold text-gray-400 flex-shrink-0">#{i + 1}</span>
                  <input
                    value={step.title || ''}
                    onChange={(e) => updateStep(i, 'title', e.target.value)}
                    placeholder="Judul langkah..."
                    className="flex-1 text-sm font-medium bg-transparent border-0 outline-none text-gray-800 min-w-0"
                  />
                  <div className="flex gap-0.5 flex-shrink-0">
                    <button type="button" onClick={() => moveStep(i, -1)} disabled={i === 0}
                      className="w-6 h-6 flex items-center justify-center rounded text-gray-400 hover:text-gray-600 hover:bg-gray-200 disabled:opacity-30 text-xs">↑</button>
                    <button type="button" onClick={() => moveStep(i, 1)} disabled={i === steps.length - 1}
                      className="w-6 h-6 flex items-center justify-center rounded text-gray-400 hover:text-gray-600 hover:bg-gray-200 disabled:opacity-30 text-xs">↓</button>
                    <button type="button" onClick={() => removeStep(i)}
                      className="w-6 h-6 flex items-center justify-center rounded text-red-400 hover:text-red-600 hover:bg-red-50 text-xs">✕</button>
                  </div>
                </div>
                {/* Step body */}
                <div className="px-3 py-2 space-y-2">
                  {/* Status buttons */}
                  <div className="flex gap-1">
                    {Object.entries(statusConf).map(([val, conf]) => (
                      <button key={val} type="button"
                        onClick={() => updateStep(i, 'status', val)}
                        className={`flex-1 py-1 text-[10px] font-semibold rounded border transition-all ${step.status === val ? conf.bg : 'bg-white border-gray-200 text-gray-400 hover:border-gray-300'}`}
                      >
                        {conf.label}
                      </button>
                    ))}
                  </div>
                  {/* Icon + Description row */}
                  <div className="flex gap-2">
                    <div className="w-14 flex-shrink-0">
                      <label className="text-[10px] text-gray-400 block mb-0.5">Icon</label>
                      <input
                        value={step.icon || ''}
                        onChange={(e) => updateStep(i, 'icon', e.target.value)}
                        placeholder={String(i + 1)}
                        className="w-full px-2 py-1 border border-gray-200 rounded text-sm text-center"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <label className="text-[10px] text-gray-400 block mb-0.5">Deskripsi</label>
                      <textarea
                        value={step.description || ''}
                        onChange={(e) => updateStep(i, 'description', e.target.value)}
                        placeholder="Deskripsi langkah..."
                        rows={2}
                        className="w-full px-2 py-1 border border-gray-200 rounded text-xs resize-none leading-relaxed"
                      />
                    </div>
                  </div>
                  {/* Link row */}
                  <div className="flex gap-2 pt-1 border-t border-gray-100">
                    <div className="flex-1 min-w-0">
                      <label className="text-[10px] text-gray-400 block mb-0.5">Link URL <span className="text-gray-300">(opsional)</span></label>
                      <input
                        value={step.link || ''}
                        onChange={(e) => updateStep(i, 'link', e.target.value)}
                        placeholder="https://... atau /halaman"
                        className="w-full px-2 py-1 border border-gray-200 rounded text-xs"
                      />
                    </div>
                    <div className="w-24 flex-shrink-0">
                      <label className="text-[10px] text-gray-400 block mb-0.5">Teks Link</label>
                      <input
                        value={step.linkText || ''}
                        onChange={(e) => updateStep(i, 'linkText', e.target.value)}
                        placeholder="Selengkapnya"
                        className="w-full px-2 py-1 border border-gray-200 rounded text-xs"
                      />
                    </div>
                  </div>
                  {/* Image row */}
                  <div className="pt-1 border-t border-gray-100">
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-[10px] text-gray-400 font-medium">Gambar <span className="text-gray-300">(opsional)</span></label>
                      {step.image && (
                        <div className="flex gap-1">
                          {[
                            { v: 'sm',   l: 'S' },
                            { v: 'md',   l: 'M' },
                            { v: 'lg',   l: 'L' },
                            { v: 'full', l: '↔' },
                          ].map(({ v, l }) => (
                            <button key={v} type="button"
                              onClick={() => updateStep(i, 'imageSize', v)}
                              className={`w-6 h-5 text-[9px] rounded border font-bold transition-all ${(step.imageSize || 'md') === v ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-400 hover:border-gray-300'}`}
                            >{l}</button>
                          ))}
                        </div>
                      )}
                    </div>
                    <StepImageUpload
                      value={step.image || ''}
                      onChange={(url) => updateStep(i, 'image', url)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button type="button" onClick={addStep}
            className="mt-2 w-full py-2 border-2 border-dashed border-gray-200 rounded-lg text-sm text-gray-400 hover:border-blue-400 hover:text-blue-500 transition-colors font-medium">
            + Tambah Langkah
          </button>
        </div>
      );
    }

    // ── Visual tag editor for richCard block ─────────────────────────────────
    if (propName === 'tagsJson' && block.type === 'richCard') {
      let tags = [];
      try { tags = typeof propValue === 'string' ? JSON.parse(propValue) : (Array.isArray(propValue) ? propValue : []); } catch { tags = []; }

      const updateTags = (newTags) => onChange({ [propName]: JSON.stringify(newTags) });
      const addTag = () => updateTags([...tags, { text: 'Tag Baru', bg: '#1f2937', color: '#ffffff' }]);
      const removeTag = (i) => updateTags(tags.filter((_, idx) => idx !== i));
      const updateTag = (i, field, val) => updateTags(tags.map((t, idx) => idx === i ? { ...t, [field]: val } : t));

      return (
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Tags ({tags.length})</label>
          <div className="space-y-2">
            {tags.map((tag, i) => (
              <div key={i} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border border-gray-200">
                <input
                  value={tag.text || ''}
                  onChange={(e) => updateTag(i, 'text', e.target.value)}
                  placeholder="Teks tag"
                  className="flex-1 px-2 py-1 border border-gray-200 rounded text-sm min-w-0"
                />
                <div className="flex items-center gap-1 flex-shrink-0">
                  <div title="Warna latar">
                    <input type="color" value={tag.bg || '#1f2937'}
                      onChange={(e) => updateTag(i, 'bg', e.target.value)}
                      className="w-7 h-7 rounded cursor-pointer border border-gray-300 p-0.5"
                    />
                  </div>
                  <div title="Warna teks">
                    <input type="color" value={tag.color || '#ffffff'}
                      onChange={(e) => updateTag(i, 'color', e.target.value)}
                      className="w-7 h-7 rounded cursor-pointer border border-gray-300 p-0.5"
                    />
                  </div>
                </div>
                {/* Preview */}
                <span
                  className="px-2 py-0.5 rounded-full text-[10px] font-medium flex-shrink-0 max-w-[60px] truncate"
                  style={{ backgroundColor: tag.bg || '#1f2937', color: tag.color || '#ffffff' }}
                >
                  {tag.text || 'Tag'}
                </span>
                <button type="button" onClick={() => removeTag(i)}
                  className="text-red-400 hover:text-red-600 text-sm flex-shrink-0">✕</button>
              </div>
            ))}
          </div>
          <button type="button" onClick={addTag}
            className="mt-2 w-full py-1.5 border-2 border-dashed border-gray-200 rounded-lg text-sm text-gray-400 hover:border-blue-400 hover:text-blue-500 transition-colors font-medium">
            + Tambah Tag
          </button>
        </div>
      );
    }

    // ── Handle image/file upload fields
    const imageFields = ['src', 'image', 'backgroundImage', 'logo', 'avatar', 'thumbnail', 'poster'];
    if (imageFields.includes(propName)) {
      return (
        <div>
          <label className="block text-sm font-medium mb-1">
            {propName} <span className="text-xs text-gray-500">(Image)</span>
          </label>

          {/* Preview */}
          {propValue && (
            <div className="mb-2 relative">
              <img
                src={propValue}
                alt="Preview"
                className="w-full h-32 object-cover rounded-lg border"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
              <button
                type="button"
                onClick={() => onChange({ [propName]: '' })}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                title="Remove image"
              >
                ✕
              </button>
            </div>
          )}

          {/* Upload Button */}
          <div className="flex gap-2">
            <label className="flex-1 cursor-pointer">
              <div className={`px-3 py-2 border-2 border-dashed border-gray-300 rounded-lg text-center hover:border-blue-500 hover:bg-blue-50 transition-all ${uploadingFile ? 'opacity-50' : ''}`}>
                <span className="text-sm text-gray-600">
                  {uploadingFile ? '⏳ Uploading...' : '📁 Upload Gambar'}
                </span>
              </div>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploadingFile}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file && onFileUpload) {
                    onFileUpload(file, propName);
                  }
                }}
              />
            </label>
          </div>

          {/* Or enter URL */}
          <div className="mt-2">
            <p className="text-xs text-gray-500 mb-1">Atau masukkan URL:</p>
            <input
              type="text"
              value={propValue || ''}
              onChange={(e) => onChange({ [propName]: e.target.value })}
              placeholder="https://example.com/image.jpg"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
        </div>
      );
    }

    // Handle URL fields (non-image)
    const urlFields = ['url', 'buttonUrl', 'secondaryButtonUrl', 'href', 'link', 'endpoint'];
    if (urlFields.includes(propName)) {
      return (
        <div>
          <label className="block text-sm font-medium mb-1">
            {propName} <span className="text-xs text-gray-500">(URL)</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔗</span>
            <input
              type="url"
              value={propValue || ''}
              onChange={(e) => onChange({ [propName]: e.target.value })}
              placeholder="https://..."
              className="w-full pl-9 pr-8 py-2 border border-gray-300 rounded-lg text-sm"
            />
            {propValue && (
              <button
                type="button"
                onClick={() => onChange({ [propName]: '' })}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      );
    }

    // Handle columns (number with buttons)
    if (propName === 'columns') {
      return (
        <div>
          <label className="block text-sm font-medium mb-1">{propName}</label>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5, 6].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => onChange({ [propName]: num })}
                className={`w-10 h-10 rounded-lg border-2 font-medium transition-all ${
                  propValue === num
                    ? 'border-blue-500 bg-blue-500 text-white'
                    : 'border-gray-300 hover:border-blue-300'
                }`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>
      );
    }

    // Handle height/width (with preset options)
    if (propName === 'height' || propName === 'width' || propName === 'maxWidth') {
      const presets = propName === 'height'
        ? ['200px', '300px', '400px', '500px', '600px', 'auto']
        : ['100%', '800px', '1000px', '1200px', 'auto'];
      return (
        <div>
          <label className="block text-sm font-medium mb-1">{propName}</label>
          <div className="flex flex-wrap gap-1 mb-2">
            {presets.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => onChange({ [propName]: preset })}
                className={`px-2 py-1 text-xs rounded border transition-all ${
                  propValue === preset
                    ? 'border-blue-500 bg-blue-100 text-blue-700'
                    : 'border-gray-300 hover:border-blue-300'
                }`}
              >
                {preset}
              </button>
            ))}
          </div>
          <input
            type="text"
            value={propValue || ''}
            onChange={(e) => onChange({ [propName]: e.target.value })}
            placeholder="Custom value (e.g., 500px)"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
        </div>
      );
    }

    // Handle zoom (for maps)
    if (propName === 'zoom') {
      return (
        <div>
          <label className="block text-sm font-medium mb-1">{propName}: {propValue}</label>
          <input
            type="range"
            min="1"
            max="20"
            value={propValue || 15}
            onChange={(e) => onChange({ [propName]: parseInt(e.target.value) })}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>Far</span>
            <span>Close</span>
          </div>
        </div>
      );
    }

    // Handle interval (for carousel)
    if (propName === 'interval') {
      return (
        <div>
          <label className="block text-sm font-medium mb-1">{propName}: {propValue}ms</label>
          <input
            type="range"
            min="1000"
            max="10000"
            step="500"
            value={propValue || 5000}
            onChange={(e) => onChange({ [propName]: parseInt(e.target.value) })}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>1s</span>
            <span>10s</span>
          </div>
        </div>
      );
    }

    // Handle rating
    if (propName === 'rating') {
      return (
        <div>
          <label className="block text-sm font-medium mb-1">{propName}</label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => onChange({ [propName]: star })}
                className={`text-2xl transition-all ${
                  star <= propValue ? 'text-yellow-400' : 'text-gray-300'
                } hover:scale-110`}
              >
                ⭐
              </button>
            ))}
          </div>
        </div>
      );
    }

    // Default text/textarea input
    return (
      <div>
        <label className="block text-sm font-medium mb-1">
          {propName}
          {(propName === 'content' || propName === 'description') && (
            <span className="ml-2 text-xs text-blue-600 font-normal">(Supports HTML)</span>
          )}
        </label>
        {propName === 'content' || propName === 'description' || propName === 'quote' || propName === 'message' ? (
          <div>
            <div className="relative">
              <textarea
                value={propValue || ''}
                onChange={(e) => onChange({ [propName]: e.target.value })}
                className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg text-sm font-mono"
                rows="6"
                placeholder="You can use HTML: <p>, <strong>, <em>, <img>, <a>, etc."
              />
              {propValue && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onChange({ [propName]: '' });
                  }}
                  className="absolute right-2 top-2 text-gray-400 hover:text-gray-600 bg-white px-1 rounded"
                  title="Clear"
                >
                  ✕
                </button>
              )}
            </div>
            <div className="mt-1 text-xs text-gray-500">
              💡 Tip: Paste HTML untuk formatting rich content (bold, italic, images, links)
            </div>
          </div>
        ) : (
          <div className="relative">
            <input
              type="text"
              value={propValue || ''}
              onChange={(e) => onChange({ [propName]: e.target.value })}
              className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg text-sm"
            />
            {propValue && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onChange({ [propName]: '' });
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 px-1"
                title="Clear"
              >
                ✕
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  // Props to skip for specific block types
  const shouldSkipProp = (propName) => {
    // For postsCard, skip legacy 'category' and 'jurusan' text fields
    // since we now have multiselect versions
    if (block.type === 'postsCard') {
      if (propName === 'category') return true; // Legacy, replaced by categories multiselect
      if (propName === 'jurusan') return true; // Will be rendered as multiselect separately
    }
    return false;
  };

  // Merge definition defaultProps with block.props so settings for new props
  // (added after block was created) always appear in the editor panel
  const mergedProps = { ...(definition?.defaultProps || {}), ...block.props };

  return (
    <div className="space-y-3">
      {Object.entries(mergedProps)
        .filter(([key]) => !shouldSkipProp(key))
        .map(([key, value]) => (
          <div key={key}>{renderPropEditor(key, value)}</div>
        ))}
    </div>
  );
};

export default CustomPageEditor;
