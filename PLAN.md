# Plan: TopTraining (PWA voor voetbaltrainers)

Webapp voor voetbaltrainers (JO7 t/m JO19, veld én keepers): een oefenbibliotheek met bewegende uitleg,
trainingen samenstellen en later zelf oefeningen tekenen. Statische Progressive Web App op GitHub Pages,
installeerbaar op het beginscherm, werkt op telefoon (staand), tablet en laptop en is offline te gebruiken.
Alle tekst in de app is Nederlands. De app heet **TopTraining** (sinds 0.15.0; daarvoor werknaam "TrainersApp"). De naam
staat in `src/config.ts`, het manifest in `vite.config.ts` en `index.html`. De link (/trainersapp/), de repo en de
opslagsleutels (`trainersapp.…`) blijven zo, zodat geïnstalleerde apps en gedeelde links blijven werken.

## Status (16-10-2026, versie 0.16.0)

| Fase | Status |
|---|---|
| 0. PLAN.md | ✅ af |
| 1. Basis: projectopzet, PWA, datamodel, 2 voorbeeldoefeningen, schermen, 2D-animatie | ✅ online (0.1.0), getest op de telefoon door de gebruiker |
| 1b. Installatiescherm (zoals IntervalFit) | ✅ online (0.2.0), getest op de telefoon door de gebruiker |
| 2. 3D-animaties (Three.js) | ✅ online (0.2.0), getest op de telefoon door de gebruiker |
| 3. Training maken | ✅ online (0.11.0), getest en akkoord: aantallen invullen, oefeningen kiezen (gefilterd), volgorde slepen, trainingsmodus, klaarzetten, opslaan op het apparaat, dupliceren, delen via een link |
| 4. Bibliotheek vullen (batches per categorie) | 🔄 Batch 1 (0.3.0): Warming-up + Loopcoördinatie – getest en akkoord. Batch 2 (0.4.0): Techniek + Pass en trap – getest en akkoord. Batch 3 (0.5.0): Afwerken + Positiespel – getest en akkoord. Batch 4 (0.6.0): Partijvormen + Spelletjes – getest en akkoord; alle veldcategorieën zijn gevuld. Keepers batch 1 (0.7.0): Warming-up, Bal verwerken, Laag duiken, Hoog duiken – getest en akkoord. Keepers batch 2 (0.8.0 + 0.9.0): Voorzetten, Passing, 1 op 1, Reactie, Spelletjes – getest en akkoord. Feedback (0.10.0): keepernummers als ring op het gras, 24 combinatievormen (12 veld, 12 keepers) met label "Combinatievorm", "Moeilijker" aangescherpt – getest en akkoord. Feedback 0.11.0 (0.12.0): fysieke controle van alle oefeningen, Keepersrondo en Keepersoorlog op één goal, aantallen "4+" (doorwisselbaar) of vast – **wacht op test**. |
| 5. Editor | ✅ online (0.13.0), getest en akkoord. Animatie in de editor (0.14.0) – getest en akkoord: eigen oefeningen tekenen (leeg/half/heel veld, alle objecten, lijnen met buigpunt, vastmaken aan spelers, ongedaan maken, zoomen), 3D bekijken, gegevens, in de bibliotheek en Training maken, kopiëren van ingebouwde oefeningen, delen via de trainingslink |
| 6. Instellingen + Clubkleuren | ✅ online (0.15.0) – **wacht op test**: naam TopTraining met nieuw logo, 8 clubkleuren in licht/donker/automatisch, favorieten, filterbalk, categorie-indeling nagelopen – getest en akkoord. 0.15.1: nieuw tandwiel en startscherm opnieuw ingedeeld – **wacht op test** |
| 7. Inloggen + online opslag (Firebase) + teams | ✅ online (0.16.0) – **wacht op test**: Firebase-project `toptraining-40a90` gekoppeld, account, synchronisatie, eerste keer samenvoegen, teams met code en rollen, strenge regels; live getest met twee testaccounts (daarna verwijderd) |
| 8. Later: delen met andere trainers (product) | ⏳ (animatie in de editor is in 0.14.0 gebouwd) |

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
  "doorwisselbaar": true,                // true = "2+": extra spelers sluiten aan of wisselen door; false = vast aantal
  "meerSpelers": "Met meer spelers: …",  // alleen bij een vast aantal: tip voor als je er meer hebt
  "combinatievorm": true,               // optioneel: 2–4 onderdelen achter elkaar (badge "Combinatievorm")
  "onderdelen": ["Ladder", "Vangen", "Duiken"], // alleen bij een combinatievorm: het verloop in volgorde
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
    `rebounder`, `keepersmat` (met `hoogte` vanaf 0,1 m = landingskussen), `stok`, `tekst`, `pop` (losse dummy; de bal kan
    ertegen kaatsen zoals bij een rebounder), `net` (voetvolleynet/lint tussen twee paaltjes, `breedte` = lengte van
    het net, `hoogte` standaard 1 m), `bank`, `kooi` (pannakooi: lage boarding, `breedte` × `lengte`)
  - `goal` met `breedte` en `hoogte` = jeugdgoal (bv. 5 × 2 m)
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
  `naar` mag ook een `rebounder`, `muurtje` of `bank` zijn: de bal kaatst terug naar `terug` (standaard de passeerder).
  `stuitOp: [x, y]` = de bal stuit daar eerst en gaat met een kleinere boog verder (voetvolley, voetbaltennis).
  `raakt: "lat" | "paal"` (met `naar` = punt op de doellijn) = tegen de lat of paal, de bal springt terug naar
  `terugNaar` (latje-trap); geen doelpunt, het net bolt niet uit.
  `naar` = de passeerder zelf met een `hoogte` = hooghouden (bal recht omhoog en terug aan de voet; een keeper gooit hem
  zo op en vangt hem weer).
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
- **Keepertechniek:**
  - *Bal in de handen:* een keeper houdt de bal voor de borst (tenzij hij hem daarna trapt of ermee dribbelt); een
    trainer of speler neemt de bal in de handen als hij hem daarna gooit. De tijdlijn geeft de echte balhoogte, ook in de handen.
  - *Aanspelen:* `worp: "onderhands"` (rollend met `hoogte: "grond"`, anders met een boogje), `"bovenhands"`, `"volley"`
    (uit de handen laten vallen en trappen) of `"trap"` (eerst neerleggen). Zonder `worp` rolt een keeper de bal
    onderhands weg. Vóór het loslaten haalt hij uit (worpbeweging); aan het begin van de animatie of vlak na een vang
    schuift de worp vanzelf iets op, zodat het oppakken en uithalen te zien is.
  - *Vangen:* de bal komt bij een keeper aan op `eindHoogte` (anders: door de lucht op borsthoogte, over de grond laag).
    De houding volgt uit die hoogte: ≥ 1,6 m W-greep boven het hoofd (boven ± 2,1 m in de sprong), borst, buik
    (kommetje), grond (schepvangen). Daarna gaat de bal naar de borst.
  - *Duiken:* `duik` met `hoogte` (handen bij de bal; vanaf ± 0,8 m een hoge duik: horizontaal in de lucht, afzet met het
    been aan de duikkant, landen op de zij of op een landingskussen). Makkelijkst: een pass/schot naar de keeper met
    `duikNaar: [x, y]` (en `duikHoogte`): de duik wordt dan vanzelf op de bal afgestemd.
  - *Tippen:* schot met `afloop: "tipt"` en `eindHoogte` op een keeper met `verdedigt`: centraal en hoog = over de lat
    (springen, arm gestrekt), bij de paal = om de paal (hoge duik). De bal gaat over of naast het goal (geen doelpunt).
  - *Voorzetten:* een keeper met `verdedigt` kiest zelf positie bij een bal op de flank: bij de achterlijn de eerste paal,
    van verder weg meer naar het midden en iets uit het doel. Pass/schot met `uitkomen: "<keeper>"`: de keeper schat de
    bal in, sprint naar de plek waar de bal op ± 2,5 m (`vangHoogte`) naar beneden komt, zet af op één been (knie omhoog)
    en vangt op het hoogste punt; met `stompNaar` (en `vuisten`: 1 of 2) stompt hij de bal weg. Hindernissen: `pop`,
    of een tweede keeper met `{ "type": "springen", "wie" }` (springt mee). Mag de keeper verder uitkomen dan het
    doelgebied, zet dan `uitkomen: true` op de keeper zelf.
  - *Passing:* `worp` ook `"zwaai"` (zijwaartse zwaaiworp), `"dropkick"` (halfvolley) en `"voet"` (een keeper speelt met de
    voet: een terugspeelbal neemt hij dan met de voet aan, zonder vanghouding). Doeltrap = `worp: "trap"` op een losse bal na
    een aanloop.
  - *1 op 1:* uitlopen en afremmen = `loop` (sprint) gevolgd door `voetenwerk`. Schot met `blokt: "<keeper>"` en
    `blokSoort: "ster" | "knie"` (spreidsprong/stervorm of knieblok): de bal komt tegen het lichaam en kaatst af naar
    `afloopNaar`. `{ "type": "pluk", "wie", "van"? }`: laag en zijwaarts duiken naar de bal aan de voet van `van` (of de
    dichtstbijzijnde losse bal), dwars voor de bal, en hem pakken.
  - *Reactie:* `naar` = pop, rebounder of een persoon met `terug` = de bal verandert daar van richting (`terugHoogte`); is
    `terug` een keeper en staat er `duikNaar`, dan duikt hij naar de afgeketste bal. `stuitOp` + `duikNaar` = duiken na
    een stuit. Bal met `variant: "reactiebal" | "tennisbal"` (eigen kleur en vorm). Zicht ontnomen = poppen tussen
    schutter en keeper.
  - *Keepersoorlog:* `afloop: "vangt"` met `vasthouden: true` = de keeper houdt de bal (gooit hem zelf terug).
  - *Kniezit/hurkzit:* keeper met `houding: "kniezit" | "hurkzit"` begint zo; `{ "type": "zitten", "wie", "houding" }`
    zet hem er (weer) in. Opstaan, lopen of duiken haalt hem eruit.
  - *Voetenwerk:* loopwijze `kruispas`; een keeper die `zijwaarts` of met `kruispas` gaat, blijft dezelfde kant op kijken.
  - Een keeper staat altijd licht in basishouding (door de knieën, handen voor het lijf), ook meteen na het opstaan.
    Meerdere keepers: elk nummer een eigen tint (1 standaard, 2 donkerder, 3 lichter); in 2D handschoenen.
