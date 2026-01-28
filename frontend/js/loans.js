// loans.js - Loan management functionality

// Check authentication
if (!isLoggedIn()) {
  window.location.href = 'login.html';
}

// Format date
function formatDate(dateString) {
  const date = new Date(dateString);
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString('id-ID', options);
}

// Check if date is overdue
function isOverdue(dueDate) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  return today > due;
}

// Calculate days remaining
function daysRemaining(dueDate) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  const diffTime = due - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

// Load active loans
async function loadMyLoans() {
  const container = document.getElementById('loansContainer');
  
  try {
    const response = await fetch(LOAN_ENDPOINTS.MY_LOANS, {
      headers: getAuthHeaders()
    });
    
    const data = await response.json();
    
    if (response.ok && data.success) {
      displayLoans(data.data);
    } else {
      container.innerHTML = `
        <div class="alert alert-error">
          Gagal memuat data peminjaman
        </div>
      `;
    }
  } catch (error) {
    console.error('Error loading loans:', error);
    container.innerHTML = `
      <div class="alert alert-error">
        Tidak dapat terhubung ke server
      </div>
    `;
  }
}

// Display loans
function displayLoans(loans) {
  const container = document.getElementById('loansContainer');
  
  if (loans.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-book-reader"></i>
        <h3>Belum ada peminjaman</h3>
        <p>Anda belum memiliki peminjaman aktif</p>
        <a href="search.html" class="btn btn-primary" style="margin-top: 1rem;">
          <i class="fas fa-search"></i> Cari Buku
        </a>
      </div>
    `;
    return;
  }
  
  container.innerHTML = loans.map(loan => {
    const overdue = loan.current_status === 'terlambat' || (loan.status === 'dipinjam' && isOverdue(loan.tanggal_jatuh_tempo));
    const daysLeft = daysRemaining(loan.tanggal_jatuh_tempo);
    const daysLate = loan.days_late || 0;
    
    let statusBadge = '';
    let statusColor = '';
    let deadlineInfo = '';
    
    if (loan.status === 'menunggu') {
      statusBadge = '<span class="badge badge-info">Menunggu Pengambilan</span>';
      deadlineInfo = `
        <div class="alert alert-info">
          <i class="fas fa-info-circle"></i>
          Silakan ambil buku di perpustakaan
        </div>
      `;
    } else if (overdue) {
      statusBadge = '<span class="badge badge-danger">Terlambat</span>';
      statusColor = 'var(--danger)';
      deadlineInfo = `
        <div class="alert alert-error">
          <i class="fas fa-exclamation-triangle"></i>
          Terlambat ${daysLate} hari! Denda: Rp${daysLate * 1000}
        </div>
      `;
    } else if (daysLeft <= 2) {
      statusBadge = '<span class="badge badge-warning">Segera Jatuh Tempo</span>';
      statusColor = 'var(--warning)';
      deadlineInfo = `
        <div class="alert alert-warning">
          <i class="fas fa-clock"></i>
          Deadline dalam ${daysLeft} hari!
        </div>
      `;
    } else {
      statusBadge = '<span class="badge badge-success">Dipinjam</span>';
      statusColor = 'var(--success)';
      deadlineInfo = `
        <div style="padding: 0.75rem; background: var(--bg-light); border-radius: var(--radius-sm); border-left: 4px solid var(--success);">
          <i class="fas fa-calendar-check"></i>
          Sisa waktu: <strong>${daysLeft} hari</strong>
        </div>
      `;
    }
    
    return `
      <div class="card" style="margin-bottom: 1.5rem;">
        
        ${deadlineInfo}

        <div style="display: flex; justify-content: space-between; align-items: start; gap: 1rem; margin-top: 1rem;">
          
          <div style="flex: 1;">
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
              <h3 style="color: var(--text-dark); margin: 0;">${loan.judul}</h3>
              ${statusBadge}
            </div>
            
            <p style="color: var(--text-medium); font-size: 0.9rem; margin-bottom: 1rem;">
              <i class="fas fa-user"></i> ${loan.penulis}
            </p>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 0.75rem; font-size: 0.85rem;">
              <div>
                <span style="color: var(--text-medium);">Tanggal Pinjam:</span><br>
                <strong>${formatDate(loan.tanggal_pinjam)}</strong>
              </div>
              <div>
                <span style="color: var(--text-medium);">Deadline:</span><br>
                <strong style="color: ${statusColor}">${formatDate(loan.tanggal_jatuh_tempo)}</strong>
              </div>
            </div>
          </div>

        </div>

      </div>
    `;
  }).join('');
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  loadMyLoans();
});
