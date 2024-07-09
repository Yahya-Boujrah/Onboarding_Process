import { LightningElement, wire, api, track } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import ConsultantIcon from '@salesforce/resourceUrl/Test_ConsultantIcon';
import WomanIcon from '@salesforce/resourceUrl/WomanIcon';
import ConsultantPics from '@salesforce/resourceUrl/ConsultantPics';
import Mountains from '@salesforce/resourceUrl/Mountains';
import getEmployees from '@salesforce/apex/ExperienceCloudHelper.getEmployees';

export default class AboutUsTeam extends NavigationMixin(LightningElement) {
    pfp = ConsultantIcon;
    Mountains=Mountains;
    pfpw= WomanIcon;
    ConsultantPics = ConsultantPics;

    @api limit = 30;
    @api title = 'Get to know us';

    @track teamMembers = [];
    @track filteredTeamMembers = [];
    @track paginatedTeamMembers = [];
    @track currentPage = 1;
    itemsPerPage = 6;
    searchTerm = '';
    selectedRole = '';

    get backgroundImageStyle() {
        return `background-image: url(${this.Mountains});`;
    }

    @wire(getEmployees, { dataLimit: '$limit' })
    retrievedEmployees({ error, data }) {
        if (data) {
            this.teamMembers = data.map(employee => {
                const fullName = `${employee.FirstName.toLowerCase()}-${employee.LastName.toLowerCase()}`;
                let pictureUrl = `${ConsultantPics}/ConsultantPics/${fullName}.jpeg`;
                let role = 'Technical Consultant'; // Default role
                // Assign roles based on first name and last name
                if (employee.FirstName === 'Mohamed' && employee.LastName === 'ElQandili') {
                    role = 'Team Leader';
                } else if (employee.FirstName === 'Yassine' && employee.LastName === 'ElQandili') {
                    role = 'CTO';
                } else if (employee.FirstName === 'FatimaEzzahra' && employee.LastName === 'Mounhij') {
                    role = 'Manager';
                } else if (employee.FirstName === 'Sophia' && employee.LastName === 'Koukab') {
                    role = 'CEO';
                }
                return {
                    ...employee,
                    pictureUrl,
                    role // Add role attribute
                };
            });
            // Sort teamMembers based on roles hierarchy
            this.teamMembers.sort((a, b) => {
                const rolesOrder = ['CEO', 'CTO', 'Team Leader', 'Manager', 'Technical Consultant'];
                return rolesOrder.indexOf(a.role) - rolesOrder.indexOf(b.role);
            });
            this.filteredTeamMembers = this.teamMembers;
            this.updatePaginatedMembers();
        } else if (error) {
            console.error(error);
            this.error = error;
        }
    }
    
    

    get isFirstPage() {
        return this.currentPage === 1;
    }

    get isLastPage() {
        return this.currentPage === Math.ceil(this.filteredTeamMembers.length / this.itemsPerPage);
    }

    updatePaginatedMembers() {
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        this.paginatedTeamMembers = this.filteredTeamMembers.slice(startIndex, endIndex);
    }

    fadeOutElements(callback) {
        const elements = this.template.querySelectorAll('.our-team');
        elements.forEach(el => {
            el.classList.add('fade-out');
        });
        setTimeout(() => {
            elements.forEach(el => {
                el.classList.remove('fade-out');
            });
            callback();
        }, 500); // Match the duration of the CSS transition
    }

    fadeInElements() {
        const elements = this.template.querySelectorAll('.our-team');
        elements.forEach(el => {
            el.classList.add('fade-in');
        });
        setTimeout(() => {
            elements.forEach(el => {
                el.classList.remove('fade-in');
            });
        }, 500); // Match the duration of the CSS transition
    }

    nextPage() {
        if (!this.isLastPage) {
            this.fadeOutElements(() => {
                this.currentPage++;
                this.updatePaginatedMembers();
                this.fadeInElements();
            });
        }
    }

    previousPage() {
        if (!this.isFirstPage) {
            this.fadeOutElements(() => {
                this.currentPage--;
                this.updatePaginatedMembers();
                this.fadeInElements();
            });
        }
    }

    handleSearch(event) {
        this.searchTerm = event.target.value.toLowerCase();
        this.filterTeamMembers();
    }

    handleRoleChange(event) {
        this.selectedRole = event.target.value;
        console.log('Selected role:', this.selectedRole); // Debug log
        this.filterTeamMembers();
    }

    filterTeamMembers() {
        let filtered = this.teamMembers;

        if (this.searchTerm) {
            const searchParts = this.searchTerm.split(' ').filter(part => part.trim() !== '');
            filtered = filtered.filter(member => {
                const fullName = `${member.FirstName.toLowerCase()} ${member.LastName.toLowerCase()}`;
                const reversedFullName = `${member.LastName.toLowerCase()} ${member.FirstName.toLowerCase()}`;
                return searchParts.every(part => fullName.includes(part) || reversedFullName.includes(part));
            });
        }

        if (this.selectedRole) {
            if (this.selectedRole === "Technical Consultant") {
                filtered = filtered.filter(member => 
                    !["FatimaEzzahra Mounhij", "Mohamed ElQandili", "Yassine ElQandili", "Sophia Koukab"].includes(`${member.FirstName} ${member.LastName}`)
                );
            } else if (this.selectedRole) {
                filtered = filtered.filter(member => 
                    `${member.FirstName} ${member.LastName}`.toLowerCase() === this.selectedRole.toLowerCase()
                );
            }
        }

        this.filteredTeamMembers = filtered;
        console.log('Filtered members:', this.filteredTeamMembers); // Debug log
        this.currentPage = 1;
        this.updatePaginatedMembers();
    }

    redirectToLinkedin(event) {
        let url = event.currentTarget.dataset.url;
        if (!url) url = 'https://www.linkedin.com';
        const config = {
            type: 'standard__webPage',
            attributes: {
                url: url
            }
        };
        this[NavigationMixin.Navigate](config);
    }

    handlePicError(event) {
        const salutation = event.target.dataset.salutation;
        if (salutation !== 'Ms.') {
            event.target.src = this.pfp;
        } else {
            event.target.src = this.pfpw;
        }
    }
}