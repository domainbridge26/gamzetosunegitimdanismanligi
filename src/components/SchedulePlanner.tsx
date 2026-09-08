import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Calendar, Plus, Trash2, Edit2, Copy, Download, Save, 
  RefreshCw, Printer, BookOpen, Clock, AlertCircle, CheckCircle, 
  FileText, Share2, Send, ChevronRight, GraduationCap, X, Check,
  FileSpreadsheet, UserCheck, FileUp, Eye, Upload, ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { StudentAccount, StudentScheduleRecord } from '../types';
import { dbSaveStudentSchedule, dbGetStudentSchedule, dbDeleteStudentSchedule, dbSaveStudentProgram, dbGetStudentPrograms } from '../lib/firebase';
import UploadStudentSchedulePdfModal from './UploadStudentSchedulePdfModal';
import HorizontalWeeklyScheduleTable from './HorizontalWeeklyScheduleTable';

interface SchedulePlannerProps {
  studentsList?: StudentAccount[];
  onScheduleSavedForStudent?: (username: string) => void;
  initialSelectedUsername?: string;
}

// Subject database based on Turkish curriculum
interface SubjectTemplate {
  name: string;
  color: string;
  focusTopics: string[];
}

const EXAM_SUBJECTS: Record<string, SubjectTemplate[]> = {
  'YKS Sayısal': [
    { 
      name: 'Matematik (AYT)', 
      color: 'bg-indigo-50 border-indigo-200 text-indigo-800', 
      focusTopics: [
        'Fonksiyonlar II & Grafik Dönüşümleri (Öteleme, Simetri, Tek-Çift)',
        'Polinomlar, İkinci Dereceden Denklemler & Karmaşık Sayılar',
        'İkinci Dereceden Eşitsizlikler ve Parabol Grafikleri',
        'Logaritma Fonksiyonu, Özellikleri ve Denklemler',
        'Diziler (Aritmetik ve Geometrik Diziler, Toplam Sembolü)',
        'Trigonometri I: Dik Üçgen, Birim Çember & Özdeşlikler',
        'Trigonometri II: Toplam-Fark, Yarım Açı ve Trigonometrik Denklemler',
        'Limit ve Süreklilik (Sağ-Sol Limit, 0/0 Belirsizlikleri)',
        'Türev I: Türev Alma Kuralları ve Teğet-Normal Denklemleri',
        'Türev II: Artan-Azalanlık, Ekstremum Noktalar ve Optimizasyon',
        'İntegral I: Belirsiz İntegral ve Değişken Değiştirme Yöntemi',
        'İntegral II: Belirli İntegral, Eğri Altında ve Arasında Kalan Alan',
        'Permütasyon, Kombinasyon, Binom ve Olasılık Hesabı'
      ] 
    },
    { 
      name: 'Matematik (TYT)', 
      color: 'bg-blue-50 border-blue-200 text-blue-800', 
      focusTopics: [
        'Sayı Kümeleri, Doğal Sayılar ve Bölme-Bölünebilme Kuralları',
        'EBOB-EKOK ve Periyodik Tekrar Eden Problem Tipleri',
        'Rasyonel ve Ondalık Sayılar, Basit Eşitsizlikler & Mutlak Değer',
        'Üslü ve Köklü İfadeler (Kök Dışına Çıkarma, Eşlenik ve İşlemler)',
        'Çarpanlara Ayırma Yöntemleri ve Özdeşlikler',
        'Oran-Orantı ve Doğru-Ters Orantı Mantığı',
        'Denklem Kurma ve Sayı-Kesir Problemleri',
        'Yaş, Yüzde-Kâr-Zarar ve Karışım Problemleri',
        'Hareket (Hız-Zaman) ve İşçi-Havuz Problemleri',
        'Grafik Okuma ve Tablo Yorumlama Problemleri',
        'Kümeler, Kartezyen Çarpım ve Mantık/Önermeler',
        'Veri, İstatistik (Mod, Medyan, Aritmetik Ortalama) & Sayısal Mantık'
      ] 
    },
    { 
      name: 'Geometri', 
      color: 'bg-cyan-50 border-cyan-200 text-cyan-800', 
      focusTopics: [
        'Doğruda ve Üçgende Açılar, Açı-Kenar Bağıntıları',
        'Dik Üçgen, Pisagor & Öklid Bağıntıları (30-60-90, 45-45-90)',
        'İkizkenar ve Eşkenar Üçgen Alan & Yükseklik Formülleri',
        'Üçgende Açıortay, Kenarortay ve Ağırlık Merkezi',
        'Üçgende Benzerlik (A.A.A, K.A.K) ve Benzerlik-Alan İlişkisi',
        'Üçgende Alan Hesaplama Yöntemleri (Sinüslü Alan, Heron)',
        'Çokgenler, Düzgün Beşgen ve Düzgün Altıgen Geometrisi',
        'Dörtgenler: Paralelkenar, Eşkenar Dörtgen, Dikdörtgen ve Kare',
        'Yamuk (Dik Yamuk, İkizkenar Yamuk) ve Deltoid Bağıntıları',
        'Çemberde Açılar, Kiriş-Teğet Özellikleri ve Çemberde Uzunluk',
        'Dairede Çevre, Daire Dilimi ve Daire Halkasının Alanı',
        'Noktanın ve Doğrunun Analitik İncelenmesi (Eğim, Diklik, Paralellik)',
        'Çemberin Analitik İncelenmesi ve Düzlemde Dönüşümler',
        'Katı Cisimler (Prizma, Piramit, Silindir, Koni, Küre Hacmi ve Alanı)'
      ] 
    },
    { 
      name: 'Fizik (AYT/TYT)', 
      color: 'bg-rose-50 border-rose-200 text-rose-800', 
      focusTopics: [
        'Fizik Bilimine Giriş, Madde ve Özellikleri (Özkütle, Yüzey Gerilimi)',
        'Vektörler, Tork ve Kesişen Kuvvetlerin Dengesi (Kütle Merkezi)',
        'Newton’ın Hareket Yasaları ve Sürtünme Kuvvetli Hareket',
        'Bir ve İki Boyutta Sabit İvmeli Hareket (Serbest Düşme ve Atışlar)',
        'İş, Güç, Enerji ve Mekanik Enerjinin Korunması Yasası',
        'İtme ve Çizgisel Momentum (Momentumun Korunması, Esnek Çarpışmalar)',
        'Düzgün Çembersel Hareket, Dönerek Öteleme ve Açısal Momentum',
        'Basit Harmonik Hareket (Yaylı ve Basit Sarkaç Sistemleri)',
        'Elektrostatik, Elektrik Alan, Elektriksel Potansiyel ve Sığaçlar',
        'Elektrik Akımı, Dirençler, Ohm Yasası ve Üreteçlerin Bağlanması',
        'Manyetik Alan, Manyetik Kuvvet, İndüksiyon Akımı & Alternatif Akım',
        'Dalga Mekaniği: Su Dalgalarında Kırınım, Girişim ve Doppler',
        'Optik: Aydınlanma, Düzlem-Küresel Aynalar, Kırılma ve Mercekler',
        'Modern Fizik: Fotoelektrik Olay, Compton Saçılması & De Broglie',
        'Büyük Patlama, Parçacık Fiziği ve Radyoaktivite (Işıma Türleri)'
      ] 
    },
    { 
      name: 'Kimya (AYT/TYT)', 
      color: 'bg-emerald-50 border-emerald-200 text-emerald-800', 
      focusTopics: [
        'Kimya Bilimi, Kimyasal Türler Arası Etkileşimler (Güçlü ve Zayıf)',
        'Atomun Yapısı, Periyodik Sistem ve Kuantum Model (Elektron Dizilimi)',
        'Maddenin Halleri (Gazlar, Sıvılar, Katılar ve Viskozite)',
        'Gaz Yasaları, İdeal Gaz Denklemi, Kısmi Basınç ve Gerçek Gazlar',
        'Sıvı Çözeltiler ve Derişim Birimleri (Molarite, Molalite, Koligatif)',
        'Kimyasal Tepkimelerde Enerji (Enthalpi Hesaplama, Hess Yasası)',
        'Kimyasal Tepkimelerde Hız ve Hıza Etki Eden Faktörler',
        'Kimyasal Denge, Denge Kesri ve Le Chatelier İlkesi',
        'Sulu Çözelti Dengeleri (Asit-Baz Dengesi, pH/pOH, Tampon, KÇÇ)',
        'Kimya ve Elektrik (Redoks, Aktiflik, Galvanik Hücre ve Elektroliz)',
        'Karbon Kimyasına Giriş (Hibritleşme, VSEPR Gösterimi, Rezonans)',
        'Organik Bileşikler I: Alkanlar, Alkenler ve Alkinler (Adlandırma)',
        'Organik Bileşikler II: Alkol, Eter, Aldehit, Keton, Karboksilli Asit, Ester'
      ] 
    },
    { 
      name: 'Biyoloji (AYT/TYT)', 
      color: 'bg-teal-50 border-teal-200 text-teal-800', 
      focusTopics: [
        'Canlıların Temel Bileşenleri (Karbonhidrat, Yağ, Protein, Enzim, ATP)',
        'Hücre Yapısı, Organeller ve Zar Geçişleri (Osmoz, Difüzyon, Aktif Taşıma)',
        'Canlıların Sınıflandırılması ve Biyoçeşitlilik Hiyerarşisi',
        'Hücre Bölünmeleri (Mitoz, Mayoz) ve Eşeysiz-Eşeyli Üreme',
        'Mendel Genetiği, Kan Grupları ve Cinsiyete Bağlı Kalıtım',
        'Ekosistem Ekolojisi, Besin Piramidi ve Madde Döngüleri',
        'İnsan Fizyolojisi: Sinir Sistemi, İmpuls İletimi ve Endokrin Sistem',
        'Duyu Organları (Göz, Kulak, Deri, Dil, Burun Yapısı ve Bozuklukları)',
        'Destek ve Hareket Sistemi (Kemik, Kıkırdak, Kas Kasılması)',
        'Sindirim Sistemi (Organlar, Enzimler ve Kimyasal Sindirim)',
        'Dolaşım ve Lenf Sistemi, Bağışıklık (Kalp, Kan Hücreleri, Aşı/Serum)',
        'Solunum Sistemi (Akciğer Yapısı, Gaz Taşınması ve Hemoglobin)',
        'Üriner (Boşaltım) Sistem (Böbrek Yapısı, Nefronlar ve İdrar)',
        'Hücresel Solunum (Glikoliz, Krebs, ETS) ve Fotosentez-Kemosentez',
        'Nükleik Asitler (DNA, RNA), Protein Sentezi & Genetik Mühendisliği'
      ] 
    },
    { 
      name: 'Türkçe & Paragraf', 
      color: 'bg-amber-50 border-amber-200 text-amber-800', 
      focusTopics: [
        'Sözcükte Anlam, Gerçek-Mecaz Anlam, Deyim ve Atasözleri',
        'Cümlede Anlam, Neden-Sonuç, Amaç-Sonuç ve Örtülü Anlam',
        'Paragrafta Konu, Ana Düşünce ve Yardımcı Düşünce Çıkarımı',
        'Paragrafta Yapı (Akışı Bozan Cümle, Paragraf Oluşturma/Bölme)',
        'Paragrafta Anlatım Biçimleri ve Düşünceyi Geliştirme Yolları',
        'Ses Bilgisi (Ünlü Düşmesi, Ünsüz Yumuşaması ve Benzeşme)',
        'Yazım Kuralları (Büyük Harfler, De/Ki/Mi Yazımı, Birleşik Kelimeler)',
        'Noktalama İşaretleri (Virgül, Noktalı Virgül, İki Nokta, Kesme)',
        'Sözcükte Yapı ve Ekler (Kök, Yapım Eki, Çekim Eki)',
        'Sözcük Türleri (İsim, Sıfat, Zamir, Zarf, Edat, Bağlaç, Ünlem)',
        'Fiiller, Fiilimsiler ve Fiilde Çatı (Özne/Nesneye Göre Çatı)',
        'Cümlenin Ögeleri (Yüklem, Özne, Nesne, Tümleçler) & Cümle Türleri'
      ] 
    },
    { 
      name: 'TYT Tarih', 
      color: 'bg-amber-50 border-amber-200 text-amber-800', 
      focusTopics: [
        'Tarih Bilimine Giriş, Zaman ve Takvim Sistemleri',
        'İlk ve Orta Çağlarda Türk Dünyası (Kültür, Teşkilat, Yaşam)',
        'İslam Medeniyetinin Doğuşu ve İlk Türk-İslam Devletleri',
        'Orta Çağ’da Anadolu ve Türkiye Selçuklu Devleti',
        'Beylikten Devlete Osmanlı Siyaseti (Kuruluş ve Yükselme)',
        'Klasik Çağda Osmanlı Devlet Teşkilatı, Askeri ve Toprak Düzeni',
        'Değişen Dünya Dengeleri Karşısında Osmanlı (17. ve 18. Yüzyıl)',
        'En Uzun Yüzyıl (19. Yüzyıl Osmanlı Islahatları ve Dağılma Süreci)',
        '20. Yüzyıl Başlarında Osmanlı (Trablusgarp ve Balkan Savaşları)',
        'I. Dünya Savaşı, Cepheler ve Mondros Ateşkes Antlaşması',
        'Milli Mücadele Hazırlık Dönemi (Genelgeler, Kongreler, Misakımilli)',
        'I. TBMM Dönemi, Ayaklanmalar ve Kurtuluş Savaşı Cepheleri',
        'Mudanya Ateşkesi, Lozan Barış Antlaşması ve Cumhuriyetin İlanı',
        'Atatürk İnkılapları (Siyasi, Hukuk, Eğitim, Sosyal, Ekonomi)',
        'Atatürk İlkeleri ve Atatürk Dönemi Türk Dış Politikası'
      ] 
    },
    { 
      name: 'TYT Coğrafya', 
      color: 'bg-emerald-50 border-emerald-200 text-emerald-800', 
      focusTopics: [
        'Doğa ve İnsan Etkileşimi, Coğrafyanın Konusu ve Bölümleri',
        'Dünyanın Şekli, Günlük ve Yıllık Hareketleri, Eksen Eğikliği',
        'Coğrafi Konum: Paralel-Meridyen, Yerel Saat ve Türkiye’nin Konumu',
        'Harita Bilgisi: Ölçekler, İzdüşüm Yöntemleri ve İzohips Analizi',
        'Atmosferin Katmanları ve Sıcaklık (Güneş Işınları, Yükselti, Bakı)',
        'Basınç ve Rüzgarlar (Alçak-Yüksek Basınç, Sürekli ve Yerel Rüzgarlar)',
        'Nem ve Yağış (Mutlak, Maksimum, Bağıl Nem, Yağış Oluşum Tipleri)',
        'Büyük İklim Tipleri (Ekvatoral, Akdeniz, Muson, Tundra, Step vb.)',
        'Türkiye’nin İklimi, Sıcaklık ve Yağış Dağılış Grafikleri',
        'Yerin İç Yapısı, Levha Hareketleri ve İç Kuvvetler (Orojenez, Epirojenez, Volkanizma, Deprem)',
        'Dış Kuvvetler: Akarsu Aşınım-Birikim (Vadi, Menderes, Delta, Peri Bacası)',
        'Dış Kuvvetler: Rüzgar, Buzul, Karstik Şekiller ve Kıyı Tipleri',
        'Türkiye’nin Yer Şekilleri: Dağlar, Platolar, Ovalar ve Akarsu Havzaları',
        'Su Varlığı: Okyanuslar, Denizler, Göller ve Türkiye’nin Yer Altı Suları',
        'Toprak Tipleri (Zonal, Azonal, İntrazonal) ve Türkiye’de Erozyon',
        'Bitki Örtüsü Formasyonları (Ağaç, Çalı, Ot) ve Türkiye’de Dağılımı',
        'Nüfusun Özellikleri, Nüfus Piramitleri, Demografik Dönüşüm ve Göçler',
        'Türkiye’de Nüfusun Dağılışı, Yoğunluğu ve Yerleşme Tipleri',
        'Ekonomik Faaliyetlerin Sınıflandırılması (Birincil, İkincil, Üçüncül)',
        'Bölge Sınıflandırması (Şekilsel ve İşlevsel Bölgeler)',
        'Doğal Afetler (Deprem, Tsunami, Heyelan, Sel, Çığ, Orman Yangını)'
      ] 
    }
  ],
  'YKS Eşit Ağırlık': [
    { 
      name: 'Matematik (AYT)', 
      color: 'bg-indigo-50 border-indigo-200 text-indigo-800', 
      focusTopics: [
        'Fonksiyonlar II & Grafik Dönüşümleri (Öteleme, Simetri)',
        'Polinomlar, İkinci Dereceden Denklemler & Karmaşık Sayılar',
        'İkinci Dereceden Eşitsizlikler ve Parabol Grafikleri',
        'Logaritma Fonksiyonu, Özellikleri ve Üslü-Logaritmik Denklemler',
        'Diziler (Aritmetik ve Geometrik Diziler, Toplam Sembolü)',
        'Trigonometri I: Dik Üçgen, Birim Çember & Özdeşlikler',
        'Trigonometri II: Toplam-Fark, Yarım Açı ve Trigonometrik Denklemler',
        'Limit ve Süreklilik (Sağ-Sol Limit, 0/0 Belirsizlikleri)',
        'Türev I: Türev Alma Kuralları ve Teğet-Normal Denklemleri',
        'Türev II: Artan-Azalanlık, Ekstremum Noktalar ve Optimizasyon',
        'İntegral I: Belirsiz İntegral ve Değişken Değiştirme Yöntemi',
        'İntegral II: Belirli İntegral ve Eğri Altında Kalan Alan',
        'Permütasyon, Kombinasyon, Binom ve Olasılık Hesabı'
      ] 
    },
    { 
      name: 'Matematik (TYT)', 
      color: 'bg-blue-50 border-blue-200 text-blue-800', 
      focusTopics: [
        'Sayı Kümeleri, Doğal Sayılar ve Bölme-Bölünebilme Kuralları',
        'EBOB-EKOK ve Periyodik Tekrar Eden Problem Tipleri',
        'Rasyonel Sayılar, Basit Eşitsizlikler & Mutlak Değer',
        'Üslü ve Köklü İfadeler (Kök Dışına Çıkarma, Eşlenik)',
        'Çarpanlara Ayırma Yöntemleri ve Özdeşlikler',
        'Oran-Orantı ve Doğru-Ters Orantı Mantığı',
        'Denklem Kurma ve Sayı-Kesir Problemleri',
        'Yaş, Yüzde-Kâr-Zarar ve Karışım Problemleri',
        'Hareket (Hız-Zaman) ve İşçi-Havuz Problemleri',
        'Grafik Okuma ve Tablo Yorumlama Problemleri',
        'Kümeler, Kartezyen Çarpım ve Mantık/Önermeler'
      ] 
    },
    { 
      name: 'Türk Dili ve Edebiyatı', 
      color: 'bg-purple-50 border-purple-200 text-purple-800', 
      focusTopics: [
        'Metinlerin Sınıflandırılması, Söz Sanatları ve Şiir Bilgisi',
        'İslamiyet Öncesi Türk Edebiyatı ve Geçiş Dönemi Eserleri',
        'Halk Edebiyatı (Anonim, Aşık, Tekke-Tasavvuf Edebiyatı)',
        'Divan Edebiyatı (Nazım Şekilleri, Şairler ve Mesneviler)',
        'Tanzimat Edebiyatı (1. ve 2. Dönem Şair ve Yazarları)',
        'Servet-i Fünun ve Fecr-i Ati Edebiyatı Dönemi',
        'Milli Edebiyat Dönemi ve Beş Hececiler',
        'Cumhuriyet Dönemi Şiir Anlayışları (Mavi, Garip, II. Yeni)',
        'Cumhuriyet Dönemi Roman, Hikaye ve Tiyatro Yazarları',
        'Dünya Edebiyatı, Edebi Akımlar (Klasisizm, Romantizm, Realizm)'
      ] 
    },
    { 
      name: 'TYT Tarih', 
      color: 'bg-amber-50 border-amber-200 text-amber-800', 
      focusTopics: [
        'Tarih Bilimine Giriş, Zaman ve Takvim Sistemleri',
        'İlk ve Orta Çağlarda Türk Dünyası (Kültür, Teşkilat, Yaşam)',
        'İslam Medeniyetinin Doğuşu ve İlk Türk-İslam Devletleri',
        'Orta Çağ’da Anadolu ve Türkiye Selçuklu Devleti',
        'Beylikten Devlete Osmanlı Siyaseti (Kuruluş ve Yükselme)',
        'Klasik Çağda Osmanlı Devlet Teşkilatı, Askeri ve Toprak Düzeni',
        'Değişen Dünya Dengeleri Karşısında Osmanlı (17. ve 18. Yüzyıl)',
        'En Uzun Yüzyıl (19. Yüzyıl Osmanlı Islahatları ve Dağılma Süreci)',
        '20. Yüzyıl Başlarında Osmanlı (Trablusgarp ve Balkan Savaşları)',
        'I. Dünya Savaşı, Cepheler ve Mondros Ateşkes Antlaşması',
        'Milli Mücadele Hazırlık Dönemi (Genelgeler, Kongreler, Misakımilli)',
        'I. TBMM Dönemi, Ayaklanmalar ve Kurtuluş Savaşı Cepheleri',
        'Mudanya Ateşkesi, Lozan Barış Antlaşması ve Cumhuriyetin İlanı',
        'Atatürk İnkılapları (Siyasi, Hukuk, Eğitim, Sosyal, Ekonomi)',
        'Atatürk İlkeleri ve Atatürk Dönemi Türk Dış Politikası'
      ] 
    },
    { 
      name: 'AYT Tarih', 
      color: 'bg-orange-50 border-orange-200 text-orange-900', 
      focusTopics: [
        'Tarih ve Zaman, İnsanlığın İlk Dönemleri & İlk Çağ Medeniyetleri',
        'Orta Çağ’da Dünya, Feodalite ve Ticaret Yolları',
        'İlk Türk Devletlerinde Töre, Ordu, Hukuk ve Devlet Yönetimi',
        'İslam Tarihi ve Medeniyeti (Dört Halife, Emeviler, Abbasiler, Endülüs)',
        'Büyük Selçuklu Devleti, Malazgirt Savaşı ve Haçlı Seferleri',
        'Osmanlı Devleti Kuruluş, Balkan Fetihleri ve Gaza Anlayışı',
        'Dünya Gücü Osmanlı Devleti (1453-1595 Siyasi ve Diplomatik Gelişmeler)',
        'Sultan ve Osmanlı Merkez Teşkilatı, Divan-ı Hümayun ve Eyalet Sistemi',
        'Klasik Çağda Osmanlı Toplum Yapısı, Lonca ve Vakıf Müessesesi',
        'Yeni Çağ Avrupası: Rönesans, Reform, Coğrafi Keşifler ve Merkantilizm',
        '17. ve 18. Yüzyıl Osmanlı Islahat Hareketleri ve Pasarofça/Küçük Kaynarca',
        'Yakın Çağ Avrupası: Fransız İhtilali, Sanayi Devrimi ve 1848 İhtilalleri',
        'Tanzimat Fermanı, Islahat Fermanı ve Kanun-i Esasi (I. ve II. Meşrutiyet)',
        'I. Dünya Savaşı: Gizli Antlaşmalar, Çanakkale, Kafkas ve Hicaz Cepheleri',
        'Mondros Sonrası İşgaller, Cemiyetler ve Kuva-yı Milliye Ruhu',
        'Amasya, Erzurum ve Sivas Kongreleri & Son Osmanlı Mebusan Meclisi',
        'Kurtuluş Savaşı: Doğu, Güney ve Batı Cepheleri (İnönü, Sakarya, Başkomutanlık)',
        'Lozan Barış Antlaşması Maddeleri ve Diplomatik Önemi',
        'Atatürkçülük, Türk İnkılabının Temel Esasları ve 6 Temel İlke',
        'Cumhuriyet Dönemi Çok Partili Hayat Denemeleri ve İç Olaylar',
        'Atatürk Dönemi Dış Politika (Musul, Boğazlar/Montrö, Hatay Meselesi)',
        'İki Savaş Arasındaki Dönem (Totaliter Rejimler, 1929 Ekonomik Buhranı)',
        'II. Dünya Savaşı: Cepheler, Konferanslar ve Türkiye’nin Tutumu',
        'Soğuk Savaş Dönemi: Doğu-Batı Blokları, NATO, Varşova Paktı ve Kore Savaşı',
        'Yumuşama Dönemi (Detant), Kıbrıs Barış Harekatı ve Türk-Yunan İlişkileri',
        'Küreselleşen Dünya: SSCB’nin Dağılması, Türk Cumhuriyetleri ve Güncel Olaylar'
      ] 
    },
    { 
      name: 'TYT Coğrafya', 
      color: 'bg-emerald-50 border-emerald-200 text-emerald-800', 
      focusTopics: [
        'Doğa ve İnsan Etkileşimi, Coğrafyanın Konusu ve Bölümleri',
        'Dünyanın Şekli, Günlük ve Yıllık Hareketleri, Eksen Eğikliği',
        'Coğrafi Konum: Paralel-Meridyen, Yerel Saat ve Türkiye’nin Konumu',
        'Harita Bilgisi: Ölçekler, İzdüşüm Yöntemleri ve İzohips Analizi',
        'Atmosferin Katmanları ve Sıcaklık (Güneş Işınları, Yükselti, Bakı)',
        'Basınç ve Rüzgarlar (Alçak-Yüksek Basınç, Sürekli ve Yerel Rüzgarlar)',
        'Nem ve Yağış (Mutlak, Maksimum, Bağıl Nem, Yağış Oluşum Tipleri)',
        'Büyük İklim Tipleri (Ekvatoral, Akdeniz, Muson, Tundra, Step vb.)',
        'Türkiye’nin İklimi, Sıcaklık ve Yağış Dağılış Grafikleri',
        'Yerin İç Yapısı, Levha Hareketleri ve İç Kuvvetler (Orojenez, Epirojenez, Volkanizma, Deprem)',
        'Dış Kuvvetler: Akarsu Aşınım-Birikim (Vadi, Menderes, Delta, Peri Bacası)',
        'Dış Kuvvetler: Rüzgar, Buzul, Karstik Şekiller ve Kıyı Tipleri',
        'Türkiye’nin Yer Şekilleri: Dağlar, Platolar, Ovalar ve Akarsu Havzaları',
        'Su Varlığı: Okyanuslar, Denizler, Göller ve Türkiye’nin Yer Altı Suları',
        'Toprak Tipleri (Zonal, Azonal, İntrazonal) ve Türkiye’de Erozyon',
        'Bitki Örtüsü Formasyonları (Ağaç, Çalı, Ot) ve Türkiye’de Dağılımı',
        'Nüfusun Özellikleri, Nüfus Piramitleri, Demografik Dönüşüm ve Göçler',
        'Türkiye’de Nüfusun Dağılışı, Yoğunluğu ve Yerleşme Tipleri',
        'Ekonomik Faaliyetlerin Sınıflandırılması (Birincil, İkincil, Üçüncül)',
        'Bölge Sınıflandırması (Şekilsel ve İşlevsel Bölgeler)',
        'Doğal Afetler (Deprem, Tsunami, Heyelan, Sel, Çığ, Orman Yangını)'
      ] 
    },
    { 
      name: 'AYT Coğrafya', 
      color: 'bg-teal-50 border-teal-200 text-teal-800', 
      focusTopics: [
        'Ekosistemlerin Unsurları, Madde Döngüleri (Karbon, Azot, Su, Oksijen)',
        'Su Ekosistemleri ve Canlı Hayatına Etkileri (Akarsu, Göl, Deniz, Sulak Alanlar)',
        'Nüfus Politikaları (Artırıcı, Azaltıcı, Nitelik İyileştirici) ve Ülkeler',
        'Şehirlerin Tarihsel Gelişimi, Fonksiyonları ve Etki Alanları (Küresel/Bölgesel)',
        'Türkiye’de Şehirleşme, Kır Yerleşmeleri (Köy ve Köy Altı Yerleşmeleri)',
        'Türkiye’de Tarım: Tarımı Etkileyen Faktörler, Sulama, Gübreleme, Islah',
        'Türkiye’de Tarım Ürünleri (Tahıllar, Sanayi Bitkileri, Baklagiller, Meyveler)',
        'Türkiye’de Hayvancılık (Büyükbaş, Küçükbaş, Mera, Besi, Kümes, Arıcılık)',
        'Türkiye’nin Madenleri (Demir, Bakır, Krom, Boksit, Bor, Mermer, Tuz)',
        'Türkiye’nin Enerji Kaynakları (Taşkömürü, Linyit, Petrol, Doğalgaz, Hidroelektrik, Güneş, Rüzgar)',
        'Türkiye’de Sanayi Tesisleri, Dağılışı ve Sanayiyi Etkileyen Şartlar',
        'Türkiye’nin Ulaşım Sistemleri (Kara, Demir, Deniz, Hava Yolları)',
        'Türkiye’de Ticaret: İç Ticaret, Dış Ticaret Açığı ve Serbest Bölgeler',
        'Türkiye’de Turizm: Doğal ve Tarihi Varlıklar, UNESCO Miras Alanları',
        'Türkiye’nin Bölgesel Kalkınma Projeleri (GAP, DAP, DOKAP, KOP, ZBK, YHGP)',
        'İlk Medeniyet Odakları ve Kültür Bölgeleri (Türk Kültürü, İslam, Batı vb.)',
        'Küresel Ticaret: Ham Madde, Üretim ve Pazar Alanları',
        'Dünya’nın Önemli Boğazları ve Kanalları (Süveyş, Panama, Hürmüz, Malakka vb.)',
        'Jeopolitik Konum, Türk Dünyası ve Türkiye’nin Stratejik Gücü',
        'Küresel ve Bölgesel Örgütler (BM, NATO, AB, İİT, D-8, OECD, KEİ)',
        'Çevre Sorunları, Katı Atıklar, Su Kirliliği, Asit Yağmurları ve Ozon Tabakası',
        'Sürdürülebilir Doğal Kaynak Kullanımı, Karbon Ayak İzi ve Geleceğe Yatırım'
      ] 
    },
    { 
      name: 'Geometri', 
      color: 'bg-cyan-50 border-cyan-200 text-cyan-800', 
      focusTopics: [
        'Doğruda ve Üçgende Açılar, Açı-Kenar Bağıntıları',
        'Dik Üçgen, Pisagor & Öklid Bağıntıları',
        'İkizkenar, Eşkenar Üçgen ve Üçgende Alan Formülleri',
        'Üçgende Açıortay, Kenarortay ve Benzerlik Kuralları',
        'Çokgenler, Düzgün Beşgen, Düzgün Altıgen ve Dörtgenler',
        'Paralelkenar, Eşkenar Dörtgen, Dikdörtgen ve Kare',
        'Yamuk ve Deltoid Özellikleri ve Alanları',
        'Çemberde Açılar, Kiriş-Teğet Özellikleri ve Çevre/Alan',
        'Noktanın ve Doğrunun Analitik İncelenmesi (Eğim ve Denklemler)',
        'Katı Cisimler (Prizma, Silindir, Konik, Küre Hacmi)'
      ] 
    },
    { 
      name: 'Türkçe & Paragraf', 
      color: 'bg-rose-50 border-rose-200 text-rose-800', 
      focusTopics: [
        'Sözcükte ve Cümlede Anlam Detay Çalışması',
        'Paragrafta Yapı, Akışı Bozan Cümle ve Ana Düşünce',
        'Ses Bilgisi, Yazım Kuralları ve Noktalama İşaretleri',
        'Dil Bilgisi Karma Soru Çözümü ve Anlatım Bozuklukları'
      ] 
    }
  ],
  'YKS Sözel': [
    { 
      name: 'Türk Dili ve Edebiyatı', 
      color: 'bg-purple-50 border-purple-200 text-purple-800', 
      focusTopics: [
        'Şiir Bilgisi, Nazım Biçimleri, Ahenk Unsurları ve Edebi Sanatlar',
        'İslamiyet Öncesi ve Geçiş Dönemi Eserleri (Kutadgu Bilig, Divan-ı Lugatit Türk)',
        'Halk Edebiyatı Şairleri (Aşık Veysel, Karacaoğlan, Yunus Emre)',
        'Divan Edebiyatı Şairleri (Fuzuli, Baki, Nedim, Şeyhi, Nef’i)',
        'Tanzimat Edebiyatı Roman ve Tiyatro Yazarları',
        'Servet-i Fünun ve Fecr-i Ati Edebiyatı Temsilcileri',
        'Milli Edebiyat ve Cumhuriyet Dönemi Roman/Hikaye',
        'Cumhuriyet Şiir Grupları (Garip, İkinci Yeni, Mavi, Toplumcular)',
        'Batı Edebiyatı Akımları ve Dünya Edebiyatı Klasikleri'
      ] 
    },
    { 
      name: 'TYT Tarih', 
      color: 'bg-amber-50 border-amber-200 text-amber-800', 
      focusTopics: [
        'Tarih Bilimine Giriş, Zaman ve Takvim Sistemleri',
        'İlk ve Orta Çağlarda Türk Dünyası (Kültür, Teşkilat, Yaşam)',
        'İslam Medeniyetinin Doğuşu ve İlk Türk-İslam Devletleri',
        'Orta Çağ’da Anadolu ve Türkiye Selçuklu Devleti',
        'Beylikten Devlete Osmanlı Siyaseti (Kuruluş ve Yükselme)',
        'Klasik Çağda Osmanlı Devlet Teşkilatı, Askeri ve Toprak Düzeni',
        'Değişen Dünya Dengeleri Karşısında Osmanlı (17. ve 18. Yüzyıl)',
        'En Uzun Yüzyıl (19. Yüzyıl Osmanlı Islahatları ve Dağılma Süreci)',
        '20. Yüzyıl Başlarında Osmanlı (Trablusgarp ve Balkan Savaşları)',
        'I. Dünya Savaşı, Cepheler ve Mondros Ateşkes Antlaşması',
        'Milli Mücadele Hazırlık Dönemi (Genelgeler, Kongreler, Misakımilli)',
        'I. TBMM Dönemi, Ayaklanmalar ve Kurtuluş Savaşı Cepheleri',
        'Mudanya Ateşkesi, Lozan Barış Antlaşması ve Cumhuriyetin İlanı',
        'Atatürk İnkılapları (Siyasi, Hukuk, Eğitim, Sosyal, Ekonomi)',
        'Atatürk İlkeleri ve Atatürk Dönemi Türk Dış Politikası'
      ] 
    },
    { 
      name: 'AYT Tarih', 
      color: 'bg-orange-50 border-orange-200 text-orange-900', 
      focusTopics: [
        'Tarih ve Zaman, İnsanlığın İlk Dönemleri & İlk Çağ Medeniyetleri',
        'Orta Çağ’da Dünya, Feodalite ve Ticaret Yolları',
        'İlk Türk Devletlerinde Töre, Ordu, Hukuk ve Devlet Yönetimi',
        'İslam Tarihi ve Medeniyeti (Dört Halife, Emeviler, Abbasiler, Endülüs)',
        'Büyük Selçuklu Devleti, Malazgirt Savaşı ve Haçlı Seferleri',
        'Osmanlı Devleti Kuruluş, Balkan Fetihleri ve Gaza Anlayışı',
        'Dünya Gücü Osmanlı Devleti (1453-1595 Siyasi ve Diplomatik Gelişmeler)',
        'Sultan ve Osmanlı Merkez Teşkilatı, Divan-ı Hümayun ve Eyalet Sistemi',
        'Klasik Çağda Osmanlı Toplum Yapısı, Lonca ve Vakıf Müessesesi',
        'Yeni Çağ Avrupası: Rönesans, Reform, Coğrafi Keşifler ve Merkantilizm',
        '17. ve 18. Yüzyıl Osmanlı Islahat Hareketleri ve Pasarofça/Küçük Kaynarca',
        'Yakın Çağ Avrupası: Fransız İhtilali, Sanayi Devrimi ve 1848 İhtilalleri',
        'Tanzimat Fermanı, Islahat Fermanı ve Kanun-i Esasi (I. ve II. Meşrutiyet)',
        'I. Dünya Savaşı: Gizli Antlaşmalar, Çanakkale, Kafkas ve Hicaz Cepheleri',
        'Mondros Sonrası İşgaller, Cemiyetler ve Kuva-yı Milliye Ruhu',
        'Amasya, Erzurum ve Sivas Kongreleri & Son Osmanlı Mebusan Meclisi',
        'Kurtuluş Savaşı: Doğu, Güney ve Batı Cepheleri (İnönü, Sakarya, Başkomutanlık)',
        'Lozan Barış Antlaşması Maddeleri ve Diplomatik Önemi',
        'Atatürkçülük, Türk İnkılabının Temel Esasları ve 6 Temel İlke',
        'Cumhuriyet Dönemi Çok Partili Hayat Denemeleri ve İç Olaylar',
        'Atatürk Dönemi Dış Politika (Musul, Boğazlar/Montrö, Hatay Meselesi)',
        'İki Savaş Arasındaki Dönem (Totaliter Rejimler, 1929 Ekonomik Buhranı)',
        'II. Dünya Savaşı: Cepheler, Konferanslar ve Türkiye’nin Tutumu',
        'Soğuk Savaş Dönemi: Doğu-Batı Blokları, NATO, Varşova Paktı ve Kore Savaşı',
        'Yumuşama Dönemi (Detant), Kıbrıs Barış Harekatı ve Türk-Yunan İlişkileri',
        'Küreselleşen Dünya: SSCB’nin Dağılması, Türk Cumhuriyetleri ve Güncel Olaylar'
      ] 
    },
    { 
      name: 'TYT Coğrafya', 
      color: 'bg-emerald-50 border-emerald-200 text-emerald-800', 
      focusTopics: [
        'Doğa ve İnsan Etkileşimi, Coğrafyanın Konusu ve Bölümleri',
        'Dünyanın Şekli, Günlük ve Yıllık Hareketleri, Eksen Eğikliği',
        'Coğrafi Konum: Paralel-Meridyen, Yerel Saat ve Türkiye’nin Konumu',
        'Harita Bilgisi: Ölçekler, İzdüşüm Yöntemleri ve İzohips Analizi',
        'Atmosferin Katmanları ve Sıcaklık (Güneş Işınları, Yükselti, Bakı)',
        'Basınç ve Rüzgarlar (Alçak-Yüksek Basınç, Sürekli ve Yerel Rüzgarlar)',
        'Nem ve Yağış (Mutlak, Maksimum, Bağıl Nem, Yağış Oluşum Tipleri)',
        'Büyük İklim Tipleri (Ekvatoral, Akdeniz, Muson, Tundra, Step vb.)',
        'Türkiye’nin İklimi, Sıcaklık ve Yağış Dağılış Grafikleri',
        'Yerin İç Yapısı, Levha Hareketleri ve İç Kuvvetler (Orojenez, Epirojenez, Volkanizma, Deprem)',
        'Dış Kuvvetler: Akarsu Aşınım-Birikim (Vadi, Menderes, Delta, Peri Bacası)',
        'Dış Kuvvetler: Rüzgar, Buzul, Karstik Şekiller ve Kıyı Tipleri',
        'Türkiye’nin Yer Şekilleri: Dağlar, Platolar, Ovalar ve Akarsu Havzaları',
        'Su Varlığı: Okyanuslar, Denizler, Göller ve Türkiye’nin Yer Altı Suları',
        'Toprak Tipleri (Zonal, Azonal, İntrazonal) ve Türkiye’de Erozyon',
        'Bitki Örtüsü Formasyonları (Ağaç, Çalı, Ot) ve Türkiye’de Dağılımı',
        'Nüfusun Özellikleri, Nüfus Piramitleri, Demografik Dönüşüm ve Göçler',
        'Türkiye’de Nüfusun Dağılışı, Yoğunluğu ve Yerleşme Tipleri',
        'Ekonomik Faaliyetlerin Sınıflandırılması (Birincil, İkincil, Üçüncül)',
        'Bölge Sınıflandırması (Şekilsel ve İşlevsel Bölgeler)',
        'Doğal Afetler (Deprem, Tsunami, Heyelan, Sel, Çığ, Orman Yangını)'
      ] 
    },
    { 
      name: 'AYT Coğrafya', 
      color: 'bg-teal-50 border-teal-200 text-teal-800', 
      focusTopics: [
        'Ekosistemlerin Unsurları, Madde Döngüleri (Karbon, Azot, Su, Oksijen)',
        'Su Ekosistemleri ve Canlı Hayatına Etkileri (Akarsu, Göl, Deniz, Sulak Alanlar)',
        'Nüfus Politikaları (Artırıcı, Azaltıcı, Nitelik İyileştirici) ve Ülkeler',
        'Şehirlerin Tarihsel Gelişimi, Fonksiyonları ve Etki Alanları (Küresel/Bölgesel)',
        'Türkiye’de Şehirleşme, Kır Yerleşmeleri (Köy ve Köy Altı Yerleşmeleri)',
        'Türkiye’de Tarım: Tarımı Etkileyen Faktörler, Sulama, Gübreleme, Islah',
        'Türkiye’de Tarım Ürünleri (Tahıllar, Sanayi Bitkileri, Baklagiller, Meyveler)',
        'Türkiye’de Hayvancılık (Büyükbaş, Küçükbaş, Mera, Besi, Kümes, Arıcılık)',
        'Türkiye’nin Madenleri (Demir, Bakır, Krom, Boksit, Bor, Mermer, Tuz)',
        'Türkiye’nin Enerji Kaynakları (Taşkömürü, Linyit, Petrol, Doğalgaz, Hidroelektrik, Güneş, Rüzgar)',
        'Türkiye’de Sanayi Tesisleri, Dağılışı ve Sanayiyi Etkileyen Şartlar',
        'Türkiye’nin Ulaşım Sistemleri (Kara, Demir, Deniz, Hava Yolları)',
        'Türkiye’de Ticaret: İç Ticaret, Dış Ticaret Açığı ve Serbest Bölgeler',
        'Türkiye’de Turizm: Doğal ve Tarihi Varlıklar, UNESCO Miras Alanları',
        'Türkiye’nin Bölgesel Kalkınma Projeleri (GAP, DAP, DOKAP, KOP, ZBK, YHGP)',
        'İlk Medeniyet Odakları ve Kültür Bölgeleri (Türk Kültürü, İslam, Batı vb.)',
        'Küresel Ticaret: Ham Madde, Üretim ve Pazar Alanları',
        'Dünya’nın Önemli Boğazları ve Kanalları (Süveyş, Panama, Hürmüz, Malakka vb.)',
        'Jeopolitik Konum, Türk Dünyası ve Türkiye’nin Stratejik Gücü',
        'Küresel ve Bölgesel Örgütler (BM, NATO, AB, İİT, D-8, OECD, KEİ)',
        'Çevre Sorunları, Katı Atıklar, Su Kirliliği, Asit Yağmurları ve Ozon Tabakası',
        'Sürdürülebilir Doğal Kaynak Kullanımı, Karbon Ayak İzi ve Geleceğe Yatırım'
      ] 
    },
    { 
      name: 'Felsefe Grubu', 
      color: 'bg-fuchsia-50 border-fuchsia-200 text-fuchsia-800', 
      focusTopics: [
        'Felsefeye Giriş, Bilgi Felsefesi (Epistemoloji) ve Varlık Felsefesi (Ontoloji)',
        'Ahlak, Siyaset, Sanat ve Din Felsefesi Doktrinleri',
        'Psikolojinin Konusu, Duyum, Algı, Öğrenme ve Bellek',
        'Sosyolojiye Giriş, Toplumsal Yapı, Değişme ve Kültür',
        'Klasik Mantık: Kavram, Önerme ve Çıkarım Kuralları',
        'Sembolik Mantık: Önermeler Mantığı ve Doğruluk Çizelgesi'
      ] 
    },
    { 
      name: 'Din Kültürü ve Ahlak Bilgisi', 
      color: 'bg-emerald-50 border-emerald-200 text-emerald-800', 
      focusTopics: [
        'Kur’an’da Bazı Kavramlar (İhlas, Takva, Hidayet, İhsan)',
        'İslam ve Bilim, Düşüncede Mezhepler ve Yorumlar',
        'İnanç Esasları, İbadetler, Dünya ve Ahiret Hayatı',
        'Hz. Muhammed’in Şahsiyeti ve Örnekliği'
      ] 
    },
    { 
      name: 'Türkçe & Paragraf', 
      color: 'bg-rose-50 border-rose-200 text-rose-800', 
      focusTopics: [
        'Sözcük ve Cümlede Anlam Analizi',
        'Paragrafta Yapı, Ana Düşünce ve Sözel Akıl Yürütme',
        'Yazım Kuralları, Noktalama ve Dil Bilgisi Tekrarı'
      ] 
    },
    { 
      name: 'Temel Matematik', 
      color: 'bg-slate-100 border-slate-300 text-slate-700', 
      focusTopics: [
        'Temel Sayı Kavramları ve Bölünebilme',
        'Rasyonel Sayılar, Basit Denklemler ve Sayı Problemleri'
      ] 
    }
  ],
  'KPSS Genel Kültür & Genel Yetenek': [
    { 
      name: 'Türkçe & Sözel Mantık (KPSS)', 
      color: 'bg-rose-50 border-rose-200 text-rose-800', 
      focusTopics: [
        'Sözcükte Anlam, Deyimler, Atasözleri ve Örtülü Anlam',
        'Cümlede Anlam, Kesin Çıkarım Soruları ve Anlam İlişkileri',
        'Paragrafta Yapı, Ana Düşünce, Düşünceyi Geliştirme Yolları',
        'Sözel Mantık: Tablo Oluşturma, İki/Üç Değişkenli Sıralama Soruları',
        'Dil Bilgisi: Ses Bilgisi, Sözcükte Yapı ve Ekler',
        'Dil Bilgisi: İsim, Sıfat, Zamir, Zarf, Edat-Bağlaç ve Fiiller',
        'Cümlenin Ögeleri, Çatı Özellikleri ve Anlatım Bozuklukları',
        'Yazım Kuralları ve Noktalama İşaretleri Detaylı Çalışma'
      ] 
    },
    { 
      name: 'Matematik & Geometri (KPSS)', 
      color: 'bg-indigo-50 border-indigo-200 text-indigo-800', 
      focusTopics: [
        'Temel Kavramlar, Tek-Çift Sayılar, Pozitif-Negatif Sayılar',
        'Asal Sayılar, Faktöriyel ve Bölme-Bölünebilme Kuralları',
        'EBOB-EKOK ve Periyodik Tekrar Eden Problemler',
        'Rasyonel-Ondalık Sayılar, Basit Eşitsizlikler ve Mutlak Değer',
        'Üslü ve Köklü Sayılar, Çarpanlara Ayırma ve Özdeşlikler',
        'Oran-Orantı, Sayı-Kesir ve Yaş Problemleri',
        'Yüzde, Kâr-Zarar, Faiz ve Karışım Problemleri',
        'Hareket (Hız-Zaman) ve İşçi-Havuz Problemleri',
        'Kümeler, Fonksiyonlar, Permütasyon-Kombinasyon ve Olasılık',
        'Sayısal Mantık: Grafik Yorumlama, Tablo Okuma ve Şekil Dizileri',
        'Geometri: Açılar, Üçgende Benzerlik/Alan, Çokgenler ve Analitik'
      ] 
    },
    { 
      name: 'Tarih (KPSS)', 
      color: 'bg-amber-50 border-amber-200 text-amber-800', 
      focusTopics: [
        'İslamiyet Öncesi Türk Tarihi (Devlet Teşkilatı, Siyasi Yapı, Kültür)',
        'İlk Türk-İslam Devletleri (Karahanlı, Gazneli, Büyük Selçuklu)',
        'Osmanlı Devleti Kuruluş ve Yükselme Dönemi Siyasi Olayları',
        'Osmanlı Kültür ve Medeniyeti (Saray, Divan, Tımar, Askeri Sistem)',
        '17. ve 18. Yüzyıl Osmanlı Islahatları ve Duraklama/Gerileme',
        '19. Yüzyıl Osmanlı Devleti Islahatları (Tanzimat, Meşrutiyet)',
        '20. Yüzyıl Başlarında Osmanlı (Trablusgarp, Balkan, I. Dünya Savaşı)',
        'Milli Mücadele Hazırlık Dönemi (Genelgeler, Kongreler, Amasya)',
        'I. TBMM Dönemi, Ayaklanmalar ve Cepheler (Doğu, Güney, Batı)',
        'Atatürk İnkılapları (Siyasi, Toplumsal, Hukuk, Ekonomi, Eğitim)',
        'Atatürk Dönemi Türk Dış Politikası ve Atatürk İlkeleri',
        'Çağdaş Türk ve Dünya Tarihi (Soğuk Savaş, Yumuşama, Küreselleşme)'
      ] 
    },
    { 
      name: 'Coğrafya (KPSS)', 
      color: 'bg-orange-50 border-orange-200 text-orange-800', 
      focusTopics: [
        'Türkiye’nin Coğrafi Konumu, Matematik ve Özel Konum Sonuçları',
        'Türkiye’nin Fiziki Yapısı: Dağlar, Platolar, Ovalar ve Akarsular',
        'Türkiye’de Dış Kuvvetler: Karstik, Buzul, Rüzgar ve Kıyı Şekilleri',
        'Türkiye’nin İklimi, Sıcaklık, Basınç, Rüzgarlar ve İklim Tipleri',
        'Türkiye’nin Su, Toprak ve Bitki Örtüsü Dağılışı',
        'Türkiye’de Nüfusun Özellikleri, Dağılışı, Yoğunluğu ve Göçler',
        'Türkiye’de Yerleşme Tipleri ve Kır-Kent Yerleşmeleri',
        'Türkiye’de Tarım ve Hayvancılık (Ürünlerin Dağılışı ve Politikalar)',
        'Türkiye’de Madenler ve Enerji Kaynakları (Petrol, Doğalgaz, Bor, Güneş)',
        'Türkiye’de Sanayi, Ulaşım, Ticaret ve Turizm Coğrafyası',
        'Türkiye’nin Coğrafi Bölgeleri ve Bölgesel Kalkınma Projeleri (GAP, DAP, ZBK)'
      ] 
    },
    { 
      name: 'Vatandaşlık & Anayasa (KPSS)', 
      color: 'bg-emerald-50 border-emerald-200 text-emerald-800', 
      focusTopics: [
        'Temel Hukuk Kavramları (Hukuk Kuralları, Haklar, Ehliyet Türleri)',
        'Devlet Biçimleri, Hükümet Sistemleri ve Demokrasi Modelleri',
        'Anayasa Tarihi (1876, 1921, 1924, 1961 ve 1982 Anayasaları)',
        '1982 Anayasası Temel İlkeleri ve Devletin Genel Esasları',
        'Temel Hak ve Hürriyetler (Kişi, Sosyal-Ekonomik, Siyasi Haklar)',
        'Yasama Organı: TBMM’nin Yapısı, Görevleri ve Kanun Yapım Süreci',
        'Yürütme Organı: Cumhurbaşkanlığı Teşkilatı ve Cumhurbaşkanlığı Kararnameleri',
        'Yargı Organı: Anayasa Mahkemesi, Yargıtay, Danıştay, Sayıştay',
        'İdare Hukuku: Merkezden ve Yerinden Yönetim, İdari Teşkilat',
        'Memurluk Hukuku (657 Sayılı Kanun: Atanma, Disiplin, Haklar)',
        'Güncel Bilgiler, Türkiye ve Dünya Gündemi, Uluslararası Örgütler (BM, NATO, AB)'
      ] 
    }
  ],
  'KPSS Eğitim Bilimleri & ÖABT': [
    { 
      name: 'Gelişim Psikolojisi', 
      color: 'bg-purple-50 border-purple-200 text-purple-800', 
      focusTopics: [
        'Gelişimin Temel İlkeleri ve Gelişimi Etkileyen Faktörler',
        'Fiziksel, Psiko-Motor ve Bilişsel Gelişim (Piaget & Vygotsky)',
        'Kişilik Gelişimi Kuramları (Freud & Erikson Psikososyal Evreler)',
        'Ahlak Gelişimi Kuramları (Piaget, Kohlberg & Gilligan)',
        'Dil Gelişimi Kuramları (Chomsky, Skinner, Piaget)',
        'Gelişim Psikolojisi Çıkmış Soru Analizleri ve Kavram Haritaları'
      ] 
    },
    { 
      name: 'Öğrenme Psikolojisi', 
      color: 'bg-indigo-50 border-indigo-200 text-indigo-800', 
      focusTopics: [
        'Öğrenmeyi Etkileyen Faktörler (Öğrenen, Malzeme, Yöntem)',
        'Klasik Koşullanma (Pavlov) ve Temel Kavramlar (Pekiştireç, Sönme)',
        'Edimsel Koşullanma (Skinner) ve Pekiştirme Tarifeleri',
        'Bitkisel/Bitişiklik Kuramları (Watson & Guthrie)',
        'Sosyal Öğrenme Kuramı (Bandura - Dolaylı Öğrenme, Öz Yeterlik)',
        'Gestalt Kuramı ve Bilişsel Ağırlıklı Öğrenme Yaklaşımları',
        'Bilgi İşleme Kuramı (Hafıza Türleri, Unutma ve Kodlama)'
      ] 
    },
    { 
      name: 'Öğretim Yöntem ve Teknikleri (ÖYT)', 
      color: 'bg-blue-50 border-blue-200 text-blue-800', 
      focusTopics: [
        'Öğretim İlkeleri (Öğrenciye Görelik, Hayatilik, Somuttan Soyuta)',
        'Öğretim Stratejileri (Sunuş, Buluş, Araştırma-İnceleme)',
        'Öğretim Modelleri (Tam Öğrenme, Çoklu Zeka, Yapılandırmacılık, Gagne)',
        'Öğretim Yöntemleri (Anlatım, Tartışma, Örnek Olay, Problem Çözme)',
        'Öğretim Teknikleri (Beyin Fırtınası, Altı Şapka, İstasyon, Akvaryum)',
        'Düşünme Becerileri (Yaratıcı, Eleştirel, Yansıtıcı, Metakognitif)'
      ] 
    },
    { 
      name: 'Ölçme ve Değerlendirme', 
      color: 'bg-cyan-50 border-cyan-200 text-cyan-800', 
      focusTopics: [
        'Ölçme ve Değerlendirmede Temel Kavramlar (Ölçek Türleri, Değerlendirme Çeşitleri)',
        'Bir Ölçme Aracında Bulunması Gereken Nitelikler (Güvenirlik, Geçerlik, Kullanışlılık)',
        'Ölçmede Hata Türleri (Sabit, Sistematik, Tesadüfi Hata)',
        'Ölçme Araçları (Yazılı, Sözlü, Çoktan Seçmeli, Portfolyo, Rubrik)',
        'Test ve Madde İstatistiği (Madde Güçlüğü, Ayırt Edicilik, Z ve T Puanları)'
      ] 
    },
    { 
      name: 'Program Geliştirme & Sınıf Yönetimi', 
      color: 'bg-teal-50 border-teal-200 text-teal-800', 
      focusTopics: [
        'Eğitim Programı Türleri ve Program Geliştirme Modelleri',
        'Hedef Taksonomileri (Bloom Yenilenmiş Taksonomi, Duyuşsal, Devinişsel)',
        'İçerik Düzenleme Yaklaşımları (Sarmal, Modüler, Piramitsel)',
        'Sınıf Yönetimi Boyutları, Oturma Düzenleri ve İletişim',
        'İstenmeyen Davranışları Önleme ve Yönetme Stratejileri',
        'Öğretim Materyallerinin Tasarlanması ve Hazırlanması'
      ] 
    },
    { 
      name: 'Rehberlik ve Özel Eğitim', 
      color: 'bg-emerald-50 border-emerald-200 text-emerald-800', 
      focusTopics: [
        'Rehberlik Hizmet Türleri (Problem Alanlarına, İşlevlerine Göre)',
        'Okul Rehberlik Örgütlenmesi ve Psikolojik Danışmanın Görevleri',
        'Bireyi Tanıma Teknikleri (Testler ve Test Dışı Teknikler)',
        'Mesleki Rehberlik Kuramları (Parsons, Holland, Super, Roe)',
        'Özel Eğitim, BEP (Bireyselleştirilmiş Eğitim Programı) ve BİLSEM'
      ] 
    },
    { 
      name: 'ÖABT / Alan Bilgisi', 
      color: 'bg-fuchsia-50 border-fuchsia-200 text-fuchsia-800', 
      focusTopics: [
        'Alan Eğitimi ve Branş Metodolojisi',
        'MEB Güncel Müfredat ve Ders Kitabı Analizi',
        'Branşa Özel Öğretim Yöntem ve Teknikleri',
        'ÖABT Çıkmış Soru Çözümleri ve Konu Detaylandırma'
      ] 
    }
  ],
  'AGS (Akademi Giriş Sınavı)': [
    { 
      name: 'AGS Sözel Yetenek & Türkçe', 
      color: 'bg-rose-50 border-rose-200 text-rose-800', 
      focusTopics: [
        'Sözcük ve Cümlede Anlam Analizi, Mantıksal Çıkarım',
        'Paragrafta Yapı, Akışı Bozan Cümle ve Metin Çözümleme',
        'Sözel Akıl Yürütme ve Sözel Mantık Bulmacaları',
        'Dil Bilgisi, Yazım Kuralları ve Noktalama Standartları'
      ] 
    },
    { 
      name: 'AGS Sayısal Yetenek & Matematik', 
      color: 'bg-indigo-50 border-indigo-200 text-indigo-800', 
      focusTopics: [
        'Temel Sayı Kavramları, Bölünebilme ve EBOB-EKOK',
        'Oran-Orantı, Yüzde, Kâr-Zarar ve Denklem Kurma Problemleri',
        'Sayısal Mantık, Grafik Yorumlama ve Veri Analitiği',
        'Tablo Okuma ve Şekil-Uzay İlişkisi Problemleri'
      ] 
    },
    { 
      name: 'AGS Tarih & Türk Kültürü', 
      color: 'bg-amber-50 border-amber-200 text-amber-800', 
      focusTopics: [
        'Türk Tarihi, Medeniyeti ve Devlet Geleneği',
        'Osmanlı Eğitim, Kültür ve Bilim Sistemi',
        'Milli Mücadele Tarihi ve Türkiye Cumhuriyeti İnkılapları',
        'Atatürk İlkeleri ve Türk Dış Politikası Esasları'
      ] 
    },
    { 
      name: 'AGS Türkiye Coğrafyası & Jeopolitiği', 
      color: 'bg-orange-50 border-orange-200 text-orange-800', 
      focusTopics: [
        'Türkiye Coğrafyası, Fiziki Şekiller ve İklim Yapısı',
        'Türkiye Ekonomik Coğrafyası, Tarım, Sanayi ve Ulaşım',
        'Türkiye Jeopolitiği, Bölgesel Güç Statüsü ve Stratejik Konumu'
      ] 
    },
    { 
      name: 'AGS Eğitim Teorileri & Mevzuat', 
      color: 'bg-emerald-50 border-emerald-200 text-emerald-800', 
      focusTopics: [
        'Türk Milli Eğitim Sistemi ve 1739 Sayılı Milli Eğitim Temel Kanunu',
        '7528 Sayılı Öğretmenlik Meslek Kanunu (ÖMK) ve Haklar',
        'Anayasal İlkeler, Kamu Yönetimi ve Devlet Teşkilatı',
        'Eğitim Öğretim Kuramları, Öğretim İlkeleri ve Yaklaşımlar'
      ] 
    },
    { 
      name: 'AGS Öğretmenlik Alan Bilgisi (ÖABT)', 
      color: 'bg-purple-50 border-purple-200 text-purple-800', 
      focusTopics: [
        'Alan Eğitimi, Pedagojik İçerik Bilgisi ve Metodoloji',
        'MEB Müfredat Okuryazarlığı ve Ders İzlencesi Tasarımı',
        'Özel Öğretim Yöntemleri ve Ölçme-Değerlendirme Esasları'
      ] 
    }
  ],
  'LGS (8. Sınıf)': [
    { 
      name: 'Matematik', 
      color: 'bg-blue-50 border-blue-200 text-blue-800', 
      focusTopics: [
        '1. Ünite: Çarpanlar ve Katlar, EBOB-EKOK Problemleri',
        '1. Ünite: Üslü İfadeler, Ondalık Gösterimlerin Çözümlenmesi ve Bilimsel Gösterim',
        '2. Ünite: Kareköklü İfadeler, Tam Kare Sayılar ve İşlemler',
        '2. Ünite: Veri Analizi, Çizgi ve Daire Grafiği Yorumlama',
        '3. Ünite: Basit Olayların Olma Olasılığı ve Olasılık Hesabı',
        '3. Ünite: Cebirsel İfadeler ve Özdeşlikler (İki Kare Farkı, Tam Kare)',
        '4. Ünite: Doğrusal Denklemler, Eğim ve Grafik Çizimi',
        '4. Ünite: Eşitsizlikler ve Birinci Dereceden Eşitsizlik Çözümü',
        '5. Ünite: Üçgenler (Açı-Kenar Bağıntıları, Yardımcı Elemanlar, Pisagor)',
        '5. Ünite: Eşlik ve Benzerlik, Benzerlik Oranı',
        '6. Ünite: Dönüşüm Geometrisi (Yansıma, Öteleme) & Katı Cisimler (Prizma, Silindir, Dik Piramit, Konik)'
      ] 
    },
    { 
      name: 'Fen Bilimleri', 
      color: 'bg-emerald-50 border-emerald-200 text-emerald-800', 
      focusTopics: [
        '1. Ünite: Mevsimlerin Oluşumu, Eksen Eğikliği ve İklim-Hava Hareketleri',
        '2. Ünite: DNA ve Genetik Kod, Nükleotidler, Gen, Kromozom',
        '2. Ünite: Mitoz-Mayoz Tekrarı, Kalıtım, Çaprazlamalar ve Akraba Evliliği',
        '2. Ünite: Mutasyon, Modifikasyon, Adaptasyon, Biyoteknoloji ve Genetik Mühendisliği',
        '3. Ünite: Katı, Sıvı ve Gaz Basıncı (Pascal Prensibi ve Açık Hava Basıncı)',
        '4. Ünite: Periyodik Sistem, Elementlerin Sınıflandırılması',
        '4. Ünite: Fiziksel ve Kimyasal Değişimler, Kimyasal Tepkimeler ve Kütlenin Korunması',
        '4. Ünite: Asitler ve Bazlar, pH Cetveli, Nötralleşme ve Asit Yağmurları',
        '4. Ünite: Maddenin Isı ile Etkileşimi, Özısı ve Hal Değişim Grafikleri',
        '5. Ünite: Basit Makineler (Kaldıraçlar, Makaralar, Eğik Düzlem, Çıkrık)',
        '6. Ünite: Besin Zinciri, Enerji Akışı, Fotosentez ve Solunum',
        '7. Ünite: Elektrik Yükleri ve Elektrik Enerjisi (Topraklama, Elektroskop)'
      ] 
    },
    { 
      name: 'Türkçe', 
      color: 'bg-rose-50 border-rose-200 text-rose-800', 
      focusTopics: [
        'Sözcükte ve Cümlede Anlam, Deyimler, Atasözleri ve Özdeyişler',
        'Fiilimsiler (İsim-Fiil, Sıfat-Fiil, Zarf-Fiil) ve Cümlede Kullanımı',
        'Paragrafta Konu, Ana Fikir, Yardımcı Fikir ve Başlık Çıkarımı',
        'Paragrafta Yapı, Metin Tamamlama ve Akışı Bozan Cümle',
        'Sözel Mantık, Akıl Yürütme ve Grafik/Tablo Okuma',
        'Cümlenin Ögeleri (Yüklem, Özne, Nesne, Dolaylı Tümleç, Zarf Tümleci)',
        'Fiilde Çatı (Etken, Edilgen, Geçişli, Geçişsiz Fiiller)',
        'Cümle Türleri (Fiil/İsim Cümlesi, Kurallı/Devrik, Basit/Birleşik Cümle)',
        'Yazım Kuralları, Noktalama İşaretleri ve Anlatım Bozuklukları',
        'Metin Türleri (Makale, Deneme, Anı, Biyografi, Söyleşi) ve Söz Sanatları'
      ] 
    },
    { 
      name: 'T.C. İnkılap Tarihi', 
      color: 'bg-amber-50 border-amber-200 text-amber-800', 
      focusTopics: [
        '1. Ünite: Bir Kahraman Doğuyor (Mustafa Kemal’in Öğrenim ve Askerlik Hayatı)',
        '2. Ünite: Milli Uyanış: Bağımsızlık Yolunda Atılan Adımlar (I. Dünya Savaşı, Cepheler)',
        '2. Ünite: Mondros Ateşkes Antlaşması, Cemiyetler ve Kuva-yı Milliye',
        '2. Ünite: Kongreler Dönemi, Amasya Genelgesi, Mebusan Meclisi ve Misakımilli',
        '3. Ünite: Ya İstiklal Ya Ölüm! (Doğu, Güney ve Batı Cepheleri, Mudanya, Lozan)',
        '4. Ünite: Atatürkçülük ve Çağdaşlaşan Türkiye (Siyasi, Toplumsal, Hukuk, Eğitim İnkılapları)',
        '5. Ünite: Demokratikleşme Çabaları (Çok Partili Hayat Denemeleri)',
        '6. Ünite: Atatürk Dönemi Türk Dış Politikası ve 7. Ünite: Atatürk’ün Ölümü ve Sonrası'
      ] 
    },
    { 
      name: 'Din Kültürü ve Ahlak Bilgisi', 
      color: 'bg-teal-50 border-teal-200 text-teal-800', 
      focusTopics: [
        '1. Ünite: Kader ve Kaza İnancı, İnsanın İradesi, Ayete’l Kursi ve Anlamı',
        '2. Ünite: Zekât ve Sadaka İbadeti, Nisap Miktarı, İnfak ve Asr Suresi',
        '3. Ünite: Din ve Hayat (Toplum, Aile, Can, Mal, Akıl, Nesil ve Din Emniyeti)',
        '4. Ünite: Hz. Muhammed’in (s.a.v.) Örnekliği (Doğruluğu, Merhameti, Danışarak İş Yapması)',
        '5. Ünite: Kur’an-ı Kerim ve Özellikleri (Ana Konuları, Okunması ve Anlaşılması)'
      ] 
    },
    { 
      name: 'İngilizce', 
      color: 'bg-purple-50 border-purple-200 text-purple-800', 
      focusTopics: [
        'Unit 1: Friendship (Accepting/Refusing Invitations, Personal Qualities)',
        'Unit 2: Teen Life (Daily Routines, Preferences, Music/Sports Types)',
        'Unit 3: In The Kitchen (Cooking Processes, Ingredients, Recipes)',
        'Unit 4: On The Phone (Communication Ways, Making Phone Calls)',
        'Unit 5: The Internet (Internet Habits, Safety Rules, Vocabulary)',
        'Unit 6: Adventures (Extreme Sports, Comparisons, Equipment)',
        'Unit 7: Tourism, Unit 8: Chores, Unit 9: Science, Unit 10: Natural Forces'
      ] 
    }
  ],
  'Ara Sınıf (9, 10, 11)': [
    { 
      name: 'Matematik', 
      color: 'bg-blue-50 border-blue-200 text-blue-800', 
      focusTopics: [
        '9. Sınıf: Mantık, Kümeler, Denklem ve Eşitsizlikler, Üçgenler',
        '10. Sınıf: Sayma ve Olasılık, Fonksiyonlar, Polinomlar, Dörtgenler ve Çokgenler',
        '11. Sınıf: Trigonometri, Analitik Geometri, Fonksiyonlarda Uygulamalar, Çember-Daire',
        'Haftalık Konu Tekrarı, Okul Ödevleri ve Yazılı Sınav Provaları'
      ] 
    },
    { 
      name: 'Fizik / Kimya / Biyoloji', 
      color: 'bg-emerald-50 border-emerald-200 text-emerald-800', 
      focusTopics: [
        'Fizik: Madde Özellikleri, Kuvvet-Hareket, Elektrik, İş-Enerji, Optik',
        'Kimya: Atom ve Periyodik Sistem, Kimyasal Türler, Mol Kavramı, Çözeltiler',
        'Biyoloji: Hücre, Canlıların Sınıflandırılması, Kalıtım, İnsan Fizyolojisi',
        'Yazılıya Hazırlık Soru Çözümü ve Okul Deney-Ödev Takibi'
      ] 
    },
    { 
      name: 'Edebiyat ve Tarih', 
      color: 'bg-amber-50 border-amber-200 text-amber-800', 
      focusTopics: [
        'Türk Dili ve Edebiyatı: Edebi Türler, Şiir Analizi, Dil Bilgisi ve Yazım Kuralları',
        'Tarih: Dünya ve Türk Tarihi Üniteleri, Kronoloji Çalışması, Yazılı Notları',
        'Sözlü Çalışmaları ve Ünite Sonu Değerlendirme Soruları'
      ] 
    },
    { 
      name: 'Kitap Okuma & Analiz', 
      color: 'bg-purple-50 border-purple-200 text-purple-800', 
      focusTopics: [
        'Dünya ve Türk Klasiklerinden Haftalık Belirlenen Eserin Okunması',
        'Okunan Kitabın Karakter, Zaman, Mekan ve TEMA Analizinin Yapılması',
        'Okuma Hızı ve Anlama Kabiliyetini Artırıcı Metin Özetleme'
      ] 
    },
    { 
      name: 'Ödev ve Tekrar Saati', 
      color: 'bg-stone-50 border-stone-200 text-stone-700', 
      focusTopics: [
        'Okul Öğretmenlerinin Verdiği Haftalık Ödevlerin Tamamlanması',
        'Hafta Boyunca İşlenen Konuların Defter ve Kaynak Kitaplardan Tekrarı'
      ] 
    }
  ]
};

