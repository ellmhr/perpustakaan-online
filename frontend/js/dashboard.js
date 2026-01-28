// dashboard.js - Dashboard functionality

// Check authentication
if (!isLoggedIn()) {
  window.location.href = 'login.html';
}

// Load user data
const userData = getUserData();
if (userData) {
  document.getElementById('userName').textContent = userData.nama;
}

// Format currency
function formatCurrency(amount) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount);
}

// Load user statistics
async function loadUserStats() {
  try {
    const response = await fetch(USER_ENDPOINTS.STATS, {
      headers: getAuthHeaders()
    });
    
    const data = await response.json();
    
    if (response.ok && data.success) {
      document.getElementById('activeLoans').textContent = data.data.active_loans;
      document.getElementById('completedLoans').textContent = data.data.completed_loans;
      document.getElementById('lateReturns').textContent = data.data.late_returns;
      document.getElementById('unpaidFines').textContent = formatCurrency(data.data.unpaid_fines);
    }
  } catch (error) {
    console.error('Error loading stats:', error);
  }
}

// Load popular books
async function loadPopularBooks() {
  const container = document.getElementById('popularBooksContainer');
  
  try {
    const response = await fetch(BOOK_ENDPOINTS.POPULAR, {
      headers: getAuthHeaders()
    });
    
    const data = await response.json();
    
    if (response.ok && data.success) {
      if (data.data.length === 0) {
        container.innerHTML = `
          <div class="empty-state" style="grid-column: 1 / -1;">
            <i class="fas fa-book"></i>
            <h3>Belum ada buku</h3>
            <p>Belum ada data buku populer</p>
          </div>
        `;
        return;
      }
      
      container.innerHTML = data.data.slice(0, 8).map(book => `
        <div class="book-card" onclick="viewBookDetail(${book.id_buku})">
          <div class="book-cover">
            ${book.cover_image ? 
              `<img src="${getBookCoverUrl(book.cover_image)}" alt="${book.judul}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.style.display='none'; this.parentElement.innerHTML='<i class=\\'fas fa-book\\'></i>'">` 
              : 
              '<i class="fas fa-book"></i>'
            }
          </div>
          <div class="book-info">
            <h3 class="book-title">${book.judul}</h3>
            <p class="book-author">${book.penulis}</p>
            <span class="book-stock">Stok: ${book.stok}</span>
          </div>
        </div>
      `).join('');
    } else {
      container.innerHTML = `
        <div class="alert alert-error" style="grid-column: 1 / -1;">
          Gagal memuat buku populer
        </div>
      `;
    }
  } catch (error) {
    console.error('Error loading popular books:', error);
    container.innerHTML = `
      <div class="alert alert-error" style="grid-column: 1 / -1;">
        Tidak dapat terhubung ke server
      </div>
    `;
  }
}

// View book detail
function viewBookDetail(id) {
  window.location.href = `book-detail.html?id=${id}`;
}

// Initialize dashboard
document.addEventListener('DOMContentLoaded', () => {
  loadUserStats();
  loadPopularBooks();
});
