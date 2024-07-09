import { LightningElement } from 'lwc';
import { NavigationMixin } from "lightning/navigation";

import OreiAssociatesLogo from "@salesforce/resourceUrl/OreiAssociatesLogo";


export default class Footer extends NavigationMixin(LightningElement) {
    OreiAssociatesLogo = OreiAssociatesLogo;



    handleNavigation(event) {
        const page = event.currentTarget.dataset.id;
        if(page === 'Project_List' ){
            this[NavigationMixin.Navigate]({
                type: 'standard__objectPage',
                attributes: {
                    objectApiName: 'Project__c',
                    actionName: 'list'
                },
                state: {       
                    filterName: '00BQy00000AsOIwMAN'
                }
            });

        }else if(page === 'Task_List'){

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

        }else{
            this[NavigationMixin.Navigate]({
                type: 'comm__namedPage',
                attributes: {
                    name: page
                },
            });
        }
     

    }

    handleNavigationMedia(event) {
        const page = event.currentTarget.dataset.id;
        let url = 'https://oreivaton34-dev-ed.develop.my.site.com/OreivatonAssociates';
        if (page === 'linkedin') {
            url = 'https://www.linkedin.com/company/oreivaton';
        } else if (page === 'instagram') {
            url = 'https://www.instagram.com/oreivaton/';
        } else if (page === 'youtube') {
            url = 'https://www.youtube.com/@Oreivaton'
        }
        const config = {
            type: 'standard__webPage',
            attributes: {
                url: url
            }
        };
        this[NavigationMixin.Navigate](config);
    }

}