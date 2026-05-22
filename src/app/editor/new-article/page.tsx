"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./ArticleComposer.module.css";
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
  const [bannerUrl, setBannerUrl] = useState(bannerPresets[0].url);
  const [customBannerUrl, setCustomBannerUrl] = useState("");
  const [readTime, setReadTime] = useState("5 mins read");
  const [seoDescription, setSeoDescription] = useState("");
  const [seoKeywords, setSeoKeywords] = useState("");
  const [markdownContent, setMarkdownContent] = useState("");
  const [hasDropCap, setHasDropCap] = useState(true);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // 1. Session check
    const rawSession = localStorage.getItem("verence_editor_session");
    if (!rawSession) {
      router.replace("/editor/login");
      return;
    }
    setSession(JSON.parse(rawSession));
  }, [router]);

  // Markdown format injector helper
  const injectMarkdown = (prefix: string, suffix: string = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end);
    const replacement = prefix + selected + suffix;

    const newText = text.substring(0, start) + replacement + text.substring(end);
    setMarkdownContent(newText);

    // Refocus and place cursor
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + selected.length);
    }, 50);
  };

  const handleSave = (status: "draft" | "published") => {
    if (!title.trim()) {
      alert("Please enter an article title.");
      return;
    }
    if (!markdownContent.trim()) {
      alert("Please write some article content.");
      return;
    }

    const currentBanner = customBannerUrl.trim() ? customBannerUrl.trim() : bannerUrl;
    const generatedSlug = title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "") // remove special chars
      .replace(/\s+/g, "-"); // spaces to hyphens

    const newPub: LocalPublication = {
      id: "pub_" + Date.now(),
      slug: generatedSlug,
      title: title.trim(),
      subtitle: subtitle.trim(),
      category: category,
      categorySlug: category.toLowerCase().replace(/ & /g, "-and-").replace(/\s+/g, "-"),
      author: session?.name || "Elena Rostova",
      readTime: readTime.trim(),
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      content: markdownContent.split("\n\n").filter((p) => p.trim() !== ""),
      status: status,
      readCount: 0,
      image: currentBanner,
      seoDescription: seoDescription.trim(),
      seoKeywords: seoKeywords.trim(),
      type: "article",
    };

    // Load, append and save to localStorage
    const rawPubs = localStorage.getItem("verence_local_publications");
    let currentPubs: LocalPublication[] = [];
    if (rawPubs) {
      currentPubs = JSON.parse(rawPubs);
    }
    
    // Check if slug already exists to prevent duplicate keys
    const index = currentPubs.findIndex((p) => p.slug === generatedSlug);
    if (index !== -1) {
      currentPubs[index] = newPub; // Update existing
    } else {
      currentPubs.push(newPub);
    }

    localStorage.setItem("verence_local_publications", JSON.stringify(currentPubs));
    alert(status === "published" ? "Publication is now LIVE!" : "Draft saved successfully.");
    router.push("/editor/dashboard");
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

      // Replace markdown bold **text** and italic *text*
      let htmlContent = para
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
        .replace(/\*(.*?)\*/g, "<em>$1</em>");

      return (
        <p
          key={index}
          className={isFirst && hasDropCap ? styles.firstParagraph : ""}
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
      );
    });
  };

  if (!session) return null;

  return (
    <div className={styles.pageWrapper}>
      {/* Navbar with Action Triggers */}
      <header className={styles.navbar}>
        <Link href="/editor/dashboard" className={styles.logoArea}>
          <Logo />
          <span>Verence Composer</span>
        </Link>
        <div className={styles.navActions}>
          <Link href="/editor/dashboard" className={styles.btnBack}>
            Exit
          </Link>
          <button className={styles.btnDraft} onClick={() => handleSave("draft")}>
            Save Draft
          </button>
          <button className={styles.btnPublish} onClick={() => handleSave("published")}>
            Publish Live
          </button>
        </div>
      </header>

      {/* Editor Double Pane */}
      <main className={styles.composerLayout}>
        
        {/* LEFT PANE: Editors Form Inputs */}
        <section className={styles.editorPane}>
          <div className={styles.editorScrollContainer}>
            
            {/* 1. Meta Area */}
            <div>
              <h3 className={styles.sectionTitle}>Publication Metadata</h3>
              <div className={styles.metaGrid}>
                <div className={styles.inputGroup}>
                  <label htmlFor="title-input">Article Title</label>
                  <input
                    id="title-input"
                    type="text"
                    className={styles.inputField}
                    placeholder="Enter bold, captivating title..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label htmlFor="subtitle-input">Subtitle / Description</label>
                  <textarea
                    id="subtitle-input"
                    className={styles.inputField}
                    rows={2}
                    placeholder="Enter short analytical summary..."
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    style={{ resize: "none" }}
                  />
                </div>
                
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div className={styles.inputGroup}>
                    <label htmlFor="category-select">Category</label>
                    <select
                      id="category-select"
                      className={styles.selectField}
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                    >
                      <option>Truth & Context</option>
                      <option>Ideas & Insight</option>
                      <option>Question & Wisdom</option>
                      <option>Dialogue & Debate</option>
                    </select>
                  </div>
                  <div className={styles.inputGroup}>
                    <label htmlFor="read-time-input">Reading Time Estimate</label>
                    <input
                      id="read-time-input"
                      type="text"
                      className={styles.inputField}
                      placeholder="e.g. 7 mins read"
                      value={readTime}
                      onChange={(e) => setReadTime(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Banner Selection */}
            <div>
              <h3 className={styles.sectionTitle}>Banner Imagery</h3>
              <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.5rem" }}>
                Select a premium stock preset or enter a custom Unsplash/web image URL.
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
                  </div>
                ))}
              </div>
              <div className={styles.customUrlBlock}>
                <input
                  type="url"
                  className={styles.inputField}
                  placeholder="Paste custom banner image URL..."
                  value={customBannerUrl}
                  onChange={(e) => setCustomBannerUrl(e.target.value)}
                />
              </div>
            </div>

            {/* 3. SEO Meta panel */}
            <div>
              <h3 className={styles.sectionTitle}>SEO Meta Configuration</h3>
              <div className={styles.metaGrid}>
                <div className={styles.inputGroup}>
                  <label htmlFor="seo-desc-input">Meta Description (for Search Engines)</label>
                  <input
                    id="seo-desc-input"
                    type="text"
                    className={styles.inputField}
                    placeholder="Short summary under 160 characters..."
                    value={seoDescription}
                    onChange={(e) => setSeoDescription(e.target.value)}
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label htmlFor="seo-keywords-input">Focus Keywords</label>
                  <input
                    id="seo-keywords-input"
                    type="text"
                    className={styles.inputField}
                    placeholder="e.g. truth, philosophy, ethics, artificial intelligence"
                    value={seoKeywords}
                    onChange={(e) => setSeoKeywords(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* 4. Text Editor */}
            <div>
              <h3 className={styles.sectionTitle}>Essay Body & Content</h3>
              <div className={styles.editorWorkspace}>
                <div className={styles.toolbar}>
                  <button className={styles.toolBtn} onClick={() => injectMarkdown("**", "**")}>
                    <strong>B</strong>
                  </button>
                  <button className={styles.toolBtn} onClick={() => injectMarkdown("*", "*")}>
                    <em>I</em>
                  </button>
                  <span className={styles.divider} />
                  <button className={styles.toolBtn} onClick={() => injectMarkdown("## ")}>
                    H2
                  </button>
                  <button className={styles.toolBtn} onClick={() => injectMarkdown("> ")}>
                    Quote
                  </button>
                  <span className={styles.divider} />
                  <button className={styles.toolBtn} onClick={() => setMarkdownContent(prev => prev + "\n\n")}>
                    Paragraph
                  </button>

                  <label className={styles.toggleLabel}>
                    <input
                      type="checkbox"
                      className={styles.checkboxInput}
                      checked={hasDropCap}
                      onChange={(e) => setHasDropCap(e.target.checked)}
                    />
                    <span>Styled Drop-Cap</span>
                  </label>
                </div>
                <textarea
                  ref={textareaRef}
                  className={styles.editorArea}
                  placeholder="Compose your essay here. Separate paragraphs with double-blank lines. Use toolbar controls for styling..."
                  value={markdownContent}
                  onChange={(e) => setMarkdownContent(e.target.value)}
                />
              </div>
            </div>

          </div>
        </section>

        {/* RIGHT PANE: Live Typography Preview */}
        <section className={styles.previewPane}>
          <div className={styles.previewScrollContainer}>
            <div className={styles.previewHeader}>
              <div className={styles.previewMetaRow}>
                <span>{category}</span>
                <span>•</span>
                <span>{readTime}</span>
              </div>
              <h1 className={styles.previewTitle}>
                {title ? title : "Title of Your Publication"}
              </h1>
              <p className={styles.previewSubtitle}>
                {subtitle ? subtitle : "Your essay subtitle or thesis statement will render here as context-rich prose."}
              </p>
              <div className={styles.authorMetaBlock}>
                <span className={styles.authorNameText}>By {session.name}</span>
                <span>•</span>
                <span>Just Now</span>
              </div>
            </div>

            <div className={styles.previewBannerContainer}>
              <img
                src={customBannerUrl.trim() ? customBannerUrl : bannerUrl}
                alt="Banner Preview"
                className={styles.previewBanner}
              />
            </div>

            <article className={styles.articleBody}>
              {renderPreviewParagraphs()}
            </article>
          </div>
        </section>

      </main>
    </div>
  );
}
