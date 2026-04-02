import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getSessionFromRequest } from '@/lib/auth/request-session';
import { auditLog } from '@/lib/security/audit';

const MAX_FILE_BYTES = 10 * 1024 * 1024;

export async function POST(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get('file');
  const projectId = String(formData.get('projectId') ?? '');
  const purpose = String(formData.get('purpose') ?? 'OTHER');
  const isClientVisible = String(formData.get('isClientVisible') ?? 'false') === 'true';

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Fisier lipsa' }, { status: 400 });
  }

  if (!projectId) {
    return NextResponse.json({ error: 'Project invalid' }, { status: 400 });
  }

  if (file.size > MAX_FILE_BYTES) {
    return NextResponse.json({ error: 'Fisier prea mare (max 10MB)' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, role: true, clientCompanyId: true }
  });

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const project = await prisma.project.findFirst({
    where:
      user.role === 'CLIENT'
        ? { id: projectId, clientCompanyId: user.clientCompanyId ?? '' }
        : {
            id: projectId,
            OR:
              user.role === 'ADMIN' || user.role === 'FINANCE'
                ? undefined
                : [{ memberships: { some: { userId: user.id } } }]
          },
    select: { id: true, clientCompanyId: true }
  });

  if (!project) {
    return NextResponse.json({ error: 'Nu ai acces la proiect' }, { status: 403 });
  }

  const uploadDir = process.env.UPLOAD_DIR ?? './uploads';
  const extension = path.extname(file.name);
  const fileName = `${Date.now()}-${randomUUID()}${extension}`;
  const targetDir = path.resolve(uploadDir, projectId);
  const fullPath = path.join(targetDir, fileName);

  await mkdir(targetDir, { recursive: true });

  const arrayBuffer = await file.arrayBuffer();
  await writeFile(fullPath, Buffer.from(arrayBuffer));

  const uploaded = await prisma.uploadedFile.create({
    data: {
      fileName,
      originalName: file.name,
      filePath: fullPath,
      mimeType: file.type || 'application/octet-stream',
      sizeBytes: file.size,
      purpose: ['TASK_ATTACHMENT', 'CLIENT_UPLOAD', 'DOCUMENT', 'ONBOARDING', 'OTHER'].includes(purpose)
        ? (purpose as 'TASK_ATTACHMENT' | 'CLIENT_UPLOAD' | 'DOCUMENT' | 'ONBOARDING' | 'OTHER')
        : 'OTHER',
      projectId: project.id,
      clientCompanyId: project.clientCompanyId,
      uploadedById: user.id,
      isClientVisible
    }
  });

  await auditLog({
    actorUserId: user.id,
    action: 'FILE_UPLOAD',
    entityType: 'UploadedFile',
    entityId: uploaded.id,
    metadata: { projectId: project.id, purpose }
  });

  return NextResponse.json({ id: uploaded.id, fileName: uploaded.originalName });
}
