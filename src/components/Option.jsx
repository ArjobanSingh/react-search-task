import PropTypes from "prop-types";
import { OptionPropType } from "../utils/constants";

export default function Option({ data, idx, searchText }) {
  return <div>option</div>;
}

Option.propTypes = {
  data: PropTypes.shape(OptionPropType).isRequired,
  idx: PropTypes.number.isRequired,
  searchText: PropTypes.string.isRequired,
};
