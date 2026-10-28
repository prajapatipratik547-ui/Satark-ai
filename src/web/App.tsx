export function App() {
  return (
    <>
      <header className="site-header">
        <div className="container">
          <h1 className="brand">Satark</h1>
          <p className="tagline">Check any message before you trust it</p>
        </div>
      </header>

      <main id="main" className="container">
        <section className="card" aria-labelledby="check-heading">
          <h2 id="check-heading">Check a message</h2>
          <p>Message checking is coming soon.</p>
        </section>
      </main>

      <footer className="site-footer">
        <div className="container">
          <p>We don&apos;t store your messages.</p>
          <ul className="footer-links">
            <li>
              <a href="https://cybercrime.gov.in" rel="noopener noreferrer">
                cybercrime.gov.in
              </a>
            </li>
            <li>
              <a href="https://sancharsaathi.gov.in/sfc/" rel="noopener noreferrer">
                sancharsaathi.gov.in
              </a>
            </li>
          </ul>
        </div>
      </footer>
    </>
  );
}
