import React from 'react';
import { Link } from 'react-router-dom';

import { DarkModeToggle } from './DarkModeToggle'

type NavLink = {
  name: string;
  path: string;
};

type NavbarProps = {
  links: NavLink[];
};

const Navbar: React.FC<NavbarProps> = ({ links }) => {
  return (
    <nav className="bg-gray-50 text-2xl h-[5vh] dark:bg-gray-900 flex items-center">
      <ul className="flex space-x-4">
        {links.map((link, index) => (
          <li key={index}>
            <Link
              to={link.path}
              className="
                px-3 py-1
                rounded-md
                text-primary-600 dark:text-primary-400
                font-medium
                transition
                duration-200
                hover:bg-primary-100 dark:hover:bg-primary-600
                hover:text-primary-700 dark:hover:text-primary-200
                hover:scale-105
              "
            >
              {link.name}
            </Link>
          </li>
        ))}
      </ul>
        <DarkModeToggle/>
    </nav>
  );
};

export { Navbar };
