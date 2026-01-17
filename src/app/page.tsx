import Image from "next/image";
import styles from "./page.module.css";
import CustomNavigation from "@/components/CustomNavigation";
import Link from "next/link";

export default function Home() {
  return (
    <main className={styles.main}>
      <CustomNavigation />
      <header>
        <section className={styles.hero_section}>
          <h1>Where Truth Meets Thought</h1>
          <p>
            Verity publishes analysis, essays, and insights that challenge
            assumptions, illuminate reality, and reward deep thinking. For
            readers who refuse shallow takes, we provide clarity, context, and
            perspective.
          </p>
          <div className={styles.hero_links}>
            <Link href="/latest" className={styles.primary_link}>
              Read the Latest
            </Link>
            <Link href="/essays" className={styles.secondary_link}>
              Explore Essays & Philosophy
            </Link>
          </div>
        </section>
      </header>
      <section className={styles.featured_section}>
        <h2>Featured Insights</h2>
        <div className={styles.featured_container}>
          {/* Left Featured Article */}
          <div className={styles.featured_main}>
            <div className={styles.featured_image}>
              {/* Placeholder for featured image */}
            </div>
            <h3>The Real Cost of Instant News</h3>
            <div className={styles.article_meta}>
              <p>
                <span className={styles.meta_label}>By</span>
                <span className={styles.meta_author}> James Albright</span>
              </p>
              <p className={styles.read_time}>7mins read</p>
            </div>
            <p className={styles.article_description}>
              In a world racing for clicks, depth is the lost currency. This
              piece examines the implications of speed over accuracy in modern
              journalism.
            </p>
            <a href="#" className={styles.read_link}>
              Read Article
            </a>
          </div>

          {/* Right Articles List */}
          <div className={styles.articles_list}>
            {[
              {
                title: "Breaking Down Global Economic Shifts",
                subtitle: "Analysis of trends shaping our economies.",
                category: "Truth & Context",
                slug: "breaking-down-global-economic-shifts",
              },
              {
                title: "Rethinking Ethics in a Digital Age",
                subtitle: "Essays challenging conventional wisdom",
                category: "Ideas & Insight",
                slug: "rethinking-ethics-in-a-digital-age",
              },
              {
                title: "Wisdom From Lao Tsu: Reflections on Modern Life",
                subtitle: "Curated insight for reflection",
                category: "Quotations & Wisdom",
                slug: "wisdom-from-lao-tsu-reflections-on-modern-life",
              },
              {
                title: "A Conversation with Dr. Mira Sol: The Philosophy of AI",
                subtitle: "Deep thinking interviews",
                category: "Dialogue & Debate",
                slug: "conversation-with-dr-mira-sol-philosophy-of-ai",
              },
            ].map((article) => (
              <Link
                key={article.slug}
                href={`/articles/${article.slug}`}
                className={styles.article_item}
              >
                <h4>{article.title}</h4>
                <p className={styles.article_subtitle}>{article.subtitle}</p>
                <span className={styles.article_category}>
                  {article.category}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
