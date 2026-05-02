package repository

import (
	"errors"

	"github.com/asamigentoku/DatePlan-app/internal/model/rds"
	"gorm.io/gorm"
)

type UserRepository interface {
	FindAll() ([]rds.User, error)
	FindByID(id uint) (*rds.User, error)
	Create(user *rds.User) error
	Update(user *rds.User) error
	Delete(id uint) error
}

type userRepository struct {
	db *gorm.DB
}

func NewUserRepository(db *gorm.DB) UserRepository {
	return &userRepository{db: db}
}

func (r *userRepository) FindAll() ([]rds.User, error) {
	//goではリストが[]で最小に描かれる
	var users []rds.User
	//Find: GORMのメソッドで、「条件に合うデータをすべて取ってくる」という意味です。
	//参照渡しなので見つけたデータをそのまま代入させるから
	err := r.db.Find(&users).Error
	return users, err
}

func (r *userRepository) FindByID(id uint) (*rds.User, error) {
	//型の定義
	var user rds.User
	//id合致する最初のものを取得して参照のuserに渡す
	err := r.db.First(&user, id).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, nil
	}
	return &user, err
}

func (r *userRepository) Create(user *rds.User) error {
	return r.db.Create(user).Error
}

func (r *userRepository) Update(user *rds.User) error {
	return r.db.Save(user).Error
}

func (r *userRepository) Delete(id uint) error {
	// gorm.Model を使っていると論理削除になる
	return r.db.Delete(&rds.User{}, id).Error
}
