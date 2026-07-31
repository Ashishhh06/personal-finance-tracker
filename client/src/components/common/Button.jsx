const Button = ({ children, onClick, type = 'button', variant = 'primary', disabled = false, style = {} }) => {
  const variants = {
    primary: { background: '#4f46e5', color: '#fff' },
    danger: { background: '#dc2626', color: '#fff' },
    secondary: { background: '#e5e7eb', color: '#111' },
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: '0.6rem 1.2rem',
        border: 'none',
        borderRadius: '6px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        fontWeight: 500,
        ...variants[variant],
        ...style,
      }}
    >
      {children}
    </button>
  );
};

export default Button;