/* @layer shared-asset-extraction @kind verbatim @source the game's ROM text dictionaries and alphabets, as in upstream text_compression.py */
import type { EuLanguageBase, LanguageConfig } from './language-data.type';

const kAlphabetLatinHead: string[] = [
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P',
  'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'a', 'b', 'c', 'd', 'e', 'f',
  'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v',
  'w', 'x', 'y', 'z', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '!', '?',
];

const kTextAlphabet_US: string[] = [
  ...kAlphabetLatinHead,
  '-', '.', ',',
  '[...]', '>', '(', ')',
  '[Ankh]', '[Waves]', '[Snake]', '[LinkL]', '[LinkR]',
  '"', '[Up]', '[Down]', '[Left]',
  '[Right]', "'", '[1HeartL]', '[1HeartR]', '[2HeartL]', '[3HeartL]', '[3HeartR]',
  '[4HeartL]', '[4HeartR]', ' ', '<', '[A]', '[B]', '[X]', '[Y]',
];

const kAlphabetEuHead: string[] = [
  ...kAlphabetLatinHead,
  '-', '.', ',', '[...]', '>', '(', ')',
  '[Ankh]', '[Waves]', '[Snake]', '[LinkL]', '[LinkR]',
  '"', '[UpL]', '[UpR]', '[LeftL]',
  '[LeftR]', "'", '[1HeartL]', '[1HeartR]', '[2HeartL]', '[3HeartL]', '[3HeartR]',
  '[4HeartL]', '[4HeartR]', ' ', 'ö', '[A]', '[B]', '[X]', '[Y]', 'ü',
];

const kAlphabetEuAccents: string[] = [
  ':', '[DownL]', '[DownR]', '[RightL]', '[RightR]',
  'è', 'é', 'ê', 'à', 'ù', 'ç',
];

const kTextAlphabet_DE: string[] = [
  ...kAlphabetEuHead, 'ß', ...kAlphabetEuAccents, 'Ä', 'Ö', 'Ü', 'ä',
];

const kTextAlphabet_FR: string[] = [
  ...kAlphabetEuHead, 'ô', ...kAlphabetEuAccents, 'â', 'û', 'î', 'ä',
];

const kTextDictionary_US: string[] = [
  '    ', '   ', '  ', "'s ", 'and ', 'are ', 'all ', 'ain', 'and', 'at ',
  'ast', 'an', 'at', 'ble', 'ba', 'be', 'bo', 'can ', 'che', 'com',
  'ck', 'des', 'di', 'do', 'en ', 'er ', 'ear', 'ent', 'ed ', 'en',
  'er', 'ev', 'for', 'fro', 'give ', 'get', 'go', 'have', 'has', 'her',
  'hi', 'ha', 'ight ', 'ing ', 'in', 'is', 'it', 'just', 'know', 'ly ',
  'la', 'lo', 'man', 'ma', 'me', 'mu', "n't ", 'non', 'not', 'open',
  'ound', 'out ', 'of', 'on', 'or', 'per', 'ple', 'pow', 'pro', 're ',
  're', 'some', 'se', 'sh', 'so', 'st', 'ter ', 'thin', 'ter', 'tha',
  'the', 'thi', 'to', 'tr', 'up', 'ver', 'with', 'wa', 'we', 'wh',
  'wi', 'you', 'Her', 'Tha', 'The', 'Thi', 'You',
];

const kTextDictionary_DE: string[] = [
  '    ', '   ', '                                          ', '-Knopf', ' ich ',
  ' Sch', ' Ver', ' zu ', ' es ', 'aber',
  'alle', 'auch', 'ang', 'aus', 'auf',
  'an', 'bist', 'bin', 'bei', 'der ',
  'die ', 'das ', 'den ', 'dem ', 'daß',
  'der', 'die', 'das', 'den', 'da',
  'etwas', 'ein ', 'ein', 'en ', 'er ',
  'es ', 'en', 'er', 'es', 'ei',
  'für', 'fe', 'habe', 'hier', 'hast',
  'her', 'ich ', 'icht', 'ich', 'ist',
  'ie ', 'im', 'ie', 'kannst ', 'kannst',
  'kommen', 'kann ', 'll', 'mich', 'mein',
  'mit', 'mal', 'mir', 'nicht ', 'nicht',
  'nen', 'nn', 'och ', 'och', 'or',
  'schon', 'sich', 'sein', 'sch', 'sie',
  'st', 'tte', 'te ', 'te', 'und ',
  'und', 'ung', 'um', 'von', 'ver',
  'vor', 'wird', 'zu ', 'Amulett', 'Aber',
  'Deine', 'Dich ', 'Dir ', 'Dir', 'Der',
  'Die', 'Das', 'Du ', 'Du', 'Da',
  'Ein', 'Hyrule', 'Hier', 'Ich ', 'Master-Schwert',
  'Mach', 'Rubine', 'Sch', 'Sie', 'Ver',
  'Weisen', 'Zelda',
];

