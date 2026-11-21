// Hero: three drifting columns of large photos of young African talent. Photos only, with a
// single role label each, to keep the space calm. Photos are Unsplash stand-ins.

type Person = { photo: string; role: string; alt: string };

const COLUMNS: Person[][] = [
  [
    { photo: 'y-ada', role: 'Network engineering', alt: 'A young woman smiling' },
    { photo: 'y-kwame', role: 'Software engineering', alt: 'A young man holding a laptop covered in developer stickers' },
    { photo: 'y-zuri', role: 'UI/UX design', alt: 'A young woman with headphones working at a computer' },
    { photo: 'y-sipho', role: 'Digital content', alt: 'A young man recording at a microphone' },
  ],
  [
    { photo: 'y-tobi', role: 'Frontend development', alt: 'A young man holding a laptop' },
    { photo: 'y-fatima', role: 'Data analytics', alt: 'A young woman smiling at her laptop' },
    { photo: 'y-emeka', role: 'Cloud support', alt: 'A young man typing on a laptop' },
    { photo: 'y-nia', role: 'Cybersecurity', alt: 'A young woman relaxing with a laptop' },
  ],
  [
    { photo: 'y-amaka', role: 'Product management', alt: 'A young woman in glasses smiling' },
    { photo: 'y-david', role: 'Backend engineering', alt: 'A young man laughing at his laptop' },
    { photo: 'a-students', role: 'Student', alt: 'A student working on a laptop outdoors' },
    { photo: 'a-creators', role: 'Game & content creation', alt: 'A young creator at a desk setup' },
  ],
];

export function HeroWall() {
  return (
    <div className="hw" aria-label="Young African talent across digital skills">
      {COLUMNS.map((col, i) => (
        <div key={i} className={`hw-col hw-col-${i}`}>
          <div className="hw-track">
            {[0, 1].map((copy) => (
              <div key={copy} className="hw-set" aria-hidden={copy === 1 ? true : undefined}>
                {col.map((p) => (
                  <figure key={p.photo} className="hw-card hw-person">
                    <img src={`/images/people/${p.photo}.webp`} alt={copy === 1 ? '' : p.alt} width={900} height={1200}
                      loading={copy === 1 ? 'lazy' : 'eager'} decoding="async" />
                    <figcaption className="hw-role">{p.role}</figcaption>
                  </figure>
                ))}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
