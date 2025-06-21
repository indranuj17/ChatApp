
import React, { useState } from 'react'
import { Snowflake, Mail, Lock, User } from 'lucide-react';
import { Link } from 'react-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '../lib/axios.js';
import { auth, googleProvider } from "../firebase.js";
import toast from "react-hot-toast"
import { signInWithPopup } from 'firebase/auth';


const SignUpPage = () => {
  const [signupData, setSignupData] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [checkboxError, setCheckboxError] = useState(false);
  const queryClient = useQueryClient();



  const { mutate, isPending, error } = useMutation({
    mutationFn: async () => {
      const response = await axiosInstance.post("/auth/signup", signupData);
      return response.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["authUser"] })
  });





  const handleGoogleSignup=async ()=>{
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




  
  const handleSignup = (e) => {
    e.preventDefault();
    const isChecked = document.getElementById("terms").checked;
    if (!isChecked) {
      setCheckboxError(true);
      return;
    }
    setCheckboxError(false);
    mutate();
  }

  return (
    <div className='h-screen flex items-center justify-center p-4 sm:p-6 md:p-8' data-theme="forest">
      <div className="border border-primary/25 flex flex-col lg:flex-row w-full max-w-5xl mx-auto bg-base-100 rounded-xl shadow-2xl overflow-hidden">

        {/* SIGNUP FORM LEFT SIDE */}
        <div className='w-full lg:w-1/2 p-4 sm:p-8 flex flex-col'>
          {/* LOGO */}
          <div className='mb-4 flex items-center justify-start gap-2'>
            <Snowflake className='size-9 text-primary' />
            <span className='text-3xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary tracking-wider'>
              Nestify
            </span>
          </div>

          {/* ERROR */}
          {error && (
            <div className="alert alert-error mb-4">
              <span>{error.response?.data?.message || "Something went wrong."}</span>
            </div>
          )}
          {checkboxError && (
            <div className="alert alert-warning mb-4">
              <span>You must agree to the terms to continue.</span>
            </div>
          )}

          {/* FORM */}
          <form onSubmit={handleSignup} className='space-y-4'>
            <div>
              <h2 className='text-xl font-semibold'>Create an Account</h2>
              <p className='text-sm opacity-70'>Join Nestify and start your Language learning adventure</p>
            </div>

            {/* FULL NAME */}
            <div className='form-control w-full'>
              <label className='label'><span className='label-text'>Full Name</span></label>
              <div className='relative'>
                <User className='absolute left-3 top-3 text-gray-400' size={18} />
                <input type="text" placeholder="Indranuj Dev" className="input input-bordered w-full pl-10" value={signupData.fullName} onChange={(e) => setSignupData({ ...signupData, fullName: e.target.value })} required />
              </div>
            </div>

            {/* EMAIL */}
            <div className='form-control w-full'>
              <label className='label'><span className='label-text'>Email</span></label>
              <div className='relative'>
                <Mail className='absolute left-3 top-3 text-gray-400' size={18} />
                <input type="email" placeholder="Indranujdev015@gmail.com" className="input input-bordered w-full pl-10" value={signupData.email} onChange={(e) => setSignupData({ ...signupData, email: e.target.value })} required />
              </div>
            </div>

            {/* PASSWORD */}
            <div className='form-control w-full'>
              <label className='label'><span className='label-text'>Password</span></label>
              <div className='relative'>
                <Lock className='absolute left-3 top-3 text-gray-400' size={18} />
                <input type={showPassword ? "text" : "password"} placeholder="********" className="input input-bordered w-full pl-10" value={signupData.password} onChange={(e) => setSignupData({ ...signupData, password: e.target.value })} required />
              </div>
              <p className='text-xs opacity-70 mt-1'>Password must have at least 6 characters</p>
              
              <label className='flex flex-row cursor-pointer mt-1 gap-2  '>  
                <input type="checkbox" className='checkbox checkbox-sm' onChange={() => setShowPassword(!showPassword)} />
                <span className='text-xs '>Show Password</span>
              </label>
            </div>

            {/* TERMS CHECKBOX */}
            <div className='form-control'>
              <label className='label cursor-pointer justify-start gap-2'>
                <input id="terms" type="checkbox" className='checkbox checkbox-sm' />
                <span className='text-xs leading-tight'>
                  I agree to the <a href="#" className='text-primary hover:underline'>terms of service</a> and <a href="#" className='text-primary hover:underline'>privacy policy</a>
                </span>
              </label>
            </div>

            {/* SUBMIT BUTTON */}
            <button className="btn btn-primary w-full transition-transform duration-200 hover:scale-105" type="submit">
              {isPending ? (
                <>
                  <span className="loading loading-spinner loading-xs"></span>
                  Loading...
                </>
              ) : (
                "Create Account"
              )}
            </button>

            
{/* GOOGLE SIGNIN */}
            <button
  type="button"
  onClick={handleGoogleSignup}
  className="btn btn-outline w-full mt-2 hover:scale-105 transition-transform flex items-center justify-center gap-2"
>
  <img
    src="https://www.svgrepo.com/show/475656/google-color.svg"
    alt="Google icon"
    className="w-5 h-5"
  />
  Continue with Google
</button>

            <div className='text-center mt-4'>
              <p className='text-sm'>
                Already have an account? <Link to="/login" className='text-primary hover:underline'>Sign in</Link>
              </p>
            </div>

          </form>
        </div>

        




        {/* RIGHT PANEL */}
        <div className="hidden lg:flex w-full lg:w-1/2 bg-primary/10 items-center justify-center">
          <div className="max-w-md p-8 text-center animate-fade-in">
            <div className="relative aspect-square max-w-sm mx-auto">
              <img src="/i.png" alt="Language connection illustration" className="w-full h-full" />
            </div>
            <div className="space-y-3 mt-6">
              <h2 className="text-xl font-semibold">Connect with language partners worldwide</h2>
              <p className="opacity-70">Practice conversations, make friends, and improve your language skills together.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

export default SignUpPage;
