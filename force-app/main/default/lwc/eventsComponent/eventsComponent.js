import { LightningElement, track, wire } from 'lwc';
import getAllEvents from '@salesforce/apex/ExperienceCloudHelper.getAllEvents';
import { NavigationMixin } from "lightning/navigation";

import getAllEventsWithOfsset from '@salesforce/apex/ExperienceCloudHelper.getAllEventsWithOfsset';
import noDataFound from "@salesforce/resourceUrl/NotFound";

export default class EventsComponent extends NavigationMixin(LightningElement) {

    @track allEvents = [];
    wiredEvents;
    @track filterType = 'all';
    @track loading = true;
    @track eventsExist = false;
    eventsPageNumber = 1;
    noDataFound = noDataFound



    // @wire(getAllEvents, { filterType: '$filterType' })
    // getEventsData(result) {
    //     this.wiredEvents = result;
    //     if (result.data) {
    //         this.allEvents = result.data;
    //         console.log('all events ' + JSON.stringify(this.allEvents, null, 2));
    //         // this.allEvents.forEach(ev =>{
    //         //     console.log('ev ' + ev.Who?.Name);
    //         // })
    //         this.loading = false
    //         if (this.allEvents.length === 0) this.eventsExist = false;
    //         else this.eventsExist = true;

    //     } else if (result.error) {
    //         console.log(result.error);

    //     }
    // }

    @track events = {};
    @track eventRecords = [];

    @wire(getAllEventsWithOfsset, { pageNumber: '$eventsPageNumber', filterType: '$filterType' })
    retrievedEvents({ error, data }) {
        if (data) {
            this.events = data;
            this.loading = false;
            this.eventRecords = this.events.records.map(
                event => {
                    const whoName = event.Who?.Name;
                    return {...event, whoName: whoName ? whoName : ''};
                }
            );

            this.eventsExist = this.events.records.length !== 0;

        } else if (error) {
            console.log(error);
            this.loading = false;
            this.events = {};
            this.eventsExist = false;
        }
    }

    changeFilter(event) {
        this.loading = true;

        const filterType = event.currentTarget.dataset.id;
        this.filterType = filterType;

        const filterItems = this.template.querySelectorAll('.filter-item');

        filterItems.forEach(item => {
            item.classList.remove('active');
        });

        event.currentTarget.classList.add('active');
    }


    handlePreviousPage(event) {
        this.eventsPageNumber--;
    }

    handleNextPage(event) {
        this.eventsPageNumber++;
    }

    handleRedirect(event) {
        this[NavigationMixin.Navigate]({
            type: 'comm__namedPage',
            attributes: {
                name: 'Calendar__c'
            },
        });
    }
}