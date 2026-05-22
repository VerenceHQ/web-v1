"use client";
import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import CustomNavigation from "@/components/CustomNavigation";
import { articles, Article } from "@/data/articles";
import styles from "./ArticleDetail.module.css";
import { api } from "@/utils/api";

export default function ArticleDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [isBookmarked, setIsBookmarked] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [allArticles, setAllArticles] = useState(articles);
  const [currentArticle, setCurrentArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        // 1. Fetch current article from API
        const articleRes = await api.publications.get(slug);
        const pub = articleRes.publication;
        const transformed = {
          slug: pub.slug,
          title: pub.title,
          subtitle: pub.subtitle || "",
          category: pub.category,
          categorySlug: pub.category_slug,
          author: pub.author,
          readTime: pub.read_time,
          date: pub.date,
          time: pub.time,
          content: pub.content,
          isFeatured: !!pub.is_featured,
          readCount: pub.read_count || 0,
          image: pub.image,
        };
        setCurrentArticle(transformed);

        // 2. Fetch list for related articles
        const listRes = await api.publications.list({ status: "published" });
        const fetchedPubs = listRes.publications.map((p: any) => ({
          slug: p.slug,
          title: p.title,
          subtitle: p.subtitle || "",
          category: p.category,
          categorySlug: p.category_slug,
          author: p.author,
          readTime: p.read_time,
          date: p.date,
          time: p.time,
          content: p.content,
          isFeatured: !!p.is_featured,
          readCount: p.read_count || 0,
          image: p.image,
        }));

        const merged: Article[] = [...fetchedPubs];
        articles.forEach((staticArt) => {
          if (!merged.some((m) => m.slug === staticArt.slug)) {
            merged.push(staticArt);
          }
        });
        setAllArticles(merged);
      } catch (error) {
        console.warn("Verence API offline or error loading article detail, using offline local storage fallback.", error);
        
        // --- Offline fallback starts ---
        const rawLocal = localStorage.getItem("verence_local_publications");
        let merged = [...articles];
        if (rawLocal) {
          try {
            const localPubs = JSON.parse(rawLocal);
            const publishedLocal = localPubs.filter((p: any) => p.status === "published");
            
            publishedLocal.forEach((localItem: any) => {
              const idx = merged.findIndex((m) => m.slug === localItem.slug);
              if (idx !== -1) {
                merged[idx] = localItem;
              } else {
                merged.push(localItem);
              }
            });
          } catch(e) {}
        }
        setAllArticles(merged);
        
        const found = merged.find((a) => a.slug === slug);
        setCurrentArticle(found || null);
        // --- Offline fallback ends ---
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [slug]);

  // Look up current article in mock database
  const article = currentArticle;

  // Load bookmark state from local storage on mount
  useEffect(() => {
    if (article) {
      const saved = localStorage.getItem(`bookmark_${article.slug}`);
      setIsBookmarked(!!saved);
    }
  }, [article]);

  // Toggles bookmark state in local storage
  const handleBookmarkToggle = () => {
    if (!article) return;
    if (isBookmarked) {
      localStorage.removeItem(`bookmark_${article.slug}`);
      setIsBookmarked(false);
      triggerToast("Article removed from your bookmarks.");
    } else {
      localStorage.setItem(`bookmark_${article.slug}`, "true");
      setIsBookmarked(true);
      triggerToast("Article saved to your bookmarks.");
    }
  };

  // Copies link and shows toast
  const handleShareClick = () => {
    if (typeof window === "undefined") return;
    navigator.clipboard.writeText(window.location.href);
    triggerToast("Link copied to clipboard!");
  };

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
  };

  // Hide toast after 3 seconds
  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => {
        setShowToast(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  // Filter related articles (More Like This)
  const relatedArticles = useMemo(() => {
    if (!article) return [];
    return allArticles
      .filter((a) => a.categorySlug === article.categorySlug && a.slug !== article.slug)
      .slice(0, 4);
  }, [article, allArticles]);

  if (loading) {
    return (
      <main className={styles.main}>
        <CustomNavigation />
        <div className={styles.notFoundContainer} style={{ border: "none", background: "transparent" }}>
          <div className={styles.spinner} style={{ width: "40px", height: "40px", border: "3px solid rgba(0, 156, 101, 0.1)", borderTopColor: "#009c65", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 1.5rem" }} />
          <h2 style={{ fontSize: "1.1rem", fontWeight: 500, letterSpacing: "0.05em", color: "rgba(230, 246, 240, 0.8)" }}>VERIFYING DIGITAL MANUSCRIPT...</h2>
          <style>{`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </main>
    );
  }

  if (!article) {
    return (
      <main className={styles.main}>
        <CustomNavigation />
        <div className={styles.notFoundContainer}>
          <h2>Article Not Found</h2>
          <p>The essay or analysis you are looking for does not exist or has been archived.</p>
          <Link href="/" className={styles.backHomeBtn}>
            Back to Homepage
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.main}>
      <CustomNavigation />

      {/* 1. Article Header Info */}
      <article className={styles.articleWrapper}>
        <header className={styles.articleHeader}>
          <div className={styles.breadcrumb}>
            <Link href={`/categories/${article.categorySlug}`}>{article.category}</Link>
          </div>
          <h1>{article.title}</h1>
          <p className={styles.articleSub}>{article.subtitle}</p>

          <div className={styles.authorMetaBar}>
            <div className={styles.authorGroup}>
              <span>By</span>
              <strong className={styles.authorName}> {article.author}</strong>
            </div>
            <span className={styles.metaDot}>•</span>
            <span className={styles.readTime}>{article.readTime}</span>
            <span className={styles.metaDot}>•</span>
            <time className={styles.pubTime}>
              {article.date} at {article.time}
            </time>
          </div>
        </header>

        {/* 2. Floating Action Sidebar */}
        <div className={styles.articleLayout}>
          <aside className={styles.actionPanel}>
            <div className={styles.actionSticky}>
              <button
                onClick={handleShareClick}
                className={styles.actionButton}
                title="Share Article"
                aria-label="Share Article"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="18" cy="5" r="3"></circle>
                  <circle cx="6" cy="12" r="3"></circle>
                  <circle cx="18" cy="19" r="3"></circle>
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                </svg>
                <span>Share</span>
              </button>

              <button
                onClick={handleBookmarkToggle}
                className={`${styles.actionButton} ${isBookmarked ? styles.activeBookmark : ""}`}
                title="Save Article"
                aria-label="Save Article"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill={isBookmarked ? "var(--primary-green-action)" : "none"}
                  stroke={isBookmarked ? "var(--primary-green-action)" : "currentColor"}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                </svg>
                <span>{isBookmarked ? "Saved" : "Save"}</span>
              </button>
            </div>
          </aside>

          {/* 3. Main Reading Content */}
          <div className={styles.articleMain}>
            <div className={styles.imageContainer}>
              <img src={article.image} alt={article.title} className={styles.articleImage} />
            </div>

            <div className={styles.articleBody}>
              {article.content.map((paragraph: string, index: number) => {
                // Style first letter of first paragraph as dynamic drop-cap
                if (index === 0) {
                  return (
                    <p key={index} className={styles.firstParagraph}>
                      <span className={styles.dropCap}>{paragraph.charAt(0)}</span>
                      {paragraph.slice(1)}
                    </p>
                  );
                }
                
                // Add an elegant blockquote if the paragraph is structured like dialogue
                if (paragraph.startsWith("**")) {
                  const parts = paragraph.split(":** ");
                  if (parts.length > 1) {
                    const speaker = parts[0].replace(/\*\*/g, "");
                    const quoteText = parts[1];
                    return (
                      <div key={index} className={styles.dialogueBlock}>
                        <strong className={styles.dialogueSpeaker}>{speaker}</strong>
                        <blockquote className={styles.dialogueQuote}>{quoteText}</blockquote>
                      </div>
                    );
                  }
                }
                return <p key={index}>{paragraph}</p>;
              })}
            </div>

            {/* References Card */}
            <div className={styles.referencesCard}>
              <h4>References & Resources</h4>
              <ul>
                <li>
                  <a href="#" onClick={(e) => e.preventDefault()}>
                    Verence Editorial Standards & Verification Protocols
                  </a>
                </li>
                <li>
                  <a href="#" onClick={(e) => e.preventDefault()}>
                    Global Resourcing & Supply Chain Analysis Index (2026)
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </article>

      {/* 4. More Like This Section */}
      <section className={styles.moreLikeThisSection}>
        <div className={styles.moreLikeThisContainer}>
          <div className={styles.sectionHeader}>
            <h2>More Like This</h2>
            <div className={styles.accentLine}></div>
          </div>

          <div className={styles.relatedGrid}>
            {relatedArticles.length > 0 ? (
              relatedArticles.map((rel) => (
                <Link key={rel.slug} href={`/articles/${rel.slug}`} className={styles.relatedCard}>
                  <div className={styles.relatedImageContainer}>
                    <img src={rel.image} alt={rel.title} />
                    <span className={styles.relatedBadge}>Report & Analysis</span>
                  </div>
                  <div className={styles.relatedBody}>
                    <div className={styles.relatedMeta}>
                      <span>{rel.date}</span>
                      <span>•</span>
                      <span>{rel.readTime}</span>
                    </div>
                    <h3>{rel.title}</h3>
                    <p>{rel.subtitle}</p>
                  </div>
                </Link>
              ))
            ) : (
              // Fallback cards if no articles exist under the current category
              articles
                .filter((a) => a.slug !== article.slug)
                .slice(0, 4)
                .map((rel) => (
                  <Link key={rel.slug} href={`/articles/${rel.slug}`} className={styles.relatedCard}>
                    <div className={styles.relatedImageContainer}>
                      <img src={rel.image} alt={rel.title} />
                      <span className={styles.relatedBadge}>{rel.category}</span>
                    </div>
                    <div className={styles.relatedBody}>
                      <div className={styles.relatedMeta}>
                        <span>{rel.date}</span>
                        <span>•</span>
                        <span>{rel.readTime}</span>
                      </div>
                      <h3>{rel.title}</h3>
                      <p>{rel.subtitle}</p>
                    </div>
                  </Link>
                ))
            )}
          </div>
        </div>
      </section>

      {/* 5. Custom Notification Toast */}
      <div className={`${styles.toast} ${showToast ? styles.toastShow : ""}`}>
        <div className={styles.toastContent}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          <span>{toastMessage}</span>
        </div>
      </div>

      {/* Footer Section */}
      <footer className={styles.footer}>
        <div className={styles.footerBrand}>
          <div className={styles.footerLogoContainer}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 30 30" fill="none">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M29.2914 13.5094C30.0508 14.2688 30.0508 15.5 29.2914 16.2594L16.3677 29.1831C15.5866 29.9641 14.3203 29.9641 13.5393 29.1831L0.536981 16.1808C-0.178994 15.4648 -0.178993 14.304 0.536981 13.588C1.25296 12.872 2.41378 12.872 3.12975 13.588L13.382 23.8403C14.1631 24.6213 15.4294 24.6213 16.2105 23.8403L26.5414 13.5094C27.3008 12.75 28.532 12.75 29.2914 13.5094ZM23.7521 7.97012C24.5332 8.75119 24.5331 10.0176 23.752 10.7986L16.0523 18.4977C15.2712 19.2786 14.0049 19.2786 13.2239 18.4976L5.84029 11.114C5.05927 10.333 5.05924 9.06667 5.84022 8.28561L13.5393 0.585851C14.3203 -0.195259 15.5867 -0.195287 16.3678 0.585787L23.7521 7.97012ZM13.5441 9.42265C13.4748 9.60968 13.3273 9.75723 13.1402 9.82643C12.5452 10.0466 12.5452 10.8883 13.1403 11.1084C13.3273 11.1776 13.4748 11.3251 13.5441 11.5121C13.7645 12.1072 14.6066 12.1075 14.8268 11.5122C14.8961 11.3251 15.0436 11.1776 15.2307 11.1084C15.8257 10.8882 15.8258 10.0466 15.2307 9.82648C15.0436 9.75725 14.8961 9.60967 14.8269 9.42253C14.6067 8.82716 13.7645 8.82737 13.5441 9.42265ZM17.5043 8.35888C17.4627 8.47115 17.3742 8.55969 17.262 8.60125C16.9049 8.73346 16.905 9.23848 17.262 9.37069C17.3743 9.41224 17.4628 9.50074 17.5043 9.61297C17.6365 9.97001 18.1415 9.97006 18.2737 9.61301C18.3153 9.50076 18.4038 9.41225 18.5161 9.37071C18.8733 9.23857 18.8733 8.73337 18.5162 8.60123C18.4039 8.55968 18.3153 8.47114 18.2738 8.35884C18.1416 8.00167 17.6364 8.00171 17.5043 8.35888ZM15.3677 6.6463C15.3354 6.73355 15.2665 6.80243 15.1793 6.83476C14.9016 6.93763 14.9014 7.33055 15.1792 7.43317C15.2665 7.46544 15.3354 7.53432 15.3678 7.62162C15.4706 7.89924 15.8635 7.89945 15.9661 7.62174C15.9984 7.53433 16.0673 7.46542 16.1547 7.43312C16.4324 7.33052 16.4322 6.93765 16.1546 6.8348C16.0673 6.80245 15.9984 6.73355 15.9661 6.64622C15.8635 6.36846 15.4706 6.36863 15.3677 6.6463Z"
                fill="#009C65"
              />
            </svg>
            <h3>Verence</h3>
          </div>
          <p>Truth & Context. News and analysis grounded in reality.</p>
        </div>

        <div className={styles.footerLinksGrid}>
          <div className={styles.footerColumn}>
            <h4>Platform</h4>
            <Link href="/">Home</Link>
            <Link href="/about">About Us</Link>
            <Link href="/standards">Editorial Standards</Link>
          </div>
          <div className={styles.footerColumn}>
            <h4>Support</h4>
            <Link href="/contact">Contact</Link>
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/socials">Social Media</Link>
          </div>
        </div>

        <div className={styles.footerCopyright}>
          <p>© 2026 All Rights Reserved. Verence Limited.</p>
        </div>
      </footer>
    </main>
  );
}
