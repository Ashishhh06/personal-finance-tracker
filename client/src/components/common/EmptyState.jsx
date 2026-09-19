const EmptyState = ({ message = 'Nothing here yet.', actionLabel, onAction }) => {
  return (
    <div className="text-center py-xl px-sm text-secondary">
      <span className="material-symbols-outlined text-[48px] text-outline-variant mb-sm block">inbox</span>
      <p className="mb-md text-body-md font-body-md">{message}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-md py-sm bg-primary-container text-on-primary rounded-lg text-label-md font-label-md hover:bg-primary transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;