# TopTraining — werkafspraken voor Claude

(App-naam TopTraining; repo, link /trainersapp/ en opslagsleutels `trainersapp.…` blijven zo.)

PWA (Vite + React + TS) voor voetbaltrainers: oefenbibliotheek veld/keepers met animaties. Visie, datamodel,
fasering en besluiten: **PLAN.md** (eerst lezen).

## Werkwijze
- Communiceer in het **Nederlands**; alle app-tekst is Nederlands.
- Bouwen in kleine stappen (fases uit PLAN.md); na elke stap test de gebruiker op de telefoon → wachten op akkoord.
- Per stap: bouwen → zelf testen (`npm test`, `npm run build`, browsertests hieronder) → commit + push →
  korte uitleg, online link, testlijst. PLAN.md-status bijwerken.
- Keuzes die gebruik of uitstraling raken en niet in PLAN.md staan: eerst vragen.

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
- `src/engine/platform.ts` — toestel/browser + `kiesScherm` (installatiescherm of app); `src/screens/installeren/`.
- `src/editor/editor.ts` — pure editorlogica (palet, aanraken, slepen/draaien/maat, lijnen, ongedaan maken, benodigdheden, bevriezen); `src/eigen/` — eigen oefeningen (opslag, kopiëren, delen); `src/screens/eigen/` — lijst, nieuw, Tekenen, Gegevens.
- `src/styles/thema.css` — veld/teamkleuren (vast) + standaard app-kleuren; `src/engine/thema.ts` — clubkleuren (8 thema's × licht/donker), toegepast als CSS-variabelen. Gebruik in CSS `--primair-tekst` voor de themakleur als tekst (niet `--primair`), en `--op-…` voor tekst op een gekleurd vlak (nooit `#fff`).
- `src/engine/favorieten.ts`, `src/engine/filters.ts`, `src/components/Filters.tsx` — favorieten en de filterbalk.
- `src/training/genereren.ts` — Training genereren (puur); `src/screens/training/TrainingGenereren.tsx`.
- `src/anim/doelnet.ts` — doelnet (gaten, koppelen aan een goal); `src/engine/exporteren.ts` — exporteren/importeren.
- `src/components/Illustraties.tsx` — getekende tegelplaatjes (Spelers, Keepers, bal zoals in het logo).
- `src/wedstrijd/` — opstellingen, borden, spelhervattingen (puur) en opslag; `src/screens/wedstrijd/` (OpstellingVeld met slepen, BordTekenen = `Editor` uit `screens/eigen/Tekenen.tsx` met een `EditorBron`).
- Keuzes die de gebruiker niet kon beantwoorden: PLAN.md → "Keuzes zonder overleg".
- Nieuwe ingebouwde oefeningen: als bouwscript in `tools/nieuw/` (zie `keepers-024a/b/c.cjs`, `keepers-023a/b/c.cjs`, `spelers-023.cjs`; objecten en stappen uit `bouwstenen.cjs`, opslaan met `hulp.cjs`), daarna `npm test -t <id>` en `tools/e2e/nieuw.mjs`.
- Acties voor personen (bouwstenen): loop/dribbel (via, om, manier, kijk), pass/schot (worp — ook `tik` = met één hand wegtikken —, hoogte, stuitOp, duikNaar, uitkomen+stompNaar, blokt+blokSoort ster/knie/voeten, terug; keeper + `worp: 'voet'` + `direct` op een hoge bal = kopbal), zitten (kniezit, hurkzit, zit, zit-opgetrokken, buik, halfknie), opstaan, grondtik, pak, springen, draai (kijk/naar, sprong), aantikken (doel of punt, met hand/voet). Een bal naar jezelf opgooien = pass van en naar dezelfde persoon.
- Weggehaalde ingebouwde oefeningen gaan naar `src/data/oefeningen/archief.json` (`verwijderd: true`): niet in de bibliotheek, wel via `vindOefening`. Nooit echt wissen (oude trainingen/links/teams).

## Regels voor nieuwe en aangepaste oefeningen
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
- `installeren.mjs` — installatiescherm per toestel, standalone = app, computerkeuze onthouden.
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
- `online-opruimen.mjs [url]` — testaccounts test1/test2@example.com in het echte project verwijderen (via "Account verwijderen").
- `deel-a.mjs [url]` — 0.17.0: Training maken (4+1, datumveld, geen lege), Training genereren (slepen, Andere oefening, geen passende), looplijnen-knop, doelnet 2D/3D + palet, Spelers/geen Combinatievorm, exporteren/importeren. Blad: `blad-deel-a.png`.
- `deel-b.mjs [url]` — 0.18.0: Wedstrijd-tegel, opstelling (slepen/tikken/ruilen/bank/positie verslepen, formatie, spelvorm, namen, link), tactiekbord vanuit opstelling (editor, lijnen wissen, 2D/3D), spelhervattingen (voorbeeld + beginsituatie), gedeelde link op een ander toestel. Blad: `blad-deel-b.png`.
- `versie-019.mjs [url]` — 0.19.0: genereren vanuit een training (bug), automatische naam, aantallenfilter, nieuw tactiekbord per spelvorm/formatie, namen (editor + bord, 2D/3D), weggehaalde oefening (melding, oude training), categorieën. Blad: `blad-019.png`.
- `versie-021.mjs [url]` — 0.21.0: snelheidsknop (gemeten tempo), Eenvoudige poppetjes (instelling + automatisch bij een traag toestel), 3D in trainingsmodus/tactiekbord 11v11 met namen/spelhervatting. Blad: `blad-021.png`.
- `animaties.mjs <label> [url] [scenes|snelheid|laden]` — vaste 3D-momenten (`anim-<label>-*.png`, met `voor` en `na` ook vergelijkingsbladen), beeldsnelheid 11 tegen 11 (processor 1/4/6× trager, ook eenvoudig) en laadtijd.
- `pas.mjs set <lopen|keeper|spelers|kort>` of `pas.mjs <id> <wie> <t0> <t1>` — filmstrip van één persoon van dichtbij/opzij (voeten, knieën, armen beoordelen). Blad: `blad-pas-<naam>.png`.
- `nieuw.mjs <id,id,…> [blad] [url]` — close-ups van (nieuwe) oefeningen: 3D op vier momenten + 2D, op één blad (`blad-<naam>.png`).
- `hulp.mjs` — `alsGeinstalleerd(page)` (standalone nadoen), `zetTijd`, `blad` (screenshots naast elkaar).
  Chrome draait met de echte videokaart (`--use-angle=d3d11`); `trainersapp.3dAltijd=1` zet de 2D-terugval uit in tests.

## Online (Firebase, fase 7)
- `src/online/` (lui geladen): `config.ts` (webconfig; `null` = online verborgen), `firebase.ts`, `sync.ts`,
  `samenvoegen.ts` (puur), `teamsOnline.ts`, `online.ts` (regisseur). Zonder Firebase: `src/engine/account.ts`, `teams.ts`.
- `npm run emulator` / `npm run test:online` (tests in `tests/online/`, Java 21 in `C:\Users\woutv\tools\java` via
  `tools/firebase.mjs`). Regels: `firestore.rules`.
- Echt project: `toptraining-40a90` (alias `live`); regels zetten met `npm run regels:live`. Nieuwe regels hebben
  ~1 minuut nodig voor ze overal gelden ("geen toegang" vlak na een deploy).
- **Testgegevens alleen neutraal:** test1@example.com, test2@example.com …, namen "Testtrainer 1/2". Nooit echte namen of
  adressen. Na testen tegen het echte project: testaccounts en hun data verwijderen.

## Valkuilen
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
- Een bal "bij" een speler ligt rekenkundig 0,55 m voor de speler; de 2D-renderer duwt hem visueel naar de rand
  van het poppetje (niet over het rugnummer).
