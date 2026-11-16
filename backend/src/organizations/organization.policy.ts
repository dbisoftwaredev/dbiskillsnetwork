export type OrganizationRole = 'OWNER' | 'ADMIN' | 'RECRUITER' | 'REVIEWER';

export function canManageRole(actor: OrganizationRole, target: OrganizationRole, action: 'invite' | 'remove'): boolean {
  if (target === 'OWNER') return false;
  if (actor === 'OWNER') return true;
  if (actor === 'ADMIN') return target === 'RECRUITER' || target === 'REVIEWER';
  return false;
}