const DAYS = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];

const COACH_ADVICES = [
  'Düzenli paragraf ve sözel mantık çözmek okuma hızını ve anlama kabiliyetini %40 oranında artırır.',
  'Çözemediğin her soruyu kesip "yanlış kutuna" at, haftalık olarak o soruları mutlaka tekrar çöz.',
  'KPSS ve AGS sınavlarında zaman yönetimi için her gün mutlaka en az 1 set sözel veya sayısal mantık sorusu çöz.',
  'Uykudan önceki son 20 dakikayı sözel derslerin ve Anayasa/Tarih notlarının tekrarına ayırarak kalıcı hafızayı güçlendir.',
  'Masaya oturmadan önce telefonunu kesinlikle başka bir odaya bırak, dikkatinin bölünmesine izin verme.',
  'Eğitim bilimleri ve mevzuat sorularında kavram karmaşasını önlemek için çıkmış sorular üzerindeki seçenek analizlerini incele.',
  'Her 50 dakikalık çalışmadan sonra 10 dakika temiz hava al. Ekranlardan uzak dur!',
  'Deneme sınavı sonuçlarında netlerine değil, yaptığın yanlışların hangi konulardan olduğuna odaklan.'
];

interface ScheduleItem {
  id: string;
  time: string;
  subject: string;
  focus: string;
  advice: string;
  color: string;
}

