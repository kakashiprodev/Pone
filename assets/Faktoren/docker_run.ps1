docker build -t pone-upload-factors .
docker run -v ${PWD}/import:/app/import pone-upload-factors