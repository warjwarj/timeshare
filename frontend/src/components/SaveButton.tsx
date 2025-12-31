import React from 'react';

interface ButtonProps {
  onClick: () => void;
  children: React.ReactNode;
}

const SaveButton: React.FC<ButtonProps> = ({ onClick, children }) => {
  return (
    <div className="flex justify-end">
      <button
        className="
          font-bold py-2 px-4 rounded 
          bg-light-background 
          dark:bg-dark-background
          text-light-primary-text
          border-light-border
          dark:border-dark-border
          dark:text-dark-primary-text
          hover:bg-dark-background 
          hover:text-dark-primary-text 
          dark:hover:bg-light-background
          dark:hover:text-light-primary-text
          transition-colors
        "
        onClick={onClick}
      >
        {children}
      </button>
    </div>
  );
};

export { SaveButton }