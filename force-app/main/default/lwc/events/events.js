import { LightningElement, track, api} from 'lwc';
import getUpcomingEventsByUserId from '@salesforce/apex/ExperienceCloudHelper.getUpcomingEventsByUserId';
import { NavigationMixin } from "lightning/navigation";
import astro from "@salesforce/resourceUrl/Astro";


export default class Events extends NavigationMixin(LightningElement) {
    events = [];
    error;
    astro = astro;
    @track eventsNotExist = false;
    @api title = 'Upcoming Events';
    

    connectedCallback() {
        this.getUpcomingEvents();
    }

    // Method to retrieve upcoming events based on userId
    getUpcomingEvents() {
        this.eventsNotExist = false;
        getUpcomingEventsByUserId()
            .then(result => {
                // Map each event and format its start date
                this.events = result.map(event => {
                    return {
                        ...event,
                        StartDateTime: this.formatDate(new Date(event.StartDateTime)),
                        StartTime: this.formatTime(new Date(event.StartDateTime))
                    };
                });
                if (this.events.length === 0) this.eventsNotExist = true;
                this.error = undefined; 
            })
            .catch(error => {
                this.error = error;
            });
    }

    // Method to format date as "AA/MM/YY"
    formatDate(date) {
        const year = date.getFullYear().toString().slice(-2);
        const month = ('0' + (date.getMonth() + 1)).slice(-2);
        const day = ('0' + date.getDate()).slice(-2);
        return `${day}/${month}/${year}`;
    }
    formatTime(date) {
        // Get the hours and minutes from the date object
        const hours = ('0' + date.getHours()).slice(-2);
        const minutes = ('0' + date.getMinutes()).slice(-2);

        // Format the time as "HH h MM"
        return `${hours} h ${minutes}`;
    }

    handleRedirect(event) {
        this[NavigationMixin.Navigate]({
            type: 'comm__namedPage',
            attributes: {
                name: 'Events__c'
            },
        });
    }

    handleClick(event){
        const eventId = event.currentTarget.dataset.id;
        console.log('idd ' + eventId);
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: eventId,
                objectApiName: "Event",
                actionName: 'view',
            },

        });
    }

}