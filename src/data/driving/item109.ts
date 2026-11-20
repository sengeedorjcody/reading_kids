import type { Row, Note } from "../drivingTest";

// 第2段階 項目9 特徴的な事故と事故の悲惨さ
export const FIGURE_NOS: number[] = [];

export const ROWS: Row[] = [
  [1, "交通事故の多くは運の悪いときに起きるもので、避けることはできない。", "Замын хөдөлгөөний ослын ихэнх нь азгүй үед тохиолддог бөгөөд зайлсхийх боломжгүй.", false],
  [2, "車は便利な乗りものであるが、使いかたを誤ると悲惨な事故を起こす恐ろしい凶器にもなる。", "Машин бол ашигтай унаа боловч буруу хэрэглэвэл эмгэнэлт осол гаргах аймшигтай зэвсэг ч болдог.", true],
  [3, "運転経験年数の短い人ほど死亡事故を起こす割合が高い。", "Жолооны туршлага багатай хүн байх тусмаа нас барсан осол гаргах хувь өндөр байдаг.", true],
  [4, "二輪車は、運転者のからだが露出しているため、わずかな接触事故でも運転者自身の死亡事故につながる危険性がある。", "Хоёр дугуйт тээврийн хэрэгсэл нь жолоочийн бие ил гарсан байдаг тул бага зэрэг шүргэлцсэн осол ч жолоочийн амь насанд хүрэх аюултай.", true],
  [5, "死亡事故は、夕方から夜にかけて多発している。", "Нас барсан осол оройноос шөнө хүртэлх хугацаанд их гардаг.", true],
  [6, "死亡事故は、交通量の多い昼間に集中している。", "Нас барсан осол замын хөдөлгөөн ихтэй өдрийн цагаар төвлөрдөг.", false],
  [7, "死亡事故の多くは、交差点とその付近で発生している。", "Нас барсан ослын ихэнх нь уулзвар болон түүний ойролцоо гардаг.", true],
  [8, "わき見運転が原因で大事故になることが多いので、運転中は同乗者との会話や周囲の風景などに気をとられないように注意しなければならない。", "Анхаарал сарниж хажуу тийш харж жолоодсоноос болж том осол гарах нь элбэг тул жолоодох үедээ зорчигчтой ярилцах болон орчны байгальд анхаарлаа сарниулахгүй байхыг анхаарах ёстой.", true],
  [9, "死亡事故原因のほとんどが、酒酔い運転である。", "Нас барсан ослын шалтгааны ихэнх нь согтуугаар тээврийн хэрэгсэл жолоодох явдал юм.", false],
  [10, "交通事故の発生には、事故を起こした加害者の心理状態が大きく影響している。", "Замын хөдөлгөөний осол гарахад осол гаргасан буруутай этгээдийн сэтгэл зүйн байдал ихээхэн нөлөөлдөг.", true],
  [11, "車間距離や側方間隔をあけて走行することは、危険を回避する場合の時間的余裕につながり、また自分や他人のミスをカバーできる場合がある。", "Машин хоорондын болон хажуугийн зай барьж явах нь аюулаас зайлсхийх цаг хугацааны нөөцтэй болгож, мөн өөрийн болон бусдын алдааг нөхөх боломж олгодог.", true],
  [12, "「これくらいのスピードなら事故にはならないだろう」などといった「だろう運転」が、交通事故の原因の多くを占めている。", "«Энэ зэргийн хурдтай байхад осол гарахгүй биз» гэх мэт «таамагласан жолоодлого» нь замын хөдөлгөөний ослын шалтгааны ихэнх хувийг эзэлдэг.", true],
  [13, "運転に慣れて上手になれば、大きな事故を起こすことはない。", "Жолоодлогод дасаж чадварлаг болбол том осол гаргахгүй.", false],
  [14, "交通事故を起こすと、運転者は民事上・刑事上・行政上の責任を負うことになる。", "Замын хөдөлгөөний осол гаргавал жолооч иргэний, эрүүгийн болон захиргааны хариуцлага хүлээх болно.", true],
  [15, "交通ルールを守ることは当然であるが、譲り合いの気持ちを持って運転することも大切である。", "Замын хөдөлгөөний дүрмийг баримтлах нь мэдээжийн хэрэг боловч харилцан найр тавих сэтгэлээр жолоодох нь бас чухал.", true],
];

