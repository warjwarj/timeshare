import React from 'react';
import { Link } from 'react-router-dom';

type NavLink = {
  name: string;
  path: string;
};

type NavbarProps = {
  leftlinks: NavLink[];
  rightlinks: NavLink[];
};

const Navbar: React.FC<NavbarProps> = ({ leftlinks, rightlinks }) => {
  return (
    <nav className="border-b-1 pb-1 border-light-border bg-light-background text-2xl h-20 dark:bg-dark-background dark:border-dark-border flex items-center justify-between px-4">
      <ul className="flex space-x-4">
        {leftlinks.map((link, index) => (
          <li key={index}>
            <Link
              to={link.path}
              className="
                p-2
                rounded-lg
                text-light-primary-text dark:text-dark-primary-text
                font-medium
                transition
                duration-200
                hover:bg-v-light-accent 
                hover:dark:bg-v-dark-accent
              "
            >
              {link.name}
            </Link>
          </li>
        ))}
      </ul>
      <div className="flex items-center space-x-4">
        <ul className="flex space-x-4">
          {rightlinks.map((link, index) => (
            <li key={index}>
              <Link
                to={link.path}
                className="
                  px-3 py-1
                  rounded-md
                  text-light-primary-text dark:text-dark-primary-text
                  font-medium
                  transition
                  duration-200
                  hover:bg-v-light-accent 
                  hover:dark:bg-v-dark-accent
                "
              >
                {link.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

export { Navbar };
