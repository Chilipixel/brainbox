export function BrandMark() {
  const base = import.meta.env.BASE_URL

  return <span className="brand-mark" aria-hidden="true">
    <img className="brand-mark-light" src={`${base}pwa-192x192.png`} alt="" />
    <img className="brand-mark-dark" src={`${base}brainbox-icon-dark-192.png`} alt="" />
  </span>
}
