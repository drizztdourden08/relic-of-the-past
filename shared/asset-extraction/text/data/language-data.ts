/* @layer shared-asset-extraction @kind data */
/**
 * Language definitions for ALTTP text compression/decompression.
 * Data-driven — each language is a config object, not a class.
 *
 * Ported from: core/zelda3/assets/text_compression.py
 */

interface LanguageConfig {
  id: string;
  alphabet: string[];
  dictionary: string[];
  commandLengths: number[];
  commandNames: string[];
  romAddrs: number[];
  commandStart: number;
  switchBank: number;
  finish: number;
  dictBaseEnc: number;
  dictBaseDec: number;
  escapeCharacter: number | null;
  encoder: 'org' | 'new';
}

// ─── Alphabets ───

const kTextAlphabet_US: string[] = [
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P',
  'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'a', 'b', 'c', 'd', 'e', 'f',
  'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v',
  'w', 'x', 'y', 'z', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '!', '?',
  '-', '.', ',',
  '[...]', '>', '(', ')',
  '[Ankh]', '[Waves]', '[Snake]', '[LinkL]', '[LinkR]',
  '"', '[Up]', '[Down]', '[Left]',
  '[Right]', "'", '[1HeartL]', '[1HeartR]', '[2HeartL]', '[3HeartL]', '[3HeartR]',
  '[4HeartL]', '[4HeartR]', ' ', '<', '[A]', '[B]', '[X]', '[Y]',
];

const kTextAlphabet_DE: string[] = [
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P',
  'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'a', 'b', 'c', 'd', 'e', 'f',
  'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v',
  'w', 'x', 'y', 'z', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '!', '?',
  '-', '.', ',', '[...]', '>', '(', ')',
  '[Ankh]', '[Waves]', '[Snake]', '[LinkL]', '[LinkR]',
  '"', '[UpL]', '[UpR]', '[LeftL]',
  '[LeftR]', "'", '[1HeartL]', '[1HeartR]', '[2HeartL]', '[3HeartL]', '[3HeartR]',
  '[4HeartL]', '[4HeartR]', ' ', 'ö', '[A]', '[B]', '[X]', '[Y]', 'ü',
  'ß', ':', '[DownL]', '[DownR]', '[RightL]', '[RightR]',
  'è', 'é', 'ê', 'à', 'ù', 'ç', 'Ä', 'Ö', 'Ü', 'ä',
];

const kTextAlphabet_FR: string[] = [
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P',
  'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'a', 'b', 'c', 'd', 'e', 'f',
  'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v',
  'w', 'x', 'y', 'z', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '!', '?',
  '-', '.', ',', '[...]', '>', '(', ')',
  '[Ankh]', '[Waves]', '[Snake]', '[LinkL]', '[LinkR]',
  '"', '[UpL]', '[UpR]', '[LeftL]',
  '[LeftR]', "'", '[1HeartL]', '[1HeartR]', '[2HeartL]', '[3HeartL]', '[3HeartR]',
  '[4HeartL]', '[4HeartR]', ' ', 'ö', '[A]', '[B]', '[X]', '[Y]', 'ü',
  'ô', ':', '[DownL]', '[DownR]', '[RightL]', '[RightR]',
  'è', 'é', 'ê', 'à', 'ù', 'ç', 'â', 'û', 'î', 'ä',
];

const kTextAlphabet_ES: string[] = [
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P',
  'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'é', 'Y', 'Z', 'a', 'b', 'c', 'd', 'e', 'f',
  'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v',
  'ó', 'x', 'y', 'z', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '!', '?',
  '[Waves]', '.', ',',
  '[...]', '>', '(', ')',
  'ñ', 'ú', 'á', '[LinkL]', '[LinkR]', '"', '[Up]', '[Down]', '[Left]',
  '[Right]', 'í', '[1HeartL]', '[1HeartR]', '[2HeartL]', '[3HeartL]', '[3HeartR]',
  '[Ankh]', '[4HeartR]', ' ', '[Snake]', '[A]', '[B]', '[X]', '[Y]', '[I]',
  '¡', '¿', 'Ñ',
];

const kTextAlphabet_NL: string[] = [
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P',
  'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'a', 'b', 'c', 'd', 'e', 'f',
  'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v',
  'w', 'x', 'y', 'z', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '!', '?',
  '-', '.', ',', '[...]', '>', '(', ')', '[Ankh]',
  '[Waves]', '[Snake]', '[LinkL]', '[LinkR]', '"', '[Up]', '[Down]', '[Left]',
  '[Right]', "'", '[1HeartL]', '[1HeartR]', '[2HeartL]', '[3HeartL]', '[3HeartR]',
  '[4HeartL]', '[4HeartR]', ' ', '<', '[A]', '[B]', '[X]', '[Y]',
];

