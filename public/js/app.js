// public/js/app.js
import "./firebase.js";
import './auth.js';  // Giriş/çıkış zaten burada kontrol ediliyor
import './ui.js';   
import { currentlyReadingBooks, initBooks } from './books.js';



document.addEventListener('DOMContentLoaded', () => {
    initBooks();  // Kitapları başlat
    currentlyReadingBooks();
});

