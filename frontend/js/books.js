// books.js - Book search and display functionality

// Check authentication
if (!isLoggedIn()) {
  window.location.href = 'login.html';
}

let currentFilter = 'all';

// Load books based on filter
async function loadBooks(filter = 'all') {
  currentFilter = filter;
  const container = document.getElementById('booksContainer');
  
  // Update active button
  document.querySelectorAll('.btn-outline').forEach(btn => btn.classList.remove('active'));
  document.getElementById(`btn${filter.charAt(0).toUpperCase() + filter.slice(1)}`).classList.add('active');
  
  // Show loading
  container.innerHTML = `
    <div class="loader" style="grid-column: 1 / -1;">
      <div class="spinner"></div>
    </div>
  `;
  
  let endpoint;
  switch(filter) {
    case 'popular':
      endpoint = BOOK_ENDPOINTS.POPULAR;
      break;
    case 'latest':
      endpoint = BOOK_ENDPOINTS.LATEST;
      break;
    default:
      endpoint = BOOK_ENDPOINTS.ALL;
  }
  
  try {
    const response = await fetch(endpoint, {
      headers: getAuthHeaders()
    });
    
    const data = await response.json();
    
    if (response.ok && data.success) {
      displayBooks(data.data);
    } else {
      container.innerHTML = `
        <div class="alert alert-error" style="grid-column: 1 / -1;">
          Gagal memuat buku
        </div>
      `;
    }
  } catch (error) {
    console.error('Error loading books:', error);
    container.innerHTML = `
      <div class="alert alert-error" style="grid-column: 1 / -1;">
        Tidak dapat terhubung ke server
      </div>
    `;
  }
}

// Search books
async function searchBooks() {
  const searchInput = document.getElementById('searchInput');
  const query = searchInput.value.trim();
  
  if (!query) {
    loadBooks(currentFilter);
    return;
  }
  
  const container = document.getElementById('booksContainer');
  
  // Show loading
  container.innerHTML = `
    <div class="loader" style="grid-column: 1 / -1;">
      <div class="spinner"></div>
    </div>
  `;
  
  try {
    const response = await fetch(`${BOOK_ENDPOINTS.SEARCH}?q=${encodeURIComponent(query)}`, {
      headers: getAuthHeaders()
    });
    
    const data = await response.json();
    
    if (response.ok && data.success) {
      displayBooks(data.data, query);
    } else {
      container.innerHTML = `
        <div class="alert alert-error" style="grid-column: 1 / -1;">
          Pencarian gagal
        </div>
      `;
    }
  } catch (error) {
    console.error('Error searching books:', error);
    container.innerHTML = `
      <div class="alert alert-error" style="grid-column: 1 / -1;">
        Tidak dapat terhubung ke server
      </div>
    `;
  }
}

// Display books in grid
function displayBooks(books, searchQuery = null) {
  const container = document.getElementById('booksContainer');
  
  if (books.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <i class="fas fa-book"></i>
        <h3>Tidak ada buku ditemukan</h3>
        <p>${searchQuery ? `Tidak ada hasil untuk "${searchQuery}"` : 'Belum ada buku tersedia'}</p>
      </div>
    `;
    return;
  }
  
  container.innerHTML = books.map(book => `
    <div class="book-card" onclick="viewBookDetail(${book.id_buku})">
      <div class="book-cover">
        ${book.cover_image ? 
          `<img src="${getBookCoverUrl(book.cover_image)}" alt="${book.judul}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.style.display='none'; this.parentElement.innerHTML='<i class=\\'fas fa-book\\'></i>'">` 
          : 
          '<i class="fas fa-book"></i>'
        }
      </div>
      <div class="book-info">
        <h3 class="book-title" title="${book.judul}">${book.judul}</h3>
        <p class="book-author" title="${book.penulis}">${book.penulis}</p>
        <span class="book-stock ${book.stok > 0 ? '' : 'badge-danger'}">
          ${book.stok > 0 ? `Stok: ${book.stok}` : 'Habis'}
        </span>
      </div>
    </div>
  `).join('');
}

// View book detail
function viewBookDetail(id) {
  window.location.href = `book-detail.html?id=${id}`;
}

// Search on Enter key
const searchInput = document.getElementById('searchInput');
if (searchInput) {
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      searchBooks();
    }
  });
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  loadBooks('all');
});
