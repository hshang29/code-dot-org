import MessageFormat from 'messageformat';

import data from '../../i18n/oceans.json';

type CompiledMessages = Record<
  string,
  (options?: Record<string, unknown>) => string
>;

let messages: CompiledMessages | undefined;
let locale = 'en';
let translatedKeys = new Set<string>();

/**
 * Initialises the i18n runtime with optional caller-supplied message overrides.
 *
 * Must be called before `t`. Subsequent calls reset the message registry.
 *
 * @param i18n - Optional compiled message overrides keyed by message id.
 */
const initI18n = (i18n: CompiledMessages = {}, language = 'en'): void => {
  locale = language;
  translatedKeys = new Set(Object.keys(i18n));
  // English pluralisation rules are used for all locales for now.
  const mf = new MessageFormat('en');
  messages = {...(mf.compile(data) as unknown as CompiledMessages), ...i18n};
};

/**
 * Looks up a localised string by key.
 *
 * @param key - Message id as defined in `i18n/oceans.json`.
 * @param options - Interpolation variables for the message.
 * @returns The formatted localised string.
 * @throws If `initI18n` has not been called yet.
 */
const t = (key: string, options?: Record<string, unknown>): string => {
  if (!messages) {
    throw new Error('I18n must be initialized before calling t');
  }
  return messages[key](options);
};

export default {
  initI18n,
  getLocale: () => locale,
  getMessageLocale: (key: string) => (translatedKeys.has(key) ? locale : 'en'),
  t,
};
