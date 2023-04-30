import {Component, Type} from '@wonderlandengine/api';
import {CursorTarget} from '@wonderlandengine/components';
import {HandPose} from './hand-poser';

export class SnapshotButton extends Component {
    static TypeName = 'snapshot-button';
    static Properties = {
        handObject: {type: Type.Object},
        labelObject: {type: Type.Object},
        resultsObject: {type: Type.Object},
    };

    start() {
        this.handPose = this.handObject.getComponent('hand-pose');
        this.target = this.object.getComponent('cursor-target');
        this.target.onClick.add(this.onClick.bind(this));

        this.label = this.labelObject.getComponent('text');
        this.originalLabel = this.label.text;
    }

    onClick() {
        this.label.text = '3';
        setTimeout(() => {
            this.label.text = '2';
            setTimeout(() => {
                this.label.text = '1';
                setTimeout(this.onTimeout.bind(this), 700);
            }, 700);
        }, 700);
    }

    onTimeout() {
        const snapshot = this.handPose.snapshot();

        const handPoseDisplay = this.resultsObject.getComponent('hand-pose');
        handPoseDisplay.applyPose(snapshot);

        this.label.text = this.originalLabel;
    }
}

/** Simply utility function to download a JavaScript object as JSON */
function downloadJSON(obj) {
    const str = JSON.stringify(obj);
    /* Print to console in case dev wants to copy from there instead */
    console.log(str);

    // Create a blob with the data
    const blob = new Blob([str], {type: 'application/json'});

    // Create a URL for the blob
    const url = URL.createObjectURL(blob);

    // Create a link element
    const link = document.createElement('a');
    link.href = url;
    link.download = 'data.json';
    document.body.appendChild(link);
    link.click();

    // Clean up the URL object
    URL.revokeObjectURL(url);
}

export class DownloadButton extends Component {
    static TypeName = 'download-button';
    static Properties = {
        resultsObject: {type: Type.Object},
    };

    start() {
        this.target = this.object.getComponent(CursorTarget);
        this.target.onClick.add(this.onClick.bind(this));
    }

    onClick() {
        const handPoseDisplay = this.resultsObject.getComponent(HandPose);
        downloadJSON(handPoseDisplay.snapshot());
    }
}