- **Verdedigen:** `{ "type": "druk", "wie", "op"?, "afstand"? }` (naar de balbezitter tot op 1,7 m),
  `{ "type": "dek", "wie", "tussen": [a, b], "fractie"? | "afstand"? }` (passlijn dichtlopen; `a`/`b` mag ook een punt
  zijn: `tussen: ["a3", [34, 0]], "afstand": 2` = mandekking, 2 m goalside van a3). Druk en dek schuiven mee tot de
  tegenstander stilstaat, zodat een verdediger niet stilstaat waar zijn tegenstander naartoe loopt; pass met `onderschept: "<id>"`
  (verdediger loopt in de lijn en krijgt de bal), `{ "type": "verover", "wie", "van" }` (bal afpakken). Rollen ruilen met
  `team`. **Jokers:** `team: "J"` (eigen kleur, paars).
- **Overige acties:** `{ "type": "aansluiten", "wie", "rij" | "bij" }`, `{ "type": "team", "wie", "team": "C" }`
  (ander hesje, bv. tikker) en `{ "type": "schijn", "wie", "kant": "links" | "rechts" }` (schijnbeweging: lijf gaat
  opzij en terug, de bal blijft liggen) en `{ "type": "panna", "wie", "door", "verder"?, "kant"? }` (bal tussen de
  benen van `door` door, die zijn benen spreidt, en zelf om hem heen naar de bal).
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
- Teams met een code: oefeningen en trainingen delen met andere trainers (0.16.0).

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
    `localStorage` `trainersapp.browserGekozen`). Op het startscherm staat dan "TopTraining als app installeren" om terug te gaan.
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