export const NOTES: Note[] = [
  [[1], "運転者の心がまえ次第で防ぐことができる。", "Жолоочийн сэтгэл зүйн бэлтгэл, хандлагаас шалтгаалан урьдчилан сэргийлэх боломжтой."],
  [[4], "からだの露出が少ない服装で、必ず乗車用ヘルメットをかぶる。", "Бие ил бага гарсан хувцас өмсөж, заавал хамгаалалтын дуулга өмсөнө."],
  [[5, 6], "死亡事故は、暗くなり始める午後4時頃から午後8時頃までの間に多発している。", "Нас барсан осол харанхуй болж эхэлдэг үдээс хойш 4 цагаас оройн 8 цагийн хооронд их гардаг."],
  [[9], "死亡事故原因の多くは、漫然運転・わき見運転・安全不確認など。", "Нас барсан ослын шалтгааны ихэнх нь анхаарал суларсан жолоодлого, хажуу тийш сатаарах, аюулгүй байдлыг шалгахгүй байх зэрэг юм."],
  [[10], "気持ちに余裕がないときの運転は危険なので控えよう。", "Сэтгэл санаа тайван бус үед жолоодох нь аюултай тул татгалзъя."],
  [[12], "「大丈夫だろう」といった見込み運転は事故のもと。危険の可能性を予測する「かもしれない運転」を心がけよう。", "«Зүгээр байх» гэсэн таамагласан жолоодлого нь ослын эх үүсвэр болдог. Аюул гарч болзошгүйг урьдчилан тооцоолох «магадгүй гэсэн жолоодлого»-ыг хэвшүүлье."],
  [[13], "運転の慣れが事故につながるケースも多いので、過信は禁物。", "Жолоодлогод дассанаас болж осолд хүргэх тохиолдол ч их байдаг тул хэт эрдэх нь хориотой."],
];

export const EN: string[] = [
  "Most traffic accidents happen because of bad luck and cannot be avoided.",
  "A car is a convenient vehicle, but if misused it can become a terrifying weapon that causes tragic accidents.",
  "Drivers with fewer years of driving experience have a higher rate of fatal accidents.",
  "Because a rider's body is exposed on a two-wheeled vehicle, even a minor contact accident carries the risk of being fatal to the rider.",
  "Fatal accidents occur frequently from evening into night.",
  "Fatal accidents are concentrated during the daytime when traffic volume is heavy.",
  "Most fatal accidents occur at or near intersections.",
  "Inattentive driving often causes major accidents, so while driving you must be careful not to be distracted by conversation with passengers or the surrounding scenery.",
  "Drunk driving accounts for almost all causes of fatal accidents.",
  "The psychological state of the at-fault driver greatly influences the occurrence of traffic accidents.",
  "Keeping sufficient following distance and lateral clearance gives you time to avoid danger and can sometimes cover for your own or others' mistakes.",
  "\"Wishful-thinking driving\"—such as thinking \"I probably won't have an accident at this speed\"—accounts for a large proportion of traffic accident causes.",
  "Once you get used to driving and become skilled, you will not cause a major accident.",
  "If you cause a traffic accident, you bear civil, criminal and administrative responsibility.",
  "Obeying traffic rules is a matter of course, but it is also important to drive with a spirit of mutual yielding.",
];

export const NOTES_EN: string[] = [
  "Accidents can be prevented depending on the driver's mindset.",
  "Wear clothing that exposes little skin and always wear a riding helmet.",
  "Fatal accidents occur frequently between about 4 p.m., when it starts getting dark, and about 8 p.m.",
  "Most fatal accidents are caused by absent-minded driving, distracted driving, failure to check safety, and similar factors.",
  "Driving when you have no mental leeway is dangerous, so refrain from it.",
  "Wishful driving based on thinking \"it'll probably be fine\" is a cause of accidents. Aim for \"what-if driving\" that anticipates potential dangers.",
  "Getting too used to driving often leads to accidents, so overconfidence is strictly to be avoided.",
];
