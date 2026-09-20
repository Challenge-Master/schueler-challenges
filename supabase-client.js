// ==========================================================
// SCHÜLER-CHALLENGES — gemeinsame Supabase-Verbindung
// ==========================================================
// WICHTIG: Trage hier deine eigenen Werte ein (Supabase Dashboard
// → Project Settings → API). Der "anon public key" ist bewusst
// öffentlich sichtbar (er steht in jedem Frontend-Code) — die
// eigentliche Sicherheit kommt aus den Row-Level-Security-Policies
// in supabase-schema.sql, nicht aus Geheimhaltung dieses Keys.

const SUPABASE_URL = "https://ejdvgzbryqkmjtyodwkv.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_8Gy_YBL19bSulJ_g37_nsA_6KAL11wM";

supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ----------------------------------------------------------
// Anonyme Geräte-ID (kein Login, keine Identität — nur ein
// zufälliger Wert im Browser, der ein Gerät wiedererkennbar
// macht, um Mehrfach-Likes/-Stimmen einzudämmen).
// ----------------------------------------------------------
function getAnonId() {
  let id = localStorage.getItem("sc_anon_id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("sc_anon_id", id);
  }
  return id;
}

// ----------------------------------------------------------
// Aggregierten Seitenaufruf-Zähler erhöhen (keine IP, keine
// Einzelbesuche — nur eine Zahl pro Seite wird hochgezählt).
// ----------------------------------------------------------
async function trackPageView(pageName) {
  try {
    await supabase.rpc("increment_page_view", { p_page: pageName });
  } catch (err) {
    // Zählung ist "nice to have" — ein Fehler hier darf die Seite nie blockieren
    console.warn("Konnte Seitenaufruf nicht zählen:", err);
  }
}

// ----------------------------------------------------------
// Öffentliche URL für eine Datei im "submissions"-Bucket holen
// ----------------------------------------------------------
async function getMediaUrl(mediaPath) {
  const { data, error } = await supabase.storage
    .from("submissions")
    .createSignedUrl(mediaPath, 3600); // 1 Stunde gültig
  if (error) {
    console.warn("Konnte Medien-URL nicht erzeugen:", error);
    return null;
  }
  return data.signedUrl;
}

// Kleine Helferfunktion zum sicheren Escapen von Nutzertext,
// bevor er per innerHTML eingefügt wird (verhindert, dass jemand
// per Teamname/Beschreibung eigenen HTML/JS-Code einschleust).
function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str ?? "";
  return div.innerHTML;
}
