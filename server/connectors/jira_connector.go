package connector

import (
	"crypto/tls"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"

	"github.com/wadahiro/issue-note/server/models"
	"github.com/wadahiro/issue-note/server/repos"
)

type JiraResponse struct {
	StartAt    int         `json:"startAt"`
	MaxResults int         `json:"maxResults"`
	Total      int         `json:"total"`
	Issues     []JiraIssue `json:"issues"`
}
type JiraIssue struct {
	Key    string    `json:"key"`
	Fields JiraField `json:"fields"`
}
type JiraField struct {
	Summary     string          `json:"summary"`
	Description string          `json:"description"`
	Created     string          `json:"created"`
	Updated     string          `json:"updated"`
	Priority    JiraPriority    `json:"priority"`
	Versions    []JiraVersion   `json:"versions"`
	Components  []JiraComponent `json:"components"`
	Creator     JiraCreator     `json:"creator"`
	Assignee    JiraAssignee    `json:"assignee"`
	Status      JiraStatus      `json:"status"`
}
type JiraPriority struct {
	Name string `json:"name"`
}
type JiraVersion struct {
	Name string `json:"name"`
}
type JiraComponent struct {
	Name string `json:"name"`
}
type JiraCreator struct {
	Name         string `json:"name"`
	EmailAddress string `json:"emailAddress"`
	DisplayName  string `json:"displayName"`
}
type JiraAssignee struct {
	Name         string `json:"name"`
	EmailAddress string `json:"emailAddress"`
	DisplayName  string `json:"displayName"`
}
type JiraStatus struct {
	Name string `json:"name"`
}

type JiraConnector struct {
	repo repo.Repo
}

func NewJiraConnector(repo repo.Repo) Connector {
	s := &JiraConnector{repo: repo}
	return s
}

func newClient(insecure bool) *http.Client {
	tr := &http.Transport{
		TLSClientConfig: &tls.Config{InsecureSkipVerify: insecure},
		Proxy:           http.DefaultTransport.(*http.Transport).Proxy,
	}
	return &http.Client{Transport: tr}
}

func (this *JiraConnector) Sync(syncSetting *model.SyncSetting) {
	client := newClient(syncSetting.InsecureSkipVerify)
	resp, err := client.Get(syncSetting.FetchURL)
	if err != nil {
		fmt.Println(err)
		return
	}
	defer resp.Body.Close()

	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		fmt.Println(err)
		return
	}

	output := JiraResponse{}
	err = json.Unmarshal(body, &output)

	for _, jiraIssue := range output.Issues {

		issue := &model.Issue{
			SyncSettingID: syncSetting.ID,
			IssueID:       jiraIssue.Key,
			Summary:       jiraIssue.Fields.Summary,
			Description:   jiraIssue.Fields.Description,
			Created:       jiraIssue.Fields.Created,
			Updated:       jiraIssue.Fields.Updated,
			Checked:       false,
			CheckedDate:   "",
			Memo:          "",
		}

		_id := syncSetting.ID + ":" + jiraIssue.Key

		exists, _ := this.repo.ReadIssue(_id)
		if exists == nil {
			_, err := this.repo.CreateIssue(_id, issue)
			if err != nil {
				fmt.Println("Error:", err)
			}
		} else {
			// Patch
			issue.Checked = exists.Checked
			issue.CheckedDate = exists.CheckedDate
			issue.Memo = exists.Memo
			_, err := this.repo.UpdateIssue(_id, exists.Rev, issue)
			if err != nil {
				fmt.Println("Error:", err)
			}
		}
	}
}
