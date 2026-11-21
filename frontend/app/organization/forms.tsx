'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import { SubmitButton, TextField } from '../../components/fields';
import { Alert, describedBy, Field } from '../../components/ui';
import { ORGANIZATION_ROLES, SECTORS, type InviteRole } from '../../lib/rules';
import type { FormState } from '../auth/actions';
import { acceptInvitation, createOrganization, inviteMember, removeMember, updateOrganization } from './actions';

const empty: FormState = {};

function SectorField({ defaultValue, error }: { defaultValue?: string; error?: string }) {
  const id = 'org-sector';
  const hint = 'Optional. Helps us match you with relevant talent.';
  return (
    <Field id={id} label="Sector" error={error} hint={hint}>
      <select id={id} name="sector" className="ui-input ui-select" defaultValue={defaultValue ?? ''}
        aria-invalid={error ? true : undefined} aria-describedby={describedBy(id, error, hint)}>
        <option value="">Choose a sector</option>
        {SECTORS.map((sector) => <option key={sector} value={sector}>{sector}</option>)}
      </select>
    </Field>
  );
}

type Profile = { name: string; cac: string; sector: string };

function ProfileFields({ state, initial }: { state: FormState; initial?: Profile }) {
  const f = state.fields ?? {};
  const v = state.values ?? initial ?? { name: '', cac: '', sector: '' };
  return (
    <>
      <TextField name="name" label="Organization name" autoComplete="organization" required maxLength={160}
        defaultValue={v.name} error={f.name} />
      <TextField name="cac" label="CAC registration number" maxLength={32} defaultValue={v.cac} error={f.cac}
        hint="Optional for now. DBI needs it to verify your organization." placeholder="RC123456" autoCapitalize="characters" />
      <SectorField defaultValue={v.sector} error={f.sector} />
    </>
  );
}

export function CreateOrganizationForm() {
  const [state, action] = useActionState(createOrganization, empty);
  return (
    <form action={action} className="ui-form" noValidate>
      {state.error ? <Alert>{state.error}</Alert> : null}
      <ProfileFields state={state} />
      <SubmitButton pendingLabel="Creating workspace…">Create workspace</SubmitButton>
    </form>
  );
}

export function EditOrganizationForm({ organizationId, initial }: { organizationId: string; initial: Profile }) {
  const [state, action] = useActionState(updateOrganization, empty);
  return (
    <form action={action} className="ui-form" noValidate>
      {state.error ? <Alert>{state.error}</Alert> : null}
      {state.done ? <Alert tone="success">Changes saved.</Alert> : null}
      <input type="hidden" name="organizationId" value={organizationId} />
      <ProfileFields state={state} initial={initial} />
      <div className="ui-actions"><SubmitButton pendingLabel="Saving…">Save changes</SubmitButton></div>
    </form>
  );
}

export function InviteForm({ organizationId, roles }: { organizationId: string; roles: InviteRole[] }) {
  const [state, action] = useActionState(inviteMember, empty);
  const form = useRef<HTMLFormElement>(null);
  const [role, setRole] = useState<string>(state.values?.role ?? roles[roles.length - 1]);
  useEffect(() => { if (state.done) form.current?.querySelector<HTMLInputElement>('input[name=email]')?.focus(); }, [state]);
  const f = state.fields ?? {};

  return (
    <form ref={form} action={action} className="ui-form" noValidate key={state.done ? state.email : 'invite'}>
      {state.error ? <Alert>{state.error}</Alert> : null}
      {state.done ? <Alert tone="success">Invitation sent to <strong>{state.email}</strong>. It expires in 7 days.</Alert> : null}
      <input type="hidden" name="organizationId" value={organizationId} />
      <TextField name="email" label="Email address" type="email" autoComplete="off" required maxLength={254}
        defaultValue={state.done ? '' : state.values?.email} error={f.email} placeholder="colleague@company.com" />
      <fieldset className={`ui-roles${f.role ? ' has-error' : ''}`}>
        <legend>Role</legend>
        {ORGANIZATION_ROLES.filter((option) => roles.includes(option.value)).map((option) => (
          <label key={option.value} className="ui-role">
            <input type="radio" name="role" value={option.value} checked={role === option.value} onChange={() => setRole(option.value)} />
            <span><strong>{option.label}</strong><span>{option.hint}</span></span>
          </label>
        ))}
        {f.role ? <p className="ui-error">{f.role}</p> : null}
      </fieldset>
      <SubmitButton pendingLabel="Sending…">Send invitation</SubmitButton>
    </form>
  );
}

/** Two-step remove: the first click asks, the second removes. */
export function RemoveMemberButton({ organizationId, userId, email }: { organizationId: string; userId: string; email: string }) {
  const [state, action] = useActionState(removeMember, empty);
  const [asking, setAsking] = useState(false);
  if (!asking) {
    return <button type="button" className="ui-link-button ui-danger" onClick={() => setAsking(true)} aria-label={`Remove ${email}`}>Remove</button>;
  }
  return (
    <form action={action} className="ui-confirm">
      <input type="hidden" name="organizationId" value={organizationId} />
      <input type="hidden" name="userId" value={userId} />
      <span>Remove {email}?</span>
      <SubmitButton variant="ghost" pendingLabel="Removing…">Yes, remove</SubmitButton>
      <button type="button" className="ui-link-button" onClick={() => setAsking(false)}>Cancel</button>
      {state.error ? <p className="ui-error" role="alert">{state.error}</p> : null}
    </form>
  );
}

export function AcceptInvitationForm({ token }: { token: string }) {
  const [state, action] = useActionState(acceptInvitation, empty);
  return (
    <form action={action} className="ui-form">
      {state.error ? <Alert>{state.error}</Alert> : null}
      <input type="hidden" name="token" value={token} />
      <SubmitButton pendingLabel="Joining…">Join workspace</SubmitButton>
    </form>
  );
}
