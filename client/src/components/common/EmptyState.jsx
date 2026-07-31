const EmptyState = ({ message = 'Nothing here yet.', actionLabel, onAction }) => {
  return (
    <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#6b7280' }}>
      <p style={{ marginBottom: '1rem' }}>{message}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          style={{
            padding: '0.5rem 1rem',
            background: '#4f46e5',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
          }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;