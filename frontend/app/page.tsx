import { CountUp } from '../components/home/live';
import { PointerFx } from '../components/home/pointer';
import { ReadinessExplorer } from '../components/home/readiness';

// Photos are Unsplash stand-ins (public/images/people/CREDITS.md); roles and statuses on them are
// illustrative personas, never real members or results.
const img = (name: string) => `/images/people/${name}.webp`;

const HEADLINE = 'Get hired for what you can actually do.';

const FACES = [
  { photo: 'y-ada', alt: 'A smiling young woman', role: 'Data analyst', status: 'Readiness 64%', lift: 56 },
  { photo: 'y-david', alt: 'A young man smiling at his laptop', role: 'Software developer', status: 'DBI verified', verified: true, lift: 0 },
  { photo: 'y-amaka', alt: 'A young woman with glasses smiling', role: 'UI designer', status: '4 projects shown', lift: 88 },
  { photo: 'y-kwame', alt: 'A young man holding a laptop covered in stickers', role: 'Frontend developer', status: 'DBI verified', verified: true, lift: 24 },
  { photo: 'y-nia', alt: 'A young woman relaxing on a sofa with a laptop', role: 'Content creator', status: 'Open to projects', lift: 72 },
  { photo: 'y-sipho', alt: 'A young man with headphones at a microphone', role: 'Network engineer', status: 'Readiness 71%', lift: 8 },
  { photo: 'y-tobi', alt: 'A young man holding a laptop', role: 'Cloud support', status: 'Learning path active', lift: 64 },
  { photo: 'y-fatima', alt: 'A smiling young woman working at a laptop', role: 'Customer support', status: 'DBI verified', verified: true, lift: 40 },
] as const;

const STEPS = [
  ['Discover', 'Pick a dream role and see where you stand today, before you even sign up.'],
  ['Verify', 'Prove what you can do through practical, calibrated assessments.'],
  ['Diagnose', 'Get an honest, explainable view of the gaps between you and the role.'],
  ['Develop', 'Follow courses, labs, mentors and sponsored pathways matched to those gaps.'],
  ['Connect', 'Reach real jobs, contracts, deployments and projects that fit your evidence.'],
  ['Measure', 'Track your growth, and help employers and funders see what works.'],
];

const TRACKS = [
  { photo: 't-software', title: 'Software engineering', body: 'Frontend, backend and mobile: build the apps and services Africa runs on.' },
  { photo: 't-design', title: 'UI/UX & product design', body: 'Research, interfaces and prototypes people actually enjoy using.' },
  { photo: 't-data', title: 'Data & AI', body: 'Analytics, machine learning and applied AI for real African problems.' },
  { photo: 't-cloud', title: 'Cloud & cybersecurity', body: 'Run, scale and protect the systems behind every digital service.' },
  { photo: 't-network', title: 'Networks & telecom', body: 'IP networking, NOC, fibre and 5G: the backbone of a connected continent.' },
  { photo: 't-content', title: 'Digital content & media', body: 'Video, audio, design and storytelling for a mobile-first audience.' },
];

const ORG_COPY = 'Employers and operators search verified capability, build shortlists and run assessments. Governments, donors and training partners get privacy-safe workforce insight and sponsored cohorts.';

const PROMISES = ['Free for talent, always', 'Your data stays yours', 'People make hiring decisions'];

const Arrow = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

