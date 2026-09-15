export type Product = {
  slug: string;
  name: string;
  subtitle: string;
  category: string;
  material: string;
  manufacturingMethod: string;
  process: string;
  equipment: string;
  location: string;
  function: string;
  wafer: string;
  purity: string;
  supplier: string;
  supplierSlug: string;
  verifiedAt: string;
  featured?: boolean;
};

export type Supplier = {
  slug: string;
  name: string;
  type: string;
  meta: string;
  region: string;
  verified: boolean;
  processes: string[];
  leadTime: string;
  moq: string;
  sample: string;
};

export type KnowledgeArticle = {
  slug: string;
  title: string;
  category: string;
  summary: string;
  relatedProcess: string;
  relatedProductSlugs: string[];
  publishedAt: string;
  readingTime: string;
  tags: string[];
  keyPoints: string[];
};

export const products: Product[] = [
  {
    slug: "cvd-sic-focus-ring",
    name: "CVD-SiC Focus Ring",
    subtitle: "고순도·고내플라즈마성 SiC 챔버 부품",
    category: "Chamber Parts",
    material: "SiC (Silicon Carbide)",
    manufacturingMethod: "CVD (Chemical Vapor Deposition)",
    process: "Dry Etching",
    equipment: "Plasma Etcher / Etch Chamber",
    location: "Wafer Edge / Chamber",
    function: "Plasma Control / Wafer Edge Protection",
    wafer: "200 mm / 300 mm",
    purity: "> 99.999% (5N)",
    supplier: "TCK",
    supplierSlug: "tck",
    verifiedAt: "2026-09-13",
    featured: true,
  },
  {
    slug: "plasma-etch-equipment",
    name: "Plasma Etch Equipment",
    subtitle: "미세 패턴 형성을 위한 플라즈마 식각 장비 카테고리",
    category: "Etch Equipment",
    material: "Multi-material system",
    manufacturingMethod: "Precision equipment manufacturing",
    process: "Dry Etching",
    equipment: "Plasma Etcher",
    location: "Front-end Fab",
    function: "Pattern Transfer / Material Removal",
    wafer: "Up to 300 mm",
    purity: "Process dependent",
    supplier: "Tokyo Electron",
    supplierSlug: "tel",
    verifiedAt: "2026-09-13",
    featured: true,
  },
  {
    slug: "high-purity-process-material",
    name: "High Purity Process Material",
    subtitle: "반도체 제조용 고순도 소재·케미컬 카테고리",
    category: "Specialty Materials",
    material: "Process-specific material",
    manufacturingMethod: "High-purity manufacturing",
    process: "Deposition / Etching / Cleaning",
    equipment: "Process Equipment",
    location: "Fab Material Supply",
    function: "Process Chemistry / Contamination Control",
    wafer: "Process dependent",
    purity: "Semiconductor grade",
    supplier: "Entegris",
    supplierSlug: "entegris",
    verifiedAt: "2026-09-13",
    featured: true,
  },
  {
    slug: "lithography-system",
    name: "Lithography System",
    subtitle: "웨이퍼 미세 패턴 형성을 위한 노광 시스템 카테고리",
    category: "Lithography Equipment",
    material: "Precision optical / mechatronic system",
    manufacturingMethod: "Precision system integration",
    process: "Lithography",
    equipment: "Lithography System",
    location: "Front-end Fab",
    function: "Pattern Imaging",
    wafer: "300 mm class",
    purity: "Cleanroom compatible",
    supplier: "ASML",
    supplierSlug: "asml",
    verifiedAt: "2026-09-13",
    featured: true,
  },
  {
    slug: "tim-material",
    name: "Thermal Interface Material",
    subtitle: "패키지와 냉각부 사이 열저항을 낮추는 TIM 카테고리",
    category: "Thermal Material",
    material: "Polymer / Filler composite",
    manufacturingMethod: "Material formulation",
    process: "Advanced Packaging / Thermal Management",
    equipment: "Package / Thermal Test System",
    location: "Package to Heat Spreader / Heat Sink",
    function: "Thermal Resistance Reduction",
    wafer: "Not applicable",
    purity: "Application dependent",
    supplier: "Demo Thermal Supplier",
    supplierSlug: "thermal-demo",
    verifiedAt: "2026-09-13",
    featured: true,
  },
  {
    slug: "underfill-material",
    name: "Underfill Material",
    subtitle: "첨단 패키징 접합부 신뢰성을 위한 언더필 소재",
    category: "Packaging Material",
    material: "Epoxy-based composite",
    manufacturingMethod: "Material formulation",
    process: "Advanced Packaging",
    equipment: "Dispensing / Packaging Line",
    location: "Die / Substrate Interface",
    function: "Mechanical Reliability / Stress Redistribution",
    wafer: "Package dependent",
    purity: "Electronic grade",
    supplier: "Demo Packaging Supplier",
    supplierSlug: "packaging-demo",
    verifiedAt: "2026-09-13",
  },
  {
    slug: "thermal-transient-tester",
    name: "Thermal Transient Tester",
    subtitle: "반도체 Junction Temperature와 열경로를 평가하는 측정 시스템",
    category: "Thermal Test Equipment",
    material: "Measurement system",
    manufacturingMethod: "Precision instrumentation",
    process: "Reliability / Thermal Characterization",
    equipment: "Thermal Transient Measurement System",
    location: "R&D / Reliability Lab",
    function: "Thermal Impedance / Structure Function Analysis",
    wafer: "Device / Package dependent",
    purity: "Not applicable",
    supplier: "Delta ES",
    supplierSlug: "delta-es",
    verifiedAt: "2026-09-13",
  },
  {
    slug: "cfd-thermal-simulation",
    name: "CFD Thermal Simulation",
    subtitle: "전자장비·반도체 시스템 열유동을 예측하는 CAE 솔루션 카테고리",
    category: "Engineering Software",
    material: "Software",
    manufacturingMethod: "Numerical simulation software",
    process: "Design / Thermal Management",
    equipment: "Engineering Workstation",
    location: "R&D / Design Office",
    function: "Temperature / Airflow / Cooling Prediction",
    wafer: "Not applicable",
    purity: "Not applicable",
    supplier: "Delta ES",
    supplierSlug: "delta-es",
    verifiedAt: "2026-09-13",
  },
];

