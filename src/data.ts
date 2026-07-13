import { Service, Testimonial, SpeedTestText } from './types';

export const SERVICES_DATA: Service[] = [
  {
    id: 'ogrenci-koclugu',
    title: 'Öğrenci Koçluğu',
    shortDesc: 'Bireysel potansiyeli ortaya çıkaran, planlı ve yüksek motivasyon odaklı profesyonel yol arkadaşlığı.',
    longDesc: 'Öğrenci koçluğu, öğrencilerin kendilerini tanımalarını, güçlü yönlerini keşfetmelerini ve akademik hedeflerine doğru emin adımlarla yürümelerini sağlar. Her öğrencinin öğrenme stili, odaklanma süresi ve motivasyon kaynakları farklıdır. Süreç boyunca öğrencinin kendi potansiyelini en üst düzeye çıkarmasına rehberlik ediyoruz.',
    iconName: 'Compass',
    features: [
      'Kişiye Özel Haftalık Çalışma Programı Tasarımı',
      'Sınav Kaygısı, Stres ve Heyecan Kontrolü',
      'Zaman Yönetimi ve Günlük Rutin Planlaması',
      'Deneme Sınavları Sonuç Analizleri ve Yol Haritası',
      'Öğrenme Stilleri Testi ve Doğru Çalışma Metotları'
    ],
    benefits: [
      'Kendi sorumluluğunu alabilen bilinçli öğrenciler yetiştirir.',
      'Ders çalışma isteğini ve içsel motivasyonu sürdürülebilir kılar.',
      'Zamanı verimli kullanarak hobiler ile dersler arasında denge kurar.',
      'Gereksiz kaynak yığılmasını önler, nokta atışı kaynak seçimi sağlar.'
    ]
  },
  {
    id: 'ogrenci-koclugu-egitmenligi',
    title: 'Öğrenci Koçluğu Eğitmenliği',
    shortDesc: 'Geleceğin koçlarını yetiştiren, teorik ve pratik uygulamalı profesyonel eğitmenlik sertifika programı.',
    longDesc: 'Öğrenci Koçluğu Eğitmenliği programı; öğretmenler, psikolojik danışmanlar, veliler veya bu alanda profesyonel kariyer yapmak isteyen bireyler için özel olarak tasarlanmıştır. Program kapsamında, öğrenci psikolojisi, hedef belirleme teknikleri, sınav sistemleri, aile iletişimi ve koçluk araçlarının etkin kullanımı profesyonel düzeyde aktarılır. Bu eğitimi tamamlayarak yetkin ve sertifikalı bir öğrenci koçu eğitiyor ve yönlendiriyor olursunuz.',
    iconName: 'Award',
    features: [
      'Uluslararası standartlarda koçluk metodolojisi ve etik kuralları',
      'Öğrenci psikolojisi, gelişim dönemleri ve motivasyon teknikleri',
      'Haftalık program hazırlama ve deneme analizi profesyonel araçları',
      'Sınav sistemleri (LGS, YKS, DGS) ve tercih danışmanlığı eğitimi',
      'Veli iletişimi, kriz yönetimi ve seans yapılandırma pratikleri'
    ],
    benefits: [
      'Profesyonel Öğrenci Koçu Eğitmeni unvanı ve yeni bir kariyer kapısı elde edersiniz.',
      'Öğrencilerle ve kendi çocuklarınızla çok daha sağlıklı iletişim kurarsınız.',
      'Hazır şablonlar, dijital araçlar ve zengin materyal arşivine sahip olursunuz.',
      'Eğitim sektöründe fark yaratan, yüksek kazanç potansiyelli bir uzmanlık kazanırsınız.'
    ]
  },
  {
    id: 'egitim-danismanligi',
    title: 'Eğitim Danışmanlığı',
    shortDesc: 'Veli, öğrenci ve okul üçgeninde akademik süreçlerin profesyonel koordinasyonu ve okul başarısı takibi.',
    longDesc: 'Eğitim danışmanlığı, sadece sınavlara hazırlık sürecini değil, öğrencinin tüm okul yaşamını kapsayan bütüncül bir yaklaşımdır. Velilerimiz ile sürekli iş birliği içerisinde kalarak, öğrencimizin evdeki ders çalışma ortamından okuldaki sosyal/akademik durumuna kadar her aşamada profesyonel yönlendirmeler yapıyoruz.',
    iconName: 'GraduationCap',
    features: [
      'Bütüncül Akademik Gelişim ve Okul Başarısı Takibi',
      'Düzenli Veli Bilgilendirme ve Koordinasyon Seansları',
      'Evde Verimli Çalışma Ortamının Organize Edilmesi',
      'Eğitim Teknolojileri ve Dijital Takip Sistemleri Entegrasyonu',
      'Öğrencinin Okul ve Öğretmen İletişim Sürecinin Desteklenmesi'
    ],
    benefits: [
      'Veli ile öğrenci arasındaki sınav kaynaklı çatışmaları en aza indirir.',
      'Süreçte belirsizlikleri ortadan kaldırarak veliye güvenli bir liman sunar.',
      'Öğrencinin okul başarısını doğrudan yükseltmeye odaklanır.',
      'Eğitim sürecindeki bütçeyi ve zamanı en doğru şekilde yönetmenizi sağlar.'
    ]
  },
  {
    id: 'yks-lgs-tercihi',
    title: 'YKS & LGS Tercih Danışmanlığı',
    shortDesc: 'Doğru analiz ve stratejik yaklaşımla sıralamanızı en verimli şekilde geleceğe dönüştürme süreci.',
    longDesc: 'Sınavda yüksek puan almak kadar, o puanı ve sıralamayı en doğru şekilde kullanmak da hayati önem taşır. YKS ve LGS tercih dönemleri, kısıtlı sürede yüksek stres altında karar verilmesi gereken kritik dönemlerdir. Bilimsel veriler, kontenjan değişimleri ve eğilimler ışığında en doğru listeyi birlikte hazırlıyoruz.',
    iconName: 'Award',
    features: [
      'Yüzdelik Dilim ve Başarı Sıralaması Detaylı Analizi',
      'Üniversite, Kampüs, Akademik Kadro ve Bölüm Tanıtımları',
      'Nitelikli Liselerin Eğitim Kadrosu ve Proje Detayları',
      'Geleceğin Meslekleri ve İstihdam Olanakları Analizi',
      'Hata Payı Olmayan Stratejik Tercih Listesi Oluşturma'
    ],
    benefits: [
      'Hatalı veya eksik bilgi nedeniyle açıkta kalma riskini sıfıra indirir.',
      'Öğrencinin ilgi alanları ve yeteneklerine en uygun mesleklere yönlendirir.',
      'Üniversitelerin ve liselerin gizli avantajlarını (çift anadal, yurt dışı olanakları vb.) açıklar.',
      'Gelecekte mutsuz olunacak bir okul seçilmesini önler.'
    ]
  },
  {
    id: 'hizli-okuma',
    title: 'Hızlı Okuma Teknikleri',
    shortDesc: 'Okuduğunu anlama oranını kaybetmeden, okuma hızını en az 2 ila 4 katına çıkarma eğitimi.',
    longDesc: 'YKS ve LGS gibi sınavlarda öğrencilerin en büyük düşmanı zamandır. Özellikle uzun paragraf soruları zamanın çoğunu eritir. Hızlı Okuma Teknikleri eğitimi ile göz kaslarımızı eğitiyor, kelimeleri tek tek değil gruplar halinde okumayı öğreniyor ve en önemlisi odaklanma süremizi maksimuma çıkarıyoruz.',
    iconName: 'BookOpen',
    features: [
      'Göz Kaslarını Geliştirme ve Geniş Görüş Alanı Egzersizleri',
      'İç Seslendirmeyi (Sessiz Okurken İçten Tekrarlamayı) Önleme',
      'Blok (Gruplayarak) Okuma ve Satır Sektirme Teknikleri',
      'Paragraf Sorularında Hızlı Okuma ve Çözüm Taktikleri',
      'Odaklanma, Konsantrasyon ve Hafıza Güçlendirme Çalışmaları'
    ],
    benefits: [
      'Sınavlarda Türkçe ve sözel bölümlerde 30-40 dakikaya varan zaman kazandırır.',
      'Okunan kitap sayısını ve bilgi edinme hızını muazzam ölçüde artırır.',
      'Odaklanma ve konsantrasyon kapasitesini geliştirir, dikkat dağınıklığını önler.',
      'Okumayı daha keyifli ve yorucu olmaktan uzak bir hobiye dönüştürür.'
    ]
  }
];

