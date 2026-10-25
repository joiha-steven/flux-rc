# Glossary

Terminology decisions per language, with the reason for each. Keep new strings consistent with these;
change a term here first, then everywhere it appears in the locale file.

Shared decisions:

- Brand and part names, PIN digits and units stay as in English (Lux-RC, NXS R1, 371/372, McClicky, MOFF, CR123A, 18650, mW, W, ms, °C, V).
- Decimals keep the dot ("0.4 s", "3.7 V") in every language, German included: numbers also come from the code and the protocol tables with a dot, and mixing both would look broken.
- The ` · ` separator in mode labels stays; screen readers get `a11y.listSeparator` instead.

## Vietnamese (vi)

| English term | Vietnamese | Reason |
|---|---|---|
| flashlight | đèn (đèn pin on first mention only in meta) | Players just say "đèn"; "pin" also means battery |
| cell / battery | pin | Everyday word; "1 pin", "2 pin" for one/two cells |
| mode | mode | Players say "mode", not "chế độ" |
| level | mức | Short; "mức 28" |
| program (verb) / programmer | nạp / chương trình nạp | "lập trình" not seen in hobby text; "nạp" fits putting the program into the light |
| load | Dùng (preset) / Mở (saved setups) | Kept apart from "nạp" (program) |
| preset | preset | Kept English as in the hobby |
| afterburning | Turbo (tile code TB) | Research: no native word; players say Turbo |
| red moonlight | Moonlight đỏ | Moonlight kept English, colour in Vietnamese |
| beacon | Beacon đỏ | Kept English (Anduril guides vary: "đèn hiệu"/"nhấp nháy") |
| strobe | Strobe | Kept English |
| S.O.S. | S.O.S. | Kept |
| custom signal | Tín hiệu tự chọn | No hobby term |
| memory | Nhớ mode (Không nhớ, Chuẩn, Hybrid) | Players ask "đèn có nhớ mode không"; nobody says "Memory" |
| Li-ion protection | Bảo vệ Li-ion (title: Bảo vệ pin lithium-ion) | Matches "bảo vệ điện áp thấp" usage, short |
| battery stretch | Battery stretch | No native term; kept English |
| bounce sensor | Bounce sensor (cảm biến rung) | English kept, described as vibration switch in driver |
| thermal cutoff | Ngắt nhiệt | Short, clear |
| output limit | Giới hạn công suất | Research suggestion |
| switch timeout | Thời gian chuyển mode | Reviewer fix; clear what it does |
| half-press | nhấn nửa | Research suggestion |
| clicky | clicky | Kept English |
| tailcap method | cách vặn đuôi | Reviewer fix |
| driver | driver (not used in UI text) | -- |
| light sensor | not in UI strings | -- |
| decimals | dot kept ("0.4 s") | Lead decision; Vietnamese hobby pages mix both |
| PIN | mã PIN in titles, "PIN {pin}" before a number | Avoid clash with pin = cell |
| frames | frame | Kept English, no plural |
| Share link | Chia sẻ link | "link" is what everyone says |

## German (de)

Register: informal "du" everywhere (hobby forum tone, matches the casual English). Imperatives are du-form ("Halt", "Wähl", "Drück").
Decimals keep the dot ("0.4 s", "3.7 V") per the lead's decision, so German "4,2 V" is deliberately not used.
Quotes: „…“ where English has “…”.

