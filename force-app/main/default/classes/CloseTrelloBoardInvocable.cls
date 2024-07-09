public class CloseTrelloBoardInvocable {
    public class Request {
        @InvocableVariable(required=true)
        public String boardId;
    }

    public class Response {
        @InvocableVariable
        public String status;
        @InvocableVariable
        public String message;
    }

    @InvocableMethod
    public static List<Response> closeTrelloBoard(List<Request> requests) {
        List<Response> responses = new List<Response>();

        for (Request request : requests) {
            Response response = new Response();
            try {
                closeBoard(request.boardId);
                response.status = 'Success';
                response.message = 'Board closed successfully';
            } catch (Exception e) {
                response.status = 'Error';
                response.message = 'Failed to close board: ' + e.getMessage();
            }
            responses.add(response);
        }

        return responses;
    }

    private static void closeBoard(String boardId) {
        TrelloApiSettings__c  settings = TrelloApiSettings__c.getInstance();
        String API_KEY = settings.API_Key__c;
        String API_TOKEN = settings.API_Token__c;
        
        HttpRequest req = new HttpRequest();
        req.setEndpoint('https://api.trello.com/1/boards/' + boardId + '?key=' + API_KEY + '&token=' + API_TOKEN);
        req.setMethod('PUT');
        req.setHeader('Content-Type', 'application/json');
        req.setBody(JSON.serialize(new Map<String, Boolean>{ 'closed' => true }));

        Http http = new Http();
        HttpResponse res = http.send(req);

        if (res.getStatusCode() != 200 && res.getStatusCode() != 201) {
            throw new CalloutException('Failed to close board: ' + res.getStatus() + ' ' + res.getBody());
        }
    }
}