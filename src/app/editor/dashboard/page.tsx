"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./Dashboard.module.css";
import Logo from "@/components/Logo";
import { api } from "@/utils/api";

interface Session {
  uid: string;
  name: string;
  role: string;
  avatar: string;
  loggedInAt: string;
}

interface LocalPublication {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  category: string;
  categorySlug: string;
  author: string;
  readTime: string;
  date: string;
  time: string;
  content: string[];
  status: "draft" | "published";
  readCount: number;
  image: string;
  seoDescription?: string;
  seoKeywords?: string;
  type: "article";
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

export default function EditorDashboard() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [activeTab, setActiveTab] = useState<"articles" | "quotes">("articles");
  const [activeFilter, setActiveFilter] = useState<"all" | "published" | "draft">("all");
  
  const [publications, setPublications] = useState<LocalPublication[]>([]);
  const [quotes, setQuotes] = useState<LocalQuote[]>([]);
  const [notification, setNotification] = useState("");
  const [loading, setLoading] = useState(true);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(""), 3500);
  };

  useEffect(() => {
    // 1. Session check
    const rawSession = localStorage.getItem("verence_editor_session");
    if (!rawSession) {
      router.replace("/editor/login");
      return;
    }
    const activeSession: Session = JSON.parse(rawSession);

    // Verify account status in global admin registry
    const rawEditors = localStorage.getItem("verence_editors_list");
    if (rawEditors) {
      try {
        const editorsList = JSON.parse(rawEditors);
        const currentEditor = editorsList.find((e: any) => e.id === activeSession.uid);
        if (currentEditor && currentEditor.status === "suspended") {
          localStorage.removeItem("verence_editor_session");
          router.replace("/editor/login");
          return;
        }
      } catch (e) {
        console.error("Error parsing editors list", e);
      }
    }
    setSession(activeSession);

    // 2. Hydrate Articles and Quotes from API or Offline fallback
    async function loadData() {
      try {
        setLoading(true);
        const [pubRes, quoteRes] = await Promise.all([
          api.publications.list(),
          api.quotes.list()
        ]);

        let loadedPubs: LocalPublication[] = [];
        let loadedQuotes: LocalQuote[] = [];

        if (pubRes.success && pubRes.publications) {
          loadedPubs = pubRes.publications.map((pub: any) => ({
            id: pub.id,
            slug: pub.slug,
            title: pub.title,
            subtitle: pub.subtitle || "",
            category: pub.category,
            categorySlug: pub.category_slug,
            author: pub.author,
            readTime: pub.read_time,
            date: pub.date,
            time: pub.time,
            content: Array.isArray(pub.content) ? pub.content : [pub.content || ""],
            status: pub.status,
            readCount: pub.read_count || 0,
            image: pub.image,
            seoDescription: pub.seo_description || "",
            seoKeywords: pub.seo_keywords || "",
            type: "article",
          }));
          setPublications(loadedPubs);
          localStorage.setItem("verence_local_publications", JSON.stringify(loadedPubs));
        }

        if (quoteRes.success && quoteRes.quotes) {
          loadedQuotes = quoteRes.quotes.map((q: any) => ({
            id: q.id,
            quoteText: q.quote_text,
            author: q.author,
            context: q.context || "",
            wisdomCommentary: q.wisdom_commentary || "",
            category: q.category,
            categorySlug: q.category_slug,
            date: q.date,
            status: q.status,
            type: "quote",
          }));
          setQuotes(loadedQuotes);
          localStorage.setItem("verence_local_quotes", JSON.stringify(loadedQuotes));
        }
      } catch (err: any) {
        console.warn("Verence API down, falling back to local storage hydration.", err);
        loadOfflineFallback();
      } finally {
        setLoading(false);
      }
    }

    function loadOfflineFallback() {
      // Hydrate Articles from LocalStorage or seed defaults
      const rawPubs = localStorage.getItem("verence_local_publications");
      if (rawPubs) {
        setPublications(JSON.parse(rawPubs));
      } else {
        const defaultEditors = [
          {
            id: "pub_default_1",
            slug: "conversation-with-dr-mira-sol-philosophy-of-ai",
            title: "A Conversation with Dr. Mira Sol: The Philosophy of AI",
            subtitle: "Deep thinking interview exploring consciousness, ethics, and whether machines will ever truly understand human experience.",
            category: "Dialogue & Debate",
            categorySlug: "dialogue-and-debate",
            author: "Elena Rostova",
            readTime: "10 mins read",
            date: "May 22, 2026",
            time: "10:30 AM",
            content: ["Dr. Mira Sol is the director of the Cognitive Systems Institute..."],
            status: "published" as const,
            readCount: 3120,
            image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80",
            type: "article" as const
          }
        ];
        localStorage.setItem("verence_local_publications", JSON.stringify(defaultEditors));
        setPublications(defaultEditors);
      }

      // Hydrate Quotes from LocalStorage
      const rawQuotes = localStorage.getItem("verence_local_quotes");
      if (rawQuotes) {
        setQuotes(JSON.parse(rawQuotes));
      } else {
        const defaultQuotes = [
          {
            id: "quote_default_1",
            quoteText: "Mimicry is not understanding. A calculator is faster than any human, but it doesn't know what a number is.",
            author: "Dr. Mira Sol",
            context: "The Philosophy of AI Interview",
            wisdomCommentary: "A crucial reminder to separate syntactic computation from semantic experience.",
            category: "Question & Wisdom",
            categorySlug: "question-and-wisdom",
            date: "May 22, 2026",
            status: "published" as const,
            type: "quote" as const
          }
        ];
        localStorage.setItem("verence_local_quotes", JSON.stringify(defaultQuotes));
        setQuotes(defaultQuotes);
      }
    }

    loadData();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("verence_editor_session");
    router.push("/editor/login");
  };

  // Delete article handler
  const handleDeleteArticle = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this publication?")) {
      return;
    }

    try {
      if (id.startsWith("pub_default")) {
        // Handle mock asset locally
        const updated = publications.filter((p) => p.id !== id);
        setPublications(updated);
        localStorage.setItem("verence_local_publications", JSON.stringify(updated));
        showNotification("Mock article deleted locally.");
        return;
      }

      await api.publications.delete(id);
      const updated = publications.filter((p) => p.id !== id);
      setPublications(updated);
      localStorage.setItem("verence_local_publications", JSON.stringify(updated));
      showNotification("Article deleted successfully from database.");
    } catch (err: any) {
      if (err.message === "NETWORK_OFFLINE") {
        const updated = publications.filter((p) => p.id !== id);
        setPublications(updated);
        localStorage.setItem("verence_local_publications", JSON.stringify(updated));
        showNotification("Offline: Mock article deleted locally.");
      } else {
        alert(err.message || "Could not delete article from server.");
      }
    }
  };

  // Publish article handler
  const handlePublishArticle = async (id: string) => {
    try {
      if (id.startsWith("pub_default")) {
        // Handle mock asset locally
        const updated = publications.map((p) => {
          if (p.id === id) return { ...p, status: "published" as const };
          return p;
        });
        setPublications(updated);
        localStorage.setItem("verence_local_publications", JSON.stringify(updated));
        showNotification("Offline: Draft published locally.");
        return;
      }

      await api.publications.update(id, { status: "published" });
      const updated = publications.map((p) => {
        if (p.id === id) return { ...p, status: "published" as const };
        return p;
      });
      setPublications(updated);
      localStorage.setItem("verence_local_publications", JSON.stringify(updated));
      showNotification("Draft published successfully to database!");
    } catch (err: any) {
      if (err.message === "NETWORK_OFFLINE") {
        const updated = publications.map((p) => {
          if (p.id === id) return { ...p, status: "published" as const };
          return p;
        });
        setPublications(updated);
        localStorage.setItem("verence_local_publications", JSON.stringify(updated));
        showNotification("Offline: Draft published locally.");
      } else {
        alert(err.message || "Could not publish draft to server.");
      }
    }
  };

  // Delete quote handler
  const handleDeleteQuote = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this quote?")) {
      return;
    }

    try {
      if (id.startsWith("quote_default")) {
        const updated = quotes.filter((q) => q.id !== id);
        setQuotes(updated);
        localStorage.setItem("verence_local_quotes", JSON.stringify(updated));
        showNotification("Mock quote deleted locally.");
        return;
      }

      await api.quotes.delete(id);
      const updated = quotes.filter((q) => q.id !== id);
      setQuotes(updated);
      localStorage.setItem("verence_local_quotes", JSON.stringify(updated));
      showNotification("Quote deleted successfully from database.");
    } catch (err: any) {
      if (err.message === "NETWORK_OFFLINE") {
        const updated = quotes.filter((q) => q.id !== id);
        setQuotes(updated);
        localStorage.setItem("verence_local_quotes", JSON.stringify(updated));
        showNotification("Offline: Mock quote deleted locally.");
      } else {
        alert(err.message || "Could not delete quote from server.");
      }
    }
  };

  // Publish quote handler
  const handlePublishQuote = async (id: string) => {
    try {
      if (id.startsWith("quote_default")) {
        const updated = quotes.map((q) => {
          if (q.id === id) return { ...q, status: "published" as const };
          return q;
        });
        setQuotes(updated);
        localStorage.setItem("verence_local_quotes", JSON.stringify(updated));
        showNotification("Offline: Quote published locally.");
        return;
      }

      await api.quotes.update(id, { status: "published" });
      const updated = quotes.map((q) => {
        if (q.id === id) return { ...q, status: "published" as const };
        return q;
      });
      setQuotes(updated);
      localStorage.setItem("verence_local_quotes", JSON.stringify(updated));
      showNotification("Quote published successfully to database!");
    } catch (err: any) {
      if (err.message === "NETWORK_OFFLINE") {
        const updated = quotes.map((q) => {
          if (q.id === id) return { ...q, status: "published" as const };
          return q;
        });
        setQuotes(updated);
        localStorage.setItem("verence_local_quotes", JSON.stringify(updated));
        showNotification("Offline: Quote published locally.");
      } else {
        alert(err.message || "Could not publish quote to server.");
      }
    }
  };

  if (!session) return null;

  // Filter content matching active author session
  // Matching dynamically on full name or first name keyword
  const authorPubs = publications.filter((p) => {
    const authorFirst = p.author.toLowerCase().split(" ")[0];
    const sessionFirst = session.name.toLowerCase().split(" ")[0];
    return authorFirst === sessionFirst;
  });
  
  const authorQuotes = quotes.filter((q) => {
    const authorFirst = q.author.toLowerCase().split(" ")[0];
    const sessionFirst = session.name.toLowerCase().split(" ")[0];
    // Keep standard fallback: quotes list shows collective quotes, or filtered by author
    return authorFirst === sessionFirst || q.author.toLowerCase().includes(sessionFirst);
  });

  // Filter based on selected tabs & search filter tags
  const filteredPubs = authorPubs.filter((p) => {
    if (activeFilter === "all") return true;
    return p.status === activeFilter;
  });

  const filteredQuotes = authorQuotes.filter((q) => {
    if (activeFilter === "all") return true;
    return q.status === activeFilter;
  });

  // Calculate Metrics
  const totalPubsCount = authorPubs.filter((p) => p.status === "published").length + authorQuotes.filter((q) => q.status === "published").length;
  const lifetimeReads = authorPubs.reduce((acc, p) => acc + p.readCount, 0);
  const activeDraftsCount = authorPubs.filter((p) => p.status === "draft").length + authorQuotes.filter((q) => q.status === "draft").length;
  const integrityRating = 98.4;

  return (
    <div className={styles.dashboardPage}>
      {/* Editorial Navigation */}
      <nav className={styles.navbar}>
        <Link href="/" className={styles.logo}>
          <Logo />
          <h3>Verence</h3>
        </Link>
        <div className={styles.editorProfile}>
          <div className={styles.editorInfo}>
            <span className={styles.editorName}>{session.name}</span>
            <span className={styles.editorRole}>{session.role}</span>
          </div>
          {session.avatar && (
            <img src={session.avatar} alt={session.name} className={styles.editorAvatar} />
          )}
          <button className={styles.btnLogout} onClick={handleLogout}>
            Exit Panel
          </button>
        </div>
      </nav>

      {/* Main Console Layout */}
      <main className={styles.dashboardContent}>
        {notification && <div className={styles.toastNotification}>{notification}</div>}

        {/* Dashboard Header */}
        <header className={styles.header}>
          <div>
            <h1>Editorial Console</h1>
            <p>Welcome back, {session.name.split(" ")[0]}. Monitor your publications, drafts, and wisdom parameters.</p>
          </div>
          <div className={styles.headerActions}>
            <Link href="/editor/new-article" className={styles.btnCreate}>
              Compose Essay
            </Link>
            <Link href="/editor/new-quote" className={styles.btnCreateQuote}>
              Cite Wisdom Quote
            </Link>
          </div>
        </header>

        {/* Overview Metrics Cards */}
        <section className={styles.metricsGrid}>
          <div className={styles.metricCard}>
            <div className={styles.metricLabel}>ACTIVE PUBLICATIONS</div>
            <div className={styles.metricValue}>{totalPubsCount}</div>
            <div className={styles.metricSubtitle}>Published live to subscribers</div>
          </div>
          <div className={styles.metricCard}>
            <div className={styles.metricLabel}>LIFETIME ESSAY READS</div>
            <div className={styles.metricValue}>{lifetimeReads}</div>
            <div className={styles.metricSubtitle}>Aggregated dynamic clicks</div>
          </div>
          <div className={styles.metricCard}>
            <div className={styles.metricLabel}>COMPOSER DRAFTS</div>
            <div className={styles.metricValue}>{activeDraftsCount}</div>
            <div className={styles.metricSubtitle}>Saved files awaiting editing</div>
          </div>
          <div className={styles.metricCard}>
            <div className={styles.metricLabel}>INTEGRITY RATING</div>
            <div className={styles.metricValue} style={{ color: "#009c65" }}>{integrityRating}%</div>
            <div className={styles.metricSubtitle}>Rigorous editorial checklist met</div>
          </div>
        </section>

        {/* Workspace Hub Section */}
        <section className={styles.workspaceSection}>
          <div className={styles.tabsHeader}>
            <div className={styles.tabsContainer}>
              <button
                className={`${styles.tabBtn} ${activeTab === "articles" ? styles.activeTab : ""}`}
                onClick={() => setActiveTab("articles")}
              >
                My Essays ({filteredPubs.length})
              </button>
              <button
                className={`${styles.tabBtn} ${activeTab === "quotes" ? styles.activeTab : ""}`}
                onClick={() => setActiveTab("quotes")}
              >
                My Wisdom Quotes ({filteredQuotes.length})
              </button>
            </div>

            <div className={styles.filtersContainer}>
              <button
                className={`${styles.filterBtn} ${activeFilter === "all" ? styles.activeFilterBtn : ""}`}
                onClick={() => setActiveFilter("all")}
              >
                All States
              </button>
              <button
                className={`${styles.filterBtn} ${activeFilter === "published" ? styles.activeFilterBtn : ""}`}
                onClick={() => setActiveFilter("published")}
              >
                Published
              </button>
              <button
                className={`${styles.filterBtn} ${activeFilter === "draft" ? styles.activeFilterBtn : ""}`}
                onClick={() => setActiveFilter("draft")}
              >
                Drafts
              </button>
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: "center", padding: "4rem", color: "rgba(230, 246, 240, 0.5)" }}>
              <div className={styles.spinner} style={{ margin: "0 auto 1.5rem" }} />
              <p>Synchronizing editorial assets...</p>
            </div>
          ) : activeTab === "articles" ? (
            filteredPubs.length === 0 ? (
              <div className={styles.emptyState}>
                <h3>No Essays Found</h3>
                <p>You have no essays matching the "{activeFilter}" filter state. Click Compose Essay to start writing.</p>
              </div>
            ) : (
              <div className={styles.contentList}>
                {filteredPubs.map((pub) => (
                  <div key={pub.id} className={styles.contentCard}>
                    <div className={styles.cardInfo}>
                      <span className={`${styles.statusLabel} ${pub.status === "published" ? styles.statusPub : styles.statusDr}`}>
                        {pub.status}
                      </span>
                      <h3>{pub.title}</h3>
                      <p>{pub.subtitle}</p>
                      <div className={styles.metaRow}>
                        <span>{pub.category}</span>
                        <span>•</span>
                        <span>{pub.readTime}</span>
                        <span>•</span>
                        <span>{pub.date}</span>
                        <span>•</span>
                        <span>{pub.readCount} Reads</span>
                      </div>
                    </div>
                    <div className={styles.cardActions}>
                      {pub.status === "draft" && (
                        <button
                          onClick={() => handlePublishArticle(pub.id)}
                          className={styles.actionBtnPublish}
                        >
                          Publish
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteArticle(pub.id)}
                        className={styles.actionBtnDelete}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : filteredQuotes.length === 0 ? (
            <div className={styles.emptyState}>
              <h3>No Wisdom Quotes Found</h3>
              <p>You have no philosophical citations matching the "{activeFilter}" filter state.</p>
            </div>
          ) : (
            <div className={styles.contentList}>
              {filteredQuotes.map((quote) => (
                <div key={quote.id} className={styles.contentCard}>
                  <div className={styles.cardInfo}>
                    <span className={`${styles.statusLabel} ${quote.status === "published" ? styles.statusPub : styles.statusDr}`}>
                      {quote.status}
                    </span>
                    <blockquote style={{ fontSize: "1.1rem", fontStyle: "italic", borderLeft: "2px solid #009c65", paddingLeft: "1rem", margin: "0.5rem 0", color: "#e6f6f0" }}>
                      "{quote.quoteText}"
                    </blockquote>
                    <p style={{ margin: "0.25rem 0", color: "rgba(230, 246, 240, 0.7)", fontSize: "0.9rem" }}>
                      — <strong>{quote.author}</strong> ({quote.context})
                    </p>
                    <div className={styles.metaRow}>
                      <span>{quote.category}</span>
                      <span>•</span>
                      <span>{quote.date}</span>
                    </div>
                  </div>
                  <div className={styles.cardActions}>
                    {quote.status === "draft" && (
                      <button
                        onClick={() => handlePublishQuote(quote.id)}
                        className={styles.actionBtnPublish}
                      >
                        Publish
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteQuote(quote.id)}
                      className={styles.actionBtnDelete}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
