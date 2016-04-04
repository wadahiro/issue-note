package main

import (
	"log"
	"os"

	"strconv"

	"github.com/codegangsta/cli"
	"github.com/wadahiro/issue-memo/server/repos"
	"github.com/wadahiro/issue-memo/server/services"
)

var CommitHash = "WORKSPACE" // inject by LDFLAGS build option
var Version = "SNAPSHOT"     // inject by LDFLAGS build option
var BuildTarget = "develop"  // inject by LDFLAGS build option

const DATA_DIR = "./data"

func main() {
	if BuildTarget == "develop" {
		RunServer(nil)
	} else {
		app := cli.NewApp()
		app.Name = "ISSUE-MEMO"
		app.Version = Version
		app.Usage = ""
		app.Author = "Hiroyuki Wada"
		app.Email = "wadahiro@gmail.com"
		app.Commands = []cli.Command{
			{
				Name:   "run",
				Usage:  "Runs issue-memo server",
				Action: RunServer,
			},
		}
		app.Flags = []cli.Flag{
			cli.IntFlag{
				Name:  "port",
				Value: 3000,
				Usage: "port number",
			},
		}
		app.Run(os.Args)
	}
}

func RunServer(c *cli.Context) {
	log.Println("COMMIT_HASH: ", CommitHash)
	log.Println("VERSION: ", Version)

	if err := os.MkdirAll(DATA_DIR, 0644); err != nil {
		log.Fatalln(err)
	}
	repo := repo.InitSQLite(DATA_DIR)
	service.RunSyncScheduler(repo)

	debugMode := false
	if BuildTarget == "develop" {
		debugMode = true
	}

	port := "3000"
	if c != nil && c.GlobalInt("port") != 0 {
		port = strconv.Itoa(c.GlobalInt("port"))
	}
	initRouter(repo, port, debugMode)

	log.Println("Started ISSUE-MEMO")
}
