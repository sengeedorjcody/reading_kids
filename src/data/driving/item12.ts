import type { Row, Note } from "../drivingTest";

// 第1段階 項目12 行き違い (15 questions, no figures).
export const FIGURE_NOS: number[] = [];

export const ROWS: Row[] = [
  [1, "道幅の狭い道路で対向車と行き違うときは、やむを得ないので、速度を落としたり、安全な間隔を保ったりする必要はない。", "Нарийн замд эсрэг урсгалын машинтай зөрөх үед зайлшгүй тул хурдаа хасах эсвэл аюулгүй зай барих шаардлагагүй.", false],
  [2, "行き違いのときは、対向車との間隔だけでなく、歩行者や自転車にも気を配らなくてはならない。", "Зөрж өнгөрөх үед зөвхөн эсрэг урсгалын машинтай барих зайнаас гадна явган зорчигч болон унадаг дугуйнд ч анхаарал хандуулах ёстой.", true],
  [3, "進路の前方に障害物があるときは、いつでも加速して対向車より先に障害物を避けるとよい。", "Хөдөлгөөний чиглэлийн урд саад байгаа үед хэзээд хурдаа нэмж эсрэг урсгалын машинаас түрүүлж саадыг тойрч гарах нь зүйтэй.", false],
  [4, "進路の前方に障害物があるときは、あらかじめ一時停止か減速をして、反対方向からの車に道を譲るとよい。", "Хөдөлгөөний чиглэлийн урд саад байгаа үед урьдчилан түр зогсох буюу хурдаа хасаж, эсрэг чиглэлээс ирж буй машинд зам тавьж өгөх нь зүйтэй.", true],
  [5, "進路の前方に駐車車両があるとき、対向車がきていたが、高齢運転者標識をつけていたので、急いで加速して先に駐車車両を避けた。", "Хөдөлгөөний чиглэлийн урд зогсож буй машин байхад эсрэг урсгалын машин ирж байсан ч өндөр настны жолоочийн тэмдэгтэй байсан тул яаран хурдаа нэмж түрүүлээд зогсож буй машиныг тойрч гарсан.", false],
  [6, "進路の前方が工事中だったので、その手前で止まって対向車に道を譲った。", "Хөдөлгөөний чиглэлийн урд замын ажил хийгдэж байсан тул түүний наана зогсож эсрэг урсгалын машинд зам тавьж өгсөн.", true],
  [7, "道路の片側に障害物のあるところで行き違うときは、障害物のある側の車が優先する。", "Замын нэг талд саадтай газарт зөрж өнгөрөх үед саадтай талын машин давуу эрхтэй байна.", false],
  [8, "坂道で行き違うとき、下りの車は加速がつきやすいので、上りの車が道を譲るとよい。", "Налуу замд зөрж өнгөрөх үед уруудаж буй машин хурд авахдаа амархан тул өгсөж буй машин зам тавьж өгөх нь зүйтэй.", false],
  [9, "坂道で行き違うとき、上り坂での発進は難しいので、下りの車が上りの車に道を譲るとよい。", "Налуу замд зөрж өнгөрөх үед өгсүүр замд хөдөлгөөн эхлэх нь хэцүү тул уруудаж буй машин нь өгсөж буй машинд зам тавьж өгөх нь зүйтэй.", true],
  [10, "坂道で行き違うとき、下りの車は速度が出やすいので、手前で十分に減速して行き違うようにする。", "Налуу замд зөрж өнгөрөх үед уруудаж буй машин хурд ихсэх гээд байдаг тул наана нь хангалттай хурдаа хасаж зөрөх хэрэгтэй.", true],
  [11, "坂道で行き違うとき、上り側に待避できるような場所があったが、上りが優先するのでそのまま進行した。", "Налуу замд зөрж өнгөрөх үед өгсөж буй талд зам тавьж өгөх боломжтой газар байсан ч өгсөж буй нь давуу эрхтэй тул чигээрээ үргэлжлүүлэн явсан.", false],
  [12, "待避所がある坂道で行き違うときは、上り下りに関係なく待避して譲れるような場所のある側の車が道を譲るのがよい。", "Түр зогсох талбайтай налуу замд зөрж өнгөрөх үед өгсөх, уруудахаас үл хамааран зайлж зам тавьж өгөх боломжтой газартай талын машин нь зам тавьж өгөх нь зүйтэй.", true],
  [13, "山道では路肩が崩れやすいので、行き違いのとき、路肩に寄り過ぎないように注意する。", "Уулын замд замын хөвөө нурахдаа амархан тул зөрж өнгөрөхдөө замын хөвөө рүү хэт шахахгүй байхаар анхаарна.", true],
  [14, "片側が転落のおそれのあるがけになっている狭い道では、山側を通る車があらかじめ安全な場所に停止して道を譲る。", "Нэг тал нь унах аюултай хавцал бүхий нарийн замд уул талаар явж буй машин урьдчилан аюулгүй газарт зогсож зам тавьж өгнө.", false],
  [15, "片側が転落のおそれのあるがけになっている狭い道では、がけ側を通る車があらかじめ安全な場所に停止して道を譲るとよい。", "Нэг тал нь унах аюултай хавцал бүхий нарийн замд хавцал талаар явж буй машин урьдчилан аюулгүй газарт зогсож зам тавьж өгөх нь зүйтэй.", true],
];

