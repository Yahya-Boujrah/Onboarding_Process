import { LightningElement } from 'lwc';
import roadmap from '@salesforce/resourceUrl/Roadmap';
import astro from '@salesforce/resourceUrl/Astro';
import astroInitial from '@salesforce/resourceUrl/AstroInitial';
import astroFinal from '@salesforce/resourceUrl/AstroFinal';
import cloud from '@salesforce/resourceUrl/Cloud';
import cloud2 from '@salesforce/resourceUrl/Cloud2';
import cloud3 from '@salesforce/resourceUrl/Cloud3';



export default class AboutUsRoadMap extends LightningElement {
    roadmap = roadmap;
    astro = astro;
    astroInitial = astroInitial;
    astroFinal = astroFinal;
    cloud=cloud;
    cloud2=cloud2;
    cloud3=cloud3;
    steps = [];
    currentStep = 0;
    autoTransitionInterval;
    isPaused = false;

    stepContent = [
        { title: 'who are we ?', description: 'First of all get to know our values and Lorem ipsum dolor sit amet consectetur adipisicing elit. Reprehenderit labore incidunt earum consequatur! Nesciunt ullam accusamus, adipisci hic, dolorum consequatur sunt repudiandae velit molestiae tempore, cupiditate soluta. Commodi, are you ready for the adventure? dolorum consequatur sunt repudiandae velit molestiae tempore, cupiditate soluta. Commodi, eaque consectetur? ' },
        { title: 'Admin Basics & advanced', description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Reprehenderit labore incidunt earum consequatur! Nesciunt ullam accusamus, adipisci hic, dolorum consequatur sunt repudiandae velit molestiae tempore, cupiditate soluta. Commodi, eaque consectetur? dolorum consequatur sunt repudiandae velit molestiae tempore, cupiditate soluta. Commodi, eaque consectetur?tempore, cupiditate soluta. Commodi, eaque consectetur?' },
        { title: 'Training Sales Cloud', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque vitae venenatis ex. Quisque auctor vel ligula a tempor. Nulla facilisi.  dolorum consequatur sunt repudiandae velit molestiae tempore, cupiditate soluta. Commodi, eaque consectetur? dolorum consequatur sunt repudiandae velit molestiae tempore, cupiditate soluta. Commodi, eaque consectetur? tempore, cupiditate soluta. Commodi, eaque consectetur?' },
        { title: 'Training Service Cloud', description: 'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.  dolorum consequatur sunt repudiandae velit molestiae tempore, cupiditate soluta. Commodi, eaque consectetur? dolorum consequatur sunt repudiandae velit molestiae tempore, cupiditate soluta. Commodi,' },
        { title: 'Development - Basics (with testing)', description: 'At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident.  dolorum consequatur sunt repudiandae velit molestiae tempore, cupiditate soluta. Commodi, eaque consectetur? tempore, cupiditate soluta. Commodi, eaque consectetur?' },
        { title: 'Development - Lightning Web Component', description: 'Similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio. dolorum consequatur sunt repudiandae velit molestiae tempore, cupiditate soluta. Commodi, eaque consectetur? dolorum consequatur sunt repudiandae velit molestiae tempore, cupiditate soluta. Commodi, eaque consectetur?' },
        { title: 'YOUR FIRST SALESFORCE PROJECT', description: 'Now you are ready for your first salesforce project (PFA/PFE). Similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio. dolorum consequatur sunt repudiandae velit molestiae tempore, cupiditate soluta. Commodi, eaque consectetur? tempore, cupiditate soluta. Commodi, eaque consectetur?' }
    ];
    
    levelClasses = ['astro-lvl0', 'astro-lvl1', 'astro-lvl2', 'astro-lvl3', 'astro-lvl4', 'astro-lvl5'];

    get backgroundImageStyle() {
        return `background-image: url(${this.astro});`;
    }

    get backgroundImageStyle2() {
        return `background-image: url(${this.astroInitial});`;
    }

    get backgroundImageStyle3() {
        return `background-image: url(${this.astroFinal});`;
    }

    renderedCallback() {
        if (this.steps.length === 0) {
            this.steps = Array.from(this.template.querySelectorAll('.step'));

            this.steps.forEach(step => {
                step.addEventListener('click', this.handleStepClick.bind(this));
            });

            // Start the automatic transition
            this.startAutoTransition();

            // Add event listeners for pausing and resuming the timer
            const container = this.template.querySelector('.content');
            container.addEventListener('mouseover', this.pauseAutoTransition.bind(this));
            container.addEventListener('mouseout', this.resumeAutoTransition.bind(this));
        }
    }

    handleStepClick(event) {
        const stepNum = parseInt(event.target.id, 10);
        this.updateProgress(stepNum);
        // Restart the auto transition timer
        this.restartAutoTransition();
    }

    updateProgress(stepNum) {
        const p = stepNum * 15;
        this.template.querySelector('.percent').style.width = `${p}%`;

        this.steps.forEach(step => {
            const stepId = parseInt(step.id, 10);
            if (stepId === stepNum) {
                step.classList.add('selected');
                step.classList.remove('completed');
            } else if (stepId < stepNum) {
                step.classList.add('completed');
                step.classList.remove('selected');
            } else {
                step.classList.remove('selected', 'completed');
            }
        });

        this.updateContent(stepNum);
        this.transitionAstro(this.currentStep, stepNum);
        this.currentStep = stepNum;
    }

    transitionAstro(fromStep, toStep) {
        const astroElement = this.template.querySelector('.astro');
        const astroInitialElement = this.template.querySelector('.astroInitial');
        const astroFinalElement = this.template.querySelector('.astroFinal');

        // Show or hide astroInitial based on the step number
        if (toStep === 0) {
            astroInitialElement.classList.remove('hidden');
        } else {
            astroInitialElement.classList.add('hidden');
        }
        if (toStep === 6) {
            astroFinalElement.classList.add('show');
        } else {
            astroFinalElement.classList.remove('show');
        }

        const stepDiff = toStep - fromStep;
        if (stepDiff === 0) return;

        const direction = stepDiff > 0 ? 1 : -1;
        let current = fromStep;

        const interval = setInterval(() => {
            current += direction;
            if (current === 0) {
                // Add a cool apparition transition for step 0
                astroElement.style.opacity = '0';
                astroElement.style.transition = 'opacity 0.4s ease, margin-left 0.8s ease, margin-top 0.5s ease'; // Apply transition properties
                astroInitialElement.style.opacity= '1';
                astroInitialElement.style.transition = 'opacity 0.4s ease, margin-left 0.8s ease, margin-top 0.5s ease'; // Apply transition properties
            } else if (current === 6) {
                // Add a cool apparition transition for step 6
                astroElement.style.opacity = '0';
                astroElement.style.transition = 'opacity 0.4s ease, margin-left 0.8s ease, margin-top 0.5s ease'; // Apply transition properties
                astroFinalElement.style.opacity= '1';
                astroFinalElement.style.transition = 'opacity 0.4s ease, margin-left 0.8s ease, margin-top 0.5s ease'; // Apply transition properties
            } else {
                this.updateAstroPosition(current);
                astroElement.style.opacity = '1';
                astroInitialElement.style.opacity= '0';
                astroFinalElement.style.opacity= '0';
            }

            if (current === toStep) {
                clearInterval(interval);
            }
        }, 500);
    }

    updateAstroPosition(stepNum) {
        const astroElement = this.template.querySelector('.astro');

        this.levelClasses.forEach(levelClass => {
            astroElement.classList.remove(levelClass);
        });

        if (stepNum > 0) {
            astroElement.classList.remove('hidden');
            astroElement.classList.add(this.levelClasses[stepNum - 1]);
        } else {
            astroElement.classList.add('hidden');
        }
    }

    updateContent(stepNum) {
        const content = this.stepContent[stepNum];
        const titleElement = this.template.querySelector('.title');
        const descriptionElement = this.template.querySelector('.description');

        titleElement.classList.add('fade-out');
        descriptionElement.classList.add('fade-out');

        setTimeout(() => {
            titleElement.textContent = content.title;
            descriptionElement.textContent = content.description;

            titleElement.classList.remove('fade-out');
            titleElement.classList.add('fade-in');
            descriptionElement.classList.remove('fade-out');
            descriptionElement.classList.add('fade-in');

            setTimeout(() => {
                titleElement.classList.remove('fade-in');
                descriptionElement.classList.remove('fade-in');
            }, 500);
        }, 500);
    }

    startAutoTransition() {
        this.autoTransitionInterval = setInterval(() => {
            if (!this.isPaused) {
                let nextStep = this.currentStep + 1;
                if (nextStep > 6) {
                    nextStep = 0;
                }
                this.updateProgress(nextStep);
            }
        }, 4000);
    }

    restartAutoTransition() {
        clearInterval(this.autoTransitionInterval);
        this.startAutoTransition();
    }

    pauseAutoTransition() {
        this.isPaused = true;
    }

    resumeAutoTransition() {
        this.isPaused = false;
    }
}