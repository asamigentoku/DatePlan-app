package middleware

import (
	"net/http/httptest"
	"testing"
	"time"

	"github.com/gin-gonic/gin"
	"golang.org/x/time/rate"
)

func TestRateLimiter_BlocksAfterBurst(t *testing.T) {
	gin.SetMode(gin.TestMode)
	r := gin.New()
	r.Use(RateLimiter(rate.Every(time.Minute), 3))
	r.GET("/ping", func(c *gin.Context) { c.String(200, "ok") })

	for i := 1; i <= 3; i++ {
		w := httptest.NewRecorder()
		req := httptest.NewRequest("GET", "/ping", nil)
		req.RemoteAddr = "1.2.3.4:1111"
		r.ServeHTTP(w, req)
		if w.Code != 200 {
			t.Fatalf("request %d: expected 200, got %d", i, w.Code)
		}
	}

	w := httptest.NewRecorder()
	req := httptest.NewRequest("GET", "/ping", nil)
	req.RemoteAddr = "1.2.3.4:1111"
	r.ServeHTTP(w, req)
	if w.Code != 429 {
		t.Fatalf("request 4: expected 429, got %d", w.Code)
	}

	// a different client IP is not affected by the first client's limit.
	w2 := httptest.NewRecorder()
	req2 := httptest.NewRequest("GET", "/ping", nil)
	req2.RemoteAddr = "5.6.7.8:2222"
	r.ServeHTTP(w2, req2)
	if w2.Code != 200 {
		t.Fatalf("other IP: expected 200, got %d", w2.Code)
	}
}
