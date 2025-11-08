type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}
const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div onClick={onClose} className="absolute inset-0 bg-black/40" />
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl max-h-[calc(100vh-2rem)] bg-white rounded-lg shadow-2xl overflow-y-auto m-2 sm:m-4"
        style={{ maxHeight: 'calc(100vh - 2rem)' }}
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 p-2 rounded-full hover:bg-gray-100 transition-colors sm:top-4 sm:right-4"
          aria-label="Close modal"
        >
          Close
        </button>

        <div className="p-4 sm:p-8">
          {children}
        </div>
      </div>
    </div>
  );
};

export { Modal }