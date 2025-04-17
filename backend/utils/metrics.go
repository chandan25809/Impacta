package utils

import (
	"github.com/prometheus/client_golang/prometheus"
)

var (
	ApiRequestCounter = prometheus.NewCounterVec(
		prometheus.CounterOpts{
			Name: "api_requests_total",
			Help: "Total number of requests by endpoint and method",
		},
		[]string{"endpoint", "method"},
	)

	RequestDurationHistogram = prometheus.NewHistogramVec(
		prometheus.HistogramOpts{
			Name:    "api_request_duration_seconds",
			Help:    "Histogram of response time for handler",
			Buckets: prometheus.DefBuckets,
		},
		[]string{"endpoint"},
	)
)

func InitMetrics() {
	prometheus.MustRegister(ApiRequestCounter)
	prometheus.MustRegister(RequestDurationHistogram)
}
