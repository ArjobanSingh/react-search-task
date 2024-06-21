import { useReducer, useRef, useMemo, useCallback, useEffect } from "react";
import PropTypes from "prop-types";
import debounce from "lodash.debounce";

import { cn, searchHandlers } from "../utils/helpers";
import { Keys, OptionPropType } from "../utils/constants";
import { useDidUpdate } from "../hooks/useDidUpdate";
import Option from "./Option";

const initialState = {
  searchText: "",
  activeIndex: -1,
};

const ActionTypes = {
  SET_SEARCH: "SET_SEARCH",
  MOVE_ACTIVE_IDX: "MOVE_ACTIVE_IDX",
};

const reducers = {
  [ActionTypes.SET_SEARCH]: (state, action) => {
    const { payload } = action;
    // reset active Index on search change
    return {
      ...state,
      activeIndex: -1,
      searchText: payload,
    };
  },
  [ActionTypes.MOVE_ACTIVE_IDX]: (state, action) => {
    const { activeIndex } = state;
    const { specificIdx, itemsSize, key } = action.payload;

    if (specificIdx !== undefined) {
      return { ...state, activeIndex: specificIdx };
    }

    let newIdx;
    switch (key) {
      case Keys.ArrowUp:
        // if at top or selecting nothing start from end of the list
        newIdx = activeIndex <= 0 ? itemsSize - 1 : activeIndex - 1;
        break;
      case Keys.ArrowDown:
        // if at last, navigate to top
        newIdx = (activeIndex + 1) % itemsSize;
        break;
      default:
        break;
    }
    return {
      ...state,
      activeIndex: newIdx,
    };
  },
};

function reducer(state, action) {
  const updater = reducers[action.type];
  return updater(state, action);
}

export default function Search({ items }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { searchText, activeIndex } = state;

  const inputRef = useRef();
  // we just need the search value, and we can keep the search as uncontrolled
  const onSearchChange = useCallback((e) => {
    dispatch({ type: ActionTypes.SET_SEARCH, payload: e.target.value });
  }, []);

  // Debounced search update for better performance
  const onSearchChangeDebounced = debounce(onSearchChange, 300);

  const goToSpecificIdx = useCallback((idx) => {
    dispatch({
      type: ActionTypes.MOVE_ACTIVE_IDX,
      payload: { specificIdx: idx },
    });
  }, []);

  useDidUpdate(() => {
    // on items change, reset the active index
    goToSpecificIdx(-1);
  }, [items, goToSpecificIdx]);

  useEffect(() => {
    // if keyboard is not in focus, focus it and dispatch the keyboard event
    const onDocumentKeydown = (e) => {
      if (document.activeElement === inputRef.current) return;
      inputRef.current.focus?.();
      inputRef.current.dispatchEvent?.(
        new KeyboardEvent("keydown", { key: e.key, bubbles: true }),
      );
    };

    document.addEventListener("keydown", onDocumentKeydown);
    return () => {
      document.removeEventListener("keydown", onDocumentKeydown);
    };
  }, []);

  const filteredItems = useMemo(() => {
    const lowercaseText = searchText.trim().toLowerCase();
    if (!lowercaseText) return [];

    return items.filter((itemObj) =>
      Object.entries(itemObj).some(([fieldKey, fieldValue]) => {
        const includesText = searchHandlers[fieldKey] ?? searchHandlers.default;
        return includesText(fieldValue, lowercaseText);
      }),
    );
  }, [searchText, items]);

  const areOptionsVisible = !!searchText.trim();

  const handleKeyDown = (e) => {
    if (!areOptionsVisible) return;
    switch (e.key) {
      case Keys.ArrowUp:
      case Keys.ArrowDown:
        e.preventDefault();
        dispatch({
          type: ActionTypes.MOVE_ACTIVE_IDX,
          payload: {
            itemsSize: filteredItems.length,
            key: e.key,
          },
        });
        break;
      default:
        break;
    }
  };

  return (
    <div className="flex w-80 flex-col rounded border border-gray-500">
      <input
        autoFocus
        ref={inputRef}
        type="search"
        placeholder="Search"
        onChange={onSearchChangeDebounced}
        onKeyDown={handleKeyDown}
        className={cn("rounded p-2 text-base outline-none", {
          "border-b border-gray-200": areOptionsVisible,
        })}
      />

      {areOptionsVisible &&
        (filteredItems.length ? (
          <ul className="max-h-80 overflow-y-auto">
            {filteredItems.map((item, idx) => (
              <Option
                idx={idx}
                key={item.id}
                data={item}
                searchText={searchText}
                isActive={activeIndex === idx}
                goToSpecificIdx={goToSpecificIdx}
              />
            ))}
          </ul>
        ) : (
          <div className="p-5 text-center text-base">No items</div>
        ))}
    </div>
  );
}

Search.propTypes = {
  items: PropTypes.arrayOf(PropTypes.shape(OptionPropType)).isRequired,
};
