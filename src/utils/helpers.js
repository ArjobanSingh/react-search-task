import ReactDOMServer from "react-dom/server";
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

const createRegex = ({ text, flags }) => {
  const sanitizedText = text.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1");
  return new RegExp(sanitizedText, flags);
};

// NOTE: Following is a hacky way to find a searched string and converting to
// html string which can be rendered using dangerouslySetInnerHTML.
// Not using this to highlight the text, using the well tested library
const highlightText = (item, keyword, markStyle = {}) => {
  const re = createRegex({ text: keyword || "", flags: "gi" });
  return item.replace(re, (val) =>
    ReactDOMServer.renderToStaticMarkup(<mark style={markStyle}>{val}</mark>),
  );
};
