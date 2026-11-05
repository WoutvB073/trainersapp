import type { ReactNode } from 'react';
import { APP_NAAM, VERSIE } from '../config';
import { OEFENINGEN } from '../data/oefeningen';
import { meervoud } from '../components/Labels';
import { Icoon } from '../components/Icoon';
import { ga } from '../router';
import { SyncIcoon } from './online/Account';
import { maakTraining } from './training/MijnTrainingen';
import type { Soort } from '../model/types';
import { CircuitPlaatje, KeepersPlaatje, SpelersPlaatje, TeamPlaatje, TekenPlaatje, WedstrijdPlaatje } from '../components/Illustraties';
import { t } from '../i18n/t';

/** Tegel die als geheel een link is. */
function Link({ pad, klas, plaatje, titel, sub }: { pad: string; klas: string; plaatje: ReactNode; titel: string; sub: string }) {
  return (
    <a
      className={`tegel ${klas}`}
      href={`#${pad}`}
      onClick={(e) => {
        e.preventDefault();
        ga(pad);
      }}
    >
      {plaatje}
      <span className="tegel-tekst">
        <span className="tegel-titel">{titel}</span>
        <span className="tegel-sub">{sub}</span>
      </span>
      <Icoon naam="verder" className="tegel-pijl" />
    </a>
  );
}

function TeamTegel() {
  return (
    <div className="tegel tegel-training">
      <TeamPlaatje />
      <span className="tegel-tekst">
        <span className="tegel-titel">{t('Teamtraining')}</span>
        <span className="tegel-sub">{t('Eén groep: stel je training samen en geef hem stap voor stap.')}</span>
      </span>
      <span className="tegel-knoppen">
        <button className="knop knop-primair" onClick={maakTraining}>
          <Icoon naam="plus" maat={18} />
          {t('Teamtraining maken')}
        </button>
        <button className="knop" onClick={() => ga('/trainingen')}>
          {t('Mijn teamtrainingen')}
        </button>
      </span>
    </div>
  );
}

const aantalOefeningen = (soort: Soort) => {
  const n = OEFENINGEN.filter((o) => o.soort === soort).length;
  return meervoud(n, 'oefening', 'oefeningen');
};

/** `opInstalleren`: in de browser (telefoon, tablet of computer): terug naar de installatie-uitleg. */
export function Start({ opInstalleren }: { opInstalleren?: () => void }) {
  return (
    <div className="pagina pagina-start">
      <header className="start-kop">
        <img src={`${import.meta.env.BASE_URL}logo.svg`} alt="" className="start-logo" width={56} height={56} />
        <div>
          <h1 className="start-titel">{APP_NAAM}</h1>
          <p className="start-sub">{t('Oefeningen voor spelers en keepers')}</p>
        </div>
        <div className="start-acties">
          <SyncIcoon />
          <button className="icoon-knop start-help" aria-label={t('Help')} title={t('Help')} onClick={() => ga('/help')}>
            <Icoon naam="vraag" maat={25} />
          </button>
          <button className="icoon-knop start-instellingen" aria-label={t('Instellingen')} title={t('Instellingen')} onClick={() => ga('/instellingen')}>
            <Icoon naam="instellingen" maat={26} />
          </button>
        </div>
      </header>
      <main className="inhoud">
        <div className="tegels">
          <TeamTegel />
          <Link pad="/wedstrijd" klas="tegel-groot tegel-wedstrijd" plaatje={<WedstrijdPlaatje />} titel={t('Wedstrijd')} sub={t('Opstelling, tactiekbord en spelhervattingen')} />
          <Link pad="/club" klas="tegel-groot tegel-club" plaatje={<CircuitPlaatje />} titel={t('Circuittraining')} sub={t('Groepjes draaien door langs stations, met uitleg per trainer.')} />
          <Link pad="/veld" klas="tegel-klein tegel-veld" plaatje={<SpelersPlaatje />} titel={t('Oefeningen spelers')} sub={aantalOefeningen('veld')} />
          <Link pad="/keepers" klas="tegel-klein tegel-keepers" plaatje={<KeepersPlaatje />} titel={t('Oefeningen keepers')} sub={aantalOefeningen('keeper')} />
          <Link pad="/eigen" klas="tegel-klein tegel-eigen" plaatje={<TekenPlaatje />} titel={t('Oefening maken')} sub={t('Teken je eigen oefening')} />
        </div>
        {opInstalleren && (
          <button className="link-knop" onClick={opInstalleren}>
            <Icoon naam="download" maat={18} />
            {t('{app} als app installeren', { app: APP_NAAM })}
          </button>
        )}
        <p className="voetnoot start-voet">{t('Versie')} {VERSIE}</p>
      </main>
    </div>
  );
}
