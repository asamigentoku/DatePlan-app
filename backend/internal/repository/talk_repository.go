package repository

import (
	"github.com/asamigentoku/DatePlan-app/internal/dto"
	"github.com/asamigentoku/DatePlan-app/internal/model/rds_models"
	"gorm.io/gorm"
)

type TalkRepository interface {
	GetThemes() ([]dto.TalkCategory, error)
}

type talkRepository struct {
	db *gorm.DB
}

func NewTalkRepository(db *gorm.DB) TalkRepository {
	return &talkRepository{db: db}
}

func (r *talkRepository) GetThemes() ([]dto.TalkCategory, error) {
	var categories []rds_models.TalkCategory
	if err := r.db.Preload("Themes").Find(&categories).Error; err != nil {
		return nil, err
	}

	result := make([]dto.TalkCategory, 0, len(categories))
	for _, cat := range categories {
		themes := make([]string, 0, len(cat.Themes))
		for _, t := range cat.Themes {
			themes = append(themes, t.Body)
		}
		result = append(result, dto.TalkCategory{
			Label:  cat.Label,
			Themes: themes,
		})
	}
	return result, nil
}
