# Plan: TopTraining (PWA voor voetbaltrainers)

Webapp voor voetbaltrainers (JO7 t/m JO19, veld én keepers): een oefenbibliotheek met bewegende uitleg,
trainingen samenstellen en later zelf oefeningen tekenen. Statische Progressive Web App op GitHub Pages,
installeerbaar op het beginscherm, werkt op telefoon (staand), tablet en laptop en is offline te gebruiken.
Alle tekst in de app is Nederlands. De app heet **TopTraining** (sinds 0.15.0; daarvoor werknaam "TrainersApp"). De naam
staat in `src/config.ts`, het manifest in `vite.config.ts` en `index.html`. De link (/trainersapp/), de repo en de
opslagsleutels (`trainersapp.…`) blijven zo, zodat geïnstalleerde apps en gedeelde links blijven werken.

## Status (28-10-2026, versie 0.29.0)

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
| 9. Verbeteringen en training genereren (0.17.0) | ✅ online – **wacht op test**: 4+1 standaard, datumveld, geen lege trainingen, Training genereren, looplijnen uit (knop), doelnet in de editor, "Spelers" met illustraties, geen Combinatievorm-badge, exporteren/importeren |
| 10. Wedstrijd: opstelling, tactiekbord, spelhervattingen (0.18.0) | ✅ online – **wacht op test**: tegel Wedstrijd, opstellingen (4/6/8/11 tegen …, formaties, namen slepen, wissels), tactiekbord (editor + 2D/3D, vanuit een opstelling, lijnen wissen), spelhervattingen (8 beginsituaties, 3 voorbeelden), opslaan/dupliceren/link/team, sync via het account |
| 11. Fixes, opruimen, categorieën, tactiekbord (0.19.0) | ✅ online – **wacht op test** |
| 12. Nieuwe oefeningen: 13 keepers, 8 spelers (0.20.0) | ✅ online, getest en akkoord |
| 13. Kleine aanpassingen (0.20.1) | ✅ online – **wacht op test**: Grondoefeningen samengevoegd (met echt grond tikken), oplopend overtal op kleine goaltjes, Laag duiken bij Midden/voorzet/schot |
| 14. Realistischere 3D-animaties (0.21.0) | ✅ online, getest en akkoord |
| 15. Opruimen, aanpassen en eigen keeperoefeningen (0.22.0, deel A) | ✅ online, getest en akkoord |
| 16. Rest deel A (A3.5, A4) + deel B: 30 nieuwe keeperoefeningen (0.23.0) | ✅ online, getest en akkoord |
| 17. Deel C: 26 nieuwe keeperoefeningen (0.24.0) | ✅ online, getest en akkoord (D0-correctie in 0.25.0) |
| 18. Deel D: D0 stuitbal stompen, Help, Engels (0.25.0) | ✅ online, getest en akkoord |
| 19. Engelse woordkeus: Games en wide block (0.25.1) | ✅ online, getest en akkoord |
| 20. Deel A: categorie Verdedigen en omschakelen, 20 spelersoefeningen (0.26.0) | ✅ online, getest en akkoord |
| 21. Deel B: 15 spelersoefeningen (verdedigen en omschakelen, partijvormen, spelletjes), verdedigende houding (0.27.0) | ✅ online, getest en akkoord |
| 22. Deel C: voorbeeldtactieken op het tactiekbord, 17 tactieken / 25 borden (0.28.0) | ✅ online, getest en akkoord |
| 23. Deel D: ingestudeerde spelhervattingen, 20 hervattingen / 27 borden (0.29.0) | ✅ online – **wacht op test** |
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
| Animatie 3D (fase 2) | Three.js, zelfde tijdlijn; poppetjes in code met gewrichten + IK, InstancedMesh (0.21.0) |
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
  Partijvormen = twee partijen met een doel; Positiespel = balbezit/rondo's; Spelletjes = spelelement voorop; (tot 0.19.0) maximaal
  drie categorieën). Test: precies één hoofdcategorie (= bestand), geen dubbele (sinds 0.19.0 geen maximum van drie meer). Aangepast (22, wacht op
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

## Besluiten versie 0.17.0 – verbeteringen en training genereren
- **Training maken:** standaard 4 spelers en 1 keeper. Datumveld even breed als het naamveld (iOS: `appearance: none`).
  Een training zonder oefeningen, naam en datum is "leeg" (aantallen tellen niet mee) en wordt opgeruimd zodra je de
  training verlaat (`trainingen.ruimLegeOp` bij elke schermwissel, in `App.tsx`); oude lege trainingen ook.
- **Training genereren** (`#/training/:id/genereren`, logica `src/training/genereren.ts`): aantallen, onderdelen aantikken
  (categorieën van Spelers en Keepers) in volgorde, verslepen, Genereren. Per onderdeel één oefening die past; score =
  toeval + favoriet (+1,5) − recent gebruikt (laatste training −4, daarvoor −2, −1,3) − vaste oefening voor veel minder
  spelers dan je hebt (−0,8); nooit dubbel. Bewaard in de training (`generator`: onderdelen + keuzes), zodat "Andere
  oefening" (ook in Training bewerken, wissel-icoon) en "Alles opnieuw genereren" werken. Geen passende oefening: melding
  bij dat onderdeel. Het resultaat is een gewone training.
- **Looplijnen** in de animatie standaard uit; knop (lijn-icoon) naast Herhalen, keuze onthouden
  (`trainersapp.looplijnen`). Pass- en dribbellijnen blijven; plaatjes (Miniatuur) tonen alle lijnen.
- **Doelnet** (editor, `src/anim/doelnet.ts`): object "Doelnet" bij Doelen; hangt in het dichtstbijzijnde goal zonder net en
  volgt het (verschuiven/draaien); geel doek met 4 ronde gaten in de hoeken, in 2D (band op de doellijn) en 3D. Schot op
  een goal met doelnet: hoogte van de lijn kiest de rij gaten (Over de grond/Laag = onder, Hoog = boven); eindigt de lijn
  in een hoek (buitenste ± 1,4 m) dan door het gat het goal in, anders kaatst de bal terug richting de schutter
  (`raakt: 'net'`, 3–7 m). De editor toont bij zo'n schot de uitkomst. Ingebouwde oefeningen ongewijzigd.
- **Spelers** i.p.v. Veld overal in beeld (`SOORT_NAAM`); routes blijven `#/veld` (links blijven werken). Getekende
  illustraties (`src/components/Illustraties.tsx`): twee spelertjes met bal, keepershandschoenen die een bal vangen.
- **Combinatievorm:** badge en filter weg; de oefeningen en het genummerde verloop blijven.
- **Exporteren/importeren** (Instellingen → Je gegevens, `src/engine/exporteren.ts`): JSON-bestand
  `toptraining-JJJJ-MM-DD.json` met eigen oefeningen, trainingen en favorieten. Telefoon/tablet: deelmenu, computer:
  downloaden. Importeren voegt samen: zelfde inhoud (ook met een andere id) wordt overgeslagen, zelfde id met andere
  inhoud komt erbij met een nieuwe id (trainingen wijzen dan naar de nieuwe id).
- **Tests:** `tests/deel-a.test.ts`; browsertest `tools/e2e/deel-a.mjs` (telefoon/tablet/laptop, blad `blad-deel-a.png`).

## Besluiten versie 0.18.0 – wedstrijd: opstelling, tactiekbord en spelhervattingen
- **Startscherm:** tegel "Wedstrijd" (getekend tactiekbordje). Telefoon staand: lage tegel onderaan; liggend: naast
  Spelers en Keepers; tablet/laptop: naast Eigen oefeningen. Op een lage telefoon (iPhone SE) valt de ondertitel weg
  en worden de plaatjes iets lager, zodat alles in beeld blijft (`tools/e2e/start.mjs`).
- **Overzicht** `#/wedstrijd`: Opstellingen, Tactiekborden, Spelhervattingen (nieuw, openen, dupliceren, verwijderen) en een
  gedeelde link openen.
- **Opstelling** (`src/wedstrijd/wedstrijd.ts`, scherm `src/screens/wedstrijd/`): spelvormen 4 tegen 4 (zonder keeper),
  6, 8 en 11 tegen 11 met KNVB-veldmaten; formaties 4v4: 1-2-1, 2-2 · 6v6: 1-2-1-2, 1-3-2, 1-2-2-1 · 8v8: 1-3-3-1,
  1-2-3-2, 1-3-2-2 · 11v11: 1-4-3-3, 1-4-4-2, 1-3-4-3, 1-4-2-3-1. Rugnummers per positie (keeper 1, dan van achter naar
  voren). Eigen SVG-veld waarvan de lijnen meeschalen. Slepen met vinger of muis (pointer events): wissel → positie, ruilen,
  naar de bank, lege positie vrij verslepen; tikken-en-tikken kan ook; toetsenbord (Enter). Namen toevoegen (onthouden in
  `trainersapp.spelersnamen`), "Wissels op de lege posities zetten", andere formatie/spelvorm houdt de volgorde.
- **Tactiekbord** = een gewone tekening, getekend in **dezelfde editor** (`Editor` met een `EditorBron`) en afgespeeld met
  dezelfde `AnimatieSpeler` (2D/3D) – geen tweede animatielogica. Nieuw: heel/half veld, of vanuit een opstelling (eigen
  spelers op hun plek op een heel veld, tegenstander in dezelfde spelvorm verdeeld over zijn helft, bal op de middenstip).
  Knop "Lijnen wissen" (gum) in de editor en op het bord; de spelers blijven staan.
- **Spelhervattingen** (`src/wedstrijd/hervattingen.ts`): corner links/rechts, vrije trap 18/25/30 m (muurtje van 4 op
  9,15 m), inworp, doeltrap/uittrap, aftrap (heel veld); voorbeelden met lijnen: corner op de eerste paal, korte corner,
  vrije trap via een kaats (getest: spelen af zonder meldingen, eindigen in het goal, geen fysieke fouten).
- **Opslaan en delen:** `src/wedstrijd/opslag.ts` (per account, zoals de andere stores); ingelogd synchroniseren ze mee
  (`users/{uid}/opstellingen|borden`). Delen via een link `#/w/<code>` (opslaan bij mijn wedstrijd) en met een team
  (items van soort `opstelling`/`bord`, bekijken en kopiëren). Firestore-regels daarvoor uitgebreid en live gezet.
- **Tests:** `tests/deel-b.test.ts`, online `tests/online` (sync en teamdelen van wedstrijd), browsertest
  `tools/e2e/deel-b.mjs` (blad `blad-deel-b.png`) en `tools/e2e/online.mjs` (opstelling delen in het team).

## Besluiten versie 0.19.0 – fixes, opruimen, categorieën en tactiekbord
- **Bug "pagina bestaat niet" bij Training genereren:** het opruimen van lege trainingen stond op twee plekken; de
  tweede (de geïnstalleerde app) kende het genereren-scherm niet en haalde de training weg als je vanuit een training op
  "Training genereren" tikte. Nu één plek (`openTraining(route)` in `router.ts`, gebruikt in `App.tsx`). Een training
  zonder naam die oefeningen krijgt (genereren of kiezen) heet automatisch "Training 17 okt" (`metNaam`). Tests erbij.
- **Aantallenfilter** onthoudt de laatst gebruikte aantallen (`trainersapp.filterAantallenLaatst`), ook na uitzetten.
- **Tactiekbord:** nieuw bord = spelvorm + formatie van jouw team + formatie van de tegenstander → beide teams volledig
  opgesteld (elk in de eigen helft, zoals bij de aftrap; bal op de middenstip; camera van boven). Leeg bord (heel/half)
  en vanuit een opstelling blijven. Het veld heeft de maat van de spelvorm (20×30, 30×42,5, 42,5×64, 68×105) met
  meegeschaalde lijnen (`lijnMaten` in render2d, ook in 3D) en passende doelen (4v4 kleine doeltjes, 6v6/8v8 jeugdgoals).
  Rugnummers altijd; "Namen tonen" op het bord; in de editor kun je per speler een naam invullen (vanuit een opstelling
  staan de namen er al in). Namen in 2D (pilletje onder het poppetje) en 3D (label onder de voeten).
- **Opgeruimd:** 23 ingebouwde oefeningen uit de bibliotheek (lijst hieronder). Ze staan in `src/data/oefeningen/archief.json`:
  niet meer in lijsten, kiezen of genereren, maar trainingen, deellinks, teamtrainingen en favorieten tonen ze nog (label en
  melding "Niet meer in de bibliotheek", met de hele inhoud en animatie; kopiëren naar eigen oefeningen kan nog).
  Spelers: 1 tegen keeper · Bankjesvoetbal · Opruimen: ballen over de bank · Derde man in de driehoek · Diepe pass in de
  loop · Kaatsen en afwerken · Op de rebound · Snelle schutter op kleine doeltjes. Keepers: Hoog duiken op het kussen
  vanuit kniezit · Afzet en landing: hoog duiken vanuit stand (beide met landingskussen) · Afgeketst via de pop ·
  Balgewenning: opgooien, stuit en schepvangen · Hoge bal naar de hoek: rouleren met twee keepers · Hoge ballen vangen in
  de sprong · Kommetje: ballen op buikhoogte · Kruispas en vangen naast het lichaam · Kruispassen en hoog duiken naar de
  hoek · Kruispassen, vangen en zwaaiworp · Lummelen voor keepers · Mikken in de hoepel · Tippen om de paal · Uitlopen en
  afremmen · Vangen in tweetallen: drie hoogtes.
- **Categorieën:** geen maximum van drie meer (regel en test weg); zo min mogelijk. Nieuwe regel (getest): spelers-oefeningen
  zonder bal horen bij Loopcoördinatie, niet bij Spelletjes of Techniek. De opgegeven indeling is precies zo gezet (test).
  Kleurenreactie in tweetallen gesplitst: zonder bal (Loopcoördinatie) en nieuw "Kleurenreactie met bal" (Techniek,
  Spelletjes). De regel "zonder bal" veranderde verder niets.
- **Tests:** `tests/versie-019.test.ts` (verwijderd, categorieën), uitbreiding `tests/deel-a.test.ts` (bug, naam),
  `tests/filters.test.ts` (aantallen), `tests/deel-b.test.ts` (borden per spelvorm); browsertest `tools/e2e/versie-019.mjs`
  (blad `blad-019.png`).

## Besluiten versie 0.20.0 – nieuwe oefeningen
- Gebouwd met `tools/nieuw/keepers-020.cjs` en `tools/nieuw/spelers-020.cjs` (zet of vervangt op id in het bestand van de
  eerste categorie; `tools/nieuw/hulp.cjs`). Close-ups: `tools/e2e/nieuw.mjs <ids> [blad]`.
- **Keepers:** Hordes zijwaarts en hoge duik · Vier kleuren en bal verwerken · Vier kleuren en bal voor de stuit · Pass naast
  het doel en kort schot · Bal van achter de keeper · Midden, voorzet en schot andere kant · Inspelen, draaien of kaatsen ·
  Vijf keuzes van de keeperstrainer · Zijwaartse ladder en dubbele duik · Terugspeelbal en hoge bal claimen · Drie
  schutters met nummers · Voorzet claimen, uitgooien en terug · Grondoefeningen: Zittend: grond tikken en vangen, Zittend
  vangen op drie hoogtes, Zittend met opgetrokken knieën. Bij meerdere keepers is het doorwisselen te zien (getest).
- **Nieuwe houding:** keeper op de billen (`houding: 'zit'` met gestrekte benen, `'zit-opgetrokken'`) in tijdlijn en 3D.
- **Spelers:** 1 tegen 1 door de poortjes · Wippen en 1 tegen 1 · Oplopend overtal: 1v1, 2v1, 3v2, 3v3 · 2 tegen 1 met
  inhalende verdediger · Rondo 4 tegen 2 met uitbraak · Golven: 1v1, 2v1, 3v2 · Kaatsen met verdediger in de rug ·
  Positiespel 3 tegen 3 + 3 naar de spits.
- Alle nieuwe oefeningen slagen voor afstand, balbezit, keeper-in-doelgebied en de fysieke controle; per oefening
  3D-screenshots op vier momenten en 2D bekeken. Test: `tests/versie-020.test.ts`.

## Besluiten versie 0.20.1 – kleine aanpassingen
- **Grondoefeningen** (`keeper-wu-grondoefeningen`, Warming-up): één oefening met drie varianten na elkaar – grond tikken
  en vangen, verschillende hoogtes, knieën opgetrokken. Nieuwe actie `grondtik` (handen achter je naar het gras, ook in
  de tijdlijn als `tik`), en van de ene zithouding naar de andere zonder op te staan (`zitVorig`/`zitMix`). De drie
  losse oefeningen staan in het archief (`tools/nieuw/archiveer.cjs`). Keeper en trainer staan naast elkaar, zodat de
  startcamera de keeper van opzij ziet.
- **Oplopend overtal**: op twee kleine goaltjes (12 m uit elkaar) in plaats van een jeugdgoal.
- **Midden, voorzet en schot andere kant**: + Laag duiken.

## Besluiten versie 0.21.0 – realistischere 3D-animaties
- **Aanpak (B1): eigen figuur in code** (`src/anim/poppetje.ts`), géén los 3D-model, dus ook geen licentie nodig.
  - Gekozen (a): echte verhoudingen (± 1,76 m, benen ± 54% van de lengte, smalle taille, bredere schouders, normaal
    hoofd met haar), gewrichten heup/knie/enkel, schouder/elleboog/pols, nek/hoofd. Voeten krijgen een doelplek en de
    benen buigen daar met inverse kinematica (IK) naartoe: een steunende voet staat stil op het gras (geen schuivende
    voeten), knieën en ellebogen buigen alleen de goede kant op. Handen gaan met IK naar de bal (vasthouden, vangen,
    duiken, gooien). Shirt in hesjeskleur, donkere broek, kousen in een donkere tint van het hesje, schoenen; keeper
    lange mouwen + lichte handschoenen; trainer in trainingspak. Haar- en huidkleur verschillen per persoon (vast per id).
  - Afgewezen (b): vrije modellen met skelet (bv. Quaternius of Kenney, CC0) hebben alleen algemene animaties (staan,
    lopen, rennen), geen keepersduiken, trappen, vangen of loopscholing. Die bewegingen moeten we dus toch zelf op het
    skelet maken, terwijl het model 1–3 MB extra download is, skinning van 24 figuren zwaarder is op een telefoon en de
    hesjeskleuren lastiger. Bij (a) groeit het 3D-bestand maar ± 9 kB (gzip).
  - Snelheid: per lichaamsdeel één InstancedMesh voor alle poppetjes (gedeelde geometrie, één tekenopdracht per deel),
    fijn en grof detail (grof als een poppetje kleiner dan ± 85 pixels in beeld is). Daarnaast: vaste objecten (veld,
    goals, materiaal, lijnen) niet meer elk beeld doorgerekend en doorzichtige dubbelzijdige materialen (net, sporen) in
    één pas (three.js koos er elk beeld opnieuw een shader voor).
- **Spelers (B2):** pasritme past bij de snelheid (wandelen ± 2,6 passen/s, joggen ± 3,4, sprinten tot ± 5) en de pas
  wordt langer naarmate hij harder gaat; afrollen over hiel en tenen; heupen op het steunbeen met een lichte kniebuiging;
  armen tegengesteld (bij rennen ± 90° in de elleboog), bekken en schouders draaien mee. Optrekken: voorover; afremmen:
  achterover (versnelling uit de tijdlijn; een loopactie begint en eindigt al rustig). In een bocht leunen ze naar binnen.
  Lijf naar de looprichting (tijdlijn); bij stilstaan/wachten draaien hoofd en bovenlijf naar de bal die in het spel is.
  Wachthouding: gewicht verplaatsen en ademen (niet bevroren). Trap bij pass en schot: stap naar de bal, uithalen, raken,
  uitzwaaien in de richting van de bal (binnenkant voet bij een zachte pass, wreef bij een schot); aanname: binnenkant
  voet naar de bal en meegeven, dij, borst of kopbal. Dribbelen: kleine pasjes in het ritme van de bal, de rechtervoet tikt
  hem steeds vooruit. Loopcoördinatie: huppelen, knieheffen, hakken-billen, zijwaarts (voeten kruisen niet), kruispas,
  achteruit, ladder, hordes, sprongen, schijnbeweging.
- **Keepers (B3):** basishouding (door de knieën, handen voor het lijf) bij rustig staan en vóór elk schot. Duik: zijwaarts
  strekken, armen naar de bal, laag over het gras of hoog in de lucht, landen op de zij; opstaan via gehurkt met een hand
  op het gras. Vangen: hoog (W-greep), borst, laag (schepvangen, door de knieën); een bal van het gras oppakken = bukken.
  Uitrollen (diep door de knieën, stap naar voren), bovenhands (bal achter het hoofd) en zwaaiworp: de bal zit tot het
  loslaten in de hand. Uittrappen: bal valt uit de handen, been zwaait erdoor. Kniezit, hurkzit, zitten (ook grond tikken
  met de handen echt op het gras), spreidsprong, knieblok, stompen.
- **Bal (B4):** rolt en draait mee; in de lucht draait hij trager; de boog is die van de tijdlijn (parabool, voor alle
  lobs, wippen, voorzetten en worpen). Zachte schaduw recht onder de bal, kleiner en lichter naarmate hij hoger is. In 3D
  0,14 m straal (was 0,16; echt 0,11). De bal zit bij het aannemen, trappen en vangen aan voet of handen (getest).
- **Afspelen (B5):** snelheid **0,5× · 1× · 2×** (1,5× vervalt). **Instellingen → 3D-animaties → Eenvoudige poppetjes**:
  grovere vormen, geen haar/nek/mouwen, beeldscherpte maximaal 1,25× en geen anti-aliasing. Automatisch: haalt 3D in
  de eerste ± 70 beelden geen ± 28 beelden/s (mediaan > 36 ms), dan eenvoudige poppetjes met een melding; is het dan nog
  te traag (> 45 ms), dan 2D zoals eerst. Wie het zelf uitzet, krijgt het niet meer automatisch.
- **Overal (B6):** bibliotheek, editor-voorbeeld, trainingsmodus, tactiekbord, spelhervattingen, gedeelde links en teams
  gebruiken allemaal `AnimatieSpeler` → `render3d` → `poppetje`. 2D is niet veranderd.
- **Tijdlijn:** alleen extra gegevens (looprichting, loopTijd, afgelegd, versnelling, trap, aanname, opstaan); posities,
  balbanen en tijden zijn gelijk gebleven, dus alle oefeningtests (afstand, balbezit, keeper, fysiek) blijven gelden.
- **Controle (B7):** `tests/poppetje.test.ts` rekent álle oefeningen door: niemand door de grond, knieën en ellebogen
  binnen hun grenzen, voeten op het gras bij stilstaan, handen aan de bal bij vasthouden en vangen, voet bij de bal bij
  trappen, een steunvoet glijdt hooguit een paar procent (7 loopwijzen), hoofd naar de bal, poseren snel genoeg.
  `tests/versie-021.test.ts` (instelling, snelheden, tijdlijngegevens). Browser: `tools/e2e/versie-021.mjs`,
  `animaties.mjs` (voor/na-bladen + metingen) en `pas.mjs` (filmstrips per beweging, van opzij).
- **Gemeten** (laptop met Intel UHD/i3, telefoonformaat 390×844 @ 3×, tactiekbord 11 tegen 11 met alle 22 poppetjes
  in beweging; beeldtijden zijn aan 60 Hz gekoppeld):

  | | vóór (0.20.1) | na (0.21.0) | na, eenvoudig |
  |---|---|---|---|
  | processor 1× | 60 fps, 6,6 ms rekenen/beeld | 60 fps, 5,3 ms | – |
  | processor 4× trager (± middenklasse telefoon) | 30 fps (90%: 20 fps), 25,5 ms | **30 fps (90%: 30 fps)**, 20 ms | 60 fps (90%: 30 fps), 16,7 ms |
  | processor 6× trager | 20 fps (90%: 15), 32 ms | 20–30 fps (90%: 15), 30 ms | 30 fps (90%: 20), 25 ms |
  | tekenopdrachten per beeld | ± 260 (berekend) | 70 | 61 |

  Grootte: 3D-bestand 151 → 160 kB gzip, hoofdbestand 249,7 → 250,7 kB gzip, hele app 2,38 → 2,41 MB; geen modelbestanden.
  Laadtijd eerste bezoek (geen cache, processor 4× trager, mediaan van 3, eigen server zonder compressie; online
  comprimeert GitHub Pages, dus daar sneller) – oud en nieuw gelijk binnen de meetruis: 4G 3531 → 3337 ms tot de
  oefening, 4752 → 4652 ms tot 3D; snel 3G 8028 → 7940 ms en 11788 → 11899 ms.
  Een echte telefoon heeft een andere videokaart; de automatische terugval vangt een te trage telefoon op.

## Besluiten versie 0.22.0 – opruimen, aanpassen en eigen keeperoefeningen (deel A)
- Gebouwd met `tools/nieuw/keepers-022.cjs`; weggehaald met `tools/nieuw/archiveer.cjs` (archief, blijft werken in
  trainingen, links, teams en favorieten).
- **Weg (A1):** Drie schoten: steeds opnieuw positie kiezen · Grondballen: schepvangen · Positie kiezen: meeschuiven met de bal.
- **Aangepast (A2, zelfde id):** `keeper-bv-stuitballen` → "Zijwaarts, stuitbal en lage bal" (Bal verwerken, Laag duiken) ·
  `keeper-re-korte-afstand` → "Reflexen: omdraaien en schot van dichtbij" (Reactie; trainer schiet, 1 keeper) ·
  `keeper-1o1-spreidsprong` → "Spreidsprong: kaatsen en dan 1 op 1" (1 op 1).
- **Samengevoegd (A2.2):** "Laag duiken: kniezit, hurkzit, stand" (`keeper-ld-kniezit-hurkzit-stand`, Laag duiken, Warming-up);
  de drie losse (kniezit, hurkzit, stand met twee keepers) staan in het archief.
- **Nieuw (A3):** Drie pionnen en de korte hoek · Horde heen en terug: volley en hoog schot · Schuin, midden, schuin: ballen op
  het lichaam · Schuin uit, dan twee lage ballen.
- **Nieuwe bouwstenen:** `draai` (op de plek omdraaien naar een persoon of richting, bv. op een teken) en `aantikken` (een
  pion/hoedje aantikken met de hand: door de knieën, hand naar het object). Tests: `tests/versie-022.test.ts`.

## Besluiten versie 0.23.0 – rest van deel A en nieuwe keeperoefeningen (deel B)
- Gebouwd met `tools/nieuw/keepers-023a.cjs` (A3.5 + warming-up), `keepers-023b.cjs` (bal verwerken en duiken),
  `keepers-023c.cjs` (reactie) en `spelers-023.cjs` (A4); gedeelde objecten/stappen in `tools/nieuw/bouwstenen.cjs`.
  Alle teksten zelf geschreven, zonder namen van clubs, trainers, apps of websites (getest).
- **A3.5** Slalom, pion aantikken en duiken (Hoog duiken, Laag duiken) · **A4** Dribbelrace, afronden en 1 tegen 1 (Afwerken).
- **Warming-up:** Twee ballen tegelijk · Rasterloop en lage duik · Zijwaarts blijven bewegen en vangen · Drie aangevers op
  een rij · Sprint met tennisballen, dan vangen · Laddersprongen en voetpass · Zijwaarts, uitschieten en afremmen · Voet,
  uitstappen en vangen · Kleurenpion pakken in de groep · Stompen terwijl je eigen bal in de lucht hangt.
- **Bal verwerken en duiken:** Vier laag, vier hoog · Vangen en laag duiken om de beurt · Drie duiken, drie aangevers ·
  Vangen, zijwaarts, om de pion en terug · Paal tikken en twee poppen · Zigzag vooruit en achteruit · Skip, lage duik en
  tussen de palen · Zijwaarts naar de paal, duiken naar de andere kant · Rondje om het hoedje · Halfknielend vangen, pion,
  hoge duik · Hoge hordes, slalom en paal · Kleur roepen en powerduik · Twee pionnen en achteruit terug · Opstaan vanuit
  buiklig en de verre paal.
- **Reactie:** Kleurvolgorde, hordes en vallende bal · Dropkick tussen de poppen · Rebounder of zijkant · Draaisprong en
  blokken met de voeten vooruit · Stuitbal, schuin en op het lichaam · Cutback verdedigen.
- **Nieuwe bouwstenen** (met tests in `tests/versie-023.test.ts`): zithouding `buik` (op de buik, handen onder de
  schouders) en `halfknie` (halfknielend); opstaan uit een zithouding gaat nu geleidelijk; `draai` met `sprong: true`
  (draaisprong); `blokSoort: 'voeten'` (glijdend blokken met de voeten vooruit); `aantikken` met `met: 'voet'` en met
  een `punt` (bv. de doelpaal). Een bal naar jezelf opgooien (`pass` van en naar dezelfde keeper) werkte al.

## Besluiten versie 0.24.0 – nieuwe keeperoefeningen, deel 2 (deel C)
- Gebouwd met `tools/nieuw/keepers-024a.cjs` (voorzetten), `keepers-024b.cjs` (passing) en `keepers-024c.cjs`
  (1 op 1 en spelletjes). Alle teksten zelf geschreven, zonder namen van clubs, trainers, apps of websites (getest).
- **Voorzetten:** Wegstompen en daarna de hoek dichtzetten · Hordes en hoge bal claimen · Meelezen met de andere keeper ·
  Hoge bal claimen en de schutter horen · Voorzet, uitworp en doorspelen · Circuit: stompen, hordes en lob · Eén hand,
  stompen en de paal.
- **Passing:** Terugspeelbal naar het geroepen doeltje · Meevoetballende keeper: wegwerken en terug · Uitspelen onder druk
  in minidoeltjes · Scannen, uitspelen en 1 op 1 · Uitspelen naar de hoek en terug · Terugspeelbal, draaien en schot ·
  Aannemen en wegdraaien van de pop · Uitkomen en in één keer passen · Lange bal en lange worp · Drie poorten, roterende
  dropkicks · Lezen wat de verdediger doet · Uitspelen onder druk en dan lang.
- **1 op 1:** Uitstappen, vangen en de stilliggende bal lezen · Hoek dichtlopen, nieuwe hoek · Keeper met verdediger ·
  Uitspelen, dan hoek verkleinen.
- **Spelletjes:** Keepersspel met vier doeltjes · Twee tegen twee, twee doelen · Eén-op-één-competitie.
- **Nieuwe bouwstenen** (tests in `tests/versie-024.test.ts`): `worp: 'tik'` = een (stil)liggende bal met één hand
  wegtikken (bv. vanuit kniezit, de bal komt niet in de handen); een keeper die een hoge bal met `worp: 'voet'` en
  `direct` doorspeelt, kopt hem weg (vanaf ± 1,25 m, met een sprongetje, zonder beenzwaai); een halfhoge bal wordt een
  volley (de trapvoet gaat mee omhoog naar de bal). Close-ups: `tools/e2e/pas.mjs set k024` (ook `auto:keepertrap`).

## Besluiten versie 0.25.0 – correctie D0, Help en Engels (deel D)
- **D0:** "Eén hand, stompen en de paal" heeft nu echt een stuitbal: de keeper valt de opspringende bal naar voren aan en
  stompt hem met twee vuisten weg (nieuwe bouwsteen: `uitkomen` + `stompNaar` + `stuitOp`, getest in
  `tests/versie-024.test.ts`). Regel: een keeper kopt alleen buiten de zestien (test over alle oefeningen). Regel in
  CLAUDE.md: een oefening uitvoeren zoals beschreven; ontbreekt een beweging, dan die bijbouwen.
- **D1 Help:** `#/help` (vanuit Instellingen en het vraagteken op het startscherm), 9 uitklapbare onderwerpen met
  zoekveld en "Laat zien"-knoppen; inhoud in `src/help/inhoud.ts` (NL en EN, test `tests/help.test.ts`).
- **D2 Engels:** alle schermteksten via `t()` (`src/i18n/`), woordenlijst `src/i18n/en.ts`; alle ingebouwde oefeningen
  (ook het archief) in `src/data/en/*.json`, alleen geladen in het Engels. Taal / Language bij Instellingen: Nederlands,
  English, Automatisch; onthouden en via het account gesynchroniseerd (veld `taal` in de instellingen). Datums, getallen
  (0.5×), sorteren en Klaarzetten (enkelvoud/meervoud) per taal. Tests: `tests/vertaling.test.ts` (tekst buiten t(),
  ontbrekende vertaling, Nederlands in het Engels, ongebruikte vertalingen) en `tests/vertaling-oefeningen.test.ts`.
- **D3:** browsertest `tools/e2e/taal.mjs`: 17 schermen × 5 formaten × 2 talen, geen Nederlands in het Engels,
  niets afgekapt, geen horizontaal scrollen; taal wisselen, Automatisch en het installatiescherm.

## Besluiten versie 0.25.1 – Engelse woordkeus
- "Spelletjes" heet in het Engels overal "Games" (categorie, filters, Training genereren, Help); "spreidsprong" (keeper)
  heet "wide block" in namen, uitleg, coachpunten en variaties. Test: `tests/vertaling-oefeningen.test.ts` (geen "Fun games"
  of "star jump" meer in de Engelse teksten). iPhone SE in het Engels: `tools/e2e/se-0251.mjs`.

### Woordenlijst Nederlands–Engels
| Nederlands | Engels | | Nederlands | Engels |
|---|---|---|---|---|
| oefening | drill | | training | session |
| Training maken | Plan a session | | Mijn trainingen | My sessions |
| trainingsmodus | session mode | | Training genereren | Generate a session |
| Klaarzetten | Equipment to set out | | onderdeel (genereren) | part |
| Eigen oefeningen | My drills | | Eigen (label) | Custom |
| Spelers / Keepers (tegels) | Players / Goalkeepers | | keeper (labels) | keeper |
| trainer | coach | | Wedstrijd | Match day |
| opstelling | line-up | | tactiekbord | tactics board |
| spelhervatting | set piece | | spelvorm | format (4v4 … 11v11) |
| formatie | formation | | wissels | subs |
| Uitleg | Description | | Organisatie | Set-up |
| Benodigdheden | Equipment | | Coachpunten | Coaching points |
| Makkelijker / Moeilijker | Easier / Harder | | Verloop | Sequence |
| Doorwisselbaar / Vast aantal | Rotating / Fixed numbers | | rij | queue |
| Warming-up | Warm-up | | Techniek | Technique |
| Loopcoördinatie | Footwork & coordination | | Pass en trap | Passing & receiving |
| Afwerken | Finishing | | Positiespel | Possession |
| Partijvormen | Small-sided games | | Spelletjes | Games |
| Laag / Hoog duiken | Low / High diving | | Bal verwerken | Handling |
| Voorzetten | Crosses | | Passing (keepers) | Distribution |
| 1 op 1 | 1v1 | | Reactie | Reactions |
| pion | cone | | hoedje | disc cone |
| paaltje | pole | | pop | mannequin |
| hesjes | bibs | | horde | hurdle |
| loopladder | agility ladder | | landingskussen | crash mat |
| klein doeltje / minidoeltje | mini goal | | jeugdgoal | youth goal |
| groot goal | full-size goal | | doelnet | target net |
| zestien | (penalty) box | | doelgebied | six-yard box |
| eerste / tweede paal | near / far post | | korte / verre hoek | near / far corner |
| basishouding | ready position | | zetten | get set |
| uitkomen | come out (for a cross: come for it) | | hoek verkleinen | narrow the angle |
| claimen | claim | | stompen | punch (clear) |
| tippen over de lat | tip over the bar | | plukken | smother |
| knieblok / spreidsprong (keeper) | knee block / wide block | | blok met de voeten vooruit | feet-first block (slide) |
| schepvangen / kommetje | scoop / basket catch | | W-greep | W grip |
| kruispas / schuifpas | crossover step / side-step (shuffle) | | stuitbal | bouncing ball |
| uittrap uit de handen | kick from hands (volley) | | dropkick | drop kick |
| zwaaiworp | sidearm throw | | terugspeelbal | back pass |
| kaats / kaatser | one-two, lay-off / lay-off player | | steekpass | through ball |
| derde man | third man | | overtal | overload |
| afleggen / terugleggen | lay off / cutback | | omschakelen | transition |
| looplijnen | movement lines | | eenvoudige poppetjes | simple figures |
| JO11 | U11 | | Instellingen | Settings |
| Verdedigen en omschakelen | Defending & transition | | inworp | throw-in |
| kaatser (neutraal) | bounce player | | schietzone | shooting zone |
| druk zetten na balverlies | counter-pressing | | mandekking | man-marking |
| wegdrukken (1 tegen 1) | show away | | zijwaartse houding | side-on stance |
| doelspeler | target player | | diepe spits | striker in behind |
| voorbeeldtactiek | example tactic | | middenblok / laag blok | mid block / low block |
| hoog druk zetten | high press | | tegenpressing | counter-pressing |
| de fuik | pressing trap | | uitwaaieren | split wide |
| derde man | third player | | terugleggen (vanaf de achterlijn) | cutback (from the byline) |
| voorbeeldhervatting | example set piece | | standaardsituatie | set piece |
| doorkoppen | flick-on | | rugzak (corner) | stack |
| overstapje | dummy (step-over) | | zonedekking | zonal marking |
| afschermen (keeper) | screen (the keeper) | | snel nemen | quick free kick |

## Besluiten versie 0.26.0 – Verdedigen en omschakelen, 20 spelersoefeningen (deel A)
- **A1:** nieuwe spelerscategorie `verdedigen-omschakelen`: "Verdedigen en omschakelen" / "Defending & transition"
  ("Druk zetten, de bal veroveren en snel omschakelen"), tussen Positiespel en Partijvormen; dus ook in de filters,
  Training genereren en Help. Alle categorieën (spelers en keepers) kregen een klein plaatje in de categorielijst
  (`src/components/CategoriePlaatje.tsx`).
- Bestaande oefeningen die de categorie erbij kregen (achteraan; het bestand blijft gelijk): 3 tegen 2 met omschakeling,
  Omschakelen tussen twee vakken, 2 tegen 1 met inhalende verdediger, Duel om de bal: 1 tegen 1 naar doel, Oplopend
  overtal: 1v1, 2v1, 3v2, 3v3. Met Snel afronden na balwinst staan er 6 oefeningen in.
- **A2–A4:** 20 nieuwe spelersoefeningen (bouwscripts `tools/nieuw/spelers-026a/b/c.cjs`; Engels in een `en`-blok dat
  `hulp.cjs` naar `src/data/en/` schrijft). **#9 Afstandsschot na een kaats is niet gebouwd:** vrijwel gelijk aan de
  bestaande "Kaats en schieten van afstand" (`veld-af-afstandsschot`).
- Nieuwe bouwsteen **inworp** (`worp: 'inworp'` op een pass): twee handen, bal achter het hoofd en er in één beweging
  overheen, beide voeten op de grond; de bal gaat los op ± 1,95 m. Getest in `tests/versie-026.test.ts` (ook categorie,
  plaatjes, aantallen en categorieën van alle nieuwe oefeningen). Close-up: `tools/e2e/pas.mjs veld-af-golven-na-inworp t 0.5 2`.
- Browsertest `tools/e2e/versie-026.mjs`: categorielijst met plaatjes, de categorie, Training genereren en Help in NL en EN
  op een iPhone SE en een laptop. Bladen: `blad-026.png`; close-ups `blad-026-ps1/ps2/a1–a4.png` (`nieuw.mjs`).

## Besluiten versie 0.27.0 – deel B: verdedigen en omschakelen, partijvormen, spelletjes
- 15 nieuwe spelersoefeningen (bouwscripts `tools/nieuw/spelers-027a/b/c.cjs`, met Engels). Verdedigen en omschakelen
  heeft nu een eigen bestand (`veld/verdedigen-omschakelen.json`) en 15 oefeningen.
- **Niet gebouwd:** #27 Druk zetten of balbezit is vrijwel gelijk aan "Positiespel 4 tegen 4 met doelspelers" (0.26.0);
  die kreeg in plaats daarvan de categorie Verdedigen en omschakelen en een coachpunt voor het drukzettende team.
  #37 Wie is de beste? is vrijwel gelijk aan "Koning van het veld" (veldjes naast elkaar, winnaar schuift op).
- Nieuwe bouwsteen **verdedigend** (loopwijze): laag door de knieën, voeten breed, kleine snelle pasjes, armen iets opzij;
  zonder `kijk` half zijwaarts terugzakkend. Gebruikt bij 1 tegen 1 verdedigen en de eerste verdediger. Test in
  `tests/versie-027.test.ts`; close-up: `tools/e2e/pas.mjs veld-vo-1-1-wegdrukken d 2.4 6`.
- Tekstlabels in een tekening kunnen een `breedte` krijgen (3D-maat, standaard 4 m); lange tekst krimpt zodat hij past
  (scorebord "Rood 0 – 2 Blauw" bij Partijspel met voorsprong). Nieuwe labels staan in `TEKENING_TEKST`.
- Close-ups: `blad-027-b1…b4.png` en na verbeteren `blad-027-c1…c5.png` (`nieuw.mjs`). Verbeterd na het bekijken:
  drukzetters schuin opzij in plaats van recht achter de balbezitter (3D-overlap), Mandekking-partijtje een kwartslag
  gedraaid (duo's naast elkaar), ruimer beeld bij schietzones/wingers/pressen, scorebord groter.

## Besluiten versie 0.28.0 – voorbeeldtactieken op het tactiekbord (deel C)
- **Bibliotheek** `src/wedstrijd/tactieken.ts`: 17 tactieken in drie groepen (Druk zetten 6, Opbouwen 5, Aanvallen en
  omschakelen 6), elk met wat, wanneer en 3 aandachtspunten, en één of meer versies: 16 in 11 tegen 11, een 8-tegen-8-versie
  van T1, T4, T6, T7, T12, T15 en T16, en T11 (alleen 8 tegen 8) in 1-3-2-2 en 1-3-3-1 = 25 borden. Elk bord is een gewone
  tekening met beide teams en lijnen met stapnummers (bouwhulp `Opzet`: `rood`, `blauw`, `loop`, `dribbel`, `pass`), dus
  daarna gewoon aan te passen in de editor. Rood = eigen team (eigen goal onderaan), blauw = tegenstander.
- **Schermen** (`src/screens/wedstrijd/Tactieken.tsx`): Wedstrijd → Nieuw tactiekbord → **Voorbeeldtactiek** → `#/tactieken`
  (lijst per groep, met "11 tegen 11 en 8 tegen 8") → `#/tactiek/<id>/<versie>`: versiekeuze bovenaan, animatie die meteen
  afspeelt, de naam als titel en de uitleg; **Opslaan als eigen bord** of **Aanpassen** (editor) maakt een eigen bord. Het
  voorbeeld zelf verandert nooit. Een eigen bord onthoudt de tactiek (`Bord.tactiek`, ook in de deellink `tk`); de uitleg
  is daar in te klappen. Delen via link en team zoals andere borden.
- **Help**: onderwerp "Voorbeeldtactieken" (NL/EN) met alle namen (zoekbaar), Laat zien → `/tactieken`.
- **Tests**: `tests/versie-028.test.ts` (alle 25 borden: beide teams compleet, binnen het veld, geen meldingen, geen fysieke
  fouten, iedereen ≥ 1,5 m uit elkaar; de deellink onthoudt de tactiek; het voorbeeld blijft gelijk). Browsertest
  `tools/e2e/tactieken.mjs schermen` (iPhone SE en laptop, NL en EN; blad `blad-tactieken.png`) en
  `tools/e2e/tactieken.mjs borden [url] [filter]` (3D op drie momenten + 2D, bladen `blad-tactiek-druk/opbouw/aanval.png`,
  iPhone SE `blad-tactiek-se.png`).

## Besluiten versie 0.29.0 – ingestudeerde spelhervattingen (deel D)
- **Bibliotheek** `src/wedstrijd/hervattingVoorbeelden.ts`: 20 spelhervattingen in vier groepen (Corners 7, Vrije trappen 6,
  Inworp en aftrap 4, Verdedigen bij standaardsituaties 3), met uitleg (wat, wanneer, 3 aandachtspunten). De drie oude
  voorbeelden (corner op de eerste paal, korte corner, vrije trap via een kaats) staan erin onder hun oude id, nu met beide
  teams, rugnummers per positie en uitleg; `VOORBEELDEN` in `hervattingen.ts` verwijst ernaar. 8 tegen 8 bij S1, S4, S8,
  S10, S12, S14 en S15: 27 borden. Half veld met het goal bovenaan (8 tegen 8: 42,5 × 32 m met jeugdgoal); de aftrap op een
  heel veld. Startcamera "Achter goal" (de zestien groot in beeld); bij de inworpen op het middenveld "Schuin".
- **Zelfde schermen als de tactieken** (`src/wedstrijd/bibliotheken.ts`, `screens/wedstrijd/Tactieken.tsx` generiek):
  Nieuwe spelhervatting → **Voorbeeldhervatting** → `#/hervattingen` → `#/hervatting/<id>/<versie>`; versiekeuze, uitleg,
  Opslaan als eigen bord, Aanpassen, delen; de uitleg in een eigen bord (`Bord.tactiek` = id van tactiek of hervatting).
  In de kop staat nu de naam van de bibliotheek en de groep als label boven de titel (lange groepsnamen pasten niet).
- **Inworp met lijnen**: een pass van een speler op of buiten de zijlijn wordt vanzelf een inworp met twee handen (ook bij
  zelf getekende borden). **Muur**: spelers in een muur (`TactiekVersie.muur`) mogen ± 0,8 m van elkaar staan.
- **Help**: onderwerp "Voorbeeldhervattingen" (NL/EN). **Tests**: `tests/versie-029.test.ts` (27 borden: teams compleet, geen
  meldingen, geen fysieke fouten, afstand ≥ 1,5 m (muur ≥ 0,6 m), aanvallend eindigt in het goal, verdedigend met wegwerken of
  vangen; de inworp). Browsertest `tools/e2e/tactieken.mjs hschermen` en `hborden` (bladen `blad-hervattingen.png`,
  `blad-hervatting-<groep>.png`, `blad-hervatting-se.png`); `deel-b.mjs` volgt de nieuwe weg naar een voorbeeld.

## Keuzes zonder overleg
(Gemaakt terwijl de gebruiker weg was; graag bekijken.)
- 0.29.0 – Spelhervattingen op een half veld: van het aanvallende team staan de 10 veldspelers erop (de eigen keeper staat op de
  andere helft), van het verdedigende team 10 veldspelers en de keeper. Bij de aftrap staat iedereen op een heel veld.
- 0.29.0 – Startcamera "Achter goal" voor hervattingen bij het doel: de zestien is dan groot en leesbaar. De cornernemer of
  ingooier staat dan net buiten beeld; in 2D en met "Schuin" zie je alles. De inworpen op het middenveld starten met "Schuin".
- 0.29.0 – De drie bestaande voorbeelden zijn opnieuw opgebouwd (beide teams, rugnummers per positie, uitleg); id en naam bleven
  gelijk. Oude eigen borden die je ervan gemaakt hebt, veranderen niet.
- 0.29.0 – Bij Nieuwe spelhervatting staan de voorbeelden niet meer los in het paneel, maar achter "Voorbeeldhervatting" (zoals
  bij de tactieken); de beginsituaties om zelf te tekenen staan er nog.
- 0.29.0 – Inworp: een pass vanaf de zijlijn is automatisch een inworp, ook als je zelf tekent; een aparte keuze was niet nodig.
- 0.29.0 – Corners komen van de linker hoekvlag (uitzondering: zonedekking 11 tegen 11 en 8 tegen 8 van rechts); de vrije
  trappen centraal op ± 22 m, de muur van 4 (8 tegen 8: 3) op 9,15 m, iets buiten de lijn naar de korte paal.
- 0.29.0 – S5 Afschermen: de afschermer staat schuin voor de keeper aan de kant van de eerste paal; de bal gaat net over hem heen
  naar het midden van de korte kant van het doelgebied.
- 0.29.0 – S7 Speler in de muur: de eigen speler sluit de muur aan de binnenkant af; hij stapt weg vlak voor het schot (de
  animatie toont eerst het wegstappen, dan het schot door het gat naar de korte hoek).
- 0.29.0 – S10 Snel nemen: op ± 40 m van het doel; twee tegenstanders lopen nog naar hun plek.
- 0.29.0 – S12: de kaats gaat terug naar de ingooier op de lijn; daarna dribbelt die het veld in en speelt naar binnen.
- 0.29.0 – S14 Aftrap: na de lange bal zet de buitenspeler voor op de spits, die met de aftrap meeliep (kans: kopbal).
- 0.29.0 – S16 Mandekking eindigt met de keeper die de corner vangt; S15 Zonedekking met wegkoppen naar de hoge spits; S17 met de
  keeper die het schot in de lange hoek vangt.
- 0.28.0 – Rugnummers per positie (2 rechtsback, 3/4 centrale verdedigers, 5 linksback, 6 controlerende middenvelder, 8/10
  middenvelders, 7/11 buitenspelers, 9 spits), zoals "de 6" in de opdracht; niet van links naar rechts zoals bij de opstelling.
- 0.28.0 – Een voorbeeld opent eerst een voorbeeldscherm (niet meteen een opgeslagen bord), zodat de 11/8-keuze bovenaan
  kan en je lijst met borden niet volloopt; pas Opslaan als eigen bord of Aanpassen maakt een eigen bord.
- 0.28.0 – In het voorbeeldscherm staat de groepsnaam in de kop en de tactieknaam als titel onder de animatie (een lange naam
  past op een iPhone SE niet in de kop). In een eigen bord staat de naam (met "· 8 tegen 8") in de kop en voluit in het naamveld.
- 0.28.0 – T11 Opbouw in 8 tegen 8 is één tactiek met twee versies (1-3-2-2 en 1-3-3-1), net als de 11/8-keuze.
- 0.28.0 – T7 in 8 tegen 8 in de 1-2-3-2: de buitenste middenvelders gaan hoog en breed (wat de backs in 11 tegen 11 doen).
- 0.28.0 – Balveroveringen tonen we met een pass van blauw die bij een rode speler aankomt (onderschepping), omdat het
  tactiekbord met lijnen werkt; de animatie blijft zo in de editor aan te passen.
- 0.28.0 – T2 Middenblok: de tegenstander bouwt op via links, de bal wisselt van kant en komt dan over de middenlijn; het blok
  schuift twee keer mee en zet dan pas druk. T3 Laag blok eindigt met wegkoppen naar de hoge spits (counter).
- 0.28.0 – Elke aanvalstactiek eindigt met een doelpunt; de drukzettactieken eindigen met de balverovering.
- 0.28.0 – Tactiekborden kun je (nog) niet aan een training toevoegen; dat kon met andere borden ook niet. "Zichtbaar zoals
  andere borden" = in Wedstrijd, delen via een link en met je team.
- 0.28.0 – In 3D van boven (heel veld) vallen rugnummers bij een groepje spelers rond de bal soms over elkaar; 2D is dan beter
  leesbaar. Waar het echt onleesbaar was (lange bal op de spits) staan de spelers iets ruimer.
- 0.27.0 – #27 niet gebouwd maar de bestaande 4 tegen 4 met doelspelers kreeg de categorie Verdedigen en omschakelen en
  een vierde coachpunt (samen druk zetten, de lijn naar de doelspeler dicht). #37 niet gebouwd.
- 0.27.0 – Een zijwaartse, lage verdedigende houding bestond nog niet: bijgebouwd als loopwijze `verdedigend`.
- 0.27.0 – Druk zetten in drie fases: bij de aanval verdedigen twee spelers van het team dat de bal kwijtraakte (de derde
  blijft bij het vak); de animatie toont fase 1 (passief) en fase 3 (volle druk, onderschepping, 3 tegen 2, doelpunt).
- 0.27.0 – Eerste, tweede en derde verdediger: op vier kleine doeltjes, zodat de verdedigers na balwinst kunnen scoren.
- 0.27.0 – 1 tegen 1 verdedigen: strook van 12 × 20 m, de verdediger speelt de bal zelf in en sluit dan aan bij de andere rij.
- 0.27.0 – Hoog druk zetten loont: de punten gelden voor een doelpunt, afhankelijk van waar de bal veroverd werd (laatste
  vak 3, middenvak 2, eigen helft 1); 5 tegen 5 met keepers. De animatie toont een onderschepte terugspeelbal.
- 0.27.0 – Pressen na balverlies: 5 tegen 5 op vier kleine doeltjes (zonder keepers); de trainer telt de 5 seconden af.
- 0.27.0 – Omschakelen met kaatsers: gewoon doelpunt 1, binnen 10 seconden na balwinst 2, en met een assist van een kaatser
  3 punten.
- 0.27.0 – Van 1 tegen 1 naar 4 tegen 4: na 4 tegen 4 begint een nieuwe ronde met 1 tegen 1; wie de goal tegen kreeg (of bij
  bal uit wie aan de bal komt) begint via de keeper.
- 0.27.0 – Verboden middenvak: de strook loopt in de lengte (8 m breed, van 12 tot 48 m); bij de doelen mag je er wel komen.
- 0.27.0 – 5 tegen 5 met schietzones: vier neutralen (twee per zijlijn, max. twee keer raken), schietzone 20 × 12 m.
- 0.27.0 – 4 tegen 4 met wingers: twee neutrale wingers die met het balbezittende team meespelen en niet aangevallen mogen
  worden (variant: per team een eigen winger).
- 0.27.0 – Partijspel met voorsprong: 5 tegen 5 met keepers; scorebord als tekst in de tekening.
- 0.27.0 – 2 tegen 2 met een doelspeler: elke bal bij de doelspeler is een punt; hij kaatst de bal terug naar zijn team,
  zodat het spel doorgaat.
- 0.27.0 – Mandekking-partijtje: 4 tegen 4 op vier kleine doeltjes, duo's hebben hetzelfde rugnummer.
- 0.27.0 – Ludo met de bal: 16 hoedjes, dobbelsteen 1–6 (1–2 hooghouden, 3–4 slalom, 5–6 pass door een poortje), wie op
  het hoedje van een ander komt stuurt die terug naar zijn hoek. De vierde kleur is paars (de jokerkleur van de app).
- 0.27.0 – Uit het vak rennen: twee kleuren in de animatie; wie het eerst bij een pion is, krijgt een punt.
- 0.26.0 – Niet alleen de nieuwe categorie, maar alle categorieën (spelers en keepers) kregen een eigen plaatje; anders
  was de nieuwe de enige met een plaatje.
- 0.26.0 – #9 Afstandsschot na een kaats niet gebouwd: vrijwel gelijk aan "Kaats en schieten van afstand".
- 0.26.0 – Verdedigen en omschakelen staat tussen Positiespel en Partijvormen. Erbij gekregen: alleen oefeningen waarin
  balwinst/balverlies en meteen omschakelen of terug verdedigen de kern is (5 stuks); rondo's en partijvormen waarin
  omschakelen alleen een spelregel is, niet.
- 0.26.0 – Een inworp kon het poppetje nog niet: bijgebouwd als bouwsteen.
- 0.26.0 – Vierhoek met een verdediger: vast 5 spelers, drie fases (passief, half, vol) van ± 1 minuut.
- 0.26.0 – Pentagon: 7 spelers, twee ballen tegelijk, buitenom naar een zelfgekozen pion.
- 0.26.0 – Y-vorm: de drie varianten na elkaar in één animatie (overlap, derde man, lange bal).
- 0.26.0 – Gerichte aanname naar voren en Vrijlopen uit de rug: met een spits en keeper erbij, zodat de actie eindigt met
  een doelpoging; bij Gerichte aanname is de tegenstander een pop.
- 0.26.0 – Schieten onder druk: de animatie toont één snelle afronding en één keer een tikje te veel (bal kwijt).
- 0.26.0 – Snel afronden na balwinst: 8 seconden om te scoren; 2 tegen 2 in een middenvak (ook in Verdedigen en omschakelen).
- 0.26.0 – Aanvallen in golven: inworp op 22 m van de achterlijn; twee aanvallers in de eerste golf, één in de tweede; de
  ontvanger legt terug op de derde loper.
- 0.26.0 – Kopballen na een voorzet: om en om van rechts (eerste paal) en links (tweede paal).
- 0.26.0 – Wedstrijdje schieten: twee teams, laag in de hoek = 2 punten, vijf rondes.
- 0.26.0 – 5 tegen 3: vier spelers rondom en één in het midden; de verdedigers scoren door over een korte zijde te dribbelen.
- 0.26.0 – 4 tegen 4 met doelspelers: aan elke korte kant één doelspeler van elk team (12 spelers).
- 0.26.0 – Vier zones: 4 tegen 3, één balbezitter per zone (wisselen mag als elke zone bezet blijft); een punt = binnen één
  balbezit in alle vier de zones.
- 0.26.0 – 7 tegen 5: opbouwstructuur 2 centrale verdedigers, 2 backs, 2 middenvelders en een spits; een punt = de bal in de
  voeten van de spits.
- 0.26.0 – Rondo 4 tegen 2: de passer wisselt met de buitenspeler naast hem die de bal níét kreeg; de passer buitenom, de
  ander binnendoor.
- 0.26.0 – Rondo 3 tegen 1 plus 1 tegen 1: wie de bal verloor, verdedigt het doeltje.
- 0.26.0 – Opbouw met 4 + keeper tegen 2: na balwinst mogen de twee aanvallers meteen op het grote doel scoren.
- 0.26.0 – Door de linies: 2 tegen 2 in het middenvak, de spits tegen één verdediger en een keeper; spelers blijven in hun zone.
- 0.25.1 – "Spreidsprong" als keepersblok heet nu "wide block". In de spelersoefening "Ringen: hinkelen en spreidsprong"
  betekent spreidsprong een sprong met de benen gespreid (hinkelen); daar blijft het Engels "straddle jumps".
- 0.17.0 – Training genereren start vanuit Mijn trainingen (knop naast Training maken) en vanuit een lege training; de
  starttegel bleef zoals hij was (ruimte op de iPhone SE).
- 0.17.0 – Hetzelfde onderdeel mag vaker in de lijst (krijgt dan verschillende oefeningen). Na het genereren krijgt een
  nieuw aangetikt onderdeel meteen een oefening; zelf toegevoegde oefeningen blijven achteraan staan bij opnieuw genereren.
- 0.17.0 – "Laatste trainingen" = de laatste 3 (op datum, anders laatst gewijzigd). Eigen en teamoefeningen doen mee.
- 0.17.0 – Een lege training wordt ook opgeruimd als je de aantallen wel veranderde (alleen naam, datum of oefeningen tellen).
- 0.17.0 – Filter "aantallen" in de bibliotheek begint nog steeds op 12/1 (alleen Training maken werd 4/1).
- 0.17.0 – Looplijnen-keuze geldt per toestel (niet via het account). Getekende lijnen zonder stapnummer blijven zichtbaar.
- 0.17.0 – Doelnet is geel; per goal één net; staat er ook een keeper, dan gaat het net voor. "Halfhoog" bestaat niet bij
  een schot, dus de middelste hoogte kaatst altijd terug.
- 0.17.0 – Het woord "Veld" blijft bij het veldtype in de editor (leeg/half/heel veld); alleen de soort heet nu Spelers.
- 0.25.0 – D0: de keeper raakt de stuitbal terwijl hij opkomt, op borst- tot hoofdhoogte (± 1,4 m), zonder sprong; hij
  start al tijdens de eerste vlucht.
- 0.25.0 – D0: bij "Meevoetballende keeper" stond de keeper bij het koppen op 14,4 m, net binnen de zestien. Hij komt nu
  tot 17,6 m (buiten de zestien), passend bij de nieuwe regel.
- 0.25.0 – Een andere taal kiezen laadt de app opnieuw (dan staat echt alles in de nieuwe taal). Ook als een ander toestel
  via het account een andere taal doorgeeft.
- 0.25.0 – Automatisch kijkt naar de eerste voorkeurstaal van het toestel: Engels → English, anders Nederlands.
- 0.25.0 – De kop "Taal / Language" en de namen "Nederlands" en "English" staan altijd in beide talen (zo vind je hem terug).
- 0.25.0 – Het vraagteken staat op het startscherm links van het tandwiel; Help staat bij Instellingen bovenaan (na Account).
- 0.25.0 – Help heeft 9 onderwerpen: de 8 gevraagde plus "Taal, kleuren en weergave". "Laat zien" bij animatie opent
  "Passen in de driehoek" als voorbeeld.
- 0.25.0 – Woordkeus: oefening = drill, training = session ("Plan a session"), Wedstrijd = "Match day", de keepertegel heet
  "Goalkeepers", Spelletjes = "Games" (in 0.25.0 nog "Fun games"). Spelers en keepers zijn in het Engels "they" (geen he/she).
- 0.25.0 – Voorbeelden in invulvelden aangepast aan Engeland: "JO11-1" → "U11 Blues", "Zaterdag tegen VVA" → "Saturday
  vs Rovers".
- 0.25.0 – Datums in het Engels als "27 Oct 2026" (Brits). Het datumveld zelf volgt de taal van de browser.
- 0.25.0 – Kopieer je in het Engels een ingebouwde oefening, dan krijgt de kopie de Engelse tekst; daarna is hij van jou en
  wordt hij niet meer vertaald. In een gedeelde link of team zie je ingebouwde oefeningen in je eigen taal, eigen
  oefeningen in de taal van de maker.
- 0.25.0 – De taal gaat mee in het bestaande instellingenveld in Firebase; de Firebase-regels zijn niet gewijzigd.
- 0.25.0 – Op 320 px breed is er naast de knoppen geen ruimte voor de naam in de editor; die wordt daar verborgen
  (was in het Nederlands al "N a").
- 0.25.0 – Klaarzetten heet in het Engels "Equipment to set out"; "Weergave" (licht/donker) heet "View", net als bij de
  animatie.
- 0.24.0 – Aangevers en schutters zijn in de animatie de trainer en andere keepers; keepersNodig telt die keepers mee
  (de trainer niet). Bij Lezen wat de verdediger doet en Uitspelen onder druk en dan lang staan de medespelers als keepers
  in de tekening (3 en 4 keepers); met veldspelers kan het ook.
- 0.24.0 – Wegstompen en hoek dichtzetten: de tweede voorzet komt van een keeper rechts, een derde keeper is de schutter.
- 0.24.0 – Hoge bal claimen en de schutter horen: de animatie toont één keer roepen (keeper 3 schiet); de uitleg noemt alle
  drie de keuzes.
- 0.24.0 – Circuit: de draaisprong is een hele draai in de lucht; de lage bal komt van keeper 2, de lob van keeper 3 over
  twee poppen.
- 0.24.0 – Eén hand, stompen en de paal: eerst een hoge bal in plaats van de stuitbal. **Gecorrigeerd in 0.25.0 (D0):** nu een
  stuitbal die de keeper naar voren aanvalt en met twee vuisten wegstompt (nieuwe bouwsteen).
- 0.24.0 – Geroepen doeltje: drie minidoeltjes met een rood, geel en blauw hoedje ervoor; de animatie toont twee ballen.
- 0.24.0 – Wegwerken en terug: wegwerken met het hoofd (de lange bal komt hoog aan); bij Makkelijker wegtrappen.
- 0.24.0 – Uitspelen onder druk in minidoeltjes: eerste bal gaat erin, tweede bal wordt onderschept en wordt een counter.
- 0.24.0 – Uitspelen naar de hoek en terug: de aangever staat schuin rechts aan de rand van het strafschopgebied (niet in de
  hoek zelf, dan valt hij buiten beeld); keeper 3 is de naloper voor de tweede bal.
- 0.24.0 – Aannemen en wegdraaien: drie ballen (laag, stuit, halfhoog), steeds naar hetzelfde kleine doeltje links.
- 0.24.0 – Drie poorten: met drie keepers en drie poorten loopt de keeper na zijn trap naar de derde poort (achter de
  keeper die daar staat), anders staat er bij de laatste poort niemand om te vangen.
- 0.24.0 – Lezen wat de verdediger doet: beide situaties staan naast elkaar (links ingezakt, rechts doorgedekt).
- 0.24.0 – Stilliggende bal lezen: de trainer kiest in de animatie de rechterbal; de eerste bal rolt de keeper opzij weg.
- 0.24.0 – Keeper met verdediger: eerste aanval blokt de verdediger, tweede aanval schiet de trainer langs hem.
- 0.24.0 – Vier doeltjes: vier keepers (twee in de doeltjes, twee aangevers); na een paar minuten wisselen de rollen.
  Puntentelling: elk doelpunt een punt voor de schutter.
- 0.24.0 – Twee tegen twee: doelen van 6 m breed op 32 m van elkaar; de keeper gooit na een redding naar een trainer.
- 0.24.0 – Eén-op-één-competitie: drie keepers (één in het doel, twee aanvallers); blok met de knie en met de voeten.
- 0.23.0 – A3.5: pionnen om aan te tikken (je schreef "paal of pion"); vier paaltjes voor de slalom; eerst een hoge, dan een
  lage duik.
- 0.23.0 – A4: met een keeper in het doel (keepersNodig 1); het rechterparcours is langer door één paaltje extra en ligt
  verder weg; de verdediger blijft op ± 2 m (de animatie houdt 1,5 m afstand aan).
- 0.23.0 – Twee ballen tegelijk: vier ballen (drie eigen + één die rondgaat); de animatie toont één ronde en aan het eind legt
  keeper 3 de extra bal neer.
- 0.23.0 – Aangevers zijn in de animatie de trainer en andere keepers; daardoor keepersNodig 3 bij Drie aangevers op een rij,
  Vangen en laag duiken om de beurt, Drie duiken/drie aangevers, Stompen met eigen bal en Rebounder of zijkant (doorwisselen
  steeds zichtbaar of beschreven).
- 0.23.0 – Tennisballen: twee tennisballen in de animatie (in de uitleg "een voor een"); de volgende keeper begint als de
  vorige halverwege is.
- 0.23.0 – Kleurenpion: 4 keepers, 3 kleuren × 2 pionnen, twee keepers per pion; "wie het laatst is, doet een opdracht"
  heb ik toegevoegd.
- 0.23.0 – Vangen, zijwaarts, om de pion: de trainer speelt de eerste drie ballen (hard, volley, rollend), keeper 2 het
  afstandsschot van 16 m.
- 0.23.0 – Zijwaarts naar de paal: de animatie toont één ronde (beide kanten); "twee rondes" staat in de uitleg.
- 0.23.0 – Hoge hordes: 45 cm.
- 0.23.0 – Buiklig en verre paal: eerste keer in de sprong vangen, tweede keer (andere kant) een hoge duik.
- 0.23.0 – Vallende bal: in de uitleg houdt de trainer twee ballen vast; de animatie laat één bal vallen (twee ballen in
  twee handen kan het poppetje niet tonen).
- 0.23.0 – Dropkick tussen de poppen: drie dropkicks: recht op de keeper, via een pop van richting veranderd, halfhoog.
  Teruggooien met een hoge boog over de poppen.
- 0.23.0 – Rebounder of zijkant: minidoeltje rechts naast het doel; keeper 3 links vangt de kaatsbal-terugworp. De animatie
  toont beide keuzes van de trainer na elkaar.
- 0.23.0 – Cutback: keeper 2 legt de bal terug vanaf de achterlijn rechts naar de trainer bij de penaltystip.
- 0.23.0 – Opstaan uit kniezit/hurkzit/zit gaat nu in ± 0,5 s in plaats van in één keer; dat zie je ook in bestaande oefeningen.
- 0.22.0 – De opdracht (deel A) hield halverwege A3.4 op ("Minimaal 2 keepers + …"). Gedaan: A1 t/m A3.4; aangenomen dat
  er "+ trainer" stond. Mocht er na A3.4 nog iets staan (A3.5 of een A4), dan staat dat nog open.
- 0.22.0 – De samengevoegde lage-duikoefening kreeg een nieuw id (`keeper-ld-kniezit-hurkzit-stand`), omdat je vroeg de
  drie losse naar het archief te doen; oude trainingen met een van de drie blijven werken.
- 0.22.0 – "Zijwaarts over twee pionnen": de keeper gaat zijwaarts langs de twee pionnen (op 0,8 m), want over een pion
  heen stappen keurt de controle af (niemand door materiaal). In de uitleg staat "langs twee pionnen".
- 0.22.0 – Ballen met een stuit: de lage bal na het terugrollen gaat naar de andere kant van de keeper (± 2 m), niet helemaal
  naar de verre hoek (dat is vanaf de paal te ver om te duiken).
- 0.22.0 – Reflexen: nu met de trainer als schutter en 1 keeper (was 2 keepers); drie schoten: heuphoogte, laag naast hem
  (korte duik) en borsthoogte. "Handen voor de ogen" staat bij Moeilijker.
- 0.22.0 – Schuin, midden, schuin en Schuin uit + twee lage ballen: de animatie toont 3 keepers + trainer (drie schutters
  en doorwisselen); keepersNodig = 2, want met twee keepers neemt de trainer ook een tweede positie (staat in de organisatie).
- 0.22.0 – Drie pionnen en de korte hoek: rechterpaal, pionnen op 0,9 m van elkaar; tweede duik hoog, eerste en derde laag.
- 0.21.0 – Eigen figuur in code in plaats van een vrij 3D-model (zie besluiten 0.21.0): de keepers- en voetbalbewegingen
  moesten toch zelf gemaakt worden en zo blijft de app klein en snel.
- 0.21.0 – Hakken-billen bestond nog niet als loopwijze: toegevoegd (`hakbil`) en in "Loopscholing in de rij" als vijfde
  loopvorm met een vijfde speler (dat is de enige oefening die veranderd is).
- 0.21.0 – Haar- en huidkleur verschillen per poppetje (vast per persoon), zodat een groep er natuurlijker uitziet; de
  hesjeskleur blijft het herkenningsteken. Keeper: lange mouwen + lichte handschoenen; trainer: trainingspak.
- 0.21.0 – Het lijf zelf blijft in de kijkrichting van de tijdlijn; bij wachten draaien alleen hoofd en bovenlijf naar de
  bal (anders zouden rijen die bewust één kant op kijken gaan draaien).
- 0.21.0 – Bij dribbelen ligt de bal in 3D tot 0,3 m verder voor de voet en bij een trap stapt het poppetje tot 0,26 m
  naar de bal: alleen in beeld, de tijdlijn (en dus 2D en alle tests) blijft gelijk.
- 0.21.0 – Bal in 3D iets kleiner (straal 0,14 i.p.v. 0,16 m), passend bij de nieuwe voeten; nog steeds groter dan echt.
- 0.21.0 – Snelheid 1,5× is vervallen (gevraagd: 0,5×, 1×, 2×). Eenvoudige poppetjes is een instelling per toestel
  (niet via het account), want het gaat om de snelheid van dat toestel.
- 0.20.0 – Categorieën waar je er geen noemde: 1 Hordes zijwaarts → Hoog duiken; 2 Vier kleuren en bal verwerken → Bal
  verwerken, Reactie; 3 Vier kleuren en bal voor de stuit → Reactie; 4 Pass naast het doel → Reactie; 5 Bal van achter → Reactie;
  6 Midden, voorzet en schot → Bal verwerken, Voorzetten, Hoog duiken; 13 grondoefeningen → Warming-up.
- 0.20.0 – De grondoefeningen zijn drie losse oefeningen (tikken en vangen, drie hoogtes, opgetrokken knieën). "Achter je de
  grond tikken" staat in de uitleg; in de animatie is dat een korte pauze voor elke bal (de arm doet dat niet na).
- 0.20.0 – Drie schutters met nummers: de aangevers zijn spelers (spelersNodig 3); in de organisatie staat dat het ook
  keepers of de trainer mogen zijn.
- 0.20.0 – Bal van achter de keeper: de bal gaat in de animatie óver de keeper (onder de keeper door kan de animatie niet
  netjes laten zien; het staat wel in de uitleg en variaties).
- 0.20.0 – Oplopend overtal: de animatie laat 1v1 → 2v1 → 3v2 zien (5 spelers); 3v3 met de zesde speler staat in de uitleg.
  Op één goal zonder keeper (jeugdgoal). Golven: met 5 spelers die na elke golf teruglopen (doorschuiven), op doel met keeper.
- 0.20.0 – Rondo 4 tegen 2 met uitbraak: de spits is een vijfde aanvaller die bij het vak wacht; in de animatie 5 passes
  (in de uitleg 8). Positiespel 3+3+3: neutralen in een derde hesjeskleur (geel), 6 passes en dan de spits.
- 0.19.0 – Automatische naam alleen als een training zonder naam oefeningen krijgt (niet bij elke keer bewaren), zodat je
  de naam nog zelf kunt wissen en overtypen.
- 0.19.0 – Volledig opgesteld tactiekbord: beide teams elk in hun eigen helft (zoals bij de aftrap), ook vanuit een
  opstelling (de onderlinge opstelling blijft gelijk). Op exacte plekken vielen spelers op kleine velden over elkaar.
- 0.19.0 – Zo'n bord start met de camera van boven (schuin viel de eigen keeper buiten beeld).
- 0.19.0 – Een naam invullen in de editor zet "Namen tonen" vanzelf aan; namen tonen kan met de knop op het bord.
- 0.19.0 – Ook "Hoog duiken op het kussen vanuit kniezit" en "Afzet en landing: hoog duiken vanuit stand" weg (landingskussen).
  Pannavoetbal blijft (pannakooi; de tekst noemt "of 4 banken" maar er wordt geen bank getekend).
- 0.19.0 – Weggehaalde oefeningen staan in een archief (niet echt gewist), zodat oude trainingen, links, teams en
  favorieten blijven werken.
- 0.19.0 – Tikkertje met hesje en Overlopertje zijn zonder bal maar staan op jouw verzoek bij Warming-up en Spelletjes;
  de regel "zonder bal" maakt voor die twee een uitzondering. De regel geldt alleen voor spelers (keepers hebben geen
  Loopcoördinatie).
- 0.19.0 – "Kleurenreactie in tweetallen" (zonder bal) houdt zijn id; de versie met bal is nieuw ("Kleurenreactie met bal"):
  dribbelen naar de kleur en terug.
- 0.18.0 – 4 tegen 4 zonder keeper (zoals bij de jongsten), met formaties 1-2-1 (ruit) en 2-2. Bij elke spelvorm één
  extra formatie (6v6 1-2-2-1, 8v8 1-3-2-2, 11v11 1-4-2-3-1).
- 0.18.0 – Nieuwe opstelling: laatst gebruikte spelvorm (anders 11 tegen 11); alle namen uit je lijst staan eerst op de bank.
- 0.18.0 – De namenlijst staat per toestel (niet via het account); opstellingen en borden gaan wel via het account.
- 0.18.0 – Tactiekbord vanuit een opstelling staat altijd op een heel 11-tegen-11-veld; de tegenstander krijgt de eerste
  formatie van dezelfde spelvorm; namen staan niet op het bord (rugnummers wel).
- 0.18.0 – Jouw team is rood (A), de tegenstander blauw (B). Vrije trap 18 m centraal, 25 m links, 30 m rechts.
- 0.18.0 – "Wissen" wist alle lijnen; de spelers blijven staan (opnieuw beginnen = nieuw bord).
- 0.18.0 – Delen via een link heeft een eigen adres (`#/w/…`); een gedeelde opstelling neemt de namen mee.
- 0.17.0 – Exporteren bevat geen teamoefeningen (die staan al in het team). Op de telefoon kon het deelmenu niet in de
  browsertest worden getest (alleen downloaden).

## Open vragen (later beslissen)
- Definitieve naam en logo van de app.
- Leeftijdsindicatie per oefening (bv. "JO7–JO11") als filter?
- Duur per oefening (minuten) voor de trainingsplanning in fase 3?
