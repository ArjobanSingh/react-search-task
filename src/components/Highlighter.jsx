import { Fragment, memo } from "react";
import PropTypes from "prop-types";
import { escapeRegexFn } from "../utils/helpers";

function Highlighter(props) {
  const { textToHighlight, searchText } = props;

  if (!searchText) return textToHighlight;

  // Escaping the regex special characters and using (capture group) to
  // keep the searched keyword as part of a split string
  const regex = new RegExp(`(${escapeRegexFn(searchText)})`, "gi");
  const parts = textToHighlight.split(regex);

  return (
    <span>
      {parts.map((part, idx) =>
        regex.test(part) ? (
          <mark key={idx}>{part}</mark>
        ) : (
          <Fragment key={idx}>{part}</Fragment>
        ),
      )}
    </span>
  );
}

Highlighter.propTypes = {
  textToHighlight: PropTypes.string.isRequired,
  searchText: PropTypes.string.isRequired,
};

const MemoHighlighter = memo(Highlighter);
export default MemoHighlighter;
