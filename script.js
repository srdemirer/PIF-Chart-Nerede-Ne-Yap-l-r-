const imageLoader = document.getElementById('imageLoader');
const chartImage = document.getElementById('chartImage');
const mapContainer = document.getElementById('map-container');

// 1. Sayfa yüklendiğinde eski verileri getir
window.onload = function() {
    const savedData = localStorage.getItem('chartData');
    if (savedData) {
        const data = JSON.parse(savedData);
        chartImage.src = data.image;
        chartImage.style.display = 'block';
        
        // Kaydedilmiş pinleri ekrana çiz
        data.pins.forEach(pinData => {
            createPin(pinData.x, pinData.y, pinData.note);
        });
    }
};

// 2. Pinleri ve Resmi Tarayıcıya Kaydetme Fonksiyonu
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
    
    // Resim çok büyükse (Tarayıcı sınırı genelde 5MB'dır) hata vermemesi için önlem alıyoruz
    try {
        localStorage.setItem('chartData', JSON.stringify(data));
    } catch (e) {
        alert("Uyarı: Yüklediğiniz resim tarayıcı belleğine sığamayacak kadar büyük. Pinleriniz sayfayı yenileyince silinebilir. Lütfen daha düşük boyutlu bir resim yükleyin.");
    }
}

// 3. Pin Oluşturma ve Silme Fonksiyonu
function createPin(x, y, note) {
    const pin = document.createElement('div');
    pin.className = 'pin';
    pin.style.left = x;
    pin.style.top = y;
    pin.title = note;
    
    // Pine tıklandığında ne olacak?
    pin.addEventListener('click', function(e) {
        e.stopPropagation(); // Tıklamanın haritaya (alta) geçmesini engeller
        
        // Kullanıcıya notu göster ve silmek isteyip istemediğini sor
        if(confirm("📍 Pin Notu:\n\n" + note + "\n\nBu pini silmek ister misiniz?")) {
            pin.remove(); // Pini ekrandan sil
            saveToLocalStorage(); // Yeni durumu kaydet (silinmiş haliyle)
        }
    });

    mapContainer.appendChild(pin);
}

// 4. Yeni Resim Yükleme İşlemi
imageLoader.addEventListener('change', function(e) {
    const reader = new FileReader();
    reader.onload = function(event) {
        chartImage.src = event.target.result;
        chartImage.style.display = 'block';
        
        // Yeni resim yüklendiğinde eski pinleri temizle
        document.querySelectorAll('.pin').forEach(pin => pin.remove());
        saveToLocalStorage(); // Yeni boş resmi kaydet
    }
    if(e.target.files[0]) {
        reader.readAsDataURL(e.target.files[0]);
    }
});

// 5. Haritaya Tıklayınca Pin Ekleme
mapContainer.addEventListener('click', function(e) {
    if(chartImage.style.display === 'none') return;
    if(e.target.classList.contains('pin')) return;

    const rect = mapContainer.getBoundingClientRect();
    const x = (e.clientX - rect.left) + 'px';
    const y = (e.clientY - rect.top) + 'px';

    const note = prompt("Bu noktaya (Intersection/Waypoint/VOR) eklemek istediğiniz bilgi veya yorum nedir?");
    
    if (note) {
        createPin(x, y, note);
        saveToLocalStorage(); // Yeni pini kaydet
    }
});
