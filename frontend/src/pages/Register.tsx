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
      }, { validateStatus: () => true })

      if (res.status === 201) {
        navigate("/login")
      } else {
        setErrorMessage(res.data["detail"])
      }
    } catch (err) {
      setErrorMessage(`ERROR: Registration failed ` + err);
    }

  }
  return (
    <div className="text-xl bg-gray-50 dark:bg-gray-900">
      <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
        <div className="inline-flex items-center gap-3 mb-6">
          <a
            href="#"
            className="text-5xl font-semibold text-gray-900 dark:text-white"
          >
            Timeshare
          </a>
        </div>
        <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
          <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
            <div className="flex items-end justify-between mb-6 w-full">
              <h1 className="text-xl font-semibold text-gray-900 md:text-2xl dark:text-white">
                Register your account
              </h1>
              <a
                href="/login"
                className="text-sm pb-1 font-medium text-primary-600 hover:text-primary-700 hover:underline dark:text-primary-500"
              >
                Login?
              </a>
            </div>
            <form onSubmit={submit} className="space-y-4 md:space-y-6" action="#">
              <div>
                <label htmlFor="email" className="block mb-2 font-medium text-gray-900 dark:text-white">Name</label>
                <input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Raskolnikov"
                  className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="email" className="block mb-2 font-medium text-gray-900 dark:text-white">Email</label>
                <input
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="test@example.com"
                  className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="password" className="block mb-2 font-medium text-gray-900 dark:text-white">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="************"
                  className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  required
                />
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-red-600 hover:underline dark:text-red-500">{errorMessage}</p>
              </div>
              <button
                type="submit"
                className="w-full text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800">
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

