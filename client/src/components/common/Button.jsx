const Button = ({ children, onClick, type = 'button', variant = 'primary', disabled = false, className = '' }) => {
  const variants = {
    primary: 'bg-primary-container text-on-primary hover:bg-primary shadow-sm',
    danger: 'bg-error text-on-error hover:bg-error/90 shadow-sm',
    secondary: 'bg-surface-container text-on-surface hover:bg-surface-container-high',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`h-[44px] px-md rounded-lg font-label-md text-label-md flex items-center gap-1 transition-colors ${
        disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
      } ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;