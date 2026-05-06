import React, { useState } from "react";
import { toast } from "sonner";
import Landing from "../components/Landing";
import Wizard from "../components/Wizard";
import Disclaimer from "../components/Disclaimer";
import PetLoader from "../components/PetLoader";
import Dashboard from "../components/Dashboard";
import ProTip from "../components/ProTip";
import { generatePlan } from "../lib/api";
import { useApp } from "../context/AppContext";

export default function Home() {
  const { lang } = useApp();
  const [phase, setPhase] = useState("landing"); // landing | wizard | loading | dashboard
  const [pendingData, setPendingData] = useState(null);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [plan, setPlan] = useState(null);
  const [loadingDone, setLoadingDone] = useState(false);
  const [tipNonce, setTipNonce] = useState(0);

  const reset = () => {
    setPhase("landing");
    setPlan(null);
    setPendingData(null);
    setLoadingDone(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleWizardSubmit = (data) => {
    setPendingData(data);
    setShowDisclaimer(true);
  };

  const handleAccept = async () => {
    setShowDisclaimer(false);
    if (!pendingData) return;
    setPhase("loading");
    setLoadingDone(false);

    const payload = {
      ...pendingData,
      language: lang,
      model_choice: "gpt-5.2",
    };

    const started = Date.now();
    try {
      const res = await generatePlan(payload);
      // Ensure min 4.5s of loader so the animation reads as intentional
      const elapsed = Date.now() - started;
      const minDuration = 4500;
      if (elapsed < minDuration) {
        await new Promise((r) => setTimeout(r, minDuration - elapsed));
      }
      setPlan(res);
      setLoadingDone(true);
      await new Promise((r) => setTimeout(r, 900));
      setPhase("dashboard");
      setTipNonce((n) => n + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      console.error(e);
      toast.error("Could not generate your plan. Please try again.");
      setPhase("wizard");
    }
  };

  return (
    <>
      {phase === "landing" && <Landing onStart={() => setPhase("wizard")} />}
      {phase === "wizard" && <Wizard onSubmit={handleWizardSubmit} loading={false} />}
      {phase === "dashboard" && plan && <Dashboard plan={plan} onReset={reset} />}
      <Disclaimer open={showDisclaimer} onAccept={handleAccept} onClose={() => setShowDisclaimer(false)} />
      <PetLoader active={phase === "loading"} done={loadingDone} />
      {phase === "dashboard" && plan && <ProTip nonce={tipNonce} initialTip={plan.pro_tip} />}
    </>
  );
}
