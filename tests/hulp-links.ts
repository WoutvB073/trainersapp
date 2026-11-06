/** Code zoals links van vóór 0.31.3 eruitzagen: niet gecomprimeerd. */
export const base64Oud = (x: unknown) => Buffer.from(JSON.stringify(x), 'utf8').toString('base64url');
