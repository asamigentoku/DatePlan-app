package service

import (
	"github.com/asamigentoku/DatePlan-app/internal/model/rds_models"
	"github.com/asamigentoku/DatePlan-app/internal/repository"
)

type UserService interface {
	GetAll() ([]rds_models.User, error)
	GetByID(id uint) (*rds_models.User, error)
	Create(user *rds_models.User) error
	Update(user *rds_models.User) error
	Delete(id uint) error
}

type userService struct {
	repo repository.UserRepository
}

func NewUserService(repo repository.UserRepository) UserService {
	return &userService{repo: repo}
}

func (s *userService) GetAll() ([]rds_models.User, error) {
	return s.repo.FindAll()
}

func (s *userService) GetByID(id uint) (*rds_models.User, error) {
	return s.repo.FindByID(id)
}

func (s *userService) Create(user *rds_models.User) error {
	return s.repo.Create(user)
}

func (s *userService) Update(user *rds_models.User) error {
	return s.repo.Update(user)
}

func (s *userService) Delete(id uint) error {
	return s.repo.Delete(id)
}
