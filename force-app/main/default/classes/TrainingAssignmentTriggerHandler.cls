/**
 * @description Trigger handler for TrainingAssignmentTrigger
 * @author Yahya Boujrah - Oreivaton
 * @date 2024-04-03
 */
public class TrainingAssignmentTriggerHandler {
 	private boolean triggerIsExecuting;
    private integer triggerSize;
    
    public TrainingAssignmentTriggerHandler(boolean triggerIsExecuting, integer triggerSize) {
        this.triggerIsExecuting = triggerIsExecuting;
        this.triggerSize = triggerSize;
    }
    
    public void afterInsert(List<Training_Assignment__c> newAssignments, Map<ID, Training_Assignment__c> newAssignemntsMap){
     	Set<Id> trainingModuleIds = new Set<Id>();
    	Map<Id, Id> assignmentToModuleMap = new Map<Id, Id>();

    	// Training Module Ids related to new assignments
        for (Training_Assignment__c assignment : newAssignments) {
            trainingModuleIds.add(assignment.Training_Module__c);
            assignmentToModuleMap.put(assignment.Id, assignment.Training_Module__c);
        }
		
        List<Training_Module__c> formations = [
            SELECT Id, Type__c
            FROM Training_Module__c
            WHERE Id IN :trainingModuleIds AND Type__c = 'Formation'
        ];

        // Events related to the Training Modules
        List<Event> events = [
            SELECT Id, WhatId, IsChild,Subject
            FROM Event
            WHERE WhatId IN :trainingModuleIds AND IsChild = false
        ];
        
         System.debug('eventssss ' + events );


        // Mapping Event WhatId to its corresponding Event
        Map<Id, Event> eventMap = new Map<Id, Event>();
        for (Event evt : events) {
            eventMap.put(evt.WhatId, evt);
        }
        Set<Id> associateIds = new Set<Id>();
      
        for (Training_Assignment__c assignment : newAssignments) {
            associateIds.add(assignment.Associate__c);
        }
        List<Account> associates = [SELECT Id, Name, PersonContactId,User__c
                                    FROM Account 
                                    WHERE (RecordType.Name = 'Intern' OR  RecordType.Name = 'Employee') AND Id IN :associateIds];
        
        Map<Id, Account> AccToUserIdMap = new Map<Id, Account>();
        
        for (Account acc : associates) {
            AccToUserIdMap.put(acc.Id, acc);
        }

       
    	List<EventRelation> eventRelationsToInsert = new List<EventRelation>();

        // Creating EventRelation records for each new assignment
        for (Training_Assignment__c assignment : newAssignments) {
            Id moduleId = assignmentToModuleMap.get(assignment.Id);
            if (moduleId != null && eventMap.containsKey(moduleId)) {
                Event relatedEvent = eventMap.get(moduleId);
                System.debug('is chiiiild ' + relatedEvent.IsChild );
                
                if (assignment.Associate__c != null && relatedEvent.IsChild == false) {
                    EventRelation er = new EventRelation();
                    er.EventId = relatedEvent.Id;
                    er.RelationId = AccToUserIdMap.get(assignment.Associate__c).User__c; 
                    er.IsInvitee = true; 
                    eventRelationsToInsert.add(er);
                }
            }
        }
    
        if (!eventRelationsToInsert.isEmpty()) {
            insert eventRelationsToInsert;
        }
            
    }
}