#!/bin/bash
set -e

# ============================================================
#  Gin + GORM コード生成スクリプト（環境構築済み前提）
#  既存ファイルはスキップします
#
#  Usage: bash gen_code.sh <module-path>
#  Example: bash gen_code.sh github.com/yourname/myapp
#
#  backend/ ディレクトリ内で実行してください
# ============================================================

if [ $# -lt 1 ]; then
  echo "Usage: $0 <module-path>"
  echo "Example: $0 github.com/yourname/myapp"
  exit 1
fi

MODULE_PATH="$1"
SKIPPED=()
CREATED=()

# 既存ファイルはスキップして書き込む関数
write_file() {
  local path="$1"
  local content="$2"

  if [ -f "$path" ]; then
    SKIPPED+=("$path")
    return
  fi

  mkdir -p "$(dirname "$path")"
  printf '%s\n' "$content" > "$path"
  CREATED+=("$path")
}

echo "📝 Generating code files for module: $MODULE_PATH"
echo ""

# ============================================================
# pkg/config/config.go
# ============================================================
write_file "pkg/config/config.go" 'package config

import (
	"github.com/joho/godotenv"
	"github.com/spf13/viper"
)

type Config struct {
	Env       string
	Port      string
	DBUrl     string
	JWTSecret string
}

func Load() (*Config, error) {
	_ = godotenv.Load()

	viper.SetDefault("ENV", "development")
	viper.SetDefault("PORT", "8080")
	viper.AutomaticEnv()

	return &Config{
		Env:       viper.GetString("ENV"),
		Port:      viper.GetString("PORT"),
		DBUrl:     viper.GetString("DATABASE_URL"),
		JWTSecret: viper.GetString("JWT_SECRET"),
	}, nil
}'

# ============================================================
# pkg/logger/logger.go
# ============================================================
write_file "pkg/logger/logger.go" 'package logger

import (
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
)

var Log *zap.Logger

func Init(env string) error {
	var cfg zap.Config
	if env == "production" {
		cfg = zap.NewProductionConfig()
	} else {
		cfg = zap.NewDevelopmentConfig()
		cfg.EncoderConfig.EncodeLevel = zapcore.CapitalColorLevelEncoder
	}

	var err error
	Log, err = cfg.Build()
	return err
}'

# ============================================================
# pkg/response/response.go
# ============================================================
write_file "pkg/response/response.go" 'package response

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

type Response struct {
	Success bool        `json:"success"`
	Data    interface{} `json:"data,omitempty"`
	Error   string      `json:"error,omitempty"`
}

func OK(c *gin.Context, data interface{}) {
	c.JSON(http.StatusOK, Response{Success: true, Data: data})
}

func Created(c *gin.Context, data interface{}) {
	c.JSON(http.StatusCreated, Response{Success: true, Data: data})
}

func BadRequest(c *gin.Context, err string) {
	c.JSON(http.StatusBadRequest, Response{Success: false, Error: err})
}

func Unauthorized(c *gin.Context) {
	c.JSON(http.StatusUnauthorized, Response{Success: false, Error: "unauthorized"})
}

func NotFound(c *gin.Context) {
	c.JSON(http.StatusNotFound, Response{Success: false, Error: "not found"})
}

func InternalError(c *gin.Context) {
	c.JSON(http.StatusInternalServerError, Response{Success: false, Error: "internal server error"})
}'

# ============================================================
# pkg/database/database.go
# ============================================================
write_file "pkg/database/database.go" "package database

import (
	\"fmt\"
	\"time\"

	\"gorm.io/driver/postgres\"
	\"gorm.io/gorm\"
	\"gorm.io/gorm/logger\"
	\"${MODULE_PATH}/internal/model\"
	\"${MODULE_PATH}/pkg/config\"
)

func Connect(cfg *config.Config) (*gorm.DB, error) {
	gormCfg := &gorm.Config{}
	if cfg.Env != \"production\" {
		gormCfg.Logger = logger.Default.LogMode(logger.Info)
	}

	db, err := gorm.Open(postgres.Open(cfg.DBUrl), gormCfg)
	if err != nil {
		return nil, fmt.Errorf(\"failed to connect database: %w\", err)
	}

	sqlDB, err := db.DB()
	if err != nil {
		return nil, err
	}
	sqlDB.SetMaxIdleConns(10)
	sqlDB.SetMaxOpenConns(100)
	sqlDB.SetConnMaxLifetime(time.Hour)

	return db, nil
}

func Migrate(db *gorm.DB) error {
	return db.AutoMigrate(
		&model.User{},
		// 追加モデルをここに列挙する
	)
}"

# ============================================================
# internal/model/user.go
# ============================================================
write_file "internal/model/user.go" 'package model

import "gorm.io/gorm"

// gorm.Model を埋め込むと ID/CreatedAt/UpdatedAt/DeletedAt が自動付与される
type User struct {
	gorm.Model
	Name     string `json:"name"  gorm:"not null"`
	Email    string `json:"email" gorm:"uniqueIndex;not null"`
	Password string `json:"-"     gorm:"not null"`
}'

# ============================================================
# internal/repository/user_repository.go
# ============================================================
write_file "internal/repository/user_repository.go" "package repository

import (
	\"errors\"

	\"gorm.io/gorm\"
	\"${MODULE_PATH}/internal/model\"
)

type UserRepository interface {
	FindAll() ([]model.User, error)
	FindByID(id uint) (*model.User, error)
	Create(user *model.User) error
	Update(user *model.User) error
	Delete(id uint) error
}

type userRepository struct {
	db *gorm.DB
}

func NewUserRepository(db *gorm.DB) UserRepository {
	return &userRepository{db: db}
}

func (r *userRepository) FindAll() ([]model.User, error) {
	var users []model.User
	err := r.db.Find(&users).Error
	return users, err
}

func (r *userRepository) FindByID(id uint) (*model.User, error) {
	var user model.User
	err := r.db.First(&user, id).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, nil
	}
	return &user, err
}

