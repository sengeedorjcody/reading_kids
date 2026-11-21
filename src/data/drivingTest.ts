// 外免切替 (foreign licence conversion) practice questions.
// Source: "Collection of Exercises 項目別ポイント1000" (photographed pages).
// To add more questions: append to QUESTIONS (and a new entry to ITEMS if
// it's a new 項目). `answer: true` = ○, `false` = ×.

export interface DrivingItem {
  id: number; // stage 1 → 1..17, stage 2 → 100 + n (the book restarts numbering per stage)
  stage: 1 | 2;
  num: number; // 項目 number as printed in the book
  ja: string;
  mn: string;
  en: string;
}

export interface DrivingQuestion {
  id: string; // `${item}-${no}`
  item: number;
  no: number;
  ja: string;
  mn: string;
  en: string;
  /** Illustration URL (only set when NEXT_PUBLIC_DRIVING_IMAGE_BASE is configured). */
  image?: string;
  answer: boolean;
  explainJa?: string;
  explainMn?: string;
  explainEn?: string;
}

export const ITEMS: DrivingItem[] = [
  { id: 1, stage: 1, num: 1, ja: "運転者の心得", mn: "Жолоочийн сэтгэлгээ, ёс зүй", en: "Driver's attitude and manners" },
  { id: 2, stage: 1, num: 2, ja: "信号に従うこと", mn: "Гэрлэн дохио, дохиог дагах", en: "Obeying signals" },
  { id: 5, stage: 1, num: 5, ja: "緊急自動車などの優先", mn: "Яаралтай тээврийн хэрэгсэл зэргийн тэргүүлэх эрх", en: "Priority for emergency vehicles, etc." },
  { id: 6, stage: 1, num: 6, ja: "交差点・踏切", mn: "Уулзвар ба төмөр замын гарам", en: "Intersections and railroad crossings" },
  { id: 7, stage: 1, num: 7, ja: "安全な速度と車間距離", mn: "Аюулгүй хурд ба хоорондын зай", en: "Safe speed and following distance" },
  { id: 8, stage: 1, num: 8, ja: "歩行者の保護など", mn: "Явган зорчигчийг хамгаалах зэрэг", en: "Protecting pedestrians, etc." },
  { id: 9, stage: 1, num: 9, ja: "安全の確認と合図・警音器の使用", mn: "Аюулгүй байдлыг шалгах, дохио ба дуут дохио хэрэглэх", en: "Confirming safety, signaling, and using the horn" },
  { id: 10, stage: 1, num: 10, ja: "進路変更など", mn: "Чиглэл өөрчлөх зэрэг", en: "Changing course, etc." },
  { id: 11, stage: 1, num: 11, ja: "追い越し", mn: "Гүйцэж түрүүлэх", en: "Overtaking" },
  { id: 12, stage: 1, num: 12, ja: "行き違い", mn: "Зөрж өнгөрөх", en: "Passing oncoming traffic" },
  { id: 13, stage: 1, num: 13, ja: "運転免許制度・交通反則通告制度", mn: "Жолооны үнэмлэхийн тогтолцоо ба замын хөдөлгөөний зөрчлийн мэдэгдлийн тогтолцоо", en: "Driver's license system and traffic violation notification system" },
  { id: 14, stage: 1, num: 14, ja: "オートマチック車などの運転", mn: "Автомат кроптой машин зэргийн жолоодлого", en: "Driving automatic vehicles, etc." },
  { id: 104, stage: 2, num: 4, ja: "死角と運転", mn: "Харагдахгүй бүс ба жолоодлого", en: "Blind spots and driving" },
  { id: 105, stage: 2, num: 5, ja: "適性検査結果に基づく行動分析", mn: "Жолоочийн чадварын сорилын үр дүнд суурилсан үйлдлийн шинжилгээ", en: "Behavioral analysis based on aptitude test results" },
  { id: 106, stage: 2, num: 6, ja: "人間の能力と運転", mn: "Хүний чадвар ба жолоодлого", en: "Human abilities and driving" },
  { id: 107, stage: 2, num: 7, ja: "車に働く自然の力と運転", mn: "Машинд үйлчлэх байгалийн хүч ба жолоодлого", en: "Natural forces acting on vehicles and driving" },
  { id: 108, stage: 2, num: 8, ja: "悪条件下での運転", mn: "Хүндрэлтэй нөхцөл дэх жолоодлого", en: "Driving under adverse conditions" },
  { id: 109, stage: 2, num: 9, ja: "特徴的な事故と事故の悲惨さ", mn: "Онцлог осол ба ослын эмгэнэлт хор уршиг", en: "Characteristic accidents and the tragedy of accidents" },
  { id: 110, stage: 2, num: 10, ja: "自動車の保守管理", mn: "Автомашины арчилгаа, техникийн үйлчилгээ", en: "Vehicle maintenance and management" },
  { id: 111, stage: 2, num: 11, ja: "駐車と停車", mn: "Удаан зогсох ба түр зогсох", en: "Parking and stopping" },
  { id: 112, stage: 2, num: 12, ja: "乗車と積載", mn: "Зорчигч тээвэрлэх ба ачаа ачих", en: "Carrying passengers and loading cargo" },
  { id: 113, stage: 2, num: 13, ja: "けん引", mn: "Чирэх", en: "Towing" },
  { id: 114, stage: 2, num: 14, ja: "交通事故のとき", mn: "Замын хөдөлгөөний ослын үед", en: "In case of a traffic accident" },
  { id: 115, stage: 2, num: 15, ja: "自動車の所有者などの心得と保険制度", mn: "Автомашин эзэмшигчийн анхаарах зүйлс ба даатгалын тогтолцоо", en: "Responsibilities of vehicle owners and the insurance system" },
  { id: 116, stage: 2, num: 16, ja: "経路の設計", mn: "Замын чиглэл төлөвлөх", en: "Route planning" },
  { id: 117, stage: 2, num: 17, ja: "高速道路での運転", mn: "Хурдны зам дээрх жолоодлого", en: "Driving on expressways" },
];

