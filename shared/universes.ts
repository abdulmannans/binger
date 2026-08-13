import type { MediaType } from './types'

export interface UniverseTitle {
  tmdbId: number
  mediaType: MediaType
  title: string
  year: number
}

export interface UniverseCatalogItem {
  slug: string
  name: string
  tag: string
  description: string
  source?: string
  kind: 'universe' | 'collection'
  /** Featured TMDB collection — parts loaded live */
  tmdbCollectionId?: number
  /** Curated titles with stable TMDB IDs */
  titles?: UniverseTitle[]
  posterPath?: string | null
}

export const CURATED_UNIVERSES: UniverseCatalogItem[] = [
  {
    slug: 'mcu',
    name: 'Marvel Cinematic Universe',
    tag: 'Marvel · Films & series',
    description: 'MCU films and Disney+ series in theatrical / premiere release order.',
    source: 'https://en.wikipedia.org/wiki/List_of_Marvel_Cinematic_Universe_films',
    kind: 'universe',
    titles: [
      { tmdbId: 1726, mediaType: 'movie', title: 'Iron Man', year: 2008 },
      { tmdbId: 1724, mediaType: 'movie', title: 'The Incredible Hulk', year: 2008 },
      { tmdbId: 10138, mediaType: 'movie', title: 'Iron Man 2', year: 2010 },
      { tmdbId: 10195, mediaType: 'movie', title: 'Thor', year: 2011 },
      { tmdbId: 1771, mediaType: 'movie', title: 'Captain America: The First Avenger', year: 2011 },
      { tmdbId: 24428, mediaType: 'movie', title: 'The Avengers', year: 2012 },
      { tmdbId: 68721, mediaType: 'movie', title: 'Iron Man 3', year: 2013 },
      { tmdbId: 76338, mediaType: 'movie', title: 'Thor: The Dark World', year: 2013 },
      { tmdbId: 100402, mediaType: 'movie', title: 'Captain America: The Winter Soldier', year: 2014 },
      { tmdbId: 118340, mediaType: 'movie', title: 'Guardians of the Galaxy', year: 2014 },
      { tmdbId: 99861, mediaType: 'movie', title: 'Avengers: Age of Ultron', year: 2015 },
      { tmdbId: 102899, mediaType: 'movie', title: 'Ant-Man', year: 2015 },
      { tmdbId: 271110, mediaType: 'movie', title: 'Captain America: Civil War', year: 2016 },
      { tmdbId: 284052, mediaType: 'movie', title: 'Doctor Strange', year: 2016 },
      { tmdbId: 283995, mediaType: 'movie', title: 'Guardians of the Galaxy Vol. 2', year: 2017 },
      { tmdbId: 315635, mediaType: 'movie', title: 'Spider-Man: Homecoming', year: 2017 },
      { tmdbId: 284053, mediaType: 'movie', title: 'Thor: Ragnarok', year: 2017 },
      { tmdbId: 284054, mediaType: 'movie', title: 'Black Panther', year: 2018 },
      { tmdbId: 299536, mediaType: 'movie', title: 'Avengers: Infinity War', year: 2018 },
      { tmdbId: 363088, mediaType: 'movie', title: 'Ant-Man and the Wasp', year: 2018 },
      { tmdbId: 299537, mediaType: 'movie', title: 'Captain Marvel', year: 2019 },
      { tmdbId: 299534, mediaType: 'movie', title: 'Avengers: Endgame', year: 2019 },
      { tmdbId: 429617, mediaType: 'movie', title: 'Spider-Man: Far From Home', year: 2019 },
      { tmdbId: 85271, mediaType: 'tv', title: 'WandaVision', year: 2021 },
      { tmdbId: 88396, mediaType: 'tv', title: 'The Falcon and the Winter Soldier', year: 2021 },
      { tmdbId: 84958, mediaType: 'tv', title: 'Loki', year: 2021 },
      { tmdbId: 497698, mediaType: 'movie', title: 'Black Widow', year: 2021 },
      { tmdbId: 91363, mediaType: 'tv', title: 'What If...?', year: 2021 },
      { tmdbId: 566525, mediaType: 'movie', title: 'Shang-Chi and the Legend of the Ten Rings', year: 2021 },
      { tmdbId: 524434, mediaType: 'movie', title: 'Eternals', year: 2021 },
      { tmdbId: 88329, mediaType: 'tv', title: 'Hawkeye', year: 2021 },
      { tmdbId: 634649, mediaType: 'movie', title: 'Spider-Man: No Way Home', year: 2021 },
      { tmdbId: 83867, mediaType: 'tv', title: 'Moon Knight', year: 2022 },
      { tmdbId: 453395, mediaType: 'movie', title: 'Doctor Strange in the Multiverse of Madness', year: 2022 },
      { tmdbId: 92782, mediaType: 'tv', title: 'Ms. Marvel', year: 2022 },
      { tmdbId: 616037, mediaType: 'movie', title: 'Thor: Love and Thunder', year: 2022 },
      { tmdbId: 92783, mediaType: 'tv', title: 'She-Hulk: Attorney at Law', year: 2022 },
      { tmdbId: 1033219, mediaType: 'movie', title: 'Werewolf by Night', year: 2022 },
      { tmdbId: 505642, mediaType: 'movie', title: 'Black Panther: Wakanda Forever', year: 2022 },
      { tmdbId: 1025916, mediaType: 'movie', title: 'The Guardians of the Galaxy Holiday Special', year: 2022 },
      { tmdbId: 640146, mediaType: 'movie', title: 'Ant-Man and the Wasp: Quantumania', year: 2023 },
      { tmdbId: 447365, mediaType: 'movie', title: 'Guardians of the Galaxy Vol. 3', year: 2023 },
      { tmdbId: 114472, mediaType: 'tv', title: 'Secret Invasion', year: 2023 },
      { tmdbId: 609681, mediaType: 'movie', title: 'The Marvels', year: 2023 },
      { tmdbId: 157742, mediaType: 'tv', title: 'Echo', year: 2024 },
      { tmdbId: 533535, mediaType: 'movie', title: 'Deadpool & Wolverine', year: 2024 },
      { tmdbId: 138501, mediaType: 'tv', title: 'Agatha All Along', year: 2024 },
      { tmdbId: 822119, mediaType: 'movie', title: 'Captain America: Brave New World', year: 2025 },
      { tmdbId: 986056, mediaType: 'movie', title: 'Thunderbolts*', year: 2025 },
      { tmdbId: 617126, mediaType: 'movie', title: 'The Fantastic Four: First Steps', year: 2025 },
    ],
  },
  {
    slug: 'dc-animated-originals',
    name: 'DC Universe Animated Original Movies',
    tag: 'DC · Animated',
    description: 'Release order of the DCUAOM line — standalones, DCAMU, and Tomorrowverse.',
    source: 'https://en.wikipedia.org/wiki/DC_Universe_Animated_Original_Movies',
    kind: 'universe',
    titles: [
      { tmdbId: 14919, mediaType: 'movie', title: 'Superman: Doomsday', year: 2007 },
      { tmdbId: 15318, mediaType: 'movie', title: 'Justice League: The New Frontier', year: 2008 },
      { tmdbId: 13851, mediaType: 'movie', title: 'Batman: Gotham Knight', year: 2008 },
      { tmdbId: 14790, mediaType: 'movie', title: 'Wonder Woman', year: 2009 },
      { tmdbId: 19901, mediaType: 'movie', title: 'Green Lantern: First Flight', year: 2009 },
      { tmdbId: 20526, mediaType: 'movie', title: 'Superman/Batman: Public Enemies', year: 2009 },
      { tmdbId: 27551, mediaType: 'movie', title: 'Justice League: Crisis on Two Earths', year: 2010 },
      { tmdbId: 40662, mediaType: 'movie', title: 'Batman: Under the Red Hood', year: 2010 },
      { tmdbId: 45140, mediaType: 'movie', title: 'Superman/Batman: Apocalypse', year: 2010 },
      { tmdbId: 55779, mediaType: 'movie', title: 'All-Star Superman', year: 2011 },
      { tmdbId: 64945, mediaType: 'movie', title: 'Green Lantern: Emerald Knights', year: 2011 },
      { tmdbId: 69735, mediaType: 'movie', title: 'Batman: Year One', year: 2011 },
      { tmdbId: 76595, mediaType: 'movie', title: 'Justice League: Doom', year: 2012 },
      { tmdbId: 76121, mediaType: 'movie', title: 'Superman vs. The Elite', year: 2012 },
      { tmdbId: 123025, mediaType: 'movie', title: 'Batman: The Dark Knight Returns, Part 1', year: 2012 },
      { tmdbId: 142061, mediaType: 'movie', title: 'Batman: The Dark Knight Returns, Part 2', year: 2013 },
      { tmdbId: 166514, mediaType: 'movie', title: 'Superman: Unbound', year: 2013 },
      { tmdbId: 183011, mediaType: 'movie', title: 'Justice League: The Flashpoint Paradox', year: 2013 },
      { tmdbId: 256408, mediaType: 'movie', title: 'Justice League: War', year: 2014 },
      { tmdbId: 251519, mediaType: 'movie', title: 'Son of Batman', year: 2014 },
      { tmdbId: 242643, mediaType: 'movie', title: 'Batman: Assault on Arkham', year: 2014 },
      { tmdbId: 297556, mediaType: 'movie', title: 'Justice League: Throne of Atlantis', year: 2015 },
      { tmdbId: 321528, mediaType: 'movie', title: 'Batman vs. Robin', year: 2015 },
      { tmdbId: 304554, mediaType: 'movie', title: 'Justice League: Gods and Monsters', year: 2015 },
      { tmdbId: 366924, mediaType: 'movie', title: 'Batman: Bad Blood', year: 2016 },
      { tmdbId: 388399, mediaType: 'movie', title: 'Justice League vs. Teen Titans', year: 2016 },
      { tmdbId: 382322, mediaType: 'movie', title: 'Batman: The Killing Joke', year: 2016 },
      { tmdbId: 408220, mediaType: 'movie', title: 'Justice League Dark', year: 2017 },
      { tmdbId: 417778, mediaType: 'movie', title: 'Teen Titans: The Judas Contract', year: 2017 },
      { tmdbId: 408648, mediaType: 'movie', title: 'Batman and Harley Quinn', year: 2017 },
      { tmdbId: 471474, mediaType: 'movie', title: 'Batman: Gotham by Gaslight', year: 2018 },
      { tmdbId: 474350, mediaType: 'movie', title: 'Suicide Squad: Hell to Pay', year: 2018 },
      { tmdbId: 487532, mediaType: 'movie', title: 'The Death of Superman', year: 2018 },
      { tmdbId: 532321, mediaType: 'movie', title: 'Constantine: City of Demons', year: 2018 },
      { tmdbId: 537056, mediaType: 'movie', title: 'Reign of the Supermen', year: 2019 },
      { tmdbId: 537061, mediaType: 'movie', title: 'Justice League vs. the Fatal Five', year: 2019 },
      { tmdbId: 537059, mediaType: 'movie', title: 'Batman: Hush', year: 2019 },
      { tmdbId: 537058, mediaType: 'movie', title: 'Wonder Woman: Bloodlines', year: 2019 },
      { tmdbId: 618344, mediaType: 'movie', title: 'Superman: Red Son', year: 2020 },
      { tmdbId: 618355, mediaType: 'movie', title: 'Justice League Dark: Apokolips War', year: 2020 },
      { tmdbId: 618342, mediaType: 'movie', title: 'Superman: Man of Tomorrow', year: 2020 },
      { tmdbId: 724089, mediaType: 'movie', title: 'Batman: Soul of the Dragon', year: 2021 },
      { tmdbId: 736747, mediaType: 'movie', title: 'Justice Society: World War II', year: 2021 },
      { tmdbId: 736692, mediaType: 'movie', title: 'Batman: The Long Halloween, Part One', year: 2021 },
      { tmdbId: 736693, mediaType: 'movie', title: 'Batman: The Long Halloween, Part Two', year: 2021 },
      { tmdbId: 846433, mediaType: 'movie', title: 'Injustice', year: 2021 },
      { tmdbId: 846214, mediaType: 'movie', title: 'Catwoman: Hunted', year: 2022 },
      { tmdbId: 966220, mediaType: 'movie', title: 'Green Lantern: Beware My Power', year: 2022 },
      { tmdbId: 886396, mediaType: 'movie', title: 'Batman and Superman: Battle of the Super Sons', year: 2022 },
      { tmdbId: 1003580, mediaType: 'movie', title: 'Legion of Super-Heroes', year: 2023 },
      { tmdbId: 1003579, mediaType: 'movie', title: 'Batman: The Doom That Came to Gotham', year: 2023 },
      { tmdbId: 1003581, mediaType: 'movie', title: 'Justice League: Warworld', year: 2023 },
      { tmdbId: 1155089, mediaType: 'movie', title: 'Justice League: Crisis on Infinite Earths - Part One', year: 2024 },
      { tmdbId: 1209288, mediaType: 'movie', title: 'Justice League: Crisis on Infinite Earths - Part Two', year: 2024 },
      { tmdbId: 1209290, mediaType: 'movie', title: 'Justice League: Crisis on Infinite Earths - Part Three', year: 2024 },
      { tmdbId: 1155058, mediaType: 'movie', title: 'Watchmen Chapter I', year: 2024 },
      { tmdbId: 1299652, mediaType: 'movie', title: 'Watchmen Chapter II', year: 2024 },
    ],
  },
  {
    slug: 'dcamu',
    name: 'DC Animated Movie Universe',
    tag: 'DC · Shared universe',
    description: 'The New 52–inspired shared universe, Flashpoint Paradox through Apokolips War.',
    source: 'https://en.wikipedia.org/wiki/DC_Animated_Movie_Universe',
    kind: 'universe',
    titles: [
      { tmdbId: 183011, mediaType: 'movie', title: 'Justice League: The Flashpoint Paradox', year: 2013 },
      { tmdbId: 256408, mediaType: 'movie', title: 'Justice League: War', year: 2014 },
      { tmdbId: 251519, mediaType: 'movie', title: 'Son of Batman', year: 2014 },
      { tmdbId: 297556, mediaType: 'movie', title: 'Justice League: Throne of Atlantis', year: 2015 },
      { tmdbId: 321528, mediaType: 'movie', title: 'Batman vs. Robin', year: 2015 },
      { tmdbId: 366924, mediaType: 'movie', title: 'Batman: Bad Blood', year: 2016 },
      { tmdbId: 388399, mediaType: 'movie', title: 'Justice League vs. Teen Titans', year: 2016 },
      { tmdbId: 408220, mediaType: 'movie', title: 'Justice League Dark', year: 2017 },
      { tmdbId: 417778, mediaType: 'movie', title: 'Teen Titans: The Judas Contract', year: 2017 },
      { tmdbId: 474350, mediaType: 'movie', title: 'Suicide Squad: Hell to Pay', year: 2018 },
      { tmdbId: 487532, mediaType: 'movie', title: 'The Death of Superman', year: 2018 },
      { tmdbId: 537056, mediaType: 'movie', title: 'Reign of the Supermen', year: 2019 },
      { tmdbId: 532321, mediaType: 'movie', title: 'Constantine: City of Demons', year: 2018 },
      { tmdbId: 537059, mediaType: 'movie', title: 'Batman: Hush', year: 2019 },
      { tmdbId: 537058, mediaType: 'movie', title: 'Wonder Woman: Bloodlines', year: 2019 },
      { tmdbId: 618355, mediaType: 'movie', title: 'Justice League Dark: Apokolips War', year: 2020 },
    ],
  },
  {
    slug: 'dceu',
    name: 'DC Extended Universe',
    tag: 'DC · Live action',
    description: 'DCEU theatrical films in release order, including Zack Snyder’s Justice League.',
    source: 'https://en.wikipedia.org/wiki/DC_Extended_Universe',
    kind: 'universe',
    titles: [
      { tmdbId: 49521, mediaType: 'movie', title: 'Man of Steel', year: 2013 },
      { tmdbId: 209112, mediaType: 'movie', title: 'Batman v Superman: Dawn of Justice', year: 2016 },
      { tmdbId: 297761, mediaType: 'movie', title: 'Suicide Squad', year: 2016 },
      { tmdbId: 297762, mediaType: 'movie', title: 'Wonder Woman', year: 2017 },
      { tmdbId: 141052, mediaType: 'movie', title: 'Justice League', year: 2017 },
      { tmdbId: 297802, mediaType: 'movie', title: 'Aquaman', year: 2018 },
      { tmdbId: 287947, mediaType: 'movie', title: 'Shazam!', year: 2019 },
      { tmdbId: 495764, mediaType: 'movie', title: 'Birds of Prey', year: 2020 },
      { tmdbId: 464052, mediaType: 'movie', title: 'Wonder Woman 1984', year: 2020 },
      { tmdbId: 791373, mediaType: 'movie', title: "Zack Snyder's Justice League", year: 2021 },
      { tmdbId: 436969, mediaType: 'movie', title: 'The Suicide Squad', year: 2021 },
      { tmdbId: 436270, mediaType: 'movie', title: 'Black Adam', year: 2022 },
      { tmdbId: 594767, mediaType: 'movie', title: 'Shazam! Fury of the Gods', year: 2023 },
      { tmdbId: 298618, mediaType: 'movie', title: 'The Flash', year: 2023 },
      { tmdbId: 565770, mediaType: 'movie', title: 'Blue Beetle', year: 2023 },
      { tmdbId: 572802, mediaType: 'movie', title: 'Aquaman and the Lost Kingdom', year: 2023 },
    ],
  },
]

