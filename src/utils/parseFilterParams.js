const parseFavourite = (isFavourite) => {
    if (typeof isFavourite === 'string') {
      if (isFavourite.toLowerCase() === 'true') return true;
      if (isFavourite.toLowerCase() === 'false') return false;
    }
    return undefined;
  };
  
  export const parseFilterParams = (query) => {
    const { isFavourite } = query;
    const parsedIsFavourite = parseFavourite(isFavourite);
    return { isFavourite: parsedIsFavourite };
  };