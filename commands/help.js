const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('help').setDescription('登録されているコマンドとオプションを表示します。'),
	async execute(interaction) {
		const help = [
			'**```「誰にも間違いはある。無知ゆえの増長もな。ソウカイ・ニンジャはブラフではない。実在するのだ。身をもってわかったろう」```**',
			'◆「ソウカイ・シンジケート」機能一覧\n',
			'**/scout**',
			'```',
			'『スカウト部門の日常』の仕様に沿ったNPCニンジャを生成します。',
			'オプション',
			'level: 必須、1~8の半角数字 スカウトニンジャのレベル',
			'name: 任意、生成されるニンジャの名前',
			'arch: 任意、true/false アーチ級賞金首オプション ',
			'hardmode: 任意, true/false カルマ善かつ、アーチ級賞金首を生成',
			'background: 任意, true/false 知識スキル一つとそのニンジャの性格やスタンスの付与、フレーバー',
			'```',
		];
		await interaction.reply({
			content: help.join('\n'),
			ephemeral: true,
		});
	},
};