## Besluiten fase 4 – batch 4 (Partijvormen en Spelletjes)
- 18 oefeningen. Partijvormen 9: 1 tegen 1 op twee doeltjes, 2 tegen 1 naar doel (keeper), 2 tegen 2 winnaar blijft,
  3 tegen 2 met omschakeling (keeper), 3 tegen 3 op vier doeltjes, 4 tegen 4 met keepers, 5 tegen 5 met keepers (flank
  telt dubbel), 3 tegen 3 + kaatsers (alleen scoren na een kaats), lijnvoetbal 4 tegen 4.
  Spelletjes 9: voetbaltennis 2 tegen 2, voetvolley 1 tegen 1 over het lint, latje-trap, pannavoetbal in de kooi, koning
  van het veld (doorschuiven), opruimen over de bank (JO7–9), bankjesvoetbal (JO7–9), piratenspel (JO7–9), voetgolf.
- Partijvormen tonen één kort, herkenbaar stuk spel (opbouw, aanval en doelpunt of omschakeling); de rest dekt, schuift
  of loopt vrij. Geen score in de animatie.
- 1 tegen 1, voetvolley en bankjesvoetbal liggen dwars (doelen links en rechts): zo staan de spelers in de Schuin-camera
  naast elkaar in plaats van achter elkaar.
- Aantallen (met dubbele categorieën): Warming-up 17, Techniek 17, Loopcoördinatie 11, Pass en trap 18, Afwerken 14,
  Positiespel 10, Partijvormen 14, Spelletjes 11 – totaal 73 veldoefeningen. "Keeper nodig" bij 13 oefeningen
  (9 afwerkvormen + 2 tegen 1, 3 tegen 2, 4 tegen 4 en 5 tegen 5).
- Extra test: de bal gaat altijd over het net (hoogte bij het net ≥ nethoogte + 0,1 m).

## Besluiten fase 4 – keepers batch 1 (Warming-up, Bal verwerken, Laag duiken, Hoog duiken)
- 24 nieuwe keeperoefeningen + "Laag duiken vanuit kniezit" vernieuwd (trainer gooit onderhands, keeper zit echt in
  kniezit en gaat na elke duik weer zitten). spelersNodig = 0, keepersNodig 1, 2 of 3. Bij meer keepers wisselen de
  rollen in de animatie (tweetallen en driehoek gooien naar elkaar; bij aangeven lopen de keepers van plek).
- Aantallen (met dubbele categorieën): Warming-up 7, Bal verwerken 9, Laag duiken 7, Hoog duiken 6, Reactie 1 –
  totaal 25 keeperoefeningen.
- De aangever (trainer of tweede keeper) staat bij oefeningen in het doel 1,8 m opzij, zodat hij de keeper in de
  Schuin-camera niet afdekt.
- De keepercheck (binnen het doelgebied) geldt in keeperoefeningen alleen voor de keeper met `verdedigt`: extra keepers
  mogen buiten het doel aangeven.
- Nieuw hulpscript `tools/e2e/keeper-momenten.mjs`: 3D-close-ups van worpen, duiken, vangen en tippen.

## Besluiten fase 4 – keepers batch 2 deel 1 (Voorzetten en Passing)
- 13 oefeningen. Voorzetten 6: meeschuiven met de bal (positie), uitkomen en vangen op het hoogste punt, voorzetten van
  beide kanten (3 keepers, doordraaien), wegstompen tussen poppen (1 en 2 vuisten), uitkomen met een tegenstander
  (2 keepers, wisselen), voorzetten van verschillende afstanden. Passing 7: terugspeelbal aannemen en wegspelen,
  terugspeelbal onder druk, uittrap uit de handen (volley en dropkick, 2 keepers), doeltrap naar de flank, uitworpen
  (rollen, zwaaien, bovenhands), kort of lang kiezen (3 keepers), vangen en snel uitgooien in de loop (2 keepers).
- Aantallen keepers: Warming-up 7, Laag duiken 7, Hoog duiken 6, Bal verwerken 10, Voorzetten 6, Passing 7, Reactie 1 –
  totaal 38 keeperoefeningen.
- Keepers die rouleren krijgen geen `verdedigt` (anders loopt de keeper vanzelf terug naar zijn doel); hun positie in
  het doel staat dan in de animatie.

## Besluiten fase 4 – keepers batch 2 deel 2 (1 op 1, Reactie en Spelletjes)
- 19 oefeningen. 1 op 1 (6): uitlopen en afremmen, spreidsprong, knieblok (2 keepers, wisselen), plukken, steekpass
  (2 keepers), hoek verkleinen bij een aanvaller van opzij. Reactie (7): via de pop, rebounder, tweede keeper tikt de bal
  (2 keepers), reactiebal in tweetallen, zicht ontnomen, opvolgende reddingen, reflexen van korte afstand (2 keepers).
  Spelletjes (6): keepersoorlog, keepersvolleybal, lummelen (3 keepers), valbal, duik op de losse bal (JO7–JO11), mikken in
  de hoepel (JO7–JO9).
- 1 op 1 recht van voren: startcamera "Achter goal" (keeper van achteren, aanvaller komt op hem af); in Schuin staat de
  aanvaller anders precies vóór de keeper.
- Plukken: de keeper duikt zijwaarts en ligt dwars voor de bal (niet op zijn buik naar voren).
- Aantallen keepers (met dubbele categorieën): Warming-up 9, Laag duiken 11, Hoog duiken 7, Bal verwerken 11,
  Voorzetten 6, Passing 8, 1 op 1 6, Reactie 9, Spelletjes 6 – totaal 57 keeperoefeningen.

## Besluiten fase 4 – feedback na 0.9.0 (versie 0.10.0)
- **Nummers bij keepers:** niet meer op of boven het lijf. In 3D een ring op het gras in de eigen tint van de keeper met
  een klein nummer aan de camerakant (beweegt mee, ligt onder hem bij een duik, groeit iets mee als de camera ver weg
  is). In 2D een kleine nummerbadge naast het poppetje. Bij één keeper geen nummer: de keeperskleur is genoeg.
- **Veldspelers:** nummerbadge iets kleiner (0,05) en op het scherm net bóven het hoofd verankerd (`center`), zodat hij
  ook van boven (camera Boven) het lijf niet meer afdekt.
