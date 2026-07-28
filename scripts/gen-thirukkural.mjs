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

const EN_SWAPS = [
  [/the eternal God/gi, 'God'],
  [/Eternal God/gi, 'God'],
  [/ambrosia/gi, 'sweet magic water'],
  [/ascetics?/gi, 'people who live simply'],
  [/ministers? of state/gi, 'helpers of a leader'],
  [/ministers?/gi, 'helpers'],
  [/sovereign/gi, 'leader'],
  [/monarch/gi, 'leader'],
  [/Indra/gi, 'a great sky leader'],
  [/king(s)?/gi, 'leader$1'],
  [/queen(s)?/gi, 'leader$1'],
  [/virtue/gi, 'goodness'],
  [/virtuous/gi, 'good'],
  [/vice/gi, 'wrong'],
  [/wickedness/gi, 'being mean'],
  [/wicked/gi, 'mean'],
  [/enmity/gi, 'fighting'],
  [/enemies/gi, 'people who fight you'],
  [/enemy/gi, 'someone who fights you'],
  [/prosperity/gi, 'doing well'],
  [/affliction/gi, 'hard times'],
  [/calamity/gi, 'big trouble'],
  [/destitution/gi, 'having nothing'],
  [/penury/gi, 'being very poor'],
  [/avarice/gi, 'wanting too much'],
  [/covet(ing|ousness)?/gi, 'wanting what others have'],
  [/backbiting/gi, 'talking badly about someone'],
  [/slander/gi, 'mean talk'],
  [/forbearance/gi, 'patience'],
  [/decorum/gi, 'good manners'],
  [/impartiality/gi, 'being fair'],
  [/benevolence/gi, 'kindness'],
  [/liberality/gi, 'sharing'],
  [/renown/gi, 'a good name'],
  [/fame/gi, 'a good name'],
  [/domestic life/gi, 'family life'],
  [/conjugal/gi, 'family'],
  [/spouse/gi, 'partner'],
  [/wife/gi, 'partner'],
  [/husband/gi, 'partner'],
  [/sexual pleasure/gi, 'wanting only fun'],
  [/sexual/gi, 'grown-up'],
  [/embrace/gi, 'warm hug'],
  [/lovers'?/gi, 'people who care for each other'],
  [/lover/gi, 'someone you care about'],
  [/love's/gi, "caring's"],
  [/\blove\b/gi, 'caring'],
  [/passion/gi, 'strong feelings'],
  [/desire/gi, 'wanting'],
  [/lust/gi, 'greedy wanting'],
  [/pouting/gi, 'a little sulk'],
  [/bouderie/gi, 'a little sulk'],
  [/celestial/gi, 'someone magical'],
  [/princess/gi, 'kind person'],
  [/beauty of the/gi, 'kindness of the'],
  [/perplexed/gi, 'confused'],
  [/penance/gi, 'hard good practice'],
  [/alms-?deeds?/gi, 'sharing with others'],
  [/treatise/gi, 'wise book'],
  [/extol/gi, 'praise'],
  [/flourish/gi, 'do well'],
  [/prosper/gi, 'do well'],
  [/abide in/gi, 'follow'],
  [/faultless/gi, 'good'],
  [/wantings?/gi, 'wants'],
  [/senses/gi, 'senses'],
  [/anxiety of mind/gi, 'worry'],
  [/anxiety/gi, 'worry'],
  [/incomparable/gi, 'one-of-a-kind'],
  [/two-fold deeds/gi, 'good and bad actions'],
  [/two-fold/gi, 'two kinds of'],
  [/adhere to/gi, 'stick to'],
  [/delight in/gi, 'love'],
  [/shew/gi, 'show'],
  [/profit have those derived from learning/gi, 'good is learning'],
  [/what profit/gi, 'what good'],
  [/derived from/gi, 'from'],
  [/worship not/gi, 'do not thank'],
  [/united to the (glorious )?feet of/gi, 'close to'],
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
  [/Anthanar/gi, 'kind wise people'],
  [/viz[.,-]/gi, 'that is,'],
  [/i\.e\./gi, 'that means'],
  [/viz\b/gi, 'that is'],
  [/\bthus\b/gi, 'so'],
  [/\bhence\b/gi, 'so'],
  [/\btherefore\b/gi, 'so'],
  [/\bthereof\b/gi, 'of it'],
  [/\bwherein\b/gi, 'where'],
  [/\bunto\b/gi, 'to'],
  [/\bdoth\b/gi, 'does'],
  [/\bhath\b/gi, 'has'],
  [/\bthou\b/gi, 'you'],
  [/\bthy\b/gi, 'your'],
  [/\bthee\b/gi, 'you'],
  [/\bye\b/gi, 'you'],
  [/let a man/gi, 'a person should'],
  [/a man who/gi, 'someone who'],
  [/a man\b/gi, 'a person'],
  [/men who/gi, 'people who'],
  [/\bmen\b/gi, 'people'],
  [/mankind/gi, 'people'],
  [/the world of the gods/gi, 'a wonderful place'],
  [/heaven and earth/gi, 'the whole wide world'],
  [/sea-girt spacious world/gi, 'big wide world'],
  [/spacious world/gi, 'big world'],
  [/spacious heaven/gi, 'wide sky'],
  [/withholding rain/gi, 'holding back rain'],
  [/deceive \(our hopes\)/gi, 'does not come'],
  [/deceive/gi, 'trick'],
  [/labour of the plough/gi, 'farm work'],
  [/must cease/gi, 'has to stop'],
  [/imparting rain/gi, 'helpful rain'],
  [/abundance of wealth/gi, 'lots of good things'],
  [/diminish/gi, 'get smaller'],
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

function cleanTamil(raw) {
  let s = String(raw || '').trim()
  for (const [re, to] of TA_CLEAN) s = s.replace(re, to)
  s = s.replace(/\s+/g, ' ').trim()
  // Prefer a single clear sentence for small kids.
  if (s.length > 120) {
    const cut = s.slice(0, 120)
    const soft = Math.max(
      cut.lastIndexOf('.'),
      cut.lastIndexOf('!'),
      cut.lastIndexOf('?'),
      cut.lastIndexOf(','),
      cut.lastIndexOf(' '),
    )
    if (soft > 50) s = cut.slice(0, soft).trim()
    else s = cut.trim()
  }
  if (s && !/[.!?]$/.test(s)) s += '.'
  return s
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
  let s = candidates[0]
  if (number >= 1081) s = softenTamilLove(s)
  return s
}

function softenTamilLove(s) {
  return s
    .replace(/காதல் நுகர்ச்சி/g, 'அன்பு உணர்வு')
    .replace(/காதல் இன்பம்/g, 'அன்பு மகிழ்ச்சி')
    .replace(/காமத்/g, 'அன்பி')
    .replace(/காமம்/g, 'அன்பு')
    .replace(/காதல்/g, 'அன்பு')
    .replace(/தழுவுதல்/g, 'அன்புடன் சேர்தல்')
    .replace(/தழுவி/g, 'அன்புடன் சேர்ந்து')
    .replace(/முயக்கம்/g, 'அன்பான சேர்க்கை')
    .replace(/முயங்க/g, 'அன்புடன் சேர')
    .replace(/மங்கை/g, 'அன்புக்குரியவர்')
    .replace(/பெண்/g, 'அன்புக்குரியவர்')
    .replace(/ஆடவர்/g, 'அன்புக்குரியவர்')
}

function softenEnglishLove(s) {
  return s
    .replace(/\bjewelled female\b/gi, 'wonderful person')
    .replace(/\bfemale\b/gi, 'person')
    .replace(/\bpeahen\b/gi, 'pretty peacock')
    .replace(/\bsomeone magical\b/gi, 'magical friend')
    .replace(/\bhearty warm hug\b/gi, 'kind warm hug')
    .replace(/\bdislike adds delight to caring\b/gi, 'a little sulk can make caring feel sweeter')
    .replace(/\badd delight to dislike\b/gi, 'make making-up feel joyful')
    .replace(/\bcaring; and a\b/gi, 'caring, and a')
}

function stillArchaic(s) {
  return /\b(shall|thereof|wherein|unto|doth|hath|thou|thy|thee|viz|penance|ascetic|sovereign|monarch)\b/i.test(
    s,
  )
}

function kidEnglish(explanation, translation, number) {
  let s = String(explanation || translation || '').trim()
  s = s.replace(/^\([^)]*\)\s*/g, '')
  for (const [re, to] of EN_SWAPS) s = s.replace(re, to)
  s = s.replace(/\s+/g, ' ').trim()

  if (number >= 1081) {
    s = s
      .replace(/\bgirlfriend\b/gi, 'friend')
      .replace(/\bboyfriend\b/gi, 'friend')
      .replace(/\bwife\b/gi, 'dear one')
      .replace(/\bhusband\b/gi, 'dear one')
      .replace(/\bkiss(es|ing)?\b/gi, 'kind hello')
      .replace(/\bbed\b/gi, 'home')
      .replace(/\bsex(ual)?\b/gi, 'grown-up')
      .replace(/\bnuptial\b/gi, 'together')
      .replace(/\bmarital\b/gi, 'together')
      .replace(/\bmarriage\b/gi, 'being together')
    s = softenEnglishLove(s)
  }

  // If classic English still shows through, fall back to the short couplet translation.
  if (stillArchaic(s) && translation) {
    let t = String(translation).trim()
    for (const [re, to] of EN_SWAPS) t = t.replace(re, to)
    t = t.replace(/\s+/g, ' ').trim()
    if (t && !stillArchaic(t)) s = t
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
  if (s.length > 150) {
    const cut = s.slice(0, 150)
    const soft = Math.max(
      cut.lastIndexOf('. '),
      cut.lastIndexOf('; '),
      cut.lastIndexOf(', '),
      cut.lastIndexOf(' '),
    )
    s = (soft > 60 ? cut.slice(0, soft) : cut).trim()
  }
  s = s.replace(/[;:]+$/g, '').trim()
  if (s && !/[.!?]$/.test(s)) s += '.'
  return s
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
}

function flattenChapters(detail) {
  const out = []
  for (const sec of detail[0].section.detail) {
    const paal = PAAL[sec.translation]
    if (!paal) throw new Error(`unknown paal ${sec.translation}`)
    for (const cg of sec.chapterGroup.detail) {
      for (const ch of cg.chapters.detail) {
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
  if (out.length !== 133) throw new Error(`expected 133 chapters, got ${out.length}`)
  if (CHAPTER_EN.length !== 133) throw new Error(`CHAPTER_EN length ${CHAPTER_EN.length}`)
  return out
}

function tsString(s) {
  return JSON.stringify(s)
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
  const kurals = raw.map((k) => {
    const number = k.Number
    const tuned = HAND_TUNED[number]
    const meaningEn =
      tuned?.meaningEn ?? kidEnglish(k.explanation, k.Translation, number)
    const meaningTa = tuned?.meaningTa ?? pickTamilMeaning(k, number)
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

  mkdirSync(OUT_DIR, { recursive: true })

  const chaptersTs = `/** Generated by scripts/gen-thirukkural.mjs — do not edit by hand. */
export type PaalId = 'aram' | 'porul' | 'inbam'

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
  inbam: { id: 'inbam', nameTa: 'இன்பத்துப்பால்', nameEn: 'Caring hearts', emoji: '💛' },
}

export const PAAL_ORDER: PaalId[] = ['aram', 'porul', 'inbam']

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
