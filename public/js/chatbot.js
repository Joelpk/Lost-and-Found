document.addEventListener("DOMContentLoaded", () => {
  const toggleBtn = document.getElementById("ai-toggle");
  const closeBtn = document.getElementById("ai-close");
  const panel = document.getElementById("ai-panel");
  const helper = document.getElementById("ai-helper");

  const form = document.getElementById("ai-form");
  const input = document.getElementById("ai-input");
  const messages = document.getElementById("ai-messages");

  // Ensure chatbot is CLOSED on load
  panel.classList.add("hidden");

  toggleBtn.addEventListener("click", () => {
    panel.classList.remove("hidden");
    helper.style.display = "none";
  });

  closeBtn.addEventListener("click", () => {
    panel.classList.add("hidden");
    helper.style.display = "block";
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;

    addMessage(text, "user");
    input.value = "";

    const res = await fetch("/api/chatbot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text }),
    });

    const data = await res.json();
    addMessage(data.reply, "bot");
  });

  function addMessage(text, sender) {
    const div = document.createElement("div");
    div.className = `ai-message ${sender}`;
    div.textContent = text;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
  }
});
