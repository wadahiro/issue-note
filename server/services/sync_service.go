package service

import (
	"fmt"
	"log"
	"sync"

	"github.com/robfig/cron"
	"github.com/wadahiro/issue-memo/server/connectors"
	"github.com/wadahiro/issue-memo/server/models"
	"github.com/wadahiro/issue-memo/server/repos"
)

var mutex = new(sync.Mutex)
var scheduler *cron.Cron

func RunSyncScheduler(repo repo.Repo) {
	mutex.Lock()
	defer mutex.Unlock()

	if scheduler != nil {
		log.Println("Stop sync schduler...")
		scheduler.Stop()
	}
	scheduler = cron.New()

	result, err := repo.QueryAllSyncSettings()
	if err != nil {
		log.Println(err)
		return
	}
	for _, syncSetting := range result.Result {
		cronExpression := "0 0 " + syncSetting.Schedule + " * * *"
		// cronExpression = "0 */1 * * * *"

		log.Printf("Add Job: _id: %s, name: %s, cronExpression: %s\n", syncSetting.ID, syncSetting.Name, cronExpression)

		job := func() {
			Sync(repo, syncSetting)
		}

		scheduler.AddFunc(cronExpression, job)
	}
	scheduler.Start()
	log.Println("Started sync schduler...")
}

func Sync(repo repo.Repo, syncSetting *model.SyncSetting) error {
	log.Println("Start sync: ", syncSetting.ID, syncSetting.Name)
	defer log.Println("End sync: ", syncSetting.ID, syncSetting.Name)

	connector, err := GetConnector(syncSetting, repo)
	if err != nil {
		log.Println(err)
		return err
	}
	connector.Sync(syncSetting)

	return nil
}

func GetConnector(syncSetting *model.SyncSetting, r repo.Repo) (connector.Connector, error) {
	switch syncSetting.Type {
	case "jira":
		return connector.NewJiraConnector(r), nil
	}
	return nil, fmt.Errorf("No connector")
}
