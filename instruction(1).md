# Instruction.md — Bloc-notes Desktop Ultra-Performant

## 1. Objectif

Construire une application de bloc-notes desktop ultra-performante, fonctionnant principalement en local et offline-first.

L'application doit avoir une sensation de fluidité comparable à VS Code ou Obsidian :

- ouverture rapide
- saisie sans latence
- autosave asynchrone
- recherche rapide
- navigation entre les notes instantanée
- fonctionnement complet sans connexion Internet
- architecture permettant d'ajouter ensuite de l'IA locale, de la recherche sémantique et de la synchronisation cloud

### Stack principale

- Electron
- React
- TypeScript
- Vite
- Zustand
- éditeur natif basé sur `<textarea>`
- SQLite
- FastAPI
- Python
- FTS5 pour la recherche plein texte

**Ne pas utiliser CodeMirror, Monaco ou un autre éditeur externe dans la première version.**

---

# 2. Architecture générale

Utiliser cette architecture :

```text
                         ┌──────────────────────┐
                         │       Electron       │
                         │                      │
                         │  ┌────────────────┐  │
                         │  │ React Renderer │  │
                         │  │                │  │
                         │  │ Native Editor  │  │
                         │  │ Sidebar        │  │
                         │  │ Search         │  │
                         │  │ Command Palette│  │
                         │  └───────┬────────┘  │
                         │          │ IPC       │
                         │  ┌───────▼────────┐  │
                         │  │ Main Process   │  │
                         │  │                │  │
                         │  │ SQLite         │  │
                         │  │ Filesystem     │  │
                         │  │ IPC handlers   │  │
                         │  │ Process mgr    │  │
                         │  └───────┬────────┘  │
                         └──────────┼───────────┘
                                    │
                              localhost only
                                    │
                         ┌──────────▼───────────┐
                         │       FastAPI        │
                         │                      │
                         │ Search               │
                         │ Indexing             │
                         │ Embeddings            │
                         │ AI                    │
                         │ Background jobs       │
                         └──────────────────────┘
```

## Règle fondamentale

FastAPI ne doit **jamais** être dans le chemin critique de l'édition.

Une frappe clavier doit être traitée entièrement dans le renderer.

Ne jamais faire :

```text
keypress
→ HTTP request
→ FastAPI
→ SQLite
→ response
→ update UI
```

Faire :

```text
keypress
→ textarea local
→ état local
→ UI immédiate
→ autosave asynchrone
```

---

# 3. Stack technique

## Desktop

- Electron
- Electron Builder
- TypeScript

## Frontend

- React
- TypeScript
- Vite
- éditeur natif basé sur `<textarea>`

## State management

Utiliser Zustand.

Les stores doivent être petits et séparés par responsabilité.

Exemple :

```text
stores/
├── editorStore.ts
├── notesStore.ts
├── searchStore.ts
├── settingsStore.ts
└── uiStore.ts
```

## Backend

- Python 3.12+
- FastAPI
- Uvicorn
- Pydantic

## Database

SQLite.

Utiliser WAL :

```sql
PRAGMA journal_mode = WAL;
PRAGMA synchronous = NORMAL;
```

FTS5 doit être utilisé pour la recherche plein texte.

---

# 4. Structure du repository

Créer une structure similaire à :

