"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./QuoteComposer.module.css";
import Logo from "@/components/Logo";
import { api } from "@/utils/api";

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
  const [loading, setLoading] = useState(false);

  // Custom Category Dropdown State & Ref
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target as Node)) {
        setIsCategoryDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    // 1. Session check
    const rawSession = localStorage.getItem("verence_editor_session");
    if (!rawSession) {
      router.replace("/editor/login");
      return;
    }
    setSession(JSON.parse(rawSession));
  }, [router]);

  const handleSave = async (status: "draft" | "published") => {
    if (!quoteText.trim()) {
      alert("Please enter the quote citation text.");
      return;
    }
    if (!author.trim()) {
      alert("Please enter the author name.");
      return;
    }

    setLoading(true);

    const categorySlug = category.toLowerCase().replace(/ & /g, "-and-").replace(/\s+/g, "-");
    const payload = {
      quote_text: quoteText.trim(),
      author: author.trim(),
      context: context.trim() ? context.trim() : "Unspecified Discourse",
      wisdom_commentary: wisdomCommentary.trim() ? wisdomCommentary.trim() : "Reflections on modern philosophy.",
      category: category,
      category_slug: categorySlug,
      status: status,
    };

    try {
      const res = await api.quotes.create(payload);
      if (res.success && res.quote) {
        // Hydrate local quotes list locally
        const rawQuotes = localStorage.getItem("verence_local_quotes");
        let currentQuotes: LocalQuote[] = [];
        if (rawQuotes) {
          try { currentQuotes = JSON.parse(rawQuotes); } catch (e) {}
        }
        
        const newLocalQuote: LocalQuote = {
          id: res.quote.id,
          quoteText: res.quote.quote_text,
          author: res.quote.author,
          context: res.quote.context || "",
          wisdomCommentary: res.quote.wisdom_commentary || "",
          category: res.quote.category,
          categorySlug: res.quote.category_slug,
          date: res.quote.date,
          status: res.quote.status,
          type: "quote"
        };

        currentQuotes.push(newLocalQuote);
        localStorage.setItem("verence_local_quotes", JSON.stringify(currentQuotes));

        alert(status === "published" ? "Quote is now published and active!" : "Quote draft saved successfully.");
        router.push("/editor/dashboard");
      } else {
        alert(res.message || "Could not save quote.");
      }
    } catch (err: any) {
      if (err.message === "NETWORK_OFFLINE") {
        // Offline resilient fallback
        const newQuote: LocalQuote = {
          id: "quote_" + Date.now(),
          quoteText: quoteText.trim(),
          author: author.trim(),
          context: context.trim() ? context.trim() : "Unspecified Discourse",
          wisdomCommentary: wisdomCommentary.trim() ? wisdomCommentary.trim() : "Reflections on modern philosophy.",
          category: category,
          categorySlug: categorySlug,
          date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
          status: status,
          type: "quote",
        };

        const rawQuotes = localStorage.getItem("verence_local_quotes");
        let currentQuotes: LocalQuote[] = [];
        if (rawQuotes) {
          try { currentQuotes = JSON.parse(rawQuotes); } catch (e) {}
        }

        currentQuotes.push(newQuote);
        localStorage.setItem("verence_local_quotes", JSON.stringify(currentQuotes));

        alert(status === "published" ? "Offline: Quote is published locally!" : "Offline: Quote draft saved locally!");
        router.push("/editor/dashboard");
      } else {
        alert(err.message || "An unexpected error occurred while saving quote.");
      }
    } finally {
      setLoading(false);
    }
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
          <button className={styles.btnDraft} disabled={loading} onClick={() => handleSave("draft")}>
            Save Draft
          </button>
          <button className={styles.btnPublish} disabled={loading} onClick={() => handleSave("published")}>
            {loading ? "Cite Quote..." : "Publish Quote"}
          </button>
        </div>
      </header>

      {/* Grid Composer layout */}
      <main className={styles.composerLayout}>
        
        {/* LEFT PANE: Citation Inputs */}
        <section className={styles.editorPane}>
          <div className={styles.editorScrollContainer}>
            
            <div className={styles.formSection}>
              <h3 className={styles.sectionTitle}>Citation Details</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                <div className={styles.inputGroup}>
                  <label htmlFor="quote-text-input">PHILOSOPHICAL CITATION TEXT</label>
                  <textarea
                    id="quote-text-input"
                    className={styles.textField}
                    rows={4}
                    placeholder="Enter the striking exact quote or core thesis statement..."
                    value={quoteText}
                    onChange={(e) => setQuoteText(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <div className={styles.doubleGroup}>
                  <div className={styles.inputGroup}>
                    <label htmlFor="author-input">CITATION AUTHOR NAME</label>
                    <input
                      id="author-input"
                      type="text"
                      className={styles.inputField}
                      placeholder="e.g. James Baldwin, Lao Tzu..."
                      value={author}
                      onChange={(e) => setAuthor(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                  <div className={styles.inputGroup}>
                    <label htmlFor="context-input">DISCOURSE ORIGIN / CONTEXT</label>
                    <input
                      id="context-input"
                      type="text"
                      className={styles.inputField}
                      placeholder="e.g. Collected Essays, Interview..."
                      value={context}
                      onChange={(e) => setContext(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                </div>
                <div className={styles.inputGroup}>
                  <label>TOPIC DOMAIN</label>
                  <div className={styles.customDropdownContainer} ref={categoryDropdownRef}>
                    <button
                      type="button"
                      className={styles.dropdownToggleBtn}
                      onClick={() => !loading && setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                      disabled={loading}
                    >
                      <span>{category}</span>
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        className={`${styles.arrowIcon} ${isCategoryDropdownOpen ? styles.arrowUp : ""}`}
                      >
                        <path d="M6 9l6 6 6-6"></path>
                      </svg>
                    </button>
                    {isCategoryDropdownOpen && (
                      <ul className={styles.customDropdownMenu}>
                        {["Question & Wisdom", "Truth & Context", "Ideas & Insight", "Dialogue & Debate"].map((cat) => (
                          <li
                            key={cat}
                            className={`${styles.customDropdownItem} ${category === cat ? styles.selectedItem : ""}`}
                            onClick={() => {
                              setCategory(cat);
                              setIsCategoryDropdownOpen(false);
                            }}
                          >
                            {cat}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.formSection} style={{ borderBottom: "none" }}>
              <h3 className={styles.sectionTitle}>Wisdom Commentary & Reflections</h3>
              <div className={styles.inputGroup}>
                <label htmlFor="commentary-input">EXPLANATORY INSIGHT</label>
                <textarea
                  id="commentary-input"
                  className={styles.textField}
                  rows={4}
                  placeholder="Explain why this quote matters or provide analytical context to guide the reader's study..."
                  value={wisdomCommentary}
                  onChange={(e) => setWisdomCommentary(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

          </div>
        </section>

        {/* RIGHT PANE: Wisdom Preview Card */}
        <aside className={styles.previewPane}>
          <h3>Editorial Wisdom Preview</h3>
          <div className={styles.previewCard}>
            <span className={styles.previewLabelLabel}>Live Preview</span>
            <blockquote className={styles.previewQuoteText}>
              "{quoteText || "Mimicry is not understanding. A calculator is faster than any human, but it doesn't know what a number is."}"
            </blockquote>
            <p className={styles.previewQuoteAuthor}>
              — <strong>{author || "Dr. Mira Sol"}</strong> <span className={styles.previewQuoteContext}>({context || "The Philosophy of AI"})</span>
            </p>
            {wisdomCommentary && (
              <div className={styles.previewCommentary}>
                <strong>Reflections:</strong>
                <p>{wisdomCommentary}</p>
              </div>
            )}
          </div>
          
          <div className={styles.charterCard}>
            <h4>Citing Guidelines</h4>
            <ul>
              <li>Keep citations authentic and accurate to the original text.</li>
              <li>Keep wisdom commentaries concise, deep, and focused on helping the reader think.</li>
              <li>Always categorize quotes accurately under the matching platform domain.</li>
            </ul>
          </div>
        </aside>

      </main>
    </div>
  );
}
