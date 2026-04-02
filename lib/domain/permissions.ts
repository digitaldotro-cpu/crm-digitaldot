import type { SystemRole } from '@prisma/client';

export const INTERNAL_ROLES: SystemRole[] = ['ADMIN', 'PROJECT_MANAGER', 'SPECIALIST', 'FINANCE'];

export function isAdmin(role: SystemRole) {
  return role === 'ADMIN';
}

export function canAccessFinance(role: SystemRole) {
  return role === 'ADMIN' || role === 'FINANCE';
}

export function canManageLeads(role: SystemRole) {
  return role !== 'CLIENT';
}

export function canManageAssets(role: SystemRole) {
  return role === 'ADMIN' || role === 'PROJECT_MANAGER' || role === 'SPECIALIST';
}

export function canManageCommission(role: SystemRole) {
  return role === 'ADMIN' || role === 'FINANCE' || role === 'PROJECT_MANAGER';
}

export function canApproveCommission(role: SystemRole) {
  return role === 'ADMIN' || role === 'FINANCE';
}

export function canManageTemplates(role: SystemRole) {
  return role === 'ADMIN' || role === 'PROJECT_MANAGER';
}

export function canAccessAudit(role: SystemRole) {
  return role === 'ADMIN';
}

export function canManageSecrets(role: SystemRole) {
  return role === 'ADMIN' || role === 'PROJECT_MANAGER';
}

export function canViewInternalNotes(role: SystemRole) {
  return role !== 'CLIENT';
}
