# FinCoach AI - Kapsamlı Proje ve Teknik Detay Dokümanı

**FinCoach AI**, yalnızca gelir-gider takibi yapan standart bir finans uygulamasının ötesine geçerek; davranışsal iktisat teorilerini, modern yapay zeka yaklaşımlarını, blokzincir (blockchain) teknolojilerini ve otonom ajan (multi-agent) sistemlerini birleştiren **yeni nesil kurumsal düzeyde bir "Finansal Zeka ve Davranışsal Yaşam Koçu"** platformudur.

Kullanıcının harcama psikolojisini anlar, biyometrik ve işlemsel verilerle dürtüsel (impulse) harcamaları engeller, fonlarını DeFi ve Escrow akıllı sözleşmeleriyle güvence altına alır ve verilerini %100 gizlilik ilkesiyle işler.

Aşağıda projede yer alan **istisnasız tüm özellikler, kullanılan algoritmalar ve matematiksel modeller** en ince ayrıntısına kadar listelenmiştir.

---

## 1. YAPAY ZEKA VE MAKİNE ÖĞRENMESİ ALGORİTMALARI

### 1.1. Federated Learning (Gizlilik Odaklı İşbirlikçi Öğrenme)
Kullanıcıların finansal verileri cihaz dışına çıkmadan yerel (local) olarak eğitilir.
*   **Çalışma Mantığı:** İşlem geçmişi TensorFlow.js (TF.js) ile kullanıcının kendi cihazında (RAM'de) işlenir. (Zero Data Egress - Ham veri dışarı çıkmaz).
*   **Differential Privacy (Ayrıcalıklı Gizlilik):** Çıkarılan model ağırlıklarına "Laplace Gürültüsü" eklenerek (ε=0.1) tersine mühendislikle kişisel verilerin bulunması engellenir.
*   **E2EE Ağırlık Paylaşımı:** Sadece 4.2 KB boyutundaki model ağırlıkları AES-256 ile şifrelenip bulut sunucuda global modelin (Aggregation) ortalamasına katılır.

### 1.2. Otonom Ajan Sürüsü (Multi-Agent AI Swarm)
Kullanıcı büyük bir alım yapmak istediğinde (örneğin 24.999 ₺ değerinde kulaklık) devreye giren "Yapay Zeka Yönetim Kurulu".
1.  **CFO (Risk Ajanı):** Nakit akışını ve asgari ödeme krizlerini analiz eder. Nakit eksiye düşecekse RED verir.
2.  **Yatırımcı (Fırsat Ajanı):** Enflasyon oranını ve paranın zaman değerini hesaplar. Malın zamlanma ihtimaline karşı ONAY verebilir.
3.  **Psikolog Ajan:** Kullanıcının dürtüsel geçmişini ve hiperbolik indirgeme analizini yapar. (Aşağıda detaylandırılmıştır).
4.  **Hakem/Orkestratör Ajan:** Tüm görüşleri sentezler ve kesin kararı verir (Örn: "Reddedildi! 7 Gün Soğuma kuralı devreye alındı" veya "6 Taksitle ONAY").

### 1.3. Davranışsal İktisat Motoru ve Hiperbolik İndirgeme
İnsan beyninin anlık zevkleri gelecekteki mantıklı getirilerden üstün tutmasını matematiksel olarak analiz eder.
*   **Formül:** `V = A / (1 + kD)` (Gelecekteki değerin insan beynindeki öznel indirgenmesi)
*   **İrrasyonalite Skoru:** Olası harcamanın 5 yıllık potansiyel yatırım (Yıllık ~%8 ROI) değeri hesaplanıp, kullanıcının bu parayı "şimdi" harcama güdüsü arasındaki fark ile 0-100 arası bir **Mantıksızlık Skoru** hesaplanır.
*   **Sunk Cost Fallacy (Batık Maliyet Yanılgısı) Dedektörü:** Tamirci/Sanayi/Servis anahtar kelimeleriyle taranan işlemlerde, sürekli masraf çıkaran bir kaleme sırf önceden para harcandı diye para aktarılmaya devam edilip edilmediğini bulur.

### 1.4. Apriori Algoritması (Market Basket & Zincirleme Analizi)
Harcamalar arasındaki gizli bağıntıları bulur. (Örn: A mağazasına gidildikten sonra %80 ihtimalle B mağazasına gidiliyor).
*   **Sequential Pattern Mining (48 Saatlik Pencere):** İşlemler zaman sırasına dizilir, ardışık 48 saat içindeki harcamalar arası "Edge" (Bağlantı/Düğüm) oluşturulur. D3 tarzı Force Layout (Çembersel Node) yapısı ile ekranda görselleştirilir.
*   **Toksik Döngü (Dopamin Zinciri) Tespiti:** AI, bu düğümleri analiz ederek kesilmesi gereken ana harcamayı bulur (Kelebek Etkisi ile tasarruf sağlar).

### 1.5. İzolasyon Ormanı (Isolation Forest) ile Anomali (Fraud) Tespiti
Gözetimsiz makine öğrenimi (Unsupervised ML) kullanılarak aykırı harcamalar mili-saniyeler içinde tespit edilir.
*   Kullanıcının rutin harcama paternleri 3 ana kümeye ayrılır (Sabah rutini, Öğle harcaması, Akşam yemeği).
*   Algoritma, Z-Axis (3. boyut) dahil edilerek saati (Örn 03:30), işlem tutarını (Standart sapmanın 12x üzeri) ve lokasyonu test eder.
*   Anomali tespit edilirse sanal cüzdan anında **Kilitlenir** ve "Donduruldu" uyarısı verir.

### 1.6. RAG Engine (Retrieval-Augmented Generation) & Pinecone Vektör DB
Sohbet botuna sorulan sorular, doğrudan basit bir LLM (Gemini 2.5 Flash) ile cevaplanmaz.
1.  Kullanıcının sorusu Vektör Uzayına (Embedding) çevrilir.
2.  **Pinecone DB** üzerinde son 5 yılın verileri taranıp bağlam (Context) yaratılır.
3.  LLM bu bağlamı alıp sıfır halüsinasyonla kişiselleştirilmiş bir tavsiye oluşturur.

### 1.7. K-Means Tabanlı Harcama Kişiliği Tespiti
İşlem verilerinden 4 boyutlu bir vektör oluşturulur: `[Hafta Sonu Oranı, Tasarruf Oranı, Tekrarlayan Harcama Oranı, Dürtüsel Harcama Skoru]`
*   Önceden eğitilmiş merkez noktalarına (Centroids) göre **Öklid Mesafesi (Euclidean Distance)** hesaplanır.
*   Kullanıcı 5 profilden birine atanır: *Anlık Zevk Takipçisi, Planlayıcı, Tasarruf Ustası, Dürtüsel Alışverişçi, Dengeli Harcayan*.

### 1.8. EWMA (Ağırlıklı Üstel Tahmin) ve Prophet Tabanlı Nakit Akışı Modeli
Geleceği tahmin etmek ve kullanıcıyı önceden uyarmak için kullanılır.
*   **EWMA Modeli:** Son 7 günün harcamalarına yüksek ağırlık verecek şekilde (Alpha = 0.6) çürüme (decay) hesaplaması yapar. Hafta sonu etkisi (1.4x Multiplier) dahil edilerek "Ay sonu bakiyesi" tahmin edilir.
*   Kullanıcı eksiye düşecekse, bütçeyi en çok delen kategoriyi bulup "Bunu %20 azaltırsan kurtarırsın" şeklinde eyleme dökülebilir tavsiyeler üretir.

---

## 2. TEMEL SİSTEM ÖZELLİKLERİ VE MODÜLLER

### 2.1. Finansal Sağlık Skoru (Health Score)
Toplam 100 puan üzerinden dinamik olarak hesaplanan karne sistemi. Puanlama ağırlıkları kullanıcının hedefine (Takip, Birikim, Tasarruf) göre dinamik olarak değişir. Metrikler:
*   **Bütçe Uyumu:** Kategori bazlı belirlenen bütçe limitlerine ne kadar uyulduğu.
*   **Tasarruf Oranı:** Aylık gelir/gider üzerinden artırılan yüzde.
*   **Düzenlilik:** Harcamaların haftalara göre varyansı / **Standart Sapması**.
*   **İyileşme Trendi:** Bir önceki aya göre gerçekleşen küçülme veya iyileşme oranı.

### 2.2. Akıllı Abonelik Tespit Motoru (Subscription Detector)
Gelen kredi kartı ekstreleri veya manuel işlemler taranarak kullanıcının unuttuğu abonelikler (Netflix, Gym vb.) bulunur.
*   **Fuzzy String Matching:** Şirket adlarındaki ".com, ltd, tr, pos" gibi ekler ve numaralar regex ile temizlenerek mağaza isimleri eşitlenir.
*   **Zaman Aralığı Analizi:** Ardışık ödemeler arasında ~30 gün (±7 gün tolerans) ve tutarlarda ±%10 sapma toleransı aranır. En az 2 kez tekrarladıysa abonelik listesine atılır ve yaklaşan ödeme günü (Örn: Bu Cuma) uyarısı verilir.

### 2.3. Anti-Dürtü Kalkanı (Biyometrik Modal)
Gece yarısı veya yüksek tutarlı şüpheli bir harcama tespit edildiğinde araya girer.
*   Cihaz kamerasına erişim yetkisi (simüle edilmiş) isteyerek kullanıcının biyometrik verilerini (Kalp atış hızı, Gözbebeği büyümesi, Mikro-mimikler) tarar.
*   Kullanıcıda stres veya **"Dopamine-hunting" (Dopamin avcılığı/terapisi alışverişi)** tespit ederse, işlemi bloke eder.
*   **24 Saat Soğuma (Cool-off) Kasası:** Harcama için ayrılan parayı 24 saat kilitler, işlemi reddeder (Kullanıcı "zorla onayla" demedikçe).

### 2.4. Paralel Evren Simülatörü (Zaman Makinesi - Kelebek Etkisi)
Bir eşyayı "almak" veya "yatırım yapmak" arasındaki farkı canlandırır.
*   Kullanıcı alacağı ürünü ve fiyatını yazar (Örn: iPhone 16 Pro Max - 80.000 ₺).
*   Sistem zaman çizgisini (Timeline) iki evrene ayırır:
    *   **Evren A:** Ürün alınır, elektronik ürünlerdeki amansız değer kaybı (Depreciation) uygulanarak 5-10 yıl sonraki çöp değeri hesaplanır.
    *   **Evren B:** O para anında S&P 500 & Teknoloji fonlarına atılır (Yıllık ortalama büyüme ile bileşik faiz hesaplanır).
*   Recharts ile iki evrenin 10 yıllık ayrışma grafiği etkileyici şekilde sunulur.

### 2.5. Küsürat Kumbarası (DeFi Micro-Investing)
*   Yapılan harcamalar yukarı doğru yüzlüğe veya onluğa yuvarlanır (Örn: 145 ₺ -> 200 ₺). Aradaki 55 ₺ küsürat kumbaraya atılır.
*   **Gerçek Zamanlı Simülasyon:** Bu küsüratlar arkada Aave, Compound, Uniswap gibi DeFi protokollerine atılmış gibi simüle edilir. Saniyede bir artan canlı APY getirisi ve Terminal arayüzünde dönen sahte Smart Contract logları (Routing, Swapping, Staking) gösterilir.

### 2.6. Sesli Blockchain Emanet Sistemi (Escrow Smart Contract)
Doğal Dil İşleme (NLP) ile koşullu ödemeler yaratılır.
*   **Ses Tanıma:** Web Speech API kullanılarak kullanıcının söyledikleri dinlenir ("Ali'ye 1000 lira at ama projeyi verirse gitsin").
*   **NLP Ayrıştırma:** Alıcı, Meblağ, Süre ve Koşul NLP ile ayrıştırılır.
*   **Solidity Derleme:** Dinamik olarak Ethereum Smart Contract (`ConditionalEscrow`) Solidity kodu üretilir ve terminalden ağa deploy edilme süreci simüle edilir. Para şart gerçekleşene kadar (Oracle Verification) kitlenir.

### 2.7. Acil Durum Fonu (Zero-Trust & Oracle)
Kullanıcı belirlediği yüksek bir bakiyeyi kilitler (Örn: 120.000 ₺).
*   Bu para sadece **Hastane/Sağlık** veya kaza raporu olursa çekilebilir.
*   Kullanıcı parayı çekmeyi denediğinde sistem **"E-Devlet & Hastane" Oracle API**'sini sorguladığını simüle eder. Eğer sağlık raporu yoksa, işlemi kesin bir dille reddeder ve parayı sahibine karşı korur.

### 2.8. Finansal Sarmal (Spotify Wrapped Benzeri AI Roast)
Yapay zeka tüm verileri okuyarak, yıl sonu (veya anlık) eğlenceli ve iğneleyici bir analiz sunar.
*   **Roast Mode:** Kullanıcıya karşı "acımasız" dürüstlük modudur.
*   Kullanıcının "En Büyük Günahı"nı (Örn: Yemek siparişleri) bulup, bununla ilgili sarkastik bir metin üretir ve renkli, sosyal medyada paylaşılabilir (Web Share API) bir kart çıkartır.

### 2.9. Otonom Ajan Aksiyonları (Headless Browser)
AI'ın sadece tavsiye vermekle kalmayıp sizin yerinize aksiyon alması. (Örn: "Netflix'i İptal Et").
*   Chat üzerinden verilen komutla, AI arka planda sanal bir tarayıcı açtığını (Headless Browser), form doldurduğunu ve üyeliği iptal ettiğini simüle eden bir animasyon gösterir.

### 2.10. Gelişmiş Mimari Monitörü (System Monitor Topology)
Tüm sistemin arkada nasıl çalıştığını canlı (Hackathon/Sunum modunda) gösteren devasa monitör sayfası.
*   **Sistem Topolojisi:** Banka API -> Apache Kafka Event Broker -> (Paralel olarak) İzolasyon Ormanı, Prophet, Pinecone RAG düğümlerine veri aktarımının ışıklı yollar ve "Event" bazlı animasyonları.
*   **Zero-Trust ve RLS (Row-Level Security):** AES-256 E2EE şifreleme ile CTO'nun bile verileri göremediğine vurgu yapar.
*   **Edge Computing (Cloudflare Workers):** Gecikmeyi 4ms'e indiren Sınır Bilişim simülasyonu.
*   **Snowflake Veri Gölü & dbt (Data Build Tool):** Ham verilerin yapay zeka modelleri için eğitim setlerine (ETL) dönüştürülme sürecini raporlayan gösterge.

### 2.11. Robo-Danışman ve Modern Portföy Teorisi (Markowitz)
Hedeflere ulaşmak için gereken optimal varlık dağılımını (Asset Allocation) hesaplar.
*   **Etkin Sınır (Efficient Frontier):** Rastgele binlerce portföy dağılımı (Teknoloji Hissesi, Kripto, Altın, Tahvil) simüle edilerek hedeflenen getiriye karşılık gelen en düşük riskli "Optimum Portföy" noktası bulunur.
*   **Makro-Ekonomik NLP Duygu Analizi:** Reuters ve Bloomberg haber başlıkları NLP ile taranarak Fear & Greed (Korku ve Açgözlülük) endeksi çıkarılır. Piyasa aşırı stresliyse algoritma riskli varlıklara geçişi engeller.

### 2.12. Makroekonomik Stres Testi (Monte Carlo Simülasyonu)
Kullanıcının mevcut finansal durumunun olası krizlere karşı direncini test eder.
*   **Kriz Senaryoları:** Baz Senaryo, Resesyon, Kur Şoku ve "Kıyamet Senaryosu".
*   **Monte Carlo Algoritması:** Kıyamet senaryosunda 10.000 iterasyonla yapay zeka hiper-enflasyon, işsizlik ve ani kira artışlarını çaprazlayarak kullanıcının acil durum fonuyla sıfır gelirde kaç gün hayatta kalabileceğini (Survival Runway) milisaniyeler içinde hesaplar.

### 2.13. Yapay Zeka Destekli Borç Yapılandırma
Kredi ve kredi kartı borçlarını en hızlı ve psikolojik olarak en uygun şekilde eritmeyi sağlayan algoritmalar.
*   **Kartopu (Snowball) Stratejisi:** Borçları bakiyelerine göre küçükten büyüğe sıralar. Kullanıcıyı motive etmek için en küçük borcu önce kapatmaya odaklar.
*   **Çığ (Avalanche) Stratejisi:** Matematiksel olarak en kârlı yöntemdir. Borçları faiz oranına göre büyükten küçüğe sıralayarak faiz yükünü minimize eder.

### 2.14. Vergi Optimizasyon Motoru
Freelancer ve çalışanların giderleştirebileceği kalemleri analiz ederek tasarruf potansiyeli yaratır.
*   Kullanıcının geçmiş harcamalarını tarar, ulaşım, yemek, iletişim gibi giderleştirilebilir (Deductible) harcamaları ayırır.
*   Tahmini vergi iadesi/tasarrufunu hesaplar ve anında profesyonel, kurum formatında **jsPDF** destekli bir PDF rapor çıktısı oluşturur.

### 2.15. Sosyal Bulaşma (Peer Contagion) Dedektörü
Tasarruf Ligi'ndeki rekabeti ve arkadaş etkileşimlerini analiz eder.
*   **Lifestyle Inflation (Yaşam Tarzı Enflasyonu) Tespiti:** Bir kullanıcının harcamaları aniden artarsa, yapay zeka bunun gelir artışından mı yoksa ligdeki rakibinin/arkadaşının harcama desenlerine öykünmekten mi kaynaklandığını analiz eder (Korelasyon hesabı). Sosyal baskıyla (Peer Pressure) para harcandığı saptanırsa uyarı verir.

### 2.16. Freelancer Gelir Dengeleyici (Income Smoothing)
Serbest meslek sahipleri (freelancerlar ve esnaflar) için aydan aya değişen oynak "Stresli Gelirleri" analiz eder.
*   Geçmiş 6 aylık gelirleri inceleyip güvenli bir **Sabit Maaş** (ortalamanın %85'i) belirler.
*   Aylık gelir bu sınırın üstüne çıktığında aradaki farkı otomatik olarak "Yedek Tampon Kasaya" (Buffer/Vault) atarak durgun geçen aylar için kalkan oluşturur.

### 2.17. Yapay Zeka Gayrimenkul ve Mortgage Analisti
Kullanıcının ev/kredi alma gücünü finansal durumuna göre inceler.
*   **Debt-to-Income (DTI) Testi:** Alınmak istenen evin peşinatı, vadesi ve faiz oranı hesaplanarak aylık taksitlerin mevcut geliri (DTI) yüzde kaç oranında ezdiği bulunur. 
*   Bütçeyi sarsacak (%55+ DTI) kararlarda algoritma alımı kesin dille **REDDEDER**, %40-55 arasında uyarı verir. Amortisman takvimi ile ödenen gizli faizleri görselleştirir.

### 2.18. UI/UX & Tasarım Kalitesi
*   **TailwindCSS V3 ile Tasarım Sistemi:** Cam efekti (Glassmorphism), neon parlamalar, lineer degradeler (Gradients).
*   Dinamik Recharts kullanımı (Area, Line, Bar, Scatter ve 3D görünümlü Pie chartlar).
*   Pulse, shake, matrix-bg, scanline ve SVG force layout gibi üst düzey CSS animasyonları.

---
**Sonuç:** FinCoach AI, standart CRUD işlemlerinin ve basit grafiklerin çok ötesine geçerek; Dağıtık Sistem Mimarisi, Makine Öğrenmesi (NLP, Clustering, Anomaly Detection), Davranışsal İktisat Teorileri ve Web3 konseptlerinin kusursuz bir senfonisi halinde çalışan uçtan uca bir hackathon şaheseridir.