// Illustrations live in S3 under `driving-test/<item>-<no>.jpeg`. Set
// NEXT_PUBLIC_DRIVING_IMAGE_BASE to e.g.
//   https://<bucket>.s3.<region>.amazonaws.com/driving-test
// and every question listed in IMAGE_NOS gets its image automatically.
const IMAGE_BASE = (process.env.NEXT_PUBLIC_DRIVING_IMAGE_BASE ?? "").replace(/\/$/, "");
const IMAGE_NOS: Record<number, number[]> = {
  // Only 1-28 has no image yet. Items 2+ mix generated pictures and crops of the book's own figures.
  1: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 29, 30],
  2: [1, 2, 4, 5, 6, 7, 8, 9, 12, 13, 21],
  5: [18, 19, 20, 25, 26, 27],
  6: [9, 10, 11, 15, 17, 18, 22, 24],
  7: [3, 4, 16],
  8: [6],
  9: [21, 27],
  10: [13, 15, 16, 17, 24, 25, 26, 27],
  11: [27, 28],
  13: [15],
  111: [11, 24],
  117: [3, 6, 8, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30],
};
function imageUrl(item: number, no: number): string | undefined {
  if (!IMAGE_BASE || !IMAGE_NOS[item]?.includes(no)) return undefined;
  return `${IMAGE_BASE}/${item}-${no}.jpeg`;
}

export type Row = [no: number, ja: string, mn: string, answer: boolean];
export type Note = [nos: number[], ja: string, mn: string];

// `en` / `enNotes` are aligned by position with `rows` / `notes`.
function build(item: number, rows: Row[], notes: Note[], en: string[], enNotes: string[], figureNos: number[] = []): DrivingQuestion[] {
  return rows.map(([no, ja, mn, answer], i) => {
    const ni = notes.findIndex(([nos]) => nos.includes(no));
    return {
      id: `${item}-${no}`,
      item,
      no,
      ja,
      mn,
      en: en[i],
      image: imageUrl(item, no),
      answer,
      explainJa: ni >= 0 ? notes[ni][1] : undefined,
      explainMn: ni >= 0 ? notes[ni][2] : undefined,
      explainEn: ni >= 0 ? enNotes[ni] : undefined,
    };
  }).filter((q) => !figureNos.includes(q.no) || q.image); // figure-dependent questions stay hidden until their image exists
}

