document.addEventListener('DOMContentLoaded', () => {
    // 2. Platform Switcher Logic
    // Initialize default UI (TikTok)
    renderInstructions('tiktok');
});

// Platform Data
const platformData = {
    tiktok: {
        name: 'TikTok',
        placeholder: 'Tempel tautan TikTok di sini...',
        color: 'var(--tiktok-color)',
        steps: [
            { icon: 'fa-regular fa-copy', title: '1. Salin Tautan', desc: 'Buka aplikasi TikTok, cari video yang Anda inginkan, klik tombol Bagikan, lalu pilih "Salin Tautan".' },
            { icon: 'fa-solid fa-paste', title: '2. Tempel Tautan', desc: 'Kembali ke halaman ini dan tempel tautan yang sudah disalin ke kolom input di atas.' },
            { icon: 'fa-solid fa-download', title: '3. Unduh', desc: 'Klik tombol "Unduh" dan tunggu beberapa saat hingga video siap diunduh tanpa watermark.' }
        ]
    },
    pinterest: {
        name: 'Pinterest',
        placeholder: 'Tempel tautan Pinterest di sini...',
        color: 'var(--pinterest-color)',
        steps: [
            { icon: 'fa-regular fa-copy', title: '1. Salin Tautan', desc: 'Buka Pinterest, temukan video/foto, klik tombol Bagikan, dan pilih "Salin Tautan".' },
            { icon: 'fa-solid fa-paste', title: '2. Tempel Tautan', desc: 'Tempel tautan video/foto Pinterest ke kolom input pada situs web kami.' },
            { icon: 'fa-solid fa-download', title: '3. Unduh', desc: 'Klik tombol "Unduh" untuk memproses media, lalu simpan ke perangkat Anda.' }
        ]
    }
};

function selectPlatform(platform) {
    // 1. Update Buttons
    const btnTiktok = document.getElementById('btn-tiktok');
    const btnPinterest = document.getElementById('btn-pinterest');
    
    if (platform === 'tiktok') {
        btnTiktok.classList.add('active');
        btnPinterest.classList.remove('active');
    } else {
        btnPinterest.classList.add('active');
        btnTiktok.classList.remove('active');
    }

    // 2. Update Input Area
    const urlInput = document.getElementById('url-input');
    const btnDownload = document.getElementById('btn-download');
    
    urlInput.placeholder = platformData[platform].placeholder;
    urlInput.focus();

    // 3. Update Instructions
    document.getElementById('instruction-platform-name').innerText = platformData[platform].name;
    renderInstructions(platform);
}

function renderInstructions(platform) {
    const stepsContainer = document.getElementById('steps-container');
    const steps = platformData[platform].steps;
    const color = platformData[platform].color;
    
    stepsContainer.innerHTML = '';
    
    steps.forEach(step => {
        const stepCard = document.createElement('div');
        stepCard.className = 'step-card';
        stepCard.innerHTML = `
            <i class="${step.icon} step-icon" style="color: ${color}"></i>
            <h3>${step.title}</h3>
            <p>${step.desc}</p>
        `;
        stepsContainer.appendChild(stepCard);
    });
}

// Basic form submission handler for demonstration
document.getElementById('btn-download').addEventListener('click', async () => {
    const url = document.getElementById('url-input').value.trim();
    if(!url) {
        alert("Silakan masukkan tautan video terlebih dahulu!");
        return;
    }

    const btnText = document.getElementById('btn-text');
    const btnSpinner = document.getElementById('btn-spinner');
    const btn = document.getElementById('btn-download');
    const loadingContainer = document.getElementById('loading-container');
    const resultContainer = document.getElementById('result-container');
    
    // UI state: loading
    btn.disabled = true;
    btnText.innerText = 'MEMUAT...';
    btnSpinner.classList.remove('hidden');
    loadingContainer.classList.remove('hidden');
    resultContainer.classList.add('hidden');
    resultContainer.innerHTML = '';
    
    const isPinterest = document.getElementById('btn-pinterest').classList.contains('active');

    try {
        if (isPinterest) {
            // Call our custom Vercel API
            const response = await fetch(`/api/pinterest?url=${encodeURIComponent(url)}`);
            const data = await response.json();
            
            if (data.error) {
                alert(data.error);
            } else {
                renderPinterestResult(data, resultContainer);
            }
        } else {
            // Fetch TikTok data
            const response = await fetch(`https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`);
            const data = await response.json();
            
            if (data.code === 0 && data.data) {
                renderResult(data.data, resultContainer);
            } else {
                alert("Gagal mengambil data video. Pastikan tautan benar atau coba lagi nanti.");
            }
        }
    } catch (error) {
        console.error("Download error:", error);
        alert("Terjadi kesalahan sistem saat mencoba mengunduh.");
    } finally {
        // UI state: reset
        btn.disabled = false;
        btnText.innerText = 'Unduh';
        btnSpinner.classList.add('hidden');
        loadingContainer.classList.add('hidden');
    }
});

