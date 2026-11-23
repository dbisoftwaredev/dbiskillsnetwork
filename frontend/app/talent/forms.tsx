'use client';

import { useActionState, useEffect, useId, useRef, useState } from 'react';
import { SubmitButton, TextField } from '../../components/fields';
import { Alert, describedBy, Field, Icon } from '../../components/ui';
import { GOALS, PERSONAS, ROLE_SUGGESTIONS, goalLabel, personaLabel, type Me } from '../../lib/talent';
import type { FormState } from '../auth/actions';
import { saveCareer } from './actions';

const empty: FormState = {};

/** Career basics: shows what we know, edits in place. Opens straight into editing until a goal exists. */
export function CareerCard({ me }: { me: Me }) {
  const [state, action] = useActionState(saveCareer, empty);
  const [editing, setEditing] = useState(!me.onboarding.primaryGoal);
  const [saved, setSaved] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const roleList = useId();

  useEffect(() => {
    if (state.done) { setEditing(false); setSaved(true); heading.current?.focus(); }
  }, [state]);

  const saved_ = state.done ? state.values : undefined;
  const o = saved_ ? {
    ...me.onboarding,
    primaryGoal: (saved_.primaryGoal || null) as Me['onboarding']['primaryGoal'],
    persona: (saved_.persona || me.onboarding.persona) as Me['onboarding']['persona'],
    targetOccupation: saved_.targetOccupation || me.onboarding.targetOccupation,
  } : me.onboarding;
  const location = saved_?.location || me.profile.location;
  const v = state.values ?? {
    displayName: me.profile.displayName ?? '', location: me.profile.location ?? '',
    primaryGoal: me.onboarding.primaryGoal ?? '', persona: me.onboarding.persona ?? '', targetOccupation: me.onboarding.targetOccupation ?? '',
  };
  const f = state.fields ?? {};

  return (
    <section id="career" className="tw-card tw-career" aria-labelledby="career-heading">
      <div className="tw-card-head">
        <h2 id="career-heading" ref={heading} tabIndex={-1}>Your career goal</h2>
        {!editing ? <button type="button" className="ui-link-button" onClick={() => { setEditing(true); setSaved(false); }}>Edit</button> : null}
      </div>

      {saved && !editing ? <Alert tone="success">Saved. Your dashboard is updated.</Alert> : null}

      {!editing ? (
        <dl className="tw-facts">
          <div><dt>Goal</dt><dd>{goalLabel(o.primaryGoal) ?? <span className="tw-missing">Not set</span>}</dd></div>
          <div><dt>Target role</dt><dd>{o.targetOccupation ?? <span className="tw-missing">Not set</span>}</dd></div>
          <div><dt>Career stage</dt><dd>{personaLabel(o.persona) ?? <span className="tw-missing">Not set</span>}</dd></div>
          <div><dt>Location</dt><dd>{location ?? <span className="tw-missing">Not set</span>}</dd></div>
        </dl>
      ) : (
        <form action={action} className="ui-form tw-form" noValidate>
          {state.error ? <Alert>{state.error}</Alert> : null}
          <fieldset className={`tw-goals${f.primaryGoal ? ' has-error' : ''}`} aria-describedby={f.primaryGoal ? 'goal-error' : undefined}>
            <legend>What would you like to achieve?</legend>
            {GOALS.map((g) => (
              <label key={g.value} className="ui-choice tw-goal">
                <input type="radio" name="primaryGoal" value={g.value} defaultChecked={v.primaryGoal === g.value} required />
                <span className="ui-choice-text"><strong>{g.label}</strong><span>{g.hint}</span></span>
              </label>
            ))}
            {f.primaryGoal ? <p className="ui-error" id="goal-error">{f.primaryGoal}</p> : null}
          </fieldset>

          <TextField name="targetOccupation" label="Target role" list={roleList} maxLength={120} defaultValue={v.targetOccupation}
            error={f.targetOccupation} placeholder="For example, Network Engineer" hint="Type any role, or pick a suggestion." />
          <datalist id={roleList}>{ROLE_SUGGESTIONS.map((r) => <option key={r} value={r} />)}</datalist>

          <PersonaField defaultValue={v.persona} error={f.persona} />

          <div className="tw-two">
            <TextField name="displayName" label="Your name" autoComplete="name" maxLength={120} defaultValue={v.displayName} error={f.displayName}
              hint="Shown on your passport." />
            <TextField name="location" label="City or state" autoComplete="address-level2" maxLength={120} defaultValue={v.location}
              error={f.location} placeholder="Lagos" />
          </div>

          <div className="tw-form-actions">
            <SubmitButton pendingLabel="Saving…">Save</SubmitButton>
            {o.primaryGoal ? <button type="button" className="ui-button ui-button-ghost" onClick={() => setEditing(false)}>Cancel</button> : null}
          </div>
          <p className="ui-hint"><Icon name="lock" size={14} /> Only you can see this until you choose to share your passport.</p>
        </form>
      )}
    </section>
  );
}

function PersonaField({ defaultValue, error }: { defaultValue?: string; error?: string }) {
  const id = 'talent-persona';
  return (
    <Field id={id} label="Career stage" error={error}>
      <select id={id} name="persona" className="ui-input ui-select" defaultValue={defaultValue ?? ''}
        aria-invalid={error ? true : undefined} aria-describedby={describedBy(id, error)}>
        <option value="">Choose your stage (optional)</option>
        {PERSONAS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
      </select>
    </Field>
  );
}
