-- CreateEnum
CREATE TYPE "CompanyType" AS ENUM ('AGENCY', 'CLIENT');

-- CreateEnum
CREATE TYPE "SystemRole" AS ENUM ('ADMIN', 'PROJECT_MANAGER', 'SPECIALIST', 'FINANCE', 'CLIENT');

-- CreateEnum
CREATE TYPE "ProjectMembershipRole" AS ENUM ('MANAGER', 'CONTRIBUTOR', 'VIEWER', 'FINANCE_REVIEWER', 'CLIENT_VIEWER');

-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('TODO', 'IN_PROGRESS', 'BLOCKED', 'REVIEW', 'DONE');

-- CreateEnum
CREATE TYPE "TaskPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "TimeEntryStatus" AS ENUM ('RUNNING', 'SUBMITTED', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('INCOME', 'OUTCOME');

-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('PLANNED', 'ISSUED', 'PAID', 'OVERDUE');

-- CreateEnum
CREATE TYPE "LeadStage" AS ENUM ('NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST');

-- CreateEnum
CREATE TYPE "AssetStatus" AS ENUM ('AVAILABLE', 'IN_USE', 'IN_SERVICE', 'RETIRED');

-- CreateEnum
CREATE TYPE "CommissionType" AS ENUM ('FIXED', 'PERCENTAGE', 'MIXED');

-- CreateEnum
CREATE TYPE "ApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "DocumentTemplateType" AS ENUM ('NDA', 'CONTRACT', 'OFFER', 'INTERNAL');

