# run from main folder
# npm run build

cd .dev
# Copy-Item -Path ".\..\dist\*" -Destination ".\pb_public" -Recurse -Force

docker build -f pocketbase.dockerfile -t dev-psm-backend .
docker run -it -p 8090:8090 -v $PWD/pb_data:/pb/pb_data -v $PWD/pb_public:/pb/pb_public dev-psm-backend