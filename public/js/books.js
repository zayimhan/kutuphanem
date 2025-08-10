// books.js

import { db, auth } from './firebase.js';
import {
  collection,
  addDoc,
  deleteDoc,
  getDocs,
  doc,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";


import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";




export async function randomBook(type) {
  const user = auth.currentUser;
  if (!user) return;

  const q = collection(db, "users", user.uid, "library");
  const querySnapshot = await getDocs(q);

  let books = [];
  querySnapshot.forEach((docSnap) => {
    const data = docSnap.data();
    if (type === "new" && (data.status === "okunmadi" || !data.status)) {
      books.push({ ...data, id: docSnap.id });
    }
    if (type === "reread" && data.status === "okundu") {
      books.push({ ...data, id: docSnap.id });
    }
  });

  const resultDiv = document.getElementById("random-result");
  resultDiv.innerHTML = ""; // Önceki sonucu temizle

  if (books.length === 0) {
    resultDiv.textContent = "Uygun kitap bulunamadı.";
    return;
  }
  const random = books[Math.floor(Math.random() * books.length)];

  // Kitap kapağı şeklinde göster
  const li = document.createElement("li");
  li.className = "random-book-cover"; // İstersen özel bir class ekleyebilirsin
  li.innerHTML = `
    <div class="book-title">📘 ${random.title}</div>
    <div class="book-author">yazar: ${random.author}</div>
    <div class="book-status">Durum: ${random.status || "okunmadi"}</div>
    `;
  // Butonlar
  const btnWrapper = document.createElement("div");
  btnWrapper.style.display = "flex";
  btnWrapper.style.justifyContent = "center";
  btnWrapper.style.gap = "1rem";
  btnWrapper.style.marginTop = "1.2rem";


  const startBtn = document.createElement("button");
  startBtn.textContent = "Okumaya Başla";
  startBtn.onclick = async () => {
    let newStatus = "okunuyor";
    if (type === "reread") newStatus = "tekrar okunuyor";
    await setDoc(doc(db, "users", user.uid, "library", random.id), {
      ...random,
      status: newStatus
    });
    alert(`"${random.title}" ${newStatus === "tekrar okunuyor" ? "tekrar okunmaya" : "okunmaya"} başlandı!`);
    // sayfayı temizle
    resultDiv.innerHTML = "";
  };

  const retryBtn = document.createElement("button");
  retryBtn.textContent = "Tekrar Dene";
  retryBtn.onclick = () => randomBook(type);

  btnWrapper.appendChild(startBtn);
  btnWrapper.appendChild(retryBtn);
  li.appendChild(btnWrapper);

  resultDiv.appendChild(li);
}




// 📚 Kullanıcının kitaplarını Firestore'dan al ve listele
export async function loadLibraryBooks() {
  const user = auth.currentUser;
  if (!user) return;

  const listEl = document.getElementById("library-list");
  listEl.innerHTML = "Yükleniyor...";

  const q = collection(db, "users", user.uid, "library");
  const querySnapshot = await getDocs(q);

  listEl.innerHTML = "";

  querySnapshot.forEach((docSnap) => {
    const data = docSnap.data();
    const li = document.createElement("li");
    li.innerHTML = `
      <div class="book-title">📘 ${data.title}</div>
      <div class="book-author">yazar: ${data.author}</div>
    `;

    // Kitap kapağı gibi görünmesi için stiller zaten CSS'de ayarlanmalı

    // Durum yazısı ve açılır liste
    const actionsDiv = document.createElement("div");
    actionsDiv.className = "book-actions";

    const statusLabel = document.createElement("span");
    statusLabel.className = "book-status-label";
    statusLabel.textContent = `${data.status || "okunmadi"}`;

    const statusSelect = document.createElement("select");
    statusSelect.style.display = "none";
    statusSelect.innerHTML = `
      <option value="okunmadi">okunmadı</option>
      <option value="okunuyor">okunuyor</option>
      <option value="okundu">okundu</option>
      <option value="tekrar okunuyor">tekrar okunuyor</option>
    `;
    statusSelect.value = data.status || "okunmadi";

    statusLabel.onclick = () => {
      statusSelect.style.display = statusSelect.style.display === "none" ? "block" : "none";
    };
    statusSelect.onchange = async () => {
      await setDoc(doc(db, "users", user.uid, "library", docSnap.id), {
        ...data,
        status: statusSelect.value
      });
      loadLibraryBooks();
    };

    actionsDiv.appendChild(statusLabel);
    actionsDiv.appendChild(statusSelect);


    // blog yazısı
    if (data.status !== "okunmadi") {
      const blogBtn = document.createElement("button");
      blogBtn.textContent = "🖊️ blog";
      blogBtn.onclick = () => {
        const event = new CustomEvent("openBlog", {
          detail: {
            bookId: docSnap.id,
            blog: data.blog || ""
          }
        });
        window.dispatchEvent(event);
      };
      actionsDiv.appendChild(blogBtn);
    }



    // Sil butonu
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "sil";
    deleteBtn.onclick = async () => {
      await deleteDoc(doc(db, "users", user.uid, "library", docSnap.id));
      loadLibraryBooks();
    };
    actionsDiv.appendChild(deleteBtn);

    li.appendChild(actionsDiv);
    listEl.appendChild(li);
  });
}

// 📖 guncel Okunan kitapları listele
export async function currentlyReadingBooks() {
  const user = auth.currentUser;
  if (!user) return;

  const listEl = document.getElementById("reading-list");
  listEl.innerHTML = "Yükleniyor...";

  const q = collection(db, "users", user.uid, "library");
  const querySnapshot = await getDocs(q);

  listEl.innerHTML = "";

  querySnapshot.forEach((docSnap) => {
    const data = docSnap.data();
    if (data.status === "okunuyor" || data.status === "tekrar okunuyor") {
      const li = document.createElement("li");
      li.innerHTML = `
      <div class="book-title">📘 ${data.title}</div>
      <div class="book-author">yazar: ${data.author}</div>
    `;

      // Kitap kapağı gibi görünmesi için stiller zaten CSS'de ayarlanmalı

      // Durum yazısı ve açılır liste
      const actionsDiv = document.createElement("div");
      actionsDiv.className = "book-actions";

      const statusLabel = document.createElement("span");
      statusLabel.className = "book-status-label";
      statusLabel.textContent = `${data.status || "okunmadi"}`;

      const statusSelect = document.createElement("select");
      statusSelect.style.display = "none";
      statusSelect.innerHTML = `
      <option value="okunmadi">okunmadı</option>
      <option value="okunuyor">okunuyor</option>
      <option value="okundu">okundu</option>
      <option value="tekrar okunuyor">tekrar okunuyor</option
    `;
      statusSelect.value = data.status || "okunmadi";

      statusLabel.onclick = () => {
        statusSelect.style.display = statusSelect.style.display === "none" ? "block" : "none";
      };
      statusSelect.onchange = async () => {
        await setDoc(doc(db, "users", user.uid, "library", docSnap.id), {
          ...data,
          status: statusSelect.value
        });
        currentlyReadingBooks(); // Okunan kitaplar listesini güncelle
      };

      actionsDiv.appendChild(statusLabel);
      actionsDiv.appendChild(statusSelect);

      // okumaya bırak butonu
      const removeBtn = document.createElement("button");
      removeBtn.textContent = "okumayi birak";
      removeBtn.onclick = async () => {
        let newStatus = "okunmadi";
        if (data.status === "tekrar okunuyor") newStatus = "okundu";
        await setDoc(doc(db, "users", user.uid, "library", docSnap.id), {
          ...data,
          status: newStatus // Okumayı bıraktığında durumu okunmadı olarak ayarla
        });
        currentlyReadingBooks(); // Okunan kitaplar listesini güncelle
      };
      actionsDiv.appendChild(removeBtn);


      li.appendChild(actionsDiv);
      listEl.appendChild(li);
    }
  });
}

// ➕ Yeni kitap ekle
export async function addBookToLibrary(title, author) {
  const user = auth.currentUser;
  if (!user) return;

  await addDoc(collection(db, "users", user.uid, "library"), {
    title,
    author,
    createdAt: Date.now(),
    status: "okunmadi",
    değerlendirme: null, // Değerlendirme başlangıçta null
    isFavorite: false // Favori başlangıçta false
  });

  loadLibraryBooks(); // Eklendikten sonra listeyi güncelle
}



// 🧭 Bu modül yüklendiğinde başlatılacak fonksiyon
export function initBooks() {
  console.log("📚 Kitap modülü hazır");

  // ➕ Ekleme işlemi
  document.getElementById("add-book-btn").addEventListener("click", () => {
    const title = document.getElementById("book-title").value.trim();
    const author = document.getElementById("book-author").value.trim();

    if (!title || !author) {
      alert("Lütfen kitap adı ve yazar girin.");
      return;
    }

    addBookToLibrary(title, author);
    document.getElementById("book-title").value = "";
    document.getElementById("book-author").value = "";
  });

  // 🧠 Kullanıcı oturum açtıysa kitapları yükle
  onAuthStateChanged(auth, (user) => {
    if (user) {
      loadLibraryBooks();
    }
  });
}