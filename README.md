# Brainbox

Eine mobile-first, installierbare To-do-PWA, die Aufgaben nach Dringlichkeit, Dauer und Kategorie organisiert. Die App ist local-first: Für Version 1 sind weder Konto noch Server nötig.

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

Der optimierte Build landet in `dist/`. Er kann lokal mit `npm run dev -- --host` oder nach einem Build mit `npx vite preview` getestet werden.

## Veröffentlichung mit GitHub Pages

Das Repository enthält einen GitHub-Actions-Workflow unter `.github/workflows/deploy-pages.yml`. Jeder Push auf `main` führt Tests und Build aus und veröffentlicht anschließend den Inhalt von `dist/` auf GitHub Pages. In den Repository-Einstellungen muss unter **Settings → Pages → Build and deployment** als Quelle **GitHub Actions** ausgewählt sein.

Der Vite-Basispfad wird im GitHub-Workflow automatisch aus dem Repository-Namen bestimmt. Die Navigation verwendet URL-Hashes, damit auch direkt geöffnete Unterseiten auf GitHub Pages zuverlässig funktionieren.

## PWA testen

Service Worker und Manifest werden über `vite-plugin-pwa` generiert. Für einen realistischen Test zuerst `npm run build` ausführen und danach `npx vite preview --host`. PWAs benötigen außerhalb von `localhost` eine HTTPS-Verbindung. In Chrome helfen unter „Anwendung“ die Bereiche „Manifest“ und „Service Workers“ bei der Kontrolle. Nach dem ersten vollständigen Laden lässt sich die App offline öffnen und bedienen.

### Installation auf iPhone/iPad

1. Die HTTPS-Adresse in Safari öffnen.
2. Auf „Teilen“ tippen.
3. „Zum Home-Bildschirm“ wählen und bestätigen.

Die App startet danach im Standalone-Modus. iOS erlaubt die Installation über Safari; private Tabs eignen sich nicht zum PWA-Test.

### Installation auf Android

1. Die HTTPS-Adresse in Chrome öffnen.
2. Im Browsermenü „App installieren“ oder „Zum Startbildschirm hinzufügen“ wählen.
3. Installation bestätigen.

## Datenhaltung

Aufgaben und Kategorien werden über Dexie in IndexedDB gespeichert. UI-Komponenten greifen über die Repository-/App-Daten-Schicht darauf zu. Unter „Einstellungen“ kann ein vollständiges JSON-Backup exportiert und nach Validierung wieder importiert werden. Das Importieren ersetzt nach einer Bestätigung die lokalen Daten.

## Architektur

- `src/types`: Datenmodell
- `src/domain`: Ranking, Dauerlogik und Recommendation Engine
- `src/repositories`: Repository-Verträge, Dexie-Implementierung und Development-Seeds
- `src/services`: Backup-Export und -Validierung
- `src/hooks`: reaktive App-Daten und optionale WebMCP-Werkzeuge
- `src/components`: wiederverwendbare UI-Bausteine
- `src/pages`: Ansichten und Workflows
- `src/styles`: responsive Gestaltung, Dark Mode und Reduced Motion

Die UI kennt IndexedDB nicht direkt. Eine spätere `SyncedTaskRepository`-Implementierung kann daher hinter den vorhandenen Verträgen ergänzt werden, ohne Ranking und Recommendation Engine umzubauen.
