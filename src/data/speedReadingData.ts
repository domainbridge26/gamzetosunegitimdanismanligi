export interface SpeedExercise {
  id: string;
  title: string;
  level: 'Ortaokul' | 'Lise';
  category: 'goz-takip' | 'sutun-takip' | 'okuma-metni' | 'dikkat-odak' | 'bulmaca';
  categoryLabel: string;
  description: string;
  iconName: string;
  targetWpm?: number;
  data: any;
}

export const SPEED_READING_EXERCISES: SpeedExercise[] = [
  // ==================== ORTAOKUL EGZERSİZLERİ (20 ADET) ====================
  // 1. Göz Takip
  {
    id: 'o-gt-1',
    title: 'Yatay Nokta Sıçraması',
    level: 'Ortaokul',
    category: 'goz-takip',
    categoryLabel: 'Göz Takip',
    iconName: 'Eye',
    description: 'Sol ve sağ noktalar arasında göz kaslarını esneterek hızlı odaklanmayı geliştirin.',
    targetWpm: 250,
    data: {
      type: 'horizontal-dot',
      dotColor: '#C5A059',
      defaultSpeedBpm: 120,
      minSpeedBpm: 60,
      maxSpeedBpm: 500,
      words: ['Gelişim', 'Başarı', 'Odak', 'Hız', 'Hafıza', 'Sınav', 'LGS', 'Hedef', 'Kavrama', 'Okuma']
    }
  },
  {
    id: 'o-gt-2',
    title: 'Dikey Sütun Takibi',
    level: 'Ortaokul',
    category: 'goz-takip',
    categoryLabel: 'Göz Takip',
    iconName: 'ArrowDown',
    description: 'Yukarıdan aşağıya hızlı sıçramalarla dikey okuma hızınızı artırın.',
    targetWpm: 280,
    data: {
      type: 'vertical-dot',
      dotColor: '#059669',
      defaultSpeedBpm: 140,
      words: ['Soruları', 'Hızlı', 'Anlayarak', 'Çözmek', 'İçin', 'Dikey', 'Göz', 'Hareketi', 'Şarttır', 'Gayret']
    }
  },
  {
    id: 'o-gt-3',
    title: 'Çapraz Zikzak Okuma',
    level: 'Ortaokul',
    category: 'goz-takip',
    categoryLabel: 'Göz Takip',
    iconName: 'Activity',
    description: 'Ekranın zıt köşeleri arasında zikzak göz hareketleri çalışması.',
    targetWpm: 300,
    data: {
      type: 'zigzag',
      defaultSpeedBpm: 150,
      words: ['Kitap', 'Sayfa', 'Cümle', 'Mantık', 'Paragraf', 'Analiz', 'Yorum', 'Sonuç', 'Derece', 'Gelecek']
    }
  },
  {
    id: 'o-gt-4',
    title: 'Sonsuzluk Dairesi (Infinity Loop)',
    level: 'Ortaokul',
    category: 'goz-takip',
    categoryLabel: 'Göz Takip',
    iconName: 'RotateCw',
    description: 'Göz kaslarını ritmik 8 şeklinde hareket ettirerek esnekliği maksimuma çıkarın.',
    targetWpm: 320,
    data: {
      type: 'infinity-loop',
      defaultSpeedBpm: 160
    }
  },

  // 2. Sütun Takipleri
  {
    id: 'o-st-1',
    title: '2 Sütunlu Kelime Piramidi',
    level: 'Ortaokul',
    category: 'sutun-takip',
    categoryLabel: 'Sütun Takibi',
    iconName: 'Columns2',
    description: 'İki sütun arasındaki kelimeleri tek bakışta algılama egzersizi.',
    targetWpm: 300,
    data: {
      columnsCount: 2,
      wordPairs: [
        ['Akıl', 'Bilgi'],
        ['Okuma', 'Anlama'],
        ['Kelime', 'Cümle'],
        ['Disiplin', 'Çalışma'],
        ['Paragraf', 'Çözümü'],
        ['Önemli', 'Detay'],
        ['Mantar', 'Pano'],
        ['Gözlem', 'Deney'],
        ['Gelişim', 'Süreci'],
        ['LGS', 'Hedefi']
      ]
    }
  },
  {
    id: 'o-st-2',
    title: '3 Sütunlu Görüş Açısı Genişletme',
    level: 'Ortaokul',
    category: 'sutun-takip',
    categoryLabel: 'Sütun Takibi',
    iconName: 'Columns3',
    description: 'Görüş alanınızı (aktif görme konisini) 3 noktaya yayarak genişletin.',
    targetWpm: 350,
    data: {
      columnsCount: 3,
      wordTriplets: [
        ['Hızlı', 'Okuma', 'Tekniği'],
        ['LGS', 'Türkçe', 'Paragraf'],
        ['Mantık', 'Muhakeme', 'Sorusu'],
        ['Sınav', 'Süresi', 'Yönetimi'],
        ['Anlayarak', 'Hızlı', 'Tamamlama'],
        ['Görsel', 'Hafıza', 'Eğitimi'],
        ['Dikkat', 'Odaklanma', 'Başarısı'],
        ['Gamze', 'Tosun', 'Koçluk']
      ]
    }
  },
  {
    id: 'o-st-3',
    title: 'Genişleyen Bloğ Okuma (Açı Egzersizi)',
    level: 'Ortaokul',
    category: 'sutun-takip',
    categoryLabel: 'Sütun Takibi',
    iconName: 'Maximize2',
    description: 'Görsel alanınızı adım adım genişleterek merkezdeki noktadan kenarları algılayın.',
    targetWpm: 320,
    data: {
      type: 'expanding-block',
      rows: [
        { left: 'a', center: '•', right: 'b' },
        { left: 'oku', center: '•', right: 'yaz' },
        { left: 'bilgi', center: '•', right: 'başarı' },
        { left: 'çalışkan', center: '•', right: 'öğrenci' },
        { left: 'odaklanma', center: '•', right: 'performans' },
        { left: 'geometri', center: '•', right: 'matematik' }
      ]
    }
  },

  // 3. Okuma Metinleri & Takistoskop
  {
    id: 'o-om-1',
    title: 'LGS Paragraf Hız Çalışması: "Kitapların Gücü"',
    level: 'Ortaokul',
    category: 'okuma-metni',
    categoryLabel: 'Okuma Metni',
    iconName: 'BookOpen',
    description: 'LGS formatına uygun metin üzerinde kelime kelime flaşör ve hız ölçümlü test.',
    targetWpm: 250,
    data: {
      content: 'Kitap okumak sadece kelimeleri tanımak değil, zihinde yepyeni dünyalar inşa etmektir. Düzenli okuyan bir öğrencinin kelime hazinesi gelişir, okuduğunu anlama hızı artar ve sınav sorularını daha ilk okuyuşta kavrar. Günde 30 dakika odaklanarak okunan bir kitap, LGS sınavında en büyük kozunuz olacaktır.',
      wordCount: 46,
      quiz: [
        {
          question: 'Metne göre düzenli okumanın öğrenciye sağladığı en büyük katkı nedir?',
          options: ['Hızlı koşmasını sağlamak', 'Kelime hazinesini geliştirip okuduğunu anlamayı hızlandırmak', 'Sadece ezber yapmasını sağlamak', 'Sınav süresini uzatmak'],
          correctAnswer: 1
        },
        {
          question: 'Günde kaç dakika odaklanarak okumak tavsiye edilmektedir?',
          options: ['10 dakika', '30 dakika', '2 saat', '5 dakika'],
          correctAnswer: 1
        }
      ]
    }
  },
  {
    id: 'o-om-2',
    title: 'Zaman Yönetimi ve Sınav Stratejisi',
    level: 'Ortaokul',
    category: 'okuma-metni',
    categoryLabel: 'Okuma Metni',
    iconName: 'Clock',
    description: 'Sınavda turlama taktiği ve zamanı doğru kullanma üzerine okuma metni.',
    targetWpm: 300,
    data: {
      content: 'LGS sınavında başarılı olmanın sırrı sadece bilmek değil, zamanı verimli kullanmaktır. Takıldığınız sorulara takılıp kalmak yerine soruya işaret koyup geçmek, yani turlama taktiğini uygulamak size dakikalar kazandırır. Kendinize güvenin ve temponuzu koruyun.',
      wordCount: 36,
      quiz: [
        {
          question: 'Takıldığımız sorularda yapılması gereken en doğru davranış nedir?',
          options: ['İnatla 10 dakika o soruyla uğraşmak', 'Soruya işaret koyup geçmek (turlama taktiği)', 'Sınavı terk etmek', 'Rastgele şık işaretlemek'],
          correctAnswer: 1
        }
      ]
    }
  },
  {
    id: 'o-om-3',
    title: 'Bilimsel Bilgi: "Beynin Esnekliği (Nöroplastisite)"',
    level: 'Ortaokul',
    category: 'okuma-metni',
    categoryLabel: 'Okuma Metni',
    iconName: 'Sparkles',
    description: 'Ortaokul fen ve paragraf becerisini destekleyen bilgilendirici metin.',
    targetWpm: 280,
    data: {
      content: 'İnsan beyni çalıştıkça gelişen inanılmaz bir organdır. Yeni bir bilgi öğrendiğinizde nöronlar arasında yeni bağlar kurulur. Hızlı okuma ve dikkat egzersizleri yaptıkça beyniniz daha hızlı işleme kapasitesine ulaşır. Çalışmak beyninizi her gün bir adım ileriye taşır.',
      wordCount: 37,
      quiz: [
        {
          question: 'Yeni bir bilgi öğrenildiğinde beyinde ne gerçekleşir?',
          options: ['Hücreler yok olur', 'Nöronlar arasında yeni bağlar kurulur', 'Hafıza tamamen silinir', 'Beyin küçülür'],
          correctAnswer: 1
        }
      ]
    }
  },
  {
    id: 'o-om-4',
    title: 'Takistoskop / Kelime Flaşör Çalışması (1 Kelime)',
    level: 'Ortaokul',
    category: 'okuma-metni',
    categoryLabel: 'Takistoskop',
    iconName: 'Zap',
    description: 'Ekranda milisaniyelik hızla beliren kelimeleri algılama rekoru kırma egzersizi.',
    targetWpm: 350,
    data: {
      type: 'rsvp',
      words: ['Başarı', 'Gelişim', 'Disiplin', 'Motivasyon', 'Paragraf', 'Analiz', 'Mücadele', 'Hedef', 'Eğitim', 'Gelecek', 'Derece', 'Farkındalık']
    }
  },

  // 4. Dikkat & Odaklanma Çalışmaları
  {
    id: 'o-do-1',
    title: 'Schulte Tablosu 4x4 (Sayı Hız Testi)',
    level: 'Ortaokul',
    category: 'dikkat-odak',
    categoryLabel: 'Dikkat & Odak',
    iconName: 'Grid',
    description: '1’den 16’ya kadar olan sayıları en hızlı şekilde sırasıyla tıklayın.',
    targetWpm: 0,
    data: {
      type: 'schulte',
      gridSize: 4
    }
  },
  {
    id: 'o-do-2',
    title: 'Schulte Tablosu 5x5 (Konsantrasyon Rekoru)',
    level: 'Ortaokul',
    category: 'dikkat-odak',
    categoryLabel: 'Dikkat & Odak',
    iconName: 'Grid',
    description: '1’den 25’e kadar karışık verilen sayıları gözünüzle tarayarak tıklayın.',
    targetWpm: 0,
    data: {
      type: 'schulte',
      gridSize: 5
    }
  },
  {
    id: 'o-do-3',
    title: 'Stroop Renk Çelişki Testi',
    level: 'Ortaokul',
    category: 'dikkat-odak',
    categoryLabel: 'Dikkat & Odak',
    iconName: 'Palette',
    description: 'Kelimenin ne yazdığına değil, YAZILDIĞI RENGİNE odaklanarak doğru butona basın!',
    targetWpm: 0,
    data: {
      type: 'stroop',
      itemsCount: 10
    }
  },
  {
    id: 'o-do-4',
    title: 'Gizli Harf Matrisi (Target Letter Scanner)',
    level: 'Ortaokul',
    category: 'dikkat-odak',
    categoryLabel: 'Dikkat & Odak',
    iconName: 'Search',
    description: 'Karışık harf tablosunda hedef harfi ("K" veya "M") süreniz bitmeden bulun.',
    targetWpm: 0,
    data: {
      type: 'letter-matrix',
      gridWidth: 8,
      gridHeight: 6,
      targetLetter: 'K'
    }
  },
  {
    id: 'o-do-5',
    title: 'Eksik Sayı Tespit Egzersizi',
    level: 'Ortaokul',
    category: 'dikkat-odak',
    categoryLabel: 'Dikkat & Odak',
    iconName: 'HelpCircle',
    description: 'Sıralı verilen dizide atlanmış olan eksik sayıyı hızlıca tespit edin.',
    targetWpm: 0,
    data: {
      type: 'missing-number',
      puzzles: [
        { sequence: [12, 13, 14, 16, 17, 18], missing: 15 },
        { sequence: [45, 46, 47, 48, 50, 51], missing: 49 },
        { sequence: [88, 89, 91, 92, 93], missing: 90 }
      ]
    }
  },

  // 5. Bulmacalar & Anagramlar
  {
    id: 'o-bm-1',
    title: 'LGS Kelime Anagramı (Karışık Harfler)',
    level: 'Ortaokul',
    category: 'bulmaca',
    categoryLabel: 'Bulmaca & Anagram',
    iconName: 'Puzzle',
    description: 'Harfleri karışık verilen LGS kavramlarını en kısa sürede çözün.',
    targetWpm: 0,
    data: {
      type: 'anagram',
      words: [
        { scrambled: 'A R A G A R F P', answer: 'PARAGRAF', hint: 'Metin bölümü' },
        { scrambled: 'K I N T A M', answer: 'MANTIK', hint: 'Akıl yürütme' },
        { scrambled: 'C I L K E S A', answer: 'SAYISAL', hint: 'Matematik ve Fen' },
        { scrambled: 'T I K K A D', answer: 'DİKKAT', hint: 'Konsantrasyon' }
      ]
    }
  },
  {
    id: 'o-bm-2',
    title: 'Zıt Anlamlı Kelime Hız Eşleştirmesi',
    level: 'Ortaokul',
    category: 'bulmaca',
    categoryLabel: 'Bulmaca & Anagram',
    iconName: 'Repeat',
    description: 'Verilen kelimenin zıt anlamlısını süre dolmadan doğru seçin.',
    targetWpm: 0,
    data: {
      type: 'word-match',
      pairs: [
        { word: 'Hızlı', match: 'Yavaş' },
        { word: 'Cevap', match: 'Soru' },
        { word: 'Kolay', match: 'Zor' },
        { word: 'Başlangıç', match: 'Bitiş' },
        { word: 'Geniş', match: 'Dar' }
      ]
    }
  },
  {
    id: 'o-bm-3',
    title: 'Görsel Kelime Avı (Sözcük Matrisi)',
    level: 'Ortaokul',
    category: 'bulmaca',
    categoryLabel: 'Bulmaca & Anagram',
    iconName: 'Grid',
    description: 'Matris içine gizlenmiş 4 adet kilit LGS kelimesini gözünüzle tarayın.',
    targetWpm: 0,
    data: {
      type: 'word-search',
      targetWords: ['LGS', 'OKUMA', 'SINA V', 'ODAK']
    }
  },
  {
    id: 'o-bm-4',
    title: 'Hızlı Kelime Tamamlama (Eksik Harf)',
    level: 'Ortaokul',
    category: 'bulmaca',
    categoryLabel: 'Bulmaca & Anagram',
    iconName: 'Edit3',
    description: 'Noktalı yerlere gelecek doğru harfleri anında zihninizde tamamlayın.',
    targetWpm: 0,
    data: {
      type: 'word-fill',
      items: [
        { word: 'D A N I Ş M A N L I K', masked: 'D A N _ Ş M A N L _ K' },
        { word: 'Ö Ğ R E N C İ', masked: 'Ö Ğ _ E N C _' },
        { word: 'P A R A G R A F', masked: 'P A _ A G R _ F' }
      ]
    }
  },


  // ==================== LİSE & YKS EGZERSİZLERİ (20 ADET) ====================
  // 1. Göz Takip
  {
    id: 'l-gt-1',
    title: 'YKS Paragraf Çerçeve Sıçraması',
    level: 'Lise',
    category: 'goz-takip',
    categoryLabel: 'Göz Takip',
    iconName: 'Maximize',
    description: 'Ekranın 4 dış köşesine ritmik göz atlamaları yaparak aktif bakış alanını maksimize edin.',
    targetWpm: 400,
    data: {
      type: 'corner-jump',
      defaultSpeedBpm: 200,
      words: ['TYT', 'AYT', 'Derece', 'Felsefe', 'Edebiyat', 'Biyoloji', 'Matematik', 'Koçluk']
    }
  },
  {
    id: 'l-gt-2',
    title: 'Gelişmiş İki Yönlü Saccade Çalışması',
    level: 'Lise',
    category: 'goz-takip',
    categoryLabel: 'Göz Takip',
    iconName: 'Zap',
    description: 'Çok hızlı değişen odak noktalarıyla göz kas reflexlerini zirveye taşıyın.',
    targetWpm: 450,
    data: {
      type: 'horizontal-dot',
      dotColor: '#DC2626',
      defaultSpeedBpm: 240,
      minSpeedBpm: 120,
      maxSpeedBpm: 700,
      words: ['Kavram', 'Hipotez', 'Edebi', 'Metin', 'Çıkarım', 'Paradoks', 'Strateji', 'YKS', 'Göz', 'Hızı']
    }
  },
  {
    id: 'l-gt-3',
    title: 'Spiral (Sarmal) Göz Takibi',
    level: 'Lise',
    category: 'goz-takip',
    categoryLabel: 'Göz Takip',
    iconName: 'Loader',
    description: 'Merkezden dışa doğru genişleyen dairesel hat üzerinde göz takibi.',
    targetWpm: 420,
    data: {
      type: 'spiral',
      defaultSpeedBpm: 180
    }
  },
  {
    id: 'l-gt-4',
    title: 'Kombine Dikey & Çapraz Sıçrama',
    level: 'Lise',
    category: 'goz-takip',
    categoryLabel: 'Göz Takip',
    iconName: 'TrendingUp',
    description: 'YKS paragraf metinlerindeki blok geçişlerini simüle eden dinamik göz sıçraması.',
    targetWpm: 480,
    data: {
      type: 'zigzag',
      defaultSpeedBpm: 220,
      words: ['Neden', 'Sonuç', 'Amaç', 'Sonuç', 'Düşünceyi', 'Geliştirme', 'Yolları', 'Özgün', 'Üslup', 'Sentez']
    }
  },

  // 2. Sütun Takipleri
  {
    id: 'l-st-1',
    title: 'YKS Akademik Kelime Blokları (3 Sütun)',
    level: 'Lise',
    category: 'sutun-takip',
    categoryLabel: 'Sütun Takibi',
    iconName: 'Columns3',
    description: 'YKS Edebiyat ve Felsefe terimlerini 3 sütunda tek bakışta tarayın.',
    targetWpm: 450,
    data: {
      columnsCount: 3,
      wordTriplets: [
        ['Epistemoloji', 'Ontoloji', 'Aksiyoloji'],
        ['Postmodernizm', 'Toplumcu', 'Gerçekçilik'],
        ['Kuantum', 'Mekaniği', 'Fiziği'],
        ['Elektromanyetik', 'Dalga', 'Spektrumu'],
        ['Paragrafta', 'Ana', 'Düşünce'],
        ['Ahenk', 'Unsurları', 'Ölçü'],
        ['Gamze', 'Tosun', 'YKS']
      ]
    }
  },
  {
    id: 'l-st-2',
    title: '4 Sütun Geniş Açı Blok Okuma',
    level: 'Lise',
    category: 'sutun-takip',
    categoryLabel: 'Sütun Takibi',
    iconName: 'Grid',
    description: 'Görsel koniyi 4 ayrı sütuna yayarak tam satır algılama eğitimi.',
    targetWpm: 500,
    data: {
      columnsCount: 4,
      wordQuartets: [
        ['TYT', 'Türkçe', 'Netlerinizi', 'Yükseltin'],
        ['Anlayarak', 'Hızlı', 'Okuma', 'Metodu'],
        ['Zaman', 'Yönetimi', 'Sınav', 'Stratejisi'],
        ['Hedef', 'Derece', 'Başarı', 'Disiplin'],
        ['YKS', 'Tercih', 'Uzmanlığı', 'Koçluk']
      ]
    }
  },
  {
    id: 'l-st-3',
    title: 'Dikey Çizgi Üstü Çift Kelime Odaklama',
    level: 'Lise',
    category: 'sutun-takip',
    categoryLabel: 'Sütun Takibi',
    iconName: 'MoreVertical',
    description: 'Sayfanın ortasındaki hayali eksenin sağ ve solundaki kelimeleri aynı anda görün.',
    targetWpm: 480,
    data: {
      type: 'expanding-block',
      rows: [
        { left: 'Somut', center: '│', right: 'Soyut' },
        { left: 'Tümdengelim', center: '│', right: 'Tümevarım' },
        { left: 'Nesnel', center: '│', right: 'Öznel' },
        { left: 'Neden-Sonuç', center: '│', right: 'Amaç-Sonuç' },
        { left: 'Görsel Sanat', center: '│', right: 'Edebi Metin' }
      ]
    }
  },

  // 3. Okuma Metinleri & Takistoskop
  {
    id: 'l-om-1',
    title: 'YKS Paragraf Hız Testi: "Felsefe ve Zaman Kavramı"',
    level: 'Lise',
    category: 'okuma-metni',
    categoryLabel: 'Okuma Metni',
    iconName: 'BookOpen',
    description: 'Uzun ve yoğun YKS paragraf sorusu formatında kavrama ve süre ölçümü.',
    targetWpm: 400,
    data: {
      content: 'Zamanın izafiliği, yalnızca fizik evreninde değil insan zihninin derinliklerinde de yankı bulur. Bergson, bilimin ölçtüğü mekanik zaman ile bilincin doğrudan tecrübe ettiği "süre" kavramını birbirinden keskin çizgilerle ayırır. Anlayarak hızlı okumak da zihnin bu içsel süreyi daha verimli işlemesini sağlar; okuyucu kelime kalıplarında kaybolmak yerine metnin özsel mimarisini kavrar.',
      wordCount: 52,
      quiz: [
        {
          question: 'Bergson hangi iki kavramı birbirinden ayırmıştır?',
          options: ['Gündüz ve gece', 'Mekanik zaman ile bilincin tecrübe ettiği "süre"', 'Rasyonellik ve duygu', 'Maddi ve manevi dünya'],
          correctAnswer: 1
        },
        {
          question: 'Anlayarak hızlı okumanın zihne sağladığı en temel avantaj nedir?',
          options: ['Metnin özsel mimarisini ve kurgusunu hızlıca kavramak', 'Kelime ezberlemek', 'Yavaşlamayı öğretmek', 'Gözleri yormak'],
          correctAnswer: 0
        }
      ]
    }
  },
  {
    id: 'l-om-2',
    title: 'Edebiyat & Sanat: "Postmodern Romanda Anlatı Mimarisi"',
    level: 'Lise',
    category: 'okuma-metni',
    categoryLabel: 'Okuma Metni',
    iconName: 'Feather',
    description: 'YKS Türkçe ve Edebiyat soru stillerine yönelik ağır dil içeren metin.',
    targetWpm: 420,
    data: {
      content: 'Postmodern roman, geleneksel anlatının çizgisel zaman anlayışını yıkarak yerine çok katmanlı, metinlerarası ve üstkurmaca bir yapı getirir. Yazar, okuyucuya hazır bir hakikat sunmak yerine onu metnin inşasına aktif bir ortak olarak davet eder. Bu metinleri okurken yüksek odaklanma ve geniş bir görme açısı şarttır.',
      wordCount: 46,
      quiz: [
        {
          question: 'Postmodern romanın geleneksel anlatıdan en büyük farkı nedir?',
          options: ['Sadece şiirsel dil kullanması', 'Çizgisel zamanı yıkarak metinlerarası ve üstkurmaca yapı sunması', 'Resimlerle anlatılması', 'Yazarın tamamen gizlenmesi'],
          correctAnswer: 1
        }
      ]
    }
  },
  {
    id: 'l-om-3',
    title: 'Bilim & Teknoloji: "Yapay Zeka ve Nöral Ağlar"',
    level: 'Lise',
    category: 'okuma-metni',
    categoryLabel: 'Okuma Metni',
    iconName: 'Cpu',
    description: 'Güncel ve bilimsel metinler üzerinden YKS okuma hızını test etme.',
    targetWpm: 450,
    data: {
      content: 'Yapay sinir ağları, insan beynindeki biyolojik nöronların bilgi işleme biçimini taklit eden matematiksel modellerdir. Katmanlar arasındaki ağırlıkların ayarlanmasıyla sistem kendi deneyimlerinden öğrenir. Hızlı okuma eğitimi alan bir öğrenci de benzer şekilde zihinsel algı algoritmalarını güncelleyerek bilgi işleme kapasitesini artırır.',
      wordCount: 43,
      quiz: [
        {
          question: 'Yapay sinir ağları neyi taklit eder?',
          options: ['Bilgisayar işlemcilerini', 'İnsan beynindeki biyolojik nöronların bilgi işleme biçimini', 'Güneş panellerini', 'Kütüphane kataloglarını'],
          correctAnswer: 1
        }
      ]
    }
  },
  {
    id: 'l-om-4',
    title: 'YKS Takistoskop Flaşör (2-3 Kelimelik Bloklar)',
    level: 'Lise',
    category: 'okuma-metni',
    categoryLabel: 'Takistoskop',
    iconName: 'Zap',
    description: 'Ekranda 500 WPM hızla parlayan 2-3 kelimelik öbekleri tek bakışta yakalayın.',
    targetWpm: 500,
    data: {
      type: 'rsvp',
      words: [
        'Anlayarak Hızlı Okuma',
        'TYT Türkçe Paragraf',
        'Zaman Yönetimi Stratejisi',
        'YKS Derece Hedefi',
        'Gamze Tosun Koçluk',
        'Gelişmiş Odaklanma Egzersizi',
        'Epistemolojik Yaklaşım',
        'Yüksek Algı Kapasitesi'
      ]
    }
  },

  // 4. Dikkat & Odaklanma Çalışmaları
  {
    id: 'l-do-1',
    title: 'YKS İleri Seviye Schulte Tablosu (5x5 Kronometre)',
    level: 'Lise',
    category: 'dikkat-odak',
    categoryLabel: 'Dikkat & Odak',
    iconName: 'Grid',
    description: '1-25 arasındaki sayıları hedefe kilitlenerek 15 saniyenin altında tamamlamaya çalışın.',
    targetWpm: 0,
    data: {
      type: 'schulte',
      gridSize: 5
    }
  },
  {
    id: 'l-do-2',
    title: 'Gelişmiş Stroop Çelişki Testi (Hızlı Seri)',
    level: 'Lise',
    category: 'dikkat-odak',
    categoryLabel: 'Dikkat & Odak',
    iconName: 'Palette',
    description: 'Saniyenin 1/3\'ü kadar sürede renk-kelime çelişkilerini doğru yanıtlayın.',
    targetWpm: 0,
    data: {
      type: 'stroop',
      itemsCount: 15
    }
  },
  {
    id: 'l-do-3',
    title: 'Yoğun Kelime Matrisi Tarama (YKS Terimleri)',
    level: 'Lise',
    category: 'dikkat-odak',
    categoryLabel: 'Dikkat & Odak',
    iconName: 'Search',
    description: 'YKS Paragraf sorularındaki çeldirici kelimeleri ayırt etme odak testi.',
    targetWpm: 0,
    data: {
      type: 'letter-matrix',
      gridWidth: 10,
      gridHeight: 8,
      targetLetter: 'X'
    }
  },
  {
    id: 'l-do-4',
    title: 'Sayı Dizisi Hızlı Yakalama (Hafıza Flaşör)',
    level: 'Lise',
    category: 'dikkat-odak',
    categoryLabel: 'Dikkat & Odak',
    iconName: 'Eye',
    description: 'Anlık parlayan 6 haneli sayıları aklınızda tutup doğru yazın.',
    targetWpm: 0,
    data: {
      type: 'number-flash',
      digits: [582914, 914207, 360851, 749123]
    }
  },

  // 5. Bulmacalar & Anagramlar
  {
    id: 'l-bm-1',
    title: 'YKS Edebiyat & Felsefe Anagramı',
    level: 'Lise',
    category: 'bulmaca',
    categoryLabel: 'Bulmaca & Anagram',
    iconName: 'Puzzle',
    description: 'YKS sınavında en çok çıkan edebiyat ve felsefe terimlerini çözün.',
    targetWpm: 0,
    data: {
      type: 'anagram',
      words: [
        { scrambled: 'E P İ S T E M O L O J İ', answer: 'EPESTEMOLOJİ', hint: 'Bilgi Felsefesi' },
        { scrambled: 'M E T İ N L E R A R A S I L I K', answer: 'METİNLERARASILIK', hint: 'Postmodern Teknik' },
        { scrambled: 'Ü S T K U R M A C A', answer: 'ÜSTKURMACA', hint: 'Roman Tekniği' },
        { scrambled: 'M U H A K E M E', answer: 'MUHAKEME', hint: 'Akıl Yürütme' }
      ]
    }
  },
  {
    id: 'l-bm-2',
    title: 'YKS Kelime & Eş Anlam Hız Testi',
    level: 'Lise',
    category: 'bulmaca',
    categoryLabel: 'Bulmaca & Anagram',
    iconName: 'Repeat',
    description: 'Paragrafta sıkça karşılaşılan ağdalı kelimelerin karşılığını bulun.',
    targetWpm: 0,
    data: {
      type: 'word-match',
      pairs: [
        { word: 'Özgün', match: 'Orijinal' },
        { word: 'Öznitelik', match: 'Vasıf' },
        { word: 'Yalınlık', match: 'Sadelik' },
        { word: 'Ağdalı', match: 'Karmaşık' },
        { word: 'Kanımsamak', match: 'Benimsemek' }
      ]
    }
  },
  {
    id: 'l-bm-3',
    title: 'Akademik Kelime Matris Bulmacası',
    level: 'Lise',
    category: 'bulmaca',
    categoryLabel: 'Bulmaca & Anagram',
    iconName: 'Grid',
    description: 'Karışık harf matrisindeki YKS derece kelimelerini bulun.',
    targetWpm: 0,
    data: {
      type: 'word-search',
      targetWords: ['DERECE', 'PARAGRAF', 'YKS', 'ANALİZ']
    }
  },
  {
    id: 'l-bm-4',
    title: 'Eksik Harfli Paragraf Kavramları',
    level: 'Lise',
    category: 'bulmaca',
    categoryLabel: 'Bulmaca & Anagram',
    iconName: 'Edit3',
    description: 'Noktalı harfleri zihninizde hızlıca tamamlayarak kelimeyi bütünleyin.',
    targetWpm: 0,
    data: {
      type: 'word-fill',
      items: [
        { word: 'P A R A D İ G M A', masked: 'P A R _ D İ G _ A' },
        { word: 'S E N T E Z', masked: 'S E _ T E Z' },
        { word: 'B İ L İ N Ç A K I Ş I', masked: 'B İ L _ N Ç  A K _ Ş I' }
      ]
    }
  }
];