-- CreateEnum
CREATE TYPE "DocumentInstanceStatus" AS ENUM ('DRAFT', 'GENERATED', 'SENT', 'VIEWED', 'SIGNED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('EMAIL', 'PORTAL', 'PUSH');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('PENDING', 'SENT', 'FAILED');

-- CreateEnum
CREATE TYPE "CollectionVisibility" AS ENUM ('PRIVATE', 'TEAM', 'FINANCE_ONLY', 'ADMIN_ONLY');

-- CreateEnum
CREATE TYPE "FilePurpose" AS ENUM ('TASK_ATTACHMENT', 'CLIENT_UPLOAD', 'DOCUMENT', 'ONBOARDING', 'OTHER');

-- CreateEnum
CREATE TYPE "AuditSeverity" AS ENUM ('INFO', 'WARN', 'CRITICAL');

-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL,
    "type" "CompanyType" NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "website" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contact" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "position" TEXT,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "SystemRole" NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "clientCompanyId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" "ProjectStatus" NOT NULL DEFAULT 'PLANNING',
    "services" JSONB,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "clientCompanyId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectMembership" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "ProjectMembershipRole" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectMembership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "internalNotes" TEXT,
    "status" "TaskStatus" NOT NULL DEFAULT 'TODO',
    "priority" "TaskPriority" NOT NULL DEFAULT 'MEDIUM',
    "deadline" TIMESTAMP(3),
    "assigneeId" TEXT,
    "createdById" TEXT NOT NULL,
    "visibleToClient" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaskComment" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "isInternal" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TaskComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaskChecklistItem" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TaskChecklistItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaskFile" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "uploadedById" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "isClientVisible" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TaskFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TimeEntry" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "taskId" TEXT,
    "userId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "endedAt" TIMESTAMP(3),
    "durationMinutes" INTEGER,
    "description" TEXT,
    "activityType" TEXT,
    "status" "TimeEntryStatus" NOT NULL DEFAULT 'SUBMITTED',
    "visibleToClient" BOOLEAN NOT NULL DEFAULT false,
    "approvedById" TEXT,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TimeEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FinancialCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "TransactionType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FinancialCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FinancialTransaction" (
    "id" TEXT NOT NULL,
    "type" "TransactionType" NOT NULL,
    "categoryId" TEXT NOT NULL,
    "projectId" TEXT,
    "clientCompanyId" TEXT,
    "amount" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "status" "TransactionStatus" NOT NULL DEFAULT 'PLANNED',
    "dueDate" TIMESTAMP(3),
    "note" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FinancialTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "contactName" TEXT NOT NULL,
    "contactEmail" TEXT NOT NULL,
    "contactPhone" TEXT,
    "source" TEXT,
    "stage" "LeadStage" NOT NULL DEFAULT 'NEW',
    "nextStep" TEXT,
    "reminderAt" TIMESTAMP(3),
    "notes" TEXT,
    "convertedClientId" TEXT,
    "convertedProjectId" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Asset" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "serialNumber" TEXT NOT NULL,
    "status" "AssetStatus" NOT NULL DEFAULT 'AVAILABLE',
    "location" TEXT,
    "notes" TEXT,
    "services" JSONB,
    "responsibleUserId" TEXT,
    "projectId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Asset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommissionRule" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "CommissionType" NOT NULL,
    "fixedAmount" DECIMAL(12,2),
    "percentage" DECIMAL(5,2),
    "approvalStatus" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "proposedById" TEXT NOT NULL,
    "approvedById" TEXT,
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CommissionRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommissionAllocation" (
    "id" TEXT NOT NULL,
    "ruleId" TEXT NOT NULL,
    "participantUserId" TEXT NOT NULL,
    "amount" DECIMAL(12,2),
    "percentage" DECIMAL(5,2),
    "status" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CommissionAllocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Secret" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "clientCompanyId" TEXT,
    "name" TEXT NOT NULL,
    "username" TEXT,
    "encryptedValue" TEXT NOT NULL,
    "iv" TEXT NOT NULL,
    "authTag" TEXT NOT NULL,
    "description" TEXT,
    "lastRotatedAt" TIMESTAMP(3),
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Secret_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SecretAccessLog" (
    "id" TEXT NOT NULL,
    "secretId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "reason" TEXT,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SecretAccessLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "DocumentTemplateType" NOT NULL,
    "content" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "requiresNdaSigned" BOOLEAN NOT NULL DEFAULT false,
    "includesServiceConfidentialityClause" BOOLEAN NOT NULL DEFAULT false,
    "includesDisclosurePenaltyClause" BOOLEAN NOT NULL DEFAULT false,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DocumentTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentTemplateVersion" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "changeNote" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DocumentTemplateVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentInstance" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "clientCompanyId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "status" "DocumentInstanceStatus" NOT NULL DEFAULT 'GENERATED',
    "generatedData" JSONB,
    "publishedToClient" BOOLEAN NOT NULL DEFAULT false,
    "requiresNdaSigned" BOOLEAN NOT NULL DEFAULT false,
    "createdById" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3),
    "viewedAt" TIMESTAMP(3),
    "signedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DocumentInstance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KnowledgeCollection" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "visibility" "CollectionVisibility" NOT NULL DEFAULT 'TEAM',
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KnowledgeCollection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KnowledgeDocument" (
    "id" TEXT NOT NULL,
    "collectionId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "isSensitive" BOOLEAN NOT NULL DEFAULT false,
    "createdById" TEXT NOT NULL,
    "updatedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KnowledgeDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "companyId" TEXT,
    "channel" "NotificationChannel" NOT NULL,
    "type" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "status" "NotificationStatus" NOT NULL DEFAULT 'PENDING',
    "metadata" JSONB,
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientReportSnapshot" (
    "id" TEXT NOT NULL,
    "clientCompanyId" TEXT NOT NULL,
    "projectId" TEXT,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "sales" DECIMAL(12,2),
    "agencyCost" DECIMAL(12,2),
    "adsCost" DECIMAL(12,2),
    "socialMetrics" JSONB,
    "notes" TEXT,
    "publishedToClient" BOOLEAN NOT NULL DEFAULT false,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClientReportSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OnboardingItem" (
    "id" TEXT NOT NULL,
    "clientCompanyId" TEXT NOT NULL,
    "projectId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'TODO',
    "dueDate" TIMESTAMP(3),
    "isClientVisible" BOOLEAN NOT NULL DEFAULT true,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OnboardingItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UploadedFile" (
    "id" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "purpose" "FilePurpose" NOT NULL,
    "projectId" TEXT,
    "clientCompanyId" TEXT,
    "uploadedById" TEXT NOT NULL,
    "isClientVisible" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UploadedFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "actorUserId" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "severity" "AuditSeverity" NOT NULL DEFAULT 'INFO',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Company_slug_key" ON "Company"("slug");

-- CreateIndex
CREATE INDEX "Company_type_idx" ON "Company"("type");

-- CreateIndex
CREATE INDEX "Contact_companyId_idx" ON "Contact"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_clientCompanyId_idx" ON "User"("clientCompanyId");

-- CreateIndex
CREATE INDEX "Project_clientCompanyId_idx" ON "Project"("clientCompanyId");

-- CreateIndex
CREATE INDEX "Project_status_idx" ON "Project"("status");

-- CreateIndex
CREATE INDEX "ProjectMembership_userId_idx" ON "ProjectMembership"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectMembership_projectId_userId_key" ON "ProjectMembership"("projectId", "userId");

-- CreateIndex
CREATE INDEX "Task_projectId_status_idx" ON "Task"("projectId", "status");

-- CreateIndex
CREATE INDEX "Task_assigneeId_idx" ON "Task"("assigneeId");

-- CreateIndex
CREATE INDEX "Task_visibleToClient_idx" ON "Task"("visibleToClient");

-- CreateIndex
CREATE INDEX "TaskComment_taskId_idx" ON "TaskComment"("taskId");

-- CreateIndex
CREATE INDEX "TaskChecklistItem_taskId_idx" ON "TaskChecklistItem"("taskId");

-- CreateIndex
CREATE INDEX "TaskFile_taskId_idx" ON "TaskFile"("taskId");

-- CreateIndex
CREATE INDEX "TimeEntry_projectId_status_idx" ON "TimeEntry"("projectId", "status");

-- CreateIndex
CREATE INDEX "TimeEntry_userId_idx" ON "TimeEntry"("userId");

-- CreateIndex
CREATE INDEX "TimeEntry_visibleToClient_idx" ON "TimeEntry"("visibleToClient");

-- CreateIndex
CREATE UNIQUE INDEX "FinancialCategory_name_key" ON "FinancialCategory"("name");

-- CreateIndex
CREATE INDEX "FinancialTransaction_projectId_idx" ON "FinancialTransaction"("projectId");

-- CreateIndex
CREATE INDEX "FinancialTransaction_clientCompanyId_idx" ON "FinancialTransaction"("clientCompanyId");

-- CreateIndex
CREATE INDEX "FinancialTransaction_status_idx" ON "FinancialTransaction"("status");

-- CreateIndex
CREATE INDEX "Lead_stage_idx" ON "Lead"("stage");

-- CreateIndex
CREATE UNIQUE INDEX "Asset_serialNumber_key" ON "Asset"("serialNumber");

-- CreateIndex
CREATE INDEX "Asset_status_idx" ON "Asset"("status");

-- CreateIndex
CREATE INDEX "Asset_projectId_idx" ON "Asset"("projectId");

-- CreateIndex
CREATE INDEX "CommissionRule_projectId_idx" ON "CommissionRule"("projectId");

-- CreateIndex
CREATE INDEX "CommissionRule_approvalStatus_idx" ON "CommissionRule"("approvalStatus");

-- CreateIndex
CREATE INDEX "CommissionAllocation_ruleId_idx" ON "CommissionAllocation"("ruleId");

-- CreateIndex
CREATE INDEX "Secret_projectId_idx" ON "Secret"("projectId");

-- CreateIndex
CREATE INDEX "Secret_clientCompanyId_idx" ON "Secret"("clientCompanyId");

-- CreateIndex
CREATE INDEX "SecretAccessLog_secretId_idx" ON "SecretAccessLog"("secretId");

-- CreateIndex
CREATE INDEX "DocumentTemplate_type_idx" ON "DocumentTemplate"("type");

-- CreateIndex
CREATE UNIQUE INDEX "DocumentTemplateVersion_templateId_version_key" ON "DocumentTemplateVersion"("templateId", "version");

-- CreateIndex
CREATE INDEX "DocumentInstance_projectId_idx" ON "DocumentInstance"("projectId");

-- CreateIndex
CREATE INDEX "DocumentInstance_clientCompanyId_idx" ON "DocumentInstance"("clientCompanyId");

-- CreateIndex
CREATE INDEX "DocumentInstance_status_idx" ON "DocumentInstance"("status");

-- CreateIndex
CREATE INDEX "KnowledgeDocument_collectionId_idx" ON "KnowledgeDocument"("collectionId");

-- CreateIndex
CREATE INDEX "Notification_status_idx" ON "Notification"("status");

-- CreateIndex
CREATE INDEX "ClientReportSnapshot_clientCompanyId_idx" ON "ClientReportSnapshot"("clientCompanyId");

-- CreateIndex
CREATE INDEX "OnboardingItem_clientCompanyId_idx" ON "OnboardingItem"("clientCompanyId");

-- CreateIndex
CREATE INDEX "UploadedFile_projectId_idx" ON "UploadedFile"("projectId");

-- CreateIndex
CREATE INDEX "UploadedFile_clientCompanyId_idx" ON "UploadedFile"("clientCompanyId");

-- CreateIndex
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_idx" ON "AuditLog"("entityType");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_clientCompanyId_fkey" FOREIGN KEY ("clientCompanyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_clientCompanyId_fkey" FOREIGN KEY ("clientCompanyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectMembership" ADD CONSTRAINT "ProjectMembership_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectMembership" ADD CONSTRAINT "ProjectMembership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskComment" ADD CONSTRAINT "TaskComment_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskComment" ADD CONSTRAINT "TaskComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskChecklistItem" ADD CONSTRAINT "TaskChecklistItem_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskFile" ADD CONSTRAINT "TaskFile_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskFile" ADD CONSTRAINT "TaskFile_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimeEntry" ADD CONSTRAINT "TimeEntry_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimeEntry" ADD CONSTRAINT "TimeEntry_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimeEntry" ADD CONSTRAINT "TimeEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimeEntry" ADD CONSTRAINT "TimeEntry_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinancialTransaction" ADD CONSTRAINT "FinancialTransaction_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "FinancialCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinancialTransaction" ADD CONSTRAINT "FinancialTransaction_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinancialTransaction" ADD CONSTRAINT "FinancialTransaction_clientCompanyId_fkey" FOREIGN KEY ("clientCompanyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinancialTransaction" ADD CONSTRAINT "FinancialTransaction_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_convertedClientId_fkey" FOREIGN KEY ("convertedClientId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_convertedProjectId_fkey" FOREIGN KEY ("convertedProjectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Asset" ADD CONSTRAINT "Asset_responsibleUserId_fkey" FOREIGN KEY ("responsibleUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Asset" ADD CONSTRAINT "Asset_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommissionRule" ADD CONSTRAINT "CommissionRule_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommissionRule" ADD CONSTRAINT "CommissionRule_proposedById_fkey" FOREIGN KEY ("proposedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommissionRule" ADD CONSTRAINT "CommissionRule_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommissionAllocation" ADD CONSTRAINT "CommissionAllocation_ruleId_fkey" FOREIGN KEY ("ruleId") REFERENCES "CommissionRule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommissionAllocation" ADD CONSTRAINT "CommissionAllocation_participantUserId_fkey" FOREIGN KEY ("participantUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Secret" ADD CONSTRAINT "Secret_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Secret" ADD CONSTRAINT "Secret_clientCompanyId_fkey" FOREIGN KEY ("clientCompanyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Secret" ADD CONSTRAINT "Secret_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SecretAccessLog" ADD CONSTRAINT "SecretAccessLog_secretId_fkey" FOREIGN KEY ("secretId") REFERENCES "Secret"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SecretAccessLog" ADD CONSTRAINT "SecretAccessLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentTemplate" ADD CONSTRAINT "DocumentTemplate_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentTemplateVersion" ADD CONSTRAINT "DocumentTemplateVersion_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "DocumentTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentTemplateVersion" ADD CONSTRAINT "DocumentTemplateVersion_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentInstance" ADD CONSTRAINT "DocumentInstance_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "DocumentTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentInstance" ADD CONSTRAINT "DocumentInstance_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentInstance" ADD CONSTRAINT "DocumentInstance_clientCompanyId_fkey" FOREIGN KEY ("clientCompanyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentInstance" ADD CONSTRAINT "DocumentInstance_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KnowledgeCollection" ADD CONSTRAINT "KnowledgeCollection_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KnowledgeDocument" ADD CONSTRAINT "KnowledgeDocument_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "KnowledgeCollection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KnowledgeDocument" ADD CONSTRAINT "KnowledgeDocument_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KnowledgeDocument" ADD CONSTRAINT "KnowledgeDocument_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientReportSnapshot" ADD CONSTRAINT "ClientReportSnapshot_clientCompanyId_fkey" FOREIGN KEY ("clientCompanyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientReportSnapshot" ADD CONSTRAINT "ClientReportSnapshot_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OnboardingItem" ADD CONSTRAINT "OnboardingItem_clientCompanyId_fkey" FOREIGN KEY ("clientCompanyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OnboardingItem" ADD CONSTRAINT "OnboardingItem_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UploadedFile" ADD CONSTRAINT "UploadedFile_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UploadedFile" ADD CONSTRAINT "UploadedFile_clientCompanyId_fkey" FOREIGN KEY ("clientCompanyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UploadedFile" ADD CONSTRAINT "UploadedFile_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

