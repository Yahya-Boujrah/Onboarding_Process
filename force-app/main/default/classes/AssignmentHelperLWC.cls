/**
 * @description Helper class for the assignment web component
 * @author Yahya Boujrah - Oreivaton
 * @date 2024-04-10
 */
public with sharing class AssignmentHelperLWC {
    static Integer PAGE_SIZE = 4;

    public AssignmentHelperLWC() {

    }
    @AuraEnabled(cacheable=true)
    public static List<Account>  getAccountsWithNoAssignment(String trainingModuleId){
        if (String.isBlank(trainingModuleId)) {
            throw new AuraHandledException('Invalid input parameters. Training Module ID must be provided.');
        }
        try {
    
            Set<Id> accIds = new Set<Id>();
            List<Training_Assignment__c> allAssignments = [SELECT Id, Name, Associate__c, Training_Module__c 
                                                        FROM Training_Assignment__c 
                                                        WHERE Training_Module__c =: trainingModuleId ];
            for(Training_Assignment__c tas : allAssignments ){
                accIds.add(tas.Associate__c);
            }
            List<Account> accs = [  SELECT Id, Name, Status__c, PersonEmail, Matricule__c ,InternStartDate__c, EmployeeStartDate__c, Level__c, RecordType.Name
                                    FROM Account 
                                    WHERE Id NOT IN : accIds ];


            return accs;

        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled(cacheable=true scope='global')
    public static PagedResult  getMentorsWithOfsset(Integer pageNumber){
        String whereClause = 'WHERE RecordType.Name = \'Employee\' AND Status__c = \'Onboarded\'';
       
        Integer pageSize = AssignmentHelperLWC.PAGE_SIZE;
        Integer offset = (pageNumber - 1) * pageSize;
        PagedResult result = new PagedResult();
        result.pageSize = pageSize;
        result.pageNumber = pageNumber;
        result.totalItemCount = Database.countQuery(
            'SELECT count() FROM Account ' + whereClause
        );
        result.records = Database.query(
            'SELECT Id, Name, Status__c, PersonEmail, Matricule__c , EmployeeStartDate__c, Level__c, RecordType.Name FROM Account ' +
                whereClause +
                ' WITH SECURITY_ENFORCED' +
                ' ORDER BY Name LIMIT :pageSize OFFSET :offset'
        );
        System.debug('results '+ result);
        return result;

    }
    
    private static  List<Mentorship_Program__c> queryAllMentorshipProgramRecords(){
       return [SELECT Id, Associate__c, Second_Associate__c, Project__c
                                                    FROM Mentorship_Program__c ];
    }
    

    @AuraEnabled(cacheable=true scope='global')
    public static PagedResult  getInternsWithOfsset(Integer pageNumber){
        Set<Id> accIds = new Set<Id>();
        
        List<Mentorship_Program__c> allAssignments = queryAllMentorshipProgramRecords();
            
        for(Mentorship_Program__c tas : allAssignments ){
            accIds.add(tas.Associate__c);
            if(tas.Second_Associate__c != null){
                accIds.add(tas.Second_Associate__c);
            }
        }

        String whereClause = 'WHERE RecordType.Name = \'Intern\'  AND Status__c = \'Onboarding\' AND Id NOT IN :accIds';
       
        Integer pageSize = AssignmentHelperLWC.PAGE_SIZE;
        Integer offset = (pageNumber - 1) * pageSize;
        PagedResult result = new PagedResult();
        result.pageSize = pageSize;
        result.pageNumber = pageNumber;
        result.totalItemCount = Database.countQuery(
            'SELECT count() FROM Account ' + whereClause
        );
        result.records = Database.query(
            'SELECT Id, Name, Status__c, PersonEmail, Matricule__c ,InternStartDate__c , RecordType.Name FROM Account ' +
                whereClause +
                ' WITH SECURITY_ENFORCED' +
                ' ORDER BY Name LIMIT :pageSize OFFSET :offset'
        );

      
        System.debug('results '+ result);
        return result;

    }

    
    @AuraEnabled(Cacheable=true scope='global')
    public static PagedResult getInternProjectsWithOffset(Integer pageNumber) {
        Set<Id> projIds = new Set<Id>();
        
        List<Mentorship_Program__c> allAssignments = queryAllMentorshipProgramRecords();

        for(Mentorship_Program__c tas : allAssignments ){
            projIds.add(tas.Project__c);
        }

        String whereClause = 'WHERE  Intern__c = true AND Pfe_Pfa__c = true AND Id NOT IN :projIds';
       
        Integer pageSize = AssignmentHelperLWC.PAGE_SIZE;
        Integer offset = (pageNumber - 1) * pageSize;
        PagedResult result = new PagedResult();
        result.pageSize = pageSize;
        result.pageNumber = pageNumber;
        result.totalItemCount = Database.countQuery(
            'SELECT count() FROM Project__c ' + whereClause
        );
        result.records = Database.query(
            ' SELECT Id, Name, StartDate__c, Status__c, Public__c, Intern__c  FROM Project__c  ' +
                whereClause +
                ' WITH SECURITY_ENFORCED' +
                ' ORDER BY Name LIMIT :pageSize OFFSET :offset'
        );
        System.debug('results '+ result);
        return result;
    }

    @AuraEnabled(Cacheable=true scope='global')
    public static Training_Module__c getTrainingModuleById(String trainingModuleId){
        return  [SELECT Id, Name, Description__c, End_Date__c, Mentor__c, Resource_Link__c, Start_Date__c, Type__c 
                    FROM Training_Module__c
                    WHERE Id = :trainingModuleId LIMIT 1];
    }

    @AuraEnabled(Cacheable=false)
    public static Mentorship_Program__c createMentorshipProgramRecord(AssignmentHelperInner assignment){
        System.debug( 'assignemnt ' + assignment);
        if (String.isBlank(assignment.associateId) || 
            String.isBlank(assignment.mentorId) || 
            String.isBlank(assignment.projectId)) {
            throw new AuraHandledException('Invalid input parameters. Associate ID, Mentor ID, and Project ID must be provided.');
        }
    	Savepoint sp = Database.setSavepoint();
        try {            
            Mentorship_Program__c program = new Mentorship_Program__c();
            program.Associate__c = assignment.associateId;
            program.Mentor__c = assignment.mentorId;
            program.Project__c  = assignment.projectId;
            program.Description__c = assignment.description;
            
            if(!String.isBlank(assignment.coMentorId)){
                program.Co_Mentor__c = assignment.coMentorId;
            }
            if(!String.isBlank(assignment.secondAssociateId)){
                program.Second_Associate__c = assignment.secondAssociateId;            
            }

            insert program;

              List<ProjectPerson__c> projPeople = new List<ProjectPerson__c>();
            
            ProjectPerson__c projPerson1 = new ProjectPerson__c();
            projPerson1.Project__c = assignment.projectId;
            projPerson1.NumberPersonDays__c = 5;
            projPerson1.Person__c = assignment.associateId;
            projPeople.add(projPerson1);
            
            if (!String.isBlank(assignment.secondAssociateId)) {
                ProjectPerson__c projPerson2 = new ProjectPerson__c();
                projPerson2.Project__c = assignment.projectId;
                projPerson2.NumberPersonDays__c = 5;
                projPerson2.Person__c = assignment.secondAssociateId;
                projPeople.add(projPerson2);
            }
        	insert projPeople;
            return program;

        }catch (DmlException e) {
            System.debug('Error creating Mentorship_Program__c record: ' + e.getMessage());
			Database.rollback(sp);

            throw new AuraHandledException('Error creating Mentorship Program record: ' + e.getMessage());
        } catch (Exception e) {
            System.debug('Unexpected error creating Mentorship_Program__c record: ' + e.getMessage());
			Database.rollback(sp);
            throw new AuraHandledException('Unexpected error creating Mentorship Program record.');
        }
    } 

    @AuraEnabled(cacheable=false)
    public static void createTrainingAssignmentRecords(List<String> AccountIds , String trainingModuleId){
        System.debug('acc ids '+AccountIds);

        System.debug('foms id '+ trainingModuleId);

        if (String.isBlank(trainingModuleId) || accountIds == null || accountIds.isEmpty()) {
        throw new AuraHandledException('Invalid input parameters. Both AccountIds and trainingModuleId must be provided.');
    }

        List<Training_Assignment__c> assignmentsToInsert  = new List<Training_Assignment__c>();

        for(String accId : AccountIds){
            Training_Assignment__c assignment = new Training_Assignment__c();

            assignment.Training_Module__c = trainingModuleId;
            assignment.Associate__c = accId;

            assignmentsToInsert.add(assignment);
        }
        System.debug(assignmentsToInsert);
        
        if(!assignmentsToInsert.isEmpty()){
            try {
                insert assignmentsToInsert;
            } catch (DmlException e) {
                throw new AuraHandledException('Error occurred while inserting Training Assignments: ' + e.getMessage());
            }        }
    }

    class AssignmentHelperInner{
        @AuraEnabled
        public String associateId { get; set; }

        @AuraEnabled
        public String secondAssociateId { get; set; }

        @AuraEnabled
        public String mentorId { get; set; }

        @AuraEnabled
        public String coMentorId { get; set; }
        
        @AuraEnabled
        public String projectId { get; set; }

        @AuraEnabled
        public String description { get; set; }
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

    @AuraEnabled(cacheable=true)
    public static List<SObJectResult> getResults(String ObjectName, String fieldName, String value, List<String> selectedRecId,  List<Filter> filters) {
        List<SObJectResult> sObjectResultList = new List<SObJectResult>();
        if(selectedRecId == null)
            selectedRecId = new List<String>();

        if(String.isNotEmpty(value)) {
            String query = 'Select Id,'+fieldName+' FROM '+ObjectName+' WHERE '+fieldName+' LIKE \'%' + value.trim() + '%\'';

            if (filters != null && !filters.isEmpty()) {
                for (Filter filter : filters) {
                    query += ' AND ' + filter.fieldPath + ' ' + filter.operator + ' ';
                    if (filter.operator.equals('IN')) {
                        query += '(' + String.join((List<String>)filter.value, ',') + ')';
                    } else if (filter.value instanceof String) {
                        query += '\'' + (String)filter.value + '\'';
                    } else {
                        query += filter.value;
                    }
                }
            }

            if (selectedRecId != null && !selectedRecId.isEmpty()) {
                query += ' AND Id NOT IN :selectedRecId';
            }

            system.debug(query);
            for(sObject so : Database.Query(query)) {
                String fieldvalue = (String)so.get(fieldName);
                sObjectResultList.add(new SObjectResult(fieldvalue, so.Id));
            }
        }
        return sObjectResultList;
    }
    
    public class SObjectResult {
        @AuraEnabled
        public String recName { get; set; }
        @AuraEnabled
        public Id recId { get; set; }
        
        public SObJectResult(String recNameTemp, Id recIdTemp) {
            recName = recNameTemp;
            recId = recIdTemp;
        }
    }
    public class Filter {
        @AuraEnabled
        public String fieldPath { get; set; }
        @AuraEnabled
        public String operator { get; set; }
        @AuraEnabled
        public Object value { get; set; }
    
        public Filter(){}
        
        public Filter(String fieldPath, String operator, Object value) {
            this.fieldPath = fieldPath;
            this.operator = operator;
            this.value = value;
        }
    }


}