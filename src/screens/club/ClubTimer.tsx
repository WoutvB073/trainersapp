import { useEffect, useRef, useState } from 'react';
import { Kop } from '../../components/Kop';
import { Icoon } from '../../components/Icoon';
import { BLOK_DUUR, BLOKKEN, clubNaam, partijvelden, RONDES, timerStand } from '../../clubtraining/clubtraining';
import { useClub } from '../../clubtraining/opslag';
import { NietGevonden } from '../NietGevonden';
import { blokNaam, blokStijl, RondeLijst, veldGroepen } from './onderdelen';
import { t as vt } from '../../i18n/t';

interface Staat {
  /** Starttijdstip (ms), opgeschoven met de pauzes. */
  start: number;
  /** Gepauzeerd sinds (ms). */
  pauze: number | null;
}

const sleutel = (id: string) => `trainersapp.clubTimer.${id}`;

function lees(id: string): Staat | null {
  try {
    return JSON.parse(localStorage.getItem(sleutel(id)) ?? 'null') as Staat | null;
  } catch {
    return null;
  }
}

function bewaar(id: string, s: Staat | null) {
  try {
    if (s) localStorage.setItem(sleutel(id), JSON.stringify(s));
    else localStorage.removeItem(sleutel(id));
  } catch {
    /* niet erg */
  }
}

const klok = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

/** Twee piepjes; het geluid moet starten vanuit een tik (Start), daarom wordt de context daar gemaakt. */
function piep(ctx: AudioContext | null) {
  if (!ctx) return;
  void ctx.resume();
  [0, 0.35].forEach((na) => {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.frequency.value = 880;
    g.gain.value = 0.4;
    o.connect(g).connect(ctx.destination);
    o.start(ctx.currentTime + na);
    o.stop(ctx.currentTime + na + 0.22);
  });
}

type WakeLock = { release(): Promise<void> };

/** Scherm aan houden zolang de timer loopt, als de browser dat kan. Opnieuw vragen als de app weer in beeld komt. */
function useSchermAan(aan: boolean): boolean {
  const [gelukt, setGelukt] = useState(true);
  useEffect(() => {
    if (!aan) return;
    const wl = (navigator as Navigator & { wakeLock?: { request(s: 'screen'): Promise<WakeLock> } }).wakeLock;
    if (!wl) {
      setGelukt(false);
      return;
    }
    let slot: WakeLock | null = null;
    let weg = false;
    const vraag = () => {
      wl.request('screen').then(
        (s) => {
          if (weg) void s.release();
          else slot = s;
          setGelukt(true);
        },
        () => setGelukt(false),
      );
    };
    const zichtbaar = () => {
      if (document.visibilityState === 'visible') vraag();
    };
    vraag();
    document.addEventListener('visibilitychange', zichtbaar);
    return () => {
      weg = true;
      document.removeEventListener('visibilitychange', zichtbaar);
      void slot?.release();
    };
  }, [aan]);
  return gelukt;
}

/** Kwartiertimer: 3 rondes en de partijvormen, elk 15 minuten, met trillen en geluid bij het wisselen. */
export function ClubTimer({ id }: { id: string }) {
  const c = useClub(id);
  const [staat, setStaat] = useState<Staat | null>(() => lees(id));
  const [nu, setNu] = useState(() => Date.now());
  const geluid = useRef<AudioContext | null>(null);
  const vorig = useRef<number | null>(null);

  const zet = (s: Staat | null) => {
    setStaat(s);
    bewaar(id, s);
  };
  const loopt = !!staat && staat.pauze === null;
  const schermAan = useSchermAan(loopt);
  const stand = timerStand(staat ? ((staat.pauze ?? nu) - staat.start) / 1000 : 0);
  const klaar = !!staat && stand.klaar;

  useEffect(() => {
    if (!loopt) return;
    const i = window.setInterval(() => setNu(Date.now()), 250);
    return () => window.clearInterval(i);
  }, [loopt]);

  // Trillen en piepen bij elke wissel.
  const merk = klaar ? BLOKKEN.length : stand.blok;
  useEffect(() => {
    if (!loopt) return;
    if (vorig.current !== null && vorig.current !== merk) {
      navigator.vibrate?.([400, 150, 400]);
      piep(geluid.current);
    }
    vorig.current = merk;
  }, [merk, loopt]);

  if (!c) return <NietGevonden />;

  const start = () => {
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!geluid.current && Ctx) geluid.current = new Ctx();
    void geluid.current?.resume();
    const t0 = Date.now();
    setNu(t0);
    if (!staat) zet({ start: t0, pauze: null });
    else if (staat.pauze !== null) zet({ start: staat.start + (t0 - staat.pauze), pauze: null });
  };
  const pauze = () => staat && zet({ ...staat, pauze: Date.now() });
  const volgende = () => {
    if (!staat) return;
    const t0 = staat.pauze ?? Date.now();
    zet({ ...staat, start: staat.start - stand.rest * 1000 });
    setNu(t0);
  };
  const stop = () => {
    zet(null);
    vorig.current = null;
  };

  const partij = stand.blok >= RONDES;
  const blokTitel = partij ? blokNaam('partijvormen') : vt('Ronde {nr} van {n}', { nr: stand.blok + 1, n: RONDES });

  return (
    <div className="pagina">
      <Kop titel={clubNaam(c)} ouder={`/club/${id}`} />
      <main className="inhoud smal club-timer">
        <p className="club-timer-blok" style={partij ? blokStijl('partijvormen') : undefined}>
          {klaar ? vt('Klaar!') : blokTitel}
        </p>
        <p className="club-timer-tijd" role="timer">
          {klok(staat ? stand.rest : BLOK_DUUR)}
        </p>
        <div className="club-timer-knoppen">
          {!loopt && !klaar && (
            <button className="knop knop-primair" onClick={start}>
              <Icoon naam="afspelen" maat={22} />
              {staat ? vt('Verder') : vt('Start')}
            </button>
          )}
          {loopt && !klaar && (
            <button className="knop knop-primair" onClick={pauze}>
              <Icoon naam="pauze" maat={22} />
              {vt('Pauze')}
            </button>
          )}
          {staat && !klaar && (
            <button className="knop" onClick={volgende}>
              <Icoon naam="verder" maat={22} />
              {vt('Volgende')}
            </button>
          )}
          {staat && (
            <button className="knop" onClick={stop}>
              {vt('Stoppen')}
            </button>
          )}
        </div>
        {!klaar && (partij ? (
          <ul className="club-ronde">
            {partijvelden(c.groepjes).map((v) => (
              <li key={v.nr}>
                <b>{vt('Veld {nr}', { nr: v.nr })}</b>
                {veldGroepen(v)}
              </li>
            ))}
          </ul>
        ) : (
          <RondeLijst c={c} ronde={stand.blok} />
        ))}
        {loopt && !schermAan && <p className="klein club-noot">{vt('Deze browser kan het scherm niet aan houden. Zet automatisch vergrendelen even uit.')}</p>}
        <p className="klein club-noot">{vt('Bij elke wissel trilt de telefoon (als dat kan) en hoor je een signaal.')}</p>
      </main>
    </div>
  );
}
