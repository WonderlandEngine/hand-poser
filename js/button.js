import {Component, MeshComponent, Type} from '@wonderlandengine/api';
import {CursorTarget, HowlerAudioSource} from '@wonderlandengine/components';

export class Button extends Component {
    static TypeName = 'button';
    static Properties = {
        hoverMaterial: {type: Type.Material},
    };
    static onRegister(engine) {
        engine.registerComponent(HowlerAudioSource);
    }

    start() {
        this.mesh = this.object.getComponent(MeshComponent);
        this.defaultMaterial = this.mesh.material;
        this.target = this.object.getComponent(CursorTarget);
        this.target.onHover.add(this.onHover.bind(this));
        this.target.onUnhover.add(this.onUnHover.bind(this));
        this.target.onDown.add(this.onDown.bind(this));
        this.target.onUp.add(this.onUp.bind(this));

        this.soundClick = this.object.addComponent(HowlerAudioSource, {
            src: 'sfx/click.wav',
            spatial: true,
        });
        this.soundUnClick = this.object.addComponent(HowlerAudioSource, {
            src: 'sfx/unclick.wav',
            spatial: true,
        });
    }

    onHover() {
        this.mesh.material = this.hoverMaterial;
    }

    onUnHover() {
        this.mesh.material = this.defaultMaterial;
    }

    onDown() {
        this.soundClick.play();
    }
    onUp() {
        this.soundUnClick.play();
    }
}