/** Official TMDB movie collections — parts loaded live from TMDB */
export const FEATURED_COLLECTIONS: UniverseCatalogItem[] = [
  {
    slug: 'collection-star-wars',
    name: 'Star Wars',
    tag: 'Franchise',
    description: 'Official Star Wars film collection on TMDB.',
    kind: 'collection',
    tmdbCollectionId: 10,
  },
  {
    slug: 'collection-harry-potter',
    name: 'Harry Potter',
    tag: 'Franchise',
    description: 'The Wizarding World films in release order.',
    kind: 'collection',
    tmdbCollectionId: 1241,
  },
  {
    slug: 'collection-lotr',
    name: 'The Lord of the Rings',
    tag: 'Franchise',
    description: 'Middle-earth theatrical films.',
    kind: 'collection',
    tmdbCollectionId: 119,
  },
  {
    slug: 'collection-fast-furious',
    name: 'Fast & Furious',
    tag: 'Franchise',
    description: 'The Fast Saga collection.',
    kind: 'collection',
    tmdbCollectionId: 9485,
  },
  {
    slug: 'collection-john-wick',
    name: 'John Wick',
    tag: 'Franchise',
    description: 'John Wick films in release order.',
    kind: 'collection',
    tmdbCollectionId: 404609,
  },
  {
    slug: 'collection-mission-impossible',
    name: 'Mission: Impossible',
    tag: 'Franchise',
    description: 'Mission: Impossible film series.',
    kind: 'collection',
    tmdbCollectionId: 87359,
  },
]

export function allUniverses(): UniverseCatalogItem[] {
  return [...CURATED_UNIVERSES, ...FEATURED_COLLECTIONS]
}

export function findUniverse(slug: string) {
  return allUniverses().find(item => item.slug === slug) ?? null
}

export function findUniverseByCollectionId(id: number) {
  return FEATURED_COLLECTIONS.find(item => item.tmdbCollectionId === id) ?? null
}

export function universeSummaries() {
  return allUniverses().map(item => ({
    slug: item.slug,
    name: item.name,
    tag: item.tag,
    description: item.description,
    source: item.source,
    kind: item.kind,
    tmdbCollectionId: item.tmdbCollectionId ?? null,
    count: item.titles?.length ?? null,
    posterPath: item.posterPath ?? null,
  }))
}