```text
notebook/
│
├── apps/
│   │
│   ├── desktop/
│   │   ├── electron/
│   │   │   ├── main.ts
│   │   │   ├── preload.ts
│   │   │   ├── ipc/
│   │   │   │   ├── notes.ts
│   │   │   │   ├── search.ts
│   │   │   │   └── settings.ts
│   │   │   ├── services/
│   │   │   │   ├── database.ts
│   │   │   │   ├── fastapi.ts
│   │   │   │   └── filesystem.ts
│   │   │   └── process/
│   │   │       └── fastapiProcess.ts
│   │   │
│   │   └── renderer/
│   │       ├── components/
│   │       │   ├── Editor/
│   │       │   ├── Sidebar/
│   │       │   ├── Search/
│   │       │   ├── CommandPalette/
│   │       │   └── Layout/
│   │       ├── editor/
│   │       ├── stores/
│   │       ├── hooks/
│   │       ├── lib/
│   │       ├── App.tsx
│   │       └── main.tsx
│   │
│   └── backend/
│       ├── app/
│       │   ├── main.py
│       │   ├── config.py
│       │   ├── api/
│       │   │   ├── search.py
│       │   │   ├── indexing.py
│       │   │   └── health.py
│       │   ├── services/
│       │   │   ├── search.py
│       │   │   ├── indexing.py
│       │   │   └── ai.py
│       │   └── models/
│       │
│       └── requirements.txt
│
├── packages/
│   └── shared/
│       ├── types/
│       └── constants/
│
├── data/
├── scripts/
├── tests/
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

Adapter cette structure si nécessaire, mais conserver une séparation claire entre :

- Electron main process
- renderer
- backend Python
- code partagé

---

# 5. Sécurité Electron

Configurer Electron avec :

```typescript
webPreferences: {
  contextIsolation: true,
  nodeIntegration: false,
  sandbox: true
}
```

Ne jamais exposer directement Node.js au renderer.

Utiliser `contextBridge`.

Exemple :

```text
Renderer
   ↓
window.api.notes.save()
   ↓
preload.ts
   ↓
IPC
   ↓
Electron main
```

Ne jamais utiliser :

```typescript
window.require(...)
```

dans le renderer.

Ne jamais activer :

```typescript
nodeIntegration: true
```

---

# 6. API IPC

Créer une API fortement typée.

Exemple :

```typescript
interface NotesAPI {
  list(): Promise<NoteMetadata[]>;
  get(id: string): Promise<Note>;
  create(input: CreateNoteInput): Promise<Note>;
  update(id: string, content: string): Promise<void>;
  delete(id: string): Promise<void>;
  rename(id: string, title: string): Promise<void>;
}
```

Expose uniquement les méthodes nécessaires.

Ne jamais exposer une API IPC générique du type :

```typescript
ipcRenderer.send(channel, arbitraryData)
```

Chaque channel doit être explicitement défini.

---

# 7. Modèle de données

Créer une table SQLite :

```sql
CREATE TABLE notes (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL DEFAULT '',
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
);
```

Créer les index nécessaires :

```sql
CREATE INDEX idx_notes_updated_at
ON notes(updated_at);
```

Créer une table FTS5 :

```sql
CREATE VIRTUAL TABLE notes_fts
USING fts5(
    title,
    content,
    content='notes',
    content_rowid='rowid'
);
```

Maintenir l'index FTS automatiquement lors des modifications.

Prévoir des migrations versionnées dès le départ.

---

# 8. Éditeur natif

Ne pas utiliser :

- CodeMirror
- Monaco
- Ace
- TipTap
- ProseMirror
- autre éditeur externe

La première version doit utiliser les primitives natives du navigateur.

Utiliser de préférence :

```html
<textarea>
```

L'éditeur doit être extrêmement léger.

## Architecture

Créer :

```text
Editor/
├── TextEditor.tsx
├── editorStore.ts
├── editorTypes.ts
└── editorUtils.ts
```

Préparer une abstraction permettant de changer d'implémentation plus tard :

```typescript
interface EditorController {
  getValue(): string;
  setValue(value: string): void;
  focus(): void;
  insertText(text: string): void;
  replaceSelection(text: string): void;
}
```

## Fonctionnalités

L'éditeur doit :

- avoir une saisie sans latence
- supporter les textes longs
- supporter undo/redo natif
- gérer le curseur
- gérer la sélection
- gérer copier/coller
- gérer les raccourcis clavier
- supporter Markdown comme texte brut
- ne pas provoquer de re-render React global à chaque caractère
- conserver le focus correctement
- restaurer la position du curseur lors des changements de note lorsque possible

## Architecture de saisie

Ne jamais faire :

```text
keypress
→ Zustand
→ React render global
→ textarea
```

Préférer :

```text
keypress
→ textarea local
→ UI immédiate
→ synchronisation différée
→ autosave
```

L'éditeur ne doit jamais appeler FastAPI directement.

L'éditeur ne doit jamais écrire directement dans SQLite.

Le flux doit rester :

```text
Textarea
   ↓
