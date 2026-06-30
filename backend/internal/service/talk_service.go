package service

import (
	"github.com/asamigentoku/DatePlan-app/internal/dto"
	"github.com/asamigentoku/DatePlan-app/internal/repository"
)

type TalkService interface {
	GetTalkThemes(req *dto.TalkThemeRequest) (*dto.TalkThemeResponse, error)
}

type talkService struct {
	repo repository.TalkRepository
}

func NewTalkService(repo repository.TalkRepository) TalkService {
	return &talkService{repo: repo}
}

func (s *talkService) GetTalkThemes(req *dto.TalkThemeRequest) (*dto.TalkThemeResponse, error) {
	count := req.Count
	if count <= 0 {
		count = 2
	}

	all, err := s.repo.GetThemes()
	if err != nil {
		return nil, err
	}
	categories := make([]dto.TalkCategory, 0, len(all))
	for _, cat := range all {
		themes := cat.Themes
		if count < len(themes) {
			themes = themes[:count]
		}
		categories = append(categories, dto.TalkCategory{
			Label:  cat.Label,
			Themes: themes,
		})
	}
	return &dto.TalkThemeResponse{Categories: categories}, nil
}
