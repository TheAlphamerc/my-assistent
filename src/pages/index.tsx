import { useUser } from "@auth0/nextjs-auth0/client";
import Image from "next/image";
import { Inter } from "next/font/google";
import Head from "next/head";
import { Button } from "@/component/button";
import Link from "next/link";
import NavbarLayout from "@/component/layout/navLayout";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const { user, error, isLoading } = useUser();

  return (
    <div className="flex items-left text-left h-screen flex-col">
      <Head>
        <title>Assistant AI</title>
      </Head>
      <NavbarLayout
        trailing={
          user ? (
            <>
              <Button variant={"outline"}>
                <Link href="/create">Account</Link>
              </Button>
            </>
          ) : (
            <Button variant={"outline"}>
              <Link href="/api/auth/login">Create Your Chatbot Now</Link>
            </Button>
          )
        }
      />
      <div className="flex flex-col items-center max-w-5xl mx-auto m-24 space-y-8 text-gray-800">
        <h1 className="text-4xl">Create Assistant using Assistant AI </h1>
        <div className="text-center max-w-xl">
          To search for answers from the content in your files, upload them here
          and we will use OpenAI embeddings and GPT to find answers from the
          relevant documents.
        </div>
        <Button variant={"default"}>
          <Link href={"/api/auth/login"}>Create you assistant</Link>
        </Button>
        <HowItWorks />
      </div>
    </div>
  );
}

function HowItWorks() {
  return (
    <div className="grid grid-cols-3 gap-2 py-6 pt-32">
      <Grid
        title={"Enter your website URL"}
        text={"We will crawl your website and create an assistant for you."}
      />
      <Grid
        title={"Upload files"}
        text={
          "Upload files and we will extract the content and create an assistant"
        }
      />
      <Grid
        title={"Create your assistant"}
        text={
          "We will create an assistant for you and you can start using it immediately."
        }
      />
    </div>
  );

  function Grid({ title, text }: { title: string; text: string }) {
    return (
      <div className="py-20">
        <div className="flex gap-2 items-center mt-3 text-lg font-medium text-gray-900">
          <Logo />
          {title}
        </div>
        <div className="mt-2 text-base text-gray-500">{text}</div>
      </div>
    );
  }
}

function Logo() {
  return (
    <div className="flex items-center justify-center h-5 w-5 rounded-md bg-black text-white">
      <svg
        className="h-3 w-3"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
      </svg>
    </div>
  );
}
