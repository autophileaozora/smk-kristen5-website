import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import api from '../services/api';

const CTAManagement = ({ embedded = false, previewTrigger = 0, saveTrigger = 0 }) => {
  const [cta, setCTA] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    primaryButtonText: '',
    primaryButtonLink: '',
    secondaryButtonText: '',
    secondaryButtonLink: '',
    backgroundImage: '',
  });

  useEffect(() => { fetchCTA(); }, []);

  useEffect(() => {
    if (previewTrigger > 0) setShowPreview(true);
  }, [previewTrigger]);

  useEffect(() => {
    if (saveTrigger > 0) doSave();
  }, [saveTrigger]);

  const fetchCTA = async () => {
    try {
      setLoading(true);
      const activeRes = await api.get('/api/cta/active');
      if (activeRes.data.data.cta) {
        const ctaData = activeRes.data.data.cta;
        setCTA(ctaData);
        setFormData({
          title: ctaData.title || '',
          description: ctaData.description || '',
          primaryButtonText: ctaData.primaryButtonText || '',
          primaryButtonLink: ctaData.primaryButtonLink || '',
          secondaryButtonText: ctaData.secondaryButtonText || '',
          secondaryButtonLink: ctaData.secondaryButtonLink || '',
          backgroundImage: ctaData.backgroundImage || '',
        });
      } else {
        await createDefaultCTA();
      }
    } catch (error) {
      showToast(error.response?.data?.message || 'Gagal memuat CTA', 'error');
    } finally {
      setLoading(false);
    }
  };

  const createDefaultCTA = async () => {
    try {
      const defaultData = {
        title: 'MARI DISKUSIKAN BAKAT & MINAT KAMU, KAMI AKAN MEMBANTU MENEMUKAN SESUAI PASSION ANDA',
        description: 'SMK Kristen 5 Klaten telah memiliki sertifikat ISO 9008:2015 dan menggandeng mitra industri guna menjamin mutu pendidikan dan keselarasan dengan industri.',
        primaryButtonText: 'DAFTAR SEKARANG',
        primaryButtonLink: '/pendaftaran',
        secondaryButtonText: 'LAYANAN INFORMASI',
        secondaryButtonLink: '/kontak',
        backgroundImage: '',
        isActive: true,
      };
      const response = await api.post('/api/cta', defaultData);
      const ctaData = response.data.data.cta;
      setCTA(ctaData);
      setFormData({
        title: ctaData.title || '',
        description: ctaData.description || '',
        primaryButtonText: ctaData.primaryButtonText || '',
        primaryButtonLink: ctaData.primaryButtonLink || '',
        secondaryButtonText: ctaData.secondaryButtonText || '',
        secondaryButtonLink: ctaData.secondaryButtonLink || '',
        backgroundImage: ctaData.backgroundImage || '',
      });
    } catch (error) {
      showToast('Gagal membuat CTA default', 'error');
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleBackgroundUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { showToast('Hanya file gambar yang diperbolehkan', 'error'); return; }
    if (file.size > 5 * 1024 * 1024) { showToast('Ukuran file maksimal 5MB', 'error'); return; }

    try {
      setUploading(true);
      const uploadFormData = new FormData();
      uploadFormData.append('image', file);
      const response = await api.post('/api/upload/image?folder=smk-kristen5/cta', uploadFormData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const imageUrl = response.data.data.url;
      const newFormData = { ...formData, backgroundImage: imageUrl };
      setFormData(newFormData);
      await api.put(`/api/cta/${cta._id}`, newFormData);
      showToast('Background berhasil diupload!', 'success');
      fetchCTA();
    } catch (error) {
      showToast(error.response?.data?.message || 'Gagal upload background', 'error');
    } finally {
      setUploading(false);
    }
  };

  const doSave = async () => {
    if (!formData.title || !formData.primaryButtonText || !formData.primaryButtonLink) {
      showToast('Mohon lengkapi semua field yang wajib diisi', 'error');
      return;
    }
    try {
      setSaving(true);
      await api.put(`/api/cta/${cta._id}`, formData);
      showToast('CTA berhasil diupdate!', 'success');
      fetchCTA();
    } catch (error) {
      showToast(error.response?.data?.message || 'Gagal update CTA', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await doSave();
  };

  const removeBackground = async () => {
    try {
      setSaving(true);
      const newFormData = { ...formData, backgroundImage: '' };
      setFormData(newFormData);
      await api.put(`/api/cta/${cta._id}`, newFormData);
      showToast('Background berhasil dihapus!', 'success');
      fetchCTA();
    } catch (error) {
      showToast(error.response?.data?.message || 'Gagal menghapus background', 'error');
    } finally {
      setSaving(false);
    }
  };

  const inputClass = 'w-full px-3 py-2 text-sm bg-white/60 border border-black/[0.08] rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 outline-none transition-all placeholder:text-gray-400';
  const labelClass = 'block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5';

  return (
    <div className={embedded ? 'p-5' : 'p-6'}>
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-medium text-white ${
          toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        }`}>
          {toast.message}
        </div>
      )}

      {/* Standalone header */}
      {!embedded && (
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Edit CTA Section</h1>
          <p className="text-gray-500 text-sm mt-0.5">Kelola Call-to-Action section di homepage</p>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* ── Konten ── */}
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Judul CTA <span className="text-red-400 normal-case">*</span></label>
              <textarea
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className={inputClass}
                placeholder="MARI DISKUSIKAN BAKAT & MINAT KAMU..."
                rows={4}
                required
              />
            </div>
            <div>
              <label className={labelClass}>Deskripsi</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className={inputClass}
                placeholder="Deskripsi singkat CTA..."
                rows={4}
              />
            </div>
          </div>

          <div className="h-px bg-gray-100" />

          {/* ── Tombol ── */}
          <div className="space-y-4">
            {/* Primary */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-5 h-5 bg-yellow-400 rounded text-[10px] flex items-center justify-center text-gray-900 font-bold flex-shrink-0">1</span>
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Button Utama (Kuning)</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Teks <span className="text-red-400">*</span></label>
                  <input type="text" value={formData.primaryButtonText}
                    onChange={(e) => setFormData({ ...formData, primaryButtonText: e.target.value })}
                    className={inputClass} placeholder="DAFTAR SEKARANG" required />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Link <span className="text-red-400">*</span></label>
                  <input type="text" value={formData.primaryButtonLink}
                    onChange={(e) => setFormData({ ...formData, primaryButtonLink: e.target.value })}
                    className={inputClass} placeholder="/pendaftaran" required />
                </div>
              </div>
            </div>

            {/* Secondary */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-5 h-5 border-2 border-gray-300 rounded text-[10px] flex items-center justify-center text-gray-500 font-bold flex-shrink-0">2</span>
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Button Sekunder (Outline)</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Teks</label>
                  <input type="text" value={formData.secondaryButtonText}
                    onChange={(e) => setFormData({ ...formData, secondaryButtonText: e.target.value })}
                    className={inputClass} placeholder="LAYANAN INFORMASI" />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Link</label>
                  <input type="text" value={formData.secondaryButtonLink}
                    onChange={(e) => setFormData({ ...formData, secondaryButtonLink: e.target.value })}
                    className={inputClass} placeholder="/kontak" />
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-1.5">Kosongkan jika tidak ingin menampilkan button sekunder</p>
            </div>
          </div>

          <div className="h-px bg-gray-100" />

          {/* ── Background Image ── */}
          <div>
            <label className={labelClass}>Background Image</label>
            {formData.backgroundImage ? (
              <div className="relative rounded-xl overflow-hidden">
                <img src={formData.backgroundImage} alt="Background" className="w-full h-36 object-cover" />
                <button
                  type="button"
                  onClick={removeBackground}
                  className="absolute top-2 right-2 px-2.5 py-1 bg-red-500/90 text-white text-xs rounded-lg hover:bg-red-600 transition"
                >
                  Hapus
                </button>
              </div>
            ) : (
              <label
                htmlFor="bg-upload"
                className={`flex flex-col items-center justify-center gap-1.5 w-full h-28 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50/40 transition-colors ${uploading ? 'opacity-60 cursor-not-allowed' : ''}`}
              >
                <input type="file" id="bg-upload" accept="image/*" onChange={handleBackgroundUpload} className="hidden" disabled={uploading} />
                {uploading ? (
                  <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <svg className="w-7 h-7 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-xs text-gray-400">Klik untuk upload · PNG, JPG maks 5MB</span>
                  </>
                )}
              </label>
            )}
          </div>

        </form>
      )}

      {/* ── Preview Modal ── */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white/80 backdrop-blur-2xl border border-white/70 rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.15),inset_0_1px_0_rgba(255,255,255,0.9)] w-full max-w-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-black/[0.06] sticky top-0 bg-white/80 backdrop-blur-2xl rounded-t-2xl">
              <h3 className="text-sm font-semibold text-gray-800">Preview CTA</h3>
              <button
                onClick={() => setShowPreview(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-black/5 rounded-lg transition-colors"
              >
                <X size={14} />
              </button>
            </div>
            <div className="p-5">
              <div
                className="relative rounded-xl overflow-hidden min-h-[260px] flex items-center"
                style={{
                  backgroundImage: formData.backgroundImage
                    ? `url(${formData.backgroundImage})`
                    : 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              >
                <div className="absolute inset-0 bg-black/50" />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg, rgba(30,30,30,0.8) 0%, rgba(30,30,30,0.6) 50%, rgba(255,221,85,0.4) 100%)' }} />
                <div className="relative z-10 p-6 max-w-md">
                  <h2 className="text-base font-bold text-yellow-300 leading-tight uppercase" style={{ fontFamily: "'Russo One', sans-serif" }}>
                    {formData.title || 'JUDUL CTA ANDA'}
                  </h2>
                  {formData.description && (
                    <p className="text-white/85 text-xs mt-3 leading-relaxed">{formData.description}</p>
                  )}
                  <div className="flex gap-3 mt-4 flex-wrap">
                    <span className="bg-yellow-400 text-black px-4 py-2 rounded text-xs font-semibold uppercase">
                      {formData.primaryButtonText || 'BUTTON UTAMA'}
                    </span>
                    {formData.secondaryButtonText && (
                      <span className="bg-transparent text-white px-4 py-2 border-2 border-white rounded text-xs font-semibold uppercase">
                        {formData.secondaryButtonText}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-3 text-center">Gambaran kasar — tampilan sebenarnya mungkin berbeda.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CTAManagement;
