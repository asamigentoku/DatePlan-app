package handler

import (
	"net/http"
	"strconv"

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

func (h *UserHandler) List(c *gin.Context) {
	users, err := h.svc.GetAll()
	if err != nil {
		response.InternalError(c)
		return
	}
	response.OK(c, users)
}

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
