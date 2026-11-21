import type { Row, Note } from "../drivingTest";

// まぎらわしい問題特集(第2段階)
export const FIGURE_NOS: number[] = [];

export const ROWS: Row[] = [
  [1, "駐車場、車庫などの自動車用の出入口から3メートル以内は、駐停車禁止場所である。", "Зогсоол, гарааш зэрэг автомашины орц, гарцаас 3 метрийн дотор түр болон удаан зогсохыг хориглосон газар байна.", false],
  [2, "昼間でも、トンネルの中や濃い霧の中などで50メートル（高速道路では100メートル）先が見えないような場所を通行するときは、前照灯、車幅灯、尾灯などをつけなければならない。", "Өдрийн цагаар ч хонгил дотор болон өтгөн манантай газар зэрэгт 50 метр (хурдны замд 100 метр) зайд урдах зам харагдахгүй газраар явахдаа их гэрэл, оврын гэрэл, арын гэрэл зэргийг асаах ёстой.", false],
  [3, "荷物の到着を待つため、すぐに運転できる状態で3分間車を停止した場合は、停車である。", "Ачаа ирэхийг хүлээхийн тулд шууд хөдөлж чадах байдалтайгаар машиныг 3 минут зогсоосон бол энэ нь түр зогсолт юм.", false],
  [4, "荷物の積みおろしのため、貨物自動車の荷台に必要最小限度の人を乗せて運転した。", "Ачаа ачих, буулгахын тулд ачааны автомашины тэвшин дээр зайлшгүй шаардлагатай хамгийн цөөн тооны хүн суулгаж жолоодсон.", false],
  [5, "最大積載量3,000キログラムの準中型貨物自動車に、4,000キログラムの砂利を積んで運転する場合は、出発地の警察署長の許可を受けなければならない。", "3,000 килограммын даацтай хагас дунд оврын ачааны автомашинд 4,000 килограмм хайрга ачиж жолоодох тохиолдолд хөдлөх газрын цагдаагийн хэлтсийн даргын зөвшөөрөл авах ёстой.", false],
  [6, "大型自動車、中型自動車、準中型自動車または普通自動車で台数の制限を超えてけん引するときは、出発地の警察署長の許可を受けなければならない。", "Том оврын автомашин, дунд оврын автомашин, хагас дунд оврын автомашин эсвэл суудлын автомашинаар чирэх тооны хязгаараас хэтрүүлэн чирэх үед хөдлөх газрын цагдаагийн хэлтсийн даргын зөвшөөрөл авах ёстой.", false],
  [7, "荷物が分割できないため積載物の大きさが制限を超える場合は、行き先の警察署長の許可を受けなければならない。", "Ачааг хуваах боломжгүйн улмаас ачааны хэмжээ тогтоосон хязгаараас хэтрэх тохиолдолд очих газрын цагдаагийн хэлтсийн даргын зөвшөөрөл авах ёстой.", false],
  [8, "二輪の自動車を除き、自動車は高速道路の路肩を通行することはできない。", "Хоёр дугуйт автомашинаас бусад автомашин хурдны замын хөвөөгөөр явж болохгүй.", false],
  [9, "貨物自動車に積める荷物の長さは、車の長さにその1.2倍を加えた長さまでである。", "Ачааны автомашинд ачиж болох ачааны урт нь машины урт дээр түүнийг 1.2 дахин авсныг нэмсэнтэй тэнцүү урт хүртэл байна.", false],
  [10, "駐車すると車の右側の道路上に3.5メートル以上の余地がなくなる場所で、荷物の積みおろしのため、すぐに運転できる状態で10分間車を止めた。", "Зогсоовол машины баруун талын зам дээр 3.5 метр ба түүнээс дээш сул зай үлдэхгүй газарт ачаа ачих, буулгахын тулд шууд жолоодож хөдлөх боломжтой байдалтайгаар машиныг 10 минут зогсоосон.", true],
];

