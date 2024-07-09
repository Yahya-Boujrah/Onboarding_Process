trigger MentorshipProgramTrigger on Mentorship_Program__c (after insert) {
    
    switch on Trigger.operationType {
        when AFTER_INSERT {
            System.enqueueJob(new CreateTrelloBoardQueueable (Trigger.new));
        }
        when BEFORE_DELETE {
           //System.enqueueJob(new CreateTrelloBoardQueueable (Trigger.new));
        }
    }
}