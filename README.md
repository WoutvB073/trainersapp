# TopTraining

(Repository en link heten nog "trainersapp"; dat blijft zo, zodat geïnstalleerde apps en gedeelde links blijven werken.)

Webapp voor voetbaltrainers (JO7 t/m JO19, veld én keepers): een oefenbibliotheek met bewegende uitleg.
Statische Progressive Web App: installeerbaar op het beginscherm, werkt op telefoon, tablet en laptop, en
na de eerste keer openen ook zonder internet. Visie, datamodel en fasering: **[PLAN.md](PLAN.md)**.

- **Online (na de eerste deploy):** https://woutvb073.github.io/trainersapp/

---

## 1. Installeren op de telefoon

**iPhone:** open de link in **Safari** → deel-icoon (vierkantje met pijl) → **Zet op beginscherm** → **Voeg toe**.
Open de app daarna altijd via het icoon.

**Android:** open de link in **Chrome** → knop **Installeren** (of **⋮** → **App installeren**).

**Laptop:** Chrome/Edge → installatie-icoon in de adresbalk, of kies **Gewoon in de browser gebruiken**.

In een gewone browser op telefoon of tablet toont de app alleen deze installatie-uitleg; de app zelf opent vanaf het icoon.

## 2. Online zetten (GitHub Pages)

### Eenmalig
1. Maak op GitHub een **openbare** repository `trainersapp` (andere naam? pas `BASE` aan in `vite.config.ts`).
2. Koppel en push:
   ```bash
   git remote add origin https://github.com/WoutvB073/trainersapp.git
   git push -u origin main
   ```
3. Op GitHub: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
4. Het tabblad **Actions** laat de workflow *Online zetten* zien; na ± 1 minuut staat de app online.

### Elke nieuwe versie
```bash
npm test
npm run build
git add -A
git commit -m "Korte beschrijving"
git push
```
`.github/workflows/deploy.yml` test, bouwt en publiceert automatisch bij elke push naar `main`
(volgen met `gh run watch`). Wie de app al heeft, krijgt de melding **"Er is een nieuwe versie"** met **Bijwerken**.

## 3. Lokaal werken

```bash
npm install
npm run dev        # ontwikkelserver: http://localhost:5173/trainersapp/
npm test           # unit-tests (tijdlijn + controle van alle oefeningen)
npm run build      # productieversie in dist/ (incl. iconen en service worker)
npm run preview    # productieversie bekijken (offline/installeren testen)
node tools/e2e/schermen.mjs      # alle schermen op 5 formaten + offline-test (preview moet draaien, poort 4184)
node tools/e2e/installeren.mjs   # installatiescherm per toestel
node tools/e2e/drie-d.mjs        # 3D-momenten, camerastanden en beeldsnelheid
```

Op je telefoon testen zonder te deployen: `npm run dev -- --host` en open het getoonde netwerkadres
(zelfde wifi). Installeren en offline werken alleen via https, dus dat test je op de online versie.

## 4. Een oefening toevoegen

Oefeningen staan in losse JSON-bestanden per hoofdcategorie:
`src/data/oefeningen/veld/<categorie>.json` en `src/data/oefeningen/keepers/<categorie>.json`.
Zet een nieuwe oefening in de lijst van het juiste bestand (of maak een nieuw bestand met de categorie-id als naam).
Het formaat staat in PLAN.md → *Datamodel*; kijk naar de twee voorbeeldoefeningen. `npm test` controleert
daarna of alles klopt (categorieën, verwijzingen in de animatie, unieke id's).

Categorie-id's — veld: `warming-up`, `techniek`, `loopcoordinatie`, `pass-en-trap`, `afwerken`, `positiespel`,
`partijvormen`, `spelletjes`; keepers: `warming-up`, `laag-duiken`, `hoog-duiken`, `bal-verwerken`, `voorzetten`,
`passing`, `een-op-een`, `reactie`, `spelletjes`.
