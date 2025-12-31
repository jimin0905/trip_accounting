
import React, { useState, useEffect, useRef } from 'react';
import { TripSettings } from './types';
import ExpenseTracker from './components/ExpenseTracker';

const App: React.FC = () => {
  // Trip Settings Management
  const [tripSettings, setTripSettings] = useState<TripSettings>(() => {
    const saved = localStorage.getItem('bkk_trip_settings');
    // Default to a recent/upcoming date range if nothing saved
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 5);
    
    const fmt = (d: Date) => d.toISOString().split('T')[0];
    const defaultSettings = { startDate: fmt(today), endDate: fmt(nextWeek), currency: 'THB' };

    if (saved) {
      const parsed = JSON.parse(saved);
      // Merge with default to ensure currency exists if reading old data
      return { ...defaultSettings, ...parsed };
    }
    return defaultSettings;
  });

  // Reference to ExpenseTracker to trigger cloud sync when settings change
  const expenseTrackerRef = useRef<{ pushSettings: (settings: TripSettings) => Promise<void> } | null>(null);

  useEffect(() => {
    localStorage.setItem('bkk_trip_settings', JSON.stringify(tripSettings));
  }, [tripSettings]);

  const handleSettingsUpdate = async (newSettings: TripSettings) => {
    setTripSettings(newSettings);
    // Push new settings to Firebase if connected
    if (expenseTrackerRef.current) {
      await expenseTrackerRef.current.pushSettings(newSettings);
    }
  };

  return (
    <div className="min-h-screen font-sans text-stone-800 bg-[#EEECE6] flex justify-center sm:items-center sm:py-8">
      {/* 
        Container Logic:
        - Mobile: Full width, full height
        - Desktop: Centered card like a mobile app simulator
        - Background Colors Updated: Outer #EEECE6, Inner #FDFBF6
      */}
      <div className="w-full sm:max-w-[450px] h-[100dvh] sm:h-[850px] bg-[#FDFBF6] sm:rounded-[2.5rem] sm:shadow-2xl sm:border-[8px] sm:border-stone-800 overflow-hidden relative flex flex-col">
        <ExpenseTracker 
          ref={expenseTrackerRef}
          tripSettings={tripSettings}
          onSettingsSync={(cloudSettings) => setTripSettings(cloudSettings)}
          onUpdateLocalSettings={handleSettingsUpdate}
        />
      </div>
    </div>
  );
};

export default App;