func (r *userRepository) Create(user *model.User) error {
	return r.db.Create(user).Error
}

func (r *userRepository) Update(user *model.User) error {
	return r.db.Save(user).Error
}

func (r *userRepository) Delete(id uint) error {
	// gorm.Model を使っていると論理削除になる
	return r.db.Delete(&model.User{}, id).Error
}"

# ============================================================
# internal/service/user_service.go
# ============================================================
write_file "internal/service/user_service.go" "package service

import (
	\"${MODULE_PATH}/internal/model\"
	\"${MODULE_PATH}/internal/repository\"
)

type UserService interface {
	GetAll() ([]model.User, error)
	GetByID(id uint) (*model.User, error)
	Create(user *model.User) error
	Update(user *model.User) error
	Delete(id uint) error
}

type userService struct {
	repo repository.UserRepository
}

func NewUserService(repo repository.UserRepository) UserService {
	return &userService{repo: repo}
}

func (s *userService) GetAll() ([]model.User, error) {
	return s.repo.FindAll()
}

func (s *userService) GetByID(id uint) (*model.User, error) {
	return s.repo.FindByID(id)
}

func (s *userService) Create(user *model.User) error {
	return s.repo.Create(user)
}

func (s *userService) Update(user *model.User) error {
	return s.repo.Update(user)
}

func (s *userService) Delete(id uint) error {
	return s.repo.Delete(id)
}"

# ============================================================
# internal/handler/health_handler.go
# ============================================================
write_file "internal/handler/health_handler.go" 'package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func Health(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"status": "ok"})
}'

# ============================================================
# internal/handler/user_handler.go
# ============================================================
write_file "internal/handler/user_handler.go" "package handler

import (
	\"net/http\"
	\"strconv\"

	\"github.com/gin-gonic/gin\"
	\"${MODULE_PATH}/internal/model\"
	\"${MODULE_PATH}/internal/service\"
	\"${MODULE_PATH}/pkg/response\"
)

type UserHandler struct {
	svc service.UserService
}

func NewUserHandler(svc service.UserService) *UserHandler {
	return &UserHandler{svc: svc}
}

func (h *UserHandler) List(c *gin.Context) {
	users, err := h.svc.GetAll()
	if err != nil {
		response.InternalError(c)
		return
	}
	response.OK(c, users)
}

