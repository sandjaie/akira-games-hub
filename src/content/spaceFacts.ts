/**
 * Fresh-every-day content without a network round trip.
 *
 * The fact bank rotates by calendar day, so "Today's space facts" is different
 * each morning and only comes round again weeks later. Moon phase is computed
 * from the date — no API can beat arithmetic for something this predictable.
 */
import { markSeen, pickFresh } from './seen'
import type { SpaceArtKind } from './space/SpaceArt'

export type SpaceFact = { text: string; art: SpaceArtKind }

export const FACT_BANK: SpaceFact[] = [
  { text: 'A day on Mars is only 40 minutes longer than a day on Earth.', art: 'mars' },
  { text: 'Mars has two little moons, called Phobos and Deimos.', art: 'mars' },
  { text: 'Mars looks red because its dust is full of rust.', art: 'mars' },
  { text: 'Jupiter has a storm bigger than Earth that has been spinning for centuries.', art: 'jupiter' },
  { text: 'Jupiter has more than 90 known moons.', art: 'jupiter' },
  { text: 'Jupiter is so big that all the other planets would fit inside it.', art: 'jupiter' },
  { text: 'Saturn’s rings are made of billions of pieces of ice and rock.', art: 'saturn' },
  { text: 'Saturn is so light for its size that it would float in a giant bath.', art: 'saturn' },
  { text: 'Saturn’s moon Titan has rivers and lakes — of liquid methane, not water.', art: 'saturn' },
  { text: 'Uranus spins on its side, as if someone tipped it over.', art: 'uranus' },
  { text: 'Neptune has the fastest winds in the Solar System.', art: 'neptune' },
  { text: 'Neptune takes about 165 Earth years to go around the Sun once.', art: 'neptune' },
  { text: 'On Venus one day lasts longer than one whole year.', art: 'venus' },
  { text: 'Venus is the hottest planet, about 465°C — hot enough to melt lead.', art: 'venus' },
  { text: 'Venus spins backwards compared with almost every other planet.', art: 'venus' },
  { text: 'Mercury has no air, so its sky is always black.', art: 'mercury' },
  { text: 'A year on Mercury is only 88 Earth days.', art: 'mercury' },
  { text: 'Earth is the only planet we know with liquid water oceans on the surface.', art: 'earth' },
  { text: 'Earth spins at about 1,600 km/h at the equator — and you never feel it.', art: 'earth' },
  { text: 'Our air is mostly nitrogen; only about a fifth of it is oxygen.', art: 'blue-sky' },
  { text: 'Pluto is smaller than our Moon.', art: 'pluto' },
  { text: 'One year on Pluto lasts about 248 Earth years.', art: 'pluto' },
  { text: 'Pluto has a huge heart-shaped patch of frozen nitrogen.', art: 'pluto' },
  { text: 'The Sun is so big that about 1.3 million Earths would fit inside.', art: 'sun' },
  { text: 'The Sun makes so much light that it lights up every planet.', art: 'sun' },
  { text: 'The Sun is about 4.6 billion years old — and middle-aged for a star.', art: 'sun' },
  { text: 'Sunlight takes about 8 minutes to reach Earth.', art: 'light-year' },
  { text: 'The Sun is a star, and there are billions more in our galaxy.', art: 'stars' },
  { text: 'The nearest star after the Sun is Proxima Centauri, over 4 light-years away.', art: 'stars' },
  { text: 'Some stars are blue and some are red — blue ones are hotter.', art: 'stars' },
  { text: 'Stars twinkle because our moving air bends their light.', art: 'blue-sky' },
  { text: 'The Moon is about 384,000 km away — 30 Earths could fit in the gap.', art: 'moon' },
  { text: 'The Moon takes about a month to travel once around Earth.', art: 'moon-phases' },
  { text: 'The Moon always shows us the same face, so we never see its far side.', art: 'far-side' },
  { text: 'The far side of the Moon gets sunlight too — it is not a dark side.', art: 'far-side' },
  { text: 'There is no wind on the Moon, so the astronauts’ footprints are still there.', art: 'astronaut' },
  { text: 'Twelve people have walked on the Moon, all between 1969 and 1972.', art: 'astronaut' },
  { text: 'You would weigh six times less on the Moon than on Earth.', art: 'moon' },
  { text: 'The Moon causes the tides that make the sea rise and fall.', art: 'earth' },
  { text: 'Most asteroids circle the Sun in a wide belt between Mars and Jupiter.', art: 'asteroid-belt' },
  { text: 'The biggest thing in the asteroid belt is Ceres, a dwarf planet.', art: 'asteroid-belt' },
  { text: 'Comets are icy, so the Sun melts them a little and gives them a tail.', art: 'comet' },
  { text: 'Halley’s comet comes back near Earth about every 76 years.', art: 'comet' },
  { text: 'A shooting star is a space rock burning up in our air, not a star.', art: 'meteor' },
  { text: 'Most shooting stars are smaller than a pebble.', art: 'meteor' },
  { text: 'A space rock that lands on the ground is called a meteorite.', art: 'meteorite' },
  { text: 'Our galaxy, the Milky Way, has hundreds of billions of stars.', art: 'milky-way' },
  { text: 'The milky band you see in a dark sky is our own galaxy from inside.', art: 'milky-way' },
  { text: 'The nearest big galaxy, Andromeda, is 2.5 million light-years away.', art: 'galaxy' },
  { text: 'A light-year is a distance, not a time — how far light goes in a year.', art: 'light-year' },
  { text: 'Light travels 300,000 km every second.', art: 'light-year' },
  { text: 'Space is silent, because sound needs air to travel through.', art: 'stars' },
  { text: 'The sky looks blue because air scatters blue light all around.', art: 'blue-sky' },
  { text: 'Sunsets look orange because the light has to cross much more air.', art: 'sunset' },
  { text: 'A rainbow needs the Sun behind you and rain in front of you.', art: 'raindrops' },
  { text: 'White sunlight is really every colour mixed together.', art: 'rainbow-light' },
  { text: 'Mars has the tallest volcano in the Solar System, about 22 km high.', art: 'volcano' },
  { text: 'The space station flies around Earth about every 90 minutes.', art: 'rocket' },
  { text: 'Astronauts on the space station see 16 sunrises every day.', art: 'astronaut' },
  { text: 'Rockets need to reach about 28,000 km/h to stay in orbit.', art: 'rocket' },
  { text: 'The first telescope pointed at the sky was used over 400 years ago.', art: 'telescope' },
  { text: 'Telescopes work by collecting more light than your eyes can.', art: 'telescope' },
]

