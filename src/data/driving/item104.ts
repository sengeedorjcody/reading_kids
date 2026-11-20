import type { Row, Note } from "../drivingTest";

// 第2段階 項目4 死角と運転 (15 questions, no figures).
export const FIGURE_NOS: number[] = [];

export const ROWS: Row[] = [
  [1, "運転者は、常に危険な状況を予測して運転することが必要である。", "Жолооч үргэлж аюултай нөхцөл байдлыг урьдчилан таамаглаж жолоодох шаардлагатай.", true],
  [2, "交通事故は、運転者の認知の遅れ、誤った判断や自分勝手な行動により起きることが多い。", "Замын хөдөлгөөний осол нь жолооч оройтож анзаарах, буруу шийдвэр гаргах болон хувиа хичээсэн үйлдлээс болж гарах нь элбэг.", true],
  [3, "運転中は、前方にさえ注意していれば、危険なことはない。", "Жолоодож байх үедээ зөвхөн урд талдаа л анхаарч байвал аюулгүй.", false],
  [4, "四輪車の運転者は、二輪車との距離を実際よりも近く感じてしまうことが多い。", "Дөрвөн дугуйт машины жолооч хоёр дугуйт тээврийн хэрэгсэл хүртэлх зайг бодит байдлаас илүү ойрхон гэж мэдрэх нь элбэг.", false],
  [5, "二輪車の速度は、四輪車の運転者から見ると実際の速度よりも遅く感じられる。", "Хоёр дугуйт тээврийн хэрэгслийн хурд нь дөрвөн дугуйт машины жолоочид бодит хурднаасаа илүү удаан мэт мэдрэгддэг.", true],
  [6, "二輪車は、四輪車の前方を走行していれば、四輪車の運転者から見落とされることはない。", "Хоёр дугуйт тээврийн хэрэгсэл дөрвөн дугуйт машины урд явж байвал дөрвөн дугуйт машины жолоочийн хараанаас орхигдохгүй.", false],
  [7, "二輪車の運転者は、見落とされやすいことを自覚し、他の車の死角に入らないようにする。", "Хоёр дугуйт тээврийн хэрэгслийн жолооч бусдын хараанаас орхигдохдоо амархан гэдгээ ухамсарлаж, бусад машины харагдахгүй бүсэд (сохор бүс) орохгүй байх хэрэгтэй.", true],
  [8, "バックミラーで見えなければ、後続車はいないと考えてよい。", "Арын толинд харагдахгүй байвал ард яваа машин байхгүй гэж үзэж болно.", false],
  [9, "交差点を左折するときは、二輪車が左側にいないかを、バックミラーだけでなく直接目視で確かめる。", "Уулзвараар зүүн тийш эргэхдээ зүүн талд хоёр дугуйт тээврийн хэрэгсэл байгаа эсэхийг зөвхөн толиор бус нүдээрээ шууд харж шалгана.", true],
  [10, "駐車車両の側方を通過するときは、車のかげから人が出てくることを予測して運転する。", "Зогсож буй машины хажуугаар өнгөрөхдөө машины цаанаас хүн гарч ирж магадгүй гэж урьдчилан таамаглаж жолоодно.", true],
  [11, "道路の両側に駐車車両がある場合は、歩行者などの発見が難しいので、速度を落とし左右に注意しながら通過する。", "Замын хоёр талд зогсож буй машин байгаа тохиолдолд явган зорчигч зэргийг олж харахад хэцүү тул хурдаа хасаж баруун, зүүн талдаа анхааран өнгөрнө.", true],
  [12, "小さいこどもは駐車車両のかげにかくれてしまうので、駐車車両の側方を通過するときは、こどもの飛び出しを予測して運転する。", "Бага насны хүүхэд зогсож буй машины цаана халхлагдаж харагддаггүй тул зогсож буй машины хажуугаар өнгөрөхдөө хүүхэд гэнэт гүйж гарч ирж магадгүй гэж урьдчилан таамаглаж жолоодно.", true],
  [13, "見通しの悪いカーブを走行するときは、中央線を越えないようにすれば危険はない。", "Үзэгдэх орчин муутай эргэлтээр явахдаа замын голын шугамыг давахгүй л байвал аюулгүй.", false],
  [14, "交差点で対向車が譲ってくれたときは、待たせないように急いで右折する。", "Уулзварт эсрэг урсгалын машин зам тавьж өгсөн үед хүлээлгэхгүйн тулд яаран баруун тийш эргэнэ.", false],
  [15, "右折しようとしている大型自動車の側方を通過する二輪車は、大型自動車のかげから対向右折車がくることがあるので、速度を落とし注意して進行する。", "Баруун тийш эргэх гэж буй том оврын автомашины хажуугаар өнгөрч яваа хоёр дугуйт тээврийн хэрэгсэл нь том оврын автомашины цаанаас эсрэг урсгалын баруун эргэх машин гарч ирж болзошгүй тул хурдаа хасаж анхааралтай явна.", true],
];

