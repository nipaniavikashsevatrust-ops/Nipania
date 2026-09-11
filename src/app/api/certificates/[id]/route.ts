import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionFromRequest, hasPermission } from '@/lib/auth';
import { logAuditAction } from '@/lib/audit';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || !hasPermission(session.role, 'certificates')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const rawId = decodeURIComponent(params.id).trim();
    const altNvst = rawId.replace(/^HRMEWT-CERT-/i, 'NVST-CERT-').replace(/^NVS-CERT-/i, 'NVST-CERT-');
    const altHrmewt = rawId.replace(/^NVST-CERT-/i, 'HRMEWT-CERT-');

    const certificate = await prisma.certificate.findFirst({
      where: {
        OR: [
          { id: rawId },
          { certificateNumber: rawId },
          { certificateNumber: altNvst },
          { certificateNumber: altHrmewt },
        ],
      },
      include: {
        volunteer: true,
        event: true,
        project: true,
      },
    });

    if (!certificate) {
      return NextResponse.json({ error: 'Certificate not found' }, { status: 404 });
    }

    return NextResponse.json({ certificate });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch certificate' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || !hasPermission(session.role, 'certificates')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const existing = await prisma.certificate.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Certificate not found' }, { status: 404 });
    }

    const body = await req.json();
    const {
      status,
      revocationReason,
      title,
      recipientName,
      recipientEmail,
      recipientPhone,
      description,
      signatoryName,
      signatoryTitle,
      certificateType,
      issueDate,
    } = body;

    const dataToUpdate: any = {};

    // 1. Handling Revocation
    if (status === 'REVOKED') {
      if (!revocationReason || !revocationReason.trim()) {
        return NextResponse.json({ error: 'Revocation reason is required to revoke an official certificate.' }, { status: 400 });
      }
      dataToUpdate.status = 'REVOKED';
      dataToUpdate.revokedAt = new Date();
      dataToUpdate.revocationReason = revocationReason.trim();
      dataToUpdate.revokedBy = session.name;

      const updated = await prisma.certificate.update({
        where: { id: params.id },
        data: dataToUpdate,
      });

      await logAuditAction({
        action: 'CERTIFICATE_REVOKED',
        module: 'CERTIFICATE',
        performedBy: session.name,
        userEmail: session.email,
        details: `Certificate ${existing.certificateNumber} revoked for ${existing.recipientName}. Reason: "${revocationReason.trim()}".`,
      });

      return NextResponse.json({ success: true, certificate: updated });
    }

    // 2. Handling Issuance of Draft
    if (status === 'ISSUED' && existing.status === 'DRAFT') {
      dataToUpdate.status = 'ISSUED';
      dataToUpdate.approvedBy = session.name;
      if (issueDate) dataToUpdate.issueDate = new Date(issueDate);

      const updated = await prisma.certificate.update({
        where: { id: params.id },
        data: dataToUpdate,
      });

      await logAuditAction({
        action: 'CERTIFICATE_ISSUED',
        module: 'CERTIFICATE',
        performedBy: session.name,
        userEmail: session.email,
        details: `Certificate ${existing.certificateNumber} transitioned from DRAFT to ISSUED for ${existing.recipientName}.`,
      });

      return NextResponse.json({ success: true, certificate: updated });
    }

    // 3. Regular edits (allowed only if DRAFT)
    if (existing.status !== 'DRAFT') {
      return NextResponse.json(
        { error: 'Issued or Revoked certificates cannot be modified directly. Please revoke and issue a new certificate to preserve legal integrity.' },
        { status: 400 }
      );
    }

    if (title !== undefined) dataToUpdate.title = title;
    if (certificateType !== undefined) dataToUpdate.certificateType = certificateType;
    if (recipientName !== undefined) dataToUpdate.recipientName = recipientName;
    if (recipientEmail !== undefined) dataToUpdate.recipientEmail = recipientEmail;
    if (recipientPhone !== undefined) dataToUpdate.recipientPhone = recipientPhone;
    if (description !== undefined) dataToUpdate.description = description;
    if (signatoryName !== undefined) dataToUpdate.signatoryName = signatoryName;
    if (signatoryTitle !== undefined) dataToUpdate.signatoryTitle = signatoryTitle;
    if (issueDate !== undefined) dataToUpdate.issueDate = new Date(issueDate);

    const updated = await prisma.certificate.update({
      where: { id: params.id },
      data: dataToUpdate,
    });

    await logAuditAction({
      action: 'CERTIFICATE_UPDATED',
      module: 'CERTIFICATE',
      performedBy: session.name,
      userEmail: session.email,
      details: `Draft certificate ${existing.certificateNumber} details updated.`,
    });

    return NextResponse.json({ success: true, certificate: updated });
  } catch (error: any) {
    console.error('Error updating certificate:', error);
    return NextResponse.json({ error: error.message || 'Failed to update certificate' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || !hasPermission(session.role, 'certificates')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const existing = await prisma.certificate.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Certificate not found' }, { status: 404 });
    }

    if (existing.status !== 'DRAFT') {
      return NextResponse.json(
        { error: 'Only DRAFT certificates can be deleted. Issued or Revoked certificates must remain in the audit register.' },
        { status: 400 }
      );
    }

    await prisma.certificate.delete({
      where: { id: params.id },
    });

    await logAuditAction({
      action: 'CERTIFICATE_DELETED',
      module: 'CERTIFICATE',
      performedBy: session.name,
      userEmail: session.email,
      details: `Draft certificate ${existing.certificateNumber} for ${existing.recipientName} deleted.`,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete certificate' }, { status: 500 });
  }
}
