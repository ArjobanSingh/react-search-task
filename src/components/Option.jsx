import { memo, useRef, useLayoutEffect, useMemo } from "react";
import PropTypes from "prop-types";
import Highlighter from "react-highlight-words";

import { FIELD_TYPE, OptionPropType } from "../utils/constants";
import { cn, searchHandlers } from "../utils/helpers";

function Option({ data, idx, searchText, isActive, goToSpecificIdx }) {
  const { id, name, items, address, pincode } = data;
  const optionRef = useRef();

  useLayoutEffect(() => {
    if (isActive) {
      optionRef.current.scrollIntoView?.({
        block: "nearest",
        behavior: "smooth",
      });
    }
  }, [isActive]);

  const itemsIncludesText = useMemo(() => {
    const includesText = searchHandlers[FIELD_TYPE.ITEMS];
    return includesText(items, searchText);
  }, [items, searchText]);

  const handleMouseMove = () => {
    if (isActive) return;
    goToSpecificIdx(idx);
  };

  const handleMouseLeave = () => {
    // This handles when the cursor stays still but the list auto-scrolls due to keyboard navigation,
    // causing the cursor to leave this item, without actually moving.
    if (!isActive) return;
    goToSpecificIdx(-1);
  };

  const searchWords = [searchText];
  return (
    <li
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      ref={optionRef}
      className={cn(
        "flex flex-col gap-2 border-b border-gray-200 px-4 py-2 hover:cursor-pointer",
        {
          "bg-yellow-100": isActive,
        },
      )}
    >
      <div>
        <div className="font-medium">
          <Highlighter searchWords={searchWords} textToHighlight={id} />
        </div>
        <div className="text-sm italic text-gray-600">
          <Highlighter searchWords={searchWords} textToHighlight={name} />
        </div>
      </div>

      {itemsIncludesText && (
        <ul className="list-inside list-disc border-b border-t border-gray-200 py-1 marker:text-sky-400">
          <li className="text-sm text-gray-600">
            {`"${searchText}" found in items`}
          </li>
        </ul>
      )}
      <div>
        <div className="text-sm text-gray-500">
          <Highlighter searchWords={searchWords} textToHighlight={address} />
        </div>
        <div className="text-xs text-gray-500">
          Pin code -{" "}
          <Highlighter searchWords={searchWords} textToHighlight={pincode} />
        </div>
      </div>
    </li>
  );
}

Option.propTypes = {
  data: PropTypes.shape(OptionPropType).isRequired,
  idx: PropTypes.number.isRequired,
  searchText: PropTypes.string.isRequired,
  isActive: PropTypes.bool.isRequired,
  goToSpecificIdx: PropTypes.func.isRequired,
};

const MemoOption = memo(Option);
export default MemoOption;
