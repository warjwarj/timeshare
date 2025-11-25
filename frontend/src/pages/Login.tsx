import { useState } from "react";
import type { FormEvent } from 'react';
import axios, { AxiosError } from "axios";

import "../../index.css";

const API = import.meta.env.VITE_API_URL as string;

const LoginForm: React.FC = () => {

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isRegister, setIsRegister] = useState<boolean>(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();

    if (!email) {
      setErrorMessage("Username cannot be blank.");
      return;
    }
    if (!password) {
      setErrorMessage("Password cannot be blank.");
      return;
    }

    const login = () => {
      window.alert("todo implement login!")
    }

    if (isRegister) {
      try {
        const res = await axios.post(`${API}/register`, { email, password });
        console.log(res)
        setErrorMessage("SUCCESS: Registered! Now log in.");
      } catch (err) {
        setErrorMessage(`ERROR: Registration failed ` + err);
      }
    } else {
      try {
        const res = await axios.post(`${API}/login`, { email, password });
        console.log(res)
        login()
      } catch (err) {
        const error = err as AxiosError;
        if (error.response?.status === 401) {
          setErrorMessage(
            "err!"
          );
        } else {
          setErrorMessage(error.message);
        }
      }
    }
  };

  return (
    <>
      {/* aosidhoaiswdhasdhasohsioahhd */}
      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form onSubmit={submit}>


          <div className="inline-flex items-center gap-2">
            <span className="text-slate-600 text-sm cursor-pointer">Login</span>

            <label className="relative inline-block w-11 h-5 cursor-pointer">
              <input
                id="toggle"
                onChange={(e) => setIsRegister(e.target.checked)}
                type="checkbox"
                className="peer appearance-none w-11 h-5 bg-slate-100 rounded-full checked:bg-slate-800 transition-colors duration-300"
              />
              <span
                className="absolute top-0 left-0 w-5 h-5 bg-white rounded-full border border-slate-300 shadow-sm transition-transform duration-300 peer-checked:translate-x-6 peer-checked:border-slate-800"
              ></span>
            </label>

            <span className="text-slate-600 text-sm cursor-pointer">Register</span>
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm/6 font-medium text-black"
            >
              Email:
            </label>
            <div className="mt-2">
              <input
                id="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="username"
                className="bg-grey-300 block w-full px-3 py-1.5 rounded-md bg-grey-400"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label
                htmlFor="password"
                className="block text-sm/6 font-medium text-black"
              >
                Password:
              </label>
            </div>
            <div className="mt-2">
              <input
                type="password"
                id="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="password"
                className="block w-full px-3 py-1.5 rounded-md bg-grey-400"
              />
            </div>

            <div>
              <p className="text-red-600">{errorMessage}</p>
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="p-3 flex w-full justify-center rounded-md bg-transparent text-sm/6 font-semibold text-blue-500 hover:bg-blue-500 hover:text-white"
            >
              {isRegister ? "Register" : "Login"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

export { LoginForm }