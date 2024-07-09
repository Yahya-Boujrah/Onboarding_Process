import { LightningElement, track, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getAccountsWithNoAssignment from '@salesforce/apex/AssignmentHelperLWC.getAccountsWithNoAssignment';
import createTrainingAssignmentRecords from '@salesforce/apex/AssignmentHelperLWC.createTrainingAssignmentRecords';
import getTrainingModuleById from '@salesforce/apex/AssignmentHelperLWC.getTrainingModuleById';


import NAME_FIELD from '@salesforce/schema/Training_Module__c.Name';
import START_DATE_FIELD from '@salesforce/schema/Training_Module__c.Start_Date__c';
import END_DATE_FIELD from '@salesforce/schema/Training_Module__c.End_Date__c';
import MENTOR_FIELD from '@salesforce/schema/Training_Module__c.Mentor__c';
import DESC_FIELD from '@salesforce/schema/Training_Module__c.Description__c';
import LINK_FIELD from '@salesforce/schema/Training_Module__c.Resource_Link__c';

import { refreshApex } from "@salesforce/apex";

import assignmentLogo from "@salesforce/resourceUrl/AssignmentLogo";
import noDataFound from "@salesforce/resourceUrl/NotFound";


const consultantColumns = [
    { label: 'Account Name', fieldName: 'Name', type: 'text' },
    { label: 'Status', fieldName: 'Status__c', type: 'text' },
    { label: 'Email', fieldName: 'PersonEmail', type: 'email' },
    { label: 'Matricule', fieldName: 'Matricule__c', type: 'text' },
    { label: 'Employee Start Date', fieldName: 'EmployeeStartDate__c', type: 'date' },
    { label: 'Level', fieldName: 'Level__c', type: 'text' },
];

const internColumns = [
    { label: 'Account Name', fieldName: 'Name', type: 'text' },
    { label: 'Status', fieldName: 'Status__c', type: 'text' },
    { label: 'Email', fieldName: 'PersonEmail', type: 'email' },
    { label: 'Matricule', fieldName: 'Matricule__c', type: 'text' },
    { label: 'Intern Start Date', fieldName: 'InternStartDate__c', type: 'date' },
    { label: 'Level', fieldName: 'Level__c', type: 'text' },
];

export default class Assignment extends LightningElement {
    consultantColumns = consultantColumns;
    internColumns = internColumns;
    assignmentLogo = assignmentLogo;
    noDataFound = noDataFound;

    FIELDS = [NAME_FIELD, MENTOR_FIELD,
        START_DATE_FIELD, LINK_FIELD,
        END_DATE_FIELD,
        DESC_FIELD];

    FIELDS1 = [NAME_FIELD,
        LINK_FIELD,
        DESC_FIELD];

    assignmentOptions = [
        { label: 'Training Assignment', value: 'Training Assignment' },
        { label: 'PFE Project Assignment', value: 'PFE Project Assignment' },
    ];

    matchingInfo = {
        primaryField: { fieldPath: "Name" },
        additionalFields: [{ fieldPath: "Type__c" }]
    };
    displayInfo = {
        additionalFields: ["Type__c"]
    };


    @track loading = false;
    @track isTraining = false;
    @track openPopUp = false;
    @track isBtnAssignDisabled = true;
    @track selectedTab = "1";
    @track loadAccounts = false;
    trainingObjectApiName = 'Training_Module__c';
    interns = [];
    consultants = [];
    @track internsNotExist = true;
    @track consultantsNotExist = true;
    wiredAccounts = [];
    @track selectedInterns = [];
    @track selectedConsultants = [];
    @track selectedType;
    @track selectedRows = [];

    @track loadProjectAssignment = false;
    @track trainingModuleId;
    @track selectedType = '';
    @track isFormation = false;

    connectedCallback() {
    }


    @track trainingModule;

    @wire(getTrainingModuleById, { trainingModuleId: '$trainingModuleId' })
    retrievedTrainingModule(result) {
        if (result.data) {
            console.log('dtaaaaa +++  ' + JSON.stringify(result.data, null ,2) );
            this.trainingModule = result.data;
            console.log('>>>> isformation : ' + this.trainingModule.Type__c);

            if(this.trainingModule.Type__c === 'Formation'){
                this.isFormation = true;
            }else{
                this.isFormation = false;
            }
        } else if (result.error) {
            console.log(result.error);

        }
    }


    // get isFormation() {
    //     console.log('>>>> isformation :' + JSON.stringify(this.trainingModule, null ,2));
    //     return this.trainingModule.Type__c === 'Formation' ? true : false;
    // }

    @wire(getAccountsWithNoAssignment, { trainingModuleId: '$trainingModuleId' })
    retrievedAccounts(result) {
        this.wiredAccounts = result;
        if (result.data) {
            this.filterAccounts(result.data);

        } else if (result.error) {
            console.log(result.error);

        }
    }

    filterAccounts(accountsList) {
        this.interns = [];
        this.consultants = [];
        this.isBtnAssignDisabled = true;
        this.consultantsNotExist = true;
        this.internsNotExist = true;

        this.interns = accountsList.filter(acc => acc.RecordType.Name === 'Intern' && acc.Status__c === 'Onboarding');
        this.interns.length == 0 ? this.internsNotExist = true : this.internsNotExist = false;

        this.consultants = accountsList.filter(acc => acc.RecordType.Name === 'Employee' && acc.Status__c === 'Onboarding');

        this.consultants.length == 0 ? this.consultantsNotExist = true : this.consultantsNotExist = false;

    }
    handleSelectedInterns(event) {
        this.selectedInterns = event.detail.selectedRows;
        this.updateSelectedRows();
        console.log('rowws 1 ' + this.selectedRows);

        if (this.selectedInterns) {
            this.isBtnAssignDisabled = false;
        }
    }

    handleSelectedConsultants(event) {
        this.selectedConsultants = event.detail.selectedRows;
        this.updateSelectedRows();
        console.log('rowws 2 ' + this.selectedRows);
        if (this.selectedConsultants) {
            this.isBtnAssignDisabled = false;
        }

    }

    updateSelectedRows() {
        this.selectedRows = [];

        this.selectedInterns.forEach(row => {
            this.selectedRows.push(row.Id);
        });

        this.selectedConsultants.forEach(row => {
            this.selectedRows.push(row.Id);
        });
    }

    // handleSelectedInterns(event) {
    //     this.selectedInterns = event.detail.selectedRows;
    //     const selectedRowsIds = this.selectedInterns.map(row => row.Id);

    //     const unselectedRows = this.selectedInterns.filter(item => !selectedRowsIds.includes(item));

    //     console.log('unselected 1 '+ unselectedRows);
    //     this.updateSelectedRows(selectedRowsIds, unselectedRows);

    //     console.log('rowws 1 ' + this.selectedRows);
    //     if (this.selectedInterns.length !== 0) {
    //         this.isBtnAssignDisabled = false;
    //     }

    // }
    // handleSelectedConsultants(event) {
    //     this.selectedConsultants = event.detail.selectedRows;
    //     const selectedRowsIds = this.selectedConsultants.map(row => row.Id);

    //     const unselectedRows = this.selectedConsultants.filter(item => !selectedRowsIds.includes(item));
    //     console.log('unselected 2 '+ unselectedRows);

    //     this.updateSelectedRows(selectedRowsIds, unselectedRows);
    //     console.log('rowws 2 ' + this.selectedRows);
    //     if (this.selectedConsultants) {
    //         this.isBtnAssignDisabled = false;
    //     }
    // }

    // updateSelectedRows(newIds, unselectedIds) {
    //     const uniqueIds = new Set([...this.selectedRows, ...newIds]);
    //     this.selectedRows = Array.from(uniqueIds);

    //     // this.selectedRows = this.selectedRows.filter(item => !unselectedIds.includes(item));
    // }

    handleTypeChange(event) {
        this.isTraining = false;
        this.loadAccounts = false;
        this.isBtnAssignDisabled = true;
        this.loadProjectAssignment = false;

        this.selectedType = event.detail.value;

        if (this.selectedType === 'Training Assignment') {
            this.isTraining = true;
        } else if (this.selectedType === 'PFE Project Assignment') {
            this.loadProjectAssignment = true;
        }

    }

    handleTrainingChange(event) {
        console.log('inside fcn');
        this.loading = true;
        this.loadAccounts = false;
        this.isBtnAssignDisabled = true;

        this.trainingModuleId = event.detail.recordId;
        if (this.trainingModuleId) {
            console.log('load accs ');
            this.loadAccounts = true;
        }
        this.loading = false;

    }

    confirmTrainingAssignment(event) {
        this.loading = true;

        createTrainingAssignmentRecords({ AccountIds: this.selectedRows, trainingModuleId: this.trainingModuleId })
            .then(() => {
                this.showToastCustom('Success', 'Assignments saved successfully.', 'success', 'pester');
                refreshApex(this.wiredAccounts);
                this.loading = false;

            })
            .catch(error => {
                console.error('Error creating training assignments: ', error);
                this.showToastCustom('Error', 'An Error has occured while trying to save the assignments', 'error', 'pester');
            }).finally(() => {
                this.loading = false;
                this.openPopUp = false;
                this.isBtnAssignDisabled = true;

                if (this.selectedInterns.length !== 0) {
                    this.refs.table1.selectedRows = [];
                }

                if (this.selectedConsultants.length !== 0) {
                    this.refs.table2.selectedRows = [];
                }
                this.selectedConsultants = [];
                this.selectedInterns = [];
                this.trainingModuleId = '';
                this.loadAccounts = false

            });
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

    handleChangeTab(event) {
        this.selectedTab = event.detail.selectedTab;
    }
    hideModalBox() {
        this.openPopUp = false;
    }

    showModalBox() {
        if (this.selectedRows.length === 0) {
            this.showToastCustom('Warning', 'Select at least one account to complete the assignment.', 'warning', 'pester');
        } else {
            this.openPopUp = true;
        }
    }

    handleReload() {
        this.loading = true;
        refreshApex(this.wiredAccounts);
        this.loading = false;

    }
}