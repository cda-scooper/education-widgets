// DOM Elements
const qrForm = document.getElementById('qrForm');
const batchInput = document.getElementById('batchInput');
const labelGrid = document.getElementById('labelGrid');
const downloadAllButton = document.getElementById('downloadAllButton');
const printAllButton = document.getElementById('printAllButton');
const themeToggle = document.querySelector('.theme-toggle');
const colorPicker = document.getElementById('colorPicker');
const helpButton = document.querySelector('.help-button');
const helpModal = document.getElementById('helpModal');
const closeButton = document.querySelector('.close-button');
const visibilityToggle = document.querySelector('.visibility-toggle');
const qrPreview = document.getElementById('qrPreview');

// Theme Management
function loadTheme() {
    const theme = localStorage.getItem('qr-batch-label-theme') || 'light';
    document.body.classList.toggle('dark-theme', theme === 'dark');
    themeToggle.innerHTML = `<i class="fas fa-${theme === 'dark' ? 'sun' : 'moon'}"></i>`;
}
function toggleTheme() {
    const isDark = document.body.classList.toggle('dark-theme');
    localStorage.setItem('qr-batch-label-theme', isDark ? 'dark' : 'light');
    themeToggle.innerHTML = `<i class="fas fa-${isDark ? 'sun' : 'moon'}"></i>`;
}

// Color Management
function loadColor() {
    const color = localStorage.getItem('qr-batch-label-color') || '#4a90e2';
    colorPicker.value = color;
    document.documentElement.style.setProperty('--primary-color', color);
}
function updateColor(e) {
    const color = e.target.value;
    document.documentElement.style.setProperty('--primary-color', color);
    localStorage.setItem('qr-batch-label-color', color);
}

