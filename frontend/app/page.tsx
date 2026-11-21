import { ArtSprite, Crest, EngineArt } from '../components/home/art';
import { RotatingWord } from '../components/home/hero-live';
import { KenteBand, KenteField, KenteSwatch } from '../components/home/kente';
import { DepartureBoard } from '../components/home/board';
import { HeroWall } from '../components/home/hero-wall';
import { Motion } from '../components/home/motion';
import { PassportBook } from '../components/home/passport';
import { CommunityPhoto, FaceOrbit, TrackCards } from '../components/home/people';
import { UvInspect } from '../components/home/uv';

const ROUTE = [
  ['Discover', 'Pick a dream role and see where you stand today, before you even sign up.'],
  ['Verify', 'Prove what you can do through practical, calibrated assessments.'],
  ['Diagnose', 'Get an honest, explainable view of the gaps between you and the role.'],
  ['Develop', 'Follow courses, labs, mentors and sponsored pathways matched to those gaps.'],
  ['Connect', 'Reach real jobs, contracts, deployments and projects that fit your evidence.'],
  ['Measure', 'Track your growth, and help employers and funders see what works.'],
];

const ENGINES = [
  { kind: 'registry', name: 'Talent Registry', body: 'A profile that grows with you: projects, experience, preferences and availability.' },
  { kind: 'verify', name: 'SkillVerify', body: 'Work samples, coding labs, telecom simulations and supervised practicals.' },
  { kind: 'gps', name: 'CareerGPS', body: 'Dream roles, transparent readiness and the next best step.' },
  { kind: 'bridge', name: 'SkillBridge', body: 'DBI and partner courses, labs, certifications and sponsored pathways.' },
  { kind: 'hub', name: 'OpportunityHub', body: 'Full-time roles, internships, field deployments, contracts and projects.' },
  { kind: 'iq', name: 'WorkforceIQ', body: 'Privacy-preserving insight into skills supply, demand and outcomes.' },
] as const;

const AUDIENCES = [
  { photo: 'a-students', label: 'Students', title: 'Still in school?', body: 'A free readiness report, a skills-gap roadmap, internships and your first verified skills.' },
  { photo: 'a-graduates', label: 'Graduates & career changers', title: 'Ready for a first role?', body: 'Prove what you can do and get matched to entry-level jobs on evidence, not connections.' },
  { photo: 'a-makers', label: 'Hands-on technicians', title: 'Skilled, but unseen?', body: 'Recognition for practical skills without degree barriers, and visibility for field and project work.' },
  { photo: 'a-creators', label: 'Freelancers & creators', title: 'Working for yourself?', body: 'A trusted portfolio, project discovery and paid work from the clients who need you.' },
] as const;

const LEVELS = [
  ['Declared', 'You add it. Quick, honest and always yours to edit.'],
  ['Demonstrated', 'You show it with work samples, labs and project evidence.'],
  ['DBI verified', 'Experts confirm it through calibrated assessments.'],
];

const NOTES = [
  ['Free for talent. Always.', 'Joining, your profile, your passport and applying for jobs cost nothing. No one pays to be considered.'],
  ['Your data stays yours.', 'Employers only see what you choose to share, and you can change your mind at any time.'],
  ['Every score is specific and can be questioned.', 'Ratings describe one skill or role at one moment, with clear reasons, corrections and appeals.'],
  ['People make hiring decisions.', 'Employers stay accountable for who they hire. The platform informs; it doesn’t decide.'],
];

