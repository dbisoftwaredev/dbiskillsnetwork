// People-led sections. Photos are Unsplash stand-ins (see public/images/people/CREDITS.md);
// names, tracks and stamps are illustrative personas, never testimonials.
import { Crest } from './art';

const img = (name: string) => `/images/people/${name}.webp`;

/** Apple-style full-bleed community moment. */
export function CommunityPhoto() {
  return (
    <figure className="cm" data-reveal>
      <div className="cm-frame">
        <img src={img('community-together')} alt="Young people working together on laptops outdoors" width={2400} height={1350} loading="lazy" decoding="async" />
        <div className="cm-copy">
          <p className="cm-kicker">This is the network</p>
          <p className="cm-title">Not a database of CVs.<br /><em>A community that vouches for each other.</em></p>
        </div>
      </div>
      <figcaption className="mono">Illustrative photography · Unsplash</figcaption>
    </figure>
  );
}

const TRACKS = [
  { photo: 't-software', title: 'Software engineering', body: 'Frontend, backend and mobile: build the apps and services Africa runs on.' },
  { photo: 't-design', title: 'UI/UX & product design', body: 'Research, interfaces and prototypes people actually enjoy using.' },
  { photo: 't-data', title: 'Data & AI', body: 'Analytics, machine learning and applied AI for real African problems.' },
  { photo: 't-cloud', title: 'Cloud & cybersecurity', body: 'Run, scale and protect the systems behind every digital service.' },
  { photo: 't-network', title: 'Networks & telecom', body: 'IP networking, NOC, fibre and 5G: the backbone of a connected continent.' },
  { photo: 't-content', title: 'Digital content & media', body: 'Video, audio, design and storytelling for a mobile-first audience.' },
];

/** Google-style photo-led career track cards. */
export function TrackCards() {
  return (
    <div className="tc-rail" role="region" aria-label="Career tracks" tabIndex={0}>
      {TRACKS.map((t, i) => (
        <article key={t.title} className="tc" data-reveal style={{ ['--d' as string]: `${i * 70}ms` }}>
          <div className="tc-photo">
            <img src={img(t.photo)} alt="" width={1200} height={1400} loading="lazy" decoding="async" />
          </div>
          <h3>{t.title}</h3>
          <p>{t.body}</p>
        </article>
      ))}
    </div>
  );
}

/** Faces orbiting the crest in the closing section. */
export function FaceOrbit() {
  const faces = ['y-ada', 'y-kwame', 'y-zuri', 'y-tobi', 'y-fatima', 'y-david', 'y-nia', 'y-amaka'];
  return (
    <div className="orbit" aria-hidden="true">
      <div className="orbit-ring">
        {faces.map((f, i) => (
          <span key={f} className="orbit-face" style={{ ['--a' as string]: `${(360 / faces.length) * i}deg` }}>
            <img src={img(f)} alt="" width={84} height={84} loading="lazy" decoding="async" />
          </span>
        ))}
      </div>
      <Crest className="orbit-crest" id="orbit-crest" />
    </div>
  );
}
