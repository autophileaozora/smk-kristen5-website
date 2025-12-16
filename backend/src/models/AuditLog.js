import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    action: {
      type: String,
      required: true,
      enum: [
        'login',
        'logout',
        'create',
        'read',
        'update',
        'delete',
        'approve',
        'reject',
        'upload',
        'download'
      ],
    },
    resource: {
      type: String,
      required: true,
      enum: [
        'user',
        'article',
        'runningText',
        'prestasi',
        'jurusan',
        'ekskul',
        'alumni',
        'category',
        'videoHero',
        'file',
        'partner',
        'socialMedia',
        'cta',
        'about',
        'mataPelajaran',
        'fasilitas',
        'contact'
      ],
    },
    resourceId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    details: {
      type: mongoose.Schema.Types.Mixed, // Flexible field for additional info
      default: {},
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
    status: {
      type: String,
      enum: ['success', 'failed'],
      default: 'success',
    },
    errorMessage: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true, // Only createdAt needed for logs
  }
);

// Index for better query performance
auditLogSchema.index({ user: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, resource: 1, createdAt: -1 });
auditLogSchema.index({ resourceId: 1 });

// Auto-delete old logs after 90 days (optional, for storage optimization)
auditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 }); // 90 days

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

export default AuditLog;