// ── 項目1 運転者の心得 ────────────────────────────────────────────────
const ITEM1_ROWS: Row[] = [
  [1, "車を運転するときは、法を守るだけでなく、お互いに譲りあう思いやりの気持ちも大切である。", "Машин жолоодохдоо хуулийг дагахаас гадна бие биедээ зам тавьж өгөх халамжтай сэтгэл чухал.", true],
  [2, "運転中に車の窓からタバコの吸いがらや空き缶を投げ捨てることは、他人に迷惑をかけるだけでなく、他の交通にも危険をおよぼすことになる。", "Жолоодож яваад цонхоор тамхины иш, хоосон лааз шидэх нь бусдад төвөг учруулаад зогсохгүй бусад хөдөлгөөнд аюул учруулна.", true],
  [3, "運転者は、他の車や歩行者だけでなく、付近で生活をしている人達にも迷惑をかけない運転をしなければいけない。", "Жолооч бусад машин, явган хүнээс гадна ойр орчмын оршин суугчдад төвөг учруулахгүйгээр жолоодох ёстой.", true],
  [4, "チャイルドシートは、どのような使いかたをしてもその効果は変わらない。", "Хүүхдийн суудлыг ямар ч байдлаар хэрэглэсэн үр дүн нь адилхан.", false],
  [5, "歩行者は保護しなければならないが、人も車も交通規則を守るべきなので、交通規則を無視する歩行者まで保護する必要はない。", "Явган хүнийг хамгаалах ёстой ч хүн машин хоёулаа дүрмээ дагах ёстой тул дүрмийг үл хэрэгсэгч явган хүнийг хамгаалах шаардлагагүй.", false],
  [6, "信号機の近くに信号と似た色のネオンサインを設けたり、標識の近くに広告看板を設けたりしてはならない。", "Гэрлэн дохионы ойролцоо дохиотой төстэй өнгийн неон, тэмдгийн ойролцоо сурталчилгааны самбар байрлуулж болохгүй.", true],
  [7, "四輪車を運転するときは、クラッチペダル（オートマチック車はブレーキペダル）を踏み込んだとき、ひざがのびきった状態に座席を調節するとよい。", "Дөрвөн дугуйтай машин жолоодохдоо дөнгө (автомат бол тоормосны дөрөө) гишгэсэн үед өвдөг бүрэн тэгширсэн байхаар суудлаа тохируулбал зүгээр.", false],
  [8, "四輪車を運転するときは、ハンドルを握ったとき、ひじがわずかにまがる程度に座席やハンドルを調節するとよい。", "Дөрвөн дугуйтай машин жолоодохдоо жолооны хүрдийг атгахад тохой бага зэрэг нугарсан байхаар суудал, хүрдээ тохируулбал зүгээр.", true],
  [9, "普通自動車で長距離を運転するときは、疲れないようにからだを斜めにして、ひじを窓枠にのせるとよい。", "Энгийн машинаар хол явахдаа ядрахгүйн тулд бие налж, тохойгоо цонхны хүрээн дээр тавибал зүгээр.", false],
  [10, "運転者は酒に酔って運転してはならないが、少量の酒気を帯びた程度なら運転してもよい。", "Жолооч согтуу жолоодож болохгүй, гэхдээ бага зэрэг архины үнэртэй бол жолоодож болно.", false],
  [11, "交通事故や交通違反をすると、刑事上・民事上・行政上の責任を負わなければならない。", "Замын хөдөлгөөний осол, зөрчил гаргавал эрүүгийн, иргэний, захиргааны хариуцлага хүлээнэ.", true],
  [12, "幼児を乗せて自動車を運転する場合は、後部座席でシートベルトを着用させれば、チャイルドシートを使用させる必要はない。", "Бага насны хүүхэд суулгавал арын суудалд бүсээ зүүлгэсэн бол хүүхдийн суудал хэрэглэх шаардлагагүй.", false],
  [13, "幼児を乗せて自動車を運転する場合は、発育の程度に応じた形状のチャイルドシートをその幼児に使用させなければならない。", "Бага насны хүүхэд суулгавал өсөлтөд нь тохирсон хүүхдийн суудлыг заавал хэрэглүүлэх ёстой.", true],
  [14, "二輪車に乗るときは、夏でもできるだけからだの露出の少ない服装がよい。", "Хоёр дугуйт тээврийн хэрэгсэлд зуны улиралд ч биеийн ил гарсан хэсэг аль болох бага хувцаслах нь зүйтэй.", true],
  [15, "普通自動二輪車や大型自動二輪車に乗車するときのヘルメットは、あごひもをしっかりしめれば工事用ヘルメットでもよい。", "Мотоцикл унахдаа эрүүний оосроо сайн бэхэлсэн бол барилгын малгайгаар ч болно.", false],
  [16, "人通りの多い道路でこどもとサッカーの練習をした。", "Хүн ихтэй замд хүүхэдтэй хөлбөмбөгийн дасгал хийв.", false],
  [17, "車を運転するときの服装やはきものは、運転操作のしやすさに影響するので、注意して選ぶ必要がある。", "Жолоодох үеийн хувцас, гутал жолоодлогын хялбар байдалд нөлөөлдөг тул анхааралтай сонгох хэрэгтэй.", true],
  [18, "自動車を運転するときは、運転しようとする自動車に応じた運転免許証または免許情報記録個人番号カード（免許情報が記録されているマイナンバーカード）を携帯しなければならない。", "Машин жолоодохдоо тухайн машинд тохирсон жолооны үнэмлэх эсвэл лицензийн мэдээлэл бүртгэгдсэн Майнамба карт авч явах ёстой.", true],
  [19, "道路工事のとき、標識が作業の妨げになったので、取り除いてから警察官に報告した。", "Замын засварын үеэр тэмдэг ажилд саад болсон тул авч хаяад дараа нь цагдаад мэдэгдсэн.", false],
  [20, "エアバッグのついている車は安全なので、シートベルトをしなくてもよい。", "Аюулгүйн дэр бүхий машин аюулгүй тул хамгаалах бүс зүүхгүй байж болно.", false],
  [21, "シートベルトをするとき、腰ベルトは骨盤を巻くようにしめるとよい。", "Хамгаалах бүс зүүхдээ бэлхүүсийн бүсийг аарцагны яс тойруулан чангалах нь зүйтэй.", true],
  [22, "自動車を運転するときは、後部座席などの同乗者にもシートベルトを着用させなければならない。", "Машин жолоодохдоо арын суудлын зорчигчдод ч хамгаалах бүс зүүлгэх ёстой.", true],
  [23, "シートベルトは、病気などの療養のためや健康保持のためなどで、やむを得ない理由のある場合はしなくてもよい。", "Өвчний эмчилгээ, эрүүл мэндийн зайлшгүй шалтгаантай бол хамгаалах бүс зүүхгүй байж болно.", true],
  [24, "自動運転車で自動運行装置を適切に使っている場合を除き、自動車や原動機付自転車または自転車で走行中に携帯電話を通話のために使用したり、メールの送受信のため画像を注視したりしてはならない。", "Автомат жолоодлогын төхөөрөмжийг зөв ашиглаж буй тохиолдлоос бусад үед машин, мопед, дугуйгаар явж байхдаа утсаар ярих, мессеж илгээх/хүлээн авахаар дэлгэц ширтэж болохгүй.", true],
  [25, "携帯電話は、運転の前に電源を切るかドライブモードに設定して、呼出音が鳴らないようにするとよい。", "Жолоодохын өмнө утсаа унтрааж эсвэл жолоодлогын горимд тохируулж, дуудлагын дуу гарахгүй болгох нь зүйтэй.", true],
  [26, "道路で、酒に酔ってふらついたり、寝そべったりするなど、交通の妨げとなるようなことをしてはならない。", "Замд согтуугаар найгах, хэвтэх зэргээр хөдөлгөөнд саад болох зүйл хийж болохгүй.", true],
  [27, "歩道と車道の区別のある道路では、歩道に植木鉢などを置いてもよい。", "Явган хүний зам, машины зам тусгаарлагдсан замд явган хүний зам дээр цэцгийн сав зэргийг тавьж болно.", false],
  [28, "目的地までの経路を間違えないように、カーナビゲーション装置の画像を注視して運転するとよい。", "Зам андуурахгүйн тулд машины навигацийн дэлгэцийг ширтэж жолоодбол зүгээр.", false],
  [29, "自動車検査証や自動車損害賠償責任保険証明書は、大切なものなので自宅に保管しておくほうがよい。", "Машины үзлэгийн гэрчилгээ, даатгалын гэрчилгээ чухал тул гэртээ хадгалсан нь дээр.", false],
  [30, "自動車を運転するときは、自動車検査証と自動車損害賠償責任保険証明書などを車に備えておかなければならない。", "Машин жолоодохдоо машины үзлэгийн гэрчилгээ, даатгалын гэрчилгээ зэргийг машиндаа байлгах ёстой.", true],
];

