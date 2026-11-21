import type { Row, Note } from "../drivingTest";

// まぎらわしい問題特集(第1段階)
export const FIGURE_NOS: number[] = [];

export const ROWS: Row[] = [
  [1, "車や路面電車は、黄色の灯火の点滅信号のとき、他の交通に注意して徐行しなければならない。", "Тээврийн хэрэгсэл болон трамвай нь шар гэрэл анивчсан дохиотой үед бусад хөдөлгөөнд анхаарч удаан явах ёстой.", false],
  [2, "小型特殊免許を受けている人は、小型特殊自動車のほか一般原動機付自転車も運転できる。", "Жижиг тусгай зориулалтын машины жолооны үнэмлэхтэй хүн жижиг тусгай зориулалтын автомашинаас гадна ердийн мопед жолоодож болно.", false],
  [3, "左側部分の幅が6メートル以下の見通しのよい道路で、反対方向からの交通を妨げるおそれのないときは、追い越しのため道路の右側部分にはみ出して通行することができる。", "Зүүн гар талын хэсгийн өргөн нь 6 метр ба түүнээс бага, орчин сайн харагддаг замд эсрэг чиглэлийн хөдөлгөөнд саад учруулах эрсдэлгүй үед гүйцэж түрүүлэхийн тулд замын баруун гар талын хэсэг рүү давж орж явж болно.", false],
  [4, "車で歩行者のそばを通るとき、安全な間隔をあけて徐行しなければならない。", "Машинаар явган зорчигчийн хажуугаар өнгөрөхдөө аюулгүй зай барьж удаан явах ёстой.", false],
  [5, "車は、こどもがひとりで歩いているときや、盲導犬を連れた人が歩いているときは、安全な間隔をあけるか徐行しなければならない。", "Хүүхэд ганцаараа явж байх эсвэл хөтөч нохой дагуулсан хүн алхаж яваа үед машин аюулгүй зай барих эсвэл удаан явах ёстой.", false],
  [6, "路線バス等優先通行帯を通行中、路線バスなどが近づいてきたときは、すみやかにそこから出るか、十分な距離を保たなければならない。", "Чиглэлийн автобус зэргийн давуу эрхтэй эгнээгээр явж байх үед чиглэлийн автобус зэрэг ойртож ирвэл тэндээс даруй гарах эсвэл хангалттай зай барих ёстой.", false],
  [7, "車は、横断歩道のない交差点やその近くを歩行者が横断しているときは、その通行を妨げないように徐行しなければならない。", "Явган хүний гарцгүй уулзвар болон түүний ойролцоо явган зорчигч зам хөндлөн гарч байвал машин түүний хөдөлгөөнд саад учруулахгүйн тулд удаан явах ёстой.", false],
  [8, "横断歩道や自転車横断帯とその前後30メートル以内の場所は、追い越しや追い抜きが禁止されている。", "Явган хүний гарц болон унадаг дугуйн гарц, мөн түүний урд болон хойд талын 30 метрийн доторх газарт гүйцэж түрүүлэх болон хажуугаар зөрж гарахыг хориглодог.", false],
  [9, "左右の見通しのきかない交差点は、優先道路を通行している場合でも徐行しなければならない。", "Баруун, зүүн тал нь харагдахгүй уулзварт тэргүүлэх замаар явж байгаа тохиолдолд ч удаан явах ёстой.", false],
  [10, "優先道路を通行している場合は優先権があるので、交差道路を通行している車がいても、その車に優先して通行することができる。", "Тэргүүлэх замаар явж байгаа тохиолдолд давуу эрхтэй байдаг тул хөндлөн замаар явж буй машин байсан ч тэр машинаас түрүүлж давуу эрхтэйгээр нэвтэрч болно.", false],
];

