/*
To generate:
- Visit https://translate.google.com/?sl=auto&tl=en&op=translate
- Open Language dropdown
- Open Devtools and use the element picker to pick the root of the language picker
- Right click on the element in devtools and click "Store as global variable"

copy(Object.fromEntries(
    Array.from(
        temp1.querySelectorAll("[data-language-code]"),
        e => [e.dataset.languageCode, e.children[1].textContent]
    ).sort((a, b) => a[1] === "Detect language" ? -1 : b[1] === "Detect language" ? 1 : a[1].localeCompare(b[1]))
))
*/

export const googleLanguages = {
  auto: 'Detect language',
  ab: 'Abkhaz',
  ace: 'Acehnese',
  ach: 'Acholi',
  aa: 'Afar',
  af: 'Afrikaans',
  sq: 'Albanian',
  alz: 'Alur',
  am: 'Amharic',
  ar: 'Arabic',
  hy: 'Armenian',
  as: 'Assamese',
  av: 'Avar',
  awa: 'Awadhi',
  ay: 'Aymara',
  az: 'Azerbaijani',
  ban: 'Balinese',
  bal: 'Baluchi',
  bm: 'Bambara',
  bci: 'Baoulé',
  ba: 'Bashkir',
  eu: 'Basque',
  btx: 'Batak Karo',
  bts: 'Batak Simalungun',
  bbc: 'Batak Toba',
  be: 'Belarusian',
  bem: 'Bemba',
  bn: 'Bengali',
  bew: 'Betawi',
  bho: 'Bhojpuri',
  bik: 'Bikol',
  bs: 'Bosnian',
  br: 'Breton',
  bg: 'Bulgarian',
  bua: 'Buryat',
  yue: 'Cantonese',
  ca: 'Catalan',
  ceb: 'Cebuano',
  ch: 'Chamorro',
  ce: 'Chechen',
  ny: 'Chichewa',
  'zh-CN': 'Chinese (Simplified)',
  'zh-TW': 'Chinese (Traditional)',
  chk: 'Chuukese',
  cv: 'Chuvash',
  co: 'Corsican',
  crh: 'Crimean Tatar (Cyrillic)',
  'crh-Latn': 'Crimean Tatar (Latin)',
  hr: 'Croatian',
  cs: 'Czech',
  da: 'Danish',
  'fa-AF': 'Dari',
  dv: 'Dhivehi',
  din: 'Dinka',
  doi: 'Dogri',
  dov: 'Dombe',
  nl: 'Dutch',
  dyu: 'Dyula',
  dz: 'Dzongkha',
  en: 'English',
  eo: 'Esperanto',
  et: 'Estonian',
  ee: 'Ewe',
  fo: 'Faroese',
  fj: 'Fijian',
  tl: 'Filipino',
  fi: 'Finnish',
  fon: 'Fon',
  fr: 'French',
  'fr-CA': 'French (Canada)',
  fy: 'Frisian',
  fur: 'Friulian',
  ff: 'Fulani',
  gaa: 'Ga',
  gl: 'Galician',
  ka: 'Georgian',
  de: 'German',
  el: 'Greek',
  gn: 'Guarani',
  gu: 'Gujarati',
  ht: 'Haitian Creole',
  cnh: 'Hakha Chin',
  ha: 'Hausa',
  haw: 'Hawaiian',
  iw: 'Hebrew',
  hil: 'Hiligaynon',
  hi: 'Hindi',
  hmn: 'Hmong',
  hu: 'Hungarian',
  hrx: 'Hunsrik',
  iba: 'Iban',
  is: 'Icelandic',
  ig: 'Igbo',
  ilo: 'Ilocano',
  id: 'Indonesian',
  'iu-Latn': 'Inuktut (Latin)',
  iu: 'Inuktut (Syllabics)',
  ga: 'Irish',
  it: 'Italian',
  jam: 'Jamaican Patois',
  ja: 'Japanese',
  jw: 'Javanese',
  kac: 'Jingpo',
  kl: 'Kalaallisut',
  kn: 'Kannada',
  kr: 'Kanuri',
  pam: 'Kapampangan',
  kk: 'Kazakh',
  kha: 'Khasi',
  km: 'Khmer',
  cgg: 'Kiga',
  kg: 'Kikongo',
  rw: 'Kinyarwanda',
  ktu: 'Kituba',
  trp: 'Kokborok',
  kv: 'Komi',
  gom: 'Konkani',
  ko: 'Korean',
  kri: 'Krio',
  ku: 'Kurdish (Kurmanji)',
  ckb: 'Kurdish (Sorani)',
  ky: 'Kyrgyz',
  lo: 'Lao',
  ltg: 'Latgalian',
  la: 'Latin',
  lv: 'Latvian',
  lij: 'Ligurian',
  li: 'Limburgish',
  ln: 'Lingala',
  lt: 'Lithuanian',
  lmo: 'Lombard',
  lg: 'Luganda',
  luo: 'Luo',
  lb: 'Luxembourgish',
  mk: 'Macedonian',
  mad: 'Madurese',
  mai: 'Maithili',
  mak: 'Makassar',
  mg: 'Malagasy',
  ms: 'Malay',
  'ms-Arab': 'Malay (Jawi)',
  ml: 'Malayalam',
  mt: 'Maltese',
  mam: 'Mam',
  gv: 'Manx',
  mi: 'Maori',
  mr: 'Marathi',
  mh: 'Marshallese',
  mwr: 'Marwadi',
  mfe: 'Mauritian Creole',
  chm: 'Meadow Mari',
  'mni-Mtei': 'Meiteilon (Manipuri)',
  min: 'Minang',
  lus: 'Mizo',
  mn: 'Mongolian',
  my: 'Myanmar (Burmese)',
  nhe: 'Nahuatl (Eastern Huasteca)',
  'ndc-ZW': 'Ndau',
  nr: 'Ndebele (South)',
  new: 'Nepalbhasa (Newari)',
  ne: 'Nepali',
  'bm-Nkoo': 'NKo',
  no: 'Norwegian',
  nus: 'Nuer',
  oc: 'Occitan',
  or: 'Odia (Oriya)',
  om: 'Oromo',
  os: 'Ossetian',
  pag: 'Pangasinan',
  pap: 'Papiamento',
  ps: 'Pashto',
  fa: 'Persian',
  pl: 'Polish',
  pt: 'Portuguese (Brazil)',
  'pt-PT': 'Portuguese (Portugal)',
  pa: 'Punjabi (Gurmukhi)',
  'pa-Arab': 'Punjabi (Shahmukhi)',
  qu: 'Quechua',
  kek: 'Qʼeqchiʼ',
  rom: 'Romani',
  ro: 'Romanian',
  rn: 'Rundi',
  ru: 'Russian',
  se: 'Sami (North)',
  sm: 'Samoan',
  sg: 'Sango',
  sa: 'Sanskrit',
  'sat-Latn': 'Santali (Latin)',
  sat: 'Santali (Ol Chiki)',
  gd: 'Scots Gaelic',
  nso: 'Sepedi',
  sr: 'Serbian',
  st: 'Sesotho',
  crs: 'Seychellois Creole',
  shn: 'Shan',
  sn: 'Shona',
  scn: 'Sicilian',
  szl: 'Silesian',
  sd: 'Sindhi',
  si: 'Sinhala',
  sk: 'Slovak',
  sl: 'Slovenian',
  so: 'Somali',
  es: 'Spanish',
  su: 'Sundanese',
  sus: 'Susu',
  sw: 'Swahili',
  ss: 'Swati',
  sv: 'Swedish',
  ty: 'Tahitian',
  tg: 'Tajik',
  'ber-Latn': 'Tamazight',
  ber: 'Tamazight (Tifinagh)',
  ta: 'Tamil',
  tt: 'Tatar',
  te: 'Telugu',
  tet: 'Tetum',
  th: 'Thai',
  bo: 'Tibetan',
  ti: 'Tigrinya',
  tiv: 'Tiv',
  tpi: 'Tok Pisin',
  to: 'Tongan',
  lua: 'Tshiluba',
  ts: 'Tsonga',
  tn: 'Tswana',
  tcy: 'Tulu',
  tum: 'Tumbuka',
  tr: 'Turkish',
  tk: 'Turkmen',
  tyv: 'Tuvan',
  ak: 'Twi',
  udm: 'Udmurt',
  uk: 'Ukrainian',
  ur: 'Urdu',
  ug: 'Uyghur',
  uz: 'Uzbek',
  ve: 'Venda',
  vec: 'Venetian',
  vi: 'Vietnamese',
  war: 'Waray',
  cy: 'Welsh',
  wo: 'Wolof',
  xh: 'Xhosa',
  sah: 'Yakut',
  yi: 'Yiddish',
  yo: 'Yoruba',
  yua: 'Yucatec Maya',
  zap: 'Zapotec',
  zu: 'Zulu',
} as const;

