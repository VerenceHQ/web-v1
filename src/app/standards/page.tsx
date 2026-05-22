import React from "react";
import Link from "next/link";
import styles from "./Standards.module.css";
import CustomNavigation from "@/components/CustomNavigation";

export default function EditorialStandardsPage() {
  return (
    <main className={styles.main}>
      <CustomNavigation />

      {/* 1. Standards Header Section */}
      <header className={styles.standardsHeader}>
        <div className={styles.headerContent}>
          <span className={styles.headerLabel}>OUR CHARTER</span>
          <h1>Editorial Standards</h1>
          <p>How we separate reality from the noise and keep our journalism honest</p>
        </div>
      </header>

      {/* 2. Standards Body Section */}
      <section className={styles.standardsBody}>
        <div className={styles.contentContainer}>
          <div className={styles.introBlock}>
            <p className={styles.leadText}>
              At <strong>Verence</strong>, we believe trust isn't something we can just ask for—it is something we have to earn every single day. We started this platform with a simple idea: that truth shouldn't be buried under heavy jargon, sensational headlines, or hidden corporate agendas.
            </p>
            <p className={styles.leadText} style={{ marginTop: "1rem" }}>
              Our writers, editors, and contributors follow a clear set of values to make sure everything we publish is fair, accurate, and deeply respectful of your intelligence.
            </p>
            <div className={styles.lastUpdated}>Updated: May 22, 2026</div>
          </div>

          <div className={styles.standardsGrid}>
            <div className={styles.standardsCard}>
              <h3>
                <span>01.</span> Facts Over Speed
              </h3>
              <p>
                In the rush of the modern internet, we choose to take our time. We would always rather be right than first.
              </p>
              <ul>
                <li>
                  <strong>Real Verification:</strong> We do not publish essays based on rumors or a single social media post. We trace claims back to their absolute source—like public data sheets, court records, or direct statements.
                </li>
                <li>
                  <strong>Zero Hype:</strong> We ban cheap clickbait. Our headlines tell you exactly what is in the essay, without trying to trick you or exaggerate the details.
                </li>
              </ul>
            </div>

            <div className={styles.standardsCard}>
              <h3>
                <span>02.</span> Deeper Context
              </h3>
              <p>
                A raw fact without context is easy to misunderstand. We focus on the big picture to show you how events connect.
              </p>
              <ul>
                <li>
                  <strong>Exploring the "Why":</strong> We write for curious minds who want to understand systemic causes, not just get a quick summary of what happened this morning.
                </li>
                <li>
                  <strong>No Partisan Anger:</strong> We keep our writing calm and clear. We do not use sarcastic commentary or political tribalism. Our goal is to clarify, not to outrage.
                </li>
              </ul>
            </div>

            <div className={styles.standardsCard}>
              <h3>
                <span>03.</span> Completely Independent
              </h3>
              <p>
                Our opinions cannot be bought. Our editorial work is kept completely separate from any financial operations.
              </p>
              <ul>
                <li>
                  <strong>No Backroom Influence:</strong> Our corporate sponsors or premium memberships have absolutely zero say in what we publish or investigate.
                </li>
                <li>
                  <strong>Full Disclosure:</strong> If a writer has a personal connection, investment, or association with a company or topic they are covering, we state it clearly at the very top of the article.
                </li>
              </ul>
            </div>

            <div className={styles.standardsCard}>
              <h3>
                <span>04.</span> Honest Debate
              </h3>
              <p>
                We believe in healthy, civil disagreement. We do not fear opposing views; we welcome them when they are reasoned well.
              </p>
              <ul>
                <li>
                  <strong>Fair Representation:</strong> When we cover a complex argument, we present opposing viewpoints in their strongest, most sensible form. We do not build cheap, weak versions of arguments just to tear them down.
                </li>
                <li>
                  <strong>Reader Sovereignty:</strong> We give you the facts, lay out the different perspectives, and trust you to make up your own mind.
                </li>
              </ul>
            </div>

            <div className={styles.standardsCard}>
              <h3>
                <span>05.</span> Swift & Open Corrections
              </h3>
              <p>
                We make mistakes—everyone does. What matters is how we handle them. We believe admitting an error builds trust.
              </p>
              <ul>
                <li>
                  <strong>No Quiet Edits:</strong> When we get a fact wrong, we fix it immediately. We do not silently change the text; we add a clear, dated note at the bottom of the article explaining exactly what was corrected.
                </li>
                <li>
                  <strong>Open for Feedback:</strong> If you spot a factual slip in one of our essays, tell us at <code>standards@verence.org</code>. Our editors review every single reader report.
                </li>
              </ul>
            </div>

            <div className={styles.standardsCard}>
              <h3>
                <span>06.</span> Direct Sourcing
              </h3>
              <p>
                We want you to be able to verify our work. We make it easy for you to double-check our claims.
              </p>
              <ul>
                <li>
                  <strong>Direct Linking:</strong> We link directly to the primary research reports, public records, and scientific studies we reference, so you can trace our steps.
                </li>
                <li>
                  <strong>Anonymous Sources:</strong> We only hide a source's name if they face physical danger or professional retaliation. We never use anonymous sources to share subjective opinions or attack others.
                </li>
              </ul>
            </div>
          </div>

          <div className={styles.contactBlock}>
            <h3>Have a Question About Our Standards?</h3>
            <p>
              We want to keep our editorial doors open. If you want to challenge a fact, ask about our research methods, or submit an essay proposal, we would love to hear from you.
            </p>
            <Link href="/contact" className={styles.contactBtn}>
              Talk to Our Editors
            </Link>
          </div>
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
