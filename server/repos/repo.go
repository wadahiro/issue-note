package repo

import "github.com/wadahiro/issue-memo/server/models"

type Repo interface {
	CreateIssue(_id string, model *model.Issue) (*model.Issue, error)
	ReadIssue(_id string) (*model.Issue, error)
	UpdateIssue(_id string, _rev string, model *model.Issue) (*model.Issue, error)
	DeleteIssue(_id string, _rev string) (*model.Issue, error)
	QueryIssues(query map[string]string) (*QueryIssuesResult, error)
	QueryAllIssues() (*QueryIssuesResult, error)

	CreateSyncSetting(_id string, model *model.SyncSetting) (*model.SyncSetting, error)
	ReadSyncSetting(_id string) (*model.SyncSetting, error)
	UpdateSyncSetting(_id string, _rev string, model *model.SyncSetting) (*model.SyncSetting, error)
	DeleteSyncSetting(_id string, _rev string) (*model.SyncSetting, error)
	QuerySyncSettings(query map[string]string) (*QuerySyncSettingsResult, error)
	QueryAllSyncSettings() (*QuerySyncSettingsResult, error)
	FindByName(name string) (*model.SyncSetting, error)
}

type QueryIssuesResult struct {
	Result []*model.Issue `json:"result"`
}

type QuerySyncSettingsResult struct {
	Result []*model.SyncSetting `json:"result"`
}
