import { Eye, Link2, BarChart3 } from 'lucide-react';

import { useDashboard } from './context/DashboardContext';

export default function AnalyticsTab() {
  const { analytics } = useDashboard();
  if (!analytics) return <p>No analytics data available.</p>;

  return (
    <>
      {/* Metric Summary Cards */}
      <div className="analytics-grid">
        <div className="stat-card">
          <div className="stat-icon"><Eye size={20} /></div>
          <div className="stat-info">
            <span className="stat-label">Page Views</span>
            <span className="stat-value">{analytics.metrics.totalViews}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><Link2 size={20} /></div>
          <div className="stat-info">
            <span className="stat-label">Link Clicks</span>
            <span className="stat-value">{analytics.metrics.totalClicks}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ color: 'var(--accent-secondary)', backgroundColor: 'rgba(236,72,153,0.1)' }}><BarChart3 size={20} /></div>
          <div className="stat-info">
            <span className="stat-label">CTR Average</span>
            <span className="stat-value">{analytics.metrics.ctr}%</span>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="charts-row">
        {/* Traffic Timeline Chart (HTML simulated bar-chart) */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Analytics Performance Timeline</h3>
            <div className="chart-legend">
              <div className="legend-item"><div className="legend-color views"></div><span>Views</span></div>
              <div className="legend-item"><div className="legend-color clicks"></div><span>Clicks</span></div>
            </div>
          </div>
          <div className="chart-body">
            <div className="chart-axis-y">
              <span>10</span>
              <span>5</span>
              <span>0</span>
            </div>
            <div className="chart-bars-container">
              {[
                { hour: '10:00', views: 3, clicks: 1 },
                { hour: '11:00', views: 4, clicks: 2 },
                { hour: '12:00', views: 6, clicks: 3 },
                { hour: '13:00', views: 8, clicks: 4 },
                { hour: '14:00 (Now)', views: analytics.metrics.totalViews || 1, clicks: analytics.metrics.totalClicks || 0 }
              ].map((bar, i) => {
                const maxVal = 10;
                const viewsHeight = `${Math.min((bar.views / maxVal) * 100, 100)}%`;
                const clicksHeight = `${Math.min((bar.clicks / maxVal) * 100, 100)}%`;

                return (
                  <div key={i} className="chart-bar-wrapper">
                    <div className="chart-bar-group">
                      <div className="chart-bar-views" style={{ height: viewsHeight }}>
                        <div className="bar-tooltip">Views: {bar.views}</div>
                      </div>
                      <div className="chart-bar-clicks" style={{ height: clicksHeight }}>
                        <div className="bar-tooltip">Clicks: {bar.clicks}</div>
                      </div>
                    </div>
                    <div className="chart-label">{bar.hour}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Referrers */}
        <div className="chart-card">
          <h3 style={{ marginBottom: '1.25rem' }}>Top Referrers</h3>
          <div className="referral-list">
            {analytics.referralData.map((row, idx) => (
              <div key={idx} className="referral-row">
                <div className="referral-row-header">
                  <span style={{ fontWeight: '500' }}>{row.source}</span>
                  <span style={{ color: 'var(--text-secondary)' }}>{row.count} ({row.percentage}%)</span>
                </div>
                <div className="referral-bar-bg">
                  <div className="referral-bar-fill" style={{ width: `${row.percentage}%` }}></div>
                </div>
              </div>
            ))}
            {analytics.referralData.length === 0 && <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1rem 0' }}>No referrer data logged yet.</p>}
          </div>
        </div>
      </div>

      {/* Link Clicks Performance */}
      <section className="editor-card">
        <h2 className="card-title">Ranking Click Performance</h2>
        <div className="table-card">
          <table className="perf-table">
            <thead>
              <tr>
                <th>Link Destination Title</th>
                <th>Target URL Link</th>
                <th>Clicks logged</th>
              </tr>
            </thead>
            <tbody>
              {analytics.linkPerformance.map((row) => (
                <tr key={row.id}>
                  <td style={{ fontWeight: '500' }}>{row.title}</td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}><code>{row.url}</code></td>
                  <td style={{ fontWeight: '700', color: 'var(--accent-primary)' }}>{row.clicks} clicks</td>
                </tr>
              ))}
              {analytics.linkPerformance.length === 0 && <tr><td colSpan="3" style={{ textAlign: 'center' }}>No links configuration found.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
