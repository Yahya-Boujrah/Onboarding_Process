import { LightningElement } from 'lwc';

export default class AboutUsOreivaton extends LightningElement {
    lines;
    intervalId;
    index;
    lastSelectedIndex;

    renderedCallback() {
        this.autoChangeLetterSpacing();
        this.addHoverListeners();
    }

    disconnectedCallback(){
        clearInterval(this.intervalId);
    }

    autoChangeLetterSpacing(startIndex = 0) {
        this.index = startIndex;
        // Your existing logic for auto changing letter spacing...
        this.intervalId = setInterval(() => {
            // Hide text for all lines
            this.lines.forEach(line => {
                console.log('Changing letter spacing for line ' + line);

                const animateElements = line.querySelectorAll('.animate');
                animateElements.forEach(animateElement => {
                    animateElement.classList.remove('animate-visible');
                    animateElement.classList.add('animate-hidden');
                });
            });

            // Show text for the current line
            const animateElementsToShow = this.lines[this.index].querySelectorAll('.animate');
            animateElementsToShow.forEach(animateElement => {
                animateElement.classList.remove('animate-hidden');
                animateElement.classList.add('animate-visible');
            });

            // Move to the next line
            this.index = (this.index + 1) % this.lines.length;
        }, 3000); // 5 seconds interval
    }

    addHoverListeners() {
        this.lines = this.template.querySelectorAll('.container .child-container');
        this.lines.forEach((line, idx) => {
            line.addEventListener('mouseenter', () => this.pauseAutoChangeLetterSpacing(idx));
            line.addEventListener('mouseleave', () => this.resumeAutoChangeLetterSpacing(idx));
        });
    }

    pauseAutoChangeLetterSpacing(idx) {
        clearInterval(this.intervalId);
        this.lastSelectedIndex = idx; // Store the last selected index
        this.hideOtherLines(idx);
    }

    resumeAutoChangeLetterSpacing(idx) {
        if (typeof idx === 'undefined') {
            idx = this.lastSelectedIndex; // Use the last selected index if no index is passed
        }
        if (idx === this.lines.length - 1) {
            idx = -1; // Reset to -1 to start from 0 in the next iteration
        }
        this.autoChangeLetterSpacing(idx + 1); // Continue from the next index
        // this.showAllLines();
    }

    hideOtherLines(currentIdx) {
        this.lines.forEach((line, idx) => {
            if (idx !== currentIdx) {
                const animateElements = line.querySelectorAll('.animate');
                animateElements.forEach(animateElement => {
                    animateElement.classList.remove('animate-visible');
                    animateElement.classList.add('animate-hidden');
                });
            }
        });
    }
}