export const NOTES: Note[] = [
  [[1], "安全な間隔を保つか、それが無理な場合は速度を落とす。", "Аюулгүй зай барих, эсвэл тэгэх боломжгүй бол хурдаа хасна."],
  [[3, 4, 5, 6, 7], "進路の前方に障害物があるときは、障害物のある側の車が道を譲り、対向車を先に通す。", "Хөдөлгөөний чиглэлийн урд саад байгаа үед саадтай талын машин зам тавьж өгч, эсрэг урсгалын машиныг эхэлж өнгөрөөнө."],
  [[8, 9, 10, 11, 12], "坂道では、原則として下りが譲るが、道幅が広くなっているなど待避する場があれば、そちら側が止まって譲る。", "Налуу замд ерөнхий дүрмээр уруудаж буй нь зам тавьж өгөх боловч зам өргөссөн зэрэг зайлж зогсох газар байвал тэр талын машин зогсож зам тавьж өгнө."],
  [[13, 14, 15], "左側に寄り過ぎないように注意して、がけ側の車が停止して道を譲る。", "Зүүн тал руу хэт шахахгүй байхаар анхаарч, хавцал талын машин зогсож зам тавьж өгнө."],
];

export const EN: string[] = [
  "When passing an oncoming vehicle on a narrow road, it cannot be helped, so there is no need to slow down or keep a safe clearance.",
  "When passing oncoming traffic, you must pay attention not only to the clearance from the oncoming vehicle, but also to pedestrians and bicycles.",
  "When there is an obstacle ahead in your path, it is always good to accelerate and pass the obstacle before the oncoming vehicle does.",
  "When there is an obstacle ahead in your path, it is good to stop or slow down beforehand and give way to vehicles coming from the opposite direction.",
  "When there was a parked vehicle ahead in my path, an oncoming car was approaching, but since it displayed an elderly driver mark, I hurriedly accelerated and passed the parked vehicle first.",
  "Because road construction was underway ahead in my path, I stopped before it and gave way to the oncoming vehicle.",
  "When passing an oncoming vehicle where there is an obstacle on one side of the road, the vehicle on the side with the obstacle has priority.",
  "When passing an oncoming vehicle on a slope, a downhill vehicle gains speed easily, so it is good for the uphill vehicle to give way.",
  "When passing an oncoming vehicle on a slope, starting from a stop on an uphill slope is difficult, so it is good for the downhill vehicle to give way to the uphill vehicle.",
  "When passing an oncoming vehicle on a slope, a downhill vehicle easily picks up speed, so slow down sufficiently beforehand when passing.",
  "When passing an oncoming vehicle on a slope, there was a place on the uphill side where I could pull over, but since uphill traffic has priority, I kept going.",
  "When passing an oncoming vehicle on a slope with a pull-out space, regardless of whether going uphill or downhill, it is good for the vehicle on the side with the pull-out space to pull over and give way.",
  "On a mountain road, the road shoulder can crumble easily, so be careful not to pull too close to the shoulder when passing an oncoming vehicle.",
  "On a narrow road with a cliff on one side where a vehicle could fall off, the vehicle on the mountain side stops in a safe place beforehand to give way.",
  "On a narrow road with a cliff on one side where a vehicle could fall off, it is good for the vehicle on the cliff side to stop in a safe place beforehand and give way.",
];

export const NOTES_EN: string[] = [
  "Maintain a safe clearance, or if that is not possible, slow down.",
  "When there is an obstacle ahead in your path, the vehicle on the side with the obstacle gives way and lets the oncoming vehicle pass first.",
  "On a slope, in principle the downhill vehicle gives way, but if one side has a wide spot or pull-out space, the vehicle on that side stops and gives way.",
  "Be careful not to pull too far to the left, and the vehicle on the cliff side stops to give way.",
];