function formatBytes(bytes, decimals = 1) {
    if (!+bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

function formatDate(timestamp) {
    if (!timestamp) return '-';
    const d = new Date(timestamp * 1000);
    return d.toISOString().replace('T', ' ').substring(0, 19);
}

function renderResult(data, container) {
    const isPhoto = data.images && data.images.length > 0;
    const itemsCount = isPhoto ? data.images.length : 1;
    
    let html = `<div class="result-header">${itemsCount} FILE MEDIA DITEMUKAN.</div>`;
    html += `<div class="result-grid">`;
    
    const authorName = data.author ? data.author.nickname : 'Unknown';
    const dateStr = formatDate(data.create_time);
    const titleStr = data.title || '-';

    if (isPhoto) {
        data.images.forEach((imgUrl, index) => {
            html += `
            <div class="result-card">
                <div class="result-media">
                    <img src="${imgUrl}" alt="Photo ${index + 1}">
                </div>
                <div class="result-actions">
                    <a href="${imgUrl}" target="_blank" download class="btn-result-download">UNDUH</a>
                </div>
                <div class="result-meta">
                    <h3>Foto ${index + 1}</h3>
                    <div class="meta-row"><span class="meta-label">Penulis</span><span class="meta-value">${authorName}</span></div>
                    <div class="meta-row"><span class="meta-label">Tanggal</span><span class="meta-value">${dateStr}</span></div>
                    <div class="meta-row"><span class="meta-label">Jenis</span><span class="meta-value">image</span></div>
                    <div class="meta-divider"></div>
                    <div class="meta-label">Posting</div>
                    <div class="meta-posting">${titleStr}</div>
                </div>
            </div>`;
        });
    } else {
        // Video
        const size1080 = data.hd_size ? formatBytes(data.hd_size) : 'Unknown';
        const size720 = data.size ? formatBytes(data.size) : 'Unknown';
        const coverUrl = data.cover || '';
        const playUrl = data.play || '';
        const hdUrl = data.hdplay || playUrl;

        html += `
        <div class="result-card">
            <div class="result-media">
                <video src="${playUrl}" poster="${coverUrl}" controls></video>
            </div>
            <div class="result-actions">
                <a href="${hdUrl}" target="_blank" class="btn-result-download">UNDUH 1080p - ${size1080}</a>
                <a href="${playUrl}" target="_blank" class="btn-result-download" style="background-color: #333;">UNDUH 720p - ${size720}</a>
            </div>
            <div class="result-meta">
                <h3>Video 1</h3>
                <div class="meta-row"><span class="meta-label">Penulis</span><span class="meta-value">${authorName}</span></div>
                <div class="meta-row"><span class="meta-label">Tanggal</span><span class="meta-value">${dateStr}</span></div>
                <div class="meta-row"><span class="meta-label">Jenis</span><span class="meta-value">video</span></div>
                <div class="meta-divider"></div>
                <div class="meta-label">Posting</div>
                <div class="meta-posting">${titleStr}</div>
            </div>
        </div>`;
    }
    
    html += `</div>`;
    container.innerHTML = html;
    container.classList.remove('hidden');
}

// Paste from Clipboard
async function pasteFromClipboard() {
    try {
        const text = await navigator.clipboard.readText();
        const urlInput = document.getElementById('url-input');
        urlInput.value = text;
        urlInput.focus();
    } catch (err) {
        console.error('Failed to read clipboard contents: ', err);
        alert('Gagal menempelkan teks. Pastikan Anda memberikan izin akses clipboard pada browser.');
    }
}

function renderPinterestResult(data, container) {
    let html = `<div class="result-header">1 FILE MEDIA DITEMUKAN.</div>`;
    html += `<div class="result-grid">`;
    
    html += `
    <div class="result-card">
        <div class="result-media">
            ${data.type === 'video' ? `<video src="${data.mediaUrl}" controls></video>` : `<img src="${data.mediaUrl}" alt="Pinterest Image">`}
        </div>
        <div class="result-actions">
            <a href="/api/download?url=${encodeURIComponent(data.mediaUrl)}" download class="btn-result-download">UNDUH ${data.type.toUpperCase()}</a>
        </div>
        <div class="result-meta">
            <h3>Pinterest ${data.type === 'video' ? 'Video' : 'Foto'}</h3>
            <div class="meta-row"><span class="meta-label">Penulis</span><span class="meta-value">${data.author}</span></div>
            <div class="meta-row"><span class="meta-label">Jenis</span><span class="meta-value">${data.type}</span></div>
            <div class="meta-divider"></div>
            <div class="meta-label">Judul</div>
            <div class="meta-posting">${data.title}</div>
        </div>
    </div>`;
    
    html += `</div>`;
    container.innerHTML = html;
    container.classList.remove('hidden');
}

// FAQ Accordion Logic
document.addEventListener('DOMContentLoaded', () => {
    const faqQuestions = document.querySelectorAll('.faq-question');
    
    faqQuestions.forEach(question => {
        question.addEventListener('click', () => {
            const faqItem = question.parentElement;
            
            // Toggle current item
            faqItem.classList.toggle('active');
            
            // Optional: Close other open items
            // faqQuestions.forEach(otherQuestion => {
            //     if (otherQuestion !== question) {
            //         otherQuestion.parentElement.classList.remove('active');
            //     }
            // });
        });
    });
});
