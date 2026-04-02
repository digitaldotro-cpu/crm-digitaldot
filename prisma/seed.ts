import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../lib/auth/password';
import { encryptSecret } from '../lib/security/secrets';

const prisma = new PrismaClient();

async function cleanDatabase() {
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.secretAccessLog.deleteMany();
  await prisma.secret.deleteMany();
  await prisma.taskComment.deleteMany();
  await prisma.taskChecklistItem.deleteMany();
  await prisma.taskFile.deleteMany();
  await prisma.timeEntry.deleteMany();
  await prisma.task.deleteMany();
  await prisma.projectMembership.deleteMany();
  await prisma.commissionAllocation.deleteMany();
  await prisma.commissionRule.deleteMany();
  await prisma.asset.deleteMany();
  await prisma.financialTransaction.deleteMany();
  await prisma.financialCategory.deleteMany();
  await prisma.documentInstance.deleteMany();
  await prisma.documentTemplateVersion.deleteMany();
  await prisma.documentTemplate.deleteMany();
  await prisma.onboardingItem.deleteMany();
  await prisma.uploadedFile.deleteMany();
  await prisma.clientReportSnapshot.deleteMany();
  await prisma.knowledgeDocument.deleteMany();
  await prisma.knowledgeCollection.deleteMany();
  await prisma.lead.deleteMany();
  await prisma.project.deleteMany();
  await prisma.contact.deleteMany();
  await prisma.user.deleteMany();
  await prisma.company.deleteMany();
}

