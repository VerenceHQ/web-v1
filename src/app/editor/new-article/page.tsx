"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./ArticleComposer.module.css";
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

const bannerPresets = [
  {
    name: "Misty Forest",
    url: "https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Classic Books",
    url: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Sunrise Ocean",
    url: "https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Neural Network",
    url: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80",
  },
];

export default function ArticleComposer() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  
  // Article inputs state
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [category, setCategory] = useState("Ideas & Insight");
  const [readTime, setReadTime] = useState("5 mins read");
  const [markdownContent, setMarkdownContent] = useState("");
  const [bannerUrl, setBannerUrl] = useState(bannerPresets[0].url);
  const [customBannerUrl, setCustomBannerUrl] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [seoKeywords, setSeoKeywords] = useState("");
  
  const [activeTab, setActiveTab] = useState<"write" | "preview">("write");
  const [loading, setLoading] = useState(false);

  // Smart Draft State
  const [isSmartDraftOpen, setIsSmartDraftOpen] = useState(false);
  const [smartDraftTopic, setSmartDraftTopic] = useState("");
  const [isDrafting, setIsDrafting] = useState(false);

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

  // Insert markdown helpers
  const insertMarkdown = (syntax: string) => {
    const textarea = document.getElementById("editor-textarea") as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end);

    let replacement = "";
    let prefix = "";

    if (syntax === "h2") {
      replacement = `\n\n## ${selected || "Heading 2"}\n\n`;
      prefix = "## ";
    } else if (syntax === "quote") {
      replacement = `\n\n> ${selected || "Blockquote text"}\n\n`;
      prefix = "> ";
    } else if (syntax === "bold") {
      replacement = `**${selected || "bold text"}**`;
    } else if (syntax === "italic") {
      replacement = `*${selected || "italic text"}*`;
    }

    const newText = text.substring(0, start) + replacement + text.substring(end);
    setMarkdownContent(newText);

    // Reposition cursor
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + selected.length);
    }, 50);
  };

  const handleSmartDraft = async () => {
    if (!smartDraftTopic.trim()) return;
    setIsDrafting(true);
    try {
      const res = await api.ai.generateDraft(smartDraftTopic);
      if (res.success && res.draft) {
        if (res.title && !title) setTitle(res.title);
        setMarkdownContent((prev) => prev ? prev + "\n\n" + res.draft : res.draft);
        setIsSmartDraftOpen(false);
        setSmartDraftTopic("");
      } else {
        alert("Failed to generate draft. Please try again.");
      }
    } catch (err: any) {
      alert(err.message || "An unexpected error occurred during drafting.");
    } finally {
      setIsDrafting(false);
    }
  };

  const handleSave = async (status: "draft" | "published") => {
    if (!title.trim()) {
      alert("Please enter an article title.");
      return;
    }
    if (!markdownContent.trim()) {
      alert("Please write some article content.");
      return;
    }

    setLoading(true);

    const currentBanner = customBannerUrl.trim() ? customBannerUrl.trim() : bannerUrl;
    const generatedSlug = title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "") // remove special chars
      .replace(/\s+/g, "-"); // spaces to hyphens

    const paragraphs = markdownContent.split("\n\n").filter((p) => p.trim() !== "");
    const categorySlug = category.toLowerCase().replace(/ & /g, "-and-").replace(/\s+/g, "-");

    const payload = {
      title: title.trim(),
      subtitle: subtitle.trim(),
      category: category,
      category_slug: categorySlug,
      author: session?.name || "Elena Rostova",
      editor_id: session?.uid || "elena",
      read_time: readTime.trim(),
      content: paragraphs,
      status: status,
      image: currentBanner,
      is_featured: false
    };

    try {
      // Save directly to dynamic relational database API Route Handlers proxy
      const res = await api.publications.create(payload);
      if (res.success && res.publication) {
        // Hydrate local publications list locally
        const rawPubs = localStorage.getItem("verence_local_publications");
        let currentPubs: LocalPublication[] = [];
        if (rawPubs) {
          try { currentPubs = JSON.parse(rawPubs); } catch (e) {}
        }
        
        const newLocalPub: LocalPublication = {
          id: res.publication.id,
          slug: res.publication.slug,
          title: res.publication.title,
          subtitle: res.publication.subtitle || "",
          category: res.publication.category,
          categorySlug: res.publication.category_slug,
          author: res.publication.author,
          readTime: res.publication.read_time,
          date: res.publication.date,
          time: res.publication.time,
          content: res.publication.content,
          status: res.publication.status,
          readCount: 0,
          image: res.publication.image,
          seoDescription: seoDescription.trim(),
          seoKeywords: seoKeywords.trim(),
          type: "article"
        };

        const index = currentPubs.findIndex((p) => p.slug === newLocalPub.slug);
        if (index !== -1) {
          currentPubs[index] = newLocalPub;
        } else {
          currentPubs.push(newLocalPub);
        }
        localStorage.setItem("verence_local_publications", JSON.stringify(currentPubs));

        alert(status === "published" ? "Publication is now LIVE!" : "Draft saved successfully.");
        router.push("/editor/dashboard");
      } else {
        alert(res.message || "Could not save publication.");
      }
    } catch (err: any) {
      if (err.message === "NETWORK_OFFLINE") {
        // Offline resilient fallback
        const newPub: LocalPublication = {
          id: "pub_" + Date.now(),
          slug: generatedSlug,
          title: title.trim(),
          subtitle: subtitle.trim(),
          category: category,
          categorySlug: categorySlug,
          author: session?.name || "Elena Rostova",
          readTime: readTime.trim(),
          date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
          time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
          content: paragraphs,
          status: status,
          readCount: 0,
          image: currentBanner,
          seoDescription: seoDescription.trim(),
          seoKeywords: seoKeywords.trim(),
          type: "article",
        };

        const rawPubs = localStorage.getItem("verence_local_publications");
        let currentPubs: LocalPublication[] = [];
        if (rawPubs) {
          try { currentPubs = JSON.parse(rawPubs); } catch (e) {}
        }
        
        const index = currentPubs.findIndex((p) => p.slug === generatedSlug);
        if (index !== -1) {
          currentPubs[index] = newPub;
        } else {
          currentPubs.push(newPub);
        }

        localStorage.setItem("verence_local_publications", JSON.stringify(currentPubs));
        alert(status === "published" ? "Offline: Publication saved locally!" : "Offline: Draft saved locally!");
        router.push("/editor/dashboard");
      } else {
        alert(err.message || "An unexpected error occurred while composing article.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Preview Markdown renderer
  const renderPreviewParagraphs = () => {
    if (!markdownContent.trim()) {
      return <p style={{ color: "rgba(12, 32, 24, 0.4)", fontStyle: "italic" }}>Begin writing your essay in the editor pane to preview here...</p>;
    }

    const paragraphs = markdownContent.split("\n\n").filter((p) => p.trim() !== "");
    return paragraphs.map((para, index) => {
      const isFirst = index === 0;

      // Handle Headings
      if (para.startsWith("## ")) {
        return <h2 key={index}>{para.replace("## ", "")}</h2>;
      }

      // Handle Blockquotes
      if (para.startsWith("> ")) {
        return <blockquote key={index}>{para.replace("> ", "")}</blockquote>;
      }

      return (
        <p key={index} className={isFirst ? styles.dropCapParagraph : ""}>
          {para}
        </p>
      );
    });
  };

  if (!session) return null;

  return (
    <div className={styles.pageWrapper}>
      {/* Header Actions Navbar */}
      <header className={styles.navbar}>
        <Link href="/editor/dashboard" className={styles.logoArea}>
          <Logo />
          <span>Verence Essay Publisher</span>
        </Link>
        <div className={styles.navActions}>
          <Link href="/editor/dashboard" className={styles.btnBack}>
            Exit
          </Link>
          <button className={styles.btnDraft} disabled={loading} onClick={() => handleSave("draft")}>
            Save Draft
          </button>
          <button className={styles.btnPublish} disabled={loading} onClick={() => handleSave("published")}>
            {loading ? "Publishing..." : "Publish Essay"}
          </button>
        </div>
      </header>

      {/* Grid Composer layout */}
      <main className={styles.composerLayout}>
        
        {/* LEFT PANE: Composer & Editor */}
        <section className={styles.editorPane}>
          <div className={styles.tabToggles}>
            <button
              className={`${styles.tabBtn} ${activeTab === "write" ? styles.activeTab : ""}`}
              onClick={() => setActiveTab("write")}
            >
              Compose Panel
            </button>
            <button
              className={`${styles.tabBtn} ${activeTab === "preview" ? styles.activeTab : ""}`}
              onClick={() => setActiveTab("preview")}
            >
              Editorial Preview
            </button>
          </div>

          <div className={styles.editorScrollContainer} style={{ display: activeTab === "write" ? "flex" : "none" }}>
            
            {/* 1. Basic Metadata */}
            <div className={styles.formSection}>
              <h3 className={styles.sectionTitle}>Essay Framework</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                <div className={styles.inputGroup}>
                  <label htmlFor="title-input">TITLE (MAX 100 CHARACTER-SEQUENCE)</label>
                  <input
                    id="title-input"
                    type="text"
                    className={styles.inputField}
                    placeholder="Enter short, striking, bold title..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label htmlFor="subtitle-input">SUBTITLE OR EXCERPT SUMMARY</label>
                  <textarea
                    id="subtitle-input"
                    className={styles.textField}
                    rows={2}
                    placeholder="Provide a concise one-liner context..."
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <div className={styles.doubleGroup}>
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
                          {["Truth & Context", "Ideas & Insight", "Question & Wisdom", "Dialogue & Debate"].map((cat) => (
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
                  <div className={styles.inputGroup}>
                    <label htmlFor="readtime-input">ESTIMATED STUDY READING TIME</label>
                    <input
                      id="readtime-input"
                      type="text"
                      className={styles.inputField}
                      placeholder="e.g. 5 mins read"
                      value={readTime}
                      onChange={(e) => setReadTime(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Banner Selection */}
            <div className={styles.formSection}>
              <h3 className={styles.sectionTitle}>Banner Imagery</h3>
              <p style={{ fontSize: "0.75rem", color: "rgba(230, 246, 240, 0.5)", marginBottom: "0.75rem" }}>
                Select a high-fidelity visual context preset or paste a custom cloud asset URL.
              </p>
              <div className={styles.bannerGrid}>
                {bannerPresets.map((preset) => (
                  <div
                    key={preset.name}
                    className={`${styles.bannerThumb} ${
                      bannerUrl === preset.url && !customBannerUrl ? styles.bannerActive : ""
                    }`}
                    onClick={() => {
                      setBannerUrl(preset.url);
                      setCustomBannerUrl("");
                    }}
                  >
                    <img src={preset.url} alt={preset.name} />
                    <span className={styles.bannerLabel}>{preset.name}</span>
                  </div>
                ))}
              </div>
              <div className={styles.inputGroup} style={{ marginTop: "1rem" }}>
                <label htmlFor="custom-banner-input">CUSTOM CLOUD ASSET URL</label>
                <input
                  id="custom-banner-input"
                  type="text"
                  className={styles.inputField}
                  placeholder="Paste custom banner image URL..."
                  value={customBannerUrl}
                  onChange={(e) => setCustomBannerUrl(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            {/* 3. Central Editor */}
            <div className={styles.formSection} style={{ borderBottom: "none" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                <label style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.08em", color: "#009c65" }}>
                  ESSAY EDITING PANE
                </label>
                <div className={styles.toolbar}>
                  <button type="button" onClick={() => insertMarkdown("bold")} className={styles.toolBtn}>B</button>
                  <button type="button" onClick={() => insertMarkdown("italic")} className={styles.toolBtn}>I</button>
                  <button type="button" onClick={() => insertMarkdown("h2")} className={styles.toolBtn}>H2</button>
                  <button type="button" onClick={() => insertMarkdown("quote")} className={styles.toolBtn}>Quote</button>
                  <div className={styles.divider}></div>
                  <button 
                    type="button" 
                    onClick={() => setIsSmartDraftOpen(!isSmartDraftOpen)}
                    className={`${styles.toolBtn} ${styles.smartDraftBtn}`}
                  >
                    ✨ Smart Draft
                  </button>
                </div>
              </div>
              
              {isSmartDraftOpen && (
                <div className={styles.smartDraftPanel}>
                  <p className={styles.smartDraftDesc}>Enter a concept or topic and our AI will generate an industry-standard draft.</p>
                  <div className={styles.smartDraftInputGroup}>
                    <input 
                      type="text" 
                      placeholder="e.g. The Philosophy of Artificial Intelligence..."
                      value={smartDraftTopic}
                      onChange={(e) => setSmartDraftTopic(e.target.value)}
                      className={styles.smartDraftInput}
                      disabled={isDrafting}
                    />
                    <button 
                      type="button" 
                      onClick={handleSmartDraft} 
                      className={styles.smartDraftSubmit}
                      disabled={isDrafting || !smartDraftTopic.trim()}
                    >
                      {isDrafting ? "Drafting..." : "Generate"}
                    </button>
                  </div>
                </div>
              )}

              <textarea
                id="editor-textarea"
                className={styles.editorTextArea}
                rows={15}
                placeholder="Type your paragraphs here. Separate paragraphs with double-newlines to format text flow."
                value={markdownContent}
                onChange={(e) => setMarkdownContent(e.target.value)}
                disabled={loading}
              />
            </div>

            {/* 4. SEO & Indexation Details */}
            <div className={styles.formSection} style={{ background: "rgba(230, 246, 240, 0.02)", padding: "1.25rem", border: "1px dashed rgba(230, 246, 240, 0.08)", borderRadius: "0.5rem" }}>
              <h3 className={styles.sectionTitle} style={{ color: "#009c65" }}>SEO Meta & Crawling Tags</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div className={styles.inputGroup}>
                  <label htmlFor="seo-desc">META DESCRIPTION SUMMARY (SOCIAL FEED CARDS)</label>
                  <input
                    id="seo-desc"
                    type="text"
                    className={styles.inputField}
                    placeholder="Striking context-aware summary..."
                    value={seoDescription}
                    onChange={(e) => setSeoDescription(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label htmlFor="seo-keywords">KEYWORDS INDEX (COMMA SEPARATED)</label>
                  <input
                    id="seo-keywords"
                    type="text"
                    className={styles.inputField}
                    placeholder="e.g. philosophy, ethics, state, society"
                    value={seoKeywords}
                    onChange={(e) => setSeoKeywords(e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

          </div>

          {/* EDITORIAL PREVIEW VIEW */}
          <div className={styles.previewContainer} style={{ display: activeTab === "preview" ? "block" : "none" }}>
            <div className={styles.previewMeta}>
              <span className={styles.previewLabelLabel}>Live Mock View</span>
              <h1>{title || "Striking Article Title Placeholder"}</h1>
              <p className={styles.previewSubtitle}>{subtitle || "Striking excerpt summary context representing depth..."}</p>
              
              <div className={styles.authorSection}>
                <div className={styles.authorDetails}>
                  <span className={styles.authName}>{session.name}</span>
                  <span className={styles.authSub}>
                    {category} • {readTime} • {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                </div>
              </div>
            </div>

            <div className={styles.previewBannerContainer}>
              <img
                src={customBannerUrl.trim() ? customBannerUrl : bannerUrl}
                alt="Banner Preview"
                className={styles.previewBanner}
              />
            </div>

            <article className={styles.previewBody}>
              {renderPreviewParagraphs()}
            </article>
          </div>
        </section>

        {/* RIGHT PANE: Editorial Quality Checklist & Instructions */}
        <aside className={styles.instructionPane}>
          <h3>Editorial Charter</h3>
          <div className={styles.cardCharter}>
            <p><strong>Verence</strong> champions journalism that separates reality from the noise, challenges conventional takes, and respects reader integrity.</p>
            <ul>
              <li>Write clearly, edit thoroughly, and reward patience.</li>
              <li>Acknowledge systemic complexities and state opposing positions fairly.</li>
              <li>Always check references before citation mapping.</li>
            </ul>
          </div>

          <h3 style={{ marginTop: "2rem" }}>Formatting Guide</h3>
          <div className={styles.cardCharter} style={{ background: "transparent", border: "none", padding: "0 0.5rem" }}>
            <div className={styles.guideItem}>
              <strong>Drop Cap Paragraph</strong>
              <p>The very first paragraph typed will automatically feature a stylized Drop Cap initial.</p>
            </div>
            <div className={styles.guideItem}>
              <strong>Section Break / Sub-header</strong>
              <p>Start a paragraph block with <code>## </code> to create a section dividing header.</p>
            </div>
            <div className={styles.guideItem}>
              <strong>Important Citations</strong>
              <p>Start a paragraph block with <code>&gt; </code> to highlight central quotes in large blockquotes.</p>
            </div>
          </div>
        </aside>

      </main>
    </div>
  );
}
