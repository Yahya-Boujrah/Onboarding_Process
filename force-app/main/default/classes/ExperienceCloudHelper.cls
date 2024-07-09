public without sharing class ExperienceCloudHelper {
    static Integer PAGE_SIZE = 8;

    public ExperienceCloudHelper() {

    }

    @AuraEnabled(cacheable=true scope='global')
    public Static List<Task> getAllTask(){

        Id userId = UserInfo.getUserId();
        User user =[SELECT Id, AccountId, ContactId FROM User WHERE Id =:userId];
   
       return [SELECT Id, WhoId, WhatId, Subject, ActivityDate, Status, Priority, IsHighPriority, OwnerId, Description, AccountId, IsClosed, CreatedDate, CreatedById, TaskSubtype, AssignedTo__c 
                FROM Task 
                WHERE AccountId = :user.accountId  
                ORDER BY CreatedDate DESC];

    }
    @AuraEnabled(cacheable=true)
    public static List<Task> getUpcomingTasksByUserId() {
        Id userId = UserInfo.getUserId();
        return [SELECT Id, Subject, ActivityDate,Status, Priority , Description FROM Task WHERE ActivityDate != null AND ActivityDate > TODAY AND OwnerId = :userId ORDER BY ActivityDate DESC LIMIT 3];
    }
    

    @AuraEnabled(cacheable=false )
    public Static Task updateTaskStatus(String taskId, String Status){
        if (String.isBlank(taskId)) {
            throw new AuraHandledException('Invalid input parameters. Task ID must be provided.');
        }
        Task task = [SELECT Id, WhoId, WhatId, Subject, ActivityDate, Status FROM Task WHERE Id = :taskId];

        task.Status = Status;
        update task;

        return task;
    }

    @AuraEnabled(cacheable=false )
    public Static Task createNewTask(TaskInput newTask){
        if (String.isBlank(newTask.subject) || newTask.dueDate == null || String.isBlank(newTask.status) || String.isBlank(newTask.priority)) {
            throw new AuraHandledException('Invalid input parameters. Subject, Due Date must be provided.');
        }

        try {
            Task task = new Task();
            task.Subject = newTask.subject;
            task.ActivityDate = newTask.dueDate;
            task.Description  = newTask.comment;
            task.Status = newTask.status;
            task.Priority = newTask.priority;
            task.IsVisibleInSelfService = true;

            Id userId = UserInfo.getUserId();

            User u = [select Id, contactId from User where id = : userId Limit 1];

            task.OwnerId = userId;
            task.WhoId = u.contactId;


            insert task;

            return task; 

        }catch (DmlException e) {
            System.debug('Error creating Task record: ' + e.getMessage());
            throw new AuraHandledException('Error creating Task record: ' + e.getMessage());
        } catch (Exception e) {
            System.debug('Unexpected error creating Task record: ' + e.getMessage());
            throw new AuraHandledException('Unexpected error creating  Task record.');
        }
    }

    class TaskInput{
        @AuraEnabled
        public String subject { get; set; }

        @AuraEnabled
        public Date dueDate { get; set; }

        @AuraEnabled
        public String status { get; set; }

        @AuraEnabled
        public String priority { get; set; }

        @AuraEnabled
        public String comment { get; set; }
    }

    @AuraEnabled(cacheable=true scope='global')
    public Static Event getEventById(String recordId){
        if (String.isBlank(recordId)) {
            throw new AuraHandledException('Invalid input parameters. Event Id must be provided.');
        }
        String whereClause = ' Id = :recordId';

        Event event = [SELECT Id, WhoId, WhatId, Subject, Location, IsAllDayEvent, ActivityDateTime, ActivityDate, DurationInMinutes, StartDateTime, EndDateTime, Description, AccountId, ReminderDateTime, Who.Name, Type
                FROM Event WHERE Id = :recordId lIMIT 1];

        return event;
          
    }
    @AuraEnabled(cacheable=true scope='global')
    public Static List<Event> getAllEvents(String filterType){

        Id userId =  UserInfo.getUserId();

        // User user = [SELECT Id,Name, ContactId FROM User WHERE Id =:userId LIMIT 1];

        // Id userContactId = user.ContactId;
        // String whereClause = ' WHERE Id IN (SELECT EventId FROM EventRelation WHERE RelationId = :userId)';
        String whereClause = '';

        if (filterType.equals('completed')) {
            whereClause += ' AND ActivityDate < TODAY';
        } else if (filterType.equals('planned')) {
            whereClause += ' AND ActivityDate >= TODAY';
        }
        String query =  'SELECT Id, WhoId, WhatId, WhoCount, WhatCount, Subject, Location, IsAllDayEvent, ActivityDateTime, ActivityDate, DurationInMinutes, StartDateTime, EndDateTime, Description, AccountId, OwnerId, ReminderDateTime, Who.Name,Type, Image_Url__c FROM Event '
             + whereClause +' ORDER BY ActivityDate';
        return Database.query(query);

    }
       
    @AuraEnabled(Cacheable=true scope='global')
    public static PagedResult getAllEventsWithOfsset(Integer pageNumber, String filterType) {
        Id userId =  UserInfo.getUserId();

        String whereClause = 'WHERE Id IN (SELECT EventId FROM EventRelation WHERE RelationId = :userId)';

        if (filterType.equals('completed')) {
            whereClause += ' AND ActivityDate < TODAY';
        } else if (filterType.equals('planned')) {
            whereClause += ' AND ActivityDate >= TODAY';
        }
       
        Integer pageSize = ExperienceCloudHelper.PAGE_SIZE;
        Integer offset = (pageNumber - 1) * pageSize;
        PagedResult result = new PagedResult();
        result.pageSize = pageSize;
        result.pageNumber = pageNumber;
        result.totalItemCount = Database.countQuery(
            'SELECT count() FROM Event ' + whereClause
        );
        result.records = Database.query(
            ' SELECT Id, WhoId, WhatId, WhoCount, WhatCount, Subject, Location, IsAllDayEvent, ActivityDateTime, ActivityDate, DurationInMinutes, StartDateTime, EndDateTime, Description, AccountId, OwnerId, ReminderDateTime, Who.Name,Type, Image_Url__c FROM Event  ' +
                whereClause +
                ' ORDER BY ActivityDate LIMIT :pageSize OFFSET :offset'
        );
        return result;
    }

    class PagedResult {
    	@AuraEnabled
    	public Integer pageSize { get; set; }

    	@AuraEnabled
    	public Integer pageNumber { get; set; }

    	@AuraEnabled
    	public Integer totalItemCount { get; set; }

    	@AuraEnabled
    	public Object[] records { get; set; }
	}



    @AuraEnabled(cacheable=true scope='global')
    public Static List<Event> getUpcomingEventsByUserId(){
        Id userId =  UserInfo.getUserId();
        return [SELECT Id, Subject, StartDateTime 
                FROM Event 
                WHERE StartDateTime >= TODAY AND Id IN (SELECT EventId FROM EventRelation WHERE RelationId = :userId)
                ORDER BY StartDateTime 
                ASC LIMIT 3];

    }
    @AuraEnabled(cacheable=true scope='global')
    public Static List<Feedback__c> getAllFeedbacksForTraining(String trainingModuleId){
        if (String.isBlank(trainingModuleId)) {
            throw new AuraHandledException('Invalid input parameters. Training Id must be provided.');
        }
        String whereClause = ' WHERE Training_Module__c = :trainingModuleId';

        return Database.query('SELECT Id, Name, CreatedDate, Associate__c,Associate__r.Name, Training_Module__c,Feedback__c, CreatedById FROM Feedback__c ' +
            whereClause  + 
            ' ORDER BY CreatedDate'
        );
     
    }

    @AuraEnabled(cacheable=false)
    public Static Feedback__c createNewFeedback(String feedback, String trainingModuleId){
        if (String.isBlank(feedback) || String.isBlank(trainingModuleId)) {
            throw new AuraHandledException('Invalid input parameters. Feedback and Training must be provided.');
        }

        try {
            Feedback__c newFeedback = new Feedback__c();

            newFeedback.Name = 'Feedback';
            newFeedback.Training_Module__c = trainingModuleId;
            newFeedback.Feedback__c = feedback;
            
            Id userId = UserInfo.getUserId();

            User u = [SELECT Id,AccountId FROM User WHERE Id = : userId LIMIT 1];

            newFeedback.Associate__c = u.AccountId;
            insert newFeedback;

            return newFeedback;

        }catch (DmlException e) {
            System.debug('Error creating Feedback record: ' + e.getMessage());
            throw new AuraHandledException('Error creating Feedback record: ' + e.getMessage());
        } catch (Exception e) {
            System.debug('Unexpected error creating Feedback record: ' + e.getMessage());
            throw new AuraHandledException('Unexpected error creating  Feedback record.');
        }
      
    }

    @AuraEnabled(cacheable=false)
    public Static void deleteFeedback(String feedbackId){
        if (String.isBlank(feedbackId) ) {
            throw new AuraHandledException('Invalid input parameters. Feedback Id must be provided.');
        }

        try {
            Feedback__c feedback = [SELECT Id from Feedback__c WHERE Id =: feedbackId LIMIT 1];
            delete feedback;
             
        }catch (DmlException e) {
            System.debug('Error deleting Feedback record: ' + e.getMessage());
            throw new AuraHandledException('Error deleting Feedback record: ' + e.getMessage());
        } 
    }

    @AuraEnabled(cacheable=false)
    public Static Feedback__c updateFeedback(String feedbackId, String feedback){
        if (String.isBlank(feedbackId) || String.isBlank(feedback)) {
            throw new AuraHandledException('Invalid input parameters. Feedback Id must be provided.');
        }

        try {
            Feedback__c  feedbackRecord = [SELECT Id, Feedback__c FROM Feedback__c WHERE Id =:feedbackId LIMIT 1];
            feedbackRecord.Feedback__c = feedback; 

            update feedbackRecord;
            return feedbackRecord;

        }catch (DmlException e) {
            System.debug('Error updating Feedback record: ' + e.getMessage());
            throw new AuraHandledException('Error updating Feedback record: ' + e.getMessage());
        } 
    }

    @AuraEnabled(cacheable=true scope='global')
    public static List<Account>  getEmployees(Integer dataLimit){
        String whereClause = 'WHERE RecordType.Name = \'Employee\' AND Status__c = \'Onboarded\' ORDER BY EmployeeAnciennete__c DESC Limit :dataLimit';
  
        return Database.query(
            'SELECT Id, Name,FirstName,LastName,Salutation,Status__c, PersonEmail, Matricule__c , Level__c,LinkedInAccount__c FROM Account ' +
                whereClause
        );
    }

    @AuraEnabled(cacheable=true scope='global')
    public static ProjectDetails  getTeamMembers(String projectId){

        Id userId = UserInfo.getUserId();
        User u = [SELECT Id,AccountId 
                    FROM User
                    WHERE Id = :userId 
                    LIMIT 1];   

        Mentorship_Program__c program = [SELECT Id, Name ,Associate__c ,Second_Associate__c ,Mentor__c, Co_Mentor__c, Trello_workspace_url__c
                                                FROM Mentorship_Program__c 
                                                WHERE Project__c = :projectId 
                                                AND (Associate__c = :u.AccountId OR Second_Associate__c = :u.AccountId) LIMIT 1];
        
        List<Account> teamMembers = [SELECT Id,Name, FirstName, LastName, Status__c, PersonEmail, Matricule__c , Level__c,LinkedInAccount__c , RecordType.Name
                                        FROM Account
                                        WHERE Id IN (:program.Associate__c, :program.Second_Associate__c,:program.Mentor__c, :program.Co_Mentor__c )];

        ProjectDetails details = new ProjectDetails(); 
        details.members = teamMembers;
        details.trelloWorkspaceUrl = program.Trello_workspace_url__c;

        return details;

    }
    class ProjectDetails{
        @AuraEnabled
        public List<Account> members { get; set; }
        @AuraEnabled
    	public String trelloWorkspaceUrl { get; set; }
    }
}