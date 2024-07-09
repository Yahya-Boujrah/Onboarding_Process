import { LightningElement,track, api } from 'lwc';

export default class TasksComponnet extends LightningElement {

    @track selectedTab = "1";
    @api title;
    
    handleChangeTab(event) {
      this.selectedTab = event.detail.selectedTab;
  }
}