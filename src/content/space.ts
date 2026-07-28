/**
 * Space Explorer content: teach first, then ask.
 *
 * Facts are curated, not fetched. The space APIs that exist (NASA APOD and
 * Images, Launch Library 2, Wikipedia summaries) return grown-up prose and
 * technical captions; see README for the survey. Numbers here are checked
 * against published values and kept at kid precision ("about 12 Earth years").
 */
import type { SpaceArtKind } from './space/SpaceArt'

export type MissionId =
  | 'today'
  | 'planets'
  | 'sun-stars'
  | 'moon'
  | 'space-rocks'
  | 'deep-space'
  | 'wow-facts'
  | 'sky-science'

export type LearnCard = {
  art: SpaceArtKind
  title: string
  /** One or two short lines — read-aloud length. */
  lines: string[]
  /**
   * Real photo for cards the fact engine built, taken from the same Wikipedia
   * summary the words came from. Falls back to `art` when there is no picture
   * or it fails to load. Curated cards stay hand-drawn on purpose.
   */
  photo?: string
}

export type Choice = { id: string; label: string; art: SpaceArtKind }

export type SpaceQuestion = {
  id: string
  prompt: string
  choices: Choice[]
  answerId: string
  /** Shown either way, so a wrong tap still teaches. */
  explain: string
}

export type Mission = {
  id: MissionId
  emoji: string
  title: string
  blurb: string
  cards: LearnCard[]
  questions: SpaceQuestion[]
}

export const MISSION_ORDER: MissionId[] = [
  'today',
  'planets',
  'sun-stars',
  'moon',
  'space-rocks',
  'deep-space',
  'wow-facts',
  'sky-science',
]

const PLANET_CHOICES: Record<string, Choice> = {
  mercury: { id: 'mercury', label: 'Mercury', art: 'mercury' },
  venus: { id: 'venus', label: 'Venus', art: 'venus' },
  earth: { id: 'earth', label: 'Earth', art: 'earth' },
  mars: { id: 'mars', label: 'Mars', art: 'mars' },
  jupiter: { id: 'jupiter', label: 'Jupiter', art: 'jupiter' },
  saturn: { id: 'saturn', label: 'Saturn', art: 'saturn' },
  uranus: { id: 'uranus', label: 'Uranus', art: 'uranus' },
  neptune: { id: 'neptune', label: 'Neptune', art: 'neptune' },
  pluto: { id: 'pluto', label: 'Pluto', art: 'pluto' },
  sun: { id: 'sun', label: 'the Sun', art: 'sun' },
  moon: { id: 'moon', label: 'the Moon', art: 'moon' },
}

const p = (...ids: string[]): Choice[] => ids.map((id) => PLANET_CHOICES[id])

/** Missions whose cards and questions are written down here. */
export const CURATED_MISSION_IDS: MissionId[] = MISSION_ORDER.filter(
  (id) => id !== 'today',
)