const MOON_PHASES = [
  { name: 'new Moon', emoji: '🌑' },
  { name: 'waxing crescent', emoji: '🌒' },
  { name: 'first quarter', emoji: '🌓' },
  { name: 'waxing gibbous', emoji: '🌔' },
  { name: 'full Moon', emoji: '🌕' },
  { name: 'waning gibbous', emoji: '🌖' },
  { name: 'last quarter', emoji: '🌗' },
  { name: 'waning crescent', emoji: '🌘' },
]

/** Whole days since 1970 in UTC — the seed for everything daily. */
export function dayNumber(now: Date): number {
  return Math.floor(now.getTime() / 86_400_000)
}

export function dayKey(now: Date): string {
  return now.toISOString().slice(0, 10)
}

/** A different slice of the bank each day, cycling through all of it. */
export function factsForDay(now: Date, count = 3): SpaceFact[] {
  const start = dayNumber(now) * count
  return Array.from(
    { length: Math.min(count, FACT_BANK.length) },
    (_, i) => FACT_BANK[(start + i) % FACT_BANK.length],
  )
}

/**
 * Facts this browser has not been shown yet, oldest-seen once the bank has been
 * through. Beats a date rotation: skipping a few days no longer skips facts.
 */
export function freshFacts(count = 3): SpaceFact[] {
  const picked = pickFresh(FACT_BANK, count, factKey)
  for (const fact of picked) markSeen(factKey(fact))
  return picked
}

export function factKey(fact: SpaceFact): string {
  return `fact:${fact.text.slice(0, 40)}`
}

/**
 * Moon phase from the date. Counts synodic months since the known new Moon of
 * 6 Jan 2000 18:14 UTC; good to well under a day, which is all a kid needs.
 */
export function moonPhaseForDay(now: Date): {
  name: string
  emoji: string
  fraction: number
} {
  const knownNewMoon = Date.UTC(2000, 0, 6, 18, 14)
  const synodicMonth = 29.530_588_853 * 86_400_000
  const since = (now.getTime() - knownNewMoon) / synodicMonth
  const fraction = since - Math.floor(since)
  const index = Math.round(fraction * 8) % 8
  return { ...MOON_PHASES[index], fraction }
}
