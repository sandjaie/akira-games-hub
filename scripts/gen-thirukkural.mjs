/**
 * Builds kid-friendly Thirukkural content for ages ~5–10.
 *
 *   node scripts/gen-thirukkural.mjs
 *
 * Downloads the open Thirukkural JSON (Tamil couplets + commentaries),
 * rewrites meanings for kids, and writes:
 *   src/content/thirukkural/kurals.generated.ts
 *   src/content/thirukkural/chapters.generated.ts
 *
 * Rule (same idea as space facts): keep authentic Tamil lines from the
 * source; write the kid sentences ourselves so reading level stays ours.
 */
import { mkdirSync, writeFileSync } from 'node:fs'

const KURAL_URL =
  'https://cdn.jsdelivr.net/gh/tk120404/thirukkural@master/thirukkural.json'
const DETAIL_URL =
  'https://cdn.jsdelivr.net/gh/tk120404/thirukkural@master/detail.json'

const OUT_DIR = new URL('../src/content/thirukkural/', import.meta.url)

/** Kid English titles for each of the 133 chapters (adhikarams), in order. */
const CHAPTER_EN = [
  // 1–38 Virtue
  'Saying thanks to God',
  'Why rain is special',
  'People who live simply',
  'Being good is strong',
  'Happy family life',
  'A kind partner',
  'Children are a gift',
  'Having a loving heart',
  'Welcoming guests',
  'Saying kind words',
  'Remembering kindness',
  'Being fair',
  'Staying calm',
  'Good manners',
  'Respecting families',
  'Being patient',
  'Not feeling jealous',
  'Not wanting what others have',
  'Not talking behind backs',
  'Not saying useless words',
  'Staying away from bad deeds',
  'Helping everyone',
  'Sharing and giving',
  'A good name',
  'Being kind to all',
  'Not hurting animals for food',
  'Trying hard to be good',
  'Not pretending',
  'Being honest',
  'Telling the truth',
  'Not getting angry',
  'Not doing mean things',
  'Not hurting living things',
  'Nothing stays forever',
  'Letting go of greed',
  'Seeing what is true',
  'Wanting less',
  'What life brings',
  // 39–108 Wealth / wise living
  'A great leader',
  'Learning every day',
  'Not learning is hard',
  'Listening well',
  'Having good sense',
  'Fixing your mistakes',
  'Friends who help you grow',
  'Avoiding bad company',
  'Think before you act',
  'Knowing your strength',
  'Choosing the right time',
  'Choosing the right place',
  'Choosing carefully',
  'Giving the right job',
  'Caring for family',
  'Not forgetting',
  'Fair rules',
  'Harsh rules hurt',
  'No scary bullying',
  'Gentle kindness',
  'Finding out the truth',
  'Having energy',
  'Not being lazy',
  'Trying your best',
  'Hope in hard times',
  'Good helpers',
  'Speaking clearly',
  'Clean actions',
  'Steady work',
  'How to get things done',
  'Being a good messenger',
  'Working with leaders',
  'Reading people’s feelings',
  'Knowing the room',
  'Speaking without fear',
  'A land and its people',
  'Strong safe places',
  'Earning in good ways',
  'A brave team',
  'Brave spirit',
  'Friends who care',
  'Choosing friends wisely',
  'Old friendship',
  'Bad company',
  'False friends',
  'Foolish choices',
  'Not knowing enough',
  'Fighting and hate',
  'Strong hate hurts',
  'Understanding anger',
  'Trouble at home',
  'Not upsetting wise people',
  'Not being led the wrong way',
  'Staying away from bad paths',
  'Not drinking to forget',
  'Not gambling',
  'Medicine and health',
  'Coming from a good home',
  'Honor above all',
  'True greatness',
  'Being your best',
  'Good manners every day',
  'Wealth without sharing',
  'Feeling shy of shame',
  'Keeping a family strong',
  'Farming and food',
  'Being very poor',
  'Asking for help',
  'Fear of asking',
  'Meanness',
  // 109–133 Caring hearts
  'Warm first feelings',
  'Noticing kindness',
  'Happy togetherness',
  'Praising good qualities',
  'Special caring',
  'Letting shyness go',
  'When people talk',
  'Hard to be apart',
  'Feeling lonely',
  'Eyes full of tears',
  'Feeling pale and tired',
  'Missing someone a lot',
  'Thinking of them',
  'Dreams at night',
  'Sad evenings',
  'Growing thin with worry',
  'Talking to your heart',
  'Losing your calm',
  'Wanting to meet again',
  'Reading the signs',
  'Wanting a hug again',
  'Arguing with your heart',
  'A little sulk',
  'Tiny fights',
  'Making up again',
]

