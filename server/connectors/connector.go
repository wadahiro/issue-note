package connector

import "github.com/wadahiro/issue-memo/server/models"

type Connector interface {
	Sync(syncSetting *model.SyncSetting)
}
