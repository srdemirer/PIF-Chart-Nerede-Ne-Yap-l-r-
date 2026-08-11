const imageLoader = document.getElementById('imageLoader');
const chartImage = document.getElementById('chartImage');
const mapContainer = document.getElementById('map-container');

// 1. Resim Yükleme İşlemi
imageLoader.addEventListener('change', function(e) {
    const reader = new FileReader();
    reader.onload = function(event) {
        chartImage.src = event.target.result;
        chartImage.style.display = 'block';
        // Yeni resim yüklendiğinde eski pinleri temizle
        document.querySelectorAll('.pin').forEach(pin => pin.remove());
    }
    reader.readAsDataURL(e.target.files[0]);
});

// 2. Resme Tıklayınca Pin Ekleme
mapContainer.addEventListener('click', function(e) {
    // Sadece resim yüklüyse ve resme tıklandıysa çalış
    if(chartImage.style.display === 'none') return;

    // Eğer tıklanan şey zaten bir pin ise yeni pin ekleme, sadece notu göster
    if(e.target.classList.contains('pin')) return;

    // Tıklanan yerin koordinatlarını hesapla
    const rect = mapContainer.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Kullanıcıya notunu sor
    const note = prompt("Bu noktaya (Intersection/Waypoint/VOR) eklemek istediğiniz bilgi veya yorum nedir?");
    
    if (note) {
        // Pin elementini oluştur
        const pin = document.createElement('div');
        pin.className = 'pin';
        pin.style.left = x + 'px';
        pin.style.top = y + 'px';
        pin.title = note; // Fareyi üzerine getirince küçük baloncukta notu gösterir
        
        // Pine tıklayınca notu uyarı mesajı olarak göster
        pin.addEventListener('click', function() {
            alert("📍 Pin Notu:\n\n" + note);
        });

        // Pini haritaya ekle
        mapContainer.appendChild(pin);
    }
});
