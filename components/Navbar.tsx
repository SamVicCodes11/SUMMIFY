"use client";

import Link from "next/link";
import { Button } from "./ui/button";
import { signInWithPopup, signOut } from "firebase/auth";
import { auth, provider } from "@/config/firebaseConfig";
import { toast } from "sonner";
import { useGetUserInfo } from "@/hooks/useGetUserInfo";
import { useState } from "react";

const Navbar = () => {
  const { isAuth } = useGetUserInfo();
  const [open, setOpen] = useState(false);

const signInWithGoogle = async () => {
    const results = await signInWithPopup(auth, provider);

    const authInfo = {
      userId: results.user.uid,
      userEmail: results.user.email,
      name: results.user.displayName,
      isAuth: true,
    };

    if (typeof window !== "undefined") {
      localStorage.setItem("auth", JSON.stringify(authInfo));
    }

    window.location.reload();

    toast("Signed in successfully");
  };


  const signUserOut = async () => {
    try {
      await signOut(auth);

      if (typeof window !== "undefined") {
        localStorage.clear();
      }

      window.location.reload();

      toast("Logged out successfully.");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <nav className="bg-black text-white flex justify-between items-center py-5 px-4 md:px-8 shadow-sm">
      <Link
        href="/"
        className="text-lg font-semibold hover:text-gray-300 transition-colors"
      >
        Summify
      </Link>

      <div className="flex items-center gap-4 md:gap-6">
        {isAuth ? (
          <>
            <Link
              href="/summarize"
              className="hover:text-gray-300 text-sm md:text-base transition-colors"
            >
              Summarize
            </Link>
            <Link
              href="/history"
              className="hover:text-gray-300 text-sm md:text-base transition-colors"
            >
              History
            </Link>
            <Button
              variant="outline"
              className="text-black border-gray-300 hover:bg-gray-100 hover:text-black transition-colors duration-200"
              onClick={signUserOut}
            >
              Log Out
            </Button>
          </>
        ) : (
          <Button
            className="bg-white text-black hover:bg-gray-100 transition-colors duration-200"
            onClick={signInWithGoogle}
          >
            Sign In
          </Button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
