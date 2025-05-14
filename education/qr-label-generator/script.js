// DOM Elements
const qrForm = document.getElementById('qrForm');
const bookTitle = document.getElementById('bookTitle');
const bookOwner = document.getElementById('bookOwner');
const bookId = document.getElementById('bookId');
const bookNotes = document.getElementById('bookNotes');
const qrCanvas = document.getElementById('qrCanvas');
const labelInfo = document.getElementById('labelInfo');
const downloadButton = document.getElementById('downloadButton');
const printButton = document.getElementById('printButton');
const themeToggle = document.querySelector('.theme-toggle');
const colorPicker = document.getElementById('colorPicker');
const helpButton = document.querySelector('.help-button');
const helpModal = document.getElementById('helpModal');
const closeButton = document.querySelector('.close-button');
const visibilityToggle = document.querySelector('.visibility-toggle');
const qrPreview = document.getElementById('qrPreview');

// Theme Management
function loadTheme() {
    const theme = localStorage.getItem('qr-label-theme') || 'light';
    document.body.classList.toggle('dark-theme', theme === 'dark');
    themeToggle.innerHTML = `<i class="fas fa-${theme === 'dark' ? 'sun' : 'moon'}"></i>`;
}
function toggleTheme() {
    const isDark = document.body.classList.toggle('dark-theme');
    localStorage.setItem('qr-label-theme', isDark ? 'dark' : 'light');
    themeToggle.innerHTML = `<i class="fas fa-${isDark ? 'sun' : 'moon'}"></i>`;
}

// Color Management
function loadColor() {
    const color = localStorage.getItem('qr-label-color') || '#4a90e2';
    colorPicker.value = color;
    document.documentElement.style.setProperty('--primary-color', color);
}
function updateColor(e) {
    const color = e.target.value;
    document.documentElement.style.setProperty('--primary-color', color);
    localStorage.setItem('qr-label-color', color);
}

// Visibility Management
function toggleVisibility() {
    const widget = document.querySelector('.qr-label-widget');
    widget.classList.toggle('controls-hidden');
    const isHidden = widget.classList.contains('controls-hidden');
    visibilityToggle.innerHTML = `<i class="fas fa-${isHidden ? 'eye-slash' : 'eye'}"></i>`;
    localStorage.setItem('qr-label-visibility', isHidden ? 'hidden' : 'visible');
}
function loadVisibility() {
    const visibility = localStorage.getItem('qr-label-visibility') || 'visible';
    if (visibility === 'hidden') {
        const widget = document.querySelector('.qr-label-widget');
        widget.classList.add('controls-hidden');
        visibilityToggle.innerHTML = '<i class="fas fa-eye-slash"></i>';
    }
}

// Help Modal
helpButton.addEventListener('click', () => {
    helpModal.style.display = 'block';
});
closeButton.addEventListener('click', () => {
    helpModal.style.display = 'none';
});
window.addEventListener('click', (e) => {
    if (e.target === helpModal) {
        helpModal.style.display = 'none';
    }
});

// QR Code Generation
function generateQRLabel(e) {
    e.preventDefault();
    // Compose QR data (could be a URL or JSON string)
    const qrData = JSON.stringify({
        title: bookTitle.value,
        owner: bookOwner.value,
        id: bookId.value,
        notes: bookNotes.value
    });
    // Generate QR code
    const qr = new QRious({
        element: qrCanvas,
        value: qrData,
        size: 120,
        background: 'white',
        foreground: '#222'
    });
    // Update label info
    labelInfo.innerHTML =
        `<strong>${bookTitle.value}</strong><br>` +
        `Owner: ${bookOwner.value}<br>` +
        `ID: ${bookId.value}` +
        (bookNotes.value ? `<br>Notes: ${bookNotes.value}` : '');
    qrPreview.style.display = 'flex';
}

// Download QR Label
function downloadLabel() {
    // Create a temporary canvas to combine QR and info
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = 220;
    tempCanvas.height = 260;
    const ctx = tempCanvas.getContext('2d');
    // White background
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    // Draw QR
    ctx.drawImage(qrCanvas, 50, 20, 120, 120);
    // Draw text
    ctx.font = 'bold 16px Segoe UI, Arial';
    ctx.fillStyle = '#222';
    ctx.textAlign = 'center';
    ctx.fillText(bookTitle.value, tempCanvas.width / 2, 160);
    ctx.font = '14px Segoe UI, Arial';
    ctx.fillText(`Owner: ${bookOwner.value}`, tempCanvas.width / 2, 185);
    ctx.fillText(`ID: ${bookId.value}`, tempCanvas.width / 2, 205);
    if (bookNotes.value) {
        ctx.font = 'italic 13px Segoe UI, Arial';
        ctx.fillText(`Notes: ${bookNotes.value}`, tempCanvas.width / 2, 225);
    }
    // Download
    const link = document.createElement('a');
    link.href = tempCanvas.toDataURL('image/png');
    link.download = `book-label-${bookId.value || 'qr'}.png`;
    link.click();
}

// Print QR Label
function printLabel() {
    const printWindow = window.open('', '', 'width=400,height=500');
    printWindow.document.write('<html><head><title>Print QR Label</title></head><body style="text-align:center;font-family:Segoe UI,Arial,sans-serif;">');
    printWindow.document.write('<h2>Book Label</h2>');
    // Draw QR and info to a temp canvas
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = 220;
    tempCanvas.height = 260;
    const ctx = tempCanvas.getContext('2d');
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    ctx.drawImage(qrCanvas, 50, 20, 120, 120);
    ctx.font = 'bold 16px Segoe UI, Arial';
    ctx.fillStyle = '#222';
    ctx.textAlign = 'center';
    ctx.fillText(bookTitle.value, tempCanvas.width / 2, 160);
    ctx.font = '14px Segoe UI, Arial';
    ctx.fillText(`Owner: ${bookOwner.value}`, tempCanvas.width / 2, 185);
    ctx.fillText(`ID: ${bookId.value}`, tempCanvas.width / 2, 205);
    if (bookNotes.value) {
        ctx.font = 'italic 13px Segoe UI, Arial';
        ctx.fillText(`Notes: ${bookNotes.value}`, tempCanvas.width / 2, 225);
    }
    printWindow.document.write(`<img src="${tempCanvas.toDataURL('image/png')}" style="width:220px;height:260px;"/>`);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
}

// Event Listeners
qrForm.addEventListener('submit', generateQRLabel);
downloadButton.addEventListener('click', downloadLabel);
printButton.addEventListener('click', printLabel);
themeToggle.addEventListener('click', toggleTheme);
colorPicker.addEventListener('input', updateColor);
visibilityToggle.addEventListener('click', toggleVisibility);

// Initialize
loadTheme();
loadColor();
loadVisibility();
qrPreview.style.display = 'none'; 