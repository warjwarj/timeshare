import React, { useState, useEffect } from 'react';
import { ourUseSelector, ourUseDispatch } from '../store/hooks';
import { selectEmail, selectName, updateAccount } from '../store/slices/authSlice';
import { toastService } from '../toastService';
import  { SaveButton } from '../components/SaveButton';

const Settings: React.FC = () => {

  const dispatch = ourUseDispatch();
  const reduxName = ourUseSelector(selectName)
  const reduxEmail = ourUseSelector(selectEmail)

  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");

  // Initialize form with Redux values
  useEffect(() => {
    setName(reduxName);
    setEmail(reduxEmail);
  }, [reduxName, reduxEmail]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handleSave = async () => {
    if (!name.trim() || !email.trim()) {
      toastService.showError("Validation Error", "Name and email cannot be empty");
      return;
    }
    
    try {
      await dispatch(updateAccount({ name, email })).unwrap();
    } catch (error: unknown) {
      const errorMessage = typeof error === 'string'
        ? error
        : 'An unexpected error occurred';
      toastService.showError("Update Failed", errorMessage);
    }
  };

  return (
    <div id="Settings" className="min-h-screen bg-light-background dark:bg-dark-background">
      <div className="max-w-2xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-8 text-light-primary-text dark:text-dark-primary-text">Settings</h1>

        <form className="bg-light-background dark:bg-dark-background border border-light-border dark:border-dark-border rounded-lg p-6">
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
                value={name}
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
                value={email}
                onChange={handleEmailChange}
                className="w-full px-4 py-2 bg-[#F5F5F5] dark:bg-[#2A2A2A] border border-light-border dark:border-dark-border text-light-primary-text dark:text-dark-primary-text placeholder-light-secondary-text dark:placeholder-dark-secondary-text rounded-lg focus:ring-2 focus:ring-light-accent dark:focus:ring-dark-accent focus:border-transparent"
                placeholder="Enter your email"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-8">
            <SaveButton onClick={handleSave} children={"Save"} />
          </div>
        </form>
      </div>
    </div>
  );
};

export { Settings }