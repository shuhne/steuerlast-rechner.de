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

  const handleCalculate = async (data: TaxRequest | null) => {
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

  return (
    <CalculatorLayout
      sidebar={<InputSection onCalculate={handleCalculate} isLoading={loading} hasResult={!!result} displayPeriod={displayPeriod} onDisplayPeriodChange={setDisplayPeriod} />}
      results={
        <div ref={resultsRef} className="scroll-mt-6">
          <ResultDashboard result={result} scenarios={scenarios} referenceNetIncome={referenceNetIncome} curve={curve} displayPeriod={displayPeriod} onDisplayPeriodChange={setDisplayPeriod} />
        </div>
      }
    />
  );
}
