# Plan: TrainersApp (PWA voor voetbaltrainers)

Webapp voor voetbaltrainers (JO7 t/m JO19, veld én keepers): een oefenbibliotheek met bewegende uitleg,
trainingen samenstellen en later zelf oefeningen tekenen. Statische Progressive Web App op GitHub Pages,
installeerbaar op het beginscherm, werkt op telefoon (staand), tablet en laptop en is offline te gebruiken.
Alle tekst in de app is Nederlands. "TrainersApp" is een werknaam; de naam staat op één plek
(`src/config.ts` + manifest in `vite.config.ts`).

## Status (15-10-2026, versie 0.5.0)

| Fase | Status |
|---|---|
| 0. PLAN.md | ✅ af |
| 1. Basis: projectopzet, PWA, datamodel, 2 voorbeeldoefeningen, schermen, 2D-animatie | ✅ online (0.1.0), getest op de telefoon door de gebruiker |
| 1b. Installatiescherm (zoals IntervalFit) | ✅ online (0.2.0), getest op de telefoon door de gebruiker |
| 2. 3D-animaties (Three.js) | ✅ online (0.2.0), getest op de telefoon door de gebruiker |
| 3. Training maken | ⏳ |
| 4. Bibliotheek vullen (batches per categorie) | 🔄 Batch 1 (0.3.0): Warming-up + Loopcoördinatie – getest en akkoord. Batch 2 (0.4.0): Techniek + Pass en trap – getest en akkoord. Batch 3 (0.5.0): Afwerken (9) + Positiespel (9) – **wacht op test** op de telefoon. Volgende batches: Partijvormen, Spelletjes, Keepers |
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
  "organisatie": "Vakgrootte, afstanden, waar staan de spelers …",
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
  - optioneel: `hoek` (graden; bij goals 0 = opening naar beneden; ladder/horde/stok met `hoek: 90` liggen dwars
    op een baan langs x), `breedte`/`lengte` (zone, ladder (standaard 4 m), muurtje, mat, stok), `hoogte` (horde:
    laag 0,15 / hoog 0,3 m; paaltje), `kleur` (zone wordt een doorzichtig gekleurd vlak; ook hoedje, pion, ring),
    `tekst`, `kijkrichting` (graden).
- `camera` (optioneel): beginstand van de 3D-camera, `"boven"`, `"schuin"` (standaard) of `"achter"`.
- `rijen` (optioneel): wachtende spelers `{ id, x, y, richting, afstand?, spelers: [...] }`. Plek 0 (voorste) op x, y; de
  rij loopt in `richting` naar achteren, `afstand` standaard 1,6 m. Wie vertrekt, laat de rest automatisch
  doorschuiven; `aansluiten` zet iemand achteraan (buitenom, zonder door de rij of baan te lopen). De posities van
  rijspelers volgen uit de rij.
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
  (welke bal, standaard de bal van de passeerder), `hoogte` (zie hieronder). Bal "naar een speler" komt aan waar die
  speler op dat moment is. Wie nog op de bal wacht, passt of dribbelt pas als hij hem heeft.
  Pass naar iemand die loopt (pass in de loop): de bal komt vóór zijn voet aan, in zijn looprichting.
  `naar` mag ook een `rebounder` of `muurtje` zijn: de bal kaatst terug naar `terug` (standaard de passeerder).
  `naar` = de passeerder zelf met een `hoogte` = hooghouden (bal recht omhoog en terug aan de voet).
  Met `bal` kun je ook de bal van een ander wegtikken (bv. "Koning van het vak").
- **Balsnelheid** volgt uit de afstand: korte pass ± 9 m/s, lange grondpass tot 18 m/s, schot 14–25 m/s; een bal
  door de lucht duurt minstens zo lang als de boog natuurkundig nodig heeft (lange bal van 30 m ± 2,4 s).
- **Bewegen** (`loop`/`dribbel`): `via` (tussenpunten, bv. slalom/zigzag), `om` + `kant` + `straal` (draai om een
  pion), `manier` (loopwijze: `jog` standaard, `sprint`, `wandel`, `huppel`, `kniehef`, `sprong`, `zijwaarts`,
  `achteruit`, `voetenwerk`, `hordes`), `kijk` (vaste kijkrichting, bv. zijwaarts met de neus naar de trainer),
  `spoor: false` (geen lijn). Bij `voetenwerk`, `hordes`, `kniehef` en `sprong` toont het spoor losse pasjes en
  zie je de pasjes ook aan het poppetje (2D: voetjes, 3D: benen/veren).
