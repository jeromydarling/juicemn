/* JUICE — shared site behavior
   - Highlights active nav link
   - Admin lock: password-gated inline edit mode (client-side)
   - Persists edits to localStorage; admin can export JSON to commit
*/

(function () {
  // ---------- Active nav highlighting ----------
  const path = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav a.navlink").forEach(a => {
    const target = a.getAttribute("href");
    if (target === path || (path === "" && target === "index.html")) {
      a.classList.add("active");
    }
  });

  // ---------- Admin lock ----------
  // Default password is "juneteenth1865" — change ADMIN_HASH to rotate.
  // Generate a new hash with:
  //   echo -n "yourpassword" | shasum -a 256
  const ADMIN_HASH =
    "04b064759d207e4f1eec832a24150e0be419e152b6a101f4c9545b9023a5adcf";
  const STORAGE_KEY = "juice_admin_edits_v1";
  const SESSION_KEY = "juice_admin_session";

  async function sha256(str) {
    const buf = new TextEncoder().encode(str);
    const hash = await crypto.subtle.digest("SHA-256", buf);
    return Array.from(new Uint8Array(hash))
      .map(b => b.toString(16).padStart(2, "0"))
      .join("");
  }

  function loadEdits() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"); }
    catch { return {}; }
  }
  function saveEdits(edits) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(edits));
  }

  // Apply saved edits on every page load
  function applyEdits() {
    const edits = loadEdits();
    document.querySelectorAll("[data-editable]").forEach(el => {
      const id = el.getAttribute("data-editable");
      if (id && edits[id] !== undefined) el.innerHTML = edits[id];
    });
  }

  function enterAdminMode() {
    sessionStorage.setItem(SESSION_KEY, "1");
    document.body.classList.add("admin-mode");
    document.querySelectorAll("[data-editable]").forEach(el => {
      el.setAttribute("contenteditable", "true");
      el.setAttribute("spellcheck", "true");
      el.addEventListener("input", onEdit);
    });
  }

  function exitAdminMode() {
    sessionStorage.removeItem(SESSION_KEY);
    document.body.classList.remove("admin-mode");
    document.querySelectorAll("[data-editable]").forEach(el => {
      el.removeAttribute("contenteditable");
      el.removeEventListener("input", onEdit);
    });
  }

  function onEdit(e) {
    const el = e.currentTarget;
    const id = el.getAttribute("data-editable");
    if (!id) return;
    const edits = loadEdits();
    edits[id] = el.innerHTML;
    saveEdits(edits);
  }

  function exportEdits() {
    const edits = loadEdits();
    const blob = new Blob([JSON.stringify(edits, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "juice-edits.json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    showToast("Edits exported");
  }

  function resetEdits() {
    if (!confirm("Discard all unsaved edits made in this browser?")) return;
    localStorage.removeItem(STORAGE_KEY);
    location.reload();
  }

  function showToast(msg) {
    const t = document.querySelector(".toast");
    if (!t) return;
    t.textContent = msg;
    t.classList.add("show");
    setTimeout(() => t.classList.remove("show"), 1800);
  }

  // ---------- Wire UI ----------
  function wire() {
    applyEdits();

    const lockBtn = document.querySelector(".lock-btn");
    const overlay = document.querySelector(".admin-overlay");
    const input = document.querySelector(".admin-modal input");
    const submit = document.querySelector(".admin-modal .submit");
    const cancel = document.querySelector(".admin-modal .cancel");
    const err = document.querySelector(".admin-modal .err");
    const exitBtn = document.querySelector(".admin-bar .exit");
    const exportBtn = document.querySelector(".admin-bar .export");
    const resetBtn = document.querySelector(".admin-bar .reset");

    if (sessionStorage.getItem(SESSION_KEY) === "1") enterAdminMode();

    if (lockBtn && overlay) {
      lockBtn.addEventListener("click", () => {
        if (document.body.classList.contains("admin-mode")) {
          exitAdminMode();
          showToast("Admin mode off");
        } else {
          err.textContent = "";
          input.value = "";
          overlay.classList.add("open");
          setTimeout(() => input.focus(), 50);
        }
      });

      cancel.addEventListener("click", () => overlay.classList.remove("open"));
      overlay.addEventListener("click", e => {
        if (e.target === overlay) overlay.classList.remove("open");
      });

      const tryUnlock = async () => {
        const h = await sha256(input.value);
        if (h === ADMIN_HASH) {
          overlay.classList.remove("open");
          enterAdminMode();
          showToast("Admin mode on — click any text to edit");
        } else {
          err.textContent = "Incorrect password.";
        }
      };
      submit.addEventListener("click", tryUnlock);
      input.addEventListener("keydown", e => { if (e.key === "Enter") tryUnlock(); });
    }

    if (exitBtn) exitBtn.addEventListener("click", () => { exitAdminMode(); showToast("Admin mode off"); });
    if (exportBtn) exportBtn.addEventListener("click", exportEdits);
    if (resetBtn) resetBtn.addEventListener("click", resetEdits);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", wire);
  } else {
    wire();
  }
})();