| English term | German term | Reason |
|---|---|---|
| flashlight | Taschenlampe / Lampe | Forum standard; "Lampe" for short UI text |
| mode | Modus | Plain German, used in the forum Anduril manual |
| level | Stufe | Forum manual and reviews |
| Presets (button, dialog) | Presets | Same word hobbyists use for vendor programs; "Vorlagen" is no shorter |
| Saved | Gespeichert | Short enough; "Save" button is "Speichern" |
| Load | Laden | Shortest natural word |
| Quick start | Schnellstart | Natural |
| memory (modes) | Speicher | Forum Anduril manual |
| afterburning | Afterburning | No native word; kept English like Turbo |
| red moonlight | Rotes Moonlight | Moonlight stays English in forum; no source for the red variant |
| beacon | Beacon (Rotes Beacon) | Forum manual keeps Beacon |
| strobe | Strobe (10-Hz-Strobe) | Forum keeps Strobe, not Stroboskop |
| S.O.S. | S.O.S. | Unchanged; tile code SOS |
| custom signal | Eigenes Signal | Short and clear |
| battery stretch | Laufzeitverlängerung | No forum term; plain description of what it does |
| Li-ion protection | Schutz gegen Tiefentladung (LVP) | Forum manual; label shortened to "Li-ion-Schutz (LVP)" |
| bounce sensor | Bounce-Sensor | No native term |
| thermal cutoff / limit | Temperaturlimit | Matches vendor preset names "Temperature Limit"; shorter than Temperaturregulierung, which is a different thing (regulation) |
| output limit | Höchststufe (1 Zelle / 2 Zellen) | Reviewer chose a plain word over the forum's Ceiling; output itself is "Leistung" |
| switch timeout | Modus-Timeout | Timeout stays English per forum; "Modus-" says what it is |
| one cell / two cells | 1 Zelle / 2 Zellen | Digits are short at 375 px |
| tailcap | Endkappe | Forum and reviews |
| tailcap switch | Taster (on driver) | Used only for the e-switch description |
| McClicky / MOFF | McClicky / MOFF | Not translated; "E-Switch (MOFF)" |
| reverse clicky | Reverse Clicky | Forum keeps English |
| half-press | Antippen (halb drücken) | "Antippen" is the usual word; "halb drücken" explains it once |
| driver | Treiber | Forum term |
| light engine | LED-Modul | "Lichtmaschine" means car alternator |
| Programmer | Programmer | Hobby loan word, same as the page title |

## Japanese (ja)

| English term | Japanese | Reason |
|---|---|---|
| Afterburning | ターボ | Japanese lights call the top mode ターボ; no native word (research: A) |
| Red moonlight | 赤色月光 | 赤色ムーンライト (8 characters) overflowed the mode tile at 375 px; 月光 is still read as moonlight |
| Beacon | ビーコン | katakana in Nitecore listings |
| Strobe | ストロボ | katakana norm |
| S.O.S. | SOS | Japanese writes SOS without dots |
| Custom signal | カスタム信号 | plain katakana + noun |
| Mode | モード | katakana norm |
| Level | レベル | kept; "段階" would clash with Low/Mid/High; 工場出荷時 etc. unaffected |
| Low/Medium/High/Max | Low / Mid / High / Max | Latin letters with slashes, as in shop copy |
| Memory | メモリー機能 | shop-listing form with long vowel |
| Standard / Hybrid memory | 標準 / ハイブリッド | ハイブリッド is katakana loan |
| Li-ion protection | Li-ion 保護 (title: リチウムイオン保護) | 低電圧保護 used only in issue.protection-off |
| Low-voltage protection | 低電圧保護 | matches Japanese manuals |
| Battery stretch | ランタイム延長 | extends runtime; 延命 suggested cycle life |
| Bounce sensor | 振動センサー | it is a vibration switch in the driver |
| Thermal limit / cutoff | 温度上限 | upper temperature limit; avoids 色温度 confusion |
| Output limit | 出力制限 | plain |
| Mode switch timeout | モード切替の受付時間 (short: 切替受付時間) | window for the next click, not how long switching takes |
| Half-press | 半押し | from Nitecore copy |
| MOFF | MOFF (電子スイッチ) | kept per brief |
| Driver | ドライバー | katakana norm |
| Tailcap | テールキャップ | katakana norm |
| Preset | プリセット | katakana |
| Vendor presets | メーカープリセット | メーカー = manufacturer/vendor |
| Programming / program | 書き込む / 書き込み | "program the light" reads as writing to it; プログラミング only in "プログラミング PIN" |
| Clicky switch | クリックスイッチ / リバースクリッキー | katakana |
| Decimals | dot, half-width digits, "17 W" with space | per lead's decision |

## Simplified Chinese (zh-Hans)