- **Keeper die meebeweegt:** keeper met `verdedigt: "<goal-id>"` staat vanzelf tussen bal en midden van het goal
  (1–2,6 m uit zijn doel, iets vertraagd), kijkt naar de bal en zet zich vlak voor een schot. Na een duik staat hij vanzelf
  op. `uitkomen: true` = hij mag buiten het doelgebied (1 tegen keeper) en blijft na een actie even staan.
- **Schot met afloop** (`afloop`, met `naar` = punt waar het schot heen gaat): `goal` (keeper duikt maar is te laat; bal
  blijft in het net liggen en het net bolt uit), `vangt` (bal in de handen, keeper rolt hem daarna weg, `afloopNaar`),
  `stompt` (bal wordt weggestompt naar `afloopNaar` en ligt los: rebound), `naast`. Een liggende keeper reageert niet meer.
- **Schotsoorten:** `hoogte: "grond"` = plaatsen/laag, `snelheid` (m/s) = hard schot, `direct: true` = in één keer
  (volley, kopbal, doorspelen), `eindHoogte` = hoogte waarop de bal aankomt (volley ± 0,6 m, kopbal ± 2 m; de speler
  springt bij een kopbal).
- **Verdedigen:** `{ "type": "druk", "wie", "op"?, "afstand"? }` (naar de balbezitter tot op 1,7 m),
  `{ "type": "dek", "wie", "tussen": [a, b], "fractie"? }` (passlijn dichtlopen), pass met `onderschept: "<id>"`
  (verdediger loopt in de lijn en krijgt de bal), `{ "type": "verover", "wie", "van" }` (bal afpakken). Rollen ruilen met
  `team`. **Jokers:** `team: "J"` (eigen kleur, paars).
- **Overige acties:** `{ "type": "aansluiten", "wie", "rij" | "bij" }`, `{ "type": "team", "wie", "team": "C" }`
  (ander hesje, bv. tikker) en `{ "type": "schijn", "wie", "kant": "links" | "rechts" }` (schijnbeweging: lijf gaat
  opzij en terug, de bal blijft liggen).
- **Bal aan de voet:** 40 cm voor de speler; bij dribbelen gaat hij bij elke aanraking iets verder voor de voet uit.
  Bij elke nieuwe kijkrichting draait de speler in 0,3 s (de bal draait om hem heen mee, springt niet). Een ontvanger
  draait zich al naar de bal terwijl die onderweg is.
- **Herhalen:** `{ "herhaal": { "spelers": [...], "stappen": [...], "tussen"?: s, "rondes"?: n, "waarden"?: {...} } }` –
  iedere speler doorloopt dezelfde stappen (`@` = die speler, `@volgende`/`@vorige` = buren in de lijst,
  `@<naam>` = waarde uit `waarden`, bv. per speler een andere loopwijze). Met `tussen` overlappen de spelers.
- **Tegelijk:** `{ "tegelijk": [[...stappen team A...], [...stappen team B...]] }` – reeksen naast elkaar (estafette).
- **Balhoogte** (optioneel per pass/schot, `hoogte`): `"grond"` (rolt over het gras; standaard bij een pass),
  `"laag"` (boog tot ± 1 m; standaard bij een schot, ook voor worpen), `"halfhoog"` (± 2,5 m), `"hoog"` (lob/voorzet,
  hoogte volgt uit de afstand, max. 7 m) of een getal (hoogste punt in meters). Het oude `hoog: true` blijft werken
  (= `"hoog"`). Bestaande oefeningen zonder `hoogte` werken dus gewoon.
- De tijdlijn (`src/anim/timeline.ts`) rekent dit om naar posities per tijdstip + sporen; de 2D-renderer
  (`src/anim/render2d.ts`) en de 3D-renderer (`src/anim/render3d.ts`) tekenen allebei uit diezelfde stand.
  De stand bevat ook: wie de bal heeft, de vlucht (van wie naar wie, voortgang, hoogte), hoe ver een keeper
  ligt (`liggen` 0–1), loopwijze, snelheid en pasfase, en het team (hesje).

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
- Zelfde opzet als eerdere apps (Vite + React + TS, vite-plugin-pwa, GitHub Actions). Openbare repository `WoutvB073/trainersapp`, GitHub Pages via GitHub Actions.
- Routes: `#/` → `#/veld` | `#/keepers` → `#/veld/<categorie>` (of `alle`) → `#/oefening/<id>`. Lege categorieën tonen "Nog leeg".
- Animatiespeler: start automatisch (niet bij "verminder beweging"), tik op het veld = pauze/afspelen,
  knoppen Opnieuw / Afspelen-Pauze / Herhalen (aan/uit, standaard aan) / snelheid 0,5×–2×, schuifbalk om door te spoelen.
