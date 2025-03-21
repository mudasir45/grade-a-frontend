import React from "react";
import ReactSelect from "react-select";

export interface Option {
  id?: string;
  value: string;
  label: string;
}

export interface SearchableSelectProps {
  label?: string;
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({
  label,
  options,
  value,
  onChange,
  placeholder = "Select an option",
  className,
}) => {
  // Convert the passed string value to the corresponding option object
  const selectedOption =
    options.find((option) => option.value === value) || null;

  // Handle the selection change by extracting the new string value
  const handleChange = (option: Option | null) => {
    onChange(option ? option.value : "");
  };

  return (
    <div className={className}>
      {label && (
        <label className="mb-1 block font-medium text-gray-700">{label}</label>
      )}
      <ReactSelect
        options={options}
        value={selectedOption}
        onChange={handleChange}
        placeholder={placeholder}
        isClearable
      />
    </div>
  );
};

export default SearchableSelect;
