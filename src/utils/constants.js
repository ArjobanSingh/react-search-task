import PropTypes from "prop-types";

export const FIELD_TYPE = {
  ID: "id",
  NAME: "name",
  ITEMS: "items",
  ADDRESS: "address",
  PINCODE: "pincode",
};

export const OptionPropType = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  items: PropTypes.arrayOf(PropTypes.string).isRequired,
  address: PropTypes.string.isRequired,
  pincode: PropTypes.string.isRequired,
};

export const Keys = {
  ArrowUp: "ArrowUp",
  ArrowDown: "ArrowDown",
};
