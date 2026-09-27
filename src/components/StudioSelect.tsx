import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface StudioSelectOption {
  value: string;
  label: string;
  sublabel?: string;
  badge?: string;
}

interface StudioSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: StudioSelectOption[];
  placeholder?: string;
  className?: string;
  buttonClassName?: string;
  dropdownClassName?: string;
  size?: 'sm' | 'md' | 'lg';
  mono?: boolean;
  disabled?: boolean;
}

export const StudioSelect: React.FC<StudioSelectProps> = ({
  value,
  onChange,
  options,
  placeholder = 'Sélectionner...',
  className = '',
  buttonClassName = '',
  dropdownClassName = '',
  size = 'md',
  mono = false,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const selectedOption = options.find(o => o.value === value);

  // Size styling
  const sizeStyles = {
    sm: 'py-1.5 px-3 text-xs',
    md: 'py-2.5 px-3.5 text-xs',
    lg: 'py-3 px-4 text-sm font-medium',
  };

  return (
    <div ref={containerRef} className={`relative inline-block w-full text-left select-none ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between gap-2.5 rounded-xl border border-neutral-200 transition-all shadow-xs ${
          disabled
            ? 'opacity-50 cursor-not-allowed bg-neutral-100 text-neutral-400'
            : 'bg-neutral-50 hover:bg-white focus:bg-white focus:border-neutral-950 focus:outline-none cursor-pointer'
        } ${
          isOpen ? 'border-neutral-950 ring-1 ring-neutral-950/15 bg-white' : ''
        } ${sizeStyles[size]} ${mono ? 'font-mono-code' : ''} ${buttonClassName}`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className={`truncate font-medium ${disabled ? 'text-neutral-400' : 'text-neutral-900'}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          className={`w-4 h-4 shrink-0 transition-transform duration-200 ${
            disabled ? 'text-neutral-300' : 'text-neutral-500'
          } ${
            isOpen ? 'rotate-180 text-neutral-950' : ''
          }`}
        />
      </button>

      {/* Dropdown Options List Menu */}
      {isOpen && (
        <div
          className={`absolute left-0 right-0 mt-1.5 z-50 rounded-2xl border border-neutral-200 bg-white/95 backdrop-blur-md shadow-xl p-1.5 max-h-64 overflow-y-auto animate-in fade-in zoom-in-95 duration-150 ${dropdownClassName}`}
          role="listbox"
        >
          {options.map(option => {
            const isSelected = option.value === value;
            return (
              <div
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`group flex items-center justify-between gap-3 px-3 py-2 rounded-xl cursor-pointer transition-all text-xs ${
                  isSelected
                    ? 'bg-neutral-950 text-white font-semibold shadow-xs'
                    : 'text-neutral-800 hover:bg-neutral-100 hover:text-neutral-950'
                } ${mono ? 'font-mono-code' : ''}`}
                role="option"
                aria-selected={isSelected}
              >
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="truncate">{option.label}</span>
                    {option.badge && (
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded font-mono-code ${
                          isSelected
                            ? 'bg-neutral-800 text-neutral-200'
                            : 'bg-neutral-100 text-neutral-600'
                        }`}
                      >
                        {option.badge}
                      </span>
                    )}
                  </div>
                  {option.sublabel && (
                    <span
                      className={`text-[10px] mt-0.5 truncate ${
                        isSelected ? 'text-neutral-300' : 'text-neutral-400 font-mono-code'
                      }`}
                    >
                      {option.sublabel}
                    </span>
                  )}
                </div>

                {isSelected && (
                  <Check className="w-3.5 h-3.5 text-white shrink-0 ml-2" />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
