/**
 * Topics the fact engine can fetch for each mission. Adding one line here adds
 * a new card to a mission for ever — no wording needed, the engine writes it.
 *
 * `page` is the Simple English Wikipedia page; `title` is what a kid sees.
 */
import type { MissionId } from './space'
import type { Topic } from './factEngine'

export const MISSION_TOPICS: Record<MissionId, Topic[]> = {
  today: [
    { title: 'The Solar System', page: 'Solar System', art: 'solar-system' },
    { title: 'Space', page: 'Outer space', art: 'stars' },
    { title: 'Gravity', page: 'Gravity', art: 'earth' },
    { title: 'The space station', page: 'International Space Station', art: 'rocket' },
    { title: 'Astronauts', page: 'Astronaut', art: 'astronaut' },
    { title: 'Telescopes', page: 'Telescope', art: 'telescope' },
    { title: 'Rockets', page: 'Rocket', art: 'rocket' },
    { title: 'Satellites', page: 'Satellite', art: 'rocket' },
  ],

  planets: [
    { title: 'Mercury', page: 'Mercury (planet)', art: 'mercury' },
    { title: 'Venus', page: 'Venus', art: 'venus' },
    { title: 'Earth', page: 'Earth', art: 'earth' },
    { title: 'Mars', page: 'Mars', art: 'mars' },
    { title: 'Jupiter', page: 'Jupiter', art: 'jupiter' },
    { title: 'Saturn', page: 'Saturn', art: 'saturn' },
    { title: 'Uranus', page: 'Uranus', art: 'uranus' },
    { title: 'Neptune', page: 'Neptune', art: 'neptune' },
    { title: 'What is a planet?', page: 'Planet', art: 'solar-system' },
    { title: 'Orbits', page: 'Orbit', art: 'solar-system' },
    { title: 'Saturn’s rings', page: 'Rings of Saturn', art: 'saturn' },
    { title: 'The Great Red Spot', page: 'Great Red Spot', art: 'jupiter' },
    { title: 'Moons', page: 'Moon (natural satellite)', art: 'moon' },
    { title: 'Titan', page: 'Titan (moon)', art: 'saturn' },
    { title: 'Europa', page: 'Europa (moon)', art: 'jupiter' },
    { title: 'Seasons', page: 'Season', art: 'earth' },
  ],

  'sun-stars': [
    { title: 'The Sun', page: 'Sun', art: 'sun' },
    { title: 'Stars', page: 'Star', art: 'stars' },
    { title: 'Sunlight', page: 'Sunlight', art: 'sun' },
    { title: 'Starlight', page: 'Light', art: 'light-year' },
    { title: 'Sunspots', page: 'Sunspot', art: 'sun' },
    { title: 'Solar eclipse', page: 'Solar eclipse', art: 'sun' },
    { title: 'Constellations', page: 'Constellation', art: 'stars' },
    { title: 'The Pole Star', page: 'Polaris', art: 'stars' },
    { title: 'Sirius, the brightest star', page: 'Sirius', art: 'stars' },
    { title: 'Proxima Centauri', page: 'Proxima Centauri', art: 'stars' },
    { title: 'Supernovas', page: 'Supernova', art: 'stars' },
    { title: 'Black holes', page: 'Black hole', art: 'galaxy' },
  ],

  moon: [
    { title: 'The Moon', page: 'Moon', art: 'moon' },
    { title: 'Moon phases', page: 'Lunar phase', art: 'moon-phases' },
    { title: 'Craters', page: 'Impact crater', art: 'craters' },
    { title: 'The far side', page: 'Far side of the Moon', art: 'far-side' },
    { title: 'Apollo 11', page: 'Apollo 11', art: 'astronaut' },
    { title: 'Neil Armstrong', page: 'Neil Armstrong', art: 'astronaut' },
    { title: 'Moonwalks', page: 'Moon landing', art: 'astronaut' },
    { title: 'Lunar eclipse', page: 'Lunar eclipse', art: 'moon' },
    { title: 'Tides', page: 'Tide', art: 'earth' },
    { title: 'Moon rocks', page: 'Moon rock', art: 'meteorite' },
  ],

  'space-rocks': [
    { title: 'Asteroids', page: 'Asteroid', art: 'asteroid-belt' },
    { title: 'The asteroid belt', page: 'Asteroid belt', art: 'asteroid-belt' },
    { title: 'Comets', page: 'Comet', art: 'comet' },
    { title: 'Halley’s Comet', page: "Halley's Comet", art: 'comet' },
    { title: 'Meteors', page: 'Meteor', art: 'meteor' },
    { title: 'Meteorites', page: 'Meteorite', art: 'meteorite' },
    { title: 'Meteor showers', page: 'Meteor shower', art: 'meteor' },
    { title: 'Ceres', page: 'Ceres (dwarf planet)', art: 'pluto' },
    { title: 'Space dust', page: 'Cosmic dust', art: 'stars' },
  ],

  'deep-space': [
    { title: 'Galaxies', page: 'Galaxy', art: 'galaxy' },
    { title: 'The Milky Way', page: 'Milky Way', art: 'milky-way' },
    { title: 'Andromeda', page: 'Andromeda Galaxy', art: 'galaxy' },
    { title: 'Light-years', page: 'Light-year', art: 'light-year' },
    { title: 'Nebulas', page: 'Nebula', art: 'galaxy' },
    { title: 'The universe', page: 'Universe', art: 'stars' },
    { title: 'Star clusters', page: 'Star cluster', art: 'stars' },
    { title: 'The Hubble telescope', page: 'Hubble Space Telescope', art: 'telescope' },
    { title: 'The Webb telescope', page: 'James Webb Space Telescope', art: 'telescope' },
  ],

  'wow-facts': [
    { title: 'Pluto', page: 'Pluto', art: 'pluto' },
    { title: 'Olympus Mons', page: 'Olympus Mons', art: 'volcano' },
    { title: 'Space suits', page: 'Space suit', art: 'astronaut' },
    { title: 'Weightlessness', page: 'Weightlessness', art: 'astronaut' },
    { title: 'Mars rovers', page: 'Mars rover', art: 'mars' },
    { title: 'Voyager 1', page: 'Voyager 1', art: 'rocket' },
    { title: 'The first satellite', page: 'Sputnik 1', art: 'rocket' },
    { title: 'Space food', page: 'Space food', art: 'astronaut' },
    { title: 'Yuri Gagarin', page: 'Yuri Gagarin', art: 'astronaut' },
    { title: 'Dwarf planets', page: 'Dwarf planet', art: 'pluto' },
  ],

  'sky-science': [
    { title: 'Rainbows', page: 'Rainbow', art: 'raindrops' },
    { title: 'Why the sky is blue', page: 'Diffuse sky radiation', art: 'blue-sky' },
    { title: 'Sunsets', page: 'Sunset', art: 'sunset' },
    { title: 'Clouds', page: 'Cloud', art: 'blue-sky' },
    { title: 'Colours of light', page: 'Colour', art: 'rainbow-light' },
    { title: 'The atmosphere', page: 'Atmosphere of Earth', art: 'blue-sky' },
    { title: 'Lightning', page: 'Lightning', art: 'sunset' },
    { title: 'The northern lights', page: 'Aurora', art: 'stars' },
    { title: 'Twinkling stars', page: 'Twinkling', art: 'stars' },
    { title: 'Shadows', page: 'Shadow', art: 'sun' },
  ],
}

export function topicsFor(mission: MissionId): Topic[] {
  return MISSION_TOPICS[mission] ?? []
}