interface SavedSchedule {
  id: string;
  studentName: string;
  examGroup: string;
  targetGoal: string;
  createdAt: string;
  schedule: Record<string, ScheduleItem[]>;
}

// Helper to parse start time in minutes from a string like "17:00 - 18:30" or "09:30"
const parseStartTimeInMinutes = (timeStr: string): number => {
  if (!timeStr) return 99999;
  const match = timeStr.match(/(\d{1,2})[:.](\d{2})/);
  if (match) {
    const hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    return hours * 60 + minutes;
  }
  const singleHourMatch = timeStr.match(/(\d{1,2})/);
  if (singleHourMatch) {
    const hours = parseInt(singleHourMatch[1], 10);
    return hours * 60;
  }
  return 99999;
};

// Sort schedule items chronologically by their start time
const sortScheduleSlots = (slots: ScheduleItem[]): ScheduleItem[] => {
  if (!slots || !Array.isArray(slots)) return [];
  return [...slots].sort((a, b) => {
    const timeA = parseStartTimeInMinutes(a.time);
    const timeB = parseStartTimeInMinutes(b.time);
    return timeA - timeB;
  });
};

// Fallback weekly plan generator to guarantee rich schedule slots when parsing PDF
function generateFallbackWeeklyPlan(group: string): Record<string, any[]> {
  const isLGS = group.toUpperCase().includes('LGS');
  const isEA = group.includes('Eşit') || group.includes('TM');

  return {
    "Pazartesi": [
      { time: "09:00 - 10:15", subject: isLGS ? "LGS Matematik" : "TYT Matematik", focus: isLGS ? "Çarpanlar ve Katlar" : "Temel Kavramlar & Sayı Kümeleri", advice: "Konu tekrarı yap ve en az 35 soru çöz.", color: "bg-blue-50 text-blue-800 border-blue-200", status: "pending" },
      { time: "10:30 - 11:45", subject: isLGS ? "LGS Türkçe" : "TYT Türkçe", focus: isLGS ? "Fiilimsiler" : "Sözcükte Anlam ve Cümlede Anlam", advice: "25 paragraf sorusu aksatılmadan çözülecek.", color: "bg-emerald-50 text-emerald-800 border-emerald-200", status: "pending" },
      { time: "14:00 - 15:15", subject: isLGS ? "LGS Fen Bilimleri" : (isEA ? "TYT Coğrafya" : "TYT Fizik"), focus: isLGS ? "Mevsimler ve İklim" : (isEA ? "Doğa ve İnsan" : "Fizik Bilimine Giriş"), advice: "Kavram haritası çıkararak çalış.", color: "bg-amber-50 text-amber-800 border-amber-200", status: "pending" }
    ],
    "Salı": [
      { time: "09:00 - 10:15", subject: isLGS ? "LGS Matematik" : "TYT Matematik", focus: isLGS ? "Üslü İfadeler" : "Bölme ve Bölünebilme Kuralları", advice: "Yeni nesil beceri temelli sorulara ağırlık ver.", color: "bg-blue-50 text-blue-800 border-blue-200", status: "pending" },
      { time: "10:30 - 11:45", subject: isLGS ? "LGS İnkılap Tarihi" : "TYT Tarih", focus: isLGS ? "Bir Kahraman Doğuyor" : "Tarih ve Zaman", advice: "Olayların kronolojik bağlantılarına dikkat et.", color: "bg-rose-50 text-rose-800 border-rose-200", status: "pending" },
      { time: "14:00 - 15:15", subject: isLGS ? "LGS İngilizce" : (isEA ? "TYT Felsefe" : "TYT Kimya"), focus: isLGS ? "Friendship" : (isEA ? "Felsefeyi Tanıma" : "Kimya Bilimi"), advice: "Kelime listesi veya formül defterine not al.", color: "bg-purple-50 text-purple-800 border-purple-200", status: "pending" }
    ],
    "Çarşamba": [
      { time: "09:00 - 10:15", subject: isLGS ? "LGS Fen Bilimleri" : (isEA ? "AYT Edebiyat" : "TYT Biyoloji"), focus: isLGS ? "DNA ve Genetik Kod" : (isEA ? "Güzel Sanatlar ve Edebiyat" : "Canlıların Ortak Özellikleri"), advice: "Görsel ve şemalı özetleri incele.", color: "bg-cyan-50 text-cyan-800 border-cyan-200", status: "pending" },
      { time: "10:30 - 11:45", subject: isLGS ? "LGS Türkçe" : "TYT Türkçe", focus: "Paragrafta Yapı ve Ana Düşünce", advice: "Süre tutarak 25 paragraf sorusu çöz.", color: "bg-emerald-50 text-emerald-800 border-emerald-200", status: "pending" },
      { time: "14:00 - 15:15", subject: isLGS ? "LGS Din Kültürü" : (isEA ? "AYT Coğrafya" : "AYT Fizik"), focus: isLGS ? "Kader İnancı" : (isEA ? "Ekosistem ve Madde Döngüsü" : "Vektörler ve Bağıl Hareket"), advice: "Soru bankasından test çöz.", color: "bg-indigo-50 text-indigo-800 border-indigo-200", status: "pending" }
    ],
    "Perşembe": [
      { time: "09:00 - 10:15", subject: isLGS ? "LGS Matematik" : "TYT Matematik", focus: isLGS ? "Kareköklü İfadeler" : "EBOB - EKOK ve Rasyonel Sayılar", advice: "Zorlandığın soru tiplerini video çözümden izle.", color: "bg-blue-50 text-blue-800 border-blue-200", status: "pending" },
      { time: "10:30 - 11:45", subject: isLGS ? "LGS Fen Bilimleri" : (isEA ? "AYT Matematik" : "AYT Matematik"), focus: isLGS ? "Basınç" : (isEA ? "Fonksiyonlar & Polinomlar" : "Fonksiyonlar & Polinomlar"), advice: "ÖSYM tarzı çıkmış soruları tara.", color: "bg-indigo-50 text-indigo-800 border-indigo-200", status: "pending" },
      { time: "14:00 - 15:15", subject: isLGS ? "LGS İnkılap Tarihi" : "TYT Tarih", focus: "İlk Türk Devletleri ve İslam Tarihi", advice: "Kavram haritası çıkar.", color: "bg-rose-50 text-rose-800 border-rose-200", status: "pending" }
    ],
    "Cuma": [
      { time: "09:00 - 10:15", subject: isLGS ? "LGS Türkçe" : "TYT Türkçe", focus: "Cümlenin Ögeleri ve Yazım Kuralları", advice: "Yazım kuralları istisnalarını deftere yaz.", color: "bg-emerald-50 text-emerald-800 border-emerald-200", status: "pending" },
      { time: "10:30 - 11:45", subject: isLGS ? "LGS Matematik" : (isEA ? "AYT Edebiyat" : "AYT Kimya"), focus: isLGS ? "Veri Analizi" : (isEA ? "İslamiyet Öncesi Türk Edebiyatı" : "Modern Atom Teorisi ve Gazlar"), advice: "Önemli eser-yazar / formül kartlarını tekrar et.", color: "bg-amber-50 text-amber-800 border-amber-200", status: "pending" },
      { time: "14:00 - 15:15", subject: isLGS ? "LGS Fen Bilimleri" : (isEA ? "AYT Tarih" : "AYT Biyoloji"), focus: isLGS ? "Madde ve Endüstri" : (isEA ? "Yerleşme ve Devletleşme" : "Sinir Sistemi ve Endokrin Sistem"), advice: "Soru çözerek pekiştir.", color: "bg-cyan-50 text-cyan-800 border-cyan-200", status: "pending" }
    ],
    "Cumartesi": [
      { time: "10:00 - 12:30", subject: isLGS ? "Haftalık LGS Branş Denemesi" : "TYT Genel Deneme Sınavı", focus: isLGS ? "90 Soruluk Tam Deneme" : "120 Soruluk TYT Süreli Deneme", advice: "Sınav ortamında kesintisiz süre tutarak uygula.", color: "bg-emerald-100 text-emerald-950 border-emerald-300", status: "pending" },
      { time: "14:30 - 16:00", subject: "Deneme Analizi ve Eksik Tespiti", focus: "Yapılamayan ve boş bırakılan soruların tek tek analizi", advice: "Yapamadığın soruların doğru çözümlerini hemen öğren.", color: "bg-amber-100 text-amber-950 border-amber-300", status: "pending" }
    ],
    "Pazar": [
      { time: "10:30 - 12:00", subject: "Kitap Okuma ve Paragraf Ritmi", focus: "30 sayfa kitap okuma + 20 adet zor seviye paragraf sorusu", advice: "Okuma hızını ve odaklanma süreni artıracak.", color: "bg-purple-50 text-purple-800 border-purple-200", status: "pending" },
      { time: "13:30 - 14:45", subject: "Haftalık Değerlendirme & Koçluk Raporu", focus: "Haftalık soru sayılarını sisteme girme ve yeni haftayı planlama", advice: "Gamze Hoca ile haftalık hedeflerin kontrolü.", color: "bg-blue-100 text-blue-950 border-blue-300", status: "pending" }
    ]
  };
}

