const ErrorState = ({ message = "Something went wrong. Please check your connection and try again.", onRetry }) => {
  return (
    <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#dc2626' }}>
      <p style={{ marginBottom: '1rem', fontWeight: 500 }}>⚠ {message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          style={{
            padding: '0.5rem 1rem',
            background: '#dc2626',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
          }}
        >
          Retry
        </button>
      )}
    </div>
  );
};

export default ErrorState;