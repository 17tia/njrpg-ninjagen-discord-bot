const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('scout').setDescription('スカウト部門の日常で使用するニンジャを生成します。')
		// レベル(1~8)
		.addNumberOption(option => option
			.setName('level').setDescription('レベルを指定する[1~8]')
			.setRequired(true).setMinValue(1).setMaxValue(8))
		// ニンジャネーム
		.addStringOption(option => option
			.setName('name').setDescription('名前を指定する'))
		// アーチ級賞金首ルール
		.addBooleanOption(option => option
			.setName('arch').setDescription('アーチ級賞金首オプション(任意)'))
		.addBooleanOption(option => option
			.setName('hardmode').setDescription('確定でカルマ：善を持つアーチ級賞金首ニンジャが生成されます(任意)'))
		// 生成ニンジャの背景設定
		.addBooleanOption(option => option
			.setName('background').setDescription('知識または狂気スキルや性格(任意)')),
	async execute(interaction) {
		const level = interaction.options.getNumber('level');
		const isArch = interaction.options.getBoolean('arch') ?? false;
		const hardMode = interaction.options.getBoolean('hardmode') ?? false;
		const isBackground = interaction.options.getBoolean('background') ?? false;

		const status = {
			main: {
				karate: level,
				neuron: level,
				wazamae: level,
			},
			jitsu: 0,
			sub: {
				hp: level,
				mp: level,
				move: 0,
				money: level * 3,
			},
			various: [],
			alignment: false,
			stance: '',
		};
		const reinforceTable = [
			[2, 0, 0],
			[0, 2, 0],
			[0, 0, 2],
			[2, 2, 0],
			[0, 2, 2],
			[2, 0, 2],
		];
		const skillSet = {
			base: [
				'『◉ランスキック』',
				'『☆カナシバリ・ジツLv3』',
				['『ナガユミ』', '『◉常人の三倍の脚力』'],
				'『チェーンソー』',
				'『☆カラテミサイルLv3』',
				'カルマ：善',
			],
			karate: [
				'『★アクマ・ヘンゲ・ジツLv4』',
				'『◉トライアングル・リープ』',
				'『★カトン・パンチLv4』',
				'『ヒートカタナ』',
				'『ノダチ』',
				'『◉鉄拳』',
			],
			neuron: [
				'『★グレーター・カラテミサイルLv4』',
				['『▲▲戦闘用バイオトルソー』', '『△△バイオスパイク散弾』'],
				'『★カトン連打Lv4』',
				['『パルスダガー』', '『◉滅多斬り』'],
				['『★ドク・スリケンLv4』', '『◉スリケン乱射』'],
				['『▶▶生体LAN端子Lv2』', '『◉sudo_kill-9』'],
			],
			wazamae: [
				'『◉◉タツジン：ボックスカラテ』',
				'『◉◉タツジン：コッポドー』',
				['『◉◉タツジン：ミリタリーカラテ』', '『カスタム・チャカガン』'],
				['『◉頭上からの死』', '『★レッサー・イビルアイLv4』'],
				['『◉回転斬撃強化』', '『ムチ』', '『▶サイバネアイ』'],
				['『◉◉タツジン：イアイドー』', '『カタナ』'],
			],
			arch: [
				['『☆謎めいたニンジャソウルLv1』', '『◉ニンジャソウルの闇×３』', '『☆◉ダークカラテ・エンハンスメント』'],
				['『◉◉グレーター級ソウルの力』', '『◉◉アーチ級ソウルの力』', '『★★★◉欠損部位再生』'],
				['『☆ヘンゲヨーカイ・ジツLv3』', '『★剛力Lv3』', '『★★肉体破壊Lv5』'],
				'『★★イビルアイLv5』',
				'『★★カトン・ジャンプLv5』',
			],
		};
		const statusPattern = reinforceTable[rand(0, 5)];

		// 能力値強化
		Object.keys(status.main).forEach((key, index) => {
			status.main[key] += statusPattern[index];
			// そのステータスが成長の壁を超えていた場合の処理
			if (status.main[key] > 6) {
				breakthroughStatus(status, key, skillSet[key]);
				status.sub.money += 3;
				// 自動獲得スキルのセット
				if (key === 'karate') status.various.push(status.main['karate'] > 12 ? '『●連続攻撃3』' : '『●連続攻撃2』');
				if (key === 'neuron') {
					if (status.main[key] > 12) status.various.push('『●ニンジャ第六感』');
					status.various.push('『●マルチターゲット』', '『●時間差』');
				}
				if (key === 'wazamae') status.various.push(status.main['wazamae'] > 12 ? '『●連射3』' : '『●連射2』');
			}
		});
		// 補助強化
		const addBaseSkill = skillSet.base[rand(0, 5)];
		addBaseSkill === skillSet.base[5] ? status.alignment = true : addParam(status, addBaseSkill);
		// アーチ級オプション有効時
		if ((isArch && status.alignment) || hardMode) {
			if (level > 4) {
				const archPattern = rand(1, 3);
				const advArchSkills = skillSet.arch[1].concat(skillSet.arch[archPattern + 1]);
				addParam(status, advArchSkills);
			}
			else {
				addParam(status, skillSet.arch[0]);
			}
			status.sub.money *= 2;
		}
		// 知識スキルや組織、スタンスのセット
		const bgSet = {
			knowladge: [
				'『◉知識：ストリートの流儀』', '『◉知識：ヤクザの流儀』', '『◉知識：公僕の流儀』', '『◉知識：ハッカーの流儀』', '『◉知識：サラリマンの流儀』', '『◉知識：貴族の流儀』', '『◉知識：銃器』', '『◉知識：サイバネティクス』', '『◉知識：ビークル』', '『◉知識：大型兵器』', '『◉知識：テックガジェット』', '『◉知識：電子ウィルス』', '『◉知識：ファッション』', '『◉知識：現代的アート』', '『◉知識：伝統的アート』', '『◉知識：スポーツ』', '『◉知識：高級嗜好品』', '『◉知識：オイランドロイド』', '『◉知識：重工系メガコーポ』', '『◉知識：バイオ系メガコーポ』', '『◉知識：ソウカイヤ』', '『◉知識：ザイバツ』', '『◉知識：アマクダリ』', '『◉知識：独立小組織』', '『◉知識：ドラッグ』', '『◉知識：犯罪』', '『◉知識：セキュリティ』', '『◉知識：宗教』', '『◉知識：オカルト』', '『◉知識：危険生物』', '『◉知識：カチグミエリア』', '『◉知識：水路港湾エリア』', '『◉知識：旧世紀地下道網』', '『◉知識：山岳エリア』', '『◉知識：IRCネットワーク』', '『◉知識：古代ニンジャ文明』',
			],
			stance: [
				'恐怖や諦観',
				'心酔や従順',
				'違和感や外部存在',
				'全能感や野望',
				'反抗心や嫌悪',
				'秘密や陰謀',
			],
		};
		if (isBackground) {
			status.various.push(bgSet.knowladge[rand(0, bgSet.knowladge.length - 1)]);
			status.stance = bgSet.stance[rand(0, 5)];
		}
		// 副次能力値や判定ダイス、スキル、アイテムなどのセット
		const name = interaction.options.getString('name') ?? setNinjaName();
		const kinds = (!isArch && status.alignment) || hardMode ? 'カルマ：善' : '';
		const dataSet = {
			spell: [],
			skill: [],
			item: [],
			cybarne: [],
		};
		status.sub['move'] = status.sub['move'] < 2 ? Math.ceil(Math.max(status.main.karate, status.main.wazamae) / 2) : 2;
		status.sub['hp'] = status.main.karate;
		status.sub['mp'] = status.main.neuron;
		const dices = {
			melee: status.main.karate,
			range: status.main.wazamae,
			initiative: status.main.neuron,
			hack: status.main.neuron,
			avoid: Math.max(status.main.karate, status.main.neuron, status.main.wazamae),
			acu: status.main.wazamae,
			movement: status.main.wazamae,
			cast: status.main.neuron,
		};

		status.various.forEach(value => {
			if (value.match(/^.[◉●]|.★◉|.☆◉/)) {
				dataSet.skill.push(value);
				if (value === '『◉◉グレーター級ソウルの力』') status.sub.mp += 5;
				if (value === '『◉◉アーチ級ソウルの力』') status.sub.hp += 5;
				if (value === '『★★★◉欠損部位再生』') dataSet.skill.push('『即死耐性』');
				if (value === '『◉ニンジャソウルの闇×３』') status.sub.hp += 3, dices.melee += 3, dices.range += 3, dices.cast += 3;
				return;
			}
			if (value.match(/^.[☆★]/)) {
				dataSet.spell.push(value);
				if (value === '『☆謎めいたニンジャソウルLv1』') status.sub.hp += 1, status.sub.mp += 1;
				return;
			}
			if (value.match(/^.[^◉●☆★▶▲△]/)) {
				dataSet.item.push(value);
				if (value === '『ナガユミ』') dices.movement -= 1;
				if (value === '『チェーンソー』') dices.movement -= 1;
				if (value === '『ノダチ』') dices.movement -= 2, status.sub.move -= 1;
				return;
			}
			if (value.match(/^.[▶▲△]/)) {
				dataSet.cybarne.push(value);
				if (value === '『▲▲戦闘用バイオトルソー』') dices.movement += 1, status.sub.hp += 3;
				if (value === '『▶▶生体LAN端子Lv2』') dices.hack += 4, dices.initiative += 2;
				if (value === '『▶サイバネアイ』') dices.range += 2, dices.acu += 1;
				return;
			}
		});
		const skill = dataSet.skill.sort().reverse().join('');
		const spell = dataSet.spell.sort().reverse().join('');
		const item = dataSet.item.sort().reverse().join('');
		const cybarne = dataSet.cybarne.sort().reverse().join('');
		if (spell !== '') {
			status.jitsu = Math.max(...spell.match(/[1-9]/g));
			dices.cast += status.jitsu;
		}
		if (cybarne !== '') {
			const overhead = cybarne.match(/[▶▲△]/g);
			status.sub.mp -= overhead.length > 3 ? 1 : 0;
		}
		const { karate, neuron, wazamae } = status.main;
		const jitsu = status.jitsu;
		const stance = status.stance;
		const { hp, mp, move, money } = status.sub;
		const { melee, range, initiative, hack, avoid, acu, movement, cast } = dices;
		// 習得しているジツからジツレベルを取得
		const result = [
			'```',
			`◆${name}(種別：ニンジャ) ${kinds} ${stance}`,
			`カラテ	${karate}	体力	${hp}`,
			`ニューロン	${neuron}	精神力	${mp}`,
			`ワザマエ	${wazamae}	脚力	${move}/N`,
			`ジツ	${jitsu}	万札	${money}\n`,
			`スキル：${skill}\n`,
			`装備：${item}\n`,
			`ジツ：${spell}\n`,
			`サイバネギア：${cybarne}\n`,
			'',
			`近接/射撃/機先/電脳 ${melee}/${range}/${initiative}/${hack}`,
			`回避/精密/側転/発動 ${avoid}/${acu}/${movement}/${cast}`,
			'```',
		].join('\n');
		// 出力
		await interaction.reply(result);
	},
};
// function group
function rand(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min + 1) + min);
}
function setNinjaName() {
	const firstName = [
		'ブラック', 'ホワイト', 'レッド', 'ブルー', 'グリーン', 'イエロー',
		'デス', 'ヘル', 'ジゴク', 'キル', 'ドゥーム', 'デッド',
		'マーシレス', 'マッド', 'クレイジー', 'ブルータル', 'ブラッド', 'ダーク',
		'クイック', 'ロング', 'シャープ', 'デジタル', 'サイバー', 'デッドリー',
		'スモーク', 'ポイズン', 'アイアン', 'ゴールデン', 'ブレード', 'キリング',
		'アース', 'ウィンド', 'ファイア', 'アイス', 'ヴォイド', 'ライトニング',
	];
	const lastName = [
		'シャドウ', 'ゴースト', 'アサシン', 'リーパー', 'ウォーカー', 'ランナー',
		'ハンド', 'フィスト', 'フィンガー', 'ヘッド', 'アイズ', 'トゥース',
		'スリケン', 'クナイ', 'カタナ', 'ソード', 'アックス', 'ボム',
		'メイヘム', 'マサカー', 'キラー', 'マシーン', 'ハッカー', 'チェイサー',
		'ラット', 'ライオン', 'ドラゴン', 'ウルフ', 'ドッグ', 'コブラ',
		'カッター', 'ブレイカー', 'クラッシャー', 'ドミネイター', 'シューター', 'ブリンガー',
	];
	return firstName[rand(0, firstName.length - 1)] + lastName[rand(0, lastName.length - 1)];
}
function addParam(status, array) {
	status.various = status.various.concat(array);
}
function breakthroughStatus(status, category, skillSet) {
	const statusPattern = rand(1, 6);
	status.main[category] += Math.round(statusPattern / 3);
	addParam(status, skillSet[statusPattern - 1]);
}
