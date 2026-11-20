import type { Row, Note } from "../drivingTest";

// 第2段階 項目14 交通事故のとき
export const FIGURE_NOS: number[] = [];

export const ROWS: Row[] = [
  [1, "交通事故を起こしたときは、ただちに運転を中止し、負傷者がいればその救護を第一にしなければならない。", "Замын хөдөлгөөний осол гаргасан үед нэн даруй жолоодлогоо зогсоож, бэртэж гэмтсэн хүн байвал түүнд тусламж үзүүлэхийг нэн тэргүүнд тавих ёстой.", true],
  [2, "交通事故を起こしたとき、被害の程度が軽く、事故証明をとる必要がないと判断したときは、警察官に届ける必要はない。", "Замын хөдөлгөөний осол гаргасан үед хохирлын хэмжээ бага бөгөөд ослын тодорхойлолт авах шаардлагагүй гэж үзвэл цагдаад мэдэгдэх шаардлагагүй.", false],
  [3, "人身事故を起こしたときは、事故現場の調査があるので、負傷者は警察官が来るまでそのままにしておかなければならない。", "Хүний эрүүл мэндэд хохирол учруулсан осол гаргасан үед ослын газрын үзлэг хийгддэг тул бэртэж гэмтсэн хүнийг цагдаа иртэл тэр хэвээр нь байлгах ёстой.", false],
  [4, "交通事故で負傷者がいる場合は、ただちに負傷者を救護し、事故の続発防止などの措置をとる。", "Замын хөдөлгөөний ослоор бэртэж гэмтсэн хүн байгаа тохиолдолд нэн даруй гэмтсэн хүнд тусламж үзүүлж, дараагийн осол гарахаас сэргийлэх зэрэг арга хэмжээ авна.", true],
  [5, "第三者が車の保有者に無断で運転して事故を起こした場合でも、原則として車の保有者はその責任を負わなければならない。", "Гуравдагч этгээд машины эзэмшигчийн зөвшөөрөлгүйгээр жолоодож осол гаргасан тохиолдолд ч ерөнхийдөө машины эзэмшигч түүний хариуцлагыг хүлээх ёстой.", true],
  [6, "交通事故による負傷者に意識がないときや、吐いたものがあるときなどは、のどに物が詰まって窒息しないように横向きに寝かせる。", "Замын хөдөлгөөний ослоор бэртэж гэмтсэн хүн ухаангүй байх эсвэл бөөлжсөн үед хоолойд нь зүйл тээглэж амьсгал боогдохоос сэргийлэн хажуу тийш нь харуулж хэвтүүлнэ.", true],
  [7, "交通事故を起こしたときの警察官への報告は、加害者がすることになっている。", "Замын хөдөлгөөний осол гаргасан үед цагдаад мэдэгдэх үүргийг зөвхөн буруутай этгээд хүлээдэг.", false],
  [8, "交通事故を起こしたとき、負傷者を救護したり警察官に必要な報告をしたりするのは、過失の大きいほうの運転者がしなければならない。", "Замын хөдөлгөөний осол гаргасан үед бэртэж гэмтсэн хүнд тусламж үзүүлэх болон цагдаад шаардлагатай мэдээллийг өгөх ажлыг илүү буруутай талын жолооч хийх ёстой.", false],
  [9, "軽いけがの事故で、被害者との話し合いがついたときは、警察官に届けなくてもよい。", "Хөнгөн гэмтэлтэй ослын үед хохирогчтой харилцан тохиролцсон бол цагдаад мэдэгдэхгүй байж болно.", false],
  [10, "交通事故を起こしたが、当事者だけの話し合いで解決したので、後日警察官に報告した。", "Замын хөдөлгөөний осол гаргасан боловч холбогдогч талууд хоорондоо ярилцаж шийдвэрлэсэн тул дараа өдөр нь цагдаад мэдэгдсэн.", false],
  [11, "事故を起こしたときは、警察官への届け出よりも先に損害保険会社に報告しておいたほうが、後日の話し合いのときに都合がよい。", "Осол гаргасан үед цагдаад мэдэгдэхээсээ өмнө даатгалын компанид түрүүлж мэдэгдэх нь дараа нь ярилцаж тохиролцоход илүү ашигтай.", false],
  [12, "交通事故の現場に居合わせたときは、警察官への報告や負傷者の救護など、お互いに協力し合うことが必要である。", "Замын хөдөлгөөний ослын газарт таарсан үед цагдаад мэдэгдэх болон бэртэж гэмтсэн хүнд тусламж үзүүлэх зэрэгт харилцан бие биедээ туслах шаардлагатай.", true],
  [13, "交通事故を起こし負傷者がいる場合、救急車を待つ間に止血など可能な応急手当をする。", "Замын хөдөлгөөний осол гаргаж бэртэж гэмтсэн хүн байгаа тохиолдолд түргэн тусламжийн машин хүлээх зуур цус тогтоох зэрэг боломжтой анхны тусламж үзүүлнэ.", true],
  [14, "事故現場では、不用意にたばこを吸ったり、ライターに火をつけたりしてはいけない。", "Ослын газарт болгоомжгүйгээр тамхи татах болон асаагуур асааж болохгүй.", true],
  [15, "事故現場には燃料がもれていたり、危険な荷物があったりするので、火気に十分注意する。", "Ослын газарт шатахуун гоожсон эсвэл аюултай ачаа байж болзошгүй тул галын аюулаас сайтар болгоомжилно.", true],
];

