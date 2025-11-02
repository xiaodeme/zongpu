import React, { ReactNode } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        default: 'bg-indigo-600 hover:bg-indigo-700 text-white focus-visible:ring-indigo-500 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-900',
        ghost: 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-900 dark:text-white focus-visible:ring-gray-900 dark:focus-visible:ring-gray-50',
        destructive: 'bg-red-600 hover:bg-red-700 text-white focus-visible:ring-red-500 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-900',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 px-3 text-xs',
        lg: 'h-11 px-8 text-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  children: ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant,
  size,
  asChild = false,
  ...props
}) => {
  const Comp = asChild ? Slot : 'button';
  return (
    <Comp
      className={buttonVariants({ variant, size, className })}
      {...props}
    >
      {children}
    </Comp>
  );
};

export default Button;