"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./Login.module.css";
import Logo from "@/components/Logo";

interface Profile {
  id: string;
  name: string;
  role: string;
  avatar: string;
  bio: string;
  passcode: string;
  status: "active" | "suspended";
}

export default function EditorLogin() {
  const router = useRouter();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<string>("");
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // 1. If already logged in, redirect directly to dashboard
    const session = localStorage.getItem("verence_editor_session");
    if (session) {
      router.replace("/editor/dashboard");
      return;
    }

    // 2. Hydrate profiles dynamically from the admin database
    const rawEditors = localStorage.getItem("verence_editors_list");
    if (rawEditors) {
      try {
        setProfiles(JSON.parse(rawEditors));
      } catch (e) {
        console.error("Error parsing editors list", e);
      }
    } else {
      // Seed default profiles if not present
      const defaultEditors: Profile[] = [
        {
          id: "elena",
          name: "Elena Rostova",
          role: "Senior Analytical Writer",
          avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80",
          bio: "Focuses on tech ethics, machine sentience, and cognitive system policy.",
          passcode: "truth",
          status: "active"
        },
        {
          id: "marcus",
          name: "Marcus Vance",
          role: "Philosophy Columnist",
          avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&h=150&q=80",
          bio: "Explores Eastern metaphysics, classical ethics, and state dynamics.",
          passcode: "truth",
          status: "active"
        }
      ];
      localStorage.setItem("verence_editors_list", JSON.stringify(defaultEditors));
      setProfiles(defaultEditors);
    }
  }, [router]);

  const handleSelectProfile = (profile: Profile) => {
    if (profile.status === "suspended") {
      setError(`Access Blocked: The account for ${profile.name} has been suspended by the platform administrator.`);
      setSelectedProfile("");
      return;
    }
    setSelectedProfile(profile.id);
    setError("");
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProfile) {
      setError("Please select your editorial profile.");
      return;
    }
    if (!passcode) {
      setError("Please enter your security access code.");
      return;
    }

    const profile = profiles.find((p) => p.id === selectedProfile);
    if (!profile) return;

    if (profile.status === "suspended") {
      setError("Access Blocked: Your account has been suspended by the administrator.");
      return;
    }

    setLoading(true);
    setError("");

    setTimeout(() => {
      // Check the passcode stored dynamically for this editor
      if (passcode.trim() === profile.passcode) {
        localStorage.setItem(
          "verence_editor_session",
          JSON.stringify({
            uid: profile.id,
            name: profile.name,
            role: profile.role,
            avatar: profile.avatar,
            loggedInAt: new Date().toISOString(),
          })
        );
        router.push("/editor/dashboard");
      } else {
        setLoading(false);
        setError(`Invalid security access code. Hint: Use '${profile.passcode}'`);
      }
    }, 1000);
  };

  const activeProfileData = profiles.find((p) => p.id === selectedProfile);

  return (
    <main className={styles.loginPage}>
      <div className={styles.loginContainer}>
        <div className={styles.logoHeader}>
          <div className={styles.brandName}>
            <Logo />
            <span>Verence</span>
          </div>
          <span className={styles.brandTagline}>Editorial Workspace</span>
        </div>

        <div className={styles.titleArea}>
          <h2>Editor Authentication</h2>
          <p>
            Select your professional profile and enter your security access code to open your workspace.
          </p>
        </div>

        {error && <div className={styles.errorAlert}>{error}</div>}

        <form onSubmit={handleLogin} className={styles.formArea}>
          <div className={styles.profilesList}>
            {profiles.map((profile) => {
              const isSuspended = profile.status === "suspended";
              return (
                <div
                  key={profile.id}
                  className={`${styles.profileCard} ${
                    selectedProfile === profile.id ? styles.activeProfile : ""
                  } ${isSuspended ? styles.suspendedProfile : ""}`}
                  onClick={() => handleSelectProfile(profile)}
                  style={isSuspended ? { opacity: 0.6, cursor: "not-allowed", border: "1px dashed rgba(214, 40, 40, 0.3)" } : {}}
                >
                  <img
                    src={profile.avatar}
                    alt={profile.name}
                    className={styles.avatar}
                    style={isSuspended ? { filter: "grayscale(100%)", borderColor: "rgba(214, 40, 40, 0.4)" } : {}}
                  />
                  <div className={styles.profileInfo}>
                    <div className={styles.profileName} style={isSuspended ? { color: "#ff6b6b" } : {}}>
                      {profile.name} {isSuspended && <span style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", background: "rgba(214, 40, 40, 0.15)", padding: "0.1rem 0.4rem", borderRadius: "0.25rem", marginLeft: "0.5rem" }}>Suspended</span>}
                    </div>
                    <div className={styles.profileRole} style={isSuspended ? { color: "#ff6b6b" } : {}}>{profile.role}</div>
                    <div className={styles.profileBio}>{profile.bio}</div>
                  </div>
                  {!isSuspended && (
                    <div className={styles.radioIndicator}>
                      <div className={styles.radioIndicatorInner} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {selectedProfile && (
            <div className={styles.inputGroup} style={{ marginTop: "1rem" }}>
              <label htmlFor="passcode-input">
                Access Code (Editor Key)
              </label>
              <div className={styles.inputWrapper}>
                <input
                  id="passcode-input"
                  type="password"
                  className={styles.inputField}
                  placeholder={`Enter access code`}
                  value={passcode}
                  onChange={(e) => {
                    setPasscode(e.target.value);
                    setError("");
                  }}
                  disabled={loading}
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            className={styles.loginBtn}
            disabled={loading || !selectedProfile || !passcode}
            style={{ marginTop: "1rem" }}
          >
            {loading ? (
              <>
                <div className={styles.spinner} />
                <span>Opening Portal...</span>
              </>
            ) : (
              <span>Unlock Workspace</span>
            )}
          </button>
        </form>

        <div style={{ display: "flex", justifyContent: "center" }}>
          <Link href="/" className={styles.backHome}>
            ← Return to Verence Main Platform
          </Link>
        </div>
      </div>
    </main>
  );
}
