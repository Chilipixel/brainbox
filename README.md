# Brainbox

Eine mobile-first, installierbare To-do-PWA, die Aufgaben nach Dringlichkeit, Dauer und Kategorie organisiert. Brainbox arbeitet vollständig lokal und funktioniert ohne Konto oder Server.

## Installation

Voraussetzung: Node.js 20 oder neuer.

```bash
npm install
```

## Entwicklung starten

```bash
npm run dev
```

Vite zeigt anschließend die lokale Adresse (normalerweise `http://localhost:5173`). Im Development-Modus werden bei einer leeren Datenbank automatisch Beispieldaten erzeugt.

## Tests, Lint und Production Build

```bash
npm test
npm run lint
npm run build
```

Der optimierte Build landet in `dist/`. Er kann nach einem Build mit `npx vite preview` getestet werden.

## Veröffentlichung mit GitHub Pages

Das Repository enthält einen GitHub-Actions-Workflow unter `.github/workflows/deploy-pages.yml`. Jeder Push auf `main` führt Tests und Build aus und veröffentlicht anschließend den Inhalt von `dist/` auf GitHub Pages. In den Repository-Einstellungen muss unter **Settings → Pages → Build and deployment** als Quelle **GitHub Actions** ausgewählt sein.

Der Vite-Basispfad wird im GitHub-Workflow automatisch aus dem Repository-Namen bestimmt. Die Navigation verwendet URL-Hashes, damit auch direkt geöffnete Unterseiten auf GitHub Pages zuverlässig funktionieren.

## PWA installieren

Service Worker und Manifest werden über `vite-plugin-pwa` generiert. PWAs benötigen außerhalb von `localhost` eine HTTPS-Verbindung.

### iPhone und iPad

1. Die HTTPS-Adresse in Safari öffnen.
2. Auf „Teilen“ tippen.
3. „Zum Home-Bildschirm“ wählen und bestätigen.

### Android und Desktop

Die HTTPS-Adresse in einem unterstützten Browser öffnen und im Browsermenü „App installieren“ oder „Zum Startbildschirm hinzufügen“ wählen.

## Datenhaltung und Backups

Aufgaben, Kategorien, Checklisten und Einstellungen werden ausschließlich lokal im Browser gespeichert. Die App verwendet dafür IndexedDB und Local Storage. Es werden keine Aufgabendaten an einen Cloud-Dienst übertragen.

Unter „Einstellungen“ kann ein vollständiges JSON-Backup exportiert und nach einer Validierung wieder importiert werden. Das Importieren ersetzt nach einer Bestätigung die lokalen Daten. Regelmäßige Exporte schützen vor Datenverlust durch gelöschte Browserdaten oder einen Gerätewechsel.

## Rechtliche Seiten

- [Startseite](https://chilipixel.github.io/brainbox/about.html)
- [Datenschutzerklärung](https://chilipixel.github.io/brainbox/privacy.html)
- [Nutzungsbedingungen](https://chilipixel.github.io/brainbox/terms.html)

## Architektur

- `src/types`: Datenmodell
- `src/domain`: Ranking, Dauerlogik und Recommendation Engine
- `src/repositories`: Repository-Verträge, Dexie-Implementierung und Development-Seeds
- `src/services`: Backup-Export und -Validierung
- `src/hooks`: reaktive App-Daten und optionale WebMCP-Werkzeuge
- `src/components`: wiederverwendbare UI-Bausteine
- `src/pages`: Ansichten und Workflows
- `src/styles`: responsive Gestaltung, Dark Mode und Reduced Motion

Die UI greift über Repository-Verträge auf die lokale IndexedDB zu.
