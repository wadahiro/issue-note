package model

type SyncSetting struct {
	ID          string `json:"_id"`
	Rev         string `json:"_rev"`
	Name        string `json:"name"`
	Type        string `json:"type"`
	FetchURL    string `json:"fetchUrl"`
	Schedule    string `json:"schedule"`
	IssueURL    string `json:"issueUrl"`
	Description string `json:"description"`
}
