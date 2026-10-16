// Testaccounts (test1@example.com, test2@example.com) in het echte project opruimen via "Account verwijderen" in de app.
// Verwijdert ook hun online gegevens en teams. Gebruik: node tools/e2e/online-opruimen.mjs [basis-url]
import { BASE, MAP, alsGeinstalleerd, slaap, start } from './hulp.mjs';

const WACHTWOORD = 'testwachtwoord1';
const browser = await start();
let fout = false;

for (const email of ['test2@example.com', 'test1@example.com']) {
  const context = await browser.createBrowserContext();
  const page = await context.newPage();
  await alsGeinstalleerd(page);
  await page.setViewport({ width: 1366, height: 820 });
  await page.goto(`${BASE}?r=opruimen#/account`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.account-form', { timeout: 20000 });
  await page.type('.account-form input[type="email"]', email);
  await page.type('.account-form input[type="password"]', WACHTWOORD);
  await page.click('.account-form button[type="submit"]');
  await page.waitForFunction(() => document.querySelector('.account-naam') || document.querySelector('.account-form .waarschuwing'), { timeout: 30000 }).catch(() => {});
  if (await page.$('.account-naam')) {
    await page.evaluate(() => [...document.querySelectorAll('button')].find((b) => b.textContent.startsWith('Account verwijderen'))?.click());
    await page.waitForSelector('.gevaar-blok input[type="password"]', { timeout: 10000 });
    await page.type('.gevaar-blok input[type="password"]', WACHTWOORD);
    await page.evaluate(() => [...document.querySelectorAll('button')].find((b) => b.textContent.startsWith('Definitief verwijderen'))?.click());
    const ok = await page.waitForSelector('.account-form', { timeout: 60000 }).then(() => true, () => false);
    if (!ok) {
      fout = true;
      await page.screenshot({ path: `${MAP}online-opruimen-fout.png` });
      console.log(`${email}: verwijderen lukte niet:`, (await page.evaluate(() => document.body.innerText)).replace(/\s+/g, ' ').slice(0, 300));
    } else console.log(`${email}: verwijderd`);
  } else {
    await slaap(200);
    console.log(`${email}: bestaat niet (${await page.evaluate(() => document.querySelector('.waarschuwing')?.textContent ?? 'geen melding')})`);
  }
  await context.close();
}
await browser.close();
process.exit(fout ? 1 : 0);
