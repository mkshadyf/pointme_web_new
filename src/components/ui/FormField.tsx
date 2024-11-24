import { Input, InputProps } from './Input';

interface FormFieldProps extends InputProps {
  label: string;
}

export function FormField({ label, ...props }: FormFieldProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <Input {...props} />
    </div>
  );
} 