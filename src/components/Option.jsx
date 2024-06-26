import { memo, useRef, useLayoutEffect, useMemo } from "react";
import PropTypes from "prop-types";

import Highlighter from "./Highlighter";
import { FIELD_TYPE, OptionPropType } from "../utils/constants";
import { cn, searchHandlers } from "../utils/helpers";

function Option({ data, idx, searchText, isActive, goToIdxWithLessPriority }) {
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
    goToIdxWithLessPriority(idx);
  };

  const handleMouseLeave = () => {
    // This handles when the cursor stays still but the list auto-scrolls due to keyboard navigation,
    // causing the cursor to leave this item, without actually moving.
    if (!isActive) return;
    goToIdxWithLessPriority(-1);
  };

  return (
    <li
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      ref={optionRef}
      className={cn(
        "flex cursor-pointer flex-col gap-2 border-b border-gray-200 px-4 py-2",
        {
          "bg-yellow-100": isActive,
        },
      )}
    >
      <div>
        <div className="font-medium">
          <Highlighter searchText={searchText} textToHighlight={id} />
        </div>
        <div className="text-sm italic text-gray-600">
          <Highlighter searchText={searchText} textToHighlight={name} />
        </div>
      </div>

      {itemsIncludesText && (
        <ul className="py-1 list-disc list-inside border-t border-b border-gray-200 marker:text-sky-400">
          <li className="text-sm text-gray-600">
            {`"${searchText}" found in items`}
          </li>
        </ul>
      )}
      <div>
        <div className="text-sm text-gray-500">
          <Highlighter searchText={searchText} textToHighlight={address} />
        </div>
        <div className="text-xs text-gray-500">
          Pin code -{" "}
          <Highlighter searchText={searchText} textToHighlight={pincode} />
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
  goToIdxWithLessPriority: PropTypes.func.isRequired,
};

const MemoOption = memo(Option);
export default MemoOption;
