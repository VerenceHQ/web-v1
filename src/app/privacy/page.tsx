import React from "react";
import Link from "next/link";
import styles from "./Privacy.module.css";
import CustomNavigation from "@/components/CustomNavigation";

export default function PrivacyPage() {
  return (
    <main className={styles.main}>
      <CustomNavigation />

      {/* 1. Privacy Header Section */}
      <header className={styles.privacyHeader}>
        <div className={styles.headerContent}>
          <span className={styles.headerLabel}>LEGAL & TRUST</span>
          <h1>Privacy Policy</h1>
          <p>How Verence protects your data and respects your digital privacy</p>
        </div>
      </header>

      {/* 2. Privacy Policy Document Content */}
      <section className={styles.privacyBody}>
        <div className={styles.contentContainer}>
          <div className={styles.introBlock}>
            <p className={styles.leadText}>
              At <strong>Verence</strong>, we believe that trust is the foundation of everything we do. In a world full of intrusive online tracking, we want to do things differently. What you read is a reflection of your own private thoughts, and we believe that should stay completely private.
            </p>
            <p className={styles.leadText} style={{ marginTop: "1rem" }}>
              This policy explains exactly how we protect your data. We have kept it simple, direct, and free of heavy legal jargon so you know exactly where you stand.
            </p>
            <div className={styles.lastUpdated}>Updated: May 22, 2026</div>
          </div>

          <div className={styles.policySections}>
            <div className={styles.policyCard}>
              <h3>1. Your Reading Lists Stay in Your Hands</h3>
              <p>
                You can save essays, track reading times, and bookmark articles on Verence. Most websites save this information on their own databases to build a profile about you. We don't.
              </p>
              <ul>
                <li>
                  <strong>Local Browser Storage:</strong> Your bookmarks and layout preferences are saved directly in your browser's own persistent cache (LocalStorage).
                </li>
                <li>
                  <strong>No Uploads:</strong> This list is never uploaded to our servers, never stored in a database, and is completely invisible to our staff and editors.
                </li>
                <li>
                  <strong>Wipe It Instantly:</strong> You are in full control. If you clear your browser's cache or site data, this saved list disappears instantly.
                </li>
              </ul>
            </div>

            <div className={styles.policyCard}>
              <h3>2. We Collect as Little Data as Possible</h3>
              <p>
                We adhere to strict data minimization. We don't ask for your address, phone number, or social media handles. Here is the only information we collect:
              </p>
              <ul>
                <li>
                  <strong>Optional Newsletters:</strong> If you sign up for our weekly digest, we collect your email address. It is stored securely with a trusted service, and we never share it.
                </li>
                <li>
                  <strong>Direct Messages:</strong> If you email us, we keep your message and email address only to reply to your question.
                </li>
                <li>
                  <strong>Premium Memberships:</strong> If you upgrade to our premium tier, payments are handled by a fully secure, industry-standard processor. We never see or store your credit card details.
                </li>
              </ul>
            </div>

            <div className={styles.policyCard}>
              <h3>3. Privacy-First Analytics</h3>
              <p>
                We want to know which essays are popular and how readers find our site, but we don't need to track you as an individual to do that.
              </p>
              <ul>
                <li>
                  <strong>Simple Counts:</strong> We only look at total numbers—like how many times a page was read, what kind of browser was used, or if visitors came from a search engine.
                </li>
                <li>
                  <strong>No Fingerprinting:</strong> We do not track your IP address, identify your device, or follow you across the web.
                </li>
                <li>
                  <strong>No Ad Pixels:</strong> We explicitly refuse to install retargeting pixels (like the Meta Pixel or Google trackers) that help advertisers follow you around the internet.
                </li>
              </ul>
            </div>

            <div className={styles.policyCard}>
              <h3>4. Cookie Containment & Functional Storage</h3>
              <p>
                We hate tracking cookies as much as you do. The very few files we store are strictly necessary to make the website work.
              </p>
              <p>
                Specifically, we store your layout preference (like whether you prefer a grid or list view), your dynamic theme choices (light or dark mode), and your current session state. These keys do not contain personal identifiers and are ignored by other networks. You can disable all cookies in your browser settings and our essays will still read perfectly.
              </p>
            </div>

            <div className={styles.policyCard}>
              <h3>5. The Absolute Non-Commercialization Covenant</h3>
              <p>
                <strong>We will never sell, lease, trade, or share your reading habits or email address with advertisers, data brokers, or political campaigns.</strong>
              </p>
              <p>
                We do not integrate programmatic ad networks, so your screen is safe from tracking ads. In the extremely rare event that we are legally compelled by a court order or subpoena to share server logs, we will fiercely review the scope of the order and do our best to warn you first if we are allowed to.
              </p>
            </div>

            <div className={styles.policyCard}>
              <h3>6. Global Regulatory Rights (GDPR & CCPA)</h3>
              <p>
                No matter where you live in the world, we respect your rights under the GDPR and CCPA:
              </p>
              <ul>
                <li>
                  <strong>Access & Deletion:</strong> You can ask us what email details we have at any time, or ask us to delete them. To delete local bookmarks, simply clear your browser's site data.
                </li>
                <li>
                  <strong>Opt-Out:</strong> Every single newsletter has a simple, one-click unsubscribe button in the footer that works instantly.
                </li>
              </ul>
            </div>
          </div>

          <div className={styles.contactBlock}>
            <h3>Questions or Inquiries?</h3>
            <p>
              If you have questions regarding our independent publishing practices, reader sovereignty controls,
              or wish to request standard record deletion, please connect with our primary office.
            </p>
            <Link href="/contact" className={styles.contactBtn}>
              Contact Editorial Office
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
