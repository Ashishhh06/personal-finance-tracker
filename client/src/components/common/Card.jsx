const Card = ({ children, className = '' }) => {
  return (
    <div className={`bg-surface-container-lowest rounded-xl p-md card-shadow border border-surface-variant/30 ${className}`}>
      {children}
    </div>
  );
};

export default Card;