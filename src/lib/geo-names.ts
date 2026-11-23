/**
 * Place-name formatting with no geo dataset import, so the GeoJSON file stays
 * out of every module that only needs to render a name.
 */
export type SiteLang = 'ru' | 'en' | 'de';

export type PlaceNameList = { en: string; ru: string; de: string };

/** Minimal place shape needed to localise a name (GeoPlace satisfies it). */
interface LocalisedPlace {
  name: string;
  /** Localised names. English lives in `name`. */
  nameRu?: string;
  nameDe?: string;
}

type LocaleNameKey = 'name' | 'nameRu' | 'nameDe';

const LOCALISED_NAME_KEYS: Record<SiteLang, LocaleNameKey> = {
  ru: 'nameRu',
  de: 'nameDe',
  en: 'name',
};

const SITE_LANGS: SiteLang[] = ['en', 'ru', 'de'];

/** Name of a place in the given site language, English as the fallback. */
export function getPlaceName(place?: LocalisedPlace | null, lang: SiteLang = 'en'): string {
  if (!place) return '';
  return place[LOCALISED_NAME_KEYS[lang]] || place.name;
}

/** Build a { en, ru, de } triple with the given per-language mapper. */
export function byLanguage(
  place: LocalisedPlace | null | undefined,
  map: (place: LocalisedPlace | null | undefined, lang: SiteLang) => string,
): PlaceNameList {
  return Object.fromEntries(SITE_LANGS.map((lang) => [lang, map(place, lang)])) as PlaceNameList;
}

/** Bare name per language, without the country suffix. */
export function getPlaceNameList(place?: LocalisedPlace | null): PlaceNameList {
  return byLanguage(place, getPlaceName);
}

/**
 * Value for the `data-geo-names` attribute. Templates use it so the encoding
 * lives in one place, and the client switcher reads the same dataset.
 */
export function geoNameAttr(names: PlaceNameList): string {
  return JSON.stringify(names);
}
