import { loadLibraryBooks, currentlyReadingBooks, randomBook } from './books.js';


import { loadAllBlogs, addBlogToBook } from './blog.js';


function showSection(id) {
  document.querySelectorAll("section").forEach(sec => {
    sec.style.display = "none";
    sec.classList.remove("page-transition");
  });

  const target = document.getElementById(id);
  if (target) {
    target.style.display = "block";
    void target.offsetWidth;
    target.classList.add("page-transition");
  }
}

window.addEventListener("openBlog", (e) => {
  const blogInput = document.getElementById("blog-input");
  blogInput.value = e.detail.blog;
  blogInput.dataset.bookId = e.detail.bookId;
  showSection("blog-view");
});

document.addEventListener("DOMContentLoaded", () => {
  // Sayfa geçişlerini yöneten dinleyici
  document.body.addEventListener("click", (e) => {
    const panel = e.target.closest(".panel");
    if (!panel) return;

    const idMap = {
      "btn-library": "library-view",
      "btn-reading": "reading-view",
      "btn-random": "random-view",
      "btn-blog": "blog-view",
      "btn-add": "adding-book-view"
    };

    const viewId = idMap[panel.id];
    if (viewId) {
      showSection(viewId);
      if (viewId === "library-view") {
        loadLibraryBooks(); // Kütüphane görünümüne geçildiğinde kitapları yükle
      } else if (viewId === "reading-view") {
        currentlyReadingBooks(); // Okunan kitaplar görünümüne geçildiğinde kitapları yükle
      } else if (viewId === "random-view") {
        // Bunu başlatıcıya ekle (örneğin initBooks içinde veya ui.js'de)
        document.getElementById("random-new-btn").addEventListener("click", () => randomBook("new"));
        document.getElementById("random-reread-btn").addEventListener("click", () => randomBook("reread"));
      } else if (viewId === "blog-view") {
        loadAllBlogs(); // Blog görünümüne geçildiğinde tüm blogları yükle
      }
    }


    /* document.getElementById("save-blog-btn").addEventListener("click", async () => {
       const blogInput = document.getElementById("blog-input");
       const bookId = blogInput.dataset.bookId;
       const blogText = blogInput.value.trim();
       if (!bookId || !blogText) return;
 
       await addBlogToBook(bookId, blogText);
       alert("Blog eklendi!");
       blogInput.value = "";
 
       showSection("blog-view");
       loadAllBlogs(); // Blog güncellendiğinde tüm blogları yeniden yükle
     });*/

  });

  // Geri butonları
  document.body.addEventListener("click", (e) => {
    if (e.target.classList.contains("back-btn")) {
      showSection("main-panel");
    }
    if (e.target.classList.contains("back-btnk")) {
      showSection("library-view");
    }
  });
});
