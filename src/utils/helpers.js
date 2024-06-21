import { FIELD_TYPE } from "./constants";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const searchHandlers = {
  default: (value, searchText) => value.toLowerCase().includes(searchText),
  [FIELD_TYPE.ITEMS]: (valueItems, searchText) =>
    valueItems.some((item) => item.toLowerCase().includes(searchText)),
};
