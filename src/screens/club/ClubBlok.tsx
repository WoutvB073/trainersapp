import { Kop } from '../../components/Kop';
import { vindOefening } from '../../data/oefeningen';
import { blokNaam, vindOnderdeel } from '../../clubtraining/clubtraining';
import { useClub } from '../../clubtraining/opslag';
import { NietGevonden } from '../NietGevonden';
import { BlokOefeningen } from './onderdelen';

/** De oefeningen van één onderdeel, met uitleg en animatie (vanuit het plan en de rondetimer). */
export function ClubBlok({ id, blok }: { id: string; blok: string }) {
  const c = useClub(id);
  const o = c && vindOnderdeel(c, blok);
  if (!c || !o) return <NietGevonden />;
  return (
    <div className="pagina">
      <Kop titel={blokNaam(o.categorie)} ouder={`/club/${id}/plan`} />
      <main className="inhoud smal">
        <BlokOefeningen onderdeel={o} vind={vindOefening} />
      </main>
    </div>
  );
}
