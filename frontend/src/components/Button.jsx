import clsx from 'clsx';

export default function Button({ variant = 'primary', className, children, ...props }) {
  return (
    <button
      className={clsx(variant === 'primary' ? 'btn-primary' : 'btn-secondary', className)}
      {...props}
    >
      {children}
    </button>
  );
}
