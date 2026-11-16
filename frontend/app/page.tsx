export default function Home() {
  return <>
    <a className="skip" href="#main">Skip to content</a>
    <header><a className="brand" href="/" aria-label="DBI Skills Network home"><span className="mark">DBI</span><span>Skills Network</span></a><span className="preview">Product preview</span></header>
    <main id="main">
      <section className="hero" aria-labelledby="headline">
        <div><p className="eyebrow">A new chapter for digital talent</p><h1 id="headline">Your skills.<br/>Your reputation.<br/><em>Your next opportunity.</em></h1><p className="intro">Build a trusted record of what you can do. Discover the skills to develop and the opportunities to work towards.</p><a className="button" href="#journey">Explore the network <span aria-hidden="true">↗</span></a><p className="note">Coming soon · Free basic Skills Passport</p></div>
        <aside className="passport" aria-label="Illustrative Skills Passport"><div className="card-top"><span>DBI / SKILLS PASSPORT</span><span className="mint">ILLUSTRATION</span></div><div className="avatar" aria-hidden="true">AO</div><h2>Ada Okafor</h2><p>Network engineering · Lagos</p><div className="rule"/><p className="eyebrow">Capability record</p><ul><li>IP networking <span>Demonstrated</span></li><li>Fibre optics <span>Declared</span></li><li>Network security <span>Declared</span></li></ul><div className="card-bottom">A career record that grows with you <span aria-hidden="true">↗</span></div><p className="sample">Sample profile. No credentials or assessment results have been issued.</p></aside>
      </section>
      <section id="journey" aria-labelledby="journey-heading"><p className="eyebrow">Your path forward</p><h2 id="journey-heading">Turn capability into possibility.</h2><div className="steps"><article><span>01 / Discover</span><h3>Know your starting point</h3><p>Explore a target role and understand where your skills could take you.</p></article><article><span>02 / Develop</span><h3>Build trusted evidence</h3><p>Grow your passport through learning, practical assessments and project experience.</p></article><article><span>03 / Connect</span><h3>Find your next step</h3><p>Discover relevant jobs, projects and employer supported pathways as they become available.</p></article></div></section>
    </main><footer><span>Digital Bridge Institute</span><span>DBI Skills Network · Working name</span></footer>
  </>;
}
