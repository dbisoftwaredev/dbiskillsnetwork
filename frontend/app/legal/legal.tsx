import { Brand } from '../../components/ui';

// Placeholder until DBI's approved legal text is supplied. The version accepted at sign-up is
// recorded in the consent ledger (TERMS_VERSION / PRIVACY_VERSION on the API).
export function LegalPage({ title }: { title: string }) {
  return (
    <div className="ui ui-legal">
      <div className="ui-topbar"><Brand /></div>
      <main id="content" className="ui-legal-body">
        <p className="ui-eyebrow">Legal</p>
        <h1>{title}</h1>
        <div className="ui-alert ui-alert-info" role="status">
          <div>The final {title} is being prepared by Digital Bridge Institute and will be published here before public launch.</div>
        </div>
        <p className="ui-lede">Questions in the meantime can be sent to Digital Bridge Institute through its official channels.</p>
        <p><a href="/">← Back to DBI Skills Network</a></p>
      </main>
    </div>
  );
}
