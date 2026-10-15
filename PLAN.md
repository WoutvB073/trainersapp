# Plan: TrainersApp (PWA voor voetbaltrainers)

Webapp voor voetbaltrainers (JO7 t/m JO19, veld én keepers): een oefenbibliotheek met bewegende uitleg,
trainingen samenstellen en later zelf oefeningen tekenen. Statische Progressive Web App op GitHub Pages,
installeerbaar op het beginscherm, werkt op telefoon (staand), tablet en laptop en is offline te gebruiken.
Alle tekst in de app is Nederlands. "TrainersApp" is een werknaam; de naam staat op één plek
(`src/config.ts` + manifest in `vite.config.ts`).

## Status (15-10-2026)

| Fase | Status |
|---|---|
| 0. PLAN.md | ✅ af |
| 1. Basis: projectopzet, PWA, datamodel, 2 voorbeeldoefeningen, schermen, 2D-animatie | ✅ gebouwd, lokaal getest (5 formaten + offline). **Wacht op**: GitHub-repo + online zetten, test op de telefoon |
| 2. 3D-animaties (Three.js) | ⏳ |
| 3. Training maken | ⏳ |
| 4. Bibliotheek vullen (batches per categorie) | ⏳ (doorlopend vanaf fase 2/3) |
| 5. Editor | ⏳ |
| 6. Instellingen + Clubkleuren | ⏳ |
| 7. Inloggen + online opslag (Firebase) | ⏳ |
| 8. Later: animatie in de editor, delen met andere trainers (product) | ⏳ |

## Werkwijze
- Bouwen in **kleine stappen**; na elke stap test de gebruiker op de telefoon en wachten we op akkoord.
- Per stap: bouwen → zelf testen (unit-tests + browser op telefoon- en laptopformaat) → (commit + push) →
  korte uitleg, online link en testlijst.
- Keuzes die gebruik of uitstraling raken en niet in dit plan staan: **eerst vragen**.
- Dit plan wordt bij elke fase bijgewerkt (status + genomen besluiten).

## Visie (volledig)

### 1. Oefenbibliotheek, gescheiden in Veld en Keepers
- **Veld-categorieën:** Warming-up, Techniek, Loopcoördinatie, Pass en trap, Afwerken, Positiespel,
  Partijvormen (1v1, 2v2, overtal uitspelen enz.), Spelletjes (bv. voetvolley).
- **Keeper-categorieën:** Warming-up, Laag duiken, Hoog duiken, Bal verwerken (lage, hoge ballen, met stuit),
  Voorzetten, Passing, 1 op 1, Reactie, Spelletjes (bv. keepersoorlog).
- Een oefening kan **meerdere categorieën** hebben.
- Elke oefening heeft: naam, korte uitleg, benodigdheden, `spelersNodig`, `keepersNodig`,
  coachpunten/aandachtspunten, variaties via de knoppen **Makkelijker** en **Moeilijker**, en een animatie.
- Veldoefeningen met `keepersNodig > 0` tonen het label **"Keeper nodig"**.
  Keepersoefeningen mogen extra keepers inzetten als inschieter/aangooier.

### 2. Training maken
- Eerst aantal **spelers** en **keepers** invullen.
- Daarna alleen oefeningen tonen waarvoor geldt: `spelersNodig ≤ aantal spelers` én
  `keepersNodig ≤ aantal keepers` (minder nodig is altijd prima).
- Oefeningen toevoegen, volgorde slepen, opslaan, hergebruiken, delen via een link.

### 3. Animaties
- **3D-veld met Three.js**: swipen om rond te draaien, inzoomen; knoppen **Bovenaanzicht / Schuin / Achter goal**.
- Spelers als simpele gekleurde poppetjes met nummer: twee teamkleuren, keeper eigen kleur, trainer eigen kleur.
- Bal en spelers bewegen echt; lijnen blijven als **spoor** zichtbaar.
- Lijnsoorten: **ballijn** (pass/schot, doorgetrokken), **looplijn** (stippel), **dribbellijn** (golf).
- Bediening: afspelen/pauze, herhalen, snelheid.
- Fase 1 speelt dezelfde data af in **2D bovenaanzicht**; 3D volgt in fase 2.

### 4. Editor (latere fase)
- Veld kiezen: leeg grasvlak, half veld met goal, heel veld.
- In 2D bovenaanzicht objecten plaatsen: groot goal, klein goal, pion, hoedje, paaltje, ladder, horde, ring,
  bal, spelers team A/B (+ extra hesjeskleur), keeper, trainer, zone/vak, muurtje, rebounder, keepersmat,
  stokken, tekstlabel.
- Lijnen tekenen (de drie lijnsoorten).
- Ingebouwde oefeningen kopiëren en aanpassen. Ook in 3D bekijken.
- Animatie maken in de editor komt later (fase 8).

