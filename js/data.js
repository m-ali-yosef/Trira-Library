/* Trira PDF Bookstore — Central Data Store */
const SITE = {
  name: "Trira",
  tagline: "Professional PDF Digital Library & Books",
};

const DEFAULT_SETTINGS = {
  phone: "+20 100 000 0000",
  email: "support@trira-books.com",
  facebook: "https://facebook.com",
  instagram: "https://instagram.com",
  tiktok: "https://tiktok.com"
};

const DEFAULT_BOOKS = [
  {
    id: 1,
    title: "دليل إدارة المشاريع الاحترافية PMP",
    lang: "ar",
    price: 350,
    category: "Business",
    introduction: "دليلك الشامل لفهم أحدث معايير إدارة المشاريع واجتياز الاختبار الدولي بثقة.",
    description: "مرجع شامل ومبسط لاجتياز اختبار إدارة المشاريع الاحترافية وفهم منهجيات Agile و Waterfall باللغة العربية مع نماذج عملية واختبارات تجريبية.",
    image: "images/products/p1.jpg",
    downloadLink: ""
  },
  {
    id: 3,
    title: "أساسيات التحليل المالي للأعمال",
    lang: "ar",
    price: 290,
    category: "Finance",
    introduction: "تعلم قراءة القوائم المالية، تحليل النسب، واتخاذ القرارات الاستثمارية بدقة واحترافية.",
    description: "دليل عملي لفهم القوائم المالية، حساب مؤشرات السيولة والربحية، وتقييم الأداء المالي للشركات.",
    image: "images/products/p3.jpg",
    downloadLink: ""
  },
  {
    id: 2,
    title: "Advanced JavaScript & TypeScript Mastery",
    lang: "en",
    price: 420,
    category: "Programming",
    introduction: "Deep dive into modern software patterns, clean architecture, and advanced type systems.",
    description: "Master modern software architecture, design patterns, and asynchronous programming in JS and TS with production-grade examples.",
    image: "images/products/p2.jpg",
    downloadLink: ""
  },
  {
    id: 4,
    title: "Digital Transformation & Business Strategy",
    lang: "en",
    price: 500,
    category: "Management",
    introduction: "Comprehensive guide for modern enterprise digital operating models, RAG systems, and AI integration.",
    description: "Explore enterprise digital transformation frameworks, cloud strategies, and AI-augmented business workflows.",
    image: "images/products/p4.jpg",
    downloadLink: ""
  }
];

const DEFAULT_ARTICLES = [
  {
    id: 1,
    title: "How Digital E-Books Transform Continuous Learning",
    readTime: "4 min read",
    excerpt: "Discover why digital reference manuals and structured PDFs outperform traditional learning in fast-paced industries.",
    content: "Digital books and structured PDF guides provide an unprecedented level of accessibility and focused learning. In fast-paced technical and business environments, waiting for physical books or sorting through unverified online blogs wastes valuable time. Curated e-books offer distilled expertise, allowing professionals to absorb complex architectural patterns, financial strategies, or project management frameworks directly at their desktop or mobile device. Trira is dedicated to delivering these high-impact resources with 100% digital clarity.",
    image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=75"
  }
];

function getSettings() {
  try {
    const saved = localStorage.getItem("trira_settings_v1");
    if (saved) return JSON.parse(saved);
  } catch (e) {}
  localStorage.setItem("trira_settings_v1", JSON.stringify(DEFAULT_SETTINGS));
  return DEFAULT_SETTINGS;
}

function saveSettings(settings) {
  localStorage.setItem("trira_settings_v1", JSON.stringify(settings));
}

function getProducts() {
  // دمج الكتب الافتراضية مع أي تعديلات محلية لضمان ظهور الكتب دائماً
  try {
    const saved = localStorage.getItem("trira_books_v1");
    if (saved) {
      const parsed = JSON.parse(saved);
      // إذا كانت البيانات القديمة تحتوى على كتاب واحد، نقوم بدمجها أو إجبارها على أخذ الافتراضي المحدث
      if (parsed && parsed.length > 2) return parsed;
    }
  } catch (e) {}
  
  localStorage.setItem("trira_books_v1", JSON.stringify(DEFAULT_BOOKS));
  return DEFAULT_BOOKS;
}

function saveProducts(books) {
  localStorage.setItem("trira_books_v1", JSON.stringify(books));
}

function getArticles() {
  try {
    const saved = localStorage.getItem("trira_articles_v1");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.length > 0) return parsed;
    }
  } catch (e) {}
  localStorage.setItem("trira_articles_v1", JSON.stringify(DEFAULT_ARTICLES));
  return DEFAULT_ARTICLES;
}

function saveArticles(articles) {
  localStorage.setItem("trira_articles_v1", JSON.stringify(articles));
}

function getOrders() {
  try {
    const saved = localStorage.getItem("trira_orders_v1");
    return saved ? JSON.parse(saved) : [];
  } catch (e) {}
  return [];
}

function saveOrders(orders) {
  localStorage.setItem("trira_orders_v1", JSON.stringify(orders));
}

function getMessages() {
  try {
    const saved = localStorage.getItem("trira_messages_v1");
    return saved ? JSON.parse(saved) : [];
  } catch (e) {}
  return [];
}

function saveMessages(messages) {
  localStorage.setItem("trira_messages_v1", JSON.stringify(messages));
}