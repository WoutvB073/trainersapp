# De volgende stap – fase 1 (onderzoek, proef en plan)

Status: **fase 1 is klaar, er is niets live gezet.** Alles staat op de branch `volgende-stap` (bovenop 0.34.4) en in een aparte
voorbeeldversie. `main` en de echte app zijn niet aangeraakt. Fase 2 begint pas na jouw akkoord.

- **Testlink:** https://toptraining-40a90--volgende-stap-1ggjl77v.web.app/trainersapp/
- **Werkt tot:** 15 december 2026, 10:00 (30 dagen is het maximum; verlengen kan met `node tools/voorbeeld.mjs zet`).
- **Voorstel oefeningen:** `VOORSTEL-OEFENINGEN.md` (157 stuks om aan te vinken).
- **Screenshots:** map `fase1-beelden/` (zie het lijstje onderaan).

Inhoud: 1 voorbeeldversie en je gegevens · 2 opstelling slepen · 3 rugnummers · 4 installatiescherm · 5 ontwerprichtingen ·
6 oefeningen · 7 realistische animaties · 8 uitrol van fase 2 · 9 keuzes die jij moet maken · 10 wat je moet goedkeuren ·
11 keuzes zonder overleg · 12 tests en screenshots.

---

## 1. De voorbeeldversie en je gegevens

De voorbeeldversie is een **aparte build** van de app op een eigen adres (een voorbeeldkanaal van Firebase Hosting, gratis, verloopt
vanzelf). Hij staat los van de echte app op GitHub Pages.

**Hoe de echte gegevens beschermd zijn:** in de voorbeeld-build staat online helemaal uit. Er is geen inloggen, geen synchroniseren, er
zijn geen teams en geen korte deellinks. De gegevens van het Firebase-project zitten niet eens in de build (het bouwscript controleert
dat en weigert anders online te zetten). Alles wat je in de voorbeeldversie maakt, blijft op je toestel, onder het adres van de testlink.
De browsertest `tools/e2e/voorbeeld.mjs` heeft op de testlink gecontroleerd dat er tijdens het gebruik **geen enkel verzoek** naar
Firebase of Google gaat, ook niet bij Delen.

Verder:

- De voorbeeldversie heet **TopTraining voorbeeld** (kort: TT voorbeeld), zodat hij naast de echte app op je telefoon kan staan.
- Hij is niet vindbaar voor zoekmachines (`noindex`).
- Het gewone adres van Firebase Hosting (`toptraining-40a90.web.app`) is niet gebruikt en geeft nog steeds "niet gevonden".
- Onderaan elk scherm staat de **wisselknop voor het ontwerp** (Nu, A, B, C). Bij een oefening in 3D staat de schakelaar
  **Realistisch (proef)**. Beide bestaan alleen in de voorbeeldversie.
- Je eigen trainingen, opstellingen en account staan hier niet in: het is een leeg toestel. Deellinks die je hier maakt, wijzen naar de
  voorbeeldversie zelf.
- Weghalen kan altijd: `node tools/voorbeeld.mjs weg`.

---

## 2. Opstelling: slepen (gebouwd)

**Wat er mis was** (gemeten op iPhone SE met de vinger en op de laptop met de muis):

1. Het meebewegende naamkaartje zweefde 25 pixels boven de plek waar de speler echt terechtkwam. Je liet hem dus "ergens anders" los dan
   je zag.
2. Pakte je een speler bij zijn naam, dan sprong hij 25 pixels.
3. Liet je los op of vlak bij een andere speler (ook op zijn naam), dan werden de twee geruild in plaats van dat de speler daar kwam te
   staan.
4. Een wisselspeler die je naast een positie losliet, deed niets.
5. Lege posities stonden 24 pixels te laag getekend (een algemene opmaakregel raakte ze per ongeluk).

**Wat er nu gebeurt:** wat je ziet is waar hij landt. Tijdens het slepen staat er een doorschijnende kopie op de landingsplek, met
erbij wat er gaat gebeuren: "Ruilen met …", "In plaats van …", "Op positie 7" of "Naar de wissels". Kom je dicht bij een positie, dan
klikt de kopie zichtbaar vast. Dezelfde berekening wordt gebruikt voor het tekenen en voor het loslaten, dus het kan niet meer
verschillen. Je houdt de speler vast op de plek waar je hem pakte.

