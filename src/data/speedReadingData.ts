export interface SpeedExercise {
  id: string;
  title: string;
  level: 'İlkokul' | 'Ortaokul' | 'Lise';
  category: 'hece-calismasi' | 'sayi-calismasi' | 'goz-takip' | 'sutun-takip' | 'okuma-metni' | 'dikkat-odak' | 'bulmaca';
  categoryLabel: string;
  description: string;
  iconName: string;
  targetWpm?: number;
  data: any;
}

export const TURKISH_WORD_POOL = [
  'Gelişim', 'Başarı', 'Odak', 'Hız', 'Hafıza', 'Sınav', 'LGS', 'TYT', 'AYT', 'Hedef',
  'Kavrama', 'Okuma', 'Metin', 'Düşünce', 'Paragraf', 'Analiz', 'Yorum', 'Sonuç', 'Derece',
  'Gelecek', 'Neden', 'Amaç', 'Üslup', 'Sentez', 'Özgün', 'Yalınlık', 'Akıcılık', 'Mantık',
  'Muhakeme', 'Disiplin', 'Motivasyon', 'Kültür', 'Bilim', 'Teknoloji', 'Felsefe', 'Edebiyat',
  'Tarih', 'Coğrafya', 'Sanat', 'Algı', 'Zaman', 'Strateji', 'Yöntem', 'Kavram', 'Kuram',
  'Bilgi', 'Bilinç', 'Dikkat', 'Tutum', 'Kapasite', 'Esneklik', 'Refleks', 'Vizyon', 'Gayret'
];

