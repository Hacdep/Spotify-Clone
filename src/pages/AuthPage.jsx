import { useState } from "react";

export default function AuthPage({ mode, onClose, onSwitch, onSuccess, t }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [signupStep, setSignupStep] = useState(1);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const isSignUp = mode === "signup";

  async function submit(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const response = await fetch(`/api/auth/${isSignUp ? "signup" : "signin"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const result = await response.json();
      if (!response.ok) {
        const errorKey = `error.${result.error}`;
        const translatedError = t(errorKey);
        setError(translatedError === errorKey ? t("authError") : translatedError);
        return;
      }
      onSuccess(result.user);
    } catch {
      setError(t("error.network"));
    } finally {
      setSubmitting(false);
    }
  }

  function continueSignup(event) {
    event.preventDefault();
    setError("");
    setSignupStep(2);
  }

  return (
    <main className="min-h-dvh overflow-y-auto bg-black px-5 py-8 text-white sm:py-12">
      <section className="mx-auto w-full max-w-md">
        <button
          type="button"
          onClick={onClose}
          aria-label={t("authGoHome")}
          className="mx-auto flex items-center gap-2"
        >
          <svg viewBox="0 0 24 24" className="h-10 w-10" aria-label="Spotify">
            <circle cx="12" cy="12" r="12" fill="white" />
            <path d="M5.5 9.2c4.2-1.2 8.6-.9 12.5 1M6.2 12.6c3.5-.9 7-.6 10.2.9M7 15.8c2.8-.6 5.6-.4 8 .7" stroke="black" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          </svg>
          <span className="text-xl font-bold">Spotify</span>
        </button>

        <h1 className="mb-8 mt-10 text-center text-3xl font-extrabold sm:text-4xl">
          {t(isSignUp
            ? signupStep === 1 ? "authEmailStepTitle" : "authDetailsStepTitle"
            : "signInTitle")}
        </h1>

        {isSignUp && signupStep === 1 ? (
          <form className="space-y-5" onSubmit={continueSignup}>
            <p className="text-center text-sm font-semibold">{t("authEmailStepDescription")}</p>
            <label className="block text-sm font-bold">
              {t("email")}
              <input
                type="email"
                autoComplete="email"
                maxLength={254}
                required
                autoFocus
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-2 h-12 w-full rounded border border-neutral-500 bg-neutral-950 px-3 font-normal outline-none transition hover:border-white focus:border-green-400"
              />
            </label>
            <button
              type="submit"
              className="w-full rounded-full bg-green-500 py-3 font-bold text-black transition hover:scale-[1.02] hover:bg-green-400"
            >
              {t("authNext")}
            </button>
          </form>
        ) : (
          <form className="space-y-5" onSubmit={submit}>
            {isSignUp && (
              <label className="block text-sm font-bold">
                {t("displayName")}
                <input
                  autoComplete="name"
                  maxLength={60}
                  required
                  autoFocus
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="mt-2 h-12 w-full rounded border border-neutral-500 bg-neutral-950 px-3 font-normal outline-none transition hover:border-white focus:border-green-400"
                />
              </label>
            )}
            <label className="block text-sm font-bold">
              {t("email")}
              <input
                type="email"
                autoComplete="email"
                maxLength={254}
                required
                readOnly={isSignUp}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-2 h-12 w-full rounded border border-neutral-500 bg-neutral-950 px-3 font-normal outline-none transition read-only:text-neutral-400 hover:border-white focus:border-green-400"
              />
            </label>
            <label className="block text-sm font-bold">
              {t("password")}
              <input
                type="password"
                autoComplete={isSignUp ? "new-password" : "current-password"}
                minLength={8}
                maxLength={128}
                required
                autoFocus={!isSignUp}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-2 h-12 w-full rounded border border-neutral-500 bg-neutral-950 px-3 font-normal outline-none transition hover:border-white focus:border-green-400"
              />
              {isSignUp && (
                <span className="mt-2 block font-normal text-neutral-400">{t("passwordHint")}</span>
              )}
            </label>
            {error && <p role="alert" className="text-sm text-red-400">{error}</p>}
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-full bg-green-500 py-3 font-bold text-black transition hover:scale-[1.02] hover:bg-green-400 disabled:cursor-wait disabled:opacity-60"
            >
              {submitting ? "…" : t(isSignUp ? "signUp" : "signIn")}
            </button>
            {isSignUp && (
              <button
                type="button"
                onClick={() => {
                  setSignupStep(1);
                  setError("");
                }}
                className="w-full rounded-full border border-neutral-500 py-3 font-bold transition hover:border-white"
              >
                {t("authBack")}
              </button>
            )}
          </form>
        )}

        <p className="mt-8 text-center text-sm text-neutral-400">
          {t(isSignUp ? "haveAccount" : "noAccount")}{" "}
          <button
            type="button"
            onClick={onSwitch}
            className="font-semibold text-white underline underline-offset-2 hover:text-green-400"
          >
            {t(isSignUp ? "signIn" : "signUp")}
          </button>
        </p>
        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full rounded-full border border-neutral-600 py-3 text-sm font-semibold text-neutral-200 transition hover:border-white hover:text-white"
        >
          {t("authGoHome")}
        </button>
      </section>
    </main>
  );
}