- Kleuren: team A rood, team B blauw, extra hesje geel, keeper turquoise, trainer donkergrijs ("T"); ballijn wit,
  looplijn geel gestippeld, dribbellijn wit golvend; legenda onder de animatie.
- Oefenlijst: kaart met stilstaand plaatje (eindstand met alle lijnen), korte uitleg, labels spelers/keepers/"Keeper nodig".
- Telefoon: animatie van rand tot rand; vanaf 900 px breed: animatie links (blijft staan), tekst rechts.

## Besluiten fase 1b – Installatiescherm
- Werkt zoals bij IntervalFit: `kiesScherm` (`src/engine/platform.ts`, getest) beslist.
  - Geïnstalleerd (beginscherm/app-venster, `display-mode: standalone` of `navigator.standalone`): altijd de app.
  - Telefoon/tablet in een gewone browser: **alleen** het installatiescherm.
  - Computer in de browser: installatie-uitleg + knop **Gewoon in de browser gebruiken** (onthouden in
    `localStorage` `trainersapp.browserGekozen`). Op het startscherm staat dan "TrainersApp als app installeren" om terug te gaan.
- Uitleg per toestel (`src/screens/installeren/stappen.tsx`): iPhone/iPad Safari (deelknop → Zet op beginscherm; Safari 26:
  ••• → Deel → Zet op beginscherm → Open als webapp), iPhone met andere browser (kopieer link → open in Safari),
  ingebouwde browsers (WhatsApp e.d.: openen in Safari/Chrome), Android Chrome (knop **Installeren** via de
  installatieprompt, anders ⋮ → App installeren), andere Android-browsers (menu of via Chrome), computer Chrome/Edge
  (icoon in de adresbalk of knop Installeren), Safari op de Mac (Archief → Voeg toe aan Dock), Firefox (kan niet; Chrome/Edge of browser).
- Wijzende pijl "Begin hier" naar de knop in de browserbalk (iPhone onder, iPad/Android boven).

## Besluiten fase 2 – 3D
- Three.js (r181) in een eigen bestand (`render3d`, ± 145 kB gzip) dat pas op de detailpagina laadt; staat wel in de
  offline-cache. Eén tijdlijn voor 2D en 3D: `AnimatieSpeler` (bediening) + `Weergave` (2D of 3D, `src/anim/weergave.ts`).
- Detailpagina: **3D standaard**, knop 3D/2D rechtsboven in het beeld (keuze geldt zolang de app open is).
  Cameraknoppen linksboven: **Boven**, **Schuin** (standaard, ± 60°), **Achter goal**; vloeiende overgang (0,75 s).
- Draaien (vegen/slepen) en zoomen (knijpen/scrollen) met OrbitControls: niet onder het gras (max. ± 78° vanaf boven),
  niet verder dan 2,2× de afstand van het bovenaanzicht, niet schuiven. Eerste keer een korte uitleg ("Veeg om te draaien …").
- Tikken = pauze/afspelen, maar niet na slepen (> 8 px beweging).
- Gras + lijnen + platte materialen (zone, ladder, mat, stok, ring) als textuur, getekend met dezelfde code als 2D.
  Goals met net, pionnen, hoedjes, paaltjes, hordes, muurtje, rebounder en tekst als 3D-vormen.
- Poppetjes: shirt in team-/keeper-/trainerkleur, rugnummer op het shirt + nummerbadge boven het hoofd (altijd even groot
  op het scherm, ook leesbaar van boven). Lopen met zwaaiende armen/benen; kijkrichting draait vloeiend.
- Duiken: het lijf kantelt naar de duikkant tot op de grond, armen gestrekt naar de bal; opstaan gaat geleidelijk terug.
  Keeper houdt een gevangen bal voor de borst.
- Bal: rolt (draait mee) bij grondpasses; boog bij schoten/worpen/hoge ballen; schaduw op het gras.
- Sporen liggen als platte linten op het gras (pass doorgetrokken, lopen gestreept, dribbel golvend), een hoge bal als boog;
  ze groeien mee met de beweging; pijlpunt aan het eind.
- Terugvallen op 2D: als WebGL niet start of wegvalt, of als het toestel te traag is (mediaan > 45 ms per beeld tijdens de
  eerste ± 70 beelden). Te traag wordt onthouden (`trainersapp.3dTraag`); zelf op 3D tikken probeert het opnieuw.