**Getest** met `tools/e2e/opstelling.mjs`: vinger op iPhone SE, vinger op een gewone telefoon, vinger en muis op een tablet, muis op de
laptop; in elk dertien situaties (vrij verplaatsen, ruilen, lege positie, wissel erin en eruit, bij de naam pakken, vlak naast een
ander loslaten, de rand van het veld).

---

## 3. Rugnummers per positie (gebouwd voor opstellingen en borden)

Het systeem: keeper 1, rechtsback 2, rechter centrale verdediger 3, linker centrale verdediger 4, linksback 5, controlerende
middenvelders 6 (rechts) en 8 (links), aanvallende middenvelder 10, rechtsbuiten 7, linksbuiten 11, spits 9.

Per formatie, per linie van links naar rechts (gezien vanaf het eigen doel; de keeper is altijd 1):

| Spelvorm | Formatie | Achter | Midden | Voor |
|---|---|---|---|---|
| 11 tegen 11 | 1-4-3-3 | 5 – 4 – 3 – 2 | 8 – **10** – 6 (10 staat hoger) | 11 – 9 – 7 |
| 11 tegen 11 | 1-4-4-2 | 5 – 4 – 3 – 2 | 11 – 8 – 6 – 7 | 10 – 9 |
| 11 tegen 11 | 1-3-4-3 | 5 – 3 – 2 | ruit: 8 links, 4 voor de verdediging, 10 achter de spits, 6 rechts | 11 – 9 – 7 |
| 11 tegen 11 | 1-4-2-3-1 | 5 – 4 – 3 – 2 | 8 – 6, daarvoor 11 – 10 – 7 | 9 |
| 8 tegen 8 | 1-3-3-1 | 5 – 3 – 2 | 11 – 6 – 7 | 9 |
| 8 tegen 8 | 1-2-3-2 | 4 – 3 | 11 – 6 – 7 | 10 – 9 |
| 8 tegen 8 | 1-3-2-2 | 5 – 3 – 2 | 8 – 6 | 11 – 7 |
| 6 tegen 6 | 1-2-1-2 | 4 – 3 | 6 | 11 – 7 |
| 6 tegen 6 | 1-3-2 | 5 – 3 – 2 | – | 11 – 7 |
| 6 tegen 6 | 1-2-2-1 | 4 – 3 | 8 – 6 | 9 |
| 4 tegen 4 (geen keeper) | 1-2-1 | 3 | 8 – 6 | 9 |
| 4 tegen 4 (geen keeper) | 2-2 | 4 – 3 | – | 11 – 7 |

Regels bij minder spelers: drie verdedigers zijn 5, 3 en 2; twee verdedigers zijn 4 en 3; één verdediger is 3; één middenvelder is 6;
twee voorste spelers zijn 11 en 7, of 10 en 9 als 7 en 11 al op het middenveld staan.

**Waar het nu klopt:** nieuwe en bestaande opstellingen (bestaande krijgen de nummers bij het openen, er wordt niets in je opgeslagen
gegevens omgeschreven), het tactiekbord dat je vanuit een opstelling of een formatie maakt (de tegenstander staat gespiegeld, zodat hun
2 tegenover jouw 5 staat), en de aftrap (de spits, 9, neemt hem).

**Wat nog moet (fase 2, na jouw keuze):**

- In 14 van de 25 voorbeeldtactieken (de versies 11 tegen 11) staat de 8 rechts van de 10. In die borden speelt het middenveld met de
  punt naar achteren (6 alleen voor de verdediging), terwijl de formatie 1-4-3-3 in de app de punt naar voren heeft. Dat is een keuze van
  jou (zie 9.2): alleen de nummers omwisselen, of de borden ombouwen.
- De spelhervattingen op een half veld loop ik in fase 2 één voor één na op de foto. Backs, centrale verdedigers en buitenspelers
  staan in de borden op een heel veld al goed.

---

## 4. Installatiescherm (bevindingen, verbetering staat in de voorbeeldversie)

Ik heb alle combinaties van 0.29.1 opnieuw gedraaid (`tools/e2e/installeren.mjs`: 47 combinaties van toestel en browser, in het
Nederlands en Engels). **De stappen kloppen overal**: er staat nergens een verkeerde knop of een pijl over tekst.

Toch is het op een iPhone lastig, om vier redenen:

