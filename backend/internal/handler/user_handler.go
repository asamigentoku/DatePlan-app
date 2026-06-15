package handler

import (
	"net/http"
	"strconv"

	_ "github.com/asamigentoku/DatePlan-app/internal/dto"
	"github.com/asamigentoku/DatePlan-app/internal/model/rds_models"
	"github.com/asamigentoku/DatePlan-app/internal/service"
	"github.com/asamigentoku/DatePlan-app/pkg/response"
	"github.com/gin-gonic/gin"
)

type UserHandler struct {
	svc service.UserService
}

func NewUserHandler(svc service.UserService) *UserHandler {
	return &UserHandler{svc: svc}
}

// List godoc
// @Summary      ユーザー一覧取得
// @Tags         users
// @Produce      json
// @Success      200  {array}   dto.UserResponse
// @Failure      500  {object}  map[string]string
// @Security     BearerAuth
// @Router       /users [get]
func (h *UserHandler) List(c *gin.Context) {
	users, err := h.svc.GetAll()
	if err != nil {
		response.InternalError(c)
		return
	}
	response.OK(c, users)
}

// Get godoc
// @Summary      ユーザー取得
// @Tags         users
// @Produce      json
// @Param        id   path      int  true  "ユーザーID"
// @Success      200  {object}  dto.UserResponse
// @Failure      400  {object}  map[string]string
// @Failure      404  {object}  map[string]string
// @Failure      500  {object}  map[string]string
// @Security     BearerAuth
// @Router       /users/{id} [get]
func (h *UserHandler) Get(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		response.BadRequest(c, "invalid id")
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

// Create godoc
// @Summary      ユーザー作成
// @Tags         users
// @Accept       json
// @Produce      json
// @Param        request body dto.CreateUserRequest true "ユーザー情報"
// @Success      201  {object}  dto.UserResponse
// @Failure      400  {object}  map[string]string
// @Failure      500  {object}  map[string]string
// @Security     BearerAuth
// @Router       /users [post]
func (h *UserHandler) Create(c *gin.Context) {
	var user rds_models.User
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

// Update godoc
// @Summary      ユーザー更新
// @Tags         users
// @Accept       json
// @Produce      json
// @Param        id      path      int                    true  "ユーザーID"
// @Param        request body      dto.CreateUserRequest  true  "ユーザー情報"
// @Success      200  {object}  dto.UserResponse
// @Failure      400  {object}  map[string]string
// @Failure      500  {object}  map[string]string
// @Security     BearerAuth
// @Router       /users/{id} [put]
func (h *UserHandler) Update(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		response.BadRequest(c, "invalid id")
		return
	}
	var user rds_models.User
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

// Delete godoc
// @Summary      ユーザー削除
// @Tags         users
// @Param        id   path      int  true  "ユーザーID"
// @Success      204
// @Failure      400  {object}  map[string]string
// @Failure      500  {object}  map[string]string
// @Security     BearerAuth
// @Router       /users/{id} [delete]
func (h *UserHandler) Delete(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		response.BadRequest(c, "invalid id")
		return
	}
	if err := h.svc.Delete(uint(id)); err != nil {
		response.InternalError(c)
		return
	}
	c.Status(http.StatusNoContent)
}