export const NOTES: Note[] = [
  [[1], "黄色の灯火の点滅信号では他の交通に注意して進行できるが、徐行や一時停止の規定はない。なお、運転者の判断で「徐行した」「一時停止した」は○。", "Шар гэрэл анивчсан дохиогоор бусад хөдөлгөөнд анхаарч явж болох боловч заавал удаан явах болон түр зогсох дүрэм байхгүй. Гэхдээ жолооч өөрийн шийдвэрээр «удаан явсан», «түр зогссон» гэвэл зөв (○)."],
  [[2], "運転できるのは、小型特殊自動車のみ。同様に、原付免許で運転できるのは原付のみ。", "Жолоодож болох нь зөвхөн жижиг тусгай зориулалтын автомашин юм. Үүнтэй адил мопедын үнэмлэхээр зөвхөн мопед л жолоодно."],
  [[3], "道路の右側部分に出て追い越しができるのは、6m未満の道路。", "Замын баруун гар талын хэсэг рүү гарч гүйцэж түрүүлж болох нь 6 м-ээс бага өргөнтэй зам юм."],
  [[4], "安全な間隔をあけるか、または徐行しなければならない。運転者の判断で「安全な間隔をあけて徐行した」のなら○。", "Аюулгүй зай барих эсвэл удаан явах ёстой. Жолооч өөрийн шийдвэрээр «аюулгүй зай бариад удаан явсан» бол зөв (○)."],
  [[5], "一時停止か徐行しなければならない。", "Түр зогсох эсвэл удаан явах ёстой."],
  [[6], "「十分な距離を保たなければならない」という規定はない。なお、軌道敷内を通行中に、路面電車が近づいてきたときは、すみやかに軌道敷外に出るか、十分な距離を保たなければならない。", "«Хангалттай зай барих ёстой» гэсэн заалт байхгүй. Харин трамвайны замын зурвас дотор явж байхад трамвай ойртож ирвэл зурвасаас даруй гарах эсвэл хангалттай зай барих ёстой."],
  [[7], "歩行者の通行を妨げてはいけないが、一時停止や徐行の規定はない。通行を妨げないための速度などは、状況に応じて運転者自身が判断する。", "Явган зорчигчийн хөдөлгөөнд саад учруулж болохгүй боловч түр зогсох болон удаан явах заалт байхгүй. Хөдөлгөөнд саад учруулахгүй байх хурд зэргийг нөхцөл байдалд тохируулан жолооч өөрөө шийднэ."],
  [[8], "追い越しと追い抜きが禁止されているのは、横断歩道や自転車横断帯と、その手前から30m以内の場所。", "Гүйцэж түрүүлэх болон хажуугаар зөрж гарахыг хориглодог нь явган хүний гарц, унадаг дугуйн гарц болон түүний наанаас 30 м доторх газар юм."],
  [[9], "左右の見通しのきかない交差点は徐行場所だが、優先道路を通行している場合や、交通整理が行われている場合は除かれている。", "Баруун, зүүн тал нь харагдахгүй уулзвар нь удаан явах газар мөн боловч тэргүүлэх замаар явж байгаа болон замын хөдөлгөөний зохицуулалт хийгдэж байгаа тохиолдол үүнд хамаарахгүй."],
  [[10], "優先道路に入ろうとする車は、優先道路を通行している車や路面電車の通行を妨げてはいけないが、優先道路を通行する車に優先権があるわけではない。交差点を通行するときは、交差点の状況に応じてできる限り安全な速度と方法で進行しなければならない。", "Тэргүүлэх зам руу орох гэж буй машин нь тэргүүлэх замаар явж буй машин болон трамвайны хөдөлгөөнд саад учруулж болохгүй боловч тэргүүлэх замаар явж буй машинд үнэмлэхүй давуу эрх байдаг гэсэн үг биш. Уулзвараар нэвтрэхдээ уулзварын нөхцөл байдалд тохируулан аль болох аюулгүй хурд, арга барилаар явах ёстой."],
];

export const EN: string[] = [
  "At a flashing yellow traffic light, vehicles and streetcars must drive at a crawl while watching out for other traffic.",
  "A person who holds a small special vehicle license may drive general mopeds in addition to small special motor vehicles.",
  "On a road with good visibility where the left-hand portion is 6 meters or less in width, you may cross into the right-hand portion of the road to overtake when there is no risk of impeding oncoming traffic.",
  "When passing by a pedestrian in a vehicle, you must both leave a safe distance and drive at a crawl.",
  "When a child is walking alone or a person is walking with a guide dog, a vehicle must either leave a safe distance or drive at a crawl.",
  "While driving in a priority lane for route buses, etc., if a route bus or similar vehicle approaches, you must promptly leave the lane or maintain a sufficient distance.",
  "When a pedestrian is crossing at or near an intersection without a pedestrian crossing, a vehicle must drive at a crawl so as not to impede the pedestrian's passage.",
  "Overtaking and passing are prohibited on pedestrian crossings and bicycle crossing zones and within 30 meters before and after them.",
  "At an intersection with poor visibility to the left and right, you must drive at a crawl even when traveling on a priority road.",
  "When traveling on a priority road, you have the right of way, so even if there is a vehicle traveling on the intersecting road, you may proceed ahead of that vehicle.",
];

export const NOTES_EN: string[] = [
  "At a flashing yellow light, you may proceed while watching out for other traffic, and there is no requirement to drive at a crawl or make a full stop. However, if a statement says the driver \"drove at a crawl\" or \"came to a stop\" at their own discretion, it is correct (true).",
  "You may drive only small special motor vehicles. Similarly, a moped license only allows you to drive mopeds.",
  "You may cross into the right-hand portion of the road to overtake only when the left-hand portion is less than 6 m wide.",
  "You must either leave a safe distance OR drive at a crawl. If a statement says the driver \"left a safe distance and drove at a crawl\" at their own discretion, it is correct (true).",
  "You must either come to a temporary stop or drive at a crawl.",
  "There is no rule stating \"or maintain a sufficient distance\" for a bus priority lane. That rule applies when driving on streetcar tracks: when a streetcar approaches, you must promptly move off the tracks or maintain a sufficient distance.",
  "You must not impede pedestrians, but there is no rule requiring a temporary stop or driving at a crawl. The driver judges the appropriate speed and manner according to the situation so as not to impede them.",
  "Overtaking and passing are prohibited on pedestrian crossings and bicycle crossing zones and within 30 m BEFORE them (not after them).",
  "Intersections with poor left-right visibility require driving at a crawl, except when traveling on a priority road or when traffic control is in effect.",
  "Vehicles about to enter a priority road must not impede vehicles or streetcars traveling on the priority road, but that does not grant an absolute right of way to vehicles on the priority road. When passing through an intersection, you must proceed at as safe a speed and manner as possible according to the conditions of the intersection.",
];