export const TESTIMONIALS_DATA: Testimonial[] = [
  {
    id: '1',
    name: 'Efe Yılmaz',
    role: 'Öğrenci',
    examType: 'YKS',
    achievement: 'YKS Sayısal Türkiye 3.421.si',
    comment: 'Gamze Hocam ile YKS hazırlık sürecine başladığımda çok düzensiz çalışıyordum. Benim için hazırladığı kişiye özel programlar ve her deneme sonrası yaptığı derinlemesine analizler sayesinde eksiklerimi çok hızlı kapattım. Özellikle sınav kaygısı yaşadığım kritik dönemlerdeki motivasyon konuşmaları beni ayakta tuttu. Teşekkürler Gamze Hocam!',
    avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: '2',
    name: 'Zeynep Kaya',
    role: 'Öğrenci',
    examType: 'LGS',
    achievement: 'LGS %0.28 Dilim - Kabataş Erkek Lisesi',
    comment: '8. Sınıf benim için çok stresliydi ama Gamze Abla bana sadece bir öğretmen değil, abla gibi yaklaştı. Hızlı Okuma eğitimi sayesinde LGS sözel kısmında 25 dakika kala tüm soruları bitirip kontrol ettim. Sonuç mükemmel oldu!',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: '3',
    name: 'Merve & Ömer Aksoy',
    role: 'Veli',
    examType: 'Genel',
    achievement: 'Veli Geri Bildirimi',
    comment: 'Oğlumuzun ders çalışma disiplini kurmasında Gamze Hanım adeta bir mucize gerçekleştirdi. Evdeki sürekli ders çalışma kavgalarımız son buldu. Gamze Hanım süreci o kadar profesyonel ve tatlı bir dille yönetti ki, oğlumuz artık kendi sorumluluğunu bilerek çalışıyor. Aile huzurumuz yerine geldi diyebiliriz.',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: '4',
    name: 'Selin Yıldız',
    role: 'Öğrenci',
    examType: 'Hızlı Okuma',
    achievement: '180 d/k -> 520 d/k Hız Artışı',
    comment: 'Kitap okumayı çok sevmeme rağmen çok yavaş okuyordum ve çabuk sıkılıyordum. 6 haftalık eğitim sonucunda okuma hızım neredeyse 3 katına çıktı ve metni çok daha iyi anladığımı fark ettim. Paragraf soruları artık benim için kabus olmaktan çıktı.',
    avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80'
  }
];

