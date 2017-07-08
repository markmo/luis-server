#!/usr/bin/env bash
docker run -p 49143:8080 -e API_URL=http://aiplatform.host/luis-server/api-docs.json -d swaggerapi/swagger-ui