Editor state
   ↓
Debounced autosave
   ↓
Electron IPC
   ↓
SQLite
```

---

# 9. Autosave

L'éditeur ne doit jamais attendre SQLite.

Créer un système d'autosave avec debounce.

Comportement souhaité :

```text
Utilisateur tape
       ↓
état local immédiatement mis à jour
       ↓
timer 300-500 ms
       ↓
si aucune nouvelle modification
       ↓
IPC
       ↓
SQLite
```

Si l'utilisateur continue à taper :

```text
AAAA
 A
  A
   A
    ↓
pas de sauvegarde à chaque caractère
```

Une sauvegarde doit être déclenchée après une courte période d'inactivité.

Ajouter également un mécanisme de sauvegarde de sécurité périodique.

Une sauvegarde explicite avec `Cmd/Ctrl + S` doit forcer la persistance immédiate.

---

# 10. Gestion de l'état

Utiliser Zustand.

Le document actuellement ouvert doit être gardé en mémoire.

Exemple :

```typescript
interface EditorState {
  activeNoteId: string | null;
  content: string;
  dirty: boolean;

  setContent(content: string): void;
  markSaved(): void;
}
```

Cependant, ne pas utiliser Zustand comme canal de rendu à chaque frappe si cela provoque des re-renders inutiles.

Le textarea doit rester aussi autonome que possible.

Séparer :

- état UI
- état persistant
- état d'édition local
- état de sauvegarde

---

# 11. Sidebar

La sidebar doit afficher :

- titre
- date de modification
- éventuellement aperçu du contenu

Ne pas charger le contenu complet de toutes les notes.

Au démarrage :

```text
SQLite
 ↓
metadata uniquement
 ↓
sidebar
```

Lorsqu'une note est sélectionnée :

```text
click note
 ↓
load content
 ↓
editor
```

Si le nombre de notes devient important, utiliser une liste virtualisée.

Ne jamais charger 10 000 contenus complets uniquement pour afficher la sidebar.

---

# 12. Recherche

La recherche doit être extrêmement rapide.

Utiliser SQLite FTS5.

Endpoint FastAPI :

```http
GET /api/search?q=electron
```

Retourner :

```json
{
  "results": [
    {
      "id": "123",
      "title": "Electron architecture",
      "snippet": "...Electron...",
      "score": 0.95
    }
  ]
}
```

Ne pas utiliser une recherche Python naïve :

```python
for note in notes:
    if query in note.content:
        ...
```

FTS5 doit être la source principale de la recherche plein texte.

Pour la recherche interactive :

- debounce de 100 à 200 ms
- annulation ou invalidation des recherches obsolètes
- ne jamais bloquer l'éditeur
- afficher les résultats progressivement si nécessaire

---

# 13. FastAPI

FastAPI doit être démarré automatiquement par Electron.

Electron doit :

1. trouver un port local disponible
2. lancer le processus Python
3. démarrer Uvicorn
4. attendre `/health`
5. considérer FastAPI comme prêt uniquement lorsque `/health` répond correctement

Exemple :

```http
GET /health

{
  "status": "ok"
}
```

FastAPI doit écouter uniquement sur :

```text
127.0.0.1
```

Ne jamais exposer FastAPI publiquement.

---

# 14. Gestion du processus FastAPI

Créer :

```text
fastapiProcess.ts
```

Responsabilités :

```text
start()
waitUntilReady()
stop()
restart()
isReady()
```

Lorsqu'Electron se ferme :

```text
Electron
 ↓
stop FastAPI
 ↓
attendre fermeture
 ↓
