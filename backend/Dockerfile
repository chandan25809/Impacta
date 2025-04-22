FROM golang:1.23-alpine

WORKDIR /app

COPY go.mod ./
COPY go.sum ./
RUN go mod download

COPY . .

RUN go build -o impacta-backend main.go

EXPOSE 8080

CMD ["./impacta-backend"]
