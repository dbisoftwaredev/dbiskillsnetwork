import { Crest, Rosette, Stamp, Waves } from './art';

// Machine-readable zone, 44 characters per line, as on a real travel document.
const MRZ = [
  'PSNGAOKAFOR<<ADA<<<<<<<<<<<<<<<<<<<<<<<<<<<<',
  'SPECIMEN<0NGA<NETWORK<ENGINEERING<<<<<<<<<<6',
];

const RECORD: [string, string, number][] = [
  ['IP networking', 'Demonstrated', 2],
  ['Fibre optics', 'Declared', 1],
  ['Network security', 'Declared', 1],
];

/**
 * The hero passport. The cover is hinged on its left edge; opening it reveals the visa page
 * (the inside of the cover) and the data page. Pure CSS 3D, with tilt and sheen driven by --rx/--ry/--gx.
 */
export function PassportBook() {
  return (
    <div className="pp-stage" data-tilt>
      <div className="pp-book">
        {/* Data page (right) */}
        <aside className="pp-page pp-data" aria-label="Illustrative Skills Passport">
          <Waves className="pp-data-waves" />
          <Rosette className="pp-data-rosette" />
          <div className="pp-holo" aria-hidden="true" />
          <header className="pp-data-head">
            <span>SKILLS PASSPORT</span>
            <span className="pp-specimen">SPECIMEN</span>
          </header>

          <div className="pp-data-body">
            <div className="pp-photo">
              <img className="pp-portrait" src="/images/people/y-ada.webp" alt="" width={180} height={220} />
              <span className="pp-photo-crest" aria-hidden="true"><Crest id="ph-crest" /></span>
            </div>
            <dl className="pp-fields">
              <div><dt>Type</dt><dd>PS</dd></div>
              <div><dt>Code</dt><dd>NGA</dd></div>
              <div className="pp-wide"><dt>Surname</dt><dd>OKAFOR</dd></div>
              <div className="pp-wide"><dt>Given names</dt><dd><h2>Ada Okafor</h2></dd></div>
              <div className="pp-wide"><dt>Occupation</dt><dd>Network engineering</dd></div>
              <div><dt>Base</dt><dd>Lagos</dd></div>
              <div><dt>Issued by</dt><dd>DBI</dd></div>
            </dl>
          </div>

          <p className="pp-section-label">Capability record</p>
          <ul className="pp-record">
            {RECORD.map(([skill, level, n]) => (
              <li key={skill}>
                <span>{skill}</span>
                <span className="pp-pips" aria-hidden="true">{[1, 2, 3].map((i) => <i key={i} className={i <= n ? 'on' : undefined} />)}</span>
                <em>{level}</em>
              </li>
            ))}
          </ul>
          <p className="pp-sample">Sample profile. No credentials or assessment results have been issued.</p>
          <div className="pp-mrz" aria-hidden="true">{MRZ.map((line) => <span key={line}>{line}</span>)}</div>
          <span className="pp-ghost" aria-hidden="true"><img src="/images/people/y-ada.webp" alt="" width={60} height={74} /></span>
        </aside>

        {/* Cover: front is the green book, back is the visa page */}
        <div className="pp-cover" aria-hidden="true">
          <div className="pp-cover-front">
            <Rosette className="pp-cover-rosette" />
            <p className="pp-cover-top">Digital Bridge Institute</p>
            <Crest className="pp-cover-crest" id="cv-crest" />
            <p className="pp-cover-title">Skills<br />Passport</p>
            <p className="pp-cover-sub">Your skills · Your reputation · Your next opportunity</p>
            <span className="pp-chip" />
          </div>
          <div className="pp-cover-back">
            <Waves className="pp-visa-waves" />
            <p className="pp-visa-head"><span>Endorsements</span><span>04</span></p>
            <Stamp id="hs1" className="pp-st pp-st-1" tone="teal" top="DEMONSTRATED" bottom="WORK SAMPLE" word="IP NET" date="SPECIMEN" />
            <Stamp id="hs2" className="pp-st pp-st-2" tone="blue" shape="rect" top="DECLARED" word="FIBRE" date="SELF-REPORTED" />
            <Stamp id="hs3" className="pp-st pp-st-3" tone="red" shape="oval" top="LAGOS · NG" word="JOINED" date="2026" />
            <div className="pp-slot"><span>Awaiting<br />DBI verification</span></div>
          </div>
        </div>
      </div>
      <div className="pp-shadow" aria-hidden="true" />
    </div>
  );
}
