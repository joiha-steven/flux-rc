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
