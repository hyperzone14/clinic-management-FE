import React from 'react';
import { IoSearchOutline } from "react-icons/io5";

interface SearchBarProps {
    value: string;
    onChange: (value: string) => void;
    className?: string;
    placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
    value,
    onChange,
    className = "w-9/12",
    placeholder = "Search..."
}) => (
    <div className="flex items-center justify-center">
        <div className={`mb-6 ${className}`}>
            <div className="flex items-center bg-gray-200 rounded-lg focus-within:ring-2 focus-within:ring-blue-500">
                <IoSearchOutline className="ml-3 text-gray-500" size={20} />
                <input
                    type="text"
                    value={value}
                    placeholder={placeholder}
                    className="w-full pl-3 pr-4 py-2 bg-transparent focus:outline-none text-gray-700"
                    onChange={(e) => onChange(e.target.value)}
                />
            </div>
        </div>
    </div>
);

export default SearchBar;