const PAAL = {
  Virtue: { id: 'aram', nameTa: 'அறத்துப்பால்', nameEn: 'Good ways', emoji: '💚' },
  Wealth: { id: 'porul', nameTa: 'பொருட்பால்', nameEn: 'Work & wisdom', emoji: '📘' },
  Love: { id: 'inbam', nameTa: 'இன்பத்துப்பால்', nameEn: 'Caring hearts', emoji: '💛' },
}

/**
 * Chapters left out for ages 5–10.
 * - 15: not coveting another’s wife
 * - 91–92: romantic entanglement / வரைவின் மகளிர்
 * - 109–133: entire காமத்துப்பால் (Kaamathupaal / Inbam)
 */
const EXCLUDED_CHAPTER_IDS = new Set([
  15,
  91,
  92,
  ...Array.from({ length: 25 }, (_, i) => 109 + i),
])


/** Whole-word English swaps — never match inside a longer word. */
function wb(pattern, flags = 'gi') {
  return new RegExp(`\\b(?:${pattern})\\b`, flags)
}

const EN_SWAPS = [
  [wb('the eternal God'), 'God'],
  [wb('Eternal God'), 'God'],
  [wb('ambrosia'), 'sweet magic water'],
  [wb('ascetics?'), 'people who live simply'],
  [wb('ministers? of state'), 'helpers of a leader'],
  [wb('ministers?'), 'helpers'],
  [wb('sovereigns?'), 'leader'],
  [wb('monarchs?'), 'leader'],
  [wb('Indra'), 'a great sky leader'],
  [wb('kings'), 'leaders'],
  [wb('king'), 'leader'],
  [wb('queens'), 'leaders'],
  [wb('queen'), 'leader'],
  [wb('virtues'), 'good qualities'],
  [wb('virtue'), 'goodness'],
  [wb('virtuous'), 'good'],
  [wb('vices?'), 'wrong'],
  [wb('wickedness'), 'being mean'],
  [wb('wicked'), 'mean'],
  [wb('enmity'), 'fighting'],
  [wb('enemies'), 'people who fight you'],
  [wb('enemy'), 'someone who fights you'],
  [wb('prosperity'), 'doing well'],
  [wb('affliction'), 'hard times'],
  [wb('calamity'), 'big trouble'],
  [wb('destitution'), 'having nothing'],
  [wb('penury'), 'being very poor'],
  [wb('avarice'), 'wanting too much'],
  [wb('coveting|covetousness|covet'), 'wanting what others have'],
  [wb('backbiting'), 'talking badly about someone'],
  [wb('slander'), 'mean talk'],
  [wb('forbearance'), 'patience'],
  [wb('decorum'), 'good manners'],
  [wb('impartiality'), 'being fair'],
  [wb('benevolence'), 'kindness'],
  [wb('liberality'), 'sharing'],
  [wb('renown'), 'a good name'],
  [wb('fame'), 'a good name'],
  [wb('domestic life'), 'family life'],
  [wb('conjugal'), 'family'],
  [wb('spouses?'), 'partner'],
  [wb('wives|wife'), 'partner'],
  [wb('husbands?'), 'partner'],
  [wb('sexual pleasure'), 'wanting only fun'],
  [wb('sexual'), 'grown-up'],
  [wb('embraces?'), 'warm hug'],
  [/\blovers'?\b/gi, 'people who care for each other'],
  [wb('lover'), 'someone you care about'],
  [/\blove's\b/gi, "caring's"],
  [wb('love'), 'caring'],
  [wb('passion'), 'strong feelings'],
  [wb('desires?'), 'wanting'],
  [wb('lust'), 'greedy wanting'],
  [wb('pouting'), 'a little sulk'],
  [wb('bouderie'), 'a little sulk'],
  [wb('celestial'), 'someone magical'],
  [wb('princess(?:es)?'), 'kind person'],
  [/beauty of the/gi, 'kindness of the'],
  [wb('perplexed'), 'confused'],
  [wb('penance'), 'hard good practice'],
  [wb('alms-?deeds?'), 'sharing with others'],
  [wb('treatise'), 'wise book'],
  [wb('extol'), 'praise'],
  [wb('flourish'), 'do well'],
  [wb('prosper'), 'do well'],
  [/abide in/gi, 'follow'],
  [wb('faultless'), 'good'],
  [wb('wantings?'), 'wants'],
  [/anxiety of mind/gi, 'worry'],
  [wb('anxiety'), 'worry'],
  [wb('incomparable'), 'one-of-a-kind'],
  [/two-fold deeds/gi, 'good and bad actions'],
  [/two-fold/gi, 'two kinds of'],
  [/adhere to/gi, 'stick to'],
  [/delight in/gi, 'love'],
  [wb('shew'), 'show'],
  [/profit have those derived from learning/gi, 'good is learning'],
  [/what profit/gi, 'what good'],
  [/derived from/gi, 'from'],
  [/worship not/gi, 'do not thank'],
  [/united to the (?:glorious )?feet of/gi, 'close to'],
  [/meditate the feet of/gi, 'think kindly of'],
  [/void of wanting or aversion/gi, 'does not grab or push away'],
  [/evil shall never come/gi, 'trouble stays away'],
  [/possessed of/gi, 'full of'],
  [/pure knowledge/gi, 'clear wisdom'],
  [/good feet of Him/gi, 'kind way of God'],
  [/feet of Him/gi, 'way of God'],
  [/feet of God/gi, 'way of God'],
  [/Him who/gi, 'God who'],
  [/\bHim\b/g, 'God'],
  [wb('Anthanar'), 'kind wise people'],
  [/viz[.,-]/gi, 'that is,'],
  [/i\.e\./gi, 'that means'],
  [wb('viz'), 'that is'],
  [wb('thus'), 'so'],
  [wb('hence'), 'so'],
  [wb('therefore'), 'so'],
  [wb('thereof'), 'of it'],
  [wb('wherein'), 'where'],
  [wb('unto'), 'to'],
  [wb('doth'), 'does'],
  [wb('hath'), 'has'],
  [wb('thou'), 'you'],
  [wb('thy'), 'your'],
  [wb('thee'), 'you'],
  [wb('ye'), 'you'],
  [/let a man/gi, 'a person should'],
  [/a man who/gi, 'someone who'],
  [/\ba man\b/gi, 'a person'],
  [/\bmen who\b/gi, 'people who'],
  [wb('men'), 'people'],
  [wb('mankind'), 'people'],
  [/the world of the gods/gi, 'a wonderful place'],
  [/heaven and earth/gi, 'the whole wide world'],
  [/sea-girt spacious world/gi, 'big wide world'],
  [/spacious world/gi, 'big world'],
  [/spacious heaven/gi, 'wide sky'],
  [/withholding rain/gi, 'holding back rain'],
  [/deceive \(our hopes\)/gi, 'does not come'],
  [wb('deceive'), 'trick'],
  [/labour of the plough/gi, 'farm work'],
  [/must cease/gi, 'has to stop'],
  [/imparting rain/gi, 'helpful rain'],
  [/abundance of wealth/gi, 'lots of good things'],
  [wb('diminish'), 'get smaller'],
  [/green blade of grass/gi, 'tiny green grass'],
  [/yearly festivals/gi, 'fun yearly parties'],
  [/daily worship/gi, 'daily thanks'],
  [/someone magicals/gi, 'God'],
  [/dwell within/gi, 'live in'],
  [/duties of life/gi, 'everyday good work'],
  [/cannot be discharged/gi, 'cannot be done'],
  [/flowing of water/gi, 'water flowing'],
  [/end and aim of all/gi, 'big goal of every'],
  [/beyond all other excellence/gi, 'as the very best'],
  [/abiding in the rule of conduct peculiar to their/gi, 'living in a good way'],
  [/forsaken the two kinds of wants/gi, 'let go of greedy wants'],
  [/counting the dead/gi, 'counting every star'],
  [/renounced the world/gi, 'live simply'],
  [/shines forth on earth/gi, 'shines in the world'],
  [/beyond all others/gi, 'brightly'],
  [/guides his five senses by the hook of wisdom/gi, 'uses wisdom to guide feelings'],
  [/seed in the world of heaven/gi, 'bright example'],
  [/inhabitants of the/gi, 'people of the'],
  [/sufficient proof/gi, 'clear sign'],
  [/subdued his five senses/gi, 'stays in control of feelings'],
  [/mean cannot do them/gi, 'selfish people will not try'],
  [/which is difficult to be done/gi, 'that are hard'],
  [/the world is within the knowledge of him who knows/gi, 'the world opens up to someone who understands'],
  [/properties of taste, sight, touch, hearing and smell/gi, 'five senses'],
  [/words are full of effect/gi, 'words come true'],
  [/hidden words/gi, 'wise secret words'],
  [/ascended the mountain of goodness/gi, 'climbed high in goodness'],
  [/continue but for a moment/gi, 'lasts only a moment'],
  [/cannot be resisted/gi, 'is very strong'],
  [/truly called/gi, 'really called'],
  [/in their conduct towards all creatures/gi, 'in how they treat every living thing'],
  [/clothed in kindness/gi, 'wrapped in kindness'],
]

const TA_CLEAN = [
  [/^\s*மு\.?\s*வ\s*[:：]\s*/u, ''],
  [/^\s*சாலமன்\s*பாப்பையா\s*[:：]\s*/u, ''],
  [/^\s*கலைஞர்\s*[:：]\s*/u, ''],
  [/\([^)]{0,80}\)/gu, ''],
  [/\s+/g, ' '],
]

/** Age-safe Tamil replacements for every book (not only Book III). */
const TA_SAFE = [
  [/பாலியல்\s*தொழிலாளர்[^\s,]*/gu, 'நம்ப முடியாதவர்'],
  [/விலைமகளிர்[^\s,]*/gu, 'நம்ப முடியாதவர்'],
  [/விலைமகள்[^\s,]*/gu, 'நம்ப முடியாதவர்'],
  [/பரத்தையர்[^\s,]*/gu, 'நம்ப முடியாதவர்'],
  [/பரத்தை[^\s,]*/gu, 'நம்ப முடியாதவர்'],
  [/மார்பகம்[^\s,]*/gu, 'அடையாளம்'],
  [/மார்பை[^\s,]*/gu, 'உடலை'],
  [/கற்புநெறி[^\s,]*/gu, 'நல்லொழுக்கம்'],
  [/கற்பு[^\s,]*/gu, 'நல்லொழுக்கம்'],
  [/புணர்ச்சி/g, 'அன்புடன் சேர்தல்'],
  [/புணரும்/g, 'அன்புடன் சேரும்'],
  [/புணர்/g, 'சேர்'],
  [/காதல் நுகர்ச்சி/g, 'அன்பு உணர்வு'],
  [/காதல் இன்பம்/g, 'அன்பு மகிழ்ச்சி'],
  [/காமத்/g, 'அன்பி'],
  [/காமம்/g, 'அன்பு'],
  [/காதல்/g, 'அன்பு'],
  [/தழுவுதல்/g, 'அன்புடன் சேர்தல்'],
  [/தழுவி/g, 'அன்புடன் சேர்ந்து'],
  [/முயக்கம்/g, 'அன்பான சேர்க்கை'],
  [/முயங்க/g, 'அன்புடன் சேர'],
]

/** Age-safe English replacements for every book. */
const EN_SAFE = [
  [wb('prostitutes?'), 'fake friends'],
  [wb('prostitution'), 'a bad path'],
  [wb('harlots?'), 'fake friends'],
  [wb('courtesans?'), 'fake friends'],
  [wb('wanton women'), 'people on a bad path'],
  [wb('wanton'), 'untrustworthy'],
  [wb('concubines?'), 'fake friends'],
  [wb('adultery'), 'breaking a promise'],
  [wb('adulterous'), 'unfaithful'],
  [wb('adulterers?'), 'someone unfaithful'],
  [wb('chastity'), 'loyalty'],
  [wb('breasts?'), 'a mark of strength'],
  [wb('sexual(?:ly)?'), 'grown-up'],
  [wb('sex'), 'grown-up stuff'],
  [wb('girlfriends?'), 'friends'],
  [wb('boyfriends?'), 'friends'],
  [wb('kisses|kissing|kiss'), 'kind hello'],
  [wb('nuptial'), 'together'],
  [wb('marital'), 'together'],
  [wb('jewelled female'), 'wonderful person'],
  [wb('female'), 'person'],
  [wb('peahen'), 'pretty peacock'],
  [wb('someone magical'), 'magical friend'],
  [wb('hearty warm hug'), 'kind warm hug'],
]

function cleanTamil(raw) {
  let s = String(raw || '').trim()
  for (const [re, to] of TA_CLEAN) s = s.replace(re, to)
  s = s.replace(/\s+/g, ' ').trim()
  s = shortenToSentence(s, 120)
  if (s && !/[.!?]$/.test(s)) s += '.'
  return s
}

/**
 * Prefer a finished sentence. Never let a trailing space win over `. ` /
 * `! ` / `? `, which left fragments like "good persons, and."
 */
function looksDangling(s) {
  return /(?:,|;|:)?\s*\b(?:who|and|or|the|a|an|to|of|for|with|by|from|in|on|at|as|is|are|was|were|that|which|their|his|her|its)\.?$/i.test(
    s.trim(),
  )
}

function shortenToSentence(s, maxLen, fallback) {
  if (!s || s.length <= maxLen) return s

  const tryCut = (cut) => {
    const ends = ['. ', '! ', '? '].map((m) => cut.lastIndexOf(m))
    const sentenceEnd = Math.max(...ends)
    if (sentenceEnd > 40) return cut.slice(0, sentenceEnd + 1).trim()

    const semi = cut.lastIndexOf('; ')
    if (semi > 40) {
      const piece = `${cut.slice(0, semi).trim()}.`
      if (!looksDangling(piece.slice(0, -1))) return piece
    }

    let soft = cut.replace(/\s+/g, ' ').trim()
    // Keep stripping trailing glue words / commas until the clause can stand alone.
    for (let i = 0; i < 8; i++) {
      const next = soft
        .replace(/[,:;.\-–—]+$/g, '')
        .replace(
          /\b(?:and|or|the|a|an|to|of|for|with|by|from|in|on|at|as|who|which|that|their|his|her|its|is|are|was|were)\s*$/i,
          '',
        )
        .trim()
      if (next === soft) break
      soft = next
    }
    if (soft.length > 40 && !looksDangling(soft)) return soft
    return null
  }

  const fromPrimary = tryCut(s.slice(0, maxLen))
  if (fromPrimary) return fromPrimary

  if (fallback && fallback !== s) {
    if (fallback.length <= maxLen && !looksDangling(fallback.replace(/[.!?]$/, ''))) {
      return fallback
    }
    const fromFallback = tryCut(fallback.slice(0, maxLen))
    if (fromFallback) return fromFallback
  }

  // Absolute last resort: first clause-ish chunk without dangling tail.
  const rough = s.slice(0, Math.min(maxLen, 90)).trim()
  const rescued = tryCut(rough)
  return rescued || rough
}

function pickTamilMeaning(k, number) {
  const candidates = [k.mk, k.sp, k.mv]
    .map((x) => cleanTamil(x))
    .filter(Boolean)
  if (candidates.length === 0) {
    return number >= 1081
      ? 'அன்பு உள்ளத்தை நெகிழச் செய்யும்.'
      : 'இந்த குறள் நல்ல வாழ்க்கைக்கு வழி காட்டுகிறது.'
  }
  candidates.sort((a, b) => a.length - b.length)
  return ageSafeTamil(candidates[0])
}

function ageSafeTamil(s) {
  let out = s
  for (const [re, to] of TA_SAFE) out = out.replace(re, to)
  return out
}

function ageSafeEnglish(s) {
  let out = s
  for (const [re, to] of EN_SAFE) out = out.replace(re, to)
  return out
    .replace(/\bdislike adds delight to caring\b/gi, 'a little sulk can make caring feel sweeter')
    .replace(/\badd delight to dislike\b/gi, 'make making-up feel joyful')
    .replace(/\bcaring; and a\b/gi, 'caring, and a')
}

function stillArchaic(s) {
  return /\b(shall|thereof|wherein|unto|doth|hath|thou|thy|thee|viz|penance|ascetic|sovereign|monarch)\b/i.test(
    s,
  )
}

function applySwaps(text) {
  let s = text
  for (const [re, to] of EN_SWAPS) s = s.replace(re, to)
  return s.replace(/\s+/g, ' ').trim()
}

function kidEnglish(explanation, translation, number) {
  void number
  let s = String(explanation || translation || '').trim()
  s = s.replace(/^\([^)]*\)\s*/g, '')
  s = applySwaps(s)
  s = ageSafeEnglish(s)

  // If classic English still shows through, fall back to the short couplet translation.
  let fallback = ''
  if (translation) {
    fallback = ageSafeEnglish(applySwaps(String(translation).trim()))
    if (stillArchaic(s) && fallback && !stillArchaic(fallback)) s = fallback
  }

  // Soften leftover archaic helpers.
  s = s
    .replace(/\bshall\b/gi, 'will')
    .replace(/\bcannot\b/gi, "can't")
    .replace(/\bwill not\b/gi, "won't")
    .replace(/\bdo not\b/gi, "don't")
    .replace(/\bis not\b/gi, "isn't")
    .replace(/\bare not\b/gi, "aren't")
    .replace(/\s+/g, ' ')
    .trim()

  if (s && !/^[A-Z]/.test(s)) s = s.charAt(0).toUpperCase() + s.slice(1)
  s = shortenToSentence(s, 150, fallback)
  return finishMeaning(s, fallback)
}

