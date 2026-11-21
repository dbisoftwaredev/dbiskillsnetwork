import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { AppShell } from '../../components/shells';
import { Alert, Heading, Icon } from '../../components/ui';
import { api, type Member, type Organization } from '../../lib/api';
import { canManageRole, ROLE_LABELS, VERIFICATION_LABELS, type InviteRole } from '../../lib/rules';
import { requireSession } from '../../lib/session';
import { EditOrganizationForm, InviteForm, RemoveMemberButton } from './forms';

export const metadata: Metadata = { title: 'Workspace · DBI Skills Network' };

const dateFormat = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

export default async function OrganizationHome({ searchParams }: { searchParams: Promise<{ org?: string; created?: string; joined?: string }> }) {
  const params = await searchParams;
  const here = `/organization${params.org ? `?org=${encodeURIComponent(params.org)}` : ''}`;
  const session = await requireSession(here);
  if (session.accountType !== 'ORGANIZATION_REPRESENTATIVE') redirect('/talent');

  const list = await api<Organization[]>('/organizations', { method: 'GET', token: session.accessToken });
  if (!list.ok) {
    return <AppShell email={session.email}><Heading title="Workspace" /><Alert>{list.message}</Alert></AppShell>;
  }
  if (list.data.length === 0) redirect('/onboarding/organization');
  const organization = list.data.find((org) => org.id === params.org) ?? list.data[0];

  const members = await api<Member[]>(`/organizations/${organization.id}/members`, { method: 'GET', token: session.accessToken });
  const role = organization.role ?? (members.ok ? members.data.find((m) => m.userId === session.sub)?.role : undefined);
  const canEdit = role === 'OWNER' || role === 'ADMIN';
  const invitable = (['ADMIN', 'RECRUITER', 'REVIEWER'] as InviteRole[]).filter((target) => canManageRole(role, target));
  const status = VERIFICATION_LABELS[organization.verificationStatus];

  return (
    <AppShell email={session.email} wide>
      {params.created ? <Alert tone="success">Your workspace is ready. Next, invite your team.</Alert> : null}
      {params.joined ? <Alert tone="success">You’ve joined {organization.name}.</Alert> : null}

      <div className="ui-org-head">
        <span className="ui-org-mark" aria-hidden="true">{organization.name.charAt(0).toUpperCase()}</span>
        <div>
          <Heading eyebrow={role ? `Workspace · ${ROLE_LABELS[role]}` : 'Workspace'} title={organization.name} />
          <p className="ui-org-meta">
            <span className={`ui-badge ui-badge-${status.tone}`}>{status.label}</span>
            {organization.sector ? <span>{organization.sector}</span> : null}
            {organization.cacRegistrationNumber ? <span>CAC {organization.cacRegistrationNumber}</span> : null}
          </p>
        </div>
        <a className="ui-link-button ui-org-security" href="/account/security"><Icon name="shield" size={16} /> Security</a>
      </div>

      {list.data.length > 1 ? (
        <nav className="ui-switcher" aria-label="Your workspaces">
          {list.data.map((org) => (
            <a key={org.id} href={`/organization?org=${org.id}`} aria-current={org.id === organization.id ? 'page' : undefined}>{org.name}</a>
          ))}
        </nav>
      ) : null}

      {organization.verificationStatus !== 'VERIFIED' ? (
        <Alert tone="info">
          {organization.verificationStatus === 'PENDING_REVIEW'
            ? 'DBI is reviewing your organization. Talent search opens once verification is complete.'
            : organization.cacRegistrationNumber
              ? 'DBI verification isn’t open yet. Talent search will open once your organization is verified.'
              : 'Add your CAC registration number so DBI can verify your organization when verification opens.'}
        </Alert>
      ) : null}

      <div className="ui-columns">
        <section className="ui-card" aria-labelledby="team-heading">
          <div className="ui-card-head">
            <h2 id="team-heading">Team</h2>
            {members.ok ? <span className="ui-muted">{members.data.length} {members.data.length === 1 ? 'member' : 'members'}</span> : null}
          </div>
          {members.ok ? (
            <ul className="ui-members">
              {members.data.map((member) => (
                <li key={member.userId}>
                  <span className="ui-avatar" aria-hidden="true">{member.email.charAt(0).toUpperCase()}</span>
                  <span className="ui-member-main">
                    <span className="ui-member-email">{member.email}{member.userId === session.sub ? <span className="ui-muted"> (you)</span> : null}</span>
                    <span className="ui-muted">Joined {dateFormat.format(new Date(member.joinedAt))}</span>
                  </span>
                  <span className="ui-role-tag">{ROLE_LABELS[member.role]}</span>
                  <span className="ui-member-action">
                    {member.userId !== session.sub && canManageRole(role, member.role)
                      ? <RemoveMemberButton organizationId={organization.id} userId={member.userId} email={member.email} />
                      : null}
                  </span>
                </li>
              ))}
            </ul>
          ) : <Alert>{members.message}</Alert>}

          {invitable.length ? (
            <div className="ui-subsection">
              <h3>Invite a teammate</h3>
              <InviteForm organizationId={organization.id} roles={invitable} />
            </div>
          ) : <p className="ui-muted">Only owners and admins can invite teammates.</p>}
        </section>

        <section className="ui-card" aria-labelledby="profile-heading">
          <div className="ui-card-head"><h2 id="profile-heading">Organization profile</h2></div>
          {canEdit ? (
            <EditOrganizationForm organizationId={organization.id}
              initial={{ name: organization.name, cac: organization.cacRegistrationNumber ?? '', sector: organization.sector ?? '' }} />
          ) : (
            <dl className="ui-details">
              <div><dt>Name</dt><dd>{organization.name}</dd></div>
              <div><dt>CAC number</dt><dd>{organization.cacRegistrationNumber ?? 'Not added'}</dd></div>
              <div><dt>Sector</dt><dd>{organization.sector ?? 'Not added'}</dd></div>
            </dl>
          )}
        </section>
      </div>
    </AppShell>
  );
}