export const SPEED_TEST_TEXTS: SpeedTestText[] = [
  {
    id: 'motivasyon-zirvesi',
    title: 'Zirveye Giden Yol (Motivasyon)',
    category: 'Motivasyon',
    content: 'Başarı, bir varış noktası değil, sürekli bir gelişim yolculuğudur. Hayallerine ulaşmak isteyen her öğrencinin ilk yapması gereken şey, kendisine ve yapabileceğine olan inancını taze tutmaktır. Sınavlara hazırlanırken karşılaşılan zorluklar, yorulmalar ve başarısızlık hisleri yolun bir parçasıdır. Önemli olan düştüğünde kalkabilmek, eksiklerini birer öğretmen olarak görebilmek ve her sabah yeni bir gayretle masanın başına oturabilmektir. Unutmayın ki büyük başarılar, küçük adımların her gün istikrarlı bir şekilde tekrarlanmasıyla elde edilir. Bugün çözdüğün her bir soru, okuduğun her bir paragraf seni hayalindeki o geleceğe bir adım daha yaklaştırıyor. Vazgeçmeyenler, tarihin en büyük başarı hikayelerini yazanlardır. Kendine inan, planına sadık kal ve her gün dünden bir adım önde olmak için mücadele et. Gelecek, bugün hazırlananlarındır.',
    wordCount: 125,
    quiz: [
      {
        question: 'Metne göre başarının tanımı aşağıdakilerden hangisidir?',
        options: [
          'Sadece yüksek puanlı bir okulu kazanmaktır.',
          'Bir varış noktası değil, sürekli bir gelişim yolculuğudur.',
          'Hiç hata yapmadan tüm soruları doğru çözmektir.',
          'Zorluklardan kaçarak rahat yaşamaktır.'
        ],
        correctAnswer: 1
      },
      {
        question: 'Büyük başarılar nasıl elde edilir?',
        options: [
          'Sınavdan bir gün önce çok çalışarak.',
          'Sadece şans eseri soruları tahmin ederek.',
          'Küçük adımların her gün istikrarlı bir şekilde tekrarlanmasıyla.',
          'Sürekli dinlenip ders çalışmayı erteleyerek.'
        ],
        correctAnswer: 2
      },
      {
        question: 'Metnin ana fikri aşağıdakilerden hangisidir?',
        options: [
          'Başarıya ulaşmada kararlılık, inanç ve istikrarlı çalışmanın önemi.',
          'Sınavların hayatın tek ve en önemli amacı olduğu.',
          'Hızlı okumanın sadece sözel derslerde işe yaradığı.',
          'Zor derslerin her zaman en sona bırakılması gerektiği.'
        ],
        correctAnswer: 0
      }
    ]
  },
  {
    id: 'hizli-okuma-faydasi',
    title: 'Hızlı Okuma ve Beyin Kapasitesi',
    category: 'Teknik',
    content: 'Çoğu insan, hızlı okuduğunda okuduğunu anlamayacağını düşünür. Oysa bilimsel araştırmalar bunun tam aksini göstermektedir. Beynimiz inanılmaz bir işlem hızına sahiptir. Bizler kelimeleri tek tek ve çok yavaş okuduğumuzda, beynimiz aradaki boşluklarda sıkılır ve başka şeyler düşünmeye başlar. Dikkat dağınıklığı dediğimiz durumun temel nedenlerinden biri yavaş okumaktır. Göz kaslarımızı eğiterek ve kelimeleri tek tek değil, bloklar halinde yani ikişerli, üçerli gruplar halinde algılayarak okuduğumuzda beyne sürekli ve yoğun bilgi akışı sağlarız. Böylece beyin başka taraflara odaklanamaz ve konsantrasyon düzeyi en üst seviyeye çıkar. Sonuç olarak hızlı okuyan biri, yavaş okuyan birine göre okuduğunu çok daha net ve berrak bir şekilde anlar. Hızlı okuma, sadece zamandan tasarruf etmek değil, aynı zamanda beyni daha verimli çalıştırma sanatıdır.',
    wordCount: 124,
    quiz: [
      {
        question: 'Metne göre dikkat dağınıklığının temel sebeplerinden biri nedir?',
        options: [
          'Yavaş okumak ve beynin boşluklarda sıkılarak başka şeyler düşünmesi.',
          'Çok fazla kitap okumak.',
          'Kitapların çok renkli ve resimli olması.',
          'Yüksek sesle kitap okumak.'
        ],
        correctAnswer: 0
      },
      {
        question: 'Blok okuma tekniği ne anlama gelmektedir?',
        options: [
          'Sadece ilk ve son sayfayı okumaktır.',
          'Kelimeleri tek tek değil, ikişerli üçerli gruplar halinde algılamak.',
          'Satır aralarında uzun süre beklemektir.',
          'Metindeki yabancı kelimeleri atlamaktır.'
        ],
        correctAnswer: 1
      },
      {
        question: 'Hızlı okuma ile ilgili doğru olan yargı hangisidir?',
        options: [
          'Hızlı okuyanlar okuduklarını asla hatırlayamazlar.',
          'Okuma hızı arttıkça beynin odaklanma ve anlama oranı da artar.',
          'Hızlı okuma eğitimi sadece yaşlılar içindir.',
          'Yavaş okumak beyni daha az yorar.'
        ],
        correctAnswer: 1
      }
    ]
  }
];
