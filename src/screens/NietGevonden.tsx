import { Kop } from '../components/Kop';
import { t } from '../i18n/t';

export function NietGevonden() {
  return (
    <div className="pagina">
      <Kop titel={t('Niet gevonden')} ouder="/" />
      <main className="inhoud">
        <div className="leeg">
          <p className="leeg-titel">{t('Deze pagina bestaat niet (meer)')}</p>
          <p>
            <a href="#/">{t('Naar het startscherm')}</a>
          </p>
        </div>
      </main>
    </div>
  );
}
