WL.registerComponent('snapshot-button', {
    handObject: {type: WL.Type.Object},
    labelObject: {type: WL.Type.Object},
    resultsObject: {type: WL.Type.Object},
}, {
    start: function() {
        this.handPose = this.handObject.getComponent('hand-pose');
        this.target = this.object.getComponent('cursor-target');
        this.target.addClickFunction(this.onClick.bind(this));

        this.label = this.labelObject.getComponent('text');
        this.originalLabel = this.label.text;
    },
    onClick: function() {
        this.label.text = "3";
        setTimeout(function() {
            this.label.text = "2";
            setTimeout(function() {
                this.label.text = "1";
                setTimeout(this.onTimeout.bind(this), 700);

            }.bind(this), 700);
        }.bind(this), 700);
    },
    onTimeout: function() {
        const snapshot = this.handPose.snapshot();

        const handPoseDisplay = this.resultsObject.getComponent('hand-pose');
        handPoseDisplay.applyPose(snapshot);

        this.label.text = this.originalLabel;
    },
});

/** Simply utility function to download a JavaScript object as JSON */
function downloadJSON(obj) {
    const str = JSON.stringify(obj);
    /* Print to console in case dev wants to copy from there instead */
    console.log(str);

    const data = "text/json;charset=utf-8," + encodeURIComponent(str);

    const element = document.createElement('a');
    element.setAttribute('href', data);
    element.setAttribute('download', 'hand-pose.json');
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}

WL.registerComponent('download-button', {
    resultsObject: {type: WL.Type.Object},
}, {
    start: function() {
        this.target = this.object.getComponent('cursor-target');
        this.target.addClickFunction(this.onClick.bind(this));
    },
    onClick: function() {
        const handPoseDisplay = this.resultsObject.getComponent('hand-pose');
        downloadJSON(handPoseDisplay.snapshot());
    },
});
