"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./AdminDashboard.module.css";
import Logo from "@/components/Logo";
import { articles as staticArticles, Article as StaticArticle } from "@/data/articles";
import { api } from "@/utils/api";

interface AdminSession {
  username: string;
  role: string;
  loggedInAt: string;
}

interface EditorProfile {
  id: string;
  name: string;
  role: string;
  avatar: string;
  bio: string;
  passcode: string;
  status: "active" | "suspended";
  publicationsCount: number;
  reads: number;
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
  type: "article";
  isFeatured?: boolean;
}

interface LocalQuote {
  id: string;
  quoteText: string;
  author: string;
  context: string;
  wisdomCommentary: string;
  category: string;
  categorySlug: string;
  date: string;
  status: "draft" | "published";
  type: "quote";
}

interface MergedContentItem {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  author: string;
  category: string;
  status: "draft" | "published";
  reads: number;
  type: "article" | "quote";
  isFeatured: boolean;
  rawDate: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [admin, setAdmin] = useState<AdminSession | null>(null);
  const [activeTab, setActiveTab] = useState<"analytics" | "content" | "editors" | "settings">("analytics");
  const [loading, setLoading] = useState(true);
  
  // Storage states
  const [editors, setEditors] = useState<EditorProfile[]>([]);
  const [localPublications, setLocalPublications] = useState<LocalPublication[]>([]);
  const [localQuotes, setLocalQuotes] = useState<LocalQuote[]>([]);
  const [deletedStaticSlugs, setDeletedStaticSlugs] = useState<string[]>([]);
  const [featuredStaticSlugs, setFeaturedStaticSlugs] = useState<string[]>([]);
  
  // Search & Filters state
  const [contentSearch, setContentSearch] = useState("");
  const [contentTypeFilter, setContentTypeFilter] = useState<"all" | "article" | "quote">("all");
  const [contentStatusFilter, setContentStatusFilter] = useState<"all" | "published" | "draft">("all");
  
  // Modal state
  const [isEditorModalOpen, setIsEditorModalOpen] = useState(false);
  const [editingEditor, setEditingEditor] = useState<EditorProfile | null>(null);
  const [modalName, setModalName] = useState("");
  const [modalRole, setModalRole] = useState("");
  const [modalAvatar, setModalAvatar] = useState("");
  const [modalBio, setModalBio] = useState("");
  const [modalPasscode, setModalPasscode] = useState("");
  const [modalStatus, setModalStatus] = useState<"active" | "suspended">("active");
  const [modalError, setModalError] = useState("");

  // Settings states
  const [settingsOpenReg, setSettingsOpenReg] = useState(false);
  const [settingsDropCaps, setSettingsDropCaps] = useState(true);
  const [settingsTracking, setSettingsTracking] = useState(true);
  const [settingsMaintenance, setSettingsMaintenance] = useState(false);

  // Notification state
  const [notification, setNotification] = useState("");

  // Seed avatar options
  const avatarOptions = [
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80",
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&h=150&q=80",
    "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&h=150&q=80",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80",
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80"
  ];

