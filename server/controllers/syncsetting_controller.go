package controller

import (
	"log"

	"github.com/gin-gonic/gin"
	"github.com/wadahiro/issue-note/server/models"
	"github.com/wadahiro/issue-note/server/services"
)

func SyncSettingIndex(c *gin.Context) {
	repo := getRepo(c)

	result, _ := repo.QueryAllSyncSettings()

	c.JSON(200, result)
}

func SyncSettingCreate(c *gin.Context) {
	var syncSetting model.SyncSetting

	c.Bind(&syncSetting)

	repo := getRepo(c)

	created, err := repo.CreateSyncSetting("", &syncSetting)

	if err != nil {
		log.Println(err)
		c.AbortWithStatus(500)
		return
	}

	// re-schedule all sync
	service.RunSyncScheduler(repo)

	c.JSON(201, created)
}

func SyncSettingRead(c *gin.Context) {
	_id := c.Param("_id")

	repo := getRepo(c)

	issue, _ := repo.ReadSyncSetting(_id)

	c.JSON(200, issue)
}

func SyncSettingUpdate(c *gin.Context) {
	var syncSetting model.SyncSetting

	_id := c.Param("_id")
	_rev := c.Request.Header.Get("If-Match")
	c.Bind(&syncSetting)

	repo := getRepo(c)

	updated, err := repo.UpdateSyncSetting(_id, _rev, &syncSetting)

	if err != nil {
		log.Println(err)
		c.AbortWithStatus(500)
		return
	}

	// re-schedule all sync
	service.RunSyncScheduler(repo)

	c.JSON(200, updated)
}

func SyncSettingDelete(c *gin.Context) {
	_id := c.Param("_id")
	_rev := c.Request.Header.Get("If-Match")

	repo := getRepo(c)

	deleted, err := repo.DeleteSyncSetting(_id, _rev)

	if err != nil {
		log.Println(err)
		c.AbortWithStatus(404)
		return
	}

	// re-schedule all sync
	service.RunSyncScheduler(repo)

	c.JSON(200, deleted)
}

func Sync(c *gin.Context) {
	_id := c.Param("_id")

	repo := getRepo(c)

	syncSetting, err := repo.ReadSyncSetting(_id)
	if err != nil {
		c.AbortWithStatus(404)
		return
	}

	err = service.Sync(repo, syncSetting)
	if err != nil {
		c.AbortWithStatus(500)
	}
}
