import { renderToStaticMarkup } from "react-dom/server";
import { createRegex } from "./helpers";

// NOTE: Following is a hacky way to find a searched string and converting to
// html string which can be rendered using dangerouslySetInnerHTML.
// Not using this to highlight the text, using the well tested library
const highlightText = (item, keyword, markStyle = {}) => {
  const re = createRegex({ text: keyword || "", flags: "gi" });
  return item.replace(re, (val) =>
    renderToStaticMarkup(<mark style={markStyle}>{val}</mark>),
  );
};