quit
```

Gérer correctement les processus orphelins.

Ajouter des logs utiles.

FastAPI doit être relancé proprement si le processus crash.

Ne pas bloquer l'ouverture de l'interface si FastAPI met quelques secondes à démarrer.

---

# 15. FastAPI et tâches lourdes

FastAPI est destiné aux opérations non critiques :

- indexation
- recherche avancée
- embeddings
- IA locale
- analyse de documents
- import/export
- traitements lourds

Ces opérations ne doivent jamais bloquer l'UI.

Utiliser une architecture de jobs lorsque nécessaire :

```text
POST /api/index
      ↓
job créé
      ↓
worker
      ↓
indexation
```

Retourner immédiatement un identifiant de job si l'opération est longue.

---

# 16. IA locale future

Préparer une interface :

```python
class AIProvider:
    async def summarize(self, text: str) -> str:
        ...

    async def generate(self, prompt: str) -> str:
        ...

    async def embeddings(self, text: str) -> list[float]:
        ...
```

Prévoir la possibilité d'utiliser plus tard :

- Ollama
- llama.cpp
- autre runtime local

Ne pas coupler le reste du code à Ollama directement.

L'IA doit être optionnelle.

L'application doit rester parfaitement fonctionnelle sans modèle local.

---

# 17. Recherche sémantique future

Préparer l'architecture pour :

```text
note
 ↓
chunking
 ↓
embedding
 ↓
vector index
 ↓
semantic search
```

Mais ne pas ajouter un moteur vectoriel complexe dans la première version si ce n'est pas nécessaire.

Commencer avec FTS5.

---

# 18. Gestion des fichiers

L'application doit pouvoir fonctionner avec une base SQLite locale.

Prévoir également une architecture permettant d'ajouter :

- import Markdown
- export Markdown
- export JSON
- import JSON

Les opérations filesystem doivent être réalisées dans Electron Main, jamais directement dans React.

Prévoir une couche :

```text
filesystem.ts
```

afin de pouvoir ajouter plus tard :

- dossiers
- fichiers Markdown
- pièces jointes
- images
- drag & drop

---

# 19. Performance

## Startup

L'application doit afficher l'interface avant de terminer les tâches secondaires.

Ordre :

```text
Electron
 ↓
React
 ↓
UI
 ↓
notes metadata
 ↓
FastAPI
 ↓
indexation
```

Ne jamais attendre FastAPI avant d'afficher l'interface.

## Typing latency

La frappe doit rester locale.

Aucune requête réseau/IPC obligatoire par caractère.

## Recherche

La recherche doit être suffisamment rapide pour permettre une recherche interactive.

Debounce :

```text
100-200 ms
```

## Mémoire

Éviter de garder toutes les notes complètes en mémoire.

## Rendering

Éviter les re-renders React globaux.

Le composant textarea doit rester stable.

Ne pas recréer le textarea à chaque changement de note ou de state non pertinent.

---

# 20. Gestion des erreurs

Toutes les couches doivent avoir une gestion d'erreur claire.

Exemple :

```text
Renderer
   ↓
IPC error
   ↓
