import {quat2} from 'gl-matrix';

function mirror(q) {
    const tempLoc = new Float32Array(3);
    quat2.getTranslation(tempLoc, q);
    tempLoc[0] = -tempLoc[0];
    tempLoc[1] = tempLoc[1];
    tempLoc[2] = tempLoc[2];

    /* Mirror rotation */
    q[1] = -q[1];
    q[2] = -q[2];

    quat2.fromRotationTranslation(q, q, tempLoc);

    return q;
}

WL.registerComponent('hand-pose', {
    jsonFile: {type: WL.Type.String, default: ''},
}, {
    ORDERED_JOINTS: [
        "wrist",
        "thumb-metacarpal", "thumb-phalanx-proximal", "thumb-phalanx-distal", "thumb-tip",
        "index-finger-metacarpal", "index-finger-phalanx-proximal", "index-finger-phalanx-intermediate", "index-finger-phalanx-distal", "index-finger-tip",
        "middle-finger-metacarpal", "middle-finger-phalanx-proximal", "middle-finger-phalanx-intermediate", "middle-finger-phalanx-distal", "middle-finger-tip",
        "ring-finger-metacarpal", "ring-finger-phalanx-proximal", "ring-finger-phalanx-intermediate", "ring-finger-phalanx-distal", "ring-finger-tip",
        "pinky-finger-metacarpal", "pinky-finger-phalanx-proximal", "pinky-finger-phalanx-intermediate", "pinky-finger-phalanx-distal", "pinky-finger-tip"
    ],

    start: function() {
        this.hand = this.object.getComponent('hand-tracking');
        if(this.jsonFile != "")
            fetch(this.jsonFile).then(function(d) { d.json(); }).then(this.onHandPoseDownloaded.bind(this));
    },

    mirrorPose: function(out, pose) {
        for(let key in pose) out[key] = mirror(pose[key]);
        return out;
    },

    /* Create and download a snapshot of the current hand pose */
    snapshot: function() {
        const children = this.object.children;

        const snapshot = {};
        for(let i = 0; i < children.length; ++i) {
            const o = children[i];
            const name = o.name;
            /* We only snapshot bone poses, not the mesh or other attachments */
            if(!this.ORDERED_JOINTS.includes(name)) continue;
            if(name.endsWith('wrist')) continue;

            /* Have the snapshot independent of handedness, save right hand only */
            snapshot[name.substr(4)] = Array.from(o.transformLocal);
        }

        /* If this is the left hand, we mirror to the right */
        if(this.hand && this.hand.handedness == 'left') {
            this.mirrorPose(snapshot, snapshot);
        }

        return snapshot;
    },

    applyPose: function(pose) {
        const children = this.object.children;

        /* If this is the left hand, we mirror to the right */
        if(this.hand && this.hand.handedness == 'left') {
            pose = this.mirrorPose({}, pose);
        }

        for(let i = 0; i < children.length; ++i) {
            const o = children[i];
            const name = o.name.substr(4);

            if(!(name in pose)) continue;

            o.transformLocal.set(pose[name]);
            o.setDirty();
        }
    },
});
