package middlewares

import (
	"time"

	"backend/utils"
	"github.com/gin-gonic/gin"
)

func MetricsMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()

		// Process the request
		c.Next()

		duration := time.Since(start).Seconds()
		endpoint := c.FullPath()
		if endpoint == "" {
			endpoint = "unknown"
		}

		utils.ApiRequestCounter.WithLabelValues(endpoint, c.Request.Method).Inc()
		utils.RequestDurationHistogram.WithLabelValues(endpoint).Observe(duration)
	}
}
