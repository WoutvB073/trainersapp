# TopTraining — werkafspraken voor Claude

(App-naam TopTraining; repo, link /trainersapp/ en opslagsleutels `trainersapp.…` blijven zo.)

PWA (Vite + React + TS) voor voetbaltrainers: oefenbibliotheek veld/keepers met animaties. Visie, datamodel,
fasering en besluiten: **PLAN.md** (eerst lezen).

## Werkwijze
- Communiceer in het **Nederlands**. De app is tweetalig (0.25.0): Nederlands en Engels.
- **Alle app-tekst ook in het Engels:** tekst altijd via `t('…')` (of `vt` waar `t` al een variabele is, `zin` voor **vet**)
  uit `src/i18n/t.ts`; de Engelse vertaling in `src/i18n/en.ts` (woordenlijst in PLAN.md). `tests/vertaling.test.ts` faalt bij
  tekst buiten t(), een ontbrekende vertaling of Nederlands in het Engels (`tools/i18n/scan.mjs -v` toont waar). Geen
  vertaling nodig: markeer met `i18n-ok`. Eigen oefeningen, trainings-, team- en spelersnamen worden nooit vertaald.
- **Elke ingebouwde oefening ook in het Engels** (ook in het archief): naam, uitleg, organisatie, benodigdheden, coachpunten,
  Makkelijker, Moeilijker, `meerSpelers` en `onderdelen` per id in `src/data/en/<map>-<categorie>.json` (archief: `archief-*.json`).
  `tests/vertaling-oefeningen.test.ts` faalt als een oefening of tekst geen Engels heeft of als er Nederlands in staat.
  Natuurlijke Engelse voetbaltaal volgens de woordenlijst in PLAN.md (drill, session, cones, disc cones, mannequin, bibs …).
  Tekst-labels in tekeningen: `TEKENING_TEKST` in `src/data/vertaling.ts`.
- Bouwen in kleine stappen (fases uit PLAN.md); na elke stap test de gebruiker op de telefoon → wachten op akkoord.
- Per stap: bouwen → zelf testen (`npm test`, `npm run build`, browsertests hieronder) → commit + push →
  korte uitleg, online link, testlijst. PLAN.md-status bijwerken.
- Keuzes die gebruik of uitstraling raken en niet in PLAN.md staan: eerst vragen.
- **CLI-uitvoer met configuratie altijd filteren, nooit geheime instellingen tonen.** Vraag bij Firebase of Google Cloud alleen het veld op dat je nodig hebt en print alleen dat (`signIn` bevat bijvoorbeeld de hash-sleutel van de wachtwoorden). Geldt ook voor tokens, serviceaccounts en `auth:export`: alleen aantallen of gemaskeerde waarden tonen.

## Commando's
- `npm run dev` (poort 5184 via `.claude/launch.json`) · `npm run preview` (poort 4184) · `npm test` · `npm run build`
- Online = push naar `main` → GitHub Actions → https://woutvb073.github.io/trainersapp/

## Structuur
- `src/model/types.ts` — datamodel (één formaat voor ingebouwd, gekopieerd en editor).
- `src/data/oefeningen/{veld,keepers}/<categorie>.json` — oefeningen; `src/data/categorieen.ts` — categorieën.
- `src/anim/timeline.ts` — stappen → posities/houding/balhoogte/sporen per tijdstip (puur, getest);
  `render2d.ts` — canvas; `render3d.ts` — Three.js (lui geladen); `weergave.ts` — gezamenlijke interface;
  `AnimatieSpeler.tsx` — bediening, 2D/3D-keuze, snelheid 0,5/1/2×, terugvallen op eenvoudige poppetjes en dan 2D.
