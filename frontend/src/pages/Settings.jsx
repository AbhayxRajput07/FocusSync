import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Save, Trash2, Download, Info } from 'lucide-react';

const Settings = () => {
  const [settings, setSettings] = useState({
    pomodoroLength: 25,
    breakLength: 5,
    inactivityThreshold: 60,
    interventionStrictness: 'standard',
    notificationsEnabled: false,
    soundsEnabled: true,
    interventionSound: 'chime'
  });
  
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  
  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = JSON.parse(localStorage.getItem('fs_settings') || '{}');
    setSettings(prev => ({ ...prev, ...savedSettings }));
  }, []);
  
  const handleSave = () => {
    localStorage.setItem('fs_settings', JSON.stringify(settings));
    setSaveMessage('Settings saved successfully!');
    setTimeout(() => setSaveMessage(''), 3000);
  };
  
  const handleExport = () => {
    const sessions = JSON.parse(localStorage.getItem('fs_sessions') || '[]');
    const streak = JSON.parse(localStorage.getItem('fs_streak') || '{}');
    const achievements = JSON.parse(localStorage.getItem('fs_achievements') || '[]');
    const fingerprint = JSON.parse(localStorage.getItem('fs_fingerprint') || '{}');
    
    const exportData = {
      sessions,
      streak,
      achievements,
      fingerprint,
      settings,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `focus-shield-data-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };
  
  const handleClearData = () => {
    localStorage.removeItem('fs_sessions');
    localStorage.removeItem('fs_streak');
    localStorage.removeItem('fs_achievements');
    localStorage.removeItem('fs_fingerprint');
    localStorage.removeItem('fs_focus_debt');
    setShowConfirmDialog(false);
    window.location.reload();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20 sm:pb-8">
      <div>
        <h1 className="text-3xl font-semibold mb-2">Settings</h1>
        <p className="text-muted">Customize your focus experience</p>
      </div>
      
      {saveMessage && (
        <div className="p-4 bg-success/10 border border-success/30 rounded-xl text-success">
          {saveMessage}
        </div>
      )}
      
      {/* Focus Preferences */}
      <div className="p-6 bg-card border border-border rounded-2xl space-y-6">
        <h2 className="text-xl font-semibold flex items-center space-x-2">
          <SettingsIcon className="w-6 h-6 text-accent" />
          <span>Focus Preferences</span>
        </h2>
        
        <div>
          <label className="block text-sm font-medium mb-3">
            Default Pomodoro Length: <span className="text-accent font-bold">{settings.pomodoroLength} min</span>
          </label>
          <input 
            type="range" 
            min="15" 
            max="60" 
            step="5"
            value={settings.pomodoroLength}
            onChange={(e) => setSettings(prev => ({ ...prev, pomodoroLength: parseInt(e.target.value) }))}
            className="w-full h-2 bg-surface rounded-lg appearance-none cursor-pointer accent-accent"
          />
          <div className="flex justify-between text-xs text-muted mt-1">
            <span>15 min</span>
            <span>60 min</span>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-3">
            Default Break Length: <span className="text-accent font-bold">{settings.breakLength} min</span>
          </label>
          <input 
            type="range" 
            min="5" 
            max="20" 
            step="5"
            value={settings.breakLength}
            onChange={(e) => setSettings(prev => ({ ...prev, breakLength: parseInt(e.target.value) }))}
            className="w-full h-2 bg-surface rounded-lg appearance-none cursor-pointer accent-accent"
          />
          <div className="flex justify-between text-xs text-muted mt-1">
            <span>5 min</span>
            <span>20 min</span>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-3">
            Inactivity Threshold: <span className="text-accent font-bold">{settings.inactivityThreshold}s</span>
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[30, 60, 90].map(value => (
              <button
                key={value}
                onClick={() => setSettings(prev => ({ ...prev, inactivityThreshold: value }))}
                className={`py-3 rounded-xl font-semibold transition-all ${
                  settings.inactivityThreshold === value 
                    ? 'bg-accent text-white' 
                    : 'bg-surface text-muted hover:text-primary border border-border'
                }`}
              >
                {value}s
              </button>
            ))}
          </div>
          <p className="text-xs text-muted mt-2">Time before warning triggers when inactive</p>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-3">Intervention Strictness</label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: 'gentle', label: 'Gentle', desc: 'Lenient warnings' },
              { value: 'standard', label: 'Standard', desc: 'Balanced approach' },
              { value: 'strict', label: 'Strict', desc: 'Immediate locks' }
            ].map(option => (
              <button
                key={option.value}
                onClick={() => setSettings(prev => ({ ...prev, interventionStrictness: option.value }))}
                className={`p-4 rounded-xl font-semibold transition-all text-left ${
                  settings.interventionStrictness === option.value 
                    ? 'bg-accent text-white' 
                    : 'bg-surface text-muted hover:text-primary border border-border'
                }`}
              >
                <div className="font-bold mb-1">{option.label}</div>
                <div className="text-xs opacity-80">{option.desc}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Notification Preferences */}
      <div className="p-6 bg-card border border-border rounded-2xl space-y-6">
        <h2 className="text-xl font-semibold">Notification Preferences</h2>
        
        <div className="flex items-center justify-between p-4 bg-surface rounded-xl">
          <div>
            <div className="font-medium">Browser Notifications</div>
            <div className="text-sm text-muted">Get notified when session ends or intervention triggers</div>
          </div>
          <button
            onClick={() => {
              const newValue = !settings.notificationsEnabled;
              if (newValue && 'Notification' in window) {
                Notification.requestPermission().then(permission => {
                  if (permission === 'granted') {
                    setSettings(prev => ({ ...prev, notificationsEnabled: true }));
                  } else {
                    alert('You must allow notifications in your browser settings to enable this feature.');
                  }
                });
              } else {
                setSettings(prev => ({ ...prev, notificationsEnabled: false }));
              }
            }}
            className={`w-12 h-6 rounded-full transition-all ${settings.notificationsEnabled ? 'bg-accent' : 'bg-border'}`}
          >
            <div className={`w-5 h-5 bg-white rounded-full transition-transform ${settings.notificationsEnabled ? 'translate-x-6' : 'translate-x-1'}`}></div>
          </button>
        </div>
        
        <div className="flex items-center justify-between p-4 bg-surface rounded-xl">
          <div>
            <div className="font-medium">Sound Alerts</div>
            <div className="text-sm text-muted">Play sounds for warnings and interventions</div>
          </div>
          <button
            onClick={() => setSettings(prev => ({ ...prev, soundsEnabled: !prev.soundsEnabled }))}
            className={`w-12 h-6 rounded-full transition-all ${settings.soundsEnabled ? 'bg-accent' : 'bg-border'}`}
          >
            <div className={`w-5 h-5 bg-white rounded-full transition-transform ${settings.soundsEnabled ? 'translate-x-6' : 'translate-x-1'}`}></div>
          </button>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-3">Intervention Sound Style</label>
          <div className="grid grid-cols-3 gap-3">
            {['chime', 'buzz', 'none'].map(sound => (
              <button
                key={sound}
                onClick={() => setSettings(prev => ({ ...prev, interventionSound: sound }))}
                className={`py-3 rounded-xl font-semibold transition-all capitalize ${
                  settings.interventionSound === sound 
                    ? 'bg-accent text-white' 
                    : 'bg-surface text-muted hover:text-primary border border-border'
                }`}
              >
                {sound}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Data Management */}
      <div className="p-6 bg-card border border-border rounded-2xl space-y-6">
        <h2 className="text-xl font-semibold">Data Management</h2>
        
        <div className="space-y-3">
          <button
            onClick={handleExport}
            className="w-full py-4 bg-accent/10 border border-accent/30 text-accent rounded-xl font-semibold hover:bg-accent/20 transition-all flex items-center justify-center space-x-2"
          >
            <Download className="w-5 h-5" />
            <span>Export All Data as JSON</span>
          </button>
          
          <button
            onClick={() => setShowConfirmDialog(true)}
            className="w-full py-4 bg-danger/10 border border-danger/30 text-danger rounded-xl font-semibold hover:bg-danger/20 transition-all flex items-center justify-center space-x-2"
          >
            <Trash2 className="w-5 h-5" />
            <span>Clear All Data</span>
          </button>
        </div>
        
        <div className="p-4 bg-warning/10 border border-warning/30 rounded-xl">
          <div className="flex items-start space-x-3">
            <Info className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
            <div className="text-sm text-muted">
              <p className="font-medium text-warning mb-1">Data Storage Notice</p>
              <p>All data is stored locally in your browser. Clearing data is permanent and cannot be undone.</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* About */}
      <div className="p-6 bg-card border border-border rounded-2xl">
        <h2 className="text-xl font-semibold mb-4">About Focus Shield</h2>
        <div className="space-y-3 text-sm text-muted">
          <p><span className="font-medium text-primary">Version:</span> 1.0.0</p>
          <p><span className="font-medium text-primary">Tagline:</span> Your Focus. Enforced.</p>
          <p><span className="font-medium text-primary">Built for:</span> Students who want to eliminate distractions and build unbreakable focus habits</p>
          <p className="pt-3 border-t border-border">
            Focus Shield is an intelligent, real-time auto-disciplinary system that actively monitors your behavior during study sessions and corrects distractions through escalating interventions.
          </p>
        </div>
      </div>
      
      {/* Save Button */}
      <button
        onClick={handleSave}
        className="w-full py-4 bg-accent text-white rounded-xl font-semibold hover:brightness-110 transition-all flex items-center justify-center space-x-2 shadow-glow"
      >
        <Save className="w-5 h-5" />
        <span>Save Settings</span>
      </button>
      
      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-background/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-danger rounded-2xl p-8 max-w-md">
            <h3 className="text-2xl font-bold mb-4 text-danger">Clear All Data?</h3>
            <p className="text-muted mb-6">
              This will permanently delete all your sessions, streaks, achievements, and settings. This action cannot be undone.
            </p>
            <div className="flex space-x-4">
              <button
                onClick={() => setShowConfirmDialog(false)}
                className="flex-1 py-3 border border-border text-primary rounded-xl font-semibold hover:bg-surface transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleClearData}
                className="flex-1 py-3 bg-danger text-white rounded-xl font-semibold hover:brightness-110 transition-all"
              >
                Delete Everything
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
