import { LightningElement, wire, track, api } from 'lwc';
import getTasksByUserId from '@salesforce/apex/ExperienceCloudHelper.getUpcomingTasksByUserId';
import { NavigationMixin } from "lightning/navigation";
import Priority from '@salesforce/schema/Task.Priority';

export default class Tasks extends  NavigationMixin(LightningElement) {
    @track tasksToDo = [];
    error;
    @track sections = [];
    timeline;
    line;
    prevScrollY = window.scrollY;
    up;
    down;
    full = false;
    set = 0;
    targetY = window.innerHeight * 0.8;
    @api title = 'Today\'s Tasks';
    tasksExist = false;

    connectedCallback() {
        window.addEventListener('scroll', this.scrollHandler.bind(this));

    }

    renderedCallback() {
        this.updateSections();
    }

    disconnectedCallback() {
        window.removeEventListener('scroll', this.scrollHandler.bind(this));

    }

    updateSections() {
        this.sections = this.template.querySelectorAll('.section');
        this.timeline = this.template.querySelector('.timeline');
        this.line = this.template.querySelector('.line');
        if (this.line) {
            this.line.style.bottom = `calc(100% - 20px)`;
            this.scrollHandler();
            this.line.style.display = 'block';
        }
    }

    scrollHandler() {
        if (!this.timeline || !this.line) return;

        const { scrollY } = window;
        this.up = scrollY < this.prevScrollY;
        this.down = !this.up;
        const timelineRect = this.timeline.getBoundingClientRect();
        const lineRect = this.line.getBoundingClientRect();

        const dist = this.targetY - timelineRect.top;

        if (this.down && !this.full) {
            this.set = Math.max(this.set, dist);
            this.line.style.bottom = `calc(100% - ${this.set}px)`;
        }

        if (dist > this.timeline.offsetHeight && !this.full) {
            this.full = true;
            this.line.style.bottom = `30px`;
            this.showEndButton();
        }

        this.sections.forEach(item => {
            const rect = item.getBoundingClientRect();
            if (rect.top + item.offsetHeight / 5 < this.targetY) {
                item.classList.add('show-me');
            }
        });

        this.prevScrollY = window.scrollY;
        this.full = false;
        this.set = 0;
        this.targetY = window.innerHeight * 0.8;
    }

    showEndButton() {
        const endButton = this.template.querySelector('.end-button');
        endButton.classList.add('show');
    }
    
    @wire(getTasksByUserId)
    wiredUserId({ error, data }) {
        if (data) {
            this.getTasks(data);
        } else if (error) {
            this.error = error;
        }
    }

    getTasks(userId) {
        getTasksByUserId({ userId })
            .then(result => {
                this.tasksToDo = result.map((task) => ({
                    id: task.Id,
                    subject: task.Subject,
                    activityDate: task.ActivityDate,
                    priority : task.Priority
                }));
                this.error = undefined;
                this.tasksExist = this.tasksToDo.length > 0;
            })
            .catch(error => {
                this.error = error;
                this.tasksExist = false;
            });
    }

    handleButtonClick(event){
        this[NavigationMixin.Navigate]({
            type: 'standard__objectPage',
            attributes: {
                objectApiName: 'Task',
                actionName: 'list'
            },
            state: {       
                filterName: '00BQy00000ASMW5MAP'
            }
        });
    }

    handleRedirectTask(event){
        const taskId = event.currentTarget.dataset.id;
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: taskId,
                objectApiName: "Task",
                actionName: 'view',
            },

        });

    }
}