- `src/anim/poppetje.ts` — 3D-poppetje: skelet, vormen (InstancedMesh, fijn/grof), houding per beeld (`poseer`: voetdoelen + IK, armen naar de bal), `balInvoer`/`persoonInvoer` (gedeeld met de tests). `src/engine/poppetjes.ts` — instelling Eenvoudige poppetjes (per toestel, ook automatisch).
- `src/editor/animatie.ts` — editor-animatie: lijnen met stapnummers ↔ animatiestappen (`lijnenNaarAnimatie`, `animatieNaarLijnen`), `afspeelTekening` (gebruikt in AnimatieSpeler/Miniatuur), meldingen per lijn (ook fysieke check).
- `src/i18n/` — taal (`taal.ts`: keuze, Automatisch, herladen), `t.ts` (t, aantal, lijstTekst, getal), `en.ts` (Engels), `zin.tsx` (**vet**); `src/help/inhoud.ts` + `src/screens/Help.tsx` — Help; `src/data/vertaling.ts` + `src/data/en/` — Engelse oefenteksten.
- `src/data/leeftijden.ts` — leeftijdsgroepen (`Oefening.leeftijden`, `pastBijLeeftijd`); mini-oefeningen `veld-mt-…` in `tools/nieuw/mini-030a–d.cjs` met `mini-hulp.cjs`.
- Zichtbare namen (0.31.1): Teamtraining (code: training) en Circuittraining (code: club/clubtraining). Routes, sleutels en collecties houden de oude namen; alleen tekst in `t()` en `en.ts` gebruikt de nieuwe.
- `src/styles/start.css` — startscherm. `src/clubtraining/` — Circuittraining (0.31.0, flexibel sinds 0.32.0): `clubtraining.ts` puur (`onderdelenVan`, `clubPlan` = fases, stations en rondes, partijvelden, materiaal, sjablonen, deellink, timer), `opslag.ts`; schermen `src/screens/club/`. Zonder `onderdelen` is een training de Mini Talents-opzet. Deellink `#/c/<code>` werkt zonder installeren (zie `App.tsx`).
- Deellinks (0.31.3): `src/engine/deellink.ts` (korte link `#/d/<code>`, `deelInhoud`, `haalLink`, eigen links), `src/screens/GedeeldLink.tsx` (`GedeeldLink`, `LinkFout`, `InstalleerMelding`, `DeelPaneel`, `MijnLinks`). Lange links gecomprimeerd in `naarBase64Url` (code begint met z). Op localhost alleen korte links met de emulator of `trainersapp.echteLinks=1`.
- Delen met team (0.31.2): `TeamItem.soort` ook `clubtraining`; `src/screens/club/TeamClub.tsx` en `ClubWeergave` (ook de trainerslink); `src/eigen/meenemen.ts` (`meeTeNemen`: eigen en team-oefeningen gaan als kopie mee), `src/screens/eigen/GedeeldeOefening.tsx` (link `#/o/…`), `LinkOpenen` in `screens/training/onderdelen.tsx`, `src/components/OefeningBlokken.tsx`.
- `src/engine/platform.ts` — toestel/browser + `kiesScherm` (installatiescherm of app); `src/screens/installeren/`.
- `src/editor/editor.ts` — pure editorlogica (palet, aanraken, slepen/draaien/maat, lijnen, ongedaan maken, benodigdheden, bevriezen); `src/eigen/` — eigen oefeningen (opslag, kopiëren, delen); `src/screens/eigen/` — lijst, nieuw, Tekenen, Gegevens.
- `src/styles/thema.css` — veld/teamkleuren (vast) + standaard app-kleuren; `src/engine/thema.ts` — clubkleuren (8 thema's × licht/donker), toegepast als CSS-variabelen. Gebruik in CSS `--primair-tekst` voor de themakleur als tekst (niet `--primair`), en `--op-…` voor tekst op een gekleurd vlak (nooit `#fff`).
- `src/engine/favorieten.ts`, `src/engine/filters.ts`, `src/components/Filters.tsx` — favorieten en de filterbalk.
- `src/training/genereren.ts` — Training genereren (puur); `src/screens/training/TrainingGenereren.tsx`.
- `src/anim/doelnet.ts` — doelnet (gaten, koppelen aan een goal); `src/engine/exporteren.ts` — exporteren/importeren.
- `src/components/Illustraties.tsx` — getekende tegelplaatjes (Spelers, Keepers, bal zoals in het logo); `CategoriePlaatje.tsx` — klein plaatje per categorie (nieuwe categorie = ook een plaatje, getest in `tests/versie-026.test.ts`).
- `src/wedstrijd/` — opstellingen, borden, spelhervattingen, voorbeeldtactieken (`tactieken.ts`, bouwhulp `Opzet`) en voorbeeldhervattingen (`hervattingVoorbeelden.ts`), samen in `bibliotheken.ts`; schermen generiek in `screens/wedstrijd/Tactieken.tsx` (puur) en opslag; `src/screens/wedstrijd/` (OpstellingVeld met slepen, BordTekenen = `Editor` uit `screens/eigen/Tekenen.tsx` met een `EditorBron`).
- Keuzes die de gebruiker niet kon beantwoorden: PLAN.md → "Keuzes zonder overleg".
- Nieuwe ingebouwde oefeningen (met Engelse tekst, zie Werkwijze): als bouwscript in `tools/nieuw/` (zie `spelers-027a/b/c.cjs`, `spelers-026a/b/c.cjs`, `keepers-024a/b/c.cjs`; Engels in een `en`-blok per oefening, dat `zet` naar `src/data/en/` schrijft; objecten en stappen uit `bouwstenen.cjs`, opslaan met `hulp.cjs`), daarna `npm test -t <id>` en `tools/e2e/nieuw.mjs`.
- 0.32.2: pion in de hand (`inHand` + `losLaten`, in 2D net naast de houder), loopwijze `afremmen` (laag stilstaan via `gezet`), `tempo` op een loop (`versnellen`, `uitlopen`, `gelijkmatig`; de standaard begint traag en is halverwege het snelst, dus voor lange routes `gelijkmatig`). Een vaste route die altijd te zien is: `tekening.lijnen` zonder `stap`, met `spoor: false` op de loper.
- 0.33.0: `truc` (balactie op de plek: binnenkant, buitenkant, zool, cruijff, met `voet`, en `kijk` of `naar`; een schaar is een `schijn`); `zonderKeepers` op een oefening (twee grote goals met keepers, maar het kan ook op kleine goals: niet weggefilterd bij 0 keepers). Circuittraining: `Onderdeel.oefeningen`, lees met `oefeningenVan`, schrijf met `metOefeningen`, `oefeningTijden`, `BlokOefeningen`, `ClubBlok`.
- 0.33.1: trainers in Circuittraining: `trainerKeuzes`, `trainerIndeling`, `rondePlekken` (per ronde elke plek met trainers), `botsingen`, `mijnRondes`, `zetPlekTrainers`, `verplaatsTrainer`; schermen `src/screens/club/trainers.tsx`; Ik ben… in `ClubGedeeld.tsx`. `stationTrainers`/`veldTrainers` zijn de oude keuzes van vóór 0.33.1.
- 0.34.0: trainers per dag (`perDag`, `opDag`, `zetDagTrainers`, `zetModusOveral`, `zonderIndelingOveral`, `src/screens/club/dag.tsx`) en trainersrooster (`src/clubtraining/rooster.ts`: `groepenOp`, `roosterVoor`, `vulVolgensRooster`, `volgendeWeek`; schermen `src/screens/club/Rooster.tsx`, store `rooster` in `clubtraining/opslag.ts`, sync-collectie `rooster`, team-item `rooster`).
- 0.34.3: per dag een eigen opzet (`DagTrainers.onderdelen` in `perDag`, `eigenOpzet`, `maakEigenOpzet`, `zetDagOpzet`, `alleOnderdelen`, `wijzigOnderdeel`, `metAlleOefeningIds`; `opDag` geeft de opzet van de dag; in de deellink `o` per dag, id's `d2o1` …). Sjabloon Mini Talents + loopcoördinatie is weg. Browsertest `tools/e2e/versie-0343.mjs` (blad `blad-0343.png`).
- 0.34.2: Samen met een deel van de groepjes (`Onderdeel.groepjesSamen`, `samenPer`, `inRotatie`, `eenheden`, `Station.samen`, `stationTitel`, `plekNaam`, `samenMeldingen`); in de deellink het derde veld van een onderdeel (0 stations, 1 alle, ≥ 2 zoveel samen). Browsertest `tools/e2e/versie-0342.mjs` (blad `blad-0342.png`).
- 0.34.1: mini's O6 (`mini-3-5`) en O7 (`mini-5-7`), alleen de namen veranderden. Indeling in `tools/nieuw/mini-indeling-0341.cjs` (opnieuw draaien na `mini-030a–d.cjs`); nieuwe oefeningen `veld-o7-…` en `veld-o6-…` in `tools/nieuw/mini-0341-o7.cjs` en `mini-0341-o6.cjs`; `draaiKwart` in `mini-hulp.cjs`; eisen in `tests/versie-0341.test.ts`.
- Materiaal in beweging (0.30.0): `pakObject`, `legObject`, `keerOm`, `valOm`, `zetOp` (tijdlijn `Stand.materiaal`, in 2D en 3D), bal op een pion (`opHoogte`), los `hesje` met `drager`; verder `voetOpBal`, `tiktak`, zithouding `op-bal`, pass met `onderdoor` (horde), klein goal met `zonderNet`.
- Acties voor personen (bouwstenen): loop/dribbel (via, om, manier — ook `verdedigend` = lage, half zijwaartse 1-tegen-1-houding —, kijk), pass/schot (worp — ook `tik` = met één hand wegtikken, `inworp` = met twee handen achter het hoofd ingooien —, hoogte, stuitOp, duikNaar, uitkomen+stompNaar (met stuitOp: stuitbal naar voren aanvallen en wegstompen), blokt+blokSoort ster/knie/voeten, terug; keeper + `worp: 'voet'` + `direct` op een hoge bal = kopbal), zitten (kniezit, hurkzit, zit, zit-opgetrokken, buik, halfknie), opstaan, grondtik, pak, springen, draai (kijk/naar, sprong), aantikken (doel of punt, met hand/voet). Een bal naar jezelf opgooien = pass van en naar dezelfde persoon.
- Weggehaalde ingebouwde oefeningen gaan naar `src/data/oefeningen/archief.json` (`verwijderd: true`): niet in de bibliotheek, wel via `vindOefening`. Nooit echt wissen (oude trainingen/links/teams).

## Regels voor nieuwe en aangepaste oefeningen
- **Voer een oefening uit zoals de gebruiker hem beschrijft.** Kan het poppetje of de tijdlijn iets nog niet, bouw dat dan bij
  (als bouwsteen, met tests) in plaats van de oefening te vereenvoudigen. Alleen als het echt niet kan: eerst melden.
- Een keeper kopt alleen buiten de zestien; binnen de zestien vangt, stompt of tipt hij (getest in `tests/versie-024.test.ts`).
- Animatie in 2D en 3D, organisatie, benodigdheden, spelersNodig/keepersNodig, doorwisselbaar of vast aantal, 2–4
  coachpunten, Makkelijker en Moeilijker, realistische afstanden en de beste startcamera.
- Categorieën die de gebruiker noemt; zo min mogelijk, geen maximum.
- Meerdere keepers: laat het doorwisselen zien. De trainer telt niet mee bij keepersNodig.
- Nieuwe poppetjes (0.21.0): duiken, opstaan, vangen, stompen en blokken moeten er natuurlijk uitzien. Ontbreekt een houding
  of actie, voeg die toe als bouwsteen, met tests (zo kwamen `draai` en `aantikken` erbij in 0.22.0).
- Alle tests slagen (afstand, balbezit, keeper, fysieke check, poppetje). Screenshots en close-ups in 3D en 2D van elke
  nieuwe of aangepaste oefening (`tools/e2e/nieuw.mjs`, `tools/e2e/pas.mjs`), kritisch bekijken en verbeteren.
- Aanpassen = zelfde id houden. Weghalen alleen via het archief (`tools/nieuw/archiveer.cjs`), zodat trainingen, links,
  teamitems en favorieten blijven werken.

## Browsertests (`tools/e2e/`, preview op poort 4184 moet draaien; geef een URL mee om online te testen)
- `schermen.mjs` — alle schermen op 5 formaten (als geïnstalleerde app), offline (ook 3D), 2D/3D-knop.
- `installeren.mjs [url]` — 0.29.1/0.31.3: pijl nergens over tekst of knoppen, ook met de Safari-balk (`blad-inst-balk.png`); installatiescherm met de echte user-agents uit `useragents.json` (iPhone/iPad/Android/in-app/laptop, telefoon- en tabletformaat, NL en EN: pijl in beeld, niets afgekapt), Lukt het niet?, Andere browser of telefoon, browserkeuze onthouden, Je hebt de app al, Gelukt, standalone = app. Bladen: `blad-inst-<groep>-<taal>.png`, `blad-inst-hulp.png`, `blad-inst-status.png`. Nieuwe browser of app: user-agent in `useragents.json` + sleutel in `stappen.tsx`.
- `drie-d.mjs` — 3D-momenten van beide oefeningen + camerastanden (`blad-3d-*.png`), cameragrenzen, beeldsnelheid.
- `training.mjs [url]` — Training maken: hele flow op telefoon/tablet/laptop (kiezen, slepen met de vinger, trainingsmodus met vegen, delen, opslaan, dupliceren, verwijderen, offline). Blad: `blad-training.png`.
- `editor.mjs [url]` — editor op telefoon/tablet (vinger, ook twee vingers) en laptop (muis), gegevens, bibliotheek, delen naar een ander toestel, kopie met animatie. Blad: `blad-editor.png`. Testhaakje `window.__editor` alleen met localStorage `trainersapp.testEditor=1`.
- `start.mjs [url]` — startscherm op 9 formaten (iPhone SE ook liggend, 320 px, tablet, laptop) in 4 thema's: volgorde, alles in beeld, geen horizontaal scrollen; tandwiel op meerdere maten. Bladen: `blad-start-formaten.png`, `blad-start-themas.png`, `blad-start-tandwiel.png`.
- `thema.mjs [url]` — alle clubkleuren in licht en donker (startscherm) + schermen in een paar thema's; veld blijft gelijk; keuze onthouden; automatisch. Bladen: `blad-thema-start.png`, `blad-thema-schermen.png`.
- `filters.mjs [url]` — filterbalk, favorieten, aantallen, lege melding, Training maken, op telefoon/tablet/laptop. Blad: `blad-filters.png`.
- `update.mjs <oude-build> [nieuwe-build]` — update van een geïnstalleerde app (eigen server op poort 4190).
- `keeper-momenten.mjs [url] [filter]` — 3D-close-ups op de sleutelmomenten (worp, duik, vang, tip); rekent de momenten zelf uit met de tijdlijn (via jiti). Camera op de keeper via het testhaakje `window.__camera3d` (alleen met `trainersapp.testCamera=1`).
- `oefeningen.mjs [url] [filter]` — per oefening 3D/2D-screenshots (`blad-oef-<map>-<categorie>.png`), aantallen per categorie, "Keeper nodig".
- `online.mjs [url]` — account, eerste keer samenvoegen, teams (code, delen, rollen) met twee testaccounts tegen de
  Firebase-emulator (`npm run emulator` moet draaien; zet `trainersapp.emulator=1`). Blad: `blad-online.png`.
  Met `ECHT=1` tegen het echte project (`toptraining-40a90`): ruimt de testaccounts vooraf en na afloop op via de app.
- `tools/firebase-leeg.cjs` — alleen lezen: telt accounts, teams, deellinks en documenten in het echte project; na testen moet er alleen het eigen account staan (met zijn eigen teams). `tools/firebase-anoniem-opruimen.cjs <tijd>` haalt anonieme accounts van een test weg; met `--ouder-dan 30 [--proef]` verlopen links en oude anonieme accounts zonder links (ook maandelijks in `.github/workflows/anoniem-opruimen.yml`).
- `online-opruimen.mjs [url]` — testaccounts test1/test2@example.com in het echte project verwijderen (via "Account verwijderen").
- `deel-a.mjs [url]` — 0.17.0: Training maken (4+1, datumveld, geen lege), Training genereren (slepen, Andere oefening, geen passende), looplijnen-knop, doelnet 2D/3D + palet, Spelers/geen Combinatievorm, exporteren/importeren. Blad: `blad-deel-a.png`.
- `deel-b.mjs [url]` — 0.18.0: Wedstrijd-tegel, opstelling (slepen/tikken/ruilen/bank/positie verslepen, formatie, spelvorm, namen, link), tactiekbord vanuit opstelling (editor, lijnen wissen, 2D/3D), spelhervattingen (voorbeeld + beginsituatie), gedeelde link op een ander toestel. Blad: `blad-deel-b.png`.
- `versie-019.mjs [url]` — 0.19.0: genereren vanuit een training (bug), automatische naam, aantallenfilter, nieuw tactiekbord per spelvorm/formatie, namen (editor + bord, 2D/3D), weggehaalde oefening (melding, oude training), categorieën. Blad: `blad-019.png`.
- `taal.mjs [url]` — 0.25.0: 17 schermen op 5 formaten in het Engels en Nederlands (geen Nederlands in het Engels, niets afgekapt, geen horizontaal scrollen), taal wisselen, Automatisch, installatiescherm in het Engels. Bladen: `blad-taal-en.png`, `blad-taal-nl.png`, `blad-taal-se.png`.
- `versie-021.mjs [url]` — 0.21.0: snelheidsknop (gemeten tempo), Eenvoudige poppetjes (instelling + automatisch bij een traag toestel), 3D in trainingsmodus/tactiekbord 11v11 met namen/spelhervatting. Blad: `blad-021.png`.
- `tactieken.mjs schermen [url]` — 0.28.0: Voorbeeldtactiek → lijst → voorbeeld (11/8, uitleg) → eigen bord / Aanpassen, Help; iPhone SE en laptop in NL/EN. Blad: `blad-tactieken.png`. `tactieken.mjs borden [url] [filter]` — alle 25 borden in 3D en 2D (`blad-tactiek-<groep>.png`, `blad-tactiek-se.png`). Met `hschermen`/`hborden` hetzelfde voor de 27 spelhervattingborden (0.29.0).
- `versie-026.mjs [url]` — 0.26.0: categorielijst met plaatjes, Verdedigen en omschakelen, Training genereren en Help in NL/EN op iPhone SE en laptop. Blad: `blad-026.png`.
- `animaties.mjs <label> [url] [scenes|snelheid|laden]` — vaste 3D-momenten (`anim-<label>-*.png`, met `voor` en `na` ook vergelijkingsbladen), beeldsnelheid 11 tegen 11 (processor 1/4/6× trager, ook eenvoudig) en laadtijd.
- `pas.mjs set <lopen|keeper|spelers|kort>` of `pas.mjs <id> <wie> <t0> <t1>` — filmstrip van één persoon van dichtbij/opzij (voeten, knieën, armen beoordelen). Blad: `blad-pas-<naam>.png`.
- `versie-030.mjs [url]` — 0.30.0: leeftijdsfilter (ook onthouden), bij de oefening, Training maken (oranje markering), genereren, 1 tegen 1 en Help in NL/EN op iPhone SE en laptop. Blad: `blad-030.png`.
- `versie-0311.mjs [url]` — 0.31.1: startscherm op 7 formaten in NL/EN, hernoemde schermen zonder oude namen, oude clublink. Bladen: `blad-0311-nl.png`, `blad-0311-en.png`, `blad-0311-schermen.png`.
- `deellinks.mjs [url]` — 0.31.3: elke soort deellink maken (zonder account en met test1/test2), openen zonder app in WhatsApp-browser op iPhone en Android in NL/EN, onvolledige en kapotte links, lange terugval, oude link, intrekken, geblokkeerd deelmenu (`npm run emulator`). Blad: `blad-deellinks.png`. Met `ECHT=1` tegen het echte project; daarna `node tools/firebase-anoniem-opruimen.cjs <starttijd>`.
- `team-delen.mjs [url]` — 0.31.2: delen met team met twee testaccounts in NL/EN op telefoon en laptop (`npm run emulator`): alles wat je kunt maken heeft beide knoppen, openen, kopiëren, aanpassen, terugtrekken, beheerder verwijdert, oefeninglink. Bladen: `blad-team-<taal>-<formaat>.png`. Met `ECHT=1` tegen het echte project (NL, laptop), testaccounts vooraf en na afloop weg.
- `sync-race.mjs [url]` — 0.31.2/0.31.3: naam typen op verschillende snelheden, bord maken + herladen, favorieten, afvinken, thema, spelerslijst op een nieuw toestel, ingelogd tegen de emulator (`SNEL=1` slaat de eerste twee over).
- `versie-0320.mjs [url]` — 0.32.0: circuittraining samenstellen op iPhone SE en laptop in NL/EN: onderdelen toevoegen, weghalen en verslepen, duur, sjabloon, rotatie (voorbeeld 2 groepjes), rondetimer, oude training, deellink. Blad: `blad-0320.png`. `TAAL=nl` voor één taal.
- `versie-0330.mjs [url]` — 0.33.0: meerdere oefeningen in één blok op iPhone SE en laptop in NL/EN: toevoegen, richttijd, verslepen, plan, Oefening 1, 2, 3 openen, materiaal, rondetimer, trainerslink in de WhatsApp-browser op iPhone en Android. Blad: `blad-0330.png`. `TAAL=nl` voor één taal.
- `versie-0331.mjs [url]` — 0.33.1: 10 trainers over 4 stations op iPhone SE en laptop in NL/EN: verdeling, aanvinken met botsing, verplaatsen, Automatisch verdelen, partijvelden, rotatie, timer, meelopen, oude training, trainerslink in de WhatsApp-browser op iPhone en Android met Ik ben…. Blad: `blad-0331.png`. `TAAL=nl`, `EMULATOR=1` (korte link) of `ECHT=1` (echte site, daarna `firebase-anoniem-opruimen.cjs`).
- `versie-0340.mjs [url]` — 0.34.0: groep kiezen vult per dag de trainers uit het rooster, dag wisselen, aanpassen voor één week, vaste plek Loopcoördinatie, plan/rotatie/timer per dag, Naar volgende week, trainer toevoegen in het rooster, trainerslink met dagkeuze en Ik ben… per dag (WhatsApp iPhone/Android), iPhone SE en laptop in NL/EN. Blad: `blad-0340.png`. `TAAL=nl`, `EMULATOR=1`, `ECHT=1`. `team-delen.mjs` deelt ook het rooster.
- `club.mjs [url]` — 0.31.0: Clubtraining op iPhone SE en laptop in NL/EN: leeg opruimen, genereren, kiezen, veldplan, rotatie, afvinken, timer, volgende week, deellink op een niet-geïnstalleerde telefoon, station in 3D/2D, 3/5/8 groepjes. Blad: `blad-club.png`.
- `nieuw.mjs <id,id,…> [blad] [url]` — close-ups van (nieuwe) oefeningen: 3D op vier momenten + 2D, op één blad (`blad-<naam>.png`).
- `hulp.mjs` — `alsGeinstalleerd(page)` (standalone nadoen), `zetTijd`, `blad` (screenshots naast elkaar).
  Chrome draait met de echte videokaart (`--use-angle=d3d11`); `trainersapp.3dAltijd=1` zet de 2D-terugval uit in tests.

## Online (Firebase, fase 7)
- `src/online/` (lui geladen): `config.ts` (webconfig; `null` = online verborgen), `firebase.ts`, `sync.ts`,
  `samenvoegen.ts` (puur), `teamsOnline.ts`, `online.ts` (regisseur). Zonder Firebase: `src/engine/account.ts`, `teams.ts`.
- `npm run emulator` / `npm run test:online` (tests in `tests/online/`, Java 21 in `C:\Users\woutv\tools\java` via
  `tools/firebase.mjs`). Regels: `firestore.rules`.
- Echt project: `toptraining-40a90` (alias `live`); regels zetten met `npm run regels:live`. Firestore TTL kan niet op het gratis abonnement. Nieuwe regels hebben
  ~1 minuut nodig voor ze overal gelden ("geen toegang" vlak na een deploy).
- **Testgegevens alleen neutraal:** test1@example.com, test2@example.com …, namen "Testtrainer 1/2". Nooit echte namen of
  adressen. Na testen tegen het echte project: testaccounts en hun data verwijderen.

## Valkuilen
- dnd-kit met de vinger in e2e: eerst `document.activeElement.blur()` (een actief invoerveld laat de pagina springen), en één plek per keer slepen (bij de rand scrolt de pagina mee).
- Eigen toestellen: de laatste versie overschrijft de andere, dat is zo bedoeld (PLAN.md, 0.32.1). Geen probleem om op te lossen.
- Browsertests tegen de echte site maken bij Delen echte links en anonieme accounts: daarna `tools/firebase-anoniem-opruimen.cjs <starttijd>` en `tools/firebase-leeg.cjs`.
- Sync: `bekend` = wat Firestore bevestigd heeft, niet wat we stuurden; zolang iets `onderweg` is telt de eigen versie, en er wordt pas beslist na een stand die `zekerVanServer` is (ook `fromCache: false` kan met een eigen schrijfactie onderweg nog alleen die bevatten). Volgordes testen in `tests/sync-volgorde.test.ts` (nep-Firestore).
- Windows-klembord in e2e geeft `\r\n`: splits een deelbericht op `/\r?\n/`.
- "Received message larger than max" in de online-tests is een kapot frame van de emulator, geen groot bericht (PLAN.md, 0.31.2); de test krijgt alleen dan een herkansing.
- `innerText` geeft tekst met `text-transform: uppercase` in hoofdletters terug: vergelijk in e2e zonder hoofdlettergevoeligheid.
- Techniek is alleen balcontrole (0.33.0): geen schot op doel, geen partijvorm (`tests/versie-0330.test.ts`).
- Categorieën: zo min mogelijk, geen maximum; spelers-oefeningen zonder bal → Loopcoördinatie (niet Spelletjes/Techniek), behalve Tikkertje met hesje en Overlopertje. De eerste categorie = het bestand.
- Vitest onthoudt `import.meta.glob`: na een **nieuw** databestand eerst `rm -rf node_modules/.vitest-cache`, anders ziet `npm test` het bestand niet.
- `@volgende` in een herhaling is cyclisch: de lijst moet precies de volgorde van passeerders zijn (simuleer de rijen even op papier).
- Na `JSON.stringify` herschrijven van een databestand kloppen `sed`-zoekopdrachten niet meer (andere opmaak): wijzig data met een klein node-script.
- Overlap in 3D (Schuin) ontstaat als spelers achter elkaar in de kijkrichting staan: zet rijen/duels liever naast elkaar.
- Een oefening draaien (kwartslag) kan met een klein node-script: (x, y) → (y, breedte − x), hoeken −90, zone breedte/lengte wisselen. Vergeet geen punt-velden in acties (`naar`, `via`, `stuitOp`, `terug`, `terugNaar`, `afloopNaar`, `duikNaar`, `stompNaar`).
- Keepers die rouleren: geen `verdedigt` geven (dan loopt de keeper na zijn actie vanzelf terug naar zijn doel).
- Bash-heredoc met `cat > bestand` zonder heredoc erachter blijft hangen op invoer: schrijf scripts met Write.
- Keeper: duik en bal op elkaar afstemmen met `duikNaar` op de pass (niet met losse `start`-tijden): een worp schuift vanzelf op (oppakken + uithalen), waardoor losse tijden niet meer kloppen.
- Knoppen die de opgeslagen training wijzigen: altijd uitgaan van de nieuwste versie uit `trainingen.haal(id)`, niet van de training uit de render (anders telt snel achter elkaar tikken maar één keer).
- Fysieke controle (`tests/fysiek.test.ts`): geen bal laag door/over materiaal of door een speler die hem niet krijgt, niemand door materiaal (ladder/horde/ring/stok alleen met parcours-loopwijze). Zet een verdediger nooit precies op de passlijn; verleg eerder de route of de beginplek.
- Nieuwe oefening: ook `doorwisselbaar` invullen (bij `false` een `meerSpelers`-tip "Met meer spelers: …").
- Puppeteer: aanraken (CDP `Input.dispatchTouchEvent`) werkt alleen op de pagina die vooraan staat; na een tweede browsercontext een nieuwe pagina openen.
- Prettier staat niet in het project: gebruik `npx prettier --single-quote --print-width 200` (anders dubbele aanhalingstekens).
- Eigen oefeningen bewaren alleen de tekening; animatie komt pas bij het afspelen (`afspeelTekening`). Geef een speler nooit elke render een nieuw tekening-object (`useMemo`), anders bouwt 3D steeds opnieuw op.
- Nieuwe oefening: `npm test` controleert ook of de bal alleen via een pass/schot van speler wisselt, en afstanden (personen ≥ 1,5 m, niet door pionnen/paaltjes/hoedjes); daarna `oefeningen.mjs` en de bladen bekijken.
- Op een telefoon-/tabletformaat in de browser zie je alleen het installatiescherm: in tests `alsGeinstalleerd(page)`,
  in de preview-pane een laptopformaat gebruiken of "Gewoon in de browser gebruiken" kiezen.
- De ingebouwde browser-pane maakt na scrollen vaak lege/verkeerde screenshots → `tools/e2e/schermen.mjs` (puppeteer).
- Preview + service worker: na een nieuwe build eerst de service worker afmelden of `?r=…` gebruiken, anders zie je de oude versie.
- Firestore in e2e: `waitUntil: 'networkidle0'` wordt nooit rustig → `domcontentloaded` + wachten op elementen.
- Firestore-listeners niet starten/stoppen binnen een snapshot-callback (gaat mis bij wachtende schrijfacties) → `later()`;
  "geen lid/team weg" alleen besluiten op snapshots van de server (niet `fromCache`).
- Objecten uit Firestore hebben andere veldvolgorde: vergelijken via een vaste vorm, anders blijft sync eindeloos schrijven.
- 3D-poppetje: houding alleen in `poppetje.ts` aanpassen en dan `npx vitest run tests/poppetje.test.ts` (alle oefeningen: grond, gewrichten, handen/voet bij de bal, glijden) + `tools/e2e/pas.mjs set …` bekijken. Testhaakjes (alleen met `trainersapp.testCamera=1`): `__camera3d(x, y, afstand, kijkrichting?, hoogte?)`, `__info3d()`, `__three3d`.
- three.js: doorzichtige `DoubleSide`-materialen altijd met `forceSinglePass: true` (anders elk beeld twee rondes + shaderkeuze).
- Tekstlabel in een tekening: `breedte` = maat in 3D (standaard 4 m), lange tekst krimpt vanzelf; Engels in `TEKENING_TEKST`.
- Spelhervatting in de bibliotheek: `new Opzet(vorm, 'half')` (goal bovenaan, camera achter het goal); muurspelers in `muur` van de versie; een pass vanaf de zijlijn wordt vanzelf een inworp. Test: `tests/versie-029.test.ts`.
- Nieuwe voorbeeldtactiek: in `tactieken.ts` met `Opzet` (lijnen starten waar de speler op dat moment staat); `tests/versie-028.test.ts` controleert meldingen, fysiek en ≥ 1,5 m; daarna `tools/e2e/tactieken.mjs borden … <id>` bekijken. Teksten via t() + Engels in `en.ts`.
- Druk zetten of mandekking recht achter de balbezitter (in de kijkrichting) geeft overlappende rugnummers in 3D: laat de
  drukzetter schuin opzij aanlopen (`loop` naar een punt) of draai de oefening een kwartslag (`draaiKwart` in `spelers-027b.cjs`).
- Nieuwe collectie in de sync: ook `firestore.rules` (en `npm run regels:live`), `online.ts` (wisselen, samenvoegen, account verwijderen) en `tests/online/hulp.ts`.
- `String.replace` met `$$` in de nieuwe tekst geeft één `$`: gebruik in scripts een functie als vervanging.
- Nieuw materiaal in 3D dat beweegt moet in `beweegbaar`/`beweegt` staan (render3d zet de matrix van al het andere vast). Rijen in `schuin`: gebruik `richting: 60`, anders staan de kinderen achter elkaar in beeld.
- Een bal "bij" een speler ligt rekenkundig 0,55 m voor de speler; de 2D-renderer duwt hem visueel naar de rand
  van het poppetje (niet over het rugnummer).