const kTextAlphabet_SV: string[] = [
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'Ö', 'P',
  'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'a', 'b', 'c', 'd', 'e', 'f',
  'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v',
  'w', 'x', 'y', 'z', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '!', '?',
  'å', '.', ',', 'ä', '>', '(', ')', 'ö',
  'Å', 'Ä', '[LinkL]', '[LinkR]', '"', '[Up]', '[Down]', '[Left]',
  '[Right]', "'", '[1HeartL]', '[1HeartR]', '[2HeartL]', '[3HeartL]', '[3HeartR]',
  '[4HeartL]', '[4HeartR]', ' ', '<', '[Ankh]', '[Waves]', '[Snake]', '-', '[I]',
  '[i]', '…', ' ',
];

const kTextAlphabet_PL: string[] = [
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P',
  'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'a', 'b', 'c', 'd', 'e', 'f',
  'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v',
  'w', 'x', 'y', 'z', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '!', '?',
  '-', '.', ',', 'ć', '[Right]', '(', ')', '[Ankh]',
  '[Waves]', '[Snake]', '[LinkL]', '[LinkR]', '"', '[Up]', '[Down]', 'ę',
  'ł', 'ń', '[1HeartL]', '[1HeartR]', '[2HeartL]', '[3HeartL]', '[3HeartR]',
  'ą', '[4HeartR]', ' ', '[Left]', 'ó', 'ś', 'ż', 'ź', 'Ł',
  'Ś', 'Ż', 'Ź',
];

const kTextAlphabet_PT: string[] = [
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P',
  'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'a', 'b', 'c', 'd', 'e', 'f',
  'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v',
  'w', 'x', 'y', 'z', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '!', '?',
  '-', '.', ',', '[...]', '>', '(', ')', '[Ankh]',
  '[Waves]', '[Snake]', '[LinkL]', '[LinkR]', '"', '[Up]', '[Down]', '[Left]',
  '[Right]', "'", '[1HeartL]', '[1HeartR]', '[2HeartL]', '[3HeartL]', '[3HeartR]',
  '[4HeartL]', '[4HeartR]', ' ', '<', '[A]', '[B]', '[X]', '[Y]', '[I]',
  '¡', '[!]', 'Á', 'À', 'Â', 'Ã', 'É', 'Ê', 'Í', 'Ó', 'Ô', 'Õ', 'Ú', 'á', 'à', 'â',
  'ã', 'é', 'ê', 'í', 'ó', 'ô', 'õ', 'ú', 'ç',
];

// ─── Dictionaries ───

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

const kTextDictionary_ES: string[] = [
  '    ', '   ', '  ', ' en', ' la ', ' el ', ' de ', 'ien', 'tra', ' de',
  'te ', 'ar', 'a ', 'ada', 'es', 'as', 'o ', ' con', 'ero', 'ado',
  'e ', 'que', 'en', 'al', 'os ', 'ora', 'nte', ' al', 'lo ', 'or',
  'os', 'er', 'aci', 'res', ' que ', ' es', 'el', 'los ', 'tar', ' se',
  ', ', 'ro', ' de l', ' est', 're', 'on', 'an', 'pued', ' del', 'ás ',
  'la', 'ti', 'la ', 'Es', 'to', 'ta', 'para', 'uer', 'ier', ' un ',
  ' por', 'oder', 'da', 'in', 'cu', ' ha', 'per', 'ano', ' ve', 'cer',
  'lo', ' no ', 'ic', 'ra', 'ab', 'ir', ' una', 'undo', 'es ', 'as ',
  'con', 'a, ', 'te', ' m', 'gu', ' tu', 'ando', ' p', 'de', 'le',
  'ol', 'o, ', 'ten', 'lle', ' a ', 'aba', 'com',
];