async function main() {
  if (!process.env.SESSION_SECRET) {
    process.env.SESSION_SECRET = 'dev-session-secret-please-change-123456789';
  }

  if (!process.env.SECRETS_ENCRYPTION_KEY) {
    process.env.SECRETS_ENCRYPTION_KEY = Buffer.from('0123456789abcdef0123456789abcdef').toString('base64');
  }

  await cleanDatabase();

  const agency = await prisma.company.create({
    data: {
      type: 'AGENCY',
      name: 'Digital Dot Agency',
      slug: 'digital-dot-agency',
      status: 'ACTIVE',
      website: 'https://digitaldot.example'
    }
  });

  const fitcore = await prisma.company.create({
    data: {
      type: 'CLIENT',
      name: 'FitCore Labs',
      slug: 'fitcore-labs',
      status: 'ACTIVE',
      website: 'https://fitcore.example',
      contacts: {
        create: [
          {
            name: 'Andrei Popescu',
            email: 'andrei@fitcore.example',
            phone: '+40 722 000 111',
            position: 'CEO',
            isPrimary: true
          },
          {
            name: 'Ioana Muresan',
            email: 'ioana@fitcore.example',
            phone: '+40 731 000 222',
            position: 'Marketing Lead'
          }
        ]
      }
    }
  });

  const greenbite = await prisma.company.create({
    data: {
      type: 'CLIENT',
      name: 'GreenBite Foods',
      slug: 'greenbite-foods',
      status: 'ACTIVE',
      website: 'https://greenbite.example',
      contacts: {
        create: [
          {
            name: 'Mihai Dinu',
            email: 'mihai@greenbite.example',
            phone: '+40 740 000 333',
            position: 'Founder',
            isPrimary: true
          }
        ]
      }
    }
  });

  const [adminPass, pmPass, specialistPass, financePass, clientPass] = await Promise.all([
    hashPassword('Admin2026!'),
    hashPassword('Manager2026!'),
    hashPassword('Specialist2026!'),
    hashPassword('Finance2026!'),
    hashPassword('Client2026!')
  ]);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@digitaldot.ro',
      name: 'Alex Marin',
      role: 'ADMIN',
      passwordHash: adminPass
    }
  });

  const pm = await prisma.user.create({
    data: {
      email: 'pm@digitaldot.ro',
      name: 'Bianca Ionescu',
      role: 'PROJECT_MANAGER',
      passwordHash: pmPass
    }
  });

  const specialist = await prisma.user.create({
    data: {
      email: 'specialist@digitaldot.ro',
      name: 'Radu Stoica',
      role: 'SPECIALIST',
      passwordHash: specialistPass
    }
  });

  const finance = await prisma.user.create({
    data: {
      email: 'finance@digitaldot.ro',
      name: 'Cristina Pavel',
      role: 'FINANCE',
      passwordHash: financePass
    }
  });

  const clientUser = await prisma.user.create({
    data: {
      email: 'client@fitcore.ro',
      name: 'Andrei Popescu',
      role: 'CLIENT',
      passwordHash: clientPass,
      clientCompanyId: fitcore.id
    }
  });

  const projectFitCoreLaunch = await prisma.project.create({
    data: {
      name: 'FitCore Q3 Launch',
      description: 'Campanie multi-canal pentru lansare suplimente premium.',
      status: 'ACTIVE',
      services: ['Social Media', 'Paid Ads', 'Email'],
      startDate: new Date('2026-03-01'),
      endDate: new Date('2026-07-30'),
      clientCompanyId: fitcore.id,
      createdById: pm.id
    }
  });

  const projectFitCoreRetention = await prisma.project.create({
    data: {
      name: 'FitCore Retention Sprint',
      description: 'Optimizare funnel retention + CRM automations.',
      status: 'PLANNING',
      services: ['Automation', 'Analytics'],
      startDate: new Date('2026-04-10'),
      endDate: new Date('2026-08-01'),
      clientCompanyId: fitcore.id,
      createdById: pm.id
    }
  });

  const projectGreenbite = await prisma.project.create({
    data: {
      name: 'GreenBite Brand Awareness',
      description: 'Campanie awareness pentru noile produse bio.',
      status: 'ACTIVE',
      services: ['Brand', 'Influencer', 'Performance'],
      startDate: new Date('2026-02-15'),
      endDate: new Date('2026-06-20'),
      clientCompanyId: greenbite.id,
      createdById: admin.id
    }
  });

  await prisma.projectMembership.createMany({
    data: [
      { projectId: projectFitCoreLaunch.id, userId: pm.id, role: 'MANAGER' },
      { projectId: projectFitCoreLaunch.id, userId: specialist.id, role: 'CONTRIBUTOR' },
      { projectId: projectFitCoreLaunch.id, userId: finance.id, role: 'FINANCE_REVIEWER' },
      { projectId: projectFitCoreLaunch.id, userId: clientUser.id, role: 'CLIENT_VIEWER' },
      { projectId: projectFitCoreRetention.id, userId: pm.id, role: 'MANAGER' },
      { projectId: projectFitCoreRetention.id, userId: specialist.id, role: 'CONTRIBUTOR' },
      { projectId: projectGreenbite.id, userId: admin.id, role: 'MANAGER' },
      { projectId: projectGreenbite.id, userId: specialist.id, role: 'CONTRIBUTOR' }
    ]
  });

  const tasks = await prisma.task.createManyAndReturn({
    data: [
      {
        projectId: projectFitCoreLaunch.id,
        title: 'Setare dashboard KPI launch',
        description: 'Definire KPI-uri, tracking events si dashboard initial.',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        deadline: new Date('2026-04-05'),
        assigneeId: specialist.id,
        createdById: pm.id,
        visibleToClient: true
      },
      {
        projectId: projectFitCoreLaunch.id,
        title: 'Draft campanii Meta Ads',
        description: '3 seturi de ad creatives + copy variants.',
        status: 'TODO',
        priority: 'HIGH',
        deadline: new Date('2026-04-08'),
        assigneeId: specialist.id,
        createdById: pm.id,
        visibleToClient: true
      },
      {
        projectId: projectFitCoreLaunch.id,
        title: 'Revizie plan email onboarding',
        description: 'Segmentare + flow welcome de 5 emailuri.',
        status: 'REVIEW',
        priority: 'MEDIUM',
        deadline: new Date('2026-04-12'),
        assigneeId: pm.id,
        createdById: pm.id,
        visibleToClient: true
      },
      {
        projectId: projectFitCoreLaunch.id,
        title: 'Checklist legal claims',
        description: 'Validare claim-uri marketing cu echipa client.',
        status: 'BLOCKED',
        priority: 'URGENT',
        deadline: new Date('2026-04-06'),
        assigneeId: pm.id,
        createdById: admin.id,
        visibleToClient: false,
        internalNotes: 'Awaiting legal reply from client.'
      },
      {
        projectId: projectFitCoreRetention.id,
        title: 'Audit funnel retention',
        description: 'Mapare drop-off points si prioritate quick wins.',
        status: 'TODO',
        priority: 'MEDIUM',
        deadline: new Date('2026-04-20'),
        assigneeId: specialist.id,
        createdById: pm.id,
        visibleToClient: true
      },
      {
        projectId: projectFitCoreRetention.id,
        title: 'Plan automatizare CRM',
        description: 'Define trigger-uri abandon cart + reactivation.',
        status: 'TODO',
        priority: 'HIGH',
        deadline: new Date('2026-04-22'),
        assigneeId: pm.id,
        createdById: pm.id,
        visibleToClient: false
      },
      {
        projectId: projectGreenbite.id,
        title: 'Influencer short list',
        description: 'Lista 20 creatori + scoring.',
        status: 'DONE',
        priority: 'MEDIUM',
        deadline: new Date('2026-03-25'),
        assigneeId: specialist.id,
        createdById: admin.id,
        visibleToClient: true
      },
      {
        projectId: projectGreenbite.id,
        title: 'QA brand assets',
        description: 'Verificare consistenta assets pentru campania de awareness.',
        status: 'IN_PROGRESS',
        priority: 'LOW',
        deadline: new Date('2026-04-15'),
        assigneeId: specialist.id,
        createdById: admin.id,
        visibleToClient: true
      },
      {
        projectId: projectGreenbite.id,
        title: 'Raport costuri media martie',
        description: 'Centralizare spend + explainers.',
        status: 'DONE',
        priority: 'HIGH',
        deadline: new Date('2026-03-31'),
        assigneeId: finance.id,
        createdById: finance.id,
        visibleToClient: false
      }
    ]
  });

  await prisma.taskComment.createMany({
    data: [
      {
        taskId: tasks[0].id,
        userId: specialist.id,
        body: 'Dashboard setup started, event map shared in docs.',
        isInternal: false
      },
      {
        taskId: tasks[3].id,
        userId: pm.id,
        body: 'Blocked by legal confirmation from client counsel.',
        isInternal: true
      },
      {
        taskId: tasks[6].id,
        userId: admin.id,
        body: 'Approved list. Start outreach next.',
        isInternal: false
      }
    ]
  });

  await prisma.taskChecklistItem.createMany({
    data: [
      { taskId: tasks[1].id, label: 'Copy variant A', completed: true },
      { taskId: tasks[1].id, label: 'Copy variant B', completed: false },
      { taskId: tasks[1].id, label: 'Creative set 1', completed: true }
    ]
  });

  await prisma.timeEntry.createMany({
    data: [
      {
        projectId: projectFitCoreLaunch.id,
        taskId: tasks[0].id,
        userId: specialist.id,
        startedAt: new Date('2026-04-01T08:00:00Z'),
        endedAt: new Date('2026-04-01T10:15:00Z'),
        durationMinutes: 135,
        description: 'Configured KPI dashboard structure',
        activityType: 'Analytics',
        status: 'APPROVED',
        visibleToClient: true,
        approvedById: pm.id,
        publishedAt: new Date('2026-04-01T11:00:00Z')
      },
      {
        projectId: projectFitCoreLaunch.id,
        taskId: tasks[1].id,
        userId: specialist.id,
        startedAt: new Date('2026-04-02T09:00:00Z'),
        endedAt: new Date('2026-04-02T11:00:00Z'),
        durationMinutes: 120,
        description: 'Drafted paid ads copy variants',
        activityType: 'Paid Media',
        status: 'SUBMITTED',
        visibleToClient: false
      },
      {
        projectId: projectGreenbite.id,
        taskId: tasks[6].id,
        userId: specialist.id,
        startedAt: new Date('2026-03-20T10:00:00Z'),
        endedAt: new Date('2026-03-20T12:30:00Z'),
        durationMinutes: 150,
        description: 'Influencer scoring and outreach list',
        activityType: 'Research',
        status: 'APPROVED',
        visibleToClient: true,
        approvedById: admin.id,
        publishedAt: new Date('2026-03-20T13:00:00Z')
      },
      {
        projectId: projectFitCoreRetention.id,
        userId: specialist.id,
        startedAt: new Date('2026-04-02T13:00:00Z'),
        status: 'RUNNING',
        description: 'Running retention analysis',
        activityType: 'Analysis',
        visibleToClient: false
      }
    ]
  });

  const catAgency = await prisma.financialCategory.create({
    data: {
      name: 'Servicii agentie',
      type: 'INCOME'
    }
  });

  const catSalary = await prisma.financialCategory.create({
    data: {
      name: 'Colaboratori',
      type: 'OUTCOME'
    }
  });

  const catAds = await prisma.financialCategory.create({
    data: {
      name: 'Buget Ads',
      type: 'OUTCOME'
    }
  });

  await prisma.financialTransaction.createMany({
    data: [
      {
        type: 'INCOME',
        categoryId: catAgency.id,
        projectId: projectFitCoreLaunch.id,
        clientCompanyId: fitcore.id,
        amount: 12500,
        currency: 'EUR',
        status: 'ISSUED',
        dueDate: new Date('2026-04-10'),
        note: 'Monthly retainer April',
        createdById: finance.id
      },
      {
        type: 'OUTCOME',
        categoryId: catAds.id,
        projectId: projectFitCoreLaunch.id,
        clientCompanyId: fitcore.id,
        amount: 4500,
        currency: 'EUR',
        status: 'PAID',
        dueDate: new Date('2026-03-28'),
        note: 'Meta budget March final week',
        createdById: finance.id
      },
      {
        type: 'OUTCOME',
        categoryId: catSalary.id,
        projectId: projectGreenbite.id,
        clientCompanyId: greenbite.id,
        amount: 2200,
        currency: 'EUR',
        status: 'OVERDUE',
        dueDate: new Date('2026-03-30'),
        note: 'Freelancer design support',
        createdById: finance.id
      }
    ]
  });

  await prisma.lead.create({
    data: {
      companyName: 'PulseTech Studio',
      contactName: 'Maria Rusu',
      contactEmail: 'maria@pulsetech.example',
      contactPhone: '+40 745 990 123',
      source: 'Referral',
      stage: 'QUALIFIED',
      nextStep: 'Proposal call next week',
      reminderAt: new Date('2026-04-07'),
      notes: 'Interested in full funnel package.',
      createdById: pm.id
    }
  });

  await prisma.asset.createMany({
    data: [
      {
        name: 'MacBook Pro 14 - Media Team',
        category: 'Laptop',
        serialNumber: 'DD-MBP14-2026-01',
        status: 'IN_USE',
        responsibleUserId: specialist.id,
        projectId: projectFitCoreLaunch.id,
        location: 'Bucharest Office',
        services: ['Creative', 'Paid Ads']
      },
      {
        name: 'Sony A7 IV',
        category: 'Camera',
        serialNumber: 'DD-CAM-A7IV-12',
        status: 'AVAILABLE',
        responsibleUserId: pm.id,
        location: 'Equipment Room',
        services: ['Content Production']
      },
      {
        name: 'iPhone 15 Pro - Test Device',
        category: 'Mobile',
        serialNumber: 'DD-IOS-15P-08',
        status: 'IN_SERVICE',
        responsibleUserId: admin.id,
        location: 'Service',
        services: ['QA', 'Mobile Review']
      }
    ]
  });

  const commissionRule = await prisma.commissionRule.create({
    data: {
      projectId: projectFitCoreLaunch.id,
      name: 'Launch performance bonus',
      type: 'PERCENTAGE',
      percentage: 8,
      proposedById: pm.id,
      approvalStatus: 'PENDING'
    }
  });

  await prisma.commissionAllocation.create({
    data: {
      ruleId: commissionRule.id,
      participantUserId: specialist.id,
      percentage: 5,
      status: 'PENDING'
    }
  });

  const ndaTemplate = await prisma.documentTemplate.create({
    data: {
      name: 'NDA Standard Digital Dot',
      type: 'NDA',
      content:
        'Acest NDA este incheiat intre {{client_name}} si Digital Dot pentru proiectul {{project_name}}. Data: {{generated_at}}.',
      requiresNdaSigned: false,
      includesServiceConfidentialityClause: true,
      includesDisclosurePenaltyClause: false,
      createdById: admin.id,
      versions: {
        create: {
          version: 1,
          content:
            'Acest NDA este incheiat intre {{client_name}} si Digital Dot pentru proiectul {{project_name}}. Data: {{generated_at}}.',
          changeNote: 'Initial version',
          createdById: admin.id
        }
      }
    }
  });

  const offerTemplate = await prisma.documentTemplate.create({
    data: {
      name: 'Oferta Servicii Growth',
      type: 'OFFER',
      content:
        'Oferta pentru {{client_name}} pe proiectul {{project_name}}. Pachet selectat: {{service_annex}}. Contact: {{client_representative}}.',
      requiresNdaSigned: true,
      includesServiceConfidentialityClause: true,
      includesDisclosurePenaltyClause: true,
      createdById: pm.id,
      versions: {
        create: {
          version: 1,
          content:
            'Oferta pentru {{client_name}} pe proiectul {{project_name}}. Pachet selectat: {{service_annex}}. Contact: {{client_representative}}.',
          changeNote: 'Initial version',
          createdById: pm.id
        }
      }
    }
  });

  await prisma.documentInstance.create({
    data: {
      templateId: ndaTemplate.id,
      projectId: projectFitCoreLaunch.id,
      clientCompanyId: fitcore.id,
      title: 'NDA FitCore Q3 Launch',
      content:
        'Acest NDA este incheiat intre FitCore Labs si Digital Dot pentru proiectul FitCore Q3 Launch. Data: 2026-03-05.',
      status: 'SIGNED',
      generatedData: {
        client_name: 'FitCore Labs',
        project_name: 'FitCore Q3 Launch'
      },
      publishedToClient: true,
      createdById: pm.id,
      sentAt: new Date('2026-03-05T09:00:00Z'),
      viewedAt: new Date('2026-03-05T12:00:00Z'),
      signedAt: new Date('2026-03-06T08:30:00Z')
    }
  });

  await prisma.documentInstance.create({
    data: {
      templateId: offerTemplate.id,
      projectId: projectFitCoreLaunch.id,
      clientCompanyId: fitcore.id,
      title: 'Oferta FitCore Growth Bundle',
      content:
        'Oferta pentru FitCore Labs pe proiectul FitCore Q3 Launch. Pachet selectat: Paid Ads + Email + Automation.',
      status: 'SENT',
      generatedData: {
        client_name: 'FitCore Labs',
        project_name: 'FitCore Q3 Launch',
        service_annex: 'Paid Ads + Email + Automation',
        client_representative: 'Andrei Popescu'
      },
      publishedToClient: true,
      requiresNdaSigned: true,
      createdById: pm.id,
      sentAt: new Date('2026-03-10T10:00:00Z')
    }
  });

  const encrypted = encryptSecret('FitCore-Ads-2026-Secure!');
  const secret = await prisma.secret.create({
    data: {
      projectId: projectFitCoreLaunch.id,
      clientCompanyId: fitcore.id,
      name: 'Meta Ads Account',
      username: 'ads@fitcore.example',
      encryptedValue: encrypted.encryptedValue,
      iv: encrypted.iv,
      authTag: encrypted.authTag,
      description: 'Main ads manager credential',
      createdById: pm.id
    }
  });

  await prisma.secretAccessLog.create({
    data: {
      secretId: secret.id,
      userId: pm.id,
      action: 'SEED_VIEW',
      reason: 'Initial setup validation'
    }
  });

  await prisma.onboardingItem.createMany({
    data: [
      {
        clientCompanyId: fitcore.id,
        projectId: projectFitCoreLaunch.id,
        title: 'Upload brand assets kit',
        description: 'Logo pack + typography guidelines',
        status: 'TODO',
        dueDate: new Date('2026-04-04'),
        isClientVisible: true,
        createdById: pm.id
      },
      {
        clientCompanyId: fitcore.id,
        projectId: projectFitCoreLaunch.id,
        title: 'Confirm ad account access levels',
        description: 'Admin + analyst permissions',
        status: 'IN_PROGRESS',
        dueDate: new Date('2026-04-03'),
        isClientVisible: true,
        createdById: pm.id
      }
    ]
  });

  await prisma.clientReportSnapshot.createMany({
    data: [
      {
        clientCompanyId: fitcore.id,
        projectId: projectFitCoreLaunch.id,
        periodStart: new Date('2026-03-01'),
        periodEnd: new Date('2026-03-31'),
        sales: 78000,
        agencyCost: 12500,
        adsCost: 4500,
        socialMetrics: {
          followers_growth: 12.8,
          engagement_rate: 4.2
        },
        notes: 'Strong launch momentum in week 3.',
        publishedToClient: true,
        createdById: pm.id
      }
    ]
  });

  const playbook = await prisma.knowledgeCollection.create({
    data: {
      name: 'Operational Playbooks',
      description: 'SOP-uri interne pentru delivery.',
      visibility: 'TEAM',
      createdById: admin.id
    }
  });

  await prisma.knowledgeDocument.createMany({
    data: [
      {
        collectionId: playbook.id,
        title: 'SOP - Client Onboarding Kickoff',
        content: 'Checklist: meeting agenda, access requests, responsibility matrix.',
        isSensitive: false,
        createdById: admin.id,
        updatedById: admin.id
      },
      {
        collectionId: playbook.id,
        title: 'Policy - Secrets Access',
        content: 'All reveals must be audited. No plaintext sharing in chat channels.',
        isSensitive: true,
        createdById: admin.id,
        updatedById: admin.id
      }
    ]
  });

  await prisma.notification.createMany({
    data: [
      {
        companyId: fitcore.id,
        channel: 'PORTAL',
        type: 'invoice_due',
        subject: 'Factura scadenta in 3 zile',
        body: 'Factura retainer aprilie are scadenta in 3 zile.',
        status: 'SENT',
        sentAt: new Date('2026-04-01T08:00:00Z')
      },
      {
        userId: pm.id,
        channel: 'EMAIL',
        type: 'lead_reminder',
        subject: 'Reminder lead PulseTech',
        body: 'Propunerea trebuie trimisa saptamana aceasta.',
        status: 'PENDING'
      }
    ]
  });

  await prisma.auditLog.createMany({
    data: [
      {
        actorUserId: admin.id,
        action: 'SEED_BOOTSTRAP',
        entityType: 'System',
        severity: 'INFO',
        metadata: { organization: agency.name }
      },
      {
        actorUserId: pm.id,
        action: 'SEED_PROJECT_INIT',
        entityType: 'Project',
        entityId: projectFitCoreLaunch.id,
        severity: 'INFO'
      }
    ]
  });

  console.log('Seed completed successfully.');
  console.log('Demo credentials:');
  console.log('admin@digitaldot.ro / Admin2026!');
  console.log('pm@digitaldot.ro / Manager2026!');
  console.log('specialist@digitaldot.ro / Specialist2026!');
  console.log('finance@digitaldot.ro / Finance2026!');
  console.log('client@fitcore.ro / Client2026!');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
