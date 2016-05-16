package repo

import (
	"database/sql"
	"fmt"
	"log"
	"strconv"
	"strings"

	"time"

	_ "github.com/mattn/go-sqlite3"
	"github.com/nu7hatch/gouuid"

	"github.com/wadahiro/issue-note/server/models"
)

// TODO
const JIRA_DATE_FORMAT = "2006-01-02T15:04:05.000-0700"

func InitSQLite(dataDir string) Repo {
	db, err := sql.Open("sqlite3", dataDir+"/issue-note.db")
	if err != nil {
		log.Fatal(err)
	}

	// create table if not exists
	sqlStmt := `
	create table if not exists syncsettings (
		_id text not null primary key,
		_rev text not null,
		name text not null,
		type text not null,
		fetchUrl text not null,
		insecureSkipVerify integer not null,
		schedule text not null,
		issueUrl text not null,
		description text
	);
	create index if not exists syncsettings_rev_index on syncsettings (
		_rev
	);
	create index if not exists syncsettings_name_index on syncsettings (
		name
	);
	
	create table if not exists issues (
		_id text not null primary key,
		_rev text not null,
		syncsetting_id text not null,
		issueId text not null,
		summary text not null,
		description text,
		created timestamp not null,
		updated timestamp not null,
		checked integer not null,
		checkedDate timestamp not null,
		memo text
	);
	create index if not exists issues_rev_index on issues (
		_rev
	);
	create index if not exists issues_syncsetting_id_index on issues (
		syncsetting_id
	);
	create index if not exists issues_issueId_index on issues (
		issueId
	);
	create index if not exists issues_summary_index on issues (
		summary
	);
	create index if not exists issues_description_index on issues (
		description
	);
	create index if not exists issues_created_index on issues (
		created
	);
	create index if not exists issues_updated_index on issues (
		updated
	);
	create index if not exists issues_checked_index on issues (
		checked
	);
	create index if not exists issues_checkedDate_index on issues (
		checkedDate
	);
	create index if not exists issues_memo_index on issues (
		memo
	);
	`

	_, err = db.Exec(sqlStmt)

	if err != nil {
		log.Fatal(err)
	}

	repo := &RepoSQLiteImpl{Conn: db}
	return repo
}

type RepoSQLiteImpl struct {
	Conn *sql.DB `inject:""`
}

func (this *RepoSQLiteImpl) CreateIssue(_id string, model *model.Issue) (*model.Issue, error) {
	db := this.Conn

	if _id != "" {
		model.ID = _id
	} else {
		u, _ := uuid.NewV4()
		model.ID = u.String()
	}
	model.Rev = "0"

	sql := "insert into issues values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
	stmt, err := db.Prepare(sql)
	if err != nil {
		log.Printf("%q: %s\n", err, sql)
		return nil, err
	}
	defer stmt.Close()

	createdTime, _ := time.Parse(JIRA_DATE_FORMAT, model.Created)
	updatedTime, _ := time.Parse(JIRA_DATE_FORMAT, model.Updated)
	checkedDateTime, _ := time.Parse(JIRA_DATE_FORMAT, model.CheckedDate)

	// log.Println("created: ", model.Created, createdTime)

	_, err = stmt.Exec(
		model.ID,
		model.Rev,
		model.SyncSettingID,
		model.IssueID,
		model.Summary,
		model.Description,
		createdTime,
		updatedTime,
		model.Checked,
		checkedDateTime,
		model.Memo,
	)
	if err != nil {
		return nil, err
	}

	// log.Println("created", model)
	return model, nil
}

func (this *RepoSQLiteImpl) ReadIssue(_id string) (*model.Issue, error) {
	db := this.Conn

	sql := `
	select
		i._id, i._rev, s.name, i.syncsetting_id, i.issueId, i.summary, i.description, i.created, i.updated, i.checked, i.checkedDate, i.memo 
	from issues i, syncsettings s
	where i._id = ? and i.syncsetting_id = s._id
	`
	stmt, err := db.Prepare(sql)
	if err != nil {
		log.Printf("%q: %s\n", err, sql)
		return nil, err
	}

	defer stmt.Close()

	var _rev string
	var name string
	var SyncSettingID string
	var IssueID string
	var summary string
	var description string
	var created time.Time
	var updated time.Time
	var checked bool
	var checkedDate time.Time
	var memo string
	err = stmt.QueryRow(_id).Scan(&_id, &_rev, &name, &SyncSettingID, &IssueID, &summary, &description, &created, &updated, &checked, &checkedDate, &memo)
	if err != nil {
		// log.Printf("NotFound: %q: %s\n", err, sql)
		return nil, err
	}

	strCreated := created.Format(JIRA_DATE_FORMAT)
	strUpdated := updated.Format(JIRA_DATE_FORMAT)
	strCheckedDate := checkedDate.Format(JIRA_DATE_FORMAT)

	result := &model.Issue{
		ID:            _id,
		Rev:           _rev,
		Name:          name,
		SyncSettingID: SyncSettingID,
		IssueID:       IssueID,
		Summary:       summary,
		Description:   description,
		Created:       strCreated,
		Updated:       strUpdated,
		Checked:       checked,
		CheckedDate:   strCheckedDate,
		Memo:          memo,
	}

	return result, nil
}

