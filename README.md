WIP

```shell
docker build -f .\apps\frontend\Dockerfile -t review-insight/front:latest apps/frontend
docker build -f .\apps\backend\Dockerfile -t review-insight/back:latest apps/backend
docker compose up
# Или 
docker compose up --build
```