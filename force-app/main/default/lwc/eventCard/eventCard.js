import { LightningElement, api } from 'lwc';
import trainingPic from "@salesforce/resourceUrl/trainingPic";
import { NavigationMixin } from "lightning/navigation";


export default class EventCard extends NavigationMixin(LightningElement) {
    @api event;
    trainingPic = trainingPic;

    connectedCallback() {
        // console.log('pic ' +trainingPic);
    }

    onButtonClick() {

        // this[NavigationMixin.Navigate]({
        //     type: 'standard__recordPage',
        //     attributes: {
        //         recordId: this.event.Id,
        //         name: 'Event_Detail__c',
        //         actionName: 'view',
        //     },
        //     state: {
        //         recordId: this.event.Id
        //     }
        // });
        
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: this.event.Id,
                objectApiName: "Event",
                actionName: 'view',
            }
        });

    }


}