### 5. Inloggen en online opslag (Firebase)
- Eigen oefeningen en trainingen op alle apparaten.
- Later uitbreidbaar naar delen met andere trainers (mogelijk een product).

### 6. Instellingen
- Kopje **"Clubkleuren"**: meerdere kleurthema's om uit te kiezen (bepalen ook team-/keeper-/trainerkleuren).

### 7. Offline
- Bekijken van oefeningen en trainingen werkt zonder internet (alles in de offline-cache van de service worker).

## Datamodel (belangrijk)

Ingebouwde oefeningen, gekopieerde oefeningen en editor-tekeningen gebruiken **precies hetzelfde JSON-formaat**.
Eén renderer speelt dit af, in 2D (fase 1) en 3D (fase 2). Types: `src/model/types.ts`.

### Bestanden
- Eén databestand per (hoofd)categorie: `src/data/oefeningen/veld/<categorie>.json` en
  `src/data/oefeningen/keepers/<categorie>.json`. Elk bestand is een lijst oefeningen.
- De **eerste** categorie van een oefening = de bestandsnaam (hoofdcategorie); extra categorieën mogen.
- Nieuwe batch toevoegen = oefeningen in het juiste bestand zetten (of nieuw bestand); de app pakt alle
  bestanden automatisch op (`import.meta.glob`). `npm test` controleert alle oefeningen.

### Oefening
```jsonc
{
  "id": "veld-kaatsen-en-afwerken",      // uniek, nooit hergebruiken
  "soort": "veld",                       // "veld" | "keeper"
  "naam": "Kaatsen en afwerken",
  "categorieen": ["afwerken", "pass-en-trap"],
  "uitleg": "Korte uitleg …",
  "benodigdheden": ["1 goal", "4 pionnen", "Ballen"],
  "spelersNodig": 2,                     // veldspelers (minimaal)
  "keepersNodig": 1,
  "coachpunten": ["…"],
  "variaties": { "makkelijker": ["…"], "moeilijker": ["…"] },
  "tekening": { … }                      // zie hieronder
}
```

### Tekening (veld + objecten + lijnen + animatie)
- **Coördinaten in meters.** `x` = breedte (links → rechts), `y` = lengte (boven → onder in bovenaanzicht).
  Bij half/heel veld staat het (eerste) goal bovenaan op `y = 0`, midden op `x = breedte / 2`.
- `veld`: `{ "type": "leeg" | "half" | "heel", "breedte": 68, "lengte": 52.5 }` (maten optioneel; standaard
  leeg 30×20, half 68×52,5, heel 68×105).
- `weergave` (optioneel): uitsnede `{ x, y, breedte, lengte }` in meters, zodat bv. alleen het strafschopgebied
  in beeld is. Standaard het hele veld.
- `objecten`: lijst met `{ id, soort, x, y, … }`:
  - `speler` (+ `team`: `"A" | "B" | "C"` (C = extra hesjeskleur), `nummer`), `keeper` (+ `nummer`), `trainer`
  - `bal` (+ optioneel `bij`: id van wie de bal aan het begin heeft)
  - `goal` (groot), `klein-goal`, `pion`, `hoedje`, `paaltje`, `ladder`, `horde`, `ring`, `zone`, `muurtje`,
    `rebounder`, `keepersmat`, `stok`, `tekst`
  - optioneel: `hoek` (graden; bij goals 0 = opening naar beneden), `breedte`/`lengte` (zone, ladder, muurtje,
    mat), `tekst`, `kijkrichting` (graden).
- `lijnen`: vaste lijnen (editor-tekeningen): `{ "soort": "bal" | "loop" | "dribbel", "punten": [[x, y], …] }`.
- `animatie`: lijst **stappen**; acties binnen een stap lopen tegelijk:
  ```jsonc
  { "acties": [
      { "type": "pass", "van": "a1", "naar": "a2" },          // bal van wie naar wie (of naar [x, y])
      { "type": "loop", "wie": "a1", "naar": [28, 19] },      // looplijn (stippel)
      { "type": "dribbel", "wie": "a1", "naar": [31, 14] },   // dribbellijn (golf), bal gaat mee
      { "type": "schot", "van": "a1", "naar": [31.5, -0.5] }, // ballijn (doorgetrokken)
      { "type": "duik", "wie": "k1", "naar": [31.8, 0.9] },   // keeper duikt (ligt tot de volgende beweging)
      { "type": "opstaan", "wie": "k1" },
      { "type": "pak", "wie": "a2" }                           // pakt de dichtstbijzijnde losse bal
  ], "duur": 1.2 }                                             // duur optioneel (anders uit afstand/snelheid)
  ```
  Per actie optioneel: `start` (s na begin van de stap), `duur` (s), `hoog: true` (bal door de lucht), `bal`
  (welke bal, standaard de bal van de passeerder). Bal "naar een speler" komt aan waar die speler op dat moment is.
