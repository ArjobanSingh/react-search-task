import { useReducer, useMemo, useCallback } from "react";
import PropTypes from "prop-types";
import debounce from "lodash.debounce";

import { searchHandlers } from "../utils/helpers";
import Option from "./Option";
import { OptionPropType } from "../utils/constants";

const initialState = {
  searchText: "",
  activeIndex: -1,
};

const ActionTypes = {
  SET_SEARCH: "SET_SEARCH",
  SET_ACTIVE_INDEX: "SET_ACTIVE_INDEX",
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
  [ActionTypes.SET_ACTIVE_INDEX]: (state, action) => {},
};

function reducer(state, action) {
  const updater = reducers[action.type];
  return updater(state, action);
}

export default function Search({ items }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { searchText } = state;

  // we just need the search value, and we can keep the search as uncontrolled
  const onSearchChange = useCallback((e) => {
    dispatch({ type: ActionTypes.SET_SEARCH, payload: e.target.value });
  }, []);

  // Debounced search update for better performance
  const onSearchChangeDebounced = debounce(onSearchChange, 300);

  const filteredItems = useMemo(() => {
    const lowercaseText = searchText.trim().toLowerCase();
    if (!lowercaseText) return [];

    return items.filter((itemObj) => {
      return Object.entries(itemObj).some(([fieldKey, fieldValue]) => {
        const includesText = searchHandlers[fieldKey] ?? searchHandlers.default;
        return includesText(fieldValue, lowercaseText);
      });
    });
  }, [searchText, items]);

  const trimmedSearchText = searchText.trim();

  return (
    <div className="flex w-80 flex-col rounded border border-gray-500">
      <input
        type="search"
        placeholder="Search"
        onChange={onSearchChangeDebounced}
        className="rounded p-2 text-base outline-none"
      />

      {!!trimmedSearchText &&
        (filteredItems ? (
          filteredItems.map((item, idx) => (
            <Option
              idx={idx}
              key={item.id}
              data={item}
              searchText={searchText}
            />
          ))
        ) : (
          <div>No items</div>
        ))}
    </div>
  );
}

Search.propTypes = {
  items: PropTypes.arrayOf(PropTypes.shape(OptionPropType)).isRequired,
};
