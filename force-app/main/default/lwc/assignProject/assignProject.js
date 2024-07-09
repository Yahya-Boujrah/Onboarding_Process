import { LightningElement, track, wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

import getMentorsWithOfsset from '@salesforce/apex/AssignmentHelperLWC.getMentorsWithOfsset';
import getInternsWithOfsset from '@salesforce/apex/AssignmentHelperLWC.getInternsWithOfsset';
import getInternProjectsWithOffset from '@salesforce/apex/AssignmentHelperLWC.getInternProjectsWithOffset';
import createMentorshipProgramRecord from '@salesforce/apex/AssignmentHelperLWC.createMentorshipProgramRecord';

import { refreshApex } from "@salesforce/apex";

import noDataFound from "@salesforce/resourceUrl/NotFound";



export default class AssignProject extends NavigationMixin(LightningElement) {

  mentorFilter = [
    {
      fieldPath: 'RecordType.Name',
      operator: '=',
      value: 'Employee',
    },
    {
      fieldPath: 'Status__c',
      operator: '=',
      value: 'Onboarded',
    }
  ];

  internFilter = [
    {
      fieldPath: 'RecordType.Name',
      operator: '=',
      value: 'Intern',
    },
    {
      fieldPath: 'Status__c',
      operator: '=',
      value: 'Onboarding',
    }
  ]

  projectFilter = {
    criteria: [
      {
        fieldPath: 'Intern__c',
        operator: 'eq',
        value: true,
      }
    ],
  };


  @track draggedElementType;

  ELEMENT_TYPE_INTERN = 'intern';
  ELEMENT_TYPE_MENTOR = 'mentor';
  ELEMENT_TYPE_PROJECT = 'project';

  wiredProjects;
  noDataFound = noDataFound

  @track
  assignment = {
    associateId: '',
    secondAssociateId: '',
    mentorId: '',
    coMentorId: '',
    projectId: '',
    description: ''
  };

  @track interns = {};
  @track consultants = {};
  @track projects = {};
  @track isLoading = true;
  @track consultantsExist = false;
  @track internsExist = false;
  @track  projectsExist = false;
  internsPageNumber = 1;
  projectsPageNumber = 1;
  mentorsPageNumber = 1;

  @wire(getMentorsWithOfsset, { pageNumber: '$mentorsPageNumber' })
  retrievedMentors({ error, data }) {
    if (data) {
      this.consultants = data;
      this.isLoading = false;
      if (this.consultants.records.length != 0 ) {
        this.consultantsExist = true;
      }else{
        this.consultantsExist = false;

      }      

    } else if (error) {
      console.log(error);
      this.consultants = undefined;
      this.consultantsExist = false;
    }
  }
  @wire(getInternsWithOfsset, { pageNumber: '$internsPageNumber' })
  retrievedInterns(result) {
    this.wiredInterns = result;
    if (result.data) {
      this.interns = result.data;
      this.isLoading = false;

      if (this.interns.records.length != 0 ) {
        this.internsExist = true;
      }else{
        this.internsExist = false;

      }
    } else if (result.error) {
      this.interns = undefined;
      this.internsExist = false;
      console.log(error);

    }
  }

  @wire(getInternProjectsWithOffset, { pageNumber: '$projectsPageNumber' })
  retrievedInternProjects(result) {
    this.wiredProjects = result;
    if (result.data) {
      this.projects = result.data;

      if (this.projects.records.length != 0 ) {
        this.projectsExist = true;
      }else{
        this.projectsExist = false;

      }

    } else if (result.error) {
      console.log(error);

      this.projects = undefined;
      this.projectsExist = false;

    }
  }

  goToRecordPage(event) {
    const recordId = event.currentTarget.dataset.id;
    console.log('goToRecordPage  ' + recordId);
    this[NavigationMixin.Navigate]({
      type: 'standard__recordPage',
      attributes: {
        recordId: recordId,
        actionName: 'view'
      }
    });
  }

  handleReload() {
    this.isLoading = true;
    console.log('reload start');
    refreshApex(this.wiredProjects);
    refreshApex(this.wiredInterns);
    console.log('reload done');
    this.isLoading = false;
  }

  handleDragStart(event) {
    const itemId = event.currentTarget.dataset.id;
    const itemType = event.currentTarget.dataset.role;
    event.dataTransfer.setData('text/plain', itemId);
    event.dataTransfer.setData('item-type', itemType);
    this.draggedElementType = itemType;
    event.currentTarget.classList.add('drag');
  }

  handleDragEnd(event) {
    event.currentTarget.classList.remove('drag');
  }

  handleDrop(event) {
    event.preventDefault();
    const itemId = event.dataTransfer.getData('text/plain');
    const itemType = event.dataTransfer.getData('item-type');
    const dropZone = event.currentTarget.dataset.role;

    if (itemType === this.ELEMENT_TYPE_INTERN && dropZone === 'drop-intern') {
      const internRecord = this.interns.records.find(intern => intern.Id === itemId);

      if (internRecord) {
        const internData = { recId: internRecord.Id, recName: internRecord.Name };
        const internLookup = this.template.querySelector('c-lwc-multiple-lookup[data-type="intern"]');
        console.log('Intern Lookup: ', internLookup);
        if (internLookup) {
          internLookup.handleAddRecord(internData);
        }
      }

    } else if (itemType === this.ELEMENT_TYPE_MENTOR && dropZone === 'drop-mentor') {

      const mentorRecord = this.consultants.records.find(cons => cons.Id === itemId);

      if (mentorRecord) {
        const mentorData = { recId: mentorRecord.Id, recName: mentorRecord.Name };
        const mentorLookup = this.template.querySelector('c-lwc-multiple-lookup[data-type="mentor"]');
        console.log('Mentor Lookup: ', mentorLookup);

        if (mentorLookup) {
          mentorLookup.handleAddRecord(mentorData);
        }
      }
    } else if (itemType === this.ELEMENT_TYPE_PROJECT && dropZone === 'drop-project') {
      this.assignment.projectId = itemId;
    }

    this.resetDropZoneStyles(dropZone);
  }

  resetDropZoneStyles(currentDropZone) {
    const dropZones = this.template.querySelectorAll('.drop-zone');
    dropZones.forEach(zone => {
      zone.classList.remove('over');
      zone.classList.remove('not-allowed');
    });
  }

  handleDragOver(event) {
    event.preventDefault();
    const dropZone = event.currentTarget.dataset.role;

    if (dropZone === `drop-${this.draggedElementType}`) {
      event.dataTransfer.dropEffect = 'move';
      this.highlightDropZone(dropZone);
    } else {
      event.dataTransfer.dropEffect = 'none';
      this.unhighlightDropZones();
    }
  }


  handleDragLeave(event) {
    event.preventDefault();
    const dropZone = event.currentTarget.dataset.role;
    this.resetDropZoneStyles(dropZone);
  }


  // highlight the specified drop zone with a green border
  highlightDropZone(dropZone) {
    const dropZoneElement = this.template.querySelector(`[data-role="${dropZone}"]`);
    if (dropZoneElement) {
      dropZoneElement.classList.add('over');
      dropZoneElement.classList.remove('not-allowed');
    }
  }

  // remove the highlight from drop zones and mark them as not allowed
  unhighlightDropZones() {
    const dropZones = ['drop-intern', 'drop-mentor', 'drop-project'];

    dropZones.forEach(zone => {
      const dropZoneElement = this.template.querySelector(`[data-role="${zone}"]`);

      if (zone === `drop-${this.draggedElementType}`) {
        dropZoneElement.classList.add('over');
      } else {
        dropZoneElement.classList.remove('over');
        dropZoneElement.classList.add('not-allowed');
      }
    });
  }

  handleDragEnter(event) {
    event.preventDefault();
  }

  cancel(event) {
    if (event.stopPropagation) event.stopPropagation();
    if (event.preventDefault) event.preventDefault();
    return false;
  };

  createMentorshipProgram(event) {
    event.preventDefault();
    this.isLoading = true;

    createMentorshipProgramRecord({ assignment: this.assignment })
      .then(() => {
        this.showToastCustom('Success', 'the Mentorship program record was created successfully.', 'success', 'pester');

        this.handleResetForm();
        this.isLoading = false;

      })
      .catch((error) => {
        console.error(error);

        this.showToastCustom('Error', 'Unexpected error has occured while trying to create the Mentorship program record.', 'error', 'pester');

      })
      .finally(() => {
        this.handleReload();
      })
  }

  handleProjectChange(event) {
    this.assignment.projectId = event.detail.recordId;
  }
  handleDescChange(event) {
    this.assignment.description = event.detail.value;
  }

  handleResetForm() {
    // this.refs.form.reset();
    // this.refs.project_picker.clearSelection();
    const lookups = this.template.querySelectorAll('c-lwc-multiple-lookup')
    lookups.forEach(lookup => {
      lookup.clearRecords();
    });

    this.assignment = {
      associateId: '',
      secondAssociateId: '',
      mentorId: '',
      coMentorId: '',
      projectId: '',
      description: ''
    };
  }


  handlePreviousPage(event) {
    const dataType = event.currentTarget.dataset.id;

    switch (dataType) {
      case 'employee':
        this.mentorsPageNumber--;
        break;
      case 'intern':
        this.internsPageNumber--;
        break;
      case 'project':
        this.projectsPageNumber--;
        break;
      default:
        break;
    }
  }

  handleNextPage(event) {
    const dataType = event.currentTarget.dataset.id;

    switch (dataType) {
      case 'employee':
        this.mentorsPageNumber++;
        break;
      case 'intern':
        this.internsPageNumber++;
        break;
      case 'project':
        this.projectsPageNumber++;
        break;
      default:
        break;
    }
  }

  selectedInterns(event) {
    const associates = event.detail.selRecords;

    if (associates.length === 0) {
      console.error('No associates selected.');
      return;
    }
    this.assignment.associateId = associates[0].recId;

    if (associates.length > 1) {
      this.assignment.secondAssociateId = associates[1].recId;
    } else {
      this.assignment.secondAssociateId = undefined;
    }

  }

  selectedMentors(event) {
    const mentors = event.detail.selRecords;
    console.log('mentorsss ' + mentors);

    if (mentors.length === 0) {
      console.error('No mentors selected.');
      return;
    }
    this.assignment.mentorId = mentors[0].recId;

    if (mentors.length > 1) {
      this.assignment.coMentorId = mentors[1].recId;
    } else {
      this.assignment.coMentorId = undefined;
    }

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