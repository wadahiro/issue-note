#!/bin/sh

export COMMIT_HASH=$(git rev-parse HEAD)
export VERSION=`node -pe 'require("./package.json").version'`
export NODE_ENV=production

echo "Build $VERSION ($COMMIT_HASH) for $NODE_ENV"

# build client
node-sass client/css/main.scss assets/css/style.css
webpack -p --config ./client/webpack/webpack.config.js

# generate bindata for client assets
vendor/bin/go-bindata -o ./server/bindata.go assets/... ./server/templates/... 

# build server
vendor/bin/gox -cgo \
 -ldflags "-X main.CommitHash=$COMMIT_HASH -X main.Version=$VERSION -X main.BuildTarget=production" \
 -osarch="$1" \
 -output=dist/issue-memo-${VERSION}-{{.OS}}-{{.Arch}} \
 ./server/...