notification utilisateur
```

Ne jamais laisser une exception non gérée tuer le processus Electron.

FastAPI doit retourner des erreurs structurées.

Les erreurs de sauvegarde doivent être visibles à l'utilisateur.

Ne jamais considérer une note comme sauvegardée si SQLite a échoué.

---

# 21. Logging

Créer :

```text
logs/
├── electron.log
└── fastapi.log
```

En production :

- logs raisonnables
- pas de contenu sensible inutile
- rotation si nécessaire

En développement :

- logs détaillés

---

# 22. Tests

Créer des tests pour :

## Frontend

- ouverture d'une note
- modification
- autosave
- changement de note
- recherche
- undo/redo
- raccourcis clavier

## Electron

- IPC
- SQLite
- filesystem
- lancement FastAPI
- arrêt FastAPI

## Python

- health endpoint
- recherche
- indexation
- erreurs API

Créer également des tests d'intégration.

Tester particulièrement les scénarios :

```text
édition rapide
→ autosave
→ changement de note
→ retour sur la note
```

et :

```text
édition
→ crash/restart FastAPI
→ contenu toujours disponible
```

---

# 23. UX

Créer une interface minimaliste et moderne.

Layout :

```text
┌─────────────────────────────────────────────────────┐
│ Search / Command Palette                            │
├───────────────┬─────────────────────────────────────┤
│               │                                     │
│ Notes         │                                     │
│               │              Editor                 │
│ + New note    │                                     │
│               │                                     │
│ Note 1        │                                     │
│ Note 2        │                                     │
│ Note 3        │                                     │
│               │                                     │
└───────────────┴─────────────────────────────────────┘
```

Prévoir :

- dark mode
- light mode
- raccourcis clavier
- command palette
- recherche rapide
- création de note
- sauvegarde automatique
- indication discrète du statut de sauvegarde

Exemple :

```text
Saved
Saving...
Unsaved
Error
```

Le statut ne doit pas distraire l'utilisateur.

---

# 24. Raccourcis clavier

Implémenter au minimum :

```text
Cmd/Ctrl + N
Nouvelle note

Cmd/Ctrl + P
Recherche / command palette

Cmd/Ctrl + S
Sauvegarde forcée

Cmd/Ctrl + W
Fermer note

Cmd/Ctrl + Z
Undo

Cmd/Ctrl + Shift + Z
Redo
```

Les raccourcis doivent fonctionner correctement sur :

- macOS
- Windows
- Linux

---

# 25. Configuration

Créer une configuration centralisée.

Ne jamais hardcoder :

- ports
- chemins
- configuration FastAPI
- chemin database

Le chemin des données doit utiliser les répertoires standards d'Electron :

```typescript
app.getPath("userData")
```

Exemple :

```text
userData/
├── notebook.db
├── logs/
└── attachments/
```

---

# 26. Développement

Le projet doit pouvoir être lancé avec :

```bash
npm install
npm run dev
```

Cette commande doit :

1. lancer Vite
2. lancer Electron
3. lancer FastAPI
4. connecter automatiquement les trois composants

Prévoir aussi :

```bash
npm run build
npm run test
npm run lint
npm run typecheck
```

Ajouter si pertinent :

```bash
npm run format
npm run test:e2e
```

---

# 27. Production

Utiliser Electron Builder.

Produire des builds pour :

- macOS
- Windows
- Linux

Le backend Python doit être packagé avec l'application.

L'utilisateur final ne doit PAS avoir besoin d'installer Python.

Prévoir une stratégie de packaging :

```text
Electron
 ├── renderer
 ├── main
 └── backend/
      └── Python packaged runtime
```

Utiliser éventuellement PyInstaller pour créer le binaire FastAPI/Python.

Tester les builds sur chaque plateforme cible.

---

# 28. Sécurité

Respecter les principes suivants :

- localhost uniquement
- `contextIsolation: true`
- `nodeIntegration: false`
- `sandbox: true` lorsque compatible
- validation des données IPC
- validation Pydantic côté FastAPI
- aucune commande shell provenant directement du renderer
- aucun accès filesystem direct depuis React
- aucune donnée utilisateur injectée directement dans des commandes shell
- aucune API FastAPI exposée sur le réseau local sans raison
- secrets locaux non hardcodés

---

# 29. Priorités de développement

Développer dans cet ordre.

## Phase 1 — Foundation

Créer :

- Electron
- React
- Vite
- TypeScript
- FastAPI
- communication Electron/FastAPI
- configuration dev

## Phase 2 — Database

Créer :

- SQLite
- migrations
- modèle Note
- CRUD
- WAL
- IPC database

## Phase 3 — Editor

Créer :

- textarea natif
- ouverture note
- édition
- undo/redo natif
- autosave
- restauration du curseur si possible

## Phase 4 — UI

Créer :

- sidebar
- liste des notes
- création
- suppression
- renommage
- navigation

## Phase 5 — Search

Créer :

- FTS5
- indexation
- recherche
- résultats
- snippets

## Phase 6 — Performance

Optimiser :

- renders React
- textarea
- SQLite
- IPC
- startup
- mémoire
- liste virtualisée

## Phase 7 — Packaging

Créer :

- build Python
- Electron Builder
- Windows
- macOS
- Linux

## Phase 8 — Extensions

Préparer :

- IA locale
- embeddings
- recherche sémantique
- plugins
- synchronisation cloud

---

# 30. Règles de qualité du code

Le code doit être :

- strictement typé
- modulaire
- testable
- documenté lorsqu'une décision architecturale n'est pas évidente
- sans duplication inutile

TypeScript :

```text
strict: true
```

Python :

- type hints
- Pydantic
- architecture modulaire

Éviter les gros fichiers monolithiques.

Ne pas créer un "God service".

Éviter les abstractions inutiles dans la première version.

---

# 31. Règles de performance absolues

Ces règles sont prioritaires.

### INTERDIT

```text
keypress → FastAPI
keypress → SQLite
keypress → HTTP
keypress → reload React component
```

### AUTORISÉ

```text
keypress
 ↓
