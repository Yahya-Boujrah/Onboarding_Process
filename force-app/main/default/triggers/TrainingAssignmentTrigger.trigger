trigger TrainingAssignmentTrigger on Training_Assignment__c (before insert, after insert) {
    
    TrainingAssignmentTriggerHandler handler = new TrainingAssignmentTriggerHandler(Trigger.isExecuting, Trigger.size);
    
    switch on Trigger.operationType {
        when AFTER_INSERT {
            handler.afterInsert(Trigger.new, Trigger.newMap);
        }
    }


}