package controller

import (
	"log"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/wadahiro/issue-memo/server/models"
	"github.com/wadahiro/issue-memo/server/repos"
)

func IssueIndex(c *gin.Context) {
	checked := c.Query("checked")
	keyword := c.Query("keyword")

	repo := getRepo(c)

	query := map[string]string{}

	if checked == "false" {
		query["checked$and$eq"] = "0"
	}

	if keyword != "" {
		query["issueId$or$like"] = "%" + keyword + "%"
		query["summary$or$like"] = "%" + keyword + "%"
		query["description$or$like"] = "%" + keyword + "%"
		query["memo$or$like"] = "%" + keyword + "%"
	}

	result, _ := repo.QueryIssues(query)
	c.JSON(200, result)
}

func IssueCreate(c *gin.Context) {
	var issue model.Issue

	c.Bind(&issue)

	repo := getRepo(c)

	created, _ := repo.CreateIssue("", &issue)

	c.JSON(201, created)
}

func IssueRead(c *gin.Context) {
	_id := c.Param("_id")

	repo := getRepo(c)

	issue, _ := repo.ReadIssue(_id)

	c.JSON(200, issue)
}

func IssueUpdate(c *gin.Context) {
	var issue model.Issue

	_id := c.Param("_id")
	_rev := c.Request.Header.Get("If-Match")
	c.Bind(&issue)

	repo := getRepo(c)

	repo.UpdateIssue(_id, _rev, &issue)

	c.JSON(200, issue)
}

func IssueCheckedUpdate(c *gin.Context) {
	var issueChecked model.IssueChecked

	_id := c.Param("_id")
	_rev := c.Request.Header.Get("If-Match")
	c.Bind(&issueChecked)

	r := getRepo(c)

	issue, err := r.ReadIssue(_id)
	if err != nil {
		log.Println(err)
		c.AbortWithStatus(404)
		return
	}

	issue.Checked = issueChecked.Checked
	issue.CheckedDate = time.Now().Format(repo.JIRA_DATE_FORMAT)

	result, err := r.UpdateIssue(_id, _rev, issue)
	if err != nil {
		c.AbortWithStatus(412)
		return
	}

	c.JSON(200, result)
}

func IssueMemoUpdate(c *gin.Context) {
	var issueMemo model.IssueMemo

	_id := c.Param("_id")
	_rev := c.Request.Header.Get("If-Match")
	c.Bind(&issueMemo)

	repo := getRepo(c)

	issue, err := repo.ReadIssue(_id)
	if err != nil {
		c.AbortWithStatus(404)
		return
	}

	issue.Memo = issueMemo.Memo

	result, err := repo.UpdateIssue(_id, _rev, issue)
	if err != nil {
		c.AbortWithStatus(412)
		return
	}

	c.JSON(200, result)
}

func IssueDelete(c *gin.Context) {
	_id := c.Param("_id")
	_rev := c.Request.Header.Get("If-Match")

	repo := getRepo(c)

	deleted, err := repo.DeleteIssue(_id, _rev)
	if err != nil {
		c.AbortWithStatus(404)
		return		
	}

	c.JSON(200, deleted)
}

func getRepo(c *gin.Context) repo.Repo {
	r, _ := c.Get("repo")
	repo := r.(repo.Repo)

	return repo
}
