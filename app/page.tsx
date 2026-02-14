'use client';

import React, { useState, useRef, useEffect } from 'react';
import { CalculatorLayout } from '../components/CalculatorLayout';
import { InputSection } from '../components/InputSection';
import { ResultDashboard } from '../components/ResultDashboard';
import { TaxRequest, TaxResult, ScenarioResult, CurvePoint, DisplayPeriod } from '../types/api';

export default function Home() {
  const [result, setResult] = useState<TaxResult | null>(null);
  const [scenarios, setScenarios] = useState<ScenarioResult | null>(null);
  const [curve, setCurve] = useState<CurvePoint[] | null>(null);
  const [referenceNetIncome, setReferenceNetIncome] = useState<number | null>(null);
  const [baseNetIncome, setBaseNetIncome] = useState<number | null>(null); // Base value for slider comparison (0% raise, 100% workload)
  const [userAge, setUserAge] = useState<number>(30);
  const [loading, setLoading] = useState(false);
  const [displayPeriod, setDisplayPeriod] = useState<DisplayPeriod>('yearly');

  const resultsRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to results on mobile when calculation finishes
  useEffect(() => {
    if (result && resultsRef.current && window.innerWidth < 1024) {
      // Small timeout to ensure DOM update (if needed) and smooth UX
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [result]);

  const handleCalculate = async (data: TaxRequest | null, isBaseCalculation?: boolean) => {
    if (!data) {
      setResult(null);
      setScenarios(null);
      setCurve(null);
      return;
    }

    setLoading(true);
    setResult(null);
    setScenarios(null);
    setCurve(null);
    // Store user age for comparison
    setUserAge(data.age || 30);

    try {
      // 1. Main Calculation
      const response = await fetch('/api/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Calculation failed');
      const resultData: TaxResult = await response.json();
      setResult(resultData);

      // Store reference if this is a standard calculation (no custom settings)
      if (!data.simulation_settings) {
        setReferenceNetIncome(resultData.net_income);
      }

      // Store base net income for slider comparison (0% raise, 100% workload in current mode)
      if (isBaseCalculation) {
        setBaseNetIncome(resultData.net_income);
      }

      // 2. Fetch Advanced Data (Parallel)
      // We don't block the UI for these, but we trigger them now
      Promise.all([
        fetch('/api/simulate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        }).then(res => res.json()).then(data => setScenarios(data)),

        fetch('/api/curve', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        }).then(res => res.json()).then(data => setCurve(data))
      ]).catch(err => console.error("Error fetching advanced data", err));

    } catch (error) {
      console.error('Error calculating tax:', error);
    } finally {
      setLoading(false);
    }
  };



  const seoContent = (
    <article className="prose prose-invert prose-slate max-w-none">
      <h2 className="text-3xl font-bold text-white mb-6">Wie funktioniert der Brutto-Netto-Rechner 2026?</h2>
      <p className="text-slate-400 leading-relaxed mb-6">
        Unser <strong>Lohnsteuerrechner für 2026</strong> hilft dir dabei, dein voraussichtliches Netto-Gehalt präzise zu ermitteln.
        Da sich jedes Jahr Beitragsbemessungsgrenzen, Zusatzbeiträge der Krankenkassen und steuerliche Freibeträge ändern, ist eine aktuelle Prognose wichtig für deine Finanzplanung.
        Besonders spannend für 2026: Die erwarteten Anpassungen in der Pflegeversicherung und beim Zusatzbeitrag zur Krankenversicherung.
      </p>

      <div className="grid md:grid-cols-2 gap-8 my-12">
        <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800">
          <h3 className="text-xl font-semibold text-white mb-3">Deine Vorteile</h3>
          <ul className="space-y-2 text-slate-400">
            <li className="flex gap-2"><span className="text-emerald-500">✓</span> Simulation zukünftiger Sozialabgaben</li>
            <li className="flex gap-2"><span className="text-emerald-500">✓</span> Szenario-Analyse (Optimistisch vs. Pessimistisch)</li>
            <li className="flex gap-2"><span className="text-emerald-500">✓</span> 100% Datenschutz: Berechnung im Browser</li>
          </ul>
        </div>
        <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800">
          <h3 className="text-xl font-semibold text-white mb-3">Was wird berechnet?</h3>
          <ul className="space-y-2 text-slate-400">
            <li className="flex gap-2"><span className="text-indigo-400">•</span> Lohnsteuer & Solidaritätszuschlag</li>
            <li className="flex gap-2"><span className="text-indigo-400">•</span> Rentenversicherung & Arbeitslosenversicherung</li>
            <li className="flex gap-2"><span className="text-indigo-400">•</span> Krankenversicherung & Pflegeversicherung</li>
          </ul>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-white mb-4">Warum eine Zukunftsprognose?</h2>
      <p className="text-slate-400 leading-relaxed mb-6">
        Viele Rechner zeigen nur den Ist-Zustand. Doch durch den demografischen Wandel werden die Sozialabgaben in den nächsten Jahren voraussichtlich steigen.
        Unser Tool bietet dir daher nicht nur den Status Quo, sondern auch einen Blick in die Zukunft:
        Was passiert, wenn die Rentenbeiträge steigen? Wie wirkt sich eine Erhöhung der Pflegeversicherung auf dein Netto aus?
        Nutze die Szenarien, um besser vorbereitet zu sein.
      </p>
    </article>
  );

  return (
    <CalculatorLayout
      sidebar={<InputSection onCalculate={handleCalculate} isLoading={loading} hasResult={!!result} displayPeriod={displayPeriod} onDisplayPeriodChange={setDisplayPeriod} />}
      results={
        <div ref={resultsRef} className="scroll-mt-6">
          <ResultDashboard result={result} scenarios={scenarios} referenceNetIncome={referenceNetIncome} baseNetIncome={baseNetIncome} curve={curve} displayPeriod={displayPeriod} onDisplayPeriodChange={setDisplayPeriod} />
        </div>
      }
      content={seoContent}
    />
  );
}
