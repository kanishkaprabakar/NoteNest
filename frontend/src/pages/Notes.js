import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Notes() {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [reminderAt, setReminderAt] = useState("");
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [summaries, setSummaries] = useState({});

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotes();
    if (Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);

  const fetchNotes = async () => {
    const res = await fetch("http://localhost:5000/api/notes", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setNotes(data);
    checkReminders(data);
  };

  const checkReminders = (notesData) => {
    notesData.forEach((note) => {
      if (note.reminderAt) {
        const reminderTime = new Date(note.reminderAt).getTime();
        const now = new Date().getTime();
        if (reminderTime > now) {
          setTimeout(() => {
            new Notification("⏰ Reminder", {
              body: `${note.title} - ${note.content}`,
            });
          }, reminderTime - now);
        }
      }
    });
  };

  // Add or Update
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editId) {
      await fetch(`http://localhost:5000/api/notes/${editId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, content, reminderAt }),
      });
      setEditId(null);
    } else {
      await fetch("http://localhost:5000/api/notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, content, reminderAt }),
      });
    }
    setTitle("");
    setContent("");
    setReminderAt("");
    fetchNotes();
  };

  const deleteNote = async (id) => {
    await fetch(`http://localhost:5000/api/notes/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchNotes();
  };

  const startEdit = (note) => {
    setTitle(note.title);
    setContent(note.content);
    setReminderAt(note.reminderAt ? note.reminderAt.slice(0, 16) : "");
    setEditId(note._id);
  };

  // 🔍 Search Filter
  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(search.toLowerCase()) ||
      note.content.toLowerCase().includes(search.toLowerCase())
  );

  // 🌙 Dark Mode Toggle
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // 🧠 Smart AI-like Summary (simple logic)
  const summarizeNote = (note) => {
    const sentences = note.content.split(".");
    const summary =
      sentences.length > 2
        ? sentences.slice(0, 2).join(".") + "."
        : note.content;
    setSummaries({ ...summaries, [note._id]: summary });
  };

  // 📄 Download PDF
  const downloadPDF = (note) => {
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>${note.title}</title>
        </head>
        <body>
          <h1>${note.title}</h1>
          <p>${note.content}</p>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div
      style={{
        ...styles.container,
        background: darkMode ? "#1f2937" : "#faf5ff",
        color: darkMode ? "#fff" : "#000",
      }}
    >
      <button style={styles.logoutBtn} onClick={logout}>
        Logout
      </button>

      <button style={styles.darkBtn} onClick={toggleDarkMode}>
        {darkMode ? "☀ Light Mode" : "🌙 Dark Mode"}
      </button>

      <h1 style={styles.heading}>My Notes 💜</h1>

      {/* 🔍 Search */}
      <input
        style={styles.input}
        placeholder="Search notes..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Form */}
      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          style={styles.input}
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <textarea
          style={styles.textarea}
          placeholder="Content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        />
        <input
          type="datetime-local"
          style={styles.input}
          value={reminderAt}
          onChange={(e) => setReminderAt(e.target.value)}
        />
        <button style={styles.addBtn}>
          {editId ? "Update Note" : "Add Note"}
        </button>
      </form>

      {/* Notes */}
      <div style={styles.grid}>
        {filteredNotes.map((note) => (
          <div key={note._id} style={styles.card}>
            <h3>{note.title}</h3>
            <p>{note.content}</p>

            {summaries[note._id] && (
              <p style={{ fontStyle: "italic", color: "#10b981" }}>
                🧠 Summary: {summaries[note._id]}
              </p>
            )}

            {note.reminderAt && (
              <p style={styles.reminder}>
                ⏰ {new Date(note.reminderAt).toLocaleString()}
              </p>
            )}

            <div style={styles.actions}>
              <button style={styles.editBtn} onClick={() => startEdit(note)}>
                ✏ Edit
              </button>

              <button
                style={styles.summaryBtn}
                onClick={() => summarizeNote(note)}
              >
                🧠 Summarise
              </button>

              <button
                style={styles.pdfBtn}
                onClick={() => downloadPDF(note)}
              >
                📥 PDF
              </button>

              <button
                style={styles.deleteBtn}
                onClick={() => deleteNote(note._id)}
              >
                🗑 Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: "30px",
    minHeight: "100vh",
    fontFamily: "sans-serif",
    position: "relative",
  },
  logoutBtn: {
    position: "absolute",
    top: 20,
    right: 20,
    padding: "8px 15px",
    background: "#ef4444",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  darkBtn: {
    position: "absolute",
    top: 20,
    left: 20,
    padding: "8px 15px",
    background: "#111827",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
  heading: {
    textAlign: "center",
    marginBottom: "20px",
    color: "#7c3aed",
  },
  form: {
    maxWidth: "500px",
    margin: "0 auto 30px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  input: {
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #ddd",
  },
  textarea: {
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #ddd",
    minHeight: "80px",
  },
  addBtn: {
    background: "#7c3aed",
    color: "#fff",
    border: "none",
    padding: "10px",
    borderRadius: "6px",
    fontWeight: "bold",
    cursor: "pointer",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
    gap: "20px",
  },
  card: {
    padding: "15px",
    borderRadius: "12px",
    background: "#f3e8ff",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  },
  actions: {
    marginTop: "10px",
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
  },
  editBtn: {
    background: "#4f46e5",
    color: "#fff",
    border: "none",
    padding: "6px 12px",
    borderRadius: "6px",
    cursor: "pointer",
  },
  deleteBtn: {
    background: "#ef4444",
    color: "#fff",
    border: "none",
    padding: "6px 12px",
    borderRadius: "6px",
    cursor: "pointer",
  },
  summaryBtn: {
    background: "#10b981",
    color: "#fff",
    border: "none",
    padding: "6px 12px",
    borderRadius: "6px",
    cursor: "pointer",
  },
  pdfBtn: {
    background: "#f59e0b",
    color: "#fff",
    border: "none",
    padding: "6px 12px",
    borderRadius: "6px",
    cursor: "pointer",
  },
  reminder: {
    fontSize: 12,
    color: "#6b7280",
  },
};

export default Notes;