export const MISSIONS: Record<MissionId, Mission> = {
  /**
   * Today in Space is built at runtime: computed moon phase, a day-rotated
   * slice of the fact bank, and live cards from the space APIs. Its quiz is a
   * day-seeded mix of every other mission's questions. See spaceLive.ts.
   */
  today: {
    id: 'today',
    emoji: '🛰️',
    title: 'Today in Space',
    blurb: 'New facts every day',
    cards: [],
    questions: [],
  },

  planets: {
    id: 'planets',
    emoji: '🪐',
    title: 'Meet the Planets',
    blurb: 'Eight planets, one Sun',
    cards: [
      {
        art: 'solar-system',
        title: 'Eight planets go around the Sun',
        lines: [
          'In order from the Sun: Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune.',
          'Earth is the third one out.',
        ],
      },
      {
        art: 'rocky-planets',
        title: 'The first four are small and rocky',
        lines: [
          'Mercury, Venus, Earth and Mars are made of rock. You could stand on them.',
        ],
      },
      {
        art: 'giant-planets',
        title: 'The next four are giants',
        lines: [
          'Jupiter, Saturn, Uranus and Neptune are huge balls of gas and ice.',
          'Saturn has bright rings made of ice and rock.',
        ],
      },
      {
        art: 'jupiter',
        title: 'Jupiter is the biggest',
        lines: [
          'More than 1,300 Earths would fit inside Jupiter.',
          'Mercury is the smallest planet.',
        ],
      },
      {
        art: 'venus',
        title: 'Venus is the hottest',
        lines: [
          'Venus is wrapped in thick clouds that trap the heat, about 465°C.',
          'It is even hotter than Mercury, which sits closer to the Sun.',
        ],
      },
    ],
    questions: [
      {
        id: 'biggest',
        prompt: 'Which planet is the biggest?',
        choices: p('jupiter', 'earth', 'mercury'),
        answerId: 'jupiter',
        explain: 'Jupiter is the biggest — over 1,300 Earths would fit inside.',
      },
      {
        id: 'home',
        prompt: 'Which planet do we live on?',
        choices: p('mars', 'earth', 'saturn'),
        answerId: 'earth',
        explain: 'We live on Earth, the third planet from the Sun.',
      },
      {
        id: 'hottest',
        prompt: 'Which planet is the hottest?',
        choices: p('venus', 'neptune', 'mars'),
        answerId: 'venus',
        explain: 'Venus is hottest. Its thick clouds trap the heat inside.',
      },
      {
        id: 'rings',
        prompt: 'Which planet has the bright rings?',
        choices: p('saturn', 'earth', 'mercury'),
        answerId: 'saturn',
        explain: 'Saturn has rings made of ice and rock.',
      },
      {
        id: 'closest',
        prompt: 'Which planet is closest to the Sun?',
        choices: p('mercury', 'jupiter', 'uranus'),
        answerId: 'mercury',
        explain: 'Mercury is closest to the Sun, and the smallest planet too.',
      },
      {
        id: 'red',
        prompt: 'Which planet is called the red planet?',
        choices: p('mars', 'venus', 'neptune'),
        answerId: 'mars',
        explain: 'Mars looks red because its dust is full of rust.',
      },
      {
        id: 'rocky',
        prompt: 'Which one is a small rocky planet?',
        choices: p('mars', 'jupiter', 'saturn'),
        answerId: 'mars',
        explain: 'Mercury, Venus, Earth and Mars are the rocky ones.',
      },
      {
        id: 'farthest',
        prompt: 'Which planet is farthest from the Sun?',
        choices: p('neptune', 'earth', 'venus'),
        answerId: 'neptune',
        explain: 'Neptune is the farthest planet — cold and windy.',
      },
    ],
  },

  'sun-stars': {
    id: 'sun-stars',
    emoji: '☀️',
    title: 'Sun and Stars',
    blurb: 'Why stars shine',
    cards: [
      {
        art: 'sun',
        title: 'The Sun is a star',
        lines: [
          'It is the closest star to us, which is why it looks so big and bright.',
        ],
      },
      {
        art: 'stars',
        title: 'Stars make their own light',
        lines: [
          'A star is a giant ball of hot gas. Deep in the middle it squashes tiny bits together, and that makes light and heat.',
        ],
      },
      {
        art: 'earth',
        title: 'Planets do not make light',
        lines: [
          'Planets and moons only shine because sunlight bounces off them.',
        ],
      },
      {
        art: 'light-year',
        title: 'Sunlight takes 8 minutes to reach us',
        lines: [
          'Light is the fastest thing there is, and the Sun is still 8 minutes away.',
          'The next nearest star is over 4 light-years away.',
        ],
      },
    ],
    questions: [
      {
        id: 'sun-is',
        prompt: 'The Sun is a…',
        choices: [
          { id: 'star', label: 'star', art: 'sun' },
          { id: 'planet', label: 'planet', art: 'earth' },
          { id: 'moon', label: 'moon', art: 'moon' },
        ],
        answerId: 'star',
        explain: 'The Sun is a star — the closest one to Earth.',
      },
      {
        id: 'own-light',
        prompt: 'Which one makes its own light?',
        choices: p('sun', 'moon', 'mars'),
        answerId: 'sun',
        explain:
          'Stars like the Sun make their own light. The Moon and planets just reflect it.',
      },
      {
        id: 'closest-star',
        prompt: 'Which star is closest to Earth?',
        choices: [
          { id: 'sun', label: 'the Sun', art: 'sun' },
          { id: 'far', label: 'a night star', art: 'stars' },
          { id: 'galaxy', label: 'a galaxy', art: 'galaxy' },
        ],
        answerId: 'sun',
        explain: 'The Sun! Other stars are far, far further away.',
      },
      {
        id: 'sunlight-time',
        prompt: 'How long does sunlight take to reach Earth?',
        choices: [
          { id: '8min', label: 'about 8 minutes', art: 'light-year' },
          { id: 'instant', label: 'no time at all', art: 'rocket' },
          { id: 'week', label: 'a whole week', art: 'stars' },
        ],
        answerId: '8min',
        explain: 'About 8 minutes — even light needs time to travel.',
      },
      {
        id: 'why-shine',
        prompt: 'Why do stars shine?',
        choices: [
          { id: 'hot', label: 'they make heat and light inside', art: 'sun' },
          { id: 'mirror', label: 'they reflect the Moon', art: 'moon' },
          { id: 'fire', label: 'someone lights them', art: 'rocket' },
        ],
        answerId: 'hot',
        explain: 'Deep inside a star, tiny bits squash together and make light.',
      },
      {
        id: 'tiny-stars',
        prompt: 'Why do other stars look tiny?',
        choices: [
          { id: 'far', label: 'they are very far away', art: 'light-year' },
          { id: 'small', label: 'they are smaller than Earth', art: 'earth' },
          { id: 'shy', label: 'they are shy', art: 'stars' },
        ],
        answerId: 'far',
        explain: 'They are huge, just very far away. Distance makes them tiny.',
      },
    ],
  },

  moon: {
    id: 'moon',
    emoji: '🌙',
    title: 'Moon Mission',
    blurb: 'Phases, craters, far side',
    cards: [
      {
        art: 'moon',
        title: 'The Moon circles Earth',
        lines: ['One trip around Earth takes about a month.'],
      },
      {
        art: 'moon-phases',
        title: 'The Moon does not change shape',
        lines: [
          'Half of the Moon is always sunny. We just see different amounts of the sunny half.',
          'That is what makes new, half and full Moons.',
        ],
      },
      {
        art: 'craters',
        title: 'Craters are dents from space rocks',
        lines: [
          'Rocks crashed in long ago and left bowl-shaped holes.',
          'With no wind or rain up there, the dents stay for ever.',
        ],
      },
      {
        art: 'far-side',
        title: 'The far side, not a dark side',
        lines: [
          'The Moon always shows us the same face, so we never see the other one.',
          'That far side gets just as much sunlight as the side we see.',
        ],
      },
      {
        art: 'astronaut',
        title: 'Twelve people have walked there',
        lines: [
          'Neil Armstrong stepped out first, in 1969. Their footprints are still there.',
        ],
      },
    ],
    questions: [
      {
        id: 'phases',
        prompt: 'Why does the Moon look like it changes shape?',
        choices: [
          { id: 'sunlit', label: 'we see more or less of its sunny half', art: 'moon-phases' },
          { id: 'melts', label: 'it melts and grows back', art: 'moon' },
          { id: 'clouds', label: 'clouds cover it', art: 'blue-sky' },
        ],
        answerId: 'sunlit',
        explain:
          'Half the Moon is always sunlit. We just see different amounts of it.',
      },
      {
        id: 'far-side',
        prompt: 'Does the far side of the Moon get sunlight?',
        choices: [
          { id: 'yes', label: 'yes, just like our side', art: 'far-side' },
          { id: 'no', label: 'no, it is always dark', art: 'stars' },
          { id: 'sometimes', label: 'only in winter', art: 'moon' },
        ],
        answerId: 'yes',
        explain:
          'Yes! It is the far side, not a dark side — the Sun shines on it too.',
      },
      {
        id: 'craters',
        prompt: 'What made the Moon’s craters?',
        choices: [
          { id: 'rocks', label: 'space rocks crashing in', art: 'craters' },
          { id: 'digging', label: 'astronauts digging', art: 'astronaut' },
          { id: 'rain', label: 'heavy rain', art: 'raindrops' },
        ],
        answerId: 'rocks',
        explain: 'Space rocks crashed in and left bowl-shaped dents.',
      },
      {
        id: 'orbit',
        prompt: 'How long does the Moon take to circle Earth?',
        choices: [
          { id: 'month', label: 'about a month', art: 'moon-phases' },
          { id: 'day', label: 'one day', art: 'earth' },
          { id: 'year', label: 'one year', art: 'sun' },
        ],
        answerId: 'month',
        explain: 'About a month — that is where the word "month" comes from.',
      },
      {
        id: 'first',
        prompt: 'Who walked on the Moon first?',
        choices: [
          { id: 'armstrong', label: 'Neil Armstrong', art: 'astronaut' },
          { id: 'nobody', label: 'nobody ever has', art: 'moon' },
          { id: 'robot', label: 'only robots', art: 'rocket' },
        ],
        answerId: 'armstrong',
        explain: 'Neil Armstrong, in 1969. Twelve people have walked there.',
      },
      {
        id: 'no-air',
        prompt: 'Why do Moon footprints stay so long?',
        choices: [
          { id: 'no-weather', label: 'there is no wind or rain', art: 'far-side' },
          { id: 'glue', label: 'the dust is sticky', art: 'craters' },
          { id: 'frozen', label: 'they are frozen in ice', art: 'moon' },
        ],
        answerId: 'no-weather',
        explain: 'No wind and no rain on the Moon, so nothing rubs them out.',
      },
    ],
  },

  'space-rocks': {
    id: 'space-rocks',
    emoji: '☄️',
    title: 'Space Rocks',
    blurb: 'Asteroids, comets, meteors',
    cards: [
      {
        art: 'asteroid-belt',
        title: 'Asteroids are rocky lumps',
        lines: [
          'Most of them circle the Sun in a wide ring between Mars and Jupiter, called the asteroid belt.',
        ],
      },
      {
        art: 'comet',
        title: 'Comets are balls of ice and dust',
        lines: [
          'When a comet comes near the Sun it warms up and grows a long glowing tail.',
        ],
      },
      {
        art: 'meteor',
        title: 'A meteor is a rock burning up',
        lines: [
          'When a space rock hits our air it glows white hot. We call that a shooting star.',
          'Most are smaller than a pebble.',
        ],
      },
      {
        art: 'meteorite',
        title: 'A piece that lands is a meteorite',
        lines: ['If any of the rock survives the fall, it becomes a meteorite.'],
      },
    ],
    questions: [
      {
        id: 'belt',
        prompt: 'Where is the asteroid belt?',
        choices: [
          { id: 'mars-jupiter', label: 'between Mars and Jupiter', art: 'asteroid-belt' },
          { id: 'around-earth', label: 'around Earth', art: 'earth' },
          { id: 'inside-sun', label: 'inside the Sun', art: 'sun' },
        ],
        answerId: 'mars-jupiter',
        explain: 'The belt sits between Mars and Jupiter, going around the Sun.',
      },
      {
        id: 'shooting-star',
        prompt: 'What is a shooting star?',
        choices: [
          { id: 'meteor', label: 'a space rock burning up', art: 'meteor' },
          { id: 'star', label: 'a star falling down', art: 'stars' },
          { id: 'plane', label: 'a rocket taking off', art: 'rocket' },
        ],
        answerId: 'meteor',
        explain:
          'It is a meteor — a little space rock glowing hot in our air. No star falls.',
      },
      {
        id: 'tail',
        prompt: 'Which one grows a long tail near the Sun?',
        choices: [
          { id: 'comet', label: 'a comet', art: 'comet' },
          { id: 'asteroid', label: 'an asteroid', art: 'asteroid-belt' },
          { id: 'moon', label: 'the Moon', art: 'moon' },
        ],
        answerId: 'comet',
        explain: 'Comets are icy. The Sun warms them and the tail streams out.',
      },
      {
        id: 'landed',
        prompt: 'A space rock that lands on the ground is called…',
        choices: [
          { id: 'meteorite', label: 'a meteorite', art: 'meteorite' },
          { id: 'comet', label: 'a comet', art: 'comet' },
          { id: 'planet', label: 'a planet', art: 'earth' },
        ],
        answerId: 'meteorite',
        explain: 'In the sky it is a meteor. On the ground it is a meteorite.',
      },
      {
        id: 'made-of',
        prompt: 'What is a comet mostly made of?',
        choices: [
          { id: 'ice', label: 'ice and dust', art: 'comet' },
          { id: 'metal', label: 'solid gold', art: 'meteorite' },
          { id: 'gas', label: 'nothing at all', art: 'stars' },
        ],
        answerId: 'ice',
        explain: 'Ice and dust — a bit like a dirty snowball.',
      },
      {
        id: 'size',
        prompt: 'How big is a typical shooting star rock?',
        choices: [
          { id: 'pebble', label: 'smaller than a pebble', art: 'meteor' },
          { id: 'house', label: 'bigger than a house', art: 'meteorite' },
          { id: 'planet', label: 'as big as a planet', art: 'jupiter' },
        ],
        answerId: 'pebble',
        explain: 'Tiny! Most are smaller than a pebble and burn up high above us.',
      },
    ],
  },

  'deep-space': {
    id: 'deep-space',
    emoji: '🌌',
    title: 'Deep Space',
    blurb: 'Galaxies and light-years',
    cards: [
      {
        art: 'galaxy',
        title: 'A galaxy is a family of stars',
        lines: [
          'Gravity holds billions of stars, gas and dust together in one huge spinning group.',
        ],
      },
      {
        art: 'milky-way',
        title: 'We live in the Milky Way',
        lines: [
          'Our galaxy has hundreds of billions of stars, and the Sun is one of them.',
          'The milky band in a dark sky is our own galaxy, seen from inside.',
        ],
      },
      {
        art: 'stars',
        title: 'Andromeda is our big neighbour',
        lines: [
          'It is the nearest big galaxy, about 2.5 million light-years away.',
          'On a very dark night it looks like a faint smudge.',
        ],
      },
      {
        art: 'light-year',
        title: 'A light-year is a distance',
        lines: [
          'It is how far light travels in one year — a very long way, not a length of time.',
        ],
      },
    ],
    questions: [
      {
        id: 'our-galaxy',
        prompt: 'Which galaxy do we live in?',
        choices: [
          { id: 'milky-way', label: 'the Milky Way', art: 'milky-way' },
          { id: 'andromeda', label: 'Andromeda', art: 'galaxy' },
          { id: 'solar', label: 'the Sun', art: 'sun' },
        ],
        answerId: 'milky-way',
        explain: 'The Milky Way. Our Sun is one of its billions of stars.',
      },
      {
        id: 'what-galaxy',
        prompt: 'What is a galaxy?',
        choices: [
          { id: 'stars', label: 'a huge group of stars', art: 'galaxy' },
          { id: 'planet', label: 'a very big planet', art: 'jupiter' },
          { id: 'rocket', label: 'a kind of rocket', art: 'rocket' },
        ],
        answerId: 'stars',
        explain: 'A galaxy is billions of stars, gas and dust held by gravity.',
      },
      {
        id: 'neighbour',
        prompt: 'Which big galaxy is nearest to ours?',
        choices: [
          { id: 'andromeda', label: 'Andromeda', art: 'galaxy' },
          { id: 'saturn', label: 'Saturn', art: 'saturn' },
          { id: 'moon', label: 'the Moon', art: 'moon' },
        ],
        answerId: 'andromeda',
        explain: 'Andromeda, about 2.5 million light-years away.',
      },
      {
        id: 'light-year',
        prompt: 'A light-year measures…',
        choices: [
          { id: 'distance', label: 'how far', art: 'light-year' },
          { id: 'time', label: 'how long', art: 'moon-phases' },
          { id: 'weight', label: 'how heavy', art: 'meteorite' },
        ],
        answerId: 'distance',
        explain: 'How far! It is the distance light travels in one year.',
      },
      {
        id: 'band',
        prompt: 'What is the milky band across a dark night sky?',
        choices: [
          { id: 'galaxy', label: 'our own galaxy', art: 'milky-way' },
          { id: 'clouds', label: 'thin clouds', art: 'blue-sky' },
          { id: 'smoke', label: 'rocket smoke', art: 'rocket' },
        ],
        answerId: 'galaxy',
        explain: 'It is the Milky Way — we are looking along it from inside.',
      },
    ],
  },

  'wow-facts': {
    id: 'wow-facts',
    emoji: '🔭',
    title: 'Amazing Space Facts',
    blurb: 'Wow! moments',
    cards: [
      {
        art: 'pluto',
        title: 'Pluto is a dwarf planet',
        lines: [
          'It was called the ninth planet until 2006.',
          'Pluto is smaller than our own Moon.',
        ],
      },
      {
        art: 'jupiter',
        title: 'A year on Jupiter is 11.86 Earth years',
        lines: [
          'It is so far out that one lap around the Sun takes almost twelve of our years.',
        ],
      },
      {
        art: 'saturn',
        title: 'Saturn could float',
        lines: [
          'Saturn is so light for its size that it would bob in a big enough bath of water.',
        ],
      },
      {
        art: 'venus',
        title: 'On Venus a day is longer than a year',
        lines: [
          'Venus spins so slowly that one spin takes longer than one trip around the Sun.',
        ],
      },
      {
        art: 'volcano',
        title: 'Mars has the tallest volcano',
        lines: [
          'Olympus Mons is about 22 km high — nearly three Everests stacked up.',
        ],
      },
    ],
    questions: [
      {
        id: 'pluto',
        prompt: 'What is Pluto called now?',
        choices: [
          { id: 'dwarf', label: 'a dwarf planet', art: 'pluto' },
          { id: 'ninth', label: 'the ninth planet', art: 'neptune' },
          { id: 'moon', label: 'a moon of Mars', art: 'moon' },
        ],
        answerId: 'dwarf',
        explain: 'Since 2006 Pluto is a dwarf planet. It is smaller than our Moon.',
      },
      {
        id: 'jupiter-year',
        prompt: 'Which planet takes almost 12 Earth years to go round the Sun?',
        choices: p('jupiter', 'earth', 'mercury'),
        answerId: 'jupiter',
        explain: 'Jupiter — one Jupiter year is 11.86 Earth years.',
      },
      {
        id: 'float',
        prompt: 'Which planet is light enough to float in water?',
        choices: p('saturn', 'earth', 'mars'),
        answerId: 'saturn',
        explain: 'Saturn! It is mostly gas, so it is very light for its size.',
      },
      {
        id: 'slow-spin',
        prompt: 'Where is one day longer than one year?',
        choices: p('venus', 'earth', 'jupiter'),
        answerId: 'venus',
        explain: 'On Venus. It spins so slowly that a day outlasts its year.',
      },
      {
        id: 'volcano',
        prompt: 'Which planet has the tallest volcano?',
        choices: p('mars', 'neptune', 'mercury'),
        answerId: 'mars',
        explain: 'Mars. Olympus Mons is about 22 km tall.',
      },
      {
        id: 'tilt',
        prompt: 'Which planet rolls along on its side?',
        choices: p('uranus', 'earth', 'venus'),
        answerId: 'uranus',
        explain: 'Uranus is tipped right over, so it spins like a rolling ball.',
      },
    ],
  },

  'sky-science': {
    id: 'sky-science',
    emoji: '🌈',
    title: 'Sky Science',
    blurb: 'Blue sky, orange sunsets',
    cards: [
      {
        art: 'rainbow-light',
        title: 'Sunlight is made of many colours',
        lines: [
          'White sunlight is really red, orange, yellow, green, blue and violet mixed together.',
        ],
      },
      {
        art: 'blue-sky',
        title: 'Why the sky looks blue',
        lines: [
          'Tiny bits of air bounce blue light all around the sky, much more than red light.',
          'So blue reaches your eyes from everywhere above you.',
        ],
      },
      {
        art: 'sunset',
        title: 'Why sunsets look orange',
        lines: [
          'At sunset the light travels through much more air, and the blue gets bounced away.',
          'The orange and red are what is left.',
        ],
      },
      {
        art: 'raindrops',
        title: 'Rainbows split the light',
        lines: [
          'Raindrops bend sunlight and spread it into its colours.',
          'Keep the Sun behind you to see one.',
        ],
      },
    ],
    questions: [
      {
        id: 'blue',
        prompt: 'Why does the sky look blue?',
        choices: [
          { id: 'scatter', label: 'air bounces blue light around', art: 'blue-sky' },
          { id: 'ocean', label: 'it reflects the sea', art: 'earth' },
          { id: 'paint', label: 'the sky is painted', art: 'rainbow-light' },
        ],
        answerId: 'scatter',
        explain: 'Tiny bits of air scatter blue light all over the sky.',
      },
      {
        id: 'sunset',
        prompt: 'Why do sunsets look orange and red?',
        choices: [
          { id: 'more-air', label: 'the light goes through more air', art: 'sunset' },
          { id: 'sun-hot', label: 'the Sun gets hotter', art: 'sun' },
          { id: 'dust', label: 'the Sun changes colour', art: 'stars' },
        ],
        answerId: 'more-air',
        explain: 'More air scatters the blue away, so orange and red are left.',
      },
      {
        id: 'white-light',
        prompt: 'What is white sunlight made of?',
        choices: [
          { id: 'colours', label: 'all the colours mixed', art: 'rainbow-light' },
          { id: 'white', label: 'only white', art: 'moon' },
          { id: 'blue', label: 'only blue', art: 'blue-sky' },
        ],
        answerId: 'colours',
        explain: 'Every colour of the rainbow, mixed together.',
      },
      {
        id: 'rainbow',
        prompt: 'What makes a rainbow?',
        choices: [
          { id: 'drops', label: 'sunlight bending in raindrops', art: 'raindrops' },
          { id: 'clouds', label: 'coloured clouds', art: 'blue-sky' },
          { id: 'stars', label: 'starlight', art: 'stars' },
        ],
        answerId: 'drops',
        explain: 'Raindrops bend the sunlight and spread out its colours.',
      },
      {
        id: 'rainbow-where',
        prompt: 'Where should the Sun be when you look for a rainbow?',
        choices: [
          { id: 'behind', label: 'behind you', art: 'raindrops' },
          { id: 'front', label: 'in front of you', art: 'sun' },
          { id: 'gone', label: 'already set', art: 'sunset' },
        ],
        answerId: 'behind',
        explain: 'Behind you, with the rain in front. Then the colours come back to you.',
      },
    ],
  },
}

export function getMission(id: MissionId): Mission {
  return MISSIONS[id]
}
