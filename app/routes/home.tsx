import type { Route } from "./+types/home";
import { Welcome } from "../welcome/welcome";
import Navbar from "~/compnents/Navbar";
import { resumes } from "constants/index";
import ResumeCard from "~/compnents/ResumeCard";
import { usePuterStore } from "lib/puter";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router";


export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Resumind" },
    { name: "description", content: "Smart feedback for your dream job!" },
  ];
}

export default function Home() {

  const { auth } = usePuterStore();

  const navigate = useNavigate();

  useEffect(
    () => {
      if (!auth.isAuthenticated) navigate('/auth?next=/')
    },
    [auth.isAuthenticated]
  )

  return <main className="bg-[url('/images/bg-main.svg')] bg-cover">
    <Navbar />

    <section className="main-section">
      <div className="page-heading py-16 ">
        <h1>Track Your Application & resume ratings</h1>
        <h2>Review your submission and check AI-powerd feedback</h2>
      </div>
      {resumes.length > 0 && (
        <div className="resumes-section">
          {resumes.map((resume) => (
            <ResumeCard key={resume.id} resume={resume} />
          ))}
        </div>

      )}
    </section>


  </main>;
}
