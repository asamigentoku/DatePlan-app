package model

import "gorm.io/gorm"

// gorm.Model を埋め込むと ID/CreatedAt/UpdatedAt/DeletedAt が自動付与される
type User struct {
	gorm.Model
	Name     string `json:"name"  gorm:"not null"`
	Email    string `json:"email" gorm:"uniqueIndex;not null"`
	Password string `json:"-"     gorm:"not null"`
}
