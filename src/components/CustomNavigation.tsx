"use client";
import Link from "next/link";
import styles from "./styles/CustomNavigation.module.css";
import Logo from "./Logo";
import SearchIcon from "./SearchIcon";
import ChevronDown from "./ChevronDown";
import Button from "./Button";

function CustomNavigation() {
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
  return (
    <nav className={styles.navigation}>
      <Link href="/" className={styles.logo}>
        <Logo />
        <h3>Veritos</h3>
      </Link>
      <div className={styles.searchBar}>
        <SearchIcon />
        <input type="search" placeholder="Search articles or quotes" />
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