1. De stappen zijn kleine regels tekst. Je moet lezen, onthouden en dan zoeken.
2. In Safari op de nieuwste iPhones zit Deel achter de knop met drie puntjes. Dat is een extra stap die mensen niet verwachten.
3. Via WhatsApp open je de link in de ingebouwde browser. Daar kun je niet installeren: je moet eerst naar Safari en dan pas
   installeren. Dat zijn twee rondes stappen.
4. In Chrome op de iPhone staat Deel rechtsboven, op een andere plek dan in Safari.

**Wat ik gebouwd heb** (te zien in de voorbeeldversie zodra je richting A, B of C kiest; in het huidige ontwerp is niets veranderd):
elke stap is een grote kaart met een groot cijfer, één korte zin en een **nagebouwde knop** die eruitziet zoals op je telefoon (de drie
puntjes, het deel-icoon, "Zet op beginscherm"). Er is één pijl. Echte schermfoto's heb ik niet gebruikt: die verouderen bij elke nieuwe
iPhone-versie en bevatten beeldmateriaal van anderen; nagebouwde knoppen niet.

**Idee dat ik niet kon testen:** een knop "Open in Safari" in de WhatsApp-browser, die de tweede ronde stappen overslaat. Dat werkt via
een speciale link die niet op elke iPhone-versie hetzelfde doet. Dat moet op een echte iPhone geprobeerd worden (zie 9.3).

---

## 5. Ontwerprichtingen (drie stuks, in de voorbeeldversie)

Met de knop onderaan wissel je tussen het huidige ontwerp en drie richtingen. De animaties van de oefeningen zijn niet aangepast.

| | Naam | In één zin |
|---|---|---|
| A | **Helder** | Strak en licht: één lettertype, dunne lijnen, veel witruimte, de clubkleur spaarzaam, een doorschijnende kop. |
| B | **Stadion** | Sportief: een donkere kop met een verloop in de clubkleur, smalle koppen in hoofdletters, stevige vlakken. |
| C | **Zacht** | Zachte verlopen op de achtergrond, kaarten als matglas, ronde vormen. |

Voor alle drie geldt:

- **Iconen:** per tegel en per categorie een eigen lijnicoon, in één stijl. Ik heb ze zelf getekend, dus er is geen licentie van een
  ander nodig en er hoeft niets vermeld te worden.
- **Letters:** dezelfde als nu, Inter en Barlow Condensed (beide SIL Open Font License 1.1, vrij voor commercieel gebruik). Er komt
  niets bij om te downloaden.
- **Logo:** het woordmerk TopTraining in twee tinten naast het bestaande beeldmerk.
- Zachte schaduwen, een rustige overgang bij het openen van een scherm, meer witruimte.
- **Clubkleuren en licht/donker blijven werken.** De test kiest in elke richting een clubkleur en controleert dat die gelijk blijft.
- Geen foto's van echte personen, nergens.
- Het is één opmaaklaag bovenop de bestaande schermen: er verandert niets aan hoe gegevens worden opgeslagen.

Gecontroleerd op iPhone SE en laptop, licht en donker, acht schermen per richting plus het installatiescherm: niets afgekapt, geen
horizontaal scrollen (`tools/e2e/ontwerp.mjs`).

---

## 6. Oefeningen

- **Voorstel:** `VOORSTEL-OEFENINGEN.md` met 157 nieuwe oefeningen (106 spelers, 51 keepers), per stuk naam, één zin, leeftijd, aantal
  spelers en keepers en de inspiratiebron. Zet een kruisje bij wat je wilt.
- **Eerlijk over de bronnen:** de bron is de site of het document waar ik dat soort oefening tegenkwam. Ik heb per bron de overzichten
  en thema's bekeken, niet elke oefening nagelezen. Naam, uitwerking en tekst zijn van mij; er staan geen namen van clubs, trainers of
  websites in de app.
- **Vijf zijn helemaal uitgewerkt** (animatie in 2D en 3D, Nederlands en Engels, alle tests) en staan in de voorbeeldversie:

| | Oefening | Categorie | Leeftijd |
|---|---|---|---|
| T12 | Kruis: aannemen en opendraaien | Techniek | O7, JO8–11 |
| P1 | Ruit met de derde man | Pass en trap | JO12–19 |
| A1 | Schot, rebound en intikken | Afwerken (met keeper) | JO8–19 |
| V1 | Kantelen als blok | Verdedigen en omschakelen | JO12–19 |
| KL1 | Zit, sta op en duik | Keepers, laag duiken | JO8–19 |

---

## 7. Realistische 3D-animaties (onderzoek, eerlijke conclusie en een proef)