func (this *RepoSQLiteImpl) UpdateIssue(_id string, _rev string, model *model.Issue) (*model.Issue, error) {
	// log.Println("UpdateIssue", model.Checked)

	db := this.Conn

	sql := `
	update issues 
	set _rev = ?, syncsetting_id = ?, issueId = ?, summary = ?, description = ?, created = ?, updated = ?, checked = ?, checkedDate = ?, memo = ?
	where _id = ? and _rev = ?
	`
	stmt, err := db.Prepare(sql)
	if err != nil {
		log.Printf("%q: %s\n", err, sql)
		return nil, err
	}
	defer stmt.Close()

	rev, _ := strconv.Atoi(_rev)
	newRev := strconv.Itoa(rev + 1)

	// log.Printf("%s -> %s", _rev, newRev)

	createdTime, _ := time.Parse(JIRA_DATE_FORMAT, model.Created)
	updatedTime, _ := time.Parse(JIRA_DATE_FORMAT, model.Updated)
	checkedDateTime, _ := time.Parse(JIRA_DATE_FORMAT, model.CheckedDate)

	// log.Println("created: ", model.Created, createdTime)

	result, err := stmt.Exec(
		newRev,
		model.SyncSettingID,
		model.IssueID,
		model.Summary,
		model.Description,
		createdTime,
		updatedTime,
		model.Checked,
		checkedDateTime,
		model.Memo,
		_id,
		_rev,
	)
	if err != nil {
		log.Printf("%q: %s\n", err, sql)
		return nil, err
	}
	count, _ := result.RowsAffected()
	if count == 0 {
		// TODO notfound error
		conflictErr := fmt.Errorf("Conflict revision")
		return nil, conflictErr
	}

	// return new model
	model.Rev = newRev
	return model, nil
}

func (this *RepoSQLiteImpl) DeleteIssue(_id string, _rev string) (*model.Issue, error) {
	current, err := this.ReadIssue(_id)
	if err != nil {
		return nil, err
	}

	db := this.Conn

	sql := `
	delete from issues
	where _id = ? and _rev = ?
	`
	stmt, err := db.Prepare(sql)
	if err != nil {
		log.Printf("%q: %s\n", err, sql)
		return nil, err
	}
	defer stmt.Close()

	result, err := stmt.Exec(
		_id,
		_rev,
	)

	if err != nil {
		log.Printf("%q: %s\n", err, sql)
		return nil, err
	}

	count, _ := result.RowsAffected()
	if count == 0 {
		// TODO notfound error
		conflictErr := fmt.Errorf("Conflict revision")
		return nil, conflictErr
	}

	return current, nil
}

