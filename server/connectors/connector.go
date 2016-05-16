package connector

import "github.com/wadahiro/issue-note/server/models"

type Connector interface {
	Sync(syncSetting *model.SyncSetting)
}
