import React, { useState, useRef } from "react";

// PUBLIC_INTERFACE
function NoteEaseContainer() {
  /** Top-level state management for notes, filters, search, and modal */
  const [notes, setNotes] = useState([]); // [{id, title, content, category}]
  const [searchTerm, setSearchTerm] = useState("");
  const [categories, setCategories] = useState(["Personal", "Work", "Ideas", "Other"]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [showEditor, setShowEditor] = useState(false);
  const [editorNote, setEditorNote] = useState(null); // {id, title, content, category}
  const titleInputRef = useRef(null);

  /** COLORS and THEME */
  const COLORS = {
    primary: "#4A90E2",
    secondary: "#FFFFFF",
    accent: "#F5A623",
    background: "#f8fafc",
    text: "#1a222a",
    border: "#e0e7ef",
    chipActive: "#e0f1ff",
    chipBorder: "#b8d8fa"
  };

  /** Util for new ID (since there's no backend) */
  function genId() {
    return "_" + Math.random().toString(36).substr(2, 9);
  }

  // PUBLIC_INTERFACE
  function handleAddNoteClick() {
    setEditorNote({
      id: null,
      title: "",
      content: "",
      category: activeCategory !== "All" ? activeCategory : categories[0]
    });
    setShowEditor(true);
    setTimeout(() => titleInputRef.current && titleInputRef.current.focus(), 150); // focus for usability
  }

  // PUBLIC_INTERFACE
  function handleNoteSave(note) {
    if (!note.title.trim() && !note.content.trim()) {
      setShowEditor(false); // Don't save blank notes
      return;
    }
    if (note.id) {
      setNotes((prev) =>
        prev.map((n) => (n.id === note.id ? { ...note } : n))
      );
    } else {
      setNotes((prev) => [
        {
          ...note,
          id: genId()
        },
        ...prev
      ]);
    }
    // Add category if new
    if (note.category && !categories.includes(note.category)) {
      setCategories((prev) => [...prev, note.category]);
    }
    setShowEditor(false);
  }

  // PUBLIC_INTERFACE
  function handleNoteEdit(note) {
    setEditorNote(note);
    setShowEditor(true);
    setTimeout(() => titleInputRef.current && titleInputRef.current.focus(), 150);
  }

  // PUBLIC_INTERFACE
  function handleNoteDelete(id) {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    setShowEditor(false);
  }

  // PUBLIC_INTERFACE
  function handleCategoryFilter(cat) {
    setActiveCategory(cat);
  }

  // PUBLIC_INTERFACE
  function handleSearchChange(e) {
    setSearchTerm(e.target.value);
  }

  function filterNotes() {
    let viewNotes = notes;
    if (activeCategory !== "All") {
      viewNotes = viewNotes.filter((n) => n.category === activeCategory);
    }
    if (searchTerm.trim()) {
      const needle = searchTerm.toLowerCase();
      viewNotes = viewNotes.filter(
        (n) =>
          n.title.toLowerCase().includes(needle) ||
          n.content.toLowerCase().includes(needle)
      );
    }
    return viewNotes;
  }

  /** Note editor modal UI */
  function NoteEditorModal({ note, onSave, onCancel, onDelete, categories, colors, inputRef }) {
    const [title, setTitle] = useState(note ? note.title : "");
    const [content, setContent] = useState(note ? note.content : "");
    const [category, setCategory] = useState(note && note.category ? note.category : categories[0] || "");
    const [customCategory, setCustomCategory] = useState("");

    function handleSubmit(e) {
      e.preventDefault();
      const cat = customCategory.trim() ? customCategory : category;
      onSave({
        id: note.id,
        title: title.trim(),
        content: content.trim(),
        category: cat
      });
    }

    /** Basic modal style overlay */
    return (
      <div style={{
        position: "fixed", left: 0, top: 0, right: 0, bottom: 0,
        background: "rgba(20,40,70,0.13)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center"
      }}>
        <form style={{
          background: colors.secondary,
          color: colors.text,
          padding: 28,
          borderRadius: 10,
          minWidth: 310,
          width: "93vw",
          maxWidth: 400,
          boxShadow: "0 5px 24px 0 rgba(50,80,160,0.11)",
          border: `1.5px solid ${colors.primary}`,
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }} onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            autoFocus
            style={{
              fontSize: 18,
              fontWeight: 600,
              padding: "10px 8px",
              border: `1.5px solid ${colors.primary}`,
              borderRadius: 4,
              outline: "none",
              background: "#f7fafd",
            }}
            maxLength={48}
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            aria-label="Note title"
          />
          <textarea
            style={{
              fontSize: 15,
              minHeight: 73,
              padding: 8,
              border: `1.3px solid ${colors.primary}`,
              borderRadius: 4,
              background: "#f7fafd",
              outline: "none"
            }}
            placeholder="Note content..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            aria-label="Note content"
            required
          />
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{
                border: `1px solid ${colors.primary}`,
                background: "#faffff",
                borderRadius: 4,
                padding: "7px 12px",
                fontFamily: "inherit"
              }}>
              {categories.map((c) =>
                <option key={c} value={c}>{c}</option>
              )}
            </select>
            <input
              style={{
                border: `1px solid #c9c7ba`,
                background: "#fafafa",
                borderRadius: 4,
                fontFamily: "inherit",
                padding: "7px 8px",
                width: 94
              }}
              maxLength={14}
              placeholder="Or custom"
              value={customCategory}
              onChange={e => setCustomCategory(e.target.value)}
              aria-label="Custom category"
            />
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            {note && note.id && (
              <button
                type="button"
                onClick={() => onDelete(note.id)}
                style={{
                  background: "#fff0f0",
                  color: "#ea4343",
                  border: "1.1px solid #e38",
                  borderRadius: 4,
                  fontWeight: 500,
                  marginRight: 15,
                  padding: "7.5px 15px",
                  cursor: "pointer"
                }}>Delete</button>
            )}
            <button
              type="button"
              onClick={onCancel}
              style={{
                background: "#e5ebf6",
                color: "#4a505a",
                border: "none",
                borderRadius: 4,
                fontWeight: 500,
                padding: "7.5px 15px",
                cursor: "pointer"
              }}>Cancel</button>
            <button
              type="submit"
              style={{
                background: colors.primary,
                color: "#fff",
                border: "none",
                borderRadius: 4,
                fontWeight: 600,
                padding: "7.5px 15px",
                cursor: "pointer"
              }}>
              {note && note.id ? "Save" : "Add"}
            </button>
          </div>
        </form>
      </div>
    );
  }

  /** Categories filter chips */
  function CategoryChips({ categories, active, onClick, colors }) {
    return (
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 7, marginTop: 3 }}>
        <button
          style={{
            fontSize: 15,
            background: active === "All" ? colors.chipActive : colors.secondary,
            color: active === "All" ? colors.primary : colors.text,
            border: `1px solid ${colors.chipActive}`,
            borderRadius: 14,
            padding: "7px 15px",
            fontWeight: active === "All" ? 600 : 400,
            cursor: "pointer"
          }}
          onClick={() => onClick("All")}
        >All</button>
        {categories.map((cat) => (
          <button
            key={cat}
            style={{
              fontSize: 15,
              background: cat === active ? colors.chipActive : colors.secondary,
              color: cat === active ? colors.primary : colors.text,
              border: `1px solid ${colors.chipBorder}`,
              borderRadius: 14,
              padding: "7px 15px",
              fontWeight: cat === active ? 600 : 400,
              cursor: "pointer"
            }}
            onClick={() => onClick(cat)}
          >
            {cat}
          </button>
        ))}
      </div>
    );
  }

  /** Search bar UI */
  function SearchBar({ value, onChange, colors }) {
    return (
      <input
        type="text"
        value={value}
        maxLength={36}
        onChange={onChange}
        placeholder="Search notes…"
        style={{
          width: "100%",
          fontSize: 16,
          border: `1.2px solid ${colors.primary}`,
          borderRadius: 7,
          padding: "10px 13px",
          margin: "18px 0 13px",
          background: "#f8faff",
          color: colors.text,
          outline: "none"
        }}
        aria-label="Search notes"
      />
    );
  }

  /** Note card UI */
  function NoteCard({ note, onEdit, colors }) {
    return (
      <div
        style={{
          background: "#fbfcff",
          border: `1.3px solid ${colors.border}`,
          borderRadius: 8,
          padding: "18px 16px 16px 16px",
          boxShadow: "0 3px 18px 0 rgba(50,90,200,0.045)",
          marginBottom: 13,
          cursor: "pointer",
          position: "relative",
          minHeight: 60
        }}
        onClick={(e) => {
          if (e.target.tagName === "BUTTON") return;
          onEdit(note);
        }}
        tabIndex={0}
        onKeyDown={(e) => (e.key === "Enter" ? onEdit(note) : undefined)}
        aria-label={`Edit note: ${note.title}`}
      >
        <div style={{ color: colors.primary, fontWeight: 700, fontSize: 15, marginBottom: 2 }}>
          {note.title || <span style={{ opacity: 0.6, fontStyle: "italic" }}>Untitled</span>}
        </div>
        <div style={{ color: "#373e4a", fontSize: 14, opacity: 0.9, marginBottom: 5, wordBreak: "break-word" }}>
          {note.content.length > 100 ? note.content.substring(0, 96) + "…" : note.content}
        </div>
        <div style={{ display: "flex", alignItems: "center", marginTop: 2, gap: 5 }}>
          <span style={{
            fontSize: 13,
            padding: "2.5px 9px",
            borderRadius: 12,
            background: "#f1f6fb", border: `1px solid ${colors.chipBorder}`,
            color: "#5876a8", fontWeight: 500,
          }}>{note.category}</span>
        </div>
      </div>
    );
  }

  /** Floating Action Button (FAB) */
  function Fab({ onClick, colors }) {
    return (
      <button
        onClick={onClick}
        aria-label="Add note"
        style={{
          background: colors.accent,
          color: "#fff",
          position: "fixed",
          right: 29,
          bottom: 30,
          width: 63,
          height: 63,
          borderRadius: "100%",
          border: "none",
          outline: "none",
          fontSize: 37,
          fontWeight: 700,
          boxShadow: "0 6px 42px rgba(245,166,35,0.19)",
          cursor: "pointer",
          zIndex: 44,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          transition: "background 0.2s"
        }}
      >+</button>
    );
  }

  /** MAIN RENDER UI */
  return (
    <div style={{
      minHeight: "100vh",
      background: COLORS.background,
      color: COLORS.text,
      paddingTop: 0,
      fontFamily: "'Inter','Roboto','Helvetica','Arial',sans-serif"
    }}>
      {/* Navbar */}
      <nav style={{
        background: COLORS.primary,
        color: COLORS.secondary,
        padding: "13px 0 13px 0",
        boxShadow: "0 2px 14px 0 rgba(74,144,226,0.06)",
        position: "sticky",
        top: 0,
        zIndex: 25,
      }}>
        <div style={{
          maxWidth: 900,
          margin: "0 auto",
          padding: "0 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        }}>
          <div style={{ display: "flex", alignItems: "center", fontSize: 23, fontWeight: 800, letterSpacing: "0.5px", gap: 7 }}>
            <span style={{
              color: COLORS.accent,
              fontWeight: 800,
              fontSize: 30
            }}>✎</span>
            <span>
              NoteEase
              <span style={{ color: COLORS.accent, fontWeight: 600 }}>.</span>
            </span>
          </div>
        </div>
      </nav>
      {/* App Container */}
      <main style={{
        maxWidth: 900,
        margin: "0 auto",
        padding: "0 24px",
        marginTop: 25
      }}>
        {/* Search bar */}
        <SearchBar
          value={searchTerm}
          onChange={handleSearchChange}
          colors={COLORS}
        />
        {/* Category filter chips */}
        <CategoryChips
          categories={categories}
          active={activeCategory}
          onClick={handleCategoryFilter}
          colors={COLORS}
        />
        {/* Notes list */}
        <div style={{
          marginTop: 10,
          marginBottom: 60, // space for FAB
        }}>
          {filterNotes().length === 0 ? (
            <div style={{
              margin: "40px 0",
              color: "#777a9c",
              textAlign: "center",
              opacity: 0.77
            }}>
              <span style={{ fontSize: 30, opacity: 0.17, display: "block" }}>📝</span>
              <div style={{ fontWeight: 500 }}>No notes found.</div>
              <div style={{ fontSize: 14, marginTop: 4 }}>
                Click the <b>+</b> button to create your first note!
              </div>
            </div>
          ) : (
            filterNotes().map((note) => (
              <NoteCard
                note={note}
                key={note.id}
                onEdit={handleNoteEdit}
                colors={COLORS}
              />
            ))
          )}
        </div>
        {/* Editor Modal */}
        {showEditor && (
          <NoteEditorModal
            note={editorNote}
            onSave={handleNoteSave}
            onCancel={() => setShowEditor(false)}
            onDelete={handleNoteDelete}
            categories={categories}
            colors={COLORS}
            inputRef={titleInputRef}
          />
        )}
        {/* FAB */}
        <Fab onClick={handleAddNoteClick} colors={COLORS} />
      </main>
      {/* Footer - optional */}
      <div style={{
        textAlign: "center",
        fontSize: 13,
        color: "#8593b3",
        padding: "20px 0",
        background: "transparent"
      }}>
        &copy; {new Date().getFullYear()} NoteEase
      </div>
    </div>
  );
}

export default NoteEaseContainer;