const ITEM1_NOTES: Note[] = [
  [[1, 2, 3], "思いやりとマナーは「他人に迷惑をかけない」のと「安全第一」が基本。どんな場合でも、道路にごみを捨てるのはルール違反と覚えておこう。", "Ёс зүйн үндэс нь «бусдад төвөг учруулахгүй» ба «аюулгүй байдал эхэнд». Ямар ч тохиолдолд замд хог хаях нь дүрэм зөрчсөн үйлдэл."],
  [[4], "チャイルドシートは、取扱説明書に従い正しく使用させないと十分な効果が得られない。", "Хүүхдийн суудлыг зааврын дагуу зөв хэрэглэхгүй бол хангалттай үр дүн гарахгүй."],
  [[5], "ルールを知らない歩行者を保護したりすることも、運転者の思いやりだ。また、歩行者の保護は最大の義務。", "Дүрэм мэддэггүй явган хүнийг хамгаалах нь ч жолоочийн халамж. Явган хүнийг хамгаалах нь хамгийн том үүрэг."],
  [[7, 8, 9], "ひざやひじは少しまがる程度に。正しい姿勢で運転することが安全運転の基本。", "Өвдөг, тохой бага зэрэг нугарсан байх ёстой. Зөв байрлалаар жолоодох нь аюулгүй жолоодлогын үндэс."],
  [[10], "どんな理由であろうと「乗るなら飲むな」が鉄則だ。", "Ямар шалтгаантай ч «жолоодвол уухгүй» гэдэг нь гол дүрэм."],
  [[15], "ヘルメットは必ずPS(C)マークかJISマークのついた乗車用のものを。", "Дуулга нь заавал PS(C) эсвэл JIS тэмдэгтэй, унахад зориулагдсан байх ёстой."],
  [[20, 21, 22, 23], "シートベルトの肩ベルトは首にかからないように。また、腰ベルトは骨盤に巻く。エアバッグつきの車でもしめる。同乗者の着用もドライバーの義務だが、病気などでやむを得ない場合は例外となる。", "Мөрний бүс хүзүүнд хүрэхгүй байх ёстой, бэлхүүсийн бүс аарцагны яс тойрно. Аюулгүйн дэртэй машинд ч зүүнэ. Зорчигчийг зүүлгэх нь жолоочийн үүрэг, гэхдээ өвчин зэрэг зайлшгүй шалтгаан бол үл хамаарна."],
  [[29, 30], "自動車には、自動車検査証や自動車損害賠償責任保険証明書を必ず備えることが義務。コピーではダメ。", "Машинд үзлэгийн гэрчилгээ, даатгалын гэрчилгээг заавал байлгах үүрэгтэй. Хуулбар болохгүй."],
];

