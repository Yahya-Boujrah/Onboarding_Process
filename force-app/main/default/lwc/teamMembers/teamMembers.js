import { LightningElement, api, wire } from 'lwc';
import { NavigationMixin } from "lightning/navigation";

import getTeamMembers from '@salesforce/apex/ExperienceCloudHelper.getTeamMembers';
import ConsultantPics from '@salesforce/resourceUrl/ConsultantPics';
import ConsultantIcon from '@salesforce/resourceUrl/Test_ConsultantIcon';
import noDataFound from "@salesforce/resourceUrl/NotFound";


export default class TeamMembers extends NavigationMixin(LightningElement) {

    @api recordId;
    members = [];
    trelloBoardUrl = '';
    noDataFound = noDataFound;
    ConsultantPics = ConsultantPics;
    ConsultantIcon = ConsultantIcon;
    membersExist = false;

    @wire(getTeamMembers, { projectId: '$recordId' })
    getTeamMembersData({ error, data }) {
        if (data) {
            this.members = data.members.map(employee => {
                const fullName = `${employee.FirstName.toLowerCase()}-${employee.LastName.toLowerCase()}`;
                let role = employee.RecordType.Name === 'Employee' ? 'Mentor' : 'Associate';
                return {
                    ...employee,
                    pictureUrl: `${ConsultantPics}/ConsultantPics/${fullName}.jpeg`,
                    role
                };
            });
            this.trelloBoardUrl = data.trelloWorkspaceUrl;
            this.membersExist = true;
            console.log('all members ' + JSON.stringify(data, null, 2));

        } else if (error) {
            console.log(error);
            this.membersExist = false;

        }
    }

    redirectToLinkedin(event) {
        let url = event.currentTarget.dataset.url;

        console.log('url ' + url);

        if (!url) url = 'https://www.linkedin.com';
        const config = {
            type: 'standard__webPage',
            attributes: {
                url: url
            }
        };
        this[NavigationMixin.Navigate](config);

    }
    handleRedirectTrello(event) {
        const config = {
            type: 'standard__webPage',
            attributes: {
                url: this.trelloBoardUrl
            }
        };
        this[NavigationMixin.Navigate](config);

    }

    handlePicError(event) {
        // let memberId = event.currentTarget.dataset.id
        event.target.src = this.ConsultantIcon;

    }

}