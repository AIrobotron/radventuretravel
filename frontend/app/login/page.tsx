"use client";

import Image from "next/image";
import { FormEvent, useState } from "react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(data.error || "Unable to sign in.");
        return;
      }
      const next = new URLSearchParams(window.location.search).get("next") || "/";
      window.location.replace(next.startsWith("/") ? next : "/");
    } catch {
      setError("Unable to sign in. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="alumniLoginPage">
      <section className="alumniLoginPanel">
        <div className="alumniLoginBrand">
          <Image src="/alumni-logo.png" alt="Alumni" width={440} height={230} priority />
          <span><small>OPERATIONAL TRANSFORMATION</small><b>TELCO AI OPERATIONS STUDIO</b></span>
        </div>
        <div className="alumniLoginCopy">
          <span>SECURE STUDIO ACCESS</span>
          <h1>AI-native Operations.</h1>
          <p>Sign in to explore the Alumni Telco AI Operations Studio and its configurable transformation, assurance and customer digital twin experiences.</p>
        </div>
        <form className="alumniLoginForm" onSubmit={signIn}>
          <label>
            <span>Username</span>
            <input autoComplete="username" value={username} onChange={(e)=>setUsername(e.target.value)} required />
          </label>
          <label>
            <span>Password</span>
            <input type="password" autoComplete="current-password" value={password} onChange={(e)=>setPassword(e.target.value)} required />
          </label>
          {error && <div className="alumniLoginError" role="alert">{error}</div>}
          <button type="submit" disabled={busy}>{busy ? "SIGNING IN…" : "SIGN IN"}</button>
        </form>
        <p className="alumniLoginNote">Authorised access only · Alumni Operational Transformation</p>
      </section>
      <aside className="alumniLoginVisual" aria-hidden="true">
        <div className="loginRing loginRing1" />
        <div className="loginRing loginRing2" />
        <div className="loginRing loginRing3" />
        <div className="loginCore">AI-native<br/>Operations</div>
        <span className="loginTag loginTag1">Strategy</span>
        <span className="loginTag loginTag2">Operations</span>
        <span className="loginTag loginTag3">Customer</span>
      </aside>
    </main>
  );
}
