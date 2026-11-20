import type { Row, Note } from "../drivingTest";

// 第1段階 項目13 運転免許制度・交通反則通告制度. Q15 (1図)
// needs its figure — hidden until image exists.
export const FIGURE_NOS = [15];

export const ROWS: Row[] = [
  [1, "運転免許の停止期間中は、免許の取り消しではないので、自動車を運転しても無免許運転にはならない。", "Жолоодох эрхийг түр хассан хугацаанд эрхийг хүчингүй болгосон биш тул автомашин жолоодсон ч үнэмлэхгүй жолоодсонд тооцогдохгүй.", false],
  [2, "運転免許は、第一種運転免許・第二種運転免許・原付免許の3つに区分されている。", "Жолооны үнэмлэх нь 1-р ангиллын жолооны үнэмлэх, 2-р ангиллын жолооны үнэмлэх, мопедын үнэмлэх гэсэн 3 ангилалд хуваагддаг.", false],
  [3, "AT限定大型二輪免許では、オートマチックの大型自動二輪車とオートマチックの普通自動二輪車を運転することができる。", "Зөвхөн автомат кроптой том оврын мотоциклын үнэмлэхээр автомат кроптой том оврын мотоцикл болон автомат кроптой энгийн мотоцикл жолоодож болно.", true],
  [4, "AT限定の普通免許を受けて1年を経過し、初心運転者期間が終了すれば、マニュアルの普通自動車を運転することができる。", "Зөвхөн автомат кроптой суудлын машины үнэмлэх аваад 1 жил өнгөрч, шинэ жолоочийн хугацаа дуусвал механик кроптой суудлын автомашин жолоодож болно.", false],
  [5, "仮免許を受けていれば、一般原動機付自転車を練習のために運転することができる。", "Түр үнэмлэх авсан бол дадлага хийх зорилгоор энгийн мопед жолоодож болно.", false],
  [6, "仮免許では、運転練習をしたり運転免許試験などを受ける場合のほかは、道路で自動車を運転することはできない。", "Түр үнэмлэхээр жолооны дадлага хийх болон жолооны шалгалт өгөхөөс бусад тохиолдолд зам дээр автомашин жолоодож болохгүй.", true],
  [7, "タクシーやハイヤーなどの旅客自動車を回送する目的で運転するときは、第一種免許で運転することができる。", "Такси болон захиалгат машин зэрэг зорчигч тээврийн автомашиныг зорчигчгүйгээр буцааж хүргэх зорилгоор жолоодох үед 1-р ангиллын үнэмлэхээр жолоодож болно.", true],
  [8, "普通免許を受けていれば、普通自動二輪車を運転することができる。", "Суудлын машины энгийн үнэмлэх авсан бол энгийн мотоцикл жолоодож болно.", false],
  [9, "普通免許を受けている人は、普通自動車のほか、小型特殊自動車と一般原動機付自転車を運転することができる。", "Суудлын машины энгийн үнэмлэхтэй хүн суудлын автомашинаас гадна жижиг тусгай зориулалтын автомашин болон энгийн мопед жолоодож болно.", true],
  [10, "普通免許を受けている人が、乗車定員15人の乗用自動車に大人5人を乗せて運転した。", "Суудлын машины энгийн үнэмлэхтэй хүн 15 хүний суудалтай суудлын автомашинд насанд хүрсэн 5 хүн суулгаж жолоодсон.", false],
  [11, "普通免許を受けていれば、最大積載量2,000キログラムの貨物自動車を運転することができる。", "Суудлын машины энгийн үнэмлэх авсан бол 2,000 кг даацтай ачааны автомашин жолоодож болно.", false],
  [12, "大型免許を受けていても、大型自動二輪車を運転することはできない。", "Том оврын машины үнэмлэх авсан байсан ч том оврын мотоцикл жолоодож болохгүй.", true],
  [13, "大型二輪免許を受けられる年齢は18歳以上であるが、AT限定大型二輪免許は16歳以上である。", "Том оврын мотоциклын үнэмлэх авах нас нь 18 наснаас дээш боловч зөвхөн автомат кроптой том оврын мотоциклын үнэмлэх нь 16 наснаас дээш байдаг.", false],
  [14, "車の総重量が750キログラムを超える車（故障車を除く）をけん引するときは、けん引免許が必要である。", "Бүх жин нь 750 кг-аас дээш тээврийн хэрэгслийг (эвдэрсэн машинаас бусад) чирэх үед чирэгчийн үнэмлэх шаардлагатай.", true],
  [15, "1図のように故障車をクレーンでけん引して運転するときは、けん引免許が必要である。", "1-р зурагт үзүүлсэн шиг эвдэрсэн машиныг кранаар өргөж чирэн жолоодох үед чирэгчийн үнэмлэх шаардлагатай.", false],
  [16, "運転免許証を紛失したが、その届け出を警察官にしたので、再交付される前でも自動車を運転することができる。", "Жолооны үнэмлэхээ гээгдүүлсэн боловч энэ тухай цагдаагийн ажилтанд мэдэгдсэн тул дахин олгогдохоос өмнө ч автомашин жолоодож болно.", false],
  [17, "運転免許証または免許情報記録個人番号カード（免許情報が記録されているマイナンバーカード）は、自動車や一般原動機付自転車を運転するときには携帯し、警察官から提示を求められた場合は、これを提示しなければならない。", "Автомашин болон энгийн мопед жолоодох үедээ жолооны үнэмлэх эсвэл үнэмлэхийн мэдээлэл бүртгэгдсэн хувийн дугаарын картыг (Майнамба карт) биедээ авч явах бөгөөд цагдаагийн ажилтан үзүүлэхийг шаардсан тохиолдолд үүнийг үзүүлэх ёстой.", true],
  [18, "運転免許証または免許情報記録個人番号カード（免許情報が記録されているマイナンバーカード）の有効期間が満了しても、その日から6ヵ月以内であれば自動車を運転することができる。", "Жолооны үнэмлэх эсвэл үнэмлэхийн мэдээлэл бүртгэгдсэн хувийн дугаарын картын (Майнамба карт) хүчинтэй хугацаа дууссан ч тэр өдрөөс хойш 6 сарын дотор бол автомашин жолоодож болно.", false],
  [19, "仮免許で練習するときは、その自動車を運転することができる第一種免許を受けて3年以上の人か、第二種免許を受けている21歳以上の人を同乗させなければならない。", "Түр үнэмлэхээр дадлага хийх үед тухайн автомашиныг жолоодох эрхтэй 1-р ангиллын үнэмлэх аваад 3-аас дээш жил болсон хүн, эсвэл 2-р ангиллын үнэмлэхтэй 21-ээс дээш насны хүнийг хамт суулгах ёстой.", false],
  [20, "仮免許で練習するときは、「仮免許練習標識」を車の後ろにつけなければならない。", "Түр үнэмлэхээр дадлага хийх үед «Түр үнэмлэхийн дадлагын тэмдэг»-ийг машины ард байрлуулах ёстой.", false],
  [21, "本籍・住所・氏名など免許証の記載事項に変更があった場合は、次の免許更新のときに住所地の公安委員会に届ければよい。", "Үндсэн захиргаа, оршин суугаа хаяг, овог нэр зэрэг үнэмлэх дээрх мэдээлэл өөрчлөгдсөн тохиолдолд дараагийн үнэмлэх сунгах үеэр оршин суугаа газрынхаа Нийгмийн хэв журмын хороонд мэдэгдэхэд болно.", false],
  [22, "大型特殊免許を受けていても、大型自動車や大型自動二輪車を運転することはできない。", "Том оврын тусгай зориулалтын машины үнэмлэх авсан байсан ч том оврын автомашин болон том оврын мотоцикл жолоодож болохгүй.", true],
  [23, "最大積載量6,500キログラムの貨物自動車は、大型自動車である。", "6,500 кг даацтай ачааны автомашин нь том оврын автомашин юм.", true],
  [24, "普通免許や大型二輪免許・普通二輪免許・原付免許を取得後、1年以内に交通違反などをして一定の基準に達した人には、初心運転者講習が行われる。", "Суудлын машины энгийн үнэмлэх, том оврын мотоцикл, энгийн мотоцикл, мопедын үнэмлэх авснаас хойш 1 жилийн дотор замын хөдөлгөөний зөрчил гаргаж тодорхой хэмжээнд хүрсэн хүнд шинэ жолоочийн сургалт явуулдаг.", true],
  [25, "初心運転者期間中に交通違反などをして再試験対象初心運転者となり、再試験に合格しないと、その免許が取り消される。", "Шинэ жолоочийн хугацаанд замын хөдөлгөөний зөрчил гаргаж дахин шалгалт өгөх шинэ жолооч болоод дахин шалгалтад тэнцэхгүй бол тухайн үнэмлэхийг хүчингүй болгоно.", true],
  [26, "免許を受けた人が、自動車や一般原動機付自転車の運転者をそそのかして、共同危険行為などの重大違反をさせたり、それを助けたりしたときは、免許を取り消されたり、停止されたりすることがある。", "Жолооны үнэмлэхтэй хүн автомашин болон энгийн мопедын жолоочийг хатгаж хамтарсан аюултай үйлдэл зэрэг ноцтой зөрчил гаргуулах, эсвэл түүнд тусалсан үед үнэмлэхийг нь хүчингүй болгох буюу эрхийг нь түр хасах тохиолдол байдаг.", true],
  [27, "故障車をロープでけん引して運転するとき、故障車の総重量が750キログラムを超える場合は、けん引免許が必要である。", "Эвдэрсэн машиныг татлага олсоор чирч жолоодох үед эвдэрсэн машины бүх жин 750 кг-аас хэтэрсэн тохиолдолд чирэгчийн үнэмлэх шаардлагатай.", false],
  [28, "普通二輪免許を取得して1年を経過したが、大型二輪免許は取得して1年未満なので、大型二輪免許については初心運転者期間である。", "Энгийн мотоциклын үнэмлэх аваад 1 жил өнгөрсөн боловч том оврын мотоциклын үнэмлэх аваад 1 жил хүрээгүй байгаа тул том оврын мотоциклын үнэмлэхийн хувьд шинэ жолоочийн хугацаанд хамаарна.", true],
  [29, "酒酔い運転・麻薬等運転・共同危険行為等禁止違反などについては、1回の違反で免許の取り消しになる。", "Согтуугаар тээврийн хэрэгсэл жолоодох, мансууруулах бодис хэрэглэж жолоодох, хамтарсан аюултай үйлдэл хийхийг хориглох зөрчил зэрэг нь 1 удаагийн зөрчлөөр жолооны эрхийг хүчингүй болгодог.", true],
  [30, "準中型自動車の最大積載量は、2,000キログラム以上、4,500キログラム未満である。", "Хагас дунд оврын автомашины дээд даац нь 2,000 кг-аас дээш, 4,500 кг-аас бага байна.", true],
];

