import { FIELD_TYPE } from "./constants";

export const searchHandlers = {
  default: (value, searchText) => value.toLowerCase().includes(searchText),
  [FIELD_TYPE.ITEMS]: (valueItems, searchText) =>
    valueItems.some((item) => item.toLowerCase().includes(searchText)),
};