### Wat ik gevonden heb

| Bron | Wat het is | Licentie | Bruikbaar voor ons? |
|---|---|---|---|
| Quaternius, Universal Animation Library 1 en 2 | 120+ en 130+ algemene bewegingen op één skelet: lopen in acht richtingen, joggen, sprinten, zitten en meer | CC0 (vrij, ook commercieel) | Ja, voor lopen. Er zitten **geen voetbalbewegingen** in (geen schot, duik, vangbal, kopbal, inworp). |
| Quaternius, Universal Base Characters | Zes basisfiguren (gemiddeld 13.000 driehoeken) die op dat skelet passen | CC0 | Ja, maar te zwaar voor 22 spelers; ze moeten eerst lichter (± 2.500 driehoeken). |
| Mixamo (Adobe) | Veel voetbalbewegingen, ook van keepers | Eigen voorwaarden van Adobe: gebruik in een commercieel project mag, de losse bestanden verspreiden niet. Geen CC0 of MIT. De precieze tekst heb ik niet bij Adobe zelf kunnen nalezen, alleen in hun forum. | **Nee.** Het is geen vrije licentie, en onze code staat openbaar op GitHub. |
| CMU Motion Capture Database | Ruwe opnames van lopen, rennen en sport | Eigen tekst: mag in commerciële producten, niet doorverkopen. De site zelf kon ik niet openen (certificaatfout), dus dit is niet uit de eerste hand; een veelgebruikte omzetting naar FBX staat onder CC BY-NC (niet commercieel). | Twijfel. Alleen na controle van de brontekst, en het vraagt veel omzetwerk. |
| Voetbalopnames uit onderzoek (schoten, keepersduiken) | Datasets bij wetenschappelijke artikelen | Meestal niet vrijgegeven, of alleen voor onderzoek | Nee. |

### Conclusie

**Volledig realistische animaties met echte bewegingsopnames voor alle oefeningen zijn nu niet haalbaar binnen je eisen.** De redenen:

1. Er bestaan geen vrij te gebruiken opnames van voetbalbewegingen. Juist schieten, duiken, vangen en koppen ontbreken.
2. Een opname is een vast filmpje. Onze oefeningen vragen dat een speler op een exact moment op een exacte plek een bal raakt of
   vangt. Dat lukt met de huidige poppetjes omdat elke beweging wordt uitgerekend; een vast filmpje past daar niet zomaar op.
3. De app kent ruim dertig soorten acties in ruim 340 oefeningen. Die moeten allemaal blijven werken.
4. Grootte en snelheid: figuren en bewegingen samen zijn al snel 1,5 tot 3 MB extra op een app van 3,5 MB, en 22 figuren van 13.000
   driehoeken zijn te zwaar voor een gemiddelde telefoon.

**Wel haalbaar, in drie stappen** die elk op zichzelf iets opleveren:

- **R1 – Licht, schaduw, gras en lucht** op de huidige poppetjes. Dit is de proef die er nu staat.
- **R2 – Een realistischer figuur op het bestaande skelet.** Het lichaam wordt één vloeiend geheel met shirt, broek, sokken en
  schoenen, maar de beweging blijft uitgerekend. Daardoor blijven alle oefeningen werken en blijven de huidige poppetjes bestaan als
  terugval (Eenvoudige poppetjes). Geschat: 150 tot 300 kB extra, alleen geladen als je 3D opent. Hiervoor moet ik CC0-bestanden
  downloaden; dat heb ik niet gedaan zonder jouw toestemming (zie 9.5).
- **R3 – Echte loopbewegingen** (wandelen, joggen, sprinten, zijwaarts, achteruit) uit de CC0-bibliotheek, gemengd op benen en armen
  van het figuur uit R2. Balacties blijven uitgerekend. Geschat: 100 tot 250 kB extra.

Voetbalspecifieke opnames (schot, duik) komen er alleen als er een vrije bron opduikt; tot die tijd verbeter ik die bewegingen met
de hand, zoals tot nu toe.

### De proef: Realistisch (proef)

In de voorbeeldversie staat bij elke oefening in 3D de schakelaar **Realistisch (proef)**. Die zet aan: een lagere zon met echte
schaduwen van spelers en materiaal, gras met structuur, een lucht met verloop. Er is niets gedownload; alles wordt op het toestel
getekend. De bal houdt zijn schaduwvlek recht onder zich, omdat je daaraan de hoogte afleest (duidelijkheid voorop).

