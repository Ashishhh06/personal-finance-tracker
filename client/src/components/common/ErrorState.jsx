const ErrorState = ({ message = 'Something went wrong. Please check your connection and try again.', onRetry }) => {
  return (
    <div className="text-center py-xl px-sm">
      <span className="material-symbols-outlined text-[48px] text-error mb-sm block">error</span>
      <p className="mb-md text-body-md font-body-md text-error font-medium">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-md py-sm bg-error text-on-error rounded-lg text-label-md font-label-md hover:bg-error/90 transition-colors"
        >
          Retry
        </button>
      )}
    </div>
  );
};

export default ErrorState;