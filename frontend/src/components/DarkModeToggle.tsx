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
      className="inline-flex items-center justify-center ml-1 mt-1 px-3 py-1 h-[3rem] rounded-xl text-sm font-medium text-body text-primary-600 dark:text-primary-400 transition duration-200 hover:text-heading hover:text-primary-700 dark:hover:text-primary-200 hover:bg-neutral-secondary-soft hover:bg-primary-100 dark:hover:bg-primary-600 "
      aria-label="Toggle dark mode"
    >
      {/* Moon icon (dark mode) */}
      <svg
        id="theme-toggle-dark-icon"
        className={`${isDark ? 'hidden' : 'block'} w-full h-full`}
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <path
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M12 21a9 9 0 0 1-.5-17.986V3c-.354.966-.5 1.911-.5 3a9 9 0 0 0 9 9c.239 0 .254.018.488 0A9.004 9.004 0 0 1 12 21Z"
        />
      </svg>
      {/* Sun icon (light mode) */}
      <svg
        id="theme-toggle-light-icon"
        className={`${isDark ? 'block' : 'hidden'} w-full h-full`}
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <path
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M12 5V3m0 18v-2M7.05 7.05 5.636 5.636m12.728 12.728L16.95 16.95M5 12H3m18 0h-2M7.05 16.95l-1.414 1.414M18.364 5.636 16.95 7.05M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z"
        />
      </svg>
      <span className="sr-only">Toggle dark mode</span>
    </button>
  );
};

export { DarkModeToggle };