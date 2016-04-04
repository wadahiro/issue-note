package main

import (
	"log"

	"html/template"
	"net/http"
	"strings"

	"github.com/elazarl/go-bindata-assetfs"
	"github.com/gin-gonic/contrib/renders/multitemplate"
	"github.com/gin-gonic/contrib/static"
	"github.com/gin-gonic/gin"
	"github.com/nu7hatch/gouuid"
	"github.com/wadahiro/issue-memo/server/controllers"
	"github.com/wadahiro/issue-memo/server/repos"
)

func initRouter(repo repo.Repo, port string, debugMode bool) {
	if !debugMode {
		gin.SetMode(gin.ReleaseMode)
	}

	r := gin.Default()

	r.Use(gin.Recovery())

	r.Use(func(c *gin.Context) {
		c.Set("repo", repo)
	})

	// r.LoadHTMLGlob("server/templates/*")
	r.HTMLRender = loadTemplates("react.html")

	// We can't use router.Static method to use '/' for static files.
	// see https://github.com/gin-gonic/gin/issues/75
	// r.StaticFS("/", assetFS())

	r.Use(func(c *gin.Context) {
		id, _ := uuid.NewV4()
		c.Set("uuid", id)
	})

	apiPrefix := "/api/v1/"

	// add API routes
	r.GET(apiPrefix+"issues", controller.IssueIndex)
	r.GET(apiPrefix+"issues/:_id", controller.IssueRead)
	r.POST(apiPrefix+"issues", controller.IssueCreate)
	r.DELETE(apiPrefix+"issues/:_id", controller.IssueDelete)

	r.PUT(apiPrefix+"checked/:_id", controller.IssueCheckedUpdate)
	r.PUT(apiPrefix+"memo/:_id", controller.IssueMemoUpdate)

	r.GET(apiPrefix+"syncsettings", controller.SyncSettingIndex)
	r.GET(apiPrefix+"syncsettings/:_id", controller.SyncSettingRead)
	r.POST(apiPrefix+"syncsettings", controller.SyncSettingCreate)
	r.PUT(apiPrefix+"syncsettings/:_id", controller.SyncSettingUpdate)
	r.DELETE(apiPrefix+"syncsettings/:_id", controller.SyncSettingDelete)

	r.POST(apiPrefix+"sync/:_id", controller.Sync)

	// react server-side rendering
	react := NewReact(
		"assets/js/bundle.js",
		debugMode,
		r,
	)
	r.GET("/", react.Handle)
	r.GET("/issues", react.Handle)

	r.Use(static.Serve("/", BinaryFileSystem("assets")))

	r.Run(":" + port)
}

func loadTemplates(list ...string) multitemplate.Render {
	r := multitemplate.New()

	for _, x := range list {
		templateString, err := Asset("server/templates/" + x)
		if err != nil {
			log.Fatal(err)
		}

		tmplMessage, err := template.New(x).Parse(string(templateString))
		if err != nil {
			log.Fatal(err)
		}

		r.Add(x, tmplMessage)
	}

	return r
}

type binaryFileSystem struct {
	fs http.FileSystem
}

func (b *binaryFileSystem) Open(name string) (http.File, error) {
	return b.fs.Open(name)
}

func (b *binaryFileSystem) Exists(prefix string, filepath string) bool {
	if p := strings.TrimPrefix(filepath, prefix); len(p) < len(filepath) {
		if _, err := b.fs.Open(p); err != nil {
			return false
		}
		return true
	}
	return false
}

func BinaryFileSystem(root string) *binaryFileSystem {
	fs := &assetfs.AssetFS{Asset, AssetDir, AssetInfo, root}
	return &binaryFileSystem{
		fs,
	}
}
