const BASE_URL = "http://localhost:8080/gemini-api"; //Sesuaikan dengan PORT di backend;
const chatArea = document.getElementById("chat-area");
const chatForm = document.getElementById("chat-form");
const messageInput = document.getElementById("message-input");
const fileInput = document.getElementById("file-input");
const filePreview = document.getElementById("file-preview");
const loadingOverlay = document.getElementById("loading-overlay");
const charCount = document.getElementById("char-count");
const alertBox = document.getElementById("alert-box");
const themeToggle = document.getElementById("theme-toggle");
const clearHistoryBtn = document.getElementById("clear-history");
const confirmModal = document.getElementById("confirm-modal");
const cancelClear = document.getElementById("cancel-clear");
const confirmClear = document.getElementById("confirm-clear");

// === Load chat history saat halaman dibuka ===
window.addEventListener("load", () => {
  const history = JSON.parse(localStorage.getItem("chatHistory")) || [];
  history.forEach((msg) =>
    addMessage(
      msg.sender,
      msg.text,
      msg.timestamp,
      msg.fileType,
      msg.fileUrl,
      false
    )
  );
});

// === Custom Alert ===
function showAlert(message, type = "error") {
  alertBox.textContent = message;
  alertBox.className = `mx-4 mt-3 px-4 py-2 rounded text-sm font-semibold ${
    type === "error"
      ? "bg-red-100 text-red-800 border border-red-300"
      : "bg-green-100 text-green-800 border border-green-300"
  }`;
  alertBox.classList.remove("hidden");

  setTimeout(() => {
    alertBox.classList.add("hidden");
  }, 3000);
}

// === Save ke localStorage ===
function saveMessage(sender, text, timestamp, fileType = null, fileUrl = null) {
  const history = JSON.parse(localStorage.getItem("chatHistory")) || [];
  history.push({ sender, text, timestamp, fileType, fileUrl });
  localStorage.setItem("chatHistory", JSON.stringify(history));
}

// === Tambah pesan ke chat area ===
function addMessage(
  sender,
  text,
  timestamp,
  fileType = null,
  fileUrl = null,
  save = true
) {
  const messageEl = document.createElement("div");
  messageEl.className = sender === "user" ? "text-right" : "text-left";

  let content = `
    <div class="inline-block max-w-[75%] px-3 py-2 rounded-lg ${
      sender === "user"
        ? "bg-blue-500 text-white text-left"
        : "bg-gray-200 text-gray-800"
    } break-words">${text}</div>
    <div class="text-xs text-gray-500 mt-1">${timestamp}</div>
  `;

  if (fileType && fileUrl) {
    if (fileType.startsWith("image/")) {
      content += `<img src="./uploads/${fileUrl}" class="h-24 mt-2 rounded mx-auto"/>`;
    } else if (fileType.startsWith("audio/")) {
      content += `<audio controls src="./uploads/${fileUrl}" class="mt-2 mx-auto"></audio>`;
    } else {
      content += `<div class="mt-2 text-sm">📄 ${fileUrl}</div>`;
    }
  }

  messageEl.innerHTML = content;
  chatArea.appendChild(messageEl);

  scrollToBottom();
  if (save) saveMessage(sender, text, timestamp, fileType, fileUrl);
}

// === Preview upload ===
fileInput.addEventListener("change", () => {
  const file = fileInput.files[0];
  filePreview.innerHTML = "";

  if (file) {
    const wrapper = document.createElement("div");
    wrapper.className = "relative inline-block";

    let previewEl;
    if (file.type.startsWith("image/")) {
      previewEl = document.createElement("img");
      previewEl.src = URL.createObjectURL(file);
      previewEl.className = "h-20 mt-2 rounded";
    } else if (file.type.startsWith("audio/")) {
      previewEl = document.createElement("audio");
      previewEl.controls = true;
      previewEl.src = URL.createObjectURL(file);
      previewEl.className = "mt-2";
    } else {
      previewEl = document.createElement("div");
      previewEl.className =
        "mt-2 text-sm text-gray-600 flex items-center gap-2 truncate";
      previewEl.innerHTML = "📄 " + file.name;
    }

    // tombol X hapus preview
    const removeBtn = document.createElement("button");
    removeBtn.innerHTML = "✕";
    removeBtn.className =
      "absolute top-1 right-1 bg-black/60 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center hover:bg-red-600 transition";
    removeBtn.onclick = () => {
      fileInput.value = ""; // reset file input
      filePreview.innerHTML = ""; // hapus preview
    };

    wrapper.appendChild(previewEl);
    wrapper.appendChild(removeBtn);
    filePreview.appendChild(wrapper);
  }
});

