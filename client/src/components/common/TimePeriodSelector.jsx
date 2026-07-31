const periods = ['day', 'week', 'month', 'year'];

const TimePeriodSelector = ({ value, onChange }) => {
  return (
    <div style={{ display: 'inline-flex', background: '#e5e7eb', borderRadius: '8px', padding: '4px' }}>
      {periods.map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          style={{
            padding: '0.4rem 1rem',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            textTransform: 'capitalize',
            fontWeight: value === p ? 600 : 400,
            background: value === p ? '#4f46e5' : 'transparent',
            color: value === p ? '#fff' : '#374151',
          }}
        >
          {p}
        </button>
      ))}
    </div>
  );
};

export default TimePeriodSelector;