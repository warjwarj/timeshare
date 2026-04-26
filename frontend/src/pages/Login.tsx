import type { FormEvent } from 'react';
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../index.css";
import { ourUseDispatch } from '../store/hooks';
import { login } from '../store/slices/authSlice';


const LoginForm: React.FC = () => {
  const dispatch = ourUseDispatch();
  const navigate = useNavigate();

  // states
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage("Please fill in the username and password fields.");
      return;
    }
    try {
      await dispatch(login({ email, password })).unwrap();
      navigate('/calendar');
    } catch (error: unknown) {
      const errorMessage = typeof error === 'string'
        ? error
        : 'An unexpected error occurred';
      setErrorMessage(errorMessage)
    }
  }

  return (

    <div className="w-full text-xl bg-light-background dark:bg-dark-background">
      <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto h-screen lg:py-0">
        <div className="inline-flex items-center gap-3 mb-6">
          <a href="#" className="text-5xl font-semibold text-light-primary-text dark:text-dark-primary-text">
            Timeshare
          </a>
        </div>

        <div className="w-full bg-light-background rounded-lg border border-light-border sm:mt-0 max-w-md dark:bg-dark-background dark:border-dark-border">
          <div className="p-6 space-y-4 sm:space-y-6 sm:p-8">
            <div className="flex items-end justify-between mb-6 w-full">
              <h1 className="text-xl font-semibold text-light-primary-text sm:text-2xl dark:text-dark-primary-text">
                Sign in to your account
              </h1>
              <a
                href="/register"
                className="text-sm pb-1 font-medium text-light-accent hover:text-light-secondary-text hover:underline dark:text-dark-accent"
              >
                Register?
              </a>
            </div>

            <form className="space-y-4 sm:space-y-6">
              <div>
                <label htmlFor="email" className="block mb-2 font-medium text-light-primary-text dark:text-dark-primary-text">
                  Email
                </label>
                <input
                  id="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="test@example.com"
                  className="bg-[#F5F5F5] border border-light-border text-light-primary-text rounded-lg focus:ring-light-accent focus:border-light-accent block w-full p-2.5 dark:bg-[#2A2A2A] dark:border-dark-border dark:placeholder-dark-secondary-text dark:text-dark-primary-text dark:focus:ring-dark-accent dark:focus:border-dark-accent"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block mb-2 font-medium text-light-primary-text dark:text-dark-primary-text">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="************"
                  className="border border-light-border text-light-primary-text rounded-lg focus:ring-light-accent focus:border-light-accent block w-full p-2.5 dark:bg-[#2A2A2A] dark:border-dark-border dark:placeholder-dark-secondary-text dark:text-dark-primary-text dark:focus:ring-dark-accent dark:focus:border-dark-accent"
                  required
                />
              </div>

              {errorMessage && <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-red-600 dark:text-red-500">
                  {errorMessage}
                </p>
              </div>}

              <div className="flex items-center justify-between">
                <a href="#" className="text-sm pb-1 font-medium text-light-accent hover:text-light-secondary-text hover:underline dark:text-dark-accent">
                  Forgot password?
                </a>
              </div>

              <button
                onClick={submit}
                className="w-full
                font-medium 
                rounded-lg 
                text-sm px-5 py-2.5 text-center 
                border border-light-border dark:border-dark-border
                bg-light-background
                text-light-text
                dark:bg-dark-background
                dark:text-dark-text
                hover:bg-dark-background
                hover:text-dark-primary-text
                dark:hover:bg-light-background
                dark:hover:text-light-primary-text"
              >
                Login
              </button>
            </form>

          </div>
        </div>
      </div>
    </div>

  );
}

export { LoginForm };
