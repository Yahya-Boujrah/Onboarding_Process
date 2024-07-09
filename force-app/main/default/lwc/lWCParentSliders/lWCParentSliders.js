import { LightningElement } from 'lwc';

export default class LWCParentSliders extends LightningElement {
    slider1Image = 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&w=1000&q=80';
    slider1Link = '#';
    slider2Image = 'https://store-images.s-microsoft.com/image/apps.32256.14224494707314076.8116b5ee-01ee-49e4-827c-bc6739343224.90a3690d-d956-4e1a-a673-1871117b442a?mode=scale&q=90&h=720&w=1280';
    slider2Link = '#';
    slider3Image = 'https://www.virginexperiencedays.co.uk/content/img/product/large/the-view-from-the-12102928.jpg';
    slider3Link = '#';
    slider4Image = 'https://t-ec.bstatic.com/images/hotel/max1024x768/169/169160530.jpg';
    slider4Link = '#';
    autoScroll = true;

    get sliderData() {
        return [{
            "image": this.slider1Image,
            "link": this.slider1Link,
            "heading": "",
            "description": "",
        },
        {
            "image": this.slider2Image,
            "link": this.slider2Link,
            "heading": "",
            "description": "",
        },
        {
            "image": this.slider3Image,
            "link": this.slider3Link,
            "heading": "",
            "description": "",
        },
        {
            "image": this.slider4Image,
            "link": this.slider4Link,
            "heading": "",
            "description": "",
        },
        ]
    }
}