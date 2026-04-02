'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db/prisma';
import { requireInternalUser } from '@/lib/auth/current-user';
import { canAccessFinance } from '@/lib/domain/permissions';
import { createFinancialTransactionSchema } from '@/lib/validation/schemas';
import { assertProjectAccess } from '@/lib/domain/access';
import { auditLog } from '@/lib/security/audit';

export async function createFinanceTransactionAction(formData: FormData) {
  const user = await requireInternalUser();

  if (!canAccessFinance(user.role)) {
    throw new Error('Nu ai acces la modulul financiar.');
  }

  const parsed = createFinancialTransactionSchema.safeParse({
    type: formData.get('type'),
    categoryId: formData.get('categoryId'),
    projectId: formData.get('projectId') || undefined,
    clientCompanyId: formData.get('clientCompanyId') || undefined,
    amount: formData.get('amount'),
    currency: formData.get('currency'),
    status: formData.get('status'),
    dueDate: formData.get('dueDate') || undefined,
    note: formData.get('note') || undefined
  });

  if (!parsed.success) {
    throw new Error('Date tranzactie invalide.');
  }

  if (parsed.data.projectId) {
    await assertProjectAccess(user, parsed.data.projectId);
  }

  const transaction = await prisma.financialTransaction.create({
    data: {
      type: parsed.data.type,
      categoryId: parsed.data.categoryId,
      projectId: parsed.data.projectId || null,
      clientCompanyId: parsed.data.clientCompanyId || null,
      amount: parsed.data.amount,
      currency: parsed.data.currency.toUpperCase(),
      status: parsed.data.status,
      dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null,
      note: parsed.data.note,
      createdById: user.id
    }
  });

  await auditLog({
    actorUserId: user.id,
    action: 'FINANCIAL_TRANSACTION_CREATED',
    entityType: 'FinancialTransaction',
    entityId: transaction.id,
    severity: 'WARN'
  });

  revalidatePath('/finance');
}

export async function createFinanceCategoryAction(formData: FormData) {
  const user = await requireInternalUser();

  if (!canAccessFinance(user.role)) {
    throw new Error('Nu ai acces la modulul financiar.');
  }

  const name = String(formData.get('name') ?? '').trim();
  const type = String(formData.get('type') ?? 'OUTCOME');

  if (!name) {
    throw new Error('Categorie invalida.');
  }

  await prisma.financialCategory.upsert({
    where: { name },
    update: {
      type: type as 'INCOME' | 'OUTCOME'
    },
    create: {
      name,
      type: type as 'INCOME' | 'OUTCOME'
    }
  });

  revalidatePath('/finance');
}
