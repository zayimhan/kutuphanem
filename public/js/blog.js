import { db, auth } from './firebase.js';
import { collection, getDocs, doc, updateDoc, arrayUnion } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Tüm blogları listele (her kitap için birden fazla blog desteği)
export async function loadAllBlogs() {
    const user = auth.currentUser;
    if (!user) return;

    const blogListDiv = document.getElementById("blog-view");
    blogListDiv.innerHTML = `
        <h2>🖊️ Blog</h2>
        <div style="margin-bottom:1rem;">
            <select id="book-select" style="font-size:1rem;padding:0.3rem;">
                <option value="">Kitap seç...</option>
            </select>
            <textarea id="blog-input" placeholder="Yeni blog ekle..." rows="4" style="width:100%;margin-top:0.5rem;"></textarea>
            <button id="save-blog-btn" style="margin-top:0.5rem;">Kaydet</button>
        </div>
        <div id="all-blogs"></div>
        <button class="back-btn">⬅ Geri</button>
    `;

    const allBlogsDiv = document.getElementById("all-blogs");
    allBlogsDiv.innerHTML = "Yükleniyor...";

    const bookSelect = document.getElementById("book-select");
    const q = collection(db, "users", user.uid, "library");
    const querySnapshot = await getDocs(q);

    let found = false;
    allBlogsDiv.innerHTML = "";

    // Sadece okunmuş kitapları dropdown'a ekle
    querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.status !== "okunmadi") {
            const option = document.createElement("option");
            option.value = docSnap.id;
            option.textContent = `${data.title} (${data.author})`;
            bookSelect.appendChild(option);
        }
    });

    // Blogları listele
    querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (Array.isArray(data.blog) && data.blog.length > 0) {
            found = true;

            // yardımcı: düzenleme modalını aç
            const openEditModal = (blogItem, docId, bookTitle, bookAuthor) => {
                const modalBg = document.createElement("div");
                modalBg.className = "blog-modal-bg";

                const modalBox = document.createElement("div");
                modalBox.className = "blog-modal-box";
                modalBox.innerHTML = `
                    <div style="font-size:1.2rem; color:#ffe082; margin-bottom:1rem;">${bookTitle} (${bookAuthor})</div>
                    <div style="margin-bottom:1.5rem; color:#fbc02d;">${new Date(blogItem.date).toLocaleString()}</div>
                `;

                const blogTextarea = document.createElement("textarea");
                blogTextarea.value = blogItem.text;
                blogTextarea.style.width = "100%";
                blogTextarea.style.height = "180px";
                blogTextarea.style.fontSize = "1rem";
                blogTextarea.style.background = "#2d1b13";
                blogTextarea.style.color = "#fff";
                blogTextarea.style.border = "1px solid #fbc02d";
                blogTextarea.style.borderRadius = "6px";
                blogTextarea.style.marginBottom = "1rem";
                blogTextarea.style.fontFamily = "'Press Start 2P', Arial, sans-serif";
                modalBox.appendChild(blogTextarea);

                const saveBtn = document.createElement("button");
                saveBtn.textContent = "Kaydet";
                saveBtn.className = "blog-modal-save";
                saveBtn.onclick = async () => {
                    const newText = blogTextarea.value.trim();
                    if (newText && newText !== blogItem.text) {
                        const bookRef = doc(db, "users", user.uid, "library", docId);
                        const bookData = docSnap.data(); // taze oku
                        const newBlogArr = (bookData.blog || []).map(b =>
                            b.id === blogItem.id ? { ...b, text: newText, date: Date.now() } : b
                        );
                        await updateDoc(bookRef, { blog: newBlogArr });
                        document.body.removeChild(modalBg);
                        loadAllBlogs();
                    }
                };
                modalBox.appendChild(saveBtn);

                const closeBtn = document.createElement("button");
                closeBtn.textContent = "✖";
                closeBtn.className = "blog-modal-close";
                closeBtn.onclick = () => document.body.removeChild(modalBg);
                modalBox.appendChild(closeBtn);

                modalBg.appendChild(modalBox);
                document.body.appendChild(modalBg);
            };

            data.blog.forEach(blogItem => {
                const blogBox = document.createElement("div");
                blogBox.className = "blog-box";
                blogBox.style.position = "relative"; // sağ üst sil butonu için

                const maxLen = 120;
                let shortText = blogItem.text;
                let isLong = false;
                if (blogItem.text.length > maxLen) {
                    shortText = blogItem.text.slice(0, maxLen) + "...";
                    isLong = true;
                }

                blogBox.innerHTML = `
                    <div class="book-title">📘 ${data.title}</div>
                    <div class="book-author">yazar: ${data.author}</div>
                    <div class="blog-label">Blog:</div>
                    <div class="blog-text">${shortText}</div>
                    <div class="blog-date">${new Date(blogItem.date).toLocaleString()}</div>
                `;

                // SAĞ ÜST SİL BUTONU
                const deleteBtn = document.createElement("button");
                deleteBtn.textContent = "✖";
                deleteBtn.title = "Sil";
                deleteBtn.style.position = "absolute";
                deleteBtn.style.top = "6px";
                deleteBtn.style.right = "6px";
                deleteBtn.style.width = "28px";
                deleteBtn.style.height = "28px";
                deleteBtn.style.borderRadius = "9999px";
                deleteBtn.style.border = "1px solid #e57373";
                deleteBtn.style.background = "#3a1f1a";
                deleteBtn.style.color = "#ff8a80";
                deleteBtn.style.cursor = "pointer";
                deleteBtn.style.display = "grid";
                deleteBtn.style.placeItems = "center";
                deleteBtn.onclick = async () => {
                    if (confirm("Bu blog yazısını silmek istiyor musun?")) {
                        const bookRef = doc(db, "users", user.uid, "library", docSnap.id);
                        const bookData = docSnap.data();
                        const newBlogArr = (bookData.blog || []).filter(b => b.id !== blogItem.id);
                        await updateDoc(bookRef, { blog: newBlogArr });
                        loadAllBlogs();
                    }
                };
                blogBox.appendChild(deleteBtn);

                // butonlar alanı
                const actions = document.createElement("div");
                actions.style.marginTop = "0.5rem";
                actions.style.display = "flex";
                actions.style.gap = "0.5rem";

                // HER ZAMAN görünen DÜZENLE
                const editBtnTop = document.createElement("button");
                editBtnTop.textContent = "🖊️ Düzenle";
                editBtnTop.className = "see-more-btn";
                editBtnTop.onclick = () =>
                    openEditModal(blogItem, docSnap.id, data.title, data.author);
                actions.appendChild(editBtnTop);

                // Uzunsa "Devamını Gör"
                if (isLong) {
                    const seeMoreBtn = document.createElement("button");
                    seeMoreBtn.textContent = "Devamını Gör";
                    seeMoreBtn.className = "see-more-btn";
                    seeMoreBtn.onclick = () => {
                        const modalBg = document.createElement("div");
                        modalBg.className = "blog-modal-bg";

                        const modalBox = document.createElement("div");
                        modalBox.className = "blog-modal-box";
                        modalBox.innerHTML = `
                            <div style="font-size:1.2rem; color:#ffe082; margin-bottom:1rem;">${data.title} (${data.author})</div>
                            <div style="margin-bottom:1.5rem; color:#fbc02d;">${new Date(blogItem.date).toLocaleString()}</div>
                        `;

                        const blogTextDiv = document.createElement("div");
                        blogTextDiv.style.whiteSpace = "pre-line";
                        blogTextDiv.style.fontSize = "1rem";
                        blogTextDiv.textContent = blogItem.text;
                        modalBox.appendChild(blogTextDiv);

                        const editBtn = document.createElement("button");
                        editBtn.textContent = "🖊️";
                        editBtn.className = "blog-modal-edit";
                        editBtn.onclick = () => {
                            document.body.removeChild(modalBg);
                            openEditModal(blogItem, docSnap.id, data.title, data.author);
                        };
                        modalBox.appendChild(editBtn);

                        const closeBtn = document.createElement("button");
                        closeBtn.textContent = "✖";
                        closeBtn.className = "blog-modal-close";
                        closeBtn.onclick = () => document.body.removeChild(modalBg);
                        modalBox.appendChild(closeBtn);

                        modalBg.appendChild(modalBox);
                        document.body.appendChild(modalBg);
                    };
                    actions.appendChild(seeMoreBtn);
                }

                blogBox.appendChild(actions);
                allBlogsDiv.appendChild(blogBox);
            });
        }
    });

    if (!found) {
        allBlogsDiv.innerHTML = "Henüz hiç blog yazısı yok. Okuduğun kitaplara blog ekleyebilirsin.";
    }

    // Blog ekleme işlemi
    document.getElementById("save-blog-btn").onclick = async () => {
        const blogInput = document.getElementById("blog-input");
        const bookId = bookSelect.value;
        const blogText = blogInput.value.trim();
        if (!bookId) {
            alert("Lütfen bir kitap seçin!");
            return;
        }
        if (!blogText) {
            alert("Blog metni boş olamaz!");
            return;
        }
        await addBlogToBook(bookId, blogText);
        blogInput.value = "";
        loadAllBlogs(); // Blogları tekrar yükle
    };
}

// Bir kitap için yeni blog ekle
export async function addBlogToBook(bookId, blogText) {
    const user = auth.currentUser;
    if (!user) return;

    const bookRef = doc(db, "users", user.uid, "library", bookId);

    // Blogu dizi olarak ekle (arrayUnion ile), benzersiz id ekle
    await updateDoc(bookRef, {
        blog: arrayUnion({
            id: Date.now(),
            text: blogText,
            date: Date.now()
        })
    });
}
