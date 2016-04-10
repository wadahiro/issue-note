# ISSUE-MEMO

- [About](#about)
- [Development](#development)
 - [Requirements](#requirements)
 - [Setup](#setup)
 - [Run with development mode](#run-with-development-mode)
 - [Release Build](#release-build)
- [License](#license)

## About

Aggregate issues from external [Issue Tracking System (ITS)](https://en.wikipedia.org/wiki/Issue_tracking_system) and add your own memo.
Currently support [Atlassian JIRA](https://jira.atlassian.com) only.

## Development

### Requirements 

* [Golang](http://golang.org/)
* [Node.js](https://nodejs.org/)

### Setup

1. Install some golang tools by `go get`

 ```bash
go get -u github.com/jteeuwen/go-bindata/...
go get -u github.com/elazarl/go-bindata-assetfs/...
go get -u github.com/gin-gonic/gin
go get -u github.com/gin-gonic/contrib/static
go get -u github.com/pilu/fresh
...(TBA)
 ```
2. Install JavaScript dependencies

 ```bash
npm install
 ```

### Run with development mode

1. Generate bindata.go.

 ```bash
npm run bindata
 ```

2. Start webpack and gin with watch mode.

 ```bash
npm run devserver & fresh
 ```
 
3. Open http://localhost:9000

### Release Build

Run webpack with production mode, go-bindata and go build in turn. All you have to do is run `npm run build`. The artifact is created under `./dist` directory.

```bash
npm run build
```

## License

Licensed under the [MIT](/LICENSE.txt) license.
