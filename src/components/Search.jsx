import { useReducer, useRef, useMemo, useCallback, useEffect } from "react";
import PropTypes from "prop-types";

import { cn, searchHandlers } from "../utils/helpers";
import { Keys, OptionPropType } from "../utils/constants";
import { useDidUpdate } from "../hooks/useDidUpdate";
import Option from "./Option";
import { useDebounceCallback } from "../hooks/useDebounceCallback";

const initialState = {
  searchText: "",
  activeIndex: -1,
  isMouseMovementEnabled: true,
};

const ActionTypes = {
  SET_SEARCH: "SET_SEARCH",
  MOVE_ACTIVE_IDX: "MOVE_ACTIVE_IDX",
  ENABLE_MOUSE_MOVEMENT: "ENABLE_MOUSE_MOVEMENT",
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

    // disable mouse movement on keyboard event
    // will be re-enabled after threshold time
    return {
      ...state,
      activeIndex: newIdx,
      isMouseMovementEnabled: false,
    };
  },
  [ActionTypes.ENABLE_MOUSE_MOVEMENT]: (state) => ({
    ...state,
    isMouseMovementEnabled: true,
  }),
};

function reducer(state, action) {
  const updater = reducers[action.type];
  return updater(state, action);
}

export default function Search({ items }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { searchText, activeIndex, isMouseMovementEnabled } = state;

  const inputRef = useRef();

  // Debounced search update for better performance
  const onSearchChangeDebounced = useDebounceCallback(
    (e) => dispatch({ type: ActionTypes.SET_SEARCH, payload: e.target.value }),
    300,
    [],
  );

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

  const goToIdxWithLessPriority = useCallback(
    (idx) => {
      if (!isMouseMovementEnabled) return;
      goToSpecificIdx(idx);
    },
    [isMouseMovementEnabled, goToSpecificIdx],
  );

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
    if (!searchText.trim()) return [];
    const lowercaseText = searchText.toLowerCase();

    return items.filter((itemObj) =>
      Object.entries(itemObj).some(([fieldKey, fieldValue]) => {
        const includesText = searchHandlers[fieldKey] ?? searchHandlers.default;
        return includesText(fieldValue, lowercaseText);
      }),
    );
  }, [searchText, items]);

  const areOptionsVisible = !!searchText.trim();

  const enableMouseMovement = useDebounceCallback(
    () => dispatch({ type: ActionTypes.ENABLE_MOUSE_MOVEMENT }),
    300,
    [],
  );

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
        // enable once keyboard movement is off for certain time.(using debounce)
        enableMouseMovement();
        break;
      default:
        break;
    }
  };

  return (
    <div className="flex flex-col border border-gray-500 rounded w-80">
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
          <ul className="overflow-y-auto max-h-80">
            {filteredItems.map((item, idx) => (
              <Option
                idx={idx}
                key={item.id}
                data={item}
                searchText={searchText}
                isActive={activeIndex === idx}
                goToIdxWithLessPriority={goToIdxWithLessPriority}
              />
            ))}
          </ul>
        ) : (
          <div className="p-5 text-base text-center">No items</div>
        ))}
    </div>
  );
}

Search.propTypes = {
  items: PropTypes.arrayOf(PropTypes.shape(OptionPropType)).isRequired,
};
