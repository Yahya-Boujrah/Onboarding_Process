import { LightningElement, track, wire } from 'lwc';
import getAllTask from '@salesforce/apex/ExperienceCloudHelper.getAllTask';
import updateTask from '@salesforce/apex/ExperienceCloudHelper.updateTaskStatus';
import createNewTask from '@salesforce/apex/ExperienceCloudHelper.createNewTask';


import { NavigationMixin } from 'lightning/navigation';
import { refreshApex } from "@salesforce/apex";

import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class TaskManager extends NavigationMixin(LightningElement) {
    @track taskNewList = [];
    @track taskInProgressList = [];
    @track taskCompletedList = [];
    @track dropTaskId;
    @track isModalOpen = false;

    statusOptions = [
        { label: 'Not Started', value: 'Open' },
        { label: 'In Progress', value: 'In Progress' },
        { label: 'Completed', value: 'Completed' },
    ];

    priorityOptions = [
        { label: 'Low', value: 'Low' },
        { label: 'Medium', value: 'Normal' },
        { label: 'High', value: 'High' },
    ];

    @track
    newTask = {
        subject: '',
        dueDate: '',
        status: 'Open',
        priority: 'Normal',
        comment: '',
    }

    connectedCallback() {
    }

    @track openTasksLength;
    @track taskInProgressList;
    @track taskCompletedLength;

    @wire(getAllTask)
    getTasksData(result) {
        this.wiredTasks = result;
        if (result.data) {
            let taskNewData = [];
            let taskInProgressData = [];
            let taskCompletedData = [];
            result.data.forEach(task => {
                if (task.Status === 'Open') {
                    taskNewData.push(task);
                } else if (task.Status !== 'Open' && task.Status !== 'Completed') {
                    taskInProgressData.push(task);
                } else if (task.Status === 'Completed') {
                    taskCompletedData.push(task);
                }
            })

            this.taskNewList = taskNewData;
            this.taskInProgressList = taskInProgressData;
            this.taskCompletedList = taskCompletedData;


            // Save array lengths
            this.openTasksLength = taskNewData.length;
            this.taskInProgressLength = taskInProgressData.length;
            this.taskCompletedLength = taskCompletedData.length;

        } else if (result.error) {
            console.log(result.error);

        }
    }

    getTaskData() {
        taskData().then(result => {
            let taskNewData = [];
            let taskInProgressData = [];
            let taskCompletedData = [];
            for (let i = 0; i < result.length; i++) {
                let task = new Object();
                task.Id = result[i].Id;
                task.Subject = result[i].Subject;
                task.Status = result[i].Status;
                task.Description = result[i].Description;
                task.DueDate = result[i].ActivityDate;
                task.WhoId = '/' + result[i].WhoId;
                task.WhatId = '/' + result[i].WhatId;
                if (task.Status === 'Open') {
                    taskNewData.push(task);
                } else if (task.Status !== 'Open' && task.Status !== 'Completed') {
                    taskInProgressData.push(task);
                } else if (task.Status === 'Completed') {
                    taskCompletedData.push(task);
                }
            }
            this.taskNewList = taskNewData;
            this.taskInProgressList = taskInProgressData;
            this.taskCompletedList = taskCompletedData;
        }).catch(error => {
            window.alert('$$$Test1:' + error);
        })
    }


    taskDragStart(event) {
        const taskId = event.target.id.substr(0, 18);
        //window.alert(taskId);
        this.dropTaskId = taskId;
        console.log('task id select ' + this.dropTaskId);
        let draggableElement = this.template.querySelector('[data-id="' + taskId + '"]');
        draggableElement.classList.add('drag');
        this.handleTaskDrag(taskId);
    }

    taskDragEnd(event) {
        const taskId = event.target.id.substr(0, 18);
        //window.alert(taskId);
        let draggableElement = this.template.querySelector('[data-id="' + taskId + '"]');
        draggableElement.classList.remove('drag');
    }

    handleDrop(event) {
        this.cancel(event);
        const columnUsed = event.target.id;
        let taskNewStatus;
        let currentTask;

        if (columnUsed.includes('InProgress')) {
            currentTask = this.taskNewList.filter(task => task.Id == this.dropTaskId);
            taskNewStatus = 'In Progress';
        } else if (columnUsed.includes('Open')) {
            currentTask = this.taskInProgressList.filter(task => task.Id == this.dropTaskId);
            taskNewStatus = 'Open';
        } else if (columnUsed.includes('completed')) {
            currentTask = this.taskCompletedList.filter(task => task.Id == this.dropTaskId);
            taskNewStatus = 'Completed';
        }
        if (currentTask.Status == 'Open' && columnUsed.includes('Open') ||
            currentTask.Status == 'In Progress' && columnUsed.includes('InProgress') ||
            currentTask.Status == 'Completed' && columnUsed.includes('completed')) return;

        this.updateTaskStatus(this.dropTaskId, taskNewStatus);
        let draggableElement = this.template.querySelector('[data-role="drop-target"]');
        draggableElement.classList.remove('over');
    }

    handleDragEnter(event) {
        this.cancel(event);
    }

    handleDragOver(event) {
        this.cancel(event);
        // let draggableElement = this.template.querySelector('[data-role="drop-target"]');
        // draggableElement.classList.add('over');
    }

    handleDragLeave(event) {
        this.cancel(event);
        // let draggableElement = this.template.querySelector('[data-role="drop-target"]');
        // draggableElement.classList.remove('over');
    }
    handleTaskDrag(taskId) {
        console.log('$$$TEst: ' + taskId);
    }

    updateTaskStatus(taskId, taskNewStatus) {
        console.log('idddd ' + taskId);
        updateTask({ taskId: taskId, Status: taskNewStatus }).then(result => {
            // this.getTaskData();
            this.handleReload();
            this.showToastCustom('Success', 'the Task Status updated successfully', 'success', 'pester');


        }).catch(error => {
            console.log('error updateTaskStatus  ' + JSON.stringify(error));
            this.showToastCustom('Error', 'Unexpected error has occured while trying to change the status.', 'error', 'pester');

        })
        console.log('update task status');
    }

    cancel(event) {
        if (event.stopPropagation) event.stopPropagation();
        if (event.preventDefault) event.preventDefault();
        return false;
    };


    createTask() {
        this.showToastCustom('Success', 'the Task was created successfully.', 'success', 'pester');

    }

    openModal() {
        this.isModalOpen = true;
    }

    closeModal() {
        this.isModalOpen = false;
    }

    handleSubjectChange(event) {
        this.newTask.subject = event.target.value;
    }
    handleDatecChange(event) {
        this.newTask.dueDate = event.target.value;
    }
    handleStatusChange(event) {
        this.newTask.status = event.target.value;
    }
    handlePrioChange(event) {
        this.newTask.priority = event.target.value;

    }
    handleDescChange(event) {
        this.newTask.comment = event.target.value;

    }

    createTask(event) {
        event.preventDefault();
        console.log('task ' + this.newTask);
        // const formData = new FormData();
        // const inputs = this.template.querySelectorAll('lightning-input');
        // inputs.forEach(input => {
        //     formData.append(input.name, input.value);
        // });
        // const selects = this.template.querySelectorAll('lightning-combobox');
        // selects.forEach(select => {
        //     formData.append(select.name, select.value);
        // });

        createNewTask({ newTask: this.newTask })
        .then(() => {
          this.showToastCustom('Success', 'the Task record was created successfully.', 'success', 'pester');
  
        //   this.handleResetForm();  
        })
        .catch((error) => {
          console.error(error);
  
          this.showToastCustom('Error', 'Unexpected error has occured while trying to create the Task record.', 'error', 'pester');
  
        })
        .finally(() => {
          this.handleReload();
          this.isModalOpen = false;

        })
    }

    goToRecordPage(event) {
        const recordId = event.currentTarget.dataset.id;
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: recordId,
                actionName: 'view'
            }
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

    handleReload() {
        this.isLoading = true;
        console.log('reload start');
        refreshApex(this.wiredTasks);
        console.log('reload done');
        this.isLoading = false;
      }

}