export function getRandomWords(count: number = 10, customPool?: string[]): string[] {
  const pool = customPool && customPool.length > 0 ? customPool : TURKISH_WORD_POOL;
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

export function generateFreshExerciseData(exercise: SpeedExercise): SpeedExercise {
  const cloned = JSON.parse(JSON.stringify(exercise));
  if (!cloned.data) return cloned;

  // Syllables / Words / Numbers shuffling or random generation
  if (Array.isArray(cloned.data.syllables)) {
    cloned.data.syllables = shuffleArray([...cloned.data.syllables]);
  }
  if (Array.isArray(cloned.data.words)) {
    cloned.data.words = shuffleArray([...cloned.data.words]);
  }
  if (Array.isArray(cloned.data.numbers)) {
    cloned.data.numbers = shuffleArray([...cloned.data.numbers]);
  }
  if (Array.isArray(cloned.data.wordPairs)) {
    cloned.data.wordPairs = shuffleArray([...cloned.data.wordPairs]);
  }
  if (Array.isArray(cloned.data.wordTriplets)) {
    cloned.data.wordTriplets = shuffleArray([...cloned.data.wordTriplets]);
  }
  if (Array.isArray(cloned.data.wordQuartets)) {
    cloned.data.wordQuartets = shuffleArray([...cloned.data.wordQuartets]);
  }
  if (Array.isArray(cloned.data.pairs)) {
    cloned.data.pairs = shuffleArray([...cloned.data.pairs]);
  }
  if (Array.isArray(cloned.data.puzzles)) {
    cloned.data.puzzles = shuffleArray([...cloned.data.puzzles]);
  }

  // Dynamic number generation for number flashers
  if (cloned.data.type === 'number-flash' || cloned.category === 'sayi-calismasi') {
    const freshNums: string[] = [];
    const count = 15;
    for (let i = 0; i < count; i++) {
      const len = 2 + (i % 6);
      let num = '';
      for (let d = 0; d < len; d++) {
        num += Math.floor(Math.random() * 9 + (d === 0 ? 1 : 0)).toString();
      }
      freshNums.push(num);
    }
    cloned.data.numbers = freshNums;
  }

  return cloned;
}

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export const SPEED_READING_EXERCISES: SpeedExercise[] = [
  // =========================================================================
  // ==================== İLKOKUL EGZERSİZLERİ (30 ADET) ====================
  // =========================================================================
  
  // 1. Hece Çalışmaları (6 Adet)
  {
    id: 'i-hc-1',
    title: 'İlkokul Ritmik Hece Flaşör 1',
    level: 'İlkokul',
    category: 'hece-calismasi',
    categoryLabel: 'Hece Çalışması',
    iconName: 'Zap',
    description: '2 ve 3 harfli temel Türkçe heceleri ekranda ritmik olarak takip edip hızlı okuyun.',
    targetWpm: 150,
    data: {
      type: 'syllable-flash',
      defaultSpeedBpm: 90,
      syllables: ['AL', 'EL', 'AK', 'EK', 'İK', 'OK', 'OL', 'AN', 'EN', 'AT', 'LA', 'LE', 'LI', 'Lİ', 'KA', 'KE', 'MA', 'BA', 'BE', 'DA', 'DE', 'ELE', 'LALE', 'KALE', 'OKU', 'BAK', 'GEL', 'GİT', 'SEV', 'YAZ']
    }
  },
  {
    id: 'i-hc-2',
    title: 'Hece & Kelime Merdiveni 2',
    level: 'İlkokul',
    category: 'hece-calismasi',
    categoryLabel: 'Hece Çalışması',
    iconName: 'Activity',
    description: 'Tek heceden başlayan kelime basamaklarını tek bakışta algılama egzersizi.',
    targetWpm: 170,
    data: {
      type: 'syllable-flash',
      defaultSpeedBpm: 100,
      syllables: ['AL', 'AL-İ', 'AL-İ-YE', 'Kİ-TAP', 'OKU-YOR', 'GÜ-NEŞ', 'YIL-DIZ', 'OR-MAN', 'DEN-İZ', 'Çİ-ÇEK', 'BAY-RAK', 'BA-ŞA-RI']
    }
  },
  {
    id: 'i-hc-3',
    title: 'Neşeli Sesli Hece İkilemeleri',
    level: 'İlkokul',
    category: 'hece-calismasi',
    categoryLabel: 'Hece Çalışması',
    iconName: 'Sparkles',
    description: 'Ses uyumlu hece ikilemlerini göz kaslarınızı yormadan hızla okuyun.',
    targetWpm: 180,
    data: {
      type: 'syllable-flash',
      defaultSpeedBpm: 110,
      syllables: ['MAMA', 'BABA', 'DEDE', 'KAKA', 'ŞAKA', 'KUTU', 'KUZU', 'KEDİ', 'KUŞU', 'MAVA', 'GECE', 'NEŞE', 'BİLGİ', 'KAYI']
    }
  },
  {
    id: 'i-hc-4',
    title: 'Karmaşık Heceleri Hızlı Yakalama',
    level: 'İlkokul',
    category: 'hece-calismasi',
    categoryLabel: 'Hece Çalışması',
    iconName: 'Zap',
    description: '4 harfli kapalı heceleri ve ses birleşimlerini seri şekilde tanıma.',
    targetWpm: 190,
    data: {
      type: 'syllable-flash',
      defaultSpeedBpm: 120,
      syllables: ['PARK', 'KURT', 'DERT', 'SERF', 'TÜRK', 'KIRK', 'MART', 'KART', 'DÖRT', 'RENK', 'TANK', 'ZENG', 'BANT']
    }
  },
  {
    id: 'i-hc-5',
    title: 'İlkokul Kelime Blokları Flaşör',
    level: 'İlkokul',
    category: 'hece-calismasi',
    categoryLabel: 'Hece Çalışması',
    iconName: 'Grid',
    description: '2 kelimelik kısa ilkokul öbeklerini tek bakışta okuma antrenmanı.',
    targetWpm: 200,
    data: {
      type: 'syllable-flash',
      defaultSpeedBpm: 125,
      syllables: ['Kırmızı Elma', 'Mavi Balon', 'Sarı Güneş', 'Sevimli Kedi', 'Büyük Ev', 'Akıllı Çocuk', 'Güzel Kitap', 'Hızlı Tren']
    }
  },
  {
    id: 'i-hc-6',
    title: 'Ritmik Hece & Şiir Hız Maratonu',
    level: 'İlkokul',
    category: 'hece-calismasi',
    categoryLabel: 'Hece Çalışması',
    iconName: 'Award',
    description: 'Ritmik ilkokul tekerlemeleri ve heceleriyle okuma akıcılığını zirveye taşıyın.',
    targetWpm: 210,
    data: {
      type: 'syllable-flash',
      defaultSpeedBpm: 130,
      syllables: ['Bir İki Üç', 'Dört Beş Altı', 'Yedi Sekiz Dokuz', 'On Kere On', 'Yüz Eder', 'Okulumu Severim', 'Çok Okurum']
    }
  },

  // 2. Sayı Çalışmaları (5 Adet)
  {
    id: 'i-sc-1',
    title: '2-3 Basamaklı Sayı Görüş Genişletme',
    level: 'İlkokul',
    category: 'sayi-calismasi',
    categoryLabel: 'Sayı Çalışması',
    iconName: 'Hash',
    description: '2 ve 3 basamaklı sayıları ekranda anlık görerek algılama hızınızı ölçün.',
    targetWpm: 180,
    data: {
      type: 'number-flash',
      defaultSpeedBpm: 100,
      numbers: ['12', '45', '78', '90', '105', '342', '679', '891', '230', '514', '763', '999']
    }
  },
  {
    id: 'i-sc-2',
    title: '4-5 Basamaklı Sayı Flaşör Egzersizi',
    level: 'İlkokul',
    category: 'sayi-calismasi',
    categoryLabel: 'Sayı Çalışması',
    iconName: 'Zap',
    description: '4 ve 5 basamaklı sayıları tek odak noktasıyla hafızaya alma çalışması.',
    targetWpm: 200,
    data: {
      type: 'number-flash',
      defaultSpeedBpm: 115,
      numbers: ['1250', '4891', '7023', '9514', '12408', '56931', '80492', '31579', '99104']
    }
  },
  {
    id: 'i-sc-3',
    title: 'Sayama & Ritmik Sayı Odaklanma',
    level: 'İlkokul',
    category: 'sayi-calismasi',
    categoryLabel: 'Sayı Çalışması',
    iconName: 'TrendingUp',
    description: '5’er ve 10’ar ritmik sayılar üzerinden hızlı algı geliştirme.',
    targetWpm: 210,
    data: {
      type: 'number-flash',
      defaultSpeedBpm: 120,
      numbers: ['5', '10', '15', '20', '25', '30', '35', '40', '45', '50', '60', '70', '80', '90', '100']
    }
  },
  {
    id: 'i-sc-4',
    title: 'Karışık Sayı Dizisi Yakalama',
    level: 'İlkokul',
    category: 'sayi-calismasi',
    categoryLabel: 'Sayı Çalışması',
    iconName: 'Grid',
    description: 'Rastgele basamak sayılarıyla dikkati odak noktasında toplama.',
    targetWpm: 220,
    data: {
      type: 'number-flash',
      defaultSpeedBpm: 130,
      numbers: ['8', '29', '304', '5912', '70823', '9', '41', '882', '1049', '66201']
    }
  },
  {
    id: 'i-sc-5',
    title: 'Sayı Açı Genişletme Maratonu',
    level: 'İlkokul',
    category: 'sayi-calismasi',
    categoryLabel: 'Sayı Çalışması',
    iconName: 'Maximize2',
    description: 'Sayıların basamakları genişledikçe açısal görme kapasitenizi test edin.',
    targetWpm: 230,
    data: {
      type: 'number-flash',
      defaultSpeedBpm: 140,
      numbers: ['99', '101', '555', '1001', '4444', '12345', '67890', '99999']
    }
  },

  // 3. Göz Takip (6 Adet)
  {
    id: 'i-gt-1',
    title: 'Sol-Sağ Yatay Nokta Takibi',
    level: 'İlkokul',
    category: 'goz-takip',
    categoryLabel: 'Göz Takip',
    iconName: 'Eye',
    description: 'Sol ve sağ iki nokta arasında göz kaslarını esneterek odaklanın.',
    targetWpm: 200,
    data: {
      type: 'horizontal-dot',
      dotColor: '#E11D48',
      defaultSpeedBpm: 100,
      words: ['Okul', 'Kitap', 'Kalem', 'Sevgi', 'Güneş', 'Yıldız', 'Çiçek', 'Orman', 'Deniz', 'Bilgi']
    }
  },
  {
    id: 'i-gt-2',
    title: 'Yukarı-Aşağı Dikey Sıçrama',
    level: 'İlkokul',
    category: 'goz-takip',
    categoryLabel: 'Göz Takip',
    iconName: 'ArrowDown',
    description: 'Dikey doğrultuda hareket eden nesneyi başınızı kıpırdatmadan takip edin.',
    targetWpm: 210,
    data: {
      type: 'vertical-dot',
      dotColor: '#2563EB',
      defaultSpeedBpm: 110,
      words: ['Elma', 'Armut', 'Çilek', 'Kiraz', 'Kavun', 'Karpuz', 'Muz', 'Üzüm', 'Şeftali']
    }
  },
  {
    id: 'i-gt-3',
    title: 'İlkokul Neşeli Zikzak Egzersizi',
    level: 'İlkokul',
    category: 'goz-takip',
    categoryLabel: 'Göz Takip',
    iconName: 'Activity',
    description: 'Zikzak hat üzerinde göz kaslarını esneterek kelimeleri okuyun.',
    targetWpm: 220,
    data: {
      type: 'zigzag',
      defaultSpeedBpm: 120,
      words: ['Kuş', 'Kedi', 'Köpek', 'Tavşan', 'Kuzu', 'Balık', 'Kelebek', 'Arı', 'Karınca']
    }
  },
  {
    id: 'i-gt-4',
    title: 'Dış Çerçeve (4 Köşe) Sıçraması',
    level: 'İlkokul',
    category: 'goz-takip',
    categoryLabel: 'Göz Takip',
    iconName: 'Maximize',
    description: 'Ekranın 4 köşesinde parlayan hedef kelimeleri anında yakalayın.',
    targetWpm: 230,
    data: {
      type: 'corner-jump',
      defaultSpeedBpm: 130,
      words: ['Anne', 'Baba', 'Kardeş', 'Dede', 'Nene', 'Teyze', 'Hala', 'Dayı', 'Amca']
    }
  },
  {
    id: 'i-gt-5',
    title: 'Sonsuzluk Dairesi (8 Çizgisi)',
    level: 'İlkokul',
    category: 'goz-takip',
    categoryLabel: 'Göz Takip',
    iconName: 'RotateCw',
    description: 'Gözlerinizi 8 şeklinde yumuşakça hareket ettirerek esnekliği artırın.',
    targetWpm: 240,
    data: {
      type: 'infinity-loop',
      defaultSpeedBpm: 140
    }
  },
  {
    id: 'i-gt-6',
    title: 'Sarmal Spiral Göz Yörüngesi',
    level: 'İlkokul',
    category: 'goz-takip',
    categoryLabel: 'Göz Takip',
    iconName: 'Loader',
    description: 'Merkezden dışa doğru genişleyen spiral hatta göz takibi.',
    targetWpm: 250,
    data: {
      type: 'spiral',
      defaultSpeedBpm: 150
    }
  },

  // 4. Sütun Takip (4 Adet)
  {
    id: 'i-st-1',
    title: 'İlkokul 2 Sütunlu Kelime Çiftleri',
    level: 'İlkokul',
    category: 'sutun-takip',
    categoryLabel: 'Sütun Takibi',
    iconName: 'Columns2',
    description: 'İki sütundaki kelimeleri merkez nokta yardımıyla aynı anda görün.',
    targetWpm: 220,
    data: {
      columnsCount: 2,
      wordPairs: [
        ['Akıl', 'Bilgi'], ['Okul', 'Sınıf'], ['Kalem', 'Defter'], ['Kitap', 'Sayfa'],
        ['Çocuk', 'Oyun'], ['Güneş', 'Işık'], ['Deniz', 'Dalga'], ['Kuş', 'Kanat']
      ]
    }
  },
  {
    id: 'i-st-2',
    title: '3 Sütunlu Görüş Genişletme',
    level: 'İlkokul',
    category: 'sutun-takip',
    categoryLabel: 'Sütun Takibi',
    iconName: 'Columns3',
    description: '3 sütuna ayrılmış kelimeleri tek bakışta algılama.',
    targetWpm: 240,
    data: {
      columnsCount: 3,
      wordTriplets: [
        ['Okul', 'Güzel', 'Yerdir'], ['Hızlı', 'Okuma', 'Eğitimi'], ['Kitap', 'En İyi', 'Dosttur'],
        ['Çalışkan', 'Öğrenci', 'Başarır'], ['Gamze', 'Tosun', 'Eğitim']
      ]
    }
  },
  {
    id: 'i-st-3',
    title: 'Genişleyen Kelime Piramidi',
    level: 'İlkokul',
    category: 'sutun-takip',
    categoryLabel: 'Sütun Takibi',
    iconName: 'Maximize2',
    description: 'Açı genişledikçe kenardaki kelimeleri algılama egzersizi.',
    targetWpm: 250,
    data: {
      type: 'expanding-block',
      rows: [
        { left: 'al', center: '•', right: 'bak' },
        { left: 'oku', center: '•', right: 'yaz' },
        { left: 'elma', center: '•', right: 'ağaç' },
        { left: 'çocuk', center: '•', right: 'okul' },
        { left: 'başarı', center: '•', right: 'disiplin' }
      ]
    }
  },
  {
    id: 'i-st-4',
    title: 'Merkez Eksen Dual Kelime Odaklama',
    level: 'İlkokul',
    category: 'sutun-takip',
    categoryLabel: 'Sütun Takibi',
    iconName: 'MoreVertical',
    description: 'Dikey çizgi etrafındaki kelimeleri başı kıpırdatmadan tarama.',
    targetWpm: 260,
    data: {
      type: 'expanding-block',
      rows: [
        { left: 'Gündüz', center: '│', right: 'Gece' },
        { left: 'Sıcak', center: '│', right: 'Soğuk' },
        { left: 'Büyük', center: '│', right: 'Küçük' },
        { left: 'Hızlı', center: '│', right: 'Yavaş' }
      ]
    }
  },

  // 5. Okuma Metinleri & Takistoskop (4 Adet)
  {
    id: 'i-om-1',
    title: 'İlkokul Öykü Metni: "Sevimli Tavşan Puki"',
    level: 'İlkokul',
    category: 'okuma-metni',
    categoryLabel: 'Okuma Metni',
    iconName: 'BookOpen',
    description: 'İlkokul seviyesine uygun neşeli okuma metni ve kavrama testi.',
    targetWpm: 160,
    data: {
      content: 'Küçük tavşan Puki ormanda yaşamayı çok severdi. Her sabah erkenden uyanır, taze havuçlarını yer ve arkadaşı sincap ile oyun oynardı. Bir gün ormanda renkli bir kitap buldular. Kitabın sayfalarını çevirdikçe yeni şeyler öğrenmenin ne kadar eğlenceli olduğunu keşfettiler.',
      wordCount: 41,
      quiz: [
        {
          question: 'Puki her sabah uyanınca ne yerdi?',
          options: ['Taze havuç', 'Fındık', 'Elma', 'Peynir'],
          correctAnswer: 0
        },
        {
          question: 'Puki ve sincap ormanda ne buldular?',
          options: ['Oyuncak araba', 'Renkli bir kitap', 'Şapka', 'Top'],
          correctAnswer: 1
        }
      ]
    }
  },
  {
    id: 'i-om-2',
    title: 'İlkokul Bilgilendirici Metin: "Güneş ve Gezegenler"',
    level: 'İlkokul',
    category: 'okuma-metni',
    categoryLabel: 'Okuma Metni',
    iconName: 'Sun',
    description: 'Uzay ve dünya temalı basit okuma metni.',
    targetWpm: 180,
    data: {
      content: 'Güneş, dünyamızı ısıtan ve aydınlatan kocaman bir yıldızdır. Dünyamız Güneş’in etrafında döner. Bu sayede mevsimler oluşur. Yazın hava sıcak, kışın ise soğuk olur. Dünyamızı temiz tutmak hepimizin görevidir.',
      wordCount: 31,
      quiz: [
        {
          question: 'Dünyamız neyin etrafında döner?',
          options: ['Ayın', 'Güneş’in', 'Bulutların', 'Yıldızların'],
          correctAnswer: 1
        }
      ]
    }
  },
  {
    id: 'i-om-3',
    title: 'İlkokul Takistoskop (1 Kelime Flaşör)',
    level: 'İlkokul',
    category: 'okuma-metni',
    categoryLabel: 'Takistoskop',
    iconName: 'Zap',
    description: 'Ekranda yüksek hızda beliren ilkokul kelimelerini yakalayın.',
    targetWpm: 200,
    data: {
      type: 'rsvp',
      words: ['Okul', 'Kitap', 'Kalem', 'Başarı', 'Sevgi', 'Güneş', 'Yıldız', 'Çiçek', 'Orman', 'Deniz', 'Bilgi', 'Bayrak']
    }
  },
  {
    id: 'i-om-4',
    title: 'İlkokul Takistoskop (2 Kelimelik Öbekler)',
    level: 'İlkokul',
    category: 'okuma-metni',
    categoryLabel: 'Takistoskop',
    iconName: 'Zap',
    description: 'Anlık parlayan 2 kelimelik öbekleri tek bakışta okuma.',
    targetWpm: 220,
    data: {
      type: 'rsvp',
      words: ['Hızlı Okuma', 'Güzel Kitap', 'Çalışkan Çocuk', 'Akıllı Öğrenci', 'Gamze Tosun', 'Sınav Başarısı']
    }
  },

  // 6. Dikkat & Odak (3 Adet)
  {
    id: 'i-do-1',
    title: 'İlkokul Schulte Tablosu 3x3 (Sayı Avı)',
    level: 'İlkokul',
    category: 'dikkat-odak',
    categoryLabel: 'Dikkat & Odak',
    iconName: 'Grid',
    description: '1’den 9’a kadar olan sayıları en hızlı şekilde tıklayın.',
    targetWpm: 0,
    data: {
      type: 'schulte',
      gridSize: 3
    }
  },
  {
    id: 'i-do-2',
    title: 'İlkokul Schulte Tablosu 4x4 (Odaklanma Rekoru)',
    level: 'İlkokul',
    category: 'dikkat-odak',
    categoryLabel: 'Dikkat & Odak',
    iconName: 'Grid',
    description: '1’den 16’ya kadar sayıları sırasıyla bulun ve tıklayın.',
    targetWpm: 0,
    data: {
      type: 'schulte',
      gridSize: 4
    }
  },
  {
    id: 'i-do-3',
    title: 'İlkokul Stroop Renk Oyunu (40 Kelime)',
    level: 'İlkokul',
    category: 'dikkat-odak',
    categoryLabel: 'Dikkat & Odak',
    iconName: 'Palette',
    description: 'Yazıya değil, yazının rengine odaklanarak doğru butona basın! (40 Kelime)',
    targetWpm: 0,
    data: {
      type: 'stroop',
      itemsCount: 40
    }
  },

  // 7. Bulmaca (2 Adet)
  {
    id: 'i-bm-1',
    title: 'İlkokul Kelime Anagramı (Karışık Harfler)',
    level: 'İlkokul',
    category: 'bulmaca',
    categoryLabel: 'Bulmaca & Anagram',
    iconName: 'Puzzle',
    description: 'Harfleri karışık verilen ilkokul kelimelerini çözün.',
    targetWpm: 0,
    data: {
      type: 'anagram',
      words: [
        { scrambled: 'K İ T A P', answer: 'KİTAP', hint: 'Okunan nesne' },
        { scrambled: 'K A L E M', answer: 'KALEM', hint: 'Yazı yazma aracı' },
        { scrambled: 'O K U L', answer: 'OKUL', hint: 'Eğitim yuvası' },
        { scrambled: 'Ç O C U K', answer: 'ÇOCUK', hint: 'Küçük insan' }
      ]
    }
  },
  {
    id: 'i-bm-2',
    title: 'İlkokul Zıt Anlamlı Kelimeler',
    level: 'İlkokul',
    category: 'bulmaca',
    categoryLabel: 'Bulmaca & Anagram',
    iconName: 'Repeat',
    description: 'Verilen kelimenin zıttını doğru eşleştirin.',
    targetWpm: 0,
    data: {
      type: 'word-match',
      matchType: 'antonym',
      pairs: [
        { word: 'Büyük', match: 'Küçük' },
        { word: 'Sıcak', match: 'Soğuk' },
        { word: 'Uzun', match: 'Kısa' },
        { word: 'Hızlı', match: 'Yavaş' }
      ]
    }
  },
  {
    id: 'i-gt-shape',
    title: 'Daire, Üçgen ve Yıldız Etrafında Oklarla Göz Takibi',
    level: 'İlkokul',
    category: 'goz-takip',
    categoryLabel: 'Göz Takip & Şekiller',
    iconName: 'Compass',
    description: 'Daire, üçgen, yıldız ve kare etrafındaki okları takip ederek göz kaslarınızı güçlendirin.',
    targetWpm: 250,
    data: {
      type: 'shape-arrows',
      initialShape: 'star',
      dotColor: '#E11D48',
      defaultSpeedBpm: 120,
      words: ['Güneş', 'Yıldız', 'Dünya', 'Deniz', 'Orman', 'Bulut', 'Nehir', 'Çiçek', 'Bahçe']
    }
  },
  {
    id: 'i-bm-sehir',
    title: 'İlkokul Türkiye Şehirleri Kelime Avı Bulmacası',
    level: 'İlkokul',
    category: 'bulmaca',
    categoryLabel: 'Bulmaca & Şehirler',
    iconName: 'MapPin',
    description: 'Matriste gizlenen Türkiye şehirlerini (Ankara, İstanbul, İzmir...) gözlerinizle tarayıp bulun.',
    targetWpm: 0,
    data: {
      type: 'word-search',
      theme: 'city-tr',
      targetWords: ['ANKARA', 'İSTANBUL', 'İZMİR', 'BURSA', 'KONYA', 'ANTALYA', 'ADANA', 'TRABZON']
    }
  },
  {
    id: 'i-bm-hayvan',
    title: 'İlkokul Sevimli Hayvanlar Kelime Avı Bulmacası',
    level: 'İlkokul',
    category: 'bulmaca',
    categoryLabel: 'Bulmaca & Hayvanlar',
    iconName: 'Heart',
    description: 'Sevimli hayvan isimlerini (Kedi, Köpek, Tavşan, Yunus...) matriste tarayıp keşfedin.',
    targetWpm: 0,
    data: {
      type: 'word-search',
      theme: 'animals-cute',
      targetWords: ['KEDİ', 'KÖPEK', 'TAVŞAN', 'YUNUS', 'PENGUEN', 'KUNDUZ', 'KARTAL', 'KELEBEK']
    }
  },

  // =========================================================================
  // ==================== ORTAOKUL / LGS EGZERSİZLERİ (30 ADET) ====================
  // =========================================================================
  
  // 1. Göz Takip (6 Adet)
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
  {
    id: 'o-gt-5',
    title: 'LGS Köşe Çerçeve Sıçraması',
    level: 'Ortaokul',
    category: 'goz-takip',
    categoryLabel: 'Göz Takip',
    iconName: 'Maximize',
    description: 'Görüş açısını ekran köşelerine yayarak LGS paragraf talaması yapın.',
    targetWpm: 330,
    data: {
      type: 'corner-jump',
      defaultSpeedBpm: 170,
      words: ['LGS', 'Paragraf', 'Soru', 'Süre', 'Net', 'Fen', 'Matematik', 'Türkçe']
    }
  },
  {
    id: 'o-gt-6',
    title: 'Spiral Sarmal Göz Takibi',
    level: 'Ortaokul',
    category: 'goz-takip',
    categoryLabel: 'Göz Takip',
    iconName: 'Loader',
    description: 'Dairesel genişleyen hat üzerinde göz odaklanma egzersizi.',
    targetWpm: 340,
    data: {
      type: 'spiral',
      defaultSpeedBpm: 180
    }
  },

  // 2. Sütun Takipleri (6 Adet)
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
        ['Akıl', 'Bilgi'], ['Okuma', 'Anlama'], ['Kelime', 'Cümle'], ['Disiplin', 'Çalışma'],
        ['Paragraf', 'Çözümü'], ['Önemli', 'Detay'], ['Mantar', 'Pano'], ['Gözlem', 'Deney']
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
        ['Hızlı', 'Okuma', 'Tekniği'], ['LGS', 'Türkçe', 'Paragraf'], ['Mantık', 'Muhakeme', 'Sorusu'],
        ['Sınav', 'Süresi', 'Yönetimi'], ['Anlayarak', 'Hızlı', 'Tamamlama']
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
        { left: 'çalışkan', center: '•', right: 'öğrenci' }
      ]
    }
  },
  {
    id: 'o-st-4',
    title: '4 Sütunlu Paragraf Tarama',
    level: 'Ortaokul',
    category: 'sutun-takip',
    categoryLabel: 'Sütun Takibi',
    iconName: 'Grid',
    description: '4 sütunlu blok okuma ile satır sıçrama hızını artırın.',
    targetWpm: 360,
    data: {
      columnsCount: 4,
      wordQuartets: [
        ['LGS', 'Sorularını', 'Hızlı', 'Çöz'], ['Paragrafta', 'Ana', 'Fikri', 'Bul'],
        ['Zamanı', 'Doğru', 'Yönetmeyi', 'Öğren']
      ]
    }
  },
  {
    id: 'o-st-5',
    title: 'Merkez Eksen Zıt Kavramlar',
    level: 'Ortaokul',
    category: 'sutun-takip',
    categoryLabel: 'Sütun Takibi',
    iconName: 'MoreVertical',
    description: 'Merkez dikey çizginin her iki yanındaki kavramları eşzamanlı okuma.',
    targetWpm: 370,
    data: {
      type: 'expanding-block',
      rows: [
        { left: 'Öznel', center: '│', right: 'Nesnel' },
        { left: 'Neden', center: '│', right: 'Sonuç' },
        { left: 'Somut', center: '│', right: 'Soyut' }
      ]
    }
  },
  {
    id: 'o-st-6',
    title: 'Sütunlu Hız Maratonu 3',
    level: 'Ortaokul',
    category: 'sutun-takip',
    categoryLabel: 'Sütun Takibi',
    iconName: 'Zap',
    description: 'Genişletilmiş sütun bloklarında anlık kelime taraması yapın.',
    targetWpm: 380,
    data: {
      columnsCount: 3,
      wordTriplets: [
        ['Gamze', 'Tosun', 'Eğitim'], ['Sınav', 'Stratejisi', 'Derece'], ['Paragraf', 'Çözüm', 'Hızı']
      ]
    }
  },

  // 3. Okuma Metinleri & Takistoskop (6 Adet)
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
  {
    id: 'o-om-5',
    title: 'Takistoskop LGS Kavram Flaşörü (2 Kelime)',
    level: 'Ortaokul',
    category: 'okuma-metni',
    categoryLabel: 'Takistoskop',
    iconName: 'Zap',
    description: 'LGS sözel mantık ve Türkçe terimlerini çift kelimelik flaşörle okuma.',
    targetWpm: 370,
    data: {
      type: 'rsvp',
      words: ['Mantık Soruları', 'Paragraf Çözümü', 'Sözel Mantık', 'Anlayarak Hızlı', 'Gamze Tosun', 'Hedef LGS']
    }
  },
  {
    id: 'o-om-6',
    title: 'LGS Paragraf Metni 2: "Doğa ve Odaklanma"',
    level: 'Ortaokul',
    category: 'okuma-metni',
    categoryLabel: 'Okuma Metni',
    iconName: 'BookOpen',
    description: 'LGS Türkçe ve Fen ortak temalı kavrama ve süre ölçümü metni.',
    targetWpm: 320,
    data: {
      content: 'Doğada vakit geçirmek insan zihnini dinlendirir ve odaklanma süresini artırır. Yeşil alanlarda yapılan yürüyüşler stres hormonlarını azaltarak beynin bilgi depolama alanını ferahlatır. Sınav maratonundaki bir öğrenci için haftada bir doğa yürüyüşü harika bir zihinsel detokstur.',
      wordCount: 36,
      quiz: [
        {
          question: 'Yeşil alanda yürüyüş yapmanın zihne etkisi nedir?',
          options: ['Stresi azaltıp odaklanmayı artırmak', 'Hafızayı zayıflatmak', 'Uykuyu kaçırmak', 'Zaman kaybettirmek'],
          correctAnswer: 0
        }
      ]
    }
  },

  // 4. Dikkat & Odak (6 Adet)
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
  {
    id: 'o-do-6',
    title: 'Yoğun Kelime Matrisi (LGS Odaklanma)',
    level: 'Ortaokul',
    category: 'dikkat-odak',
    categoryLabel: 'Dikkat & Odak',
    iconName: 'Grid',
    description: 'Hedef kelimeyi karışık matriks içerisinde bulup işaretleyin.',
    targetWpm: 0,
    data: {
      type: 'letter-matrix',
      gridWidth: 6,
      gridHeight: 6
    }
  },

  // 5. Bulmacalar & Anagramlar (6 Adet)
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
        { scrambled: 'P A R A G R A F', answer: 'PARAGRAF', hint: 'Metin bölümü' },
        { scrambled: 'M A N T I K', answer: 'MANTIK', hint: 'Akıl yürütme' },
        { scrambled: 'S A Y I S A L', answer: 'SAYISAL', hint: 'Matematik ve Fen' },
        { scrambled: 'D İ K K A T', answer: 'DİKKAT', hint: 'Konsantrasyon' }
      ]
    }
  },
  {
    id: 'o-bm-2',
    title: 'LGS Zıt Anlamlı Kelime Hız Testi',
    level: 'Ortaokul',
    category: 'bulmaca',
    categoryLabel: 'Bulmaca & Anagram',
    iconName: 'Repeat',
    description: 'Verilen kelimenin zıt anlamlısını süre dolmadan doğru seçin.',
    targetWpm: 0,
    data: {
      type: 'word-match',
      matchType: 'antonym',
      pairs: [
        { word: 'Hızlı', match: 'Yavaş' }, { word: 'Cevap', match: 'Soru' },
        { word: 'Kolay', match: 'Zor' }, { word: 'Başlangıç', match: 'Bitiş' }
      ]
    }
  },
  {
    id: 'o-bm-3',
    title: 'LGS Eş Anlamlı Kelime Hız Testi',
    level: 'Ortaokul',
    category: 'bulmaca',
    categoryLabel: 'Bulmaca & Anagram',
    iconName: 'Repeat',
    description: 'LGS Türkçe ve Paragrafta sık çıkan kelimelerin eş anlamlılarını bulun.',
    targetWpm: 0,
    data: {
      type: 'word-match',
      matchType: 'synonym',
      pairs: [
        { word: 'Soru', match: 'Sual' }, { word: 'Cevap', match: 'Yanıt' },
        { word: 'Olanak', match: 'İmkan' }, { word: 'Sözcük', match: 'Kelime' }
      ]
    }
  },
  {
    id: 'o-bm-4',
    title: 'Görsel Kelime Avı (Sözcük Matrisi)',
    level: 'Ortaokul',
    category: 'bulmaca',
    categoryLabel: 'Bulmaca & Anagram',
    iconName: 'Grid',
    description: 'Matris içine gizlenmiş kilit LGS kelimelerini gözünüzle tarayın.',
    targetWpm: 0,
    data: {
      type: 'word-search',
      targetWords: ['LGS', 'OKUMA', 'SINAV', 'ODAK']
    }
  },
  {
    id: 'o-bm-5',
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
        { word: 'DANIŞMANLIK', masked: 'D A N _ Ş M A N L _ K' },
        { word: 'ÖĞRENCİ', masked: 'Ö Ğ _ E N C _' },
        { word: 'PARAGRAF', masked: 'P A _ A G R _ F' }
      ]
    }
  },
  {
    id: 'o-bm-6',
    title: 'LGS Kavram Bulmacası 2',
    level: 'Ortaokul',
    category: 'bulmaca',
    categoryLabel: 'Bulmaca & Anagram',
    iconName: 'Puzzle',
    description: 'Harfleri karışık verilen fen ve matematik terimlerini çözün.',
    targetWpm: 0,
    data: {
      type: 'anagram',
      words: [
        { scrambled: 'H İ P O T E Z', answer: 'HİPOTEZ', hint: 'Varsayım' },
        { scrambled: 'D E N E Y', answer: 'DENEY', hint: 'Test etme' }
      ]
    }
  },
  {
    id: 'o-gt-shape',
    title: 'Daire, Üçgen ve Yıldız Etrafında Oklarla Göz Takibi (Ortaokul)',
    level: 'Ortaokul',
    category: 'goz-takip',
    categoryLabel: 'Göz Takip & Şekiller',
    iconName: 'Compass',
    description: 'Daire, üçgen, yıldız ve sonsuzluk şekillerinde oklar yönünde ritmik göz takibi yapın.',
    targetWpm: 280,
    data: {
      type: 'shape-arrows',
      initialShape: 'triangle',
      dotColor: '#2563EB',
      defaultSpeedBpm: 140,
      words: ['LGS', 'Mantık', 'Analiz', 'Hipotez', 'Kavram', 'Yöntem', 'Sentez', 'Paragraf']
    }
  },
  {
    id: 'o-bm-sehir',
    title: 'Ortaokul Türkiye & Dünya Şehirleri Bulmacası',
    level: 'Ortaokul',
    category: 'bulmaca',
    categoryLabel: 'Bulmaca & Şehirler',
    iconName: 'MapPin',
    description: 'Şehir isimlerini matriste tarayarak dikkat ve okuma hızınızı ölçün.',
    targetWpm: 0,
    data: {
      type: 'word-search',
      theme: 'city-world',
      targetWords: ['İSTANBUL', 'ESKİŞEHİR', 'GAZİANTEP', 'KAYSERİ', 'ERZURUM', 'PARİS', 'LONDRA', 'TOKYO']
    }
  },
  {
    id: 'o-bm-hayvan',
    title: 'Ortaokul Hayvanlar Alemi Matris Bulmacası',
    level: 'Ortaokul',
    category: 'bulmaca',
    categoryLabel: 'Bulmaca & Hayvanlar',
    iconName: 'Heart',
    description: 'Hayvanlar alemi üyelerini (Kartal, Geyik, Kanguru...) matriste hızlıca bulun.',
    targetWpm: 0,
    data: {
      type: 'word-search',
      theme: 'animals-wild',
      targetWords: ['KARTAL', 'GEYİK', 'KUNDUZ', 'YUNUS', 'KANGURU', 'PENGUEN', 'LEOPAR', 'FLAMİNGO']
    }
  },

  // =========================================================================
  // ==================== LİSE & YKS EGZERSİZLERİ (30 ADET) ====================
  // =========================================================================
  
  // 1. Göz Takip (6 Adet)
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
      words: ['Neden', 'Sonuç', 'Amaç', 'Düşünceyi', 'Geliştirme', 'Yolları', 'Özgün', 'Üslup', 'Sentez']
    }
  },
  {
    id: 'l-gt-5',
    title: 'Sonsuzluk Dairesi YKS Rekoru',
    level: 'Lise',
    category: 'goz-takip',
    categoryLabel: 'Göz Takip',
    iconName: 'RotateCw',
    description: 'Yüksek tempolu 8 yörüngesi ile odak sabitleme.',
    targetWpm: 500,
    data: {
      type: 'infinity-loop',
      defaultSpeedBpm: 250
    }
  },
  {
    id: 'l-gt-6',
    title: 'Ultra Hızlı Dikey Sıçrama',
    level: 'Lise',
    category: 'goz-takip',
    categoryLabel: 'Göz Takip',
    iconName: 'ArrowDown',
    description: 'TYT Türkçe paragraflarını blok halinde dikey süzme antrenmanı.',
    targetWpm: 520,
    data: {
      type: 'vertical-dot',
      dotColor: '#9333EA',
      defaultSpeedBpm: 260,
      words: ['Ana', 'Düşünce', 'Yardımcı', 'Düşünce', 'Paragrafta', 'Yapı', 'Anlatım', 'Teknikleri']
    }
  },

  // 2. Sütun Takipleri (6 Adet)
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
        ['Hedef', 'Derece', 'Başarı', 'Disiplin']
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
        { left: 'Nesnel', center: '│', right: 'Öznel' }
      ]
    }
  },
  {
    id: 'l-st-4',
    title: 'Genişleyen Bloğ Okuma YKS',
    level: 'Lise',
    category: 'sutun-takip',
    categoryLabel: 'Sütun Takibi',
    iconName: 'Maximize2',
    description: 'Görme konisini açarak kenar kelimeleri refleks olarak algılama.',
    targetWpm: 510,
    data: {
      type: 'expanding-block',
      rows: [
        { left: 'TYT', center: '•', right: 'AYT' },
        { left: 'felsefe', center: '•', right: 'mantık' },
        { left: 'epistemoloji', center: '•', right: 'metinlerarası' }
      ]
    }
  },
  {
    id: 'l-st-5',
    title: '2 Sütunlu Akademik Bloklar',
    level: 'Lise',
    category: 'sutun-takip',
    categoryLabel: 'Sütun Takibi',
    iconName: 'Columns2',
    description: 'İki sütundaki ağır akademik terimleri tek sıçramada okuyun.',
    targetWpm: 520,
    data: {
      columnsCount: 2,
      wordPairs: [
        ['Paradigma', 'Sentez'], ['Tümevarım', 'Çıkarım'], ['Postmodern', 'Anlatı']
      ]
    }
  },
  {
    id: 'l-st-6',
    title: '3 Sütunlu Derece Okuma Maratonu',
    level: 'Lise',
    category: 'sutun-takip',
    categoryLabel: 'Sütun Takibi',
    iconName: 'Zap',
    description: 'Derece hedefleyen öğrenciler için yüksek hızlı sütun taraması.',
    targetWpm: 550,
    data: {
      columnsCount: 3,
      wordTriplets: [
        ['Zamandan', 'Tasarruf', 'Sağlayın'], ['Turlama', 'Taktiği', 'Uygulayın']
      ]
    }
  },

  // 3. Okuma Metinleri & Takistoskop (6 Adet)
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
      words: ['Anlayarak Hızlı Okuma', 'TYT Türkçe Paragraf', 'Zaman Yönetimi Stratejisi', 'YKS Derece Hedefi', 'Gamze Tosun Koçluk', 'Gelişmiş Odaklanma Egzersizi', 'Epistemolojik Yaklaşım']
    }
  },
  {
    id: 'l-om-5',
    title: 'YKS Takistoskop Flaşör (Tek Kelime Akademik)',
    level: 'Lise',
    category: 'okuma-metni',
    categoryLabel: 'Takistoskop',
    iconName: 'Zap',
    description: 'Ağdalı felsefi ve edebi terimleri milisaniyelik hızda tanıma.',
    targetWpm: 530,
    data: {
      type: 'rsvp',
      words: ['Epistemoloji', 'Ontoloji', 'Aksiyoloji', 'Postmodernizm', 'Üstkurmaca', 'Metinlerarasılık', 'Paradigma', 'Tümdengelim', 'Çıkarım']
    }
  },
  {
    id: 'l-om-6',
    title: 'YKS Paragraf Metni: "Sanatta Özgünlük ve Gelenek"',
    level: 'Lise',
    category: 'okuma-metni',
    categoryLabel: 'Okuma Metni',
    iconName: 'BookOpen',
    description: 'TYT Türkçe 40. soru tarzında yoğun sanat felsefesi paragrafları.',
    targetWpm: 460,
    data: {
      content: 'Sanatta özgünlük, geçmişi tamamen reddetmek değil; geleneğin birikimini özümseyip kendi özgün süzgecinden geçirerek yeni bir söylem üretmektir. Her büyük sanatçı, seleflerinin omuzlarında yükselir ancak gözlerini geleceğin ufuklarına diker.',
      wordCount: 33,
      quiz: [
        {
          question: 'Sanatta özgünlük metne göre ne demektir?',
          options: ['Eskiye benzemek', 'Geleneği özümseyip kendi süzgecinden geçirerek yeni söylem üretmek', 'Geçmişi tamamen yok saymak', 'Taklit etmek'],
          correctAnswer: 1
        }
      ]
    }
  },

  // 4. Dikkat & Odak (6 Adet)
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
    title: 'Gelişmiş Stroop Çelişki Testi (40 Kelime)',
    level: 'Lise',
    category: 'dikkat-odak',
    categoryLabel: 'Dikkat & Odak',
    iconName: 'Palette',
    description: 'Yazıya değil, yazının rengine odaklanarak 40 kelimelik testi tamamlayın.',
    targetWpm: 0,
    data: {
      type: 'stroop',
      itemsCount: 40
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
  {
    id: 'l-do-5',
    title: 'Schulte 6x6 Zirve Tablosu (36 Sayı)',
    level: 'Lise',
    category: 'dikkat-odak',
    categoryLabel: 'Dikkat & Odak',
    iconName: 'Grid',
    description: '1’den 36’ya kadar olan sayıları en hızlı şekilde tarayın.',
    targetWpm: 0,
    data: {
      type: 'schulte',
      gridSize: 6
    }
  },
  {
    id: 'l-do-6',
    title: 'Gelişmiş Stroop Çelişki 2 (Zaman Yarışı)',
    level: 'Lise',
    category: 'dikkat-odak',
    categoryLabel: 'Dikkat & Odak',
    iconName: 'Palette',
    description: 'Yüksek tempo renk-kelime çelişki rekor denemesi.',
    targetWpm: 0,
    data: {
      type: 'stroop',
      itemsCount: 20
    }
  },

  // 5. Bulmacalar & Anagramlar (6 Adet)
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
        { scrambled: 'E P İ S T E M O L O J İ', answer: 'EPİSTEMOLOJİ', hint: 'Bilgi Felsefesi' },
        { scrambled: 'Ü S T K U R M A C A', answer: 'ÜSTKURMACA', hint: 'Roman Tekniği' },
        { scrambled: 'M U H A K E M E', answer: 'MUHAKEME', hint: 'Akıl Yürütme' }
      ]
    }
  },
  {
    id: 'l-bm-2',
    title: 'YKS Eş Anlamlı Kelime Hız Testi',
    level: 'Lise',
    category: 'bulmaca',
    categoryLabel: 'Bulmaca & Anagram',
    iconName: 'Repeat',
    description: 'YKS Türkçe ve Paragrafta sıkça karşılaşılan ağdalı kelimelerin eş anlamlılarını bulun.',
    targetWpm: 0,
    data: {
      type: 'word-match',
      matchType: 'synonym',
      pairs: [
        { word: 'Özgün', match: 'Orijinal' }, { word: 'Yalınlık', match: 'Sadelik' },
        { word: 'Varsayım', match: 'Hipotez' }, { word: 'Yöntem', match: 'Metot' }
      ]
    }
  },
  {
    id: 'l-bm-3',
    title: 'YKS Zıt Anlamlı Kelime Hız Testi',
    level: 'Lise',
    category: 'bulmaca',
    categoryLabel: 'Bulmaca & Anagram',
    iconName: 'Repeat',
    description: 'YKS Paragraf ve Mantık sorularında çeldirici zıt kavramları hızla eşleştirin.',
    targetWpm: 0,
    data: {
      type: 'word-match',
      matchType: 'antonym',
      pairs: [
        { word: 'Soyut', match: 'Somut' }, { word: 'Öznel', match: 'Nesnel' },
        { word: 'Tümdengelim', match: 'Tümevarım' }, { word: 'Geleneksel', match: 'Yenilikçi' }
      ]
    }
  },
  {
    id: 'l-bm-4',
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
    id: 'l-bm-5',
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
        { word: 'PARADİGMA', masked: 'P A R _ D İ G _ A' },
        { word: 'SENTEZ', masked: 'S E _ T E Z' }
      ]
    }
  },
  {
    id: 'l-bm-6',
    title: 'YKS Anagram Maratonu 2',
    level: 'Lise',
    category: 'bulmaca',
    categoryLabel: 'Bulmaca & Anagram',
    iconName: 'Puzzle',
    description: 'Karışık harfli felsefe ve edebiyat kavramlarını hızla çözün.',
    targetWpm: 0,
    data: {
      type: 'anagram',
      words: [
        { scrambled: 'O N T O L O J İ', answer: 'ONTOLOJİ', hint: 'Varlık Felsefesi' },
        { scrambled: 'A K S İ Y O L O J İ', answer: 'AKSİYOLOJİ', hint: 'Değer Felsefesi' }
      ]
    }
  },
  {
    id: 'l-gt-shape',
    title: 'Daire, Üçgen, Yıldız ve Şekiller Etrafında Oklarla Göz Takibi (YKS, KPSS & AGS)',
    level: 'Lise',
    category: 'goz-takip',
    categoryLabel: 'Göz Takip & Şekiller',
    iconName: 'Compass',
    description: 'Daire, üçgen, 5 kollu yıldız, kare ve sonsuzluk döngülerinde oklar yönünde yüksek odaklı göz takibi.',
    targetWpm: 350,
    data: {
      type: 'shape-arrows',
      initialShape: 'circle',
      dotColor: '#C5A059',
      defaultSpeedBpm: 160,
      words: ['KPSS', 'AGS', 'YKS', 'Paragraf', 'Mantık', 'Derece', 'Disiplin', 'Analiz', 'Muhakeme']
    }
  },
  {
    id: 'l-bm-sehir',
    title: 'KPSS & YKS Türkiye Şehirleri ve Coğrafya Bulmacası',
    level: 'Lise',
    category: 'bulmaca',
    categoryLabel: 'Bulmaca & Şehirler',
    iconName: 'MapPin',
    description: 'KPSS ve YKS Coğrafya sınavlarında çıkan Türkiye şehirlerini matriste hızla tespit edin.',
    targetWpm: 0,
    data: {
      type: 'word-search',
      theme: 'city-tr',
      targetWords: ['DİYARBAKIR', 'ŞANLIURFA', 'MARAŞ', 'ANTALYA', 'TRABZON', 'ERZURUM', 'KONYA', 'SİVAS']
    }
  },
  {
    id: 'l-bm-hayvan',
    title: 'KPSS & YKS Yabani ve Deniz Hayvanları Matris Bulmacası',
    level: 'Lise',
    category: 'bulmaca',
    categoryLabel: 'Bulmaca & Hayvanlar',
    iconName: 'Heart',
    description: 'Yabani ve deniz canlılarını matriste gözlerinizle tarayıp odak refleksinizi ölçün.',
    targetWpm: 0,
    data: {
      type: 'word-search',
      theme: 'animals-wild',
      targetWords: ['ZÜRAFA', 'LEOPAR', 'BUFALO', 'FLAMİNGO', 'AHTAPOT', 'KANGURU', 'KARTAL', 'PENGUEN']
    }
  },
  {
    id: 'i-bm-ulke',
    title: 'İlkokul Ülkeler & Başkentler Kelime Bulmacası',
    level: 'İlkokul',
    category: 'bulmaca',
    categoryLabel: 'Bulmaca & Ülkeler',
    iconName: 'Globe',
    description: 'Ülke ve başkent isimlerini (Türkiye, Almanya, Fransa, İtalya...) matriste hızlıca bulun.',
    targetWpm: 0,
    data: {
      type: 'word-search',
      theme: 'countries',
      targetWords: ['TÜRKİYE', 'ALMANYA', 'FRANSA', 'İTALYA', 'JAPONYA', 'KANADA', 'MISIR', 'BREZİLYA']
    }
  },
  {
    id: 'i-bm-doga',
    title: 'İlkokul Doğa & Çevre Kelime Bulmacası',
    level: 'İlkokul',
    category: 'bulmaca',
    categoryLabel: 'Bulmaca & Doğa',
    iconName: 'Trees',
    description: 'Doğa ve çevre terimlerini (Orman, Şelale, Okyanus, Yağmur...) gözlerinizle tarayın.',
    targetWpm: 0,
    data: {
      type: 'word-search',
      theme: 'nature',
      targetWords: ['ORMAN', 'ŞELALE', 'YANARDAĞ', 'OKYANUS', 'YAĞMUR', 'ATMOSFER', 'NEHİR', 'GÜNEŞ']
    }
  },
  {
    id: 'i-bm-meslek',
    title: 'İlkokul Geleceğin Meslekleri Bulmacası',
    level: 'İlkokul',
    category: 'bulmaca',
    categoryLabel: 'Bulmaca & Meslekler',
    iconName: 'Briefcase',
    description: 'Meslek isimlerini (Mühendis, Mimar, Doktor, Yazar, Pilot...) matriste tarayıp keşfedin.',
    targetWpm: 0,
    data: {
      type: 'word-search',
      theme: 'professions',
      targetWords: ['MÜHENDİS', 'MİMAR', 'DOKTOR', 'YAZAR', 'PİLOT', 'SANATÇI', 'AVUKAT', 'HAKİM']
    }
  },
  {
    id: 'i-bm-ders',
    title: 'İlkokul Okul Dersleri & Konuları Bulmacası',
    level: 'İlkokul',
    category: 'bulmaca',
    categoryLabel: 'Bulmaca & Dersler',
    iconName: 'GraduationCap',
    description: 'Okul derslerini (Matematik, Türkçe, Fen, Hayat Bilgisi...) matriste tarayarak öğrenin.',
    targetWpm: 0,
    data: {
      type: 'word-search',
      theme: 'subjects',
      targetWords: ['MATEMATİK', 'TÜRKÇE', 'FİZİK', 'KİMYA', 'BİYOLOJİ', 'TARİH', 'GEOMETRİ', 'MÜZİK']
    }
  },
  {
    id: 'o-bm-ulke',
    title: 'Ortaokul Dünya Ülkeleri & Coğrafya Bulmacası',
    level: 'Ortaokul',
    category: 'bulmaca',
    categoryLabel: 'Bulmaca & Ülkeler',
    iconName: 'Globe',
    description: 'LGS ve genel kültür ülkelerini matriste hızla tespit edin.',
    targetWpm: 0,
    data: {
      type: 'word-search',
      theme: 'countries',
      targetWords: ['İSPANYA', 'İSVEÇ', 'NORVEÇ', 'HOLLANDA', 'JAPONYA', 'HİNDİSTAN', 'ÇİN', 'KORE']
    }
  },
  {
    id: 'o-bm-doga',
    title: 'Ortaokul Ekosistem & Doğa Bilimi Bulmacası',
    level: 'Ortaokul',
    category: 'bulmaca',
    categoryLabel: 'Bulmaca & Doğa',
    iconName: 'Trees',
    description: 'Fen bilimleri ve çevre kavramlarını matriste gözlerinizle bulun.',
    targetWpm: 0,
    data: {
      type: 'word-search',
      theme: 'nature',
      targetWords: ['EKOSİSTEM', 'BİYOÇEŞİTLİLİK', 'ATMOSFER', 'BİOTOP', 'OKYANUS', 'VOLKAN', 'BUZUL', 'FOTO SENTEZ']
    }
  },
  {
    id: 'o-bm-meslek',
    title: 'Ortaokul Kariyer & Meslekler Matris Bulmacası',
    level: 'Ortaokul',
    category: 'bulmaca',
    categoryLabel: 'Bulmaca & Meslekler',
    iconName: 'Briefcase',
    description: 'Geleceğin kariyer mesleklerini matriste arayıp dikkatinizi ölçün.',
    targetWpm: 0,
    data: {
      type: 'word-search',
      theme: 'professions',
      targetWords: ['PSİKOLOG', 'ASTRONOT', 'YAZILIMCI', 'BİYOLOG', 'GENETİKÇİ', 'MİMAR', 'MÜHENDİS', 'DOKTOR']
    }
  },
  {
    id: 'o-bm-ders',
    title: 'Ortaokul LGS Ders & Akıl Yürütme Bulmacası',
    level: 'Ortaokul',
    category: 'bulmaca',
    categoryLabel: 'Bulmaca & Dersler',
    iconName: 'GraduationCap',
    description: 'LGS derslerini ve sözel mantık kavramlarını matriste tarayın.',
    targetWpm: 0,
    data: {
      type: 'word-search',
      theme: 'subjects',
      targetWords: ['PARAGRAF', 'MANTIK', 'FİZİK', 'BİYOLOJİ', 'KİMYA', 'GEOMETRİ', 'MUHAKEME', 'SENTEZ']
    }
  },
  {
    id: 'l-bm-ulke',
    title: 'YKS & KPSS Dünya Coğrafyası & Ülkeler Bulmacası',
    level: 'Lise',
    category: 'bulmaca',
    categoryLabel: 'Bulmaca & Ülkeler',
    iconName: 'Globe',
    description: 'YKS ve KPSS Coğrafya sınavlarında çıkan dünya ülkelerini matriste tarayıp öğrenin.',
    targetWpm: 0,
    data: {
      type: 'word-search',
      theme: 'countries',
      targetWords: ['ARJANTİN', 'AVUSTRALYA', 'ENDONEZYA', 'GÜNEYAFRİKA', 'MEKSİKA', 'ŞİLİ', 'PORT Portekiz', 'İSVİÇRE']
    }
  },
  {
    id: 'l-bm-doga',
    title: 'YKS & KPSS Doğa, Çevre & İklim Bilimi Bulmacası',
    level: 'Lise',
    category: 'bulmaca',
    categoryLabel: 'Bulmaca & Doğa',
    iconName: 'Trees',
    description: 'Coğrafya iklim ve çevre bilimi terimlerini matriste hızla bulun.',
    targetWpm: 0,
    data: {
      type: 'word-search',
      theme: 'nature',
      targetWords: ['BİYOSFER', 'LİTOSFER', 'HİDROSFER', 'ATMOSFER', 'BİYOÇEŞİTLİLİK', 'JEOMORFOLOJİ', 'KLİMATOLOJİ', 'EKOLOJİ']
    }
  },
  {
    id: 'l-bm-meslek',
    title: 'YKS İhtisas Meslekleri & Kariyer Bulmacası',
    level: 'Lise',
    category: 'bulmaca',
    categoryLabel: 'Bulmaca & Meslekler',
    iconName: 'Briefcase',
    description: 'İhtisas mesleklerini matriste tarayıp görsel algınızı güçlendirin.',
    targetWpm: 0,
    data: {
      type: 'word-search',
      theme: 'professions',
      targetWords: ['AKADEMİSYEN', 'BİYOTEKNOLOG', 'AKTUER', 'KİBERNETİK', 'NEVROLOG', 'CERRAH', 'DİPLOMAT', 'MÜHENDİS']
    }
  },
  {
    id: 'l-bm-ders',
    title: 'YKS & TYT / AYT Akademik Disiplinler Bulmacası',
    level: 'Lise',
    category: 'bulmaca',
    categoryLabel: 'Bulmaca & Dersler',
    iconName: 'GraduationCap',
    description: 'YKS akademik disiplinlerini ve bilimsellik terimlerini matriste tarayın.',
    targetWpm: 0,
    data: {
      type: 'word-search',
      theme: 'subjects',
      targetWords: ['EPİSTEMOLOJİ', 'ONTOLOJİ', 'AK SİYOLOJİ', 'POSTMODERNİZM', 'KUANTUM', 'METİNLERARASI', 'MUHAKEME', 'SENTEZ']
    }
  }
];
