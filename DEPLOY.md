# 🚀 DTS Deployment Guide

## Achir Bayron LLC - Delivery Tracking System

---

## 📋 Prerequisites

- Docker & Docker Compose installed
- Git
- Domain name (for production)
- SSL certificate (for HTTPS)

---

## 🏃 Quick Start (Development)

```bash
# Clone the repository
git clone <repository-url>
cd DTS-monorepo

# Copy environment file
cp .env.example .env

# Edit .env with your values
nano .env

# Start all services
docker-compose up -d

# Check logs
docker-compose logs -f
```

**Access:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:4000
- Health Check: http://localhost:4000/health

---

## 🌐 Production Deployment

### Step 1: Configure Environment

```bash
# Create production .env file
cat > .env << EOF
# Database
DB_USER=dts_user
DB_PASSWORD=$(openssl rand -base64 32)
DB_NAME=dts_production

# JWT Secret (minimum 32 characters)
JWT_SECRET=$(openssl rand -base64 64)

# API URL (your domain)
NEXT_PUBLIC_API_URL=https://api.yourdomain.com

# Environment
NODE_ENV=production
EOF
```

### Step 2: SSL Certificates

Place your SSL certificates in `nginx/ssl/`:
```bash
mkdir -p nginx/ssl
cp /path/to/fullchain.pem nginx/ssl/
cp /path/to/privkey.pem nginx/ssl/
```

### Step 3: Update Nginx Config

Edit `nginx/nginx.conf`:
- Uncomment HTTPS server block
- Replace `your-domain.com` with your actual domain

### Step 4: Deploy with Nginx

```bash
# Deploy with nginx profile
docker-compose --profile production up -d

# Or build fresh
docker-compose --profile production up -d --build
```

---

## 🔧 Management Commands

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

### Restart Services
```bash
docker-compose restart

# Single service
docker-compose restart backend
```

### Rebuild and Deploy
```bash
docker-compose down
docker-compose up -d --build
```

### Database Operations
```bash
# Access database
docker-compose exec postgres psql -U postgres -d dts_db

# Run migrations manually
docker-compose exec backend npx prisma migrate deploy

# Seed database
docker-compose exec backend npx prisma db seed
```

### Backup Database
```bash
# Create backup
docker-compose exec postgres pg_dump -U postgres dts_db > backup_$(date +%Y%m%d).sql

# Restore backup
docker-compose exec -T postgres psql -U postgres dts_db < backup_20241208.sql
```

---

## 📊 Monitoring

### Health Checks
```bash
# Backend health
curl http://localhost:4000/health

# All containers status
docker-compose ps
```

### Resource Usage
```bash
docker stats
```

---

## 🔐 Security Checklist

- [ ] Change default database password
- [ ] Set strong JWT_SECRET (minimum 64 characters)
- [ ] Enable HTTPS with valid SSL certificate
- [ ] Configure firewall (only ports 80/443 open)
- [ ] Set up regular database backups
- [ ] Enable rate limiting in nginx
- [ ] Review CORS settings for production domain

---

## 🌍 Cloud Deployment Options

### AWS
```bash
# Install Docker on EC2
sudo yum update -y
sudo yum install docker -y
sudo service docker start
sudo usermod -a -G docker ec2-user

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### DigitalOcean
```bash
# Use Docker Droplet or install manually
doctl compute droplet create dts-server \
  --image docker-20-04 \
  --size s-2vcpu-4gb \
  --region nyc1
```

### Railway / Render / Fly.io
These platforms support Docker deployment directly. Push your code and they'll build from Dockerfile.

---

## 📞 Default Login Credentials

After initial deployment and seeding:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@dts.local | password123 |

**⚠️ IMPORTANT: Change these credentials immediately after first login!**

---

## 🐛 Troubleshooting

### Container won't start
```bash
# Check logs
docker-compose logs backend

# Common issues:
# - Database not ready: Wait for postgres healthcheck
# - Missing env vars: Check .env file
# - Port conflict: Change ports in docker-compose.yml
```

### Database connection error
```bash
# Ensure postgres is healthy
docker-compose ps postgres

# Test connection
docker-compose exec postgres pg_isready
```

### Frontend can't reach API
```bash
# Check NEXT_PUBLIC_API_URL in .env
# Ensure backend is running
curl http://localhost:4000/health
```

---

## 📁 Project Structure

```
DTS-monorepo/
├── backend/
│   ├── Dockerfile
│   ├── prisma/
│   └── src/
├── frontend/
│   ├── Dockerfile
│   └── src/
├── nginx/
│   ├── nginx.conf
│   └── ssl/
├── docker-compose.yml
├── .env.example
└── DEPLOY.md
```

---

## 🔄 CI/CD (Optional)

### GitHub Actions Example
```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.HOST }}
          username: ${{ secrets.USERNAME }}
          key: ${{ secrets.SSH_KEY }}
          script: |
            cd /app/DTS-monorepo
            git pull
            docker-compose up -d --build
```

---

**🎉 Happy Deploying!**
