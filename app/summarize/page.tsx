"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { chatSession } from "@/config/AIConfig";
import { auth, db, provider } from "@/config/firebaseConfig";
import { useGetUserInfo } from "@/hooks/useGetUserInfo";
import { signInWithPopup } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { toast } from "sonner";

const SummarizePage = () => {
  const [open, setOpen] = useState(false);
  const [userText, setUserText] = useState("");
  const [loading, setLoading] = useState(false);

  const { isAuth, userEmail } = useGetUserInfo();
  const router = useRouter();

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

  const generateSummary = async () => {
    if (!isAuth) {
      setOpen(true);
      return;
    }

    if (!userText.trim()) {
      toast.error("Please enter text to summarize");
      return;
    }

    if (userText.trim().length < 10) {
      toast("Text is too short to summarize.");
      return;
    }

    if (userText.length > 5000) {
      toast.error("Text is too long. Please limit to 5,000 characters.");
      return;
    }

    try {
      setLoading(true);
      const prompt = `Summarize this text: ${userText}`;
      const result = await chatSession.sendMessage(prompt);

      const summary = result.response.text();
      console.log("Summarized Text:", summary);
      await saveSummary(summary);
    } catch (error) {
      console.error("Error generating summary:", error);
      toast.error("Failed to generate summary.");
    } finally {
      setLoading(false);
    }
  };

  const saveSummary = async (summary: string) => {
    const id = Date.now().toString();

    await setDoc(doc(db, "Summaries", id), {
      userText,
      summary,
      userEmail,
      id,
    });

    router.push(`/summary/${id}`);
  };

  return (
    <div className="bg-[#f5f5f5] flex flex-col justify-center items-center px-4 md:px-12 h-[90vh]">
      <div className="bg-white w-full h-[70vh] shadow-md rounded-2xl flex p-2">
        <textarea
          onChange={(e) => setUserText(e.target.value)}
          className="w-full rounded-l-2xl p-5 resize-none md:border-r focus:outline-none"
          placeholder='Enter or paste your text and press "Generate Summary"'
        />

        <textarea
          disabled
          className="w-full rounded-r-2xl p-5 resize-none focus:outline-none hidden md:inline-flex"
        />
      </div>

      <Button className="mt-8" disabled={loading} onClick={generateSummary}>
        {loading ? "Generating..." : "Generate Summary"}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sign In with Google</DialogTitle>
            <DialogDescription>
              Please sign in to access the summarization feature. This ensures a
              personalized experience and lets you save your summaries.
            </DialogDescription>

            <Button className="mt-8" onClick={signInWithGoogle}>
              Sign In with Google
            </Button>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SummarizePage;
