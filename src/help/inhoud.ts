/**
 * Help (0.25.0): korte uitleg met tips, per onderwerp, in het Nederlands en het Engels. Beide lijsten hebben dezelfde
 * onderwerpen in dezelfde volgorde met evenveel alinea's en knoppen (getest in tests/help.test.ts).
 * `**…**` = vet (knoppen en schermnamen). Een regel die met "- " begint is een opsommingsteken.
 */
export interface HelpKnop {
  tekst: string;
  /** Pad in de app (#…). */
  pad: string;
}

export interface HelpOnderwerp {
  id: string;
  titel: string;
  tekst: string[];
  laatZien?: HelpKnop[];
}

/** Een oefening die goed laat zien wat de animatie kan (spelers, passes en lopen). */
const VOORBEELD = '/oefening/veld-pt-driehoek';

export const HELP_NL: HelpOnderwerp[] = [
  {
    id: 'installeren',
    titel: 'App installeren en bijwerken',
    tekst: [
      'TopTraining is een web-app: je installeert hem vanuit de browser, niet via de App Store of Play Store. Daarna staat hij als icoon op je beginscherm en werkt hij ook zonder internet.',
      '- **iPhone en iPad, Safari:** tik op **Deel** (bij iOS 26 eerst op **•••**), kies **Zet op beginscherm** en tik op **Voeg toe**.',
      '- **iPhone en iPad, Chrome, Edge of Firefox** (vanaf iOS 16.4): Chrome: **Deel**-knop rechts in de adresbalk. Edge: **•••** onderin → **Delen**. Firefox: **☰** rechtsonder → **Delen**. Kies daarna **Zet op beginscherm** → **Voeg toe**. Bij een oudere iOS-versie open je de link in **Safari**.',
      '- **Android, Chrome:** tik op **Installeren** in de app, of rechtsboven op **⋮** → **App installeren** (of **Toevoegen aan startscherm**).',
      '- **Android, andere browsers:** Samsung Internet: **☰** rechtsonder → **Pagina toevoegen aan** → **Startscherm**. Edge: **•••** onderin → **Toevoegen aan telefoon**. Firefox: **⋮** → **Installeren** of **Toevoegen aan startscherm**. Opera: menu → **Toevoegen aan** → **Startscherm**. Andere browsers: zoek in het menu naar **Toevoegen aan startscherm**, of open de link in Chrome.',
      '- **Laptop:** in **Chrome** of **Edge** klik je op het installatie-icoon rechts in de adresbalk. Op een Mac met Safari: **Archief → Voeg toe aan Dock**. Firefox kan niet installeren: gebruik de app gewoon in de browser (met een bladwijzer).',
      'Open je de link in WhatsApp, Instagram, Facebook, Gmail of een andere app? Tik dan op het menu van die app (**•••** of **⋮**) en kies **Openen in browser** (of **Open in Safari** / **Openen in Chrome**): vanuit zo’n ingebouwde browser kun je niet installeren.',
      'Lukt het niet? Op het installatiescherm zie je bij **Lukt het niet?** andere mogelijke stappen, en bij **Andere browser of telefoon** kies je zelf welke stappen je wilt zien. Met **Gewoon in de browser gebruiken** werkt alles ook zonder installatie. Wil je de uitleg later terugzien? Tik onderaan het startscherm op **TopTraining als app installeren**.',
      '**Bijwerken** gaat vanzelf. Is er een nieuwe versie, dan zie je onderin **Er is een nieuwe versie**; tik op **Bijwerken**.',
      'Verschijnt een update niet? Sluit de app helemaal af (ook uit de lijst met open apps) en open hem opnieuw. Helpt dat niet, wacht dan even met internet aan en probeer het nog eens. Onderaan het startscherm en bij Instellingen staat welke versie je hebt.',
    ],
  },
  {
    id: 'zoeken',
    titel: 'Oefeningen zoeken',
    tekst: [
      'Op het startscherm kies je **Oefeningen spelers** of **Oefeningen keepers**. Daarna kies je een categorie, zoals Warming-up, Afwerken, Verdedigen en omschakelen of Laag duiken, of **Alle oefeningen**. Elke categorie heeft een klein plaatje, zodat je hem snel terugvindt.',
      'Een oefening kan in meer categorieën staan. De eerste is de hoofdcategorie.',
      '- **Zoek op naam** vindt een oefening aan een deel van de naam.',
      '- **Filters**: zet **Alleen wat past bij mijn aantal** aan en vul het aantal spelers en keepers in. Je ziet dan alleen oefeningen die je met die groep kunt doen.',
      '- **Leeftijd**: kies bij **Filters** een leeftijdsgroep: Mini’s O6 (tot 6 jaar: speels, met verhaaltjes), Mini’s O7 (6–7 jaar: techniek en duels), JO8–JO11, JO12–JO15 of JO16–JO19. Je ziet dan alleen oefeningen voor die groep. Een oefening kan bij meer groepen horen; welke dat zijn, staat bij de oefening. Eigen oefeningen zonder leeftijd blijven altijd staan.',
      '- **4+ spelers** betekent: er zijn er 4 tegelijk bezig, extra spelers sluiten aan in de rij of wisselen door. Staat er geen plus (bijv. **6 spelers**), dan is de oefening gebouwd op precies dat aantal.',
      '- **Favorieten**: tik op het hartje bij een oefening. Met het filter **Alleen favorieten** zie je alleen die. Favorieten krijgen ook voorrang bij Teamtraining genereren.',
      'Je aantallen spelers en keepers en je leeftijdsgroep worden onthouden.',
    ],
    laatZien: [
      { tekst: 'Naar de spelersoefeningen', pad: '/veld' },
      { tekst: 'Naar de keeperoefeningen', pad: '/keepers' },
    ],
  },
  {
    id: 'animatie',
    titel: 'Animatie: 2D, 3D en de camera',
    tekst: [
      'Elke oefening heeft een bewegende uitleg. Tik op de animatie om te pauzeren of verder te spelen.',
      '- **2D / 3D**: wissel rechtsboven tussen een tekening van bovenaf en een 3D-veld.',
      '- **Camera** (3D): kies **Boven**, **Schuin** of **Achter goal**. Op een telefoon veeg je om te draaien en knijp je om te zoomen; op een laptop sleep je met de muis en scroll je om te zoomen.',
      '- **Snelheid**: 0,5×, 1× of 2×. Langzaam is handig om looplijnen en passes goed te volgen.',
      '- **Looplijnen**: zet de lijnen van lopen, passen en dribbelen aan of uit.',
      '- **Opnieuw** begint vanaf het begin, **Herhalen** speelt de oefening steeds opnieuw af.',
      'Loopt 3D niet soepel? Dan zet de app vanzelf **Eenvoudige poppetjes** aan. Dat kun je ook zelf aan- of uitzetten bij Instellingen. Werkt 3D helemaal niet, dan zie je de 2D-weergave.',
    ],
    laatZien: [{ tekst: 'Een voorbeeld bekijken', pad: VOORBEELD }],
  },
  {
    id: 'training',
    titel: 'Teamtraining maken',
    tekst: [
      'Tik op het startscherm op **Teamtraining maken**. Vul (als je wilt) een naam en datum in en het aantal spelers en keepers.',
      '- **Leeftijd**: kies bij de teamtraining een leeftijdsgroep (de laatst gekozen staat er al). Bij Oefeningen toevoegen en Teamtraining genereren krijg je dan alleen oefeningen voor die groep. Past een oefening niet (meer), dan wordt hij oranje gemarkeerd.',
      '- **Oefeningen toevoegen**: je ziet alleen oefeningen die bij je aantallen en leeftijd passen. Tik ze aan in de volgorde die je wilt.',
      '- **Volgorde**: sleep een oefening aan het greepje omhoog of omlaag.',
      '- **Klaarzetten**: onder de oefeningen staat al het materiaal dat je moet klaarzetten. Per soort telt het meeste dat één oefening nodig heeft, want je gebruikt het daarna opnieuw.',
      '- **Start teamtraining**: de trainingsmodus voor op het veld, oefening voor oefening. Veeg naar links of rechts, of gebruik **Vorige** en **Volgende**.',
      '- **Teamtraining genereren**: tik de onderdelen aan in de volgorde van je teamtraining (bijv. Warming-up → Afwerken → Partijvormen) en de app kiest bij elk onderdeel een passende oefening. Niet tevreden over één oefening? Tik op het wissel-icoon voor een andere.',
      'Een teamtraining zonder naam krijgt vanzelf de datum als naam. Een lege teamtraining (niets ingevuld) wordt niet bewaard.',
    ],
    laatZien: [{ tekst: 'Naar Mijn teamtrainingen', pad: '/trainingen' }],
  },
  {
    id: 'club',
    titel: 'Circuittraining',
    tekst: [
      'Met **Circuittraining** regel je een training met groepjes die rouleren langs stations. Tik op **Nieuwe circuittraining** en kies het sjabloon **Mini Talents** (6 groepjes, 4 × 15 minuten), een eigen sjabloon of **Zelf samenstellen**. Vul de datums, leeftijd, het aantal kinderen en de groepjes (2 tot 8) in, en eventueel de begintijd en de trainers.',
      '- **Onderdelen**: kies 3 tot 6 onderdelen en versleep ze aan het greepje. Geef elk onderdeel een duur en kies **Stations** (de groepjes draaien door) of **Samen** (alle groepjes tegelijk, bijvoorbeeld de warming-up of een partijspel). Onder de onderdelen staat de totale tijd. Met **Opslaan als sjabloon** gebruik je dezelfde opzet de volgende keer weer.',
      '- **Groepjes samen**: bij **Samen** kies je ook hoeveel groepjes er tegelijk komen, bijvoorbeeld **2 groepjes** voor loopcoördinatie in de week van de looptrainer. Dat onderdeel krijgt dan één station waar per ronde twee groepjes samen komen, steeds dezelfde (A + B, C + D …), terwijl de andere groepjes langs de gewone stations draaien. De trainer met die vaste plek in het trainersrooster staat er vanzelf.',
      '- **Per sessie een eigen opzet**: bij twee of meer sessies gebruiken ze standaard de opzet van de eerste sessie. Kies bij Onderdelen een andere sessie en dan **Eigen opzet voor deze sessie**: de opzet van de eerste dag wordt gekopieerd en die dag pas je los aan (bijvoorbeeld Loopcoördinatie in plaats van Techniek op woensdag). Pas je de eerste dag aan, dan veranderen alleen de dagen met **Zelfde als** mee. **Weer gelijk maken** zet een dag terug. In de dagkeuze staat bij zo\'n dag **aangepast**; veldplan, rotatie, materiaal, rondetimer en de trainerslink volgen de gekozen dag.',
      '- **Oefeningen**: kies per onderdeel een oefening of tik op **Genereer** (per onderdeel of alles tegelijk). Je ziet alleen wat past bij de leeftijd en de groepsgrootte.',
      '- **Meer oefeningen in een onderdeel**: met **Oefening toevoegen** zet je er meer in, bijvoorbeeld drie loopcoördinatievormen. Het groepje blijft het hele onderdeel op dat station en doet ze na elkaar. Versleep de volgorde en vul eventueel per oefening een richttijd in; zonder richttijd wordt de tijd gelijk verdeeld. De rotatie verandert niet.',
      '- **Veldplan**: bij **Stations** zie je het halve veld met genummerde stations, bij **Partij** de partijvelden. Bij 2 groepjes speelt A tegen B op één veld, bij meer groepjes twee groepjes per veld; bij een oneven aantal speelt het laatste groepje onderling met de trainer als joker.',
      '- **Rotatie**: elk groepje doet elk station-onderdeel één keer en er staan nooit twee groepjes op één station. Een oefening staat zo vaak op het veld als nodig is: bij 2 groepjes en 4 onderdelen 1 keer (eerst twee onderdelen omwisselen, daarna de volgende twee), bij 6 groepjes en 3 onderdelen 2 keer. Per ronde zie je de tijd, wie waar staat en welke trainer erbij hoort, en de app zegt het als er iets leeg staat of dubbel moet. Alle groepjes wisselen tegelijk, dus een ronde duurt zo lang als het langste onderdeel erin.',
      '- **Materiaal**: alles om klaar te zetten, opgeteld over de stations (zo vaak als de oefening op het veld staat), met wat er extra nodig is voor de samen-onderdelen. Staan er meer oefeningen in een onderdeel, dan telt daarvan het grootste aantal, omdat je ze na elkaar doet. Afvinken wordt bewaard.',
      '- **Trainers**: vul alle namen in en ze worden eerlijk verdeeld: bij 10 trainers en 4 stations 3, 3, 2 en 2. Kies **Trainers blijven bij hun station** of **Trainers lopen mee met een groepje**. Bij **Veldplan, rotatie en materiaal** vink je per station trainers aan of verplaats je ze. Staat iemand op twee plekken tegelijk, dan zie je een melding.',
      '- **Deel met trainers**: een link voor de groepsapp. Trainers hoeven niet in te loggen en openen direct hun station, met uitleg en animatie. Bij **Ik ben…** kiezen ze hun naam en zien ze hun eigen plekken en oefeningen per ronde.',
      '- **Sessies**: een circuittraining heeft één of meer sessies, elk met een datum en een begintijd. Twee trainingen op één avond (bijvoorbeeld eerst 2 groepjes, daarna 4) zijn twee sessies met dezelfde datum en een andere begintijd. Kies bovenaan de sessie en stel daar de leeftijd, het aantal kinderen en groepjes, de groep uit het rooster en de trainers in; zonder eigen waarde neemt een sessie die van de eerste over. Rotatie, stations, materiaal en de indeling van de trainers worden per sessie uitgerekend. Bij Materiaal staat ook wat je voor de hele avond nodig hebt. In het plan, de rondetimer en de trainerslink kies je de sessie bovenaan',
      '- **Trainersrooster**: bij Circuittraining → **Trainersrooster** voer je vaste trainers één keer in: dagen, elke week of om de week, bij welke groep (ook om de week wisselend) en eventueel altijd bij een onderdeel, zoals Loopcoördinatie, of alleen bij de sessie met een bepaalde begintijd. Kies bij een circuittraining de **Groep**, dan vult de app de trainers per dag in, ook bij Naar volgende week. Een aanpassing met de hand geldt alleen voor die week. Je kunt het rooster delen met je team.',
      '- **Delen met team**: zit je in een team, dan staat de circuittraining daar met jouw naam erbij. Teamleden openen het plan, de stations, de rotatie, het materiaal en de animaties, en kunnen hem kopiëren naar hun eigen circuittrainingen. Pas je hem daarna aan? Tik nog eens op **Delen met team** om het gedeelde plan bij te werken.',
      '- **Rondetimer**: volgt de duur van de onderdelen, toont de ronde en de resterende tijd en geeft een signaal bij elke wissel. Trillen en het scherm aan houden lukken alleen als de browser dat kan.',
      'In de lijst kun je een circuittraining dupliceren, of met het kalender-icoon naar volgende week kopiëren. Een lege circuittraining wordt niet bewaard.',
    ],
    laatZien: [{ tekst: 'Naar Circuittraining', pad: '/club' }],
  },
  {
    id: 'eigen',
    titel: 'Eigen oefeningen tekenen',
    tekst: [
      'Tik op het startscherm op **Oefening maken**: daar staan je eigen oefeningen. Bij **Nieuwe oefening** kies je een leeg veld, half veld of heel veld en begin je met tekenen.',
      '- **Objecten**: kies onderin een speler, keeper, bal, goal of materiaal (pion, hoedje, horde, ladder, pop …) en tik op het veld. Sleep om te verplaatsen; met twee vingers zoom je in.',
      '- **Lijnen**: kies **Pass / schot**, **Lopen** of **Dribbelen** en sleep vanaf een speler. Elke lijn krijgt een **stapnummer**: lijnen met hetzelfde nummer gebeuren tegelijk, daarna komt het volgende nummer.',
      '- **Opties** van een lijn: loopwijze (normaal, sprint, zijwaarts, achteruit), hoogte van de bal, afloop van een schot (goal, keeper vangt of duikt, naast) en even wachten vóór een stap.',
      '- **Afspelen** toont je tekening als animatie in 2D en 3D. Een rood nummer betekent dat een lijn niet meedoet: tik erop voor de reden.',
      '- **Doelnet**: zet een doelnet in een goal en schiet op een gat (laag of hoog). Raak gaat de bal erin, anders kaatst hij terug.',
      '- **Kopiëren van een ingebouwde oefening**: open een oefening uit de bibliotheek en tik op **Kopiëren naar eigen oefeningen**. Je krijgt dan de tekening met animatie; verschuif je iets, dan wordt het een tekening zonder animatie.',
      'Bij **Gegevens** vul je naam, categorieën, uitleg, benodigdheden en coachpunten in. Pas met een naam en categorie staat de oefening in de bibliotheek.',
    ],
    laatZien: [{ tekst: 'Naar Eigen oefeningen', pad: '/eigen' }],
  },
  {
    id: 'wedstrijd',
    titel: 'Wedstrijd: opstelling, tactiekbord en spelhervattingen',
    tekst: [
      '- **Opstelling**: kies de spelvorm (4 tegen 4 tot 11 tegen 11) en een formatie. Sleep spelers naar een positie of naar de wissels; tikken kan ook. Namen worden onthouden voor je volgende opstelling.',
      '- **Tactiekbord**: maak een bord vanuit een opstelling (jouw spelers met namen en de tegenstander ertegenover) of een leeg bord, of kies een **Voorbeeldtactiek**. Kies de spelvorm en de formatie van beide teams. Met **Tekenen** zet je looplijnen, passes en dribbels met stapnummers, net als bij eigen oefeningen.',
      '- **Namen tonen**: laat de namen van de spelers zien in 2D en 3D, of verberg ze.',
      '- **Spelhervattingen**: corners, vrije trappen, inworp, doeltrap en aftrap. Kies een **Voorbeeldhervatting** die meteen afspeelt, of een beginsituatie waarbij je zelf de lijnen tekent.',
    ],
    laatZien: [{ tekst: 'Naar Wedstrijd', pad: '/wedstrijd' }],
  },
  {
    id: 'tactieken',
    titel: 'Voorbeeldtactieken',
    tekst: [
      'Bij **Wedstrijd → Nieuw tactiekbord → Voorbeeldtactiek** staan 17 kant-en-klare tactieken met beide teams, looplijnen en een animatie die meteen afspeelt. Jouw team is rood, de tegenstander blauw.',
      '- **Druk zetten**: hoog druk zetten in een 1-4-3-3, middenblok in een 1-4-4-2, laag blok, druk op de terugspeelbal naar de keeper, de fuik op de flank en tegenpressing na balverlies.',
      '- **Opbouwen**: opbouw vanaf de keeper, opbouw met drie (de 6 zakt in), opbouw via de back en de derde man, lange bal op de spits en de tweede bal, en opbouw in 8 tegen 8 (1-3-2-2 en 1-3-3-1).',
      '- **Aanvallen en omschakelen**: overlap op de flank, underlap, wisselen van kant, diepte achter de verdediging, counter na balwinst en terugleggen vanaf de achterlijn.',
      'Bij veel tactieken kies je bovenaan tussen **11 tegen 11** en **8 tegen 8**. Onder de animatie staat de uitleg: wat het is, wanneer je het gebruikt en de aandachtspunten.',
      'Met **Opslaan als eigen bord** of **Aanpassen** maak je een eigen kopie die je zelf kunt veranderen, delen en met je team kunt delen. Het voorbeeld blijft altijd zoals het is. In je eigen bord kun je de uitleg openklappen.',
    ],
    laatZien: [{ tekst: 'Naar de voorbeeldtactieken', pad: '/tactieken' }],
  },
  {
    id: 'hervattingen',
    titel: 'Voorbeeldhervattingen',
    tekst: [
      'Bij **Wedstrijd → Nieuwe spelhervatting → Voorbeeldhervatting** staan 20 ingestudeerde spelhervattingen met beide teams, looplijnen en een animatie die meteen afspeelt. Aanvallend is jouw team rood; bij verdedigen verdedigt rood het goal.',
      '- **Corners**: eerste paal, korte corner, tweede paal, doorkoppen, rugzak, naar de rand van de zestien en afschermen van de keeper.',
      '- **Vrije trappen**: via een kaats, overstapje, speler in de muur, breed leggen, vanaf de zijkant en snel nemen.',
      '- **Inworp en aftrap**: lange inworp in de zestien, inworp met een kaats terug, inworp met een loop in de rug en een ingestudeerde aftrap.',
      '- **Verdedigen bij standaardsituaties**: corner verdedigen met zonedekking of mandekking, en de muur opstellen bij een vrije trap.',
      'Bij een aantal kies je bovenaan tussen **11 tegen 11** en **8 tegen 8**. Met **Opslaan als eigen bord** of **Aanpassen** maak je een eigen kopie, die je kunt delen; het voorbeeld blijft zoals het is. Teken je zelf een pass vanaf de zijlijn, dan wordt dat vanzelf een inworp.',
    ],
    laatZien: [{ tekst: 'Naar de voorbeeldhervattingen', pad: '/hervattingen' }],
  },
  {
    id: 'delen',
    titel: 'Delen, team, account en back-up',
    tekst: [
      '- **Delen via een link**: bij een teamtraining, eigen oefening, opstelling, tactiekbord of spelhervatting tik je op **Delen**; bij een circuittraining op **Deel met trainers**. De link is kort, zodat hij in elke chat-app in zijn geheel werkt. De ander opent hem meteen, ook zonder de app of een account, en kan hem in de app opslaan (de link van een circuittraining is alleen om te bekijken). Eigen oefeningen in een gedeelde teamtraining of circuittraining gaan mee. Heb je geen internet, dan krijg je een langere link. Een link verloopt als hij 180 dagen niet geopend is; openen verlengt de termijn. Bij Instellingen → **Mijn deellinks** zie je wanneer een link verloopt en trek je hem in.',
      '- **Account**: bij Instellingen log je in met je e-mailadres. Je eigen oefeningen, teamtrainingen, favorieten en instellingen staan dan online en zijn op al je apparaten gelijk. Zonder account werkt alles gewoon op dit apparaat.',
      '- **Team**: met een account maak je een team of word je lid met een teamcode van 6 tekens. Bij een teamtraining, circuittraining, eigen oefening, opstelling, tactiekbord of spelhervatting kies je **Delen met team**. Je teamgenoten zien bij het team wie hem deelde, kunnen hem openen en kopiëren. Alleen jij kunt je gedeelde item aanpassen (nog eens **Delen met team** werkt het bij) of terugtrekken; een beheerder kan het uit het team verwijderen.',
      '- **Exporteren en importeren**: bij Instellingen → **Je gegevens** maak je een bestand met je eigen oefeningen, teamtrainingen en favorieten. Met **Importeren** zet je dat op een ander apparaat. Er wordt niets overschreven en niets komt dubbel.',
    ],
    laatZien: [
      { tekst: 'Naar Account', pad: '/account' },
      { tekst: 'Naar Teams', pad: '/teams' },
    ],
  },
  {
    id: 'offline',
    titel: 'Offline gebruiken en weggehaalde oefeningen',
    tekst: [
      'Na het installeren werkt de app ook zonder internet: alle oefeningen, animaties (ook 3D), teamtrainingen en eigen oefeningen. Alleen inloggen, synchroniseren en teams hebben internet nodig; wijzigingen gaan mee zodra je weer online bent.',
      'Soms wordt een oefening uit de bibliotheek gehaald (bijvoorbeeld omdat er een betere versie is). Staat hij in een oude teamtraining, een gedeelde link, een team of je favorieten, dan zie je hem daar nog, met de melding **Niet meer in de bibliotheek**. Wil je hem houden? Tik op **Kopiëren naar eigen oefeningen**.',
    ],
  },
  {
    id: 'instellingen',
    titel: 'Taal, kleuren en weergave',
    tekst: [
      '- **Taal / Language**: Nederlands, English of Automatisch (volgt de taal van je telefoon). Je eigen oefeningen, teamtrainingen en namen worden niet vertaald; een gedeelde link opent bij de ander in zijn eigen taal.',
      '- **Clubkleuren**: kies de kleuren van de app. Het veld en de teamkleuren in de animaties blijven altijd hetzelfde.',
      '- **Weergave**: licht, donker of automatisch.',
    ],
    laatZien: [{ tekst: 'Naar Instellingen', pad: '/instellingen' }],
  },
];

