import type { FormEvent } from 'react';
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import "../../index.css";
import { apiClient } from "../utils/apiClient";

const RegisterForm: React.FC = () => {

  const navigate = useNavigate();

  // states
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  // login/register submit handler
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage("Please fill in required fields.");
      return;
    }

    try {
      const res = await apiClient.post("/auth/register", {
        name: name,
        email: email,
        password: password,
        role: "TEST_ROLE_CHANGE_THIS_OR_REMOVE"
      }, { 
        validateStatus: status => status < 500
      })
      if (res.status === 201) {
        navigate("/login")
      } else {
        setErrorMessage(res.data["detail"])
      }
    } catch (err) {
      setErrorMessage(`SERVER ERROR: Register failed ` + err);
    }

  }
  return (
    <div className="text-xl bg-light-background dark:bg-dark-background">
      <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto h-screen lg:py-0">
        <div className="inline-flex items-center gap-3 mb-6">
          <a href="#" className="text-5xl font-semibold text-light-primary-text dark:text-dark-primary-text">
            Timeshare
          </a>
        </div>

        <div className="w-full bg-light-background rounded-lg border border-light-border md:mt-0 max-w-md dark:bg-dark-background dark:border-dark-border">
          <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
            <div className="flex items-end justify-between mb-6 w-full">
              <h1 className="text-xl font-semibold text-light-primary-text md:text-2xl dark:text-dark-primary-text">
                Sign in to your account
              </h1>
              <a
                href="/Login"
                className="text-sm pb-1 font-medium text-light-accent hover:text-light-secondary-text hover:underline dark:text-dark-accent"
              >
                Login?
              </a>
            </div>
            <form onSubmit={submit} className="space-y-4 md:space-y-6" action="#">
              <div>
                <label htmlFor="email" className="block mb-2 font-medium text-light-primary-text dark:text-dark-primary-text">Name</label>
                <input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Raskolnikov"
                  className="bg-[#F5F5F5] border border-light-border text-light-primary-text rounded-lg focus:ring-light-accent focus:border-light-accent block w-full p-2.5 dark:bg-[#2A2A2A] dark:border-dark-border dark:placeholder-dark-secondary-text dark:text-dark-primary-text dark:focus:ring-dark-accent dark:focus:border-dark-accent"
                  required
                />
              </div>
              <div>
                <label htmlFor="email" className="block mb-2 font-medium text-light-primary-text dark:text-dark-primary-text">Email</label>
                <input
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="test@example.com"
                  className="bg-[#F5F5F5] border border-light-border text-light-primary-text rounded-lg focus:ring-light-accent focus:border-light-accent block w-full p-2.5 dark:bg-[#2A2A2A] dark:border-dark-border dark:placeholder-dark-secondary-text dark:text-dark-primary-text dark:focus:ring-dark-accent dark:focus:border-dark-accent"
                  required
                />
              </div>
              <div>
                <label htmlFor="password" className="block mb-2 font-medium text-light-primary-text dark:text-dark-primary-text">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="************"
                  className="bg-[#F5F5F5] border border-light-border text-light-primary-text rounded-lg focus:ring-light-accent focus:border-light-accent block w-full p-2.5 dark:bg-[#2A2A2A] dark:border-dark-border dark:placeholder-dark-secondary-text dark:text-dark-primary-text dark:focus:ring-dark-accent dark:focus:border-dark-accent"
                  required
                />
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-red-600 hover:underline dark:text-red-500">
                  {errorMessage}
                </p>
              </div>
              <button
                type="submit"
                className="w-full text-white bg-light-accent hover:bg-light-secondary-text focus:ring-4 focus:outline-none focus:ring-light-accent font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-dark-accent dark:hover:bg-dark-secondary-text dark:focus:ring-dark-accent">
                Register
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export { RegisterForm };

