import { useState } from "react";
import { Check, ChevronDown, Sparkles } from "lucide-react";
import { usePlayer } from "../store/usePlayer";

const plans = [
  {
    name: "premiumIndividual",
    audience: "premiumIndividualAudience",
    monthlyPriceCents: 1299,
    color: "border-sky-300 bg-sky-100 text-slate-950",
    features: ["premiumAdFree", "premiumOffline", "premiumOnDemand"],
  },
  {
    name: "premiumDuo",
    audience: "premiumDuoAudience",
    monthlyPriceCents: 1899,
    color: "border-fuchsia-300 bg-fuchsia-100 text-slate-950",
    features: ["premiumAdFree", "premiumOffline", "premiumTwoAccounts"],
  },
  {
    name: "premiumFamily",
    audience: "premiumFamilyAudience",
    monthlyPriceCents: 2199,
    color: "border-amber-300 bg-amber-100 text-slate-950",
    features: ["premiumAdFree", "premiumOffline", "premiumSixAccounts"],
  },
];

const questions = [
  ["premiumFaq1Question", "premiumFaq1Answer"],
  ["premiumFaq2Question", "premiumFaq2Answer"],
  ["premiumFaq3Question", "premiumFaq3Answer"],
];

export default function Premium({ t, onSignUp }) {
  const [duration, setDuration] = useState(1);
  const [selectedPlan, setSelectedPlan] = useState("");
  const queue = usePlayer((state) => state.queue);
  const artwork = queue.slice(0, 6);
  const formatPrice = (priceCents) => new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(priceCents / 100);

  return (
    <div className="mx-auto max-w-7xl pb-8">
      <section className="relative isolate mb-12 min-h-[420px] overflow-hidden rounded-2xl bg-[#121212] sm:min-h-[490px]">
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_15%_0%,rgba(29,185,84,0.72),transparent_52%)]" />
        <div className="grid min-h-[420px] items-center sm:min-h-[490px] lg:grid-cols-[1fr_0.9fr]">
          <div className="relative z-10 px-6 py-10 sm:px-10 sm:py-14 lg:py-16">
            <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/25 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-green-200">
              <Sparkles size={14} aria-hidden="true" />
              {t("premium")}
            </span>
            <h1 className="max-w-2xl text-4xl font-black leading-[1.04] tracking-tight sm:text-5xl lg:text-6xl">
              {t("premiumHeadline")}
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-neutral-200 sm:text-lg">
              {t("premiumDescription")}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#premium-plans"
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-green-500 px-7 py-3 font-bold text-black transition hover:scale-[1.03] hover:bg-green-400"
              >
                {t("viewPlans")}
              </a>
              <button
                type="button"
                onClick={onSignUp}
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/50 px-7 py-3 font-bold transition hover:border-white hover:bg-white/10"
              >
                {t("premiumStartListening")}
              </button>
            </div>
            <p className="mt-5 max-w-xl text-xs leading-5 text-neutral-400">
              {t("premiumTrialPrice")}
            </p>
          </div>

          <div aria-hidden="true" className="relative hidden h-full min-h-[490px] overflow-hidden lg:block">
            <div className="absolute -right-20 top-1/2 grid w-[112%] -translate-y-1/2 rotate-[-12deg] grid-cols-3 gap-3">
              {[...Array(9)].map((_, index) => {
                const song = artwork[index % (artwork.length || 1)];
                return (
                  <div
                    key={`${index}-${song?.id ?? "placeholder"}`}
                    className={`aspect-square overflow-hidden rounded-lg shadow-2xl ${
                      index % 3 === 1 ? "translate-y-8" : index % 3 === 2 ? "-translate-y-8" : ""
                    }`}
                  >
                    {song ? (
                      <img src={song.cover} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className={`h-full w-full ${
                        ["bg-gradient-to-br from-violet-500 to-fuchsia-900", "bg-gradient-to-br from-lime-300 to-green-800", "bg-gradient-to-br from-orange-400 to-rose-900"][index % 3]
                      }`} />
                    )}
                  </div>
                );
              })}
            </div>
            <div className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-[#121212] to-transparent" />
          </div>
        </div>
      </section>

      <section className="mb-12 text-center">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-green-400">
          {t("premiumBenefitsEyebrow")}
        </p>
        <h2 className="mx-auto mt-3 max-w-3xl text-3xl font-extrabold sm:text-4xl">
          {t("premiumBenefitsTitle")}
        </h2>
        <div className="mt-7 grid gap-3 text-left sm:grid-cols-3">
          {["premiumAdFree", "premiumOffline", "premiumOnDemand"].map((benefit) => (
            <div key={benefit} className="flex items-center gap-3 rounded-xl bg-neutral-800/80 p-4">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-500/15 text-green-400">
                <Check size={19} aria-hidden="true" />
              </span>
              <span className="text-sm font-semibold">{t(benefit)}</span>
            </div>
          ))}
        </div>
      </section>

      <section id="premium-plans" className="scroll-mt-6">
        <div className="mx-auto mb-7 max-w-2xl text-center">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-green-400">
            {t("premiumPlansEyebrow")}
          </p>
          <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">{t("choosePlan")}</h2>
          <p className="mt-3 text-neutral-300">{t("premiumPlansDescription")}</p>
        </div>

        <div
          role="group"
          aria-label={t("premiumDuration")}
          className="mb-6 flex justify-center gap-2"
        >
          {[1, 3, 12].map((months) => (
            <button
              key={months}
              type="button"
              aria-pressed={duration === months}
              onClick={() => {
                setDuration(months);
                setSelectedPlan("");
              }}
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                duration === months
                  ? "border-white bg-white text-black"
                  : "border-neutral-600 text-neutral-200 hover:border-white"
              }`}
            >
              {t(months === 1 ? "premiumOneMonth" : months === 3 ? "premiumThreeMonths" : "premiumYear")}
            </button>
          ))}
        </div>

        <div className="grid items-stretch gap-4 lg:grid-cols-3">
          {plans.map((plan, index) => (
            <article
              key={plan.name}
              className={`relative flex flex-col overflow-hidden rounded-2xl border p-6 shadow-xl transition ${
                plan.color
              } ${index === 0 ? "lg:-translate-y-2 lg:shadow-2xl" : ""} ${
                selectedPlan === plan.name ? "ring-4 ring-green-400 ring-offset-2 ring-offset-black" : ""
              }`}
            >
              {index === 0 && (
                <span className="mb-4 w-fit rounded-full bg-sky-950 px-3 py-1 text-xs font-bold text-white">
                  {t("premiumPopular")}
                </span>
              )}
              <h3 className="text-2xl font-extrabold">{t(plan.name)}</h3>
              <p className="mt-1 text-sm text-slate-700">{t(plan.audience)}</p>
              <div className="mt-6 border-t border-black/15 pt-5">
                <p className="text-3xl font-black">
                  {formatPrice(plan.monthlyPriceCents * duration)}
                </p>
                <p className="mt-1 text-sm text-slate-700">
                  {t("premiumPriceDuration", { months: duration })}
                </p>
              </div>
              <ul className="my-6 flex-1 space-y-3 border-t border-black/15 pt-5">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm">
                    <Check size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
                    <span>{t(feature)}</span>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                aria-pressed={selectedPlan === plan.name}
                onClick={() => setSelectedPlan(plan.name)}
                className="min-h-12 w-full rounded-full bg-black px-5 py-3 text-sm font-bold text-white transition hover:scale-[1.02] hover:bg-neutral-800"
              >
                {t(selectedPlan === plan.name ? "premiumPlanSelected" : "premiumChoosePlan")}
              </button>
              {selectedPlan === plan.name && (
                <p role="status" className="mt-3 text-xs leading-5 text-slate-700">
                  {t("premiumDemoNotice")}
                </p>
              )}
            </article>
          ))}
        </div>
        <p className="mt-5 text-center text-xs leading-5 text-neutral-400">
          {t("premiumEstimateNotice")}
        </p>
        <p className="mt-2 text-center text-xs leading-5 text-neutral-500">
          {t("premiumTrialDisclaimer")}
        </p>
      </section>

      <section className="mx-auto mt-16 max-w-4xl">
        <h2 className="mb-5 text-center text-2xl font-extrabold sm:text-3xl">
          {t("premiumFaqTitle")}
        </h2>
        <div className="divide-y divide-neutral-700 border-y border-neutral-700">
          {questions.map(([question, answer]) => (
            <details key={question} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-bold hover:underline">
                {t(question)}
                <ChevronDown size={20} className="shrink-0 transition group-open:rotate-180" aria-hidden="true" />
              </summary>
              <p className="mt-4 max-w-3xl text-sm leading-6 text-neutral-300">{t(answer)}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
