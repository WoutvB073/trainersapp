/**
 * Unit-tests draaien in het Nederlands, ook op een Engelse computer of de GitHub-server (0.25.0): de app kiest bij
 * "Automatisch" de taal van het toestel, en in Node is dat de taal van het besturingssysteem.
 */
Object.defineProperty(globalThis, 'navigator', { value: { language: 'nl-NL', languages: ['nl-NL'] }, configurable: true, writable: true });
