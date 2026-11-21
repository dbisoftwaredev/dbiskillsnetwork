'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { api, type Organization } from '../../lib/api';
import { cacProblem, emailProblem, normalizeCac, ORGANIZATION_ROLES, SECTORS } from '../../lib/rules';
import { requireSession } from '../../lib/session';
import type { FormState } from '../auth/actions';

const text = (form: FormData, key: string) => String(form.get(key) ?? '').trim();

function readProfile(form: FormData) {
  const name = text(form, 'name');
  const cacRegistrationNumber = normalizeCac(text(form, 'cac'));
  const sector = text(form, 'sector');
  const values = { name, cac: cacRegistrationNumber, sector };
  const fields: Record<string, string> = {};
  if (!name) fields.name = 'Enter your organization’s name.';
  else if (name.length > 160) fields.name = 'Use no more than 160 characters.';
  const cacIssue = cacProblem(cacRegistrationNumber);
  if (cacIssue) fields.cac = cacIssue;
  if (sector && !(SECTORS as readonly string[]).includes(sector)) fields.sector = 'Choose a sector from the list.';
  return { body: { name, cacRegistrationNumber, sector }, values, fields };
}

export async function createOrganization(_: FormState, form: FormData): Promise<FormState> {
  const session = await requireSession('/onboarding/organization');
  const { body, values, fields } = readProfile(form);
  if (Object.keys(fields).length) return { fields, values };

  const result = await api<Organization>('/organizations', {
    token: session.accessToken,
    body: { name: body.name, ...(body.cacRegistrationNumber ? { cacRegistrationNumber: body.cacRegistrationNumber } : {}), ...(body.sector ? { sector: body.sector } : {}) },
  });
  if (!result.ok) return { error: result.message, values };
  redirect(`/organization?org=${result.data.id}&created=1`);
}

export async function updateOrganization(_: FormState, form: FormData): Promise<FormState> {
  const organizationId = text(form, 'organizationId');
  const session = await requireSession(`/organization?org=${organizationId}`);
  const { body, values, fields } = readProfile(form);
  if (Object.keys(fields).length) return { fields, values };

  const result = await api<Organization>(`/organizations/${encodeURIComponent(organizationId)}`, {
    method: 'PATCH',
    token: session.accessToken,
    body: { name: body.name, cacRegistrationNumber: body.cacRegistrationNumber || null, sector: body.sector || null },
  });
  if (!result.ok) return { error: result.message, values };
  revalidatePath('/organization');
  return { done: true, values };
}

export async function inviteMember(_: FormState, form: FormData): Promise<FormState> {
  const organizationId = text(form, 'organizationId');
  const session = await requireSession(`/organization?org=${organizationId}`);
  const email = text(form, 'email').toLowerCase();
  const role = text(form, 'role');
  const values = { email, role };
  const fields: Record<string, string> = {};
  const emailIssue = emailProblem(email);
  if (emailIssue) fields.email = emailIssue;
  if (!ORGANIZATION_ROLES.some((option) => option.value === role)) fields.role = 'Choose a role.';
  if (Object.keys(fields).length) return { fields, values };

  const result = await api(`/organizations/${encodeURIComponent(organizationId)}/members/invite`, {
    token: session.accessToken,
    body: { email, role },
  });
  if (!result.ok) {
    if (result.status === 409) return { fields: { email: 'This person is already in your workspace.' }, values };
    return { error: result.message, values };
  }
  return { done: true, email, values: { role } };
}

export async function removeMember(_: FormState, form: FormData): Promise<FormState> {
  const organizationId = text(form, 'organizationId');
  const session = await requireSession(`/organization?org=${organizationId}`);
  const result = await api(`/organizations/${encodeURIComponent(organizationId)}/members/${encodeURIComponent(text(form, 'userId'))}`, {
    method: 'DELETE',
    token: session.accessToken,
  });
  if (!result.ok) return { error: result.message };
  revalidatePath('/organization');
  return { done: true };
}

export async function acceptInvitation(_: FormState, form: FormData): Promise<FormState> {
  const token = text(form, 'token');
  const session = await requireSession(`/organization/invitations/accept?token=${encodeURIComponent(token)}`);
  const result = await api<{ organizationId: string }>('/organizations/invitations/accept', {
    token: session.accessToken,
    body: { token },
  });
  if (!result.ok) return { error: result.message };
  redirect(`/organization?org=${result.data.organizationId}&joined=1`);
}
