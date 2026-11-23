'use server';

import { revalidatePath } from 'next/cache';
import { api } from '../../lib/api';
import { requireSession } from '../../lib/session';
import { GOALS, PERSONAS, type Me } from '../../lib/talent';
import type { FormState } from '../auth/actions';

const text = (form: FormData, key: string) => String(form.get(key) ?? '').trim();

function readCareer(form: FormData) {
  const values = {
    displayName: text(form, 'displayName'),
    location: text(form, 'location'),
    primaryGoal: text(form, 'primaryGoal'),
    persona: text(form, 'persona'),
    targetOccupation: text(form, 'targetOccupation'),
  };
  const fields: Record<string, string> = {};
  if (!values.primaryGoal) fields.primaryGoal = 'Choose the goal that fits you best.';
  else if (!GOALS.some((g) => g.value === values.primaryGoal)) fields.primaryGoal = 'Choose a goal from the list.';
  if (values.persona && !PERSONAS.some((p) => p.value === values.persona)) fields.persona = 'Choose a stage from the list.';
  for (const key of ['displayName', 'location', 'targetOccupation'] as const) {
    if (values[key].length > 120) fields[key] = 'Use no more than 120 characters.';
  }
  return { values, fields };
}

/** Saves the career basics through PATCH /users/me (goal-first onboarding, save-and-resume). */
export async function saveCareer(_: FormState, form: FormData): Promise<FormState> {
  const session = await requireSession('/talent');
  const { values, fields } = readCareer(form);
  if (Object.keys(fields).length) return { fields, values };

  // Only send what was filled in: the API rejects empty names, and blank means "not yet".
  const body: Record<string, string> = { primaryGoal: values.primaryGoal };
  for (const key of ['displayName', 'location', 'persona', 'targetOccupation'] as const) if (values[key]) body[key] = values[key];
  body.onboardingStep = values.targetOccupation ? 'SKILLS' : 'ASPIRATION';

  const result = await api<Me>('/users/me', { method: 'PATCH', token: session.accessToken, body });
  if (!result.ok) return { error: result.message, values };
  revalidatePath('/talent');
  return { done: true, values };
}