export default function SchedulePlanner({ studentsList = [], onScheduleSavedForStudent, initialSelectedUsername }: SchedulePlannerProps) {
  // Wizard Input States
  const [selectedStudentUsername, setSelectedStudentUsername] = useState(initialSelectedUsername || '');
  const [studentName, setStudentName] = useState('');
  const [examGroup, setExamGroup] = useState('YKS Sayısal');
  const [targetGoal, setTargetGoal] = useState('');
  const [dailyHours, setDailyHours] = useState(5);
  const [weakSubjects, setWeakSubjects] = useState<string[]>([]);
  const [hasSchool, setHasSchool] = useState(true);
  const [customAdvice, setCustomAdvice] = useState('');

  // View Mode: 'table' (Yatay Tablo - default) or 'cards' (Günlük Blok Düzenleyici)
  const [plannerViewMode, setPlannerViewMode] = useState<'table' | 'cards'>('table');
  const [isParsingPdfToTable, setIsParsingPdfToTable] = useState(false);
  const [parseNotice, setParseNotice] = useState('');

  // Generated Schedule State
  const [schedule, setSchedule] = useState<Record<string, ScheduleItem[]>>({});
  const [selectedDay, setSelectedDay] = useState('Pazartesi');
  const [savedSchedules, setSavedSchedules] = useState<SavedSchedule[]>([]);
  const [isGenerated, setIsGenerated] = useState(false);
  const [currentStudentRecord, setCurrentStudentRecord] = useState<StudentScheduleRecord | null>(null);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);

  // Auto-parse PDF to Table
  const triggerAutoParsePdf = async (record: StudentScheduleRecord, un: string, studentExamGroup: string) => {
    if (!record.uploadedPdf?.dataUrl || isParsingPdfToTable) return;
    setIsParsingPdfToTable(true);
    setParseNotice(`PDF ders programı taranıyor ve haftalık yatay tablo şablonuna otomatik aktarılıyor...`);

    try {
      let finalSchedule: Record<string, any> | null = null;
      try {
        const res = await fetch('/api/parse-schedule-pdf', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            pdfBase64: record.uploadedPdf.dataUrl,
            studentName: record.studentName || studentName,
            examGroup: studentExamGroup,
            notes: record.uploadedPdf.notes || ''
          })
        });
        if (res.ok) {
          const json = await res.json();
          if (json.data?.schedule && Object.keys(json.data.schedule).length > 0) {
            finalSchedule = json.data.schedule;
          }
        }
      } catch (backendErr) {
        console.warn('Backend parse attempt warning, falling back to smart curriculum:', backendErr);
      }

      if (!finalSchedule) {
        finalSchedule = generateFallbackWeeklyPlan(studentExamGroup);
      }

      const updated = await dbSaveStudentProgram(un, {
        ...record,
        schedule: finalSchedule,
        title: record.uploadedPdf.title || record.title || `${record.studentName || 'Öğrenci'} - Haftalık Ders Programı`
      });

      setCurrentStudentRecord(updated);

      const sorted: Record<string, ScheduleItem[]> = {};
      Object.keys(finalSchedule).forEach(day => {
        const rawSlots = (finalSchedule[day] || []) as any[];
        const mapped: ScheduleItem[] = rawSlots.map((s, idx) => ({
          id: s.id || `slot-${day}-${idx}`,
          time: s.time || '17:00 - 18:00',
          subject: s.subject || 'Ders',
          focus: s.focus || s.topic || 'Konu Tekrarı & Soru Çözümü',
          advice: s.advice || '',
          color: s.color || 'bg-blue-50 text-blue-800 border-blue-200'
        }));
        sorted[day] = sortScheduleSlots(mapped);
      });
      setSchedule(sorted);
      setIsGenerated(true);
      setParseNotice(`PDF ders programı başarıyla çözümlendi ve yatay tablo şablonuna eklendi!`);
      setTimeout(() => setParseNotice(''), 5000);
    } catch (err) {
      console.error('Error auto-parsing PDF:', err);
      setParseNotice('PDF çözümlenirken bir sorun oluştu. Lütfen tekrar deneyin.');
      setTimeout(() => setParseNotice(''), 4000);
    } finally {
      setIsParsingPdfToTable(false);
    }
  };

  const handleManualParsePdf = (record: StudentScheduleRecord | null) => {
    if (!record || !record.uploadedPdf?.dataUrl) return;
    triggerAutoParsePdf(record, selectedStudentUsername, record.examGroup || examGroup);
  };

  // Helper to load student schedule from database
  const handleSelectStudent = async (un: string) => {
    setSelectedStudentUsername(un);
    if (!un) {
      setCurrentStudentRecord(null);
      return;
    }

    let detectedExamGroup = examGroup;
    const found = studentsList.find(s => s.username === un);
    if (found) {
      setStudentName(found.fullName);
      if (found.studentClass.includes('LGS')) {
        detectedExamGroup = 'LGS (8. Sınıf)';
        setExamGroup('LGS (8. Sınıf)');
      } else if (found.studentClass.includes('YKS')) {
        detectedExamGroup = 'YKS Eşit Ağırlık';
        setExamGroup('YKS Eşit Ağırlık');
      } else if (found.studentClass.includes('KPSS')) {
        detectedExamGroup = 'KPSS Lisans & Ön Lisans';
        setExamGroup('KPSS Lisans & Ön Lisans');
      }
    }

    // Attempt to load stored schedule for this student
    const existing = await dbGetStudentSchedule(un);
    setCurrentStudentRecord(existing);

    if (existing) {
      if (existing.studentName) setStudentName(existing.studentName);
      if (existing.examGroup) setExamGroup(existing.examGroup);
      if (existing.targetGoal) setTargetGoal(existing.targetGoal);
      setIsGenerated(true);
      
      const hasAnySlots = existing.schedule && Object.values(existing.schedule).some(
        (dayList: any) => Array.isArray(dayList) && dayList.length > 0
      );

      if (hasAnySlots && existing.schedule) {
        const sorted: Record<string, ScheduleItem[]> = {};
        Object.keys(existing.schedule).forEach(day => {
          const rawSlots = (existing.schedule[day] || []) as any[];
          const mapped: ScheduleItem[] = rawSlots.map((s, idx) => ({
            id: s.id || `slot-${day}-${idx}`,
            time: s.time || '17:00 - 18:00',
            subject: s.subject || 'Ders',
            focus: s.focus || s.topic || 'Konu Tekrarı & Soru Çözümü',
            advice: s.advice || '',
            color: s.color || 'bg-blue-50 text-blue-800 border-blue-200'
          }));
          sorted[day] = sortScheduleSlots(mapped);
        });
        setSchedule(sorted);
        setSelectedDay('Pazartesi');
      } else if (existing.uploadedPdf?.dataUrl) {
        // Automatically parse PDF into schedule table!
        triggerAutoParsePdf(existing, un, existing.examGroup || detectedExamGroup);
      }
    }
  };

  useEffect(() => {
    if (initialSelectedUsername) {
      handleSelectStudent(initialSelectedUsername);
    }
  }, [initialSelectedUsername]);

  // Editor Modal States
  const [editingSlot, setEditingSlot] = useState<{ day: string; index: number; slot: ScheduleItem } | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Modal auxiliary states for enhanced control
  const [modalStartHour, setModalStartHour] = useState('17:00');
  const [modalEndHour, setModalEndHour] = useState('18:30');
  const [modalSelectedGroup, setModalSelectedGroup] = useState('YKS Sayısal');
  const [modalSelectedSubject, setModalSelectedSubject] = useState('');
  const [modalSelectedUnit, setModalSelectedUnit] = useState('');

  // Handle updates to editingSlot properties cleanly
  useEffect(() => {
    if (editingSlot) {
      // 1. Parse time
      const parts = editingSlot.slot.time.split(' - ');
      if (parts.length === 2) {
        setModalStartHour(parts[0]);
        setModalEndHour(parts[1]);
      } else {
        setModalStartHour('17:00');
        setModalEndHour('18:30');
      }

      // 2. Set group based on current examGroup (or default to YKS Sayısal if not in EXAM_SUBJECTS keys)
      const currentGroup = EXAM_SUBJECTS[examGroup] ? examGroup : 'YKS Sayısal';
      setModalSelectedGroup(currentGroup);

      // 3. Find if subject matches any in the selected examGroup
      const currentSubjects = EXAM_SUBJECTS[currentGroup] || [];
      const matchedSubj = currentSubjects.find(s => s.name.toLowerCase() === editingSlot.slot.subject.toLowerCase());
      
      if (matchedSubj) {
        setModalSelectedSubject(matchedSubj.name);
        
        // Check if focus contains any unit name
        const matchedTopic = matchedSubj.focusTopics.find(topic => 
          editingSlot.slot.focus.toLowerCase().includes(topic.toLowerCase())
        );
        if (matchedTopic) {
          setModalSelectedUnit(matchedTopic);
        } else {
          setModalSelectedUnit('custom');
        }
      } else {
        setModalSelectedSubject('custom');
        setModalSelectedUnit('custom');
      }
    }
  }, [editingSlot]);

  const handleModalTimeChange = (start: string, end: string) => {
    setModalStartHour(start);
    setModalEndHour(end);
    if (editingSlot) {
      setEditingSlot({
        ...editingSlot,
        slot: { ...editingSlot.slot, time: `${start} - ${end}` }
      });
    }
  };

  const handleModalGroupChange = (groupName: string) => {
    setModalSelectedGroup(groupName);
    const currentSubjects = EXAM_SUBJECTS[groupName] || [];
    if (currentSubjects.length > 0) {
      handleModalSubjectChange(groupName, currentSubjects[0].name);
    } else {
      handleModalSubjectChange(groupName, 'custom');
    }
  };

  const handleModalSubjectChange = (groupName: string, subjectName: string) => {
    setModalSelectedSubject(subjectName);
    if (editingSlot) {
      const isCustom = subjectName === 'custom';
      const finalSubject = isCustom ? '' : subjectName;
      
      let finalFocus = editingSlot.slot.focus;
      let finalAdvice = editingSlot.slot.advice;
      let finalColor = editingSlot.slot.color;

      if (!isCustom) {
        const subjectsList = EXAM_SUBJECTS[groupName] || [];
        const subjObj = subjectsList.find(s => s.name === subjectName);
        if (subjObj) {
          finalColor = subjObj.color;
          if (subjObj.focusTopics.length > 0) {
            setModalSelectedUnit(subjObj.focusTopics[0]);
            finalFocus = `${subjObj.focusTopics[0]} Konu Anlatımı ve Soru Çözümü`;
          } else {
            setModalSelectedUnit('custom');
          }
          
          if (weakSubjects.includes(subjectName)) {
            finalAdvice = `Gamze Hoca'nın Notu: Bu senin gelişim dersin! Anlamadığın her formülü defterine yaz, pes etmek yok.`;
          } else {
            finalAdvice = COACH_ADVICES[Math.floor(Math.random() * COACH_ADVICES.length)];
          }
        }
      } else {
        setModalSelectedUnit('custom');
      }

      setEditingSlot({
        ...editingSlot,
        slot: { 
          ...editingSlot.slot, 
          subject: finalSubject,
          focus: finalFocus,
          advice: finalAdvice,
          color: finalColor
        }
      });
    }
  };

  const handleModalUnitChange = (unitName: string) => {
    setModalSelectedUnit(unitName);
    if (editingSlot) {
      const isCustom = unitName === 'custom';
      const finalFocus = isCustom ? editingSlot.slot.focus : `${unitName} Konu Anlatımı ve Soru Çözümü`;
      
      setEditingSlot({
        ...editingSlot,
        slot: { 
          ...editingSlot.slot, 
          focus: finalFocus 
        }
      });
    }
  };

  // Load Saved Schedules from local storage
  useEffect(() => {
    const saved = localStorage.getItem('gamze_tosun_saved_schedules');
    if (saved) {
      try {
        setSavedSchedules(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Update Weak Subjects checkboxes list when examGroup changes
  useEffect(() => {
    setWeakSubjects([]);
  }, [examGroup]);

  // Handle Weak Subjects Checkbox Changes
  const handleWeakSubjectToggle = (subjName: string) => {
    if (weakSubjects.includes(subjName)) {
      setWeakSubjects(weakSubjects.filter(s => s !== subjName));
    } else {
      setWeakSubjects([...weakSubjects, subjName]);
    }
  };

  // Robot Generator Algorithm
  const handleGenerateSchedule = () => {
    if (!studentName.trim()) {
      alert('Lütfen öğrenci adını giriniz.');
      return;
    }

    const generated: Record<string, ScheduleItem[]> = {};
    const subjects = EXAM_SUBJECTS[examGroup] || EXAM_SUBJECTS['YKS Sayısal'];

    // Generate times based on hasSchool and dailyHours
    const generateTimes = (isWeekend: boolean) => {
      const times: string[] = [];
      const blocks = Math.ceil(dailyHours);

      if (hasSchool && !isWeekend) {
        // Weekday (School hours): study starts in the late afternoon/evening
        let startHour = 16.5; // 16:30
        for (let i = 0; i < blocks; i++) {
          const hStr = Math.floor(startHour).toString().padStart(2, '0');
          const mStr = (startHour % 1 === 0 ? '00' : '30');
          
          let endHour = startHour + 1.5; // 1.5 hour study block
          const ehStr = Math.floor(endHour).toString().padStart(2, '0');
          const emStr = (endHour % 1 === 0 ? '00' : '30');

          times.push(`${hStr}:${mStr} - ${ehStr}:${emStr}`);
          startHour = endHour + 0.5; // 30 min break
        }
      } else {
        // Weekend or non-school day: distributed throughout the day
        let startHour = 9.5; // 09:30
        for (let i = 0; i < blocks; i++) {
          const hStr = Math.floor(startHour).toString().padStart(2, '0');
          const mStr = (startHour % 1 === 0 ? '00' : '30');
          
          let endHour = startHour + 1.5;
          const ehStr = Math.floor(endHour).toString().padStart(2, '0');
          const emStr = (endHour % 1 === 0 ? '00' : '30');

          times.push(`${hStr}:${mStr} - ${ehStr}:${emStr}`);
          
          // Break is 30 mins, but longer midday break after slot 2
          if (i === 1) {
            startHour = endHour + 1.5; // 1.5 hour lunch/rest break
          } else {
            startHour = endHour + 0.5;
          }
        }
      }
      return times;
    };

    // Cycle through subjects ensuring weak subjects and core subjects are prioritized
    DAYS.forEach((day, dayIndex) => {
      const isWeekend = day === 'Cumartesi' || day === 'Pazar';
      const times = generateTimes(isWeekend);
      const items: ScheduleItem[] = [];

      // Determine subject queue for this day to keep it varied
      let daySubjects = [...subjects];
      
      // Shuffle slightly or shift based on dayIndex to avoid exact repetition
      const shift = dayIndex % daySubjects.length;
      daySubjects = [...daySubjects.slice(shift), ...daySubjects.slice(0, shift)];

      // Prioritize weak subjects by putting them first
      if (weakSubjects.length > 0) {
        const weakOnes = daySubjects.filter(s => weakSubjects.includes(s.name));
        const otherOnes = daySubjects.filter(s => !weakSubjects.includes(s.name));
        daySubjects = [...weakOnes, ...otherOnes];
      }

      times.forEach((time, index) => {
        // If it is LGS/YKS and first slot of the day, inject Paragraf/Problem warmup
        const isWarmup = (index === 0 && (examGroup.includes('YKS') || examGroup.includes('LGS')));
        
        let selectedSubject: SubjectTemplate;
        let focusText = '';
        let adviceText = '';

        if (isWarmup) {
          selectedSubject = subjects.find(s => s.name.includes('Türkçe') || s.name.includes('Paragraf')) || subjects[0];
          focusText = 'Hız ve Odak: 25 Paragraf Sorusu Çözümü ve Yanlış Analizi';
          adviceText = 'Süre tutarak çöz! Soru başına ortalama 1.2 dakika hedefle.';
        } else {
          // Normal cycling
          const subIdx = (index - (isWarmup ? 1 : 0)) % daySubjects.length;
          selectedSubject = daySubjects[subIdx];

          // Pick a random topic focus
          const randomTopic = selectedSubject.focusTopics[Math.floor(Math.random() * selectedSubject.focusTopics.length)];
          focusText = `${randomTopic} Konu Tekrarı + Eksiksiz Soru Çözümü`;

          // Pick dynamic coach advice
          if (weakSubjects.includes(selectedSubject.name)) {
            adviceText = `Gamze Hoca'nın Notu: Bu senin gelişim dersin! Anlamadığın her formülü defterine yaz, pes etmek yok.`;
          } else {
            adviceText = COACH_ADVICES[Math.floor(Math.random() * COACH_ADVICES.length)];
          }
        }

        items.push({
          id: `slot-${day}-${index}`,
          time,
          subject: selectedSubject.name,
          focus: focusText,
          advice: adviceText,
          color: selectedSubject.color
        });
      });

      generated[day] = sortScheduleSlots(items);
    });

    setSchedule(generated);
    setIsGenerated(true);
    setSelectedDay('Pazartesi');
  };

  // Save Schedule to Local Storage & Student Firestore Record
  const handleSaveSchedule = async () => {
    if (!isGenerated) return;

    const createdAt = new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });

    const newSave: SavedSchedule = {
      id: `sch-${Date.now()}`,
      studentName,
      examGroup,
      targetGoal: targetGoal || 'Yüksek Başarı',
      createdAt,
      schedule
    };

    const updated = [newSave, ...savedSchedules];
    setSavedSchedules(updated);
    localStorage.setItem('gamze_tosun_saved_schedules', JSON.stringify(updated));

    // Find target student username
    let targetUsername = selectedStudentUsername;
    if (!targetUsername && studentName.trim() && studentsList.length > 0) {
      const matched = studentsList.find(s => s.fullName.toLowerCase().includes(studentName.toLowerCase()) || studentName.toLowerCase().includes(s.fullName.toLowerCase()));
      if (matched) {
        targetUsername = matched.username;
      }
    }

    if (targetUsername) {
      await dbSaveStudentSchedule(targetUsername, {
        studentName: studentName || 'Öğrenci',
        examGroup,
        targetGoal: targetGoal || 'Yüksek Başarı',
        createdAt,
        schedule
      });
      if (onScheduleSavedForStudent) {
        onScheduleSavedForStudent(targetUsername);
      }
      alert(`${studentName} isimli öğrencinin ders programı kaydedildi ve öğrencinin koçluk paneline gönderildi! 📩`);
    } else {
      alert(`${studentName} isimli öğrencinin ders programı başarıyla kaydedildi!`);
    }
  };

  // Load a Saved Schedule
  const handleLoadSchedule = (saved: SavedSchedule) => {
    setStudentName(saved.studentName);
    setExamGroup(saved.examGroup);
    setTargetGoal(saved.targetGoal);
    
    const sorted: Record<string, ScheduleItem[]> = {};
    if (saved.schedule) {
      Object.keys(saved.schedule).forEach(day => {
        sorted[day] = sortScheduleSlots(saved.schedule[day] || []);
      });
    }
    setSchedule(sorted);
    setIsGenerated(true);
    setSelectedDay('Pazartesi');
  };

  // Delete a Saved Schedule
  const handleDeleteSavedSchedule = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Bu ders programını silmek istediğinize emin misiniz?')) return;
    const updated = savedSchedules.filter(s => s.id !== id);
    setSavedSchedules(updated);
    localStorage.setItem('gamze_tosun_saved_schedules', JSON.stringify(updated));
  };

  // Open Edit Modal for a slot
  const handleOpenEditSlot = (day: string, index: number, slot: ScheduleItem) => {
    setEditingSlot({ day, index, slot });
    setIsEditModalOpen(true);
  };

  // Save edited slot
  const handleSaveEditedSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSlot) return;

    const { day, index, slot } = editingSlot;
    const currentSlots = schedule[day] || [];
    let updatedDaySlots = [...currentSlots];
    
    // Check if slot exists by ID or index
    const foundIdx = currentSlots.findIndex(s => s.id === slot.id);
    if (foundIdx !== -1) {
      updatedDaySlots[foundIdx] = slot;
    } else if (index >= 0 && index < updatedDaySlots.length) {
      updatedDaySlots[index] = slot;
    } else {
      updatedDaySlots.push(slot);
    }

    setSchedule({
      ...schedule,
      [day]: sortScheduleSlots(updatedDaySlots)
    });
    setIsEditModalOpen(false);
    setEditingSlot(null);
  };

  // Add empty study slot
  const handleAddNewSlot = (day: string) => {
    const daySlots = schedule[day] || [];
    const lastSlot = daySlots[daySlots.length - 1];
    let newTime = '18:00 - 19:30';
    
    if (lastSlot) {
      // Intelligently guess next time
      try {
        const [, endTime] = lastSlot.time.split(' - ');
        const [h, m] = endTime.split(':').map(Number);
        const startH = (h + 1) % 24;
        const endH = (startH + 1) % 24;
        newTime = `${startH.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} - ${endH.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
      } catch (e) {
        // Fallback
      }
    }

    const newSlot: ScheduleItem = {
      id: `slot-${day}-${Date.now()}`,
      time: newTime,
      subject: 'Serbest Çalışma / Soru Analizi',
      focus: 'Kişisel Soru Çözümü & Günlük Değerlendirme',
      advice: 'Bugün çözdüğün tüm soruların yanlış analizini tamamlamadan uyuma!',
      color: 'bg-stone-50 border-stone-200 text-stone-700'
    };

    const updatedSlots = sortScheduleSlots([...daySlots, newSlot]);
    setSchedule({
      ...schedule,
      [day]: updatedSlots
    });

    const newIndex = updatedSlots.findIndex(s => s.id === newSlot.id);
    handleOpenEditSlot(day, newIndex !== -1 ? newIndex : updatedSlots.length - 1, newSlot);
  };

  // Delete specific slot from day
  const handleDeleteSlot = (day: string, slotIdOrIndex: string | number) => {
    const daySlots = schedule[day] || [];
    const updated = typeof slotIdOrIndex === 'string'
      ? daySlots.filter((s) => s.id !== slotIdOrIndex)
      : daySlots.filter((_, i) => i !== slotIdOrIndex);

    setSchedule({
      ...schedule,
      [day]: sortScheduleSlots(updated)
    });
  };

  // Compile full schedule into nicely formatted WhatsApp copyable text
  const getWhatsAppText = () => {
    let text = `🌟 *GAMZE TOSUN DANIŞMANLIK & ÖĞRENCİ KOÇLUĞU* 🌟\n`;
    text += `🎯 *ÖĞRENCİ:* ${studentName}\n`;
    text += `📈 *ALAN/GRUP:* ${examGroup}\n`;
    if (targetGoal) text += `🏫 *HEDEF:* ${targetGoal}\n`;
    text += `📅 *HAFTALIK DERS ÇALIŞMA PROGRAMI*\n`;
    text += `───────────────────────\n\n`;

    DAYS.forEach(day => {
      text += `📅 *${day.toUpperCase()}*\n`;
      const slots = schedule[day] || [];
      if (slots.length === 0) {
        text += `• _Dinlenme / Serbest Gün_\n`;
      } else {
        slots.forEach(slot => {
          text += `⏰ *${slot.time}* | *${slot.subject}*\n`;
          text += `📝 _Konu:_ ${slot.focus}\n`;
          text += `💡 _Gamze Hoca'dan:_ ${slot.advice}\n\n`;
        });
      }
      text += `───────────────────────\n`;
    });

    text += `\n✨ _"Başarı tesadüf değil, doğru rehberliğin sonucudur. Sana inanıyorum, harika bir hafta olsun!"_ - *Gamze Tosun*`;
    return text;
  };

  // Copy WhatsApp format to clipboard
  const handleCopyWhatsApp = () => {
    const text = getWhatsAppText();
    navigator.clipboard.writeText(text);
    alert('Program WhatsApp formatında panoya kopyalandı! Doğrudan öğrencinizin sohbet ekranına yapıştırabilirsiniz.');
  };

  // Trigger standard print
  const handlePrint = () => {
    window.print();
  };

  // Export Weekly Schedule as Excel Format (HTML base table with application/vnd.ms-excel)
  const handleExportExcel = () => {
    if (!isGenerated) return;

    let html = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta http-equiv="content-type" content="text/plain; charset=UTF-8"/>
        <!--[if gte mso 9]>
        <xml>
          <x:ExcelWorkbook>
            <x:ExcelWorksheets>
              <x:ExcelWorksheet>
                <x:Name>Haftalik Ders Programi</x:Name>
                <x:WorksheetOptions>
                  <x:DisplayGridlines/>
                </x:WorksheetOptions>
              </x:ExcelWorksheet>
            </x:ExcelWorksheets>
          </x:ExcelWorkbook>
        </xml>
        <![endif]-->
        <style>
          table { border-collapse: collapse; font-family: 'Segoe UI', Arial, sans-serif; }
          td, th { border: 1px solid #D1D5DB; padding: 10px; font-size: 11px; vertical-align: top; }
          th { background-color: #2D2D2D; color: #FFFFFF; font-weight: bold; font-size: 12px; text-align: center; }
          .header-title { font-size: 16px; font-weight: bold; color: #C5A059; text-align: center; padding: 15px; background-color: #FAF9F6; border: 1px solid #C5A059; }
          .student-info { font-weight: bold; font-size: 11px; background-color: #F3F4F6; }
          .time-col { background-color: #FAF9F6; font-weight: bold; color: #4B5563; text-align: center; font-family: monospace; }
          .day-header { background-color: #C5A059; color: #FFFFFF; font-weight: bold; text-align: center; }
          .advice-text { font-style: italic; color: #7C2D12; font-size: 10px; background-color: #FFF7ED; padding: 4px; border-radius: 4px; }
          .subject-name { font-weight: bold; color: #1E3A8A; font-size: 12px; }
          .focus-text { color: #374151; font-weight: 500; }
        </style>
      </head>
      <body>
        <table>
          <tr>
            <td colspan="8" class="header-title">GAMZE TOSUN DANIŞMANLIK & ÖĞRENCİ KOÇLUĞU - HAFTALIK DERS PROGRAMI</td>
          </tr>
          <tr class="student-info">
            <td colspan="2" style="background-color: #F5F5F4;">ÖĞRENCİ ADI:</td>
            <td colspan="2" style="color: #2D2D2D;">${studentName}</td>
            <td colspan="2" style="background-color: #F5F5F4;">ALAN / GRUP:</td>
            <td colspan="2" style="color: #2D2D2D;">${examGroup}</td>
          </tr>
          <tr class="student-info">
            <td colspan="2" style="background-color: #F5F5F4;">HEDEF / PROGRAM:</td>
            <td colspan="6" style="color: #C5A059;">${targetGoal || 'Genel Gelişim / Bireysel Başarı Hedefi'}</td>
          </tr>
          <tr><td colspan="8" style="border:none; height:10px;"></td></tr>
          
          <!-- DAYS HEADER -->
          <tr>
            <th style="width: 130px; background-color: #1F2937; color: white;">DERS SAATİ</th>
            ${DAYS.map(day => `<th class="day-header" style="width: 260px;">${day.toUpperCase()}</th>`).join('')}
          </tr>
    `;

    const maxSlots = Math.max(...DAYS.map(day => (schedule[day] || []).length));

    for (let slotIdx = 0; slotIdx < maxSlots; slotIdx++) {
      html += `<tr>`;
      
      // Get time for this row
      let slotTime = '';
      for (const d of DAYS) {
        if (schedule[d] && schedule[d][slotIdx]) {
          slotTime = schedule[d][slotIdx].time;
          break;
        }
      }
      if (!slotTime) slotTime = `${slotIdx + 1}. Etüt`;

      html += `<td class="time-col" style="vertical-align: middle;">${slotTime}</td>`;

      for (const day of DAYS) {
        const slot = schedule[day] && schedule[day][slotIdx];
        if (slot) {
          html += `
            <td style="background-color: #FFFFFF;">
              <div class="subject-name">${slot.subject}</div>
              <div class="focus-text" style="margin-top: 4px;">• ${slot.focus}</div>
              <div class="advice-text" style="margin-top: 6px;">
                Gamze Hoca: ${slot.advice}
              </div>
            </td>
          `;
        } else {
          html += `<td style="background-color: #FAFBFB; text-align: center; color: #9CA3AF; font-style: italic; vertical-align: middle;">Serbest Zaman / Dinlenme</td>`;
        }
      }
      html += `</tr>`;
    }

    html += `
          <tr><td colspan="8" style="border:none; height:15px;"></td></tr>
          <tr>
            <td colspan="8" style="text-align: center; font-style: italic; font-weight: bold; background-color: #FAF9F6; color: #2D2D2D; padding: 14px; border: 1px solid #C5A059; font-size: 12px;">
              "Başarı tesadüf değil, doğru rehberliğin sonucudur. Sana inanıyorum, harika bir çalışma haftası dilerim!" - Gamze Tosun
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${studentName.replace(/\s+/g, '_')}_Haftalik_Calisma_Programi.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      
      {/* LEFT COLUMN: Input Form Wizard & Saved List */}
      <div className="lg:col-span-4 space-y-6 print:hidden">
        
        {/* Saved List section if available */}
        {savedSchedules.length > 0 && (
          <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="font-serif text-sm font-bold text-[#2D2D2D] flex items-center gap-2 border-b border-stone-100 pb-2">
              <GraduationCap className="w-4 h-4 text-[#C5A059]" />
              <span>Kayıtlı Öğrenci Programları ({savedSchedules.length})</span>
            </h3>
            
            <div className="max-h-52 overflow-y-auto space-y-2.5 pr-1 scrollbar-thin">
              {savedSchedules.map((saved) => (
                <div 
                  key={saved.id}
                  onClick={() => handleLoadSchedule(saved)}
                  className="p-3 bg-[#FAF9F6] border border-stone-200/60 hover:border-[#C5A059]/60 rounded-xl transition-all flex items-center justify-between cursor-pointer group text-left"
                >
                  <div className="space-y-0.5">
                    <h4 className="font-bold text-slate-800 text-xs leading-none group-hover:text-[#C5A059] transition-colors">
                      {saved.studentName}
                    </h4>
                    <p className="text-[10px] text-slate-400 font-medium">
                      {saved.examGroup} • {saved.targetGoal}
                    </p>
                    <span className="text-[9px] text-slate-400 block pt-0.5">Kaydedildi: {saved.createdAt}</span>
                  </div>
                  <button
                    onClick={(e) => handleDeleteSavedSchedule(saved.id, e)}
                    className="p-1.5 text-stone-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors"
                    title="Sil"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Wizard Input Card */}
        <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm space-y-5 text-left">
          <div className="border-b border-stone-100 pb-3">
            <h3 className="font-serif text-base font-bold text-[#2D2D2D] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#C5A059]" />
              <span>Program Hazırlama Robotu</span>
            </h3>
            <p className="text-stone-400 text-[10px] leading-relaxed mt-0.5">
              Gamze Tosun koçluk standartlarında, ders bazlı ve sınav tipine özel haftalık çalışma şeması oluşturun.
            </p>
          </div>

          <div className="space-y-4">
            {/* Student Quick Selector */}
            {studentsList.length > 0 && (
              <div className="space-y-1 bg-amber-50/60 p-2.5 rounded-xl border border-amber-200/60">
                <label className="text-[10px] font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-[#C5A059]" />
                  <span>Kayıtlı Öğrenci Seçin (Otomatik Eşleşme)</span>
                </label>
                <select
                  value={selectedStudentUsername}
                  onChange={(e) => handleSelectStudent(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-amber-300 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none"
                >
                  <option value="">-- Yeni Öğrenci Yazın veya Seçin --</option>
                  {studentsList.map(st => (
                    <option key={st.id} value={st.username}>
                      {st.fullName} ({st.studentClass}) - [{st.username}]
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Custom PDF Schedule Upload Button & Status */}
            <div className="bg-gradient-to-br from-amber-500/10 via-stone-50 to-amber-500/5 p-3 rounded-xl border border-amber-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase text-amber-900 tracking-wider flex items-center gap-1.5">
                  <FileUp className="w-3.5 h-3.5 text-[#C5A059]" />
                  <span>Özel PDF Ders Programı</span>
                </span>
                {currentStudentRecord?.uploadedPdf && (
                  <span className="text-[9px] font-extrabold uppercase bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
                    Yayında
                  </span>
                )}
              </div>
              <p className="text-[10px] text-stone-500 leading-tight">
                Kendiniz ayriyeten hazırladığınız ders çalışma programını PDF olarak sisteme yükleyebilirsiniz.
              </p>

              {currentStudentRecord?.uploadedPdf ? (
                <div className="bg-white p-2.5 rounded-lg border border-amber-300/80 space-y-2 shadow-2xs">
                  <div className="flex items-start justify-between gap-1.5">
                    <div className="truncate">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {currentStudentRecord.uploadedPdf.title || currentStudentRecord.uploadedPdf.fileName}
                      </p>
                      <p className="text-[10px] text-stone-400 font-mono">
                        {currentStudentRecord.uploadedPdf.fileName} ({currentStudentRecord.uploadedPdf.fileSize})
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 pt-1">
                    <a
                      href={currentStudentRecord.uploadedPdf.dataUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-1.5 bg-stone-100 hover:bg-stone-200 text-slate-800 rounded-md text-[10px] font-bold transition-colors text-center flex items-center justify-center gap-1"
                    >
                      <Eye className="w-3 h-3 text-[#C5A059]" />
                      <span>Önizle</span>
                    </a>
                    <a
                      href={currentStudentRecord.uploadedPdf.dataUrl}
                      download={currentStudentRecord.uploadedPdf.fileName}
                      className="flex-1 py-1.5 bg-[#C5A059] hover:bg-[#b08d4b] text-white rounded-md text-[10px] font-bold transition-colors text-center flex items-center justify-center gap-1"
                    >
                      <Download className="w-3 h-3" />
                      <span>İndir</span>
                    </a>
                    <button
                      type="button"
                      onClick={() => setIsPdfModalOpen(true)}
                      className="py-1.5 px-2 bg-slate-900 hover:bg-slate-800 text-[#C5A059] rounded-md text-[10px] font-bold transition-colors cursor-pointer"
                      title="Yeni PDF Yükle veya Değiştir"
                    >
                      Değiştir
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsPdfModalOpen(true)}
                  className="w-full py-2 px-3 bg-white hover:bg-amber-50 text-slate-800 hover:text-[#C5A059] border border-amber-300 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                >
                  <Upload className="w-3.5 h-3.5 text-[#C5A059]" />
                  <span>PDF Olarak Ders Programı Yükle</span>
                </button>
              )}
            </div>

            {/* Student Name */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Öğrenci Ad Soyad</label>
              <input 
                type="text"
                placeholder="Örn: Ahmet Yılmaz"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="w-full px-3 py-2 bg-[#FAF9F6] border border-stone-200 rounded-xl text-xs focus:border-[#C5A059] focus:outline-none transition-colors"
              />
            </div>

            {/* Exam / Area Group */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Sınav / Sınıf Seviyesi</label>
              <select 
                value={examGroup}
                onChange={(e) => setExamGroup(e.target.value)}
                className="w-full px-3 py-2 bg-[#FAF9F6] border border-stone-200 rounded-xl text-xs focus:border-[#C5A059] focus:outline-none transition-colors"
              >
                {Object.keys(EXAM_SUBJECTS).map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            {/* Target Major / Dream school */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Hedeflenen Üniversite, Kurum, Derece veya Kadro</label>
              <input 
                type="text"
                placeholder="Örn: ODTÜ Bilgisayar / KPSS 90+ Puan / MEB Akademi Derecesi"
                value={targetGoal}
                onChange={(e) => setTargetGoal(e.target.value)}
                className="w-full px-3 py-2 bg-[#FAF9F6] border border-stone-200 rounded-xl text-xs focus:border-[#C5A059] focus:outline-none transition-colors"
              />
            </div>

            {/* Daily Hours Slider */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Günlük Hedef Çalışma Süresi</label>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                  {dailyHours} Saat / Gün
                </span>
              </div>
              <input 
                type="range"
                min="2"
                max="8"
                step="1"
                value={dailyHours}
                onChange={(e) => setDailyHours(Number(e.target.value))}
                className="w-full h-1.5 bg-stone-100 rounded-lg appearance-none cursor-pointer accent-[#C5A059]"
              />
              <div className="flex items-center justify-between text-[9px] text-slate-400 font-medium">
                <span>2 Saat (Yumuşak Başlangıç)</span>
                <span>8 Saat (Kamplar / Son Aylar)</span>
              </div>
            </div>

            {/* Has School switch */}
            <div className="flex items-center justify-between p-3 bg-[#FAF9F6] rounded-xl border border-stone-200/50">
              <div className="text-left space-y-0.5">
                <span className="text-xs font-bold text-slate-700">Hafta İçi Okul / Dershane Var mı?</span>
                <p className="text-[9px] text-slate-400 leading-none">Evet ise çalışma saatleri okul sonrasına ayarlanır.</p>
              </div>
              <button 
                onClick={() => setHasSchool(!hasSchool)}
                className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 focus:outline-none ${hasSchool ? 'bg-emerald-600' : 'bg-stone-300'}`}
              >
                <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${hasSchool ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>

            {/* Weak Subjects list based on Selected Exam Group */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Zorlanılan / Yoğunlaşılması Gereken Dersler (Öncelikli)
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {EXAM_SUBJECTS[examGroup]?.map(subj => (
                  <label 
                    key={subj.name}
                    className={`flex items-center gap-2 p-2 rounded-xl border text-[10px] font-semibold transition-all cursor-pointer ${
                      weakSubjects.includes(subj.name)
                        ? 'bg-[#C5A059]/10 border-[#C5A059] text-[#C5A059]'
                        : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                    }`}
                  >
                    <input 
                      type="checkbox"
                      checked={weakSubjects.includes(subj.name)}
                      onChange={() => handleWeakSubjectToggle(subj.name)}
                      className="hidden"
                    />
                    <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${
                      weakSubjects.includes(subj.name) ? 'bg-[#C5A059] border-[#C5A059] text-white' : 'border-stone-300 bg-white'
                    }`}>
                      {weakSubjects.includes(subj.name) && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                    </div>
                    <span className="truncate">{subj.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Submit button */}
            <button
              onClick={handleGenerateSchedule}
              className="w-full py-3 bg-[#2D2D2D] hover:bg-[#C5A059] text-white text-[10px] font-bold uppercase tracking-widest transition-all rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <RefreshCw className="w-3.5 h-3.5 animate-spin-slow" />
              <span>Yeni Program Oluştur</span>
            </button>
          </div>
        </div>

      </div>

      {/* RIGHT COLUMN: Interactive Grid, WhatsApp copier, print preview */}
      <div className="lg:col-span-8 space-y-6">
        
        {isGenerated ? (
          <div className="space-y-6">
            
            {/* Header controls for generated schedule */}
            <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
              <div className="text-left space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <h3 className="font-serif text-lg font-bold text-[#2D2D2D]">
                    {studentName} - Çalışma Planı
                  </h3>
                </div>
                <p className="text-xs text-slate-400">
                  Alan: <span className="font-semibold text-slate-700">{examGroup}</span> • Hedef: <span className="font-semibold text-emerald-800">{targetGoal || 'Genel Gelişim'}</span>
                </p>
              </div>

              {/* Utility Actions */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleSaveSchedule}
                  className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/40 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  title="Gelecekte hızlıca çağırmak için kaydet"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Sisteme Kaydet</span>
                </button>

                <button
                  onClick={handleCopyWhatsApp}
                  className="flex items-center gap-1.5 px-3 py-2 bg-green-50 hover:bg-green-100 text-green-800 border border-green-200/40 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  title="WhatsApp mesaj şablonu kopyala"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>WhatsApp Kopyala</span>
                </button>

                <button
                  onClick={handleExportExcel}
                  className="flex items-center gap-1.5 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200/40 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  title="Excel (Haftalık Program) indir"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Excel İndir</span>
                </button>

                <button
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  title="Programı Yazdır / PDF olarak kaydet"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Yazdır / PDF</span>
                </button>

                <button
                  onClick={() => setIsPdfModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/60 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  title="Öğrenciye harici hazırladığınız PDF ders programını yükleyin"
                >
                  <FileUp className="w-3.5 h-3.5 text-[#C5A059]" />
                  <span>PDF Yükle</span>
                </button>
              </div>
            </div>

            {/* Active Uploaded PDF Banner (if exists) */}
            {currentStudentRecord?.uploadedPdf && (
              <div className="bg-gradient-to-r from-amber-50 via-stone-50 to-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left shadow-xs">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#C5A059] text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] uppercase font-black tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                        Öğrenciye Özel PDF Programı
                      </span>
                      <span className="text-[10px] text-stone-400 font-mono">
                        {currentStudentRecord.uploadedPdf.uploadedAt}
                      </span>
                    </div>
                    <h4 className="font-serif font-bold text-sm text-slate-800 mt-1">
                      {currentStudentRecord.uploadedPdf.title || currentStudentRecord.uploadedPdf.fileName}
                    </h4>
                    <p className="text-xs text-stone-500">
                      Dosya: <span className="font-mono text-stone-700">{currentStudentRecord.uploadedPdf.fileName}</span> ({currentStudentRecord.uploadedPdf.fileSize})
                    </p>
                    {currentStudentRecord.uploadedPdf.note && (
                      <p className="text-xs text-amber-900 bg-amber-100/60 rounded-lg p-1.5 mt-1.5 font-medium border-l-2 border-[#C5A059]">
                        💡 Koç Notu: {currentStudentRecord.uploadedPdf.note}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleManualParsePdf(currentStudentRecord)}
                    disabled={isParsingPdfToTable}
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
                    title="PDF'teki ders programını otomatik çözümle ve tablo şablonuna aktar"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                    <span>{isParsingPdfToTable ? 'Tabloya Aktarılıyor...' : 'Tabloya Aktar'}</span>
                  </button>
                  <a
                    href={currentStudentRecord.uploadedPdf.dataUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-white hover:bg-stone-100 text-slate-800 border border-stone-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <Eye className="w-3.5 h-3.5 text-[#C5A059]" />
                    <span>Önizle</span>
                  </a>
                  <a
                    href={currentStudentRecord.uploadedPdf.dataUrl}
                    download={currentStudentRecord.uploadedPdf.fileName}
                    className="px-3 py-1.5 bg-[#C5A059] hover:bg-[#b08d4b] text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>İndir</span>
                  </a>
                  <button
                    onClick={() => setIsPdfModalOpen(true)}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-[#C5A059] rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    title="PDF Programını Güncelle veya Sil"
                  >
                    Yönet
                  </button>
                </div>
              </div>
            )}

            {/* Parsing notification */}
            {parseNotice && (
              <div className="p-3 bg-amber-500/10 border border-amber-300 rounded-xl flex items-center gap-2 text-xs text-amber-900 animate-pulse">
                <RefreshCw className="w-4 h-4 animate-spin text-[#C5A059]" />
                <span className="font-semibold">{parseNotice}</span>
              </div>
            )}

            {/* View Mode Switcher: Yatay Haftalık Tablo vs. Günlük Blok Düzenleyici */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-2.5 rounded-2xl border border-stone-200 shadow-2xs print:hidden">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPlannerViewMode('table')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                    plannerViewMode === 'table'
                      ? 'bg-slate-900 text-[#C5A059] shadow-sm font-extrabold'
                      : 'text-stone-600 hover:text-slate-900 hover:bg-stone-100'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Haftalık Yatay Tablo (7 Gün)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPlannerViewMode('cards')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                    plannerViewMode === 'cards'
                      ? 'bg-slate-900 text-[#C5A059] shadow-sm font-extrabold'
                      : 'text-stone-600 hover:text-slate-900 hover:bg-stone-100'
                  }`}
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Günlük Blok Düzenleyici</span>
                </button>
              </div>

              <div className="text-[11px] text-stone-500 font-medium px-2">
                {plannerViewMode === 'table' ? (
                  <span className="text-emerald-700 font-semibold flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> Yatay Tablo Görünümü Aktif (Tüm Günler)
                  </span>
                ) : (
                  <span>✏️ Seçili günün saat ve etüt bloklarını düzenleyebilirsiniz</span>
                )}
              </div>
            </div>

            {/* TAB 1: Horizontal Weekly Schedule Table */}
            {plannerViewMode === 'table' && (
              <div className="print:hidden">
                <HorizontalWeeklyScheduleTable
                  student={
                    studentsList.find(s => s.username.toLowerCase() === selectedStudentUsername.toLowerCase()) || {
                      id: selectedStudentUsername || 'ogrenci',
                      username: selectedStudentUsername || 'ogrenci',
                      password: '',
                      fullName: studentName || 'Öğrenci',
                      studentClass: examGroup || 'YKS',
                      createdAt: ''
                    }
                  }
                  allPrograms={currentStudentRecord?.allPrograms || (currentStudentRecord ? [currentStudentRecord] : [])}
                  currentProgram={currentStudentRecord}
                  dailyLogs={[]}
                  isCoachView={true}
                  onProgramChange={async (progId) => {
                    if (selectedStudentUsername) {
                      const updated = await dbGetStudentSchedule(selectedStudentUsername, progId);
                      if (updated) {
                        setCurrentStudentRecord(updated);
                        if (updated.schedule) {
                          const sorted: Record<string, ScheduleItem[]> = {};
                          Object.keys(updated.schedule).forEach(day => {
                            const rawSlots = (updated.schedule[day] || []) as any[];
                            const mapped: ScheduleItem[] = rawSlots.map((s, idx) => ({
                              id: s.id || `slot-${day}-${idx}`,
                              time: s.time || '17:00 - 18:00',
                              subject: s.subject || 'Ders',
                              focus: s.focus || s.topic || 'Konu Tekrarı & Soru Çözümü',
                              advice: s.advice || '',
                              color: s.color || 'bg-blue-50 text-blue-800 border-blue-200'
                            }));
                            sorted[day] = sortScheduleSlots(mapped);
                          });
                          setSchedule(sorted);
                        }
                      }
                    }
                  }}
                  onStatusChange={(updatedProgram) => {
                    setCurrentStudentRecord(updatedProgram);
                  }}
                  onOpenUploadPdf={() => setIsPdfModalOpen(true)}
                />
              </div>
            )}

            {/* Print Friendly Page (Hidden on screen, shown on print) */}
            <div className="hidden print:block bg-white text-black p-8 text-left space-y-6">
              <div className="text-center border-b-2 border-stone-900 pb-4">
                <h1 className="text-2xl font-serif font-bold tracking-tight">GAMZE TOSUN DANIŞMANLIK & ÖĞRENCİ KOÇLUĞU</h1>
                <p className="text-sm font-serif italic mt-1">"Başarı tesadüf değil, doğru rehberliğin sonucudur."</p>
                <div className="mt-4 grid grid-cols-3 gap-4 text-xs font-semibold max-w-xl mx-auto border border-stone-200 p-2 bg-stone-50">
                  <div>ÖĞRENCİ: {studentName}</div>
                  <div>ALAN: {examGroup}</div>
                  <div>HEDEF: {targetGoal || 'Bireysel Başarı'}</div>
                </div>
              </div>

              <div className="space-y-6 text-xs">
                {DAYS.map(day => (
                  <div key={day} className="border-b border-stone-200 pb-4">
                    <h3 className="font-bold text-sm text-stone-800 uppercase border-l-4 border-stone-800 pl-2 mb-2">{day}</h3>
                    <div className="grid grid-cols-1 gap-2">
                      {(schedule[day] || []).map((slot, i) => (
                        <div key={i} className="grid grid-cols-12 gap-3 border border-stone-100 p-2 bg-stone-50/50 rounded">
                          <div className="col-span-2 font-bold font-mono text-stone-600">{slot.time}</div>
                          <div className="col-span-3 font-bold text-stone-800">{slot.subject}</div>
                          <div className="col-span-4 text-stone-600">{slot.focus}</div>
                          <div className="col-span-3 italic text-stone-500">Öneri: {slot.advice}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* TAB 2: Day Selector Tabs (Interactive Screen Grid - when in cards mode) */}
            {plannerViewMode === 'cards' && (
            <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm flex flex-col print:hidden">
              
              {/* Tabs list */}
              <div className="flex border-b border-stone-150 overflow-x-auto bg-stone-50 scrollbar-none">
                {DAYS.map((day) => (
                  <button
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    className={`flex-1 py-3 px-4 text-xs font-bold whitespace-nowrap transition-all border-b-2 cursor-pointer ${
                      selectedDay === day
                        ? 'bg-white text-[#C5A059] border-[#C5A059]'
                        : 'text-stone-500 hover:bg-stone-100/50 border-transparent'
                    }`}
                  >
                    {day}
                    <span className="ml-1 text-[10px] text-stone-400 font-normal">
                      ({(schedule[day] || []).length})
                    </span>
                  </button>
                ))}
              </div>

              {/* Day slots listing */}
              <div className="p-6 bg-white space-y-4">
                
                <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                  <div className="text-left">
                    <h4 className="font-serif font-bold text-base text-[#2D2D2D]">
                      {selectedDay} Günü Çalışma Akışı
                    </h4>
                    <p className="text-[10px] text-stone-400">
                      Zaman dilimlerini ve ders detaylarını aşağıdan dilediğiniz gibi özelleştirebilirsiniz.
                    </p>
                  </div>
                  
                  <button
                    onClick={() => handleAddNewSlot(selectedDay)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-[#C5A059]/10 hover:bg-[#C5A059]/20 text-[#C5A059] rounded-xl text-[10px] font-bold transition-all cursor-pointer border border-[#C5A059]/30"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Ders Ekle</span>
                  </button>
                </div>

                <div className="space-y-3.5">
                  {(schedule[selectedDay] || []).length > 0 ? (
                    (schedule[selectedDay] || []).map((slot, index) => (
                      <motion.div
                        key={slot.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`border rounded-xl p-4 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 text-left ${slot.color}`}
                      >
                        
                        {/* Time & Subject */}
                        <div className="flex items-start gap-3.5 md:w-1/3">
                          <div className="p-2 bg-white/70 border border-white/20 rounded-lg shrink-0 flex flex-col items-center justify-center text-center">
                            <Clock className="w-3.5 h-3.5 text-stone-500 mb-0.5" />
                            <span className="text-[9px] font-bold font-mono text-stone-600 tracking-tight leading-none">
                              {slot.time}
                            </span>
                          </div>
                          
                          <div className="space-y-0.5">
                            <span className="text-[9px] font-bold uppercase tracking-wider text-stone-400">Ders</span>
                            <h5 className="font-bold text-slate-900 text-sm">{slot.subject}</h5>
                          </div>
                        </div>

                        {/* Focus & Coaching advice */}
                        <div className="flex-1 space-y-1 bg-white/30 rounded-xl p-3 border border-white/10">
                          <p className="text-xs text-slate-800 font-medium flex items-center gap-1.5">
                            <BookOpen className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                            <span>{slot.focus}</span>
                          </p>
                          <p className="text-[10px] text-slate-500 italic flex items-start gap-1">
                            <AlertCircle className="w-3 h-3 text-[#C5A059] mt-0.5 shrink-0" />
                            <span>{slot.advice}</span>
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 shrink-0 self-end md:self-center">
                          <button
                            onClick={() => handleOpenEditSlot(selectedDay, index, slot)}
                            className="p-1.5 text-stone-500 hover:text-emerald-700 hover:bg-white/70 border border-stone-200/50 rounded-lg transition-colors bg-white/20"
                            title="Düzenle"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteSlot(selectedDay, index)}
                            className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 border border-stone-200/50 rounded-lg transition-colors bg-white/20"
                            title="Sil"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center py-12 border-2 border-dashed border-stone-200 rounded-xl space-y-3">
                      <Calendar className="w-10 h-10 text-stone-300 mx-auto" />
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-stone-500">Bugün Boş Bırakıldı</p>
                        <p className="text-[10px] text-stone-400 max-w-xs mx-auto">
                          Öğrencinin bu günü dinlenme günü olabilir veya yukarıdaki butona tıklayarak dilediğiniz bir çalışma planı ekleyebilirsiniz.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

              </div>

            </div>
            )}

          </div>
        ) : (
          <div className="bg-white border border-stone-200 rounded-3xl p-12 text-center flex flex-col items-center justify-center h-full min-h-[400px] space-y-5">
            <div className="p-4 bg-[#C5A059]/10 text-[#C5A059] rounded-2xl border border-[#C5A059]/20 animate-pulse">
              <Sparkles className="w-10 h-10 stroke-1" />
            </div>
            
            <div className="space-y-2 max-w-md">
              <h3 className="font-serif text-lg font-bold text-[#2D2D2D]">Ders Programı Robotu Hazır!</h3>
              <p className="text-xs text-stone-500 leading-relaxed">
                Sol taraftaki panelden öğrencimizin ismini, hedeflerini, haftalık yoğunluğunu ve öncelikli derslerini seçin, ardından <strong>"Yeni Program Oluştur"</strong> butonuna basın. Gamze Hanım'ın koçluk standartlarında, dengeli ve hedefe ulaştıran profesyonel program anında tasarlanacaktır.
              </p>
            </div>
          </div>
        )}

      </div>

      {/* EDIT MODAL OVERLAY */}
      <AnimatePresence>
        {isEditModalOpen && editingSlot && (
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-60 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto border border-stone-200 shadow-2xl text-left flex flex-col"
            >
              {/* Header */}
              <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between sticky top-0 z-10">
                <h4 className="font-serif font-bold text-sm">Zaman Dilimi Düzenle ({editingSlot.day})</h4>
                <button 
                  onClick={() => { setIsEditModalOpen(false); setEditingSlot(null); }}
                  className="p-1 text-stone-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSaveEditedSlot} className="p-5 space-y-4">
                
                {/* 1. Saat Seçimi (Manual & Automatic) */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Çalışma Saat Aralığı</label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[9px] text-slate-400 font-medium block mb-1">Başlangıç Saati</span>
                      <input 
                        type="time"
                        value={modalStartHour}
                        onChange={(e) => handleModalTimeChange(e.target.value, modalEndHour)}
                        className="w-full px-3 py-2 bg-[#FAF9F6] border border-stone-200 rounded-xl text-xs focus:border-[#C5A059] focus:outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 font-medium block mb-1">Bitiş Saati</span>
                      <input 
                        type="time"
                        value={modalEndHour}
                        onChange={(e) => handleModalTimeChange(modalStartHour, e.target.value)}
                        className="w-full px-3 py-2 bg-[#FAF9F6] border border-stone-200 rounded-xl text-xs focus:border-[#C5A059] focus:outline-none transition-colors"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-[9px] text-slate-400 font-medium block mb-1">Serbest Saat Girişi (Alternatif)</span>
                    <input 
                      type="text"
                      required
                      value={editingSlot.slot.time}
                      onChange={(e) => setEditingSlot({
                        ...editingSlot,
                        slot: { ...editingSlot.slot, time: e.target.value }
                      })}
                      placeholder="Örn: 17:00 - 18:30"
                      className="w-full px-3 py-2 bg-[#FAF9F6] border border-stone-200 rounded-xl text-xs focus:border-[#C5A059] focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* 2. Sınıf Seviyesi Seçimi */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Sınıf Seviyesi / Sınav Grubu</label>
                  <select
                    value={modalSelectedGroup}
                    onChange={(e) => handleModalGroupChange(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAF9F6] border border-stone-200 rounded-xl text-xs focus:border-[#C5A059] focus:outline-none transition-colors"
                  >
                    {Object.keys(EXAM_SUBJECTS).map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>

                {/* 3. Ders Seçimi */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Ders Seçimi</label>
                  <select
                    value={modalSelectedSubject}
                    onChange={(e) => handleModalSubjectChange(modalSelectedGroup, e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAF9F6] border border-stone-200 rounded-xl text-xs focus:border-[#C5A059] focus:outline-none transition-colors"
                  >
                    {EXAM_SUBJECTS[modalSelectedGroup]?.map((s) => (
                      <option key={s.name} value={s.name}>{s.name}</option>
                    ))}
                    <option value="custom">-- Özel Ders Yazacağım --</option>
                  </select>

                  {/* Manual input if custom */}
                  {modalSelectedSubject === 'custom' && (
                    <div className="pt-2">
                      <input 
                        type="text"
                        required
                        value={editingSlot.slot.subject}
                        onChange={(e) => setEditingSlot({
                          ...editingSlot,
                          slot: { ...editingSlot.slot, subject: e.target.value }
                        })}
                        placeholder="Örn: Paragraf Hızlı Okuma"
                        className="w-full px-3 py-2 bg-[#FAF9F6] border border-[#C5A059] rounded-xl text-xs focus:outline-none transition-colors"
                      />
                    </div>
                  )}
                </div>

                {/* 4. Ünite / Konu Seçimi */}
                {modalSelectedSubject !== 'custom' && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Müfredat Ünite / Konu Başlığı</label>
                    <select
                      value={modalSelectedUnit}
                      onChange={(e) => handleModalUnitChange(e.target.value)}
                      className="w-full px-3 py-2 bg-[#FAF9F6] border border-stone-200 rounded-xl text-xs focus:border-[#C5A059] focus:outline-none transition-colors"
                    >
                      {EXAM_SUBJECTS[modalSelectedGroup]
                        ?.find((s) => s.name === modalSelectedSubject)
                        ?.focusTopics.map((topic) => (
                          <option key={topic} value={topic}>{topic}</option>
                        ))}
                      <option value="custom">-- Özel Konu Yazacağım --</option>
                    </select>

                    {/* Manual input if custom unit */}
                    {modalSelectedUnit === 'custom' && (
                      <div className="pt-2 animate-fadeIn">
                        <input 
                          type="text"
                          required
                          value={editingSlot.slot.focus.endsWith(' Konu Anlatımı ve Soru Çözümü') ? editingSlot.slot.focus.replace(' Konu Anlatımı ve Soru Çözümü', '') : editingSlot.slot.focus}
                          onChange={(e) => {
                            const val = e.target.value;
                            setEditingSlot({
                              ...editingSlot,
                              slot: { 
                                ...editingSlot.slot, 
                                focus: val ? `${val} Konu Anlatımı ve Soru Çözümü` : '' 
                              }
                            });
                          }}
                          placeholder="Örn: Limit ve Süreklilik"
                          className="w-full px-3 py-2 bg-[#FAF9F6] border border-[#C5A059] rounded-xl text-xs focus:outline-none transition-colors"
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* 5. Konu Odak Noktası */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Konu Odak Noktası (Detaylar)</label>
                  <textarea 
                    required
                    rows={2}
                    value={editingSlot.slot.focus}
                    onChange={(e) => setEditingSlot({
                      ...editingSlot,
                      slot: { ...editingSlot.slot, focus: e.target.value }
                    })}
                    placeholder="Örn: Fonksiyonlar Soru Çözümü + Çözülemeyenler Analizi"
                    className="w-full px-3 py-2 bg-[#FAF9F6] border border-stone-200 rounded-xl text-xs focus:border-[#C5A059] focus:outline-none transition-colors resize-none"
                  />
                </div>

                {/* 6. Öğretmen Tavsiyesi */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Öğretmen Tavsiyesi / Notu</label>
                  <textarea 
                    rows={2}
                    value={editingSlot.slot.advice}
                    onChange={(e) => setEditingSlot({
                      ...editingSlot,
                      slot: { ...editingSlot.slot, advice: e.target.value }
                    })}
                    placeholder="Örn: Süre tutarak çöz ve yanlış soruların formüllerini panoya as!"
                    className="w-full px-3 py-2 bg-[#FAF9F6] border border-stone-200 rounded-xl text-xs focus:border-[#C5A059] focus:outline-none transition-colors resize-none"
                  />
                </div>

                {/* Submit */}
                <div className="flex items-center gap-2 pt-2 pb-1">
                  <button
                    type="button"
                    onClick={() => { setIsEditModalOpen(false); setEditingSlot(null); }}
                    className="flex-1 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-[10px] font-bold uppercase tracking-widest transition-all rounded-xl text-center cursor-pointer"
                  >
                    Vazgeç
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold uppercase tracking-widest transition-all rounded-xl text-center cursor-pointer shadow-md"
                  >
                    Kaydet
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* PDF Upload Modal */}
      {isPdfModalOpen && (
        <UploadStudentSchedulePdfModal
          student={
            selectedStudentUsername 
              ? (studentsList.find(s => s.username === selectedStudentUsername) || {
                  id: 'temp',
                  username: selectedStudentUsername,
                  fullName: studentName || 'Öğrenci',
                  studentClass: examGroup,
                  password: '',
                  createdAt: ''
                })
              : (studentName ? {
                  id: 'temp',
                  username: studentName.toLowerCase().replace(/\s+/g, ''),
                  fullName: studentName,
                  studentClass: examGroup,
                  password: '',
                  createdAt: ''
                } : null)
          }
          isOpen={isPdfModalOpen}
          onClose={() => setIsPdfModalOpen(false)}
          onScheduleUpdated={async (updatedRecord) => {
            setCurrentStudentRecord(updatedRecord);
            if (onScheduleSavedForStudent && selectedStudentUsername) {
              onScheduleSavedForStudent(selectedStudentUsername);
            }
          }}
        />
      )}

    </div>
  );
}
