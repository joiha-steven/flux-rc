// Share links: "#c=" + base64url(JSON of the config).
import { normalizeConfig } from '../core/index.js';

const PREFIX = '#c=';

export function encodeShare(config) {
  const bytes = new TextEncoder().encode(JSON.stringify(config));
  let binary = '';
  bytes.forEach((b) => { binary += String.fromCharCode(b); });
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// Always the root page, so whoever opens the link gets their own browser's language, not the sender's.
export function shareUrl(config) {
  return `${location.origin}/${PREFIX}${encodeShare(config)}`;
}

export function hasShare(hash) {
  return typeof hash === 'string' && hash.startsWith(PREFIX);
}

/** Throws when the hash cannot be decoded or is not a config object. */
export function decodeShare(hash) {
  const text = hash.slice(PREFIX.length).replace(/-/g, '+').replace(/_/g, '/');
  const binary = atob(text);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return normalizeConfig(JSON.parse(new TextDecoder().decode(bytes)));
}
