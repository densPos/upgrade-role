// ===== QRIS ZOOM MODAL =====
(function() {
  const modal = document.getElementById('qrisModal');
  const modalImage = document.getElementById('qrisModalImage');
  const closeBtn = document.getElementById('qrisModalClose');
  const qrisImage = document.getElementById('qrisImg');
  const zoomBtn = document.getElementById('zoomQrisBtn');
  
  function openQrisModal() {
    if (!qrisImage || !modalImage) return;
    modalImage.src = qrisImage.src;
    modal.classList.add('is-active');
    document.body.style.overflow = 'hidden';
  }
  
  function closeQrisModal() {
    modal.classList.remove('is-active');
    document.body.style.overflow = '';
  }
  
  // Click QRIS image to zoom
  if (qrisImage) {
    qrisImage.addEventListener('click', openQrisModal);
  }
  
  // Click zoom button to zoom
  if (zoomBtn) {
    zoomBtn.addEventListener('click', openQrisModal);
  }
  
  // Click close button
  if (closeBtn) {
    closeBtn.addEventListener('click', closeQrisModal);
  }
  
  // Click overlay background to close
  if (modal) {
    modal.addEventListener('click', function(e) {
      if (e.target === modal) {
        closeQrisModal();
      }
    });
  }
  
  // ESC key to close
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && modal && modal.classList.contains('is-active')) {
      closeQrisModal();
    }
  });
})();

// ===== HARGA DASAR PER ROLE =====
const PRICING = {
  vip: {
    label: 'VIP',
    daily: 1000,
    monthly: 29000,
    yearly: 290000
  },
  moderator: {
    label: 'Moderator',
    daily: 2700,
    monthly: 79000,
    yearly: 790000
  }
};

const WA_NUMBER = '6285817505691';

const state = {
  step: 1,
  role: null,
  duration: 1,
  customUnit: 'daily',
  customAmount: 1,
  method: 'qris',
  total: 0
};

const rupiah = (num) => 'Rp' + Math.round(num).toLocaleString('id-ID');

// ===== ELEMENTS =====
const sections = document.querySelectorAll('.pay-section');
const stepIndicators = {
  1: document.getElementById('step-indicator-1'),
  2: document.getElementById('step-indicator-2'),
  3: document.getElementById('step-indicator-3'),
  4: document.getElementById('step-indicator-4'),
};

// ===== STEP NAVIGATION =====
function goToStep(n) {
  state.step = n;
  sections.forEach(sec => {
    sec.classList.toggle('is-active', sec.id === `section-${n}`);
  });
  
  Object.keys(stepIndicators).forEach(key => {
    const stepNum = parseInt(key, 10);
    stepIndicators[key].classList.remove('is-active', 'is-done');
    if (stepNum === n) {
      stepIndicators[key].classList.add('is-active');
    } else if (stepNum < n) {
      stepIndicators[key].classList.add('is-done');
    }
  });
  
  window.scrollTo({ top: document.querySelector('.pay-head').offsetTop - 20, behavior: 'smooth' });
}

// ===== STEP 1: ROLE SELECTION =====
const roleInputs = document.querySelectorAll('input[name="role"]');
const btnToStep2 = document.getElementById('btn-to-step-2');

roleInputs.forEach(input => {
  input.addEventListener('change', () => {
    state.role = input.value;
    btnToStep2.disabled = false;
    calculateTotal();
  });
});

// ===== STEP 2: DURATION =====
const durationInputs = document.querySelectorAll('input[name="duration"]');
const previewTotalPrice = document.getElementById('preview-total-price');

durationInputs.forEach(input => {
  input.addEventListener('change', () => {
    state.duration = parseInt(input.value, 10);
    calculateTotal();
  });
});

function calculateTotal() {
  if (!state.role) {
    previewTotalPrice.textContent = 'Rp0';
    state.total = 0;
    return;
  }

  const price = PRICING[state.role];
  let total = price.monthly * state.duration;
  
  // Apply discount
  if (state.duration === 3) total = total * 0.9; // 10% discount
  if (state.duration === 12) total = total * 0.75; // 25% discount
  
  state.total = total;
  previewTotalPrice.textContent = rupiah(total);
}

// ===== STEP 3: METHOD =====
const methodInputs = document.querySelectorAll('input[name="method"]');

methodInputs.forEach(input => {
  input.addEventListener('change', () => {
    state.method = input.value;
  });
});