export const product = products[0];

export const suppliers: Supplier[] = [
  {slug:"tck", name:"TCK", type:"Manufacturer", meta:"SiC · Chamber Parts", region:"Global", verified:true, processes:["Etching"], leadTime:"협의", moq:"협의", sample:"가능 여부 확인"},
  {slug:"tel", name:"Tokyo Electron", type:"Manufacturer", meta:"Semiconductor Process Equipment", region:"Global", verified:true, processes:["Etching","Deposition"], leadTime:"프로젝트 협의", moq:"장비별 협의", sample:"해당 없음"},
  {slug:"entegris", name:"Entegris", type:"Manufacturer", meta:"Specialty Materials · Contamination Control", region:"Global", verified:true, processes:["Deposition","Etching","Cleaning"], leadTime:"제품별 상이", moq:"제품별 상이", sample:"제품별 확인"},
  {slug:"asml", name:"ASML", type:"Manufacturer", meta:"Lithography Ecosystem", region:"Global", verified:true, processes:["Lithography"], leadTime:"프로젝트 협의", moq:"장비별 협의", sample:"해당 없음"},
  {slug:"delta-es", name:"Delta ES", type:"Solution Provider", meta:"Thermal · CFD · Reliability Solutions", region:"Korea", verified:true, processes:["Thermal Management","Reliability","CAE"], leadTime:"문의 필요", moq:"솔루션별 협의", sample:"데모 / 상담"},
  {slug:"thermal-demo", name:"Demo Thermal Supplier", type:"Demo Supplier", meta:"TIM · Thermal Materials", region:"Demo", verified:false, processes:["Advanced Packaging","Thermal Management"], leadTime:"Demo", moq:"Demo", sample:"Demo"},
  {slug:"packaging-demo", name:"Demo Packaging Supplier", type:"Demo Supplier", meta:"Underfill · Packaging Materials", region:"Demo", verified:false, processes:["Advanced Packaging"], leadTime:"Demo", moq:"Demo", sample:"Demo"},
];

