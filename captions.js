/* ─────────────────────────────────────────────────────────────
   ALTYAZILAR / CAPTIONS — düzenlenebilir.
   Kısa, tek fikir, 7. sınıf dili. start/end saniye cinsinden.
   note: öğretmen için önerilen seslendirme cümlesi.
   ───────────────────────────────────────────────────────────── */
(function (root) {
  const CAPTIONS = [
    { scene: 1, start: 4.4, end: 10.2, tr: 'Kategorik mi, sürekli mi?', en: 'Categorical or continuous?',
      note: '“Nasıl geliyorsun?” sorusunun cevapları kategoriktir: yürüyerek, servisle. “Kaç dakikada geliyorsun?” sorusunun cevabı ölçülür, 12,5 dakika gibi: nicel ve sürekli bir veri.' },
    { scene: 2, start: 10.8, end: 19.8, tr: 'Araştırma sorusu', en: 'The research question',
      note: 'Araştırma sorumuz: sınıfımız okula kaç dakikada geliyor? Yürüyenler ile servisle gelenler arasında fark var mı?' },
    { scene: 2, start: 20.0, end: 27.8, tr: 'Plan ve veri', en: 'Plan and data',
      note: 'Plan: 24 öğrenciye aynı anket sorusunu soralım. Her nokta bir öğrencinin süresi.' },
    { scene: 3, start: 28.8, end: 37.2, tr: 'Eşit aralıklar', en: 'Equal intervals',
      note: 'Sürekli veride değerleri eşit aralıklara gruplarız: 0–10, 10–20, 20–30 ve 30–40 dakika. Sıklıklar 5, 8, 7 ve 4.' },
    { scene: 3, start: 37.4, end: 45.8, tr: 'Histogram', en: 'A histogram',
      note: 'Sıklıkları histogramla gösterelim. Aralıklar kesintisiz olduğu için sütunlar bitişik. En çok öğrenci 10–20 dakikada geliyor.' },
    { scene: 4, start: 46.8, end: 57.8, tr: 'Yürüyen ve servis', en: 'Walkers and the bus',
      note: 'Yürüyenleri ve servisle gelenleri ayrı renkle gösterelim. Yürüyenlerin 11’i 20 dakikadan az; servisle gelenlerin 10’u 20 dakikadan fazla sürede geliyor.' },
    { scene: 4, start: 58.0, end: 63.8, tr: 'Veriye dayalı karar', en: 'A decision based on data',
      note: 'Kararımız: servisle gelmek daha uzun sürüyor. Gerekçemiz veriler.' },
    { scene: 5, start: 64.8, end: 73.8, tr: 'Soruya cevap verdik mi?', en: 'Did we answer the question?',
      note: 'Araştırma sorumuza cevap verdik mi? Farkı gördük ama nedenini bilmiyoruz: veride evin uzaklığı yok.' },
    { scene: 5, start: 74.0, end: 79.8, tr: 'Planı yenile', en: 'Improve the plan',
      note: 'Planı yenileyelim: ankete “Evin okula kaç kilometre uzakta?” sorusunu ekleyelim.' },
    { scene: 6, start: 80.6, end: 86.4, tr: 'Soru, plan, veri, grafik', en: 'Question, plan, data, graph',
      note: 'Aklında kalsın: soru sor, plan yap, veri topla; sürekli veriyi aralıklara grupla ve histogram çiz.' },
    { scene: 6, start: 86.8, end: 91.0, tr: 'Gerekirse planı yenile!', en: 'Improve the plan if needed!',
      note: 'Kararını veriyle gerekçelendir, gerekirse planı yenile!' },
  ];
  if (typeof module !== 'undefined' && module.exports) module.exports = CAPTIONS;
  else { root.LI = root.LI || {}; root.LI.CAPTIONS = CAPTIONS; }
})(typeof window !== 'undefined' ? window : globalThis);