const ITEM1_EN: string[] = [
  "When driving, it is important not only to obey the law but also to be considerate and give way to one another.",
  "Throwing cigarette butts or empty cans out of the car window not only inconveniences others but also endangers other traffic.",
  "Drivers must drive without inconveniencing not only other vehicles and pedestrians but also people living in the neighborhood.",
  "A child seat has the same effect no matter how it is used.",
  "Pedestrians must be protected, but since both people and cars should obey traffic rules, there is no need to protect pedestrians who ignore the rules.",
  "You must not install neon signs of a color similar to traffic signals near a signal, or advertising signboards near a road sign.",
  "When driving a four-wheeled vehicle, adjust the seat so that your knee is fully extended when you press the clutch pedal (brake pedal for automatics).",
  "When driving a four-wheeled vehicle, adjust the seat and steering wheel so that your elbows are slightly bent when holding the wheel.",
  "On long drives in an ordinary car, it is good to lean your body sideways and rest your elbow on the window frame to avoid fatigue.",
  "A driver must not drive drunk, but may drive if only slightly under the influence of alcohol.",
  "If you cause a traffic accident or commit a traffic violation, you bear criminal, civil and administrative responsibility.",
  "When driving with a small child, you do not need to use a child seat if the child wears a seat belt in the back seat.",
  "When driving with a small child, you must have the child use a child seat of a shape suited to the child's stage of development.",
  "When riding a two-wheeled vehicle, it is best to wear clothing that exposes as little skin as possible, even in summer.",
  "When riding a motorcycle, a construction helmet is acceptable as long as the chin strap is fastened firmly.",
  "I practiced soccer with my child on a busy road.",
  "Clothing and footwear affect how easily you can operate the vehicle, so they must be chosen carefully.",
  "When driving, you must carry the driver's license for that type of vehicle, or a My Number card that has the license information recorded on it.",
  "During road construction, a sign got in the way of the work, so I removed it and then reported it to a police officer.",
  "Cars with airbags are safe, so you do not need to wear a seat belt.",
  "When fastening a seat belt, the lap belt should be placed across the pelvis.",
  "When driving, you must make passengers in the rear seats wear seat belts too.",
  "You do not have to wear a seat belt if there is an unavoidable reason such as medical treatment or health maintenance.",
  "Except when properly using an automatic driving system, you must not use a mobile phone to talk, or stare at its screen to send or receive messages, while driving a car, moped or bicycle.",
  "Before driving, it is good to turn off your phone or set it to driving mode so that it does not ring.",
  "You must not do things that obstruct traffic on the road, such as staggering around drunk or lying down.",
  "On roads with separate sidewalks and roadways, you may put flower pots on the sidewalk.",
  "To avoid taking a wrong route, it is good to keep watching the car navigation screen while driving.",
  "The vehicle inspection certificate and compulsory insurance certificate are important, so it is better to keep them at home.",
  "When driving, you must keep the vehicle inspection certificate and the compulsory insurance certificate in the car.",
];

const ITEM1_NOTES_EN: string[] = [
  "Etiquette rests on \"not inconveniencing others\" and \"safety first.\" Remember that throwing trash on the road is a rule violation in any situation.",
  "A child seat does not give enough protection unless it is used correctly according to its instruction manual.",
  "Protecting pedestrians who do not know the rules is also part of a driver's consideration. Protecting pedestrians is the greatest duty.",
  "Knees and elbows should be slightly bent. Driving in the correct posture is the basis of safe driving.",
  "Whatever the reason, the iron rule is: if you drive, don't drink.",
  "Always use a helmet for riding that bears the PS(C) mark or JIS mark.",
  "The shoulder belt must not touch the neck, and the lap belt goes across the pelvis. Wear it even in cars with airbags. Making passengers wear belts is also the driver's duty, but there are exceptions for unavoidable reasons such as illness.",
  "Cars must always carry the vehicle inspection certificate and the compulsory insurance certificate. Copies are not acceptable.",
];

