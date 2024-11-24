import * as React from 'react';
import { cn } from '@/lib/utils';

export interface Option {
  value: string;
  label: string;
}

export interface MultiSelectProps {
  options: Option[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  className?: string;
}

export function MultiSelect({ options, value, onChange, className }: MultiSelectProps) {
  return (
    <select
      multiple
      className={cn(
        "w-full rounded-md border border-gray-300 p-2",
        "focus:outline-none focus:ring-2 focus:ring-primary-500",
        className
      )}
      value={value}
      onChange={(e) => {
        const values = Array.from(e.target.selectedOptions, (option) => option.value);
        onChange(values);
      }}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
} 