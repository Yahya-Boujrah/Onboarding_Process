import { LightningElement, api, wire } from 'lwc';
import hill1 from '@salesforce/resourceUrl/hill1';
import hill2 from '@salesforce/resourceUrl/hill2';
import hill3 from '@salesforce/resourceUrl/hill3';
import hill4 from '@salesforce/resourceUrl/hill4';
import hill5 from '@salesforce/resourceUrl/hill5';
import tree from '@salesforce/resourceUrl/tree';
import leaf from '@salesforce/resourceUrl/leaf';
import plant from '@salesforce/resourceUrl/plant';
import mohamed from '@salesforce/resourceUrl/Mohamed';
import Id from '@salesforce/user/Id'
import NAME_FIELD from '@salesforce/schema/User.FirstName';

import { getRecord, getFieldValue } from 'lightning/uiRecordApi';

export default class WelcomeUserHomePage extends LightningElement {
    hill1 = hill1;
    hill2 = hill2;
    hill3 = hill3;
    hill4 = hill4;
    hill5 = hill5;
    tree = tree;
    leaf = leaf;
    plant = plant;
    mohamed = mohamed;

    userId = Id;


    @api title = 'Welcome To Oreivaton Associates';
    @api subTitle = 'Oreivaton Associates Portal';
    @api description = 'Oreivaton is a Center of Excellence and delivery bringing Salesforce & industry specific expertise to solve your challenges & help you reach your customer goals through the Salesforce Platform. Oreivaton is also a Moroccan hub for Skills On Demand with a variety of skilled people that will guide you throughout your roadmap for your client engagement solutions leveraging Salesforce.';

    @wire(getRecord, {
            recordId: '$userId',
            fields: [NAME_FIELD],
    }) currentUser;

    get name() {
        const userName = this.currentUser.data ? getFieldValue(this.currentUser.data, NAME_FIELD) : '';
        return userName ? userName: '';    }

    connectedCallback() {
        // Add event listener for window scroll
        window.addEventListener('scroll', this.handleWindowScroll);
    }

    disconnectedCallback() {
        // Remove event listener for window scroll
        window.removeEventListener('scroll', this.handleWindowScroll);
    }

    handleWindowScroll = () => {
        let value = window.scrollY;

        const text = this.template.querySelector('.text');
        const hill1 = this.template.querySelector('.hill1');
        const hill4 = this.template.querySelector('.hill4');
        const hill5 = this.template.querySelector('.hill5');
        const leaf = this.template.querySelector('.leaf');

        const parallax = this.template.querySelector('.parallax');
        //console.log('heiiight ' + parallax.clientHeight);
        if (value <= parallax.clientHeight) {
            if (text) {
                text.style.marginTop = value * 1.5 + 'px';
            }
            if (leaf) {
                leaf.style.top = value * -1.5 + 'px';
                leaf.style.left = value * 1.5 + 'px';
            }
            if (hill5) {
                hill5.style.left = value * 1.5 + 'px';
            }
            if (hill4) {
                hill4.style.left = value * -1.5 + 'px';
            }
            if (hill1) {
                hill1.style.top = value * 1 + 'px';
            }
        }

    };
}