
export const createCardSlot = (scene, x, y, w, h, opts = {}) => {
    const group = scene.add.container(x, y);
    const rect = scene.add.rectangle(0, 0, w, h, opts.fill ?? 0xbbbbbb, opts.alpha ?? 0.3)
        .setOrigin(0, 0)
        .setStrokeStyle(3, 0xa1a1a1);

    group.add(rect);

    group.card = null;

    // place a card into the slot
    group.setCard = (newCard) => {
        group.card = newCard;

        newCard.setPosition(group.x - group.width / 2, group.y);
    };

    return group;

}
