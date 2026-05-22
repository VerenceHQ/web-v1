"use client";
import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import styles from "./styles/CustomNavigation.module.css";
import Logo from "./Logo";
import SearchIcon from "./SearchIcon";
import ChevronDown from "./ChevronDown";
import Button from "./Button";
import { articles } from "@/data/articles";

function CustomNavigation() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const categories = [
    {
      title: "Truth & Context",
      description: "Investigative reporting & news analysis",
      link: "/categories/truth-and-context",
    },
    {
      title: "Ideas & Insight",
      description: "Essays, analysis & perspectives",
      link: "/categories/ideas-and-insight",
    },
    {
      title: "Question & Wisdom",
      description: "Philosophy, ethics & critical thinking",
      link: "/categories/question-and-wisdom",
    },
    {
      title: "Dialogue & Debate",
      description: "Civil discourse & opposing views",
      link: "/categories/dialogue-and-debate",
    },
  ];

  const [allArticles, setAllArticles] = useState(articles);
  const [allQuotes, setAllQuotes] = useState<any[]>([]);

  useEffect(() => {
    // Merge local publications
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
      } catch (e) {
        console.error("Error parsing local publications", e);
      }
    }
    setAllArticles(merged);

    // Merge local quotes
    const rawQuotes = localStorage.getItem("verence_local_quotes");
    if (rawQuotes) {
      try {
        const localQuotes = JSON.parse(rawQuotes);
        const publishedQuotes = localQuotes.filter((q: any) => q.status === "published");
        setAllQuotes(publishedQuotes);
      } catch (e) {
        console.error("Error parsing local quotes", e);
      }
    }
  }, []);

  // Filter articles and quotes for interactive search dropdown
  const searchResults = searchQuery.trim()
    ? [
        ...allArticles
          .filter(
            (article) =>
              article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              article.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
              article.category.toLowerCase().includes(searchQuery.toLowerCase())
          )
          .map((a) => ({ ...a, searchType: "article" as const })),
        ...allQuotes
          .filter(
            (quote) =>
              quote.quoteText.toLowerCase().includes(searchQuery.toLowerCase()) ||
              quote.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
              quote.wisdomCommentary.toLowerCase().includes(searchQuery.toLowerCase())
          )
          .map((q) => ({
            slug: q.id,
            title: `"${q.quoteText.slice(0, 50)}${q.quoteText.length > 50 ? "..." : ""}"`,
            subtitle: `— ${q.author} (${q.context})`,
            category: `${q.category} (Quote)`,
            categorySlug: q.categorySlug,
            searchType: "quote" as const,
          })),
      ]
    : [];

  // Close search dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <nav className={styles.navigation}>
      <Link href="/" className={styles.logo}>
        <Logo />
        <h3>Verence</h3>
      </Link>
      
      <div className={styles.searchContainer} ref={searchRef}>
        <div className={styles.searchBar}>
          <SearchIcon />
          <input
            type="search"
            placeholder="Search articles or quotes"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
          />
        </div>
        
        {isOpen && searchQuery.trim() && (
          <div className={styles.searchResults}>
            {searchResults.length > 0 ? (
              searchResults.map((item) => (
                <Link
                  key={`${item.searchType}-${item.slug}`}
                  href={item.searchType === "quote" ? `/categories/${item.categorySlug}` : `/articles/${item.slug}`}
                  className={styles.searchItem}
                  onClick={() => {
                    setIsOpen(false);
                    setSearchQuery("");
                  }}
                >
                  <span className={styles.searchCategory}>{item.category}</span>
                  <h4 className={styles.searchTitle}>{item.title}</h4>
                  <p className={styles.searchSubtitle}>{item.subtitle}</p>
                </Link>
              ))
            ) : (
              <div className={styles.noResults}>No matches found for "{searchQuery}"</div>
            )}
          </div>
        )}
      </div>

      <button className={styles.categoriesButton}>
        <span>Categories</span>
        <ChevronDown />
        <div className={styles.categoriesDropdown}>
          {categories.map((category) => (
            <Link
              key={category.title}
              href={category.link}
              className={styles.category}
            >
              {category.title}
              <p>{category.description}</p>
            </Link>
          ))}
        </div>
      </button>
      
      <Button label="Subscribe" variant="primary" onClick={() => {}} />
    </nav>
  );
}

export default CustomNavigation;
