import { Clock, LogOut, Settings } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from "react-router-dom";

import { createPortal } from 'react-dom';
import { ourUseDispatch, ourUseSelector } from '../store/hooks';
import { logout, selectName, selectToken } from '../store/slices/authSlice';
import { Modal } from './Modal';
import ProfileIcon from './utils/ProfileIcon';
import { TimezoneSelectorModalContent } from './utils/TimezoneSelectorModalContent';

type NavLink = {
  name: string;
  path: string;
};

type NavbarProps = {
  links: NavLink[];
  userInitial?: string;
};

type MenuItem = {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  action: () => void;
};

const Navbar: React.FC<NavbarProps> = ({ links }) => {
  const dispatch = ourUseDispatch()
  const navigator = useNavigate()
  const name: string | null = ourUseSelector(selectName)
  const token = ourUseSelector(selectToken)
  const [isOpen, setIsOpen] = useState(false);
  const [tzModalOpen, setTzModalOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const profileIconMenuItems: MenuItem[] = [
    { icon: Clock, label: 'Timezone', action: () => { setTzModalOpen(true) } },
    { icon: Settings, label: 'Settings', action: () => navigator('/settings') },
    { icon: LogOut, label: 'Log out', action: () => { dispatch(logout()); navigator('/login') } },
  ];

  return (
    <nav className="relative z-30 overflow-hidden border-b-1 pb-1 border-light-border bg-light-background text-2xl h-20 dark:bg-dark-background dark:border-dark-border flex items-center justify-between px-4">

      {/* Left links */}
      <ul className="flex space-x-4">
        {links.map((link, index) => (
          <li key={index}>
            <a
              href={link.path}
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
            </a>
          </li>
        ))}
      </ul>

      <div className="flex items-center space-x-4">

        <div className="relative" ref={dropdownRef}>

          {/* Profile Icon */}
          {token &&
            <div className="w-10 h-10 text-lg">
              <ProfileIcon name={name} onClick={() => setIsOpen(!isOpen)} />
            </div>
          }

          {/* Timezone selector */}
          {tzModalOpen && createPortal(
            <Modal
              label="Select timezone"
              isOpen={tzModalOpen}
              onClose={() => setTzModalOpen(false)}
            >
              <TimezoneSelectorModalContent
                onClose={() => setTzModalOpen(false)}
              />
            </Modal>,
            document.body
          )}

          {/* Dropdown */}
          {isOpen && (
            <div className="fixed right-0 mt-2 w-56 bg-light-background dark:bg-dark-background rounded-lg shadow-lg border border-light-border dark:border-dark-border py-1 z-10">
              {profileIconMenuItems.map((item, index) => (
                <button
                  key={index}
                  onClick={() => {
                    item.action();
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center px-4 py-2.5 text-sm text-light-primary-text dark:text-dark-primary-text hover:bg-v-light-accent hover:dark:bg-v-dark-accent transition-colors z-10"
                >
                  <item.icon className="w-4 h-4 mr-3" />
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export { Navbar };

