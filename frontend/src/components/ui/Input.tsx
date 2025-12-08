import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {label} {props.required && <span className="text-red-500">*</span>}
          </label>
        )}
        <input
          ref={ref}
          className={`
            w-full px-4 py-3 text-sm border rounded-xl 
            focus:ring-2 focus:ring-gray-900 focus:border-transparent
            disabled:bg-gray-50 disabled:cursor-not-allowed
            transition-all duration-200
            placeholder:text-gray-400
            ${error ? 'border-red-500' : 'border-gray-200 hover:border-gray-300'}
            ${className}
          `}
          {...props}
        />
        {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
        {helperText && !error && <p className="mt-2 text-xs text-gray-500">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
