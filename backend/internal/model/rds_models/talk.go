package rds_models

import "gorm.io/gorm"

type TalkCategory struct {
	gorm.Model
	Label  string      `json:"label"  gorm:"not null"`
	Themes []TalkTheme `json:"themes" gorm:"foreignKey:CategoryID"`
}

type TalkTheme struct {
	gorm.Model
	CategoryID uint   `json:"-"     gorm:"not null;index"`
	Body       string `json:"body"  gorm:"not null"`
}