- Gemeten (laptop met Intel UHD, telefoonformaat 412×915 @ 2,6×): ± 56 beelden/s, ook met 4× tragere processor.
- Oefenlijst blijft 2D-plaatjes; de editor (fase 5) wordt 2D.

## Besluiten fase 4 – batch 1 (Warming-up en Loopcoördinatie)
- 18 oefeningen: Warming-up 9 (+ 3 loopcoördinatievormen die ook warming-up zijn = 12 in de lijst), Loopcoördinatie 9
  (+ 2 warming-upvormen = 11). spelersNodig wisselt van 1 tot 6.
- Nieuw veld `organisatie` (verplicht voor alle oefeningen; getoond als eigen blok op de detailpagina).
- Startcamera per oefening: Boven bij vakspelen (tikspelen, rondo, schatrovers, spiegelen), anders Schuin.
  Schuin past nu altijd de hele breedte in beeld (lange banen). Het 3D-beeld is iets lager bij lange smalle opstellingen.
- Rijen: 1,6 m tussen wachtende spelers (in 2D raken de poppetjes elkaar anders); terugkomende spelers lopen op 1,7 m
  langs de rij; doorschuiven begint 0,6 s nadat de voorste vertrekt.
- Automatische controle (`npm test`): in elke animatie blijven personen ≥ 1,5 m van elkaar en ≥ 0,5 m van pionnen,
  paaltjes en hoedjes (ladders, hordes, ringen en stokken mag je wél door/over).
- Screenshots per oefening: `node tools/e2e/oefeningen.mjs` (3D op 35% en 65%, 2D op 65%; controleert ook de
  aantallen per categorie en het label "Keeper nodig").
- 3D: ladder, horde (laag/hoog), ring en stok zijn nu echte 3D-vormen (liggen op het gras); zone/vak in een kleur.
- Bugfix: wisselen naar 2D gaf ten onrechte de melding "3D viel weg".

## Besluiten fase 4 – batch 2 (Techniek en Pass en trap)
- 18 oefeningen: Techniek 9 (balgevoel, aannemen en meenemen, kappen en draaien, schijnbeweging, poortjesdribbel,
  hooghouden, aannemen uit de lucht, indraaien, koning van het vak) en Pass en trap 9 (driehoek, derde man, Y-vorm,
  rebounder, pass in de loop, lange bal, poortjesspel, pionnen omschieten, vierhoek met twee ballen).
- Aantallen in de lijst (met dubbele categorieën): Warming-up 16, Techniek 11, Loopcoördinatie 11, Pass en trap 14,
  Afwerken 1, Positiespel 1, Spelletjes 1 – totaal 37 veldoefeningen.
- Extra test: een bal wisselt nooit van speler zonder pass of schot (in elke oefening, elke 0,02 s gecontroleerd).
- Pass-en-volg in een vorm (driehoek, rijen): de volgorde van passeerders moet rond kloppen (`@volgende` is cyclisch);
  bij de driehoek met 4 spelers is dat a1-a2-a3-a4 met `rondes: 2`.

## Besluiten fase 4 – batch 3 (Afwerken en Positiespel)
- 18 oefeningen. Afwerken 9 (dribbel door de poort, pass in de loop, voorzet laag en hoog, rebound, 1 tegen keeper,
  achtervolger, kaats en afstandsschot, duel 1 tegen 1 (twee teams), snelle schutter op kleine doeltjes zonder keeper).
  Positiespel 9 (rondo 3:1, 4:2, 5:2 met middenman, 4:4+2 jokers, 5:5+2 jokers met inspelen door de trainer, eindzonespel,
  overtal 3:2 naar doelpoortjes, omschakelen tussen twee vakken, door de linies).
- "Kaatsen en afwerken" gebruikt nu ook de meebewegende keeper.
- Aantallen (met dubbele categorieën): Warming-up 17, Techniek 12, Loopcoördinatie 11, Pass en trap 15, Afwerken 10,
  Positiespel 10, Partijvormen 3, Spelletjes 2 – totaal 55 veldoefeningen. "Keeper nodig" bij de 9 afwerkvormen met keeper.
- Extra test: een keeper komt nooit buiten zijn doelgebied (5,5 × 18,32 m, met een halve meter speling), behalve met
  `uitkomen`.
- Gekleurde zones: volle rand in de kleur zelf (de vulling mengt met het gras, rood oogt anders bruin).

## Open vragen (later beslissen)
- Definitieve naam en logo van de app.
- Leeftijdsindicatie per oefening (bv. "JO7–JO11") als filter?
- Duur per oefening (minuten) voor de trainingsplanning in fase 3?