export const processes = [
  {name:"Lithography", ko:"노광", description:"웨이퍼에 미세 패턴을 형성하는 공정"},
  {name:"Etching", ko:"식각", description:"필요한 패턴만 남기고 재료를 제거하는 공정"},
  {name:"Deposition", ko:"증착", description:"웨이퍼 위에 박막을 형성하는 공정"},
  {name:"Cleaning", ko:"세정", description:"오염과 잔류물을 제거하는 공정"},
  {name:"CMP", ko:"평탄화", description:"웨이퍼 표면을 평탄하게 만드는 공정"},
  {name:"Advanced Packaging", ko:"첨단 패키징", description:"칩·기판·인터포저를 통합하는 후공정"},
  {name:"Thermal Management", ko:"열관리", description:"칩에서 시스템까지 열경로와 냉각을 관리"},
  {name:"Reliability", ko:"신뢰성", description:"열·전력·수명 특성을 평가하는 영역"},
];

export const problems = [
  "Particle",
  "High Junction Temperature",
  "Plasma Damage",
  "Thermal Resistance",
  "Contamination",
  "Cooling",
];

export const knowledgeArticles: KnowledgeArticle[] = [
  {
    slug:"what-is-cfd",
    title:"CFD란 무엇인가? 유동과 열을 어떻게 예측할까",
    category:"CAE / CFD",
    summary:"유동장, 압력, 온도, 열전달을 수치해석으로 예측하는 기본 개념을 설명합니다.",
    relatedProcess:"Thermal Management",
    relatedProductSlugs:["cfd-thermal-simulation"],
    publishedAt:"2026-09-14",
    readingTime:"6분",
    tags:["CFD","CAE","열유동","시뮬레이션"],
    keyPoints:["CFD는 유동과 열전달을 수치적으로 예측합니다.","압력·속도·온도를 함께 해석해 설계 판단에 사용합니다.","경계조건과 물성 정의가 결과 신뢰도를 좌우합니다."],
  },
  {
    slug:"cfd-convergence-checklist",
    title:"CFD 해석이 수렴하지 않을 때 점검 순서",
    category:"Engineering Guide",
    summary:"경계조건, Geometry, Material, Heat Source와 Engineering Quantity를 순서대로 점검합니다.",
    relatedProcess:"Thermal Management",
    relatedProductSlugs:["cfd-thermal-simulation"],
    publishedAt:"2026-09-13",
    readingTime:"7분",
    tags:["CFD","Convergence","Boundary Condition","Validation"],
    keyPoints:["Solver보다 먼저 경계조건과 Geometry를 점검합니다.","Residual 감소와 실제 물리 검증은 서로 다른 개념입니다.","Mass Balance·Energy Balance·Temperature 같은 Engineering Quantity를 함께 확인합니다."],
  },
  {
    slug:"thermal-transient-testing",
    title:"Thermal Transient Testing이 필요한 이유",
    category:"Thermal Reliability",
    summary:"Junction Temperature, Thermal Impedance, Structure Function으로 열경로를 이해합니다.",
    relatedProcess:"Reliability",
    relatedProductSlugs:["thermal-transient-tester"],
    publishedAt:"2026-09-12",
    readingTime:"8분",
    tags:["T3STER","Junction Temperature","Structure Function","Reliability"],
    keyPoints:["온도 값만으로는 열저항이 발생하는 위치를 알기 어렵습니다.","Thermal Impedance와 Structure Function으로 Heat Path를 분해해 볼 수 있습니다.","Package·TIM·Heat Sink·Cooling Condition의 영향을 구분하는 데 활용합니다."],
  },
  {
    slug:"hbm-thermal-management",
    title:"HBM·2.5D·3D Package에서 열관리가 중요한 이유",
    category:"Advanced Packaging",
    summary:"Die에서 Package, Cooling, System으로 이어지는 전체 Heat Path를 살펴봅니다.",
    relatedProcess:"Advanced Packaging",
    relatedProductSlugs:["tim-material","underfill-material"],
    publishedAt:"2026-09-11",
    readingTime:"7분",
    tags:["HBM","2.5D","3D IC","TIM","Advanced Packaging"],
    keyPoints:["고집적 패키지는 Die 하나보다 전체 Heat Path를 함께 봐야 합니다.","TIM·Interposer·Substrate·Cooling 구조가 Junction Temperature에 영향을 줍니다.","Package와 System 레벨 열관리를 연결해야 설계 의사결정이 쉬워집니다."],
  },
  {
    slug:"plasma-etch-focus-ring",
    title:"Dry Etching에서 Focus Ring은 어떤 역할을 할까",
    category:"Etching",
    summary:"웨이퍼 가장자리의 플라즈마 균일성과 챔버 부품 보호 관점에서 Focus Ring을 설명합니다.",
    relatedProcess:"Etching",
    relatedProductSlugs:["cvd-sic-focus-ring","plasma-etch-equipment"],
    publishedAt:"2026-09-10",
    readingTime:"6분",
    tags:["Dry Etching","Focus Ring","CVD-SiC","Plasma"],
    keyPoints:["Focus Ring은 웨이퍼 가장자리의 플라즈마 분포를 제어합니다.","소재와 표면 상태는 파티클과 부품 수명에 영향을 줄 수 있습니다.","제품 선택 시 적용 장비·치수·공정 조건을 함께 확인해야 합니다."],
  },
  {
    slug:"semiconductor-sourcing-data",
    title:"반도체 RFQ 품질을 높이는 제품·공급사 데이터 구조",
    category:"B2B Sourcing",
    summary:"공정, 소재, 제품, 공급사, 검증 데이터를 연결해 RFQ 정확도를 높이는 방법을 설명합니다.",
    relatedProcess:"B2B Sourcing",
    relatedProductSlugs:[],
    publishedAt:"2026-09-09",
    readingTime:"5분",
    tags:["RFQ","Supplier Data","Product Data","B2B"],
    keyPoints:["제품명만으로는 적합한 공급사를 정확히 매칭하기 어렵습니다.","Process·Material·Product·Supplier를 관계형 데이터로 연결해야 합니다.","Source와 Verification 정보를 함께 관리하면 B2B 데이터 신뢰도가 높아집니다."],
  },
];

export function getProduct(slug: string) {
  return products.find((item) => item.slug === slug);
}

export function getSupplier(slug: string) {
  return suppliers.find((item) => item.slug === slug);
}

export function getProductsBySupplier(slug: string) {
  return products.filter((item) => item.supplierSlug === slug);
}

export function getRelatedArticles(productSlug: string) {
  return knowledgeArticles.filter((article) => article.relatedProductSlugs.includes(productSlug));
}

export function getKnowledgeArticle(slug: string) {
  return knowledgeArticles.find((article) => article.slug === slug);
}
export function getProductsForArticle(article: KnowledgeArticle) {
  return article.relatedProductSlugs.map((slug) => getProduct(slug)).filter((item): item is Product => Boolean(item));
}
export function getSuppliersForArticle(article: KnowledgeArticle) {
  const supplierSlugs = Array.from(new Set(getProductsForArticle(article).map((item) => item.supplierSlug)));
  return supplierSlugs.map((slug) => getSupplier(slug)).filter((item): item is Supplier => Boolean(item));
}