- **Combinatievormen:** veld `combinatievorm: true` + `onderdelen` (2–4, getest). Badge "Combinatievorm" (paars) in de
  lijst en op de detailpagina; op de detailpagina het genummerde verloop. Ze staan in het bestand van hun hoofdcategorie
  en hebben meerdere categorieën. 12 veld (o.a. ladder → slalom → schot, kaats → doordiepen, derde man, aannemen/draaien →
  voorzet, 1 tegen 1 → 2 tegen 1, circuit met drie stations, rondo → uitbreken, overlap → lage voorzet, estafette) en 12
  keepers (o.a. ladder → vangen → duiken, terugspeelbal → wegspelen → schot, hoge duik → laag andere hoek, stompen →
  herstellen → 1 op 1, uitworp → terug → reactiebal, drie schoten met steeds nieuwe positie, keeperscircuit).
- 30 kale oefeningen kregen bij "Moeilijker" een concreet extra onderdeel (bv. "daarna op een klein doeltje schieten").
- Aantallen: veld 85 (Warming-up 20, Techniek 23, Loopcoördinatie 14, Pass en trap 25, Afwerken 24, Positiespel 13,
  Partijvormen 16, Spelletjes 12), keepers 69 (Warming-up 13, Laag duiken 17, Hoog duiken 11, Bal verwerken 15,
  Voorzetten 8, Passing 12, 1 op 1 10, Reactie 13, Spelletjes 6).

## Besluiten fase 3 – Training maken (versie 0.11.0)
- **Startscherm:** derde tegel "Training" met de knoppen **Training maken** en **Mijn trainingen**.
- **Routes:** `#/trainingen` (Mijn trainingen), `#/training/<id>` (bewerken), `#/training/<id>/kiezen`,
  `#/training/<id>/modus/<nr>` (trainingsmodus), `#/t/<code>` (gedeelde training).
- **Training** (`src/training/training.ts`): `{ id, naam, datum?, spelers, keepers, oefeningen: id[], gemaakt, gewijzigd }`.
  Nieuwe training: 12 spelers, 1 keeper. Naam en datum zijn optioneel ("Training 20 okt 2026" of "Training zonder naam").
- **Kiezen:** tabs Veld/Keepers, categorie-chips met aantallen, alleen oefeningen met spelersNodig ≤ spelers én
  keepersNodig ≤ keepers. Bij 0 spelers opent de tab Keepers. Toevoegen/weghalen met één knop (elke oefening één keer);
  tik op de kaart = oefening bekijken. Badge "Combinatievorm" zoals in de bibliotheek.
- **Bewerken:** volgorde slepen met een greepje (`@dnd-kit`, `touch-action: none` alleen op het greepje, zodat de
  pagina gewoon scrolt), oefening weghalen met ×. Minder spelers/keepers: oefeningen die niet meer passen krijgen een
  oranje rand en een melding, ze worden niet verwijderd.
- **Klaarzetten:** per soort materiaal het grootste aantal dat één oefening nodig heeft (de oefeningen komen na elkaar,
  materiaal gebruik je opnieuw), met de oefeningen die het gebruiken. "3–5 ballen", "8+ ballen", "Pionnen"/"1 pion" worden
  samengevoegd.
- **Trainingsmodus:** per oefening de animatie, uitleg, organisatie, benodigdheden en coachpunten; Vorige/Volgende
  onderin, of vegen over de tekst (niet over de animatie, daar draai je de 3D-camera mee). Puntjes bovenaan voor de voortgang.
- **Opslag** (`src/training/opslag.ts`): `TrainingStore` met een verwisselbare `TrainingBackend`. Nu het apparaat
  (localStorage `trainersapp.trainingen`, met versienummer; kapotte data = lege lijst). In fase 6 komt er een online
  backend bij (Firebase) met hetzelfde formaat.
- **Delen:** de link bevat de training zelf (`#/t/<code>`, base64url van compacte JSON; geen server nodig, werkt dus ook
  offline zodra de app geladen is). Deelmenu van de telefoon als dat er is, anders "Link gekopieerd". De ontvanger ziet de
  training en slaat hem op met één knop. Opent hij de link in de gewone browser (app niet geïnstalleerd), dan ziet hij de
  training met uitleg: link kopiëren en in de app openen via **Mijn trainingen → Gedeelde training openen via een link**
  (op een iPhone hebben de app en Safari elk hun eigen opslag).
- **Tests:** `tests/training.test.ts` (filter, slepen, opslaan, dupliceren, delen, benodigdheden) en
  `tools/e2e/training.mjs` (hele flow op telefoon, tablet en laptop, slepen met de vinger, vegen, delen, offline).

## Besluiten feedback na 0.11.0 (versie 0.12.0)
- **Fysieke controle** (`src/anim/fysiek.ts`, test `tests/fysiek.test.ts`, draait over alle oefeningen):
  - Een bal over de grond of laag gaat niet door of over ladders, hordes, ringen, stokken, pionnen, paaltjes, poppen,
    banken, rebounders, muurtjes, netten/linten of de boarding van een kooi. Uitzondering: materiaal waar de bal bewust
    tegenaan gaat of vanaf kaatst (eind- of beginpunt van de bal ligt er binnen 0,9 m).
  - Een hoge bal mag over lage dingen, maar niet door een net of lint en nooit via de zij- of achterkant een goal in.
  - Een bal gaat niet door een persoon die hem niet speelt of krijgt (behalve liggend, en bij een panna tussen de benen door).
  - Personen lopen niet door materiaal; door een ladder, over hordes, door ringen en over stokken alleen met een
    parcours-loopwijze (voetenwerk, hordes, sprong, huppel, kniehef, zijwaarts).
  - Aangepast door de controle (8): Knieblok bij een schot van dichtbij, Laag duiken over een horde, Ladder, borstbal en
    lage duik, Kaats en schieten van afstand, 3 tegen 3 op vier doeltjes, 4 tegen 4 met keepers, 5 tegen 5 met keepers:
    via de flank telt dubbel, Rondo 5 tegen 2 met een middenman.
- **Nieuwe keeperspellen:** Keepersrondo (3 tegen 1 in een driehoek, trainer als derde buitenspeler bij 3 keepers;
  buiten met de voet, midden met de handen; 3+ keepers) en Keepersoorlog op één goal (trainer naast het doel speelt in
  op de rij aan de zestien; aannemen of direct schieten; wisselen: schutter → doel, keeper → achter de rij; 2+ keepers).
  Totaal nu 85 veld- en 71 keeperoefeningen.
