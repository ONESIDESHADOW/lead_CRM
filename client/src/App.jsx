import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FaEdit,
  FaTrash,
  FaSearch,
  FaPlus,
  FaArrowRight,
  FaArrowLeft,
} from "react-icons/fa";

const App = () => {
  // State Management
  const [leads, setLeads] = useState([]);
  const [stats, setStats] = useState({ total: 0, converted: 0, lost: 0 });
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form State
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    status: "New",
    notes: "",
  });

  // Load Leads & Stats
  const fetchLeads = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(
        `http://localhost:5000/api/leads?search=${search}&page=${page}`,
      );
      setLeads(data.leads);
      setTotalPages(data.pages);
      setStats({ total: data.total, converted: 0, lost: 0 });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [search, page]);

  useEffect(() => {
    const converted = leads.filter((l) => l.status === "Converted").length;
    const lost = leads.filter((l) => l.status === "Lost").length;
    setStats((s) => ({ ...s, converted, lost }));
  }, [leads]);

  // Handlers
  const handleInputChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEdit) {
        await axios.put(
          `http://localhost:5000/api/leads/${formData._id}`,
          formData,
        );
      } else {
        await axios.post("http://localhost:5000/api/leads", formData);
      }
      setShowModal(false);
      fetchLeads();
    } catch (error) {
      alert("Error saving lead");
    }
  };

  const handleEdit = (lead) => {
    setFormData(lead);
    setIsEdit(true);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure?")) {
      await axios.delete(`http://localhost:5000/api/leads/${id}`);
      fetchLeads();
    }
  };

  // Get status badge color
  const getStatusStyle = (status) => {
    const styles = {
      Converted: { background: "#d1fae5", color: "#065f46" },
      Lost: { background: "#fee2e2", color: "#991b1b" },
      Contacted: { background: "#fef3c7", color: "#92400e" },
      Qualified: { background: "#e0e7ff", color: "#3730a3" },
      New: { background: "#f3f4f6", color: "#374151" },
    };
    return styles[status] || styles.New;
  };

  return (
    <div className="container">
      <div className="header">
        <h1> Sales CRM</h1>
        <button
          className="btn"
          onClick={() => {
            setIsEdit(false);
            setFormData({
              name: "",
              email: "",
              phone: "",
              company: "",
              status: "New",
              notes: "",
            });
            setShowModal(true);
          }}
        >
          <FaPlus /> Add Lead
        </button>
      </div>

      {/* Stats Dashboard */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Leads</h3>
          <div className="stat-number">{stats.total}</div>
        </div>
        <div className="stat-card">
          <h3>Converted</h3>
          <div className="stat-number" style={{ color: "#10b981" }}>
            {stats.converted}
          </div>
        </div>
        <div className="stat-card">
          <h3>Lost</h3>
          <div className="stat-number" style={{ color: "#ef4444" }}>
            {stats.lost}
          </div>
        </div>
      </div>

      {/* Search & Controls */}
      <div className="controls">
        <div style={{ position: "relative", flex: 1 }}>
          <FaSearch
            style={{ position: "absolute", left: 10, top: 12, color: "#999" }}
          />
          <input
            type="text"
            className="search-bar"
            style={{ paddingLeft: 35 }}
            placeholder="Search leads by name, email, or company..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </div>

      {/* Leads Table */}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Company</th>
              <th>Status</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr key={lead._id}>
                <td data-label="Name">
                  <strong>{lead.name}</strong>
                </td>
                <td data-label="Email">{lead.email}</td>
                <td data-label="Phone">{lead.phone}</td>
                <td data-label="Company">{lead.company}</td>
                <td data-label="Status">
                  <span
                    style={{
                      padding: "4px 8px",
                      borderRadius: "12px",
                      fontSize: "12px",
                      ...getStatusStyle(lead.status),
                    }}
                  >
                    {lead.status}
                  </span>
                </td>
                <td data-label="Created">
                  {new Date(lead.createdAt).toLocaleDateString()}
                </td>
                <td data-label="Actions">
                  <button
                    className="btn btn-secondary"
                    style={{ marginRight: 5 }}
                    onClick={() => handleEdit(lead)}
                  >
                    <FaEdit />
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() => handleDelete(lead._id)}
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}


      <div className="pagination">
        <button
          className="btn btn-secondary"
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
        >
          <FaArrowLeft />
        </button>
        <span>
          Page {page} of {totalPages}
        </span>
        <button
          className="btn btn-secondary"
          disabled={page === totalPages}
          onClick={() => setPage(page + 1)}
        >
          <FaArrowRight />
        </button>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>{isEdit ? "Edit Lead" : "Add New Lead"}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Name *</label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>Company</label>
                <input
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                >
                  <option value="New">New</option>
                  <option value="Contacted">Contacted</option>
                  <option value="Qualified">Qualified</option>
                  <option value="Converted">Converted</option>
                  <option value="Lost">Lost</option>
                </select>
              </div>
              <div className="form-group">
                <label>Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows="3"
                />
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button type="submit" className="btn">
                  {isEdit ? "Update" : "Save"}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
