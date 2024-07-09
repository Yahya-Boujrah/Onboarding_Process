import { LightningElement, api } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';


export default class Table extends NavigationMixin(LightningElement) {

    @api
    listToDisplay;
    
    @api 
    fieldNames; 

    // get list(){
    //     if(this.listToDisplay && this.fieldNames){
    //         return this.listToDisplay.map(item => {
    //             this.fieldNames.forEach(field => {
    //                 console.log('items ' + item[field] );
    //                 return item[field];
                    
    //             });
    //         })
    //     }
    // }

    goToRecordPage(event){
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

}