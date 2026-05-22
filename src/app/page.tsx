"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import styles from "./page.module.css";
import CustomNavigation from "@/components/CustomNavigation";
import { articles } from "@/data/articles";
import { api } from "@/utils/api";

export default function Home() {
  const [allArticles, setAllArticles] = useState(articles);
  const [quoteOfTheDay, setQuoteOfTheDay] = useState({
    text: "The truth will set you free, but first it will make you uncomfortable.",
    author: "James Baldwin",
    context: ""
  });

  useEffect(() => {
    async function loadData() {
      try {
        // Try fetching from the backend API first
        const [pubRes, quoteRes, overridesRes] = await Promise.all([
          api.publications.list({ status: "published" }),
          api.quotes.list("published"),
          api.settings.getOverrides().catch(() => ({ overrides: {} as any }))
        ]);

        // Transform publications to match the frontend Article interface
        const fetchedPubs = pubRes.publications.map((pub: any) => ({
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
        }));

        const overrides = overridesRes.overrides || {};

        // Merge static articles that are NOT deleted
        const activeStatic = articles
          .filter((sa) => !overrides[sa.slug]?.is_deleted)
          .map((sa) => {
            const override = overrides[sa.slug];
            return {
              ...sa,
              isFeatured: override ? override.is_featured : sa.isFeatured
            };
          });

        // Combine: dynamic first, then static
        const merged = [...fetchedPubs];
        activeStatic.forEach((staticArt) => {
          if (!merged.some((m) => m.slug === staticArt.slug)) {
            merged.push(staticArt);
          }
        });

        setAllArticles(merged);

        // Load quote
        if (quoteRes.quotes.length > 0) {
          const latestQuote = quoteRes.quotes[0]; // Ordered by created_at DESC
          setQuoteOfTheDay({
            text: latestQuote.quote_text,
            author: latestQuote.author,
            context: latestQuote.context || ""
          });
        }
      } catch (error) {
        console.warn("Verence API down, falling back to offline LocalStorage state.", error);
        
        // --- Offline fallback starts ---
        const rawDeleted = localStorage.getItem("verence_deleted_static_slugs");
        const rawFeatured = localStorage.getItem("verence_featured_static_slugs");
        
        let deletedSlugs: string[] = [];
        let featuredSlugs: string[] = [];
        
        if (rawDeleted) {
          try { deletedSlugs = JSON.parse(rawDeleted); } catch(e) {}
        }
        if (rawFeatured) {
          try { featuredSlugs = JSON.parse(rawFeatured); } catch(e) {}
        }

        const activeStatic = articles
          .filter((sa) => !deletedSlugs.includes(sa.slug))
          .map((sa) => {
            if (featuredSlugs.length > 0) {
              return { ...sa, isFeatured: featuredSlugs.includes(sa.slug) };
            }
            return sa;
          });

        const rawLocal = localStorage.getItem("verence_local_publications");
        let merged = [...activeStatic];
        if (rawLocal) {
          try {
            const localPubs = JSON.parse(rawLocal);
            const publishedLocal = localPubs.filter((p: any) => p.status === "published");
            
            const filteredStatic = activeStatic.filter(
              (staticArt) => !publishedLocal.some((localArt: any) => localArt.slug === staticArt.slug)
            );
            merged = [...publishedLocal, ...filteredStatic];
          } catch (e) {
            console.error("Error parsing local publications", e);
          }
        }
        setAllArticles(merged);

        const rawQuotes = localStorage.getItem("verence_local_quotes");
        if (rawQuotes) {
          try {
            const localQuotes = JSON.parse(rawQuotes);
            const publishedQuotes = localQuotes.filter((q: any) => q.status === "published");
            if (publishedQuotes.length > 0) {
              const latestQuote = publishedQuotes[publishedQuotes.length - 1];
              setQuoteOfTheDay({
                text: latestQuote.quoteText,
                author: latestQuote.author,
                context: latestQuote.context || ""
              });
            }
          } catch (e) {
            console.error("Error parsing local quotes", e);
          }
        }
        // --- Offline fallback ends ---
      }
    }

    loadData();
  }, []);

  const featuredArticle = allArticles.find((a) => a.isFeatured) || allArticles[0];

  // Right side list of featured articles
  const rightArticles = allArticles
    .filter((a) => a.slug !== featuredArticle.slug)
    .slice(0, 4);

  // Categories list with descriptions
  const categories = [
    {
      title: "Truth & Context",
      description:
        "Investigative reporting and analysis of events shaping our world.",
      slug: "truth-and-context",
      linkText: "Explore Truth & Context",
    },
    {
      title: "Ideas & Insight",
      description:
        "Essays, philosophy, and cultural critique that challenge assumptions and spark reflection.",
      slug: "ideas-and-insight",
      linkText: "Explore Ideas & Insight",
    },
    {
      title: "Question & Wisdom",
      description:
        "Curated quotes and timeless wisdom from thinkers past and present.",
      slug: "question-and-wisdom",
      linkText: "Explore Wisdom",
    },
    {
      title: "Dialogue & Debate",
      description: "Conversations and debates that explore ideas in depth.",
      slug: "dialogue-and-debate",
      linkText: "Explore Dialogue",
    },
  ];

  return (
    <main className={styles.main}>
      <CustomNavigation />

      {/* 1. Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.heroContent}>
          <h1>The Essence of Truth</h1>
          <p>
            Verence publishes analysis, essays, and insights that challenge
            assumptions, illuminate reality, and reward deep thinking. For
            readers who refuse shallow takes, we provide clarity, context, and
            perspective.
          </p>
          <div className={styles.heroLinks}>
            <Link
              href="/categories/truth-and-context"
              className={styles.primaryLink}
            >
              Read the Latest
            </Link>
            <Link
              href="/categories/ideas-and-insight"
              className={styles.secondaryLink}
            >
              Explore Essays & Philosophy
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Featured Insights Section */}
      <section className={styles.featuredSection}>
        <div className={styles.sectionHeader}>
          <h2>Featured Insights</h2>
          <div className={styles.accentLine}></div>
        </div>

        <div className={styles.featuredContainer}>
          {/* Left Main Featured Card */}
          <div className={styles.featuredMain}>
            <div className={styles.featuredImageContainer}>
              <img
                src={featuredArticle.image}
                alt={featuredArticle.title}
                className={styles.featuredImage}
              />
              <span className={styles.categoryBadge}>
                {featuredArticle.category}
              </span>
            </div>
            <div className={styles.featuredBody}>
              <h3>{featuredArticle.title}</h3>
              <div className={styles.articleMeta}>
                <p>
                  <span>By</span>
                  <strong className={styles.metaAuthor}>
                    {" "}
                    {featuredArticle.author}
                  </strong>
                </p>
                <span className={styles.metaDot}>•</span>
                <p className={styles.readTime}>{featuredArticle.readTime}</p>
              </div>
              <p className={styles.featuredDescription}>
                {featuredArticle.subtitle}
              </p>
              <Link
                href={`/articles/${featuredArticle.slug}`}
                className={styles.readLink}
              >
                Read Article
              </Link>
            </div>
          </div>

          {/* Right Sub-Articles List */}
          <div className={styles.articlesList}>
            {rightArticles.map((article) => (
              <Link
                key={article.slug}
                href={`/articles/${article.slug}`}
                className={styles.articleItem}
              >
                <span className={styles.articleItemCategory}>
                  {article.category}
                </span>
                <h4>{article.title}</h4>
                <p className={styles.articleItemSubtitle}>{article.subtitle}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Why Verence Exists Section */}
      <section className={styles.missionSection}>
        <div className={styles.missionContainer}>
          <div className={styles.missionCard}>
            <h2>Why Verence Exists</h2>
            <p>
              Verence exists to express reality as it is - thoughtfully,
              clearly, and honestly. We publish news, essays, curated
              quotations, and deep-thinking conversations for readers who seek
              insight beyond the noise. Every piece is carefully curated,
              fact-checked, and intended to elevate understanding.
            </p>
            <Link href="/about" className={styles.missionLink}>
              Learn More About Our Mission
            </Link>
          </div>
        </div>
      </section>

      {/* 4. What You'll Find Here Section */}
      <section className={styles.findHereSection}>
        <div className={styles.sectionHeader}>
          <h2>What You'll Find Here</h2>
          <div className={styles.accentLine}></div>
        </div>

        <div className={styles.categoriesGrid}>
          {categories.map((cat) => (
            <div key={cat.slug} className={styles.categoryCard}>
              <h3>{cat.title}</h3>
              <p>{cat.description}</p>
              <Link
                href={`/categories/${cat.slug}`}
                className={styles.categoryCardLink}
              >
                {cat.linkText}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Join the Community Section */}
      <section className={styles.subscribeSection}>
        <div className={styles.subscribeCard}>
          <h2>Join the Verence Community</h2>
          <p>
            Subscribe to Verence and never miss a piece that challenges the way
            you think. Access free updates or unlock premium essays, analysis,
            and curated insights for those who want to go deeper.
          </p>
          <div className={styles.subscribeActions}>
            <button className={styles.subscribeBtnFree}>
              Subscribe for Free
            </button>
            <button className={styles.subscribeBtnPremium}>Go Premium</button>
          </div>
        </div>
      </section>

      {/* 6. Quote of The Day Section */}
      <section className={styles.quoteSection}>
        <div className={styles.quoteCard}>
          <span className={styles.quoteLabel}>QUOTE OF THE DAY</span>
          <blockquote>
            "{quoteOfTheDay.text}"
          </blockquote>
          <cite>
            — {quoteOfTheDay.author}
            {quoteOfTheDay.context ? ` (${quoteOfTheDay.context})` : ""}
          </cite>
        </div>
      </section>

      {/* 7. Recent Articles Grid */}
      <section className={styles.recentSection}>
        <div className={styles.sectionHeader}>
          <h2>Recent Publications</h2>
          <div className={styles.accentLine}></div>
        </div>

        <div className={styles.recentGrid}>
          {allArticles.map((article) => (
            <Link
              key={article.slug}
              href={`/articles/${article.slug}`}
              className={styles.recentCard}
            >
              <div className={styles.recentCardImageContainer}>
                <img
                  src={article.image}
                  alt={article.title}
                  className={styles.recentCardImage}
                />
                <span className={styles.recentCardBadge}>
                  {article.category}
                </span>
              </div>
              <div className={styles.recentCardBody}>
                <div className={styles.recentCardMeta}>
                  <span>{article.readTime}</span>
                  <span>•</span>
                  <span>Essay</span>
                </div>
                <h3>{article.title}</h3>
                <p>{article.subtitle}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 8. Footer Section */}
      <footer className={styles.footer}>
        <div className={styles.footerBrand}>
          <div className={styles.footerLogoContainer}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 30 30"
              fill="none"
            >
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