textarea local
 ↓
local state
 ↓
debounced persistence
```

### INTERDIT

Charger toutes les notes au démarrage.

### AUTORISÉ

Charger uniquement les métadonnées.

### INTERDIT

Recréer le textarea à chaque caractère.

### AUTORISÉ

Garder un textarea stable.

### INTERDIT

Bloquer le démarrage sur FastAPI.

### AUTORISÉ

Démarrer l'UI puis FastAPI en parallèle.

---

# 32. Definition of Done

Le projet est considéré comme terminé lorsque :

- `npm run dev` démarre toute l'application
- Electron affiche l'interface
- FastAPI démarre automatiquement
- SQLite est créé automatiquement
- une note peut être créée
- une note peut être éditée
- les modifications sont sauvegardées automatiquement
- l'application fonctionne sans Internet
- plusieurs notes peuvent être ouvertes
- les notes peuvent être recherchées
- FTS5 fonctionne
- FastAPI peut être arrêté/redémarré proprement
- aucune fonctionnalité critique ne dépend d'Internet
- le renderer n'a pas accès directement à Node
- les tests principaux passent
- le projet peut être packagé
- Python n'a pas besoin d'être installé par l'utilisateur final

---

# 33. Méthode de travail de l'agent

Ne pas générer immédiatement tout le projet en un seul énorme fichier.

Procéder par étapes :

1. analyser l'architecture
2. créer le monorepo
3. vérifier le build TypeScript
4. créer Electron
5. créer React
6. créer FastAPI
7. vérifier la communication
8. ajouter SQLite
9. ajouter l'éditeur natif
10. ajouter autosave
11. ajouter UI
12. ajouter recherche
13. ajouter tests
14. ajouter packaging
15. effectuer une passe finale de performance

Après chaque phase :

- lancer les tests pertinents
- corriger les erreurs
- vérifier les types
- ne pas continuer avec une architecture cassée

Ne jamais masquer les erreurs avec des `any`, des `try/catch` silencieux ou des hacks temporaires.

Si une décision architecturale importante doit être prise, privilégier :

1. simplicité
2. performance locale
3. robustesse
4. maintenabilité
5. extensibilité

---

# 34. Résultat attendu

À la fin, fournir :

```text
1. Projet complet fonctionnel
2. README.md
3. Instructions de développement
4. Instructions de build
5. Architecture documentée
6. Tests
7. Configuration Electron
8. Configuration FastAPI
9. SQLite + migrations
10. Éditeur natif textarea
11. Autosave
12. Recherche FTS5
13. Packaging desktop
```

Le résultat doit être une véritable application desktop locale, et non une simple démonstration technique.

La priorité absolue est :

```text
PERFORMANCE
>
FLUIDITÉ DE L'ÉDITION
>
ROBUSTESSE DES DONNÉES
>
ARCHITECTURE
>
EXTENSIBILITÉ
>
FONCTIONNALITÉS
```
