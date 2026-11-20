import type { Row, Note } from "../drivingTest";

// 第2段階 項目16 経路の設計
export const FIGURE_NOS: number[] = [];

export const ROWS: Row[] = [
  [1, "経路を設計するときは、少しくらい複雑であっても、できるだけ早く目的地に到着できる裏道を利用するとよい。", "Замын чиглэлээ төлөвлөхдөө бага зэрэг төвөгтэй байсан ч зорьсон газартаа аль болох хурдан очиж болох туслах замыг ашиглавал зүгээр.", false],
  [2, "走行経路を事前に決めて運転すると、経路に気をとられ運転に集中できなくなるので、経路を決めずに自由に走行するのがよい。", "Явах чиглэлээ урьдчилан тогтоож жолоодвол замдаа санаа зовж жолоодлогодоо төвлөрч чадахгүй болох тул чиглэл тогтоолгүй чөлөөтэй явсан нь дээр.", false],
  [3, "経路設計をするときは、所要時間についても余裕を持たせて計画するとよい。", "Замын чиглэл төлөвлөхдөө зарцуулах хугацааг ч мөн нөөцтэйгөөр тооцож төлөвлөх нь зүйтэй.", true],
  [4, "案内標識や目標物をたよりに走行するとかえって経路を間違えやすいので、たよらずに運転したほうがよい。", "Зам заах тэмдэг болон баримжаа болох зүйлд тулгуурлан явбал харин ч замаа андуурах нь амархан байдаг тул тэдгээрт найдалгүй жолоодсон нь дээр.", false],
  [5, "経路がわからないと、道をさがすのに気をとられ、運転に集中できなくなるので危険である。", "Явах замаа мэдэхгүй бол зам хайхад анхаарал сарниж, жолоодлогодоо төвлөрч чадахгүй болох тул аюултай.", true],
  [6, "走行中に経路がわからなくなったときは、安全な場所に車を止め、地図を見直したり、人に聞いたりするとよい。", "Явж байх үедээ замаа мэдэхээ больсон бол аюулгүй газар машинаа зогсоож, газрын зургаа дахин харах эсвэл хүнээс асуух нь зүйтэй.", true],
  [7, "経路を間違えて行き過ぎた場合は、どのようなときでもUターンして進路を戻すのが一番よい方法である。", "Замаа андуурч хэтрээд явчихсан тохиолдолд ямар ч үед буцаж эргэн (U-turn) чиглэлээ буцаах нь хамгийн сайн арга юм.", false],
  [8, "走行経路を間違えたときは、ただちにその場で停止して地図などを見るのがよい。", "Явах замаа андуурсан үед тэр дор нь яг тэндээ зогсоод газрын зураг зэргийг харах нь зүйтэй.", false],
  [9, "集団でのツーリング（マスツーリング）では、先頭にリーダーを、最後尾にはベテランを配して走行するとよい。", "Бүлгээрээ аялан явах (масс туринг) үед цувааны эхэнд ахлагчийг, хамгийн сүүлд туршлагатай жолоочийг байрлуулж явбал зүгээр.", true],
  [10, "数台でツーリングに行くときは、運転経験が長い順に前から一列に並んで走行するとよい。", "Хэд хэдэн мотоциклоор хамт аялалд явахдаа жолооны туршлага ихтэйгээс нь эхлэн урдаасаа нэг эгнээнд жагсаж явах нь зүйтэй.", false],
  [11, "長距離のツーリングに行くときは、出発地が晴れていれば雨具などを用意する必要はない。", "Холын зайд мотоциклоор аялалд явахдаа хөдлөх газар цэлмэг байвал борооны цув зэргийг бэлтгэх шаардлагагүй.", false],
  [12, "数台でのツーリングでは、前車に遅れないように車間距離をつめて走行するのがよい。", "Хэд хэдэн мотоциклоор хамт аялан явахдаа урд талын унаанаасаа хоцрохгүйн тулд хоорондын зайгаа ойртуулж явах нь зүйтэй.", false],
];

export const NOTES: Note[] = [
  [[1], "多少遠回りでも、できるだけ覚えやすく、わかりやすい道を選ぶのがよい。", "Бага зэрэг тойруу байсан ч аль болох тогтооход хялбар, ойлгомжтой замыг сонгох нь зүйтэй."],
  [[2], "道順に不安があると、急ブレーキや急な車線変更につながりやすい。", "Явах замдаа эргэлзээтэй байвал огцом тоормослох болон гэнэт эгнээ байр солиход хүргэх нь амархан байдаг."],
  [[4], "案内標識を確認したり、目標物を決めておくことは大切。", "Зам заах тэмдгийг шалгаж харах болон баримжаа болох зүйлийг урьдчилан тогтоох нь чухал."],
  [[7], "状況に応じ、スイッチターンやう回なども。", "Нөхцөл байдалд тохируулан сэлгэж эргэх (switch turn) эсвэл тойрох зам зэргийг ашиглана."],
  [[8], "急に止まるのは他の交通の迷惑。必ず安全を確認し、迷惑にならない場所を選んで止める。", "Гэнэт зогсох нь бусад хөдөлгөөнд саад учруулна. Заавал аюулгүй байдлыг шалгаж, бусдад саад болохгүй газрыг сонгон зогсооно."],
  [[12], "遅れないように、と車間距離をつめると、とっさのときに対応が遅れて事故を起こすことにもなる。", "Хоцрохгүйн тулд хоорондын зайгаа хэт ойртуулбал гэнэтийн үед хариу арга хэмжээ авч амжилгүй осол гаргахад хүрдэг."],
];

export const EN: string[] = [
  "When planning a route, it is best to use back roads that will get you to your destination as quickly as possible, even if they are somewhat complicated.",
  "If you decide on a driving route in advance, worrying about the route will keep you from concentrating on driving, so it is better to drive freely without setting a route.",
  "When planning a route, it is good to allow extra time in your schedule for the journey.",
  "Driving while relying on guide signs and landmarks actually makes it easier to take a wrong turn, so it is better to drive without relying on them.",
  "If you do not know your route, looking for the way will distract you and keep you from concentrating on driving, which is dangerous.",
  "If you lose your way while driving, you should stop your car in a safe place and recheck the map or ask someone for directions.",
  "If you take a wrong turn and go past your turnoff, making a U-turn to get back on course is always the best method in any situation.",
  "If you take a wrong driving route, it is best to stop immediately on the spot and check a map.",
  "When touring in a group (mass touring), it is good practice to place the leader at the front and an experienced rider at the very rear.",
  "When going touring with several motorcycles, it is best to ride in single file with riders arranged from the front in order of longest driving experience.",
  "When going on a long-distance tour, there is no need to prepare rain gear as long as the weather is clear at the point of departure.",
  "When touring with several vehicles, it is best to close up the following distance so as not to fall behind the vehicle ahead.",
];

export const NOTES_EN: string[] = [
  "Even if it is a slight detour, it is best to choose a route that is as easy to remember and easy to follow as possible.",
  "Being unsure of your route easily leads to sudden braking or abrupt lane changes.",
  "It is important to check guide signs and decide on landmarks in advance.",
  "Depending on the situation, use a switch turn or take a detour around the block instead.",
  "Stopping suddenly inconveniences other traffic. Always check safety and choose a place to stop where you will not be in the way.",
  "If you close up the following distance so as not to fall behind, you may react too late in an emergency and cause an accident.",
];