Vergelijk bijvoorbeeld deze drie: de loopvorm **Loopscholing**, de afwerkvorm **Schot, rebound en intikken** (kies ook de camera Achter
goal) en de partijvorm **4 tegen 4 met keepers**.

**Metingen** (`tools/e2e/realistisch.mjs`, telefoonformaat 390 × 844, schermdichtheid 3):

| Scène | Beelden per seconde, huidig → proef | Rekenwerk per beeld | Met een 4× tragere processor |
|---|---|---|---|
| Loopvorm (5 spelers) | 60 → 60 | 3,0 → 6,6 ms | 30 → 30 |
| Afwerkvorm met keeper | 60 → 60 | 5,2 → 8,0 ms | 30 → 30 |
| Partijvorm 4 tegen 4 | 60 → 60 | 5,9 → 8,5 ms | 30 → 30 |
| 11 tegen 11 | 60 → 60 | 6,0 → 11,0 ms | 30 → 30 (de traagste beelden zakken van 29 naar 20) |

- **Grootte:** de hele app wordt 2,2 kB groter (van 3529,9 naar 3532,0 kB). **Extra laadtijd:** geen meetbaar verschil; er komt
  geen download bij.
- **Eerlijke kanttekening:** dit is gemeten op mijn laptop met een vertraagde processor. De videokaart van een telefoon kan ik zo niet
  nabootsen, en schaduwen kosten juist daar rekenkracht. **Probeer het dus op je eigen telefoon** op de testlink, ook met een bord
  11 tegen 11. Met Eenvoudige poppetjes staat de proef uit: die instelling is juist voor tragere telefoons.

---

## 8. Uitrol van fase 2 (in delen)

Uitgangspunt: **bestaande gebruikers merken niets tot jij een deel goedkeurt.** Elk deel gaat zo:

1. bouwen op een eigen branch, alle tests;
2. op de voorbeeldlink zetten, jij bekijkt het op je telefoon;
3. pas na jouw akkoord naar `main` en live, met een eigen versienummer;
4. daarna controle op de echte site.

Er verandert in geen enkel deel iets aan hoe gegevens worden opgeslagen. Bestaande trainingen, opstellingen, borden, links, teams en
favorieten blijven werken; daar zijn tests voor.

| Deel | Wat | Versie | Wat een gebruiker merkt |
|---|---|---|---|
| 2.1 | Opstelling slepen en vaste rugnummers (staat klaar) | 0.35.0 | Slepen klopt; nummers staan op de vaste plek. |
| 2.2 | Rugnummers in de voorbeeldtactieken en spelhervattingen, na jouw keuze | 0.35.1 | Nummers in de voorbeelden kloppen met de opstelling. |
| 2.3 | Installatiescherm met grote stappen | 0.35.2 | Alleen nieuwe gebruikers zien het. |
| 2.4 | De gekozen ontwerprichting, helemaal afgewerkt op alle schermen | 0.36.0 | De app ziet er nieuw uit; alles staat op dezelfde plek. |
| 2.5 | Oefeningen in batches van ± 15 | 0.36.1 en verder | Er komen oefeningen bij. |
| 2.6 | Realistisch R1 als instelling (standaard uit), daarna R2 en R3 als proef | 0.37.0 en verder | Wie wil, zet het aan. |

Volgorde van de oefeningen: eerst de dunste categorieën (Verdedigen en omschakelen, Pass en trap, keepers JO8–11), daarna de rest. Per
batch: bouwscript in `tools/nieuw/`, Engelse tekst, alle tests (afstand, balbezit, keeper, fysieke check, poppetje, vertaling),
close-ups in 3D en 2D die ik zelf kritisch bekijk, voorbeeldlink, akkoord, live. Kan een oefening iets nog niet in de animatie, dan bouw
ik die beweging erbij.

Het ontwerp (2.4) gaat in één keer live en niet half: een app met twee stijlen door elkaar oogt slordig. Wil je het voorzichtiger, dan
kan het eerst twee weken als keuze bij Instellingen ("Nieuw ontwerp proberen").

---

## 9. Keuzes die jij moet maken

1. **Ontwerp:** A (Helder), B (Stadion), C (Zacht), of een mengvorm (bijvoorbeeld de kop van B met de rust van A). En: de nieuwe
   lijniconen wel of niet.
