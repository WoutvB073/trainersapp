import { terug } from '../router';
import { Icoon } from './Icoon';
import { t } from '../i18n/t';

/** Kopbalk met terugknop. `ouder` = waar "terug" heen gaat als er geen eerdere pagina in de app is. */
export function Kop({ titel, ouder }: { titel: string; ouder?: string }) {
  return (
    <header className="kop">
      {ouder !== undefined ? (
        <button className="kop-terug" onClick={() => terug(ouder)} aria-label={t('Terug')}>
          <Icoon naam="terug" maat={26} />
        </button>
      ) : (
        <span className="kop-ruimte" />
      )}
      <h1 className="kop-titel">{titel}</h1>
      <span className="kop-ruimte" />
    </header>
  );
}
