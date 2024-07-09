import { LightningElement, api, wire, track } from 'lwc';
import { CurrentPageReference } from 'lightning/navigation';
import getEventById from '@salesforce/apex/ExperienceCloudHelper.getEventById';

import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class EventDetails extends LightningElement {
    @wire(CurrentPageReference) pageRef;

    recordId;
    @track eventData;
    @track trainingModuleId

    connectedCallback() {
        console.log('PAGE REF ' + JSON.stringify(this.pageRef));
        if (this.pageRef) {
            const state = this.pageRef.state;
            if (state) {
                this.recordId = state.recordId;
                // await this.getEvent(this.recordId);
            }
        }
    }

    @wire(getEventById, { recordId: '$recordId' })
    retrievedEvents(result) {
        this.wiredEvents = result;
        if (result.data) {
            console.log('event data ' + JSON.stringify(result.data));
            this.eventData = result.data;
            this.trainingModuleId = result.data.WhatId;

        } else if (result.error) {
            console.log(result.error);
            this.loading = false;

        }
    }

    // React to changes in eventData
    get isEventDataLoaded() {
        return !!this.eventData;
    }

    async getEvent(recordId) {
        await getEventById({ recordId: recordId })
            .then((event) => {
                this.eventData = event;
                this.trainingModuleId = event.WhatId;

                console.log('EVENTT ' + JSON.stringify(this.eventData));

            })
            .catch((error) => {
                console.error(error);

                this.showToastCustom('Error', 'Unexpected error has occured while trying to get the event data.', 'error', 'pester');

            })
            .finally(() => {
            })
    }

    showToastCustom(title, message, variant, mode) {
        const toastEvent = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant,
            mode: mode
        });
        this.dispatchEvent(toastEvent);
    }
}

