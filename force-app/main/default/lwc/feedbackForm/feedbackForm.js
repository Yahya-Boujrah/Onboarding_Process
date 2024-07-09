import { LightningElement, wire, api, track } from 'lwc';
import getAllFeedbacksForTraining from '@salesforce/apex/ExperienceCloudHelper.getAllFeedbacksForTraining';
import createNewFeedback from '@salesforce/apex/ExperienceCloudHelper.createNewFeedback';

import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from "@salesforce/apex";
import getEventById from '@salesforce/apex/ExperienceCloudHelper.getEventById';

import deleteFeedback from '@salesforce/apex/ExperienceCloudHelper.deleteFeedback';
import updateFeedback from '@salesforce/apex/ExperienceCloudHelper.updateFeedback';

import Id from '@salesforce/user/Id'
import noDataFound from "@salesforce/resourceUrl/NotFound";


export default class FeedbackForm extends LightningElement {
    wiredFeedbacks;
    @track allFeedbacks = [];
    @track feedback;
    @track trainingModuleId;
    @track loading = true;
    userId = Id;
    noDataFound = noDataFound;
    @track feedbacksExist = false;

    @track currentFeedback = {
        Id: '',
        Feedback__c: ''
    };
    @track isModalOpen = false;
    @track isDeleteFeedback = false;

    @api recordId;

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

    @wire(getAllFeedbacksForTraining, { trainingModuleId: '$trainingModuleId' })
    retrievedFeedbacks(result) {
        this.wiredFeedbacks = result;
        if (result.data) {

            this.allFeedbacks = result.data.map(feedback => ({
                ...feedback,
                createdByCurrentUser: feedback.CreatedById === this.userId
            }));
            this.loading = false;
            this.feedbacksExist = this.allFeedbacks.length !== 0 ;
            console.log('existrsts ' + this.feedbacksExist);
            // if (this.allFeedbacks.length === 0) {
            //     this.feedbacksExist = false;
            // }
            // else this.feedbacksExist = true;

        } else if (result.error) {
            console.log(result.error);
            this.loading = false;
            this.feedbacksExist = false;
        }
    }
    habndleFeedbackChange(event) {
        this.feedback = event.target.value;
    }

    handleSubmitFeedback(event) {
        event.preventDefault();
        console.log('submit feedback ');

        console.log('trainingModuleId ' + this.trainingModuleId);

        this.loading = true;
        createNewFeedback({ feedback: this.feedback, trainingModuleId: this.trainingModuleId })
            .then(() => {
                this.showToastCustom('Success', 'Your Feedback was saved successfully.', 'success', 'pester');
                this.refs.feedbackInput.value = '';
                refreshApex(this.wiredFeedbacks);
            })
            .catch((error) => {
                console.error(error);
                this.showToastCustom('Error', 'Unexpected error has occured while trying to save your Feedback.', 'error', 'pester');
            })
            .finally(() => {
                this.loading = false;

            })
    }

    handleDelete(event) {
        event.preventDefault();
        this.loading = true;

        deleteFeedback({ feedbackId: this.currentFeedback.Id })
            .then(() => {
                this.showToastCustom('Success', 'Your Feedback was deleted successfully.', 'success', 'pester');
                refreshApex(this.wiredFeedbacks);
            })
            .catch((error) => {
                console.error(error);
                this.showToastCustom('Error', 'Unexpected error has occured while trying to delete your Feedback.', 'error', 'pester');
            })
            .finally(() => {
                this.loading = false;
                this.closeModal();
            })
    }

    handleEdit(event) {
        event.preventDefault();
        this.loading = true;

        updateFeedback({ feedbackId: this.currentFeedback.Id, feedback: this.feedback })
            .then(() => {
                this.showToastCustom('Success', 'Your Feedback was Updated successfully.', 'success', 'pester');
                refreshApex(this.wiredFeedbacks);
            })
            .catch((error) => {
                console.error(error);
                this.showToastCustom('Error', 'Unexpected error has occured while trying to Update your Feedback.', 'error', 'pester');
            })
            .finally(() => {
                this.loading = false;
                this.closeModal();
            })
    }

    displayIcons(event) {
        const feedbackUser = event.currentTarget.dataset.id;
        if (feedbackUser === this.userId) {
            return true;
        }
        return false;
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

    openModal(event) {
        console.log('testtstss ');
        const mode = event.currentTarget.dataset.mode;
        const feedbackId = event.currentTarget.dataset.id;
        const feedback = event.currentTarget.dataset.feedback;
        this.currentFeedback.Id = feedbackId;
        this.currentFeedback.Feedback__c = feedback;

        if (mode === 'delete') this.isDeleteFeedback = true;
        else this.isDeleteFeedback = false;
        this.isModalOpen = true;
    }
    closeModal() {
        this.currentFeedback = {
            Id: '',
            Feedback__c: ''
        };
        this.isModalOpen = false;

    }
}