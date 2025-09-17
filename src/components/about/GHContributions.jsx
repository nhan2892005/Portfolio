import React, { useEffect, useState } from "react";

export default function GithubContributions({ username = "nhan2892005", token, minWidthOnMobile = 600 }) {
  const [data, setData] = useState({ days: [], weeks: [], totalContributions: 0 });
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter dates controlled by user
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    if (!username) {
      setError("Username is required");
      setLoading(false);
      return;
    }

    const query = `
      query ($login: String!) {
        user(login: $login) {
          organizations(first: 100) {
            nodes {
              login
              name
              avatarUrl
              url
            }
          }
          contributionsCollection {
            contributionCalendar {
              totalContributions
              weeks {
                contributionDays {
                  date
                  contributionCount
                  color
                }
              }
            }
          }
        }
      }
    `;

    setLoading(true);
    setError(null);
    
    fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ query, variables: { login: username } }),
    })
      .then(async (res) => {
        const json = await res.json();
        
        if (!res.ok) {
          throw new Error(json?.message || `HTTP ${res.status}: ${res.statusText}`);
        }
        
        if (json.errors && json.errors.length > 0) {
          throw new Error(json.errors[0].message);
        }
        
        if (!json.data) {
          throw new Error("No data received from GitHub API");
        }
        
        if (!json.data.user) {
          throw new Error(`User '${username}' not found. Please check the username and make sure the user exists.`);
        }
        
        const user = json.data.user;
        const cal = user.contributionsCollection.contributionCalendar;
        const days = [];
        
        cal.weeks.forEach((w) => {
          w.contributionDays.forEach((d) => days.push(d));
        });
        
        setData({
          days,
          weeks: cal.weeks,
          totalContributions: cal.totalContributions,
        });
        
        // Filter organizations with "hpcc" in the name or login
        const hpccOrgs = user.organizations.nodes.filter(org => 
          org.login.toLowerCase().includes('hpcc') || 
          (org.name && org.name.toLowerCase().includes('hpcc'))
        );
        
        setUserData({
          organizations: hpccOrgs,
        });
      })
      .catch((err) => {
        console.error("GitHub API Error:", err);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, [username, token]);

  // Filter days based on user input
  const filteredDays = data.days.filter((d) => {
    const date = new Date(d.date);
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;
    if (start && date < start) return false;
    if (end && date > end) return false;
    return true;
  });

  // Build weeks from filtered days
  const buildWeeks = () => {
    const weeks = [];
    let currentWeek = [];
    
    filteredDays.forEach((day) => {
      const dayOfWeek = new Date(day.date).getDay();
      
      // Start new week on Sunday
      if (dayOfWeek === 0 && currentWeek.length > 0) {
        weeks.push([...currentWeek]);
        currentWeek = [];
      }
      
      currentWeek.push(day);
    });
    
    // Add remaining days
    if (currentWeek.length > 0) {
      weeks.push(currentWeek);
    }
    
    return weeks;
  };

  const weeks = buildWeeks();
  const totalCommits = filteredDays.reduce((s, d) => s + (d.contributionCount || 0), 0);
  const mostActive = filteredDays.reduce(
    (best, d) => (!best || d.contributionCount > best.contributionCount ? d : best),
    null
  );

  // Custom colors based on commit count
  const colors = ["#ebedf0", "#e99b9bff", "#c44040ff", "#a13030ff", "#6e2121ff"];
  const maxCount = filteredDays.length > 0 ? Math.max(...filteredDays.map(d => d.contributionCount || 0)) : 0;

  const getColorForCount = (count) => {
    if (count === 0) return colors[0]; // level 0: no commits
    if (count < 3) return colors[1]; // level 1: 1-2 commits
    if (count < 7) return colors[2]; // level 2: 3-6 commits
    if (count < 10) return colors[3]; // level 3: 7-9 commits
    return colors[4]; // level 4: 10+ commits
  };

  const renderContributionGraph = () => (
    <div className="contribution-graph" style={{ 
      display: "flex", 
      gap: 3,
      padding: "16px",
      background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
      borderRadius: 12,
      border: "1px solid #e2e8f0",
      boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)"
    }}>
      {weeks.map((week, wi) => (
        <div key={wi} style={{ 
          display: "flex", 
          flexDirection: "column", 
          gap: 3 
        }}>
          {Array.from({ length: 7 }, (_, dayIndex) => {
            const day = week.find(d => new Date(d.date).getDay() === dayIndex);
            return (
              <div
                key={dayIndex}
                style={{
                  width: 11,
                  height: 11,
                  borderRadius: 2,
                  backgroundColor: day ? getColorForCount(day.contributionCount) : "#ebedf0",
                  transition: "all 0.2s ease",
                  cursor: "pointer",
                  border: day?.contributionCount > 0 ? "1px solid rgba(255,255,255,0.8)" : "1px solid transparent"
                }}
                title={day ? `${day.date}: ${day.contributionCount} contributions` : "No data"}
                onMouseEnter={(e) => {
                  e.target.style.transform = "scale(1.2)";
                  e.target.style.boxShadow = "0 2px 8px rgba(0,0,0,0.15)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = "scale(1)";
                  e.target.style.boxShadow = "none";
                }}
              />
            );
          })}
        </div>
      ))}
    </div>
  );

  if (loading) {
    return (
      <div style={{ 
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 40,
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        borderRadius: 16,
        color: "white",
        boxShadow: "0 10px 25px rgba(0,0,0,0.1)"
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ 
            width: 40, 
            height: 40, 
            border: "3px solid rgba(255,255,255,0.3)",
            borderTop: "3px solid white",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
            margin: "0 auto 16px"
          }} />
          <div style={{ fontSize: 16, fontWeight: 600 }}>
            {token ? "Fetching GitHub data..." : "Generating demo data..."}
          </div>
          {!token && (
            <div style={{ fontSize: 14, opacity: 0.8, marginTop: 8 }}>
              No token provided - showing demo data
            </div>
          )}
        </div>
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        padding: 24,
        background: "linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)",
        color: "white",
        borderRadius: 16,
        textAlign: "center",
        boxShadow: "0 10px 25px rgba(238, 90, 36, 0.3)"
      }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
        <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>
          Oops! Something went wrong
        </div>
        <div style={{ fontSize: 14, opacity: 0.9, marginBottom: 16 }}>
          {error}
        </div>
        <div style={{ fontSize: 12, opacity: 0.8 }}>
          {!token && "💡 Try providing a valid GitHub token for real data"}
        </div>
      </div>
    );
  }

  return (
    <div style={{
      background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
      borderRadius: 20,
      padding: 32,
      boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 10px 10px -5px rgb(0 0 0 / 0.04)",
      maxWidth: 900,
      margin: "20px auto",
      position: "relative",
      overflow: "hidden"
    }}>
      {/* Background decoration */}
      <div style={{
        position: "absolute",
        top: -50,
        right: -50,
        width: 200,
        height: 200,
        background: "linear-gradient(135deg, #667eea, #764ba2)",
        borderRadius: "50%",
        opacity: 0.1,
        zIndex: 0
      }} />
      
      <div style={{ position: "relative", zIndex: 1 }}>
        {/* HPCC Organizations */}
        {userData?.organizations?.length > 0 && (
          <div style={{ marginBottom: 32 }}>
            <h4 style={{ 
              margin: "0 0 16px", 
              fontSize: 20,
              fontWeight: 600,
              color: "#1e293b"
            }}>
              🏛️ HPCC Organizations
            </h4>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
              {userData.organizations.map((org, i) => (
                <a
                  key={i}
                  href={org.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    textDecoration: "none", 
                    color: "inherit",
                    background: "white",
                    padding: 16,
                    borderRadius: 12,
                    border: "1px solid #e2e8f0",
                    transition: "all 0.2s ease",
                    minWidth: 200
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 8px 25px rgba(0,0,0,0.15)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <img
                    src={org.avatarUrl}
                    alt={org.name}
                    style={{ 
                      width: 48, 
                      height: 48, 
                      borderRadius: "50%", 
                      marginRight: 12 
                    }}
                  />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 16 }}>
                      {org.name || org.login}
                    </div>
                    <div style={{ fontSize: 14, color: "#64748b" }}>
                      @{org.login}
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Contributions Section */}
        <div>
          <h4 style={{ 
            margin: "0 0 20px", 
            fontSize: 20,
            fontWeight: 600,
            color: "#1e293b"
          }}>
            📊 Contribution Activity
          </h4>

          {/* Date Filters */}
          <div style={{ 
            marginBottom: 20, 
            display: "flex", 
            gap: 16, 
            flexWrap: "wrap",
            alignItems: "center"
          }}>
            <div>
              <label style={{ 
                fontSize: 14, 
                color: "#64748b",
                display: "block",
                marginBottom: 4
              }}>
                From:
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={{ 
                  padding: "8px 12px", 
                  border: "1px solid #d1d5db", 
                  borderRadius: 8,
                  fontSize: 14,
                  background: "white"
                }}
              />
            </div>
            <div>
              <label style={{ 
                fontSize: 14, 
                color: "#64748b",
                display: "block",
                marginBottom: 4
              }}>
                To:
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                style={{ 
                  padding: "8px 12px", 
                  border: "1px solid #d1d5db", 
                  borderRadius: 8,
                  fontSize: 14,
                  background: "white"
                }}
              />
            </div>
            {(startDate || endDate) && (
              <button
                onClick={() => {
                  setStartDate("");
                  setEndDate("");
                }}
                style={{
                  padding: "8px 16px",
                  background: "#ef4444",
                  color: "white",
                  border: "none",
                  borderRadius: 8,
                  fontSize: 14,
                  cursor: "pointer",
                  marginTop: 24,
                  transition: "background 0.2s ease"
                }}
                onMouseEnter={(e) => e.target.style.background = "#dc2626"}
                onMouseLeave={(e) => e.target.style.background = "#ef4444"}
              >
                Clear Filters
              </button>
            )}
          </div>

          {/* Stats Summary */}
          <div style={{ 
            background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)",
            padding: 20,
            borderRadius: 12,
            marginBottom: 20,
            border: "1px solid #bae6fd"
          }}>
            <div style={{ fontSize: 16, color: "#0369a1", marginBottom: 8 }}>
              📈 {startDate || endDate ? "Filtered Period" : "Last 365 Days"}
            </div>
            <div style={{ fontSize: 14, color: "#0f172a" }}>
              <strong style={{ fontSize: 20, color: "#0369a1" }}>
                {totalCommits.toLocaleString()}
              </strong> total contributions
              {mostActive && (
                <>
                  {" • "}
                  <strong>Most active:</strong> {new Date(mostActive.date).toLocaleDateString()} 
                  ({mostActive.contributionCount} contributions)
                </>
              )}
              {startDate || endDate && (
                <>
                  {" • "}
                  <strong>Range:</strong> {startDate || "…"} → {endDate || "…"}
                </>
              )}
            </div>
          </div>

          {/* Contribution Graph */}
          <div style={{ 
            overflowX: "auto", 
            minWidth: minWidthOnMobile 
          }}>
            {renderContributionGraph()}
          </div>

          {/* Legend */}
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: 16,
            fontSize: 12,
            color: "#64748b"
          }}>
            <span>Less</span>
            <div style={{ display: "flex", gap: 3 }}>
              {colors.map((color, i) => (
                <div
                  key={i}
                  style={{
                    width: 10,
                    height: 10,
                    backgroundColor: color,
                    borderRadius: 2
                  }}
                />
              ))}
            </div>
            <span>More</span>
          </div>

          {!token && (
            <div style={{
              marginTop: 20,
              padding: 16,
              background: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
              borderRadius: 12,
              border: "1px solid #f59e0b",
              fontSize: 14,
              color: "#92400e"
            }}>
              💡 <strong>Demo Mode:</strong> This is generated demo data. Provide a GitHub token to see real contribution data.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}