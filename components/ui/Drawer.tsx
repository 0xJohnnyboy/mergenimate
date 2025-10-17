import { PropsWithChildren } from 'react';
import { CloseIcon } from './Icons';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: React.ReactNode;
}

export const Drawer: React.FC<PropsWithChildren<DrawerProps>> = ({ isOpen, onClose, title, children }) => {
  return (
    <div
      className={`fixed inset-0 z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      aria-labelledby="slide-over-title"
      role="dialog"
      aria-modal="true"
      aria-hidden={!isOpen}
    >
      <div
        className="absolute inset-0 backdrop-blur-sm"
        onClick={onClose}
      >
        <div className="absolute inset-0 bg-base-content opacity-30"></div>
      </div>
      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10 z-50">
        <div className={`transform transition-transform ease-in-out duration-300 w-screen max-w-md ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="flex h-full flex-col overflow-y-scroll bg-base-200 border-l border-base-300 shadow-xl p-6">
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2" id="slide-over-title">
                {title}
              </h2>
              <button
                type="button"
                className="p-2 rounded-full hover:bg-base-300 transition-colors"
                onClick={onClose}
              >
                <span className="sr-only">Close panel</span>
                <CloseIcon className="h-6 w-6" />
              </button>
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