- **Aantallen:** elke oefening is `doorwisselbaar` (lijst, detail en Training maken tonen "4+ spelers" / "2+ keepers";
  bij veldoefeningen gaat het om de spelers, bij keeperoefeningen om de keepers) of heeft een vast aantal (22 oefeningen:
  partijvormen, rondo's, positiespel, voetbaltennis/voetvolley/bankjesvoetbal, keepersoorlog, keepersvolleybal). Bij een vast
  aantal staat op de detailpagina en in de trainingsmodus een tip (`meerSpelers`). Het filter in Training maken blijft
  "minimaal nodig ≤ aantal".

## Besluiten fase 5 – Editor (versie 0.13.0)
- **Startscherm:** vierde tegel "Eigen oefeningen" met **Nieuwe oefening** en **Mijn oefeningen**.
- **Routes:** `#/eigen` (lijst: bewerken, dupliceren, verwijderen), `#/eigen/nieuw` (voor veld of keepers; leeg veld met
  instelbare maat, half veld met goal, heel veld), `#/eigen/<id>/tekenen` (editor), `#/eigen/<id>/gegevens`.
  Een eigen oefening heeft id `eigen-…` en gebruikt de gewone detailpagina `#/oefening/<id>` (met knoppen Tekening,
  Gegevens, Dupliceren, Verwijderen). Onder een ingebouwde oefening: **Kopiëren naar eigen oefeningen**.
- **Datamodel:** precies het formaat van de ingebouwde oefeningen (`EigenOefening` = `Oefening` + `eigen`, `gemaakt`,
  `gewijzigd`, `bron`). Lijnen kregen `bocht` (buigpunt: vloeiende boog door dat punt) en `van`/`naar` (vast aan een
  speler; de lijn beweegt mee). Animatiestappen kunnen later in hetzelfde formaat (fase 8).
- **Editor** (`src/editor/editor.ts` = pure logica, getest; `src/screens/eigen/Tekenen.tsx` = scherm):
  - Zelfde 2D-tekenwerk als de animaties. Onderin: Kiezen, Toevoegen (paneel met plaatjes: spelers A/B, joker, keeper,
    trainer, bal, groot goal, jeugdgoal, klein goal, pion, hoedje, paaltje, stok, ladder, horde laag/hoog, ring, bank,
    pop, rebounder, net, lint, keepersmat, landingskussen, vak/zone, tekst), Pass-, Loop- en Dribbellijn.
  - Plaatsen: item kiezen, dan elke tik op het veld zet er één neer (snel 6 pionnen), tot je op × tikt.
  - Gekozen object: slepen; draaihandvat (stappen van 15°; bij personen = kijkrichting); maathandvat bij vak, ladder,
    stok, net/lint, bank, mat; balk met naam, nummer −/+, kleur (vak), tekst, draai 45°, kopiëren, verwijderen.
    Spelers en keepers krijgen automatisch het volgende nummer (per team).
  - Een bal binnen 0,8 m van een speler hoort bij die speler (gaat mee); verder weg slepen = los.
  - Lijn: sleep over het veld; begint/eindigt hij op een speler, dan zit hij daaraan vast. Handvatten: begin, eind,
    buigpunt (ruitje). Een vastgemaakt eind pak je niet als handvat (dan pak je de speler).
  - Aanraakmarge ± 22 px (vinger), dus kleine dingen zijn makkelijk te pakken. Eén vinger op een leeg stuk = schuiven,
    twee vingers = zoomen, muiswiel = zoomen, kompasknop = heel veld in beeld. De pagina schuift niet mee
    (`touch-action: none`, editor vast in beeld).
  - Ongedaan maken/opnieuw (ook Ctrl+Z / Ctrl+Y; Delete = verwijderen); slepen is één stap.
  - Kubusknop: bekijken in 3D (stilstaand, draaien, camerastanden) of 2D. Getekende lijnen staan ook in 3D.
  - Opslaan gaat vanzelf. Bij een half/heel veld wordt de uitsnede automatisch rond de tekening gezet.
- **Kopie van een ingebouwde oefening:** houdt de animatie zolang je niets verschuift (toevoegen mag). Verschuif, draai of
  verwijder je iets, dan eerst de vraag "Animatie laten vervallen?"; bij ja staat iedereen op zijn beginplek (ook spelers
  in een rij) en is het een tekening zonder animatie.
- **Gegevens:** naam en minstens één categorie verplicht (de rest wordt ook zonder bewaard, maar de oefening komt pas dan in
  de bibliotheek). Veld of keepers + meerdere categorieën, uitleg, organisatie, benodigdheden (voorstel uit de tekening,
  bv. "4 pionnen, 1 loopladder, 1 bal, Hesjes"; overnemen per regel of alles), spelers/keepers nodig (voorstel uit de
  tekening), doorwisselbaar of vast (met tip), coachpunten, makkelijker, moeilijker (één per regel).
- **Bibliotheek en Training maken:** eigen oefeningen met naam en categorie staan in hun categorieën met de badge "Eigen" en
  zijn kiesbaar in Training maken (zelfde filter).
- **Opslag:** `src/eigen/opslag.ts` (`EigenStore` met verwisselbare backend; nu localStorage `trainersapp.eigen` met
  versienummer, later online/teams).
- **Delen:** zit er een eigen oefening in een training, dan gaat die in zijn geheel mee in de deellink (`e` in de code,
  getallen afgerond). De ontvanger ziet hem meteen; bij opslaan komt hij in zijn eigen oefeningen (zelfde inhoud wordt
  hergebruikt, zelfde id met andere inhoud krijgt een nieuwe id).
- **Tests:** `tests/editor.test.ts` (tekenen, nummers, slepen/draaien/maat, bal bij speler, lijnen vast/buigen, ongedaan
  maken, benodigdheden, uitsnede, opslaan, kopiëren/bevriezen, delen en importeren) en `tools/e2e/editor.mjs`
  (telefoon/tablet met de vinger incl. twee vingers zoomen, laptop met de muis; gegevens, bibliotheek, delen naar een
  ander toestel, kopie met animatie).

## Besluiten animatie in de editor (versie 0.14.0)
- **Uitgangspunt:** de getekende lijnen zijn de animatie. Elke lijn heeft een stapnummer (`Lijn.stap`), zichtbaar als
  rondje op 30% van de lijn. Nieuwe lijnen krijgen het volgende nummer. Lijnen met hetzelfde nummer gebeuren tegelijk.
  Tik op een lijn (of het nummer) → balk met Stap −/+, soort lijn, **Opties**.
- **Omzetten** (`src/editor/animatie.ts`, `lijnenNaarAnimatie`): lijnen → gewone animatiestappen voor de bestaande
  tijdlijn (geen tweede animatielogica). Looplijn = `loop` (via tussenpunten bij een bocht; over ladder/horde/ring
  vanzelf voetenwerk/hordes/huppel), dribbellijn = `dribbel`, ballijn naar een speler = `pass` (ontvanger loopt de bal
  0,8 m tegemoet), naar een goal = `schot` (ook als de lijn aan de keeper vastzit), naar rebounder/pop/bank/muurtje =
  kaatsen terug, naar een leeg stuk = bal rolt daarheen (wie daar in dezelfde stap heen loopt: pass in de loop).
  Zelfde nummer: doorspelen in één keer (`direct`). Bal-bezit wordt bijgehouden: een ballijn of dribbel bij een speler
  zonder bal doet niet mee (rood nummer + melding). De opgeslagen oefening bevat alleen de tekening; afspelen gebeurt via
  `afspeelTekening` in `AnimatieSpeler` en `Miniatuur` (dus overal: bibliotheek, training, trainingsmodus, link).
- **Keepers:** een keeper binnen 9 m van een goal verdedigt dat goal (positie kiezen, vangen/duiken/te laat op een
  schot); dribbelt er iemand richting dat goal, dan mag hij uitkomen. Afloop van een schot: goal, keeper vangt
  (standaard met keeper), keeper duikt (schot naar de hoek), naast.
- **Opties per lijn:** looplijn: normaal, sprint, zijwaarts, achteruit; ballijn: grond/halfhoog/hoog (schot: over de
  grond/laag/hoog) en bij een schot de afloop; wachten vóór de stap (0,5/1/2 s); herhalen voor de rij (hele oefening).
- **Herhalen voor de rij** (`Tekening.herhaalRij`): spelers van hetzelfde team zonder eigen lijnen, binnen 3 m achter
  de eerste speler, vormen een rij. Het patroon wordt een `herhaal` met `@`, daarna `aansluiten`. Had de eerste
  speler een bal, dan krijgt iedereen in de rij er een.
- **Afspelen in de editor:** afspeelknop (▶) in de kop opent de gewone speler (2D/3D, camera, snelheid, schuifbalk,
  herhalen); tekenen kan dan niet; "Terug naar tekenen".
- **Meldingen** (`lijnMeldingen`): wat niet kan (rood) en de fysieke check uit 0.12.0 (oranje: bal door een speler of
  laag over materiaal, door een ladder lopen), op de lijn waar het gebeurt. Opslaan wordt nooit geblokkeerd.
- **Kopieën:** `animatieNaarLijnen` zet de animatie van een kopie om naar lijnen met stapnummers als het kan (gewone
  stappen met lopen, dribbelen, passen, schieten; nu 28 ingebouwde oefeningen). Anders (keeperacties zoals duiken naar
  een punt, druk/dek, rijen) een melding met de reden en werkt het zoals in 0.13.0 (animatie vervalt na een vraag).
  Lijnen uit 0.13.0 zonder nummer krijgen bij openen nummers op volgorde.
- **Klein:** Keepersrondo ook in Keepers → Warming-up; leeg veld op een telefoon standaard staand (20 × 30 m), op tablet
  en laptop liggend; lange naam in de editorkop op twee regels; half/heel veld begint met het goal (of beide goals).
  Met een lijngereedschap pak je alleen het buigpunt van de vorige lijn (begin/eind met Kiezen), zodat je vanaf het eind
  van een lijn meteen verder kunt tekenen.
- **Tests:** `tests/animatie.test.ts` (omzetten, stapnummers en tegelijk, pass-regels, kaats, schot/keeper, rebounder,
  diepe bal, parcours, bocht, wachten, herhalen voor de rij, waarschuwingen, kopieën) en `tools/e2e/editor.mjs`
  (pass, dribbel, lopen en schot tekenen, nummers wijzigen, opties, melding, afspelen 2D/3D op telefoon/tablet/laptop,
  opslaan, bibliotheek, delen, kopie met lijnen).

## Besluiten versie 0.15.0 – naam, clubkleuren, favorieten en filters, categorie-indeling
- **Naam:** TopTraining (app, startscherm, installatiescherm, paginatitel, manifest `name`/`short_name`, documentatie).
  Niet veranderd: repo, link `/trainersapp/`, manifest `id`/`start_url`/`scope` en opslagsleutels `trainersapp.…`
  (anders werken geïnstalleerde apps en gedeelde links niet meer). `tools/e2e/update.mjs <oude-build>` test de update van
  een geïnstalleerde app (melding, bijwerken, gegevens blijven, offline).
- **Logo/app-icoon** (`public/logo.svg`, de build maakt alle iconen): grote witte T met een bal eronder op een gestreept
  grasveld. Gekozen uit vier varianten (T + bal, pijl omhoog + bal, goal, T met gele streep): de T blijft ook op 16–24 px
  herkenbaar; zonder lettertype, dus overal hetzelfde.
- **Instellingen** (`#/instellingen`, tandwiel op het startscherm): "Clubkleuren" met 8 tegels met voorbeeld (Groen
  standaard, Rood-wit, Blauw-wit, Geel-zwart, Groen-wit fris, Oranje, Paars, Zwart-goud) en Weergave Licht / Donker /
  Automatisch (volgt de telefoon, schakelt mee). Thema's staan in `src/engine/thema.ts` (per thema licht én donker) en
  worden vóór de eerste weergave als CSS-variabelen gezet (geen kleurflits). Het veld en de teamkleuren (thema.css)
  veranderen nooit. Nieuwe variabelen: `--primair-tekst` (themakleur als tekst), `--op-accent`, `--op-makkelijker`,
  `--op-moeilijker`, `--op-combi`, `--eigen(-licht)`, `--waarschuwing(-licht)`, `--fout(-licht)`. Een test controleert
  het contrast (WCAG ≥ 4,5 voor tekst, ≥ 7 voor gewone tekst) in alle 16 combinaties. Keuze: localStorage
  `trainersapp.thema`.
- **Favorieten:** hartje op elke kaart (lijst, Training maken) en op de detailpagina, voor ingebouwde en eigen oefeningen.
  `src/engine/favorieten.ts` (`FavorietenStore` met verwisselbare backend, nu localStorage `trainersapp.favorieten`).
- **Filterbalk** (`src/components/Filters.tsx`, logica `src/engine/filters.ts`) op Categorieën, Oefenlijst en Training maken →
  kiezen: zoeken op naam (zonder hoofdletters/accenten, alle woorden), "Alleen wat past bij mijn aantal" (spelers/keepers,
  zelfde regel als Training maken; onthouden in `trainersapp.filterAantallen`), Favorieten, Combinatievormen, Eigen.
  Op de telefoon ingeklapt (knop "Filters" met aantal), op een laptop open. Toont het aantal oefeningen en "Filters wissen";
  categorieën tonen de aantallen volgens de filters; niets gevonden → melding met knop. Bij Training maken gelden de
  aantallen van de training. De filters (behalve aantallen) gelden zolang de app open is.
- **Categorie-indeling** nagelopen met de richtlijnen (Afwerken = wedstrijdecht scoren op doel; Warming-up = laagdrempelig;
  Partijvormen = twee partijen met een doel; Positiespel = balbezit/rondo's; Spelletjes = spelelement voorop; maximaal
  drie categorieën). Test: precies één hoofdcategorie (= bestand), maximaal drie, geen dubbele. Aangepast (22, wacht op
  correcties van de gebruiker):
  - Veld – Snelle schutter op kleine doeltjes – afwerken, spelletjes → spelletjes, techniek (nieuwe hoofdcategorie)
  - Veld – Overlap op de flank, lage voorzet en afronden – afwerken, pass-en-trap, positiespel → afwerken, pass-en-trap
  - Veld – Coördinatie-estafette – loopcoordinatie, warming-up → loopcoordinatie, warming-up, spelletjes
  - Veld – Hordes, sprint naar de bal en 1 tegen 1 – loopcoordinatie, partijvormen, warming-up → loopcoordinatie, partijvormen
  - Veld – 5 tegen 5 met keepers: via de flank telt dubbel – partijvormen, afwerken → partijvormen
  - Veld – Poortjesspel in tweetallen – pass-en-trap → pass-en-trap, spelletjes
  - Veld – Pionnen omschieten – pass-en-trap, spelletjes → spelletjes, pass-en-trap (nieuwe hoofdcategorie)
  - Veld – Driehoek, derde man en afronden – pass-en-trap, afwerken, positiespel → pass-en-trap, afwerken
  - Veld – Overtal 3 tegen 2 naar doelpoortjes – positiespel, partijvormen → partijvormen, positiespel (nieuwe hoofdcategorie)
  - Veld – Latje-trap – spelletjes, afwerken → spelletjes, techniek
  - Veld – Piratenspel – spelletjes, techniek → spelletjes, techniek, warming-up
  - Veld – Estafette: slalom, pass en schot – spelletjes, warming-up, afwerken → spelletjes, warming-up, techniek
  - Veld – Koning van het vak – techniek, warming-up → techniek, warming-up, spelletjes
  - Veld – Tikkertje met hesje – warming-up → warming-up, spelletjes
  - Veld – Schatrovers – warming-up → warming-up, spelletjes
  - Veld – Overlopertje – warming-up → warming-up, spelletjes
  - Veld – Circuit: hordes, slalom en rebounder – warming-up, loopcoordinatie, techniek, pass-en-trap → warming-up, loopcoordinatie, pass-en-trap
  - Keepers – Hordes, hoge bal en hoge duik – hoog-duiken, warming-up, bal-verwerken → hoog-duiken, bal-verwerken
  - Keepers – Keepersvolleybal over het net – spelletjes → spelletjes, warming-up
  - Keepers – Keepersrondo – spelletjes, passing, laag-duiken, warming-up → spelletjes, passing, warming-up
  - Keepers – Werpen en vangen in de driehoek – warming-up → warming-up, passing
  - Keepers – Keeperscircuit: ladder, hordes en duiken – warming-up, laag-duiken, hoog-duiken → laag-duiken, hoog-duiken (nieuwe hoofdcategorie)
- **Tests:** `tests/filters.test.ts` (filters en combinaties, favorieten, aantallen onthouden, thema's en contrast),
  categorie-test in `tests/oefeningen.test.ts`; browsertests `tools/e2e/thema.mjs`, `filters.mjs`, `update.mjs`.

## Besluiten versie 0.15.1 – startscherm en tandwiel
- **Tandwiel:** nieuw icoon, uitgerekend (8 gelijke tanden, rond gat), strak op elk formaat (16–96 px) en in elk thema.
- **Startscherm:** zonder de tekst "Oefenbibliotheek …". Volgorde: Training (Training maken, Mijn trainingen), daaronder Veld en
  Keepers naast elkaar, daaronder Eigen oefeningen. Telefoon staand: Veld/Keepers als smalle tegels met het plaatje boven,
  Training/Eigen zonder plaatje (knoppen naast elkaar). Telefoon liggend: twee kolommen (Training | Eigen, Veld | Keepers)
  en een lage kop. Tablet/laptop: ruimer (grotere plaatjes en titels). Alles past in beeld op iPhone SE (ook liggend),
  iPhone 14, Android en 320 px; `tools/e2e/start.mjs` controleert dat op 9 formaten in 4 thema's.

## Besluiten versie 0.16.0 – inloggen, online opslag en teams (fase 7)
- **Zonder account blijft alles werken** zoals voorheen (alles op het apparaat). Het online deel staat in een apart,
  lui geladen stuk (`src/online/`, ~130 kB gz) dat pas laadt als je ingelogd bent of het accountscherm opent.
- **Firebase** (Auth + Firestore). Webconfig in `src/online/config.ts` (`FIREBASE_CONFIG`; openbaar bedoeld, geen geheimen).
  Zolang die `null` is, zie je in de app geen account/teams (Instellingen toont het blok niet).
- **Inloggen met e-mail + wachtwoord**, met "Wachtwoord vergeten?" (mail met link; de link opent in de browser).
  **Geen Google-inlog:** op GitHub Pages werkt de redirect-inlog niet betrouwbaar (andere domeinnaam dan de inlogpagina,
  opslagscheiding in Safari) en een pop-up werkt niet betrouwbaar in de geïnstalleerde iPhone-app. Kan later als de app
  een eigen domein krijgt.
- **Accountscherm** (Instellingen → Account): inloggen, account maken (naam zien je teamgenoten), uitloggen, account
  verwijderen (wachtwoord ter controle; verwijdert al je online gegevens, je teamitems, verlaat je teams en heft een team
  op als je de enige bent).
- **Eerste keer inloggen op een apparaat** met eigen spullen: vraag "Gegevens van dit apparaat meenemen?" (met aantallen).
  Ja = samenvoegen met het account (zelfde id: de nieuwste wint; niets gaat verloren). Nee = ze blijven op het apparaat
  en zijn er weer na uitloggen. Per account onthouden (`trainersapp.gekoppeld.<uid>`).
- **Opslag per account:** ingelogd gebruiken de bestaande stores (trainingen, eigen oefeningen, favorieten) eigen sleutels
  `trainersapp.u.<uid>.…`; uitgelogd weer de gewone `trainersapp.…`. Schermen merken daar niets van.
- **Synchronisatie** (`src/online/sync.ts`): de lokale opslag blijft de bron (werkt offline); Firestore-cache met
  IndexedDB. Samenvoegen in drie richtingen met "laatst gesynchroniseerd" (`src/online/samenvoegen.ts`), zodat ook
  wijzigingen die je offline deed en waarna je de app sloot meegaan; verwijderen gaat mee, tenzij de andere kant het
  intussen wijzigde. Favorieten per oefening; instellingen (thema, licht/donker, aantallen): de nieuwste wint.
- **Syncstatus onopvallend:** wolkje in de kop van het startscherm (stip als nog niet alles online staat of offline),
  regel "Alles staat online ✓" / "Nog niet alles staat online" / "Offline: …" bij Account en in Instellingen.
- **Teams** (Instellingen → Teams): team maken (jij = beheerder), joinen met een code van 6 tekens (zonder 0/O/1/I),
  meerdere teams. Teampagina: code (delen/kopiëren; beheerder: nieuwe code), gedeelde oefeningen en trainingen, leden.
  Beheerders: leden verwijderen, beheerder maken/lid maken, nieuwe code, items van anderen verwijderen, team opheffen.
  Leden: eigen items wijzigen/intrekken, team verlaten (de laatste beheerder die vertrekt maakt het langst zittende lid
  beheerder).
- **Delen met team:** knop bij een eigen oefening en bij een training. Een gedeelde training neemt je eigen oefeningen
  erin mee. Wijzig je een gedeelde eigen oefening, dan wordt het teamexemplaar vanzelf bijgewerkt.
- **Teamoefeningen in de bibliotheek** met een badge met de teamnaam (ook vindbaar met zoeken/filters); bekijken,
  gebruiken in Training maken, kopiëren naar eigen oefeningen. Gedeelde training: bekijken en "Kopiëren naar mijn
  trainingen". Teamdelen alleen ingelogd; anders uitleg + knop Inloggen.
- **Firestore-model:** `users/{uid}` (naam, e-mail, teams, favorieten, instellingen), `users/{uid}/oefeningen|trainingen`,
  `teams/{id}` (naam, code, maker), `teams/{id}/leden/{uid}` (rol, naam), `teams/{id}/items/{id}`, `teamCodes/{code}`.
- **Regels** (`firestore.rules`): alleen je eigen gebruikersdata; teams alleen voor leden; joinen alleen met de juiste
  code; rollen alleen door beheerders; items maken/wijzigen alleen door de eigenaar, verwijderen door eigenaar of beheerder;
  velden en codevorm worden gecontroleerd. Getest met de emulator.
- **Tests:** `npm run test:online` (Firebase-emulator; Java 21 in `C:\Users\woutv\tools\java`): regels (6), sync
  (5: twee toestellen, offline en daarna online, app dicht, eerste keer samenvoegen, accounts gescheiden; komt tot rust),
  teams (4); `tests/samenvoegen.test.ts`. Browsertest `tools/e2e/online.mjs` (telefoon/tablet/laptop, twee testaccounts
  test1@example.com / test2@example.com, "Testtrainer 1/2"; alles wordt na afloop gewist). Alleen nep-adressen en neutrale
  namen gebruiken.

### Firebase-project (gekoppeld)
- Project **TopTraining**, ID `toptraining-40a90` (alias `live` in `.firebaserc`; `default` blijft `demo-toptraining` voor de
  emulator). E-mail/wachtwoord aan, domein woutvb073.github.io toegestaan (gebruiker, in de console).
- Firestore-database `(default)` in **eur3**, native modus, aangemaakt via de CLI (in de console was per ongeluk een
  Realtime Database gemaakt; die wordt niet gebruikt en mag weg). Cloud Firestore-API via de CLI aangezet.
- Regels online zetten: `npm run regels:live` (`firebase deploy --project live --only firestore:rules`). Plakken in de
  console gaf "Line 1: Parse error"; via de CLI compileert het bestand zonder fouten.
- Web-app "TopTraining" geregistreerd; de (openbare) webconfig staat in `src/online/config.ts`. Geen geheimen in de repo;
  de CLI-inlog staat alleen op de computer van de gebruiker.
- Bij de live test bleek: account verwijderen op een nieuw apparaat liet teams en codes achter (de lokale teamlijst was
  nog leeg). Opgelost: verwijderen leest je teams van de server, haalt je gedeelde items weg en verlaat elk team; de
  laatste die een team verlaat heft het helemaal op (code, leden, items). Emulatortest erbij.
- Live test: `ECHT=1 node tools/e2e/online.mjs` (tegen het echte project, met test1/test2@example.com; ruimt vooraf en na
  afloop op en controleert dat de accounts weg zijn). Los opruimen: `node tools/e2e/online-opruimen.mjs`.

## Open vragen (later beslissen)
- Definitieve naam en logo van de app.
- Leeftijdsindicatie per oefening (bv. "JO7–JO11") als filter?
- Duur per oefening (minuten) voor de trainingsplanning in fase 3?
