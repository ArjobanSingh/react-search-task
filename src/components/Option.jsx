import { memo, useRef, useLayoutEffect } from "react";
import PropTypes from "prop-types";

import { FIELD_TYPE, OptionPropType } from "../utils/constants";
import { cn, searchHandlers } from "../utils/helpers";

// TODO: highlight logic
function Option({ data, idx, searchText, isActive, goToSpecificIdx }) {
  const { id, name, items, address } = data;
  const optionRef = useRef();

  useLayoutEffect(() => {
    if (isActive) {
      optionRef.current.scrollIntoView?.({
        block: "nearest",
        behavior: "smooth",
      });
    }
  }, [isActive]);

  const itemsIncludesText = searchHandlers[FIELD_TYPE.ITEMS];

  const handleMouseMove = () => {
    if (isActive) return;
    goToSpecificIdx(idx);
  };

  const handleMouseLeave = () => {
    // Occurs when the cursor stays still but the list auto-scrolls due to keyboard navigation,
    // causing the cursor to leave this item, without actually moving.
    if (!isActive) return;
    goToSpecificIdx(-1);
  };

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
        <div className="font-medium">{id}</div>
        <div className="text-sm italic text-gray-600">{name}</div>
      </div>

      {itemsIncludesText(items, searchText) && (
        <ul className="list-inside list-disc border-b border-t border-gray-200 py-1 marker:text-sky-400">
          <li className="text-sm text-gray-600">
            {`"${searchText}" found in items`}
          </li>
        </ul>
      )}
      <div className="text-sm text-gray-500">{address}</div>
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
