import React, { useState, useEffect } from "react";
import { shareDocument, fetchDocument } from "../Services/Apis";
import toast from "react-hot-toast";
import "./Panel.css";

const ShareAccessPanel = ({ documentId, token }) => {
  const [email, setEmail] = useState("");
  const [access, setAccess] = useState("viewer");
  const [collaborators, setCollaborators] = useState([]);

  const fetching = async () => {
    try {
      const header = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      const response = await fetchDocument(header);

      if (response.data) {
        const doc = response.data.find((d) => d._id === documentId);
        if (doc?.collaborators) {
          // Transform collaborators data
          const formattedCollaborators = doc.collaborators.map((c) => ({
            ...c,
            user: typeof c.user === "string" ? { _id: c.user } : c.user,
          }));
          setCollaborators(formattedCollaborators);
        }
      }
    } catch (error) {
      console.error("Error fetching collaborators:", error);
    }
  };

  useEffect(() => {
    if (token && documentId) {
      fetching();
    }
  }, [token, documentId]);

  const handleShare = async () => {
    try {
      if (!email) {
        alert("Please enter an email");
        return;
      }

      const header = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      const body = { email, access };

      const response = await shareDocument(documentId, body, header);

      if (response.status === 200) {
        toast.success("Document shared successfully!");
        setEmail("");
        setAccess("viewer");
        fetching(); // Refresh list
      } else {
        toast.error(response.data?.error || "Failed to share document");
      }
    } catch (error) {
      console.error("Sharing error:", error);
      toast.error(error.response?.data?.error || "Failed to share document");
    }
  };

  return (
    <div className="share-panel">
      <h2>🔗 Share Document</h2>

      <div className="flex flex-col gap-3">
        <input
          type="email"
          placeholder="Enter email to share"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <select value={access} onChange={(e) => setAccess(e.target.value)}>
          <option value="viewer">Viewer</option>
          <option value="editor">Editor</option>
        </select>

        <button onClick={handleShare} className="share-btn">
          Share Access
        </button>
      </div>

      {/* <h3 className="font-semibold text-base mt-3">👥 Collaborators</h3> */}
      <div className="collaborator-list">
        <h3>👥 Collaborators</h3>
        {collaborators.length > 0 ? (
          collaborators.map((collab) => {
            const user = collab.user;
            const initials = user?.name
              ? user.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .substring(0, 2)
              : "U";

            return (
              <div key={collab._id} className="collaborator-item">
                <div className="collaborator-info">
                  <div className="collaborator-avatar">{initials}</div>
                  <div className="collaborator-name">
                    {user?.name || `User (${user?._id})`}
                  </div>
                </div>
                <span className="collaborator-access">{collab.access}</span>
              </div>
            );
          })
        ) : (
          <p className="text-sm text-gray-500 mt-2">No collaborators yet.</p>
        )}
      </div>
    </div>
  );
};

export default ShareAccessPanel;
