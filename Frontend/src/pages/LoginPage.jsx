import { useMutation, useQueryClient } from '@tanstack/react-query';
import React, { useState } from 'react';
import { login } from '../lib/api.js';
import { ShipWheelIcon, Lock, Mail } from 'lucide-react';
import { Link } from 'react-router';
import { auth, googleProvider } from "../firebase.js";
import toast from "react-hot-toast"
import { signInWithPopup } from 'firebase/auth';
import { axiosInstance } from '../lib/axios.js';

const LoginPage = () => {
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);

  const queryClient = useQueryClient();

  const { mutate: loginMutation, isPending, error } = useMutation({
    mutationFn: login,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['authUser'] }),
  });

  const handleLogin = (e) => {
    e.preventDefault();
    loginMutation(loginData);
  };


  
  
    const handleGoogleLogin=async ()=>{
      try {
        const result =await signInWithPopup(auth,googleProvider);
        const user=result.user;
  
        // Prepare payload for backend
        const payload = {
          fullName: user.displayName || "No Name", // Google name
          email: user.email,
          profilepic: user.photoURL,              // Google profile pic
          firebaseUid: user.uid,                  // Firebase UID
        };
  
        // Send to backend to handle session/token creation
        const res=await axiosInstance.post("/auth/google-signin",payload);//"Hey, this user signed in using Google. Here's their data. Please create or fetch their account in your system."...telling to backend
        toast.success("Logged in with Google!");
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    } catch (error) {
      toast.error("Google Sign-In failed");
      console.error("Google Sign-In error", error);
    }
  };
  
  
  

  return (
    <div
      className="h-screen flex items-center justify-start px-4 py-6 sm:px-6 md:px-8"
      data-theme="forest"
    >
      <div className="border border-primary/25 flex flex-col lg:flex-row w-full max-w-5xl mx-auto bg-base-100 rounded-xl shadow-xl overflow-hidden">
        {/* LOGIN FORM SECTION */}
        <div className="w-full lg:w-1/2 p-4 sm:p-8 flex flex-col">
          {/* Logo and App Name */}
          <div className="mb-6 flex items-center gap-3">
            <ShipWheelIcon className="size-9 text-primary hover:rotate-12 transition-transform duration-300" />
            <span className="text-3xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary tracking-wider">
              Nestify
            </span>
          </div>

          {/* Error Message */}
          {error && (
            <div className="alert alert-error mb-4">
              <span className="text-gray-100">
                {error.response?.data?.message || 'Login failed'}
              </span>
            </div>
          )}

          

          {/* Main Form */}
          <form onSubmit={handleLogin} className="w-full">
            <div className="space-y-6">
              {/* Welcome Text */}
              <div className="space-y-2">
                <h2 className="text-xl font-semibold">Welcome Back!</h2>
                <p className="text-sm opacity-70">
                  Sign in to your account to continue your language journey.
                </p>
              </div>

                          
            
{/* GOOGLE SIGNIN */}
            <button
  type="button"
  onClick={handleGoogleLogin}
  className="btn btn-outline w-full mt-2 hover:scale-105 transition-transform flex items-center justify-center gap-2"
>
  <img
    src="https://www.svgrepo.com/show/475656/google-color.svg"
    alt="Google icon"
    className="w-5 h-5"
  />
  Continue with Google
</button>

              {/* Input Fields */}
              <div className="flex flex-col gap-3">
                {/* Email */}
                <div className="form-control w-full space-y-2">
                  <label className="label">
                    <span className="label-text">Email</span>
                  </label>
                  <div className="relative">
                    <Mail
                      className="absolute left-3 top-3 text-gray-400"
                      size={18}
                    />
                    <input
                      type="email"
                      placeholder="hello@example.com"
                      className="input input-bordered w-full pl-10 rounded-2xll focus:ring-2 focus:ring-primary"
                      value={loginData.email}
                      onChange={(e) =>
                        setLoginData({ ...loginData, email: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="form-control w-full space-y-2">
                  <label className="label">
                    <span className="label-text">Password</span>
                  </label>
                  <div className="relative">
                    <Lock
                      className="absolute left-3 top-3 text-gray-400"
                      size={18}
                    />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="********"
                      className="input input-bordered w-full pl-10 rounded-2xll focus:ring-2 focus:ring-primary"
                      value={loginData.password}
                      onChange={(e) =>
                        setLoginData({ ...loginData, password: e.target.value })
                      }
                      required
                    />
                  </div>
                  <p className="text-xs opacity-70 mt-1">
                    Password must have at least 6 characters
                  </p>
                  <label className="flex items-center cursor-pointer mt-2 gap-2">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-sm"
                      onChange={() => setShowPassword(!showPassword)}
                    />
                    <span className="text-xs">Show Password</span>
                  </label>
                </div>

                <hr className="border-base-200 my-2" />

                {/* Submit Button */}
                <button
                  type="submit"
                  className="btn btn-primary w-full rounded-xl"
                  disabled={isPending}
                >
                  {isPending ? (
                    <>
                      <span className="loading loading-spinner loading-xs"></span>
                      Signing in...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </button>

                {/* Signup Redirect */}
                <div className="text-center mt-4">
                  <p className="text-sm">
                    Don&apos;t have an account?{' '}
                    <Link
                      to="/signup"
                      className="text-primary hover:underline"
                    >
                      Create one
                    </Link>
                  </p>
                </div>

    
              </div>
            </div>
          </form>
        </div>

        {/* ILLUSTRATION SECTION */}
        <div className="hidden lg:flex w-full lg:w-1/2 bg-primary/10 items-center justify-center">
          <div className="max-w-md p-8">
            <div className="relative aspect-square max-w-sm mx-auto">
              <img
                src="/i.png"
                alt="Language connection illustration"
                className="w-full h-full"
              />
            </div>

            <div className="text-center space-y-3 mt-6">
              <h2 className="text-xl font-semibold">
                Connect with language partners worldwide
              </h2>
              <p className="opacity-70">
                Practice conversations, make friends, and improve your language
                skills together.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
