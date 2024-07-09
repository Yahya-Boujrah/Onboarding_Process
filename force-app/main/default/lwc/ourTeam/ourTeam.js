import { LightningElement, track, wire, api } from 'lwc';
import ConsultantIcon from '@salesforce/resourceUrl/Test_ConsultantIcon';
import left from '@salesforce/resourceUrl/Test_left_arrow';
import right from '@salesforce/resourceUrl/Test_right_arrow';
import mohamed from '@salesforce/resourceUrl/Mohamed';
import ConsultantPics from '@salesforce/resourceUrl/ConsultantPics';

import getEmployees from '@salesforce/apex/ExperienceCloudHelper.getEmployees';

export default class OurTeam extends LightningElement {
    leftIcon = left;
    rightIcon = right;
    pfp = ConsultantIcon;
    mohamed = mohamed;
    ConsultantPics = ConsultantPics;

    @track teamMembers = [
        { id: 1, name: 'Bader Toumi', Level__c: 'Technical Consultant' },
        { id: 2, name: 'Yasmine Kerdad', Level__c: 'Technical Consultant' },
        { id: 3, name: 'Yahya Boujrah', Level__c: 'Technical Consultant' },
        { id: 4, name: 'James Khosravi', Level__c: 'Freelancer' },
        { id: 5, name: 'Kristina Zasiadko', Level__c: 'Bank Manager' },
        { id: 6, name: 'Donald Horton', Level__c: 'App Designer' }
    ];

    @api limit = 5;
    @api title = 'Get to know us';


    @wire(getEmployees, { dataLimit: '$limit' })
    retrievedEmployees({ error, data }) {
        if (data) {
            // this.teamMembers = data;

            this.teamMembers = data.map(employee => {
                const fullName = `${employee.FirstName.toLowerCase()}-${employee.LastName.toLowerCase()}`;
                let pictureUrl = `${ConsultantPics}/ConsultantPics/${fullName}.jpeg`;
                return {
                    ...employee,
                    pictureUrl
                };
            });
            console.log('dtaaa ' + JSON.stringify(this.teamMembers, null, 2));

        } else if (error) {
            console.log(error);
        }
    }

    handleArrowClick(event) {
        const direction = event.currentTarget.dataset.direction;
        const carousel = this.template.querySelector('.carousel');
        const cardWidth = carousel.querySelector('.card').offsetWidth;

        if (direction === 'left') {
            carousel.scrollLeft -= cardWidth;

        } else {
            carousel.scrollLeft += cardWidth;
        }

    }
    handlePicError(event){
        event.target.src = this.pfp;
    }

    // getCardClass() {
    //     // const index = event.currentTarget.dataset.id;
    //     // console.log('indexx ' + index);
    //     // return index === this.currentIndex ? 'card-active' : 'card';
    // }


    // ////////////c/aboutUs


    // carouselItems = [
    //     { id: 1, classList: 'carousel__item carousel__item--left', title: 'Item 1' ,description:'desc'},
    //     { id: 2, classList: 'carousel__item carousel__item--main', title: 'Item 2', description : 'desc' },
    //     { id: 3, classList: 'carousel__item carousel__item--right', title: 'Item 3', description : 'desc' },
    // ];

    // handleRightClick() {
    //     this.updateItems('right');
    // }

    // handleLeftClick() {
    //     this.updateItems('left');
    // }

    // updateItems(direction) {
    //     const currentItemIndex = this.carouselItems.findIndex(item => item.classList.includes('carousel__item--main'));
    //     let newMainIndex, newLeftIndex, newRightIndex;

    //     if (direction === 'right') {
    //         newMainIndex = (currentItemIndex + 1) % this.carouselItems.length;
    //     } else if (direction === 'left') {
    //         newMainIndex = (currentItemIndex - 1 + this.carouselItems.length) % this.carouselItems.length;
    //     }

    //     newLeftIndex = (newMainIndex - 1 + this.carouselItems.length) % this.carouselItems.length;
    //     newRightIndex = (newMainIndex + 1) % this.carouselItems.length;

    //     this.carouselItems = this.carouselItems.map((item, index) => {
    //         if (index === newMainIndex) {
    //             return { ...item, classList: 'carousel__item carousel__item--main' };
    //         } else if (index === newLeftIndex) {
    //             return { ...item, classList: 'carousel__item carousel__item--left' };
    //         } else if (index === newRightIndex) {
    //             return { ...item, classList: 'carousel__item carousel__item--right' };
    //         } else {
    //             return { ...item, classList: 'carousel__item' };
    //         }
    //     });
    // }



}