export const NOTES: Note[] = [
  [[3], "左右、後方にもしっかり気配りを。", "Баруун, зүүн болон ар талдаа ч сайтар анхаарал хандуул."],
  [[7], "四輪車を運転していると、ついつい二輪車を軽視したり、見落としたりすることがあるので、二輪車を運転するときは要注意。", "Дөрвөн дугуйт машин жолоодож байх үед санамсаргүйгээр хоёр дугуйт тээврийн хэрэгслийг үл тоомсорлох буюу анзааралгүй өнгөрөх тохиолдол байдаг тул хоёр дугуйт тээврийн хэрэгсэл жолоодохдоо анхаарах хэрэгтэй."],
  [[8, 9], "バックミラーの死角に後続車がいることがある。", "Арын толины харагдахгүй бүсэд (сохор бүс) ард яваа машин байх тохиолдол бий."],
  [[13, 14, 15], "カーブの向こうや対向車のかげなど、見えないところの危険を予測して運転することが、安全運転の基本だ。", "Эргэлтийн цаана эсвэл эсрэг урсгалын машины цаана гэх мэт харагдахгүй газрын аюулыг урьдчилан таамаглаж жолоодох нь аюулгүй жолоодлогын үндэс юм."],
];

export const EN: string[] = [
  "A driver must always anticipate dangerous situations while driving.",
  "Traffic accidents are often caused by delayed perception, mistaken judgment, or selfish behavior on the part of drivers.",
  "While driving, as long as you pay attention to what is ahead, there is no danger.",
  "Drivers of four-wheeled vehicles often perceive the distance to a two-wheeled vehicle as closer than it actually is.",
  "Seen from a four-wheeled vehicle driver, the speed of a two-wheeled vehicle feels slower than its actual speed.",
  "As long as a two-wheeled vehicle is traveling ahead of a four-wheeled vehicle, it will never be overlooked by the driver of the four-wheeled vehicle.",
  "Riders of two-wheeled vehicles should be aware that they are easily overlooked and avoid entering the blind spots of other vehicles.",
  "If you cannot see any vehicle in your rearview mirror, you may assume there is no vehicle following you.",
  "When turning left at an intersection, check whether a two-wheeled vehicle is on your left not only with your mirrors, but also by looking directly.",
  "When passing alongside a parked vehicle, drive while anticipating that someone may step out from behind the vehicle.",
  "When vehicles are parked on both sides of the road, it is difficult to spot pedestrians, so slow down and watch left and right as you pass.",
  "Small children can be hidden behind parked vehicles, so when passing alongside a parked vehicle, drive while anticipating that a child may dart out.",
  "When driving around a curve with poor visibility, there is no danger as long as you do not cross the center line.",
  "When an oncoming vehicle gives way to you at an intersection, turn right hurriedly so as not to keep it waiting.",
  "A two-wheeled vehicle passing alongside a large motor vehicle that is about to turn right should slow down and proceed with caution, because an oncoming right-turning vehicle may appear from behind the large vehicle.",
];

export const NOTES_EN: string[] = [
  "Pay close attention to the left, right, and rear as well.",
  "Drivers of four-wheeled vehicles tend to underestimate or overlook two-wheeled vehicles, so special care is required when riding a two-wheeled vehicle.",
  "A following vehicle may be in the blind spot of your rearview mirror.",
  "Anticipating hazards in places you cannot see—such as beyond a curve or behind an oncoming vehicle—is the basis of safe driving.",
];
