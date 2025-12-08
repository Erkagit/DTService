import { ReactNode, ButtonHTMLAttributes } from 'react';
import { LucideIcon } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
  fullWidth?: boolean;
}

const variantClasses = {
  primary: 'bg-gray-900 text-white hover:bg-gray-800 shadow-lg hover:shadow-xl',
  secondary: 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 shadow-sm hover:shadow-md',
  danger: 'bg-red-600 text-white hover:bg-red-700 shadow-lg hover:shadow-xl',
  success: 'bg-green-600 text-white hover:bg-green-700 shadow-lg hover:shadow-xl',
  ghost: 'bg-transparent text-gray-700 hover:bg-gray-100',
};

const sizeClasses = {
  sm: 'px-3 sm:px-4 py-2 text-xs sm:text-sm',
  md: 'px-4 sm:px-5 py-2.5 text-sm sm:text-base',
  lg: 'px-5 sm:px-7 py-3 text-base sm:text-lg',
};

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  fullWidth,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`
        flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${fullWidth ? 'w-full' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed shadow-none' : 'active:scale-[0.98]'}
        ${className}
      `}
      disabled={disabled}
      {...props}
    >
      {Icon && <Icon className="w-5 h-5" />}
      {children}
    </button>
  );
}
