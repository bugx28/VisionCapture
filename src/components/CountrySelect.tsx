import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { COUNTRIES, CountryData } from '../utils/countries';

interface CountrySelectProps {
  value: string; // The country code (e.g., 'US')
  onChange: (value: string) => void;
  error?: boolean;
}

export default function CountrySelect({ value, onChange, error }: CountrySelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Initialize search with selected country name if value exists
  useEffect(() => {
    const selectedCountry = COUNTRIES.find(c => c.code === value);
    if (selectedCountry && !isOpen) {
      setSearch(selectedCountry.name);
    }
  }, [value, isOpen]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        const selectedCountry = COUNTRIES.find(c => c.code === value);
        if (selectedCountry) setSearch(selectedCountry.name);
        else setSearch('');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [value]);

  const filteredCountries = useMemo(() => {
    if (!isOpen) return COUNTRIES;
    return COUNTRIES.filter(country => 
      country.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, isOpen]);

  return (
    <div ref={wrapperRef} className="relative">
      <div 
        className={`flex items-center w-full bg-white border ${error ? 'border-red-500' : 'border-slate-300'} rounded-xl px-4 py-3 text-slate-900 focus-within:border-slate-400 focus-within:ring-1 focus-within:ring-slate-400 transition-colors backdrop-blur-sm cursor-text`}
        onClick={() => setIsOpen(true)}
      >
        {isOpen && <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />}
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setIsOpen(true);
            onChange(''); // Clear actual value on typing to enforce selection
          }}
          onFocus={() => {
            setIsOpen(true);
            setSearch(''); // Clear to show all options
          }}
          className="w-full bg-transparent outline-none placeholder:text-slate-400"
          placeholder="Search country..."
        />
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl max-h-60 overflow-auto">
          {filteredCountries.length === 0 ? (
            <div className="p-4 text-sm text-slate-500 text-center">No countries found</div>
          ) : (
            filteredCountries.map((country: CountryData) => (
              <div
                key={country.code}
                onClick={() => {
                  onChange(country.code);
                  setSearch(country.name);
                  setIsOpen(false);
                }}
                className={`px-4 py-3 text-sm cursor-pointer flex justify-between items-center hover:bg-slate-50 transition-colors ${value === country.code ? 'bg-slate-100 font-bold text-slate-900' : 'text-slate-700'}`}
              >
                <span>{country.name}</span>
                <span className="text-slate-400 font-medium text-xs">{country.dial_code}</span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
