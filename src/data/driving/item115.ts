import type { Row, Note } from "../drivingTest";

// 第2段階 項目15 自動車の所有者などの心得と保険制度
export const FIGURE_NOS: number[] = [];

export const ROWS: Row[] = [
  [1, "自動車を運転するときは、運転免許証または免許情報記録個人番号カード（免許情報が記録されているマイナンバーカード）は携帯しなければならないが、自動車検査証や自動車損害賠償責任保険証明書などを備える必要はない。", "Автомашин жолоодохдоо жолооны үнэмлэх эсвэл үнэмлэхийн мэдээлэл бүртгэгдсэн хувийн дугаарын карт (Майнамба карт)-ыг биедээ авч явах ёстой боловч автомашины үзлэгийн гэрчилгээ болон жолоочийн хариуцлагын албан журмын даатгалын гэрчилгээ зэргийг машиндаа байлгах шаардлагагүй.", false],
  [2, "自動車検査証や自動車損害賠償責任保険証明書などは自宅に保管し、車にはそのコピーを備えておくとよい。", "Автомашины үзлэгийн гэрчилгээ болон жолоочийн хариуцлагын албан журмын даатгалын гэрчилгээ зэргийг гэртээ хадгалж, машиндаа түүний хуулбарыг байлгавал зүгээр.", false],
  [3, "自動車検査証の有効期限が切れているが、整備をしてあるので運転しても問題はない。", "Автомашины үзлэгийн гэрчилгээний хүчинтэй хугацаа дууссан боловч засвар үйлчилгээ хийсэн тул жолоодоход асуудалгүй.", false],
  [4, "検査標章は、自動車の前面ガラスの内側に前方と運転者席の両方から見やすいように貼りつけて表示しなければならない。", "Техникийн хяналтын үзлэгийн тэмдгийг автомашины урд салхины шилний дотор талд урдаас болон жолоочийн суудлын аль алинаас нь ил харагдахаар нааж байрлуулах ёстой.", true],
  [5, "自家用の普通乗用自動車は、2年ごと（初回に限り3年）に自動車検査を行わなければならない。", "Хувийн суудлын энгийн автомашин нь 2 жил тутамд (анхны удаад зөвхөн 3 жил) техникийн хяналтын үзлэгт орох ёстой.", true],
  [6, "自家用の普通貨物自動車（総排気量660cc以下を除く）は、6カ月ごとに定期点検を行わなければならない。", "Хувийн энгийн ачааны автомашин (хөдөлгүүрийн багтаамж нь 660 см³ ба түүнээс доош машиныг оролцуулахгүй) нь 6 сар тутамд ээлжит үзлэгт орох ёстой.", true],
  [7, "自家用の普通乗用自動車は、1年ごとに定期点検を行わなければならない。", "Хувийн суудлын энгийн автомашин нь 1 жил тутамд ээлжит үзлэгт орох ёстой.", true],
  [8, "自家用の大型自動二輪車は、3カ月ごとに定期点検を行わなければならない。", "Хувийн том оврын мотоцикл нь 3 сар тутамд ээлжит үзлэгт орох ёстой.", false],
  [9, "大型自動二輪車や普通自動二輪車を所有する場合は、自動車損害賠償責任保険に加入しなければならない。", "Том оврын болон энгийн мотоцикл эзэмших тохиолдолд жолоочийн хариуцлагын албан журмын даатгалд даатгуулах ёстой.", true],
  [10, "原動機付自転車は、自動車損害賠償責任保険に加入する義務はない。", "Мопед нь жолоочийн хариуцлагын албан журмын даатгалд даатгуулах үүрэггүй.", false],
  [11, "自動車損害賠償責任保険は人身事故に限り保険金が支払われ、物損事故には適用されない。", "Жолоочийн хариуцлагын албан журмын даатгал нь зөвхөн хүний амь нас, эрүүл мэнд хохирсон осолд даатгалын нөхөн төлбөр олгодог бөгөөд эд хөрөнгийн хохиролтой осолд хамаарахгүй.", true],
  [12, "原動機付自転車は、自動車検査（車検）がないので、自動車損害賠償責任保険の有効期限に注意する。", "Мопед нь техникийн хяналтын үзлэг (шакэн)-т ордоггүй тул жолоочийн хариуцлагын албан журмын даатгалын хүчинтэй хугацаанд анхаарах хэрэгтэй.", true],
  [13, "運転者は万一のことを考え、任意保険にも加入しておくのがよい。", "Жолооч болзошгүй эрсдэлийг бодолцон сайн дурын даатгалд ч мөн хамрагдаж байх нь зүйтэй.", true],
];

export const NOTES: Note[] = [
  [[1, 2], "車を運転するとき、運転免許証または免許情報記録個人番号カードは運転者が携帯し、また自動車検査証と自賠責保険証は必ず車に備える。", "Машин жолоодох үед жолооны үнэмлэх эсвэл үнэмлэхийн мэдээлэл бүртгэгдсэн хувийн дугаарын картыг жолооч биедээ авч явах бөгөөд автомашины үзлэгийн гэрчилгээ болон хариуцлагын албан журмын даатгалын гэрчилгээг заавал машиндаа байлгана."],
  [[9, 10], "自動車損害賠償責任保険は強制保険といわれ、加入していない自動車などは運転してはいけない。", "Жолоочийн хариуцлагын албан журмын даатгалыг заавал даатгуулах даатгал гэдэг бөгөөд даатгалд хамрагдаагүй автомашин зэргийг жолоодож болохгүй."],
];

export const EN: string[] = [
  "When driving a motor vehicle, you must carry your driver's license or a My Number card on which your license information is recorded, but there is no need to keep the vehicle inspection certificate or compulsory automobile liability insurance certificate in the vehicle.",
  "It is good to keep the vehicle inspection certificate and compulsory automobile liability insurance certificate at home and carry copies of them in the car.",
  "Even if the vehicle inspection certificate has expired, there is no problem driving the car as long as it has been properly serviced.",
  "The inspection sticker must be affixed to the inside of the windshield so that it is easily visible both from the front of the vehicle and from the driver's seat.",
  "A private ordinary passenger car must undergo a vehicle inspection every 2 years (3 years for the initial inspection only).",
  "A private ordinary cargo truck (excluding those with a total displacement of 660 cc or less) must undergo a periodic inspection every 6 months.",
  "A private ordinary passenger car must undergo a periodic inspection every year.",
  "A private large motorcycle must undergo a periodic inspection every 3 months.",
  "If you own a large motorcycle or an ordinary motorcycle, you must enroll in compulsory automobile liability insurance.",
  "There is no obligation to enroll a moped in compulsory automobile liability insurance.",
  "Compulsory automobile liability insurance pays insurance benefits only for accidents involving personal injury or death and does not cover property-damage accidents.",
  "Because mopeds are not subject to vehicle inspection (shaken), you should pay attention to the expiration date of their compulsory automobile liability insurance.",
  "Drivers should also enroll in voluntary insurance in preparation for unforeseen accidents.",
];

export const NOTES_EN: string[] = [
  "When driving a vehicle, the driver must carry a driver's license or a My Number card with license information recorded, and the vehicle inspection certificate and compulsory liability insurance certificate must always be kept in the vehicle.",
  "Compulsory automobile liability insurance is mandatory insurance, and you must not drive any motor vehicle or moped that is not covered by it.",
];