function finishMeaning(s, fallback) {
  let out = String(s || '')
    .replace(/[;:]+$/g, '')
    .trim()
  if (out && !/[.!?]$/.test(out)) out += '.'

  const core = out.replace(/[.!?]+$/, '')
  if (!looksDangling(core)) return ageSafeEnglish(out)

  if (fallback) {
    let f = String(fallback)
      .replace(/[;:]+$/g, '')
      .trim()
    if (f && !/[.!?]$/.test(f)) f += '.'
    if (!looksDangling(f.replace(/[.!?]+$/, ''))) return ageSafeEnglish(f)
  }

  let stripped = core
  for (let i = 0; i < 10; i++) {
    const next = stripped
      .replace(/[,:;.\-–—]+$/g, '')
      .replace(
        /\b(?:and|or|the|a|an|to|of|for|with|by|from|in|on|at|as|who|which|that|their|his|her|its|is|are|was|were|those|these|them)\s*$/i,
        '',
      )
      .trim()
    if (next === stripped) break
    stripped = next
  }
  if (stripped.length > 30) return ageSafeEnglish(`${stripped}.`)
  return ageSafeEnglish(out)
}

/**
 * A few hand-tuned kid meanings where automation would stay too stiff.
 * Keys are kural numbers.
 */
const HAND_TUNED = {
  1: {
    meaningEn: 'Just like A comes first in the alphabet, God comes first in the world.',
    meaningTa: 'அ எழுத்து எல்லா எழுத்துகளுக்கும் முதல். அதுபோல கடவுள் உலகத்திற்கு முதல்.',
  },
  2: {
    meaningEn: 'Learning is best when it also teaches us to be thankful and kind.',
    meaningTa: 'கற்ற கல்வி நல்ல வழியில் நடத்த உதவினால் தான் பயன் உண்டு.',
  },
  3: {
    meaningEn: 'People who keep good thoughts in their heart live a long, happy life.',
    meaningTa: 'நல்ல எண்ணங்களை மனத்தில் வைத்து வாழ்பவர் நீண்டகாலம் நலமாக வாழ்வர்.',
  },
  4: {
    meaningEn: 'When you follow a calm and kind way, worry stays away.',
    meaningTa: 'அமைதியும் அன்பும் உள்ள வழியில் சென்றால் துன்பம் வராது.',
  },
  5: {
    meaningEn: 'Thinking of what is good and true keeps dark mistakes away.',
    meaningTa: 'நல்லதை நினைத்து வாழ்ந்தால் தீய செயல்கள் நம்மைச் சேராது.',
  },
  6: {
    meaningEn: 'People who guide their eyes, ears, and tongue carefully live long and well.',
    meaningTa: 'கண், செவி, வாய் ஆகியவற்றை அடக்கி நல்ல வழியில் நிற்பவர் நலமாக வாழ்வர்.',
  },
  7: {
    meaningEn: 'Being close to a one-of-a-kind kind guide helps take worry out of the heart.',
    meaningTa: 'ஒப்பில்லா நல்ல வழியைப் பின்பற்றினால் மனக்கவலை நீங்கும்.',
  },
  8: {
    meaningEn: 'Goodness is like a big sea. Holding on to it helps you cross hard times.',
    meaningTa: 'அறம் ஒரு பெரிய கடல் போன்றது. அதைப் பிடித்துக்கொண்டால் வாழ்க்கை எளிதாகும்.',
  },
  9: {
    meaningEn: 'A head that never bows in thanks is like a tool that does not work.',
    meaningTa: 'நன்றி சொல்லாத தலை, வேலை செய்யாத கருவி போன்றது.',
  },
  10: {
    meaningEn: 'People who stay close to God can cross the big sea of hard births.',
    meaningTa: 'நல்ல வழியில் நிற்பவர் பிறவிக் கடலைக் கடந்து செல்வர்.',
  },
  11: {
    meaningEn: 'Rain keeps the world alive, so rain is like sweet magic water.',
    meaningTa: 'மழை இருந்தால்தான் உலகம் வாழும். அதனால் மழை இனிய அமிழ்தம் போன்றது.',
  },
  12: {
    meaningEn: 'Rain helps grow food, and rain itself is like food for the world.',
    meaningTa: 'மழை உணவு தரும். மழையே உலகத்திற்கு உணவு போன்றது.',
  },
  13: {
    meaningEn: 'If rain does not come, hunger will hurt the whole wide world.',
    meaningTa: 'மழை பொய்த்தால் உலகம் பசியால் வருந்தும்.',
  },
  14: {
    meaningEn: 'If the helpful rain gets less, farm work has to stop.',
    meaningTa: 'மழை குறைந்தால் உழவர் உழவு செய்ய முடியாது.',
  },
  15: {
    meaningEn: 'No rain can ruin people, and good rain can lift them up again.',
    meaningTa: 'மழை இல்லாவிட்டால் கெடும்; மழை பெய்தால் மீண்டும் நலம் வரும்.',
  },
  16: {
    meaningEn: 'Without even one raindrop, you will not see tiny green grass.',
    meaningTa: 'மழைத்துளி விழாவிட்டால் பசும்புல் கூட தெரியாது.',
  },
  17: {
    meaningEn: 'Even the big sea needs clouds to give water back as rain.',
    meaningTa: 'மேகம் மழை பெய்யாவிட்டால் கடலும் வற்றிவிடும்.',
  },
  18: {
    meaningEn: 'If the sky stays dry, festivals and daily thanks stop too.',
    meaningTa: 'மழை பொய்த்தால் திருவிழாவும் வழிபாடும் நடக்காது.',
  },
  19: {
    meaningEn: 'Without rain, sharing and hard good practice cannot live in the world.',
    meaningTa: 'மழை இல்லாவிட்டால் தானமும் நல்ல முயற்சியும் இருக்காது.',
  },
  20: {
    meaningEn: 'Just as people need water, good living needs rain.',
    meaningTa: 'நீர் இல்லாமல் உலகம் இல்லை; மழை இல்லாமல் நீர் இல்லை.',
  },
  101: {
    meaningEn:
      'When someone helps you even though you never helped them first, that kindness is bigger than the whole world.',
    meaningTa:
      'நாம் உதவி செய்யாதபோதும் ஒருவர் நமக்கு உதவினால், அந்த உதவி உலகை விட பெரியது.',
  },
  402: {
    meaningEn:
      'Wanting to hear an unlearned person speak in a wise gathering is like hoping for something that cannot happen.',
    meaningTa:
      'கல்லாதவர் சொல்வதைக் கேட்க விரும்புவது, நடக்காத ஒன்றை எதிர்பார்ப்பது போன்றது.',
  },
  813: {
    meaningEn:
      'Friends who only want gain, fake friends who only want gifts, and thieves are all the same kind of people.',
    meaningTa:
      'பயனை மட்டும் எண்ணி நட்பு கொள்பவர், நம்ப முடியாதவர், கள்வர் ஆகிய மூவரும் ஒரே மாதிரி.',
  },
}

