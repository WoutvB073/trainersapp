/** Korte unieke id (tijd + toeval), voor trainingen en eigen oefeningen. */
export const maakId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
