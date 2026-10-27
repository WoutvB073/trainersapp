import { useState } from 'react';
import { Kop } from '../../components/Kop';
import { Icoon } from '../../components/Icoon';
import { CATEGORIEEN, SOORT_NAAM } from '../../data/categorieen';
import { eigenOefeningen, useEigenOefening } from '../../eigen/opslag';
import { ontbreekt } from '../../eigen/eigen';
import { benodigdhedenUit, telPersonen } from '../../editor/editor';
import { ga, vervang } from '../../router';
import type { EigenOefening, Soort } from '../../model/types';
import { NietGevonden } from '../NietGevonden';
import { Stapper } from '../training/onderdelen';
import { t } from '../../i18n/t';

/** Lijst ↔ tekstvak met één regel per punt. */
const naarTekst = (l: string[]) => l.join('\n');
const naarLijst = (s: string) =>
  s
    .split('\n')
    .map((r) => r.trim())
    .filter(Boolean);

export function Gegevens({ id }: { id: string }) {
  const o = useEigenOefening(id);
  if (!o) return <NietGevonden />;
  return <Formulier start={o} />;
}

function Formulier({ start }: { start: EigenOefening }) {
  const voorstel = benodigdhedenUit(start.tekening);
  const personen = telPersonen(start.tekening);
  const nieuw = !start.naam && !start.categorieen.length;
  const [naam, setNaam] = useState(start.naam);
  const [soort, setSoort] = useState<Soort>(start.soort);
  const [categorieen, setCategorieen] = useState<string[]>(start.categorieen);
  const [uitleg, setUitleg] = useState(start.uitleg);
  const [organisatie, setOrganisatie] = useState(start.organisatie ?? '');
  // Bij een nieuwe oefening: benodigdheden en aantallen alvast invullen uit de tekening.
  const [benodigd, setBenodigd] = useState(naarTekst(start.benodigdheden.length || !nieuw ? start.benodigdheden : voorstel));
  const [spelers, setSpelers] = useState(nieuw && start.soort === 'veld' ? personen.spelers : start.spelersNodig);
  const [keepers, setKeepers] = useState(nieuw ? personen.keepers || start.keepersNodig : start.keepersNodig);
  const [doorwisselbaar, setDoorwisselbaar] = useState(start.doorwisselbaar);
  const [meerSpelers, setMeerSpelers] = useState(start.meerSpelers ?? '');
  const [coach, setCoach] = useState(naarTekst(start.coachpunten));
  const [makkelijker, setMakkelijker] = useState(naarTekst(start.variaties.makkelijker));
  const [moeilijker, setMoeilijker] = useState(naarTekst(start.variaties.moeilijker));
  const [fouten, setFouten] = useState<string[]>([]);

  const zetSoort = (s: Soort) => {
    if (s === soort) return;
    setSoort(s);
    // Categorieën horen bij de soort: wat niet bestaat valt weg.
    setCategorieen((c) => c.filter((x) => CATEGORIEEN[s].some((k) => k.id === x)));
    if (s === 'keeper' && keepers === 0) setKeepers(1);
  };
  const wissel = (c: string) => setCategorieen((l) => (l.includes(c) ? l.filter((x) => x !== c) : [...l, c]));

  const opslaan = () => {
    const nu = eigenOefeningen.haal(start.id) ?? start;
    const o: EigenOefening = {
      ...nu,
      naam: naam.trim(),
      soort,
      categorieen,
      uitleg: uitleg.trim(),
      organisatie: organisatie.trim(),
      benodigdheden: naarLijst(benodigd),
      spelersNodig: spelers,
      keepersNodig: keepers,
      doorwisselbaar,
      coachpunten: naarLijst(coach),
      variaties: {
        makkelijker: naarLijst(makkelijker),
        moeilijker: naarLijst(moeilijker),
      },
    };
    if (!doorwisselbaar && meerSpelers.trim()) o.meerSpelers = meerSpelers.trim();
    else delete o.meerSpelers;
    const mis = ontbreekt(o);
    setFouten(mis);
    if (mis.length) {
      // Toch bewaren wat er is (niets kwijt), maar nog niet in de bibliotheek.
      eigenOefeningen.bewaar(o);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    eigenOefeningen.bewaar(o);
    vervang(`/oefening/${o.id}`);
  };

  const voorstelNieuw = voorstel.filter((v) => !naarLijst(benodigd).includes(v));

  return (
    <div className="pagina">
      <Kop titel={t('Gegevens')} ouder={`/eigen/${start.id}/tekenen`} />
      <main className="inhoud smal formulier">
        {fouten.length > 0 && (
          <div className="waarschuwing" role="alert">
            {t('{fouten}. De rest is wel bewaard.', { fouten: fouten.join(t(' en ')) })}
          </div>
        )}
        <label className="veld-label">
          {t('Naam')} <span className="verplicht">{t('verplicht')}</span>
          <input value={naam} onChange={(e) => setNaam(e.target.value)} maxLength={80} placeholder={t('Bijv. Kaatsen en afronden')} />
        </label>

        <fieldset className="veld-groep">
          <legend>
            {t('Categorieën')} <span className="verplicht">{t('minstens één')}</span>
          </legend>
          <div className="keuze-twee" role="radiogroup" aria-label={t('Soort oefening')}>
            {(['veld', 'keeper'] as const).map((s) => (
              <button type="button" key={s} role="radio" aria-checked={soort === s} className={`keuze${soort === s ? ' aan' : ''}`} onClick={() => zetSoort(s)}>
                <Icoon naam={s === 'veld' ? 'spelers' : 'keeper'} maat={20} />
                {SOORT_NAAM[s]}
              </button>
            ))}
          </div>
          <div className="chips">
            {CATEGORIEEN[soort].map((c) => (
              <button type="button" key={c.id} className={`chip${categorieen.includes(c.id) ? ' aan' : ''}`} aria-pressed={categorieen.includes(c.id)} onClick={() => wissel(c.id)}>
                {categorieen.includes(c.id) && <Icoon naam="vink" maat={16} />}
                {c.naam}
              </button>
            ))}
          </div>
          <p className="klein">{t('De eerste die je kiest, is de hoofdcategorie.')}</p>
        </fieldset>

        <label className="veld-label">
          {t('Uitleg')}
          <textarea value={uitleg} onChange={(e) => setUitleg(e.target.value)} rows={4} placeholder={t('Wat doen de spelers?')} />
        </label>
        <label className="veld-label">
          {t('Organisatie')}
          <textarea value={organisatie} onChange={(e) => setOrganisatie(e.target.value)} rows={3} placeholder={t('Vakgrootte, afstanden, waar staan de spelers')} />
        </label>

        <label className="veld-label">
          {t('Benodigdheden')} <span className="klein">{t('één per regel')}</span>
          <textarea value={benodigd} onChange={(e) => setBenodigd(e.target.value)} rows={3} />
        </label>
        {voorstelNieuw.length > 0 && (
          <div className="voorstel">
            <span className="klein">{t('Uit de tekening:')}</span>
            {voorstelNieuw.map((v) => (
              <button type="button" key={v} className="chip" onClick={() => setBenodigd((b) => naarTekst([...naarLijst(b), v]))}>
                <Icoon naam="plus" maat={14} />
                {v}
              </button>
            ))}
            <button type="button" className="link-knop" onClick={() => setBenodigd(naarTekst(voorstel))}>
              {t('Alles overnemen')}
            </button>
          </div>
        )}

        <fieldset className="veld-groep">
          <legend>{t('Aantal')}</legend>
          {soort === 'veld' && <Stapper label={t('Spelers')} icoon="spelers" waarde={spelers} onStap={(d) => setSpelers((v) => Math.max(0, v + d))} />}
          <Stapper label={t('Keepers')} icoon="keeper" waarde={keepers} onStap={(d) => setKeepers((v) => Math.max(soort === 'keeper' ? 1 : 0, v + d))} />
          <div className="keuze-twee" role="radiogroup" aria-label={t('Doorwisselbaar of vast aantal')}>
            <button type="button" role="radio" aria-checked={doorwisselbaar} className={`keuze${doorwisselbaar ? ' aan' : ''}`} onClick={() => setDoorwisselbaar(true)}>
              {t('Doorwisselbaar ({n}+)', { n: soort === 'veld' ? spelers : keepers })}
            </button>
            <button type="button" role="radio" aria-checked={!doorwisselbaar} className={`keuze${!doorwisselbaar ? ' aan' : ''}`} onClick={() => setDoorwisselbaar(false)}>
              {t('Vast aantal')}
            </button>
          </div>
          <p className="klein">{doorwisselbaar ? t('Extra spelers sluiten aan in de rij of wisselen door.') : t('De oefening is gebouwd op precies dit aantal.')}</p>
          {!doorwisselbaar && (
            <label className="veld-label">
              {t('Tip bij meer spelers')}
              <input value={meerSpelers} onChange={(e) => setMeerSpelers(e.target.value)} maxLength={160} placeholder={t('Met meer spelers: joker op de zijlijn of tweede veldje')} />
            </label>
          )}
        </fieldset>

        <label className="veld-label">
          {t('Coachpunten')} <span className="klein">{t('één per regel')}</span>
          <textarea value={coach} onChange={(e) => setCoach(e.target.value)} rows={3} />
        </label>
        <label className="veld-label">
          {t('Makkelijker')} <span className="klein">{t('één per regel')}</span>
          <textarea value={makkelijker} onChange={(e) => setMakkelijker(e.target.value)} rows={2} />
        </label>
        <label className="veld-label">
          {t('Moeilijker')} <span className="klein">{t('één per regel')}</span>
          <textarea value={moeilijker} onChange={(e) => setMoeilijker(e.target.value)} rows={2} />
        </label>

        <div className="knoppenrij formulier-knoppen">
          <button className="knop knop-primair" onClick={opslaan}>
            <Icoon naam="vink" maat={20} />
            {t('Opslaan')}
          </button>
          <button className="knop" onClick={() => ga(`/eigen/${start.id}/tekenen`)}>
            <Icoon naam="potlood" maat={20} />
            {t('Tekening')}
          </button>
        </div>
      </main>
    </div>
  );
}
