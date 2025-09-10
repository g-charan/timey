import { useState, useEffect } from "react";
import "@/styles/overlay.css";

interface AppUsage {
  name: string;
  timeSpent: number;
  category: string;
  isActive: boolean;
}

export function MetricsPopup() {
  const [appUsage, setAppUsage] = useState<AppUsage[]>([]);

  useEffect(() => {
    // Simulate real-time app tracking with realistic data
    const trackApps = () => {
      const mockApps: AppUsage[] = [
        { 
          name: "VS Code", 
          timeSpent: Math.floor(Math.random() * 120) + 180, // 3-5 hours
          category: "Development", 
          isActive: Math.random() > 0.7 
        },
        { 
          name: "Chrome", 
          timeSpent: Math.floor(Math.random() * 90) + 120, // 2-3.5 hours
          category: "Browser", 
          isActive: Math.random() > 0.8 
        },
        { 
          name: "Slack", 
          timeSpent: Math.floor(Math.random() * 45) + 30, // 30-75 minutes
          category: "Communication", 
          isActive: Math.random() > 0.9 
        },
        { 
          name: "Figma", 
          timeSpent: Math.floor(Math.random() * 60) + 45, // 45-105 minutes
          category: "Design", 
          isActive: Math.random() > 0.85 
        },
        { 
          name: "Terminal", 
          timeSpent: Math.floor(Math.random() * 30) + 20, // 20-50 minutes
          category: "Development", 
          isActive: Math.random() > 0.75 
        },
        { 
          name: "Notion", 
          timeSpent: Math.floor(Math.random() * 40) + 25, // 25-65 minutes
          category: "Productivity", 
          isActive: Math.random() > 0.8 
        }
      ].sort((a, b) => b.timeSpent - a.timeSpent); // Sort by time spent

      setAppUsage(mockApps);
    };

    trackApps();
    const interval = setInterval(trackApps, 3000); // Update every 3 seconds
    return () => clearInterval(interval);
  }, []);

  const formatAppTime = (minutes: number): string => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMins = minutes % 60;
    return remainingMins > 0 ? `${hours}h ${remainingMins}m` : `${hours}h`;
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Development': return '#2ed573';
      case 'Browser': return '#3742fa';
      case 'Communication': return '#ff6348';
      case 'Design': return '#a55eea';
      case 'Productivity': return '#26de81';
      default: return '#778ca3';
    }
  };

  const getTotalTime = () => {
    return appUsage.reduce((total, app) => total + app.timeSpent, 0);
  };

  return (
    <div className="popup-window">
      <div className="popup-header">
        <div className="popup-title">
          <span>📊 App Usage</span>
          <span className="live-indicator">🔴 Live</span>
        </div>
        <div className="total-time">
          Total: {formatAppTime(getTotalTime())}
        </div>
      </div>
      
      <div className="popup-content">
        <div className="app-list">
          {appUsage.map((app, index) => (
            <div key={app.name} className="app-item-popup">
              <div className="app-rank">#{index + 1}</div>
              <div className="app-info">
                <div className="app-name-row">
                  <span className={`app-name ${app.isActive ? 'active' : ''}`}>
                    {app.isActive && <span className="active-dot">●</span>}
                    {app.name}
                  </span>
                  <span className="app-time">{formatAppTime(app.timeSpent)}</span>
                </div>
                <div className="app-category-row">
                  <span 
                    className="app-category"
                    style={{ color: getCategoryColor(app.category) }}
                  >
                    {app.category}
                  </span>
                  <div className="time-bar-container">
                    <div 
                      className="time-bar"
                      style={{ 
                        width: `${(app.timeSpent / Math.max(...appUsage.map(a => a.timeSpent))) * 100}%`,
                        backgroundColor: getCategoryColor(app.category)
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="popup-footer">
        <div className="productivity-score">
          <span className="score-label">Productivity Score:</span>
          <span className="score-value">
            {Math.round((appUsage.filter(app => 
              app.category === 'Development' || app.category === 'Productivity'
            ).reduce((sum, app) => sum + app.timeSpent, 0) / getTotalTime()) * 100)}%
          </span>
        </div>
        <button
          className="view-all-button"
          onClick={() => {
            window.appAPI?.restoreMain();
          }}
        >
          View Analytics
        </button>
      </div>
    </div>
  );
}