export type GoogleLanguage = keyof typeof googleLanguages;

export interface GoogleData {
  src: string;
  sentences: {
    trans: string;
    orig: string;
  }[];
}

export async function translate(text: string, sourceLang: GoogleLanguage, targetLang: GoogleLanguage): Promise<string> {
  const params = {
    client: 'gtx',
    sl: sourceLang,
    tl: targetLang,
    dt: 't',
    dj: '1',
    source: 'input',
    q: text,
  };

  const url = 'https://translate.googleapis.com/translate_a/single?' + new URLSearchParams(params);

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to translate "${text}" (${sourceLang} -> ${targetLang})\n${res.status} ${res.statusText}`);

  const data: GoogleData = await res.json();

  return extractTranslatedText(data);
}

export function extractTranslatedText(data: GoogleData): string {
  if (!data || !Array.isArray(data.sentences)) return '';
  return data.sentences.map((s) => s.trans).join('');
}

export function isGoogleLanguage(lang: string | GoogleLanguage): lang is GoogleLanguage {
  return Object.keys(googleLanguages).includes(lang);
}

// function formatTranslated(text: string, data: GoogleData) {
//   for (const { orig, trans } of data.sentences) {
//     text = text.replace(orig, trans);
//   }
//   return text;
// }

// function formatTranslated(data: GoogleData) {
//   return data.sentences
//     .map((s) => s?.trans)
//     .filter(Boolean)
//     .join('');
// }

// async function translate(text: string, sourceLang: GoogleLanguage, targetLang: GoogleLanguage): Promise<string> {
//   const translated = await googleTranslate(text, sourceLang, targetLang);
//   return formatTranslated(translated);
// }
