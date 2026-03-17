import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createPortal } from 'react-dom';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { ArrowLeft, Save, RefreshCw, Eye, EyeOff } from 'lucide-react';
import api from '../services/api';
import ImageUpload from '../components/ImageUpload';

const INITIAL_FORM = {
  title: '',
  content: '',
  excerpt: '',
  metaDescription: '',
  keywords: [],
  altText: '',
  faqs: [],
  categoryJurusan: '',
  categoryTopik: '',
  featuredImage: '',
  status: 'draft',
  metadata: { rank: '', level: '', studentName: '' },
};

export default function ArticleEditorPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [formData, setFormData] = useState(INITIAL_FORM);
  const [categories, setCategories] = useState([]);
  const [jurusans, setJurusans] = useState([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEdit);
  const [toast, setToast] = useState(null);
  const [previewContent, setPreviewContent] = useState('');
  const [showPreview, setShowPreview] = useState(true);
  const [showMobilePreview, setShowMobilePreview] = useState(false);
  const [imgLayoutToolbar, setImgLayoutToolbar] = useState(null);
  const [keywordInput, setKeywordInput] = useState('');

  const quillRef = useRef(null);
  const imgWidthDisplayRef = useRef(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Fetch categories + jurusans
  useEffect(() => {
    Promise.all([api.get('/api/categories'), api.get('/api/jurusan')])
      .then(([catRes, jurRes]) => {
        setCategories(catRes.data.data.categories || []);
        setJurusans(jurRes.data.data.jurusans || []);
      })
      .catch(e => console.error('Fetch init data failed', e));
  }, []);

  // Fetch article in edit mode
  useEffect(() => {
    if (!isEdit) return;
    const fetch = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/api/articles/${id}`);
        const a = res.data.data.article;
        const fd = {
          title: a.title || '',
          content: a.content || '',
          excerpt: a.excerpt || '',
          metaDescription: a.metaDescription || '',
          keywords: a.keywords || [],
          altText: a.altText || '',
          faqs: a.faqs || [],
          categoryJurusan: a.categoryJurusan?._id || a.categoryJurusan || '',
          categoryTopik: a.categoryTopik?._id || a.categoryTopik || '',
          featuredImage: a.featuredImage?.url || a.featuredImage || '',
          status: a.status || 'draft',
          metadata: {
            rank: a.metadata?.rank || '',
            level: a.metadata?.level || '',
            studentName: a.metadata?.studentName || '',
          },
        };
        setFormData(fd);
        setPreviewContent(fd.content);
      } catch (e) {
        showToast('Gagal memuat artikel', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id, isEdit]);

  // Sync preview with formData.content (debounced 600ms)
  useEffect(() => {
    const t = setTimeout(() => setPreviewContent(formData.content), 600);
    return () => clearTimeout(t);
  }, [formData.content]);

  const getLiveContent = () =>
    quillRef.current?.getEditor()?.root?.innerHTML ?? formData.content;

  // Normalize HTML before saving: move floated images out of <p> wrappers
  // so float:left/right actually causes text to flow beside images on the public page
  const normalizeContent = (html) => {
    const div = document.createElement('div');
    div.innerHTML = html;
    div.querySelectorAll('p').forEach(p => {
      const imgs = p.querySelectorAll('img[style*="float"]');
      imgs.forEach(img => {
        if (p.parentNode) {
          p.parentNode.insertBefore(img, p);
          if (!p.textContent.trim() && p.children.length === 0) p.remove();
        }
      });
    });
    // Ensure clearfix exists if any floated image is present
    if (div.querySelector('img[style*="float"]') && !div.querySelector('p[data-clearfix]')) {
      const cf = document.createElement('p');
      cf.setAttribute('data-clearfix', '1');
      cf.setAttribute('style', 'clear:both; margin:0; padding:0;');
      div.appendChild(cf);
    }
    return div.innerHTML;
  };

  const refreshPreview = () => setPreviewContent(normalizeContent(getLiveContent()));

  const validateNoBase64 = () => {
    const content = normalizeContent(getLiveContent());
    if (content.includes('data:image')) {
      showToast('Konten mengandung gambar paste langsung. Gunakan tombol 🖼️ di toolbar untuk upload gambar.', 'error');
      return false;
    }
    if (new Blob([content]).size > 3 * 1024 * 1024) {
      showToast('Konten terlalu besar (maks 3MB). Kurangi jumlah gambar.', 'error');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!formData.title.trim()) { showToast('Judul artikel harus diisi', 'error'); return; }
    if (!validateNoBase64()) return;
    setSaving(true);
    try {
      const payload = {
        title: formData.title,
        content: normalizeContent(getLiveContent()),
        excerpt: formData.excerpt,
        metaDescription: formData.metaDescription,
        keywords: formData.keywords,
        altText: formData.altText,
        faqs: formData.faqs.filter(f => f.question && f.answer),
        categoryJurusan: formData.categoryJurusan || null,
        categoryTopik: formData.categoryTopik || null,
        featuredImage: formData.featuredImage || null,
        status: formData.status,
        metadata: formData.metadata,
      };
      if (isEdit) {
        await api.put(`/api/articles/${id}`, payload);
        showToast('Artikel berhasil diupdate', 'success');
        refreshPreview();
      } else {
        const res = await api.post('/api/articles', payload);
        const newId = res.data.data.article._id;
        showToast('Artikel berhasil dibuat', 'success');
        navigate(`/admin/articles/${newId}/edit`, { replace: true });
      }
    } catch (e) {
      showToast(e.response?.data?.message || 'Gagal menyimpan artikel', 'error');
    } finally {
      setSaving(false);
    }
  };

  // ── Quill image upload ──────────────────────────────────────────────────────
  const uploadImageToQuill = async (file) => {
    if (!file?.type.startsWith('image/')) return;
    if (file.size > 5 * 1024 * 1024) { showToast('Ukuran gambar maksimal 5MB', 'error'); return; }
    const fd = new FormData();
    fd.append('image', file);
    try {
      const res = await api.post('/api/upload/image?folder=smk-kristen5/articles', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.success) {
        const quill = quillRef.current?.getEditor();
        const range = quill?.getSelection() || { index: quill?.getLength() || 0 };
        quill?.insertEmbed(range.index, 'image', res.data.data.url);
      }
    } catch (err) {
      showToast('Gagal mengupload gambar: ' + (err.response?.data?.message || err.message), 'error');
    }
  };

  const uploadImageRef = useRef(uploadImageToQuill);
  uploadImageRef.current = uploadImageToQuill;

  // Quill paste + click handlers
  useEffect(() => {
    let cleanup = null;
    const timer = setTimeout(() => {
      const quill = quillRef.current?.getEditor();
      if (!quill) return;
      const handlePaste = (e) => {
        const items = e.clipboardData?.items;
        if (!items) return;
        for (const item of items) {
          if (item.type.startsWith('image/')) {
            e.preventDefault();
            uploadImageRef.current(item.getAsFile());
            break;
          }
        }
      };
      const handleClick = (e) => {
        if (e.target.tagName === 'IMG') {
          setImgLayoutToolbar({ el: e.target, rect: e.target.getBoundingClientRect() });
        } else {
          setImgLayoutToolbar(null);
        }
      };
      quill.root.addEventListener('paste', handlePaste);
      quill.root.addEventListener('click', handleClick);
      cleanup = () => {
        quill.root.removeEventListener('paste', handlePaste);
        quill.root.removeEventListener('click', handleClick);
      };
    }, 500);
    return () => { clearTimeout(timer); cleanup?.(); };
  }, [loading]);

  // ── Image layout ────────────────────────────────────────────────────────────
  const applyImageLayout = (layout) => {
    if (!imgLayoutToolbar?.el) return;
    const img = imgLayoutToolbar.el;
    const quill = quillRef.current?.getEditor();
    const editorRoot = quill?.root;

    if (layout === 'inline') {
      img.removeAttribute('style');
      if (editorRoot && img.parentElement === editorRoot) {
        const p = document.createElement('p');
        editorRoot.insertBefore(p, img);
        p.appendChild(img);
        editorRoot.querySelector('p[data-clearfix]')?.remove();
      }
    } else if (layout === 'center') {
      img.setAttribute('style', 'display:block; float:none; margin:0.5rem auto;');
    } else {
      const currentW = img.style.width || '40%';
      const floatStyle = layout === 'left'
        ? `float:left; margin:0 1rem 0.75rem 0; width:${currentW};`
        : `float:right; margin:0 0 0.75rem 1rem; width:${currentW};`;
      img.setAttribute('style', floatStyle);
      const parentP = img.parentElement;
      if (editorRoot) {
        if (parentP && parentP.tagName === 'P' && parentP.parentElement === editorRoot) {
          editorRoot.insertBefore(img, parentP);
          if (!parentP.textContent.trim() && parentP.children.length === 0) parentP.remove();
        }
        if (!editorRoot.querySelector('p[data-clearfix]')) {
          const cf = document.createElement('p');
          cf.setAttribute('data-clearfix', '1');
          cf.setAttribute('style', 'clear:both; margin:0; padding:0;');
          editorRoot.appendChild(cf);
        }
      }
    }
    setImgLayoutToolbar(null);
  };

  const quillModules = useMemo(() => ({
    toolbar: {
      container: [
        [{ header: [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        [{ align: [] }],
        ['link', 'image'],
        ['clean'],
      ],
      handlers: {
        image: () => {
          const input = document.createElement('input');
          input.setAttribute('type', 'file');
          input.setAttribute('accept', 'image/*');
          input.click();
          input.onchange = async () => {
            const file = input.files[0];
            if (!file) return;
            await uploadImageRef.current(file);
          };
        },
      },
    },
  }), []);

  const selectedTopicCategory = categories.find(c => c._id === formData.categoryTopik);
  const isPrestasi = selectedTopicCategory?.slug === 'prestasi';

  const addKeyword = (e) => {
    if (e.key !== 'Enter' && e.key !== ',') return;
    e.preventDefault();
    const kw = keywordInput.trim().replace(/,$/, '');
    if (kw && !formData.keywords.includes(kw)) {
      setFormData(f => ({ ...f, keywords: [...f.keywords, kw] }));
    }
    setKeywordInput('');
  };

  const updateFaq = (i, field, val) => {
    const faqs = [...formData.faqs];
    faqs[i] = { ...faqs[i], [field]: val };
    setFormData(f => ({ ...f, faqs }));
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-[9999] max-w-sm px-4 py-3 rounded-lg shadow-lg text-white text-sm animate-slide-in ${
          toast.type === 'error' ? 'bg-red-600' : 'bg-green-600'
        }`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 h-14 flex items-center px-4 gap-3 shadow-sm">
        <button
          onClick={() => navigate('/admin/articles')}
          className="flex items-center gap-1.5 text-gray-500 hover:text-gray-900 transition-colors text-sm shrink-0"
        >
          <ArrowLeft size={16} />
          Kembali
        </button>
        <div className="w-px h-5 bg-gray-200 shrink-0" />
        <h1 className="font-semibold text-gray-800 text-sm flex-1 truncate">
          {isEdit ? 'Edit Artikel' : 'Buat Artikel Baru'}
          {formData.title && <span className="text-gray-400 font-normal ml-2">— {formData.title}</span>}
        </h1>
        <select
          value={formData.status}
          onChange={e => setFormData(f => ({ ...f, status: e.target.value }))}
          className="text-xs border border-gray-300 rounded-md px-2 py-1.5 bg-white focus:ring-2 focus:ring-blue-500 shrink-0"
        >
          <option value="draft">Draft</option>
          <option value="pending_review">Pending Review</option>
          <option value="published">Published</option>
        </select>
        {/* Desktop preview toggle */}
        <button
          onClick={() => setShowPreview(v => !v)}
          className="hidden lg:flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors shrink-0"
        >
          {showPreview ? <EyeOff size={15} /> : <Eye size={15} />}
          {showPreview ? 'Sembunyikan' : 'Preview'}
        </button>
        {/* Mobile preview button — icon only */}
        <button
          onClick={() => { refreshPreview(); setShowMobilePreview(true); }}
          className="flex lg:hidden items-center px-2.5 py-1.5 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors shrink-0"
          title="Preview"
        >
          <Eye size={15} />
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-1.5 text-sm px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 shrink-0"
        >
          <Save size={15} />
          {saving ? 'Menyimpan...' : 'Simpan'}
        </button>
      </header>

      {/* Body */}
      <div className="pt-14 flex h-[calc(100vh-3.5rem)] overflow-hidden">

        {/* ── Left panel: Form ── */}
        <div className={`${showPreview ? 'w-full lg:w-1/2' : 'w-full max-w-3xl mx-auto'} overflow-y-auto border-r border-gray-200`}>
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="p-6 space-y-6">

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Judul Artikel <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={e => setFormData(f => ({ ...f, title: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-base font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Judul artikel..."
                />
              </div>

              {/* Categories */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Kategori Jurusan</label>
                  <select
                    value={formData.categoryJurusan}
                    onChange={e => setFormData(f => ({ ...f, categoryJurusan: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Semua Jurusan</option>
                    {jurusans.map(j => <option key={j._id} value={j._id}>{j.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Kategori Topik</label>
                  <select
                    value={formData.categoryTopik}
                    onChange={e => setFormData(f => ({ ...f, categoryTopik: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Pilih Topik</option>
                    {categories.filter(c => c.type === 'topik').map(c => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Prestasi fields */}
              {isPrestasi && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg space-y-3">
                  <p className="text-xs font-semibold text-yellow-800 uppercase tracking-wide">Info Prestasi</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Peringkat</label>
                      <select
                        value={formData.metadata.rank}
                        onChange={e => setFormData(f => ({ ...f, metadata: { ...f.metadata, rank: e.target.value } }))}
                        className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                      >
                        <option value="">Pilih Peringkat</option>
                        {['Juara I','Juara II','Juara III','Harapan I','Harapan II','Medali Emas','Medali Perak','Medali Perunggu','Finalis'].map(r => (
                          <option key={r}>{r}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Tingkat</label>
                      <select
                        value={formData.metadata.level}
                        onChange={e => setFormData(f => ({ ...f, metadata: { ...f.metadata, level: e.target.value } }))}
                        className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                      >
                        <option value="">Pilih Tingkat</option>
                        {['Kabupaten/Kota','Provinsi','Nasional','Internasional'].map(l => (
                          <option key={l}>{l}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Nama Siswa / Tim</label>
                    <input
                      type="text"
                      value={formData.metadata.studentName}
                      onChange={e => setFormData(f => ({ ...f, metadata: { ...f.metadata, studentName: e.target.value } }))}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                      placeholder="Nama siswa atau tim..."
                    />
                  </div>
                </div>
              )}

              {/* Excerpt */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Ringkasan</label>
                <textarea
                  rows={3}
                  value={formData.excerpt}
                  onChange={e => setFormData(f => ({ ...f, excerpt: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  placeholder="Ringkasan singkat artikel (tampil di daftar artikel)..."
                />
              </div>

              {/* Featured Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Gambar Unggulan</label>
                <ImageUpload
                  value={formData.featuredImage}
                  onChange={url => setFormData(f => ({ ...f, featuredImage: url }))}
                  label=""
                  folder="smk-kristen5/articles"
                  previewClassName="h-40 w-auto"
                />
              </div>

              {/* Content editor */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm font-medium text-gray-700">Konten Artikel</label>
                  <span className="text-xs text-gray-400">Klik gambar → toolbar layout & ukuran muncul</span>
                </div>
                <div className="border border-gray-300 rounded-lg overflow-hidden">
                  <ReactQuill
                    ref={quillRef}
                    theme="snow"
                    value={formData.content}
                    onChange={content => setFormData(f => ({ ...f, content }))}
                    modules={quillModules}
                    className="bg-white"
                    style={{ height: '420px', marginBottom: '52px' }}
                  />
                </div>
              </div>

              {/* SEO section */}
              <details className="group border border-gray-200 rounded-lg">
                <summary className="cursor-pointer select-none flex items-center justify-between px-4 py-3 bg-gray-50 rounded-lg text-sm font-medium text-gray-700">
                  <span>SEO & Metadata</span>
                  <span className="text-gray-400 text-xs font-normal">klik untuk buka/tutup</span>
                </summary>
                <div className="p-4 space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Meta Description
                      <span className="text-gray-400 font-normal ml-1">{formData.metaDescription.length}/160</span>
                    </label>
                    <textarea
                      rows={2}
                      maxLength={160}
                      value={formData.metaDescription}
                      onChange={e => setFormData(f => ({ ...f, metaDescription: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                      placeholder="Deskripsi untuk mesin pencari (maks 160 karakter)..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Keywords (Tags)</label>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {formData.keywords.map(kw => (
                        <span key={kw} className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                          {kw}
                          <button
                            type="button"
                            onClick={() => setFormData(f => ({ ...f, keywords: f.keywords.filter(k => k !== kw) }))}
                            className="text-blue-400 hover:text-blue-700 leading-none"
                          >×</button>
                        </span>
                      ))}
                    </div>
                    <input
                      type="text"
                      value={keywordInput}
                      onChange={e => setKeywordInput(e.target.value)}
                      onKeyDown={addKeyword}
                      className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                      placeholder="Ketik keyword lalu tekan Enter atau koma..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Alt Text Gambar Unggulan
                      <span className="text-gray-400 font-normal ml-1">{formData.altText.length}/125</span>
                    </label>
                    <input
                      type="text"
                      maxLength={125}
                      value={formData.altText}
                      onChange={e => setFormData(f => ({ ...f, altText: e.target.value }))}
                      className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                      placeholder="Deskripsi gambar untuk aksesibilitas & SEO..."
                    />
                  </div>
                </div>
              </details>

              {/* FAQs */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">FAQ</label>
                  <button
                    type="button"
                    onClick={() => setFormData(f => ({ ...f, faqs: [...f.faqs, { question: '', answer: '' }] }))}
                    className="text-xs px-2.5 py-1 text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    + Tambah FAQ
                  </button>
                </div>
                {formData.faqs.length === 0 && (
                  <p className="text-xs text-gray-400">FAQ membantu artikel muncul di Featured Snippet Google.</p>
                )}
                <div className="space-y-3">
                  {formData.faqs.map((faq, i) => (
                    <div key={i} className="p-3 border border-gray-200 rounded-lg space-y-2 bg-gray-50">
                      <input
                        type="text"
                        value={faq.question}
                        onChange={e => updateFaq(i, 'question', e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-gray-300 rounded-md text-sm bg-white"
                        placeholder="Pertanyaan..."
                      />
                      <textarea
                        rows={2}
                        value={faq.answer}
                        onChange={e => updateFaq(i, 'answer', e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-gray-300 rounded-md text-sm bg-white"
                        placeholder="Jawaban..."
                      />
                      <button
                        type="button"
                        onClick={() => setFormData(f => ({ ...f, faqs: f.faqs.filter((_, j) => j !== i) }))}
                        className="text-xs text-red-500 hover:text-red-700"
                      >
                        Hapus FAQ
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom actions */}
              <div className="flex gap-3 pt-2 pb-10 border-t border-gray-200">
                <button
                  onClick={() => navigate('/admin/articles')}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Kembali ke Daftar
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  <Save size={15} />
                  {saving ? 'Menyimpan...' : (isEdit ? 'Update Artikel' : 'Buat Artikel')}
                </button>
              </div>

            </div>
          )}
        </div>

        {/* ── Right panel: Preview (desktop only) ── */}
        {showPreview && (
          <div className="hidden lg:flex w-1/2 flex-col bg-white overflow-hidden">
            {/* Preview header */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-200 bg-gray-50 shrink-0">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Preview Publik</span>
              <button
                onClick={refreshPreview}
                className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 px-2.5 py-1 rounded-lg hover:bg-blue-50 transition-colors"
                title="Perbarui preview (termasuk layout gambar & ukuran)"
              >
                <RefreshCw size={12} />
                Perbarui Preview
              </button>
            </div>
            {/* Preview content */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-6 max-w-2xl mx-auto">
                {/* Featured image */}
                {formData.featuredImage && (
                  <img
                    src={formData.featuredImage}
                    alt={formData.altText}
                    className="w-full h-56 object-cover rounded-xl mb-5"
                  />
                )}
                {/* Title */}
                <h1 className="text-2xl font-bold text-gray-900 mb-3 leading-tight">
                  {formData.title || <span className="text-gray-300 font-normal">Judul artikel...</span>}
                </h1>
                {/* Excerpt */}
                {formData.excerpt && (
                  <p className="text-gray-500 italic mb-4 text-sm border-l-2 border-gray-200 pl-3">{formData.excerpt}</p>
                )}
                {/* Divider */}
                {(formData.title || formData.excerpt) && <hr className="my-5 border-gray-100" />}
                {/* Article content with public CSS */}
                {previewContent ? (
                  <div
                    className="article-content text-gray-800 leading-relaxed"
                    style={{ fontSize: '1rem', lineHeight: '1.8' }}
                    dangerouslySetInnerHTML={{ __html: previewContent }}
                  />
                ) : (
                  <p className="text-gray-300 text-sm">Konten artikel akan muncul di sini...</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Mobile full-screen preview overlay ── */}
      {showMobilePreview && (
        <div className="fixed inset-0 z-[100] bg-white flex flex-col lg:hidden">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-200 bg-gray-50 shrink-0">
            <button
              onClick={() => setShowMobilePreview(false)}
              className="flex items-center gap-1.5 text-gray-600 hover:text-gray-900 transition-colors text-sm"
            >
              <ArrowLeft size={16} />
              Kembali
            </button>
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Preview Publik</span>
            <button
              onClick={refreshPreview}
              className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 px-2.5 py-1 rounded-lg hover:bg-blue-50 transition-colors"
              title="Perbarui preview"
            >
              <RefreshCw size={12} />
              Perbarui
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            <div className="p-5 max-w-2xl mx-auto">
              {formData.featuredImage && (
                <img
                  src={formData.featuredImage}
                  alt={formData.altText}
                  className="w-full h-48 object-cover rounded-xl mb-5"
                />
              )}
              <h1 className="text-2xl font-bold text-gray-900 mb-3 leading-tight">
                {formData.title || <span className="text-gray-300 font-normal">Judul artikel...</span>}
              </h1>
              {formData.excerpt && (
                <p className="text-gray-500 italic mb-4 text-sm border-l-2 border-gray-200 pl-3">{formData.excerpt}</p>
              )}
              {(formData.title || formData.excerpt) && <hr className="my-5 border-gray-100" />}
              {previewContent ? (
                <div
                  className="article-content text-gray-800 leading-relaxed"
                  style={{ fontSize: '1rem', lineHeight: '1.8' }}
                  dangerouslySetInnerHTML={{ __html: previewContent }}
                />
              ) : (
                <p className="text-gray-300 text-sm">Konten artikel akan muncul di sini...</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Image layout toolbar portal ── */}
      {imgLayoutToolbar && (() => {
        const r = imgLayoutToolbar.rect;
        const quill = quillRef.current?.getEditor();
        const containerW = quill?.root?.offsetWidth || 800;
        const initPct = Math.min(100, Math.max(10, Math.round(r.width / containerW * 100)));
        return createPortal(
          <>
            <div className="fixed inset-0 z-40" onClick={() => setImgLayoutToolbar(null)} />
            <div
              className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-xl p-1.5 flex flex-col gap-1.5"
              style={{ top: Math.max(60, r.top - 94), left: r.left }}
              onClick={e => e.stopPropagation()}
              onMouseDown={e => e.stopPropagation()}
            >
              {/* Layout buttons */}
              <div className="flex gap-1">
                {[
                  { key: 'inline', label: 'Inline', icon: <svg width="20" height="20" viewBox="0 0 20 20"><rect x="2" y="8" width="16" height="4" rx="1" fill="currentColor"/><rect x="2" y="3" width="16" height="2" rx="1" fill="#d1d5db"/><rect x="2" y="15" width="16" height="2" rx="1" fill="#d1d5db"/></svg> },
                  { key: 'left', label: 'Kiri', icon: <svg width="20" height="20" viewBox="0 0 20 20"><rect x="2" y="2" width="8" height="10" rx="1" fill="currentColor"/><rect x="12" y="3" width="6" height="2" rx="1" fill="#d1d5db"/><rect x="12" y="7" width="6" height="2" rx="1" fill="#d1d5db"/><rect x="2" y="14" width="16" height="2" rx="1" fill="#d1d5db"/></svg> },
                  { key: 'center', label: 'Tengah', icon: <svg width="20" height="20" viewBox="0 0 20 20"><rect x="5" y="4" width="10" height="8" rx="1" fill="currentColor"/><rect x="2" y="14" width="16" height="2" rx="1" fill="#d1d5db"/></svg> },
                  { key: 'right', label: 'Kanan', icon: <svg width="20" height="20" viewBox="0 0 20 20"><rect x="10" y="2" width="8" height="10" rx="1" fill="currentColor"/><rect x="2" y="3" width="6" height="2" rx="1" fill="#d1d5db"/><rect x="2" y="7" width="6" height="2" rx="1" fill="#d1d5db"/><rect x="2" y="14" width="16" height="2" rx="1" fill="#d1d5db"/></svg> },
                ].map(opt => (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => applyImageLayout(opt.key)}
                    className="flex flex-col items-center gap-0.5 px-2 py-1 rounded hover:bg-blue-50 text-gray-600 hover:text-blue-600 transition-colors"
                    title={opt.label}
                  >
                    {opt.icon}
                    <span className="text-[10px] font-medium">{opt.label}</span>
                  </button>
                ))}
              </div>
              {/* Width slider */}
              <div className="flex items-center gap-2 px-1 pb-0.5">
                <span className="text-[10px] text-gray-500 shrink-0">Lebar:</span>
                <input
                  type="range" min="10" max="100" step="5"
                  defaultValue={initPct}
                  className="w-28 accent-blue-600"
                  style={{ height: '4px' }}
                  onInput={e => {
                    const pct = parseInt(e.target.value);
                    if (imgWidthDisplayRef.current) imgWidthDisplayRef.current.textContent = pct + '%';
                    imgLayoutToolbar.el.style.width = pct + '%';
                    imgLayoutToolbar.el.style.height = 'auto';
                  }}
                  onMouseUp={() => {
                    requestAnimationFrame(() => {
                      const newRect = imgLayoutToolbar?.el?.getBoundingClientRect();
                      if (newRect) setImgLayoutToolbar(prev => prev ? { ...prev, rect: newRect } : null);
                    });
                  }}
                />
                <span ref={imgWidthDisplayRef} className="text-[10px] font-medium text-blue-600 w-8 tabular-nums">
                  {initPct}%
                </span>
              </div>
            </div>
            {/* Blue selection border */}
            <div
              className="fixed pointer-events-none z-[9997]"
              style={{ top: r.top, left: r.left, width: r.width, height: r.height, border: '2px solid #3b82f6', borderRadius: 2 }}
            />
          </>,
          document.body
        );
      })()}
    </div>
  );
}