export const NOTES: Note[] = [
  [[8, 9, 10, 11], "普通免許で運転できるのは、普通自動車（乗車定員10人以下・最大積載量2,000kg未満・車両総重量3,500kg未満）、小型特殊自動車、一般原動機付自転車。", "Суудлын машины энгийн үнэмлэхээр суудлын автомашин (суудлын тоо 10 ба түүнээс цөөн, дээд даац 2,000 кг-аас бага, бүх жин 3,500 кг-аас бага), жижиг тусгай зориулалтын автомашин, энгийн мопедыг жолоодож болно."],
  [[12], "大型免許で運転できるのは、大型自動車のほか、中型自動車、準中型自動車、普通自動車、小型特殊自動車、一般原動機付自転車。", "Том оврын машины үнэмлэхээр том оврын автомашинаас гадна дунд оврын автомашин, хагас дунд оврын автомашин, суудлын автомашин, жижиг тусгай зориулалтын автомашин, энгийн мопедыг жолоодож болно."],
  [[15], "クレーン（レッカー）車やロープなどで故障車をけん引するときは、故障車の総重量が750kgを超えていても、けん引免許は必要ない。", "Крантай (чирэгч) машин болон татлага олсоор эвдэрсэн машиныг чирэх үед эвдэрсэн машины бүх жин 750 кг-аас хэтэрсэн байсан ч чирэгчийн үнэмлэх шаардлагагүй."],
  [[16], "免許証不携帯の交通違反になる。", "Үнэмлэх биедээ авч яваагүй замын хөдөлгөөний зөрчил болно."],
  [[20], "前後の定められた位置につける。", "Урд болон хойд талын тогтоосон байрлалд байрлуулна."],
  [[24, 25], "一定の基準とは、3点以上の違反や事故。初心者には初心運転者期間制度があるので要注意。", "Тодорхой хэмжээ гэдэг нь 3 ба түүнээс дээш онооны зөрчил эсвэл осол юм. Шинэ жолоочид шинэ жолоочийн хугацааны тогтолцоо үйлчилдэг тул анхаарах хэрэгтэй."],
];

