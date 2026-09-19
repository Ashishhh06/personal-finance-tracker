const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-margin-mobile"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-surface-container-lowest rounded-xl p-md w-full max-w-[520px] max-h-[85vh] overflow-y-auto card-shadow"
      >
        <div className="flex justify-between items-center mb-md">
          <h3 className="text-headline-md font-headline-md text-on-surface">{title}</h3>
          <button
            onClick={onClose}
            className="text-secondary hover:text-on-surface transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

export default Modal;