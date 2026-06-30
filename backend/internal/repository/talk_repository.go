package repository

import "github.com/asamigentoku/DatePlan-app/internal/dto"

type TalkRepository interface {
	GetThemes() []dto.TalkCategory
}

type talkRepository struct{}

func NewTalkRepository() TalkRepository {
	return &talkRepository{}
}

var talkThemes = []dto.TalkCategory{
	{
		Label: "お互いを知る",
		Themes: []string{
			"子どもの頃の夢は何だった？",
			"一番の思い出の旅行先はどこ？",
			"好きな食べ物ランキングを教えて",
			"最近ハマっていることは？",
			"学生時代にどんな部活・サークルに入ってた？",
		},
	},
	{
		Label: "価値観・ライフスタイル",
		Themes: []string{
			"休日の理想の過ごし方は？",
			"仕事とプライベート、どちらを大切にしたいタイプ？",
			"将来どんな場所に住みたい？",
			"節約派？それとも使いたいときに使うタイプ？",
			"ペットを飼うなら何がいい？",
		},
	},
	{
		Label: "恋愛・関係性",
		Themes: []string{
			"初めて好きになったのはどんな人？",
			"デートで行ってみたい場所は？",
			"好きな人に対してどんなことをしてあげたい？",
			"記念日は大切にするタイプ？",
			"相手に求める一番大切なことは？",
		},
	},
	{
		Label: "未来・夢",
		Themes: []string{
			"5年後にどんな自分でいたい？",
			"いつか行ってみたい国はある？",
			"やってみたい挑戦や習い事は？",
			"将来の夢や目標を教えて",
			"理想のライフスタイルってどんな感じ？",
		},
	},
	{
		Label: "楽しい・盛り上がる",
		Themes: []string{
			"もし宝くじで1億当たったら何に使う？",
			"無人島に一つだけ持っていくなら何？",
			"タイムマシンがあったらいつに行きたい？",
			"超能力が使えるとしたら何がほしい？",
			"今日食べたいものランキングをその場で決めよう",
		},
	},
}

func (r *talkRepository) GetThemes() []dto.TalkCategory {
	return talkThemes
}