export const HELP_EN: HelpOnderwerp[] = [
  {
    id: 'installeren',
    titel: 'Installing and updating the app',
    tekst: [
      "TopTraining is a web app: you install it from the browser, not from the App Store or Play Store. After that it's an icon on your home screen and it also works without internet.",
      '- **iPhone and iPad, Safari:** tap **Share** (on iOS 26 tap **•••** first), choose **Add to Home Screen** and tap **Add**.',
      '- **iPhone and iPad, Chrome, Edge or Firefox** (iOS 16.4 and later): Chrome: the **Share** button on the right of the address bar. Edge: **•••** at the bottom → **Share**. Firefox: **☰** at the bottom right → **Share**. Then choose **Add to Home Screen** → **Add**. On an older iOS version, open the link in **Safari**.',
      '- **Android, Chrome:** tap **Install** in the app, or **⋮** at the top right → **Install app** (or **Add to home screen**).',
      '- **Android, other browsers:** Samsung Internet: **☰** at the bottom right → **Add page to** → **Home screen**. Edge: **•••** at the bottom → **Add to phone**. Firefox: **⋮** → **Install** or **Add to home screen**. Opera: menu → **Add to** → **Home screen**. Other browsers: look in the menu for **Add to home screen**, or open the link in Chrome.',
      "- **Laptop:** in **Chrome** or **Edge**, click the install icon on the right of the address bar. On a Mac with Safari: **File → Add to Dock**. Firefox can't install apps: just use it in the browser (with a bookmark).",
      "Opened the link in WhatsApp, Instagram, Facebook, Gmail or another app? Tap that app's menu (**•••** or **⋮**) and choose **Open in browser** (or **Open in Safari** / **Open in Chrome**): you can't install from an app's built-in browser.",
      "Not working? On the install screen, **Not working?** shows other possible steps, and **Other browser or phone** lets you choose which steps to see. With **Just use it in the browser** everything works without installing too. Want to see the instructions again later? Tap **Install TopTraining as an app** at the bottom of the home screen.",
      "**Updates** happen automatically. When a new version is ready you'll see **A new version is available** at the bottom; tap **Update**.",
      "Update not showing? Close the app completely (also from the list of open apps) and open it again. If that doesn't help, wait a moment with internet on and try again. The version you have is shown at the bottom of the home screen and in Settings.",
    ],
  },
  {
    id: 'zoeken',
    titel: 'Finding drills',
    tekst: [
      'On the home screen, choose **Player drills** or **Goalkeeper drills**. Then pick a category, such as Warm-up, Finishing, Defending & transition or Low diving, or **All drills**. Each category has a small picture so you can find it quickly.',
      'A drill can be in more than one category. The first one is its main category.',
      '- **Search by name** finds a drill from part of its name.',
      '- **Filters**: switch on **Only what fits my numbers** and enter your number of players and keepers. You then only see drills you can run with that group.',
      '- **Age**: under **Filters**, choose an age group: Minis U6 (under 6: playful, with stories), Minis U7 (6–7: technique and 1v1s), U8–U11, U12–U15 or U16–U19. You then only see drills for that group. A drill can belong to several groups; they are shown on the drill. Your own drills without an age always stay in the list.',
      '- **4+ players** means: 4 are working at the same time, extra players join the queue or rotate in. Without a plus (e.g. **6 players**), the drill is built for exactly that number.',
      '- **Favourites**: tap the heart on a drill. The **Only favourites** filter shows just those. Favourites also get priority when you generate a team session.',
      'Your numbers of players and keepers and your age group are remembered.',
    ],
    laatZien: [
      { tekst: 'Go to player drills', pad: '/veld' },
      { tekst: 'Go to goalkeeper drills', pad: '/keepers' },
    ],
  },
  {
    id: 'animatie',
    titel: 'Animation: 2D, 3D and the camera',
    tekst: [
      'Every drill comes with an animated explanation. Tap the animation to pause or play.',
      '- **2D / 3D**: switch at the top right between a top-down drawing and a 3D pitch.',
      '- **Camera** (3D): choose **Top**, **Angled** or **Behind goal**. On a phone, swipe to rotate and pinch to zoom; on a laptop, drag with the mouse and scroll to zoom.',
      '- **Speed**: 0.5×, 1× or 2×. Slow motion makes it easier to follow runs and passes.',
      '- **Movement lines**: show or hide the lines for runs, passes and dribbles.',
      '- **Start again** goes back to the beginning, **Repeat** keeps playing the drill on a loop.',
      "Is 3D not running smoothly? The app then switches on **Simple figures** automatically. You can also switch this on or off yourself in Settings. If 3D doesn't work at all, you'll see the 2D view.",
    ],
    laatZien: [{ tekst: 'See an example', pad: VOORBEELD }],
  },
  {
    id: 'training',
    titel: 'Planning a team session',
    tekst: [
      'On the home screen, tap **Plan a team session**. Enter a name and date if you like, and the number of players and keepers.',
      '- **Age**: choose an age group for the team session (the last one you chose is already filled in). Add drills and Generate a team session then only offer drills for that group. If a drill doesn’t suit it (any more), it is marked in orange.',
      '- **Add drills**: you only see drills that fit your numbers and age group. Tap them in the order you want.',
      '- **Order**: drag a drill up or down by its handle.',
      '- **Equipment to set out**: below the drills is all the equipment you need to put out. For each type it counts the most that any single drill needs, because you reuse it afterwards.',
      '- **Start team session**: team session mode for out on the pitch, one drill at a time. Swipe left or right, or use **Previous** and **Next**.',
      '- **Generate a team session**: tap the parts in the order of your team session (e.g. Warm-up → Finishing → Small-sided games) and the app picks a suitable drill for each part. Not happy with one drill? Tap the swap icon for a different one.',
      "A team session without a name is named after its date automatically. An empty team session (nothing filled in) isn't saved.",
    ],
    laatZien: [{ tekst: 'Go to My team sessions', pad: '/trainingen' }],
  },
  {
    id: 'club',
    titel: 'Circuit session',
    tekst: [
      'With **Circuit session** you run a session with groups rotating round stations. Tap **New circuit session** and choose the **Mini Talents** template (6 groups, 4 × 15 minutes), one of your own templates or **Build your own**. Enter the dates, age group, number of children and groups (2 to 8), and if you like the start time and coaches.',
      '- **Parts**: choose 3 to 6 parts and drag them by the handle. Give each part a length and choose **Stations** (the groups rotate) or **Together** (all groups at once, for example the warm-up or a game). The total time is shown under the parts. With **Save as template** you can use the same setup next time.',
      '- **Groups together**: with **Together** you can also choose how many groups come at once, for example **2 groups** for footwork & coordination in the week of the running coach. That part then has one station where two groups come together each round, always the same two (A + B, C + D …), while the other groups rotate through the regular stations. The trainer with that fixed place in the coach rota goes there automatically.',
      '- **Own setup per session**: with two or more sessions they all use the setup of the first session. Under Parts, choose another session and then **Own setup for this session**: the setup of the first day is copied and you change that day separately (for example footwork & coordination instead of technique on Wednesday). If you change the first day, only the days set to **Same as** change with it. **Make the same again** resets a day. The day choice shows **changed** for such a day; pitch plan, rotation, equipment, round timer and the coach link follow the chosen day.',
      '- **Drills**: choose a drill for each part or tap **Generate** (per part or all at once). You only see what fits the age group and the group size.',
      '- **More drills in one part**: with **Add drill** you can add more, for example three coordination drills. The group stays at that station for the whole part and does them one after the other. Drag to change the order and enter a target time per drill if you like; without one the time is shared equally. The rotation stays the same.',
      '- **Pitch plan**: **Stations** shows the half pitch with numbered stations, **Games** shows the game pitches. With 2 groups A plays B on one pitch, with more groups two groups share a pitch; with an odd number the last group plays among themselves with the coach as joker.',
      '- **Rotation**: every group does each station part once and two groups are never on the same station. A drill is on the pitch as often as needed: once with 2 groups and 4 parts (first two parts swap, then the next two), twice with 6 groups and 3 parts. For each round you see the time, who is where and which coach goes with it, and the app tells you when something is empty or doubled. All groups change at the same time, so a round lasts as long as its longest part.',
      '- **Equipment**: everything to set out, added up across the stations (as often as the drill is on the pitch), plus what is needed extra for the together parts. With more drills in one part the largest number counts, because you do them one after the other. Ticked items are remembered.',
      '- **Coaches**: enter all the names and they are shared out fairly: with 10 coaches and 4 stations that is 3, 3, 2 and 2. Choose **Coaches stay at their station** or **Coaches go with a group**. Under **Pitch plan, rotation and equipment** you can tick coaches per station or move them. If someone is in two places at once, you will see a message.',
      '- **Share with coaches**: a link for the group chat. Coaches don’t need to log in and can open their station straight away, with explanation and animation. Under **I am…** they choose their name and see their own places and drills per round.',
      '- **Sessions**: a circuit session has one or more sessions, each with a date and a start time. Two sessions on one evening (for example 2 groups first, then 4) are two sessions with the same date and a different start time. Choose the session at the top and set its age group, number of children and groups, the group from the rota and the coaches there; without its own value a session uses the value of the first one. Rotation, stations, equipment and the coaches’ arrangement are worked out per session. Under Equipment you also see what you need for the whole evening. In the plan, the round timer and the coaches’ link you choose the session at the top',
      '- **Coach rota**: under Circuit session → **Coach rota** you enter your regular coaches once: days, every week or every other week, which group (also alternating weekly) and, if you like, always at one part, such as Coordination, or only at the session with a certain start time. Choose the **Group** on a circuit session and the app fills in the coaches for each day, also when you copy it to next week. A change by hand only applies to that week. You can share the rota with your team.',
      '- **Share with team**: if you are in a team, the circuit session appears there with your name on it. Team members can open the plan, stations, rotation, equipment and animations, and copy it to their own circuit sessions. Changed it afterwards? Tap **Share with team** again to update the shared plan.',
      '- **Round timer**: follows the length of the parts, shows the round and the time left and gives a signal at each change. Vibrating and keeping the screen on only work if the browser can do it.',
      'In the list you can duplicate a circuit session, or copy it to next week with the calendar icon. An empty circuit session isn’t saved.',
    ],
    laatZien: [{ tekst: 'Go to Circuit session', pad: '/club' }],
  },
  {
    id: 'eigen',
    titel: 'Drawing your own drills',
    tekst: [
      'On the home screen, tap **Create a drill**: your own drills are there. Under **New drill**, choose an empty pitch, half pitch or full pitch and start drawing.',
      '- **Objects**: choose a player, keeper, ball, goal or equipment (cone, disc cone, hurdle, ladder, mannequin …) at the bottom and tap the pitch. Drag to move; use two fingers to zoom.',
      '- **Lines**: choose **Pass / shot**, **Run** or **Dribble** and drag from a player. Every line gets a **step number**: lines with the same number happen at the same time, then the next number follows.',
      '- Line **Options**: movement (normal, sprint, sideways, backwards), ball height, outcome of a shot (goal, keeper catches or dives, wide) and a short wait before a step.',
      '- **Play** shows your drawing as an animation in 2D and 3D. A red number means a line is left out: tap it to see why.',
      "- **Target net**: put a target net in a goal and shoot at a hole (low or high). If it's on target the ball goes in, otherwise it bounces back.",
      '- **Copying a built-in drill**: open a drill from the library and tap **Copy to my drills**. You get the drawing with its animation; if you move anything, it becomes a drawing without animation.',
      'Under **Details** you fill in the name, categories, description, equipment and coaching points. A drill only appears in the library once it has a name and a category.',
    ],
    laatZien: [{ tekst: 'Go to My drills', pad: '/eigen' }],
  },
  {
    id: 'wedstrijd',
    titel: 'Match day: line-up, tactics board and set pieces',
    tekst: [
      '- **Line-up**: choose the format (4v4 up to 11v11) and a formation. Drag players to a position or to the subs; tapping works too. Names are remembered for your next line-up.',
      "- **Tactics board**: create a board from a line-up (your players with their names and the opponent facing them) or an empty board, or pick an **Example tactic**. Choose the format and both teams' formations. With **Draw** you add runs, passes and dribbles with step numbers, just like your own drills.",
      "- **Show names**: show or hide the players' names in 2D and 3D.",
      '- **Set pieces**: corners, free kicks, throw-ins, goal kicks and kick-offs. Choose an **Example set piece** that plays straight away, or a starting position where you draw the lines yourself.',
    ],
    laatZien: [{ tekst: 'Go to Match day', pad: '/wedstrijd' }],
  },
  {
    id: 'tactieken',
    titel: 'Example tactics',
    tekst: [
      'Under **Match day → New tactics board → Example tactic** you will find 17 ready-made tactics with both teams, runs and an animation that plays straight away. Your team is red, the opponents are blue.',
      '- **Pressing**: high press in a 1-4-3-3, mid block in a 1-4-4-2, low block, pressing the back pass to the keeper, the pressing trap on the wing and counter-pressing after losing the ball.',
      '- **Build-up**: building up from the keeper, building up with three (the 6 drops in), build-up through the full-back and the third player, long ball to the striker and the second ball, and building up in 8v8 (1-3-2-2 and 1-3-3-1).',
      '- **Attacking & transition**: overlap on the wing, underlap, switching play, running in behind the defence, counter-attack after winning the ball and the cutback from the byline.',
      'For many tactics you can choose between **11v11** and **8v8** at the top. Below the animation you will find what it is, when to use it and the key points.',
      'With **Save as my own board** or **Edit** you make your own copy that you can change and share, also with your team. The example itself always stays as it is. In your own board you can open the explanation.',
    ],
    laatZien: [{ tekst: 'Go to the example tactics', pad: '/tactieken' }],
  },
  {
    id: 'hervattingen',
    titel: 'Example set pieces',
    tekst: [
      'Under **Match day → New set piece → Example set piece** you will find 20 rehearsed set pieces with both teams, runs and an animation that plays straight away. When attacking your team is red; when defending, red defends the goal.',
      '- **Corners**: near post, short corner, far post, flick-on, stack, to the edge of the box and a screen on the keeper.',
      '- **Free kicks**: with a lay-off, a dummy, a player in the wall, rolled square, from the side and a quick free kick.',
      '- **Throw-ins & kick-offs**: long throw into the box, throw-in with a return pass, throw-in with a run in behind and a rehearsed kick-off.',
      '- **Defending set pieces**: defending corners zonally or man-to-man, and setting up the wall for a free kick.',
      'For several of them you can choose between **11v11** and **8v8** at the top. With **Save as my own board** or **Edit** you make your own copy that you can share; the example stays as it is. If you draw a pass from the touchline yourself, it automatically becomes a throw-in.',
    ],
    laatZien: [{ tekst: 'Go to the example set pieces', pad: '/hervattingen' }],
  },
  {
    id: 'delen',
    titel: 'Sharing, teams, account and backup',
    tekst: [
      '- **Sharing a link**: on a team session, your own drill, line-up, tactics board or set piece, tap **Share**; on a circuit session, tap **Share with coaches**. The link is short, so it works in full in every chat app. The other person opens it straight away, even without the app or an account, and can save it in the app (the link to a circuit session is view-only). Your own drills in a shared team session or circuit session go along with it. Without internet you get a longer link. A link expires if it has not been opened for 180 days; opening it extends the period. In Settings → **My shared links** you can see when a link expires and withdraw it.',
      '- **Account**: log in with your email address in Settings. Your drills, team sessions, favourites and settings are then stored online and the same on all your devices. Without an account, everything still works on this device.',
      '- **Team**: with an account you can create a team or join one with a 6-character team code. On a team session, circuit session, your own drill, line-up, tactics board or set piece, choose **Share with team**. Your teammates see in the team who shared it, and can open and copy it. Only you can change what you shared (**Share with team** again updates it) or withdraw it; an admin can remove it from the team.',
      '- **Export and import**: in Settings → **Your data**, create a file with your drills, team sessions and favourites. Use **Import** to put it on another device. Nothing is overwritten and nothing is duplicated.',
    ],
    laatZien: [
      { tekst: 'Go to Account', pad: '/account' },
      { tekst: 'Go to Teams', pad: '/teams' },
    ],
  },
  {
    id: 'offline',
    titel: 'Using it offline and removed drills',
    tekst: [
      'Once installed, the app also works without internet: all drills, animations (3D too), team sessions and your own drills. Only logging in, syncing and teams need internet; changes are synced as soon as you are back online.',
      "Sometimes a drill is taken out of the library (for example because there's a better version). If it's in an old team session, a shared link, a team or your favourites, you'll still see it there, marked **No longer in the library**. Want to keep it? Tap **Copy to my drills**.",
    ],
  },
  {
    id: 'instellingen',
    titel: 'Language, colours and display',
    tekst: [
      "- **Taal / Language**: Nederlands, English or Automatic (follows your phone's language). Your own drills, team sessions and names are never translated; a shared link opens in the other person's own language.",
      '- **Club colours**: choose the colours of the app. The pitch and the team colours in the animations always stay the same.',
      '- **View**: light, dark or automatic.',
    ],
    laatZien: [{ tekst: 'Go to Settings', pad: '/instellingen' }],
  },
];
