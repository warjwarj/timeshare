
// componenents
import { XIcon } from './XIcon';

type ModalProps = {
  label: string
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}
const Modal: React.FC<ModalProps> = ({ label, isOpen, onClose, children }) => { // border border-light-border dark:border-dark-border

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50" >
      <div onClick={onClose} className="absolute inset-0 bg-black/40" />
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl bg-white rounded-lg shadow-2xl overflow-y-auto m-2 sm:m-4 bg-light-background dark:bg-dark-background"
      >
        <div className="flex items-center justify-between bg-light-background dark:bg-dark-background">
          <h1 className="text-3xl font-bold pl-3 pt-2 text-light-primary-text dark:text-dark-primary-text">{label}</h1>
          <button
            onClick={onClose}
            aria-label="Close modal"
          >
            <XIcon />
          </button>
        </div>
        <div className="p-4 sm:p-8" >
          {children}
        </div>
      </div>
    </div>
  );
};

export { Modal }