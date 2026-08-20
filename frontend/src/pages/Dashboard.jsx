import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import "../App.css";

// =====================================================
// COLOR CONFIGURATION
// =====================================================

const CATEGORY_COLORS = {
  Road: "#3b82f6",
  Garbage: "#22c55e",
  Electricity: "#f59e0b",
  Water: "#06b6d4",
  Traffic: "#8b5cf6",
  Fire: "#ef4444",
  Drainage: "#033933",
  Other: "#64748b",
};

const STATUS_COLORS = {
  Pending: "#f59e0b",
  "In Progress": "#3b82f6",
  Resolved: "#22c55e",
};

const PRIORITY_COLORS = {
  High: "#ef4444",
  Medium: "#f59e0b",
  Low: "#22c55e",
};

// =====================================================
// APP
// =====================================================

function Dashboard(){

  const navigate = useNavigate();

const handleLogout = () => {
  localStorage.removeItem("access_token");
  navigate("/login");
};

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");

  const [aiResult, setAiResult] = useState(null);
  const [riskResult, setRiskResult] = useState(null);
  const [cityAnalytics, setCityAnalytics] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  // =====================================================
  // FETCH COMPLAINTS
  // =====================================================

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get("/api/complaints");

      setComplaints(response.data);
    } catch (err) {
      console.error(err);
      setError("Unable to connect to the backend.");
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // FETCH CITY ANALYTICS
  // =====================================================

  const fetchCityAnalytics = async () => {
    try {
      const response = await axios.get("/api/analytics/city");
      setCityAnalytics(response.data);
    } catch (err) {
      console.error("City analytics error:", err);
    }
  };

  useEffect(() => {
    fetchComplaints();
    fetchCityAnalytics();
  }, []);

  // =====================================================
  // SUBMIT COMPLAINT
  // =====================================================

  const submitComplaint = async (e) => {
    e.preventDefault();

    if (!description.trim() || !location.trim()) {
      setError("Please enter both description and location.");
      setSuccess("");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      setSuccess("");
      setAiResult(null);
      setRiskResult(null);

      // -------------------------------------------------
      // STEP 1: CREATE COMPLAINT
      // -------------------------------------------------

      const response = await axios.post("/api/complaints", {
        description: description,
        location: location,
      });

      console.log("New complaint:", response.data);

      // -------------------------------------------------
      // STEP 2: AI CLASSIFICATION
      // -------------------------------------------------

      try {
        const aiResponse = await axios.post("/api/ai/classify", {
          description: description,
          location: location,
        });

        setAiResult(aiResponse.data);
      } catch (aiError) {
        console.error("AI classification error:", aiError);
      }

      // -------------------------------------------------
      // STEP 3: RISK PREDICTION
      // -------------------------------------------------

      try {
        const riskResponse = await axios.post("/api/ai/risk-predict", {
          description: description,
          location: location,
        });

        setRiskResult(riskResponse.data);
      } catch (riskError) {
        console.error("Risk prediction error:", riskError);
      }

      // -------------------------------------------------
      // STEP 4: SUCCESS
      // -------------------------------------------------

      setSuccess("Complaint submitted successfully!");

      setDescription("");
      setLocation("");

      await fetchComplaints();
      await fetchCityAnalytics();
    } catch (err) {
      console.error("Complaint submission error:", err);

      setError(
        err.response?.data?.detail ||
          "Unable to submit complaint."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // =====================================================
  // UPDATE COMPLAINT
  // =====================================================

  const updateComplaint = async (id, updates) => {
    try {
      await axios.put(`/api/complaints/${id}`, updates);

      setSuccess("Complaint updated successfully!");
      setError("");

      await fetchComplaints();
      await fetchCityAnalytics();
    } catch (err) {
      console.error(err);
      setError("Unable to update complaint.");
    }
  };

  // =====================================================
  // DELETE COMPLAINT
  // =====================================================

  const deleteComplaint = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this complaint?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await axios.delete(`/api/complaints/${id}`);

      setSuccess("Complaint deleted successfully!");
      setError("");

      await fetchComplaints();
      await fetchCityAnalytics();
    } catch (err) {
      console.error(err);
      setError("Unable to delete complaint.");
    }
  };

  // =====================================================
  // DASHBOARD STATISTICS
  // =====================================================

  const totalComplaints = complaints.length;

  const activeComplaints = complaints.filter(
    (complaint) =>
      complaint.status?.toLowerCase() !== "resolved"
  ).length;

  const resolvedComplaints = complaints.filter(
    (complaint) =>
      complaint.status?.toLowerCase() === "resolved"
  ).length;

  const highPriorityComplaints = complaints.filter(
    (complaint) =>
      complaint.priority?.toLowerCase() === "high"
  ).length;

  // =====================================================
  // FILTER COMPLAINTS
  // =====================================================

  const filteredComplaints = complaints.filter((complaint) => {
    const search = searchTerm.toLowerCase();

    const matchesSearch =
      complaint.description
        ?.toLowerCase()
        .includes(search) ||
      complaint.location
        ?.toLowerCase()
        .includes(search);

    const matchesCategory =
      categoryFilter === "All" ||
      complaint.category === categoryFilter;

    const matchesPriority =
      priorityFilter === "All" ||
      complaint.priority === priorityFilter;

    const matchesStatus =
      statusFilter === "All" ||
      complaint.status === statusFilter;

    return (
      matchesSearch &&
      matchesCategory &&
      matchesPriority &&
      matchesStatus
    );
  });

  // =====================================================
  // CATEGORY ANALYTICS
  // =====================================================

  const categoryData = Object.entries(
    complaints.reduce((acc, complaint) => {
      const category = complaint.category || "Other";

      acc[category] = (acc[category] || 0) + 1;

      return acc;
    }, {})
  ).map(([name, count]) => ({
    name,
    count,
    color: CATEGORY_COLORS[name] || CATEGORY_COLORS.Other,
  }));

  // =====================================================
  // STATUS ANALYTICS
  // =====================================================

  const statusData = Object.entries(
    complaints.reduce((acc, complaint) => {
      const status = complaint.status || "Pending";

      acc[status] = (acc[status] || 0) + 1;

      return acc;
    }, {})
  ).map(([name, count]) => ({
    name,
    count,
    color: STATUS_COLORS[name] || "#64748b",
  }));

  // =====================================================
  // PRIORITY ANALYTICS
  // =====================================================

  const priorityData = Object.entries(
    complaints.reduce((acc, complaint) => {
      const priority = complaint.priority || "Medium";

      acc[priority] = (acc[priority] || 0) + 1;

      return acc;
    }, {})
  ).map(([name, count]) => ({
    name,
    count,
    color: PRIORITY_COLORS[name] || "#64748b",
  }));

  // =====================================================
  // CLEAR FILTERS
  // =====================================================

  const clearFilters = () => {
    setSearchTerm("");
    setCategoryFilter("All");
    setPriorityFilter("All");
    setStatusFilter("All");
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="dashboard">

      {/* =================================================
          HEADER
      ================================================= */}

      <header className="dashboard-header">

        <div className="header-content">

          <div className="brand-section">

            <div className="brand-icon">
              🏙️
            </div>

            <div>
              <h1>AI Smart City</h1>

              <p>
                Complaint Management & Smart City Analytics
              </p>
            </div>

          </div>

          <div className="header-actions">

  <div className="system-status">
    <span className="status-dot"></span>
    System Online
  </div>

  <button
    className="logout-button"
    onClick={handleLogout}
  >
    🚪 Logout
  </button>

</div>

        </div>

      </header>

      <main className="dashboard-content">

        {/* =================================================
            ALERTS
        ================================================= */}

        {error && (
          <div className="alert alert-error">
            <span>⚠️</span>
            {error}
          </div>
        )}

        {success && (
          <div className="alert alert-success">
            <span>✅</span>
            {success}
          </div>
        )}

        {/* =================================================
            AI RESULTS
        ================================================= */}

        {(aiResult || riskResult) && (
          <section className="intelligence-results">

            {aiResult && (
              <div
                className="ai-result-card"
                style={{
                  "--accent":
                    CATEGORY_COLORS[aiResult.category] ||
                    "#6366f1",
                }}
              >

                <div className="result-title">
                  <div className="result-icon">
                    🤖
                  </div>

                  <div>
                    <h2>AI Classification</h2>
                    <p>Automated complaint analysis</p>
                  </div>
                </div>

                <div className="result-grid">

                  <div className="result-item">
                    <span>Category</span>
                    <strong>
                      {aiResult.category}
                    </strong>
                  </div>

                  <div className="result-item">
                    <span>Priority</span>
                    <strong
                      className={`priority-text ${aiResult.priority?.toLowerCase()}`}
                    >
                      {aiResult.priority}
                    </strong>
                  </div>

                  <div className="result-item">
                    <span>Confidence</span>
                    <strong>
                      {aiResult.confidence}%
                    </strong>
                  </div>

                </div>

                {aiResult.matched_keywords?.length > 0 && (
                  <div className="keyword-section">
                    <span>Matched Keywords</span>

                    <div className="keywords">
                      {aiResult.matched_keywords.map(
                        (keyword, index) => (
                          <span key={index}>
                            {keyword}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                )}

              </div>
            )}

            {riskResult && (
              <div
                className={`risk-result-card ${
                  riskResult.risk_level?.toLowerCase() || ""
                }`}
              >

                <div className="result-title">

                  <div className="result-icon">
                    🔮
                  </div>

                  <div>
                    <h2>Predictive Risk Analysis</h2>
                    <p>AI-powered risk assessment</p>
                  </div>

                </div>

                <div className="risk-score">

                  <div className="risk-number">
                    {riskResult.risk_score}
                    <small>/100</small>
                  </div>

                  <div>
                    <span>Risk Level</span>
                    <strong>
                      {riskResult.risk_level}
                    </strong>
                  </div>

                </div>

                {riskResult.reasons?.length > 0 && (
                  <div className="risk-factors">

                    <span>Risk Factors</span>

                    <ul>
                      {riskResult.reasons.map(
                        (reason, index) => (
                          <li key={index}>
                            {reason}
                          </li>
                        )
                      )}
                    </ul>

                  </div>
                )}

                {riskResult.critical_keywords?.length > 0 && (
                  <div className="keyword-section">

                    <span>
                      Critical Keywords
                    </span>

                    <div className="keywords danger-keywords">
                      {riskResult.critical_keywords.map(
                        (keyword, index) => (
                          <span key={index}>
                            {keyword}
                          </span>
                        )
                      )}
                    </div>

                  </div>
                )}

              </div>
            )}

          </section>
        )}

        {/* =================================================
            SUBMIT COMPLAINT
        ================================================= */}

        <section className="submission-section">

          <div className="section-heading">

            <div>
              <span className="section-label">
                REPORT AN ISSUE
              </span>

              <h2>Submit a Complaint</h2>

              <p>
                Describe a city issue and let AI classify
                and prioritize it automatically.
              </p>
            </div>

            <div className="submission-icon">
              📝
            </div>

          </div>

          <form onSubmit={submitComplaint}>

            <div className="form-grid">

              <div className="form-group">

                <label>
                  Complaint Description
                </label>

                <textarea
                  value={description}
                  onChange={(e) =>
                    setDescription(e.target.value)
                  }
                  placeholder="Example: There is a large pothole causing accidents on the main road..."
                  rows="5"
                />

              </div>

              <div className="form-group">

                <label>
                  Location
                </label>

                <input
                  type="text"
                  value={location}
                  onChange={(e) =>
                    setLocation(e.target.value)
                  }
                  placeholder="Example: Hyderabad"
                />

                <div className="form-help">
                  📍 Enter the city or affected area
                </div>

              </div>

            </div>

            <button
              className="submit-button"
              type="submit"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <span className="spinner"></span>
                  Analyzing Complaint...
                </>
              ) : (
                <>
                  🚀 Submit & Analyze
                </>
              )}
            </button>

          </form>

        </section>

        {/* =================================================
            CITY INTELLIGENCE
        ================================================= */}

        <section className="city-intelligence">

          <div className="section-heading">

            <div>
              <span className="section-label">
                REAL-TIME OVERVIEW
              </span>

              <h2>🏙️ City Intelligence</h2>

              <p>
                Current city-wide complaint insights
              </p>
            </div>

          </div>

          <div className="stats-grid">

            <div className="stat-card blue">

              <div className="stat-icon">
                📊
              </div>

              <div>
                <span>Total Complaints</span>
                <h3>
                  {cityAnalytics?.total_complaints ??
                    totalComplaints}
                </h3>
                <p>Across the city</p>
              </div>

            </div>

            <div className="stat-card red">

              <div className="stat-icon">
                🚨
              </div>

              <div>
                <span>High Priority</span>
                <h3>
                  {cityAnalytics?.high_priority_count ??
                    highPriorityComplaints}
                </h3>
                <p>Needs attention</p>
              </div>

            </div>

            <div className="stat-card purple">

              <div className="stat-icon">
                🤖
              </div>

              <div>
                <span>Top Category</span>
                <h3 className="text-value">
                  {cityAnalytics?.most_reported_category ||
                    "N/A"}
                </h3>
                <p>Most reported issue</p>
              </div>

            </div>

            <div className="stat-card green">

              <div className="stat-icon">
                📍
              </div>

              <div>
                <span>Most Affected Location</span>
                <h3 className="text-value">
                  {cityAnalytics?.most_affected_location ||
                    "N/A"}
                </h3>
                <p>Highest complaint count</p>
              </div>

            </div>

          </div>

        </section>

        {/* =================================================
            SMART CITY ANALYTICS
        ================================================= */}

        <section className="analytics-section">

          <div className="section-heading">

            <div>
              <span className="section-label">
                DATA VISUALIZATION
              </span>

              <h2>📈 Smart City Analytics</h2>

              <p>
                Visual breakdown of city complaints
              </p>
            </div>

          </div>

          <div className="charts-grid">

            {/* CATEGORY */}

            <div className="chart-card">

              <div className="chart-header">

                <div>
                  <h3>Complaints by Category</h3>
                  <p>Distribution of reported issues</p>
                </div>

                <span className="chart-icon">
                  🏷️
                </span>

              </div>

              <ResponsiveContainer
                width="100%"
                height={320}
              >

                <BarChart
                  data={categoryData}
                  margin={{
                    top: 10,
                    right: 10,
                    left: -15,
                    bottom: 5,
                  }}
                >

                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#e2e8f0"
                  />

                  <XAxis
                    dataKey="name"
                    tick={{
                      fill: "#64748b",
                      fontSize: 12,
                    }}
                    axisLine={false}
                    tickLine={false}
                  />

                  <YAxis
                    allowDecimals={false}
                    tick={{
                      fill: "#64748b",
                      fontSize: 12,
                    }}
                    axisLine={false}
                    tickLine={false}
                  />

                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "none",
                      boxShadow:
                        "0 10px 30px rgba(15,23,42,0.12)",
                    }}
                  />

                  <Bar
                    dataKey="count"
                    name="Complaints"
                    radius={[8, 8, 0, 0]}
                  >
                    {categoryData.map(
                      (entry, index) => (
                        <Cell
                          key={`category-${index}`}
                          fill={entry.color}
                        />
                      )
                    )}
                  </Bar>

                </BarChart>

              </ResponsiveContainer>

              <div className="chart-legend">

                {categoryData.map((item) => (
                  <div
                    className="legend-item"
                    key={item.name}
                  >
                    <span
                      className="legend-dot"
                      style={{
                        backgroundColor: item.color,
                      }}
                    ></span>

                    {item.name}
                  </div>
                ))}

              </div>

            </div>

            {/* STATUS */}

            <div className="chart-card">

              <div className="chart-header">

                <div>
                  <h3>Complaints by Status</h3>
                  <p>Current resolution progress</p>
                </div>

                <span className="chart-icon">
                  📌
                </span>

              </div>

              <ResponsiveContainer
                width="100%"
                height={320}
              >

                <PieChart>

           <Pie
  data={statusData}
  dataKey="count"
  nameKey="name"
  cx="50%"
  cy="45%"
  innerRadius={65}
  outerRadius={105}
  paddingAngle={3}
>
  {statusData.map((entry, index) => (
    <Cell
      key={`status-${index}`}
      fill={STATUS_COLORS[entry.name] || "#94a3b8"}
    />
  ))}
</Pie>

                 <Tooltip
                   formatter={(value, name) => [
                     `${value} complaints`,
                 name
                ]}
              />

              <Legend
                verticalAlign="bottom"
                height={45}
                iconType="circle"
                formatter={(value) => {
                 const item = statusData.find(
                   (entry) => entry.name === value
                  );

                  return `${value} (${item?.count || 0})`;
                }}
              />

        </PieChart>

              </ResponsiveContainer>

              <div className="status-summary">

                {statusData.map((item) => (
                  <div
                    className="summary-item"
                    key={item.name}
                  >
                    <span
                      className="summary-dot"
                      style={{
                        backgroundColor: item.color,
                      }}
                    ></span>

                    <span>
                      {item.name}
                    </span>

                    <strong>
                      {item.count}
                    </strong>

                  </div>
                ))}

              </div>

            </div>

            {/* PRIORITY */}

            <div className="chart-card">

              <div className="chart-header">

                <div>
                  <h3>Complaints by Priority</h3>
                  <p>Urgency distribution</p>
                </div>

                <span className="chart-icon">
                  🚦
                </span>

              </div>

              <ResponsiveContainer
                width="100%"
                height={320}
              >

                <BarChart
                  data={priorityData}
                  margin={{
                    top: 10,
                    right: 10,
                    left: -15,
                    bottom: 5,
                  }}
                >

                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#e2e8f0"
                  />

                  <XAxis
                    dataKey="name"
                    tick={{
                      fill: "#64748b",
                      fontSize: 12,
                    }}
                    axisLine={false}
                    tickLine={false}
                  />

                  <YAxis
                    allowDecimals={false}
                    tick={{
                      fill: "#64748b",
                      fontSize: 12,
                    }}
                    axisLine={false}
                    tickLine={false}
                  />

                  <Tooltip />

                  <Bar
                    dataKey="count"
                    name="Complaints"
                    radius={[8, 8, 0, 0]}
                  >

                    {priorityData.map(
                      (entry, index) => (
                        <Cell
                          key={`priority-${index}`}
                          fill={entry.color}
                        />
                      )
                    )}

                  </Bar>

                </BarChart>

              </ResponsiveContainer>

              <div className="priority-summary">

                {priorityData.map((item) => (
                  <div
                    className="priority-summary-item"
                    key={item.name}
                  >

                    <span
                      style={{
                        backgroundColor: item.color,
                      }}
                    ></span>

                    <div>
                      <strong>
                        {item.name}
                      </strong>

                      <small>
                        {item.count} complaints
                      </small>
                    </div>

                  </div>
                ))}

              </div>

            </div>

          </div>

        </section>

        {/* =================================================
            DASHBOARD STATISTICS
        ================================================= */}

        <section className="quick-stats">

          <div className="quick-stat">
            <span className="quick-icon blue-icon">
              📊
            </span>

            <div>
              <span>Total Complaints</span>
              <strong>{totalComplaints}</strong>
              <small>All complaints</small>
            </div>
          </div>

          <div className="quick-stat">
            <span className="quick-icon orange-icon">
              ⏳
            </span>

            <div>
              <span>Active Complaints</span>
              <strong>{activeComplaints}</strong>
              <small>Pending / In Progress</small>
            </div>
          </div>

          <div className="quick-stat">
            <span className="quick-icon green-icon">
              ✅
            </span>

            <div>
              <span>Resolved</span>
              <strong>{resolvedComplaints}</strong>
              <small>Successfully resolved</small>
            </div>
          </div>

          <div className="quick-stat">
            <span className="quick-icon red-icon">
              🚨
            </span>

            <div>
              <span>High Priority</span>
              <strong>{highPriorityComplaints}</strong>
              <small>Needs attention</small>
            </div>
          </div>

        </section>

        {/* =================================================
            COMPLAINT MANAGEMENT
        ================================================= */}

        <section className="complaints-section">

          <div className="section-heading complaint-heading">

            <div>
              <span className="section-label">
                COMPLAINT MANAGEMENT
              </span>

              <h2>📋 Recent Complaints</h2>

              <p>
                Manage, filter and track reported issues
              </p>
            </div>

            <button
              className="refresh-button"
              onClick={fetchComplaints}
            >
              🔄 Refresh
            </button>

          </div>

          {/* FILTERS */}

          <div className="filters-card">

            <div className="search-wrapper">

              <span>🔍</span>

              <input
                type="text"
                placeholder="Search complaints or location..."
                value={searchTerm}
                onChange={(e) =>
                  setSearchTerm(e.target.value)
                }
              />

            </div>

            <select
              value={categoryFilter}
              onChange={(e) =>
                setCategoryFilter(e.target.value)
              }
            >
              <option value="All">
                All Categories
              </option>

              <option value="Road">Road</option>
              <option value="Garbage">Garbage</option>
              <option value="Electricity">
                Electricity
              </option>
              <option value="Water">Water</option>
              <option value="Traffic">Traffic</option>
              <option value="Fire">Fire</option>
              <option value="Drainage">Drainage</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) =>
                setPriorityFilter(e.target.value)
              }
            >
              <option value="All">
                All Priorities
              </option>

              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value)
              }
            >
              <option value="All">
                All Statuses
              </option>

              <option value="Pending">
                Pending
              </option>

              <option value="In Progress">
                In Progress
              </option>

              <option value="Resolved">
                Resolved
              </option>
            </select>

            <button
              className="clear-button"
              onClick={clearFilters}
            >
              Clear Filters
            </button>

          </div>

          {/* RESULT COUNT */}

          <div className="result-count">
            Showing{" "}
            <strong>
              {filteredComplaints.length}
            </strong>{" "}
            of{" "}
            <strong>
              {complaints.length}
            </strong>{" "}
            complaints
          </div>

          {/* COMPLAINT LIST */}

          {loading ? (

            <div className="empty-state">
              <div className="loading-spinner"></div>
              <p>Loading complaints...</p>
            </div>

          ) : complaints.length === 0 ? (

            <div className="empty-state">
              <div>📭</div>
              <h3>No complaints found</h3>
              <p>
                There are currently no complaints in the
                system.
              </p>
            </div>

          ) : filteredComplaints.length === 0 ? (

            <div className="empty-state">
              <div>🔍</div>
              <h3>No matching complaints</h3>
              <p>
                Try changing your search or filters.
              </p>
            </div>

          ) : (

            <div className="complaints-list">

              {filteredComplaints.map(
                (complaint) => {

                  const categoryColor =
                    CATEGORY_COLORS[
                      complaint.category
                    ] || CATEGORY_COLORS.Other;

                  return (
                    <div
                      className="complaint-card"
                      key={complaint.id}
                      style={{
                        "--category-color":
                          categoryColor,
                      }}
                    >

                      <div className="complaint-top">

                        <div className="complaint-id">
                          #{complaint.id}
                        </div>

                        <span
                          className="category-badge"
                          style={{
                            backgroundColor:
                              `${categoryColor}18`,
                            color: categoryColor,
                          }}
                        >
                          {complaint.category}
                        </span>

                      </div>

                      <h3>
                        {complaint.description}
                      </h3>

                      <div className="complaint-location">
                        📍 {complaint.location}
                      </div>

                      <div className="complaint-controls">

                        <label>
                          <span>Priority</span>

                          <select
                            value={
                              complaint.priority
                            }
                            onChange={(e) =>
                              updateComplaint(
                                complaint.id,
                                {
                                  priority:
                                    e.target.value,
                                }
                              )
                            }
                            style={{
                              borderColor:
                                PRIORITY_COLORS[
                                  complaint.priority
                                ] || "#cbd5e1",
                            }}
                          >
                            <option value="Low">
                              Low
                            </option>

                            <option value="Medium">
                              Medium
                            </option>

                            <option value="High">
                              High
                            </option>
                          </select>
                        </label>

                        <label>
                          <span>Status</span>

                          <select
                            value={
                              complaint.status
                            }
                            onChange={(e) =>
                              updateComplaint(
                                complaint.id,
                                {
                                  status:
                                    e.target.value,
                                }
                              )
                            }
                            style={{
                              borderColor:
                                STATUS_COLORS[
                                  complaint.status
                                ] || "#cbd5e1",
                            }}
                          >
                            <option value="Pending">
                              Pending
                            </option>

                            <option value="In Progress">
                              In Progress
                            </option>

                            <option value="Resolved">
                              Resolved
                            </option>
                          </select>
                        </label>

                        <button
                          className="delete-button"
                          onClick={() =>
                            deleteComplaint(
                              complaint.id
                            )
                          }
                        >
                          🗑️ Delete
                        </button>

                      </div>

                    </div>
                  );
                }
              )}

            </div>

          )}

        </section>

      </main>

      {/* =================================================
          FOOTER
      ================================================= */}

      <footer className="dashboard-footer">
        <p>
          AI Smart City Complaint Management Platform
        </p>

        <span>
          Powered by AI & Predictive Analytics
        </span>
      </footer>

    </div>
  );
}

export default Dashboard;