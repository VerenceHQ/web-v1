"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./Dashboard.module.css";
import Logo from "@/components/Logo";

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

    // 2. Hydrate Articles from LocalStorage or seed defaults
    const rawPubs = localStorage.getItem("verence_local_publications");
    let currentPubs: LocalPublication[] = [];
    if (rawPubs) {
      currentPubs = JSON.parse(rawPubs);
    } else {
      // Seed high-fidelity sample data based on active author
      currentPubs = [
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
          content: [
            "Dr. Mira Sol is the director of the Cognitive Systems Institute and author of 'The Ghost in the Processor.'...",
          ],
          status: "published",
          readCount: 3120,
          image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80",
          type: "article",
        },
        {
          id: "pub_default_2",
          slug: "architecture-of-algorithmic-power",
          title: "The Architecture of Algorithmic Power",
          subtitle: "Analyzing the invisible scaffolding of feedback loops that direct attention and shape modern societal outrage.",
          category: "Ideas & Insight",
          categorySlug: "ideas-and-insight",
          author: "Elena Rostova",
          readTime: "6 mins read",
          date: "May 21, 2026",
          time: "03:15 PM",
          content: [
            "We are beginning to realise that the algorithms shaping our digital feeds are far from passive mirrors...",
          ],
          status: "draft",
          readCount: 0,
          image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80",
          type: "article",
        },
        {
          id: "pub_default_3",
          slug: "understanding-modern-ethics-1",
          title: "Understanding Modern Ethics: The Individual vs The State",
          subtitle: "How the concept of moral responsibility is shifting in a globalized world where individual actions have distant, systemic consequences.",
          category: "Ideas & Insight",
          categorySlug: "ideas-and-insight",
          author: "Marcus Vance",
          readTime: "7 mins read",
          date: "May 20, 2026",
          time: "04:15 PM",
          content: [
            "Our traditional moral frameworks were designed for an era when the consequences of our actions were immediate...",
          ],
          status: "published",
          readCount: 810,
          image: "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=800&q=80",
          type: "article",
        },
        {
          id: "pub_default_4",
          slug: "silences-of-lao-tzu-doing-nothing",
          title: "The Silences of Lao Tzu: Doing Nothing as a Radical Act",
          subtitle: "Exploring how 'non-action' or Wu Wei functions as a direct confrontation to modern hyper-productivity norms.",
          category: "Question & Wisdom",
          categorySlug: "question-and-wisdom",
          author: "Marcus Vance",
          readTime: "5 mins read",
          date: "May 22, 2026",
          time: "08:30 AM",
          content: [
            "Lao Tzu warns against the dangers of striving. Wu Wei is the high art of aligning actions with nature...",
          ],
          status: "draft",
          readCount: 0,
          image: "https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?auto=format&fit=crop&w=800&q=80",
          type: "article",
        }
      ];
      localStorage.setItem("verence_local_publications", JSON.stringify(currentPubs));
    }
    setPublications(currentPubs);

    // 3. Hydrate Quotes from LocalStorage or seed defaults
    const rawQuotes = localStorage.getItem("verence_local_quotes");
    let currentQuotes: LocalQuote[] = [];
    if (rawQuotes) {
      currentQuotes = JSON.parse(rawQuotes);
    } else {
      currentQuotes = [
        {
          id: "quote_default_1",
          quoteText: "Mimicry is not understanding. A calculator is faster than any human, but it doesn't know what a number is.",
          author: "Dr. Mira Sol",
          context: "The Philosophy of AI Interview",
          wisdomCommentary: "A crucial reminder to separate syntactic computation from semantic experience.",
          category: "Question & Wisdom",
          categorySlug: "question-and-wisdom",
          date: "May 22, 2026",
          status: "published",
          type: "quote",
        },
        {
          id: "quote_default_2",
          quoteText: "The truth will set you free, but first it will make you uncomfortable.",
          author: "James Baldwin",
          context: "Collected Essays on Integrity",
          wisdomCommentary: "Deep wisdom on the initial friction of self-discovery and collective honesty.",
          category: "Question & Wisdom",
          categorySlug: "question-and-wisdom",
          date: "May 20, 2026",
          status: "published",
          type: "quote",
        }
      ];
      localStorage.setItem("verence_local_quotes", JSON.stringify(currentQuotes));
    }
    setQuotes(currentQuotes);
  }, [router]);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(""), 3500);
  };

  const handleLogout = () => {
    localStorage.removeItem("verence_editor_session");
    router.push("/editor/login");
  };

  // Delete article handler
  const handleDeleteArticle = (id: string) => {
    if (window.confirm("Are you sure you want to delete this publication?")) {
      const updated = publications.filter((p) => p.id !== id);
      setPublications(updated);
      localStorage.setItem("verence_local_publications", JSON.stringify(updated));
      showNotification("Article deleted successfully.");
    }
  };

  // Publish article handler
  const handlePublishArticle = (id: string) => {
    const updated = publications.map((p) => {
      if (p.id === id) {
        return { ...p, status: "published" as const };
      }
      return p;
    });
    setPublications(updated);
    localStorage.setItem("verence_local_publications", JSON.stringify(updated));
    showNotification("Draft published successfully and is now live!");
  };

  // Delete quote handler
  const handleDeleteQuote = (id: string) => {
    if (window.confirm("Are you sure you want to delete this quote?")) {
      const updated = quotes.filter((q) => q.id !== id);
      setQuotes(updated);
      localStorage.setItem("verence_local_quotes", JSON.stringify(updated));
      showNotification("Quote deleted successfully.");
    }
  };

  // Publish quote handler
  const handlePublishQuote = (id: string) => {
    const updated = quotes.map((q) => {
      if (q.id === id) {
        return { ...q, status: "published" as const };
      }
      return q;
    });
    setQuotes(updated);
    localStorage.setItem("verence_local_quotes", JSON.stringify(updated));
    showNotification("Quote published successfully!");
  };

  if (!session) return null;

  // Filter content matching active author session
  const authorPubs = publications.filter((p) => p.author.toLowerCase().includes(session.name.split(" ")[0].toLowerCase()));
  const authorQuotes = quotes; // All quotes shared in the collective wisdom pool

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
  const integrityRating = 98.4; // constant premium representation of quality guidelines met

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
          <img src={session.avatar} alt={session.name} className={styles.avatar} />
          <button className={styles.logoutBtn} onClick={handleLogout}>
            Sign Out
          </button>
        </div>
      </nav>

      {/* Main Grid Workspace */}
      <main className={styles.mainContainer}>
        {/* Welcome block */}
        <div className={styles.welcomeHeader}>
          <div className={styles.welcomeTitle}>
            <h1>Editorial Command Center</h1>
            <p>Welcome back, {session.name.split(" ")[0]}. You have high-integrity publications waiting for deep reading.</p>
          </div>
          <div className={styles.actionTriggers}>
            <Link href="/editor/new-article" className={styles.btnPrimary}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
              <span>Write Essay</span>
            </Link>
            <Link href="/editor/new-quote" className={styles.btnSecondary}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              <span>Publish Quote</span>
            </Link>
          </div>
        </div>

        {/* Global Notifications toast */}
        {notification && (
          <div style={{
            position: "fixed",
            bottom: "2rem",
            right: "2rem",
            background: "#003c27",
            color: "#ffffff",
            padding: "1rem 2rem",
            borderRadius: "1rem",
            border: "1px solid rgba(0, 156, 101, 0.3)",
            boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
            zIndex: 100,
            fontSize: "0.9rem",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            animation: "fadeIn 0.3s ease",
          }}>
            <span style={{ color: "#009c65" }}>●</span>
            {notification}
          </div>
        )}

        {/* Analytical Cards Grid */}
        <section className={styles.metricsGrid}>
          <div className={styles.metricCard}>
            <span className={styles.metricLabel}>Total Publications</span>
            <span className={styles.metricValue}>{totalPubsCount}</span>
            <div className={`${styles.metricTrend} ${styles.trendUp}`}>
              <span>+2 active this month</span>
            </div>
          </div>
          <div className={styles.metricCard}>
            <span className={styles.metricLabel}>Lifetime Readers</span>
            <span className={styles.metricValue}>
              {lifetimeReads >= 1000 ? `${(lifetimeReads / 1000).toFixed(1)}k` : lifetimeReads}
            </span>
            <div className={`${styles.metricTrend} ${styles.trendUp}`}>
              <span>▲ 12.4% vs last week</span>
            </div>
          </div>
          <div className={styles.metricCard}>
            <span className={styles.metricLabel}>Open Drafts</span>
            <span className={styles.metricValue}>{activeDraftsCount}</span>
            <div className={`${styles.metricTrend} ${styles.trendNeutral}`}>
              <span>Awaiting final polish</span>
            </div>
          </div>
          <div className={styles.metricCard}>
            <span className={styles.metricLabel}>Editorial Score</span>
            <span className={styles.metricValue}>{integrityRating}%</span>
            <div className={`${styles.metricTrend} ${styles.trendUp}`}>
              <span>Excellent reading times</span>
            </div>
          </div>
        </section>

        {/* Main interactive area split */}
        <section className={styles.workspaceLayout}>
          <div className={styles.contentWorkspace}>
            <div className={styles.workspaceHeader}>
              <div className={styles.tabs}>
                <button
                  className={`${styles.tabBtn} ${activeTab === "articles" ? styles.activeTab : ""}`}
                  onClick={() => {
                    setActiveTab("articles");
                    setActiveFilter("all");
                  }}
                >
                  Articles & Essays ({authorPubs.length})
                </button>
                <button
                  className={`${styles.tabBtn} ${activeTab === "quotes" ? styles.activeTab : ""}`}
                  onClick={() => {
                    setActiveTab("quotes");
                    setActiveFilter("all");
                  }}
                >
                  Wisdom & Quotes ({authorQuotes.length})
                </button>
              </div>

              <div className={styles.filterSelector}>
                <button
                  className={`${styles.filterBtn} ${activeFilter === "all" ? styles.activeFilter : ""}`}
                  onClick={() => setActiveFilter("all")}
                >
                  All
                </button>
                <button
                  className={`${styles.filterBtn} ${activeFilter === "published" ? styles.activeFilter : ""}`}
                  onClick={() => setActiveFilter("published")}
                >
                  Published
                </button>
                <button
                  className={`${styles.filterBtn} ${activeFilter === "draft" ? styles.activeFilter : ""}`}
                  onClick={() => setActiveFilter("draft")}
                >
                  Drafts
                </button>
              </div>
            </div>

            {/* List Tables */}
            <div className={styles.tableWrapper}>
              {activeTab === "articles" ? (
                filteredPubs.length > 0 ? (
                  <table className={styles.contentTable}>
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Category</th>
                        <th>Status</th>
                        <th>Reads</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPubs.map((pub) => (
                        <tr key={pub.id}>
                          <td>
                            <div className={styles.titleCol}>
                              <Link href={`/articles/${pub.slug}`} className={styles.itemTitle}>
                                {pub.title}
                              </Link>
                              <span className={styles.itemSubtitle}>{pub.subtitle}</span>
                            </div>
                          </td>
                          <td>
                            <span className={styles.categoryBadge}>{pub.category}</span>
                          </td>
                          <td>
                            <span className={`${styles.statusBadge} ${pub.status === "published" ? styles.statusPublished : styles.statusDraft}`}>
                              {pub.status}
                            </span>
                          </td>
                          <td className={styles.metricsCol}>
                            {pub.readCount >= 1000 ? `${(pub.readCount / 1000).toFixed(1)}k` : pub.readCount}
                          </td>
                          <td>
                            <div className={styles.actionCol}>
                              {pub.status === "draft" && (
                                <button
                                  className={styles.iconBtn}
                                  title="Publish Draft"
                                  onClick={() => handlePublishArticle(pub.id)}
                                  style={{ color: "#009c65" }}
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                                </button>
                              )}
                              <button
                                className={`${styles.iconBtn} ${styles.deleteBtn}`}
                                title="Delete"
                                onClick={() => handleDeleteArticle(pub.id)}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className={styles.emptyState}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#009c65", opacity: 0.5 }}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                    <h4>No essays found</h4>
                    <p>There are no articles matching the selected filter. Create a new piece to expand your portfolio.</p>
                  </div>
                )
              ) : (
                filteredQuotes.length > 0 ? (
                  <table className={styles.contentTable}>
                    <thead>
                      <tr>
                        <th>Quote Citation</th>
                        <th>Author / Source</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredQuotes.map((q) => (
                        <tr key={q.id}>
                          <td>
                            <div className={styles.titleCol}>
                              <span style={{ fontWeight: 500, fontStyle: "italic", fontSize: "0.95rem", color: "#003c27" }}>
                                "{q.quoteText}"
                              </span>
                              <span className={styles.itemSubtitle}>Commentary: {q.wisdomCommentary}</span>
                            </div>
                          </td>
                          <td>
                            <div className={styles.titleCol}>
                              <span style={{ fontWeight: 600 }}>{q.author}</span>
                              <span className={styles.itemSubtitle}>{q.context}</span>
                            </div>
                          </td>
                          <td>
                            <span className={`${styles.statusBadge} ${q.status === "published" ? styles.statusPublished : styles.statusDraft}`}>
                              {q.status}
                            </span>
                          </td>
                          <td>
                            <div className={styles.actionCol}>
                              {q.status === "draft" && (
                                <button
                                  className={styles.iconBtn}
                                  title="Publish Quote"
                                  onClick={() => handlePublishQuote(q.id)}
                                  style={{ color: "#009c65" }}
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                                </button>
                              )}
                              <button
                                className={`${styles.iconBtn} ${styles.deleteBtn}`}
                                title="Delete"
                                onClick={() => handleDeleteQuote(q.id)}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className={styles.emptyState}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#009c65", opacity: 0.5 }}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                    <h4>No quotes found</h4>
                    <p>No quotes matching this criteria. Capture a new piece of philosophical reflection.</p>
                  </div>
                )
              )}
            </div>
          </div>

          {/* Right sidebar */}
          <div className={styles.sidebar}>
            {/* Editor profile biography card */}
            <div className={styles.authorCard}>
              <img src={session.avatar} alt={session.name} className={styles.sidebarAvatar} />
              <div className={styles.sidebarAuthorInfo}>
                <h3>{session.name}</h3>
                <p>{session.role}</p>
              </div>
              <div className={styles.authorDivider} />
              <p className={styles.authorBio}>
                {session.uid === "elena"
                  ? " Elena is a senior writer dedicated to uncovering the intersection of cognitive logic, technological dominance, and public integrity."
                  : " Marcus explores metaphysics, evolutionary ethics, and the integration of classical Taoist philosophy into our daily modern lives."}
              </p>
            </div>

            {/* Platform guidelines reminder */}
            <div className={styles.standardsPrompt}>
              <h3>Verence Standards</h3>
              <p>
                Every essay and publication on Verence must adhere to our core Editorial Integrity Code: human-centered clarity, robust verification, and context-focused writing.
              </p>
              <Link href="/standards" className={styles.standardsLink}>
                Review Editorial Code →
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