func (h *UserHandler) Get(c *gin.Context) {
	id, err := strconv.Atoi(c.Param(\"id\"))
	if err != nil {
		response.BadRequest(c, \"invalid id\")
		return
	}
	user, err := h.svc.GetByID(uint(id))
	if err != nil {
		response.InternalError(c)
		return
	}
	if user == nil {
		response.NotFound(c)
		return
	}
	response.OK(c, user)
}

func (h *UserHandler) Create(c *gin.Context) {
	var user model.User
	if err := c.ShouldBindJSON(&user); err != nil {
		response.BadRequest(c, err.Error())
		return
	}
	if err := h.svc.Create(&user); err != nil {
		response.InternalError(c)
		return
	}
	response.Created(c, user)
}

func (h *UserHandler) Update(c *gin.Context) {
	id, err := strconv.Atoi(c.Param(\"id\"))
	if err != nil {
		response.BadRequest(c, \"invalid id\")
		return
	}
	var user model.User
	if err := c.ShouldBindJSON(&user); err != nil {
		response.BadRequest(c, err.Error())
		return
	}
	user.ID = uint(id)
	if err := h.svc.Update(&user); err != nil {
		response.InternalError(c)
		return
	}
	response.OK(c, user)
}

func (h *UserHandler) Delete(c *gin.Context) {
	id, err := strconv.Atoi(c.Param(\"id\"))
	if err != nil {
		response.BadRequest(c, \"invalid id\")
		return
	}
	if err := h.svc.Delete(uint(id)); err != nil {
		response.InternalError(c)
		return
	}
	c.Status(http.StatusNoContent)
}"

# ============================================================
# internal/middleware/logger.go
# ============================================================
write_file "internal/middleware/logger.go" "package middleware

import (
	\"time\"

	\"github.com/gin-gonic/gin\"
	\"go.uber.org/zap\"
	\"${MODULE_PATH}/pkg/logger\"
)

func Logger() gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()
		c.Next()
		logger.Log.Info(\"request\",
			zap.String(\"method\", c.Request.Method),
			zap.String(\"path\", c.Request.URL.Path),
			zap.Int(\"status\", c.Writer.Status()),
			zap.Duration(\"latency\", time.Since(start)),
		)
	}
}"

# ============================================================
# internal/middleware/auth.go
# ============================================================
write_file "internal/middleware/auth.go" "package middleware

import (
	\"strings\"

	\"github.com/gin-gonic/gin\"
	\"github.com/golang-jwt/jwt/v5\"
	\"${MODULE_PATH}/pkg/response\"
)

func Auth(secret string) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader(\"Authorization\")
		if authHeader == \"\" || !strings.HasPrefix(authHeader, \"Bearer \") {
			response.Unauthorized(c)
			c.Abort()
			return
		}

		tokenStr := strings.TrimPrefix(authHeader, \"Bearer \")
		token, err := jwt.Parse(tokenStr, func(t *jwt.Token) (interface{}, error) {
			if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, jwt.ErrSignatureInvalid
			}
			return []byte(secret), nil
		})
		if err != nil || !token.Valid {
			response.Unauthorized(c)
			c.Abort()
			return
		}

		if claims, ok := token.Claims.(jwt.MapClaims); ok {
			c.Set(\"userID\", claims[\"sub\"])
		}

		c.Next()
	}
}"

# ============================================================
# internal/middleware/cors.go
# ============================================================
write_file "internal/middleware/cors.go" 'package middleware

import "github.com/gin-gonic/gin"

func CORS() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Origin, Content-Type, Authorization")
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	}
}'

# ============================================================
# internal/router/router.go
# ============================================================
write_file "internal/router/router.go" "package router

import (
	\"github.com/gin-gonic/gin\"
	\"gorm.io/gorm\"
	\"${MODULE_PATH}/internal/handler\"
	\"${MODULE_PATH}/internal/middleware\"
	\"${MODULE_PATH}/internal/repository\"
	\"${MODULE_PATH}/internal/service\"
	\"${MODULE_PATH}/pkg/config\"
)

func New(cfg *config.Config, db *gorm.DB) *gin.Engine {
	if cfg.Env == \"production\" {
		gin.SetMode(gin.ReleaseMode)
	}

	r := gin.New()
	r.Use(gin.Recovery())
	r.Use(middleware.Logger())
	r.Use(middleware.CORS())

	r.GET(\"/health\", handler.Health)

	// DI: repository → service → handler
	userRepo := repository.NewUserRepository(db)
	userSvc  := service.NewUserService(userRepo)
	userH    := handler.NewUserHandler(userSvc)

	v1 := r.Group(\"/api/v1\")
	{
		users := v1.Group(\"/users\")
		users.Use(middleware.Auth(cfg.JWTSecret))
		{
			users.GET(\"\",        userH.List)
			users.GET(\"/:id\",    userH.Get)
			users.POST(\"\",       userH.Create)
			users.PUT(\"/:id\",    userH.Update)
			users.DELETE(\"/:id\", userH.Delete)
		}
	}

	return r
}"

# ============================================================
# cmd/server/main.go
# ============================================================
write_file "cmd/server/main.go" "package main

import (
	\"log\"

	\"${MODULE_PATH}/internal/router\"
	\"${MODULE_PATH}/pkg/config\"
	\"${MODULE_PATH}/pkg/database\"
	\"${MODULE_PATH}/pkg/logger\"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatal(\"Failed to load config:\", err)
	}

	if err := logger.Init(cfg.Env); err != nil {
		log.Fatal(\"Failed to init logger:\", err)
	}
	defer logger.Log.Sync()

	db, err := database.Connect(cfg)
	if err != nil {
		log.Fatal(\"Failed to connect database:\", err)
	}

	if err := database.Migrate(db); err != nil {
		log.Fatal(\"Failed to migrate database:\", err)
	}

	r := router.New(cfg, db)
	if err := r.Run(\":\" + cfg.Port); err != nil {
		log.Fatal(\"Failed to run server:\", err)
	}
}"

# ============================================================
# 結果サマリー
# ============================================================
echo ""
echo "✅ Done!"
echo ""

if [ ${#CREATED[@]} -gt 0 ]; then
  echo "📄 Created (${#CREATED[@]} files):"
  for f in "${CREATED[@]}"; do
    echo "   + $f"
  done
fi

if [ ${#SKIPPED[@]} -gt 0 ]; then
  echo ""
  echo "⏭️  Skipped (already exists, ${#SKIPPED[@]} files):"
  for f in "${SKIPPED[@]}"; do
    echo "   - $f"
  done
fi

echo ""
echo "Next: go mod tidy && go run ./cmd/server"