const Tick = ({ size = 12 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12l5 5L20 7" />
  </svg>
);

function Head({ id, kicker, title, sub }: { id: string; kicker: string; title: string; sub?: string }) {
  return (
    <div className="hd">
      <p className="kicker" data-reveal>{kicker}</p>
      <h2 id={id} aria-label={title}>
        {title.split(' ').map((w, i) => <span key={i} className="w" aria-hidden="true" style={{ ['--w' as string]: i }}>{w} </span>)}
      </h2>
      {sub ? <p className="sub" data-reveal>{sub}</p> : null}
    </div>
  );
}

function Face({ f, hidden = false }: { f: (typeof FACES)[number]; hidden?: boolean }) {
  return (
    <li style={{ ['--lift' as string]: `${f.lift}px` }} aria-hidden={hidden || undefined} className={hidden ? 'face-copy' : undefined}>
      <img src={img(f.photo)} alt={hidden ? '' : f.alt} width={900} height={1200} decoding="async" />
      <p className="face-role">{f.role}</p>
      <p className="face-status">{'verified' in f ? <span className="dot" aria-hidden="true" /> : null}{f.status}</p>
    </li>
  );
}

export default function Home() {
  return (
    <div className="lx">
      <a className="skip" href="#main">Skip to content</a>
      <div className="progress" aria-hidden="true" />
      <PointerFx />

      <header className="nav">
        <div className="wrap nav-in">
          <a className="brand" href="/" aria-label="DBI Skills Network home">
            <img src="/images/dbi-logo.png" alt="" width={28} height={28} />
            <span>DBI Skills Network</span>
          </a>
          <nav className="nav-links" aria-label="Sections">
            <a href="#journey">How it works</a>
            <a href="#readiness">Career readiness</a>
            <a href="#pathways">Pathways</a>
            <a href="#organizations">For organizations</a>
          </nav>
          <div className="nav-cta">
            <a className="nav-signin" href="/auth/login">Sign in</a>
            <a className="btn btn-dark btn-sm" href="/auth/signup">Join free</a>
          </div>
        </div>
      </header>

      <main id="main">
        {/* Hero: words rise in on load, faces drift past */}
        <section className="hero" aria-labelledby="headline">
          <div className="wrap hero-copy">
            <h1 id="headline" aria-label={HEADLINE}>
              {HEADLINE.split(' ').map((w, i) => (
                <span key={i} className={`word${w === 'actually' ? ' word-accent' : ''}`} aria-hidden="true" style={{ ['--d' as string]: `${120 + i * 70}ms` }}>{w} </span>
              ))}
            </h1>
            <p className="lead intro" style={{ ['--d' as string]: '650ms' }}>Prove your digital skills once. See exactly what to learn next. Get found by employers who hire on evidence.</p>
            <div className="actions intro" style={{ ['--d' as string]: '800ms' }}>
              <a className="btn btn-dark" href="/auth/signup" data-magnet>Create your free profile</a>
              <a className="btn btn-line" href="#journey" data-magnet>See how it works</a>
            </div>
          </div>
          <div className="stage">
          <div className="badge" aria-hidden="true">
            <svg viewBox="0 0 120 120" className="badge-ring">
              <defs><path id="badge-path" d="M60 60m-46 0a46 46 0 1 1 92 0a46 46 0 1 1 -92 0" /></defs>
              <text><textPath href="#badge-path" textLength="286" lengthAdjust="spacing">FREE FOR TALENT • DBI VERIFIED • </textPath></text>
            </svg>
            <img src="/images/dbi-logo.png" alt="" width={40} height={40} />
          </div>
          <div className="faces-wrap intro" style={{ ['--d' as string]: '950ms' }}>
            <ul className="faces" aria-label="Members (illustrative)">
              {FACES.map((f) => <Face key={f.photo} f={f} />)}
              {FACES.map((f) => <Face key={`${f.photo}-copy`} f={f} hidden />)}
            </ul>
          </div>
          </div>
          <p className="fine center">Illustrative profiles · stand-in photos</p>
        </section>

        {/* Bento: what you get */}
        <section id="platform" className="sec" aria-labelledby="platform-heading">
          <div className="wrap">
            <Head id="platform-heading" kicker="One place" title="Everything you need to grow a career in tech."
              sub="Verify your skills, follow a clear learning path and meet employers who hire on evidence. Built by the Digital Bridge Institute." />
            <div className="bento">
              <figure className="tile tile-photo" data-pop>
                <img src={img('y-fatima')} alt="A smiling young woman working at a laptop" width={900} height={1200} loading="lazy" decoding="async" />
                <figcaption className="chip"><span className="chip-tick"><Tick /></span><span><strong>Customer support</strong><br /><span className="muted">DBI verified · example</span></span></figcaption>
              </figure>
              <div className="bento-grid">
                <div className="tile" data-pop data-tilt>
                  <p className="tile-label">Career readiness</p>
                  <div className="ring-row">
                    <svg width="88" height="88" viewBox="0 0 88 88" role="img" aria-label="58 percent ready">
                      <circle cx="44" cy="44" r="38" fill="none" stroke="#e6e6ea" strokeWidth="8" />
                      <circle className="ring" cx="44" cy="44" r="38" fill="none" stroke="#4f35c2" strokeWidth="8" strokeLinecap="round" strokeDasharray="138.5 238.8" transform="rotate(-90 44 44)" />
                    </svg>
                    <div><p className="big"><CountUp to={58} suffix="%" /></p><p className="muted">Cloud Support · example</p></div>
                  </div>
                  <p className="tile-foot">3 gaps left · next: Linux lab</p>
                </div>
                <div className="tile" data-pop data-tilt>
                  <p className="tile-label">Six pathways</p>
                  <ul className="tags">{['Software', 'Data', 'Cloud', 'Networks', 'Design', 'Content'].map((t, i) => <li key={t} style={{ ['--i' as string]: i }}>{t}</li>)}</ul>
                </div>
                <div className="tile" data-pop data-tilt>
                  <p className="tile-label">A match for you</p>
                  <div className="job">
                    <p className="job-title">Junior Network Technician</p>
                    <p className="muted">Lagos · Full-time · example</p>
                    <p className="job-match">Matches 4 of 5 required skills</p>
                  </div>
                  <p className="tile-foot">Applying is always free</p>
                </div>
                <div className="tile tile-dark" data-pop data-tilt>
                  <p className="tile-label">Your data, your call</p>
                  <div className="toggles" aria-hidden="true">
                    <p><span>Show verified skills</span><i className="on" /></p>
                    <p><span>Show contact details</span><i className="flip" /></p>
                  </div>
                  <p className="tile-foot">Employers only see what you choose to share.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="journey" className="sec sec-line" aria-labelledby="journey-heading">
          <div className="wrap">
            <Head id="journey-heading" kicker="How it works" title="From first step to first job."
              sub="Not a job board. Not another course catalogue. One connected cycle that identifies, verifies, develops and connects talent to real opportunity." />
            <ol className="steps">
              {STEPS.map(([name, body], i) => (
                <li key={name} data-reveal style={{ ['--i' as string]: i % 3 }}><span className="num">{String(i + 1).padStart(2, '0')}</span><h3>{name}</h3><p>{body}</p></li>
              ))}
            </ol>
          </div>
        </section>

        {/* Readiness explorer */}
        <section id="readiness" className="sec sec-line" aria-labelledby="readiness-heading">
          <div className="wrap">
            <Head id="readiness-heading" kicker="Career Readiness Explorer" title="Pick a dream role. See how ready you are."
              sub="No account needed. Choose a destination and see your readiness, the gaps left to close and the next step to take." />
            <div data-reveal><ReadinessExplorer /></div>
            <p className="fine">Example data from a sample profile. Your own check uses your skills and evidence.</p>
          </div>
        </section>

        {/* Pathways */}
        <section id="pathways" className="sec sec-line" aria-labelledby="pathways-heading">
          <div className="wrap">
            <Head id="pathways-heading" kicker="Digital skills" title="The skills powering Africa’s digital future."
              sub="Each pathway has its own competency levels, practical assessments, learning and opportunities, validated with the employers who hire for it." />
            <div className="cards">
              {TRACKS.map((t, i) => (
                <article key={t.title} className="card" data-pop style={{ ['--i' as string]: i % 3 }}>
                  <div className="card-photo"><img src={img(t.photo)} alt="" width={1200} height={1500} loading="lazy" decoding="async" /></div>
                  <h3>{t.title}</h3>
                  <p>{t.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Organizations */}
        <section id="organizations" className="sec" aria-labelledby="org-heading">
          <div className="wrap">
            <div className="org" data-grow>
              <div className="org-copy">
                <p className="kicker kicker-light">For organizations</p>
                <h2 id="org-heading">Hire on evidence, not the CV.</h2>
                <p className="scrub" aria-label={ORG_COPY}>{ORG_COPY.split(' ').map((w, i) => <span key={i} aria-hidden="true" style={{ ['--w' as string]: i }}>{w} </span>)}</p>
                <a className="btn btn-light" href="/auth/signup" data-magnet>Set up your workspace <Arrow /></a>
              </div>
              <ul className="org-points">
                <li data-reveal><strong>Verified skills, not claims</strong><span>See which skills were checked by DBI experts and which are self-declared.</span></li>
                <li data-reveal><strong>Consent first</strong><span>Talent contact details stay private until they agree to share them.</span></li>
                <li data-reveal><strong>One workspace</strong><span>Invite your team, post roles and track the people you develop.</span></li>
              </ul>
            </div>
          </div>
        </section>

        {/* Join */}
        <section className="close" aria-labelledby="cta-heading">
          <div className="wrap close-in">
            <div className="close-faces" aria-hidden="true">
              {['y-ada', 'y-david', 'y-amaka', 'y-kwame', 'y-nia'].map((f, i) => <img key={f} src={img(f)} alt="" width={56} height={56} loading="lazy" decoding="async" style={{ ['--i' as string]: i }} />)}
            </div>
            <h2 id="cta-heading" data-reveal>Your skills. Your reputation. Your next opportunity.</h2>
            <p className="lead" data-reveal>Join free. Start with a readiness check, then build your profile and your path.</p>
            <div className="actions" data-reveal>
              <a className="btn btn-dark" href="/auth/signup" data-magnet>Join the network</a>
              <a className="btn btn-line" href="/auth/login">Sign in</a>
            </div>
            <ul className="promises" data-reveal>
              {PROMISES.map((p) => <li key={p}><Tick size={14} />{p}</li>)}
            </ul>
          </div>
        </section>
      </main>

      <footer className="ft">
        <div className="wrap ft-in">
          <a className="brand" href="/" aria-label="DBI Skills Network home">
            <img src="/images/dbi-logo.png" alt="" width={24} height={24} />
            <span>DBI Skills Network</span>
          </a>
          <nav aria-label="Footer">
            <a href="/legal/privacy">Privacy</a>
            <a href="/legal/terms">Terms</a>
            <a href="/auth/signup">For organizations</a>
          </nav>
          <p className="ft-note">Digital Bridge Institute · DBI Skills Network is a working name.</p>
        </div>
      </footer>
    </div>
  );
}
