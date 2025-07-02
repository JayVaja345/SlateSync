import React, { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Collaboration from "@tiptap/extension-collaboration";
import CollaborationCursor from "@tiptap/extension-collaboration-cursor";
import { singleDoc, updateDoc } from "../../Services/Apis";
import ShareAccessPanel from "../../Components/ShareAccessPanel";
import { ydoc, getProvider } from "./CollabProvider";
import { useAuth } from "../../Context/AuthContext";
import { DOMSerializer } from "prosemirror-model";
import { EditorState } from "prosemirror-state";
import toast from "react-hot-toast";
import { Toaster } from "react-hot-toast";
import "./EditorPage.css";

const EditorPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [showSharePanel, setShowSharePanel] = useState(false);
  const [title, setTitle] = useState("Untitled Document");
  const [connectionStatus, setConnectionStatus] = useState("connecting");
  const [collabProvider, setCollabProvider] = useState(null);
  const [initialContentLoaded, setInitialContentLoaded] = useState(false);

  useEffect(() => {
    if (!user || !id) return;

    let retryCount = 0;
    const maxRetries = 3;
    const retryDelay = 2000;

    const initializeWithRetry = async () => {
      try {
        const collaboration = getProvider(id);
        const { provider } = collaboration;

        const handleStatusChange = (event) => {
          console.log("Connection status:", event.status);
          setConnectionStatus(event.status);
          if (event.status === "connected") {
            retryCount = 0;
            toast.success("Connected to collaboration server");
          }
        };

        provider.on("status", handleStatusChange);

        provider.on("connection-error", (error) => {
          console.error("WebSocket error:", error);
          if (retryCount < maxRetries) {
            retryCount++;
            const delay = retryDelay * retryCount;
            toast(
              `Connection failed. Retrying in ${
                delay / 1000
              }s... (${retryCount}/${maxRetries})`
            );
            setTimeout(initializeWithRetry, delay);
          } else {
            toast.error("Failed to connect after multiple attempts");
          }
        });

        setCollabProvider(collaboration);

        return () => {
          provider.off("status", handleStatusChange);
          provider.off("connection-error");
          collaboration.destroy();
        };
      } catch (error) {
        console.error("Initialization error:", error);
        if (retryCount < maxRetries) {
          retryCount++;
          setTimeout(initializeWithRetry, retryDelay * retryCount);
        }
      }
    };

    initializeWithRetry();

    return () => {
      // Cleanup handled by destroy functions
    };
  }, [id, user]);

  const extensions = useMemo(() => {
    const baseExtensions = [
      StarterKit.configure({
        history: false,
      }),
      Collaboration.configure({
        document: ydoc,
      }),
    ];

    if (collabProvider?.provider) {
      baseExtensions.push(
        CollaborationCursor.configure({
          provider: collabProvider.provider,
          user: {
            name: user?.name || "Guest",
            color: `#${Math.floor(Math.random() * 16777215)
              .toString(16)
              .padStart(6, "0")}`,
          },
        })
      );
    }

    return baseExtensions;
  }, [collabProvider, user]);

  const editor = useEditor(
    extensions.length > 0
      ? {
          extensions,
          content: "<p>Loading document...</p>",
          onUpdate: ({ editor }) => {
            if (connectionStatus !== "connected") {
              toast("Working offline - changes will sync when reconnected", {
                icon: "⚠️",
                duration: 2000,
              });
            }
          },
        }
      : null
  );

  const handleTitleChange = (e) => {
    setTitle(e.target.value);
  };

  useEffect(() => {
    if (!editor || !id) return;

    const token = localStorage.getItem("token");
    const header = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    const fetchDoc = async () => {
      try {
        const res = await singleDoc(id, header);
        if (res.status === 200) {
          setTitle(res.data.title || "Untitled Document");

          if (res.data.content && connectionStatus !== "connected") {
            editor.commands.setContent(res.data.content);
          }
          setInitialContentLoaded(true);
        }
      } catch (error) {
        console.error("Error fetching document:", error);
      }
    };

    fetchDoc();
  }, [editor, id, connectionStatus]);

  const handleSave = async () => {
    if (!editor || !id) return;

    const token = localStorage.getItem("token");
    const header = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    const state = editor.state;
    const fragment = DOMSerializer.fromSchema(state.schema).serializeFragment(
      state.doc.content
    );
    const div = document.createElement("div");
    div.appendChild(fragment);
    const htmlContent = div.innerHTML;

    toast.promise(updateDoc(header, { title, content: htmlContent }, id), {
      loading: "Saving...",
      success: "Document Saved!",
      error: "❌ Save Failed!",
    });
  };

  useEffect(() => {
    return () => {
      editor?.destroy();
      collabProvider?.destroy();
    };
  }, [editor, collabProvider]);

  if (!initialContentLoaded) {
    return <div className="loading">Loading editor...</div>;
  }

  return (
    <div className="editor-page-container">
      <Toaster position="top-center" reverseOrder={false} />

      <div className="connection-status">
        {connectionStatus === "connected" ? (
          <span className="connected">🟢 Live Collaboration Active</span>
        ) : (
          <div className="disconnected">
            <span>🔴 Disconnected - {connectionStatus}</span>
            <div className="reconnect-guide">
              {connectionStatus === "connecting" &&
                "Attempting to reconnect..."}
              {connectionStatus === "disconnected" && (
                <>
                  <p>Check your internet connection</p>
                  <button onClick={() => window.location.reload()}>
                    Reconnect Now
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      <header className="editor-topbar">
        <h2 className="logo">📝 SlateSync</h2>
        <input
          type="text"
          value={title}
          onChange={handleTitleChange}
          className="doc-title"
          placeholder="Document Title"
        />
        <div className="header-actions">
          <button
            onClick={() => setShowSharePanel(!showSharePanel)}
            className="share-button"
          >
            {showSharePanel ? "🔒 Hide Share" : "🔓 Share"}
          </button>
          <button onClick={handleSave} className="save-button">
            💾 Save Changes
          </button>
        </div>
      </header>

      <div className="editor-content-area">
        <EditorContent editor={editor} />
      </div>

      <div
        className={`share-panel-container ${
          !showSharePanel ? "share-panel-hidden" : ""
        }`}
      >
        <ShareAccessPanel
          documentId={id}
          token={localStorage.getItem("token")}
        />
      </div>
    </div>
  );
};

export default EditorPage;