export const NOTES: Note[] = [
  [[1], "駐車禁止場所。", "Удаан зогсохыг хориглосон газар (түр зогсож болно)."],
  [[2], "高速道路では、200m先が見えないような場所を通行するときにつける。", "Хурдны замд 200 м зайд урдах зам харагдахгүй газраар явах үед гэрлээ асаана."],
  [[3], "すぐに運転できる状態でも、継続的な停止の場合は駐車になる。", "Шууд жолоодож хөдлөх боломжтой байдалтай байсан ч үргэлжлүүлэн зогссон тохиолдолд удаан зогсолт (паркинг) болно."],
  [[4], "貨物自動車の荷台に最小限度の人を乗せることができるのは、荷物の見張りのため。", "Ачааны автомашины тэвшин дээр хамгийн цөөн тооны хүн суулгаж болох нь зөвхөн ачааг харж хамгаалах зорилготой үед л зөвшөөрөгдөнө."],
  [[5], "重量や大きさの制限を超えて警察署長の許可を受けられるのは、分割できない荷物の場合。", "Жин болон хэмжээний хязгаараас хэтрүүлэн цагдаагийн хэлтсийн даргаас зөвшөөрөл авч болох нь зөвхөн хувааж салгах боломжгүй ачааны тохиолдолд юм."],
  [[6], "台数や長さの制限を超える場合は、公安委員会の許可を受ける。", "Чирэх машины тоо болон уртын хязгаараас хэтрэх тохиолдолд Олон нийтийн аюулгүй байдлын хорооноос зөвшөөрөл авна."],
  [[7], "制限を超える荷物を積む場合は、出発地の警察署長の許可を受ける。", "Хязгаараас хэтэрсэн ачаа ачих тохиолдолд хөдлөх газрын цагдаагийн хэлтсийн даргаас зөвшөөрөл авна."],
  [[8], "一般道路の路肩は大型自動二輪車や普通自動二輪車で通行できるが、高速道路ではすべての自動車が通行できない。", "Ердийн замын хөвөөгөөр том оврын мотоцикл болон энгийн мотоцикл явж болох боловч хурдны замд бүх автомашин (мотоцикл орно) хөвөөгөөр явж болохгүй."],
  [[9], "長さは、車長の1.2倍まで。車長にその1.2倍を加えると2.2倍の長さになる。", "Ачааны урт нь машины уртыг 1.2 дахин авсан хэмжээ хүртэл байна. Машины урт дээр түүний 1.2 дахин авсныг нэмбэл 2.2 дахин урт болчихно."],
  [[10], "3.5m以上の余地がなくても、荷物の積みおろしですぐに運転できるときは駐車でき、特に時間に規定はない。", "3.5 м ба түүнээс дээш сул зай үлдэхгүй байсан ч ачаа ачих, буулгах зорилгоор шууд жолоодож хөдлөх боломжтой байвал зогсож болох бөгөөд хугацааны тусгай хязгаарлалт байхгүй."],
];

export const EN: string[] = [
  "Within 3 meters of an automobile entrance or exit of a parking lot, garage, etc. is a no-parking and no-stopping zone.",
  "Even during the daytime, when driving through a tunnel, dense fog, or similar place where you cannot see 50 meters ahead (100 meters on an expressway), you must turn on your headlights, clearance lights, taillights, etc.",
  "If you stop your vehicle for 3 minutes in a state where you can drive off immediately in order to wait for cargo to arrive, it is considered stopping (temporary stop).",
  "To load and unload cargo, I drove a cargo truck with the minimum necessary number of people riding in the cargo bed.",
  "When driving a semi-medium cargo truck with a maximum load capacity of 3,000 kilograms loaded with 4,000 kilograms of gravel, you must obtain permission from the chief of the police station at the point of departure.",
  "When towing vehicles in excess of the limit on the number of towed vehicles using a large, medium, semi-medium, or ordinary automobile, you must obtain permission from the chief of the police station at the point of departure.",
  "When the size of a load exceeds the limit because the cargo cannot be divided, you must obtain permission from the chief of the police station at the destination.",
  "Except for two-wheeled motor vehicles, motor vehicles cannot drive on the shoulder of an expressway.",
  "The maximum length of cargo that may be loaded onto a cargo truck is the length of the vehicle plus 1.2 times the length of the vehicle.",
  "At a place where parking would leave less than 3.5 meters of clearance on the right side of the vehicle, I stopped the vehicle for 10 minutes for loading and unloading cargo while ready to drive off immediately.",
];

export const NOTES_EN: string[] = [
  "It is a no-parking zone (stopping is not prohibited).",
  "On an expressway, lights must be turned on when visibility is less than 200 m ahead.",
  "Even if you can drive off immediately, continuous stopping (such as waiting for cargo) counts as parking.",
  "The minimum necessary number of people may ride in the bed of a cargo truck only to watch over and guard the cargo.",
  "Permission from the police chief to exceed weight or size limits can only be obtained for cargo that cannot be divided.",
  "When exceeding the limits on number of towed vehicles or total length, you must obtain permission from the Public Safety Commission.",
  "When loading cargo that exceeds the limits, you must obtain permission from the chief of the police station at the point of departure.",
  "On ordinary roads, large and ordinary motorcycles may travel on the shoulder, but on expressways no motor vehicles of any kind may travel on the shoulder.",
  "The length limit is up to 1.2 times the vehicle's length. Adding 1.2 times the vehicle's length to the vehicle's length would make it 2.2 times the length.",
  "Even where there is less than 3.5 m of clearance, you may park for loading and unloading cargo as long as you can drive off immediately, and there is no specific time limit.",
];
