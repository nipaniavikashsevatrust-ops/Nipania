import prisma from './prisma';

interface LogActionParams {
  action: string;
  module: string;
  performedBy: string;
  userEmail: string;
  details: string;
  ipAddress?: string;
}

export async function logAuditAction(params: LogActionParams) {
  try {
    await prisma.auditLog.create({
      data: {
        action: params.action,
        module: params.module,
        performedBy: params.performedBy,
        userEmail: params.userEmail,
        details: params.details,
        ipAddress: params.ipAddress || '127.0.0.1',
      },
    });
  } catch (error) {
    console.error('Failed to write audit log:', error);
  }
}
