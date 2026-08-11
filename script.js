// script.js - Güncellenmiş ve Sağlamlaştırılmış Kod

const imageLoader = document.getElementById('imageLoader');
const chartImage = document.getElementById('chartImage');
const mapContainer = document.getElementById('map-container');
const resetBtn = document.getElementById('resetBtn');
const infoArea = document.getElementById('info-area');

// --- 1. SAYFA YÜKLENDİĞİNDE KAYDEDİLMİŞ VERİLERİ GERİ GETİR ---
window.onload = function() {
    const savedData = localStorage.getItem('pifChartData');
    if (savedData) {
        try {
            const data = JSON.parse(savedData);
            if (data.image && data.image !== '') {
                chartImage.src = data.image;
                chartImage.style.display = 'block';
                infoArea.innerHTML = '<i class="bi bi-check-circle-fill text-success"></i> Kaydedilmiş chart yüklendi.';
                // Kaydedilmiş pinleri ekrana çiz
                if (data.pins && Array.isArray(data.pins)) {
                    data.pins.forEach(pinData => {
                        createPin(pinData.x, pinData.y, pinData.note);
                    });
                }
                // Pin sayısını göster
                updatePinCount();
            }
        } catch (e) {
            console.error('Veri yükleme hatası:', e);
            localStorage.removeItem('pifChartData');
        }
    }
};

// --- 2. VERİLERİ LOCALSTORAGE'A KAYDETME ---
function saveToLocalStorage() {
    const pins = [];
    document.querySelectorAll('.pin').forEach(pin => {
        pins.push({
            x: pin.style.left,
            y: pin.style.top,
            note: pin.title
        });
    });

    const data = {
        image: chartImage.src,
        pins: pins
    };

    try {
        localStorage.setItem('pifChartData', JSON.stringify(data));
        updatePinCount();
    } catch (e) {
        console.warn('Kaydetme hatası (resim çok büyük olabilir):', e);
        alert('Uyarı: Yüklediğiniz resim çok büyük olabilir, bu nedenle veriler kaydedilemedi. Lütfen daha küçük boyutlu bir resim yüklemeyi deneyin.');
    }
}

// --- 3. PIN OLUŞTURMA VE YÖNETİMİ ---
function createPin(x, y, note) {
    const pin = document.createElement('div');
    pin.className = 'pin';
    pin.style.left = x;
    pin.style.top = y;
    pin.title = note;

    // Pine tıklama olayı: Notu göster ve silme seçeneği sun
    pin.addEventListener('click', function(e) {
        e.stopPropagation(); // Tıklamanın altındaki haritaya gitmesini engelle

        if (confirm(`📍 Pin Notu:\n\n"${note}"\n\nBu pini silmek istiyor musunuz?`)) {
            this.remove(); // Pini DOM'dan kaldır
            saveToLocalStorage(); // Yeni durumu kaydet
        }
    });

    mapContainer.appendChild(pin);
    return pin;
}

// --- 4. YENİ RESİM YÜKLEME ---
imageLoader.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;

    // Sadece resim dosyalarını kontrol et
    if (!file.type.startsWith('image/')) {
        alert('Lütfen geçerli bir resim dosyası seçin (JPG, PNG).');
        this.value = ''; // Input'u temizle
        return;
    }

    const reader = new FileReader();
    reader.onload = function(event) {
        // Eski pinleri temizle
        document.querySelectorAll('.pin').forEach(pin => pin.remove());
        
        chartImage.src = event.target.result;
        chartImage.style.display = 'block';
        
        infoArea.innerHTML = `<i class="bi bi-check-circle-fill text-success"></i> "${file.name}" yüklendi. Resme tıklayarak pin ekleyin.`;
        
        // Yeni resmi ve boş pin listesini kaydet
        saveToLocalStorage();
    };
    
    reader.onerror = function() {
        alert('Dosya okunurken bir hata oluştu. Lütfen tekrar deneyin.');
    };
    
    reader.readAsDataURL(file);
    // Input'u temizle, aynı dosya tekrar seçilebilsin diye
    this.value = '';
});

// --- 5. HARİTAYA TIKLAYARAK PIN EKLEME ---
mapContainer.addEventListener('click', function(e) {
    // Eğer resim görünmüyorsa veya tıklanan yer pin ise işlem yapma
    if (chartImage.style.display === 'none') {
        infoArea.innerHTML = '<i class="bi bi-info-circle text-warning"></i> Lütfen önce bir chart yükleyin.';
        return;
    }
    if (e.target.classList.contains('pin')) return;
    // Eğer tıklanan yer resmin dışındaysa (örnek: boş alan) işlemi engelle
    if (e.target.id !== 'chartImage' && e.target.id !== 'map-container') return;

    // Tıklanan yerin koordinatlarını hesapla (mapContainer'a göre)
    const rect = mapContainer.getBoundingClientRect();
    // Resim boyutlarına göre oranlama yapmak daha doğru olur, ama basitlik için direk piksel kullanıyoruz.
    // Ancak pinin tam olarak tıklanan yere denk gelmesi için:
    const x = (e.clientX - rect.left) + 'px';
    const y = (e.clientY - rect.top) + 'px';

    const note = prompt("Bu noktaya eklemek istediğiniz bilgi veya yorum nedir? (Örn: VOR, Waypoint, Not)");

    if (note && note.trim() !== '') {
        createPin(x, y, note.trim());
        saveToLocalStorage(); // Yeni pini kaydet
        infoArea.innerHTML = `<i class="bi bi-pin-fill text-danger"></i> Yeni pin eklendi: "${note.trim()}"`;
    } else if (note !== null) {
        // Kullanıcı 'İptal' değil de boş girdi gönderdiyse
        alert('Not girilmediği için pin eklenmedi.');
    }
});

// --- 6. SİSTEMİ SIFIRLAMA ---
resetBtn.addEventListener('click', function() {
    if (confirm('Tüm pinleri ve yüklenen chart\'ı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.')) {
        // Pinleri temizle
        document.querySelectorAll('.pin').forEach(pin => pin.remove());
        // Resmi temizle
        chartImage.src = '';
        chartImage.style.display = 'none';
        // LocalStorage'ı temizle
        localStorage.removeItem('pifChartData');
        // Bilgi alanını güncelle
        infoArea.innerHTML = '<i class="bi bi-arrow-counterclockwise"></i> Sistem sıfırlandı. Yeni bir chart yükleyebilirsiniz.';
        // Input'u temizle
        imageLoader.value = '';
        updatePinCount();
    }
});

// --- 7. YARDIMCI FONKSİYONLAR ---
function updatePinCount() {
    const pinCount = document.querySelectorAll('.pin').length;
    if (pinCount > 0 && chartImage.style.display !== 'none') {
        const infoText = document.querySelector('#info-area');
        if (infoText && !infoText.innerHTML.includes('Pin sayısı')) {
            // Bilgi alanını güncelle ama mevcut mesajı bozma
            const existingText = infoText.innerHTML;
            if (!existingText.includes('Pin sayısı')) {
                infoText.innerHTML = existingText + ` | <span class="badge bg-danger">${pinCount} pin</span>`;
            }
        }
    }
}

// Pin sayısını güncellemek için bir gözlemci ekleyelim (MutationObserver)
// Basit bir çözüm: Her kaydetmede güncelle.
// saveToLocalStorage içinde zaten updatePinCount() çağrılıyor.
