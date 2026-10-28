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
      'Op het startscherm kies je **Spelers** of **Keepers**. Daarna kies je een categorie, zoals Warming-up, Afwerken, Verdedigen en omschakelen of Laag duiken, of **Alle oefeningen**. Elke categorie heeft een klein plaatje, zodat je hem snel terugvindt.',
      'Een oefening kan in meer categorieën staan. De eerste is de hoofdcategorie.',
      '- **Zoek op naam** vindt een oefening aan een deel van de naam.',
      '- **Filters**: zet **Alleen wat past bij mijn aantal** aan en vul het aantal spelers en keepers in. Je ziet dan alleen oefeningen die je met die groep kunt doen.',
      '- **4+ spelers** betekent: er zijn er 4 tegelijk bezig, extra spelers sluiten aan in de rij of wisselen door. Staat er geen plus (bijv. **6 spelers**), dan is de oefening gebouwd op precies dat aantal.',
      '- **Favorieten**: tik op het hartje bij een oefening. Met het filter **Alleen favorieten** zie je alleen die. Favorieten krijgen ook voorrang bij Training genereren.',
      'Je aantallen spelers en keepers worden onthouden.',
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
    titel: 'Training maken',
    tekst: [
      'Tik op het startscherm op **Training maken**. Vul (als je wilt) een naam en datum in en het aantal spelers en keepers.',
      '- **Oefeningen toevoegen**: je ziet alleen oefeningen die bij je aantallen passen. Tik ze aan in de volgorde die je wilt.',
      '- **Volgorde**: sleep een oefening aan het greepje omhoog of omlaag.',
      '- **Klaarzetten**: onder de oefeningen staat al het materiaal dat je moet klaarzetten. Per soort telt het meeste dat één oefening nodig heeft, want je gebruikt het daarna opnieuw.',
      '- **Start training**: de trainingsmodus voor op het veld, oefening voor oefening. Veeg naar links of rechts, of gebruik **Vorige** en **Volgende**.',
      '- **Training genereren**: tik de onderdelen aan in de volgorde van je training (bijv. Warming-up → Afwerken → Partijvormen) en de app kiest bij elk onderdeel een passende oefening. Niet tevreden over één oefening? Tik op het wissel-icoon voor een andere.',
      'Een training zonder naam krijgt vanzelf de datum als naam. Een lege training (niets ingevuld) wordt niet bewaard.',
    ],
    laatZien: [{ tekst: 'Naar Mijn trainingen', pad: '/trainingen' }],
  },
  {
    id: 'eigen',
    titel: 'Eigen oefeningen tekenen',
    tekst: [
      'Bij **Eigen oefeningen → Nieuwe oefening** kies je een leeg veld, half veld of heel veld en begin je met tekenen.',
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
      '- **Delen via een link**: bij een training, opstelling of tactiekbord tik je op **Delen**. De ander opent de link, ook zonder de app, en kan hem opslaan. Eigen oefeningen in een gedeelde training gaan mee.',
      '- **Account**: bij Instellingen log je in met je e-mailadres. Je eigen oefeningen, trainingen, favorieten en instellingen staan dan online en zijn op al je apparaten gelijk. Zonder account werkt alles gewoon op dit apparaat.',
      '- **Team**: met een account maak je een team of word je lid met een teamcode van 6 tekens. Bij een eigen oefening, training of opstelling kies je **Delen met team**; je teamgenoten zien hem dan bij het team en kunnen hem kopiëren.',
      '- **Exporteren en importeren**: bij Instellingen → **Je gegevens** maak je een bestand met je eigen oefeningen, trainingen en favorieten. Met **Importeren** zet je dat op een ander apparaat. Er wordt niets overschreven en niets komt dubbel.',
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
      'Na het installeren werkt de app ook zonder internet: alle oefeningen, animaties (ook 3D), trainingen en eigen oefeningen. Alleen inloggen, synchroniseren en teams hebben internet nodig; wijzigingen gaan mee zodra je weer online bent.',
      'Soms wordt een oefening uit de bibliotheek gehaald (bijvoorbeeld omdat er een betere versie is). Staat hij in een oude training, een gedeelde link, een team of je favorieten, dan zie je hem daar nog, met de melding **Niet meer in de bibliotheek**. Wil je hem houden? Tik op **Kopiëren naar eigen oefeningen**.',
    ],
  },
  {
    id: 'instellingen',
    titel: 'Taal, kleuren en weergave',
    tekst: [
      '- **Taal / Language**: Nederlands, English of Automatisch (volgt de taal van je telefoon). Je eigen oefeningen, trainingen en namen worden niet vertaald; een gedeelde link opent bij de ander in zijn eigen taal.',
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
      'On the home screen, choose **Players** or **Goalkeepers**. Then pick a category, such as Warm-up, Finishing, Defending & transition or Low diving, or **All drills**. Each category has a small picture so you can find it quickly.',
      'A drill can be in more than one category. The first one is its main category.',
      '- **Search by name** finds a drill from part of its name.',
      '- **Filters**: switch on **Only what fits my numbers** and enter your number of players and keepers. You then only see drills you can run with that group.',
      '- **4+ players** means: 4 are working at the same time, extra players join the queue or rotate in. Without a plus (e.g. **6 players**), the drill is built for exactly that number.',
      '- **Favourites**: tap the heart on a drill. The **Only favourites** filter shows just those. Favourites also get priority when you generate a session.',
      'Your numbers of players and keepers are remembered.',
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
    titel: 'Planning a session',
    tekst: [
      'On the home screen, tap **Plan a session**. Enter a name and date if you like, and the number of players and keepers.',
      '- **Add drills**: you only see drills that fit your numbers. Tap them in the order you want.',
      '- **Order**: drag a drill up or down by its handle.',
      '- **Equipment to set out**: below the drills is all the equipment you need to put out. For each type it counts the most that any single drill needs, because you reuse it afterwards.',
      '- **Start session**: session mode for out on the pitch, one drill at a time. Swipe left or right, or use **Previous** and **Next**.',
      '- **Generate a session**: tap the parts in the order of your session (e.g. Warm-up → Finishing → Small-sided games) and the app picks a suitable drill for each part. Not happy with one drill? Tap the swap icon for a different one.',
      "A session without a name is named after its date automatically. An empty session (nothing filled in) isn't saved.",
    ],
    laatZien: [{ tekst: 'Go to My sessions', pad: '/trainingen' }],
  },
  {
    id: 'eigen',
    titel: 'Drawing your own drills',
    tekst: [
      'Under **My drills → New drill**, choose an empty pitch, half pitch or full pitch and start drawing.',
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
      '- **Sharing a link**: on a session, line-up or tactics board, tap **Share**. The other person opens the link, even without the app, and can save it. Your own drills in a shared session go along with it.',
      '- **Account**: log in with your email address in Settings. Your drills, sessions, favourites and settings are then stored online and the same on all your devices. Without an account, everything still works on this device.',
      '- **Team**: with an account you can create a team or join one with a 6-character team code. On one of your drills, sessions or line-ups, choose **Share with team**; your teammates then see it in the team and can copy it.',
      '- **Export and import**: in Settings → **Your data**, create a file with your drills, sessions and favourites. Use **Import** to put it on another device. Nothing is overwritten and nothing is duplicated.',
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
      'Once installed, the app also works without internet: all drills, animations (3D too), sessions and your own drills. Only logging in, syncing and teams need internet; changes are synced as soon as you are back online.',
      "Sometimes a drill is taken out of the library (for example because there's a better version). If it's in an old session, a shared link, a team or your favourites, you'll still see it there, marked **No longer in the library**. Want to keep it? Tap **Copy to my drills**.",
    ],
  },
  {
    id: 'instellingen',
    titel: 'Language, colours and display',
    tekst: [
      "- **Taal / Language**: Nederlands, English or Automatic (follows your phone's language). Your own drills, sessions and names are never translated; a shared link opens in the other person's own language.",
      '- **Club colours**: choose the colours of the app. The pitch and the team colours in the animations always stay the same.',
      '- **View**: light, dark or automatic.',
    ],
    laatZien: [{ tekst: 'Go to Settings', pad: '/instellingen' }],
  },
];
