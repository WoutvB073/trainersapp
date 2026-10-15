# TrainersApp — werkafspraken voor Claude

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
  `AnimatieSpeler.tsx` — bediening, 2D/3D-keuze, terugvallen op 2D.
- `src/engine/platform.ts` — toestel/browser + `kiesScherm` (installatiescherm of app); `src/screens/installeren/`.
- `src/styles/thema.css` — alle kleuren als CSS-variabelen (ook veld/teams), basis voor Clubkleuren.

## Browsertests (`tools/e2e/`, preview op poort 4184 moet draaien; geef een URL mee om online te testen)
- `schermen.mjs` — alle schermen op 5 formaten (als geïnstalleerde app), offline (ook 3D), 2D/3D-knop.
- `installeren.mjs` — installatiescherm per toestel, standalone = app, computerkeuze onthouden.
- `drie-d.mjs` — 3D-momenten van beide oefeningen + camerastanden (`blad-3d-*.png`), cameragrenzen, beeldsnelheid.
- `oefeningen.mjs [url] [filter]` — per oefening 3D/2D-screenshots (`blad-oef-<map>-<categorie>.png`), aantallen per categorie, "Keeper nodig".
- `hulp.mjs` — `alsGeinstalleerd(page)` (standalone nadoen), `zetTijd`, `blad` (screenshots naast elkaar).
  Chrome draait met de echte videokaart (`--use-angle=d3d11`); `trainersapp.3dAltijd=1` zet de 2D-terugval uit in tests.

## Valkuilen
- Vitest onthoudt `import.meta.glob`: na een **nieuw** databestand eerst `rm -rf node_modules/.vitest-cache`, anders ziet `npm test` het bestand niet.
- `@volgende` in een herhaling is cyclisch: de lijst moet precies de volgorde van passeerders zijn (simuleer de rijen even op papier).
- Na `JSON.stringify` herschrijven van een databestand kloppen `sed`-zoekopdrachten niet meer (andere opmaak): wijzig data met een klein node-script.
- Overlap in 3D (Schuin) ontstaat als spelers achter elkaar in de kijkrichting staan: zet rijen/duels liever naast elkaar.
- Een oefening draaien (kwartslag) kan met een klein node-script: (x, y) → (y, breedte − x), hoeken −90, zone breedte/lengte wisselen.
- Bash-heredoc met `cat > bestand` zonder heredoc erachter blijft hangen op invoer: schrijf scripts met Write.
- Nieuwe oefening: `npm test` controleert ook of de bal alleen via een pass/schot van speler wisselt, en afstanden (personen ≥ 1,5 m, niet door pionnen/paaltjes/hoedjes); daarna `oefeningen.mjs` en de bladen bekijken.
- Op een telefoon-/tabletformaat in de browser zie je alleen het installatiescherm: in tests `alsGeinstalleerd(page)`,
  in de preview-pane een laptopformaat gebruiken of "Gewoon in de browser gebruiken" kiezen.
- De ingebouwde browser-pane maakt na scrollen vaak lege/verkeerde screenshots → `tools/e2e/schermen.mjs` (puppeteer).
- Preview + service worker: na een nieuwe build eerst de service worker afmelden of `?r=…` gebruiken, anders zie je de oude versie.
- Een bal "bij" een speler ligt rekenkundig 0,55 m voor de speler; de 2D-renderer duwt hem visueel naar de rand
  van het poppetje (niet over het rugnummer).
