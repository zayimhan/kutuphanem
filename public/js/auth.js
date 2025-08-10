// public/js/auth.js
import { auth } from "./firebase.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

console.log("✅ auth.js yüklendi");



// 🔄 Formlar arası geçiş (SPA mantığı)
const showRegisterLink = document.getElementById("show-register");
const showLoginLink = document.getElementById("show-login");

if (showRegisterLink) {
  showRegisterLink.addEventListener("click", () => {
    document.getElementById("login-section").style.display = "none";
    document.getElementById("register-section").style.display = "block";
  });
}

if (showLoginLink) {
  showLoginLink.addEventListener("click", () => {
    document.getElementById("register-section").style.display = "none";
    document.getElementById("login-section").style.display = "block";
  });
}

// 📝 Kayıt
const registerBtn = document.getElementById("register-btn");
if (registerBtn) {
  registerBtn.addEventListener("click", async () => {
    const email = document.getElementById("register-email").value;
    const password = document.getElementById("register-password").value;

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log("✅ Kayıt olan:", userCredential.user.email);
      // Arayüz otomatik güncellenecek (onAuthStateChanged ile)
    } catch (error) {
      alert("Hata: " + error.message);
      console.error("⛔ Kayıt hatası:", error.code, error.message);
    }
    document.getElementById("register-email").value = "";
    document.getElementById("register-password").value = "";
  });
}

// 🔐 Giriş
const loginBtn = document.getElementById("login-btn");
if (loginBtn) {
  loginBtn.addEventListener("click", async () => {
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log("✅ Giriş yapan:", userCredential.user.email);
      // Arayüz otomatik güncellenecek (onAuthStateChanged ile)
    } catch (error) {
      console.error("⛔ Giriş hatası:", error.code, error.message);
    }

    document.getElementById("login-email").value = "";
    document.getElementById("login-password").value = "";
  });
}

// 🚪 Çıkış
const logoutBtn = document.getElementById("logout-btn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    try {
      await signOut(auth);
      console.log("👋 Kullanıcı çıkış yaptı.");
    } catch (error) {
      console.error("⛔ Çıkış hatası:", error.code, error.message);
    }
  });
}




// 🧠 Oturum durumu kontrolü (SPA görünüm yönetimi)
onAuthStateChanged(auth, (user) => {
  const registerSection = document.getElementById("register-section");
  const loginSection = document.getElementById("login-section");
  const mainPanel = document.getElementById("main-panel");
  const userEmailSpan = document.getElementById("user-email");

  if (user) {
    console.log("👤 Oturum açık:", user.email);

    if (registerSection) registerSection.style.display = "none";
    if (loginSection) loginSection.style.display = "none";
    if (mainPanel) mainPanel.style.display = "block";
    if (userEmailSpan) userEmailSpan.textContent = user.email;

    // Sayfa üzerindeki diğer tüm bölümleri (library, reading vs.) gizle
    document.querySelectorAll(".page").forEach(sec => sec.style.display = "none");
  } else {
    console.log("🔒 Oturum kapalı");

    if (registerSection) registerSection.style.display = "none"; // gizli kalsın
    if (loginSection) loginSection.style.display = "block";
    if (mainPanel) mainPanel.style.display = "none";

    // Diğer sayfaları da gizle (SPA temizliği)
    document.querySelectorAll(".page").forEach(sec => sec.style.display = "none");
  }
});