// ===== STEP 4: SUMMARY =====
function updateSummary() {
  if (!state.role) return;
  const price = PRICING[state.role];
  
  document.getElementById('summary-role-text').textContent = price.label;
  
  let durationText = `${state.duration} Bulan`;
  if (state.duration === 1) durationText = '1 Bulan';
  else if (state.duration === 3) durationText = '3 Bulan';
  else if (state.duration === 12) durationText = '12 Bulan';
  document.getElementById('summary-duration-text').textContent = durationText;
  
  document.getElementById('summary-total-text').textContent = rupiah(state.total);
  
  // Toggle payment method display
  const qrisBox = document.getElementById('qris-payment-details');
  const bankBox = document.getElementById('bank-payment-details');
  
  if (state.method === 'qris') {
    qrisBox.style.display = 'block';
    bankBox.style.display = 'none';
  } else {
    qrisBox.style.display = 'none';
    bankBox.style.display = 'block';
  }
  
  // Update WhatsApp link
  const waLink = document.getElementById('btn-wa-confirm');
  const waText = `Halo admin, saya mau konfirmasi pembayaran:%0A%0ARole: ${price.label}%0ADurasi: ${durationText}%0AMetode: ${state.method === 'qris' ? 'QRIS' : 'Transfer Bank'}%0ATotal: ${rupiah(state.total)}%0A%0ASaya sudah transfer dan upload bukti transaksi di website.`;
  waLink.href = `https://wa.me/${WA_NUMBER}?text=${waText}`;
}

// ===== NAVIGATION EVENTS =====
document.getElementById('btn-to-step-2').addEventListener('click', () => goToStep(2));
document.getElementById('btn-back-to-1').addEventListener('click', () => goToStep(1));
document.getElementById('btn-to-step-3').addEventListener('click', () => goToStep(3));
document.getElementById('btn-back-to-2').addEventListener('click', () => goToStep(2));
document.getElementById('btn-to-step-4').addEventListener('click', () => {
  updateSummary();
  goToStep(4);
});
document.getElementById('btn-back-to-3').addEventListener('click', () => goToStep(3));

// ===== DOWNLOAD QRIS =====
function setupQrisDownload() {
  const qrisImg = document.getElementById('qrisImg');
  const downloadBtn = document.getElementById('downloadQrisBtn');
  
  if (!qrisImg || !downloadBtn) return;
  
  // Function to create QRIS canvas if image fails to load
  function createQRISCanvas() {
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');
    
    // Background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, 400, 400);
    
    // Border
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 4;
    ctx.strokeRect(10, 10, 380, 380);
    
    // QR Code pattern (simplified)
    ctx.fillStyle = '#000000';
    
    // Top-left finder pattern
    ctx.fillRect(30, 30, 80, 80);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(45, 45, 50, 50);
    ctx.fillStyle = '#000000';
    ctx.fillRect(60, 60, 20, 20);
    
    // Top-right finder pattern
    ctx.fillStyle = '#000000';
    ctx.fillRect(290, 30, 80, 80);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(305, 45, 50, 50);
    ctx.fillStyle = '#000000';
    ctx.fillRect(320, 60, 20, 20);
    
    // Bottom-left finder pattern
    ctx.fillStyle = '#000000';
    ctx.fillRect(30, 290, 80, 80);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(45, 305, 50, 50);
    ctx.fillStyle = '#000000';
    ctx.fillRect(60, 320, 20, 20);
    
    // Random QR pattern
    ctx.fillStyle = '#000000';
    const patterns = [
      [120, 80], [140, 80], [160, 80], [180, 80],
      [120, 100], [160, 100], [180, 100],
      [120, 120], [140, 120], [160, 120], [180, 120],
      [200, 80], [220, 80], [240, 80],
      [200, 100], [240, 100],
      [200, 120], [220, 120], [240, 120],
      [120, 200], [140, 200], [160, 200], [180, 200], [200, 200],
      [120, 220], [180, 220], [220, 220],
      [120, 240], [140, 240], [160, 240], [180, 240], [200, 240],
      [240, 200], [240, 220], [240, 240],
      [280, 80], [300, 80], [320, 80],
      [280, 100], [320, 100],
      [280, 120], [300, 120], [320, 120],
      [280, 200], [300, 200],
      [280, 220], [300, 220], [320, 220],
      [280, 240], [300, 240], [320, 240]
    ];
    
    patterns.forEach(([x, y]) => {
      ctx.fillRect(x, y, 15, 15);
    });
    
    // Center logo placeholder
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(160, 160, 80, 80);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.strokeRect(160, 160, 80, 80);
    ctx.fillStyle = '#000000';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('QRIS', 200, 200);
    
    return canvas;
  }
  
  // Try to load image, if fails use canvas
  qrisImg.onerror = function() {
    console.warn('QRIS image not found, creating dummy QRIS');
    const canvas = createQRISCanvas();
    qrisImg.src = canvas.toDataURL('image/png');
  };
  
  // Also handle if image is loaded but download fails
  downloadBtn.addEventListener('click', async function(e) {
    e.preventDefault();
    
    let imageSrc = qrisImg.src;
    
    // If image is from external domain or data URL, handle accordingly
    try {
      // If it's a data URL, download directly
      if (imageSrc.startsWith('data:')) {
        const link = document.createElement('a');
        link.href = imageSrc;
        link.download = 'QRIS-Pembayaran-Toolkit.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return;
      }
      
      // For HTTP URLs, fetch as blob
      const response = await fetch(imageSrc);
      if (!response.ok) throw new Error('Failed to fetch image');
      
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = 'QRIS-Pembayaran-Toolkit.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
    } catch (err) {
      console.error('Error downloading QRIS:', err);
      
      // Fallback: Create QRIS on the fly
      try {
        const canvas = createQRISCanvas();
        const dataUrl = canvas.toDataURL('image/png');
        
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = 'QRIS-Pembayaran-Toolkit.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (fallbackErr) {
        console.error('Fallback download failed:', fallbackErr);
        alert('Gagal mendownload QRIS. Silakan screenshot QRIS yang ditampilkan.');
      }
    }
  });
}