// ── 項目6 人間の能力と運転 ──────────────────────────────────────────
const ITEM6_ROWS: Row[] = [
  [1, "交差点で右折するときは、対向車線を直進してくる二輪車の距離や速度を見誤ることがあるので注意する。", "Уулзвар дээр баруун тийш эргэхдээ эсрэг эгнээгээр шулуун ирж буй хоёр дугуйт машины зай, хурдыг андуурч болзошгүй тул анхаарна.", true],
  [2, "同じ距離で対向車が近づいてきても、大型車は実際より近く、小型車は遠くに見える。", "Ижил зайнаас эсрэг машин ойртож ирэхэд том машин бодит зайгаасаа ойр, жижиг машин холоос харагддаг.", true],
  [3, "二輪車は車体が小さいため、四輪車の運転者から実際の速度より遅く感じられたり、距離も遠く離れているように見られたりする。", "Хоёр дугуйт машин жижиг тул дөрвөн дугуйт жолоочид бодит хурдаасаа удаан, зай нь холдсон мэт санагддаг.", true],
  [4, "車の速度が速くなるほど、運転者の確認できる視野は狭くなり、前方注視点が遠くなる。", "Хурд ихсэх тусам жолоочийн харах талбай нарийсч, урд харах цэг холдоно.", true],
  [5, "車の速度が速くなるほど、運転者の確認できる視野は狭くなり、遠くはぼやけ、近くはよく見えるようになる。", "Хурд ихсэх тусам харах талбай нарийсч, холын зүйл бүдэг, ойрын зүйл тод харагдана.", false],
  [6, "人間の速度の判断は必ずしも正確でないので、速度計を見て確認するのがよい。", "Хүний хурд тооцох чадвар үргэлж үнэн зөв биш тул хурдны заагуураар шалгах нь зүйтэй.", true],
  [7, "注視点は、できるだけ車のすぐ前を見て、あまり遠くを見ないほうがよい。", "Харах цэг нь машины яг урд талыг харж, холыг тийм ч их харахгүй байх нь дээр.", false],
  [8, "運転中は注意力を集中させるために、あまり広く見渡すよりも、一点を注視するのがよい。", "Жолоодох үед анхаарлаа төвлөрүүлэхийн тулд өргөн хараад байхаас нэг цэгийг ширтсэн нь дээр.", false],
  [9, "トンネルに出入りする場合は、視力が著しく低下するので、目が慣れるまでは速度を落として運転する。", "Хонгилд орох, гарах үед хараа мэдэгдэхүйц муудах тул нүд дасах хүртэл хурдаа бууруулж жолоодно.", true],
  [10, "明るさが急に変わると、視力は一時的に低下する。", "Гэрэлтүүлэг гэнэт өөрчлөгдөхөд хараа түр зуур муудна.", true],
  [11, "明るいところから急に暗いトンネルに入ると、視力は一時急激に低下するので、トンネルに入ってから速度を落とすようにする。", "Гэрэлтэй газраас харанхуй хонгилд гэнэт ортолоо хараа огцом муудах тул хонгилд орсны дараа хурдаа бууруулна.", false],
  [12, "同じ速度で走っていても、夜間は昼間よりも遅く感じる。", "Ижил хурдаар явж байсан ч шөнө өдрийнхөөс удаан санагддаг.", true],
  [13, "運転者が危険を認めて急ブレーキをかけても、ブレーキがきき始めるまでには1秒くらいかかるので、速度が速くなるほど危険を避けにくくなる。", "Жолооч аюулыг мэдэрч огцом тоормослосон ч тоормос ажиллаж эхлэх хүртэл ойролцоогоор 1 секунд зарцуулдаг тул хурд ихсэх тусам аюулаас зайлсхийхэд хэцүү болно.", true],
  [14, "反応時間の長さは、年齢とは無関係である。", "Хариу үйлдлийн хугацаа нас хамаарахгүй.", false],
  [15, "反応時間とは、運転者が危険を発見したときからブレーキがきき始めるまでにかかる時間で、心身の状態などにより長くなることがある。", "Хариу үйлдлийн хугацаа гэдэг нь жолооч аюулыг олж харснаас тоормос ажиллаж эхлэх хүртэлх хугацаа бөгөөд бие сэтгэлийн байдлаас болж уртсаж болно.", true],
  [16, "酒を飲むと、量の多少にかかわらず認知や判断力が鈍り、注意力が低下するので、車の運転をしてはならない。", "Архи уусан бол хэмжээнээс үл хамааран танин мэдэхүй, шийдвэр гаргах чадвар мохож, анхаарал буурдаг тул машин жолоодож болохгүй.", true],
  [17, "自分で酔っていないと思う程度の少量の酒を飲んだときは、車を運転してもよい。", "Өөрөө согтоогүй гэж бодох хэмжээний бага архи уусан бол машин жолоодож болно.", false],
  [18, "眠気をもよおすような薬などを服用したときは、車の運転をしてはならない。", "Нойрмоглуулах эм уусан бол машин жолоодож болохгүй.", true],
  [19, "薬はからだの調子をよくする働きがあるので、どのような薬を飲んでも運転には支障がない。", "Эм нь биеийн байдлыг сайжруулдаг тул ямар эм уусан ч жолоодлогод саад болохгүй.", false],
  [20, "疲れると視力が低下し、障害物を見落としたり、見間違えたりするので、運転を中止して休息をとるようにする。", "Ядарвал хараа муудаж, саад бэрхшээлийг анзаарахгүй, андуурч болзошгүй тул жолоодлогоо зогсоож амарна.", true],
  [21, "運転中、眠気を感じたときは、窓を開け新鮮な空気を入れたり、車から降りて体操するなどして気分転換をする。", "Жолоодох үедээ нойрмоглосон бол цонх нээж цэвэр агаар оруулах, машинаас бууж дасгал хийх зэргээр сэргэнэ.", true],
  [22, "運転中に少しでも眠くなったら、安全な場所に車を止め、休憩をとることが必要である。", "Жолоодох үедээ бага зэрэг ч гэсэн нойрмоглосон бол аюулгүй газар зогсоод амрах шаардлагатай.", true],
  [23, "運転者が疲れていても、反応時間に影響することはないので、停止距離が長くなることはない。", "Жолооч ядарсан ч хариу үйлдлийн хугацаанд нөлөөлөхгүй тул зогсолтын зай уртсахгүй.", false],
  [24, "車を運転しているとき、速度や明るさの変化で目が見えにくくなることはあるが、疲労から見えにくくなることはない。", "Жолоодох үед хурд, гэрлийн өөрчлөлтөөс болж харахад хэцүү болдог ч ядралаас болж хэцүү болдоггүй.", false],
  [25, "運転者の心理状態や健康状態は、運転に大きな影響を与え、交通事故の原因になることがある。", "Жолоочийн сэтгэл зүй, эрүүл мэндийн байдал жолоодлогод ихээхэн нөлөөлж, ослын шалтгаан болдог.", true],
  [26, "運転中の疲労の影響は目に強く現れ、疲労の度合いが高まるにつれて見落としや見間違いが多くなる。", "Жолоодох үеийн ядрал нүдэнд хүчтэй илэрч, ядрал нэмэгдэх тусам анзааралгүй өнгөрөх, андуурах нь олширно.", true],
  [27, "気分が不安定なときや、ひどく疲れていてからだの調子が悪いときは、事故を起こしやすいので運転を控えたほうがよい。", "Сэтгэл тогтворгүй, маш их ядарч биеийн байдал муу үед осол гаргах магадлал өндөр тул жолоодохоос татгалзсан нь дээр.", true],
  [28, "自動車の運転は認知・判断・操作が大切であるが、最も大切なのは操作で、交通事故の原因の大半を占めている。", "Жолоодлогод танин мэдэхүй, шийдвэр, үйлдэл чухал боловч хамгийн чухал нь үйлдэл бөгөөд ослын ихэнх шалтгааныг эзэлдэг.", false],
  [29, "色彩を完全に確認できる視野は狭いので、信号や標識はよく見ないと見間違えるおそれがある。", "Өнгийг бүрэн ялгаж чадах харах талбай нарийн тул дохио, тэмдгийг сайн харахгүй бол андуурах эрсдэлтэй.", true],
  [30, "静止しているときと、動きながらものを見るときとでは、視力に変化はない。", "Зогсож байхад болон хөдөлж байхдаа юм харахад хараа ялгаагүй.", false],
];