export const NOTES: Note[] = [
  [[2], "必ず警察官に届けて指示を受ける義務がある。", "Заавал цагдаад мэдэгдэж зааварчилгаа авах үүрэгтэй."],
  [[3], "事故現場を保存するよりも、負傷者の救護が先決。", "Ослын газрыг хэвээр хадгалахаас илүүтэй бэртэж гэмтсэн хүнд тусламж үзүүлэх нь нэн тэргүүний асуудал юм."],
  [[5], "無断で運転されないよう、きちんとカギをかけ、カギの保管にも十分注意する。", "Зөвшөөрөлгүйгээр жолоодуулахгүйн тулд машинаа сайтар түгжиж, түлхүүрээ хадгалахдаа ч онцгой анхаарна."],
  [[7, 8], "加害者も被害者も報告の義務がある。", "Буруутай этгээд ч, хохирогч ч аль аль нь мэдэгдэх үүрэгтэй."],
  [[9, 10, 11], "けがの程度には関係なく、事故が発生した時点でできるだけ早く警察官に報告しなければならない。", "Гэмтлийн зэргээс үл хамааран осол гарсан даруйд аль болох хурдан цагдаад мэдэгдэх ёстой."],
];

export const EN: string[] = [
  "When you are involved in a traffic accident, you must stop driving immediately and, if anyone is injured, make rescuing and aiding the injured your top priority.",
  "When you cause a traffic accident, if the damage is minor and you judge that there is no need to obtain an accident certificate, you do not need to report it to a police officer.",
  "When you cause an accident involving personal injury, an investigation of the scene will take place, so you must leave the injured person untouched until a police officer arrives.",
  "If anyone is injured in a traffic accident, immediately aid the injured and take measures to prevent further accidents.",
  "Even if a third party drives a car without the owner's permission and causes an accident, in principle the owner of the car must bear responsibility for it.",
  "When a person injured in a traffic accident is unconscious or has vomited, lay them on their side so that nothing blocks their throat and causes suffocation.",
  "When a traffic accident occurs, reporting to a police officer is supposed to be done only by the at-fault party.",
  "When a traffic accident occurs, aiding the injured and making the necessary report to a police officer must be done by the driver who bears the greater share of fault.",
  "In an accident involving only minor injuries, if you reach an agreement with the victim, you do not have to report it to a police officer.",
  "I caused a traffic accident, but because we settled it through discussion between the parties involved alone, I reported it to a police officer on a later day.",
  "When you cause an accident, reporting it to your non-life insurance company before reporting it to a police officer is more convenient for later negotiations.",
  "If you happen to be present at the scene of a traffic accident, it is necessary to cooperate with one another in reporting to a police officer and aiding the injured.",
  "When you cause a traffic accident and someone is injured, perform whatever first aid is possible, such as stopping bleeding, while waiting for an ambulance.",
  "At an accident scene, you must not carelessly smoke cigarettes or light a lighter.",
  "Because fuel may be leaking or hazardous cargo may be present at an accident scene, pay close attention to open flames.",
];

export const NOTES_EN: string[] = [
  "You are always obligated to report the accident to a police officer and receive instructions.",
  "Aiding the injured takes priority over preserving the accident scene.",
  "To prevent your car from being driven without permission, lock it properly and take good care in storing the key.",
  "Both the at-fault party and the victim have a duty to report the accident.",
  "Regardless of the severity of the injury, you must report the accident to a police officer as soon as possible when it occurs.",
];
