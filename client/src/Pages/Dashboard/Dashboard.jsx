import React, { useState, useEffect } from "react";
import Banner from "../../components/Banner";
import Slider from "../../components/Slider";
import About from "../../components/About";
import {
  createDoc,
  getDoc,
  userprofile,
  fetchDocument,
} from "../../Services/Apis";
import "./Dashboard.css";
import { useAuth } from "../../Context/AuthContext";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const header = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      // Fetch all data in parallel
      const [profileRes, ownedDocsRes, sharedDocsRes] = await Promise.all([
        userprofile(),
        getDoc(header),
        fetchDocument(header),
      ]);

      if (profileRes.status !== 200) {
        navigate("*");
        return;
      }

      // Set user data
      setUser(profileRes.data.validuser);
      const currentUserId = profileRes.data.validuser._id;

      // Combine documents from both endpoints
      const allDocs = [
        ...(ownedDocsRes.data || []),
        ...(sharedDocsRes.data || []),
      ];

      // Remove duplicates and filter valid documents
      const uniqueDocs = allDocs.reduce((acc, doc) => {
        // Skip if no document ID
        if (!doc?._id) return acc;

        // Check if document already exists in accumulator
        const exists = acc.some((d) => d._id === doc._id);
        if (!exists) {
          acc.push(doc);
        }
        return acc;
      }, []);

      console.log("All unique documents:", uniqueDocs);
      setDocuments(uniqueDocs);
      setError(null); // Clear any previous errors
    } catch (err) {
      console.error("Full error details:", {
        message: err.message,
        response: err.response?.data,
        stack: err.stack,
      });
      setError("An error occurred while loading documents");
    } finally {
      setLoading(false);
    }
  };

  const handleNewDoc = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const header = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      // Create a new empty document
      const res = await createDoc(
        {
          title: "Untitled Document",
          content: "",
        },
        header
      );

      if (res.status === 200) {
        // Add the new document to the beginning of the documents array
        setDocuments((prevDocs) => [res.data, ...prevDocs]);

        // Navigate to the editor for the new document
        navigate(`/editor/${res.data._id}`);
      } else {
        setError("Failed to create new document");
      }
    } catch (err) {
      console.error("Document creation error:", err);
      setError("Error creating new document");
    }
  };

  const openDocument = (id) => {
    navigate(`/editor/${id}`);
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <div className="error-message">
          {error}
          <button onClick={fetchData}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-container">
        <Banner />
        <Slider />
        <About />

        <section id="documents">
          {user && (
            <h3 className="welcome-message">Welcome back, {user.name}</h3>
          )}
          <div className="documents-header">
            <h2>My Documents</h2>
            <button onClick={handleNewDoc} className="new-doc-btn">
              ➕ New Document
            </button>
          </div>

          {documents.length === 0 ? (
            <p className="no-docs-message">
              No documents found. Create one or get shared access.
            </p>
          ) : (
            <div className="doc-grid">
              {documents.map((doc) => {
                // Handle both populated owner object and owner ID string
                const getOwnerName = () => {
                  if (doc.owner?.name) return doc.owner.name;
                  if (doc.owner === user?._id?.toString()) return user.name;
                  return "Loading...";
                };

                const isOwner =
                  user?._id &&
                  (doc.owner?._id?.toString() === user._id.toString() ||
                    doc.owner?.toString() === user._id.toString());

                const collaboration = doc.collaborators?.find(
                  (c) => c.user?._id?.toString() === user?._id?.toString()
                );

                return (
                  <div key={doc._id} className="document-card">
                    <h3>{doc.title || "Untitled Document"}</h3>
                    <p className="owner-info">Owner: {getOwnerName()}</p>
                    {!isOwner && collaboration && (
                      <p className={`access-badge ${collaboration.access}`}>
                        Access: {collaboration.access}
                      </p>
                    )}
                    <button
                      onClick={() => openDocument(doc._id)}
                      className={`doc-action-btn ${isOwner ? "edit" : "view"}`}
                    >
                      {isOwner ? "✏️ Edit" : "👁️ View"}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      <footer className="dashboard-footer">
        <div className="footer-content">
          <div className="footer-section">
            <h3>SlateSync</h3>
            <p>Collaborative document editing made simple</p>
          </div>
          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li>
                <a href="/dashboard">Dashboard</a>
              </li>
              <li>
                <a href="/about">About</a>
              </li>
              <li>
                <a href="/contact">Contact</a>
              </li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Connect With Us</h4>
            <div className="social-links">
              <a href="#" aria-label="Twitter">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#" aria-label="GitHub">
                <i className="fab fa-github"></i>
              </a>
              <a href="#" aria-label="LinkedIn">
                <i className="fab fa-linkedin"></i>
              </a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>
            &copy; {new Date().getFullYear()} SlateSync. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