// === Scroll auto smooth ===
function scrollToBottom() {
  chatArea.scrollTo({
    top: chatArea.scrollHeight,
    behavior: "smooth"
  });
}

// === Format waktu (HH:MM) ===
function formatTime(date = new Date()) {
  return date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
}


// === Hitung karakter ===
messageInput.addEventListener("input", () => {
  messageInput.style.height = "auto";        // reset dulu
  messageInput.style.height = messageInput.scrollHeight + "px"; // sesuaikan
  charCount.textContent = `${messageInput.value.length} / 500`;
});

// === Handle submit form ===
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const text = messageInput.value.trim();
  const file = fileInput.files[0];

  if (!text) {
    showAlert("Pesan tidak boleh kosong");
    return;
  }

  const timestamp = new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  // tampilkan pesan user
  addMessage("user", text, timestamp, file ? file.type : null, file ? file.name : null);

  // reset input
  messageInput.value = "";
  messageInput.style.height = "auto";
  charCount.textContent = "0 / 500";
  fileInput.value = "";
  filePreview.innerHTML = "";

  // tampilkan loading overlay
  loadingOverlay.classList.remove("hidden");

  try {
    const formData = new FormData();
    formData.append("prompt", text);

    let endpoint = "/generate-text";
    if (file) {
      if (file.type.startsWith("image/")) {
        endpoint = "/generate-from-image";
        formData.append("image", file);
      } else if (file.type.startsWith("audio/")) {
        endpoint = "/generate-from-audio";
        formData.append("audio", file);
      } else {
        endpoint = "/generate-from-document";
        formData.append("document", file);
      }
    }

    const res = await fetch(BASE_URL + endpoint, { method: "POST", body: formData });
    const data = await res.json();

    addMessage(
      "bot",
      data.output || "Server tidak merespons, coba lagi.",
      new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
  } catch (err) {
    addMessage("bot", "⚠️ Error: " + err.message, timestamp);
  } finally {
    loadingOverlay.classList.add("hidden");
  }
});

// === Kirim pesan dengan Enter ===
messageInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault(); // cegah newline default
    chatForm.requestSubmit(); // trigger submit form
  }
});

// === Theme Toggle ===
function applyTheme(theme) {
  if (theme === "dark") {
    document.documentElement.classList.add("dark");
    themeToggle.textContent = "☀️";
  } else {
    document.documentElement.classList.remove("dark");
    themeToggle.textContent = "🌙";
  }
  localStorage.setItem("theme", theme);
}

themeToggle.addEventListener("click", () => {
  const currentTheme = document.documentElement.classList.contains("dark") ? "dark" : "light";
  applyTheme(currentTheme === "dark" ? "light" : "dark");
});

// buka modal saat klik tombol clear
clearHistoryBtn.addEventListener("click", () => {
  confirmModal.classList.remove("hidden");
  confirmModal.classList.add("flex");
});

// batal clear
cancelClear.addEventListener("click", () => {
  confirmModal.classList.add("hidden");
  confirmModal.classList.remove("flex");
});

// konfirmasi hapus
confirmClear.addEventListener("click", () => {
  localStorage.removeItem("chatHistory");
  chatArea.innerHTML = "";
  confirmModal.classList.add("hidden");
  confirmModal.classList.remove("flex");
});

// === Load theme dari localStorage ===
applyTheme(localStorage.getItem("theme") || "light");