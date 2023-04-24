import {Component, Type} from '@wonderlandengine/api';

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

export class HandPose extends Component {
    static TypeName = 'hand-pose';
    static Properties = {
        jsonFile: {type: Type.String, default: ''},
    };

    ORDERED_JOINTS = [
        'wrist',
        'thumb-metacarpal',
        'thumb-phalanx-proximal',
        'thumb-phalanx-distal',
        'thumb-tip',
        'index-finger-metacarpal',
        'index-finger-phalanx-proximal',
        'index-finger-phalanx-intermediate',
        'index-finger-phalanx-distal',
        'index-finger-tip',
        'middle-finger-metacarpal',
        'middle-finger-phalanx-proximal',
        'middle-finger-phalanx-intermediate',
        'middle-finger-phalanx-distal',
        'middle-finger-tip',
        'ring-finger-metacarpal',
        'ring-finger-phalanx-proximal',
        'ring-finger-phalanx-intermediate',
        'ring-finger-phalanx-distal',
        'ring-finger-tip',
        'pinky-finger-metacarpal',
        'pinky-finger-phalanx-proximal',
        'pinky-finger-phalanx-intermediate',
        'pinky-finger-phalanx-distal',
        'pinky-finger-tip',
    ];

    start() {
        this.hand = this.object.getComponent('hand-tracking');
        if (this.jsonFile != '')
            fetch(this.jsonFile)
                .then(function (d) {
                    d.json();
                })
                .then(this.onHandPoseDownloaded.bind(this));
    }

    mirrorPose(out, pose) {
        for (let key in pose) out[key] = mirror(pose[key]);
        return out;
    }

    /* Create and download a snapshot of the current hand pose */
    snapshot() {
        const snapshot = {};
        for (const o of this.object.children) {
            const name = o.name;
            /* We only snapshot bone poses, not the mesh or other attachments */
            if (!this.ORDERED_JOINTS.includes(name)) continue;
            if (name.endsWith('wrist')) continue;

            /* Have the snapshot independent of handedness, save right hand only */
            snapshot[name.substr(4)] = o.getTransformLocal(new Float32Array(8));
        }

        /* If this is the left hand, we mirror to the right */
        if (this.hand && this.hand.handedness == 'left') {
            this.mirrorPose(snapshot, snapshot);
        }

        return snapshot;
    }

    applyPose(pose) {
        /* If this is the left hand, we mirror to the right */
        if (this.hand && this.hand.handedness == 'left') {
            pose = this.mirrorPose({}, pose);
        }

        for (const o of this.object.children) {
            const name = o.name.substr(4);
            if (!(name in pose)) continue;
            o.transformLocal.set(pose[name]);
            o.setDirty();
        }
    }
}