function flattenChapters(detail) {
  const out = []
  if (CHAPTER_EN.length !== 133) throw new Error(`CHAPTER_EN length ${CHAPTER_EN.length}`)
  for (const sec of detail[0].section.detail) {
    // Drop entire காமத்துப்பால் (Love / Kaamathupaal) for kids.
    if (sec.translation === 'Love') continue
    const paal = PAAL[sec.translation]
    if (!paal) throw new Error(`unknown paal ${sec.translation}`)
    for (const cg of sec.chapterGroup.detail) {
      for (const ch of cg.chapters.detail) {
        if (EXCLUDED_CHAPTER_IDS.has(ch.number)) continue
        out.push({
          id: ch.number,
          paalId: paal.id,
          nameTa: ch.name,
          nameEn: CHAPTER_EN[ch.number - 1] || ch.translation,
          start: ch.start,
          end: ch.end,
        })
      }
    }
  }
  const expected = 133 - EXCLUDED_CHAPTER_IDS.size
  if (out.length !== expected) {
    throw new Error(`expected ${expected} kid chapters, got ${out.length}`)
  }
  return out
}

function tsString(s) {
  return JSON.stringify(s)
}

const FORBIDDEN_EN = [
  /\bleaderdom\b/i,
  /\bgoodnesss\b/i,
  /\bwopeople\b/i,
  /\bprostitut/i,
  /\bharlot/i,
  /\bcourtesan/i,
  /\bwanton\b/i,
  /\bconcubine/i,
  /\badulter/i,
  /\bsexual\b/i,
  /\blovers?\b/i,
  /\bembrace\b/i,
  // Mid-clause cuts that used to ship: "good persons, and." / "savages who."
  /,\s*(?:and|or|who|the|a|an|to|of)\.$/i,
  /\b(?:people who fight you|murderous savages)\s+who\.$/i,
  /\bwho\.$/i,
]