// ===== COPY NO REKENING =====
const btnCopy = document.getElementById('btn-copy-rek');
if (btnCopy) {
  btnCopy.addEventListener('click', () => {
    const norek = document.getElementById('norek-text').innerText;
    navigator.clipboard.writeText(norek).then(() => {
      btnCopy.textContent = 'Tersalin!';
      btnCopy.classList.add('is-copied');
      setTimeout(() => {
        btnCopy.textContent = 'Salin No. Rek';
        btnCopy.classList.remove('is-copied');
      }, 2000);
    }).catch(() => {
      // Fallback
      const textarea = document.createElement('textarea');
      textarea.value = norek;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      btnCopy.textContent = 'Tersalin!';
      btnCopy.classList.add('is-copied');
      setTimeout(() => {
        btnCopy.textContent = 'Salin No. Rek';
        btnCopy.classList.remove('is-copied');
      }, 2000);
    });
  });
}

// ===== UPLOAD BUKTI =====
const fileInput = document.getElementById('file-input');
const dropzone = document.getElementById('dropzone');
const uploadText = document.getElementById('upload-text');
const uploadPreview = document.getElementById('upload-preview');

fileInput.addEventListener('change', handleFileUpload);

dropzone.addEventListener('click', () => fileInput.click());

dropzone.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropzone.classList.add('is-dragover');
});

dropzone.addEventListener('dragleave', () => {
  dropzone.classList.remove('is-dragover');
});

dropzone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropzone.classList.remove('is-dragover');
  const file = e.dataTransfer.files[0];
  if (file) {
    fileInput.files = e.dataTransfer.files;
    handleFileUpload();
  }
});

function handleFileUpload() {
  const file = fileInput.files[0];
  if (!file) return;
  
  if (!file.type.startsWith('image/')) {
    alert('Mohon upload file gambar (PNG, JPG, JPEG)');
    return;
  }
  
  if (file.size > 5 * 1024 * 1024) {
    alert('Ukuran file maksimal 5MB');
    return;
  }
  
  const reader = new FileReader();
  reader.onload = (e) => {
    uploadPreview.src = e.target.result;
    uploadPreview.style.display = 'block';
    uploadText.textContent = file.name;
    dropzone.classList.add('has-file');
  };
  reader.readAsDataURL(file);
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  // Set default method
  state.method = 'qris';
  document.querySelector('input[name="method"][value="qris"]').checked = true;
  
  // Setup QRIS download
  setupQrisDownload();
  
  // Initial calculation
  calculateTotal();
});