const kTextDictionary_NL: string[] = [
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

const kTextDictionary_SV: string[] = [
  '    ', '   ', '  ', 'Du ', 'till', 'vill', 'bara', 'det', 'den', 'och',
  'en ', 'r ', 'n ', 'ett', 'en', ' d', 'a ', 'Hjäl', 'har', 'ter',
  't ', 'var', ' s', 'de', 'kan', 'med', 'som', 'för', 'att', 'ar',
  ' h', 'er', 'jag', 'dig', 'öppna', 'mig', 'är', 'inte', 'hit', 'på ',
  'an', 'e ', 'rupie', '0kej', ' m', 'et', ', ', 'gång', 'måst', 'ten',
  ' f', 'u ', 'men', 'te', 'tt', 'ka', 'vara', 'ken', '0m ', 'från',
  'myck', 'någo', 'in', ' k', ' i', 'vil', 'bar', 'ond', 'För', 'Jag',
  'ra', 'tack', 'll', 'g ', 'ta', 'om', 'anna', 'alla', 'en,', 'ber',
  'hem', 'han', 'st', 'ig', ' t', 'tro', 'kraf', 'ör', ' v', 'ag',
  '… ', 'får', 'sin', 'mme', 'mma', 'en ', 'tat',
];

const kTextDictionary_PL: string[] = [
  'Trój', '...', 'ść', 'Nie', ' nie', ' się', 'może', ' że', 'and', 'at ',
  ' ty', 'an', 'at', 'kus', 'ba', 'be', 'bo', 'chce', 'che', 'ki ',
  'za', 'des', 'di', 'do', 'en ', 'er ', 'sz ', 'ent', 'ed ', 'en',
  'er', ' w', 'moc', 'zię', 'przez', 'ale', 'go', 'dzie', 'has', 'rze',
  'hi', 'ha', 'który', 'aby ', 'in', 'is', 'it', 'twoj', 'Może', 'łeś',
  'la', 'lo', 'czn', 'ma', 'me', 'mu', 'szcz', 'ska', 'śli', 'przy',
  'znaj', 'iecz', 'of', 'on', 'or', '   ', 'ple', 'pow', 'pro', 're ',
  're', 'mnie', 'se', ' z', 'so', 'st', 'któr', ' jak', 'ksz', 'sze',
  'coś', ' je', 'to', 'tr', 'up', 'kie', 'praw', 'wa', 'we', 'mi',
  'wi', 'szy', 'chc', 'pra', 'cie', ' i ', 'esz',
];

const kTextDictionary_PT: string[] = [
  '     ', '    ', '   ', '                                          ', 'o ', 'a ', 'e ', '..', 'de', 'ar',
  's ', 'ra', ' d', 'es', 'ocê ', 'do', ' a', ' p', 'er', ' e',
  'que', 'r ', 'os', 'te', ', ', 'as', 'or', 'm ', 'en', ' o',
  'nt', 're', ' s', 'co', 'da', 'se', 'st', ' c', ' m', 'em',
  'ma', 'ta', ' n', 'ad', 'on', 'al', 'ro', 'an', 'u ', 'nd',
  ' um', 'pa', 'ca', 'el', ' f', 'to', 'in', ' t', 'ou', 'ei',
  'ss', 'ir', 'no', 'ri', 'tr', 'me', 'la', 'ia', 'le', 've',
  'is', 'sa', 'eu', 'pe', 'a.', 'na', 'so', 'mo', 'ga', 'o.',
  'á ', 'lo', 'ha', 'pr', 'ua', ' l', '! ', 'ui', 'am', 'ti',
  'io', 'gu', 'i ', 'di', 'nh', ' i', 'id',
];

// ─── Command info ───

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

// ─── Language configs ───

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

const langES: LanguageConfig = {
  ...langUS,
  id: 'es',
  alphabet: kTextAlphabet_ES,
  dictionary: kTextDictionary_ES,
  romAddrs: [0x9c8000, 0x8edf40],
};

const langNL: LanguageConfig = {
  ...langUS,
  id: 'nl',
  alphabet: kTextAlphabet_NL,
  dictionary: kTextDictionary_NL,
  romAddrs: [0x9c8000, 0x8edf40],
};

const langSV: LanguageConfig = {
  ...langUS,
  id: 'sv',
  alphabet: kTextAlphabet_SV,
  dictionary: kTextDictionary_SV,
  romAddrs: [0x9c8000, 0x8edf40],
};

const langPL: LanguageConfig = {
  ...langUS,
  id: 'pl',
  alphabet: kTextAlphabet_PL,
  dictionary: kTextDictionary_PL,
  romAddrs: [0x9c8000, 0x8edf40],
};

const langPT: LanguageConfig = {
  ...langUS,
  id: 'pt',
  alphabet: kTextAlphabet_PT,
  dictionary: kTextDictionary_PT,
  romAddrs: [0x9c8000, 0x8edf40],
  escapeCharacter: 0x62,
  encoder: 'new',
};

const langEU_base: Omit<LanguageConfig, 'id' | 'alphabet' | 'dictionary' | 'romAddrs'> = {
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

/** All supported languages indexed by their code. */
const kLanguages: Record<string, LanguageConfig> = {
  us: langUS,
  de: langDE,
  fr: langFR,
  'fr-c': langFR_C,
  en: langEN,
  es: langES,
  pl: langPL,
  pt: langPT,
  redux: langUS,
  nl: langNL,
  sv: langSV,
};

const dialogueFilename = (lang: string): string => {
  if (lang === 'us') return 'dialogue.txt';
  return `dialogue_${lang.replace('-', '_')}.txt`;
};

const usesNewFormat = (lang: string): boolean => {
  return kLanguages[lang].encoder === 'new';
};

export { dialogueFilename, kLanguages, usesNewFormat };
export type { LanguageConfig };
