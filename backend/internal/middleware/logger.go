package middleware

import (
	"time"

	"github.com/asamigentoku/DatePlan-app/pkg/logger"
	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

func Logger() gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()
		c.Next()

		status := c.Writer.Status()
		fields := []zap.Field{
			zap.String("method", c.Request.Method),
			zap.String("path", c.Request.URL.Path),
			zap.Int("status", status),
			zap.Duration("latency", time.Since(start)),
			zap.String("ip", c.ClientIP()),
		}

		switch {
		case status >= 500:
			logger.Log.Error("request", fields...)
		case status >= 400:
			logger.Log.Warn("request", fields...)
		default:
			logger.Log.Info("request", fields...)
		}
	}
}
