public class CreateTrelloBoardQueueable  implements Queueable, Database.AllowsCallouts {
    private List<Mentorship_Program__c> newProgramIds;

    public CreateTrelloBoardQueueable (List<Mentorship_Program__c> newProgramIds) {
        this.newProgramIds = newProgramIds;       
    }
    
    public void execute(QueueableContext context) {
        //Map<String,String> boardDetails = new Map<String,String>();
        Map<String,String> userDetails = new Map<String,String>();
        List<Mentorship_Program__c> programsToUpdate = new List<Mentorship_Program__c>();


        List <Mentorship_Program__c> programs = [SELECT Project__r.Name, Description__c, Associate__r.Name, Associate__r.PersonEmail ,
                                                 Second_Associate__r.Name,Second_Associate__r.PersonEmail, Mentor__r.Name,Mentor__r.PersonEmail,
                                                 Co_Mentor__r.Name,  Co_Mentor__r.PersonEmail
                                                 FROM Mentorship_Program__c WHERE Id IN :newProgramIds ];
        for(Mentorship_Program__c prog :programs ){
            //boardDetails.put(prog.Project__r.Name, prog.Description__c);
            userDetails.put(prog.Associate__r.Name, prog.Associate__r.PersonEmail);
            userDetails.put(prog.Second_Associate__r.Name, prog.Second_Associate__r.PersonEmail);
            userDetails.put(prog.Mentor__r.Name, prog.Mentor__r.PersonEmail);
            userDetails.put(prog.Co_Mentor__r.Name, prog.Co_Mentor__r.PersonEmail);
        }
                
      for (Mentorship_Program__c prog : programs) {
            try {
                Map<String, Object> response= createTrelloBoard(prog.Project__r.Name,prog.Description__c);
                 if (response != null) {
                    String boardId = (String) response.get('id');
                    String boardUrl = (String) response.get('url');
                    if (boardId != null) {
                        inviteMembersToBoard(boardId, userDetails, 'normal');
                    }
                     
                    prog.Trello_workspace_url__c = boardUrl;
                    prog.Trello_board_Id__c =  boardId;
                    programsToUpdate.add(prog);
                }
            } catch (Exception e) {
                System.debug('Exception while creating board or inviting member: ' + e.getMessage());
            }
        }
        
         if (!programsToUpdate.isEmpty()) {
            update programsToUpdate;
        }
    }
    
     private Map<String, Object> createTrelloBoard(String name, String description) {
          
        TrelloApiSettings__c  settings = TrelloApiSettings__c.getInstance();
        String APIKEY = settings.API_Key__c;
        String APITOKEN = settings.API_Token__c;
        System.debug('apii ' + settings);
        HttpRequest req = new HttpRequest();
        req.setEndpoint('https://api.trello.com/1/boards?key=' + APIKey + '&token=' + APITOKEN);
        req.setMethod('POST');
        req.setHeader('Content-Type', 'application/json');
        String body = JSON.serialize(new Map<String, String> {
            'name' => name,
            'desc' => description
        });
        req.setBody(body);

        Http http = new Http();
        HttpResponse res = http.send(req);

        if (res.getStatusCode() == 200 || res.getStatusCode() == 201) {
            System.debug('Board created successfully: ' + res.getBody());
            Map<String, Object> responseBody = (Map<String, Object>) JSON.deserializeUntyped(res.getBody());
            return responseBody;
            //return (String) responseBody.get('id');
        } else {
            System.debug('Failed to create board: ' + res.getStatus() + ' ' + res.getBody());
            return null;
        }
    }

    private void inviteMembersToBoard(String boardId, Map<String,String> userDetails, String type) {
        TrelloApiSettings__c  settings = TrelloApiSettings__c.getInstance();
        String APIKEY = settings.API_Key__c;
        String APITOKEN = settings.API_Token__c;
        for(String Name : userDetails.keySet()){
               HttpRequest req = new HttpRequest();
            req.setEndpoint('https://api.trello.com/1/boards/' + boardId + '/members?key=' + APIKey + '&token=' + APITOKEN);
            req.setMethod('PUT');
            req.setHeader('Content-Type', 'application/json');
    
            String body = JSON.serialize(new Map<String, String> {
                'email' => userDetails.get(Name),
                'fullName' => Name,
                'type' => type
            });
            req.setBody(body);
    
            Http http = new Http();
            HttpResponse res = http.send(req);
    
            if (res.getStatusCode() == 200 || res.getStatusCode() == 201) {
                System.debug('Member invited successfully: ' + res.getBody());
            } else {
                System.debug('Failed to invite member: ' + res.getStatus() + ' ' + res.getBody());
            }
        }
    } 
}