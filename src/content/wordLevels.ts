export type WordLevelId =
  | 'animals'
  | 'colors'
  | 'school'
  | 'home'
  | 'play'
  | 'food'
  | 'nature'
  | 'family'
  | 'body'
  | 'weather'

export type WordLevel = {
  id: WordLevelId
  title: string
  emoji: string
  words: string[]
}

export const WORD_LEVEL_ORDER: WordLevelId[] = [
  'animals',
  'colors',
  'school',
  'home',
  'play',
  'food',
  'nature',
  'family',
  'body',
  'weather',
]

export const WORD_LEVELS: Record<WordLevelId, WordLevel> = {
  animals: {
    id: 'animals',
    title: 'Animals',
    emoji: '🐾',
    words: [
      'CAT',
      'DOG',
      'BIRD',
      'FISH',
      'FROG',
      'BEAR',
      'DUCK',
      'LION',
      'PIG',
      'COW',
      'HEN',
      'ANT',
    ],
  },
  colors: {
    id: 'colors',
    title: 'Colors',
    emoji: '🎨',
    words: [
      'RED',
      'BLUE',
      'PINK',
      'GOLD',
      'GREEN',
      'BLACK',
      'WHITE',
      'BROWN',
      'GRAY',
      'TEAL',
    ],
  },
  school: {
    id: 'school',
    title: 'School',
    emoji: '📚',
    words: [
      'BOOK',
      'PEN',
      'DESK',
      'BAG',
      'READ',
      'MATH',
      'GLUE',
      'MAP',
      'BELL',
      'NOTE',
      'CLASS',
    ],
  },
  home: {
    id: 'home',
    title: 'Home',
    emoji: '🏠',
    words: [
      'BED',
      'DOOR',
      'CUP',
      'LAMP',
      'SOFA',
      'ROOM',
      'WALL',
      'SINK',
      'OVEN',
      'RUG',
      'CHAIR',
    ],
  },
  play: {
    id: 'play',
    title: 'Play',
    emoji: '🎮',
    words: [
      'BALL',
      'GAME',
      'JUMP',
      'SING',
      'DRAW',
      'TOY',
      'SLIDE',
      'SWING',
      'RACE',
      'DANCE',
      'HIDE',
    ],
  },
  food: {
    id: 'food',
    title: 'Food',
    emoji: '🍎',
    words: [
      'APPLE',
      'MILK',
      'BREAD',
      'RICE',
      'CAKE',
      'SOUP',
      'EGG',
      'CORN',
      'PEAR',
      'JUICE',
      'PASTA',
    ],
  },
  nature: {
    id: 'nature',
    title: 'Nature',
    emoji: '🌳',
    words: [
      'TREE',
      'LEAF',
      'SUN',
      'MOON',
      'STAR',
      'ROCK',
      'LAKE',
      'HILL',
      'SEED',
      'CLOUD',
      'GRASS',
    ],
  },
  family: {
    id: 'family',
    title: 'Family',
    emoji: '👨‍👩‍👧',
    words: [
      'MOM',
      'DAD',
      'BABY',
      'AUNT',
      'UNCLE',
      'SISTER',
      'LOVE',
      'HUG',
      'KISS',
      'HOME',
    ],
  },
  body: {
    id: 'body',
    title: 'Body',
    emoji: '💪',
    words: [
      'HAND',
      'FOOT',
      'EYE',
      'EAR',
      'NOSE',
      'ARM',
      'LEG',
      'HAIR',
      'FACE',
      'TOOTH',
      'NECK',
    ],
  },
  weather: {
    id: 'weather',
    title: 'Weather',
    emoji: '⛅',
    words: [
      'RAIN',
      'SNOW',
      'WIND',
      'HOT',
      'COLD',
      'WARM',
      'STORM',
      'FOG',
      'HAIL',
      'SKY',
    ],
  },
}

export function getWordLevel(id: WordLevelId): WordLevel {
  return WORD_LEVELS[id]
}
