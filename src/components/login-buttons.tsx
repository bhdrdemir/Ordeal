"use client";

import { signIn } from "next-auth/react";
import { Github, Chrome } from "lucide-react";

export default function LoginButtons() {
  return (
    <div className="space-y-3">
      <button
        onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
        className="w-full bg-zinc-900 text-white rounded-xl py-3 px-4 flex items-center justify-center gap-3 font-medium hover:bg-zinc-800 transition-all hover:shadow-lg active:scale-[0.98] cursor-pointer"
      >
        <Github size={20} />
        Continue with GitHub
      </button>

      <button
        onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
        className="w-full bg-white border border-zinc-300 text-zinc-700 rounded-xl py-3 px-4 flex items-center justify-center gap-3 font-medium hover:bg-zinc-50 hover:border-zinc-400 transition-all active:scale-[0.98] cursor-pointer"
      >
        <Chrome size={20} />
        Continue with Google
      </button>
    </div>
  );
}