const ITEM6_NOTES: Note[] = [
  [[7, 8], "注視点はできるだけ遠く、また目を動かして広く見渡し、情報を早めにキャッチしよう。", "Харах цэгээ аль болох хол тавьж, нүдээ хөдөлгөн өргөн ажиглаж мэдээллийг эртхэн авна."],
  [[11], "トンネルに入る前に速度を落とす。", "Хонгилд орохоосоо өмнө хурдаа бууруулна."],
  [[14], "一般的に、年をとるほど反応時間は長くなる。", "Ерөнхийдөө нас ахих тусам хариу үйлдлийн хугацаа уртсана."],
  [[16, 17], "運転をするときは、たとえ少量でもアルコールは厳禁。", "Жолоодохдоо бага хэмжээний ч архи хатуу хориотой."],
  [[28], "交通事故の多くは、認知が原因。前方不注意や見落とし、認知の遅れなどが事故につながっている。", "Ослын ихэнх шалтгаан нь танин мэдэхүй. Урагшаа анхаарал сулрах, анзааралгүй өнгөрөх, мэдрэхүй хоцрох нь ослын шалтгаан болдог."],
];

const ITEM6_EN: string[] = [
  "When turning right at an intersection, be careful: you may misjudge the distance and speed of a two-wheeled vehicle coming straight in the oncoming lane.",
  "Even at the same distance, an oncoming large vehicle looks closer than it really is, and a small vehicle looks farther away.",
  "Because two-wheeled vehicles are small, four-wheeled drivers may feel they are slower than they really are and look farther away than they really are.",
  "The faster the car goes, the narrower the driver's field of view becomes and the farther the point of focus ahead.",
  "The faster the car goes, the narrower the field of view becomes; distant things look blurred and nearby things look clearer.",
  "Human judgment of speed is not always accurate, so it is good to check with the speedometer.",
  "It is better to look just in front of the car and not look too far ahead.",
  "To concentrate while driving, it is better to stare at one point than to look over a wide area.",
  "When entering or leaving a tunnel, vision drops sharply, so slow down until your eyes adjust.",
  "When brightness changes suddenly, vision temporarily decreases.",
  "When you enter a dark tunnel suddenly from a bright place, vision drops sharply for a moment, so slow down after entering the tunnel.",
  "Even at the same speed, you feel slower at night than during the day.",
  "Even if a driver recognizes danger and brakes hard, it takes about one second before the brakes take effect, so the faster the speed, the harder it is to avoid danger.",
  "The length of reaction time has nothing to do with age.",
  "Reaction time is the time from when the driver notices danger until the brakes start to work, and it can become longer depending on physical and mental condition.",
  "If you drink alcohol, regardless of the amount, perception and judgment dull and attention drops, so you must not drive.",
  "If you drank a small amount of alcohol and don't think you are drunk, you may drive.",
  "If you have taken medicine that causes drowsiness, you must not drive.",
  "Medicine makes your body feel better, so whatever medicine you take, it does not affect driving.",
  "When tired, eyesight declines and you may overlook or misjudge obstacles, so stop driving and take a rest.",
  "If you feel sleepy while driving, refresh yourself by opening the window for fresh air or getting out of the car to do some exercise.",
  "If you feel even slightly sleepy while driving, you need to stop the car in a safe place and take a break.",
  "Even if a driver is tired, reaction time is not affected, so the stopping distance does not get longer.",
  "While driving, your vision may worsen due to changes in speed or brightness, but it never worsens because of fatigue.",
  "A driver's psychological and physical condition greatly affects driving and can cause traffic accidents.",
  "The effect of fatigue while driving shows strongly in the eyes; as fatigue increases, you overlook and misjudge more.",
  "When your mood is unstable, or you are very tired and unwell, you are likely to cause an accident, so it is better to refrain from driving.",
  "Driving requires perception, judgment and operation, but operation is the most important and accounts for most causes of traffic accidents.",
  "The field of view in which colors can be fully recognized is narrow, so if you don't look carefully you may misread signals and signs.",
  "There is no change in eyesight between when you are still and when you look at things while moving.",
];

