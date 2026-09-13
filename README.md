# Brainbox

Eine mobile-first, installierbare To-do-PWA, die Aufgaben nach Dringlichkeit, Dauer und Kategorie organisiert. Die App ist local-first und funktioniert ohne Konto oder Server. Optional können Aufgaben, Kategorien und der Anzeigename über den privaten App-Datenbereich des eigenen Google-Drive-Kontos synchronisiert werden.

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

Google Drive ersetzt diese lokale Datenhaltung nicht: Änderungen werden immer zuerst in IndexedDB gespeichert. Ein Drive-Fehler blockiert deshalb weder das Erstellen noch das Bearbeiten von Aufgaben. Gelöschte Aufgaben und Kategorien werden als Tombstones geführt, damit ein älteres Gerät sie nicht wiederherstellt.

## Optionale Google-Drive-Synchronisierung einrichten

Brainbox verwendet Google Identity Services und ausschließlich den Scope `https://www.googleapis.com/auth/drive.appdata`. Die Datei `todo-sync.json` liegt im versteckten `appDataFolder` des angemeldeten Kontos. Brainbox kann damit weder normale Drive-Dateien auflisten noch öffnen. Es gibt keinen Client Secret, Service Account oder eigenen Backend-Server; Access Tokens bleiben nur im Arbeitsspeicher.

### 1. Google Cloud vorbereiten

1. In der [Google Cloud Console](https://console.cloud.google.com/) ein Projekt erstellen oder auswählen.
2. Unter **APIs & Services → Library** die **Google Drive API** aktivieren.
3. Unter **Google Auth Platform** beziehungsweise **OAuth consent screen** die Anwendung konfigurieren. Für Konten außerhalb der eigenen Organisation den Zielgruppentyp **External** wählen und während der Testphase die gewünschten Konten als Testnutzer ergänzen.
4. Den Scope `https://www.googleapis.com/auth/drive.appdata` hinzufügen.
5. Unter **Clients / Credentials** eine OAuth Client ID vom Typ **Web application** erstellen.
6. Unter **Authorized JavaScript origins** mindestens diese Origins eintragen:
   - Entwicklung: `http://localhost:5173`
   - diese GitHub-Pages-App: `https://chilipixel.github.io`
   - bei einem Fork: `https://USERNAME.github.io`
   - bei Verwendung einer Custom Domain zusätzlich deren vollständigen Origin, zum Beispiel `https://tasks.example.com`

Der Repository-Pfad `/brainbox/` gehört ausdrücklich **nicht** zum JavaScript-Origin. Redirect-URIs sind für den verwendeten Browser-Token-Flow nicht erforderlich.

### 2. Lokal konfigurieren

Die Vorlage kopieren und die Web-Client-ID eintragen:

```bash
cp .env.example .env
```

```dotenv
VITE_GOOGLE_CLIENT_ID=123456789-abcdef.apps.googleusercontent.com
```

Danach den Entwicklungsserver oder Build neu starten. `.env`-Dateien werden ignoriert und dürfen nicht committed werden. Die Client-ID ist zwar kein Client Secret, wird aber bewusst über die Build-Konfiguration eingebunden.

### 3. GitHub Pages konfigurieren

Im GitHub-Repository unter **Settings → Secrets and variables → Actions → Variables** eine Repository-Variable namens `VITE_GOOGLE_CLIENT_ID` mit der Web-Client-ID anlegen. Danach den Workflow erneut ausführen oder einen neuen Commit auf `main` pushen. Der Deployment-Workflow reicht ausschließlich diese öffentliche Client-ID an Vite weiter; Nutzerdaten und Access Tokens gelangen nicht zu GitHub.

### Verhalten der Synchronisierung

- Die erste Anmeldung wird nur über den Button **Mit Google Drive verbinden** gestartet.
- Nach einem Neuladen kann Google aus Sicherheitsgründen eine erneute Benutzeraktion verlangen; Brainbox zeigt dann **Anmeldung erforderlich** und öffnet nicht ungefragt ein Popup.
- Synchronisiert wird beim Verbinden, manuell, nach gespeicherten Änderungen (gebündelt nach vier Sekunden), beim Wieder-online-Kommen und beim Zurückkehren in die App.
- Offline-Änderungen bleiben lokal und werden später nachgeholt. Parallele Syncs werden zusammengeführt.
- Konflikte werden pro Datensatz über `updatedAt`, Löschzeitpunkt und einen deterministischen Device-ID-Tie-Breaker entschieden.
- **Verbindung trennen** widerruft den aktuellen Google-Zugriff, löscht aber weder lokale noch Cloud-Daten.

## Architektur

- `src/types`: Datenmodell
- `src/domain`: Ranking, Dauerlogik und Recommendation Engine
- `src/repositories`: Repository-Verträge, Dexie-Implementierung und Development-Seeds
- `src/services`: Backup-Export und -Validierung
- `src/sync`: validiertes Sync-Format, Merge-Engine, OAuth-Service und austauschbare Drive-/Memory-Provider
- `src/hooks`: reaktive App-Daten und optionale WebMCP-Werkzeuge
- `src/components`: wiederverwendbare UI-Bausteine
- `src/pages`: Ansichten und Workflows
- `src/styles`: responsive Gestaltung, Dark Mode und Reduced Motion

IndexedDB bleibt die maßgebliche lokale Datenquelle. Die Sync-Schicht liest versionierte Snapshots, führt sie deterministisch mit der Cloud zusammen und schreibt das Ergebnis anschließend lokal und in den versteckten Drive-App-Bereich zurück. `MemorySyncProvider` ermöglicht Tests ohne Google-Konto oder echte API-Aufrufe.
