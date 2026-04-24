import React, { useState, useEffect } from 'react';
import { ourUseSelector, ourUseDispatch } from '../store/hooks';
import { selectLoggedInUser, updateAccount } from '../store/slices/authSlice';
import { toastService } from '../toastService';
import { SaveButton } from '../components/utils/SaveButton';
import { ViewBody } from '../components/ViewBody';
import { ViewHeader } from '../components/ViewHeader';
import type { UserDTO } from '../types/UserDTO';

const Settings: React.FC = () => {

  const dispatch = ourUseDispatch();
  const reduxUser = ourUseSelector(selectLoggedInUser)

  const [userDetails, setUserDetails] = useState<UserDTO>(reduxUser);

  useEffect(() => {
    setUserDetails(reduxUser);
  }, [reduxUser]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserDetails({ ...userDetails, name: e.target.value } as UserDTO);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserDetails({ ...userDetails, email: e.target.value } as UserDTO);
  };

  const handleColourChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserDetails({ ...userDetails, colour: e.target.value } as UserDTO);
  };

  const handleSave = async () => {
    if (!userDetails?.email.trim()) {
      toastService.showError("Validation error", "Email cannot be empty.");
      return;
    }
    dispatch(updateAccount(userDetails))
  };

  return (
    <ViewBody id={"Settings"}>
      <div id="Settings" className="min-h-screen bg-light-background dark:bg-dark-background">
        <ViewHeader hideSearch={true}>
          <></>
        </ViewHeader>

        <div className="max-w-2xl mx-auto p-6">
          <h1 className="text-3xl font-bold mb-8 text-light-primary-text dark:text-dark-primary-text">Settings</h1>
          <div
            className="bg-light-background dark:bg-dark-background border border-light-border dark:border-dark-border rounded-lg p-6"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSave();
              }
            }}>
            <h2 className="text-xl font-semibold mb-6 text-light-primary-text dark:text-dark-primary-text">Account Information</h2>

            <div className="space-y-6">
              {/* Name Field */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-light-primary-text dark:text-dark-primary-text mb-2">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={userDetails.name ?? ""}
                  onChange={handleNameChange}
                  className="w-full px-4 py-2 bg-[#F5F5F5] dark:bg-[#2A2A2A] border border-light-border dark:border-dark-border text-light-primary-text dark:text-dark-primary-text placeholder-light-secondary-text dark:placeholder-dark-secondary-text rounded-lg focus:ring-2 focus:ring-light-accent dark:focus:ring-dark-accent focus:border-transparent"
                  placeholder="Enter your name"
                />
              </div>

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-light-primary-text dark:text-dark-primary-text mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={userDetails.email}
                  onChange={handleEmailChange}
                  className="w-full px-4 py-2 bg-[#F5F5F5] dark:bg-[#2A2A2A] border border-light-border dark:border-dark-border text-light-primary-text dark:text-dark-primary-text placeholder-light-secondary-text dark:placeholder-dark-secondary-text rounded-lg focus:ring-2 focus:ring-light-accent dark:focus:ring-dark-accent focus:border-transparent"
                  placeholder="Enter your email"
                />
              </div>

              {/* Colour Field */}
              <div>
                <label htmlFor="colour" className="block text-sm font-medium text-light-primary-text dark:text-dark-primary-text mb-2">
                  Colour
                </label>
                <input
                  type="color"
                  id="colour"
                  value={userDetails.colour}
                  onChange={handleColourChange}
                  className="w-full px-4 py-2 bg-[#F5F5F5] dark:bg-[#2A2A2A] border border-light-border dark:border-dark-border text-light-primary-text dark:text-dark-primary-text placeholder-light-secondary-text dark:placeholder-dark-secondary-text rounded-lg focus:ring-2 focus:ring-light-accent dark:focus:ring-dark-accent focus:border-transparent"
                />
              </div>
            </div>


            {/* Update*/}
            <div className="flex gap-3 mt-8">
              <SaveButton onClick={handleSave} children={"Update"} />
            </div>
          </div>
        </div>
      </div>
    </ViewBody>
  );
};

export { Settings }