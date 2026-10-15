import { Kop } from '../components/Kop';

export function NietGevonden() {
  return (
    <div className="pagina">
      <Kop titel="Niet gevonden" ouder="/" />
      <main className="inhoud">
        <div className="leeg">
          <p className="leeg-titel">Deze pagina bestaat niet (meer)</p>
          <p>
            <a href="#/">Naar het startscherm</a>
          </p>
        </div>
      </main>
    </div>
  );
}