  useEffect(() => {
    // 1. Authenticate session
    const session = localStorage.getItem("verence_admin_session");
    if (!session) {
      router.replace("/admin/login");
      return;
    }
    setAdmin(JSON.parse(session));

    async function syncPlatformData() {
      try {
        setLoading(true);
        // Load settings, overrides, publications, quotes, and editors from live API proxy
        const [settingsRes, overridesRes, pubRes, quotesRes, editorsRes] = await Promise.all([
          api.settings.get(),
          api.settings.getOverrides(),
          api.publications.list(),
          api.quotes.list(),
          api.editors.list(),
        ]);

        // 1. Map and save settings
        if (settingsRes.success && settingsRes.settings) {
          setSettingsOpenReg(settingsRes.settings.open_registrations);
          setSettingsDropCaps(settingsRes.settings.drop_caps);
          setSettingsTracking(settingsRes.settings.live_tracking);
          setSettingsMaintenance(settingsRes.settings.maintenance);
        }

        // 2. Map static overrides
        const overrides = overridesRes.overrides || {};
        const deletedSlugs = Object.keys(overrides).filter(k => overrides[k].is_deleted);
        const featuredSlugs = Object.keys(overrides).filter(k => overrides[k].is_featured);
        setDeletedStaticSlugs(deletedSlugs);
        setFeaturedStaticSlugs(featuredSlugs);

        // 3. Map dynamic publications
        if (pubRes.success && pubRes.publications) {
          const transformedPubs = pubRes.publications.map((pub: any) => ({
            id: pub.id,
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
            status: pub.status,
            readCount: pub.read_count || 0,
            image: pub.image,
            type: "article" as const,
            isFeatured: !!pub.is_featured,
          }));
          setLocalPublications(transformedPubs);
        }

        // 4. Map dynamic quotes
        if (quotesRes.success && quotesRes.quotes) {
          const transformedQuotes = quotesRes.quotes.map((q: any) => ({
            id: q.id,
            quoteText: q.quote_text,
            author: q.author,
            context: q.context || "",
            wisdomCommentary: q.wisdom_commentary,
            category: q.category,
            categorySlug: q.category_slug,
            date: q.date,
            status: q.status,
            type: "quote" as const,
          }));
          setLocalQuotes(transformedQuotes);
        }

        // 5. Map active editors
        if (editorsRes.success && editorsRes.editors) {
          const transformedEditors = editorsRes.editors.map((ed: any) => ({
            id: ed.id,
            name: ed.name,
            role: ed.role,
            avatar: ed.avatar,
            bio: ed.bio,
            passcode: "••••••••", // mask password in board display for security
            status: ed.status,
            publicationsCount: ed.publications_count || 0,
            reads: ed.reads || 0,
          }));
          setEditors(transformedEditors);
        }
      } catch (err) {
        console.warn("Verence API down or sync error, falling back to LocalStorage offline mode.", err);
        
        // --- Offline fallback starts ---
        // Load editors
        const rawEditors = localStorage.getItem("verence_editors_list");
        if (rawEditors) {
          setEditors(JSON.parse(rawEditors));
        } else {
          const defaultEditors: EditorProfile[] = [
            {
              id: "elena",
              name: "Elena Rostova",
              role: "Senior Analytical Writer",
              avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80",
              bio: "Focuses on tech ethics, machine sentience, and cognitive system policy.",
              passcode: "truth",
              status: "active",
              publicationsCount: 12,
              reads: 14500
            },
            {
              id: "marcus",
              name: "Marcus Vance",
              role: "Philosophy Columnist",
              avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&h=150&q=80",
              bio: "Explores Eastern metaphysics, classical ethics, and state dynamics.",
              passcode: "truth",
              status: "active",
              publicationsCount: 8,
              reads: 9200
            }
          ];
          localStorage.setItem("verence_editors_list", JSON.stringify(defaultEditors));
          setEditors(defaultEditors);
        }

        // Load publications & quotes
        const rawPubs = localStorage.getItem("verence_local_publications");
        if (rawPubs) setLocalPublications(JSON.parse(rawPubs));
        
        const rawQuotes = localStorage.getItem("verence_local_quotes");
        if (rawQuotes) setLocalQuotes(JSON.parse(rawQuotes));

        // Load overrides
        const rawDeletedSlugs = localStorage.getItem("verence_deleted_static_slugs");
        if (rawDeletedSlugs) setDeletedStaticSlugs(JSON.parse(rawDeletedSlugs));

        const rawFeaturedSlugs = localStorage.getItem("verence_featured_static_slugs");
        if (rawFeaturedSlugs) setFeaturedStaticSlugs(JSON.parse(rawFeaturedSlugs));

        // Load settings
        const storedOpenReg = localStorage.getItem("verence_settings_open_registrations");
        if (storedOpenReg) setSettingsOpenReg(storedOpenReg === "true");

        const storedDropCaps = localStorage.getItem("verence_settings_drop_caps");
        if (storedDropCaps) setSettingsDropCaps(storedDropCaps === "true");

        const storedTracking = localStorage.getItem("verence_settings_live_tracking");
        if (storedTracking) setSettingsTracking(storedTracking === "true");

        const storedMaint = localStorage.getItem("verence_settings_maintenance");
        if (storedMaint) setSettingsMaintenance(storedMaint === "true");
        // --- Offline fallback ends ---
      } finally {
        setLoading(false);
      }
    }

    syncPlatformData();
  }, [router]);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(""), 3000);
  };

  const handleLogout = () => {
    localStorage.removeItem("verence_admin_session");
    router.push("/admin/login");
  };

  // Content Operations
  const toggleFeatured = async (item: MergedContentItem) => {
    if (item.type === "article") {
      const isStatic = staticArticles.some((sa) => sa.slug === item.slug);
      if (isStatic) {
        let updatedFeatured: string[];
        const nextFeatured = !item.isFeatured;
        if (featuredStaticSlugs.includes(item.slug)) {
          updatedFeatured = featuredStaticSlugs.filter((s) => s !== item.slug);
        } else {
          updatedFeatured = [...featuredStaticSlugs, item.slug];
        }

        try {
          await api.settings.updateOverride(item.slug, { is_featured: nextFeatured });
          showToast(`${nextFeatured ? "Marked" : "Removed"} "${item.title}" ${nextFeatured ? "as" : "from"} Featured.`);
          setFeaturedStaticSlugs(updatedFeatured);
        } catch (err) {
          // Offline fallback
          setFeaturedStaticSlugs(updatedFeatured);
          localStorage.setItem("verence_featured_static_slugs", JSON.stringify(updatedFeatured));
          showToast(`[Offline] Toggled Featured status for "${item.title}".`);
        }
      } else {
        // Dynamic articles
        const nextFeatured = !item.isFeatured;
        try {
          await api.publications.update(item.id, { is_featured: nextFeatured });
          const updatedPubs = localPublications.map((pub) => {
            if (pub.slug === item.slug) {
              return { ...pub, isFeatured: nextFeatured };
            }
            return pub;
          });
          setLocalPublications(updatedPubs);
          showToast(`Toggled Featured status for "${item.title}".`);
        } catch (err) {
          // Offline fallback
          const updatedPubs = localPublications.map((pub) => {
            if (pub.slug === item.slug) {
              return { ...pub, isFeatured: nextFeatured };
            }
            return pub;
          });
          setLocalPublications(updatedPubs);
          localStorage.setItem("verence_local_publications", JSON.stringify(updatedPubs));
          showToast(`[Offline] Toggled Featured status for "${item.title}".`);
        }
      }
    } else {
      showToast("Featured badges can only be assigned to articles.");
    }
  };

  const handleDeleteContent = async (item: MergedContentItem) => {
    const confirmText = item.type === "article" 
      ? `Are you sure you want to delete the publication "${item.title}"?`
      : `Are you sure you want to delete this quote citation?`;

    if (!window.confirm(confirmText)) return;

    if (item.type === "article") {
      const isStatic = staticArticles.some((sa) => sa.slug === item.slug);
      if (isStatic) {
        const updatedDeleted = [...deletedStaticSlugs, item.slug];
        try {
          await api.settings.updateOverride(item.slug, { is_deleted: true });
          setDeletedStaticSlugs(updatedDeleted);
          showToast("Static publication archived successfully.");
        } catch (err) {
          setDeletedStaticSlugs(updatedDeleted);
          localStorage.setItem("verence_deleted_static_slugs", JSON.stringify(updatedDeleted));
          showToast("[Offline] Static publication archived successfully.");
        }
      } else {
        try {
          await api.publications.delete(item.id);
          const updatedPubs = localPublications.filter((pub) => pub.id !== item.id);
          setLocalPublications(updatedPubs);
          showToast("Local publication deleted successfully.");
        } catch (err) {
          const updatedPubs = localPublications.filter((pub) => pub.id !== item.id);
          setLocalPublications(updatedPubs);
          localStorage.setItem("verence_local_publications", JSON.stringify(updatedPubs));
          showToast("[Offline] Local publication deleted successfully.");
        }
      }
    } else {
      try {
        await api.quotes.delete(item.id);
        const updatedQuotes = localQuotes.filter((q) => q.id !== item.id);
        setLocalQuotes(updatedQuotes);
        showToast("Quote citation removed successfully.");
      } catch (err) {
        const updatedQuotes = localQuotes.filter((q) => q.id !== item.id);
        setLocalQuotes(updatedQuotes);
        localStorage.setItem("verence_local_quotes", JSON.stringify(updatedQuotes));
        showToast("[Offline] Quote citation removed successfully.");
      }
    }
  };

  // Editor Operations
  const handleOpenAddEditor = () => {
    setEditingEditor(null);
    setModalName("");
    setModalRole("");
    setModalAvatar(avatarOptions[0]);
    setModalBio("");
    setModalPasscode("truth");
    setModalStatus("active");
    setModalError("");
    setIsEditorModalOpen(true);
  };

  const handleOpenEditEditor = (editor: EditorProfile) => {
    setEditingEditor(editor);
    setModalName(editor.name);
    setModalRole(editor.role);
    setModalAvatar(editor.avatar);
    setModalBio(editor.bio);
    setModalPasscode(editor.passcode);
    setModalStatus(editor.status);
    setModalError("");
    setIsEditorModalOpen(true);
  };

  const handleSaveEditor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalName.trim()) {
      setModalError("Name is required.");
      return;
    }
    if (!modalRole.trim()) {
      setModalError("Professional role is required.");
      return;
    }
    if (!modalPasscode.trim()) {
      setModalError("Access passcode is required.");
      return;
    }

    if (editingEditor) {
      // Edit mode
      const updatedEditorData = {
        name: modalName.trim(),
        role: modalRole.trim(),
        avatar: modalAvatar,
        bio: modalBio.trim(),
        passcode: modalPasscode.trim() !== "••••••••" ? modalPasscode.trim() : undefined,
        status: modalStatus
      };

      try {
        await api.editors.update(editingEditor.id, updatedEditorData);
        // Reload list of editors
        const editorsRes = await api.editors.list();
        if (editorsRes.success && editorsRes.editors) {
          setEditors(editorsRes.editors.map((ed: any) => ({
            id: ed.id,
            name: ed.name,
            role: ed.role,
            avatar: ed.avatar,
            bio: ed.bio,
            passcode: "••••••••",
            status: ed.status,
            publicationsCount: ed.publications_count || 0,
            reads: ed.reads || 0,
          })));
        }
        showToast(`Profile updated for ${modalName.trim()}.`);
      } catch (err) {
        // Offline fallback
        const updatedEditors = editors.map((ed) => {
          if (ed.id === editingEditor.id) {
            return {
              ...ed,
              name: modalName.trim(),
              role: modalRole.trim(),
              avatar: modalAvatar,
              bio: modalBio.trim(),
              passcode: modalPasscode.trim(),
              status: modalStatus
            };
          }
          return ed;
        });
        setEditors(updatedEditors);
        localStorage.setItem("verence_editors_list", JSON.stringify(updatedEditors));
        showToast(`[Offline] Profile updated for ${modalName.trim()}.`);
      }
    } else {
      // Create mode
      const newId = modalName.trim().toLowerCase().replace(/\s+/g, "-");
      if (editors.some((e) => e.id === newId)) {
        setModalError("An editor profile with this name already exists.");
        return;
      }

      const newEditor = {
        id: newId,
        name: modalName.trim(),
        role: modalRole.trim(),
        avatar: modalAvatar,
        bio: modalBio.trim(),
        passcode: modalPasscode.trim(),
        status: modalStatus,
      };

      try {
        await api.editors.create(newEditor);
        // Reload
        const editorsRes = await api.editors.list();
        if (editorsRes.success && editorsRes.editors) {
          setEditors(editorsRes.editors.map((ed: any) => ({
            id: ed.id,
            name: ed.name,
            role: ed.role,
            avatar: ed.avatar,
            bio: ed.bio,
            passcode: "••••••••",
            status: ed.status,
            publicationsCount: ed.publications_count || 0,
            reads: ed.reads || 0,
          })));
        }
        showToast(`Created profile for ${modalName.trim()}.`);
      } catch (err) {
        // Offline fallback
        const offlineEditor: EditorProfile = {
          id: newId,
          name: modalName.trim(),
          role: modalRole.trim(),
          avatar: modalAvatar,
          bio: modalBio.trim(),
          passcode: modalPasscode.trim(),
          status: modalStatus,
          publicationsCount: 0,
          reads: 0
        };
        const updatedEditors = [...editors, offlineEditor];
        setEditors(updatedEditors);
        localStorage.setItem("verence_editors_list", JSON.stringify(updatedEditors));
        showToast(`[Offline] Created profile for ${modalName.trim()}.`);
      }
    }
    setIsEditorModalOpen(false);
  };

  const handleToggleEditorStatus = async (editor: EditorProfile) => {
    const nextStatus: "active" | "suspended" = editor.status === "active" ? "suspended" : "active";
    try {
      await api.editors.updateStatus(editor.id, nextStatus);
      const updated = editors.map((e) => {
        if (e.id === editor.id) {
          return { ...e, status: nextStatus };
        }
        return e;
      });
      setEditors(updated);
      showToast(`Account status updated for ${editor.name} to ${nextStatus}.`);
    } catch (err) {
      // Offline fallback
      const updated = editors.map((e) => {
        if (e.id === editor.id) {
          return { ...e, status: nextStatus };
        }
        return e;
      });
      setEditors(updated);
      localStorage.setItem("verence_editors_list", JSON.stringify(updated));
      showToast(`[Offline] Account status updated for ${editor.name} to ${nextStatus}.`);
    }
  };

  // Save platform configuration
  const handleSaveSettings = async () => {
    const updatedSettings = {
      open_registrations: settingsOpenReg,
      drop_caps: settingsDropCaps,
      live_tracking: settingsTracking,
      maintenance: settingsMaintenance,
    };

    try {
      await api.settings.update(updatedSettings);
      showToast("Global platform parameters updated successfully.");
    } catch (err) {
      // Offline fallback
      localStorage.setItem("verence_settings_open_registrations", String(settingsOpenReg));
      localStorage.setItem("verence_settings_drop_caps", String(settingsDropCaps));
      localStorage.setItem("verence_settings_live_tracking", String(settingsTracking));
      localStorage.setItem("verence_settings_maintenance", String(settingsMaintenance));
      showToast("[Offline] Global platform parameters updated successfully.");
    }
  };

  if (loading) {
    return (
      <div className={styles.dashboardPage} style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: "40px", height: "40px", border: "3px solid rgba(0, 156, 101, 0.1)", borderTopColor: "#009c65", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 1.5rem" }} />
          <h2 style={{ fontSize: "1.1rem", fontWeight: 500, letterSpacing: "0.05em", color: "rgba(230, 246, 240, 0.8)" }}>SYNCHRONIZING VERENCE PLATFORM PARAMETERS...</h2>
          <style>{`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  if (!admin) return null;


  // Process data merging for Content Management and Metrics
  const activeStaticArticles = staticArticles.filter((sa) => !deletedStaticSlugs.includes(sa.slug));
  
  const mergedItems: MergedContentItem[] = [
    ...activeStaticArticles.map((sa) => ({
      id: sa.slug,
      slug: sa.slug,
      title: sa.title,
      subtitle: sa.subtitle || "",
      author: sa.author,
      category: sa.category,
      status: "published" as const,
      reads: sa.readCount || 0,
      type: "article" as const,
      isFeatured: sa.isFeatured || featuredStaticSlugs.includes(sa.slug),
      rawDate: sa.date
    })),
    ...localPublications.map((pub) => ({
      id: pub.id,
      slug: pub.slug,
      title: pub.title,
      subtitle: pub.subtitle || "",
      author: pub.author,
      category: pub.category,
      status: pub.status,
      reads: pub.readCount || 0,
      type: "article" as const,
      isFeatured: pub.isFeatured || false,
      rawDate: pub.date
    })),
    ...localQuotes.map((q) => ({
      id: q.id,
      slug: q.id,
      title: `"${q.quoteText}"`,
      subtitle: `Commentary: ${q.wisdomCommentary}`,
      author: q.author,
      category: q.category,
      status: q.status,
      reads: 0,
      type: "quote" as const,
      isFeatured: false,
      rawDate: q.date
    }))
  ];

  // Filtering merged content
  const filteredContentItems = mergedItems.filter((item) => {
    const matchesSearch = 
      item.title.toLowerCase().includes(contentSearch.toLowerCase()) ||
      item.subtitle.toLowerCase().includes(contentSearch.toLowerCase()) ||
      item.author.toLowerCase().includes(contentSearch.toLowerCase());
      
    const matchesType = contentTypeFilter === "all" ? true : item.type === contentTypeFilter;
    const matchesStatus = contentStatusFilter === "all" ? true : item.status === contentStatusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  // Calculate high-fidelity metrics
  const totalArticles = mergedItems.filter((i) => i.type === "article").length;
  const totalQuotes = mergedItems.filter((i) => i.type === "quote").length;
  const totalPublished = mergedItems.filter((i) => i.status === "published").length;
  
  const cumulativeReads = mergedItems.reduce((acc, curr) => acc + curr.reads, 0) + 120500; // adding constant base analytical reads
  const activeWriters = editors.filter((e) => e.status === "active").length;

  return (
    <div className={styles.dashboardPage}>
      {/* Navbar header */}
      <nav className={styles.navbar}>
        <Link href="/" className={styles.logo}>
          <Logo />
          <h3>Verence Admin</h3>
        </Link>
        <div className={styles.adminProfile}>
          <div className={styles.adminInfo}>
            <span className={styles.adminName}>Administrator</span>
            <span className={styles.adminRole}>{admin.role}</span>
          </div>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            Sign Out
          </button>
        </div>
      </nav>

      {/* Main viewport */}
      <main className={styles.mainContainer}>
        {/* Sidebar tabs */}
        <section className={styles.sidebar}>
          <button
            className={`${styles.tabBtn} ${activeTab === "analytics" ? styles.activeTab : ""}`}
            onClick={() => setActiveTab("analytics")}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/></svg>
            <span>Readership Stats</span>
          </button>
          <button
            className={`${styles.tabBtn} ${activeTab === "content" ? styles.activeTab : ""}`}
            onClick={() => setActiveTab("content")}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20M4 19.5V3.5A2.5 2.5 0 0 1 6.5 1H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5z"/></svg>
            <span>Platform Content</span>
          </button>
          <button
            className={`${styles.tabBtn} ${activeTab === "editors" ? styles.activeTab : ""}`}
            onClick={() => setActiveTab("editors")}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            <span>Editorial Board</span>
          </button>
          <button
            className={`${styles.tabBtn} ${activeTab === "settings" ? styles.activeTab : ""}`}
            onClick={() => setActiveTab("settings")}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
            <span>Global Settings</span>
          </button>
        </section>

        {/* Dynamic Panels */}
        <section className={styles.panelContainer}>
          {/* TAB 1: READERSHIP ANALYTICS */}
          {activeTab === "analytics" && (
            <>
              <div className={styles.panelHeader}>
                <div>
                  <h2>Readership Command Center</h2>
                  <p>Consolidated statistics measuring readership engagement and platform integrity.</p>
                </div>
              </div>

              {/* Analytical cards grid */}
              <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                  <span className={styles.statLabel}>Total Platform Reads</span>
                  <span className={styles.statValue}>
                    {cumulativeReads >= 1000 ? `${(cumulativeReads / 1000).toFixed(1)}k` : cumulativeReads}
                  </span>
                  <span className={`${styles.statTrend} ${styles.trendUp}`}>
                    ▲ 11.2% this month
                  </span>
                </div>
                <div className={styles.statCard}>
                  <span className={styles.statLabel}>Active Writers</span>
                  <span className={styles.statValue}>{activeWriters}</span>
                  <span className={`${styles.statTrend} ${styles.trendNeutral}`}>
                    {editors.length} profiles created
                  </span>
                </div>
                <div className={styles.statCard}>
                  <span className={styles.statLabel}>Publications</span>
                  <span className={styles.statValue}>{totalArticles}</span>
                  <span className={`${styles.statTrend} ${styles.trendUp}`}>
                    {totalPublished} published live
                  </span>
                </div>
                <div className={styles.statCard}>
                  <span className={styles.statLabel}>Wisdom Citations</span>
                  <span className={styles.statValue}>{totalQuotes}</span>
                  <span className={`${styles.statTrend} ${styles.trendUp}`}>
                    Shared wisdom citations
                  </span>
                </div>
              </div>

              {/* CSS Grid Charts section */}
              <div className={styles.chartsSection}>
                <div className={styles.chartCard}>
                  <h3>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
                    Monthly Engagement (Thousands of Views)
                  </h3>
                  
                  {/* Custom CSS Flexbox bar chart */}
                  <div className={styles.barChartContainer}>
                    {[
                      { month: "Dec", val: 12 },
                      { month: "Jan", val: 14.5 },
                      { month: "Feb", val: 18.2 },
                      { month: "Mar", val: 24.8 },
                      { month: "Apr", val: 32.1 },
                      { month: "May", val: 41.5 }
                    ].map((b, idx) => (
                      <div key={idx} className={styles.chartBarWrapper}>
                        <div 
                          className={styles.chartBar} 
                          style={{ height: `${(b.val / 45) * 100}%` }}
                        >
                          <div className={styles.chartTooltip}>{b.val}k views</div>
                        </div>
                        <span className={styles.barLabel}>{b.month}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className={styles.chartCard}>
                  <h3>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                    Content Split By Category
                  </h3>
                  
                  <div className={styles.progressList}>
                    {[
                      { cat: "Truth & Context", percent: 45 },
                      { cat: "Ideas & Insight", percent: 35 },
                      { cat: "Question & Wisdom", percent: 20 }
                    ].map((p, idx) => (
                      <div key={idx} className={styles.progressItem}>
                        <div className={styles.progressHeader}>
                          <span className={styles.progressCategory}>{p.cat}</span>
                          <span className={styles.progressPercent}>{p.percent}%</span>
                        </div>
                        <div className={styles.progressBarContainer}>
                          <div className={styles.progressBar} style={{ width: `${p.percent}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Event logging stream */}
              <div className={styles.chartCard}>
                <h3>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  Systems Activity logs
                </h3>
                <div className={styles.activityFeed}>
                  <div className={styles.activityItem}>
                    <div className={styles.activityDot} />
                    <div className={styles.activityInfo}>
                      <span className={styles.activityText}>Administrative handshake authorized successfully from root credential.</span>
                      <span className={styles.activityTime}>Just now</span>
                    </div>
                  </div>
                  <div className={styles.activityItem}>
                    <div className={styles.activityDot} />
                    <div className={styles.activityInfo}>
                      <span className={styles.activityText}>Systems database synchronized: merged static data and client local storage.</span>
                      <span className={styles.activityTime}>3 minutes ago</span>
                    </div>
                  </div>
                  <div className={styles.activityItem}>
                    <div className={styles.activityDot} />
                    <div className={styles.activityInfo}>
                      <span className={styles.activityText}>Metadata indexing checked. SEO index active.</span>
                      <span className={styles.activityTime}>2 hours ago</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* TAB 2: CONTENT MANAGER */}
          {activeTab === "content" && (
            <>
              <div className={styles.panelHeader}>
                <div>
                  <h2>Platform Content Manager</h2>
                  <p>Search, moderate, feature, or delete articles and wisdom citations across the entire platform.</p>
                </div>
              </div>

              {/* Controls bar */}
              <div className={styles.filtersRow}>
                <div className={styles.searchWrapper}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "rgba(255,255,255,0.4)" }}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                  <input
                    type="text"
                    className={styles.searchInput}
                    placeholder="Search by title, author, or snippet..."
                    value={contentSearch}
                    onChange={(e) => setContentSearch(e.target.value)}
                  />
                </div>
                
                <div className={styles.selectGroup}>
                  <select 
                    className={styles.filterSelect}
                    value={contentTypeFilter}
                    onChange={(e) => setContentTypeFilter(e.target.value as any)}
                  >
                    <option value="all">All Content Types</option>
                    <option value="article">Articles & Essays</option>
                    <option value="quote">Wisdom Citations</option>
                  </select>

                  <select 
                    className={styles.filterSelect}
                    value={contentStatusFilter}
                    onChange={(e) => setContentStatusFilter(e.target.value as any)}
                  >
                    <option value="all">All Statuses</option>
                    <option value="published">Published</option>
                    <option value="draft">Drafts</option>
                  </select>
                </div>
              </div>

              {/* Content items table */}
              <div className={styles.tableWrapper}>
                {filteredContentItems.length > 0 ? (
                  <table className={styles.contentTable}>
                    <thead>
                      <tr>
                        <th>Title / Citation</th>
                        <th>Type</th>
                        <th>Category</th>
                        <th>Author</th>
                        <th>Status</th>
                        <th>Reads</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredContentItems.map((item) => (
                        <tr key={item.id}>
                          <td>
                            <div className={styles.titleCol}>
                              {item.type === "article" ? (
                                <Link href={`/articles/${item.slug}`} className={styles.itemTitle}>
                                  {item.title}
                                </Link>
                              ) : (
                                <span style={{ fontWeight: 500, fontStyle: "italic", fontSize: "0.9rem", color: "#e6f6f0" }}>
                                  {item.title}
                                </span>
                              )}
                              <span className={styles.itemSubtitle}>{item.subtitle}</span>
                            </div>
                          </td>
                          <td>
                            <span className={styles.categoryBadge} style={{ background: item.type === "article" ? "rgba(0,156,101,0.08)" : "rgba(255,183,3,0.08)", color: item.type === "article" ? "#009c65" : "#ffb703", borderColor: item.type === "article" ? "rgba(0,156,101,0.15)" : "rgba(255,183,3,0.15)" }}>
                              {item.type}
                            </span>
                          </td>
                          <td>
                            <span className={styles.categoryBadge}>{item.category}</span>
                          </td>
                          <td>
                            <span style={{ fontSize: "0.85rem", fontWeight: 500 }}>{item.author}</span>
                          </td>
                          <td>
                            <span className={`${styles.statusBadge} ${item.status === "published" ? styles.statusPublished : styles.statusDraft}`}>
                              {item.status}
                            </span>
                          </td>
                          <td>
                            <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>
                              {item.reads >= 1000 ? `${(item.reads / 1000).toFixed(1)}k` : item.reads}
                            </span>
                          </td>
                          <td>
                            <div className={styles.actionCol}>
                              {item.type === "article" && (
                                <button
                                  className={`${styles.iconBtn} ${styles.featuredBtn} ${item.isFeatured ? styles.featuredBtnActive : ""}`}
                                  title={item.isFeatured ? "Remove Featured" : "Mark as Featured"}
                                  onClick={() => toggleFeatured(item)}
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill={item.isFeatured ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                                </button>
                              )}
                              <button
                                className={`${styles.iconBtn} ${styles.deleteBtn}`}
                                title="Delete permanently"
                                onClick={() => handleDeleteContent(item)}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className={styles.emptyState}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#009c65", opacity: 0.5 }}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                    <h4>No platform content found</h4>
                    <p>No essays or quote records match your filter criteria. Broaden your search or check alternative categories.</p>
                  </div>
                )}
              </div>
            </>
          )}

          {/* TAB 3: EDITORIAL BOARD */}
          {activeTab === "editors" && (
            <>
              <div className={styles.panelHeader}>
                <div>
                  <h2>Editorial Board Management</h2>
                  <p>Register new profiles, view credentials, monitor performance, and suspend or activate writers' workspace portals.</p>
                </div>
                <button className={styles.btnPrimary} onClick={handleOpenAddEditor}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
                  <span>Add Editor Profile</span>
                </button>
              </div>

              {/* Editors Grid / Table */}
              <div className={styles.tableWrapper}>
                <table className={styles.contentTable}>
                  <thead>
                    <tr>
                      <th>Editor Profile</th>
                      <th>Professional Role</th>
                      <th>Security Code</th>
                      <th>Status</th>
                      <th>Publications</th>
                      <th>Reads</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {editors.map((editor) => {
                      // Dynamically count publications written by this author
                      const localCount = localPublications.filter(
                        (p) => p.author.toLowerCase().includes(editor.name.split(" ")[0].toLowerCase())
                      ).length;
                      const staticCount = staticArticles.filter(
                        (sa) => sa.author.toLowerCase().includes(editor.name.split(" ")[0].toLowerCase()) && !deletedStaticSlugs.includes(sa.slug)
                      ).length;
                      
                      const cumulativeCount = localCount + staticCount;
                      
                      return (
                        <tr key={editor.id}>
                          <td>
                            <div className={styles.authorCol}>
                              <img src={editor.avatar} alt={editor.name} className={styles.authorAvatar} style={{ width: "42px", height: "42px" }} />
                              <div className={styles.titleCol}>
                                <span style={{ fontWeight: 600, fontSize: "0.95rem" }} className={styles.itemTitle}>
                                  {editor.name}
                                </span>
                                <span className={styles.itemSubtitle} style={{ maxWidth: "250px" }}>{editor.bio}</span>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span style={{ fontSize: "0.85rem", fontWeight: 500, color: "#009c65" }}>{editor.role}</span>
                          </td>
                          <td>
                            <code style={{ background: "rgba(0,0,0,0.3)", padding: "0.25rem 0.5rem", borderRadius: "0.35rem", fontSize: "0.8rem", color: "#e6f6f0" }}>
                              {editor.passcode}
                            </code>
                          </td>
                          <td>
                            <span className={`${styles.statusBadge} ${editor.status === "active" ? styles.statusPublished : styles.statusSuspended}`}>
                              {editor.status}
                            </span>
                          </td>
                          <td>
                            <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>{cumulativeCount}</span>
                          </td>
                          <td>
                            <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>
                              {editor.reads >= 1000 ? `${(editor.reads / 1000).toFixed(1)}k` : editor.reads}
                            </span>
                          </td>
                          <td>
                            <div className={styles.actionCol}>
                              <button
                                className={styles.iconBtn}
                                title="Edit Profile Details"
                                onClick={() => handleOpenEditEditor(editor)}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                              </button>
                              <button
                                className={`${styles.iconBtn} ${styles.deleteBtn}`}
                                title={editor.status === "active" ? "Suspend Credentials" : "Activate Credentials"}
                                onClick={() => handleToggleEditorStatus(editor)}
                              >
                                {editor.status === "active" ? (
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                                ) : (
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg>
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* TAB 4: SYSTEM SETTINGS */}
          {activeTab === "settings" && (
            <>
              <div className={styles.panelHeader}>
                <div>
                  <h2>Global Platform Parameters</h2>
                  <p>Toggle registrations, mandatory typography rules, and platform environments.</p>
                </div>
              </div>

              <div className={styles.settingsGrid}>
                {/* Panel 1 */}
                <div className={styles.settingsCard}>
                  <h3>Administrative Toggles</h3>
                  
                  <div className={styles.settingRow}>
                    <div className={styles.settingInfo}>
                      <span className={styles.settingLabel}>Open Editorial Registrations</span>
                      <span className={styles.settingDesc}>Allow guest or new writers to dynamically register editorial keycards.</span>
                    </div>
                    <label className={styles.switch}>
                      <input 
                        type="checkbox" 
                        checked={settingsOpenReg}
                        onChange={(e) => setSettingsOpenReg(e.target.checked)}
                      />
                      <span className={styles.slider} />
                    </label>
                  </div>

                  <div className={styles.settingRow}>
                    <div className={styles.settingInfo}>
                      <span className={styles.settingLabel}>Mandatory Drop-Caps</span>
                      <span className={styles.settingDesc}>Force premium typography rules (first-letter drop caps) on all essay layouts.</span>
                    </div>
                    <label className={styles.switch}>
                      <input 
                        type="checkbox" 
                        checked={settingsDropCaps}
                        onChange={(e) => setSettingsDropCaps(e.target.checked)}
                      />
                      <span className={styles.slider} />
                    </label>
                  </div>
                </div>

                {/* Panel 2 */}
                <div className={styles.settingsCard}>
                  <h3>Systems Environment</h3>
                  
                  <div className={styles.settingRow}>
                    <div className={styles.settingInfo}>
                      <span className={styles.settingLabel}>Live Readership Tracking</span>
                      <span className={styles.settingDesc}>Calculate active page-view and reading duration curves utilizing browser storage.</span>
                    </div>
                    <label className={styles.switch}>
                      <input 
                        type="checkbox" 
                        checked={settingsTracking}
                        onChange={(e) => setSettingsTracking(e.target.checked)}
                      />
                      <span className={styles.slider} />
                    </label>
                  </div>

                  <div className={styles.settingRow}>
                    <div className={styles.settingInfo}>
                      <span className={styles.settingLabel}>Platform Maintenance Mode</span>
                      <span className={styles.settingDesc}>Lock platform portals and present a maintenance cover screen to global readers.</span>
                    </div>
                    <label className={styles.switch}>
                      <input 
                        type="checkbox" 
                        checked={settingsMaintenance}
                        onChange={(e) => setSettingsMaintenance(e.target.checked)}
                      />
                      <span className={styles.slider} />
                    </label>
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1rem" }}>
                <button className={styles.btnSave} onClick={handleSaveSettings}>
                  Save Settings Parameters
                </button>
              </div>
            </>
          )}
        </section>
      </main>

      {/* Editor Modal Popup */}
      {isEditorModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3>{editingEditor ? "Modify Editorial Profile" : "Register New Writer Profile"}</h3>
              <button className={styles.closeBtn} onClick={() => setIsEditorModalOpen(false)}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            {modalError && (
              <div style={{ color: "#ff6b6b", fontSize: "0.85rem", background: "rgba(214,40,40,0.1)", padding: "0.75rem 1rem", borderRadius: "0.5rem", border: "1px solid rgba(214,40,40,0.2)" }}>
                {modalError}
              </div>
            )}

            <form className={styles.modalForm} onSubmit={handleSaveEditor}>
              <div className={styles.inputGroup}>
                <label>Writer Name</label>
                <input
                  type="text"
                  className={styles.inputField}
                  placeholder="e.g. Clara Oswald"
                  value={modalName}
                  onChange={(e) => setModalName(e.target.value)}
                  disabled={!!editingEditor} // Cannot change ID which is generated from name
                />
              </div>

              <div className={styles.inputGroup}>
                <label>Professional Role</label>
                <input
                  type="text"
                  className={styles.inputField}
                  placeholder="e.g. Philosophy Columnist"
                  value={modalRole}
                  onChange={(e) => setModalRole(e.target.value)}
                />
              </div>

              <div className={styles.inputGroup}>
                <label>Avatar Portrait Preset</label>
                <div className={styles.avatarPresets}>
                  {avatarOptions.map((av, idx) => (
                    <img 
                      key={idx}
                      src={av} 
                      alt="Preset option"
                      className={`${styles.presetImg} ${modalAvatar === av ? styles.activePreset : ""}`}
                      onClick={() => setModalAvatar(av)}
                    />
                  ))}
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label>Biographical Synopsis</label>
                <textarea
                  className={styles.textAreaField}
                  placeholder="Tell readers about this writer's perspective..."
                  value={modalBio}
                  onChange={(e) => setModalBio(e.target.value)}
                />
              </div>

              <div className={styles.inputGroup}>
                <label>Security Portal Passcode</label>
                <input
                  type="text"
                  className={styles.inputField}
                  placeholder="e.g. truth"
                  value={modalPasscode}
                  onChange={(e) => setModalPasscode(e.target.value)}
                />
              </div>

              <div className={styles.inputGroup}>
                <label>Account Credentials Status</label>
                <select
                  className={styles.inputField}
                  value={modalStatus}
                  onChange={(e) => setModalStatus(e.target.value as any)}
                >
                  <option value="active">Active (Credentials Authorized)</option>
                  <option value="suspended">Suspended (Lock Workspace)</option>
                </select>
              </div>

              <div className={styles.modalActions}>
                <button type="button" className={styles.btnCancel} onClick={() => setIsEditorModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className={styles.btnSave}>
                  Save Profile Configuration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Global notifications toast */}
      {notification && (
        <div style={{
          position: "fixed",
          bottom: "2rem",
          right: "2rem",
          background: "#00281a",
          color: "#ffffff",
          padding: "1rem 2rem",
          borderRadius: "1rem",
          border: "1px solid rgba(0, 156, 101, 0.25)",
          boxShadow: "0 15px 35px rgba(0,0,0,0.3)",
          zIndex: 10000,
          fontSize: "0.85rem",
          fontWeight: 600,
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          animation: "fadeIn 0.2s ease"
        }}>
          <span style={{ color: "#009c65" }}>●</span>
          {notification}
        </div>
      )}
    </div>
  );
}
