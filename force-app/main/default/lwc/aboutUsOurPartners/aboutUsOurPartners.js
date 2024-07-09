import { LightningElement } from 'lwc';
import Partners from '@salesforce/resourceUrl/Partners';

export default class AboutUsOurPartners extends LightningElement {
    Partners=Partners;
    partner1=Partners+"/Partners/nbs.png";
    partner2=Partners+"/Partners/Capgemini-Logo.png";
    partner3=Partners+"/Partners/upeo.png";
    partner4=Partners+"/Partners/magellan-consulting.png";
    partner5=Partners+"/Partners/Salesforce-logo.png";
    partner6=Partners+"/Partners/viseo.png";

    
}