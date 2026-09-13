const page = (name: string) => `${import.meta.env.BASE_URL}${name}`

export function LegalFooter() {
  return <footer className="legal-footer" aria-label="Rechtliche Informationen">
    <a href={page('about.html')}>Über Brainbox</a>
    <a href={page('privacy.html')}>Datenschutz</a>
    <a href={page('terms.html')}>Nutzungsbedingungen</a>
  </footer>
}