2. **Rugnummers:**
   - Klopt de tabel in hoofdstuk 3? Let op 1-4-3-3 (10 voor de 6 en de 8), 1-3-4-3 (ruit met de 4 voor de verdediging) en twee spitsen
     (10 en 9).
   - Voorbeeldtactieken: alleen de nummers 8 en 10 omwisselen (snel, de tekeningen blijven gelijk), of de borden ombouwen naar de punt
     naar voren (meer werk, de tactiek verandert een beetje).
3. **Installatiescherm:** de grote stappen met nagebouwde knoppen invoeren? En wil je de knop "Open in Safari" op je eigen iPhone
   proberen, zodat we weten of hij werkt?
4. **Oefeningen:** kruisjes in `VOORSTEL-OEFENINGEN.md`. En: vind je de vijf uitgewerkte goed genoeg als maatstaf?
5. **Realistisch:**
   - Is de proef (R1) op jouw telefoon soepel en mooier? Dan wordt het een instelling.
   - Mag ik voor R2 en R3 de vrije CC0-bestanden van Quaternius downloaden (Universal Base Characters en Universal Animation Library,
     de gratis Standard-versie, ± 13 MB per pakket als download; in de app komt daar een klein deel van)? Ik zet ze dan alleen in een
     proef op de voorbeeldlink.
6. **Uitrol:** mag deel 2.1 (slepen en rugnummers) los van de rest meteen live, of wil je alles tegelijk?
7. **Voorbeeldlink:** laten staan tot 15 december, verlengen, of weghalen?

## 10. Wat je moet goedkeuren voor fase 2

- De gekozen ontwerprichting (keuze 1).
- De rugnummertabel en de aanpak voor de voorbeeldtactieken (keuze 2).
- De lijst oefeningen die gebouwd mag worden (keuze 4).
- Of en hoe ver ik met de realistische weergave doorga (keuze 5).
- De volgorde en de manier van uitrollen uit hoofdstuk 8.

---

## 11. Keuzes zonder overleg (fase 1)

- De voorbeeldversie staat op een voorbeeldkanaal van Firebase Hosting in je eigen project. Dat is het enige wat ik in Firebase heb
  gedaan; het is met één opdracht weg te halen. De instellingen daarvoor staan in `firebase.json` (map `voorbeeld/`).
- In de voorbeeld-build staat online uit in plaats van dat hij naar een aparte testverzameling schrijft: zo kan er per definitie niets
  misgaan met echte gegevens.
- Het versienummer is op de branch nog 0.34.4. Er gaat niets live, dus er is geen nieuw nummer uitgedeeld.
- Slepen: een speler klikt vast op een positie binnen 30 pixels; een speler mag niet buiten het veld (3% van de rand).
- Rugnummers bij minder spelers (zie de regels onder de tabel) heb ik zelf ingevuld.
- De ontwerprichtingen zijn één opmaaklaag; de iconen heb ik zelf getekend in plaats van een bestaande set te nemen.
- Het installatiescherm gebruikt nagebouwde knoppen in plaats van schermfoto's.
- Voorstel: 157 in plaats van precies 150, met de nadruk op de categorieën waar nu weinig staat.
- Het kruis (T12) staat een achtste slag gedraaid, omdat de kinderen in 3D anders achter elkaar staan. Het vak van Kantelen als blok
  is 28 × 18 m, zodat de spelers groot genoeg in beeld zijn.
- Eén oude test telde precies zes oefeningen in Verdedigen en omschakelen; die telt nu "minstens zes".
- De proef Realistisch gebruikt geen bestanden van anderen en staat uit bij Eenvoudige poppetjes.

---

## 12. Tests en screenshots

**Tests op de branch:** zie de regel "Teststatus" hieronder.

**Screenshots** (map `fase1-beelden/`):

| Bestand | Wat |
|---|---|
| `ontwerp-start-alle.png` | Het startscherm in alle richtingen, iPhone SE en laptop, licht en donker, naast elkaar. |
| `ontwerp-<nu/a/b/c>-<SE/laptop>-<licht/donker>.png` | Per richting acht schermen (start, categorieën, lijst, oefening, Wedstrijd, Circuittraining, Instellingen, Help); op iPhone SE ook het installatiescherm. |
| `opstelling-slepen.png` | Slepen in de opstelling op alle toestellen. |
| `vijf-oefeningen.png` | De vijf uitgewerkte oefeningen in 3D en 2D. |
| `realistisch-vergelijking.png` | Huidig tegenover Realistisch (proef). |
