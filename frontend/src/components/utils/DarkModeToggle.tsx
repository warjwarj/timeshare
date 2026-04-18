import React, { useState, useEffect } from 'react';

const DarkModeToggle: React.FC = () => {
  const [isDark, setIsDark] = useState(false);

  // Check for saved theme preference or default to light mode
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    setIsDark(!isDark);

    if (!isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  return (
    <button
      id="theme-toggle"
      data-tooltip-target="tooltip-toggle"
      type="button"
      onClick={toggleTheme}
      className="
        inline-flex items-center justify-center
        m-1 p-1 h-12
        rounded-xl text-sm font-medium
        bg-light-background dark:bg-dark-background
        text-light-primary-text dark:text-dark-primary-text
        transition duration-200
        hover:bg-dark-background dark:hover:bg-light-background
        hover:text-dark-primary-text dark:hover:text-light-primary-text
      "
      aria-label="Toggle dark mode"
    >
      {/* Moon icon (dark mode) */}
      <svg xmlns="http://www.w3.org/2000/svg" 
        id="theme-toggle-dark-icon"
        className={`${isDark ? 'hidden' : 'block'} w-10 h-10`}
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="1.5" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      >
          <path d="M18 5h4"/><path d="M20 3v4"/><path d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401"/>
      </svg>
      {/* Sun icon (light mode) */}
      <svg
        id="theme-toggle-light-icon"
        className={`${isDark ? 'block' : 'hidden'} w-10 h-10`}
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      >
        <path
          d="M12 5V3m0 18v-2M7.05 7.05 5.636 5.636m12.728 12.728L16.95 16.95M5 12H3m18 0h-2M7.05 16.95l-1.414 1.414M18.364 5.636 16.95 7.05M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z"
        />
      </svg>
    </button>
  );
};

export { DarkModeToggle };