const FORBIDDEN_TA = [
  /பாலியல்/,
  /விலைமகள்/,
  /பரத்தை/,
  /புணர்ச்சி/,
  /காமம்/,
  /காதல் நுகர்ச்சி/,
  /மார்பகம்/,
]

function assertKidSafe(kurals) {
  const fails = []
  for (const k of kurals) {
    for (const re of FORBIDDEN_EN) {
      if (re.test(k.meaningEn)) fails.push(`#${k.number} EN ${re}: ${k.meaningEn}`)
    }
    for (const re of FORBIDDEN_TA) {
      if (re.test(k.meaningTa)) fails.push(`#${k.number} TA ${re}: ${k.meaningTa}`)
    }
  }
  if (fails.length) {
    throw new Error(`kid-safety check failed:\n${fails.slice(0, 20).join('\n')}`)
  }
}

async function main() {
  console.log('Fetching Thirukkural source…')
  const [kuralRes, detailRes] = await Promise.all([fetch(KURAL_URL), fetch(DETAIL_URL)])
  if (!kuralRes.ok) throw new Error(`kural fetch ${kuralRes.status}`)
  if (!detailRes.ok) throw new Error(`detail fetch ${detailRes.status}`)
  const kuralJson = await kuralRes.json()
  const detailJson = await detailRes.json()
  const raw = kuralJson.kural
  if (!Array.isArray(raw) || raw.length !== 1330) {
    throw new Error(`expected 1330 kurals, got ${raw?.length}`)
  }

  const chapters = flattenChapters(detailJson)
  const included = new Set()
  for (const ch of chapters) {
    for (let n = ch.start; n <= ch.end; n++) included.add(n)
  }

  const kurals = raw
    .filter((k) => included.has(k.Number))
    .map((k) => {
      const number = k.Number
      const tuned = HAND_TUNED[number]
      const meaningEn = ageSafeEnglish(
        tuned?.meaningEn ?? kidEnglish(k.explanation, k.Translation, number),
      )
      const meaningTa = ageSafeTamil(
        tuned?.meaningTa ?? pickTamilMeaning(k, number),
      )
      if (!meaningEn || !meaningTa) {
        throw new Error(`missing meaning for kural ${number}`)
      }
      return {
        number,
        line1: k.Line1,
        line2: k.Line2,
        meaningTa,
        meaningEn,
      }
    })

  assertKidSafe(kurals)

  mkdirSync(OUT_DIR, { recursive: true })

  const chaptersTs = `/** Generated by scripts/gen-thirukkural.mjs — do not edit by hand. */
export type PaalId = 'aram' | 'porul'

export type Chapter = {
  id: number
  paalId: PaalId
  nameTa: string
  nameEn: string
  start: number
  end: number
}

export const PAALS: Record<
  PaalId,
  { id: PaalId; nameTa: string; nameEn: string; emoji: string }
> = {
  aram: { id: 'aram', nameTa: 'அறத்துப்பால்', nameEn: 'Good ways', emoji: '💚' },
  porul: { id: 'porul', nameTa: 'பொருட்பால்', nameEn: 'Work & wisdom', emoji: '📘' },
}

export const PAAL_ORDER: PaalId[] = ['aram', 'porul']

export const CHAPTERS: Chapter[] = [
${chapters
  .map(
    (c) =>
      `  { id: ${c.id}, paalId: '${c.paalId}', nameTa: ${tsString(c.nameTa)}, nameEn: ${tsString(c.nameEn)}, start: ${c.start}, end: ${c.end} },`,
  )
  .join('\n')}
]
`

  const kuralsTs = `/** Generated by scripts/gen-thirukkural.mjs — do not edit by hand. */
export type Kural = {
  number: number
  line1: string
  line2: string
  meaningTa: string
  meaningEn: string
}

export const KURALS: Kural[] = [
${kurals
  .map(
    (k) =>
      `  { number: ${k.number}, line1: ${tsString(k.line1)}, line2: ${tsString(k.line2)}, meaningTa: ${tsString(k.meaningTa)}, meaningEn: ${tsString(k.meaningEn)} },`,
  )
  .join('\n')}
]
`

  writeFileSync(new URL('chapters.generated.ts', OUT_DIR), chaptersTs)
  writeFileSync(new URL('kurals.generated.ts', OUT_DIR), kuralsTs)
  console.log(`Wrote ${chapters.length} chapters and ${kurals.length} kurals`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
