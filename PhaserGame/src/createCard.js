/**
 * Create a card game object
 */
export const createCard = (scene, x, y, w, h, label = '', draggable = false, opts = {}) => {

    // white rounded rectangle, bold border, drop shadow
    const group = scene.add.container(x, y);
    const shadow = scene.add.rectangle(4, 6, w, h, 0x000000, 0.18).setOrigin(0, 0);
    const card = scene.add.rectangle(0, 0, w, h, opts.fill ?? 0xffffff, opts.alpha ?? 1).setOrigin(0, 0);

    card.setStrokeStyle(3, 0xd4af37, 1); // gold border
    card.isFilled = true;
    card.radius = 8; // rounded corners

    let textColor = '#000000';
    const text = scene.add.text(w / 2, h / 2, label, {
        fontSize: opts.fontSize ?? 22,
        color: opts.color ?? textColor,
        fontStyle: opts.fontStyle ?? 'bold',
        stroke: '#000000',
        strokeThickness: 2,
        shadow: {
            offsetX: 2,
            offsetY: 2,
            color: '#000000',
            blur: 2,
            fill: true
        }
    }).setOrigin(0.5);

    group.add([shadow, card, text]);

    group.shadow = shadow; // used to individually change shadow properties on drag
    group.slot = null; // the slot the card is in

    if (draggable) {
        group.setSize(w, h);
        group.setInteractive(new Phaser.Geom.Rectangle(w / 2, h / 2, w, h), Phaser.Geom.Rectangle.Contains);
        scene.input.setDraggable(group);
    }

    return group;
}