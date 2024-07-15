import Navbar from "@/components/Navbar";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Link from "next/link";

export default async function Home() {
  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
      {/* <Navbar /> */}
      Hello
      <SignedIn>
        <h1>Go to the dashboard to create new messages</h1>
        <Link href="/dashboard">Dashboard</Link>
      </SignedIn>
      <SignedOut>
        <h1>Sign in first</h1>
      </SignedOut>
    </div>
  );
}
