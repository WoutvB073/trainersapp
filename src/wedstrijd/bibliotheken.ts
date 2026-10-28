import { TACTIEKEN, TACTIEK_GROEPEN, type Tactiek } from './tactieken';
import { HERVATTINGEN, HERVATTING_GROEPEN } from './hervattingVoorbeelden';
import type { BordSoort } from './wedstrijd';
import type { IcoonNaam } from '../components/Icoon';
import { t } from '../i18n/t';

/**
 * De twee voorbeeldbibliotheken van Wedstrijd: tactieken (0.28.0) en spelhervattingen (0.29.0). Zelfde schermen
 * (lijst, voorbeeld met versiekeuze en uitleg, eigen bord); alleen teksten, paden en het soort bord verschillen.
 */
export interface Bibliotheek {
  soort: BordSoort;
  titel: string;
  intro: string;
  uitlegKop: string;
  icoon: IcoonNaam;
  /** Pad van de lijst (#…) en het begin van het pad van één voorbeeld. */
  lijst: string;
  voorbeeld: string;
  groepen: { id: string; naam: string }[];
  items: Tactiek[];
}

export const BIBLIOTHEKEN: Record<BordSoort, Bibliotheek> = {
  tactiek: {
    soort: 'tactiek',
    titel: t('Voorbeeldtactieken'),
    intro: t('Kant-en-klare tactiekborden met beide teams. Ze spelen meteen af; sla er een op als eigen bord om hem aan te passen.'),
    uitlegKop: t('Uitleg bij deze tactiek'),
    icoon: 'tactiek',
    lijst: '/tactieken',
    voorbeeld: '/tactiek',
    groepen: TACTIEK_GROEPEN,
    items: TACTIEKEN,
  },
  hervatting: {
    soort: 'hervatting',
    titel: t('Voorbeeldhervattingen'),
    intro: t('Ingestudeerde spelhervattingen met beide teams. Ze spelen meteen af; sla er een op als eigen bord om hem aan te passen.'),
    uitlegKop: t('Uitleg bij deze spelhervatting'),
    icoon: 'hervatting',
    lijst: '/hervattingen',
    voorbeeld: '/hervatting',
    groepen: HERVATTING_GROEPEN,
    items: HERVATTINGEN,
  },
};

/** Een voorbeeld (tactiek of spelhervatting) op id, met de bibliotheek waar het in staat. */
export function vindVoorbeeld(id: string | undefined, soort?: BordSoort): { bieb: Bibliotheek; x: Tactiek } | undefined {
  if (!id) return undefined;
  for (const bieb of Object.values(BIBLIOTHEKEN)) {
    if (soort && bieb.soort !== soort) continue;
    const x = bieb.items.find((i) => i.id === id);
    if (x) return { bieb, x };
  }
  return undefined;
}
