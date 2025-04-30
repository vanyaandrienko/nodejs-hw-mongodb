import { sortList } from "../constants/index.js";

export const parseSortParams = ({ sortBy, sortOrder }, sortFields) => {
    const parseSortOrder = sortList.includes(sortOrder) ? sortOrder : sortList[0];
    const parseSortBy = sortFields.includes(sortBy) ? sortBy : "_id";

    return {
        sortBy: parseSortBy,
        sortOrder: parseSortOrder,
    }
}