func (this *RepoSQLiteImpl) QueryIssues(query map[string]string) (*QueryIssuesResult, error) {
	db := this.Conn

	// log.Println("Query:", query)

	// TODO filter by query
	querySql := `
	select
		i._id, i._rev, s.name, i.syncsetting_id, i.issueId, i.summary, i.description, i.created, i.updated, i.checked, i.checkedDate, i.memo 
	from issues i, syncsettings s
	where i.syncsetting_id = s._id
	`

	var filterAndValues []interface{}
	var filterOrValues []interface{}
	var filterAndKeys []string
	var filterOrKeys []string

	for k, v := range query {
		slice := strings.Split(k, "$")

		if slice[2] == "eq" {
			if slice[1] == "and" {
				filterAndKeys = append(filterAndKeys, " i."+slice[0]+" = ?")
				filterAndValues = append(filterAndValues, v)
			} else {
				filterOrKeys = append(filterOrKeys, " i."+slice[0]+" = ?")
				filterOrValues = append(filterOrValues, v)
			}
		} else {
			if slice[1] == "and" {
				filterAndKeys = append(filterAndKeys, " i."+slice[0]+" like ?")
				filterAndValues = append(filterAndValues, v)
			} else {
				filterOrKeys = append(filterOrKeys, " i."+slice[0]+" like ?")
				filterOrValues = append(filterOrValues, v)
			}
		}
	}

	if len(filterAndKeys) > 0 {
		querySql = querySql + " and (" + strings.Join(filterAndKeys, " and ") + ")"
	}

	if len(filterOrKeys) > 0 {
		querySql = querySql + " and (" + strings.Join(filterOrKeys, " or ") + ")"
	}

	querySql = querySql + " order by i.updated desc, i.created desc"

	// log.Println(querySql)

	stmt, err := db.Prepare(querySql)
	if err != nil {
		log.Printf("%q: %s\n", err, querySql)
		return nil, err
	}

	defer stmt.Close()

	var rows *sql.Rows
	if len(filterAndValues) == 0 && len(filterOrValues) == 0 {
		rows, err = stmt.Query()
	} else {
		filterValues := append(filterAndValues, filterOrValues...)
		rows, err = stmt.Query(filterValues...)
	}

	if err != nil {
		log.Printf("%q: %s\n", err, querySql)
		return nil, err
	}

	defer rows.Close()

	queryResult := &QueryIssuesResult{Result: []*model.Issue{}}

	for rows.Next() {
		var _id string
		var _rev string
		var name string
		var SyncSettingID string
		var IssueID string
		var summary string
		var description string
		var created time.Time
		var updated time.Time
		var checked bool
		var checkedDate time.Time
		var memo string

		rows.Scan(&_id, &_rev, &name, &SyncSettingID, &IssueID, &summary, &description, &created, &updated, &checked, &checkedDate, &memo)

		strCreated := created.Format(JIRA_DATE_FORMAT)
		strUpdated := updated.Format(JIRA_DATE_FORMAT)
		strCheckedDate := checkedDate.Format(JIRA_DATE_FORMAT)

		// log.Println("checkedDate: ", checkedDate)

		result := &model.Issue{
			ID:            _id,
			Rev:           _rev,
			Name:          name,
			SyncSettingID: SyncSettingID,
			IssueID:       IssueID,
			Summary:       summary,
			Description:   description,
			Created:       strCreated,
			Updated:       strUpdated,
			Checked:       checked,
			CheckedDate:   strCheckedDate,
			Memo:          memo,
		}
		queryResult.Result = append(queryResult.Result, result)

		// log.Println("row: ", result.Checked)
	}

	return queryResult, nil
}

func (this *RepoSQLiteImpl) QueryAllIssues() (*QueryIssuesResult, error) {
	return this.QueryIssues(make(map[string]string))
}

func (this *RepoSQLiteImpl) CreateSyncSetting(_id string, model *model.SyncSetting) (*model.SyncSetting, error) {
	db := this.Conn

	if _id != "" {
		model.ID = _id
	} else {
		u, _ := uuid.NewV4()
		model.ID = u.String()
	}
	model.Rev = "0"

	sql := "insert into syncsettings values (?, ?, ?, ?, ?, ?, ?, ?, ?)"
	stmt, err := db.Prepare(sql)
	if err != nil {
		log.Printf("%q: %s\n", err, sql)
		return nil, err
	}
	defer stmt.Close()

	_, err = stmt.Exec(model.ID,
		model.Rev,
		model.Name,
		model.Type,
		model.FetchURL,
		model.InsecureSkipVerify,
		model.Schedule,
		model.IssueURL,
		model.Description,
	)
	if err != nil {
		return nil, err
	}

	return model, nil
}

func (this *RepoSQLiteImpl) ReadSyncSetting(_id string) (*model.SyncSetting, error) {
	db := this.Conn

	sql := `
	select
		_id, _rev, name, type, fetchUrl, insecureSkipVerify, issueUrl, description
	from syncsettings
	where _id = ?
	`
	stmt, err := db.Prepare(sql)
	if err != nil {
		log.Printf("%q: %s\n", err, sql)
		return nil, err
	}

	defer stmt.Close()

	var _rev string
	var name string
	var syncType string
	var fetchURL string
	var insecureSkipVerify bool
	var issueURL string
	var description string

	err = stmt.QueryRow(_id).Scan(&_id, &_rev, &name, &syncType, &fetchURL, &insecureSkipVerify, &issueURL, &description)
	if err != nil {
		log.Printf("%q: %s\n", err, sql)
		return nil, err
	}

	result := &model.SyncSetting{
		ID:                 _id,
		Rev:                _rev,
		Name:               name,
		Type:               syncType,
		FetchURL:           fetchURL,
		InsecureSkipVerify: insecureSkipVerify,
		IssueURL:           issueURL,
		Description:        description,
	}

	return result, nil
}

