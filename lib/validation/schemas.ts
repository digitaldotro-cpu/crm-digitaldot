import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

export const createClientSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/),
  website: z.string().url().optional().or(z.literal('')),
  status: z.string().min(2)
});

export const createProjectSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  clientCompanyId: z.string().uuid(),
  status: z.enum(['PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'ARCHIVED']),
  services: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional()
});

export const createTaskSchema = z.object({
  projectId: z.string().uuid(),
  title: z.string().min(2),
  description: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  status: z.enum(['TODO', 'IN_PROGRESS', 'BLOCKED', 'REVIEW', 'DONE']),
  deadline: z.string().optional(),
  assigneeId: z.string().uuid().optional().or(z.literal('')),
  visibleToClient: z.boolean().default(false),
  internalNotes: z.string().optional()
});

export const createTimeEntrySchema = z.object({
  projectId: z.string().uuid(),
  taskId: z.string().uuid().optional().or(z.literal('')),
  description: z.string().optional(),
  activityType: z.string().optional(),
  startedAt: z.string(),
  endedAt: z.string().optional(),
  visibleToClient: z.boolean().default(false)
});

export const createFinancialTransactionSchema = z.object({
  type: z.enum(['INCOME', 'OUTCOME']),
  categoryId: z.string().uuid(),
  projectId: z.string().uuid().optional().or(z.literal('')),
  clientCompanyId: z.string().uuid().optional().or(z.literal('')),
  amount: z.coerce.number().positive(),
  currency: z.string().min(3).max(3),
  status: z.enum(['PLANNED', 'ISSUED', 'PAID', 'OVERDUE']),
  dueDate: z.string().optional(),
  note: z.string().optional()
});

export const createLeadSchema = z.object({
  companyName: z.string().min(2),
  contactName: z.string().min(2),
  contactEmail: z.string().email(),
  contactPhone: z.string().optional(),
  source: z.string().optional(),
  stage: z.enum(['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST']),
  nextStep: z.string().optional(),
  reminderAt: z.string().optional(),
  notes: z.string().optional()
});

export const createAssetSchema = z.object({
  name: z.string().min(2),
  category: z.string().min(2),
  serialNumber: z.string().min(2),
  status: z.enum(['AVAILABLE', 'IN_USE', 'IN_SERVICE', 'RETIRED']),
  responsibleUserId: z.string().uuid().optional().or(z.literal('')),
  projectId: z.string().uuid().optional().or(z.literal('')),
  location: z.string().optional(),
  notes: z.string().optional(),
  services: z.string().optional()
});

export const createCommissionSchema = z.object({
  projectId: z.string().uuid(),
  name: z.string().min(2),
  type: z.enum(['FIXED', 'PERCENTAGE', 'MIXED']),
  fixedAmount: z.coerce.number().optional(),
  percentage: z.coerce.number().optional(),
  participantUserId: z.string().uuid(),
  allocationAmount: z.coerce.number().optional(),
  allocationPercentage: z.coerce.number().optional()
});

export const createSecretSchema = z.object({
  projectId: z.string().uuid(),
  name: z.string().min(2),
  username: z.string().optional(),
  secretValue: z.string().min(3),
  description: z.string().optional()
});

export const createTemplateSchema = z.object({
  name: z.string().min(2),
  type: z.enum(['NDA', 'CONTRACT', 'OFFER', 'INTERNAL']),
  content: z.string().min(10),
  requiresNdaSigned: z.boolean().default(false),
  includesServiceConfidentialityClause: z.boolean().default(false),
  includesDisclosurePenaltyClause: z.boolean().default(false)
});

export const generateDocumentSchema = z.object({
  templateId: z.string().uuid(),
  projectId: z.string().uuid(),
  title: z.string().min(3),
  dataJson: z.string().optional(),
  publishToClient: z.boolean().default(false)
});
