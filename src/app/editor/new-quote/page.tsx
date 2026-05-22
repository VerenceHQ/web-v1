"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./QuoteComposer.module.css";
import Logo from "@/components/Logo";

interface Session {
  uid: string;
  name: string;
  role: string;
  avatar: string;
  loggedInAt: string;
}

interface LocalQuote {
  id: string;
  quoteText: string;
  author: string;
  context: string;
  wisdomCommentary: string;
  category: string;
  categorySlug: string;
  date: string;
  status: "draft" | "published";
  type: "quote";
}

export default function QuoteComposer() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);

  // Form inputs state
  const [quoteText, setQuoteText] = useState("");
  const [author, setAuthor] = useState("");
  const [context, setContext] = useState("");
  const [wisdomCommentary, setWisdomCommentary] = useState("");
  const [category, setCategory] = useState("Question & Wisdom");

  useEffect(() => {
    // 1. Session check
    const rawSession = localStorage.getItem("verence_editor_session");
    if (!rawSession) {
      router.replace("/editor/login");
      return;
    }
    setSession(JSON.parse(rawSession));
  }, [router]);

  const handleSave = (status: "draft" | "published") => {
    if (!quoteText.trim()) {
      alert("Please enter the quote citation text.");
      return;
    }
    if (!author.trim()) {
      alert("Please enter the author name.");
      return;
    }

    const newQuote: LocalQuote = {
      id: "quote_" + Date.now(),
      quoteText: quoteText.trim(),
      author: author.trim(),
      context: context.trim() ? context.trim() : "Unspecified Discourse",
      wisdomCommentary: wisdomCommentary.trim() ? wisdomCommentary.trim() : "Reflections on modern philosophy.",
      category: category,
      categorySlug: category.toLowerCase().replace(/ & /g, "-and-").replace(/\s+/g, "-"),
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      status: status,
      type: "quote",
    };

    // Load, append and save to localStorage
    const rawQuotes = localStorage.getItem("verence_local_quotes");
    let currentQuotes: LocalQuote[] = [];
    if (rawQuotes) {
      currentQuotes = JSON.parse(rawQuotes);
    }

    currentQuotes.push(newQuote);
    localStorage.setItem("verence_local_quotes", JSON.stringify(currentQuotes));

    alert(status === "published" ? "Quote is now published and active!" : "Quote draft saved successfully.");
    router.push("/editor/dashboard");
  };

  if (!session) return null;

  return (
    <div className={styles.pageWrapper}>
      {/* Header Actions Navbar */}
      <header className={styles.navbar}>
        <Link href="/editor/dashboard" className={styles.logoArea}>
          <Logo />
          <span>Verence Quote Publisher</span>
        </Link>
        <div className={styles.navActions}>
          <Link href="/editor/dashboard" className={styles.btnBack}>
            Exit
          </Link>
          <button className={styles.btnDraft} onClick={() => handleSave("draft")}>
            Save Draft
          </button>
          <button className={styles.btnPublish} onClick={() => handleSave("published")}>
            Publish Quote
          </button>
        </div>
      </header>

      {/* Grid Composer layout */}
      <main className={styles.composerLayout}>
        
        {/* LEFT PANE: Citation Inputs */}
        <section className={styles.editorPane}>
          <div className={styles.editorScrollContainer}>
            
            <div>
              <h3 className={styles.sectionTitle}>Citation Details</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                <div className={styles.inputGroup}>
                  <label htmlFor="quote-textarea">Quote Text</label>
                  <textarea
                    id="quote-textarea"
                    className={styles.inputField}
                    rows={4}
                    placeholder="Enter the quote text verbatim..."
                    value={quoteText}
                    onChange={(e) => setQuoteText(e.target.value)}
                    style={{ fontSize: "1rem", lineHeight: "1.5" }}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div className={styles.inputGroup}>
                    <label htmlFor="author-input">Author / thinker</label>
                    <input
                      id="author-input"
                      type="text"
                      className={styles.inputField}
                      placeholder="e.g. James Baldwin"
                      value={author}
                      onChange={(e) => setAuthor(e.target.value)}
                    />
                  </div>
                  <div className={styles.inputGroup}>
                    <label htmlFor="category-select">Quote Category</label>
                    <select
                      id="category-select"
                      className={styles.selectField}
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                    >
                      <option>Question & Wisdom</option>
                      <option>Ideas & Insight</option>
                      <option>Dialogue & Debate</option>
                      <option>Truth & Context</option>
                    </select>
                  </div>
                </div>

                <div className={styles.inputGroup}>
                  <label htmlFor="context-input">Context / source title</label>
                  <input
                    id="context-input"
                    type="text"
                    className={styles.inputField}
                    placeholder="e.g. Speech at Western University, or Collected Essays"
                    value={context}
                    onChange={(e) => setContext(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className={styles.sectionTitle}>Wisdom & Commentary</h3>
              <div className={styles.inputGroup}>
                <label htmlFor="wisdom-textarea">Philosophical Annotation</label>
                <textarea
                  id="wisdom-textarea"
                  className={styles.inputField}
                  rows={4}
                  placeholder="Explain the depth, context, and relevance of this quote for Verence readers..."
                  value={wisdomCommentary}
                  onChange={(e) => setWisdomCommentary(e.target.value)}
                />
              </div>
            </div>

          </div>
        </section>

        {/* RIGHT PANE: Visual preview */}
        <section className={styles.previewPane}>
          <div className={styles.previewScrollContainer}>
            <div className={styles.visualCardHeader}>
              <h4>Verence Wisdom Card</h4>
              <p>This is a live high-fidelity layout preview of how this quote will display on the home feed and category collections.</p>
            </div>

            {/* The Quote block */}
            <div className={styles.quoteCard}>
              <span className={styles.quoteLabel}>Quote of the Day</span>
              <blockquote>
                {quoteText ? `"${quoteText}"` : '"The truth will set you free, but first it will make you uncomfortable."'}
              </blockquote>
              <cite>— {author ? author : "James Baldwin"}</cite>
            </div>

            {/* Commentary Card */}
            <div className={styles.wisdomBlock}>
              <span className={styles.wisdomTitle}>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#009c65" }}><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>
                <span>Editorial commentary</span>
              </span>
              <p className={styles.wisdomText}>
                {wisdomCommentary ? wisdomCommentary : "This reflection highlights the initial friction of self-discovery and collective integrity. By examining our discomfort, we move closer to genuine understanding."}
              </p>
              <div className={styles.contextBadge}>
                Source Context: {context ? context : "Collected Essays on Integrity"}
              </div>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}
