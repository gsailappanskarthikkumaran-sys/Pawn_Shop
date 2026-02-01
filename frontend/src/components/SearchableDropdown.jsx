import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown, Check, X } from 'lucide-react';
import './SearchableDropdown.css';

const SearchableDropdown = ({ options, value, onChange, placeholder = "Select...", labelKey = "label", valueKey = "value" }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredOptions, setFilteredOptions] = useState([]);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);

    const dropdownRef = useRef(null);
    const inputRef = useRef(null);

    // Sync search term with selected value label when not open
    useEffect(() => {
        const selectedOption = options.find(opt => opt[valueKey] === value);
        if (selectedOption && !isOpen) {
            setSearchTerm(selectedOption[labelKey]);
        } else if (!value && !isOpen) {
            setSearchTerm('');
        }
    }, [value, options, isOpen, labelKey, valueKey]);

    // Handle filtering
    useEffect(() => {
        if (!isOpen) return;

        const filtered = options.filter(opt =>
            opt[labelKey].toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredOptions(filtered.slice(0, 50)); // Limit display for performance, but search covers all
        setHighlightedIndex(0);
    }, [searchTerm, options, isOpen, labelKey]);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (option) => {
        onChange(option[valueKey]);
        setSearchTerm(option[labelKey]);
        setIsOpen(false);
    };

    const handleKeyDown = (e) => {
        if (!isOpen) {
            if (e.key === 'ArrowDown' || e.key === 'Enter') setIsOpen(true);
            return;
        }

        switch (e.key) {
            case 'ArrowDown':
                setHighlightedIndex(prev => Math.min(prev + 1, filteredOptions.length - 1));
                break;
            case 'ArrowUp':
                setHighlightedIndex(prev => Math.max(prev - 1, 0));
                break;
            case 'Enter':
                if (filteredOptions[highlightedIndex]) {
                    handleSelect(filteredOptions[highlightedIndex]);
                }
                break;
            case 'Escape':
                setIsOpen(false);
                break;
            default:
                break;
        }
    };

    const handleInputClick = () => {
        setIsOpen(true);
        setSearchTerm(''); // Clear on click to show all options
    };

    return (
        <div className="searchable-dropdown-container" ref={dropdownRef}>
            <div className={`dropdown-input-wrapper ${isOpen ? 'is-open' : ''}`}>
                <div className="search-icon"><Search size={16} /></div>
                <input
                    ref={inputRef}
                    type="text"
                    className="dropdown-search-input"
                    placeholder={placeholder}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onClick={handleInputClick}
                    onKeyDown={handleKeyDown}
                />
                <div className="chevron-icon" onClick={() => setIsOpen(!isOpen)}>
                    <ChevronDown size={18} className={isOpen ? 'rotate-180' : ''} />
                </div>
            </div>

            {isOpen && (
                <div className="dropdown-menu">
                    {filteredOptions.length > 0 ? (
                        filteredOptions.map((option, index) => (
                            <div
                                key={option[valueKey]}
                                className={`dropdown-item ${index === highlightedIndex ? 'is-highlighted' : ''} ${option[valueKey] === value ? 'is-selected' : ''}`}
                                onClick={() => handleSelect(option)}
                                onMouseEnter={() => setHighlightedIndex(index)}
                            >
                                <span className="item-label">{option[labelKey]}</span>
                                {option[valueKey] === value && <Check size={14} className="check-icon" />}
                            </div>
                        ))
                    ) : (
                        <div className="dropdown-no-results">No customers found</div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SearchableDropdown;