| English term | zh-Hans | Reason |
|---|---|---|
| level | 档位 | Standard hobby/manual word (四档, 档位). |
| afterburning | 极亮 | Hobby top-level name; no native word for afterburning. Tile code is also 极亮. |
| red moonlight | 红光月光 | Matches 月光档 plus the colour; short, readable. |
| moonlight (detail) | 暗红光 | Descriptive, as in English "Dim red light". |
| beacon | 信标 | Verified hobby word. Mode name "红光信标". |
| strobe | 爆闪 | Hobby word, not 频闪. "10 Hz 爆闪". |
| S.O.S. | SOS | Written as in manuals, no dots. |
| custom signal | 自定义信号 | Plain. |
| memory | 记忆 | Hobby word (记忆档位). Modes: 无记忆 / 标准 / 混合. |
| Li-ion protection | Li-ion 保护 (title 锂电池保护) | Keeps Li-ion Latin as the brief says; 低压保护 appears in the issue text ("低压保护已关闭"). |
| battery stretch | 延长续航 | No hobby term; says what it does. |
| bounce sensor | 震动感应 | Lead decision: it is a vibration switch in the driver; 弹跳 reads as debounce. |
| thermal limit / cutoff | 温控 | Verified hobby word. |
| output limit | 输出上限 | Plain. |
| mode switch timeout | 模式切换超时 | Literal; no established term. |
| half-press | 半按 | Plain. |
| click / press | 按下 / 点击 | 点击 only for the PIN rhythm count. |
| tailcap | 尾盖 (screw-on cap); 尾按 / 按帽 (the rubber button) | 尾帽 dropped everywhere. |
| driver | 驱动 | Brief-specified; hobby shorthand. |
| programming | 编程 | Matches the product's own use. |
| preset | 预设 | Standard. |
| saved | 已保存 | Plain; reviewer fix. |
| flashlight | 手电 | Hobby shorthand. |
| light engine | 灯芯 | Shorter and natural. |
| McClicky / MOFF | kept | As brief; "机械开关" and "电子开关" added as glosses. |
| decimal point | dot kept | Per lead decision ("0.4 s"). |
| punctuation | full-width in Chinese, half-width around digits/units | Spaces kept between Chinese text and numbers or Latin for readability. |

## Russian (ru)

Register: polite «вы» (Выберите, Приложите), as in Russian manuals and shop pages; hobby words where the forum uses them.
Units stay Latin and decimals keep the dot ("0.4 s", "17 W", "10 Hz") per the lead's decision. One exception: `program.run.announceHold`
is screen-reader only, so it says "сек." (Cyrillic), which Russian voices expand to "секунд(ы)"; a bare "с" can be read as the preposition; Latin "s" would be read as a letter.
Quotes: «…» where English has “…”. No plurals in code: counts go after a colon ("кадров: {frames}", "кликов: {n}").
{name} never takes a case ending: it sits after a colon or in «quotes».

