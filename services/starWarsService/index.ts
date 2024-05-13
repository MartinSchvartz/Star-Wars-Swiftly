export async function getCharacters(page: number) {
  try {
    const response = await fetch(
      `${process.env.SWAP_API_BASE_URL}/people?page=${page}`
    );
    const data: ResponseData = await response.json();

    const characters = await createCharactersCardsInfo(data.results);

    return {
      characters: characters,
      count: data.count,
    };
  } catch (error) {
    throw new Error("Failed to fetch Star Wars characters");
  }
}

export async function search(searchTerm: string) {
  try {
    const results = await Promise.all([
      searchByCharacter(searchTerm),
      searchByPlanet(searchTerm),
      searchBySpecies(searchTerm),
    ]);

    const merged = new Map(
      [...results[0], ...results[1], ...results[2]].map((obj) => [
        obj.name,
        obj,
      ])
    );

    return Array.from(merged.values());
  } catch (error) {
    throw new Error("Failed to fetch Star Wars data");
  }
}

const searchByPlanet = async (searchTerm: string) => {
  try {
    const response = await fetch(
      `${process.env.SWAP_API_BASE_URL}/planets/?search=${searchTerm}`
    );
    const data = await response.json();
    while (data.next) {
      const nextPage = await fetch(data.next);
      const nextPageData = await nextPage.json();
      data.results.push(...nextPageData.results);
      data.next = nextPageData.next;
    }
    const planetsWithResidents = await Promise.all(
      data.results.map(fetchResidentsFromPlanet)
    );

    const residents = planetsWithResidents.flat();

    return residents;
  } catch (error) {
    throw new Error("Failed to fetch Star Wars Planets");
  }
};

const searchBySpecies = async (searchTerm: string) => {
  try {
    const response = await fetch(
      `${process.env.SWAP_API_BASE_URL}/species/?search=${searchTerm}`
    );
    const data = await response.json();
    while (data.next) {
      const nextPage = await fetch(data.next);
      const nextPageData = await nextPage.json();
      data.results.push(...nextPageData.results);
      data.next = nextPageData.next;
    }
    const speciesWithCharacters = await Promise.all(
      data.results.map((species: Species) =>
        fetchCharactersFromSpecies(species)
      )
    );

    const characters = speciesWithCharacters.flat();

    return characters;
  } catch (error) {
    throw new Error("Failed to fetch Star Wars Species");
  }
};

const searchByCharacter = async (searchTerm: string) => {
  try {
    const response = await fetch(
      `${process.env.SWAP_API_BASE_URL}/people/?search=${searchTerm}`
    );
    const data = await response.json();
    while (data.next) {
      const nextPage = await fetch(data.next);
      const nextPageData = await nextPage.json();
      data.results.push(...nextPageData.results);
      data.next = nextPageData.next;
    }

    const characterCards = createCharactersCardsInfo(data.results);

    return characterCards;
  } catch (error) {
    throw new Error("Failed to fetch Star Wars characters");
  }
};

const fetchCharactersFromSpecies = async (species: Species) => {
  const charactersPromises = species.people.map(
    async (characterUrl: string) => {
      const response = await fetch(characterUrl);
      const characterData = await response.json();
      const homeworldResponse = await fetch(characterData.homeworld);
      const homeWorldData = await homeworldResponse.json();
      return {
        name: characterData.name,
        homeworld: homeWorldData.name,
        species: [species.name],
      };
    }
  );
  const characters = await Promise.all(charactersPromises);
  return characters;
};

const fetchResidentsFromPlanet = async (planet: Planet) => {
  const residentsPromises = planet.residents.map(
    async (residentUrl: string) => {
      const response = await fetch(residentUrl);
      const residentData = await response.json();

      const speciesPromises = residentData.species.map(
        async (speciesUrl: string) => {
          const speciesResponse = await fetch(speciesUrl);
          const speciesData = await speciesResponse.json();
          return speciesData.name;
        }
      );

      const species = await Promise.all(speciesPromises);

      return {
        name: residentData.name,
        species: species.length > 0 ? species : ["unknown"],
        homeworld: planet.name,
      };
    }
  );

  const residents = await Promise.all(residentsPromises);

  return residents;
};

const getCardInfoFromCharacter = async (character: Character) => {
  const homeWorldResponse = await fetch(character.homeworld);
  const homeworld: Planet = await homeWorldResponse.json();

  const species =
    character.species.length > 0
      ? await getCharacterSpecies(character.species)
      : ["unknown"];

  return {
    name: character.name,
    homeworld: homeworld.name,
    species: species,
  };
};

const createCharactersCardsInfo = async (characters: Character[]) => {
  const charactersCardInfo = await Promise.all(
    characters.map(async (character: Character) => {
      return getCardInfoFromCharacter(character);
    })
  );

  return charactersCardInfo;
};

const getCharacterSpecies = async (speciesUrls: string[]) => {
  const speciesPromises = speciesUrls.map(async (speciesUrl: string) => {
    const speciesResponse = await fetch(speciesUrl);
    const species: Species = await speciesResponse.json();
    return species.name ?? "unknown";
  });

  return Promise.all(speciesPromises);
};
