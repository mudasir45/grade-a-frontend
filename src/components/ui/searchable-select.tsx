import { cn } from "@/lib/utils";
import React, { useMemo, useState } from "react";
import { Label } from "./label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";
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
  searchPlaceholder?: string;
  className?: string;
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({
  label,
  options,
  value,
  onChange,
  placeholder = "Select an option",
  searchPlaceholder = "Search...",
  className,
}) => {
  const [search, setSearch] = useState("");

  // Filter options based on the search text
  const filteredOptions = useMemo(() => {
    if (!search) return options;
    return options.filter((option) =>
      option.label.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, options]);

  return (
    <div className={cn("space-y-2", className)}>
      {label && <Label htmlFor="searchable-select">{label}</Label>}
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {/* Search input within dropdown */}
          <div className="p-2">
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-2 py-1 border rounded"
            />
          </div>
          {filteredOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default SearchableSelect;
