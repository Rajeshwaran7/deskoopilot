import mongoose from 'mongoose';
import { AuditLogModel, IAuditLog } from '../models/AuditLog.model.js';

export class AuditRepository {
  async create(data: Partial<IAuditLog>) {
    return AuditLogModel.create(data);
  }

  async findByEntity(entityType: string, entityId: string, limit = 100) {
    if (!mongoose.Types.ObjectId.isValid(entityId)) return [];
    return AuditLogModel.find({ entityType, entityId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
  }
}