- De tijdlijn (`src/anim/timeline.ts`) rekent dit om naar posities per tijdstip + sporen; de 2D-renderer
  (`src/anim/render2d.ts`) tekent dat. De 3D-renderer gebruikt straks dezelfde tijdlijn.

## Techniek

| Onderdeel | Keuze |
|---|---|
| Basis | Vite + React + TypeScript (strict), net als eerdere apps |
| PWA | vite-plugin-pwa (Workbox), alles precachen → volledig offline; update via melding "Bijwerken" |
| Iconen | @vite-pwa/assets-generator vanuit `public/logo.svg` |
| Navigatie | Eigen mini hash-router (`#/…`) |
| Animatie 2D | Canvas, eigen tijdlijn (puur rekenwerk, unit-getest) |
| Animatie 3D (fase 2) | Three.js, zelfde tijdlijn |
| Opslag (fase 3) | localStorage met versienummer; vanaf fase 7 Firebase (Auth + Firestore) met offline cache |
| Slepen (fase 3) | `@dnd-kit/sortable` |
| Delen (fase 3) | `lz-string` in de link |
| Tests | Vitest (tijdlijn, datacontrole) + browsertest op telefoon- en laptopformaat |
| Hosting | GitHub Pages via GitHub Actions (push naar `main` = online) |

## Fasering

### Fase 1 – Basis (nu)
- Projectopzet, PWA (installeerbaar, offline), deploy-instructies voor GitHub Pages.
- Datamodel + 2 voorbeeldoefeningen (1 veld, 1 keeper) met werkende animatie.
- Startscherm met keuze Veld / Keepers → categorielijst → oefenlijst → detailpagina.
- Animatie in 2D bovenaanzicht met afspelen/pauze, opnieuw, herhalen en snelheid.
- Werkt goed op telefoon (staand) én groter scherm.

### Fase 2 – 3D-animaties
- Three.js-veld (gras, lijnen, goals, pionnen), poppetjes met nummer, bal; zelfde tijdlijn als 2D.
- Swipen = draaien, knijpen = zoomen; knoppen Bovenaanzicht / Schuin / Achter goal.
- Keuze 2D/3D op de detailpagina (2D blijft handig voor kleine schermen / trage toestellen).

### Fase 3 – Training maken
- Spelers/keepers invullen → gefilterde bibliotheek → toevoegen, slepen, opslaan (lokaal), hergebruiken,
  delen via link (ook offline te bekijken).

### Fase 4 – Bibliotheek vullen
- Batches oefeningen per categorie (veld + keepers), elk met animatie, coachpunten en variaties.

### Fase 5 – Editor
- Veld kiezen, objecten plaatsen/verslepen/draaien, lijnen tekenen, ingebouwde oefening kopiëren en aanpassen,
  bekijken in 2D/3D. Opslaan in hetzelfde formaat.

### Fase 6 – Instellingen + Clubkleuren
- Kleurthema's (CSS-variabelen staan vanaf fase 1 klaar: `data-theme` op `<html>`), ook voor team-/keeperkleuren.

### Fase 7 – Inloggen + online opslag (Firebase)
- Inloggen, eigen oefeningen en trainingen synchroniseren tussen apparaten; offline blijven werken.

### Fase 8 – Later
- Animatie maken in de editor; delen met andere trainers; eventueel product.

## Besluiten fase 1
- Zelfde opzet als eerdere apps (Vite + React + TS, vite-plugin-pwa, GitHub Actions). Repository-voorstel: `WoutvB073/trainersapp`.
- Routes: `#/` → `#/veld` | `#/keepers` → `#/veld/<categorie>` (of `alle`) → `#/oefening/<id>`. Lege categorieën tonen "Nog leeg".
- Animatiespeler: start automatisch (niet bij "verminder beweging"), tik op het veld = pauze/afspelen,
  knoppen Opnieuw / Afspelen-Pauze / Herhalen (aan/uit, standaard aan) / snelheid 0,5×–2×, schuifbalk om door te spoelen.
- Kleuren: team A rood, team B blauw, extra hesje geel, keeper turquoise, trainer donkergrijs ("T"); ballijn wit,
  looplijn geel gestippeld, dribbellijn wit golvend; legenda onder de animatie.
- Oefenlijst: kaart met stilstaand plaatje (eindstand met alle lijnen), korte uitleg, labels spelers/keepers/"Keeper nodig".
- Telefoon: animatie van rand tot rand; vanaf 900 px breed: animatie links (blijft staan), tekst rechts.

## Open vragen (later beslissen)
- Definitieve naam en logo van de app.
- Leeftijdsindicatie per oefening (bv. "JO7–JO11") als filter?
- Duur per oefening (minuten) voor de trainingsplanning in fase 3?