func (this *RepoSQLiteImpl) UpdateSyncSetting(_id string, _rev string, model *model.SyncSetting) (*model.SyncSetting, error) {
	db := this.Conn

	sql := `
	update syncsettings 
	set _rev = ?, name = ?, type = ?, fetchUrl = ?, insecureSkipVerify = ?, schedule = ?, issueUrl = ? , description = ?
	where _id = ? and _rev = ?
	`
	stmt, err := db.Prepare(sql)
	if err != nil {
		log.Printf("%q: %s\n", err, sql)
		return nil, err
	}
	defer stmt.Close()

	rev, _ := strconv.Atoi(model.Rev)
	newRev := strconv.Itoa(rev + 1)

	_, err = stmt.Exec(
		newRev,
		model.Name,
		model.Type,
		model.FetchURL,
		model.InsecureSkipVerify,
		model.Schedule,
		model.IssueURL,
		model.Description,
		_id,
		model.Rev,
	)
	if err != nil {
		// TODO notfound error
		conflictErr := fmt.Errorf("Conflict revision")
		return nil, conflictErr
	}

	// return new model
	model.Rev = newRev
	return model, nil
}

func (this *RepoSQLiteImpl) DeleteSyncSetting(_id string, _rev string) (*model.SyncSetting, error) {
	current, err := this.ReadSyncSetting(_id)
	if err != nil {
		return nil, err
	}

	db := this.Conn

	sql := `
	delete from syncsettings
	where _id = ? and _rev = ?
	`
	stmt, err := db.Prepare(sql)
	if err != nil {
		log.Printf("%q: %s\n", err, sql)
		return nil, err
	}
	defer stmt.Close()

	result, err := stmt.Exec(
		_id,
		_rev,
	)

	if err != nil {
		log.Printf("%q: %s\n", err, sql)
		return nil, err
	}

	count, _ := result.RowsAffected()
	if count == 0 {
		// TODO notfound error
		conflictErr := fmt.Errorf("Conflict revision")
		return nil, conflictErr
	}

	return current, nil
}

func (this *RepoSQLiteImpl) QuerySyncSettings(query map[string]string) (*QuerySyncSettingsResult, error) {
	db := this.Conn

	// log.Println("Query:", query)

	// TODO filter by query
	sql := `
	select
		_id, _rev, name, type, fetchUrl, insecureSkipVerify, schedule, issueUrl, description
	from syncsettings
	`
	stmt, err := db.Prepare(sql)
	if err != nil {
		log.Printf("%q: %s\n", err, sql)
		return nil, err
	}

	defer stmt.Close()

	rows, err := stmt.Query()

	if err != nil {
		log.Printf("%q: %s\n", err, sql)
		return nil, err
	}

	defer rows.Close()

	queryResult := &QuerySyncSettingsResult{Result: []*model.SyncSetting{}}

	for rows.Next() {
		var _id string
		var _rev string
		var name string
		var syncType string
		var fetchURL string
		var insecureSkipVerify bool
		var schedule string
		var issueURL string
		var description string

		rows.Scan(&_id, &_rev, &name, &syncType, &fetchURL, &insecureSkipVerify, &schedule, &issueURL, &description)

		result := &model.SyncSetting{
			ID:                 _id,
			Rev:                _rev,
			Name:               name,
			Type:               syncType,
			FetchURL:           fetchURL,
			InsecureSkipVerify: insecureSkipVerify,
			Schedule:           schedule,
			IssueURL:           issueURL,
			Description:        description,
		}
		queryResult.Result = append(queryResult.Result, result)
	}

	return queryResult, nil
}

func (this *RepoSQLiteImpl) QueryAllSyncSettings() (*QuerySyncSettingsResult, error) {
	return this.QuerySyncSettings(make(map[string]string))
}

func (this *RepoSQLiteImpl) FindByName(name string) (*model.SyncSetting, error) {
	db := this.Conn

	sql := `
	select
		_id, _rev, name, type, fetchUrl, insecureSkipVerify, schedule, issueUrl, description
	from syncsettings
	where name = ?
	`
	stmt, err := db.Prepare(sql)
	if err != nil {
		log.Printf("%q: %s\n", err, sql)
		return nil, err
	}

	defer stmt.Close()

	var _id string
	var _rev string
	var syncType string
	var fetchURL string
	var insecureSkipVerify bool
	var schedule string
	var issueURL string
	var description string

	err = stmt.QueryRow(name).Scan(&_id, &_rev, &name, &syncType, &fetchURL, &insecureSkipVerify, &schedule, &issueURL, &description)
	if err != nil {
		log.Printf("%q: %s\n", err, sql)
		return nil, err
	}

	result := &model.SyncSetting{
		ID:                 _id,
		Rev:                _rev,
		Name:               name,
		Type:               syncType,
		FetchURL:           fetchURL,
		InsecureSkipVerify: insecureSkipVerify,
		Schedule:           schedule,
		IssueURL:           issueURL,
		Description:        description,
	}

	return result, nil
}