const Arrow = ({ down = false }: { down?: boolean }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
    style={down ? { transform: 'rotate(90deg)' } : undefined}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

function SectionHead({ id, num, label, title, accent, sub, light = false }: { id: string; num: string; label: string; title: string; accent: string; sub?: string; light?: boolean }) {
  return (
    <div className={`sh${light ? ' sh-light' : ''}`}>
      <p className="sh-label" data-reveal><KenteSwatch seed={Number(num)} /><span>{num}</span>{label}</p>
      <h2 id={id} className="h2" data-reveal>{title} <em>{accent}</em></h2>
      {sub ? <p className="sub" data-reveal>{sub}</p> : null}
    </div>
  );
}

export default function Home() {
  return (
    <div className="pg">
      <a className="skip" href="#main">Skip to content</a>
      <ArtSprite />
      <Motion />

      <header className="nv">
        <div className="nv-in">
          <a className="nv-brand" href="/" aria-label="DBI Skills Network home">
            <span className="nv-seal"><Crest id="nv-crest" /></span>
            <span className="nv-word">DBI <em>Skills Network</em></span>
          </a>
          <nav className="nv-links" aria-label="Sections">
            <a href="#journey">How it works</a>
            <a href="#engines">Platform</a>
            <a href="#careergps">Career readiness</a>
            <a href="#organizations">For organizations</a>
          </nav>
          <div className="nv-cta">
            <a className="nv-signin" href="/auth/login">Sign in</a>
            <a className="btn btn-ink btn-sm" href="/auth/signup">Join free</a>
          </div>
        </div>
      </header>

      <main id="main">
        {/* Hero */}
        <section className="hero" aria-labelledby="headline">
          <div className="hero-in">
            <div className="hero-copy">
              <h1 id="headline" className="display hero-title">
                <span className="ln"><span>Where Africa’s</span></span>
                <span className="ln"><span>young talent gets</span></span>
                <span className="ln"><span><em className="accent"><RotatingWord /></em></span></span>
              </h1>
              <p className="lead">
                The talent hub built in Africa, for Africa’s digital generation. Prove what you can do, learn exactly what
                comes next, and connect with the employers building the continent’s networks.
              </p>
              <div className="actions">
                <a className="btn btn-ink" href="#journey">Explore the network <Arrow down /></a>
                <a className="btn btn-line" href="#careergps">Check your career readiness</a>
              </div>
              <p className="hero-note">Free to join · All digital skills · Starting in Nigeria</p>
            </div>
            <div className="hero-art"><HeroWall /></div>
          </div>
        </section>

        <KenteBand seed={11} />
        {/* How it works */}
        <section id="journey" className="sec sec-white" aria-labelledby="journey-heading">
          <div className="wrap">
            <SectionHead id="journey-heading" num="01" label="How it works" title="Turn capability into" accent="possibility."
              sub="Not a job board. Not another course catalogue. One connected cycle that identifies, verifies, develops and connects African talent to real opportunity." />
            <div className="route" data-progress>
              <svg className="route-line" viewBox="0 0 1200 360" preserveAspectRatio="none" aria-hidden="true">
                <path className="route-ghost" d="M100 260C180 260 160 100 300 100S420 260 500 260 620 100 700 100 820 260 900 260 1020 100 1100 100" vectorEffect="non-scaling-stroke" />
                <path className="route-ink" pathLength={1} d="M100 260C180 260 160 100 300 100S420 260 500 260 620 100 700 100 820 260 900 260 1020 100 1100 100" vectorEffect="non-scaling-stroke" />
              </svg>
              <ol className="route-stops">
                {ROUTE.map(([name, body], i) => (
                  <li key={name} className={i % 2 ? 'up' : 'down'} style={{ ['--i' as string]: i, ['--t' as string]: (i + 0.6) / ROUTE.length }}>
                    <span className="route-pin" aria-hidden="true"><span>{String(i + 1).padStart(2, '0')}</span></span>
                    <div className="route-card"><h3>{name}</h3><p>{body}</p></div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        <section className="cm-sec" aria-label="The community"><CommunityPhoto /></section>

        {/* Platform */}
        <section id="engines" className="sec" aria-labelledby="engines-heading">
          <div className="wrap">
            <SectionHead id="engines-heading" num="02" label="The platform" title="Six connected engines." accent="One talent ecosystem."
              sub="They share one skills taxonomy and one evidence record, so what you prove in one place counts everywhere." />
            <div className="eng-grid">
              {ENGINES.map((e, i) => (
                <article key={e.name} className="eng" data-reveal style={{ ['--d' as string]: `${(i % 3) * 70}ms` }}>
                  <div className="eng-art-wrap"><EngineArt kind={e.kind} /></div>
                  <h3>{e.name}</h3>
                  <p>{e.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>


        {/* Career readiness */}
        <section id="careergps" className="sec sec-white" aria-labelledby="gps-heading">
          <div className="wrap">
            <SectionHead id="gps-heading" num="03" label="Career Readiness Explorer" title="Pick a dream role." accent="See how ready you are."
              sub="No account needed. Choose a destination and see your readiness, the gaps left to close and the next step to take." />
            <DepartureBoard />
          </div>
        </section>

        {/* Tracks */}
        <section id="tracks" className="sec tracks-sec" aria-labelledby="tracks-heading">
          <div className="wrap">
            <SectionHead id="tracks-heading" num="04" label="Digital skills" title="The skills powering" accent="Africa’s digital future."
              sub="Each pathway brings its own competency levels, practical assessments, learning and opportunities, validated with the employers who hire for it." />
          </div>
          <TrackCards />
        </section>

        {/* Passport (one feature) */}
        <section id="passport" className="sec sec-white" aria-labelledby="passport-heading">
          <div className="wrap pass-grid">
            <div>
              <SectionHead id="passport-heading" num="05" label="Feature · Digital Skills Passport" title="Proof that travels" accent="with you."
                sub="Every member gets a free, portable passport: one record of their skills, credentials, projects and history. Share it by link or QR code, on your terms." />
              <ol className="levels">
                {LEVELS.map(([name, body], i) => (
                  <li key={name} data-reveal style={{ ['--d' as string]: `${i * 80}ms` }}>
                    <span className={`lv lv-${i + 1}`} aria-hidden="true" />
                    <div><strong>{name}</strong><span>{body}</span></div>
                  </li>
                ))}
              </ol>
              <p className="fineprint">Illustrative passport. Photos are Unsplash stand-ins, not real members.</p>
            </div>
            <div className="book-wrap" data-reveal><PassportBook /></div>
          </div>
        </section>

        {/* Who it's for */}
        <section className="sec" aria-labelledby="who-heading">
          <div className="wrap">
            <SectionHead id="who-heading" num="06" label="Who it’s for" title="Every young African," accent="every starting point."
              sub="Start with what you want to achieve, not a long CV form. Setup takes minutes and works on low-data mobile." />
            <div className="aud-grid">
              {AUDIENCES.map((a, i) => (
                <article key={a.title} className="aud" data-reveal style={{ ['--d' as string]: `${i * 80}ms` }}>
                  <div className="aud-photo"><img src={`/images/people/${a.photo}.webp`} alt="" width={1200} height={1400} loading="lazy" decoding="async" /></div>
                  <p className="aud-label">{a.label}</p>
                  <h3>{a.title}</h3>
                  <p>{a.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <KenteBand seed={23} />
        {/* Organizations */}
        <section id="organizations" className="sec uv-sec" aria-labelledby="org-heading">
          <div className="wrap uv-grid">
            <div>
              <SectionHead id="org-heading" num="07" label="For organizations" title="Hire on evidence," accent="not the CV." light
                sub="Employers and operators search verified capability, build shortlists and run assessments. Governments, donors and training partners get privacy-safe workforce insight and sponsored cohorts." />
              <div className="actions" data-reveal>
                <a className="btn btn-gold" href="/auth/signup?type=organization">Set up your workspace <Arrow /></a>
              </div>
            </div>
            <UvInspect />
          </div>
        </section>

        {/* Trust */}
        <section className="sec sec-white" aria-labelledby="trust-heading">
          <div className="wrap notes-grid">
            <SectionHead id="trust-heading" num="08" label="Trust by design" title="Built on consent," accent="not surveillance." />
            <ol className="notes">
              {NOTES.map(([t, b], i) => (
                <li key={t} data-reveal style={{ ['--d' as string]: `${i * 80}ms` }}>
                  <span className="notes-n">{i + 1}</span>
                  <div><h3>{t}</h3><p>{b}</p></div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Join */}
        <KenteBand seed={37} />
        <section className="close" aria-labelledby="cta-heading">
          <KenteField className="close-weave" seed={9} rows={36} />
          <div className="wrap close-in">
            <FaceOrbit />
            <h2 id="cta-heading" className="display close-title" data-reveal>Your skills. Your reputation. <em>Your next opportunity.</em></h2>
            <p className="lead" data-reveal>Join free. Start with a readiness check, then build your profile, your passport and your path.</p>
            <div className="actions actions-center" data-reveal>
              <a className="btn btn-gold" href="/auth/signup">Join the network <Arrow /></a>
              <a className="btn btn-ghost-light" href="/auth/login">Sign in</a>
            </div>
          </div>
        </section>
      </main>

      <footer className="ft">
        <div className="wrap ft-in">
          <a className="nv-brand" href="/" aria-label="DBI Skills Network home"><span className="nv-seal"><Crest id="ft-crest" /></span><span className="nv-word">DBI <em>Skills Network</em></span></a>
          <nav aria-label="Footer">
            <a href="/legal/privacy">Privacy</a>
            <a href="/legal/terms">Terms</a>
            <a href="/auth/signup?type=organization">For organizations</a>
          </nav>
          <p className="ft-note">Digital Bridge Institute · DBI Skills Network is a working name.</p>
        </div>
      </footer>
    </div>
  );
}