const kTextDictionary_FR: string[] = [
  '                                          ', ' de ', ' la ', ' le ', ' ! ',
  ' d', ' p', ' t', ' !', ", c'est moi, Sahasrahla",
  ', ', 'ais ', 'as ', 'an', 'ai',
  'a ', 'che', 'ce', 'ch', 'dans ',
  'des ', 'de ', 'de', 'est ', 'ent',
  'en ', 'er ', 'es ', 'en', 'es',
  'et', 'eu', 'e,', 'e ', 'ique',
  'ien', 'is ', 'ie', 'in', 'ir',
  'is', 'i ', 'les ', 'la ', 'le ',
  'le', 'll', 'maintenant', 'magique', 'ment',
  'mon', 'mai', 'me', 'ne ', 'onne',
  'oir', 'our', 'ouv', 'oi', 'on',
  'ou', 'or', 'pouvoir', 'pour', 'peux',
  'pas', 'que ', 'qu', 'rubis', 're ',
  'ra', 're', 'r ', 'sorcier', 's l',
  's d', 'se', 'so', 's ', 'tro',
  'te ', 'tu ', 'te', 't ', 'un',
  'ur', 'u ', 'ver', 'Ah ! Ah ! Ah !', "C'est",
  'Ganon', 'Maintenant', 'Merci', 'Monde', 'Perle de Lune',
  'Tu as trouvé ', 'Ténèbres', 'Tu peux', 'Tu ',
];

const kText_CommandLengths_US: number[] = [
  1, 1, 1, 1, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 1, 1, 1, 1, 1,
];
const kText_CommandNames_US: string[] = [
  'NextPic', 'Choose', 'Item', 'Name', 'Window', 'Number',
  'Position', 'ScrollSpd', 'Selchg', 'Unused_Crash', 'Choose3',
  'Choose2', 'Scroll', '1', '2', '3', 'Color',
  'Wait', 'Sound', 'Speed', 'Unused_Mark', 'Unused_Mark2', 'Unused_Clear',
  'Waitkey',
];

const kText_CommandLengths_EU: number[] = [
  1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2,
];
const kText_CommandNames_EU: string[] = [
  'Selchg', 'Choose3', 'Choose2', 'Scroll', '1', '2', '3',
  'Color', 'Wait', 'Sound', 'Speed', 'Mark', 'Mark2',
  'Clear', 'Waitkey', 'EndMessage', 'NextPic', 'Choose',
  'Item', 'Name', 'Window', 'Number', 'Position', 'ScrollSpd',
];

const langUS: LanguageConfig = {
  id: 'us',
  alphabet: kTextAlphabet_US,
  dictionary: kTextDictionary_US,
  commandLengths: kText_CommandLengths_US,
  commandNames: kText_CommandNames_US,
  romAddrs: [0x9c8000, 0x8edf40],
  commandStart: 0x67,
  switchBank: 0x80,
  finish: 0xff,
  dictBaseEnc: 0x88,
  dictBaseDec: 0x88,
  escapeCharacter: null,
  encoder: 'org',
};

const langEN: LanguageConfig = {
  ...langUS,
  id: 'en',
  alphabet: kTextAlphabet_DE,
  dictionary: kTextDictionary_US,
  romAddrs: [0x9c8000, 0x8edf60],
};

const langEU_base: EuLanguageBase = {
  commandLengths: kText_CommandLengths_EU,
  commandNames: kText_CommandNames_EU,
  commandStart: 0x70,
  switchBank: 0x88,
  finish: 0x8f,
  dictBaseEnc: 0x88,
  dictBaseDec: 0x90,
  escapeCharacter: null,
  encoder: 'new',
};

const langDE: LanguageConfig = {
  ...langEU_base,
  id: 'de',
  alphabet: kTextAlphabet_DE,
  dictionary: kTextDictionary_DE,
  romAddrs: [0x9c8000, 0x8ceb00],
};

const langFR: LanguageConfig = {
  ...langEU_base,
  id: 'fr',
  alphabet: kTextAlphabet_FR,
  dictionary: kTextDictionary_FR,
  romAddrs: [0x9c8000, 0x8ce800],
};

const langFR_C: LanguageConfig = {
  ...langEU_base,
  id: 'fr-c',
  alphabet: kTextAlphabet_FR,
  dictionary: kTextDictionary_FR,
  romAddrs: [0x9c8000, 0x8cf150],
};

const kLanguages: Record<string, LanguageConfig> = {
  us: langUS,
  de: langDE,
  fr: langFR,
  'fr-c': langFR_C,
  en: langEN,
};

export { kLanguages };
