package database

import (
	"github.com/asamigentoku/DatePlan-app/internal/model/rds_models"
	"gorm.io/gorm"
)

var talkSeedData = []rds_models.TalkCategory{
	{
		Label: "お互いを知る",
		Themes: []rds_models.TalkTheme{
			{Body: "子どもの頃の夢は何だった？"},
			{Body: "一番の思い出の旅行先はどこ？"},
			{Body: "好きな食べ物ランキングを教えて"},
			{Body: "最近ハマっていることは？"},
			{Body: "学生時代にどんな部活・サークルに入ってた？"},
		},
	},
	{
		Label: "価値観・ライフスタイル",
		Themes: []rds_models.TalkTheme{
			{Body: "休日の理想の過ごし方は？"},
			{Body: "仕事とプライベート、どちらを大切にしたいタイプ？"},
			{Body: "将来どんな場所に住みたい？"},
			{Body: "節約派？それとも使いたいときに使うタイプ？"},
			{Body: "ペットを飼うなら何がいい？"},
		},
	},
	{
		Label: "恋愛・関係性",
		Themes: []rds_models.TalkTheme{
			{Body: "初めて好きになったのはどんな人？"},
			{Body: "デートで行ってみたい場所は？"},
			{Body: "好きな人に対してどんなことをしてあげたい？"},
			{Body: "記念日は大切にするタイプ？"},
			{Body: "相手に求める一番大切なことは？"},
		},
	},
	{
		Label: "未来・夢",
		Themes: []rds_models.TalkTheme{
			{Body: "5年後にどんな自分でいたい？"},
			{Body: "いつか行ってみたい国はある？"},
			{Body: "やってみたい挑戦や習い事は？"},
			{Body: "将来の夢や目標を教えて"},
			{Body: "理想のライフスタイルってどんな感じ？"},
		},
	},
	{
		Label: "楽しい・盛り上がる",
		Themes: []rds_models.TalkTheme{
			{Body: "もし宝くじで1億当たったら何に使う？"},
			{Body: "無人島に一つだけ持っていくなら何？"},
			{Body: "タイムマシンがあったらいつに行きたい？"},
			{Body: "超能力が使えるとしたら何がほしい？"},
			{Body: "今日食べたいものランキングをその場で決めよう"},
		},
	},
}

// Seed はテーブルが空のときだけ初期データを挿入する
func Seed(db *gorm.DB) error {
	var count int64
	db.Model(&rds_models.TalkCategory{}).Count(&count)
	if count > 0 {
		return nil
	}

	return db.Create(&talkSeedData).Error
}
