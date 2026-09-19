const periods = ['day', 'week', 'month', 'year'];

const TimePeriodSelector = ({ value, onChange }) => {
  return (
    <div className="inline-flex bg-surface-container-high rounded-full p-1">
      {periods.map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={`px-4 py-1.5 rounded-full text-label-md font-label-md capitalize transition-colors ${
            value === p
              ? 'bg-surface-container-lowest text-on-surface shadow-sm font-semibold'
              : 'text-secondary hover:text-on-surface'
          }`}
        >
          {p}
        </button>
      ))}
    </div>
  );
};

export default TimePeriodSelector;