import { LightningElement, api, track } from 'lwc';
import getResults from '@salesforce/apex/AssignmentHelperLWC.getResults';

import { ShowToastEvent } from 'lightning/platformShowToastEvent';


export default class LwcMultipleLookup extends LightningElement {
    @api objectName;
    @api fieldName = 'Name';
    @api label = '';
    @api placeholder = '';
    @track searchRecords = [];
    @track selectedRecords = [];
    @api required = false;
    @api iconName = ''
    @api LoadingText = false;
    @track txtclassname = 'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click';
    @track messageFlag = false;
    @api filters = [];

    handleSearch(event) {

        var currentText = event.target.value;
        var selectRecId = [];
        for (let i = 0; i < this.selectedRecords.length; i++) {
            selectRecId.push(this.selectedRecords[i].recId);
        }
        this.LoadingText = true;
        getResults({ ObjectName: this.objectName, fieldName: this.fieldName, value: currentText, selectedRecId: selectRecId , filters : this.filters})
            .then(result => {
                this.searchRecords = result;
                this.LoadingText = false;

                this.txtclassname = result.length > 0 ? 'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click slds-is-open' : 'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click';
                if (currentText.length > 0 && result.length == 0) {
                    this.messageFlag = true;
                }
                else {
                    this.messageFlag = false;
                }

                if (this.selectRecordId != null && this.selectRecordId.length > 0) {
                    this.iconFlag = false;
                    this.clearIconFlag = true;
                }
                else {
                    this.iconFlag = true;
                    this.clearIconFlag = false;
                }
            })
            .catch(error => {
                console.log('Error trying to get results ' + JSON.stringify(error));
            });

    }

    setSelectedRecord(event) {
        var recId = event.currentTarget.dataset.id;
        var selectName = event.currentTarget.dataset.name;
        let newsObject = { 'recId': recId, 'recName': selectName };
        if (this.selectedRecords.length >= 2) {
            this.showToastCustom( 'Warning', 'You can\'t include more than two Accounts.', 'warning', 'pester' );

            // this.template.querySelectorAll('lightning-input').forEach(input => {
            //     input.value = '';
            // });
            return;
        }

        this.selectedRecords.push(newsObject);
        this.txtclassname = 'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click';
        let selRecords = this.selectedRecords;
        this.template.querySelectorAll('lightning-input').forEach(input => {
            input.value = '';
        });
        const selectedEvent = new CustomEvent('selected', { detail: { selRecords }, });
        this.dispatchEvent(selectedEvent);
        this.required = false;

    }

    removeRecord(event) {
        let selectRecId = [];
        for (let i = 0; i < this.selectedRecords.length; i++) {
            if (event.detail.name !== this.selectedRecords[i].recId)
                selectRecId.push(this.selectedRecords[i]);
        }
        this.selectedRecords = [...selectRecId];
        let selRecords = this.selectedRecords;
        const selectedEvent = new CustomEvent('selected', { detail: { selRecords }, });
        this.dispatchEvent(selectedEvent);

        if(this.selectedRecords.length === 0){
            this.required = true;
        }
    }

    @api
    clearRecords() {
        console.log('clear list ' + this.selectedRecords);
        this.selectedRecords = [];
        this.required = true;
    }

    @api
    handleAddRecord(recordData) {
        const isDuplicate = this.selectedRecords.some(record => record.recId === recordData.recId);

        if (isDuplicate) {
            this.showToastCustom( 'Warning', 'The selected account already exists. Please chose another one.', 'warning', 'pester' );
            return;

        }
        if (this.selectedRecords.length >= 2) {
            this.showToastCustom( 'Warning', 'You can\'t include more than two Accounts.', 'warning', 'pester' );
            return;
        }
        this.selectedRecords = [...this.selectedRecords, recordData];
        let selRecords = this.selectedRecords;
        const selectedEvent = new CustomEvent('selected', { detail: { selRecords }, });
        this.dispatchEvent(selectedEvent);
        this.required = false;
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