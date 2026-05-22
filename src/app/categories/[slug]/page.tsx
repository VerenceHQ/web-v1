"use client";
import React, { useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import CustomNavigation from "@/components/CustomNavigation";
import { articles } from "@/data/articles";
import styles from "./CategoryHub.module.css";

// Category Details mapping
const categoryDetails: Record<string, { title: string; subtitle: string }> = {
  "truth-and-context": {
    title: "Truth & Context",
    subtitle: "News and analysis grounded in reality",
  },
  "ideas-and-insight": {
    title: "Ideas & Insight",
    subtitle: "Essays, analysis and perspectives challenging conventional wisdom",
  },
  "question-and-wisdom": {
    title: "Question & Wisdom",
    subtitle: "Philosophy, ethics and timeless quotes for reflection",
  },
  "dialogue-and-debate": {
    title: "Dialogue & Debate",
    subtitle: "Civil discourse, deep-thinking interviews and opposing views",
  },
};

export default function CategoryPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [sortOption, setSortOption] = useState<"featured" | "newest" | "popular">("featured");
  const [isSortOpen, setIsSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setIsSortOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Get current category data
  const currentCategory = useMemo(() => {
    return (
      categoryDetails[slug] || {
        title: slug ? slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) : "Category",
        subtitle: "Curated insights, essays and analysis.",
      }
    );
  }, [slug]);

  const [allArticles, setAllArticles] = useState(articles);

  useEffect(() => {
    const rawLocal = localStorage.getItem("verence_local_publications");
    if (rawLocal) {
      const localPubs = JSON.parse(rawLocal);
      const publishedLocal = localPubs.filter((p: any) => p.status === "published");
      
      const merged = [...articles];
      publishedLocal.forEach((localItem: any) => {
        const idx = merged.findIndex((m) => m.slug === localItem.slug);
        if (idx !== -1) {
          merged[idx] = localItem;
        } else {
          merged.push(localItem);
        }
      });
      setAllArticles(merged);
    }
  }, []);

  // Filter articles belonging to this category
  const categoryArticles = useMemo(() => {
    return allArticles.filter((a) => a.categorySlug === slug);
  }, [slug, allArticles]);

  // Sort articles based on selection
  const sortedArticles = useMemo(() => {
    const arr = [...categoryArticles];
    if (sortOption === "newest") {
      return arr.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } else if (sortOption === "popular") {
      return arr.sort((a, b) => b.readCount - a.readCount);
    }
    // "featured" default (or original database order)
    return arr;
  }, [categoryArticles, sortOption]);

  return (
    <main className={styles.main}>
      <CustomNavigation />

      {/* 1. Category Header Section */}
      <header className={styles.categoryHeader}>
        <div className={styles.headerContent}>
          <span className={styles.headerLabel}>CATEGORY FOCUS</span>
          <h1>{currentCategory.title}</h1>
          <p>{currentCategory.subtitle}</p>
        </div>
      </header>

      {/* 2. Controls Area (Layout Switcher & Sorters) */}
      <section className={styles.controlsBar}>
        <div className={styles.controlsContainer}>
          <div className={styles.layoutToggle}>
            <button
              onClick={() => setViewMode("list")}
              className={`${styles.toggleBtn} ${viewMode === "list" ? styles.active : ""}`}
              aria-label="List View"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="8" y1="6" x2="21" y2="6"></line>
                <line x1="8" y1="12" x2="21" y2="12"></line>
                <line x1="8" y1="18" x2="21" y2="18"></line>
                <line x1="3" y1="6" x2="3.01" y2="6"></line>
                <line x1="3" y1="12" x2="3.01" y2="12"></line>
                <line x1="3" y1="18" x2="3.01" y2="18"></line>
              </svg>
              <span>List View</span>
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`${styles.toggleBtn} ${viewMode === "grid" ? styles.active : ""}`}
              aria-label="Grid View"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <rect x="3" y="3" width="7" height="7"></rect>
                <rect x="14" y="3" width="7" height="7"></rect>
                <rect x="14" y="14" width="7" height="7"></rect>
                <rect x="3" y="14" width="7" height="7"></rect>
              </svg>
              <span>Grid View</span>
            </button>
          </div>

          <div className={styles.sortDropdownContainer} ref={sortRef}>
            <span className={styles.sortLabel}>Sort By</span>
            <div className={styles.customSortWrapper}>
              <button
                className={styles.sortToggleBtn}
                onClick={() => setIsSortOpen(!isSortOpen)}
                aria-haspopup="listbox"
                aria-expanded={isSortOpen}
              >
                <span>
                  {sortOption === "featured" && "Featured"}
                  {sortOption === "newest" && "Newest First"}
                  {sortOption === "popular" && "Popularity"}
                </span>
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  className={`${styles.arrowIcon} ${isSortOpen ? styles.arrowUp : ""}`}
                >
                  <path d="M6 9l6 6 6-6"></path>
                </svg>
              </button>

              {isSortOpen && (
                <ul className={styles.customDropdownMenu} role="listbox">
                  <li
                    role="option"
                    aria-selected={sortOption === "featured"}
                    className={`${styles.customDropdownItem} ${sortOption === "featured" ? styles.selectedItem : ""}`}
                    onClick={() => {
                      setSortOption("featured");
                      setIsSortOpen(false);
                    }}
                  >
                    <span className={styles.itemTitle}>Featured</span>
                    <p className={styles.itemDesc}>Editor's curated selection</p>
                  </li>
                  <li
                    role="option"
                    aria-selected={sortOption === "newest"}
                    className={`${styles.customDropdownItem} ${sortOption === "newest" ? styles.selectedItem : ""}`}
                    onClick={() => {
                      setSortOption("newest");
                      setIsSortOpen(false);
                    }}
                  >
                    <span className={styles.itemTitle}>Newest First</span>
                    <p className={styles.itemDesc}>Most recently published articles</p>
                  </li>
                  <li
                    role="option"
                    aria-selected={sortOption === "popular"}
                    className={`${styles.customDropdownItem} ${sortOption === "popular" ? styles.selectedItem : ""}`}
                    onClick={() => {
                      setSortOption("popular");
                      setIsSortOpen(false);
                    }}
                  >
                    <span className={styles.itemTitle}>Popularity</span>
                    <p className={styles.itemDesc}>Most read and discussed stories</p>
                  </li>
                </ul>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 3. Articles View (List or Grid) */}
      <section className={styles.articlesSection}>
        <div className={styles.articlesContainer}>
          {sortedArticles.length > 0 ? (
            viewMode === "list" ? (
              // LIST LAYOUT (Desktop - 3 style)
              <div className={styles.listLayout}>
                {sortedArticles.map((article) => (
                  <article key={article.slug} className={styles.listItem}>
                    <div className={styles.listItemContent}>
                      <div className={styles.listItemMeta}>
                        <span className={styles.articleDate}>
                          {article.date} • {article.time}
                        </span>
                        <span className={styles.listItemBadge}>Report & Analysis</span>
                      </div>
                      <Link href={`/articles/${article.slug}`} className={styles.listItemLink}>
                        <h2>{article.title}</h2>
                      </Link>
                      <p>{article.subtitle}</p>
                      <div className={styles.listItemAuthor}>
                        <span>By</span> <strong>{article.author}</strong> • <span>{article.readTime}</span>
                      </div>
                    </div>
                    <div className={styles.listItemImageContainer}>
                      <img src={article.image} alt={article.title} className={styles.listItemImage} />
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              // GRID LAYOUT (Desktop - 5 style)
              <div className={styles.gridLayout}>
                {sortedArticles.map((article) => (
                  <article key={article.slug} className={styles.gridCard}>
                    <div className={styles.gridCardImageContainer}>
                      <img src={article.image} alt={article.title} className={styles.gridCardImage} />
                      <span className={styles.gridCardBadge}>Report & Analysis</span>
                    </div>
                    <div className={styles.gridCardBody}>
                      <div className={styles.gridCardMeta}>
                        <span>{article.date}</span>
                        <span>•</span>
                        <span>{article.readTime}</span>
                      </div>
                      <Link href={`/articles/${article.slug}`} className={styles.gridCardLink}>
                        <h3>{article.title}</h3>
                      </Link>
                      <p>{article.subtitle}</p>
                      <div className={styles.gridCardAuthor}>
                        <span>By</span> <strong>{article.author}</strong>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )
          ) : (
            <div className={styles.emptyState}>
              <h3>No Articles Published</h3>
              <p>We are currently drafting and fact-checking pieces for {currentCategory.title}. Check back soon!</p>
              <Link href="/" className={styles.backHomeBtn}>
                Back to Homepage
              </Link>
            </div>
          )}
        </div>
      </section>

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
