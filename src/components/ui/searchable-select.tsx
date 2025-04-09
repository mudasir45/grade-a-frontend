import React, { useEffect } from "react";
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
  const stringValue = value ? String(value) : "";
  const selectedOption =
    options.find((option) => String(option.value) === stringValue) || null;

  // Log for debugging
  useEffect(() => {
    if (value && !selectedOption) {
      console.log(
        `SearchableSelect: No match found for value "${value}" in ${options.length} options`
      );
      console.log(
        `Available values: ${options.map((o) => o.value).join(", ")}`
      );
    }
  }, [value, options, selectedOption]);

  // Handle the selection change by extracting the new string value
  const handleChange = (option: Option | null) => {
    onChange(option ? option.value : "");
  };

  // Custom styles to fix the red highlighting issue
  const customStyles = {
    control: (base: any) => ({
      ...base,
      background: "white",
      borderColor: "#e2e8f0",
      boxShadow: "none",
      "&:hover": {
        borderColor: "#cbd5e1",
      },
    }),
    input: (base: any) => ({
      ...base,
      color: "#1f2937",
      background: "transparent",
      padding: "0",
      margin: "0",
      // Remove any red background
      "& input": {
        background: "transparent !important",
        outline: "none !important",
        boxShadow: "none !important",
        border: "none !important",
      },
    }),
    placeholder: (base: any) => ({
      ...base,
      color: "#9ca3af",
    }),
    option: (base: any, state: any) => ({
      ...base,
      backgroundColor: state.isFocused ? "#f1f5f9" : "white",
      color: "#1f2937",
      "&:hover": {
        backgroundColor: "#f1f5f9",
      },
    }),
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
        styles={customStyles}
        noOptionsMessage={() => "No options found"}
        classNamePrefix="react-select"
      />
    </div>
  );
};

export default SearchableSelect;
