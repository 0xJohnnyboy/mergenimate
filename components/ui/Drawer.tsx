import React, { PropsWithChildren } from 'react';
import { CloseIcon } from './Icons';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: React.ReactNode;
}

export const Drawer: React.FC<PropsWithChildren<DrawerProps>> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40" aria-labelledby="slide-over-title" role="dialog" aria-modal="true">
      <div
        className="absolute inset-0 bg-gray-900 bg-opacity-75 transition-opacity"
        onClick={onClose}
      ></div>
      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10 z-50">
        <div className="transform transition ease-in-out duration-300 translate-x-0 w-screen max-w-md">
          <div className="flex h-full flex-col overflow-y-scroll bg-gray-800 border-l border-gray-700 shadow-xl p-6">
            <div className="flex items-start justify-between">
              <h2 className="text-xl font-bold text-white flex items-center gap-2" id="slide-over-title">
                {title}
              </h2>
              <button
                type="button"
                className="p-1 rounded-full text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
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
