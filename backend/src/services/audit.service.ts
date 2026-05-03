import mongoose from 'mongoose';
import { AuditRepository } from '../repositories/audit.repository.js';

const repo = new AuditRepository();

export async function recordAudit(params: {
  entityType: string;
  entityId: string;
  action: string;
  userId?: string;
  details?: Record<string, unknown>;
}) {
  try {
    if (!mongoose.Types.ObjectId.isValid(params.entityId)) return;
    await repo.create({
      entityType: params.entityType,
      entityId: new mongoose.Types.ObjectId(params.entityId),
      action: params.action,
      userId:
        params.userId && mongoose.Types.ObjectId.isValid(params.userId)
          ? new mongoose.Types.ObjectId(params.userId)
          : undefined,
      details: params.details ?? {}
    });
  } catch (e) {
    console.error('audit log failed', e);
  }
}

export async function getAuditTrail(entityType: string, entityId: string, limit?: number) {
  return repo.findByEntity(entityType, entityId, limit);
}
