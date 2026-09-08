"use client";

import { useState } from "react";
import Link from "next/link";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const response = await fetch("http://127.0.0.1:3001/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        password,
      }),
    });

    if (response.ok) {
      console.log("Användaren är skapad!");
    }
  }

  return (
    <div className="min-h-screen bg-rose-100 text-slate-900">
      <nav className="flex items-center justify-between border-b border-rose-900 bg-rose-200 px-8 py-5">
        <Link
          href="/"
          className="text-xl font-bold text-blue-900"
        >
          Rosa banken
        </Link>

        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="hover:text-rose-700"
          >
            Hem
          </Link>

          <Link
            href="/login"
            className="hover:text-rose-700"
          >
            Logga in
          </Link>

          <Link
            href="/register"
            className="rounded-lg bg-sky-900 px-4 py-2 text-white hover:bg-sky-800"
          >
            Skapa användare
          </Link>
        </div>
      </nav>

      <main className="flex min-h-[80vh] items-center justify-center px-6">
        <section className="w-full max-w-md text-center">
          <h1 className="mb-2 text-5xl font-bold tracking-tight">Skapa användare</h1>

          <p className="mb-8 text-lg text-slate-600">Skapa en användare för att komma igång.</p>

          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-4 text-left"
          >
            <label
              htmlFor="username"
              className="font-medium"
            >
              Användarnamn
            </label>

            <input
              id="username"
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              className="rounded-lg border border-rose-900 bg-white px-4 py-3"
            />

            <label
              htmlFor="password"
              className="font-medium"
            >
              Lösenord
            </label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="rounded-lg border border-rose-900 bg-white px-4 py-3"
            />

            <button
              type="submit"
              className="mt-4 rounded-lg bg-sky-900 px-6 py-3 font-medium text-white hover:bg-sky-800"
            >
              Skapa användare
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}