export const EN: string[] = [
  "During a license suspension period, your license has not been revoked, so driving a motor vehicle does not count as driving without a license.",
  "Driver's licenses are divided into three categories: Class 1 driver's licenses, Class 2 driver's licenses, and moped licenses.",
  "With an AT-limited large motorcycle license, you may ride both automatic large motorcycles and automatic ordinary motorcycles.",
  "Once one year has passed after obtaining an AT-limited ordinary license and the novice driver period ends, you may drive a manual-transmission ordinary car.",
  "If you hold a learner's permit, you may ride an ordinary moped for practice.",
  "With a learner's permit, you cannot drive a motor vehicle on the road except when practicing driving or taking a driver's license examination.",
  "When driving a passenger vehicle such as a taxi or hire car out of service (for example, returning it to the garage), you may drive it with a Class 1 license.",
  "If you hold an ordinary license, you may ride an ordinary motorcycle.",
  "A person who holds an ordinary license may drive small special vehicles and ordinary mopeds in addition to ordinary motor vehicles.",
  "A person holding an ordinary license drove a passenger car with a seating capacity of 15 people carrying 5 adults.",
  "If you hold an ordinary license, you may drive a cargo vehicle with a maximum payload of 2,000 kilograms.",
  "Even if you hold a large vehicle license, you cannot ride a large motorcycle.",
  "The minimum age for a large motorcycle license is 18, whereas the minimum age for an AT-limited large motorcycle license is 16.",
  "A towing license is required when towing a vehicle with a gross vehicle weight exceeding 750 kilograms (excluding broken-down vehicles).",
  "When towing a broken-down vehicle with a crane as shown in Figure 1, a towing license is required.",
  "I lost my driver's license, but since I reported the loss to a police officer, I may drive a motor vehicle even before a replacement license is reissued.",
  "When driving a motor vehicle or an ordinary moped, you must carry your driver's license or a My Number card with license information recorded on it, and present it if requested by a police officer.",
  "Even after your driver's license or My Number card with recorded license information expires, you may drive a motor vehicle within 6 months from the expiration date.",
  "When practicing with a learner's permit, you must be accompanied by someone who has held a Class 1 license for that vehicle for at least 3 years, or someone aged 21 or older who holds a Class 2 license.",
  "When practicing with a learner's permit, you must attach a \"Learner's Permit Practice Sign\" to the rear of the car.",
  "If there is a change in the details written on your driver's license, such as your registered domicile, address, or name, it is sufficient to report it to the Public Safety Commission of your place of residence at the next license renewal.",
  "Even if you hold a large special vehicle license, you cannot drive a large motor vehicle or a large motorcycle.",
  "A cargo vehicle with a maximum payload of 6,500 kilograms is a large motor vehicle.",
  "A person who commits traffic violations reaching a certain threshold within 1 year after obtaining an ordinary license, large motorcycle license, ordinary motorcycle license, or moped license is required to take a novice driver course.",
  "If you commit traffic violations during the novice driver period, become subject to a re-examination, and fail the re-examination, that license will be revoked.",
  "If a license holder incites or assists the driver of a motor vehicle or ordinary moped to commit a serious violation such as joint dangerous acts, their license may be revoked or suspended.",
  "When towing a broken-down vehicle with a rope, a towing license is required if the gross vehicle weight of the broken-down vehicle exceeds 750 kilograms.",
  "One year has passed since I obtained my ordinary motorcycle license, but less than one year has passed since I obtained my large motorcycle license, so I am still in the novice driver period for the large motorcycle license.",
  "For offenses such as driving while intoxicated, driving under the influence of narcotics, or joint dangerous acts, a single violation results in license revocation.",
  "The maximum payload of a semi-medium motor vehicle is 2,000 kilograms or more and less than 4,500 kilograms.",
];

export const NOTES_EN: string[] = [
  "An ordinary license allows you to drive ordinary motor vehicles (seating capacity of 10 or fewer, maximum payload under 2,000 kg, gross vehicle weight under 3,500 kg), small special vehicles, and ordinary mopeds.",
  "A large vehicle license allows you to drive large motor vehicles, medium motor vehicles, semi-medium motor vehicles, ordinary motor vehicles, small special vehicles, and ordinary mopeds.",
  "When towing a broken-down vehicle with a crane (wrecker) or a rope, a towing license is not required even if the gross weight of the broken-down vehicle exceeds 750 kg.",
  "Driving without carrying your driver's license is a traffic violation.",
  "Attach the practice signs at the designated positions on both the front and rear of the vehicle.",
  "The threshold is violations or accidents totaling 3 points or more. Be careful, as the novice driver period system applies to new license holders.",
];
