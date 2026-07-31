const Card = ({ children, style = {} }) => {
  return (
    <div
      style={{
        background: '#fff',
        borderRadius: '10px',
        padding: '1.5rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export default Card;