const imageLoader = document.getElementById('imageLoader');
const chartImage = document.getElementById('chartImage');
const mapContainer = document.getElementById('map-container');
const clearBtn = document.getElementById('clear-btn');

// 1. Sayfa yüklendiğinde eski verileri getir
window.onload = function() {
    const savedData = localStorage.getItem('chartData');
    if (savedData) {
        const data = JSON.parse(savedData);
        chartImage.src = data.image;
        mapContainer.style.display = 'inline-block';
        clearBtn.style.display = 'block';
        
        data.pins.forEach(pinData => {
            createPin(pinData.x, pinData.y, pinData.note);
        });
    }
};

// 2. Verileri Tarayıcıya Kaydetme Fonksiyonu
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
        localStorage.setItem('chartData', JSON.stringify(data));
    } catch (e) {
        alert("Uyarı: Resim boyutu tarayıcı sınırı için çok büyük. Pinler kaydedilemeyebilir.");
    }
}

// 3. Pin Oluşturma Fonksiyonu
function createPin(x, y, note) {
    const pin = document.createElement('div');
    pin.className = 'pin';
    pin.style.left = x; // Bu değer artık % olarak gelecek
    pin.style.top = y;  // Bu değer artık % olarak gelecek
    pin.title = note;
    
    pin.addEventListener('click', function(e) {
        e.stopPropagation();
        if(confirm("📍 Pin Notu:\n\n" + note + "\n\nBu pini silmek ister misiniz?")) {
            pin.remove();
            saveToLocalStorage();
        }
    });

    mapContainer.appendChild(pin);
}

// 4. Resim Yükleme İşlemi
imageLoader.addEventListener('change', function(e) {
    if(!e.target.files[0]) return;
    
    const reader = new FileReader();
    reader.onload = function(event) {
        chartImage.src = event.target.result;
        mapContainer.style.display = 'inline-block';
        clearBtn.style.display = 'block';
        
        document.querySelectorAll('.pin').forEach(pin => pin.remove());
        saveToLocalStorage();
    }
    reader.readAsDataURL(e.target.files[0]);
});

// 5. Haritaya Tıklayınca Pin Ekleme (Yüzdelik Koordinat ile Responsive Uyum)
mapContainer.addEventListener('click', function(e) {
    if(e.target.classList.contains('pin')) return;

    const rect = mapContainer.getBoundingClientRect();
    
    // Tıklanılan yerin resim üzerindeki % konumunu hesapla
    const xPercent = ((e.clientX - rect.left) / rect.width) * 100;
    const yPercent = ((e.clientY - rect.top) / rect.height) * 100;

    const x = xPercent + '%';
    const y = yPercent + '%';

    const note = prompt("Bu noktaya eklemek istediğiniz bilgi veya yorum nedir?");
    
    if (note) {
        createPin(x, y, note);
        saveToLocalStorage();
    }
});

// 6. Sistemi Sıfırlama (Her şeyi temizler)
clearBtn.addEventListener('click', function() {
    if(confirm("Tüm pinleri ve chart resmini silmek istediğinize emin misiniz?")) {
        localStorage.removeItem('chartData');
        document.querySelectorAll('.pin').forEach(pin => pin.remove());
        chartImage.src = "";
        mapContainer.style.display = 'none';
        clearBtn.style.display = 'none';
        imageLoader.value = ""; 
    }
});
