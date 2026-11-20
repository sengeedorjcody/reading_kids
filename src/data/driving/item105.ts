import type { Row, Note } from "../drivingTest";

// 第2段階 項目5 適性検査結果に基づく行動分析 (10 questions, no figures).
export const FIGURE_NOS: number[] = [];

export const ROWS: Row[] = [
  [1, "交通事故の原因は、車の運転技術によるもので、運転者個人の性格や癖とは関係ない。", "Замын хөдөлгөөний ослын шалтгаан нь машин жолоодох ур чадвараас шалтгаалах бөгөөд жолоочийн хувийн зан чанар, зуршилтай хамаагүй.", false],
  [2, "安全運転をするには、交通ルールを守ることに加え、自分の性格や癖を知り、それをカバーする運転をすることである。", "Аюулгүй жолоодохын тулд замын хөдөлгөөний дүрмийг баримтлахаас гадна өөрийн зан чанар, зуршлыг мэдэж, түүнийгээ нөхөж засах байдлаар жолоодох хэрэгтэй.", true],
  [3, "無理な追い越しをされカッとしたときは、冷静な状態で運転できなくなるので、追い越しかえしてスッキリさせたほうがよい。", "Бусад машин хүчээр гүйцэж түрүүлснээс болж уур хүрсэн үед тайван байдлаар жолоодох боломжгүй болох тул буцааж гүйцэж түрүүлээд дотроо онгойлгосон нь дээр.", false],
  [4, "楽しいことで気分がうわついているとき、悩み事で気分が沈んでいるときなどは、普段の能力を十分に発揮できず、必要な情報を見落としやすい。", "Баяртай зүйл тохиолдож сэтгэл хөөрсөн үед болон санаа зовоосон асуудлаас болж сэтгэлээр унасан үед ердийн чадвараа бүрэн гаргаж чадахгүй бөгөөд шаардлагатай мэдээллийг анзааралгүй өнгөрөхдөө амархан байдаг.", true],
  [5, "運転に慣れてくれば、初心者のときのように慎重に運転する必要はない。", "Машин жолоодоод дадлагажиж ирвэл анхлан суралцагч байсан үе шигээ хянамгай жолоодох шаардлагагүй.", false],
  [6, "自分は運転が上手であると過信すると、大きな事故につながる危険がある。", "Өөрийгөө сайн жолооддог гэж хэт эрдвэл том осолд хүргэх аюултай.", true],
  [7, "運転をするときには、時間にゆとりを持つことが大切である。", "Машин жолоодох үед цагийн нөөцтэй байх нь чухал.", true],
  [8, "自己中心的な運転は、他人に迷惑をかけたり、危険を与えたりするだけでなく、自分自身も危険である。", "Хувиа хичээсэн жолоодлого нь бусдад төвөг учруулж, аюул тариад зогсохгүй өөрт ч мөн аюултай.", true],
  [9, "交差点などで自分に優先権があれば、それを主張して運転をしたほうがよい。", "Уулзвар зэрэгт өөрт давуу эрх байгаа бол түүнийгээ тулгаж жолоодсон нь дээр.", false],
  [10, "交通の複雑な状況の中では相手がどのように行動するかわからないので、カンで行動するしかない。", "Замын хөдөлгөөний нарийн төвөгтэй нөхцөл байдалд бусад хүн хэрхэн хөдлөх нь мэдэгдэхгүй тул зөн совингоороо л хөдлөхөөс өөр аргагүй.", false],
];

export const NOTES: Note[] = [
  [[1, 2], "運転には個人の性格や癖が大きく影響する。自分の性格や癖をよく知り、カバーすることが大切。", "Жолоодлогод хувь хүний зан чанар, зуршил ихээхэн нөлөөлдөг. Өөрийн зан чанар, зуршлаа сайн мэдэж, түүнийгээ нөхөж засах нь чухал."],
  [[3, 4], "カッとなったり、イライラしたり、逆に気分が高揚していたり。いろいろな感情で冷静な運転ができないときは、気分転換も必要。", "Гэнэт уурлах, бухимдах, эсвэл эсрэгээрээ сэтгэл хэт хөөрөх зэрэг янз бүрийн сэтгэл хөдлөлөөс болж тайван жолоодож чадахгүй үед сэтгэл санаагаа сэргээж тайвшруулах ч шаардлагатай."],
  [[5, 6, 7], "運転者には慎重さ、謙虚さ、そしてゆとりも大切。", "Жолоочид хянамгай байдал, даруу төлөв зан болон уужуу тайван байдал чухал."],
  [[8, 9], "運転は、いつも他人を思いやり、譲る気持ちで周囲に十分な気配りを。", "Жолоодохдоо үргэлж бусдыг бодолцож, зам тавьж өгөх сэтгэлээр эргэн тойрондоо хангалттай анхаарал хандуул."],
];

export const EN: string[] = [
  "Traffic accidents are caused by driving skill and have nothing to do with an individual driver's personality or habits.",
  "To drive safely, in addition to obeying traffic rules, you need to know your own personality and habits and drive in a way that compensates for them.",
  "When someone overtakes you recklessly and makes you angry, you cannot drive calmly, so it is better to overtake them back to clear your frustration.",
  "When you are lightheaded with excitement over something pleasant, or depressed by worries, you cannot fully demonstrate your usual ability and tend to overlook necessary information.",
  "Once you get used to driving, you do not need to drive as carefully as when you were a beginner.",
  "Being overconfident in your driving skill creates a risk of causing a major accident.",
  "When driving, it is important to allow yourself plenty of time.",
  "Self-centered driving not only inconveniences and endangers others, but is also dangerous to yourself.",
  "If you have the right of way at an intersection, etc., it is better to assert it as you drive.",
  "In complex traffic situations, you do not know how the other party will act, so you have no choice but to act on intuition.",
];

export const NOTES_EN: string[] = [
  "An individual's personality and habits greatly affect driving. It is important to know your own personality and habits well and compensate for them.",
  "When various emotions—such as sudden anger, irritation, or conversely, elation—prevent you from driving calmly, you also need a change of mood.",
  "Caution, humility, and composure are all important for a driver.",
  "Always be considerate of others when driving, keep a yielding attitude, and pay ample attention to your surroundings.",
];