| English term | Russian | Reason |
|---|---|---|
| flashlight | фонарь | Forum standard |
| light engine | светодиодный модуль (модуль 371D) | What fonarevka calls a drop-in; "двигатель" would be a calque |
| cell / battery | элемент (элемент питания); аккумулятор only where it is Li-ion | CR123A is not an аккумулятор; "Один элемент", "Два элемента последовательно" |
| mode / level | режим / уровень | Forum standard; "Уровень 28" |
| program (verb), Program button | запрограммировать, «Программировать» | Not прошить: that means flashing firmware, which this page does not do |
| Program step (step indicator) | Запись | "Программирование" is too long for the step strip at 375 px; "запись" (writing the settings) is plain and short |
| programmer | программатор | Same word as the original Lux-RC tool on the forum |
| preset | пресет | Hobby loan word |
| Presets / Saved | Пресеты / Сохранённые | Short for the topbar |
| afterburning | Турбо (tile code ТБ) | No native word; Russian lights call the top mode Турбо |
| red moonlight | Красный мунлайт (code КМ) | Мунлайт is the forum word (iXBT, fonarevka) |
| beacon | Красный маяк (code МАЯК) | Маяк is standard; the whole word is 4 letters, clearer than a cut code |
| strobe | Стробоскоп 10 Hz (code СТР) | Full word as on box texts; Hz kept Latin like other units |
| S.O.S. | SOS | Russian writes it without dots |
| custom signal | Свой сигнал (code СИГ) | Plain; "пользовательский" is officialese |
| level tile label | УР | Short for уровень |
| memory | Память режима: Без памяти / Стандартная / Гибридная | Forum asks "есть ли память режима" |
| Behaviour (section) | Настройки | "Поведение" reads as a calque |
| Li-ion protection | Защита Li-ion (title: Защита литий-ионных аккумуляторов); issue: защита от переразряда | Forum term for LVP |
| protected cells | аккумуляторы с платой защиты | What sellers and forum call protected cells |
| battery stretch | Экономия заряда | No forum term; says what it does |
| bounce sensor | Датчик тряски | Vibration switch in the driver (lead's decision) |
| thermal cutoff | Термоотсечка | iXBT reviews |
| output limit | Ограничение мощности (1 элемент / 2 элемента) | Plain; digits keep it short |
| mode switch timeout | Время на переключение режима | The window for the next click, not how long switching takes |
| Keep current | Не менять | Short, the usual UI phrase |
| Advanced (vendor safety settings) | Дополнительно (защитные настройки производителя) | Vendor = the flashlight maker who builds the engine in |
| switch | кнопка | Russian says кнопка for any tailcap switch |
| McClicky / MOFF | Механическая (McClicky) / Электронная (MOFF) | Names kept, type in Russian |
| reverse clicky | реверсная кнопка | Fonarevka usage |
| half-press | полунажатие | Forum and manuals |
| click (PIN) | клик, кликать | What hobbyists say for tapping in a PIN |
| beep | звуковой сигнал / звук | "Бип" is slang; "сигнал" alone clashes with the programming signal, so "звук" in titles |
| PRESS / RELEASE / WAIT (big cue words) | ЖМИТЕ / ОТПУСТИТЕ / ЖДИТЕ | Imperative, short, readable at a glance |
| verb in run announcement | нажимайте / отпускайте | Imperfective: repeated at every beep |
| tailcap method | способ с хвостовой крышкой | Хвостовая крышка is the forum term |
| driver | драйвер | Forum term |
| timing | тайминг | Hobby loan word; "временные параметры" is stiff |
| frames | кадров: {n} | Count after a colon works for any number |
| Share link | Поделиться ссылкой | Standard Russian UI phrase |
| I'm ready | Всё готово | Avoids готов/готова gender |
| Programmed (success) | Готово (announce: Фонарь запрограммирован.) | "Запрограммировано" alone is heavy as a title |

## Traditional Chinese (zh-Hant)

Taiwan usage, readable in Hong Kong. Written fresh, not converted from zh-Hans: many mainland words mean something else or sound foreign in Taiwan.
Address: 你. Quotes: 「…」. Full-width punctuation in Chinese text; units, digits and Latin names stay half-width with a space ("17 W", "Li-ion 保護"); decimals keep the dot per lead decision.

| English term | zh-Hant | zh-Hans | Reason |
|---|---|---|---|
| flashlight | 手電筒 (meta, About); 燈 in UI text | 手电 | 手電 alone reads mainland; 燈 is what hobbyists write in short text |
| program (verb) / Program button | 寫入 | 编程 | Lead decision: 編程 is mainland, 燒錄 means firmware flashing; this only writes settings |
| programmer | 寫入工具 (光學寫入工具, 原版 Lux-RC 寫入工具) | 编程器 | Follows 寫入; 寫入器 sounds like hardware |
| programming PIN / mode | 寫入 PIN / 寫入模式 | 编程 PIN | Same |
| Programmed | 寫入完成 | 编程完成 | Same |
| light engine | LED 模組 | 灯芯 | 燈芯 means a candle or lamp wick in Taiwan |
| driver | 驅動板 | 驱动 | Bare 驅動 reads as a software driver in Taiwan |
| level | 檔位 | 档位 | Same word, traditional form |
| afterburning | 極亮 (tile 極亮) | 极亮 | Research; no native word |
| red moonlight | 紅光月光 (tile 月光) | 红光月光 | Same |
| beacon / strobe | 紅光信標 / 10 Hz 爆閃 | 信标 / 爆闪 | Research (seen on PTT / Mobile01) |
| custom signal | 自訂訊號 | 自定义信号 | 自訂 and 訊號 are the Taiwan forms |
| memory | 記憶: 無記憶 / 標準 / 混合 | same | Research |
| Li-ion protection | Li-ion 保護 (title 鋰電池保護); issue text 過放保護 | 低压保护 | Research: Taiwan hobbyists say 過放保護 |
| battery stretch | 延長續航 | same | Says what it does |
| bounce sensor | 震動感測器 | 震动感应 | Lead decision (vibration switch); 感測器 is the Taiwan word for sensor |
| thermal cutoff / limit | 溫控上限 | 温控 | Research; bare 溫控 sounds like regulation, 上限 says it is a cutoff point |
| output limit | 輸出上限 | same | Plain |
| switch timeout | 模式切換逾時 | 模式切换超时 | 逾時 is Taiwan, 超時 reads as overtime |
| one cell / two cells | 單顆 / 兩顆 (串聯) | 单节 / 双节 | 一顆 18650 is how Taiwan counts cells; 節 is mainland |
| preset (topbar, dialog) | 預設組合 | 预设 | Bare 預設 means "default" in Taiwan (出廠預設 = factory default) |
| vendor presets | 原廠設定 | 厂家预设 | Research; 原廠 is the Taiwan word for OEM/vendor |
| Keep current | 保持不變 | 保持当前 | 保持當前 is mainland phrasing |
| save / saved / load | 儲存 / 已儲存 / 載入 | 保存 / 载入 | Taiwan UI standard |
| link / screen / settings | 連結 / 螢幕 / 設定 | 链接 / 屏幕 / 设置 | Taiwan UI standard |
| undo / rename | 復原 / 重新命名 | 撤销 / 重命名 | Windows/macOS Taiwan wording |
| reload | 重新整理 | 刷新 | Taiwan browser wording |
| storage blocked | 儲存空間被封鎖 | 被禁用 | Taiwan browser wording |
| packet details / checksum / frames | 封包資訊 / 檢查碼 / 影格 | 数据包详情 / 校验和 / 帧 | Taiwan computing terms |
| PIN digit | 第 {n} 碼 | 第 {n} 位 | Taiwan says 密碼第一碼 |
| tailcap / tailcap method | 尾蓋 / 尾蓋法 | 尾盖 | Research |
| rubber cap (McClicky) | 按帽 | 按帽 / 尾按 | Kept 尾按 only for "reverse clicky" |
| reverse clicky | 反向尾按 | 反向尾按 | Taiwan hobby says 正向/反向尾按 |
| McClicky / MOFF | 機械開關（McClicky） / 電子開關（MOFF） | same | Lead decision; names kept |
| button (physical) | 按鍵; 按鈕 only for on-screen buttons | 按钮 | Keeps the two apart in the tailcap steps |
| beep | 嗶聲 | 提示音 | What Taiwan users call it; shorter |
| half-press | 半按 | same | Research |
| theme | 淺色 / 深色主題 | same | 模式 avoided: it clashes with flashlight modes |

Notes:
- "seconds": visible text keeps "s" ("3 s 後開始閃爍") per the units decision; the screen-reader-only `program.run.announceHold` says 秒 so it is read aloud naturally.
- `program.switch.*.verb` is 按一下 / 放開一下, so the run announcement reads "每聽到一聲嗶就按一下 / 放開一下".
- `program.pin.oldPin` and `advanced.pin.setHint` follow the English meaning (enter the old PIN here; the new one works after this programming). The zh-Hans text says something different there and may need a check.

## Korean (ko)

Register: 해요체 for sentences, with -(으)세요 for instructions ("대세요", "고르세요"), the usual form in Korean apps and manuals. Buttons and labels are bare nouns ("불러오기", "다음", "사용 시간 연장").
No particle follows a `{placeholder}`, because the right particle depends on whether the value ends in a final consonant. Instead the placeholder goes after a colon (`불러왔어요: “{name}”`), before 의 or 까지 (these never change: `{name}의 새 이름`, `{mode}까지`), or before a noun that takes the particle (`“{name}” 항목을 삭제할까요?`). `about.p2` reads `{link}의 배치를` for the same reason.
Units stay Latin with a space for setting values ("1.5 s", "17 W", "50 °C"), as the lead decided. Running sentences about waiting use 초 ("10–20초", "{seconds}초 뒤"), because "s" inside a Korean sentence reads like a typo.
Vendor preset names stay in English, like every other locale.

| English term | Korean | Reason |
|---|---|---|
| flashlight | 라이트 (손전등 only in meta.description) | Hobbyists and shops say 라이트/플래시라이트; 손전등 sounds like a household torch but helps search |
| light engine | LED 모듈 | Korean buyers call the Lux-RC drop-in a 모듈; 라이트 엔진 is not used |
| cell / battery | 셀 for counts (1셀, 2셀 직렬), 배터리 in sentences | "18650 1셀" is standard hobby talk; 배터리 when talking about damage or protection |
| mode | 모드 | Universal |
| level | 레벨 ("레벨 28") | Changed from the research's 단계: "28단계" also means "28 levels", so it is ambiguous next to a level number |
| afterburning | 터보 (tile code TBO) | No native word; Korean lights call the top mode 터보. Same code as ja |
| red moonlight | 빨간 문라이트 | 문라이트 is the hobby word; 빨간 is plain speech. About as wide as "Red moonlight" (check the 375 px tile) |
| beacon | 빨간 비콘 | Loanword used by Korean listings |
| strobe | 스트로브 ("10 Hz 스트로브") | Loanword; 점멸 is kept for flashes in general |
| S.O.S. | SOS | Written without dots in Korean |
| custom signal | 커스텀 신호 | Changed from 사용자 신호: hobbyists say 커스텀, and 사용자 지정 신호 is longer |
| colour red / white | 빨강 / 흰색 | Plain colour words for the picker and signal label |
| flashes single / double | 1회 / 2회 (label: 1회 점멸 / 2회 점멸) | 점멸 is the standard word for blinking in light specs |
| memory | 메모리: 메모리 없음 / 표준 / 하이브리드 | Shops write "메모리 기능"; options as in the research |
| Li-ion protection | Li-ion 보호 (title: 리튬 이온 보호) | Label keeps Li-ion Latin as the brief says; issue text says 저전압 보호 and 과방전 |
| protected cells | 보호회로 배터리 | The term Korean buyers use for protected 18650s |
| battery stretch | 사용 시간 연장 | Says what it does; no hobby term exists |
| bounce sensor | 진동 센서 (slider: 진동 감도) | Lead decision: a vibration switch in the driver |
| thermal cutoff | 온도 제한 | Plain; matches the vendor preset names "Temperature Limit" |
| output limit | 출력 제한 (1셀 / 2셀) | Plain |
| mode switch timeout | 모드 전환 대기 시간 | The time the light waits for the next click; 타임아웃 is not used by hobbyists |
| Keep current | 현재 값 유지 | Short and clear for both advanced settings and the sensor |
| half-press | 반만 누르기 ("캡을 반만 누르세요") | How Korean users describe a tactical half-press on a clicky |
| McClicky / MOFF | 기계식 (McClicky) / 전자식 (MOFF) | Names kept, type glossed |
| reverse clicky | 리버스 클리키 | Loanword; explained in brackets |
| tailcap / tailcap method | 테일캡 / 테일캡 방법 | Hobby loanword |
| PRESS / RELEASE (circle cue) | 누르기 / 떼기 | Bare nouns for the big cue word; the sentence form (`verb`) is 누르세요 / 떼세요 |
| Switch on and leave it on | 켜고 그대로 두세요 (hold: 켜기 · 그대로 유지, timeline: 켜기 · 유지) | Ends a sentence, so `waitHint`, `announceHold` and `timeline.desc` read well around it |
| count-in | 준비 박자 | Musician's phrasing for the beats before the first click |
| program (verb) / programming | 프로그래밍 / 프로그래밍하다 | Korean hobbyists and Lux-RC's own wording; 설정 would be too vague |
| programmer | 프로그래머 | The tool's name in the hobby |
| preset / vendor presets | 프리셋 / 제조사 프리셋 | Standard loanword; 제조사 = vendor |
| Saved (button, dialog) | 저장 목록 | 저장됨 reads like a status message, not a list you open |
| Load | 불러오기 | Standard Korean app wording |
| Share link | 링크 공유 | Standard |
| frames | 프레임 ("{frames}프레임") | No plural needed |
| Quick start names | 데일리 / 택티컬 / 은은하게 | 데일리 and 택티컬 are how Korean EDC users name these; 은은하게 says "soft, never too bright" |
| PIN progress | 자리 {digit}/{digits} · 클릭 {click}/{clicks} | Works for any number and stays short on a phone |

## Spanish (es)

Neutral Spanish for Spain and Latin America. Register: informal "tú" (imperatives "Elige", "Presiona", "Suelta"), no vosotros, no voseo.
Where Spain and Latin America split, the word both read naturally wins (presionar over pulsar/oprimir, celda over pila, configuración over setup, marcar the PIN over introducir/ingresar).
Decimals keep the dot ("0.4 s", "3.7 V") per the lead's decision. Space before the spaced percent ("29 %", RAE); tight tile forms stay "29%". Quotes “…” as in English. Opening ¿ and ¡ always.
Vendor preset names stay in English, as in de.

| English term | Spanish | Reason |
|---|---|---|
| flashlight / the light | linterna | Neutral in Spain and LatAm (not foco, lámpara); "la luz" is kept for the light it gives off, so "the light" (device) is always "la linterna" |
| program (verb) / programmer | programar / programador | Usual word; not "flashear" (firmware) |
| Presets | Presets | Hobby loan word; "Preajustes" reads like an audio app |
| Saved | Guardados | Plural, matches the list of saved setups |
| setup | configuración | Neutral |
| Load | Cargar | Standard |
| Quick start | Inicio rápido | Standard |
| Share link | Compartir enlace | Neutral ("link" is LatAm-only colloquial) |
| mode / level | modo / nivel | Hobby standard; tile code NIV |
| afterburning | Turbo (tile code TB) | Research: Spanish manuals call the top mode Turbo; no native word |
| red moonlight | Luna roja (tile code LR) | Hobbyists say "modo luna"; "Luz de luna roja" is too long for tiles |
| beacon | Baliza roja (BAL) | Plain Spanish for a slow warning flash |
| strobe | Estrobo 10 Hz (EST) | Hobby short form of estroboscópico, used both sides of the Atlantic |
| S.O.S. | SOS | Spanish writes SOS without dots |
| custom signal | Señal personalizada; colours agree with señal ("roja", "blanca") | Picker colour options stay masculine ("Rojo", "Blanco") because they name the colour |
| memory | Memoria: Sin memoria / Estándar / Híbrida | Feminine to agree with memoria |
| On / Off (protection, stretch) | Activada / Desactivada | Both settings are feminine nouns |
| Li-ion protection | Protección Li-ion (title: Protección de iones de litio) | Issue text uses "protección por bajo voltaje" and "sobredescarga"; voltaje over tensión for LatAm |
| battery stretch | Autonomía extendida | No hobby term; autonomía is the usual runtime word |
| bounce sensor | Sensor de vibración | Lead decision: vibration switch in the driver |
| thermal cutoff | Límite de temperatura | Matches the vendor preset names "Temperature Limit" |
| output limit | Límite de potencia (con una celda / con dos celdas) | Plain |
| mode switch timeout | Tiempo para cambiar de modo | Says what it is; "timeout" alone is jargon |
| Keep current | No cambiar | Shorter and clearer than "Mantener actual" |
| vendor | fabricante | What Spanish buyers call the brand selling the light |
| cell | celda (Una celda, Dos celdas en serie) | Used in Spanish 18650 talk; "pila" means disposable and "batería" is the pack |
| battery (disconnect, damage) | batería | Neutral |
| switch / button | interruptor / botón | Mecánico (McClicky), Electrónico (MOFF) |
| click / half-press | clic / media pulsación | "presiona el capuchón a medias" in instructions |
| press / release (big cue) | PRESIONA / SUELTA | presionar is natural in LatAm and understood in Spain; pulsar reads peninsular to many Latin Americans |
| rubber cap | capuchón de goma | Neutral |
| Enter PIN | Marcar PIN / Marca el PIN | Clicking the PIN in is like dialling; avoids introducir (Spain) vs ingresar (LatAm). Typing the custom PIN is "escribir" |
| count-in | cuenta de entrada | Avoids cuenta atrás (Spain) vs cuenta regresiva (LatAm) |
| beep | pitido | Neutral |
| tailcap / tailcap method | tapa trasera / método de la tapa trasera | Used in Spanish manuals |
| driver | driver | Hobby loan word |
| light engine | módulo LED | Neutral |
| reverse clicky / overboost / checksum | kept in English | Hobby jargon with no common Spanish term |
| frames | fotogramas | Always plural in packet.meta |
| I'm ready | ¡Listo! | Avoids gendered "Estoy listo/lista" |