const ITEM6_NOTES_EN: string[] = [
  "Set your point of focus as far ahead as possible, and move your eyes to look over a wide area to pick up information early.",
  "Slow down before entering a tunnel.",
  "In general, reaction time gets longer with age.",
  "Even a small amount of alcohol is strictly forbidden when driving.",
  "Most traffic accidents are caused by perception. Inattention to the front, overlooking things and delayed perception lead to accidents.",
];

import * as item2 from "./driving/item2";
import * as item5 from "./driving/item5";
import * as item6 from "./driving/item6";
import * as item7 from "./driving/item7";
import * as item8 from "./driving/item8";
import * as item9 from "./driving/item9";
import * as item10 from "./driving/item10";
import * as item11 from "./driving/item11";
import * as item12 from "./driving/item12";
import * as item13 from "./driving/item13";
import * as item14 from "./driving/item14";
import * as item104 from "./driving/item104";
import * as item105 from "./driving/item105";
import * as item107 from "./driving/item107";
import * as item108 from "./driving/item108";
import * as item109 from "./driving/item109";
import * as item110 from "./driving/item110";
import * as item111 from "./driving/item111";
import * as item112 from "./driving/item112";
import * as item113 from "./driving/item113";
import * as item114 from "./driving/item114";
import * as item115 from "./driving/item115";
import * as item116 from "./driving/item116";
import * as item117 from "./driving/item117";

export function itemLabel(id: number): string {
  const it = ITEMS.find((x) => x.id === id);
  return it ? `第${it.stage}段階 項目${it.num}` : `項目${id}`;
}

export const QUESTIONS: DrivingQuestion[] = [
  ...build(1, ITEM1_ROWS, ITEM1_NOTES, ITEM1_EN, ITEM1_NOTES_EN),
  ...build(2, item2.ROWS, item2.NOTES, item2.EN, item2.NOTES_EN, item2.FIGURE_NOS),
  ...build(5, item5.ROWS, item5.NOTES, item5.EN, item5.NOTES_EN, item5.FIGURE_NOS),
  ...build(6, item6.ROWS, item6.NOTES, item6.EN, item6.NOTES_EN, item6.FIGURE_NOS),
  ...build(7, item7.ROWS, item7.NOTES, item7.EN, item7.NOTES_EN, item7.FIGURE_NOS),
  ...build(8, item8.ROWS, item8.NOTES, item8.EN, item8.NOTES_EN, item8.FIGURE_NOS),
  ...build(9, item9.ROWS, item9.NOTES, item9.EN, item9.NOTES_EN, item9.FIGURE_NOS),
  ...build(10, item10.ROWS, item10.NOTES, item10.EN, item10.NOTES_EN, item10.FIGURE_NOS),
  ...build(11, item11.ROWS, item11.NOTES, item11.EN, item11.NOTES_EN, item11.FIGURE_NOS),
  ...build(12, item12.ROWS, item12.NOTES, item12.EN, item12.NOTES_EN, item12.FIGURE_NOS),
  ...build(13, item13.ROWS, item13.NOTES, item13.EN, item13.NOTES_EN, item13.FIGURE_NOS),
  ...build(14, item14.ROWS, item14.NOTES, item14.EN, item14.NOTES_EN, item14.FIGURE_NOS),
  ...build(104, item104.ROWS, item104.NOTES, item104.EN, item104.NOTES_EN, item104.FIGURE_NOS),
  ...build(105, item105.ROWS, item105.NOTES, item105.EN, item105.NOTES_EN, item105.FIGURE_NOS),
  ...build(106, ITEM6_ROWS, ITEM6_NOTES, ITEM6_EN, ITEM6_NOTES_EN),
  ...build(107, item107.ROWS, item107.NOTES, item107.EN, item107.NOTES_EN, item107.FIGURE_NOS),
  ...build(108, item108.ROWS, item108.NOTES, item108.EN, item108.NOTES_EN, item108.FIGURE_NOS),
  ...build(109, item109.ROWS, item109.NOTES, item109.EN, item109.NOTES_EN, item109.FIGURE_NOS),
  ...build(110, item110.ROWS, item110.NOTES, item110.EN, item110.NOTES_EN, item110.FIGURE_NOS),
  ...build(111, item111.ROWS, item111.NOTES, item111.EN, item111.NOTES_EN, item111.FIGURE_NOS),
  ...build(112, item112.ROWS, item112.NOTES, item112.EN, item112.NOTES_EN, item112.FIGURE_NOS),
  ...build(113, item113.ROWS, item113.NOTES, item113.EN, item113.NOTES_EN, item113.FIGURE_NOS),
  ...build(114, item114.ROWS, item114.NOTES, item114.EN, item114.NOTES_EN, item114.FIGURE_NOS),
  ...build(115, item115.ROWS, item115.NOTES, item115.EN, item115.NOTES_EN, item115.FIGURE_NOS),
  ...build(116, item116.ROWS, item116.NOTES, item116.EN, item116.NOTES_EN, item116.FIGURE_NOS),
  ...build(117, item117.ROWS, item117.NOTES, item117.EN, item117.NOTES_EN, item117.FIGURE_NOS),
];