// Visibility Management
function toggleVisibility() {
    const widget = document.querySelector('.qr-batch-label-widget');
    widget.classList.toggle('controls-hidden');
    const isHidden = widget.classList.contains('controls-hidden');
    visibilityToggle.innerHTML = `<i class="fas fa-${isHidden ? 'eye-slash' : 'eye'}"></i>`;
    localStorage.setItem('qr-batch-label-visibility', isHidden ? 'hidden' : 'visible');
}
function loadVisibility() {
    const visibility = localStorage.getItem('qr-batch-label-visibility') || 'visible';
    if (visibility === 'hidden') {
        const widget = document.querySelector('.qr-batch-label-widget');
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

// Parse CSV line into book object
function parseBookLine(line) {
    // Split by comma, but allow for commas in notes by limiting to 4 fields
    const parts = line.split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/).map(s => s.trim());
    return {
        title: parts[0] || '',
        owner: parts[1] || '',
        id: parts[2] || '',
        notes: parts.slice(3).join(', ') || ''
    };
}

// Generate QR grid
function generateQRGrid(e) {
    e.preventDefault();
    labelGrid.innerHTML = '';
    const lines = batchInput.value.split('\n').map(l => l.trim()).filter(Boolean);
    if (!lines.length) return;
    const books = lines.map(parseBookLine);
    books.forEach((book, idx) => {
        // Create label preview
        const labelDiv = document.createElement('div');
        labelDiv.className = 'label-preview';
        // Create QR canvas
        const qrCanvas = document.createElement('canvas');
        qrCanvas.width = 120;
        qrCanvas.height = 120;
        // QR data as JSON
        const qrData = JSON.stringify(book);
        new QRious({
            element: qrCanvas,
            value: qrData,
            size: 120,
            background: 'white',
            foreground: '#222'
        });
        // Info
        const infoDiv = document.createElement('div');
        infoDiv.className = 'label-info';
        infoDiv.innerHTML =
            `<strong>${book.title}</strong><br>` +
            `Owner: ${book.owner}<br>` +
            `ID: ${book.id}` +
            (book.notes ? `<br>Notes: ${book.notes}` : '');
        labelDiv.appendChild(qrCanvas);
        labelDiv.appendChild(infoDiv);
        labelGrid.appendChild(labelDiv);
    });
    qrPreview.style.display = 'flex';
}

// Download all as ZIP
async function downloadAllLabels() {
    // Use JSZip for ZIP creation
    if (typeof JSZip === 'undefined') {
        alert('JSZip library required for ZIP download.');
        return;
    }
    const zip = new JSZip();
    const labels = labelGrid.querySelectorAll('.label-preview');
    for (let i = 0; i < labels.length; i++) {
        const canvas = labels[i].querySelector('canvas');
        const info = labels[i].querySelector('.label-info').textContent.replace(/\n/g, ' ');
        // Create a temp canvas for PNG
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = 220;
        tempCanvas.height = 260;
        const ctx = tempCanvas.getContext('2d');
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
        ctx.drawImage(canvas, 50, 20, 120, 120);
        ctx.font = 'bold 16px Segoe UI, Arial';
        ctx.fillStyle = '#222';
        ctx.textAlign = 'center';
        ctx.fillText(labels[i].querySelector('.label-info strong').textContent, tempCanvas.width / 2, 160);
        ctx.font = '14px Segoe UI, Arial';
        const infoLines = info.split(/Owner:|ID:|Notes:/).map(s => s.trim()).filter(Boolean);
        if (infoLines[0]) ctx.fillText(`Owner: ${infoLines[0]}`, tempCanvas.width / 2, 185);
        if (infoLines[1]) ctx.fillText(`ID: ${infoLines[1]}`, tempCanvas.width / 2, 205);
        if (infoLines[2]) {
            ctx.font = 'italic 13px Segoe UI, Arial';
            ctx.fillText(`Notes: ${infoLines[2]}`, tempCanvas.width / 2, 225);
        }
        const dataUrl = tempCanvas.toDataURL('image/png');
        zip.file(`label-${i + 1}.png`, dataUrl.split(',')[1], { base64: true });
    }
    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `qr-labels-${new Date().toISOString().slice(0, 10)}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Print all labels
function printAllLabels() {
    const printWindow = window.open('', '', 'width=800,height=1000');
    printWindow.document.write('<html><head><title>Print QR Labels</title></head><body style="text-align:center;font-family:Segoe UI,Arial,sans-serif;">');
    printWindow.document.write('<h2>Book Labels</h2>');
    const labels = labelGrid.querySelectorAll('.label-preview');
    for (let i = 0; i < labels.length; i++) {
        const canvas = labels[i].querySelector('canvas');
        const info = labels[i].querySelector('.label-info').textContent.replace(/\n/g, ' ');
        // Create a temp canvas for PNG
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = 220;
        tempCanvas.height = 260;
        const ctx = tempCanvas.getContext('2d');
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
        ctx.drawImage(canvas, 50, 20, 120, 120);
        ctx.font = 'bold 16px Segoe UI, Arial';
        ctx.fillStyle = '#222';
        ctx.textAlign = 'center';
        ctx.fillText(labels[i].querySelector('.label-info strong').textContent, tempCanvas.width / 2, 160);
        ctx.font = '14px Segoe UI, Arial';
        const infoLines = info.split(/Owner:|ID:|Notes:/).map(s => s.trim()).filter(Boolean);
        if (infoLines[0]) ctx.fillText(`Owner: ${infoLines[0]}`, tempCanvas.width / 2, 185);
        if (infoLines[1]) ctx.fillText(`ID: ${infoLines[1]}`, tempCanvas.width / 2, 205);
        if (infoLines[2]) {
            ctx.font = 'italic 13px Segoe UI, Arial';
            ctx.fillText(`Notes: ${infoLines[2]}`, tempCanvas.width / 2, 225);
        }
        printWindow.document.write(`<img src="${tempCanvas.toDataURL('image/png')}" style="width:220px;height:260px;margin:8px;"/>`);
    }
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
}

// Event Listeners
qrForm.addEventListener('submit', generateQRGrid);
downloadAllButton.addEventListener('click', downloadAllLabels);
printAllButton.addEventListener('click', printAllLabels);
themeToggle.addEventListener('click', toggleTheme);
colorPicker.addEventListener('input', updateColor);
visibilityToggle.addEventListener('click', toggleVisibility);

// Initialize
loadTheme();
loadColor();
loadVisibility();
qrPreview.style.display = 'none'; 